[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)][string]$ClientId,
    [Parameter(Mandatory=$true)][ValidateSet('gmail','slack','user')][string]$SourceChannel,
    [Parameter(Mandatory=$true)][string]$SourceLocator,
    [Parameter(Mandatory=$true)][string]$RequesterRef,
    [ValidateSet('location_launch','campaign_launch','campaign_expansion','campaign_restart')][string]$TriggerClass='location_launch',
    [Parameter(Mandatory=$true)][ValidateSet('google_ads','meta_ads')][string[]]$Platform,
    [Parameter(Mandatory=$true)][string[]]$LocationKey,
    [Parameter(Mandatory=$true)][string[]]$LocationLabel,
    [ValidateSet('registered_brand_location','approved_market')][string]$LocationScope='registered_brand_location',
    [Parameter(Mandatory=$true)][string]$Objective,
    [string]$Offer,
    [ValidateSet('reuse','mirror','build')][string]$LandingPageMode='build',
    [ValidateSet('staging','production')][string]$DeploymentEnvironment='staging',
    [string]$LandingPageArtifactRef,
    [string]$DestinationRef,
    [Parameter(Mandatory=$true)][ValidatePattern('^[a-z][a-z0-9_]{1,79}$')][string]$ConversionEvent,
    [Parameter(Mandatory=$true)][ValidatePattern('^[a-z0-9][a-z0-9_-]{1,120}$')][string]$UtmCampaign,
    [decimal]$DailyBudget=0,
    [decimal]$TotalBudget=0,
    [ValidatePattern('^[A-Z]{3}$')][string]$Currency='USD',
    [string]$StartAt,
    [string]$EndAt,
    [string]$Timezone='America/New_York',
    [string[]]$AccountRef=@(),
    [string]$AuthorityRef,
    [string]$CurrentEvidenceAt,
    [string]$ObservedAt,
    [string]$RequestId,
    [string]$OutputPath,
    [switch]$DryRun
)

$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'MarketingOs.Common.ps1')
$projectRoot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$registryPath=Join-Path $projectRoot 'registry\clients.json'
$registry=Get-Content -LiteralPath $registryPath -Raw -Encoding UTF8|ConvertFrom-Json
$clients=@($registry.clients|Where-Object{$_.id-ceq$ClientId})
if($clients.Count-ne1-or[string]$clients[0].status-ne'active'){throw 'ClientId must resolve to exactly one active canonical client.'}
$client=$clients[0]
$paidMediaRosterPath=Join-Path $projectRoot 'registry\paid-media-roster.json'
if(-not(Test-Path -LiteralPath $paidMediaRosterPath -PathType Leaf)){throw 'Canonical paid-media roster is missing.'}
$paidMediaRoster=Get-Content -LiteralPath $paidMediaRosterPath -Raw -Encoding UTF8|ConvertFrom-Json
foreach($platformName in $Platform){
    $platformSlug=$platformName.Replace('_','-')
    $laneId="$platformSlug--$ClientId"
    $lanes=@($paidMediaRoster.lanes|Where-Object{[string]$_.laneId-ceq$laneId-and[string]$_.clientId-ceq$ClientId-and[string]$_.platform-ceq$platformSlug-and[bool]$_.active})
    if($lanes.Count-ne1){throw "$ClientId is not on the exact current $platformName roster."}
}
if($LocationKey.Count-ne$LocationLabel.Count-or$LocationKey.Count-lt1){throw 'LocationKey and LocationLabel must contain the same non-zero number of entries.'}
if(@($LocationKey|Select-Object -Unique).Count-ne$LocationKey.Count){throw 'Location keys must be unique.'}
foreach($key in $LocationKey){if($key-notmatch'^[a-z0-9][a-z0-9-]{1,79}$'){throw "Invalid location key: $key"}}
foreach($value in @($LocationLabel)+@($Objective,$Offer)){if(-not(Test-MarketingSafeText ([string]$value))){throw 'Launch request text contains a secret, direct identifier, or raw communication.'}}
if($SourceLocator-notmatch'^(?:gmail-message:[A-Za-z0-9_-]{6,200}|slack-message:[A-Za-z0-9._:/-]{6,300}|user-instruction:[A-Za-z0-9._:-]{6,200})$'){throw 'SourceLocator is not an allowed opaque communication locator.'}
if($RequesterRef-notmatch'^(?:registry-contact:[a-z0-9-]+:[0-9]+|user:dillon)$'){throw 'RequesterRef must be a canonical registry-contact reference or user:dillon.'}
if($RequesterRef-like'registry-contact:*'-and$RequesterRef-notlike("registry-contact:$ClientId`:*")){throw 'RequesterRef does not belong to the selected client.'}
if($SourceChannel-eq'user'-and($SourceLocator-notlike'user-instruction:*'-or$RequesterRef-ne'user:dillon')){throw 'User instructions require a user locator and user:dillon requester.'}
if($SourceChannel-eq'gmail'-and($SourceLocator-notlike'gmail-message:*'-or$RequesterRef-notlike'registry-contact:*')){throw 'Gmail triggers require a Gmail locator and exact registry contact.'}
if($SourceChannel-eq'slack'-and($SourceLocator-notlike'slack-message:*'-or$RequesterRef-notlike'registry-contact:*')){throw 'Slack triggers require a Slack locator and exact registry contact.'}
if($RequesterRef-like'registry-contact:*'){$contactIndex=[int]($RequesterRef-split':')[-1];if($contactIndex-lt0-or$contactIndex-ge@($client.contacts).Count){throw 'RequesterRef does not resolve to a current client contact.'}}
$launchConfigPath=Join-Path $projectRoot ("clients\$ClientId\paid-media\launch-config.json")
if(-not(Test-Path -LiteralPath $launchConfigPath -PathType Leaf)){throw 'The selected client has no canonical paid-media launch configuration.'}
$launchConfig=Get-Content -LiteralPath $launchConfigPath -Raw -Encoding UTF8|ConvertFrom-Json
if($RequesterRef-notin@($launchConfig.requesterRefs)){throw 'RequesterRef is outside the client paid-media configuration.'}
$blueprintRefs=New-Object System.Collections.Generic.List[string]
foreach($platformName in $Platform){
    $platformConfig=$launchConfig.platforms.PSObject.Properties[$platformName].Value
    if($null-eq$platformConfig-or-not[bool]$platformConfig.enabledForPlanning){throw "$platformName is not enabled for this client."}
    $blueprintRef=[string]$platformConfig.launchBlueprintRef
    $expectedBlueprintRef="clients/$ClientId/paid-media/blueprints/$platformName.json"
    if($blueprintRef-cne$expectedBlueprintRef){throw "$platformName does not use the canonical client launch blueprint."}
    $blueprintPath=Join-Path $projectRoot ($blueprintRef-replace'/','\')
    if(-not(Test-Path -LiteralPath $blueprintPath -PathType Leaf)){throw "$platformName launch blueprint is missing."}
    $blueprint=Get-Content -LiteralPath $blueprintPath -Raw -Encoding UTF8|ConvertFrom-Json
    if([int]$blueprint.schemaVersion-ne1-or[string]$blueprint.clientId-cne$ClientId-or[string]$blueprint.platform-cne$platformName){throw "$platformName launch blueprint does not match the selected route."}
    $blueprintRefs.Add($blueprintRef)
    $platformSlug=$platformName.Replace('_','-')
    $laneId="$platformSlug--$ClientId"
    $lane=@($paidMediaRoster.lanes|Where-Object{[string]$_.laneId-ceq$laneId})[0]
    $expectedConfigRef="clients/$ClientId/paid-media/launch-config.json"
    if([string]$lane.configPath-cne$expectedConfigRef){throw "$platformName roster lane does not use the canonical client launch configuration."}
}
if($AccountRef.Count-eq0){$AccountRef=@($Platform|ForEach-Object{[string]$launchConfig.platforms.PSObject.Properties[$_].Value.exactAccountRef}|Where-Object{-not[string]::IsNullOrWhiteSpace($_)}|Select-Object -Unique)}
foreach($ref in $AccountRef){if($ref-notmatch'^access-broker:[A-Za-z0-9._:/-]+$'){throw "Invalid account reference: $ref"}}
if(-not[string]::IsNullOrWhiteSpace($LandingPageArtifactRef)-and$LandingPageArtifactRef-notmatch'^clients/[A-Za-z0-9._/ -]+$'){throw 'LandingPageArtifactRef must be a canonical client path.'}
if(-not[string]::IsNullOrWhiteSpace($DestinationRef)-and$DestinationRef-notmatch'^(?:access-broker|deployment):[A-Za-z0-9._:/-]+$'){throw 'DestinationRef must be an opaque deployment reference.'}
if($DailyBudget-lt0-or$TotalBudget-lt0){throw 'Budgets cannot be negative.'}

$now=[DateTimeOffset]::UtcNow
$observed=if([string]::IsNullOrWhiteSpace($ObservedAt)){$now}else{[DateTimeOffset]::Parse($ObservedAt)}
$evidenceAt=if([string]::IsNullOrWhiteSpace($CurrentEvidenceAt)){$observed}else{[DateTimeOffset]::Parse($CurrentEvidenceAt)}
$start=if([string]::IsNullOrWhiteSpace($StartAt)){$null}else{[DateTimeOffset]::Parse($StartAt)}
$end=if([string]::IsNullOrWhiteSpace($EndAt)){$null}else{[DateTimeOffset]::Parse($EndAt)}
if($null-ne$start-and$null-ne$end-and$end-le$start){throw 'EndAt must be later than StartAt.'}
if([string]::IsNullOrWhiteSpace($RequestId)){$RequestId='alr-'+$now.ToString('yyyyMMdd-HHmmss')+'-'+[guid]::NewGuid().ToString('N').Substring(0,8)}
if($RequestId-notmatch'^alr-[a-z0-9-]{8,100}$'){throw 'RequestId is invalid.'}
if([string]::IsNullOrWhiteSpace($AuthorityRef)){$AuthorityRef="clients/$ClientId/paid-media/launch-authority.json"}
if($AuthorityRef-notmatch'^clients/[A-Za-z0-9._/ -]+/paid-media/launch-authority\.json$'-or$AuthorityRef-notlike("clients/$ClientId/*")){throw 'AuthorityRef must belong to the selected client.'}
if([string]::IsNullOrWhiteSpace($OutputPath)){$OutputPath=Join-Path $projectRoot ("clients\$ClientId\paid-media\launches\$RequestId\request.json")}
$outputFull=[IO.Path]::GetFullPath($OutputPath)
$clientRoot=[IO.Path]::GetFullPath((Join-Path $projectRoot "clients\$ClientId"))
if(-not$outputFull.StartsWith($clientRoot+'\',[StringComparison]::OrdinalIgnoreCase)){throw 'OutputPath must remain inside the selected client folder.'}

$locations=for($i=0;$i-lt$LocationKey.Count;$i++){[pscustomobject][ordered]@{key=$LocationKey[$i];label=$LocationLabel[$i];scope=$LocationScope}}
$request=[pscustomobject][ordered]@{
    schemaVersion=1;requestId=$RequestId;createdAt=$now.ToString('o');clientId=$ClientId
    source=[pscustomobject][ordered]@{channel=$SourceChannel;locator=$SourceLocator;requesterRef=$RequesterRef;observedAt=$observed.ToString('o')}
    triggerClass=$TriggerClass;platforms=@($Platform|Select-Object -Unique);locations=@($locations);objective=$Objective.Trim();offer=if([string]::IsNullOrWhiteSpace($Offer)){$null}else{$Offer.Trim()}
    landingPage=[pscustomobject][ordered]@{mode=$LandingPageMode;deploymentEnvironment=$DeploymentEnvironment;artifactRef=if([string]::IsNullOrWhiteSpace($LandingPageArtifactRef)){$null}else{$LandingPageArtifactRef};destinationRef=if([string]::IsNullOrWhiteSpace($DestinationRef)){$null}else{$DestinationRef}}
    tracking=[pscustomobject][ordered]@{conversionEvent=$ConversionEvent;utmCampaign=$UtmCampaign}
    budget=[pscustomobject][ordered]@{currency=$Currency;daily=if($DailyBudget-gt0){$DailyBudget}else{$null};total=if($TotalBudget-gt0){$TotalBudget}else{$null}}
    schedule=[pscustomobject][ordered]@{startAt=if($null-eq$start){$null}else{$start.ToString('o')};endAt=if($null-eq$end){$null}else{$end.ToString('o')};timezone=$Timezone}
    accountRefs=@($AccountRef|Select-Object -Unique);blueprintRefs=@($blueprintRefs);authorityRef=$AuthorityRef;currentEvidenceAt=$evidenceAt.ToString('o');state='captured'
    privacy='redacted';containsSecrets=$false;containsDirectIdentifiers=$false;containsRawCommunications=$false
}
if(-not$DryRun){
    $directory=Split-Path -Parent $outputFull;if(-not(Test-Path -LiteralPath $directory)){New-Item -ItemType Directory -Path $directory -Force|Out-Null}
    $json=($request|ConvertTo-Json -Depth 20)+[Environment]::NewLine
    [IO.File]::WriteAllText($outputFull,$json,[Text.UTF8Encoding]::new($false))
}
[pscustomobject][ordered]@{status=if($DryRun){'validated'}else{'created'};requestId=$RequestId;clientId=$ClientId;outputPath=$outputFull;request=$request}|ConvertTo-Json -Depth 20
