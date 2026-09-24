[CmdletBinding()]
param(
    [switch]$LiveCanary,
    [switch]$HermesCanary,
    [ValidateSet('Json','Summary')][string]$Format='Json',
    [string]$BaseUrl='http://127.0.0.1:20128'
)

$ErrorActionPreference='Stop'
$checks=New-Object System.Collections.Generic.List[object]
$failed=$false
$providerName='omniroute-tokenrouter'
$expectedUpstream='https://api.tokenrouter.com/v1'

function Add-Check{
    param([string]$Name,[bool]$Passed,[string]$Detail)
    $script:checks.Add([pscustomobject][ordered]@{name=$Name;passed=$Passed;detail=$Detail})
    if(-not$Passed){$script:failed=$true}
}

function Invoke-RouterJson{
    param(
        [ValidateSet('GET','POST')][string]$Method,
        [string]$Path,
        $Body,
        [string]$ClientKey
    )
    $headers=@{Accept='application/json'}
    if(-not[string]::IsNullOrWhiteSpace($ClientKey)){$headers.Authorization="Bearer $ClientKey"}
    $args=@{
        Uri=($BaseUrl.TrimEnd('/')+$Path)
        Method=$Method
        Headers=$headers
        TimeoutSec=240
    }
    if($null-ne$Body){
        $args.ContentType='application/json'
        $args.Body=$Body|ConvertTo-Json -Depth 20 -Compress
    }
    Invoke-RestMethod @args
}

try{$baseUri=[uri]$BaseUrl}catch{throw 'BaseUrl must be a valid URI.'}
$baseValid=$baseUri.Scheme-eq'http'-and$baseUri.Host-eq'127.0.0.1'-and$baseUri.Port-eq20128
Add-Check 'endpoint:loopback-contract' $baseValid $BaseUrl

try{
    $listeners=@(Get-NetTCPConnection -LocalPort $baseUri.Port -State Listen -ErrorAction Stop)
    $listenerValid=$listeners.Count-gt0-and@($listeners|Where-Object{$_.LocalAddress-ne'127.0.0.1'}).Count-eq0
    Add-Check 'network:loopback-only-listener' $listenerValid ("listeners={0};addresses={1}"-f$listeners.Count,(@($listeners.LocalAddress|Sort-Object -Unique)-join','))
}catch{Add-Check 'network:loopback-only-listener' $false $_.Exception.GetType().Name}

try{
    $health=Invoke-RouterJson -Method GET -Path '/api/monitoring/health'
    $healthReady=[string]$health.status-in@('ok','healthy','ready')-or[bool]$health.ok
    Add-Check 'omniroute:health' $healthReady ("status={0}"-f[uri]::EscapeDataString([string]$health.status))
}catch{Add-Check 'omniroute:health' $false $_.Exception.GetType().Name}

$node=$null
try{
    $nodeResponse=Invoke-RouterJson -Method GET -Path '/api/provider-nodes'
    $nodes=@($nodeResponse.nodes)
    $matches=@($nodes|Where-Object{$_.prefix-eq'tokenrouter'-and$_.baseUrl.TrimEnd('/')-eq$expectedUpstream})
    if($matches.Count-eq1){$node=$matches[0]}
    Add-Check 'provider-node:tokenrouter-unique' ($matches.Count-eq1) ("matches={0};nodes={1}"-f$matches.Count,$nodes.Count)
}catch{Add-Check 'provider-node:tokenrouter-unique' $false $_.Exception.GetType().Name}

$connection=$null
try{
    $providerResponse=Invoke-RouterJson -Method GET -Path '/api/providers'
    $connections=@($providerResponse.connections)
    if($null-ne$node){
        $matches=@($connections|Where-Object{$_.provider-eq$node.id-and$_.name-eq'TokenRouter Kimi K3'})
        if($matches.Count-eq1){$connection=$matches[0]}
        Add-Check 'provider-connection:unique' ($matches.Count-eq1) ("matches={0};connections={1}"-f$matches.Count,$connections.Count)
        if($null-ne$connection){
            Add-Check 'provider-connection:active' ([bool]$connection.isActive) ("testStatus={0}"-f$connection.testStatus)
        }
    }else{Add-Check 'provider-connection:unique' $false 'provider-node-unavailable'}
}catch{Add-Check 'provider-connection:unique' $false $_.Exception.GetType().Name}

if($null-ne$connection){
    try{
        $providerTest=Invoke-RouterJson -Method POST -Path ("/api/providers/{0}/test"-f$connection.id)
        Add-Check 'provider-connection:credential-probe' ([bool]$providerTest.valid) ("latencyMs={0};valid={1}"-f$providerTest.latencyMs,[bool]$providerTest.valid)
    }catch{Add-Check 'provider-connection:credential-probe' $false $_.Exception.GetType().Name}
}

$clientKey=[Environment]::GetEnvironmentVariable('OMNIROUTE_API_KEY','Process')
if([string]::IsNullOrWhiteSpace($clientKey)){$clientKey=[Environment]::GetEnvironmentVariable('OMNIROUTE_API_KEY','User')}
Add-Check 'client-key:protected-environment' (-not[string]::IsNullOrWhiteSpace($clientKey)) 'locator=OMNIROUTE_API_KEY'

$targetModel=$null
$modelCount=0
$kimiModelCount=0
$tokenRouterModelIds=@()
$tokenRouterModelCount=0
$missingFromHermes=@()
$staleInHermes=@()
if(-not[string]::IsNullOrWhiteSpace($clientKey)-and$null-ne$node){
    try{
        $modelsResponse=Invoke-RouterJson -Method GET -Path '/v1/models' -ClientKey $clientKey
        $modelIds=@($modelsResponse.data|ForEach-Object{[string]$_.id})
        $modelCount=$modelIds.Count
        $kimiModelCount=@($modelIds|Where-Object{$_-match'(?i)kimi'}).Count
        $expectedPrefix=[string]$node.id+'/'
        $tokenRouterModelIds=@($modelIds|Where-Object{$_.StartsWith($expectedPrefix,[StringComparison]::Ordinal)}|Sort-Object -Unique)
        $tokenRouterModelCount=$tokenRouterModelIds.Count
        $targetModel=@($modelIds|Where-Object{$_.StartsWith($expectedPrefix,[StringComparison]::Ordinal)-and$_.EndsWith('/moonshotai/kimi-k3-free',[StringComparison]::Ordinal)}|Select-Object -First 1)[0]
        Add-Check 'catalog:kimi-k3-free-route' (-not[string]::IsNullOrWhiteSpace($targetModel)) ("models={0};kimi={1}"-f$modelCount,$kimiModelCount)
    }catch{Add-Check 'catalog:kimi-k3-free-route' $false $_.Exception.GetType().Name}
}

$configPath=Join-Path ([Environment]::GetFolderPath('LocalApplicationData')) 'hermes\config.yaml'
$hermesDeclaredModelCount=0
$hermesDiscoverModels=$false
try{
    $configText=Get-Content -LiteralPath $configPath -Raw -Encoding UTF8
    $configReady=$configText-match'(?m)^  omniroute-tokenrouter:\s*$'-and$configText-match'(?m)^    api: http://127\.0\.0\.1:20128/v1\s*$'-and$configText-match'(?m)^    key_env: OMNIROUTE_API_KEY\s*$'
    Add-Check 'hermes:named-provider-config' $configReady $providerName
    $hermesDiscoverModels=$configText-match'(?m)^    discover_models:\s*true\s*$'
    Add-Check 'hermes:dynamic-model-discovery' $hermesDiscoverModels ("enabled={0}"-f$hermesDiscoverModels)
    $lines=@($configText-split"`r?`n")
    $inProvider=$false
    $inModels=$false
    $declared=New-Object System.Collections.Generic.List[string]
    foreach($line in $lines){
        if($line-eq"  ${providerName}:"){$inProvider=$true;$inModels=$false;continue}
        if($inProvider-and$line-match'^  [^ ]'){$inProvider=$false;$inModels=$false;break}
        if($inProvider-and$line-eq'    models:'){$inModels=$true;continue}
        if($inModels-and$line-match"^      '(.+)':(?: \{\})?\s*$"){$declared.Add($Matches[1].Replace("''","'"))}
        elseif($inModels-and$line-match'^      (.+):(?: \{\})?\s*$'){$declared.Add($Matches[1].Trim())}
        elseif($inModels-and$line-match'^    [^ ]'){$inModels=$false}
    }
    $declaredIds=@($declared|Sort-Object -Unique)
    $hermesDeclaredModelCount=$declaredIds.Count
    $missingFromHermes=@($tokenRouterModelIds|Where-Object{$_-notin$declaredIds})
    $staleInHermes=@($declaredIds|Where-Object{$_-notin$tokenRouterModelIds})
    $inventoryMatches=$tokenRouterModelCount-gt0-and$missingFromHermes.Count-eq0-and$staleInHermes.Count-eq0
    $catalogReady=$inventoryMatches-or$hermesDiscoverModels
    Add-Check 'hermes:catalog-available' $catalogReady ("routed={0};declared={1};missingStatic={2};stale={3};dynamic={4}"-f$tokenRouterModelCount,$hermesDeclaredModelCount,$missingFromHermes.Count,$staleInHermes.Count,$hermesDiscoverModels)
}catch{Add-Check 'hermes:named-provider-config' $false $_.Exception.GetType().Name}

if($LiveCanary){
    if([string]::IsNullOrWhiteSpace($targetModel)){Add-Check 'canary:direct-kimi' $false 'target-model-unavailable'}
    else{
        try{
            $marker='TOKENROUTER_CANARY_OK'
            $body=[ordered]@{
                model=$targetModel
                messages=@(
                    [ordered]@{role='system';content='Answer directly and briefly.'},
                    [ordered]@{role='user';content="Reply with exactly: $marker"}
                )
                temperature=0
                max_tokens=256
                stream=$false
            }
            $completion=Invoke-RouterJson -Method POST -Path '/v1/chat/completions' -Body $body -ClientKey $clientKey
            $content=[string]$completion.choices[0].message.content
            Add-Check 'canary:direct-kimi' ($content.Trim()-eq$marker) ("returnedModel={0};exact={1}"-f$completion.model,($content.Trim()-eq$marker))
        }catch{Add-Check 'canary:direct-kimi' $false $_.Exception.GetType().Name}
    }
}

if($HermesCanary){
    if([string]::IsNullOrWhiteSpace($targetModel)){Add-Check 'canary:hermes-kimi' $false 'target-model-unavailable'}
    else{
        try{
            $hermes=Get-Command hermes -ErrorAction Stop
            $previousKey=[Environment]::GetEnvironmentVariable('OMNIROUTE_API_KEY','Process')
            [Environment]::SetEnvironmentVariable('OMNIROUTE_API_KEY',$clientKey,'Process')
            try{
                $marker='HERMES_OMNIROUTE_CANARY_OK'
                $output=&$hermes.Source --provider "custom:$providerName" --model $targetModel --ignore-rules -z "Reply with exactly: $marker" 2>&1
                $exitCode=$LASTEXITCODE
            }finally{[Environment]::SetEnvironmentVariable('OMNIROUTE_API_KEY',$previousKey,'Process')}
            $text=($output-join[Environment]::NewLine).Trim()
            Add-Check 'canary:hermes-kimi' ($exitCode-eq0-and$text-eq$marker) ("exit={0};exact={1}"-f$exitCode,($text-eq$marker))
        }catch{Add-Check 'canary:hermes-kimi' $false $_.Exception.GetType().Name}
    }
}

$result=[pscustomobject][ordered]@{
    schemaVersion=1
    checkedAt=[DateTimeOffset]::UtcNow.ToString('o')
    ready=(-not$failed)
    liveCanaryRequested=[bool]$LiveCanary
    hermesCanaryRequested=[bool]$HermesCanary
    modelCount=$modelCount
    kimiModelCount=$kimiModelCount
    tokenRouterModelCount=$tokenRouterModelCount
    hermesDeclaredModelCount=$hermesDeclaredModelCount
    hermesDiscoverModels=$hermesDiscoverModels
    missingHermesModelIds=@($missingFromHermes)
    staleHermesModelIds=@($staleInHermes)
    targetModel=$targetModel
    checks=@($checks|ForEach-Object{$_})
    containsSecrets=$false
}

if($Format-eq'Json'){$result|ConvertTo-Json -Depth 10}else{"ready=$(-not$failed); models=$modelCount; kimi=$kimiModelCount; checks=$($checks.Count); failures=$(@($checks|Where-Object{-not$_.passed}).Count)"}
if($failed){exit 1}
