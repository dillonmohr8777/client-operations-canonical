[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$GraphPath,
    [string]$ProjectRoot,
    [string]$QueuePath,
    [string]$RegistryPath,
    [string]$WorkflowPath,
    [ValidateSet('Json', 'Text')]
    [string]$Format = 'Text'
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'MarketingOs.Common.ps1')

if ([string]::IsNullOrWhiteSpace($ProjectRoot)) { $ProjectRoot = Join-Path $PSScriptRoot '..' }
$ProjectRoot = [IO.Path]::GetFullPath($ProjectRoot).TrimEnd('\')
if ([string]::IsNullOrWhiteSpace($QueuePath)) { $QueuePath = Join-Path $ProjectRoot 'queue\work-items.json' }
if ([string]::IsNullOrWhiteSpace($RegistryPath)) { $RegistryPath = Join-Path $ProjectRoot 'registry\clients.json' }
if ([string]::IsNullOrWhiteSpace($WorkflowPath)) { $WorkflowPath = Join-Path $ProjectRoot 'workflows\marketing-chief-execution-graph.workflow.json' }
$GraphPath = [IO.Path]::GetFullPath($GraphPath)
$QueuePath = [IO.Path]::GetFullPath($QueuePath)
$RegistryPath = [IO.Path]::GetFullPath($RegistryPath)
$WorkflowPath = [IO.Path]::GetFullPath($WorkflowPath)
$projectPrefix = $ProjectRoot + '\'

$problems = New-Object System.Collections.Generic.List[string]
$warnings = New-Object System.Collections.Generic.List[string]
function Add-Problem { param([string]$Message); if (-not $problems.Contains($Message)) { $problems.Add($Message) } }
function Add-Warning { param([string]$Message); if (-not $warnings.Contains($Message)) { $warnings.Add($Message) } }
function Has-Property { param($Object, [string]$Name); return $null -ne $Object -and $Object.PSObject.Properties.Name -contains $Name }
function To-Locator {
    param([string]$Path)
    $full = [IO.Path]::GetFullPath($Path)
    if (-not $full.StartsWith($projectPrefix, [StringComparison]::OrdinalIgnoreCase)) { return $null }
    return $full.Substring($projectPrefix.Length).Replace('\', '/')
}
function Validate-Text {
    param([AllowNull()][string]$Value, [string]$Name, [int]$MaxLength = 4000, [switch]$Required)
    if ($Required -and [string]::IsNullOrWhiteSpace($Value)) { Add-Problem "$Name is required"; return }
    if ($null -ne $Value -and $Value.Length -gt $MaxLength) { Add-Problem "$Name exceeds its limit" }
    if (-not (Test-MarketingSafeText $Value)) { Add-Problem "$Name contains unsafe or secret-bearing text" }
}
function Validate-Locator {
    param([AllowNull()][string]$Value, [string]$Name, [string]$ClientRoot, [switch]$RequireClientScope)
    if (-not (Test-MarketingSafeLocator $Value)) { Add-Problem "$Name contains an unsafe locator"; return }
    if ($Value -match '^clients/' -and -not $Value.StartsWith(($ClientRoot + '/'), [StringComparison]::OrdinalIgnoreCase) -and $Value -ne $ClientRoot) { Add-Problem "$Name crosses the exact client boundary" }
    if ($RequireClientScope -and -not $Value.StartsWith(($ClientRoot + '/'), [StringComparison]::OrdinalIgnoreCase) -and $Value -ne $ClientRoot) { Add-Problem "$Name escapes the exact client folder" }
}

foreach ($path in @($GraphPath, $QueuePath, $RegistryPath, $WorkflowPath)) {
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { Add-Problem "Required file is missing: $path" }
}

$graph = $null
$graphRaw = $null
if ($problems.Count -eq 0) {
    try {
        $graphInfo = Get-Item -LiteralPath $GraphPath
        if ($graphInfo.Length -gt 262144) { Add-Problem 'Execution graph exceeds 256 KB' }
        $graphRaw = [IO.File]::ReadAllText($GraphPath, [Text.UTF8Encoding]::new($false))
        $graph = $graphRaw | ConvertFrom-Json
    }
    catch { Add-Problem ('Execution graph is not valid JSON: ' + $_.Exception.Message) }
}

$requiredTop = @('schemaVersion', 'graphRunId', 'graphRevision', 'workflowId', 'createdAt', 'updatedAt', 'status', 'queueSnapshot', 'workItem', 'scope', 'retrieval', 'nodes', 'edges', 'knowledgeGraph', 'handoffContract', 'blockers', 'warnings', 'trace', 'attestations')
if ($null -ne $graph) {
    foreach ($name in $requiredTop) { if (-not (Has-Property $graph $name)) { Add-Problem "Missing graph property: $name" } }
}

$queue = $null
$registry = $null
if ($null -ne $graph -and $problems.Count -eq 0) {
    try {
        $workflow = Get-Content -LiteralPath $WorkflowPath -Raw -Encoding UTF8 | ConvertFrom-Json
        if ([int]$workflow.schemaVersion -ne 1 -or [string]$workflow.workflowId -ne 'marketing-chief-execution-graph') { Add-Problem 'Workflow contract is unsupported' }
        $queueRaw = [IO.File]::ReadAllText($QueuePath, [Text.UTF8Encoding]::new($false))
        $queue = $queueRaw | ConvertFrom-Json
        $registry = Get-Content -LiteralPath $RegistryPath -Raw -Encoding UTF8 | ConvertFrom-Json
    }
    catch { Add-Problem ('Canonical graph source could not be parsed: ' + $_.Exception.Message) }
}

if ($null -ne $graph) {
    if ([int]$graph.schemaVersion -ne 1) { Add-Problem 'schemaVersion must be 1' }
    if ([string]$graph.graphRunId -notmatch '^mgr-[A-Za-z0-9][A-Za-z0-9_-]{7,151}$') { Add-Problem 'graphRunId is unsafe' }
    if ([int]$graph.graphRevision -lt 1) { Add-Problem 'graphRevision must be positive' }
    if ([string]$graph.workflowId -ne 'marketing-chief-execution-graph') { Add-Problem 'workflowId is invalid' }
    if ([string]$graph.status -notin @('planned', 'running', 'blocked', 'failed', 'handoff_ready', 'completed', 'stale')) { Add-Problem 'graph status is invalid' }
    foreach ($dateField in @('createdAt', 'updatedAt')) { try { [void][DateTimeOffset]::Parse([string]$graph.$dateField) } catch { Add-Problem "$dateField is not a date-time" } }

    $itemId = [string]$graph.workItem.id
    $clientId = [string]$graph.workItem.clientId
    $clientRoot = 'clients/' + $clientId
    if ($itemId -notmatch '^wi-[A-Za-z0-9-]+$') { Add-Problem 'work-item ID is invalid' }
    if ($clientId -notmatch '^[a-z0-9][a-z0-9-]{1,119}$') { Add-Problem 'client ID is invalid' }
    Validate-Text ([string]$graph.workItem.title) 'work-item title' 300 -Required
    Validate-Text ([string]$graph.workItem.nextAction) 'next action' 3000 -Required
    foreach ($check in @($graph.workItem.definitionOfDone)) { Validate-Text ([string]$check) 'definition-of-done check' 1000 -Required }
    if (@($graph.workItem.definitionOfDone).Count -lt 1 -or @($graph.workItem.definitionOfDone).Count -gt 10) { Add-Problem 'definition-of-done count must be 1 to 10' }
    Validate-Locator ([string]$graph.workItem.sourceLocator) 'source locator' $clientRoot
    foreach ($locator in @($graph.workItem.evidenceRefs)) { Validate-Locator ([string]$locator) 'evidence reference' $clientRoot }
    foreach ($locator in @($graph.workItem.artifactRefs)) { Validate-Locator ([string]$locator) 'artifact reference' $clientRoot -RequireClientScope }
    foreach ($dependency in @($graph.workItem.dependencies)) {
        if ([string]$dependency -notmatch '^wi-[A-Za-z0-9-]+$' -and -not (Test-MarketingSafeLocator ([string]$dependency))) { Add-Problem 'dependency is unsafe' }
    }

    if ([string]$graph.scope.clientRoot -ne $clientRoot) { Add-Problem 'scope client root does not match the work item' }
    if ([string]$graph.scope.privacy -ne 'redacted') { Add-Problem 'scope privacy must be redacted' }
    if ([bool]$graph.scope.canonicalWriteAllowed -or [bool]$graph.scope.externalActionAllowed -or [bool]$graph.scope.durableMemoryWriteAllowed) { Add-Problem 'scope permits a prohibited action' }
    $actualGraphLocator = To-Locator $GraphPath
    if ($null -eq $actualGraphLocator -or [string]$graph.scope.graphLocator -ne $actualGraphLocator) { Add-Problem 'graph locator does not match its actual project path' }
    Validate-Locator ([string]$graph.scope.graphLocator) 'graph locator' $clientRoot
    if ([string]$graph.handoffContract.graphEvidence -ne [string]$graph.scope.graphLocator) { Add-Problem 'handoff graph evidence does not match the graph locator' }
    if ([string]$graph.handoffContract.schema -ne 'schemas/worker-handoff.schema.json' -or [string]$graph.handoffContract.validator -ne 'scripts/Test-MarketingHandoff.ps1' -or [string]$graph.handoffContract.reconciler -ne 'scripts/Accept-WorkerHandoff.ps1') { Add-Problem 'handoff contract does not use the canonical validation path' }
    if ([int]$graph.handoffContract.expectedWorkItemVersion -ne [int]$graph.workItem.expectedVersion) { Add-Problem 'handoff and work-item versions disagree' }
    if ([string]$graph.handoffContract.approvalGate -ne [string]$graph.workItem.approval.gate) { Add-Problem 'handoff and work-item approval gates disagree' }

    if ([string]$graph.retrieval.strategy -ne 'exact-plus-graph' -or -not [bool]$graph.retrieval.exactBindingRequired -or [bool]$graph.retrieval.semanticBindingAllowed) { Add-Problem 'retrieval policy can bypass exact canonical binding' }
    $expectedSources = @(@([string]$graph.workItem.sourceLocator) + @($graph.workItem.evidenceRefs) | Select-Object -Unique).Count
    if ([int]$graph.retrieval.sourceCount -ne $expectedSources) { Add-Problem 'retrieval source count is inconsistent' }
    if ([int]$graph.retrieval.artifactCount -ne @($graph.workItem.artifactRefs).Count) { Add-Problem 'retrieval artifact count is inconsistent' }

    $attestations = $graph.attestations
    foreach ($name in @('canonicalWriteAttempted', 'externalActionAttempted', 'durableMemoryWriteAttempted', 'containsSecrets', 'containsDirectIdentifiers', 'containsRawCommunications')) {
        if (-not (Has-Property $attestations $name) -or [bool]$attestations.$name) { Add-Problem "Attestation $name is missing or unsafe" }
    }

    $nodes = @($graph.nodes)
    if ($nodes.Count -lt 7 -or $nodes.Count -gt 20) { Add-Problem 'execution node count is outside 7 to 20' }
    $nodeIds = @($nodes | ForEach-Object { [string]$_.id })
    if (@($nodeIds | Group-Object | Where-Object Count -gt 1).Count -gt 0) { Add-Problem 'execution node IDs are not unique' }
    $requiredKinds = @('scope_guard', 'source_intake', 'context_retrieval', 'worker_execution', 'approval_gate', 'handoff_assembly', 'chief_reconciliation')
    foreach ($kind in $requiredKinds) { if (@($nodes | Where-Object { [string]$_.kind -eq $kind }).Count -ne 1) { Add-Problem "Execution graph requires exactly one $kind node" } }
    $verificationNodes = @($nodes | Where-Object { [string]$_.kind -eq 'verification' })
    if ($verificationNodes.Count -ne @($graph.workItem.definitionOfDone).Count) { Add-Problem 'Verifier node count does not match definition of done' }
    $definitionSet = @($graph.workItem.definitionOfDone | ForEach-Object { [string]$_ } | Sort-Object)
    $verifierTaskSet = @($verificationNodes | ForEach-Object { [string]$_.task } | Sort-Object)
    if (($definitionSet -join "`n") -ne ($verifierTaskSet -join "`n")) { Add-Problem 'Verifier tasks do not exactly cover the definition of done' }
    foreach ($node in $nodes) {
        if ([string]$node.id -notmatch '^[a-z][a-z0-9-]{1,79}$') { Add-Problem 'Execution node ID is invalid' }
        if ([string]$node.status -notin @('pending', 'ready', 'running', 'completed', 'failed', 'blocked')) { Add-Problem "Node $($node.id) has an invalid status" }
        if ([int]$node.attempts -lt 0 -or [int]$node.attempts -gt [int]$node.maxAttempts -or [int]$node.maxAttempts -gt 3) { Add-Problem "Node $($node.id) has invalid attempt limits" }
        Validate-Text ([string]$node.task) "node $($node.id) task" 2000 -Required
        foreach ($requiredNode in @($node.requires)) { if ([string]$requiredNode -notin $nodeIds) { Add-Problem "Node $($node.id) depends on an unknown node" } }
        if ([string]$node.status -in @('ready', 'running', 'completed')) {
            foreach ($requiredNode in @($node.requires)) {
                $dependencyNode = @($nodes | Where-Object { [string]$_.id -eq [string]$requiredNode })[0]
                if ([string]$dependencyNode.status -ne 'completed') { Add-Problem "Node $($node.id) advanced before dependency $requiredNode completed" }
            }
        }
        if ($null -ne $node.output) {
            Validate-Text ([string]$node.output.summary) "node $($node.id) output summary" 4000
            foreach ($locator in @($node.output.evidence)) { Validate-Locator ([string]$locator) "node $($node.id) output evidence" $clientRoot }
            foreach ($locator in @($node.output.artifacts)) { Validate-Locator ([string]$locator) "node $($node.id) output artifact" $clientRoot -RequireClientScope }
            foreach ($entry in @($node.output.verification)) { Validate-Text ([string]$entry) "node $($node.id) verification" 1000 }
        }
    }

    $executionEdges = @($graph.edges)
    foreach ($edge in $executionEdges) {
        if ([string]$edge.from -notin $nodeIds -or [string]$edge.to -notin $nodeIds) { Add-Problem 'Execution edge references an unknown node' }
        if ([string]$edge.relation -ne 'precedes') { Add-Problem 'Execution edge relation is invalid' }
    }
    foreach ($node in $nodes) {
        foreach ($requiredNode in @($node.requires)) {
            if (@($executionEdges | Where-Object { [string]$_.from -eq [string]$requiredNode -and [string]$_.to -eq [string]$node.id -and [string]$_.relation -eq 'precedes' }).Count -ne 1) { Add-Problem "Dependency edge is missing for $requiredNode -> $($node.id)" }
        }
    }

    $approvalNode = @($nodes | Where-Object { [string]$_.kind -eq 'approval_gate' })[0]
    if ([string]$graph.workItem.approval.gate -eq 'none' -and [string]$approvalNode.status -ne 'completed') { Add-Problem 'Automatic local approval gate is not completed' }
    if ([string]$graph.workItem.approval.gate -ne 'none' -and [string]$approvalNode.status -ne 'blocked') { Add-Problem 'Approval-gated graph is not blocked' }
    if ([string]$graph.workItem.approval.gate -ne 'none') {
        $workerNode = @($nodes | Where-Object { [string]$_.kind -eq 'worker_execution' })[0]
        if ([string]$workerNode.status -notin @('blocked', 'completed')) { Add-Problem 'Approval-gated worker execution can proceed without approval' }
    }

    $knowledgeNodes = @($graph.knowledgeGraph.nodes)
    $knowledgeEdges = @($graph.knowledgeGraph.edges)
    $knowledgeIds = @($knowledgeNodes | ForEach-Object { [string]$_.id })
    if ($knowledgeNodes.Count -ne [int]$graph.knowledgeGraph.nodeCount -or $knowledgeEdges.Count -ne [int]$graph.knowledgeGraph.edgeCount) { Add-Problem 'Knowledge graph counts are inconsistent' }
    if (@($knowledgeIds | Group-Object | Where-Object Count -gt 1).Count -gt 0) { Add-Problem 'Knowledge graph node IDs are not unique' }
    foreach ($node in $knowledgeNodes) {
        Validate-Text ([string]$node.label) "knowledge node $($node.id) label" 500 -Required
        if ($null -ne $node.locator) { Validate-Locator ([string]$node.locator) "knowledge node $($node.id) locator" $clientRoot }
    }
    foreach ($edge in $knowledgeEdges) { if ([string]$edge.from -notin $knowledgeIds -or [string]$edge.to -notin $knowledgeIds) { Add-Problem 'Knowledge edge references an unknown node' } }
    $itemKnowledgeId = 'work-item:' + $itemId
    if (@($knowledgeEdges | Where-Object { [string]$_.from -eq 'queue:canonical' -and [string]$_.relation -eq 'contains' -and [string]$_.to -eq $itemKnowledgeId }).Count -ne 1) { Add-Problem 'Queue-to-work-item knowledge path is missing' }
    if (@($knowledgeEdges | Where-Object { [string]$_.from -eq ('client:' + $clientId) -and [string]$_.relation -eq 'owns' -and [string]$_.to -eq $itemKnowledgeId }).Count -ne 1) { Add-Problem 'Client-to-work-item knowledge path is missing' }
    foreach ($locator in @(@([string]$graph.workItem.sourceLocator) + @($graph.workItem.evidenceRefs) | Select-Object -Unique)) {
        $expectedNode = 'evidence:' + (Get-MarketingTextSha256 $locator).Substring(0, 16).ToLowerInvariant()
        if (@($knowledgeEdges | Where-Object { [string]$_.from -eq $itemKnowledgeId -and [string]$_.relation -eq 'supported_by' -and [string]$_.to -eq $expectedNode }).Count -ne 1) { Add-Problem "Evidence graph path is missing for $locator" }
    }
    foreach ($locator in @($graph.workItem.artifactRefs)) {
        $expectedNode = 'artifact:' + (Get-MarketingTextSha256 ([string]$locator)).Substring(0, 16).ToLowerInvariant()
        if (@($knowledgeEdges | Where-Object { [string]$_.from -eq $itemKnowledgeId -and [string]$_.relation -eq 'produces' -and [string]$_.to -eq $expectedNode }).Count -ne 1) { Add-Problem "Artifact graph path is missing for $locator" }
    }
    for ($index = 0; $index -lt @($graph.workItem.definitionOfDone).Count; $index++) {
        $expectedNode = 'definition:{0:d2}' -f ($index + 1)
        if (@($knowledgeEdges | Where-Object { [string]$_.from -eq $itemKnowledgeId -and [string]$_.relation -eq 'requires' -and [string]$_.to -eq $expectedNode }).Count -ne 1) { Add-Problem "Definition graph path is missing for $expectedNode" }
    }

    foreach ($event in @($graph.trace)) {
        if ([string]$event.eventId -notmatch '^evt-[A-Za-z0-9_-]{8,159}$') { Add-Problem 'Trace event ID is invalid' }
        if ([string]$event.nodeId -notin $nodeIds) { Add-Problem 'Trace event references an unknown node' }
        Validate-Text ([string]$event.summary) 'trace summary' 1000 -Required
        try { [void][DateTimeOffset]::Parse([string]$event.at) } catch { Add-Problem 'Trace event timestamp is invalid' }
    }
}

if ($null -ne $graph -and $null -ne $queue -and $null -ne $registry) {
    if ([string]$graph.queueSnapshot.locator -ne 'queue/work-items.json') { Add-Problem 'Queue snapshot locator is invalid' }
    if ([string]$graph.queueSnapshot.sha256 -notmatch '^[0-9A-F]{64}$') { Add-Problem 'Queue snapshot hash is invalid' }
    if ([int]$queue.revision -lt [int]$graph.queueSnapshot.revision) { Add-Problem 'Current queue revision predates the graph snapshot' }
    $currentQueueRaw = [IO.File]::ReadAllText($QueuePath, [Text.UTF8Encoding]::new($false))
    if ([int]$queue.revision -eq [int]$graph.queueSnapshot.revision -and (Get-MarketingTextSha256 $currentQueueRaw) -ne [string]$graph.queueSnapshot.sha256) { Add-Problem 'Queue content changed without a revision increment' }
    if ([int]$queue.revision -gt [int]$graph.queueSnapshot.revision) { Add-Warning "Queue advanced from revision $($graph.queueSnapshot.revision) to $($queue.revision); the exact work item remains the staleness boundary." }

    $currentItems = @($queue.workItems | Where-Object { [string]$_.id -eq [string]$graph.workItem.id })
    if ($currentItems.Count -ne 1) { Add-Problem 'Current work item no longer resolves exactly once' }
    else {
        $currentItem = $currentItems[0]
        if ([int]$currentItem.version -ne [int]$graph.workItem.expectedVersion) { Add-Problem 'Execution graph is stale: work-item version changed' }
        $currentItemHash = Get-MarketingTextSha256 ($currentItem | ConvertTo-Json -Depth 100 -Compress)
        if ($currentItemHash -ne [string]$graph.workItem.contentSha256) { Add-Problem 'Execution graph is stale: work-item content changed' }
        if ([string]$currentItem.clientId -ne [string]$graph.workItem.clientId) { Add-Problem 'Current work-item client no longer matches the graph' }
    }
    $activeClients = @($registry.clients | Where-Object { [string]$_.id -eq [string]$graph.workItem.clientId -and [string]$_.status -eq 'active' })
    if ($activeClients.Count -ne 1) { Add-Problem 'Graph client is no longer exactly active' }
}

$result = [pscustomobject][ordered]@{
    status = if ($problems.Count -eq 0) { 'valid' } else { 'invalid' }
    checkedAt = [DateTimeOffset]::UtcNow.ToString('o')
    graphRunId = if ($null -ne $graph) { [string]$graph.graphRunId } else { $null }
    graphRevision = if ($null -ne $graph) { [int]$graph.graphRevision } else { $null }
    workItemId = if ($null -ne $graph) { [string]$graph.workItem.id } else { $null }
    workItemVersion = if ($null -ne $graph) { [int]$graph.workItem.expectedVersion } else { $null }
    contentSha256 = if ($null -ne $graphRaw) { Get-MarketingTextSha256 $graphRaw } else { $null }
    problems = @($problems)
    warnings = @($warnings)
    canonicalWriteAttempted = $false
    externalActionAttempted = $false
}

if ($Format -eq 'Json') { $result | ConvertTo-Json -Depth 10 } else {
    if ($result.status -eq 'valid') { "VALID graph=$($result.graphRunId) revision=$($result.graphRevision) workItem=$($result.workItemId)" }
    else { "INVALID: $(@($problems) -join '; ')" }
}
if ($problems.Count -gt 0) { exit 1 }
