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
. (Join-Path $PSScriptRoot 'MarketingOs.Common.ps1')

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

function Resolve-HostedChoice {
    param(
        [Parameter(Mandatory = $true)][object]$Choice,
        [Parameter(Mandatory = $true)][ValidateSet('imported','superseded','failed')][string]$State,
        [AllowNull()][string]$CanonicalOutcomeId
    )
    if ($DryRun) { return }
    $body = @{
        action = 'resolve-choice'
        id = [string]$Choice.id
        state = $State
        canonicalOutcomeId = $CanonicalOutcomeId
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
    param(
        [Parameter(Mandatory = $true)][string]$Mode,
        [Parameter(Mandatory = $true)][string]$Instruction
    )
    # The UI mode describes the owner's desired handling, but it cannot make
    # consequential account or outside-world work automatically executable.
    # Fail closed on explicit integration/access and delivery language.
    if ($Instruction -match '(?i)\b(?:integrat(?:e|ed|ion)|connect|install|authorize|grant access|change permissions?)\b.{0,120}\b(?:Slack|Cursor|account|workspace|app|integration)\b') {
        return 'account_change'
    }
    if ($Instruction -match '(?i)\b(?:publish|post|go live)\b') { return 'publishing' }
    if ($Instruction -match '(?i)\bdeploy\b') { return 'deployment' }
    if ($Instruction -match '(?i)\b(?:spend|purchase|buy|pay|charge|raise budget|increase budget)\b') { return 'spend' }
    if ($Instruction -match '(?i)\b(?:delete|remove account)\b') { return 'destructive' }
    if (Test-MarketingRiskyActionText $Instruction) { return 'external_delivery' }
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

