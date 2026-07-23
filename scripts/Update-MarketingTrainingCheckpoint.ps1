[CmdletBinding()]
param(
    [ValidateSet('daily','manual','decision','queue-change','startup')]
    [string]$Trigger = 'manual',
    [string]$OutputPath,
    [string]$LedgerPath
)

$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
if ([string]::IsNullOrWhiteSpace($OutputPath)) { $OutputPath = Join-Path $projectRoot 'state\training-checkpoint.json' }
if ([string]::IsNullOrWhiteSpace($LedgerPath)) { $LedgerPath = Join-Path $projectRoot 'state\training-runs.jsonl' }

function Read-JsonFile {
    param([string]$Path)
    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) { return $null }
    return Get-Content -LiteralPath $Path -Raw -Encoding UTF8 | ConvertFrom-Json
}

function Get-JsonLineCount {
    param([string]$Path)
    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) { return 0 }
    return @(Get-Content -LiteralPath $Path -Encoding UTF8 | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }).Count
}

$queue = Read-JsonFile (Join-Path $projectRoot 'queue\work-items.json')
$registry = Read-JsonFile (Join-Path $projectRoot 'registry\clients.json')
$intake = Read-JsonFile (Join-Path $projectRoot 'intake\index.json')
$gmail = Read-JsonFile (Join-Path $projectRoot 'state\client-history-research\gmail-client-history-2026-07-16.json')
$slack = Read-JsonFile (Join-Path $projectRoot 'state\client-history-research\slack-client-history-2026-07-16.json')
if ($null -eq $queue -or $null -eq $registry) { throw 'Canonical queue and registry are required.' }

$nextActions = (& (Join-Path $PSScriptRoot 'Get-NextActions.ps1') -Format Json) | ConvertFrom-Json
$learning = (& (Join-Path $PSScriptRoot 'Get-PredictionLearning.ps1') -Format Json) | ConvertFrom-Json
$correctionCount = Get-JsonLineCount (Join-Path $projectRoot 'state\corrections.jsonl')
$mutationCount = Get-JsonLineCount (Join-Path $projectRoot 'state\queue-mutations.jsonl')
$graphFiles = @(Get-ChildItem -LiteralPath (Join-Path $projectRoot 'state\execution-graphs') -Filter '*.json' -File -Recurse -ErrorAction SilentlyContinue)
$graphNodeCount = 0
foreach ($graphFile in $graphFiles) {
    try { $graphNodeCount += @((Get-Content -LiteralPath $graphFile.FullName -Raw -Encoding UTF8 | ConvertFrom-Json).nodes).Count } catch { }
}
$supplementFiles = @(Get-ChildItem -LiteralPath (Join-Path $projectRoot 'state\client-history-research') -Filter 'gmail-*-history-*.json' -File -ErrorAction SilentlyContinue | Where-Object { $_.Name -ne 'gmail-client-history-2026-07-16.json' })
$supplementMessages = 0
foreach ($supplementFile in $supplementFiles) {
    try {
        $supplement = Get-Content -LiteralPath $supplementFile.FullName -Raw -Encoding UTF8 | ConvertFrom-Json
        if ([string]$supplement.artifactType -ceq 'gmail-client-history-supplement') { $supplementMessages += [int]$supplement.coverage.messageMatches }
    } catch { }
}

$now = [DateTimeOffset]::Now
$activeClientCount = @($registry.clients | Where-Object { [string]$_.status -ceq 'active' }).Count
$labeledOutcomes = [int]$learning.totalOutcomes
$eligiblePatterns = @($learning.patterns | Where-Object { [bool]$_.eligible }).Count
$state = if ($eligiblePatterns -gt 0) { 'active' } elseif ($labeledOutcomes -gt 0) { 'calibrating' } else { 'cold-start' }
$fingerprintInput = @(
    [int]$queue.revision,
    $labeledOutcomes,
    $correctionCount,
    $mutationCount,
    @($learning.patterns).Count,
    $eligiblePatterns,
    @($intake.items).Count
) -join '|'
$fingerprintBytes = [Text.Encoding]::UTF8.GetBytes($fingerprintInput)
$sha = [Security.Cryptography.SHA256]::Create()
try { $fingerprint = ([BitConverter]::ToString($sha.ComputeHash($fingerprintBytes))).Replace('-', '').ToLowerInvariant() } finally { $sha.Dispose() }

$checkpoint = [pscustomobject][ordered]@{
    schemaVersion = 1
    engineVersion = 'governed-ranking-v1'
    compiledAt = $now.ToString('o')
    runDateLocal = $now.ToString('yyyy-MM-dd')
    trigger = $Trigger
    fingerprint = $fingerprint
    state = $state
    queueRevision = [int]$queue.revision
    clientCount = @($registry.clients).Count
    activeClientCount = $activeClientCount
    labeledOutcomes = $labeledOutcomes
    correctionSignals = $correctionCount
    queueObservations = $mutationCount
    intakeObservations = @($intake.items).Count
    executionGraphs = $graphFiles.Count
    executionNodes = $graphNodeCount
    observedPatterns = @($learning.patterns).Count
    eligiblePatterns = $eligiblePatterns
    minimumSamples = [int]$learning.minimumSamples
    communicationEvidence = [pscustomobject][ordered]@{
        gmailBaseMessages = if ($null -eq $gmail) { 0 } else { [int]$gmail.coverage.globallyDeduplicatedMessages }
        gmailSupplementMessages = $supplementMessages
        slackMessagesReviewed = if ($null -eq $slack) { 0 } else { [int]$slack.coverage.dillonAuthoredMessagesReviewed }
        countsArePreferenceLabels = $false
        rawCommunicationsStored = $false
    }
    operatorWorkflow = @(
        'refresh redacted intake and system health',
        'resolve the exact active client route',
        'rank the canonical queue within portfolio and WIP policy',
        'preserve approval, privacy, and external-action gates',
        'execute only eligible reversible local work',
        'validate and reconcile bounded evidence-backed handoffs',
        'record deliberate choices and redacted corrections',
        'recompile bounded comparable patterns'
    )
    recommendations = [pscustomobject][ordered]@{
        nextAutomatic = $nextActions.nextAutomatic
        nextDecision = $nextActions.nextDecision
        nextUnblock = $nextActions.nextUnblock
    }
}

$prior = Read-JsonFile $OutputPath
$unchanged = $null -ne $prior -and [string]$prior.fingerprint -ceq $fingerprint -and [string]$prior.runDateLocal -ceq $checkpoint.runDateLocal
if (-not $unchanged) {
    $directory = Split-Path -Parent $OutputPath
    if (-not (Test-Path -LiteralPath $directory)) { New-Item -ItemType Directory -Path $directory -Force | Out-Null }
    $temp = Join-Path $directory ('.training-checkpoint.{0}.tmp.json' -f [guid]::NewGuid().ToString('N'))
    try {
        [IO.File]::WriteAllText($temp, (($checkpoint | ConvertTo-Json -Depth 30) + [Environment]::NewLine), [Text.UTF8Encoding]::new($false))
        Move-Item -LiteralPath $temp -Destination $OutputPath -Force
    } finally { Remove-Item -LiteralPath $temp -Force -ErrorAction SilentlyContinue }

    $run = [pscustomobject][ordered]@{
        schemaVersion = 1
        trainingRunId = ('tr-{0}-{1}' -f $now.ToString('yyyyMMddHHmmss'), [guid]::NewGuid().ToString('N').Substring(0, 8))
        recordedAt = $now.ToString('o')
        runDateLocal = $checkpoint.runDateLocal
        trigger = $Trigger
        fingerprint = $fingerprint
        queueRevision = [int]$queue.revision
        state = $state
        labeledOutcomes = $labeledOutcomes
        eligiblePatterns = $eligiblePatterns
        privacy = 'redacted-aggregates-only'
        rawCommunicationsStored = $false
        fabricatedPreferenceLabels = $false
    }
    [IO.File]::AppendAllText($LedgerPath, (($run | ConvertTo-Json -Compress -Depth 10) + [Environment]::NewLine), [Text.UTF8Encoding]::new($false))
}

& (Join-Path $PSScriptRoot 'Update-MarketingSystemHealth.ps1') | Out-Null
[pscustomobject]@{
    status = if ($unchanged) { 'current' } else { 'compiled' }
    trigger = $Trigger
    queueRevision = [int]$queue.revision
    state = $state
    labeledOutcomes = $labeledOutcomes
    eligiblePatterns = $eligiblePatterns
    fingerprint = $fingerprint
} | ConvertTo-Json -Compress
