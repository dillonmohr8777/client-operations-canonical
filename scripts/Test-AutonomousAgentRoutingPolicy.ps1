[CmdletBinding()]
param(
    [string]$ProjectRoot,
    [ValidateSet('Json', 'Text')]
    [string]$Format = 'Text'
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

if ([string]::IsNullOrWhiteSpace($ProjectRoot)) { $ProjectRoot = Join-Path $PSScriptRoot '..' }
$ProjectRoot = [IO.Path]::GetFullPath($ProjectRoot).TrimEnd('\')
$policyPath = Join-Path $ProjectRoot 'policies\autonomous-agent-routing-policy.json'
$schemaPath = Join-Path $ProjectRoot 'schemas\autonomous-agent-routing-policy.schema.json'
$workflowPath = Join-Path $ProjectRoot 'workflows\autonomous-agent-compounding.workflow.json'
$statePath = Join-Path $ProjectRoot 'state\ai-stack.json'
$resolverPath = Join-Path $ProjectRoot 'scripts\Resolve-AutonomousAgentRoute.ps1'

$checks = [Collections.Generic.List[object]]::new()
$failed = $false
function Add-Check {
    param([string]$Name, [bool]$Passed, [string]$Detail)
    $script:checks.Add([pscustomobject][ordered]@{ name = $Name; passed = $Passed; detail = $Detail })
    if (-not $Passed) { $script:failed = $true }
}

foreach ($path in @($policyPath, $schemaPath, $workflowPath, $statePath, $resolverPath)) {
    Add-Check ('file:' + [IO.Path]::GetFileName($path)) (Test-Path -LiteralPath $path -PathType Leaf) $path
}
if ($failed) {
    $result = [pscustomobject][ordered]@{ schemaVersion = 1; ready = $false; checks = @($checks); containsSecrets = $false }
    if ($Format -eq 'Json') { $result | ConvertTo-Json -Depth 10 } else { "INVALID missing required routing files" }
    exit 1
}

try {
    $policy = Get-Content -LiteralPath $policyPath -Raw -Encoding UTF8 | ConvertFrom-Json
    $schema = Get-Content -LiteralPath $schemaPath -Raw -Encoding UTF8 | ConvertFrom-Json
    $workflow = Get-Content -LiteralPath $workflowPath -Raw -Encoding UTF8 | ConvertFrom-Json
    $state = Get-Content -LiteralPath $statePath -Raw -Encoding UTF8 | ConvertFrom-Json
    Add-Check 'json:parse' $true 'policy, schema, workflow, and state parsed'
}
catch {
    Add-Check 'json:parse' $false $_.Exception.Message
    $result = [pscustomobject][ordered]@{ schemaVersion = 1; ready = $false; checks = @($checks); containsSecrets = $false }
    if ($Format -eq 'Json') { $result | ConvertTo-Json -Depth 10 } else { "INVALID JSON parse failure" }
    exit 1
}

Add-Check 'policy:identity' ([int]$policy.schemaVersion -eq 1 -and [string]$policy.policyId -eq 'marketing-chief-autonomous-agent-routing' -and [string]$policy.status -eq 'active') ([string]$policy.policyId)
Add-Check 'schema:identity' ([string]$schema.'$id' -eq 'autonomous-agent-routing-policy.schema.json') ([string]$schema.'$id')
Add-Check 'workflow:identity' ([int]$workflow.schemaVersion -eq 1 -and [string]$workflow.workflowId -eq 'autonomous-agent-compounding') ([string]$workflow.workflowId)

$modelIds = @($policy.models | ForEach-Object { [string]$_.id })
$routeIds = @($state.modelRoutes | ForEach-Object { [string]$_.id })
$laneIds = @($policy.lanes | ForEach-Object { [string]$_.id })
Add-Check 'models:unique' (@($modelIds | Group-Object | Where-Object Count -gt 1).Count -eq 0) ("count={0}" -f $modelIds.Count)
Add-Check 'state-routes:unique' (@($routeIds | Group-Object | Where-Object Count -gt 1).Count -eq 0) ("count={0}" -f $routeIds.Count)
Add-Check 'lanes:unique' (@($laneIds | Group-Object | Where-Object Count -gt 1).Count -eq 0) ("count={0}" -f $laneIds.Count)

$missingState = @($policy.models | Where-Object { [string]$_.availabilityKey -notin $routeIds } | ForEach-Object { [string]$_.id })
Add-Check 'models:state-coverage' ($missingState.Count -eq 0) ("missing={0}" -f ($missingState -join ','))

$unknownCandidates = [Collections.Generic.List[string]]::new()
foreach ($lane in @($policy.lanes)) {
    foreach ($stage in @('collector', 'maker', 'checker', 'observer')) {
        foreach ($candidate in @($lane.$stage)) {
            if ([string]$candidate -notin $modelIds) { $unknownCandidates.Add("$($lane.id):${stage}:$candidate") }
        }
    }
}
Add-Check 'lanes:model-references' ($unknownCandidates.Count -eq 0) ("unknown={0}" -f ($unknownCandidates -join ','))

$authorityValid = [string]$policy.authority.coordinator -eq 'gpt-5.6-sol' -and
    [string]$policy.authority.canonicalWriter -eq 'marketing-chief' -and
    -not [bool]$policy.authority.workersMayMutateCanonicalState -and
    -not [bool]$policy.authority.modelsMayAuthorizeExternalActions -and
    [bool]$policy.authority.consequentialWorkRequiresIndependentChecker
Add-Check 'authority:fail-closed' $authorityValid 'Marketing Chief is the sole canonical writer; models cannot authorize external actions'

$unsafeFreeModels = @($policy.models | Where-Object {
    [string]$_.trustClass -in @('public-free', 'interactive-external') -and
    'sensitive-client' -in @($_.dataClassesAllowed | ForEach-Object { [string]$_ })
})
Add-Check 'data-boundary:free-routes' ($unsafeFreeModels.Count -eq 0) ("unsafe={0}" -f (@($unsafeFreeModels | ForEach-Object { [string]$_.id }) -join ','))

$seedance = @($policy.models | Where-Object { [string]$_.id -eq 'seedance-2.5' })
$seedanceSafe = $seedance.Count -eq 1 -and -not [bool]$seedance[0].automatic -and [string]$seedance[0].executionMode -eq 'interactive-generator'
Add-Check 'video:human-gated' $seedanceSafe 'Seedance cannot be selected for autonomous execution'

$expectedStages = @('capture', 'verify', 'compile', 'decide', 'execute', 'observe', 'learn')
Add-Check 'compounding:stage-order' ((@($policy.compounding.stages) -join '|') -eq ($expectedStages -join '|')) (@($policy.compounding.stages) -join ' -> ')
Add-Check 'compounding:bounded-learning' ([int]$policy.compounding.dailyCanonicalChangeLimit -eq 1 -and [bool]$policy.compounding.sourceEvidenceNeverEqualsCanonicalTruth) 'one canonical improvement per daily loop'

$scenarios = @(
    [pscustomobject]@{ Lane = 'code'; Data = 'sensitive-client'; Action = 'local_test'; Consequential = $true },
    [pscustomobject]@{ Lane = 'research'; Data = 'public'; Action = 'local_research'; Consequential = $true },
    [pscustomobject]@{ Lane = 'extraction'; Data = 'sensitive-client'; Action = 'local_artifact'; Consequential = $false },
    [pscustomobject]@{ Lane = 'creative'; Data = 'redacted-client'; Action = 'local_draft'; Consequential = $true },
    [pscustomobject]@{ Lane = 'video'; Data = 'redacted-client'; Action = 'publishing'; Consequential = $true }
)
foreach ($scenario in $scenarios) {
    $arguments = @(
        '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', $resolverPath,
        '-TaskLane', $scenario.Lane,
        '-DataClass', $scenario.Data,
        '-ActionClass', $scenario.Action,
        '-Format', 'Json'
    )
    if ($scenario.Consequential) { $arguments += '-Consequential' }
    $json = & powershell.exe @arguments
    $exitCode = $LASTEXITCODE
    try { $resolved = ($json -join [Environment]::NewLine) | ConvertFrom-Json } catch { $resolved = $null }
    $scenarioName = "resolve:$($scenario.Lane):$($scenario.Data)"
    $parsed = $null -ne $resolved
    Add-Check ($scenarioName + ':parse') $parsed ("exit={0}" -f $exitCode)
    if ($parsed) {
        $makerFamily = [string]$resolved.routes.maker.family
        $checkerFamily = [string]$resolved.routes.checker.family
        $independent = -not $scenario.Consequential -or (-not [string]::IsNullOrWhiteSpace($makerFamily) -and -not [string]::IsNullOrWhiteSpace($checkerFamily) -and $makerFamily -ne $checkerFamily)
        Add-Check ($scenarioName + ':independent') $independent ("maker={0};checker={1}" -f $makerFamily, $checkerFamily)
        $blockedRouteSelected = @($resolved.routes.PSObject.Properties.Value | Where-Object { $null -ne $_ -and [string]$_.stateStatus -notin @('ready', 'healthy') }).Count -gt 0
        Add-Check ($scenarioName + ':live-ready-only') (-not $blockedRouteSelected) ([string]$resolved.status)
        if ($scenario.Action -eq 'publishing') {
            Add-Check ($scenarioName + ':approval-gate') ([string]$resolved.status -eq 'approval-required' -and -not [bool]$resolved.executionAllowed) ([string]$resolved.approvalGate)
        }
    }
}

$expectedBlockedScenarios = @(
    [pscustomobject]@{ Lane = 'creative'; Data = 'sensitive-client' },
    [pscustomobject]@{ Lane = 'multimodal'; Data = 'sensitive-client' },
    [pscustomobject]@{ Lane = 'video'; Data = 'sensitive-client' }
)
foreach ($scenario in $expectedBlockedScenarios) {
    $arguments = @(
        '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', $resolverPath,
        '-TaskLane', $scenario.Lane,
        '-DataClass', $scenario.Data,
        '-ActionClass', 'local_test',
        '-Consequential',
        '-Format', 'Json'
    )
    $json = & powershell.exe @arguments
    $exitCode = $LASTEXITCODE
    try { $resolved = ($json -join [Environment]::NewLine) | ConvertFrom-Json } catch { $resolved = $null }
    $passed = $exitCode -eq 1 -and $null -ne $resolved -and [string]$resolved.status -eq 'blocked' -and -not [bool]$resolved.executionAllowed
    Add-Check ("fail-closed:$($scenario.Lane):$($scenario.Data)") $passed $(if ($null -ne $resolved) { [string]$resolved.status } else { 'invalid-json' })
}

$result = [pscustomobject][ordered]@{
    schemaVersion = 1
    checkedAt = [DateTimeOffset]::UtcNow.ToString('o')
    ready = (-not $failed)
    checkCount = $checks.Count
    failureCount = @($checks | Where-Object { -not $_.passed }).Count
    checks = @($checks)
    containsSecrets = $false
    canonicalWriteAttempted = $false
    externalActionAttempted = $false
}

if ($Format -eq 'Json') {
    $result | ConvertTo-Json -Depth 12
}
else {
    if ($result.ready) { "VALID autonomous-agent routing checks=$($result.checkCount)" }
    else { "INVALID autonomous-agent routing failures=$($result.failureCount)" }
}
if ($failed) { exit 1 }
