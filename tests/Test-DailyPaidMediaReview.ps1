$ErrorActionPreference = 'Stop'

function Assert-True {
    param([bool]$Condition, [string]$Message)
    if (-not $Condition) { throw $Message }
    $script:AssertionCount++
}

function Write-Utf8Json {
    param([string]$Path, $Value)
    $directory = Split-Path -Parent $Path
    if (-not (Test-Path -LiteralPath $directory -PathType Container)) { $null = [IO.Directory]::CreateDirectory($directory) }
    [IO.File]::WriteAllText($Path, (($Value | ConvertTo-Json -Depth 20) + "`n"), [Text.UTF8Encoding]::new($false))
}

function Invoke-ReviewGenerator {
    param(
        [string]$ScriptPath,
        [string]$ProjectRoot,
        [string]$RosterPath,
        [string]$RegistryPath,
        [string]$OutputPath,
        [switch]$Check
    )
    $arguments = @(
        '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', $ScriptPath,
        '-Date', '2026-07-16',
        '-ProjectRoot', $ProjectRoot,
        '-RosterPath', $RosterPath,
        '-RegistryPath', $RegistryPath,
        '-OutputPath', $OutputPath
    )
    if ($Check) { $arguments += '-Check' }
    $output = & powershell.exe @arguments 2>&1
    return [pscustomobject]@{ exitCode = $LASTEXITCODE; output = ($output -join "`n") }
}

$script:AssertionCount = 0
$root = Split-Path -Parent $PSScriptRoot
$scriptPath = Join-Path $root 'scripts\Get-DailyPaidMediaReview.ps1'
$schemaPath = Join-Path $root 'schemas\paid-media-roster.schema.json'
$rosterPath = Join-Path $root 'registry\paid-media-roster.json'
$workflowPath = Join-Path $root 'workflows\daily-paid-media-optimization.workflow.json'
$queuePath = Join-Path $root 'queue\work-items.json'

foreach ($path in @($scriptPath, $schemaPath, $rosterPath, $workflowPath, $queuePath)) {
    Assert-True (Test-Path -LiteralPath $path -PathType Leaf) "Missing required file: $path"
}

$tokens = $null
$parseErrors = $null
$null = [Management.Automation.Language.Parser]::ParseFile($scriptPath, [ref]$tokens, [ref]$parseErrors)
Assert-True (@($parseErrors).Count -eq 0) ('PowerShell parser errors: ' + (@($parseErrors | ForEach-Object Message) -join '; '))

$schema = Get-Content -LiteralPath $schemaPath -Raw -Encoding UTF8 | ConvertFrom-Json
$roster = Get-Content -LiteralPath $rosterPath -Raw -Encoding UTF8 | ConvertFrom-Json
$workflow = Get-Content -LiteralPath $workflowPath -Raw -Encoding UTF8 | ConvertFrom-Json
Assert-True ([int]$schema.properties.schemaVersion.const -eq 1) 'Roster schema version contract is missing.'
Assert-True ([int]$schema.properties.lanes.minItems -eq 8 -and [int]$schema.properties.lanes.maxItems -eq 8) 'Roster schema must require exactly eight lanes.'
Assert-True ([int]$roster.schemaVersion -eq 1) 'Roster schemaVersion must be 1.'
Assert-True ([string]$roster.timezone -eq 'America/New_York') 'Roster timezone must be America/New_York.'
Assert-True (@($roster.lanes).Count -eq 8) 'Roster must contain exactly eight lanes.'
Assert-True (@($roster.lanes | Group-Object laneId | Where-Object Count -gt 1).Count -eq 0) 'Roster lane IDs must be unique.'
Assert-True (@($roster.lanes | Group-Object clientId, platform | Where-Object Count -gt 1).Count -eq 0) 'Client-platform routes must be unique.'
Assert-True (@($roster.lanes | Where-Object { -not $_.active }).Count -eq 0) 'Every roster lane must be active.'
Assert-True (@($roster.lanes | Where-Object { [string]$_.metricsPolicy -ne 'historical-observations-never-authority' }).Count -eq 0) 'Historical metrics must never be authority.'
Assert-True (@($roster.lanes | Where-Object platform -eq 'google-ads').Count -eq 5) 'Exactly five Google Ads lanes are required.'
Assert-True (@($roster.lanes | Where-Object platform -eq 'meta-ads').Count -eq 3) 'Exactly three Meta Ads lanes are required.'
Assert-True (@($workflow.exactLanes).Count -eq 8) 'Workflow must enumerate exactly eight lanes.'
Assert-True ([bool]$workflow.authority.externalMutationRequiresExactActiveAuthority) 'Workflow must require exact active authority for external mutation.'
Assert-True (-not [bool]$workflow.authority.manifestGeneratorCallsProviders) 'Manifest generator provider calls must be forbidden.'
Assert-True (-not [bool]$workflow.authority.manifestGeneratorMutatesCanonicalQueue) 'Manifest generator queue mutation must be forbidden.'

$freshLane = @($roster.lanes | Where-Object laneId -eq 'google-ads--fresh-blends-kwik-trip')
Assert-True ($freshLane.Count -eq 1) 'Fresh Blends Google Ads lane is missing.'
Assert-True ([string]$freshLane[0].expectedDeliveryState -eq 'paused-unless-live-readback') 'Fresh Blends lane must remain paused until fresh live readback proves otherwise.'
Assert-True ([string]$freshLane[0].currentStateNote -match '#1110' -and [string]$freshLane[0].currentStateNote -match '#633') 'Fresh Blends paused campaign observations are incomplete.'
Assert-True ([string]$freshLane[0].currentStateNote -match 'separate' -or [string]$freshLane[0].currentStateNote -match 'blending') 'Fresh Blends and Replenish separation is not explicit.'
$kjbGoogle = @($roster.lanes | Where-Object laneId -eq 'google-ads--kimberly-james-bridal')[0]
$kjbMeta = @($roster.lanes | Where-Object laneId -eq 'meta-ads--kimberly-james-bridal')[0]
Assert-True ([string]$kjbGoogle.expectedDeliveryState -eq 'active') 'KJB Google lane must reflect the current live enabled readback.'
Assert-True ([string]$kjbGoogle.currentStateNote -match 'cancelled duplicate') 'KJB Google lane must exclude the cancelled duplicate account.'
Assert-True ([string]$kjbGoogle.currentStateNote -match 'zero conversions') 'KJB Google lane must preserve the live zero-conversion finding.'
Assert-True ([string]$kjbMeta.expectedDeliveryState -eq 'active') 'KJB Meta lane must remain distinct and active.'
Assert-True ([string]$kjbMeta.currentStateNote -match 'Website Carousel Traffic' -and [string]$kjbMeta.currentStateNote -match 'Leads carousel') 'KJB Meta live campaign-state evidence is incomplete.'
$faganMeta = @($roster.lanes | Where-Object laneId -eq 'meta-ads--fagan-painting')[0]
Assert-True ([string]$faganMeta.currentStateNote -match 'six campaigns' -and [string]$faganMeta.currentStateNote -match 'draft') 'Fagan Meta live account evidence is incomplete.'

$temporaryRoot = Join-Path ([IO.Path]::GetTempPath()) ('codex-paid-media-review-' + [guid]::NewGuid().ToString('N'))
$fixtureRegistryPath = Join-Path $temporaryRoot 'registry\clients.json'
$missingOnsiteRegistryPath = Join-Path $temporaryRoot 'registry\clients-missing-onsite.json'
$outputPath = Join-Path $temporaryRoot 'state\paid-media\daily-review-2026-07-16.json'
$outputMissingOnsitePath = Join-Path $temporaryRoot 'state\paid-media\daily-review-missing-onsite-2026-07-16.json'
$queueHashBefore = (Get-FileHash -LiteralPath $queuePath -Algorithm SHA256).Hash

try {
    $fixtureClients = @($roster.lanes | Select-Object -ExpandProperty clientId -Unique | ForEach-Object {
        [pscustomobject][ordered]@{ id = [string]$_; status = 'active'; folder = ('clients/' + [string]$_) }
    })
    $fixtureRegistry = [pscustomobject][ordered]@{ schemaVersion = 1; clients = $fixtureClients }
    Write-Utf8Json $fixtureRegistryPath $fixtureRegistry

    $firstRun = Invoke-ReviewGenerator $scriptPath $temporaryRoot $rosterPath $fixtureRegistryPath $outputPath
    Assert-True ($firstRun.exitCode -eq 0) "Generator crashed on missing configs: $($firstRun.output)"
    Assert-True (Test-Path -LiteralPath $outputPath -PathType Leaf) 'Generator did not write the daily manifest.'
    $manifest = Get-Content -LiteralPath $outputPath -Raw -Encoding UTF8 | ConvertFrom-Json
    Assert-True ([string]$manifest.status -eq 'blocked-fail-closed') 'Missing configs must block the manifest closed.'
    Assert-True ([int]$manifest.summary.laneCount -eq 8) 'Manifest must retain all eight lanes when configs are missing.'
    Assert-True ([int]$manifest.summary.blockedLaneCount -eq 8) 'All isolated fixture lanes should be blocked by missing configs.'
    Assert-True (@($manifest.lanes | Where-Object { $_.blockers -notcontains 'paid-media-config-missing' }).Count -eq 0) 'Missing configs must be reported per lane without a crash.'
    Assert-True (@($manifest.lanes | Where-Object { $_.routeState.clientRegistry -ne 'active-exact' }).Count -eq 0) 'Fixture client routes should resolve exactly.'
    Assert-True (-not [bool]$manifest.policy.providerCallsAttempted) 'Manifest must attest that no provider call was attempted.'
    Assert-True (-not [bool]$manifest.policy.canonicalQueueMutationAttempted) 'Manifest must attest that no queue mutation was attempted.'
    Assert-True (-not [bool]$manifest.policy.externalActionAttempted) 'Manifest must attest that no external action was attempted.'
    Assert-True ([int]$manifest.materialFindingCandidateContract.contractVersion -eq 1) 'Material-finding candidate contract is missing.'
    Assert-True (-not [bool]$manifest.materialFindingCandidateContract.manifestGeneratorMayMutateQueue) 'Candidate contract must forbid generator queue writes.'
    $expectedChecks = @('session_account', 'delivery_pacing', 'conversion_tracking_dedup', 'landing_page_health', 'change_history', 'budget_recommendation', 'readback_freshness')
    foreach ($lane in @($manifest.lanes)) {
        foreach ($checkId in $expectedChecks) {
            Assert-True (@($lane.checks | Where-Object id -eq $checkId).Count -eq 1) "Missing $checkId check for $($lane.laneId)."
        }
        $channelCheck = if ([string]$lane.platform -eq 'google-ads') { 'search-terms-and-negatives' } else { 'creative-fatigue-and-placements' }
        Assert-True (@($lane.checks | Where-Object id -eq $channelCheck).Count -eq 1) "Missing channel-specific check for $($lane.laneId)."
        Assert-True (@($lane.checks | Where-Object providerMutationAllowed).Count -eq 0) "A review check permits provider mutation: $($lane.laneId)."
    }

    $firstHash = (Get-FileHash -LiteralPath $outputPath -Algorithm SHA256).Hash
    $secondRun = Invoke-ReviewGenerator $scriptPath $temporaryRoot $rosterPath $fixtureRegistryPath $outputPath
    Assert-True ($secondRun.exitCode -eq 0) "Second deterministic generation failed: $($secondRun.output)"
    $secondHash = (Get-FileHash -LiteralPath $outputPath -Algorithm SHA256).Hash
    Assert-True ($firstHash -eq $secondHash) 'Same-date manifest generation is not deterministic.'
    $checkRun = Invoke-ReviewGenerator $scriptPath $temporaryRoot $rosterPath $fixtureRegistryPath $outputPath -Check
    Assert-True ($checkRun.exitCode -eq 0) "Check mode did not accept the deterministic manifest: $($checkRun.output)"
    $checkResult = $checkRun.output | ConvertFrom-Json
    Assert-True ([string]$checkResult.status -eq 'current') 'Check mode did not report current.'

    $missingOnsiteRegistry = [pscustomobject][ordered]@{
        schemaVersion = 1
        clients = @($fixtureClients | Where-Object id -ne 'onsite-concrete-landscape')
    }
    Write-Utf8Json $missingOnsiteRegistryPath $missingOnsiteRegistry
    $missingOnsiteRun = Invoke-ReviewGenerator $scriptPath $temporaryRoot $rosterPath $missingOnsiteRegistryPath $outputMissingOnsitePath
    Assert-True ($missingOnsiteRun.exitCode -eq 0) "Missing Onsite route caused a crash: $($missingOnsiteRun.output)"
    $missingOnsiteManifest = Get-Content -LiteralPath $outputMissingOnsitePath -Raw -Encoding UTF8 | ConvertFrom-Json
    $onsiteLane = @($missingOnsiteManifest.lanes | Where-Object laneId -eq 'google-ads--onsite-concrete-landscape')
    Assert-True ($onsiteLane.Count -eq 1) 'Missing Onsite registry route removed the required lane.'
    Assert-True ($onsiteLane[0].blockers -contains 'client-route-not-exactly-one') 'Missing Onsite registry route did not fail closed.'
    Assert-True ([string]$onsiteLane[0].routeState.reviewEligibility -eq 'blocked-fail-closed') 'Missing Onsite route did not block review eligibility.'

    $queueHashAfter = (Get-FileHash -LiteralPath $queuePath -Algorithm SHA256).Hash
    Assert-True ($queueHashBefore -eq $queueHashAfter) 'Daily paid-media generator mutated the canonical queue.'
} finally {
    if (Test-Path -LiteralPath $temporaryRoot) { Remove-Item -LiteralPath $temporaryRoot -Recurse -Force }
}

[pscustomobject][ordered]@{
    status = 'passed'
    assertions = $script:AssertionCount
    rosterLanes = 8
    googleAdsLanes = 5
    metaAdsLanes = 3
    queueMutationAttempted = $false
    providerCallsAttempted = $false
    externalActionAttempted = $false
} | ConvertTo-Json
