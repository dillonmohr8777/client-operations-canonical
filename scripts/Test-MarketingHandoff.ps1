[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$HandoffPath,
    [string]$ProjectRoot,
    [string]$QueuePath,
    [string]$RegistryPath,
    [ValidateSet('Json', 'Text')]
    [string]$Format = 'Json'
)

$ErrorActionPreference = 'Stop'
if ([string]::IsNullOrWhiteSpace($ProjectRoot)) { $ProjectRoot = Join-Path $PSScriptRoot '..' }
$projectRoot = [IO.Path]::GetFullPath($ProjectRoot).TrimEnd('\')
. (Join-Path $PSScriptRoot 'MarketingOs.Common.ps1')
if ([string]::IsNullOrWhiteSpace($QueuePath)) { $QueuePath = Join-Path $projectRoot 'queue\work-items.json' }
if ([string]::IsNullOrWhiteSpace($RegistryPath)) { $RegistryPath = Join-Path $projectRoot 'registry\clients.json' }

$errors = New-Object System.Collections.Generic.List[string]
function Add-Problem { param([string]$Message) $script:errors.Add($Message) }
function Has-Property { param($Object, [string]$Name) return ($null -ne $Object -and $Object.PSObject.Properties.Name -contains $Name) }
function Test-PathHasReparsePoint {
    param([string]$Root, [string]$Candidate)
    $rootFull = [IO.Path]::GetFullPath($Root).TrimEnd('\')
    $current = [IO.Path]::GetFullPath($Candidate).TrimEnd('\')
    while ($true) {
        if (Test-Path -LiteralPath $current) {
            $entry = Get-Item -LiteralPath $current -Force
            if (($entry.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) { return $true }
        }
        if ($current.Equals($rootFull, [StringComparison]::OrdinalIgnoreCase)) { return $false }
        $parent = Split-Path -Parent $current
        if ([string]::IsNullOrWhiteSpace($parent) -or $parent -eq $current) { return $true }
        $current = $parent.TrimEnd('\')
    }
}

$raw = $null
$contentSha256 = $null
$handoff = $null
$queue = $null
$registry = $null

if (-not (Test-Path -LiteralPath $HandoffPath -PathType Leaf)) {
    Add-Problem 'handoff file is missing'
}
else {
    try {
        $raw = [IO.File]::ReadAllText((Resolve-Path -LiteralPath $HandoffPath).Path, [Text.UTF8Encoding]::new($false))
        $contentSha256 = Get-MarketingTextSha256 $raw
        if ([Text.UTF8Encoding]::new($false).GetByteCount($raw) -gt 20480) { Add-Problem 'handoff exceeds 20 KB' }
        if (-not (Test-MarketingSafeText $raw)) { Add-Problem 'handoff appears to contain a secret, direct identifier, or raw communication' }
        try { $handoff = $raw | ConvertFrom-Json } catch { Add-Problem 'handoff is not valid JSON' }
    }
    catch { Add-Problem 'handoff could not be read safely' }
}

if (-not (Test-Path -LiteralPath $QueuePath -PathType Leaf)) { Add-Problem 'queue file is missing' }
else { try { $queue = [IO.File]::ReadAllText((Resolve-Path -LiteralPath $QueuePath).Path, [Text.UTF8Encoding]::new($false)) | ConvertFrom-Json } catch { Add-Problem 'queue is not valid JSON' } }
if (-not (Test-Path -LiteralPath $RegistryPath -PathType Leaf)) { Add-Problem 'registry file is missing' }
else { try { $registry = [IO.File]::ReadAllText((Resolve-Path -LiteralPath $RegistryPath).Path, [Text.UTF8Encoding]::new($false)) | ConvertFrom-Json } catch { Add-Problem 'registry is not valid JSON' } }

$required = @(
    'schemaVersion','handoffId','workItemId','expectedWorkItemVersion','clientId','workerRole','status',
    'startedAt','finishedAt','summary','artifacts','evidence','verification','assumptions','risks',
    'privacy','containsSecrets','containsDirectIdentifiers','containsRawCommunications',
    'approvalGate','proposedTransition','canonicalWriteAttempted','externalActionAttempted'
)

if ($null -ne $handoff) {
    foreach ($name in $required) { if (-not (Has-Property $handoff $name)) { Add-Problem "missing required field: $name" } }
    foreach ($property in $handoff.PSObject.Properties.Name) { if ($property -notin $required) { Add-Problem "unexpected field: $property" } }

    if (($handoff.schemaVersion -isnot [int] -and $handoff.schemaVersion -isnot [long]) -or [int]$handoff.schemaVersion -ne 1) { Add-Problem 'schemaVersion must equal the integer 1' }
    if ($handoff.handoffId -isnot [string] -or [string]$handoff.handoffId -notmatch '^[A-Za-z0-9][A-Za-z0-9_-]{7,159}$') { Add-Problem 'handoffId must be a path-safe slug of 8 to 160 characters' }
    if ($handoff.workItemId -isnot [string] -or [string]$handoff.workItemId -notmatch '^wi-[A-Za-z0-9-]+$') { Add-Problem 'workItemId format is invalid' }
    if (($handoff.expectedWorkItemVersion -isnot [int] -and $handoff.expectedWorkItemVersion -isnot [long]) -or [int]$handoff.expectedWorkItemVersion -lt 1) { Add-Problem 'expectedWorkItemVersion must be a positive integer' }
    if ($null -ne $handoff.clientId -and ($handoff.clientId -isnot [string] -or [string]$handoff.clientId -notmatch '^[a-z0-9][a-z0-9-]{0,119}$')) { Add-Problem 'clientId format is invalid' }
    if ($handoff.workerRole -isnot [string] -or [string]::IsNullOrWhiteSpace([string]$handoff.workerRole) -or ([string]$handoff.workerRole).Length -gt 80 -or -not (Test-MarketingSafeText ([string]$handoff.workerRole))) { Add-Problem 'workerRole is invalid or unsafe' }
    if ($handoff.status -isnot [string] -or [string]$handoff.status -notin @('completed','partially_completed','blocked','failed')) { Add-Problem 'status is invalid' }
    if ($handoff.approvalGate -isnot [string] -or [string]$handoff.approvalGate -notin @('none','explicit','human_authentication')) { Add-Problem 'approvalGate is invalid' }
    if ($handoff.proposedTransition -isnot [string] -or [string]$handoff.proposedTransition -notin @('in_progress','verification','needs_approval','executed','observed','done','blocked','deferred','cancelled')) { Add-Problem 'proposedTransition is invalid' }

    foreach ($flag in @('containsSecrets','containsDirectIdentifiers','containsRawCommunications','canonicalWriteAttempted','externalActionAttempted')) {
        if (-not (Has-Property $handoff $flag) -or $handoff.$flag -isnot [bool] -or [bool]$handoff.$flag) { Add-Problem "$flag must be the boolean false" }
    }
    if ($handoff.privacy -isnot [string] -or [string]$handoff.privacy -ne 'redacted') { Add-Problem 'privacy must equal redacted' }

    if ($handoff.summary -isnot [string] -or ([string]$handoff.summary).Length -lt 1 -or ([string]$handoff.summary).Length -gt 4000 -or -not (Test-MarketingSafeText ([string]$handoff.summary))) { Add-Problem 'summary is invalid or unsafe' }
    $limits = @{ artifacts = 10; evidence = 10; verification = 10; assumptions = 5; risks = 5 }
    foreach ($name in $limits.Keys) {
        $value = $null
        if (Has-Property $handoff $name) { $value = $handoff.PSObject.Properties[$name].Value }
        if ($value -isnot [System.Array]) {
            Add-Problem "$name must be an array"
            continue
        }
        if (@($value).Count -gt $limits[$name]) { Add-Problem "$name exceeds the item limit" }
        foreach ($entry in @($value)) {
            if ($entry -isnot [string] -or [string]::IsNullOrWhiteSpace([string]$entry) -or ([string]$entry).Length -gt 1000) { Add-Problem "$name contains an invalid entry"; continue }
            if ($name -eq 'evidence') {
                if (-not (Test-MarketingSafeLocator ([string]$entry))) { Add-Problem 'evidence contains an unsafe or non-canonical locator' }
            }
            elseif ($name -eq 'artifacts') {
                if (-not (Test-MarketingSafeLocator ([string]$entry))) { Add-Problem 'artifacts contains an unsafe or non-canonical locator' }
            }
            elseif (-not (Test-MarketingSafeText ([string]$entry))) { Add-Problem "$name contains unsafe text" }
        }
    }
    if ($handoff.status -eq 'completed' -and @($handoff.verification).Count -eq 0) { Add-Problem 'completed handoff requires verification evidence' }
    if ($handoff.status -eq 'completed' -and @($handoff.evidence).Count -eq 0) { Add-Problem 'completed handoff requires source evidence' }

    $started = $null
    $finished = $null
    try { if ($handoff.startedAt -isnot [string]) { throw 'not-string' }; $started = [DateTimeOffset]::Parse([string]$handoff.startedAt) } catch { Add-Problem 'startedAt is not a valid date-time string' }
    try { if ($handoff.finishedAt -isnot [string]) { throw 'not-string' }; $finished = [DateTimeOffset]::Parse([string]$handoff.finishedAt) } catch { Add-Problem 'finishedAt is not a valid date-time string' }
    if ($null -ne $started -and $null -ne $finished -and $finished -lt $started) { Add-Problem 'finishedAt precedes startedAt' }

    if (-not (Test-MarketingWorkerTransition -WorkerStatus ([string]$handoff.status) -ProposedTransition ([string]$handoff.proposedTransition))) {
        Add-Problem 'worker status cannot propose that transition'
    }
    if ($handoff.approvalGate -ne 'none' -and $handoff.proposedTransition -notin @('needs_approval','blocked','deferred')) {
        Add-Problem 'approval-gated handoff must transition to needs_approval, blocked, or deferred'
    }

    $item = $null
    if ($null -ne $queue) {
        $matches = @($queue.workItems | Where-Object { $_.id -eq $handoff.workItemId })
        if ($matches.Count -ne 1) { Add-Problem 'work item does not resolve exactly once in the queue' }
        else {
            $item = $matches[0]
            if ([int]$item.version -ne [int]$handoff.expectedWorkItemVersion) { Add-Problem 'handoff work-item version is stale' }
            if ([string]$item.clientId -ne [string]$handoff.clientId) { Add-Problem 'handoff client does not match the work item' }
            if (-not (Test-MarketingStatusTransition -From ([string]$item.status) -To ([string]$handoff.proposedTransition))) { Add-Problem 'queue status cannot make the proposed transition' }

            if (-not (Has-Property $item 'approval') -or $null -eq $item.approval) {
                Add-Problem 'work item approval state is missing'
            }
            else {
                $tier = [string]$item.approval.tier
                $approvalStatus = [string]$item.approval.status
                $approvalRef = [string]$item.approval.approvalRef
                $pendingExplicit = $tier -eq 'explicit' -and $approvalStatus -eq 'pending'
                $approvalCleared = ($tier -eq 'automatic' -and $approvalStatus -eq 'not_required') -or ($tier -eq 'explicit' -and $approvalStatus -eq 'approved' -and -not [string]::IsNullOrWhiteSpace($approvalRef))

                if ($tier -notin @('automatic','explicit')) { Add-Problem 'work item approval tier is invalid' }
                if ($approvalStatus -notin @('pending','approved','rejected','not_required')) { Add-Problem 'work item approval status is invalid' }
                if ($tier -eq 'automatic' -and $approvalStatus -ne 'not_required') { Add-Problem 'automatic work item has inconsistent approval state' }
                if ($tier -eq 'explicit' -and $approvalStatus -eq 'not_required') { Add-Problem 'explicit work item has inconsistent approval state' }
                if ($tier -eq 'explicit' -and $approvalStatus -eq 'approved' -and [string]::IsNullOrWhiteSpace($approvalRef)) { Add-Problem 'approved work item is missing approval evidence' }
                if ($pendingExplicit) {
                    if ($handoff.approvalGate -eq 'none') { Add-Problem 'pending explicit approval cannot be bypassed by the handoff' }
                    if ($handoff.proposedTransition -notin @('needs_approval','blocked','deferred')) { Add-Problem 'pending explicit approval cannot advance to the proposed state' }
                }
                if ($handoff.approvalGate -eq 'explicit' -and -not $pendingExplicit) { Add-Problem 'explicit handoff gate does not match a pending explicit approval' }
                if ($handoff.approvalGate -eq 'human_authentication' -and $handoff.proposedTransition -notin @('blocked','deferred')) { Add-Problem 'human authentication must remain blocked or deferred' }
                if ($handoff.proposedTransition -eq 'needs_approval' -and -not $pendingExplicit) { Add-Problem 'needs_approval requires a pending explicit queue approval' }
                if ($handoff.proposedTransition -in @('executed','observed','done') -and -not $approvalCleared) { Add-Problem 'uncleared approval cannot advance to an executed or terminal state' }
                if ($approvalStatus -eq 'rejected' -and $handoff.proposedTransition -notin @('blocked','deferred','cancelled')) { Add-Problem 'rejected work may only be blocked, deferred, or cancelled' }
            }
        }
    }

    if ($null -ne $registry -and -not [string]::IsNullOrWhiteSpace([string]$handoff.clientId)) {
        $clientMatches = @($registry.clients | Where-Object { $_.id -eq $handoff.clientId })
        if ($clientMatches.Count -ne 1) { Add-Problem 'handoff client does not resolve exactly once in the registry' }
        elseif ($clientMatches[0].status -ne 'active') { Add-Problem 'handoff client is not active' }
    }

    if (Has-Property $handoff 'artifacts') {
        $clientRoot = if ([string]::IsNullOrWhiteSpace([string]$handoff.clientId)) { $projectRoot } else { [IO.Path]::GetFullPath((Join-Path $projectRoot ("clients\{0}" -f $handoff.clientId))) }
        foreach ($artifact in @($handoff.artifacts)) {
            try {
                if ([IO.Path]::IsPathRooted([string]$artifact)) { throw 'rooted artifact' }
                $candidate = Resolve-MarketingChildPath -Root $projectRoot -Child ([string]$artifact)
                $prefix = $clientRoot.TrimEnd('\') + '\'
                if (-not $candidate.StartsWith($prefix, [StringComparison]::OrdinalIgnoreCase)) { Add-Problem 'artifact escapes the canonical client folder'; continue }
                if (Test-PathHasReparsePoint -Root $clientRoot -Candidate $candidate) { Add-Problem 'artifact path traverses a reparse point'; continue }
                if ($handoff.status -eq 'completed' -and -not (Test-Path -LiteralPath $candidate -PathType Leaf)) { Add-Problem 'completed handoff references a missing artifact' }
            }
            catch { Add-Problem 'artifact path is invalid' }
        }
    }
}

$result = [pscustomobject][ordered]@{
    status = if ($errors.Count -eq 0) { 'valid' } else { 'invalid' }
    errorCount = $errors.Count
    errors = @($errors)
    contentSha256 = $contentSha256
    handoffId = if ($null -eq $handoff) { $null } else { [string]$handoff.handoffId }
    workItemId = if ($null -eq $handoff) { $null } else { [string]$handoff.workItemId }
    expectedWorkItemVersion = if ($null -eq $handoff) { $null } else { [int]$handoff.expectedWorkItemVersion }
    clientId = if ($null -eq $handoff) { $null } else { [string]$handoff.clientId }
}

if ($Format -eq 'Json') { $result | ConvertTo-Json -Depth 8 -Compress }
elseif ($result.status -eq 'valid') { "VALID: sha256=$contentSha256" }
else { 'INVALID: ' + ($errors -join '; ') }

if ($errors.Count -gt 0) { exit 2 }
