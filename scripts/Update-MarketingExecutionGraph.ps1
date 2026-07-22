[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$GraphPath,
    [Parameter(Mandatory = $true)]
    [ValidateRange(1, 2147483647)]
    [int]$ExpectedGraphRevision,
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[a-z][a-z0-9-]{1,79}$')]
    [string]$NodeId,
    [Parameter(Mandatory = $true)]
    [ValidateSet('ready', 'running', 'completed', 'failed', 'blocked')]
    [string]$Status,
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[a-z][a-z0-9-]{1,79}$')]
    [string]$Actor,
    [string]$Summary,
    [string[]]$Artifacts = @(),
    [string[]]$Evidence = @(),
    [string[]]$Verification = @(),
    [string]$ProjectRoot,
    [string]$QueuePath,
    [string]$RegistryPath,
    [string]$WorkflowPath
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
if (-not $GraphPath.StartsWith($projectPrefix, [StringComparison]::OrdinalIgnoreCase)) { throw 'Execution graph path must stay inside the project.' }
if (-not (Test-Path -LiteralPath $GraphPath -PathType Leaf)) { throw 'Execution graph was not found.' }

function Assert-SafeTextValue {
    param([AllowNull()][string]$Value, [string]$Name, [int]$MaxLength = 4000, [switch]$Required)
    if ($Required -and [string]::IsNullOrWhiteSpace($Value)) { throw "$Name is required." }
    if ($null -ne $Value -and $Value.Length -gt $MaxLength) { throw "$Name exceeds $MaxLength characters." }
    if (-not (Test-MarketingSafeText $Value)) { throw "$Name contains unsafe or secret-bearing text." }
}

function Assert-SafeOutputLocator {
    param([string]$Value, [string]$Name, [string]$ClientRoot, [switch]$RequireClientScope, [switch]$RequireExisting)
    if (-not (Test-MarketingSafeLocator $Value)) { throw "$Name contains an unsafe locator." }
    if ($Value -match '^clients/' -and -not $Value.StartsWith(($ClientRoot + '/'), [StringComparison]::OrdinalIgnoreCase) -and $Value -ne $ClientRoot) { throw "$Name crosses the exact client boundary." }
    if ($RequireClientScope -and -not $Value.StartsWith(($ClientRoot + '/'), [StringComparison]::OrdinalIgnoreCase) -and $Value -ne $ClientRoot) { throw "$Name must stay inside the exact client folder." }
    if ($RequireExisting) {
        $candidate = [IO.Path]::GetFullPath((Join-Path $ProjectRoot ($Value.Replace('/', '\'))))
        if (-not $candidate.StartsWith($projectPrefix, [StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path -LiteralPath $candidate)) { throw "$Name does not resolve to an existing project artifact." }
    }
}

$validator = Join-Path $PSScriptRoot 'Test-MarketingExecutionGraph.ps1'
$validationOutput = & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $validator -GraphPath $GraphPath -ProjectRoot $ProjectRoot -QueuePath $QueuePath -RegistryPath $RegistryPath -WorkflowPath $WorkflowPath -Format Json
$validationExit = $LASTEXITCODE
try { $validation = ($validationOutput -join [Environment]::NewLine) | ConvertFrom-Json } catch { throw 'Execution graph validator did not return valid JSON.' }
if ($validationExit -ne 0 -or [string]$validation.status -ne 'valid') { throw ('Execution graph update rejected: ' + (@($validation.problems) -join '; ')) }

$lockPath = $GraphPath + '.lock'
$lock = $null
$tempPath = $null
$rollbackPath = $null
$committed = $false
try {
    $lock = [IO.File]::Open($lockPath, [IO.FileMode]::OpenOrCreate, [IO.FileAccess]::ReadWrite, [IO.FileShare]::None)
    $graphRaw = [IO.File]::ReadAllText($GraphPath, [Text.UTF8Encoding]::new($false))
    if ((Get-MarketingTextSha256 $graphRaw) -ne [string]$validation.contentSha256) { throw 'Execution graph changed after validation.' }
    $graph = $graphRaw | ConvertFrom-Json
    if ([int]$graph.graphRevision -ne $ExpectedGraphRevision) { throw "Stale graph revision. Expected $ExpectedGraphRevision; current is $($graph.graphRevision)." }
    if ([string]$graph.status -in @('completed', 'stale')) { throw "Execution graph status $($graph.status) cannot be updated." }

    $nodes = @($graph.nodes)
    $matches = @($nodes | Where-Object { [string]$_.id -eq $NodeId })
    if ($matches.Count -ne 1) { throw 'Execution node must resolve exactly once.' }
    $node = $matches[0]
    if ([string]$node.kind -eq 'chief_reconciliation') { throw 'Chief reconciliation is recorded only by the canonical handoff acceptance path.' }
    if ([string]$node.kind -in @('approval_gate', 'scope_guard', 'source_intake', 'context_retrieval') -and $Actor -ne 'marketing-chief') { throw 'Protected graph nodes may only be updated by the Marketing Chief.' }

    $fromStatus = [string]$node.status
    $transitionMap = @{
        pending = @('ready', 'blocked')
        ready = @('running', 'completed', 'failed', 'blocked')
        running = @('completed', 'failed', 'blocked')
        failed = @('ready', 'blocked')
        blocked = @()
        completed = @()
    }
    if ($Status -eq $fromStatus) { throw 'Execution node status is unchanged.' }
    if (-not $transitionMap.ContainsKey($fromStatus) -or $Status -notin @($transitionMap[$fromStatus])) { throw "Invalid graph node transition: $fromStatus -> $Status." }
    if ($fromStatus -eq 'failed' -and $Status -eq 'ready' -and [int]$node.attempts -ge [int]$node.maxAttempts) { throw 'Execution node has exhausted its retry limit.' }
    if ([string]$node.approvalGate -ne 'none' -and $Status -in @('ready', 'running', 'completed')) { throw 'Approval-gated node cannot be advanced inside the same graph.' }

    if ($Status -in @('ready', 'running', 'completed')) {
        foreach ($requiredId in @($node.requires)) {
            $dependency = @($nodes | Where-Object { [string]$_.id -eq [string]$requiredId })
            if ($dependency.Count -ne 1 -or [string]$dependency[0].status -ne 'completed') { throw "Dependency $requiredId is not completed." }
        }
    }

    Assert-SafeTextValue -Value $Summary -Name 'node summary' -MaxLength 4000 -Required:($Status -in @('completed', 'failed', 'blocked'))
    $clientRoot = [string]$graph.scope.clientRoot
    $artifactList = @($Artifacts | Where-Object { -not [string]::IsNullOrWhiteSpace([string]$_) } | ForEach-Object { [string]$_ } | Select-Object -Unique)
    $evidenceList = @($Evidence | Where-Object { -not [string]::IsNullOrWhiteSpace([string]$_) } | ForEach-Object { [string]$_ } | Select-Object -Unique)
    $verificationList = @($Verification | Where-Object { -not [string]::IsNullOrWhiteSpace([string]$_) } | ForEach-Object { [string]$_ } | Select-Object -Unique)
    if ($artifactList.Count -gt 50 -or $evidenceList.Count -gt 50 -or $verificationList.Count -gt 10) { throw 'Node output exceeds graph limits.' }
    foreach ($locator in $artifactList) { Assert-SafeOutputLocator -Value $locator -Name 'node artifact' -ClientRoot $clientRoot -RequireClientScope -RequireExisting:($Status -eq 'completed') }
    foreach ($locator in $evidenceList) { Assert-SafeOutputLocator -Value $locator -Name 'node evidence' -ClientRoot $clientRoot }
    foreach ($entry in $verificationList) { Assert-SafeTextValue -Value $entry -Name 'verification entry' -MaxLength 1000 -Required }
    if ([string]$node.kind -eq 'verification' -and $Status -eq 'completed' -and $verificationList.Count -lt 1) { throw 'A completed verifier node requires verification evidence.' }

    if ($Status -eq 'running' -or ($Status -eq 'completed' -and $fromStatus -eq 'ready')) {
        if ([int]$node.attempts -ge [int]$node.maxAttempts) { throw 'Execution node has exhausted its retry limit.' }
        $node.attempts = [int]$node.attempts + 1
    }
    $node.status = $Status
    if (-not [string]::IsNullOrWhiteSpace($Summary) -or $artifactList.Count -gt 0 -or $evidenceList.Count -gt 0 -or $verificationList.Count -gt 0) {
        $node.output = [pscustomobject][ordered]@{
            summary = if ([string]::IsNullOrWhiteSpace($Summary)) { '' } else { $Summary.Trim() }
            artifacts = @($artifactList)
            evidence = @($evidenceList)
            verification = @($verificationList)
        }
    }

    # Promote pending nodes only when every dependency is complete and no gate blocks them.
    foreach ($candidate in $nodes) {
        if ([string]$candidate.status -ne 'pending' -or [string]$candidate.approvalGate -ne 'none') { continue }
        $dependenciesComplete = $true
        foreach ($requiredId in @($candidate.requires)) {
            $dependency = @($nodes | Where-Object { [string]$_.id -eq [string]$requiredId })
            if ($dependency.Count -ne 1 -or [string]$dependency[0].status -ne 'completed') { $dependenciesComplete = $false; break }
        }
        if ($dependenciesComplete) { $candidate.status = 'ready' }
    }

    $eventTime = [DateTimeOffset]::UtcNow.ToString('o')
    $event = [pscustomobject][ordered]@{
        eventId = 'evt-' + [guid]::NewGuid().ToString('N')
        at = $eventTime
        actor = $Actor
        nodeId = $NodeId
        fromStatus = $fromStatus
        toStatus = $Status
        summary = if ([string]::IsNullOrWhiteSpace($Summary)) { "Node moved from $fromStatus to $Status." } else { $Summary.Trim() }
    }
    $graph.trace = @($graph.trace) + @($event)
    $graph.graphRevision = [int]$graph.graphRevision + 1
    $graph.updatedAt = $eventTime

    $handoffNode = @($nodes | Where-Object { [string]$_.kind -eq 'handoff_assembly' })[0]
    $failedNodes = @($nodes | Where-Object { [string]$_.status -eq 'failed' -and [int]$_.attempts -ge [int]$_.maxAttempts })
    $hardBlockedNodes = @($nodes | Where-Object { [string]$_.status -eq 'blocked' -and [string]$_.kind -in @('scope_guard', 'source_intake', 'context_retrieval', 'worker_execution', 'approval_gate') })
    if ($failedNodes.Count -gt 0) { $graph.status = 'failed' }
    elseif ($hardBlockedNodes.Count -gt 0) { $graph.status = 'blocked' }
    elseif ([string]$handoffNode.status -eq 'completed') { $graph.status = 'handoff_ready' }
    elseif (@($nodes | Where-Object { [string]$_.status -in @('running', 'completed') -and [string]$_.kind -notin @('scope_guard', 'source_intake', 'context_retrieval', 'approval_gate') }).Count -gt 0) { $graph.status = 'running' }
    else { $graph.status = 'planned' }

    $updatedJson = ($graph | ConvertTo-Json -Depth 100) + [Environment]::NewLine
    $directory = Split-Path -Parent $GraphPath
    $tempPath = Join-Path $directory ('.execution-graph.' + [guid]::NewGuid().ToString('N') + '.tmp.json')
    $rollbackPath = Join-Path $directory ('.execution-graph.' + [guid]::NewGuid().ToString('N') + '.rollback.json')
    [IO.File]::WriteAllText($tempPath, $updatedJson, [Text.UTF8Encoding]::new($false))
    Move-Item -LiteralPath $GraphPath -Destination $rollbackPath
    try {
        Move-Item -LiteralPath $tempPath -Destination $GraphPath
        $postValidationOutput = & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $validator -GraphPath $GraphPath -ProjectRoot $ProjectRoot -QueuePath $QueuePath -RegistryPath $RegistryPath -WorkflowPath $WorkflowPath -Format Json
        $postValidationExit = $LASTEXITCODE
        try { $postValidation = ($postValidationOutput -join [Environment]::NewLine) | ConvertFrom-Json } catch { throw 'Post-update graph validator did not return valid JSON.' }
        if ($postValidationExit -ne 0 -or [string]$postValidation.status -ne 'valid') { throw ('Updated execution graph is invalid: ' + (@($postValidation.problems) -join '; ')) }
        $committed = $true
        Remove-Item -LiteralPath $rollbackPath -Force
        $rollbackPath = $null
    }
    catch {
        Remove-Item -LiteralPath $GraphPath -Force -ErrorAction SilentlyContinue
        Move-Item -LiteralPath $rollbackPath -Destination $GraphPath -Force
        $rollbackPath = $null
        throw
    }

    [pscustomobject][ordered]@{
        status = 'updated'
        graphRunId = [string]$graph.graphRunId
        graphRevision = [int]$graph.graphRevision
        graphStatus = [string]$graph.status
        nodeId = $NodeId
        nodeStatus = $Status
        contentSha256 = Get-MarketingTextSha256 $updatedJson
        canonicalWriteAttempted = $false
        externalActionAttempted = $false
    } | ConvertTo-Json -Compress
}
finally {
    if ($null -ne $lock) { $lock.Dispose() }
    if ($null -ne $tempPath) { Remove-Item -LiteralPath $tempPath -Force -ErrorAction SilentlyContinue }
    if ($null -ne $rollbackPath -and (Test-Path -LiteralPath $rollbackPath)) { Remove-Item -LiteralPath $rollbackPath -Force -ErrorAction SilentlyContinue }
    Remove-Item -LiteralPath $lockPath -Force -ErrorAction SilentlyContinue
}
