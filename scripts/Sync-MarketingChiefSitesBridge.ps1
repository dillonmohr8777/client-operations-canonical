[CmdletBinding()]
param(
    [string]$ConfigPath,
    [switch]$EnableCanonicalWrites,
    [switch]$ForceBackup,
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
$backupRoot = 'C:\Users\dillo\AppData\Local\Codex\MarketingChief\SitesBackups'

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

function Write-HostedBackup {
    param(
        [Parameter(Mandatory = $true)][object]$Remote,
        [Parameter(Mandatory = $true)][object]$LocalSnapshot
    )
    if (-not (Test-Path -LiteralPath $backupRoot -PathType Container)) {
        New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null
    }

    $capturedAt = [DateTimeOffset]::Now
    $latestPath = Join-Path $backupRoot 'latest.json'
    $latest = Read-JsonFile -Path $latestPath
    $slotKey = $capturedAt.ToString('yyyyMMdd-HH')
    $scheduledHour = $capturedAt.Hour -in @(9, 17)
    if (
        -not $ForceBackup -and
        $null -ne $latest -and
        (-not $scheduledHour -or [string]$latest.slotKey -ceq $slotKey)
    ) {
        return [pscustomobject]@{
            path = [string]$latest.path
            contentHash = [string]$latest.contentHash
            changed = $false
            status = if ($scheduledHour) { 'current-slot-exists' } else { 'not-due' }
        }
    }

    $content = [pscustomobject][ordered]@{
        schemaVersion = 1
        remoteD1 = $Remote
        localSnapshot = $LocalSnapshot
    }
    $contentJson = $content | ConvertTo-Json -Depth 100 -Compress
    if ($contentJson -match '(?i)(?:bw://item/|authorization["'']?\s*[:=]\s*["'']?bearer|password\s*[:=]|api[_-]?key\s*[:=]|secret\s*[:=])') {
        throw 'The hosted backup contains prohibited secret-shaped data.'
    }

    $bytes = [Text.UTF8Encoding]::new($false).GetBytes($contentJson)
    $sha256 = [Security.Cryptography.SHA256]::Create()
    try {
        $hash = ([BitConverter]::ToString($sha256.ComputeHash($bytes)) -replace '-', '').ToLowerInvariant()
    }
    finally {
        $sha256.Dispose()
    }

    if ($null -ne $latest -and [string]$latest.contentHash -ceq $hash) {
        return [pscustomobject]@{
            path = [string]$latest.path
            contentHash = $hash
            changed = $false
            status = 'unchanged'
        }
    }

    $fileName = '{0}-{1}.json' -f $capturedAt.ToUniversalTime().ToString('yyyyMMddTHHmmssfffZ'), $hash.Substring(0, 12)
    $backupPath = Join-Path $backupRoot $fileName
    $tempPath = "$backupPath.tmp.$([guid]::NewGuid().ToString('N'))"
    try {
        [IO.File]::WriteAllText(
            $tempPath,
            (($content | Add-Member -MemberType NoteProperty -Name capturedAt -Value $capturedAt.ToString('o') -PassThru |
                ConvertTo-Json -Depth 100) + [Environment]::NewLine),
            [Text.UTF8Encoding]::new($false)
        )
        Move-Item -LiteralPath $tempPath -Destination $backupPath -Force
    }
    finally {
        Remove-Item -LiteralPath $tempPath -Force -ErrorAction SilentlyContinue
    }

    $manifest = [pscustomobject][ordered]@{
        schemaVersion = 1
        capturedAt = $capturedAt.ToString('o')
        slotKey = $slotKey
        path = $backupPath
        contentHash = $hash
        queueRevision = [int]$LocalSnapshot.queue.revision
    }
    $manifestTemp = "$latestPath.tmp.$([guid]::NewGuid().ToString('N'))"
    try {
        [IO.File]::WriteAllText(
            $manifestTemp,
            (($manifest | ConvertTo-Json) + [Environment]::NewLine),
            [Text.UTF8Encoding]::new($false)
        )
        Move-Item -LiteralPath $manifestTemp -Destination $latestPath -Force
    }
    finally {
        Remove-Item -LiteralPath $manifestTemp -Force -ErrorAction SilentlyContinue
    }

    $retentionFloor = [DateTime]::UtcNow.AddDays(-90)
    Get-ChildItem -LiteralPath $backupRoot -Filter '*.json' -File |
        Where-Object { $_.Name -ne 'latest.json' -and $_.LastWriteTimeUtc -lt $retentionFloor } |
        ForEach-Object {
            if ([IO.Path]::GetDirectoryName($_.FullName) -ceq $backupRoot) {
                Remove-Item -LiteralPath $_.FullName -Force
            }
        }

    [pscustomobject]@{
        path = $backupPath
        contentHash = $hash
        changed = $true
        status = 'created'
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

function Invoke-BridgeGit {
    param([Parameter(Mandatory = $true)][string[]]$Arguments)
    $previousPreference = $ErrorActionPreference
    try {
        # Windows PowerShell can promote ordinary Git progress written to stderr
        # into a terminating NativeCommandError when the bridge uses Stop.
        $ErrorActionPreference = 'Continue'
        $output = @(& git -C $projectRoot @Arguments 2>$null)
        $exitCode = $LASTEXITCODE
    }
    finally {
        $ErrorActionPreference = $previousPreference
    }
    [pscustomobject]@{ exitCode = $exitCode; output = $output }
}

function Test-CanonicalWriteReady {
    $guardedPaths = @(
        'queue/work-items.json',
        'CONTROL.md',
        'state/prediction-outcomes.jsonl',
        'state/queue-mutations.jsonl'
    )
    $statusResult = Invoke-BridgeGit -Arguments (@('status', '--porcelain', '--') + $guardedPaths)
    $dirty = @($statusResult.output)
    if ($statusResult.exitCode -ne 0) { return [pscustomobject]@{ ready = $false; reason = 'git_status_failed' } }
    if ($dirty.Count -gt 0) { return [pscustomobject]@{ ready = $false; reason = 'canonical_paths_have_pending_changes' } }
    $fetchResult = Invoke-BridgeGit -Arguments @('fetch', 'origin', '--prune')
    if ($fetchResult.exitCode -ne 0) { return [pscustomobject]@{ ready = $false; reason = 'git_fetch_failed' } }
    $divergenceResult = Invoke-BridgeGit -Arguments @('rev-list', '--left-right', '--count', 'HEAD...origin/main')
    $counts = ($divergenceResult.output -join ' ') -split '\s+'
    if ($divergenceResult.exitCode -ne 0 -or $counts.Count -lt 2) {
        return [pscustomobject]@{ ready = $false; reason = 'git_divergence_check_failed' }
    }
    if ([int]$counts[0] -ne 0 -or [int]$counts[1] -ne 0) {
        return [pscustomobject]@{ ready = $false; reason = 'canonical_branch_not_exactly_synced' }
    }
    $pullResult = Invoke-BridgeGit -Arguments @('pull', '--ff-only', 'origin', 'main')
    if ($pullResult.exitCode -ne 0) { return [pscustomobject]@{ ready = $false; reason = 'git_fast_forward_failed' } }
    [pscustomobject]@{ ready = $true; reason = 'ready' }
}

function Publish-CanonicalPaths {
    param(
        [Parameter(Mandatory = $true)][string[]]$Paths,
        [Parameter(Mandatory = $true)][string]$Message
    )
    $addResult = Invoke-BridgeGit -Arguments (@('add', '--') + $Paths)
    if ($addResult.exitCode -ne 0) { throw 'Failed to stage the exact canonical bridge paths.' }
    $diffResult = Invoke-BridgeGit -Arguments @('diff', '--cached', '--quiet')
    if ($diffResult.exitCode -eq 0) { return }
    $commitResult = Invoke-BridgeGit -Arguments @('commit', '-m', $Message)
    if ($commitResult.exitCode -ne 0) { throw 'Failed to commit the canonical bridge update.' }
    $pushResult = Invoke-BridgeGit -Arguments @('push', 'origin', 'HEAD:main')
    if ($pushResult.exitCode -ne 0) { throw 'Failed to fast-forward the canonical bridge update.' }
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

function Resolve-OwnerIntent {
    param(
        [Parameter(Mandatory = $true)][object]$Intent,
        [Parameter(Mandatory = $true)][ValidateSet('acknowledged','completed','failed','superseded')][string]$State,
        [Parameter(Mandatory = $true)][string]$Summary,
        [AllowNull()][string]$SafeResultRef
    )
    if ($DryRun) { return }
    $body = [ordered]@{
        action = 'resolve-intent'
        id = [string]$Intent.id
        state = $State
        resolutionSummary = $Summary
        safeResultRef = $SafeResultRef
    }
    Invoke-MachinePost -ApiUrl $machineApi -Token $token -DispatchToken $dispatchToken -Body $body | Out-Null
}

function Get-IntentActionClass {
    param([Parameter(Mandatory = $true)][string]$Mode)
    switch ($Mode) {
        'analyze' { return 'local_research' }
        'prepare' { return 'local_artifact' }
        'execute_safe' { return 'local_test' }
        'draft_for_approval' { return 'local_draft' }
        'monitor' { return 'read_only_verification' }
        default { throw 'The hosted owner intent mode is unsupported.' }
    }
}

function Get-ExistingIntentWorkItem {
    param([Parameter(Mandatory = $true)][string]$IntentId)
    $queue = Read-JsonFile -Path $queuePath
    if ($null -eq $queue) { throw 'Canonical queue is unavailable.' }
    $dedupeKey = "sites-intent:$IntentId"
    $matches = @($queue.workItems | Where-Object { [string]$_.dedupeKey -ceq $dedupeKey })
    if ($matches.Count -gt 1) { throw 'Multiple canonical work items claim the same hosted owner intent.' }
    [pscustomobject]@{
        queue = $queue
        item = if ($matches.Count -eq 1) { $matches[0] } else { $null }
    }
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
        processedOwnerIntents = @()
        lastSnapshotRevision = $null
        lastSnapshotAt = $null
        lastRunStatus = 'new'
    }
}
if ([int]$state.schemaVersion -ne 1) { throw 'Hosted sync state schema is unsupported.' }
if ($null -eq $state.PSObject.Properties['processedOwnerIntents']) {
    Add-Member -InputObject $state -MemberType NoteProperty -Name processedOwnerIntents -Value @()
}
$processedChoiceIds = @($state.processedChoices | ForEach-Object { [string]$_.id })
$processedRequestIds = @($state.processedOperatorRequests | ForEach-Object { [string]$_.id })
$processedIntentIds = @($state.processedOwnerIntents | ForEach-Object { [string]$_.id })

try {
    $remote = Invoke-MachineGet -ApiUrl $machineApi -Token $token -DispatchToken $dispatchToken
    if ([int]$remote.schemaVersion -ne 1) { throw 'Hosted machine response schema is unsupported.' }
    $remoteOwnerIntents = if ($null -ne $remote.PSObject.Properties['ownerIntents']) { @($remote.ownerIntents) } else { @() }

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

    foreach ($intent in @($remoteOwnerIntents | Where-Object { [string]$_.state -ceq 'queued' })) {
        if ([string]$intent.id -in $processedIntentIds) { continue }
        $intentId = [string]$intent.id
        $existingBinding = Get-ExistingIntentWorkItem -IntentId $intentId
        if ($null -ne $existingBinding.item) {
            $existingWorkItemId = [string]$existingBinding.item.id
            Resolve-OwnerIntent -Intent $intent -State completed `
                -Summary 'The exact client-routed instruction is already present in the canonical Marketing Chief queue.' `
                -SafeResultRef ("queue-item:{0}" -f $existingWorkItemId)
            $state.processedOwnerIntents = @($state.processedOwnerIntents) + [pscustomobject]@{
                id = $intentId
                status = 'completed-existing'
                processedAt = [DateTimeOffset]::UtcNow.ToString('o')
                safeResultRef = "queue-item:$existingWorkItemId"
            }
            Write-BridgeLog -Event 'owner-intent' -Status 'completed-existing' -Detail $existingWorkItemId
            continue
        }
        if (-not $EnableCanonicalWrites) {
            Write-BridgeLog -Event 'owner-intent' -Status 'deferred' -Detail 'canonical_writes_disabled'
            continue
        }
        $writeReady = Test-CanonicalWriteReady
        if (-not $writeReady.ready) {
            Write-BridgeLog -Event 'owner-intent' -Status 'deferred' -Detail $writeReady.reason
            continue
        }

        try {
            $queue = Read-JsonFile -Path $queuePath
            if ($null -eq $queue) { throw 'Canonical queue is unavailable.' }
            $actionClass = Get-IntentActionClass -Mode ([string]$intent.mode)
            $workItemArgs = @{
                Client = [string]$intent.clientId
                DedupeKey = "sites-intent:$intentId"
                Title = [string]$intent.title
                RequestedOutcome = [string]$intent.instruction
                SourceType = 'user'
                SourceLocator = "sites-intent:$intentId"
                SourceSummary = 'Authenticated owner instruction captured in the private Marketing Chief Studio.'
                Priority = [string]$intent.priority
                PriorityRationale = "Owner-set $([string]$intent.priority) priority in the private Marketing Chief Studio."
                NextAction = [string]$intent.instruction
                ActionClass = $actionClass
                DefinitionOfDone = @(
                    'Complete the requested local outcome and record allowlisted evidence.',
                    'Preserve the exact active client route and exclude raw communications, direct identifiers, and secrets.',
                    'Keep external delivery, publishing, spend, account changes, and destructive actions pending explicit approval.'
                )
                ApprovalTier = 'automatic'
                ApprovalAction = 'Local reversible preparation only. Any consequential external action remains separately approval-gated.'
                ExpectedQueueRevision = [int]$queue.revision
            }
            if (-not [string]::IsNullOrWhiteSpace([string]$intent.dueAt)) {
                $workItemArgs.DueAt = [string]$intent.dueAt
            }
            if ($DryRun) { $workItemArgs.DryRun = $true }
            $createdOutput = & (Join-Path $PSScriptRoot 'New-MarketingWorkItem.ps1') @workItemArgs
            $created = (($createdOutput -join [Environment]::NewLine) | ConvertFrom-Json)
            $workItemId = [string]$created.workItemId
            if ([string]::IsNullOrWhiteSpace($workItemId)) { throw 'The canonical work-item writer returned no work-item identifier.' }
            if (-not $DryRun) {
                Publish-CanonicalPaths -Paths @(
                    'queue/work-items.json',
                    'CONTROL.md',
                    'state/queue-mutations.jsonl'
                ) -Message "Capture private Studio instruction for $([string]$intent.clientId)"
            }
            Resolve-OwnerIntent -Intent $intent -State completed `
                -Summary 'Captured the exact owner instruction as a governed client-routed canonical work item. No external action was performed.' `
                -SafeResultRef ("queue-item:{0}" -f $workItemId)
            $state.processedOwnerIntents = @($state.processedOwnerIntents) + [pscustomobject]@{
                id = $intentId
                status = if ($DryRun) { 'would-create' } else { 'completed' }
                processedAt = [DateTimeOffset]::UtcNow.ToString('o')
                safeResultRef = "queue-item:$workItemId"
            }
            Write-BridgeLog -Event 'owner-intent' -Status 'completed' -Detail $workItemId
        }
        catch {
            $safeFailure = ConvertTo-SafeBridgeMessage $_.Exception.Message
            Resolve-OwnerIntent -Intent $intent -State failed `
                -Summary ("The instruction could not enter the canonical queue safely: {0}" -f $safeFailure) `
                -SafeResultRef ("sites-request:{0}" -f $intentId)
            $state.processedOwnerIntents = @($state.processedOwnerIntents) + [pscustomobject]@{
                id = $intentId
                status = 'failed'
                processedAt = [DateTimeOffset]::UtcNow.ToString('o')
            }
            Write-BridgeLog -Event 'owner-intent' -Status 'failed' -Detail $safeFailure
        }
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
        $backup = Write-HostedBackup -Remote $remote -LocalSnapshot $snapshot
        Write-BridgeLog -Event 'hosted-backup' -Status $backup.status `
            -Detail ("queue:{0};hash:{1}" -f [int]$snapshot.queue.revision, $backup.contentHash.Substring(0, 12))
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
        queuedOwnerIntentCount = @($remoteOwnerIntents | Where-Object { [string]$_.state -ceq 'queued' }).Count
        backupRoot = $backupRoot
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
