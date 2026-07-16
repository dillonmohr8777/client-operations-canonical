[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$HandoffPath,
    [Parameter(Mandatory = $true)]
    [int]$ExpectedQueueRevision,
    [ValidateSet('marketing-chief')]
    [string]$Writer = 'marketing-chief',
    [string]$QueuePath,
    [string]$ControlPath,
    [string]$RegistryPath,
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
. (Join-Path $PSScriptRoot 'MarketingOs.Common.ps1')
if ([string]::IsNullOrWhiteSpace($QueuePath)) { $QueuePath = Join-Path $projectRoot 'queue\work-items.json' }
if ([string]::IsNullOrWhiteSpace($ControlPath)) { $ControlPath = Join-Path $projectRoot 'CONTROL.md' }
if ([string]::IsNullOrWhiteSpace($RegistryPath)) { $RegistryPath = Join-Path $projectRoot 'registry\clients.json' }

function Assert-HandoffAgainstItem {
    param($Handoff, $Item)

    if ([string]$Handoff.handoffId -notmatch '^[A-Za-z0-9][A-Za-z0-9_-]{7,159}$') { throw 'Handoff ID is not a safe slug.' }
    if (-not (Test-MarketingWorkerTransition -WorkerStatus ([string]$Handoff.status) -ProposedTransition ([string]$Handoff.proposedTransition))) { throw 'Worker status cannot propose that transition.' }
    if (-not (Test-MarketingStatusTransition -From ([string]$Item.status) -To ([string]$Handoff.proposedTransition))) { throw 'Queue status cannot make the proposed transition.' }
    if ([string]$Handoff.privacy -ne 'redacted' -or [bool]$Handoff.containsSecrets -or [bool]$Handoff.containsDirectIdentifiers -or [bool]$Handoff.containsRawCommunications) { throw 'Handoff privacy assertions are not safe.' }
    if ([bool]$Handoff.canonicalWriteAttempted -or [bool]$Handoff.externalActionAttempted) { throw 'Worker attempted a prohibited canonical or external action.' }
    if (-not (Test-MarketingSafeText ([string]$Handoff.summary))) { throw 'Handoff summary is unsafe.' }
    foreach ($entry in @($Handoff.evidence)) { if (-not (Test-MarketingSafeLocator ([string]$entry))) { throw 'Handoff evidence contains an unsafe locator.' } }
    foreach ($field in @('verification','assumptions','risks')) { foreach ($entry in @($Handoff.$field)) { if (-not (Test-MarketingSafeText ([string]$entry))) { throw "Handoff $field contains unsafe text." } } }

    if ($Item.PSObject.Properties.Name -notcontains 'approval' -or $null -eq $Item.approval) { throw 'Work-item approval state is missing.' }
    $tier = [string]$Item.approval.tier
    $approvalStatus = [string]$Item.approval.status
    $approvalRef = [string]$Item.approval.approvalRef
    $pendingExplicit = $tier -eq 'explicit' -and $approvalStatus -eq 'pending'
    $approvalCleared = ($tier -eq 'automatic' -and $approvalStatus -eq 'not_required') -or ($tier -eq 'explicit' -and $approvalStatus -eq 'approved' -and -not [string]::IsNullOrWhiteSpace($approvalRef))

    if ($tier -notin @('automatic','explicit')) { throw 'Work-item approval tier is invalid.' }
    if ($approvalStatus -notin @('pending','approved','rejected','not_required')) { throw 'Work-item approval status is invalid.' }
    if ($tier -eq 'automatic' -and $approvalStatus -ne 'not_required') { throw 'Automatic work item has inconsistent approval state.' }
    if ($tier -eq 'explicit' -and $approvalStatus -eq 'not_required') { throw 'Explicit work item has inconsistent approval state.' }
    if ($tier -eq 'explicit' -and $approvalStatus -eq 'approved' -and [string]::IsNullOrWhiteSpace($approvalRef)) { throw 'Approved work item is missing approval evidence.' }
    if ($pendingExplicit) {
        if ($Handoff.approvalGate -eq 'none') { throw 'Pending explicit approval cannot be bypassed by the handoff.' }
        if ($Handoff.proposedTransition -notin @('needs_approval','blocked','deferred')) { throw 'Pending explicit approval cannot advance to the proposed state.' }
    }
    if ($Handoff.approvalGate -eq 'explicit' -and -not $pendingExplicit) { throw 'Explicit handoff gate does not match a pending explicit approval.' }
    if ($Handoff.approvalGate -eq 'human_authentication' -and $Handoff.proposedTransition -notin @('blocked','deferred')) { throw 'Human authentication must remain blocked or deferred.' }
    if ($Handoff.approvalGate -ne 'none' -and $Handoff.proposedTransition -notin @('needs_approval','blocked','deferred')) { throw 'Approval-gated handoff cannot advance to the proposed state.' }
    if ($Handoff.proposedTransition -eq 'needs_approval' -and -not $pendingExplicit) { throw 'needs_approval requires a pending explicit queue approval.' }
    if ($Handoff.proposedTransition -in @('executed','observed','done') -and -not $approvalCleared) { throw 'Uncleared approval cannot advance to an executed or terminal state.' }
    if ($approvalStatus -eq 'rejected' -and $Handoff.proposedTransition -notin @('blocked','deferred','cancelled')) { throw 'Rejected work may only be blocked, deferred, or cancelled.' }
}

$validator = Join-Path $PSScriptRoot 'Test-MarketingHandoff.ps1'
$validationOutput = & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $validator -HandoffPath $HandoffPath -QueuePath $QueuePath -RegistryPath $RegistryPath -Format Json
$validationExit = $LASTEXITCODE
$validationText = ($validationOutput -join [Environment]::NewLine)
try { $validation = $validationText | ConvertFrom-Json } catch { throw 'Handoff validator did not return valid JSON.' }
if ($validationExit -ne 0 -or $validation.status -ne 'valid') { throw ('Handoff rejected: ' + (@($validation.errors) -join '; ')) }
if ([string]$validation.contentSha256 -notmatch '^[0-9A-Fa-f]{64}$') { throw 'Handoff validator did not return a content hash.' }

# Read the handoff exactly once in this process. Everything below uses this immutable string.
$handoffRaw = [IO.File]::ReadAllText((Resolve-Path -LiteralPath $HandoffPath).Path, [Text.UTF8Encoding]::new($false))
$handoffHash = Get-MarketingTextSha256 $handoffRaw
if ($handoffHash -ne [string]$validation.contentSha256) { throw 'Handoff changed after validation.' }
try { $handoff = $handoffRaw | ConvertFrom-Json } catch { throw 'Validated handoff could not be parsed from the accepted content.' }

$lockPath = Join-Path $projectRoot 'state\.marketing-chief.lock'
$lock = $null
$queueTemp = $null
$controlTemp = $null
$backupDirectory = $null
$queueBackup = $null
$controlBackup = $null
$committed = $false

try {
    $lock = [IO.File]::Open($lockPath, [IO.FileMode]::OpenOrCreate, [IO.FileAccess]::ReadWrite, [IO.FileShare]::None)
    $queue = [IO.File]::ReadAllText((Resolve-Path -LiteralPath $QueuePath).Path, [Text.UTF8Encoding]::new($false)) | ConvertFrom-Json
    if ([int]$queue.revision -ne $ExpectedQueueRevision) { throw "Stale queue revision. Expected $ExpectedQueueRevision; current is $($queue.revision)." }

    $matches = @($queue.workItems | Where-Object { $_.id -eq $handoff.workItemId })
    if ($matches.Count -ne 1) { throw 'Work item no longer resolves exactly once.' }
    $item = $matches[0]
    if ([int]$item.version -ne [int]$handoff.expectedWorkItemVersion) { throw 'Handoff became stale before reconciliation.' }
    if ([string]$item.clientId -ne [string]$handoff.clientId) { throw 'Client mismatch before reconciliation.' }
    if ($handoff.proposedTransition -notin @($queue.statusModel.primary + $queue.statusModel.sideExits)) { throw 'Proposed transition is not in the queue status model.' }

    if (-not [string]::IsNullOrWhiteSpace([string]$item.clientId)) {
        $registry = [IO.File]::ReadAllText((Resolve-Path -LiteralPath $RegistryPath).Path, [Text.UTF8Encoding]::new($false)) | ConvertFrom-Json
        $clients = @($registry.clients | Where-Object { $_.id -eq $item.clientId })
        if ($clients.Count -ne 1 -or $clients[0].status -ne 'active') { throw 'Work-item client is no longer exactly active in the registry.' }
    }

    # Defense in depth: repeat transition and approval checks against queue state held under the lock.
    Assert-HandoffAgainstItem -Handoff $handoff -Item $item

    $lane = [string]$item.lane
    if ($lane -notin @('normal','emergency')) { throw 'Work item has an invalid WIP lane.' }
    if ($lane -eq 'emergency') {
        if ([string]$item.priority.level -ne 'P0') { throw 'Emergency WIP is restricted to P0 work.' }
        if ($item.PSObject.Properties.Name -notcontains 'emergencyRationale' -or [string]::IsNullOrWhiteSpace([string]$item.emergencyRationale)) { throw 'Emergency WIP requires an explicit rationale.' }
    }
    if ($handoff.proposedTransition -in @($queue.wipPolicy.activeStatuses) -and $item.status -notin @($queue.wipPolicy.activeStatuses)) {
        $hardLimit = if ($lane -eq 'emergency') { 1 } else { 3 }
        $configuredLimit = if ($lane -eq 'emergency') { [int]$queue.wipPolicy.emergencyLimit } else { [int]$queue.wipPolicy.normalLimit }
        if ($configuredLimit -ne $hardLimit) { throw "The configured $lane WIP limit does not match the enforced limit of $hardLimit." }
        $limit = $hardLimit
        $activeCount = @($queue.workItems | Where-Object { $_.id -ne $item.id -and $_.lane -eq $lane -and $_.status -in @($queue.wipPolicy.activeStatuses) }).Count
        if ($activeCount -ge $limit) { throw "$lane WIP limit would be exceeded." }
    }

    $now = [DateTimeOffset]::UtcNow.ToString('o')
    $item.status = [string]$handoff.proposedTransition
    $item.version = [int]$item.version + 1
    $item.updatedAt = $now

    $artifactRefs = New-Object System.Collections.Generic.List[string]
    foreach ($ref in @($item.artifactRefs)) { if (-not [string]::IsNullOrWhiteSpace([string]$ref) -and -not $artifactRefs.Contains([string]$ref)) { $artifactRefs.Add([string]$ref) } }
    foreach ($ref in @($handoff.artifacts)) { if (-not [string]::IsNullOrWhiteSpace([string]$ref) -and -not $artifactRefs.Contains([string]$ref)) { $artifactRefs.Add([string]$ref) } }
    $item.artifactRefs = @($artifactRefs)

    $evidenceRefs = New-Object System.Collections.Generic.List[string]
    foreach ($ref in @($item.evidence.refs)) { if (-not [string]::IsNullOrWhiteSpace([string]$ref) -and -not $evidenceRefs.Contains([string]$ref)) { $evidenceRefs.Add([string]$ref) } }
    foreach ($ref in @($handoff.evidence)) { if (-not [string]::IsNullOrWhiteSpace([string]$ref) -and -not $evidenceRefs.Contains([string]$ref)) { $evidenceRefs.Add([string]$ref) } }
    $item.evidence.asOf = $now
    $item.evidence.freshness = 'current'
    $item.evidence.refs = @($evidenceRefs)
    $item.outcome = [pscustomobject][ordered]@{
        status = [string]$handoff.status
        verifiedAt = $now
        summary = [string]$handoff.summary
        handoffId = [string]$handoff.handoffId
        handoffContentSha256 = $handoffHash
        workerRole = [string]$handoff.workerRole
        verification = @($handoff.verification)
        assumptions = @($handoff.assumptions)
        risks = @($handoff.risks)
        privacy = 'redacted'
        externalActionTaken = $false
    }

    $queue.revision = [int]$queue.revision + 1
    $queue.updatedAt = $now
    $queue.updatedBy = $Writer

    $token = [guid]::NewGuid().ToString('N')
    $queueTemp = Join-Path (Split-Path -Parent $QueuePath) (".work-items.$token.tmp.json")
    $controlTemp = Join-Path (Split-Path -Parent $ControlPath) (".CONTROL.$token.tmp.md")
    [IO.File]::WriteAllText($queueTemp, (($queue | ConvertTo-Json -Depth 100) + [Environment]::NewLine), [Text.UTF8Encoding]::new($false))

    $renderer = Join-Path $PSScriptRoot 'Update-MarketingControl.ps1'
    $renderOutput = & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $renderer -QueuePath $queueTemp -OutputPath $controlTemp -AsOf $now -InternalRender
    if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $controlTemp)) { throw 'CONTROL rendering failed; canonical queue was not changed.' }

    if ($DryRun) {
        [pscustomobject]@{ status = 'would-accept'; handoffId = $handoff.handoffId; workItemId = $handoff.workItemId; contentSha256 = $handoffHash; queueRevision = $queue.revision; workItemVersion = $item.version; transition = $item.status; lane = $lane } | ConvertTo-Json -Compress
        return
    }

    $backupsRoot = Join-Path $projectRoot 'backups'
    New-Item -ItemType Directory -Path $backupsRoot -Force | Out-Null
    $backupChild = "{0}-{1}" -f ([DateTimeOffset]::UtcNow.ToString('yyyyMMddTHHmmssZ')), ([string]$handoff.handoffId)
    $backupDirectory = Resolve-MarketingChildPath -Root $backupsRoot -Child $backupChild
    New-Item -ItemType Directory -Path $backupDirectory -Force | Out-Null
    $queueBackup = Resolve-MarketingChildPath -Root $backupDirectory -Child 'work-items.json'
    $controlBackup = Resolve-MarketingChildPath -Root $backupDirectory -Child 'CONTROL.md'
    Copy-Item -LiteralPath $QueuePath -Destination $queueBackup -Force
    Copy-Item -LiteralPath $ControlPath -Destination $controlBackup -Force

    try {
        Move-Item -LiteralPath $queueTemp -Destination $QueuePath -Force
        Move-Item -LiteralPath $controlTemp -Destination $ControlPath -Force
        $committed = $true
    }
    catch {
        Copy-Item -LiteralPath $queueBackup -Destination $QueuePath -Force
        Copy-Item -LiteralPath $controlBackup -Destination $ControlPath -Force
        throw
    }

    $receipt = [pscustomobject][ordered]@{
        schemaVersion = 1
        reconciledAt = $now
        handoffId = [string]$handoff.handoffId
        handoffContentSha256 = $handoffHash
        workItemId = [string]$handoff.workItemId
        clientId = [string]$handoff.clientId
        priorQueueRevision = $ExpectedQueueRevision
        queueRevision = [int]$queue.revision
        workItemVersion = [int]$item.version
        transition = [string]$item.status
        lane = $lane
        writer = $Writer
        externalActionTaken = $false
        backup = $backupDirectory
    }
    $receiptPath = Join-Path $projectRoot 'state\handoff-receipts.jsonl'
    $receiptRecorded = $true
    try { [IO.File]::AppendAllText($receiptPath, (($receipt | ConvertTo-Json -Compress -Depth 10) + [Environment]::NewLine), [Text.UTF8Encoding]::new($false)) }
    catch { $receiptRecorded = $false }

    [pscustomobject]@{ status = 'accepted'; handoffId = $handoff.handoffId; workItemId = $handoff.workItemId; contentSha256 = $handoffHash; queueRevision = $queue.revision; workItemVersion = $item.version; transition = $item.status; lane = $lane; receiptRecorded = $receiptRecorded } | ConvertTo-Json -Compress
}
finally {
    if ($null -ne $lock) { $lock.Dispose() }
    if (-not [string]::IsNullOrWhiteSpace([string]$queueTemp)) { Remove-Item -LiteralPath $queueTemp -Force -ErrorAction SilentlyContinue }
    if (-not [string]::IsNullOrWhiteSpace([string]$controlTemp)) { Remove-Item -LiteralPath $controlTemp -Force -ErrorAction SilentlyContinue }
    if (-not $committed -and $null -ne $backupDirectory -and (Test-Path -LiteralPath $backupDirectory)) {
        # Keep backups for diagnosis; they contain only canonical redacted state.
    }
}
