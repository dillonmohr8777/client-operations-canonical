[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)][string]$RequestPath,
    [ValidateSet('Plan','Validate','CreatePaused','Enable','Readback')][string]$Mode='Plan',
    [string]$ProviderPacketPath,
    [string]$AuthorityPath,
    [string]$LaunchConfigPath,
    [string]$ProviderReadinessPath,
    [string]$ProviderAdapterPath,
    [string]$RuntimeRoot,
    [switch]$AllowFixturePaths
)
$ErrorActionPreference='Stop'
$projectRoot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$requestFull=[IO.Path]::GetFullPath($RequestPath)
$fixturePrefix=([IO.Path]::GetFullPath($env:TEMP).TrimEnd('\')+'\marketing-os-tests-')
if($AllowFixturePaths-and-not$requestFull.StartsWith($fixturePrefix,[StringComparison]::OrdinalIgnoreCase)){throw 'Fixture overrides must remain under an isolated marketing-os-tests directory.'}
$validationArgs=@{RequestPath=$RequestPath;AuthorityPath=$AuthorityPath;LaunchConfigPath=$LaunchConfigPath;ProviderReadinessPath=$ProviderReadinessPath;Format='Json';AllowFixturePaths=$AllowFixturePaths}
$validationText=& (Join-Path $PSScriptRoot 'Test-AdLaunchRequest.ps1') @validationArgs
$validation=$validationText|ConvertFrom-Json
if(-not[bool]$validation.validRequest){throw ('Launch request is invalid: '+(@($validation.requestReasons)-join'; '))}
if($Mode-eq'Plan'){$validation|ConvertTo-Json -Depth 12;return}
$request=Get-Content -LiteralPath $RequestPath -Raw -Encoding UTF8|ConvertFrom-Json
$requestState=[string]$request.state
$allowedStates=switch($Mode){
    'Validate'{@('qa','ready_for_paused_create')}
    'CreatePaused'{@('ready_for_paused_create','ready_to_enable')}
    'Enable'{@('ready_to_enable','enabled','observing')}
    'Readback'{@('ready_for_paused_create','ready_to_enable','enabled','observing')}
}
if($requestState-notin$allowedStates){throw "$Mode is not allowed from request state '$requestState'."}
if(-not[bool]$validation.launchConfig.accountRoutingReady){throw ('Exact client account routing is incomplete: '+(@($validation.launchConfig.reasons)-join'; '))}
if(-not[bool]$validation.provider.ready){throw ('Provider execution is not ready: '+(@($validation.provider.reasons)-join'; '))}
if([string]::IsNullOrWhiteSpace($ProviderPacketPath)){throw 'ProviderPacketPath is required outside Plan mode.'}
$canonicalRuntimeRoot=Join-Path $projectRoot 'work'
if([string]::IsNullOrWhiteSpace($RuntimeRoot)){$RuntimeRoot=$canonicalRuntimeRoot}
elseif(-not$AllowFixturePaths-and[IO.Path]::GetFullPath($RuntimeRoot)-cne[IO.Path]::GetFullPath($canonicalRuntimeRoot)){throw 'RuntimeRoot overrides are permitted only for isolated fixtures.'}
$packetFull=[IO.Path]::GetFullPath($ProviderPacketPath);$workRoot=[IO.Path]::GetFullPath($RuntimeRoot)
if(-not$packetFull.StartsWith($workRoot+'\',[StringComparison]::OrdinalIgnoreCase)){throw 'Provider packets are runtime artifacts and must remain under work/.'}
if(-not(Test-Path -LiteralPath $packetFull -PathType Leaf)){throw 'Provider packet was not found.'}
$packet=Get-Content -LiteralPath $packetFull -Raw -Encoding UTF8|ConvertFrom-Json
if([int]$packet.schemaVersion-ne1-or[string]$packet.requestId-cne[string]$validation.requestId){throw 'Provider packet does not match the launch request.'}
$expectedRequestFingerprint=([string](& (Join-Path $PSScriptRoot 'Get-AdLaunchRequestFingerprint.ps1') -RequestPath $RequestPath -Format Plain)).Trim()
if([string]$packet.requestFingerprint-cne$expectedRequestFingerprint){throw 'Provider packet request fingerprint is stale or mismatched.'}
if($packet.platform-notin@('google_ads','meta_ads')){throw 'Provider packet platform is invalid.'}
if($packet.platform-notin@($validation.requestPlatforms)){throw 'Provider packet platform is outside the launch request.'}
if([bool]$packet.containsSecrets){throw 'Provider packet cannot contain secrets.'}
$launchConfig=Get-Content -LiteralPath $validation.launchConfig.path -Raw -Encoding UTF8|ConvertFrom-Json
$platformProperty=$launchConfig.platforms.PSObject.Properties[[string]$packet.platform]
if($null-eq$platformProperty){throw 'Provider packet platform has no client routing configuration.'}
$platformConfig=$platformProperty.Value
$exactAccountRef=[string]$platformConfig.exactAccountRef
if([string]$packet.exactAccountRef-cne$exactAccountRef){throw 'Provider packet does not use the configured exact client account.'}
if([string]$packet.executionSurface-cne[string]$platformConfig.executionSurface){throw 'Provider packet execution surface does not match the client configuration.'}
$exactAccountIdSha256=[string]$platformConfig.exactAccountIdSha256
if($exactAccountIdSha256-notmatch'^[a-f0-9]{64}$'){throw 'Configured exact client account fingerprint is missing.'}
$phase=switch($Mode){'Validate'{'validate'}'CreatePaused'{'createPaused'}'Enable'{'enable'}'Readback'{'readback'}}
$operations=@($packet.operations.$phase)
if($operations.Count-lt1){throw "Provider packet contains no $phase operations."}
foreach($operation in $operations){
    $slug=[string]$operation.toolSlug
    if([string]$operation.account-cne$exactAccountRef){throw 'Every provider operation must use the configured exact client account reference.'}
    if($slug-notmatch'^(?:GOOGLEADS|METAADS)_[A-Z0-9_]+$'){throw "Provider tool is not allowed: $slug"}
    if($packet.platform-eq'google_ads'-and$slug-notlike'GOOGLEADS_*'){throw 'Google Ads packets may contain Google Ads tools only.'}
    if($packet.platform-eq'meta_ads'-and$slug-notlike'METAADS_*'){throw 'Meta Ads packets may contain Meta Ads tools only.'}
    if($slug-match'(?i)(DELETE|REMOVE)'){throw 'Remove and delete provider tools are prohibited.'}
    $argumentJson=$operation.arguments|ConvertTo-Json -Compress -Depth 30
    if($argumentJson-match'(?i)"(?:password|api[_-]?key|access[_-]?token|refresh[_-]?token|secret|cookie|one[_-]?time[_-]?code)"\s*:'){throw 'Provider arguments contain a prohibited secret field.'}
    if($argumentJson-match'(?i)"operation_type"\s*:\s*"remove"|"remove"\s*:'){throw 'Remove operations are prohibited.'}
    if($argumentJson-match'(?i)"(?:login_customer_id|business_id)"\s*:'){throw 'Manager and business context identifiers require a separately fingerprinted route.'}
    $routingPattern=if($packet.platform-eq'google_ads'){'(?i)"customer_id"\s*:\s*"?(?<id>[0-9-]+)"?|customers/(?<id>[0-9-]+)'}else{'(?i)"(?:account_id|ad_account_id|act)"\s*:\s*"?(?:act_)?(?<id>[0-9-]+)"?|act_(?<id>[0-9-]+)'}
    $routingMatches=[regex]::Matches($argumentJson,$routingPattern)
    if($routingMatches.Count-lt1){throw 'Provider operation does not expose an exact child-account identifier for verification.'}
    foreach($routingMatch in $routingMatches){
        $normalizedId=([string]$routingMatch.Groups['id'].Value)-replace'[^0-9A-Za-z]',''
        $bytes=[Text.Encoding]::UTF8.GetBytes($normalizedId.ToLowerInvariant());$sha=[Security.Cryptography.SHA256]::Create()
        try{$actualHash=([BitConverter]::ToString($sha.ComputeHash($bytes))).Replace('-','').ToLowerInvariant()}finally{$sha.Dispose()}
        if($actualHash-cne$exactAccountIdSha256){throw 'Provider operation targets a child account outside the configured client route.'}
    }
    if($Mode-eq'Validate'){
        if($packet.platform-ne'google_ads'){throw 'Meta Ads has no approved validate-only terminal adapter.'}
        if((-not($operation.arguments.PSObject.Properties.Name-contains'validate_only'))-or-not[bool]$operation.arguments.validate_only){throw 'Every Google Ads validation operation must set validate_only=true.'}
    }
    if($Mode-eq'Readback'-and$slug-notmatch'(?i)^GOOGLEADS_(?:GET|LIST|SEARCH|QUERY|REPORT)|^METAADS_(?:GET|LIST|SEARCH|QUERY|REPORT|INSIGHT)'){throw 'Readback packets may contain read-only provider tools only.'}
    if($Mode-eq'CreatePaused'){
        if($argumentJson-match'(?i)"status"\s*:\s*"(?:enabled|active)"'){throw 'CreatePaused cannot contain an active status.'}
        if($argumentJson-notmatch'(?i)"status"\s*:\s*"paused"'){throw 'CreatePaused requires an explicit paused status.'}
        if($argumentJson-notmatch'(?i)"(?:operation_type|action)"\s*:\s*"create"|"create"\s*:'){throw 'CreatePaused may create paused resources only.'}
    }
    if($Mode-eq'Enable'){
        if($argumentJson-match'(?i)"create"\s*:|"(?:operation_type|action)"\s*:\s*"create"'){throw 'Enable packets may update existing resources only.'}
        if($argumentJson-notmatch'(?i)"status"\s*:\s*"(?:enabled|active)"'){throw 'Enable packets require an explicit active status.'}
    }
}
if($Mode-eq'CreatePaused'-and-not[bool]$validation.readyForPausedCreate){throw ('Paused creation is outside active authority: '+(@($validation.authority.reasons)-join'; '))}
if($Mode-eq'Enable'-and-not[bool]$validation.readyToEnable){throw ('Campaign enable is outside active authority: '+(@($validation.authority.reasons)-join'; '))}
$canonicalAdapterPath=Join-Path $PSScriptRoot 'providers\Invoke-ComposioAdPacket.ps1'
if([string]::IsNullOrWhiteSpace($ProviderAdapterPath)){
    if([string]$packet.executionSurface-ne'provider_api'){throw 'No default terminal adapter exists for this execution surface.'}
    $ProviderAdapterPath=$canonicalAdapterPath
}elseif(-not$AllowFixturePaths-and[IO.Path]::GetFullPath($ProviderAdapterPath)-cne[IO.Path]::GetFullPath($canonicalAdapterPath)){throw 'ProviderAdapterPath overrides are permitted only for isolated fixtures.'}
if(-not(Test-Path -LiteralPath $ProviderAdapterPath -PathType Leaf)){throw 'Provider adapter was not found.'}
$outputRoot=Join-Path $workRoot ("ad-launch\$($validation.requestId)");if(-not(Test-Path -LiteralPath $outputRoot)){New-Item -ItemType Directory -Path $outputRoot -Force|Out-Null}
$packetHash=(Get-FileHash -LiteralPath $packetFull -Algorithm SHA256).Hash.ToLowerInvariant()
function Get-PhaseReceipt{
    param([string]$ReceiptPhase)
    $items=foreach($receiptFile in @(Get-ChildItem -LiteralPath $outputRoot -Filter 'receipt-*.json' -File -ErrorAction SilentlyContinue)){
        try{$receipt=Get-Content -LiteralPath $receiptFile.FullName -Raw -Encoding UTF8|ConvertFrom-Json}catch{continue}
        if([string]$receipt.requestId-ceq[string]$validation.requestId-and[string]$receipt.packetSha256-ceq$packetHash-and[string]$receipt.phase-ceq$ReceiptPhase-and[bool]$receipt.successful){$receipt}
    }
    @($items|Sort-Object recordedAt -Descending|Select-Object -First 1)[0]
}
$existingReceipt=Get-PhaseReceipt $phase
if($null-ne$existingReceipt-and$Mode-in@('Validate','CreatePaused','Enable')){
    [pscustomobject][ordered]@{status='already_completed';mode=$Mode;requestId=$validation.requestId;clientId=$validation.clientId;receipt=$existingReceipt.receiptRef;readbackRequired=($Mode-in@('CreatePaused','Enable'))}|ConvertTo-Json -Depth 8
    return
}
$validateReceipt=Get-PhaseReceipt 'validate'
$createReceipt=Get-PhaseReceipt 'createPaused'
$enableReceipt=Get-PhaseReceipt 'enable'
$readbackReceipt=Get-PhaseReceipt 'readback'
if($Mode-eq'CreatePaused'-and$null-eq$validateReceipt){throw 'Paused creation requires a successful validate-only receipt for the same request and packet.'}
if($Mode-eq'Readback'){
    if($requestState-in@('ready_for_paused_create','ready_to_enable')-and$null-eq$createReceipt){throw 'Pre-enable readback requires a successful paused-creation receipt.'}
    if($requestState-in@('enabled','observing')-and$null-eq$enableReceipt){throw 'Post-enable readback requires a successful enable receipt.'}
}
if($Mode-eq'Enable'){
    if($null-eq$createReceipt){throw 'Campaign enable requires a successful paused-creation receipt.'}
    $verifiedReadback=@(Get-ChildItem -LiteralPath $outputRoot -Filter 'receipt-readback-*.json' -File -ErrorAction SilentlyContinue|ForEach-Object{try{Get-Content -LiteralPath $_.FullName -Raw -Encoding UTF8|ConvertFrom-Json}catch{$null}}|Where-Object{$null-ne$_-and[bool]$_.successful-and[string]$_.requestId-ceq[string]$validation.requestId-and[string]$_.packetSha256-ceq$packetHash-and[string]$_.afterPhase-eq'createPaused'-and[DateTimeOffset]::Parse([string]$_.recordedAt)-gt[DateTimeOffset]::Parse([string]$createReceipt.recordedAt)}|Sort-Object recordedAt -Descending|Select-Object -First 1)
    if($verifiedReadback.Count-ne1){throw 'Campaign enable requires a successful readback after paused creation.'}
}
$stamp=[DateTimeOffset]::UtcNow.ToString('yyyyMMddHHmmssfff')
$outputPath=Join-Path $outputRoot ("provider-$phase-$stamp-$([guid]::NewGuid().ToString('N').Substring(0,8)).json")
$providerText=& $ProviderAdapterPath -PacketPath $packetFull -Phase $phase -OutputPath $outputPath
try{$providerResult=$providerText|ConvertFrom-Json}catch{throw 'Provider adapter output is not valid JSON.'}
if($providerResult.PSObject.Properties.Name-notcontains'successful'-or-not[bool]$providerResult.successful){throw 'Provider adapter did not attest complete success; no launch receipt was recorded.'}
$afterPhase=if($Mode-eq'Readback'){if($null-ne$enableReceipt){'enable'}elseif($null-ne$createReceipt){'createPaused'}elseif($null-ne$validateReceipt){'validate'}else{$null}}else{$null}
$receiptPath=Join-Path $outputRoot ("receipt-$phase-$stamp-$([guid]::NewGuid().ToString('N').Substring(0,8)).json")
$receiptRef=$receiptPath.Substring($workRoot.Length+1).Replace('\','/')
$receipt=[pscustomobject][ordered]@{schemaVersion=1;requestId=[string]$validation.requestId;clientId=[string]$validation.clientId;phase=$phase;afterPhase=$afterPhase;packetSha256=$packetHash;requestFingerprint=$expectedRequestFingerprint;recordedAt=[DateTimeOffset]::UtcNow.ToString('o');successful=$true;providerResultRef=$outputPath.Substring($workRoot.Length+1).Replace('\','/');receiptRef=$receiptRef;containsSecrets=$false;containsDirectIdentifiers=$false}
[IO.File]::WriteAllText($receiptPath,(($receipt|ConvertTo-Json -Depth 8)+[Environment]::NewLine),[Text.UTF8Encoding]::new($false))
$nextState=switch($Mode){'Validate'{'ready_for_paused_create'}'CreatePaused'{'ready_for_paused_create'}'Enable'{'enabled'}'Readback'{if($afterPhase-eq'enable'){'observing'}elseif($afterPhase-eq'createPaused'){'ready_to_enable'}else{$requestState}}}
if(-not[string]::IsNullOrWhiteSpace($nextState)-and[string]$request.state-cne$nextState){$request.state=$nextState;[IO.File]::WriteAllText([IO.Path]::GetFullPath($RequestPath),(($request|ConvertTo-Json -Depth 30)+[Environment]::NewLine),[Text.UTF8Encoding]::new($false))}
[pscustomobject][ordered]@{status='provider_operation_completed';mode=$Mode;requestId=$validation.requestId;clientId=$validation.clientId;providerPacket=$packetFull;providerResult=$outputPath;receipt=$receiptRef;state=$nextState;readbackRequired=($Mode-in@('CreatePaused','Enable'))}|ConvertTo-Json -Depth 8
