[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$tempRoot = Join-Path ([IO.Path]::GetTempPath()) ('marketing-graph-test-' + [guid]::NewGuid().ToString('N'))
$checks = New-Object System.Collections.Generic.List[object]

function Add-Check {
    param([string]$Name, [bool]$Passed, [string]$Detail)
    $checks.Add([pscustomobject][ordered]@{ name = $Name; passed = $Passed; detail = $Detail })
    if (-not $Passed) { throw "$Name failed: $Detail" }
}

function Write-JsonFile {
    param([string]$Path, $Value)
    $directory = Split-Path -Parent $Path
    [IO.Directory]::CreateDirectory($directory) | Out-Null
    [IO.File]::WriteAllText($Path, (($Value | ConvertTo-Json -Depth 100) + [Environment]::NewLine), [Text.UTF8Encoding]::new($false))
}

function Invoke-JsonScript {
    param([string]$ScriptPath, [hashtable]$Arguments, [switch]$ExpectFailure)
    $argumentList = New-Object System.Collections.Generic.List[string]
    $argumentList.Add('-NoProfile')
    $argumentList.Add('-ExecutionPolicy')
    $argumentList.Add('Bypass')
    $argumentList.Add('-File')
    $argumentList.Add($ScriptPath)
    foreach ($key in $Arguments.Keys) {
        $argumentList.Add('-' + $key)
        $value = $Arguments[$key]
        if ($value -is [System.Array]) { foreach ($entry in $value) { $argumentList.Add([string]$entry) } }
        elseif ($value -is [bool]) { if ($value) { continue } else { $argumentList.Add('false') } }
        else { $argumentList.Add([string]$value) }
    }
    $savedPreference = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try { $output = & powershell.exe @argumentList 2>&1 }
    finally { $ErrorActionPreference = $savedPreference }
    $exitCode = $LASTEXITCODE
    if ($ExpectFailure) { return [pscustomobject]@{ ExitCode = $exitCode; Output = ($output -join [Environment]::NewLine); Json = $null } }
    if ($exitCode -ne 0) { throw "Script failed ($exitCode): $($output -join [Environment]::NewLine)" }
    $json = $null
    try { $json = ($output -join [Environment]::NewLine) | ConvertFrom-Json } catch { throw "Script did not return JSON: $($output -join [Environment]::NewLine)" }
    return [pscustomobject]@{ ExitCode = $exitCode; Output = ($output -join [Environment]::NewLine); Json = $json }
}

try {
    foreach ($directory in @('queue', 'registry', 'workflows', 'state', 'clients\graph-test-client', 'clients\other-client')) {
        [IO.Directory]::CreateDirectory((Join-Path $tempRoot $directory)) | Out-Null
    }
    Copy-Item -LiteralPath (Join-Path $projectRoot 'workflows\marketing-chief-execution-graph.workflow.json') -Destination (Join-Path $tempRoot 'workflows\marketing-chief-execution-graph.workflow.json')

    $now = [DateTimeOffset]::UtcNow.ToString('o')
    $item = [pscustomobject][ordered]@{
        id = 'wi-graph-test-0001'
        version = 1
        clientId = 'graph-test-client'
        title = 'Verify a local graph-backed package'
        requestedOutcome = 'Produce a locally verified package with exact provenance.'
        status = 'verification'
        lane = 'normal'
        nextAction = 'Run local verification and return a bounded handoff.'
        priority = [pscustomobject]@{ level = 'P1'; rationale = 'Focused graph contract test.' }
        source = [pscustomobject]@{ locator = 'clients/graph-test-client/CLIENT.md' }
        evidence = [pscustomobject]@{ refs = @('clients/graph-test-client/CLIENT.md'); freshness = 'current'; asOf = $now }
        artifactRefs = @()
        dependencies = @()
        routing = [pscustomobject]@{ status = 'resolved'; registryStatus = 'active'; verifiedAt = $now }
        execution = [pscustomobject]@{ actionClass = 'local_test'; automaticEligible = $true; externalAction = $false; reversible = $true }
        approval = [pscustomobject]@{ tier = 'automatic'; status = 'not_required'; approvalRef = $null }
        definitionOfDone = @('The graph validates against the exact work-item version.', 'The handoff contains independent local verification evidence.')
        outcome = [pscustomobject]@{ summary = 'Local worker execution completed and is ready for independent verification.' }
    }
    $queue = [pscustomobject][ordered]@{ schemaVersion = 1; revision = 7; workItems = @($item) }
    $registry = [pscustomobject][ordered]@{ schemaVersion = 1; clients = @(
        [pscustomobject]@{ id = 'graph-test-client'; status = 'active' },
        [pscustomobject]@{ id = 'other-client'; status = 'active' }
    ) }
    $queuePath = Join-Path $tempRoot 'queue\work-items.json'
    $registryPath = Join-Path $tempRoot 'registry\clients.json'
    $workflowPath = Join-Path $tempRoot 'workflows\marketing-chief-execution-graph.workflow.json'
    Write-JsonFile $queuePath $queue
    Write-JsonFile $registryPath $registry

    $generator = Join-Path $projectRoot 'scripts\New-MarketingExecutionGraph.ps1'
    $validator = Join-Path $projectRoot 'scripts\Test-MarketingExecutionGraph.ps1'
    $updater = Join-Path $projectRoot 'scripts\Update-MarketingExecutionGraph.ps1'
    $handoffBuilder = Join-Path $projectRoot 'scripts\New-MarketingGraphHandoff.ps1'
    $handoffValidator = Join-Path $projectRoot 'scripts\Test-MarketingHandoff.ps1'
    $common = @{ ProjectRoot = $tempRoot; QueuePath = $queuePath; RegistryPath = $registryPath; WorkflowPath = $workflowPath }

    $createArgs = $common.Clone()
    $createArgs.WorkItemId = 'wi-graph-test-0001'
    $createArgs.ExpectedQueueRevision = 7
    $createArgs.ExpectedWorkItemVersion = 1
    $createArgs.GraphRunId = 'mgr-focused-graph-test-0001'
    $created = Invoke-JsonScript -ScriptPath $generator -Arguments $createArgs
    Add-Check 'graph-create' ($created.Json.status -eq 'created' -and -not [bool]$created.Json.canonicalWriteAttempted) 'Graph was created without a canonical write.'
    $graphPath = Join-Path $tempRoot (($created.Json.graphPath -replace '/', '\'))

    $validateArgs = $common.Clone(); $validateArgs.GraphPath = $graphPath; $validateArgs.Format = 'Json'
    $validated = Invoke-JsonScript -ScriptPath $validator -Arguments $validateArgs
    Add-Check 'graph-valid' ($validated.Json.status -eq 'valid') 'Initial graph validates.'
    $graph = Get-Content -LiteralPath $graphPath -Raw -Encoding UTF8 | ConvertFrom-Json
    Add-Check 'verifier-per-definition' (@($graph.nodes | Where-Object kind -eq 'verification').Count -eq @($item.definitionOfDone).Count) 'Every definition of done has exactly one verifier node.'

    $staleArgs = $createArgs.Clone(); $staleArgs.ExpectedQueueRevision = 6; $staleArgs.GraphRunId = 'mgr-focused-stale-test-0001'
    $stale = Invoke-JsonScript -ScriptPath $generator -Arguments $staleArgs -ExpectFailure
    Add-Check 'stale-queue-rejected' ($stale.ExitCode -ne 0 -and $stale.Output -match 'Stale queue revision') 'A stale queue snapshot is rejected.'

    $queue.workItems[0].artifactRefs = @('clients/other-client/leak.txt')
    Write-JsonFile $queuePath $queue
    $crossArgs = $createArgs.Clone(); $crossArgs.GraphRunId = 'mgr-focused-cross-client-0001'
    $cross = Invoke-JsonScript -ScriptPath $generator -Arguments $crossArgs -ExpectFailure
    Add-Check 'cross-client-rejected' ($cross.ExitCode -ne 0 -and $cross.Output -match 'exact client') 'Cross-client artifact binding is rejected.'
    $queue.workItems[0].artifactRefs = @()

    $queue.revision = 8
    Write-JsonFile $queuePath $queue
    $advanced = Invoke-JsonScript -ScriptPath $validator -Arguments $validateArgs
    Add-Check 'unrelated-queue-advance' ($advanced.Json.status -eq 'valid' -and @($advanced.Json.warnings).Count -gt 0) 'An unrelated queue revision advance warns but does not invalidate unchanged work.'

    $queue.workItems[0].version = 2
    Write-JsonFile $queuePath $queue
    $changed = Invoke-JsonScript -ScriptPath $validator -Arguments $validateArgs -ExpectFailure
    Add-Check 'work-item-stale-rejected' ($changed.ExitCode -ne 0 -and $changed.Output -match 'work-item version changed') 'An exact work-item version change invalidates the graph.'
    $queue.workItems[0].version = 1
    Write-JsonFile $queuePath $queue

    $queueBeforeExecutionHash = (Get-FileHash -LiteralPath $queuePath -Algorithm SHA256).Hash
    for ($index = 1; $index -le 2; $index++) {
        $updateArgs = $common.Clone()
        $updateArgs.GraphPath = $graphPath
        $updateArgs.ExpectedGraphRevision = $index
        $updateArgs.NodeId = 'verify-{0:d2}' -f $index
        $updateArgs.Status = 'completed'
        $updateArgs.Actor = 'independent-verifier'
        $updateArgs.Summary = "Definition-of-done check $index passed in the isolated local fixture."
        $updateArgs.Verification = @("Focused verifier $index passed.")
        $updated = Invoke-JsonScript -ScriptPath $updater -Arguments $updateArgs
        Add-Check ("verifier-{0:d2}-complete" -f $index) ($updated.Json.nodeStatus -eq 'completed') 'Verifier completion was revision checked and validated.'
    }
    $graph = Get-Content -LiteralPath $graphPath -Raw -Encoding UTF8 | ConvertFrom-Json
    Add-Check 'handoff-auto-ready' ((@($graph.nodes | Where-Object kind -eq 'handoff_assembly')[0]).status -eq 'ready') 'Handoff becomes ready only after every verifier passes.'

    $handoffPath = Join-Path $tempRoot 'state\worker-handoffs\handoff-focused-graph-test-0001.json'
    $handoffArgs = $common.Clone()
    $handoffArgs.GraphPath = $graphPath
    $handoffArgs.ExpectedGraphRevision = 3
    $handoffArgs.WorkerRole = 'bounded-worker'
    $handoffArgs.Status = 'completed'
    $handoffArgs.ProposedTransition = 'done'
    $handoffArgs.Summary = 'The isolated local graph completed worker execution, exact verifier coverage, and bounded handoff assembly.'
    $handoffArgs.Verification = @('Both independent definition-of-done verifier nodes passed.')
    $handoffArgs.HandoffId = 'handoff-focused-graph-test-0001'
    $handoffArgs.OutputPath = $handoffPath
    $handoffCreated = Invoke-JsonScript -ScriptPath $handoffBuilder -Arguments $handoffArgs
    Add-Check 'handoff-created' ($handoffCreated.Json.status -eq 'created' -and $handoffCreated.Json.graphStatus -eq 'handoff_ready') 'Schema-valid graph evidence was assembled into a bounded handoff.'

    $handoffValidationArgs = @{ HandoffPath = $handoffPath; ProjectRoot = $tempRoot; QueuePath = $queuePath; RegistryPath = $registryPath; Format = 'Json' }
    $handoffValidated = Invoke-JsonScript -ScriptPath $handoffValidator -Arguments $handoffValidationArgs
    Add-Check 'handoff-valid' ($handoffValidated.Json.status -eq 'valid') 'Canonical handoff validator accepts the graph-backed handoff.'
    $queueAfterExecutionHash = (Get-FileHash -LiteralPath $queuePath -Algorithm SHA256).Hash
    Add-Check 'queue-unchanged' ($queueBeforeExecutionHash -eq $queueAfterExecutionHash) 'Graph execution and handoff assembly did not mutate the canonical queue.'

    $approvalItem = $item | ConvertTo-Json -Depth 100 | ConvertFrom-Json
    $approvalItem.id = 'wi-graph-test-approval'
    $approvalItem.version = 1
    $approvalItem.status = 'needs_approval'
    $approvalItem.nextAction = 'Await explicit approval before external delivery.'
    $approvalItem.execution.actionClass = 'external_delivery'
    $approvalItem.execution.automaticEligible = $false
    $approvalItem.execution.externalAction = $true
    $approvalItem.execution.reversible = $false
    $approvalItem.approval.tier = 'explicit'
    $approvalItem.approval.status = 'pending'
    $queue.revision = 9
    $queue.workItems = @($item, $approvalItem)
    Write-JsonFile $queuePath $queue
    $approvalArgs = $common.Clone()
    $approvalArgs.WorkItemId = 'wi-graph-test-approval'
    $approvalArgs.ExpectedQueueRevision = 9
    $approvalArgs.ExpectedWorkItemVersion = 1
    $approvalArgs.GraphRunId = 'mgr-focused-approval-test-0001'
    $approvalCreated = Invoke-JsonScript -ScriptPath $generator -Arguments $approvalArgs
    $approvalGraphPath = Join-Path $tempRoot (($approvalCreated.Json.graphPath -replace '/', '\'))
    $approvalGraph = Get-Content -LiteralPath $approvalGraphPath -Raw -Encoding UTF8 | ConvertFrom-Json
    $approvalWorker = @($approvalGraph.nodes | Where-Object kind -eq 'worker_execution')[0]
    $approvalGate = @($approvalGraph.nodes | Where-Object kind -eq 'approval_gate')[0]
    Add-Check 'approval-fails-closed' ($approvalGraph.status -eq 'blocked' -and $approvalWorker.status -eq 'blocked' -and $approvalGate.status -eq 'blocked') 'Explicit external work remains blocked inside the graph.'

    [pscustomobject][ordered]@{
        status = 'passed'
        checkCount = $checks.Count
        checks = $checks.ToArray()
    } | ConvertTo-Json -Depth 8
}
finally {
    if (Test-Path -LiteralPath $tempRoot) {
        $resolvedTemp = [IO.Path]::GetFullPath($tempRoot)
        $tempPrefix = [IO.Path]::GetFullPath([IO.Path]::GetTempPath()).TrimEnd('\') + '\'
        if ($resolvedTemp.StartsWith($tempPrefix, [StringComparison]::OrdinalIgnoreCase) -and (Split-Path -Leaf $resolvedTemp) -like 'marketing-graph-test-*') {
            Remove-Item -LiteralPath $resolvedTemp -Recurse -Force
        }
    }
}
