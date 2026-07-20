[CmdletBinding()]
param(
    [string]$ReadinessPath,
    [ValidateRange(1,168)][int]$MaxAgeHours=24,
    [ValidateSet('Json','Summary')][string]$Format='Json'
)
$ErrorActionPreference='Stop'
if([string]::IsNullOrWhiteSpace($ReadinessPath)){$ReadinessPath=Join-Path $PSScriptRoot '..\state\ad-provider-readiness.json'}
if(-not(Test-Path -LiteralPath $ReadinessPath -PathType Leaf)){throw "Readiness state not found: $ReadinessPath"}
$state=Get-Content -LiteralPath $ReadinessPath -Raw -Encoding UTF8|ConvertFrom-Json
if([int]$state.schemaVersion-ne1){throw 'Unsupported ad-provider readiness schema.'}
foreach($flag in @('containsSecrets','containsDirectIdentifiers')){$value=$state.$flag;if($value-isnot[bool]-or[bool]$value){throw "$flag must be Boolean false."}}
try{$observedAt=[DateTimeOffset]::Parse([string]$state.observedAt)}catch{throw 'Provider readiness observedAt is invalid.'}
$readinessFresh=$observedAt-le[DateTimeOffset]::UtcNow-and([DateTimeOffset]::UtcNow-$observedAt).TotalHours-le$MaxAgeHours
$local=[pscustomobject][ordered]@{
    composioKeyAvailable=[bool](Test-Path Env:COMPOSIO_KEY)
    pythonAvailable=[bool]((Get-Command py.exe -ErrorAction SilentlyContinue)-or(Get-Command python.exe -ErrorAction SilentlyContinue))
    netlifyCliAvailable=[bool](Get-Command netlify.cmd -ErrorAction SilentlyContinue)
}
$providers=[pscustomobject][ordered]@{}
foreach($name in @('google_ads','meta_ads')){
    $entry=$state.providers.$name;$blockers=@($entry.blockers)
    if(-not$readinessFresh){$blockers+="provider readiness evidence is older than $MaxAgeHours hours"}
    if(-not$local.composioKeyAvailable){$blockers+='COMPOSIO_KEY is unavailable to the terminal process'}
    if(-not$local.pythonAvailable){$blockers+='Python is unavailable to the terminal adapter'}
    $ready=[string]$entry.status-eq'ready'-and$blockers.Count-eq0-and-not[bool]$entry.requiresLiveProbe
    $providers|Add-Member -NotePropertyName $name -NotePropertyValue ([pscustomobject][ordered]@{ready=$ready;status=if($ready){'ready'}else{[string]$entry.status};verifiedCapabilities=@($entry.verifiedCapabilities);blockers=@($blockers);requiresLiveProbe=[bool]$entry.requiresLiveProbe})
}
$deployment=[pscustomobject][ordered]@{}
foreach($name in @('staging','production')){
    $entry=$state.landingPageDeployment.$name;$blockers=@($entry.blockers)
    if(-not$readinessFresh){$blockers+="deployment readiness evidence is older than $MaxAgeHours hours"}
    if(-not$local.netlifyCliAvailable){$blockers+='Netlify CLI is unavailable to the terminal process'}
    $ready=[string]$entry.status-eq'ready'-and$blockers.Count-eq0-and-not[bool]$entry.requiresLiveProbe
    $deployment|Add-Member -NotePropertyName $name -NotePropertyValue ([pscustomobject][ordered]@{ready=$ready;status=if($ready){'ready'}else{[string]$entry.status};verifiedCapabilities=@($entry.verifiedCapabilities);blockers=@($blockers);requiresLiveProbe=[bool]$entry.requiresLiveProbe})
}
$result=[pscustomobject][ordered]@{schemaVersion=1;checkedAt=[DateTimeOffset]::UtcNow.ToString('o');evidenceObservedAt=[string]$state.observedAt;evidenceFresh=$readinessFresh;maxAgeHours=$MaxAgeHours;local=$local;providers=$providers;landingPageDeployment=$deployment}
if($Format-eq'Json'){$result|ConvertTo-Json -Depth 10}else{"google_ads=$($providers.google_ads.status); meta_ads=$($providers.meta_ads.status); staging=$($deployment.staging.status); production=$($deployment.production.status)"}
