[CmdletBinding()]
param(
    [string]$LedgerPath,
    [ValidateSet('Json','Markdown')][string]$Format = 'Markdown',
    [int]$MinimumSamples = 3
)

$ErrorActionPreference = 'Stop'
if ([string]::IsNullOrWhiteSpace($LedgerPath)) { $LedgerPath = Join-Path $PSScriptRoot '..\state\prediction-outcomes.jsonl' }
if ($MinimumSamples -lt 1) { throw 'MinimumSamples must be at least 1.' }

$entries = @()
if (Test-Path -LiteralPath $LedgerPath -PathType Leaf) {
    foreach ($line in @(Get-Content -LiteralPath $LedgerPath -Encoding UTF8)) {
        if ([string]::IsNullOrWhiteSpace($line)) { continue }
        try { $entry = $line | ConvertFrom-Json } catch { throw 'Prediction ledger contains invalid JSON.' }
        if ([string]$entry.decision -notin @('accept','modify','defer','reject')) { continue }
        $entries += $entry
    }
}

$groups = @($entries | Where-Object {
    -not [string]::IsNullOrWhiteSpace([string]$_.clientId) -and
    -not [string]::IsNullOrWhiteSpace([string]$_.predictionLane) -and
    -not [string]::IsNullOrWhiteSpace([string]$_.actionClass)
} | Group-Object { '{0}|{1}|{2}' -f $_.clientId,$_.predictionLane,$_.actionClass })

$patterns = foreach ($group in $groups) {
    $parts = $group.Name -split '\|',3
    $weights = @($group.Group | ForEach-Object { switch ([string]$_.decision) { 'accept' { 3 } 'modify' { 1 } 'defer' { -2 } 'reject' { -4 } } })
    $raw = ($weights | Measure-Object -Sum).Sum
    if ($null -eq $raw) { $raw = 0 }
    [pscustomobject][ordered]@{
        clientId = $parts[0]
        predictionLane = $parts[1]
        actionClass = $parts[2]
        sampleCount = $group.Count
        eligible = $group.Count -ge $MinimumSamples
        adjustment = if ($group.Count -ge $MinimumSamples) { [math]::Max(-10,[math]::Min(10,[int]$raw)) } else { 0 }
        accepted = @($group.Group | Where-Object decision -eq 'accept').Count
        modified = @($group.Group | Where-Object decision -eq 'modify').Count
        deferred = @($group.Group | Where-Object decision -eq 'defer').Count
        rejected = @($group.Group | Where-Object decision -eq 'reject').Count
        lastObservedAt = @($group.Group | Sort-Object recordedAt -Descending | Select-Object -First 1)[0].recordedAt
    }
}

$result = [pscustomobject][ordered]@{
    schemaVersion = 1
    generatedAt = [DateTimeOffset]::UtcNow.ToString('o')
    minimumSamples = $MinimumSamples
    totalOutcomes = $entries.Count
    comparableOutcomes = @($patterns | ForEach-Object sampleCount | Measure-Object -Sum).Sum
    patterns = @($patterns | Sort-Object @{Expression='eligible';Descending=$true}, @{Expression='sampleCount';Descending=$true}, clientId, predictionLane, actionClass)
}

if ($Format -eq 'Json') { $result | ConvertTo-Json -Depth 10; return }
$lines = @('# Prediction learning','','Patterns become active only after ' + $MinimumSamples + ' comparable outcomes.','')
if (@($result.patterns).Count -eq 0) { $lines += 'No comparable cross-item patterns have been learned yet.' }
else {
    $lines += '| Client | Lane | Action class | Samples | Active | Adjustment |'
    $lines += '|---|---|---|---:|---|---:|'
    foreach ($pattern in @($result.patterns)) { $lines += '| {0} | {1} | {2} | {3} | {4} | {5} |' -f $pattern.clientId,$pattern.predictionLane,$pattern.actionClass,$pattern.sampleCount,$pattern.eligible,$pattern.adjustment }
}
$lines -join [Environment]::NewLine
