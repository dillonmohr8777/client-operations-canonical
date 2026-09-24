[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('orchestration', 'research', 'code', 'documents', 'creative', 'multimodal', 'video', 'extraction', 'verification')]
    [string]$TaskLane,

    [ValidateSet('public', 'internal', 'redacted-client', 'sensitive-client')]
    [string]$DataClass = 'internal',

    [ValidateSet('read_only_verification', 'local_research', 'local_draft', 'local_artifact', 'local_test', 'external_delivery', 'publishing', 'deployment', 'spend', 'account_change', 'destructive', 'human_authentication', 'business_decision')]
    [string]$ActionClass = 'local_research',

    [switch]$Consequential,
    [string]$PolicyPath,
    [string]$StatePath,

    [ValidateSet('Json', 'Text')]
    [string]$Format = 'Json'
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..')).TrimEnd('\')
if ([string]::IsNullOrWhiteSpace($PolicyPath)) {
    $PolicyPath = Join-Path $projectRoot 'policies\autonomous-agent-routing-policy.json'
}
if ([string]::IsNullOrWhiteSpace($StatePath)) {
    $StatePath = Join-Path $projectRoot 'state\ai-stack.json'
}
$PolicyPath = [IO.Path]::GetFullPath($PolicyPath)
$StatePath = [IO.Path]::GetFullPath($StatePath)

foreach ($path in @($PolicyPath, $StatePath)) {
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
        throw "Required routing input was not found: $path"
    }
}

$policy = Get-Content -LiteralPath $PolicyPath -Raw -Encoding UTF8 | ConvertFrom-Json
$state = Get-Content -LiteralPath $StatePath -Raw -Encoding UTF8 | ConvertFrom-Json

if ([int]$policy.schemaVersion -ne 1 -or [string]$policy.policyId -ne 'marketing-chief-autonomous-agent-routing') {
    throw 'The autonomous-agent routing policy is unsupported.'
}
if ($state.PSObject.Properties.Name -notcontains 'modelRoutes') {
    throw 'AI stack state does not expose modelRoutes.'
}

$laneMatches = @($policy.lanes | Where-Object { [string]$_.id -ceq $TaskLane })
if ($laneMatches.Count -ne 1) {
    throw "Task lane '$TaskLane' does not resolve exactly once."
}
$lane = $laneMatches[0]

$modelById = @{}
foreach ($model in @($policy.models)) {
    $id = [string]$model.id
    if ($modelById.ContainsKey($id)) { throw "Duplicate policy model ID: $id" }
    $modelById[$id] = $model
}
$stateById = @{}
foreach ($route in @($state.modelRoutes)) {
    $id = [string]$route.id
    if ($stateById.ContainsKey($id)) { throw "Duplicate state route ID: $id" }
    $stateById[$id] = $route
}

$readyStatuses = @('ready', 'healthy')
$selectionTrace = [Collections.Generic.List[object]]::new()

function Select-Route {
    param(
        [Parameter(Mandatory = $true)][string]$Stage,
        [Parameter(Mandatory = $true)][object[]]$Candidates,
        [string]$ExcludeFamily
    )

    foreach ($candidateValue in $Candidates) {
        $candidate = [string]$candidateValue
        $reason = $null
        $model = if ($modelById.ContainsKey($candidate)) { $modelById[$candidate] } else { $null }
        $route = if ($null -ne $model -and $stateById.ContainsKey([string]$model.availabilityKey)) { $stateById[[string]$model.availabilityKey] } else { $null }

        if ($null -eq $model) { $reason = 'missing-policy-model' }
        elseif ($null -eq $route) { $reason = 'missing-live-state' }
        elseif ($DataClass -notin @($model.dataClassesAllowed | ForEach-Object { [string]$_ })) { $reason = 'data-class-not-allowed' }
        elseif (-not [bool]$model.automatic) { $reason = 'interactive-or-human-gated' }
        elseif ([string]$route.status -notin $readyStatuses) { $reason = 'route-not-ready:' + [string]$route.status }
        elseif (-not [string]::IsNullOrWhiteSpace($ExcludeFamily) -and [string]$model.family -eq $ExcludeFamily) { $reason = 'same-family-as-maker' }

        $selectionTrace.Add([pscustomobject][ordered]@{
            stage = $Stage
            candidate = $candidate
            accepted = [string]::IsNullOrWhiteSpace($reason)
            reason = if ([string]::IsNullOrWhiteSpace($reason)) { 'selected' } else { $reason }
        })

        if ([string]::IsNullOrWhiteSpace($reason)) {
            return [pscustomobject][ordered]@{
                id = [string]$model.id
                family = [string]$model.family
                harness = [string]$model.harness
                model = [string]$model.model
                trustClass = [string]$model.trustClass
                stateStatus = [string]$route.status
                verification = [string]$route.verification
            }
        }
    }
    return $null
}

$collector = Select-Route -Stage 'collector' -Candidates @($lane.collector)
$maker = Select-Route -Stage 'maker' -Candidates @($lane.maker)
$makerFamily = if ($null -ne $maker) { [string]$maker.family } else { '' }
$checker = Select-Route -Stage 'checker' -Candidates @($lane.checker) -ExcludeFamily $(if ($Consequential) { $makerFamily } else { '' })
$observer = Select-Route -Stage 'observer' -Candidates @($lane.observer)
$compiler = Select-Route -Stage 'compiler' -Candidates @([string]$policy.authority.coordinator)

$approvalGated = $ActionClass -in @('external_delivery', 'publishing', 'deployment', 'spend', 'account_change', 'destructive', 'human_authentication', 'business_decision')
$problems = [Collections.Generic.List[string]]::new()
if ($null -eq $collector) { $problems.Add('No live-ready collector satisfies the data boundary.') }
if ($null -eq $maker) { $problems.Add('No live-ready maker satisfies the data boundary.') }
if ($null -eq $observer) { $problems.Add('No live-ready observer satisfies the data boundary.') }
if ($null -eq $compiler) { $problems.Add('The Marketing Chief coordinator route is not live-ready.') }
if ($Consequential -and $null -eq $checker) { $problems.Add('Consequential work has no live-ready independent checker from a different model family.') }
elseif ($null -eq $checker) { $problems.Add('No live-ready checker satisfies the data boundary.') }

$interactiveGate = $null
if ($TaskLane -eq 'video') {
    $videoModel = $modelById['seedance-2.5']
    $videoState = $stateById[[string]$videoModel.availabilityKey]
    $interactiveGate = [pscustomobject][ordered]@{
        route = [string]$videoModel.id
        status = [string]$videoState.status
        automatic = [bool]$videoModel.automatic
        humanGate = [string]$videoModel.humanGate
    }
}

$status = if ($problems.Count -gt 0) { 'blocked' } elseif ($approvalGated) { 'approval-required' } else { 'ready' }
$result = [pscustomobject][ordered]@{
    schemaVersion = 1
    resolvedAt = [DateTimeOffset]::UtcNow.ToString('o')
    status = $status
    executionAllowed = ($status -eq 'ready')
    taskLane = $TaskLane
    dataClass = $DataClass
    actionClass = $ActionClass
    consequential = [bool]$Consequential
    authority = [pscustomobject][ordered]@{
        coordinator = [string]$policy.authority.coordinator
        canonicalWriter = [string]$policy.authority.canonicalWriter
        workersMayMutateCanonicalState = [bool]$policy.authority.workersMayMutateCanonicalState
        modelsMayAuthorizeExternalActions = [bool]$policy.authority.modelsMayAuthorizeExternalActions
    }
    routes = [pscustomobject][ordered]@{
        collector = $collector
        maker = $maker
        checker = $checker
        compiler = $compiler
        observer = $observer
    }
    interactiveGate = $interactiveGate
    approvalGate = if ($approvalGated) { "Exact current approval is required for action class '$ActionClass'." } else { 'none' }
    problems = @($problems)
    selectionTrace = @($selectionTrace)
    canonicalWriteAttempted = $false
    externalActionAttempted = $false
    containsSecrets = $false
}

if ($Format -eq 'Json') {
    $result | ConvertTo-Json -Depth 15
}
else {
    $makerId = if ($null -ne $maker) { $maker.id } else { 'none' }
    $checkerId = if ($null -ne $checker) { $checker.id } else { 'none' }
    "status=$status lane=$TaskLane data=$DataClass maker=$makerId checker=$checkerId approval=$($result.approvalGate)"
}

if ($status -eq 'blocked') { exit 1 }
