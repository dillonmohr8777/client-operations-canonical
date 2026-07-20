[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)][string]$RequestPath,
    [string]$AuthorityPath,
    [string]$LaunchConfigPath,
    [string]$ProviderReadinessPath,
    [string]$AsOf,
    [ValidateSet('Json','Summary')][string]$Format='Json',
    [switch]$AllowFixturePaths
)

$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'MarketingOs.Common.ps1')
$projectRoot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
function Get-Value{param($Object,[string]$Name,$Default=$null);if($null-ne$Object-and$Object.PSObject.Properties.Name-contains$Name){return $Object.$Name};return $Default}
$reasons=New-Object System.Collections.Generic.List[string]
$gates=New-Object System.Collections.Generic.List[string]
if(-not(Test-Path -LiteralPath $RequestPath -PathType Leaf)){throw "Request not found: $RequestPath"}
$requestFull=[IO.Path]::GetFullPath($RequestPath)
$fixturePrefix=([IO.Path]::GetFullPath($env:TEMP).TrimEnd('\')+'\marketing-os-tests-')
if($AllowFixturePaths-and-not$requestFull.StartsWith($fixturePrefix,[StringComparison]::OrdinalIgnoreCase)){throw 'Fixture overrides must remain under an isolated marketing-os-tests directory.'}
try{$request=Get-Content -LiteralPath $RequestPath -Raw -Encoding UTF8|ConvertFrom-Json}catch{throw 'Request is not valid JSON.'}
$required=@('schemaVersion','requestId','createdAt','clientId','source','triggerClass','platforms','locations','objective','landingPage','tracking','budget','schedule','accountRefs','blueprintRefs','authorityRef','currentEvidenceAt','state','privacy','containsSecrets','containsDirectIdentifiers','containsRawCommunications')
foreach($name in $required){if($request.PSObject.Properties.Name-notcontains$name){$reasons.Add("missing request field: $name")}}
if([int](Get-Value $request 'schemaVersion' 0)-ne1){$reasons.Add('unsupported request schema')}
if([string](Get-Value $request 'requestId' '')-notmatch'^alr-[a-z0-9-]{8,100}$'){$reasons.Add('invalid requestId')}
if([string](Get-Value $request 'privacy' '')-ne'redacted'){$reasons.Add('request privacy is not redacted')}
foreach($flag in @('containsSecrets','containsDirectIdentifiers','containsRawCommunications')){$value=Get-Value $request $flag $null;if($value-isnot[bool]-or[bool]$value){$reasons.Add("$flag must be Boolean false")}}
$clientId=[string](Get-Value $request 'clientId' '')
$registry=Get-Content -LiteralPath (Join-Path $projectRoot 'registry\clients.json') -Raw -Encoding UTF8|ConvertFrom-Json
$client=@($registry.clients|Where-Object{$_.id-ceq$clientId})
if($client.Count-ne1-or[string]$client[0].status-ne'active'){$reasons.Add('client route is not exact and active')}
if(-not$AllowFixturePaths){$canonicalLaunchRoot=[IO.Path]::GetFullPath((Join-Path $projectRoot "clients\$clientId\paid-media\launches"));if(-not$requestFull.StartsWith($canonicalLaunchRoot+'\',[StringComparison]::OrdinalIgnoreCase)){$reasons.Add('request is outside the selected client launch directory')}}
$source=Get-Value $request 'source' $null
$sourceChannel=[string](Get-Value $source 'channel' '')
$sourceLocator=[string](Get-Value $source 'locator' '')
$requesterRef=[string](Get-Value $source 'requesterRef' '')
if($sourceChannel-notin@('gmail','slack','user')){$reasons.Add('source channel is invalid')}
if($sourceLocator-notmatch'^(?:gmail-message:[A-Za-z0-9_-]{6,200}|slack-message:[A-Za-z0-9._:/-]{6,300}|user-instruction:[A-Za-z0-9._:-]{6,200})$'){$reasons.Add('source locator is invalid')}
if($requesterRef-notmatch'^(?:registry-contact:[a-z0-9-]+:[0-9]+|user:dillon)$'){$reasons.Add('requester reference is invalid')}
if($sourceChannel-eq'user'-and($sourceLocator-notlike'user-instruction:*'-or$requesterRef-ne'user:dillon')){$reasons.Add('user source is not bound to user:dillon')}
if($sourceChannel-eq'gmail'-and($sourceLocator-notlike'gmail-message:*'-or$requesterRef-notlike'registry-contact:*')){$reasons.Add('gmail source is not bound to an exact registry contact')}
if($sourceChannel-eq'slack'-and($sourceLocator-notlike'slack-message:*'-or$requesterRef-notlike'registry-contact:*')){$reasons.Add('slack source is not bound to an exact registry contact')}
if($requesterRef-like'registry-contact:*'){$refClient=($requesterRef-split':')[1];$contactIndex=[int]($requesterRef-split':')[-1];if($refClient-cne$clientId-or$client.Count-ne1-or$contactIndex-lt0-or$contactIndex-ge@($client[0].contacts).Count){$reasons.Add('requester reference does not resolve to the selected client contact')}}
$platforms=@(Get-Value $request 'platforms' @())
if($platforms.Count-lt1-or@($platforms|Where-Object{$_-notin@('google_ads','meta_ads')}).Count-gt0-or@($platforms|Select-Object -Unique).Count-ne$platforms.Count){$reasons.Add('platform set is invalid')}
$paidMediaRosterPath=Join-Path $projectRoot 'registry\paid-media-roster.json'
$paidMediaRoster=$null
if(-not(Test-Path -LiteralPath $paidMediaRosterPath -PathType Leaf)){$reasons.Add('canonical paid-media roster is missing')}
else{try{$paidMediaRoster=Get-Content -LiteralPath $paidMediaRosterPath -Raw -Encoding UTF8|ConvertFrom-Json}catch{$reasons.Add('canonical paid-media roster is invalid JSON')}}
if($null-ne$paidMediaRoster){
    foreach($platform in $platforms){
        $platformSlug=([string]$platform).Replace('_','-');$laneId="$platformSlug--$clientId"
        $lanes=@($paidMediaRoster.lanes|Where-Object{[string]$_.laneId-ceq$laneId-and[string]$_.clientId-ceq$clientId-and[string]$_.platform-ceq$platformSlug-and[bool]$_.active})
        if($lanes.Count-ne1){$reasons.Add("client is not on the exact current $platform roster")}
        elseif([string]$lanes[0].configPath-cne"clients/$clientId/paid-media/launch-config.json"){$reasons.Add("$platform roster lane does not use the canonical client launch configuration")}
    }
}
$locations=@(Get-Value $request 'locations' @())
if($locations.Count-lt1-or$locations.Count-gt250){$reasons.Add('location count is invalid')}
$locationKeys=@();foreach($location in $locations){$key=[string](Get-Value $location 'key' '');$label=[string](Get-Value $location 'label' '');$scope=[string](Get-Value $location 'scope' '');$locationKeys+=$key;if($key-notmatch'^[a-z0-9][a-z0-9-]{1,79}$'-or$label.Length-lt2-or$scope-notin@('registered_brand_location','approved_market')){$reasons.Add('one or more locations are invalid')};if(-not(Test-MarketingSafeText $label)){$reasons.Add('location label is unsafe')}}
if(@($locationKeys|Select-Object -Unique).Count-ne$locationKeys.Count){$reasons.Add('location keys are duplicated')}
foreach($text in @([string](Get-Value $request 'objective' ''),[string](Get-Value $request 'offer' ''))){if(-not(Test-MarketingSafeText $text)){$reasons.Add('request text is unsafe')}}
$now=if([string]::IsNullOrWhiteSpace($AsOf)){[DateTimeOffset]::UtcNow}else{[DateTimeOffset]::Parse($AsOf)}
try{$evidenceAt=[DateTimeOffset]::Parse([string](Get-Value $request 'currentEvidenceAt' ''))}catch{$evidenceAt=$null;$reasons.Add('currentEvidenceAt is invalid')}
$budget=Get-Value $request 'budget' $null
$daily=Get-Value $budget 'daily' $null;$total=Get-Value $budget 'total' $null;$currency=[string](Get-Value $budget 'currency' '')
if($currency-notmatch'^[A-Z]{3}$'){$reasons.Add('budget currency is invalid')}
if(($null-ne$daily-and[decimal]$daily-le0)-or($null-ne$total-and[decimal]$total-le0)){$reasons.Add('budget values must be positive when present')}
$schedule=Get-Value $request 'schedule' $null
try{$start=if($null-eq(Get-Value $schedule 'startAt' $null)){$null}else{[DateTimeOffset]::Parse([string]$schedule.startAt)}}catch{$start=$null;$reasons.Add('schedule startAt is invalid')}
try{$end=if($null-eq(Get-Value $schedule 'endAt' $null)){$null}else{[DateTimeOffset]::Parse([string]$schedule.endAt)}}catch{$end=$null;$reasons.Add('schedule endAt is invalid')}
if($null-ne$start-and$null-ne$end-and$end-le$start){$reasons.Add('schedule endAt must follow startAt')}

$configReasons=New-Object System.Collections.Generic.List[string]
$blueprintReasons=New-Object System.Collections.Generic.List[string]
$deploymentConfigReasons=New-Object System.Collections.Generic.List[string]
$canonicalLaunchConfigPath=Join-Path $projectRoot ("clients\$clientId\paid-media\launch-config.json")
if([string]::IsNullOrWhiteSpace($LaunchConfigPath)){$LaunchConfigPath=$canonicalLaunchConfigPath}
elseif(-not$AllowFixturePaths-and[IO.Path]::GetFullPath($LaunchConfigPath)-cne[IO.Path]::GetFullPath($canonicalLaunchConfigPath)){throw 'LaunchConfigPath overrides are permitted only for isolated fixtures.'}
$launchConfig=$null
if(-not(Test-Path -LiteralPath $LaunchConfigPath -PathType Leaf)){$configReasons.Add('client paid-media launch configuration is missing')}
else{try{$launchConfig=Get-Content -LiteralPath $LaunchConfigPath -Raw -Encoding UTF8|ConvertFrom-Json}catch{$configReasons.Add('client paid-media launch configuration is invalid JSON')}}
$requestAccountRefs=@(Get-Value $request 'accountRefs' @())
$requestBlueprintRefs=@(Get-Value $request 'blueprintRefs' @())
if($null-ne$launchConfig){
    if([int](Get-Value $launchConfig 'schemaVersion' 0)-ne1){$configReasons.Add('client paid-media launch configuration schema is unsupported')}
    if([string](Get-Value $launchConfig 'clientId' '')-cne$clientId){$configReasons.Add('client paid-media launch configuration does not match request')}
    foreach($flag in @('containsSecrets','containsDirectIdentifiers','containsRawCommunications')){$value=Get-Value $launchConfig $flag $null;if($value-isnot[bool]-or[bool]$value){$configReasons.Add("client paid-media launch configuration $flag must be Boolean false")}}
    if($requesterRef-notin@(Get-Value $launchConfig 'requesterRefs' @())){$configReasons.Add('requester is outside client paid-media routing configuration')}
    if(@(Get-Value $launchConfig 'loginIdentityRefs' @()).Count-lt1){$configReasons.Add('shared login identity route is missing')}
    $expectedAccountRefs=New-Object System.Collections.Generic.List[string]
    $expectedBlueprintRefs=New-Object System.Collections.Generic.List[string]
    foreach($platform in $platforms){
        $platformConfig=Get-Value (Get-Value $launchConfig 'platforms' $null) $platform $null
        if($null-eq$platformConfig){$configReasons.Add("$platform is absent from client paid-media routing configuration");continue}
        if(-not[bool](Get-Value $platformConfig 'enabledForPlanning' $false)){$configReasons.Add("$platform is disabled for client planning")}
        $exactAccountRef=[string](Get-Value $platformConfig 'exactAccountRef' '')
        if($exactAccountRef-notmatch'^access-broker:[A-Za-z0-9._:/-]+$'){$configReasons.Add("$platform exact child-account mapping is missing")}
        else{$expectedAccountRefs.Add($exactAccountRef);if($exactAccountRef-notin$requestAccountRefs){$configReasons.Add("$platform request does not use the configured exact child account")}}
        if([string](Get-Value $platformConfig 'exactAccountIdSha256' '')-notmatch'^[a-f0-9]{64}$'){$configReasons.Add("$platform exact child-account fingerprint is missing")}
        if([string](Get-Value $platformConfig 'executionSurface' '')-notin@('persistent_chrome','provider_api')){$configReasons.Add("$platform execution surface is not configured")}
        $blueprintRef=[string](Get-Value $platformConfig 'launchBlueprintRef' '')
        $expectedBlueprintRef="clients/$clientId/paid-media/blueprints/$platform.json"
        if($blueprintRef-cne$expectedBlueprintRef){$blueprintReasons.Add("$platform launch blueprint is not the canonical client blueprint");continue}
        $expectedBlueprintRefs.Add($blueprintRef)
        if($blueprintRef-notin$requestBlueprintRefs){$blueprintReasons.Add("$platform request does not use the configured launch blueprint")}
        $blueprintPath=Join-Path $projectRoot ($blueprintRef-replace'/','\')
        if(-not(Test-Path -LiteralPath $blueprintPath -PathType Leaf)){$blueprintReasons.Add("$platform launch blueprint is missing");continue}
        try{$blueprint=Get-Content -LiteralPath $blueprintPath -Raw -Encoding UTF8|ConvertFrom-Json}catch{$blueprintReasons.Add("$platform launch blueprint is invalid JSON");continue}
        if([int](Get-Value $blueprint 'schemaVersion' 0)-ne1-or[string](Get-Value $blueprint 'clientId' '')-cne$clientId-or[string](Get-Value $blueprint 'platform' '')-cne$platform){$blueprintReasons.Add("$platform launch blueprint does not match the selected route")}
        if([string](Get-Value $blueprint 'rosterRef' '')-ne'registry/paid-media-roster.json'){$blueprintReasons.Add("$platform launch blueprint does not use the canonical paid-media roster")}
        if(-not[bool](Get-Value (Get-Value $blueprint 'triggerContract' $null) 'communicationImpliesFullBuild' $false)){$blueprintReasons.Add("$platform launch blueprint does not infer the full build chain")}
        foreach($flag in @('containsSecrets','containsDirectIdentifiers','containsRawCommunications')){$value=Get-Value $blueprint $flag $null;if($value-isnot[bool]-or[bool]$value){$blueprintReasons.Add("$platform launch blueprint $flag must be Boolean false")}}
    }
    if($requestAccountRefs.Count-ne$expectedAccountRefs.Count-or@($requestAccountRefs|Where-Object{$_-notin@($expectedAccountRefs)}).Count-gt0){$configReasons.Add('request account set does not exactly match the configured client platform accounts')}
    if($requestBlueprintRefs.Count-ne$expectedBlueprintRefs.Count-or@($requestBlueprintRefs|Where-Object{$_-notin@($expectedBlueprintRefs)}).Count-gt0){$blueprintReasons.Add('request blueprint set does not exactly match the configured client platforms')}
    $configuredScope=[string](Get-Value (Get-Value $launchConfig 'locationPolicy' $null) 'scope' '')
    if(@($locations|Where-Object{$_.scope-cne$configuredScope}).Count-gt0){$configReasons.Add('location scope does not match client paid-media routing configuration')}
    $landingConfig=Get-Value $launchConfig 'landingPage' $null
    $requestLanding=Get-Value $request 'landingPage' $null
    $requestArtifactRef=[string](Get-Value $requestLanding 'artifactRef' '')
    if(-not[string]::IsNullOrWhiteSpace($requestArtifactRef)-and$requestArtifactRef-notlike("clients/$clientId/*")){$deploymentConfigReasons.Add('landing-page artifact is outside the selected client')}
    $requestDeployment=[string](Get-Value $requestLanding 'deploymentEnvironment' '')
    $configuredDestination=if($requestDeployment-eq'staging'){[string](Get-Value $landingConfig 'stagingDeploymentRef' '')}else{[string](Get-Value $landingConfig 'productionDeploymentRef' '')}
    $requestDestination=[string](Get-Value $requestLanding 'destinationRef' '')
    if([string](Get-Value $landingConfig 'status' '')-ne'ready'){$deploymentConfigReasons.Add('client landing-page deployment configuration is not ready')}
    if([string]::IsNullOrWhiteSpace($configuredDestination)-or$requestDestination-cne$configuredDestination){$deploymentConfigReasons.Add('landing-page destination does not match the selected client configuration')}
}
$accountRoutingReady=$null-ne$launchConfig-and$configReasons.Count-eq0
$blueprintRoutingReady=$null-ne$launchConfig-and$blueprintReasons.Count-eq0
$deploymentRoutingReady=$null-ne$launchConfig-and$deploymentConfigReasons.Count-eq0

$authorityRelative=[string](Get-Value $request 'authorityRef' '')
$canonicalAuthorityPath=$null
try{$canonicalAuthorityPath=Resolve-MarketingChildPath -Root $projectRoot -Child ($authorityRelative.Replace('/','\'))}catch{$reasons.Add('authority reference escapes the canonical project')}
if([string]::IsNullOrWhiteSpace($AuthorityPath)){$AuthorityPath=$canonicalAuthorityPath}
elseif(-not$AllowFixturePaths-and$null-ne$canonicalAuthorityPath-and[IO.Path]::GetFullPath($AuthorityPath)-cne[IO.Path]::GetFullPath($canonicalAuthorityPath)){throw 'AuthorityPath overrides are permitted only for isolated fixtures.'}
$authority=$null;$authorityReasons=New-Object System.Collections.Generic.List[string]
if([string]::IsNullOrWhiteSpace($AuthorityPath)-or-not(Test-Path -LiteralPath $AuthorityPath -PathType Leaf)){$authorityReasons.Add('authority file is missing')}
else{try{$authority=Get-Content -LiteralPath $AuthorityPath -Raw -Encoding UTF8|ConvertFrom-Json}catch{$authorityReasons.Add('authority file is invalid JSON')}}
if($null-ne$authority){
    if([int](Get-Value $authority 'schemaVersion' 0)-ne1){$authorityReasons.Add('authority schema is unsupported')}
    if([string](Get-Value $authority 'clientId' '')-cne$clientId){$authorityReasons.Add('authority client does not match request')}
    foreach($flag in @('containsSecrets','containsDirectIdentifiers','containsRawCommunications')){$value=Get-Value $authority $flag $null;if($value-isnot[bool]-or[bool]$value){$authorityReasons.Add("authority $flag must be Boolean false")}}
    if([string](Get-Value $authority 'status' '')-ne'active'){$authorityReasons.Add('authority is not active')}
    if($requesterRef-notin@(Get-Value $authority 'authorizedRequesterRefs' @())){$authorityReasons.Add('requester is outside authority')}
    if(@($platforms|Where-Object{$_-notin@(Get-Value $authority 'allowedPlatforms' @())}).Count-gt0){$authorityReasons.Add('platform is outside authority')}
    if([string](Get-Value $request 'triggerClass' '')-notin@(Get-Value $authority 'allowedTriggerClasses' @())){$authorityReasons.Add('trigger class is outside authority')}
    if($requestAccountRefs.Count-lt1){$authorityReasons.Add('exact platform account reference is missing')}elseif(@($requestAccountRefs|Where-Object{$_-notin@(Get-Value $authority 'allowedAccountRefs' @())}).Count-gt0){$authorityReasons.Add('platform account is outside authority')}
    if(@($locations|Where-Object{$_.scope-notin@(Get-Value $authority 'allowedLocationScopes' @())}).Count-gt0){$authorityReasons.Add('location scope is outside authority')}
    $deployment=[string](Get-Value (Get-Value $request 'landingPage' $null) 'deploymentEnvironment' '');if($deployment-notin@(Get-Value $authority 'allowedDeploymentEnvironments' @())){$authorityReasons.Add('deployment environment is outside authority')}
    $limits=Get-Value $authority 'limits' $null
    if($currency-cne[string](Get-Value $limits 'currency' '')){$authorityReasons.Add('budget currency is outside authority')}
    $maxDaily=Get-Value $limits 'maxDailyPerCampaign' $null;$maxTotal=Get-Value $limits 'maxTotalPerRequest' $null;$maxLocations=Get-Value $limits 'maxLocationsPerRequest' $null
    if($null-eq$daily){$authorityReasons.Add('daily budget is missing')}elseif($null-eq$maxDaily-or[decimal]$daily-gt[decimal]$maxDaily){$authorityReasons.Add('daily budget is outside authority')}
    if($null-eq$total){$authorityReasons.Add('total budget is missing')}elseif($null-eq$maxTotal-or[decimal]$total-gt[decimal]$maxTotal){$authorityReasons.Add('total budget is outside authority')}
    if(($null-ne$daily-or$null-ne$total)-and-not[bool](Get-Value (Get-Value $authority 'permissions' $null) 'adjustBudget' $false)){$authorityReasons.Add('budget authority is not active')}
    if($null-eq$maxLocations-or$locations.Count-gt[int]$maxLocations){$authorityReasons.Add('location count is outside authority')}
    if([string](Get-Value $authority 'approvedBy' '')-ne'dillon'){$authorityReasons.Add('authority is not approved by Dillon')}
    try{$approvedAt=[DateTimeOffset]::Parse([string](Get-Value $authority 'approvedAt' ''));if($approvedAt-gt$now){$authorityReasons.Add('authority approval timestamp is in the future')}}catch{$authorityReasons.Add('authority approvedAt is invalid')}
    try{$expiresAt=[DateTimeOffset]::Parse([string](Get-Value $authority 'expiresAt' ''));if($expiresAt-le$now){$authorityReasons.Add('authority has expired')}}catch{$authorityReasons.Add('authority expiresAt is invalid')}
    if([string]::IsNullOrWhiteSpace([string](Get-Value $authority 'approvalRef' ''))){$authorityReasons.Add('authority approval reference is missing')}
    $maxAge=[int](Get-Value (Get-Value $authority 'requirements' $null) 'maxEvidenceAgeHours' 0)
    if($null-eq$evidenceAt-or$evidenceAt-gt$now-or($now-$evidenceAt).TotalHours-gt$maxAge){$authorityReasons.Add('request evidence is stale for this authority')}
}

$providerReasons=New-Object System.Collections.Generic.List[string]
$canonicalProviderReadinessPath=Join-Path $projectRoot 'state\ad-provider-readiness.json'
if(-not[string]::IsNullOrWhiteSpace($ProviderReadinessPath)-and-not$AllowFixturePaths-and[IO.Path]::GetFullPath($ProviderReadinessPath)-cne[IO.Path]::GetFullPath($canonicalProviderReadinessPath)){throw 'ProviderReadinessPath overrides are permitted only for isolated fixtures.'}
try{$providerReadinessText=& (Join-Path $PSScriptRoot 'Test-AdProviderReadiness.ps1') -ReadinessPath $ProviderReadinessPath -Format Json;$providerReadiness=$providerReadinessText|ConvertFrom-Json}catch{$providerReadiness=$null;$providerReasons.Add(('provider readiness could not be validated: '+$_.Exception.Message))}
$providerReady=$null-ne$providerReadiness
if($providerReady){
    foreach($platform in $platforms){$entry=$providerReadiness.providers.$platform;if($null-eq$entry-or-not[bool]$entry.ready){$providerReady=$false;$providerReasons.Add(("$platform provider is not ready"));if($null-ne$entry){foreach($blocker in @($entry.blockers)){$providerReasons.Add([string]$blocker)}}}}
}
$landingPage=Get-Value $request 'landingPage' $null;$landingMode=[string](Get-Value $landingPage 'mode' '');$deployment=[string](Get-Value $landingPage 'deploymentEnvironment' '')
$artifactReady=-not[string]::IsNullOrWhiteSpace([string](Get-Value $landingPage 'artifactRef' ''))
$destinationReady=-not[string]::IsNullOrWhiteSpace([string](Get-Value $landingPage 'destinationRef' ''))
$deploymentReady=$false
if($null-ne$providerReadiness-and$deployment-in@('staging','production')){$deploymentEntry=$providerReadiness.landingPageDeployment.$deployment;$deploymentReady=$null-ne$deploymentEntry-and[bool]$deploymentEntry.ready;if(-not$deploymentReady-and$landingMode-ne'reuse'){$providerReasons.Add(("$deployment landing-page deployment is not ready"));if($null-ne$deploymentEntry){foreach($blocker in @($deploymentEntry.blockers)){$providerReasons.Add([string]$blocker)}}}}
$landingReady=$destinationReady-and(($landingMode-eq'reuse')-or($artifactReady-and$deploymentReady))
if(-not$landingReady){$providerReasons.Add('landing-page artifact, destination, or deployment readiness is incomplete')}

$validRequest=$reasons.Count-eq0
$authorityActive=$null-ne$authority-and$authorityReasons.Count-eq0
$permissions=if($null-eq$authority){$null}else{Get-Value $authority 'permissions' $null}
$readyForLocalBuild=$validRequest-and$blueprintRoutingReady
$readyForDeploy=$validRequest-and$authorityActive-and$deploymentRoutingReady-and$deploymentReady-and[bool](Get-Value $permissions 'deployLandingPage' $false)
$readyForPausedCreate=$validRequest-and$authorityActive-and$accountRoutingReady-and$deploymentRoutingReady-and$providerReady-and$landingReady-and[bool](Get-Value $permissions 'createPausedObjects' $false)
$readyToEnable=$readyForPausedCreate-and[bool](Get-Value $permissions 'enableCampaigns' $false)
if(-not$validRequest){$status='invalid_request';foreach($reason in $reasons){$gates.Add($reason)}}
elseif(-not$readyForLocalBuild){$status='blocked_for_local_build';foreach($reason in $blueprintReasons){$gates.Add($reason)}}
elseif($readyToEnable){$status='ready_to_enable'}
elseif($readyForPausedCreate){$status='ready_for_paused_create'}
else{$status='ready_for_local_build';foreach($reason in $configReasons){$gates.Add($reason)};foreach($reason in $deploymentConfigReasons){$gates.Add($reason)};foreach($reason in $authorityReasons){$gates.Add($reason)};foreach($reason in $providerReasons){$gates.Add($reason)}}
$result=[pscustomobject][ordered]@{schemaVersion=1;checkedAt=$now.ToString('o');requestId=[string](Get-Value $request 'requestId' '');clientId=$clientId;requestPlatforms=@($platforms);status=$status;validRequest=$validRequest;readyForLocalBuild=$readyForLocalBuild;readyForDeploy=$readyForDeploy;readyForPausedCreate=$readyForPausedCreate;readyToEnable=$readyToEnable;requestReasons=@($reasons);launchConfig=[pscustomobject][ordered]@{path=$LaunchConfigPath;accountRoutingReady=$accountRoutingReady;blueprintRoutingReady=$blueprintRoutingReady;deploymentRoutingReady=$deploymentRoutingReady;reasons=@($configReasons);blueprintReasons=@($blueprintReasons);deploymentReasons=@($deploymentConfigReasons)};authority=[pscustomobject][ordered]@{path=$AuthorityPath;active=$authorityActive;reasons=@($authorityReasons)};provider=[pscustomobject][ordered]@{ready=$providerReady;landingReady=$landingReady;reasons=@($providerReasons)};gates=@($gates)}
if($Format-eq'Json'){$result|ConvertTo-Json -Depth 12}else{"$status | request=$($result.requestId) | gates=$(@($gates).Count)"}
