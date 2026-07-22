[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^wi-[A-Za-z0-9-]+$')]
    [string]$WorkItemId,
    [Parameter(Mandatory = $true)]
    [ValidateRange(0, 2147483647)]
    [int]$ExpectedQueueRevision,
    [Parameter(Mandatory = $true)]
    [ValidateRange(1, 2147483647)]
    [int]$ExpectedWorkItemVersion,
    [ValidatePattern('^mgr-[A-Za-z0-9][A-Za-z0-9_-]{7,151}$')]
    [string]$GraphRunId,
    [string]$ProjectRoot,
    [string]$QueuePath,
    [string]$RegistryPath,
    [string]$WorkflowPath,
    [string]$OutputRoot,
    [string]$AsOf,
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'MarketingOs.Common.ps1')

if ([string]::IsNullOrWhiteSpace($ProjectRoot)) { $ProjectRoot = Join-Path $PSScriptRoot '..' }
$ProjectRoot = [IO.Path]::GetFullPath($ProjectRoot).TrimEnd('\')
if ([string]::IsNullOrWhiteSpace($QueuePath)) { $QueuePath = Join-Path $ProjectRoot 'queue\work-items.json' }
if ([string]::IsNullOrWhiteSpace($RegistryPath)) { $RegistryPath = Join-Path $ProjectRoot 'registry\clients.json' }
if ([string]::IsNullOrWhiteSpace($WorkflowPath)) { $WorkflowPath = Join-Path $ProjectRoot 'workflows\marketing-chief-execution-graph.workflow.json' }
if ([string]::IsNullOrWhiteSpace($OutputRoot)) { $OutputRoot = Join-Path $ProjectRoot 'state\execution-graphs' }

$QueuePath = [IO.Path]::GetFullPath($QueuePath)
$RegistryPath = [IO.Path]::GetFullPath($RegistryPath)
$WorkflowPath = [IO.Path]::GetFullPath($WorkflowPath)
$OutputRoot = [IO.Path]::GetFullPath($OutputRoot).TrimEnd('\')
$projectPrefix = $ProjectRoot + '\'
if (-not $OutputRoot.StartsWith($projectPrefix, [StringComparison]::OrdinalIgnoreCase)) { throw 'Execution graph output root must stay inside the project.' }

foreach ($requiredPath in @($QueuePath, $RegistryPath, $WorkflowPath)) {
    if (-not (Test-Path -LiteralPath $requiredPath -PathType Leaf)) { throw "Required graph source is missing: $requiredPath" }
}

function Convert-ToLocator {
    param([Parameter(Mandatory = $true)][string]$Path)
    $full = [IO.Path]::GetFullPath($Path)
    if (-not $full.StartsWith($projectPrefix, [StringComparison]::OrdinalIgnoreCase)) { throw 'Path is outside the project.' }
    return $full.Substring($projectPrefix.Length).Replace('\', '/')
}

function Get-PropertyValue {
    param($Object, [string]$Name, $Default = $null)
    if ($null -ne $Object -and $Object.PSObject.Properties.Name -contains $Name) { return $Object.$Name }
    return $Default
}

function Test-FreshDate {
    param($Value, [DateTimeOffset]$Now, [int]$Days = 14)
    try {
        $date = [DateTimeOffset]::Parse([string]$Value)
        return $date -le $Now -and ($Now - $date).TotalDays -le $Days
    }
    catch { return $false }
}

function Get-ShortHash {
    param([string]$Value)
    return (Get-MarketingTextSha256 $Value).Substring(0, 16).ToLowerInvariant()
}

function Assert-SafeTextValue {
    param([AllowNull()][string]$Value, [string]$Name, [int]$MaxLength = 4000)
    if ($null -ne $Value -and $Value.Length -gt $MaxLength) { throw "$Name exceeds $MaxLength characters." }
    if (-not (Test-MarketingSafeText $Value)) { throw "$Name contains unsafe, secret, direct-identifier, or raw-communication material." }
}

function Assert-SafeLocatorValue {
    param([string]$Value, [string]$Name, [string]$ClientRoot, [switch]$RequireClientScope)
    if (-not (Test-MarketingSafeLocator $Value)) { throw "$Name contains an unsafe locator." }
    if ($Value -match '^clients/' -and -not $Value.StartsWith(($ClientRoot + '/'), [StringComparison]::OrdinalIgnoreCase) -and $Value -ne $ClientRoot) {
        throw "$Name crosses the exact client boundary."
    }
    if ($RequireClientScope -and -not $Value.StartsWith(($ClientRoot + '/'), [StringComparison]::OrdinalIgnoreCase) -and $Value -ne $ClientRoot) {
        throw "$Name must stay inside the exact client folder."
    }
}

$now = if ([string]::IsNullOrWhiteSpace($AsOf)) { [DateTimeOffset]::UtcNow } else { [DateTimeOffset]::Parse($AsOf) }
$nowText = $now.ToString('o')
if ([string]::IsNullOrWhiteSpace($GraphRunId)) {
    $GraphRunId = 'mgr-{0}-{1}-{2}' -f $now.ToString('yyyyMMddTHHmmssZ'), $WorkItemId, ([guid]::NewGuid().ToString('N').Substring(0, 8))
}
if ($GraphRunId -notmatch '^mgr-[A-Za-z0-9][A-Za-z0-9_-]{7,151}$') { throw 'GraphRunId is not a safe graph slug.' }

$workflow = Get-Content -LiteralPath $WorkflowPath -Raw -Encoding UTF8 | ConvertFrom-Json
if ([int]$workflow.schemaVersion -ne 1 -or [string]$workflow.workflowId -ne 'marketing-chief-execution-graph') { throw 'Unsupported execution graph workflow contract.' }

$queueRaw = [IO.File]::ReadAllText($QueuePath, [Text.UTF8Encoding]::new($false))
$queue = $queueRaw | ConvertFrom-Json
if ([int]$queue.revision -ne $ExpectedQueueRevision) { throw "Stale queue revision. Expected $ExpectedQueueRevision; current is $($queue.revision)." }
$matches = @($queue.workItems | Where-Object { [string]$_.id -eq $WorkItemId })
if ($matches.Count -ne 1) { throw 'Work item must resolve exactly once.' }
$item = $matches[0]
if ([int]$item.version -ne $ExpectedWorkItemVersion) { throw "Stale work-item version. Expected $ExpectedWorkItemVersion; current is $($item.version)." }

$registry = Get-Content -LiteralPath $RegistryPath -Raw -Encoding UTF8 | ConvertFrom-Json
$clientId = [string]$item.clientId
$clients = @($registry.clients | Where-Object { [string]$_.id -eq $clientId -and [string]$_.status -eq 'active' })
if ($clients.Count -ne 1) { throw 'Execution graph requires one exact active client route.' }
$clientRoot = 'clients/' + $clientId
$clientRootPath = [IO.Path]::GetFullPath((Join-Path $ProjectRoot ($clientRoot.Replace('/', '\')))).TrimEnd('\')

foreach ($field in @(
    @{ name = 'work item title'; value = [string]$item.title; max = 300 },
    @{ name = 'requested outcome'; value = [string]$item.requestedOutcome; max = 4000 },
    @{ name = 'next action'; value = [string]$item.nextAction; max = 3000 },
    @{ name = 'priority rationale'; value = [string]$item.priority.rationale; max = 2000 }
)) { Assert-SafeTextValue -Value $field.value -Name $field.name -MaxLength $field.max }

$definitionOfDone = @($item.definitionOfDone)
if ($definitionOfDone.Count -lt 1 -or $definitionOfDone.Count -gt 10) { throw 'Execution graph requires 1 to 10 definition-of-done checks.' }
foreach ($check in $definitionOfDone) { Assert-SafeTextValue -Value ([string]$check) -Name 'definition of done' -MaxLength 1000 }

$sourceLocator = [string]$item.source.locator
Assert-SafeLocatorValue -Value $sourceLocator -Name 'source locator' -ClientRoot $clientRoot
$evidenceRefs = @($item.evidence.refs | ForEach-Object { [string]$_ } | Select-Object -Unique)
$artifactRefs = @($item.artifactRefs | ForEach-Object { [string]$_ } | Select-Object -Unique)
$dependencies = @($item.dependencies | ForEach-Object { [string]$_ } | Select-Object -Unique)
foreach ($locator in $evidenceRefs) { Assert-SafeLocatorValue -Value $locator -Name 'evidence reference' -ClientRoot $clientRoot }
foreach ($locator in $artifactRefs) { Assert-SafeLocatorValue -Value $locator -Name 'artifact reference' -ClientRoot $clientRoot -RequireClientScope }
foreach ($dependency in $dependencies) {
    if ($dependency -notmatch '^wi-[A-Za-z0-9-]+$' -and -not (Test-MarketingSafeLocator $dependency)) { throw 'Dependency is neither a safe work-item ID nor a safe locator.' }
}

$warnings = New-Object System.Collections.Generic.List[string]
foreach ($artifact in $artifactRefs) {
    $artifactPath = [IO.Path]::GetFullPath((Join-Path $ProjectRoot ($artifact.Replace('/', '\'))))
    $clientPrefix = $clientRootPath + '\'
    if (-not $artifactPath.StartsWith($clientPrefix, [StringComparison]::OrdinalIgnoreCase) -and $artifactPath -ne $clientRootPath) { throw 'Artifact reference escapes the exact client folder.' }
    if (-not (Test-Path -LiteralPath $artifactPath)) { $warnings.Add("Artifact is not currently present: $artifact") }
}

$routing = $item.routing
$routeValid = [string]$routing.status -eq 'resolved' -and [string]$routing.registryStatus -eq 'active'
if (-not $routeValid) { throw 'Work-item routing is not exactly resolved and active.' }
$routingFresh = Test-FreshDate -Value $routing.verifiedAt -Now $now
$evidenceFresh = [string]$item.evidence.freshness -eq 'current' -and (Test-FreshDate -Value $item.evidence.asOf -Now $now)
$actionClass = [string]$item.execution.actionClass
$automaticClass = Test-MarketingAutomaticActionClass $actionClass
$externalAction = [bool](Get-PropertyValue $item.execution 'externalAction' $true)
$reversible = [bool](Get-PropertyValue $item.execution 'reversible' $false)
$approvalTier = [string]$item.approval.tier
$approvalStatus = [string]$item.approval.status
$approvalGate = if ($actionClass -eq 'human_authentication') { 'human_authentication' } elseif ($approvalTier -eq 'explicit' -or -not $automaticClass) { 'explicit' } else { 'none' }
$automaticEligible = $automaticClass -and [bool]$item.execution.automaticEligible -and -not $externalAction -and $reversible -and $approvalTier -eq 'automatic' -and $approvalStatus -eq 'not_required' -and -not (Test-MarketingRiskyActionText ([string]$item.nextAction)
)

$blockers = New-Object System.Collections.Generic.List[string]
if (-not $routingFresh) { $blockers.Add('Routing verification is older than 14 days or invalid.') }
if ($evidenceRefs.Count -lt 1) { $blockers.Add('At least one exact evidence reference is required.') }
if (-not $evidenceFresh) { $blockers.Add('Evidence is stale or invalid.') }
if ($approvalGate -ne 'none') { $blockers.Add("Execution remains behind the $approvalGate approval gate.") }
if ([string]$item.status -in @('blocked', 'deferred', 'done', 'cancelled')) { $blockers.Add("Work-item status $($item.status) is not eligible for a new execution run.") }
if ($approvalGate -eq 'none' -and -not $automaticEligible) { $blockers.Add('Automatic execution eligibility is not fully satisfied.') }

$graphDirectory = Resolve-MarketingChildPath -Root $OutputRoot -Child (Join-Path $WorkItemId $GraphRunId)
$graphPath = Join-Path $graphDirectory 'execution-graph.json'
$summaryPath = Join-Path $graphDirectory 'summary.md'
$graphLocator = Convert-ToLocator $graphPath

$nodeList = New-Object System.Collections.Generic.List[object]
function Add-ExecutionNode {
    param(
        [string]$Id,
        [string]$Kind,
        [string]$Owner,
        [string]$Status,
        [string]$Task,
        [string[]]$Requires,
        [string[]]$Produces,
        [string]$Gate = 'none',
        $Output = $null
    )
    $nodeList.Add([pscustomobject][ordered]@{
        id = $Id
        kind = $Kind
        owner = $Owner
        status = $Status
        task = $Task
        requires = @($Requires)
        produces = @($Produces)
        attempts = 0
        maxAttempts = 3
        approvalGate = $Gate
        output = $Output
    })
}

$preflightOutput = [pscustomobject][ordered]@{
    summary = 'Queue revision, work-item version, exact client route, and safety scope were validated.'
    artifacts = @()
    evidence = @('queue/work-items.json', $sourceLocator) | Select-Object -Unique
    verification = @(
        "Queue revision $ExpectedQueueRevision captured.",
        "Work-item version $ExpectedWorkItemVersion captured.",
        "Client route $clientId resolved exactly once and is active."
    )
}
Add-ExecutionNode -Id 'scope-guard' -Kind 'scope_guard' -Owner 'graph-generator' -Status 'completed' -Task 'Validate immutable queue, work-item, client, and project scope.' -Requires @() -Produces @('scoped_work_item') -Output $preflightOutput

$sourceStatus = if ($evidenceRefs.Count -gt 0 -and $evidenceFresh) { 'completed' } else { 'blocked' }
$sourceOutput = [pscustomobject][ordered]@{
    summary = if ($sourceStatus -eq 'completed') { 'Exact source and evidence locators were captured without raw communications.' } else { 'Source evidence is missing or stale.' }
    artifacts = @()
    evidence = @(@($sourceLocator) + $evidenceRefs | Select-Object -Unique)
    verification = @("Evidence freshness evaluated at $nowText.")
}
Add-ExecutionNode -Id 'source-intake' -Kind 'source_intake' -Owner 'graph-generator' -Status $sourceStatus -Task 'Capture safe exact source and evidence locators.' -Requires @('scope-guard') -Produces @('provenance_slice') -Output $sourceOutput

$contextStatus = if ($sourceStatus -eq 'completed') { 'completed' } else { 'blocked' }
$contextOutput = [pscustomobject][ordered]@{
    summary = 'Bounded client, source, artifact, dependency, and definition-of-done context was assembled.'
    artifacts = @($artifactRefs)
    evidence = @($evidenceRefs)
    verification = @("Definition-of-done checks: $($definitionOfDone.Count).", "Artifact references: $($artifactRefs.Count).")
}
Add-ExecutionNode -Id 'context-retrieval' -Kind 'context_retrieval' -Owner 'marketing-chief-context-loader' -Status $contextStatus -Task 'Assemble the exact bounded context slice required by this item.' -Requires @('source-intake') -Produces @('worker_context') -Output $contextOutput

$hardBlocked = $blockers.Count -gt 0
$workerStatus = if ($hardBlocked) {
    'blocked'
} elseif ([string]$item.status -in @('verification', 'executed', 'observed')) {
    'completed'
} elseif ([string]$item.status -eq 'in_progress') {
    'running'
} else {
    'ready'
}
$workerOutput = $null
if ($workerStatus -eq 'completed') {
    $existingSummary = if ($null -ne $item.outcome -and -not [string]::IsNullOrWhiteSpace([string]$item.outcome.summary)) { [string]$item.outcome.summary } else { 'Queue state indicates worker execution is complete and awaits verification.' }
    Assert-SafeTextValue -Value $existingSummary -Name 'existing outcome summary' -MaxLength 4000
    $workerOutput = [pscustomobject][ordered]@{
        summary = $existingSummary
        artifacts = @($artifactRefs)
        evidence = @($evidenceRefs)
        verification = @()
    }
}
Add-ExecutionNode -Id 'worker-execution' -Kind 'worker_execution' -Owner 'bounded-worker' -Status $workerStatus -Task ([string]$item.nextAction) -Requires @('context-retrieval') -Produces @('local_artifacts', 'worker_evidence') -Gate $approvalGate -Output $workerOutput

$verificationIds = New-Object System.Collections.Generic.List[string]
for ($index = 0; $index -lt $definitionOfDone.Count; $index++) {
    $verifyId = 'verify-{0:d2}' -f ($index + 1)
    $verificationIds.Add($verifyId)
    $verifyStatus = if ($workerStatus -eq 'completed') { 'ready' } elseif ($workerStatus -eq 'blocked') { 'blocked' } else { 'pending' }
    Add-ExecutionNode -Id $verifyId -Kind 'verification' -Owner 'verifier' -Status $verifyStatus -Task ([string]$definitionOfDone[$index]) -Requires @('worker-execution') -Produces @("verification_{0:d2}" -f ($index + 1))
}

$approvalNodeStatus = if ($approvalGate -eq 'none') { 'completed' } else { 'blocked' }
$approvalOutput = [pscustomobject][ordered]@{
    summary = if ($approvalGate -eq 'none') { 'This graph permits local reversible work only; no external action is authorized.' } else { "The $approvalGate gate remains unresolved and execution is blocked." }
    artifacts = @()
    evidence = @()
    verification = @("Action class: $actionClass.", "Approval tier/status: $approvalTier/$approvalStatus.")
}
Add-ExecutionNode -Id 'approval-gate' -Kind 'approval_gate' -Owner 'marketing-chief' -Status $approvalNodeStatus -Task 'Enforce the exact action-class and approval boundary.' -Requires @('scope-guard') -Produces @('approval_verdict') -Gate $approvalGate -Output $approvalOutput

$handoffRequires = @($verificationIds) + @('approval-gate')
$handoffStatus = if ($hardBlocked) { 'blocked' } else { 'pending' }
Add-ExecutionNode -Id 'handoff-assembly' -Kind 'handoff_assembly' -Owner 'bounded-worker' -Status $handoffStatus -Task 'Assemble a schema-valid redacted worker handoff from completed graph outputs.' -Requires $handoffRequires -Produces @('worker_handoff') -Gate $approvalGate
Add-ExecutionNode -Id 'chief-reconciliation' -Kind 'chief_reconciliation' -Owner 'marketing-chief' -Status 'pending' -Task 'Revalidate live queue and item state, then accept or reject the handoff through the supported canonical mutation path.' -Requires @('handoff-assembly') -Produces @('canonical_receipt') -Gate $approvalGate

$edgeList = New-Object System.Collections.Generic.List[object]
foreach ($node in $nodeList) {
    foreach ($requiredNode in @($node.requires)) {
        $edgeList.Add([pscustomobject][ordered]@{ from = $requiredNode; relation = 'precedes'; to = [string]$node.id })
    }
}

$knowledgeNodes = New-Object System.Collections.Generic.List[object]
$knowledgeEdges = New-Object System.Collections.Generic.List[object]
function Add-KnowledgeNode {
    param([string]$Id, [string]$Type, [string]$Label, [AllowNull()][string]$Locator = $null)
    $safeLocator = if ([string]::IsNullOrWhiteSpace($Locator)) { $null } else { $Locator }
    $knowledgeNodes.Add([pscustomobject][ordered]@{ id = $Id; type = $Type; label = $Label; locator = $safeLocator })
}
function Add-KnowledgeEdge { param([string]$From, [string]$Relation, [string]$To); $knowledgeEdges.Add([pscustomobject][ordered]@{ from = $From; relation = $Relation; to = $To }) }

$queueNodeId = 'queue:canonical'
$clientNodeId = 'client:' + $clientId
$itemNodeId = 'work-item:' + $WorkItemId
$approvalNodeId = 'approval:' + $approvalGate
Add-KnowledgeNode $queueNodeId 'queue' "Canonical queue revision $ExpectedQueueRevision" 'queue/work-items.json'
Add-KnowledgeNode $clientNodeId 'client' $clientId $clientRoot
Add-KnowledgeNode $itemNodeId 'work_item' ([string]$item.title) $sourceLocator
Add-KnowledgeNode $approvalNodeId 'approval' "$approvalTier/$approvalStatus/$approvalGate" $null
Add-KnowledgeEdge $queueNodeId 'contains' $itemNodeId
Add-KnowledgeEdge $clientNodeId 'owns' $itemNodeId
Add-KnowledgeEdge $itemNodeId 'governed_by' $approvalNodeId

$allEvidence = @(@($sourceLocator) + $evidenceRefs | Select-Object -Unique)
foreach ($locator in $allEvidence) {
    $nodeId = 'evidence:' + (Get-ShortHash $locator)
    Add-KnowledgeNode $nodeId 'evidence' $locator $locator
    Add-KnowledgeEdge $itemNodeId 'supported_by' $nodeId
}
foreach ($locator in $artifactRefs) {
    $nodeId = 'artifact:' + (Get-ShortHash $locator)
    Add-KnowledgeNode $nodeId 'artifact' $locator $locator
    Add-KnowledgeEdge $itemNodeId 'produces' $nodeId
}
for ($index = 0; $index -lt $definitionOfDone.Count; $index++) {
    $nodeId = 'definition:{0:d2}' -f ($index + 1)
    Add-KnowledgeNode $nodeId 'definition' ([string]$definitionOfDone[$index]) $null
    Add-KnowledgeEdge $itemNodeId 'requires' $nodeId
}

$trace = New-Object System.Collections.Generic.List[object]
foreach ($node in $nodeList) {
    if ([string]$node.status -in @('completed', 'running', 'blocked')) {
        $trace.Add([pscustomobject][ordered]@{
            eventId = 'evt-' + [guid]::NewGuid().ToString('N')
            at = $nowText
            actor = if ([string]$node.owner -eq 'bounded-worker') { 'queue-state-import' } else { [string]$node.owner }
            nodeId = [string]$node.id
            fromStatus = $null
            toStatus = [string]$node.status
            summary = if ([string]$node.status -eq 'blocked') { 'Node initialized blocked by current scope or approval state.' } else { 'Node initialized from validated current state.' }
        })
    }
}

$itemCanonical = $item | ConvertTo-Json -Depth 100 -Compress
$graphStatus = if ($hardBlocked) { 'blocked' } elseif ($workerStatus -in @('running', 'completed')) { 'running' } else { 'planned' }
$graph = [pscustomobject][ordered]@{
    schemaVersion = 1
    graphRunId = $GraphRunId
    graphRevision = 1
    workflowId = 'marketing-chief-execution-graph'
    createdAt = $nowText
    updatedAt = $nowText
    status = $graphStatus
    queueSnapshot = [pscustomobject][ordered]@{
        locator = 'queue/work-items.json'
        revision = [int]$queue.revision
        sha256 = Get-MarketingTextSha256 $queueRaw
        capturedAt = $nowText
    }
    workItem = [pscustomobject][ordered]@{
        id = $WorkItemId
        expectedVersion = [int]$item.version
        contentSha256 = Get-MarketingTextSha256 $itemCanonical
        clientId = $clientId
        title = [string]$item.title
        status = [string]$item.status
        lane = [string]$item.lane
        priority = [string]$item.priority.level
        actionClass = $actionClass
        nextAction = [string]$item.nextAction
        definitionOfDone = [string[]]$definitionOfDone
        sourceLocator = $sourceLocator
        evidenceRefs = @($evidenceRefs)
        artifactRefs = @($artifactRefs)
        dependencies = @($dependencies)
        approval = [pscustomobject][ordered]@{ tier = $approvalTier; status = $approvalStatus; gate = $approvalGate }
    }
    scope = [pscustomobject][ordered]@{
        canonicalProject = $ProjectRoot
        clientRoot = $clientRoot
        graphLocator = $graphLocator
        canonicalWriteAllowed = $false
        externalActionAllowed = $false
        durableMemoryWriteAllowed = $false
        privacy = 'redacted'
    }
    retrieval = [pscustomobject][ordered]@{
        strategy = 'exact-plus-graph'
        exactBindingRequired = $true
        semanticBindingAllowed = $false
        sourceCount = $allEvidence.Count
        artifactCount = $artifactRefs.Count
    }
    nodes = $nodeList.ToArray()
    edges = $edgeList.ToArray()
    knowledgeGraph = [pscustomobject][ordered]@{
        nodes = $knowledgeNodes.ToArray()
        edges = $knowledgeEdges.ToArray()
        nodeCount = $knowledgeNodes.Count
        edgeCount = $knowledgeEdges.Count
    }
    handoffContract = [pscustomobject][ordered]@{
        schema = 'schemas/worker-handoff.schema.json'
        validator = 'scripts/Test-MarketingHandoff.ps1'
        reconciler = 'scripts/Accept-WorkerHandoff.ps1'
        expectedWorkItemVersion = [int]$item.version
        approvalGate = $approvalGate
        graphEvidence = $graphLocator
    }
    blockers = $blockers.ToArray()
    warnings = $warnings.ToArray()
    trace = $trace.ToArray()
    attestations = [pscustomobject][ordered]@{
        canonicalWriteAttempted = $false
        externalActionAttempted = $false
        durableMemoryWriteAttempted = $false
        containsSecrets = $false
        containsDirectIdentifiers = $false
        containsRawCommunications = $false
    }
}

$graphJson = ($graph | ConvertTo-Json -Depth 100) + [Environment]::NewLine
$graphHash = Get-MarketingTextSha256 $graphJson
$result = [pscustomobject][ordered]@{
    status = if ($DryRun) { 'would-create' } else { 'created' }
    graphStatus = $graphStatus
    graphRunId = $GraphRunId
    graphRevision = 1
    graphPath = $graphLocator
    graphContentSha256 = $graphHash
    queueRevision = [int]$queue.revision
    workItemId = $WorkItemId
    workItemVersion = [int]$item.version
    clientId = $clientId
    nodeCount = $nodeList.Count
    verifierNodeCount = $verificationIds.Count
    knowledgeNodeCount = $knowledgeNodes.Count
    knowledgeEdgeCount = $knowledgeEdges.Count
    blockerCount = $blockers.Count
    canonicalWriteAttempted = $false
    externalActionAttempted = $false
}

if ($DryRun) {
    $result | ConvertTo-Json -Depth 10
    return
}
if (Test-Path -LiteralPath $graphPath) { throw 'Execution graph already exists.' }
[IO.Directory]::CreateDirectory($graphDirectory) | Out-Null
$graphTemp = Join-Path $graphDirectory ('.execution-graph.' + [guid]::NewGuid().ToString('N') + '.tmp.json')
$summaryTemp = Join-Path $graphDirectory ('.summary.' + [guid]::NewGuid().ToString('N') + '.tmp.md')
$summary = @"
# Marketing Chief execution graph

- Graph: `$GraphRunId`
- Status: **$graphStatus**
- Queue snapshot: revision **$($queue.revision)**
- Work item: `$WorkItemId` version **$($item.version)**
- Client: `$clientId`
- Execution nodes: **$($nodeList.Count)**
- Definition verifiers: **$($verificationIds.Count)**
- Knowledge graph: **$($knowledgeNodes.Count) nodes / $($knowledgeEdges.Count) edges**
- Approval gate: **$approvalGate**
- Canonical queue writes: **none**
- External actions: **none**

The Marketing Chief remains the only canonical queue writer. Validate this graph before execution, update only ready nodes whose dependencies are complete, and assemble a worker handoff only after the required verifier nodes pass.
"@
try {
    [IO.File]::WriteAllText($graphTemp, $graphJson, [Text.UTF8Encoding]::new($false))
    [IO.File]::WriteAllText($summaryTemp, ($summary.TrimEnd() + [Environment]::NewLine), [Text.UTF8Encoding]::new($false))
    Move-Item -LiteralPath $graphTemp -Destination $graphPath
    Move-Item -LiteralPath $summaryTemp -Destination $summaryPath
}
catch {
    Remove-Item -LiteralPath $graphTemp, $summaryTemp -Force -ErrorAction SilentlyContinue
    throw
}

$result | ConvertTo-Json -Depth 10
