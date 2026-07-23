[CmdletBinding()]
param(
    [string]$ConfigPath,
    [switch]$EnableCanonicalWrites,
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
. (Join-Path $PSScriptRoot 'MarketingChief.SitesBridgeCredential.ps1')

$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
if ([string]::IsNullOrWhiteSpace($ConfigPath)) {
    $ConfigPath = Join-Path $projectRoot 'state\hosted-sync-config.json'
}
$statePath = Join-Path $projectRoot 'state\hosted-sync-state.json'
$logPath = Join-Path $projectRoot 'state\hosted-sync.log.jsonl'
$queuePath = Join-Path $projectRoot 'queue\work-items.json'

function Read-JsonFile {
    param([Parameter(Mandatory = $true)][string]$Path)
    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) { return $null }
    Get-Content -LiteralPath $Path -Raw -Encoding UTF8 | ConvertFrom-Json
}

function ConvertTo-SafeBridgeMessage {
    param([AllowNull()][object]$Value)
    $message = ([string]$Value -replace '(?i)Bearer\s+[A-Za-z0-9._-]+', 'Bearer [redacted]' `
        -replace '(?i)(password|token|secret)\s*[:=]\s*\S+', '$1=[redacted]' `
        -replace '[\r\n]+', ' ').Trim()
    if ($message.Length -gt 500) { $message = $message.Substring(0, 500) }
    return $message
}

function Write-BridgeLog {
    param(
        [Parameter(Mandatory = $true)][string]$Event,
        [Parameter(Mandatory = $true)][string]$Status,
        [AllowNull()][object]$Detail
    )
    $entry = [pscustomobject][ordered]@{
        at = [DateTimeOffset]::UtcNow.ToString('o')
        event = $Event
        status = $Status
        detail = ConvertTo-SafeBridgeMessage $Detail
        containsSecrets = $false
        containsRawCommunications = $false
    }
    [IO.File]::AppendAllText(
        $logPath,
        (($entry | ConvertTo-Json -Compress) + [Environment]::NewLine),
        [Text.UTF8Encoding]::new($false)
    )
}

function Write-StateFile {
    param([Parameter(Mandatory = $true)][object]$State)
    $State.updatedAt = [DateTimeOffset]::UtcNow.ToString('o')
    $temp = "$statePath.tmp.$([guid]::NewGuid().ToString('N')).json"
    try {
        [IO.File]::WriteAllText(
            $temp,
            (($State | ConvertTo-Json -Depth 20) + [Environment]::NewLine),
            [Text.UTF8Encoding]::new($false)
        )
        Move-Item -LiteralPath $temp -Destination $statePath -Force
    }
    finally {
        Remove-Item -LiteralPath $temp -Force -ErrorAction SilentlyContinue
    }
}

function Invoke-MachineGet {
    param(
        [Parameter(Mandatory = $true)][string]$ApiUrl,
        [Parameter(Mandatory = $true)][string]$Token,
        [Parameter(Mandatory = $true)][string]$DispatchToken
    )
    Invoke-RestMethod -Uri $ApiUrl -Method Get -Headers @{
        Authorization = "Bearer $Token"
        'OAI-Sites-Authorization' = "Bearer $DispatchToken"
    } `
        -TimeoutSec 60 -UseBasicParsing
}

function Invoke-MachinePost {
    param(
        [Parameter(Mandatory = $true)][string]$ApiUrl,
        [Parameter(Mandatory = $true)][string]$Token,
        [Parameter(Mandatory = $true)][string]$DispatchToken,
        [Parameter(Mandatory = $true)][object]$Body
    )
    $json = $Body | ConvertTo-Json -Depth 100 -Compress
    Invoke-RestMethod -Uri $ApiUrl -Method Post -Headers @{
        Authorization = "Bearer $Token"
        'OAI-Sites-Authorization' = "Bearer $DispatchToken"
    } `
        -ContentType 'application/json; charset=utf-8' -Body $json -TimeoutSec 90 -UseBasicParsing
}

function Get-LocalQueueItem {
    param([Parameter(Mandatory = $true)][string]$WorkItemId)
    $queue = Read-JsonFile -Path $queuePath
    if ($null -eq $queue) { throw 'Canonical queue is unavailable.' }
    $matches = @($queue.workItems | Where-Object { [string]$_.id -ceq $WorkItemId })
    if ($matches.Count -ne 1) { return [pscustomobject]@{ queue = $queue; item = $null } }
    [pscustomobject]@{ queue = $queue; item = $matches[0] }
}

function Test-ExactRequestState {
    param([Parameter(Mandatory = $true)][object]$Request)
    $current = Get-LocalQueueItem -WorkItemId ([string]$Request.workItemId)
    $exact = (
        $null -ne $current.item -and
        [int]$current.queue.revision -eq [int]$Request.queueRevision -and
        [int]$current.item.version -eq [int]$Request.workItemVersion
    )
    [pscustomobject]@{ exact = $exact; queue = $current.queue; item = $current.item }
}

function Test-CanonicalWriteReady {
    $guardedPaths = @(
        'queue/work-items.json',
        'CONTROL.md',
        'state/prediction-outcomes.jsonl',
        'state/queue-mutations.jsonl'
    )
    $dirty = @(& git -C $projectRoot status --porcelain -- $guardedPaths 2>$null)
    if ($LASTEXITCODE -ne 0) { return [pscustomobject]@{ ready = $false; reason = 'git_status_failed' } }
    if ($dirty.Count -gt 0) { return [pscustomobject]@{ ready = $false; reason = 'canonical_paths_have_pending_changes' } }
    & git -C $projectRoot fetch origin --prune 2>$null | Out-Null
    if ($LASTEXITCODE -ne 0) { return [pscustomobject]@{ ready = $false; reason = 'git_fetch_failed' } }
    $counts = (& git -C $projectRoot rev-list --left-right --count HEAD...origin/main 2>$null) -split '\s+'
    if ($LASTEXITCODE -ne 0 -or $counts.Count -lt 2) {
        return [pscustomobject]@{ ready = $false; reason = 'git_divergence_check_failed' }
    }
    if ([int]$counts[0] -ne 0 -or [int]$counts[1] -ne 0) {
        return [pscustomobject]@{ ready = $false; reason = 'canonical_branch_not_exactly_synced' }
    }
    & git -C $projectRoot pull --ff-only origin main 2>$null | Out-Null
    if ($LASTEXITCODE -ne 0) { return [pscustomobject]@{ ready = $false; reason = 'git_fast_forward_failed' } }
    [pscustomobject]@{ ready = $true; reason = 'ready' }
}

function Publish-CanonicalPaths {
    param(
        [Parameter(Mandatory = $true)][string[]]$Paths,
        [Parameter(Mandatory = $true)][string]$Message
    )
    & git -C $projectRoot add -- $Paths
    if ($LASTEXITCODE -ne 0) { throw 'Failed to stage the exact canonical bridge paths.' }
    & git -C $projectRoot diff --cached --quiet
    if ($LASTEXITCODE -eq 0) { return }
    & git -C $projectRoot commit -m $Message | Out-Null
    if ($LASTEXITCODE -ne 0) { throw 'Failed to commit the canonical bridge update.' }
    & git -C $projectRoot push origin HEAD:main | Out-Null
    if ($LASTEXITCODE -ne 0) { throw 'Failed to fast-forward the canonical bridge update.' }
}

function Resolve-Operator {
    param(
        [Parameter(Mandatory = $true)][object]$Request,
        [Parameter(Mandatory = $true)][ValidateSet('acknowledged','completed','failed','superseded')][string]$State,
        [Parameter(Mandatory = $true)][string]$Summary,
        [AllowNull()][string]$SafeResultRef
    )
    if ($DryRun) { return }
    $body = [ordered]@{
        action = 'resolve-operator'
        id = [string]$Request.id
        state = $State
        resolutionSummary = $Summary
        safeResultRef = $SafeResultRef
    }
    Invoke-MachinePost -ApiUrl $machineApi -Token $token -DispatchToken $dispatchToken -Body $body | Out-Null
}

if (-not (Test-Path -LiteralPath $ConfigPath -PathType Leaf)) {
    throw "Hosted sync config not found: $ConfigPath"
}
$config = Read-JsonFile -Path $ConfigPath
if (
    $null -eq $config -or [int]$config.schemaVersion -ne 1 -or
    [string]$config.siteUrl -notmatch '^https://[A-Za-z0-9.-]+\.chatgpt\.site$' -or
    [string]$config.localStudioUrl -notmatch '^http://(?:127\.0\.0\.1|localhost):\d{2,5}/api/studio$' -or
    [string]$config.dispatchCredentialTarget -notmatch '^MarketingChief-[A-Za-z0-9._-]{1,100}$'
) { throw 'Hosted sync config is invalid.' }

$machineApi = ([string]$config.siteUrl).TrimEnd('/') + '/api/machine'
$token = Get-MarketingChiefSitesCredential -Target ([string]$config.credentialTarget)
$dispatchToken = Get-MarketingChiefSitesCredential -Target ([string]$config.dispatchCredentialTarget)
$state = Read-JsonFile -Path $statePath
if ($null -eq $state) {
    $state = [pscustomobject][ordered]@{
        schemaVersion = 1
        updatedAt = [DateTimeOffset]::UtcNow.ToString('o')
        processedChoices = @()
        processedOperatorRequests = @()
        lastSnapshotRevision = $null
        lastSnapshotAt = $null
        lastRunStatus = 'new'
    }
}
if ([int]$state.schemaVersion -ne 1) { throw 'Hosted sync state schema is unsupported.' }
$processedChoiceIds = @($state.processedChoices | ForEach-Object { [string]$_.id })
$processedRequestIds = @($state.processedOperatorRequests | ForEach-Object { [string]$_.id })

try {
    $remote = Invoke-MachineGet -ApiUrl $machineApi -Token $token -DispatchToken $dispatchToken
    if ([int]$remote.schemaVersion -ne 1) { throw 'Hosted machine response schema is unsupported.' }

    foreach ($choice in @($remote.hostedChoices)) {
        if ([string]$choice.id -in $processedChoiceIds) { continue }
        $current = Get-LocalQueueItem -WorkItemId ([string]$choice.workItemId)
        $exact = (
            $null -ne $current.item -and
            [int]$current.queue.revision -eq [int]$choice.queueRevision -and
            [int]$current.item.version -eq [int]$choice.workItemVersion -and
            [string]$current.item.nextAction -ceq [string]$choice.predictedAction
        )
        if (-not $exact) {
            $state.processedChoices = @($state.processedChoices) + [pscustomobject]@{
                id = [string]$choice.id
                status = 'superseded'
                processedAt = [DateTimeOffset]::UtcNow.ToString('o')
            }
            Write-BridgeLog -Event 'hosted-choice' -Status 'superseded' -Detail ([string]$choice.workItemId)
            continue
        }
        if (-not $EnableCanonicalWrites) {
            Write-BridgeLog -Event 'hosted-choice' -Status 'deferred' -Detail 'canonical_writes_disabled'
            continue
        }
        $writeReady = Test-CanonicalWriteReady
        if (-not $writeReady.ready) {
            Write-BridgeLog -Event 'hosted-choice' -Status 'deferred' -Detail $writeReady.reason
            continue
        }
        if (-not $DryRun) {
            $decisionArgs = @{
                WorkItemId = [string]$choice.workItemId
                PredictionLane = [string]$choice.predictionLane
                Decision = [string]$choice.decision
                Reason = "Owner choice recorded by the private Studio. sites-choice:$([string]$choice.id)"
                SourceChannel = 'user'
                TriggerClass = 'hosted_owner_choice'
                OutcomeClass = 'preference_feedback'
                Actor = 'dillon'
            }
            if (-not [string]::IsNullOrWhiteSpace([string]$choice.replacementAction)) {
                $decisionArgs.ReplacementAction = [string]$choice.replacementAction
            }
            & (Join-Path $PSScriptRoot 'Record-MarketingDecision.ps1') @decisionArgs | Out-Null
            & (Join-Path $PSScriptRoot 'Update-MarketingTrainingCheckpoint.ps1') -Trigger decision | Out-Null
            Publish-CanonicalPaths -Paths @(
                'state/prediction-outcomes.jsonl',
                'state/training-checkpoint.json',
                'state/training-runs.jsonl'
            ) -Message "Record private Studio choice for $([string]$choice.workItemId)"
        }
        $state.processedChoices = @($state.processedChoices) + [pscustomobject]@{
            id = [string]$choice.id
            status = if ($DryRun) { 'would-record' } else { 'recorded' }
            processedAt = [DateTimeOffset]::UtcNow.ToString('o')
        }
        Write-BridgeLog -Event 'hosted-choice' -Status 'recorded' -Detail ([string]$choice.workItemId)
    }

    foreach ($request in @($remote.operatorRequests | Where-Object { [string]$_.state -ceq 'queued' })) {
        if ([string]$request.id -in $processedRequestIds) { continue }
        $exactState = Test-ExactRequestState -Request $request
        if (-not $exactState.exact) {
            Resolve-Operator -Request $request -State superseded `
                -Summary 'The canonical queue or work-item version changed before Windows execution. Refresh and request the current action.' `
                -SafeResultRef ("sites-request:{0}" -f [string]$request.id)
            $state.processedOperatorRequests = @($state.processedOperatorRequests) + [pscustomobject]@{
                id = [string]$request.id
                status = 'superseded'
                processedAt = [DateTimeOffset]::UtcNow.ToString('o')
            }
            Write-BridgeLog -Event 'operator-request' -Status 'superseded' -Detail ([string]$request.workItemId)
            continue
        }

        $resolutionState = 'completed'
        $summary = ''
        $safeResultRef = $null
        switch ([string]$request.requestType) {
            'refresh_evidence' {
                if (-not $DryRun) {
                    & (Join-Path $PSScriptRoot 'Update-MarketingSystemHealth.ps1') | Out-Null
                    & (Join-Path $PSScriptRoot 'Update-MarketingTrainingCheckpoint.ps1') -Trigger manual | Out-Null
                }
                $summary = 'Refreshed the redacted system-health and governed training checkpoints without external delivery.'
                $safeResultRef = 'artifact:state/training-checkpoint.json'
            }
            'execute_local' {
                $execution = $exactState.item.execution
                if (
                    -not [bool]$execution.automaticEligible -or
                    [bool]$execution.externalAction -or
                    -not [bool]$execution.reversible
                ) { throw 'The current work item is not eligible for reversible local execution.' }
                $graphId = 'mgr-sites-' + ([string]$request.id -replace '-', '')
                $graphPath = Join-Path $projectRoot ("state\execution-graphs\{0}\{1}\execution-graph.json" -f [string]$request.workItemId, $graphId)
                if (-not $DryRun -and -not (Test-Path -LiteralPath $graphPath -PathType Leaf)) {
                    & (Join-Path $PSScriptRoot 'New-MarketingExecutionGraph.ps1') `
                        -WorkItemId ([string]$request.workItemId) `
                        -ExpectedQueueRevision ([int]$request.queueRevision) `
                        -ExpectedWorkItemVersion ([int]$request.workItemVersion) `
                        -GraphRunId $graphId | Out-Null
                    & (Join-Path $PSScriptRoot 'Test-MarketingExecutionGraph.ps1') `
                        -GraphPath $graphPath -Format Json | Out-Null
                }
                $resolutionState = 'acknowledged'
                $summary = 'Created and validated a version-bound local execution graph. No external action or canonical queue mutation occurred.'
                $safeResultRef = "graph-run:$graphId"
            }
            'defer' {
                if (-not $EnableCanonicalWrites) { throw 'Canonical writes are disabled for this bridge run.' }
                $writeReady = Test-CanonicalWriteReady
                if (-not $writeReady.ready) {
                    Write-BridgeLog -Event 'operator-request' -Status 'deferred' -Detail $writeReady.reason
                    continue
                }
                if (-not $DryRun) {
                    & (Join-Path $PSScriptRoot 'Update-MarketingQueue.ps1') `
                        -WorkItemId ([string]$request.workItemId) `
                        -ExpectedQueueRevision ([int]$request.queueRevision) `
                        -ExpectedWorkItemVersion ([int]$request.workItemVersion) `
                        -Status deferred | Out-Null
                    Publish-CanonicalPaths -Paths @(
                        'queue/work-items.json',
                        'CONTROL.md',
                        'state/queue-mutations.jsonl'
                    ) -Message "Defer $([string]$request.workItemId) from private Studio"
                }
                $summary = 'Deferred the exact version-bound canonical work item through the Marketing Chief writer.'
                $safeResultRef = "queue-item:$([string]$request.workItemId)"
            }
            'approve' {
                if (-not $EnableCanonicalWrites) { throw 'Canonical writes are disabled for this bridge run.' }
                $writeReady = Test-CanonicalWriteReady
                if (-not $writeReady.ready) {
                    Write-BridgeLog -Event 'operator-request' -Status 'deferred' -Detail $writeReady.reason
                    continue
                }
                if (-not $DryRun) {
                    $approvalArgs = @{
                        WorkItemId = [string]$request.workItemId
                        ExpectedQueueRevision = [int]$request.queueRevision
                        ExpectedWorkItemVersion = [int]$request.workItemVersion
                        ApprovalStatus = 'approved'
                        ApprovalRef = "sites-request:$([string]$request.id)"
                        Status = 'ready'
                    }
                    try {
                        & (Join-Path $PSScriptRoot 'Update-MarketingQueue.ps1') @approvalArgs | Out-Null
                    }
                    catch {
                        $approvalArgs.Remove('Status')
                        & (Join-Path $PSScriptRoot 'Update-MarketingQueue.ps1') @approvalArgs | Out-Null
                    }
                    Publish-CanonicalPaths -Paths @(
                        'queue/work-items.json',
                        'CONTROL.md',
                        'state/queue-mutations.jsonl'
                    ) -Message "Approve $([string]$request.workItemId) from private Studio"
                }
                $summary = 'Recorded the owner approval on the exact canonical item. The approval does not perform the gated external action.'
                $safeResultRef = "queue-item:$([string]$request.workItemId)"
            }
            default { throw 'The hosted operator request type is unsupported.' }
        }

        Resolve-Operator -Request $request -State $resolutionState -Summary $summary -SafeResultRef $safeResultRef
        $state.processedOperatorRequests = @($state.processedOperatorRequests) + [pscustomobject]@{
            id = [string]$request.id
            status = if ($DryRun) { "would-$resolutionState" } else { $resolutionState }
            processedAt = [DateTimeOffset]::UtcNow.ToString('o')
            safeResultRef = $safeResultRef
        }
        Write-BridgeLog -Event 'operator-request' -Status $resolutionState -Detail ([string]$request.workItemId)
    }

    $snapshot = Invoke-RestMethod -Uri ([string]$config.localStudioUrl) -Method Get -TimeoutSec 60 -UseBasicParsing
    if (
        [int]$snapshot.schemaVersion -ne 2 -or
        [int]$snapshot.portfolio.totalClients -ne @($snapshot.clients).Count -or
        [int]$snapshot.portfolio.fullyIntegratedClients -ne @($snapshot.clients).Count -or
        @($snapshot.clients).Count -lt 1
    ) { throw 'The local Studio snapshot failed client coverage checks.' }
    $snapshotJson = $snapshot | ConvertTo-Json -Depth 100 -Compress
    if ($snapshotJson -match '(?i)(?:bw://item/|authorization["'']?\s*[:=]\s*["'']?bearer|password\s*[:=])') {
        throw 'The local Studio snapshot contains prohibited secret-shaped data.'
    }
    if (-not $DryRun) {
        $syncResult = Invoke-MachinePost -ApiUrl $machineApi -Token $token -DispatchToken $dispatchToken -Body @{
            action = 'sync-snapshot'
            snapshot = $snapshot
        }
        $state.lastSnapshotRevision = [int]$syncResult.snapshot.queueRevision
        $state.lastSnapshotAt = [DateTimeOffset]::UtcNow.ToString('o')
    }
    $state.lastRunStatus = if ($DryRun) { 'dry-run-ok' } else { 'ok' }
    Write-StateFile -State $state
    Write-BridgeLog -Event 'snapshot-sync' -Status $state.lastRunStatus -Detail ("queue:{0};clients:{1}" -f [int]$snapshot.queue.revision, @($snapshot.clients).Count)
    [pscustomobject]@{
        status = $state.lastRunStatus
        queueRevision = [int]$snapshot.queue.revision
        clientCount = @($snapshot.clients).Count
        hostedChoiceCount = @($remote.hostedChoices).Count
        queuedOperatorRequestCount = @($remote.operatorRequests | Where-Object { [string]$_.state -ceq 'queued' }).Count
        credentialSource = 'Windows Credential Manager (machine and Sites dispatch credentials)'
        containsSecrets = $false
        containsRawCommunications = $false
    } | ConvertTo-Json -Compress
}
catch {
    $state.lastRunStatus = 'failed'
    Write-StateFile -State $state
    Write-BridgeLog -Event 'bridge-run' -Status 'failed' -Detail $_.Exception.Message
    throw (ConvertTo-SafeBridgeMessage $_.Exception.Message)
}
