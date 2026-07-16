[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$SystemBacklogId,
    [Parameter(Mandatory = $true)][int]$ExpectedQueueRevision,
    [Parameter(Mandatory = $true)][string]$Risk,
    [Parameter(Mandatory = $true)][string]$NextAction,
    [Parameter(Mandatory = $true)][string]$CredentialVaultState,
    [Parameter(Mandatory = $true)][string]$CredentialBridgeState,
    [ValidateSet('marketing-chief')][string]$Writer = 'marketing-chief',
    [string]$QueuePath,
    [string]$ControlPath,
    [string]$HealthPath,
    [string]$BackupRoot,
    [string]$MutationLogPath,
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'MarketingOs.Common.ps1')

$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
if ([string]::IsNullOrWhiteSpace($QueuePath)) { $QueuePath = Join-Path $projectRoot 'queue\work-items.json' }
else { $QueuePath = [IO.Path]::GetFullPath($QueuePath) }
if ([string]::IsNullOrWhiteSpace($ControlPath)) { $ControlPath = Join-Path $projectRoot 'CONTROL.md' }
else { $ControlPath = [IO.Path]::GetFullPath($ControlPath) }
if ([string]::IsNullOrWhiteSpace($HealthPath)) { $HealthPath = Join-Path $projectRoot 'state\system-health.json' }
else { $HealthPath = [IO.Path]::GetFullPath($HealthPath) }
if ([string]::IsNullOrWhiteSpace($BackupRoot)) { $BackupRoot = Join-Path $projectRoot 'backups' }
else { $BackupRoot = [IO.Path]::GetFullPath($BackupRoot) }
if ([string]::IsNullOrWhiteSpace($MutationLogPath)) { $MutationLogPath = Join-Path $projectRoot 'state\queue-mutations.jsonl' }
else { $MutationLogPath = [IO.Path]::GetFullPath($MutationLogPath) }

if ($SystemBacklogId -notmatch '^sys-[A-Za-z0-9][A-Za-z0-9-]{1,155}$') {
    throw 'SystemBacklogId must be a path-safe sys-* identifier.'
}
foreach ($field in @(
    @{ Name = 'SystemBacklogId'; Value = $SystemBacklogId; Max = 160 },
    @{ Name = 'Risk'; Value = $Risk; Max = 5000 },
    @{ Name = 'NextAction'; Value = $NextAction; Max = 3000 },
    @{ Name = 'CredentialVaultState'; Value = $CredentialVaultState; Max = 1000 },
    @{ Name = 'CredentialBridgeState'; Value = $CredentialBridgeState; Max = 1000 }
)) {
    if ([string]::IsNullOrWhiteSpace([string]$field.Value)) { throw "$($field.Name) cannot be empty." }
    if (([string]$field.Value).Length -gt [int]$field.Max) { throw "$($field.Name) exceeds its length limit." }
    if (-not (Test-MarketingSafeText ([string]$field.Value))) {
        throw "$($field.Name) contains secret, direct-identifier, or raw-communication material."
    }
}

foreach ($requiredPath in @($QueuePath, $ControlPath, $HealthPath)) {
    if (-not (Test-Path -LiteralPath $requiredPath -PathType Leaf)) { throw "Required file not found: $requiredPath" }
}

$lockPath = Join-Path $projectRoot 'state\.marketing-chief.lock'
$lock = $null
$queueTemp = $null
$controlTemp = $null
try {
    $lock = [IO.File]::Open($lockPath, [IO.FileMode]::OpenOrCreate, [IO.FileAccess]::ReadWrite, [IO.FileShare]::None)
    $queue = Get-Content -LiteralPath $QueuePath -Raw -Encoding UTF8 | ConvertFrom-Json
    if ([int]$queue.revision -ne $ExpectedQueueRevision) {
        throw "Stale queue revision. Expected $ExpectedQueueRevision; current is $($queue.revision)."
    }

    $matches = @($queue.systemBacklog | Where-Object { $_.id -eq $SystemBacklogId })
    if ($matches.Count -ne 1) { throw 'System backlog item must resolve exactly once.' }
    $item = $matches[0]
    if ([string]$item.status -ne 'blocked') {
        throw 'This evidence-refresh transaction may only update a blocked system backlog item.'
    }
    if ($null -eq $queue.systemHealth) { throw 'Queue systemHealth is missing.' }

    $priorClientVersions = @($queue.workItems | ForEach-Object { '{0}:{1}' -f $_.id, [int]$_.version })
    $now = [DateTimeOffset]::UtcNow.ToString('o')
    $item.risk = $Risk.Trim()
    $item.nextAction = $NextAction.Trim()
    $queue.systemHealth.asOf = $now
    $queue.systemHealth.credentialVault = $CredentialVaultState.Trim()
    $queue.systemHealth.credentialBridge = $CredentialBridgeState.Trim()
    $queue.revision = [int]$queue.revision + 1
    $queue.updatedAt = $now
    $queue.updatedBy = $Writer

    $currentClientVersions = @($queue.workItems | ForEach-Object { '{0}:{1}' -f $_.id, [int]$_.version })
    if (($priorClientVersions -join '|') -cne ($currentClientVersions -join '|')) {
        throw 'System-state refresh changed a client work-item version.'
    }

    $token = [guid]::NewGuid().ToString('N')
    $queueTemp = Join-Path (Split-Path -Parent $QueuePath) ".work-items.$token.tmp.json"
    $controlTemp = Join-Path (Split-Path -Parent $ControlPath) ".CONTROL.$token.tmp.md"
    [IO.File]::WriteAllText($queueTemp, (($queue | ConvertTo-Json -Depth 100) + [Environment]::NewLine), [Text.UTF8Encoding]::new($false))
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'Update-MarketingControl.ps1') -QueuePath $queueTemp -OutputPath $controlTemp -HealthPath $HealthPath -AsOf $now -InternalRender | Out-Null
    if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $controlTemp -PathType Leaf)) {
        throw 'CONTROL rendering failed; canonical state was not changed.'
    }

    if ($DryRun) {
        [pscustomobject][ordered]@{
            status = 'would-update'
            systemBacklogId = [string]$item.id
            systemBacklogStatus = [string]$item.status
            priorQueueRevision = $ExpectedQueueRevision
            queueRevision = [int]$queue.revision
            clientWorkItemVersionsPreserved = $true
        } | ConvertTo-Json -Compress
        return
    }

    New-Item -ItemType Directory -Path $BackupRoot -Force | Out-Null
    $backupChild = '{0}-system-state-{1}-{2}' -f [DateTimeOffset]::UtcNow.ToString('yyyyMMddTHHmmssZ'), $SystemBacklogId, $token.Substring(0, 8)
    $backupDirectory = Resolve-MarketingChildPath -Root $BackupRoot -Child $backupChild
    New-Item -ItemType Directory -Path $backupDirectory -Force | Out-Null
    $queueBackup = Resolve-MarketingChildPath -Root $backupDirectory -Child 'work-items.json'
    $controlBackup = Resolve-MarketingChildPath -Root $backupDirectory -Child 'CONTROL.md'
    Copy-Item -LiteralPath $QueuePath -Destination $queueBackup -Force
    Copy-Item -LiteralPath $ControlPath -Destination $controlBackup -Force

    try {
        Move-Item -LiteralPath $queueTemp -Destination $QueuePath -Force
        $queueTemp = $null
        Move-Item -LiteralPath $controlTemp -Destination $ControlPath -Force
        $controlTemp = $null
    }
    catch {
        Copy-Item -LiteralPath $queueBackup -Destination $QueuePath -Force
        Copy-Item -LiteralPath $controlBackup -Destination $ControlPath -Force
        throw
    }

    $mutation = [pscustomobject][ordered]@{
        schemaVersion = 1
        mutationId = 'qm-' + [guid]::NewGuid().ToString('N')
        recordedAt = $now
        action = 'system-state-update'
        systemBacklogId = [string]$item.id
        priorQueueRevision = $ExpectedQueueRevision
        queueRevision = [int]$queue.revision
        writer = $Writer
        externalActionTaken = $false
        backup = $backupDirectory
    }
    $auditRecorded = $true
    try {
        $mutationDirectory = Split-Path -Parent $MutationLogPath
        if (-not (Test-Path -LiteralPath $mutationDirectory)) { New-Item -ItemType Directory -Path $mutationDirectory -Force | Out-Null }
        [IO.File]::AppendAllText($MutationLogPath, (($mutation | ConvertTo-Json -Compress -Depth 10) + [Environment]::NewLine), [Text.UTF8Encoding]::new($false))
    }
    catch { $auditRecorded = $false }

    [pscustomobject][ordered]@{
        status = 'updated'
        systemBacklogId = [string]$item.id
        systemBacklogStatus = [string]$item.status
        priorQueueRevision = $ExpectedQueueRevision
        queueRevision = [int]$queue.revision
        clientWorkItemVersionsPreserved = $true
        auditRecorded = $auditRecorded
        backup = $backupDirectory
    } | ConvertTo-Json -Compress
}
finally {
    if ($null -ne $lock) { $lock.Dispose() }
    if (-not [string]::IsNullOrWhiteSpace([string]$queueTemp)) { Remove-Item -LiteralPath $queueTemp -Force -ErrorAction SilentlyContinue }
    if (-not [string]::IsNullOrWhiteSpace([string]$controlTemp)) { Remove-Item -LiteralPath $controlTemp -Force -ErrorAction SilentlyContinue }
}
