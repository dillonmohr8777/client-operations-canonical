[CmdletBinding()]
param(
    [string]$QueuePath,
    [string]$OutputPath,
    [string]$HealthPath,
    [switch]$Check,
    [switch]$InternalRender,
    [Nullable[int]]$ExpectedQueueRevision,
    [string]$AsOf
)

$ErrorActionPreference = 'Stop'
if ([string]::IsNullOrWhiteSpace($QueuePath)) { $QueuePath = Join-Path $PSScriptRoot '..\queue\work-items.json' }
if ([string]::IsNullOrWhiteSpace($OutputPath)) { $OutputPath = Join-Path $PSScriptRoot '..\CONTROL.md' }
if ([string]::IsNullOrWhiteSpace($HealthPath)) { $HealthPath = Join-Path $PSScriptRoot '..\state\system-health.json' }
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$canonicalControl = [IO.Path]::GetFullPath((Join-Path $projectRoot 'CONTROL.md'))
$lock = $null
$isWrite = -not $Check
if ($InternalRender) {
    if ([IO.Path]::GetFullPath($OutputPath) -eq $canonicalControl) { throw 'InternalRender may only write a noncanonical temporary CONTROL path.' }
}
elseif ($isWrite) {
    if (-not $PSBoundParameters.ContainsKey('ExpectedQueueRevision')) { throw 'ExpectedQueueRevision is required for a direct CONTROL write.' }
    $lock = [IO.File]::Open((Join-Path $projectRoot 'state\.marketing-chief.lock'), [IO.FileMode]::OpenOrCreate, [IO.FileAccess]::ReadWrite, [IO.FileShare]::None)
}

function Get-Value {
    param($Object, [string]$Name, $Default = $null)
    if ($null -ne $Object -and $Object.PSObject.Properties.Name -contains $Name) { return $Object.$Name }
    return $Default
}

function Escape-Cell {
    param($Value)
    if ($null -eq $Value) { return '' }
    return (([string]$Value).Replace('|', '\|').Replace("`r", ' ').Replace("`n", ' ').Trim())
}

function Format-Status {
    param([string]$Status)
    if ([string]::IsNullOrWhiteSpace($Status)) { return 'Unknown' }
    $words = $Status -split '_'
    return (($words | ForEach-Object { if ($_.Length -gt 0) { $_.Substring(0,1).ToUpperInvariant() + $_.Substring(1) } }) -join ' ')
}

function Format-Due {
    param($DueAt)
    if ([string]::IsNullOrWhiteSpace([string]$DueAt)) { return 'No evidenced deadline' }
    try { return [DateTimeOffset]::Parse([string]$DueAt).ToString('yyyy-MM-dd HH:mm zzz') } catch { return 'Invalid date' }
}

function Add-Line {
    param([Text.StringBuilder]$Builder, [string]$Line = '')
    [void]$Builder.AppendLine($Line)
}

try {
if (-not (Test-Path -LiteralPath $QueuePath -PathType Leaf)) { throw "Queue not found: $QueuePath" }
$queue = Get-Content -LiteralPath $QueuePath -Raw -Encoding UTF8 | ConvertFrom-Json
if (-not $InternalRender -and -not $Check -and [int]$queue.revision -ne [int]$ExpectedQueueRevision) { throw "Stale queue revision. Expected $ExpectedQueueRevision; current is $($queue.revision)." }
$effectiveAsOf = if ([string]::IsNullOrWhiteSpace($AsOf)) { [string]$queue.updatedAt } else { $AsOf }
$predictor = Join-Path $PSScriptRoot 'Get-NextActions.ps1'
$predictArgs = @{ QueuePath = $QueuePath; Format = 'Markdown'; AsOf = $effectiveAsOf }
$predictionMarkdown = (& $predictor @predictArgs) -join [Environment]::NewLine

$builder = [Text.StringBuilder]::new()
Add-Line $builder '# Dillon Marketing OS Control'
Add-Line $builder
Add-Line $builder '> Deterministic projection of `queue/work-items.json`. The Marketing Chief is the only canonical writer.'
Add-Line $builder '> Local reversible work may proceed automatically. External delivery, publishing, deployment, spend, account changes, destructive changes, and human authentication gates require approval or handoff.'
Add-Line $builder
Add-Line $builder ('Last reconciled: `{0}`' -f [string]$queue.updatedAt)
Add-Line $builder ('Queue revision: `{0}`' -f [int]$queue.revision)
Add-Line $builder ('Mode: `{0}`' -f [string]$queue.mode)
Add-Line $builder
Add-Line $builder $predictionMarkdown
Add-Line $builder

$activeStatuses = @($queue.wipPolicy.activeStatuses)
$active = @($queue.workItems | Where-Object { $_.status -in $activeStatuses })
$normalActive = @($active | Where-Object { $_.lane -eq 'normal' })
$emergencyActive = @($active | Where-Object { $_.lane -eq 'emergency' })
Add-Line $builder ("## Active execution (normal {0}/{1}; emergency {2}/{3})" -f $normalActive.Count, [int]$queue.wipPolicy.normalLimit, $emergencyActive.Count, [int]$queue.wipPolicy.emergencyLimit)
Add-Line $builder
if ($active.Count -eq 0) {
    Add-Line $builder 'No client outcome currently consumes a normal WIP slot.'
}
else {
    foreach ($item in $active) { Add-Line $builder ('- `{0}` {1}: {2}' -f $item.id, $item.title, $item.nextAction) }
}
Add-Line $builder

Add-Line $builder '## Commitment queue'
Add-Line $builder
Add-Line $builder '| ID | Client | Outcome | Status | Priority | Next action | Due |'
Add-Line $builder '|---|---|---|---|---|---|---|'
foreach ($item in @($queue.workItems)) {
    Add-Line $builder ('| `{0}` | `{1}` | {2} | {3} | {4} | {5} | {6} |' -f `
        (Escape-Cell $item.id), (Escape-Cell $item.clientId), (Escape-Cell $item.title),
        (Escape-Cell (Format-Status $item.status)), (Escape-Cell $item.priority.level),
        (Escape-Cell $item.nextAction), (Escape-Cell (Format-Due $item.dueAt)))
}
Add-Line $builder

$waiting = @($queue.workItems | Where-Object { $_.status -eq 'needs_approval' -or $_.approval.status -eq 'pending' })
Add-Line $builder '## Waiting on Dillon'
Add-Line $builder
if ($waiting.Count -eq 0) {
    Add-Line $builder 'Nothing currently requires a Dillon decision.'
}
else {
    foreach ($item in $waiting) {
        Add-Line $builder ("### {0}" -f $item.title)
        Add-Line $builder
        Add-Line $builder ("**Decision:** {0}" -f $item.approval.action)
        Add-Line $builder
        Add-Line $builder ("**Next action:** {0}" -f $item.nextAction)
        if (@($item.artifactRefs).Count -gt 0) {
            Add-Line $builder
            Add-Line $builder '**Reviewable artifacts:**'
            Add-Line $builder
            foreach ($ref in @($item.artifactRefs)) { Add-Line $builder ('- `{0}`' -f $ref) }
        }
        if (@($item.definitionOfDone).Count -gt 0) {
            Add-Line $builder
            Add-Line $builder '**Definition of done:**'
            Add-Line $builder
            foreach ($definitionCheck in @($item.definitionOfDone)) { Add-Line $builder ("- {0}" -f $definitionCheck) }
        }
        Add-Line $builder
    }
}

$blocked = @($queue.workItems | Where-Object { $_.status -eq 'blocked' })
Add-Line $builder '## Blocked or at risk'
Add-Line $builder
if ($blocked.Count -eq 0) { Add-Line $builder 'No client work item is blocked.' }
foreach ($item in $blocked) {
    Add-Line $builder ("- **{0}:** {1}" -f $item.title, $item.nextAction)
    if ($null -ne $item.outcome -and $item.outcome.summary) { Add-Line $builder ("  Current evidence: {0}" -f $item.outcome.summary) }
}
Add-Line $builder

Add-Line $builder '## Intake quarantine'
Add-Line $builder
if (@($queue.intakeQuarantine).Count -eq 0) { Add-Line $builder 'No quarantined observations.' }
foreach ($entry in @($queue.intakeQuarantine)) {
    Add-Line $builder ('- `{0}` **{1}:** {2} Required resolution: {3}' -f $entry.id, $entry.reason, $entry.summary, $entry.requiredResolution)
}
Add-Line $builder

Add-Line $builder '## Visible backlog'
Add-Line $builder
if (@($queue.backlogCandidates).Count -eq 0) { Add-Line $builder 'No backlog candidates.' }
foreach ($entry in @($queue.backlogCandidates)) {
    Add-Line $builder ('- `{0}` {1}. Why it is not active: {2}' -f $entry.id, $entry.title, $entry.reasonNotActive)
}
Add-Line $builder

Add-Line $builder '## System backlog'
Add-Line $builder
if (@($queue.systemBacklog).Count -eq 0) { Add-Line $builder 'No system backlog.' }
foreach ($entry in @($queue.systemBacklog)) {
    $detail = if ($entry.status -eq 'done') { [string](Get-Value $entry 'result' '') } else { [string](Get-Value $entry 'nextAction' (Get-Value $entry 'risk' '')) }
    Add-Line $builder ('- `{0}` **{1}** [{2}]. {3}' -f $entry.id, $entry.title, $entry.status, $detail)
}
Add-Line $builder

Add-Line $builder '## Source and system health'
Add-Line $builder
foreach ($property in $queue.systemHealth.PSObject.Properties | Sort-Object Name) {
    Add-Line $builder ('- **{0}:** `{1}`' -f $property.Name, ([string]$property.Value))
}
Add-Line $builder

if (Test-Path -LiteralPath $HealthPath -PathType Leaf) {
    $liveHealth = Get-Content -LiteralPath $HealthPath -Raw -Encoding UTF8 | ConvertFrom-Json
    Add-Line $builder '## Live health probe'
    Add-Line $builder
    Add-Line $builder ('- **As of:** `{0}`' -f $liveHealth.asOf)
    Add-Line $builder ('- **Overall:** `{0}`' -f $liveHealth.overall)
    Add-Line $builder ('- **Queue:** revision `{0}`, `{1}` work items, normal `{2}/{3}`, emergency `{4}/{5}` active' -f $liveHealth.queue.revision, $liveHealth.queue.workItemCount, $liveHealth.queue.normalActiveCount, $liveHealth.queue.normalLimit, $liveHealth.queue.emergencyActiveCount, $liveHealth.queue.emergencyLimit)
    Add-Line $builder ('- **Client registry:** `{0}`' -f $(if ($liveHealth.clientRegistry.valid) { 'valid' } else { 'invalid' }))
    Add-Line $builder ('- **Access Broker:** `{0}`' -f $(if ($liveHealth.accessBroker.valid) { 'valid' } else { 'invalid' }))
    if ($null -ne $liveHealth.accessCoverage -and $liveHealth.accessCoverage.valid) {
        $coverage = $liveHealth.accessCoverage.summary
        Add-Line $builder ('- **Access coverage:** `{0}/{1}` canonical clients registered, `{2}/{3}` systems verified, `{4}` exact Bitwarden item locators' -f $coverage.canonicalClientsWithAccessBrokerRecord, $coverage.canonicalClientCount, $coverage.verifiedSystemCount, $coverage.registeredSystemCount, $coverage.exactBitwardenItemCount)
    }
    Add-Line $builder ('- **Credential bridge:** `{0}`, secure bootstrap present `{1}`, review `{2}`' -f $liveHealth.credentialBridge.state, $liveHealth.credentialBridge.credentialPresent, $liveHealth.credentialBridge.securityReview)
    Add-Line $builder '- **Scheduled mechanisms:**'
    foreach ($task in @($liveHealth.scheduledTasks)) {
        Add-Line $builder ('  - `{0}`: enabled `{1}`, state `{2}`, prepare-only `{3}`, last result `{4}`' -f $task.name, $task.enabled, $task.state, $task.prepareOnly, $task.lastResult)
    }
    if (@($liveHealth.humanGates).Count -gt 0) {
        Add-Line $builder ('- **Human gates:** {0}' -f (@($liveHealth.humanGates | ForEach-Object { '`' + $_ + '`' }) -join ', '))
    }
    if (@($liveHealth.warnings).Count -gt 0) {
        Add-Line $builder ('- **Warnings:** {0}' -f (@($liveHealth.warnings) -join '; '))
    }
    Add-Line $builder
}

Add-Line $builder '## Standing operating contract'
Add-Line $builder
Add-Line $builder '- Say `continue` in the pinned Marketing Chief task. The Chief refreshes health and intake, ranks current work, executes the highest safe local action, reconciles verified worker handoffs, and asks for at most one human decision.'
Add-Line $builder '- Background Gmail and Slack sensors may update redacted canonical intake only. They do not create Codex tasks, send notifications, or mutate the queue.'
Add-Line $builder '- Persistent remote Chrome is the browser route. Microsoft Edge is never used unless Dillon explicitly changes that rule.'
Add-Line $builder '- Bitwarden is the canonical vault. Only opaque account and item locators enter state. Raw passwords, tokens, cookies, and codes never do.'
Add-Line $builder '- Nothing is sent, published, deployed, purchased, or placed into spend without the required explicit approval.'

$rendered = $builder.ToString().TrimEnd() + [Environment]::NewLine

if ($Check) {
    if (-not (Test-Path -LiteralPath $OutputPath -PathType Leaf)) {
        [pscustomobject]@{ status = 'stale'; reason = 'missing'; path = $OutputPath } | ConvertTo-Json -Compress
        exit 2
    }
    $existing = Get-Content -LiteralPath $OutputPath -Raw -Encoding UTF8
    if ($existing -cne $rendered) {
        [pscustomobject]@{ status = 'stale'; reason = 'content-mismatch'; path = $OutputPath } | ConvertTo-Json -Compress
        exit 2
    }
    [pscustomobject]@{ status = 'current'; queueRevision = [int]$queue.revision; path = $OutputPath } | ConvertTo-Json -Compress
    exit 0
}

$directory = Split-Path -Parent $OutputPath
if (-not (Test-Path -LiteralPath $directory)) { New-Item -ItemType Directory -Path $directory -Force | Out-Null }
$temp = "$OutputPath.tmp.$([guid]::NewGuid().ToString('N'))"
try {
    [IO.File]::WriteAllText($temp, $rendered, [Text.UTF8Encoding]::new($false))
    Move-Item -LiteralPath $temp -Destination $OutputPath -Force
}
finally {
    Remove-Item -LiteralPath $temp -Force -ErrorAction SilentlyContinue
}

[pscustomobject]@{ status = 'rendered'; queueRevision = [int]$queue.revision; path = $OutputPath } | ConvertTo-Json -Compress
}
finally {
    if ($null -ne $lock) { $lock.Dispose() }
}
