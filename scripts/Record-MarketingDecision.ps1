[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$WorkItemId,
    [Parameter(Mandatory = $true)]
    [ValidateSet('automatic', 'decision', 'unblock')]
    [string]$PredictionLane,
    [Parameter(Mandatory = $true)]
    [ValidateSet('accept', 'modify', 'defer', 'reject')]
    [string]$Decision,
    [string]$ReplacementAction,
    [string]$Reason,
    [string]$QueuePath,
    [string]$LedgerPath,
    [ValidateSet('dillon','marketing-chief')]
    [string]$Actor = 'dillon'
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'MarketingOs.Common.ps1')
if ([string]::IsNullOrWhiteSpace($QueuePath)) { $QueuePath = Join-Path $PSScriptRoot '..\queue\work-items.json' }
if ([string]::IsNullOrWhiteSpace($LedgerPath)) { $LedgerPath = Join-Path $PSScriptRoot '..\state\prediction-outcomes.jsonl' }

if (-not (Test-Path -LiteralPath $QueuePath -PathType Leaf)) { throw "Queue not found: $QueuePath" }
$queue = Get-Content -LiteralPath $QueuePath -Raw -Encoding UTF8 | ConvertFrom-Json
$item = @($queue.workItems | Where-Object { $_.id -eq $WorkItemId })
if ($item.Count -ne 1) { throw "Work item must resolve exactly once: $WorkItemId" }
if ($Decision -eq 'modify' -and [string]::IsNullOrWhiteSpace($ReplacementAction)) {
    throw 'ReplacementAction is required when Decision is modify.'
}
if ($ReplacementAction.Length -gt 2000 -or $Reason.Length -gt 2000) { throw 'Decision text exceeds 2000 characters.' }
if (-not (Test-MarketingSafeText $ReplacementAction) -or -not (Test-MarketingSafeText $Reason)) {
    throw 'Decision text contains secret, direct-identifier, or raw-communication material. Record a redacted lesson or locator instead.'
}

$entry = [pscustomobject][ordered]@{
    schemaVersion = 2
    predictionOutcomeId = ('po-{0}-{1}' -f ([DateTimeOffset]::UtcNow.ToString('yyyyMMddHHmmss')), ([guid]::NewGuid().ToString('N').Substring(0, 8)))
    recordedAt = [DateTimeOffset]::UtcNow.ToString('o')
    queueRevision = [int]$queue.revision
    workItemId = $WorkItemId
    workItemVersion = [int]$item[0].version
    clientId = [string]$item[0].clientId
    predictionLane = $PredictionLane
    decision = $Decision
    predictedAction = [string]$item[0].nextAction
    replacementAction = if ([string]::IsNullOrWhiteSpace($ReplacementAction)) { $null } else { $ReplacementAction.Trim() }
    reason = if ([string]::IsNullOrWhiteSpace($Reason)) { $null } else { $Reason.Trim() }
    actor = $Actor
    privacy = 'redacted'
}

$ledgerDirectory = Split-Path -Parent $LedgerPath
if (-not (Test-Path -LiteralPath $ledgerDirectory)) { New-Item -ItemType Directory -Path $ledgerDirectory -Force | Out-Null }
$lockPath = "$LedgerPath.lock"
$lock = $null
try {
    $lock = [IO.File]::Open($lockPath, [IO.FileMode]::OpenOrCreate, [IO.FileAccess]::ReadWrite, [IO.FileShare]::None)
    $line = ($entry | ConvertTo-Json -Compress -Depth 10) + [Environment]::NewLine
    $bytes = [Text.UTF8Encoding]::new($false).GetBytes($line)
    $stream = [IO.File]::Open($LedgerPath, [IO.FileMode]::Append, [IO.FileAccess]::Write, [IO.FileShare]::Read)
    try { $stream.Write($bytes, 0, $bytes.Length); $stream.Flush($true) } finally { $stream.Dispose() }
}
finally {
    if ($null -ne $lock) { $lock.Dispose() }
    Remove-Item -LiteralPath $lockPath -Force -ErrorAction SilentlyContinue
}

[pscustomobject]@{ status = 'recorded'; workItemId = $WorkItemId; decision = $Decision; ledger = $LedgerPath } | ConvertTo-Json -Compress
