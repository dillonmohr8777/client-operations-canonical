[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = 'Medium')]
param(
  [Parameter(Mandatory = $true)]
  [ValidatePattern('^intake-[a-f0-9]{20}$')]
  [string]$IntakeId,
  [Parameter(Mandatory = $true)]
  [ValidateSet('promote', 'acknowledge', 'quarantine')]
  [string]$Action,
  [Parameter(Mandatory = $true)]
  [string]$ExpectedIndexGeneratedAtUtc,
  [ValidatePattern('^wi-[A-Za-z0-9][A-Za-z0-9_-]{5,79}$')]
  [string]$WorkItemId,
  [ValidatePattern('^[a-z0-9][a-z0-9-]{0,79}$')]
  [string]$ClientId,
  [ValidateSet('ambiguous-client', 'client-status-not-active', 'known-false-or-cross-client-route', 'unresolved-client', 'missing-current-outcome', 'unsafe-execution-mode', 'invalid-client-route', 'manual-quarantine')]
  [string]$QuarantineReason,
  [string]$CanonicalRoot,
  [ValidateRange(1, 45)]
  [int]$MutexWaitSeconds = 45,
  [string]$MutexName = 'Global\CodexMarketingOsIntakeV2'
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version 2.0

function Get-OptionalProperty {
  param(
    [AllowNull()][object]$InputObject,
    [Parameter(Mandatory = $true)][string]$Name,
    [AllowNull()][object]$DefaultValue = $null
  )
  if ($null -eq $InputObject) { return $DefaultValue }
  $property = $InputObject.PSObject.Properties[$Name]
  if ($null -eq $property) { return $DefaultValue }
  return $property.Value
}

function ConvertTo-UtcIsoString {
  param([Parameter(Mandatory = $true)][DateTimeOffset]$Value)
  return $Value.ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
}

function Assert-SafeStoredItem {
  param([Parameter(Mandatory = $true)][object]$Item)

  $allowedProperties = @('intakeId', 'receivedAtUtc', 'sourceChannel', 'sourceLocator', 'clientId', 'route', 'outcomeFingerprint', 'occurrenceFingerprint', 'triageState', 'quarantineReason', 'promotedWorkItemId', 'resolvedAtUtc', 'resolutionAction')
  foreach ($property in @($Item.PSObject.Properties)) {
    if ([string]$property.Name -notin $allowedProperties) { throw 'Intake contains a non-contract property.' }
  }
  if ([string]$Item.intakeId -notmatch '^intake-[a-f0-9]{20}$' -or
      [string]$Item.sourceLocator -notmatch '^agent-os-run:[A-Za-z0-9][A-Za-z0-9_-]{5,79}/task\.json$' -or
      [string]$Item.sourceChannel -notin @('gmail', 'slack', 'inbox', 'unknown') -or
      [string]$Item.route -notmatch '^[a-z0-9][a-z0-9-]{0,39}$' -or
      [string]$Item.outcomeFingerprint -notmatch '^[a-f0-9]{64}$' -or
      [string]$Item.occurrenceFingerprint -notmatch '^[a-f0-9]{64}$' -or
      [string]$Item.triageState -notin @('pending', 'quarantined', 'resolved', 'acknowledged')) {
    throw 'Intake contains an invalid or unsafe stored item.'
  }
  $storedClientId = [string](Get-OptionalProperty $Item 'clientId')
  if (-not [string]::IsNullOrWhiteSpace($storedClientId) -and $storedClientId -notmatch '^[a-z0-9][a-z0-9-]{0,79}$') { throw 'Intake contains an unsafe client identifier.' }
  $storedWorkItemId = [string](Get-OptionalProperty $Item 'promotedWorkItemId')
  if (-not [string]::IsNullOrWhiteSpace($storedWorkItemId) -and $storedWorkItemId -notmatch '^wi-[A-Za-z0-9][A-Za-z0-9_-]{5,79}$') { throw 'Intake contains an unsafe promoted work-item identifier.' }
  $allowedReasons = @('ambiguous-client', 'client-status-not-active', 'known-false-or-cross-client-route', 'unresolved-client', 'missing-current-outcome', 'unsafe-execution-mode', 'invalid-client-route', 'manual-quarantine', 'legacy-quarantine')
  $storedReason = [string](Get-OptionalProperty $Item 'quarantineReason')
  if (-not [string]::IsNullOrWhiteSpace($storedReason) -and $storedReason -notin $allowedReasons) { throw 'Intake contains an unsafe quarantine reason.' }
}

function Write-AtomicUtf8File {
  param(
    [Parameter(Mandatory = $true)][string]$Path,
    [Parameter(Mandatory = $true)][AllowEmptyString()][string]$Content
  )
  $directory = Split-Path -Parent $Path
  if (-not (Test-Path -LiteralPath $directory -PathType Container)) { [System.IO.Directory]::CreateDirectory($directory) | Out-Null }
  $tempPath = Join-Path $directory ('.' + [System.IO.Path]::GetFileName($Path) + '.' + [Guid]::NewGuid().ToString('N') + '.tmp')
  $backupPath = Join-Path $directory ('.' + [System.IO.Path]::GetFileName($Path) + '.' + [Guid]::NewGuid().ToString('N') + '.bak')
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  try {
    [System.IO.File]::WriteAllText($tempPath, $Content, $utf8NoBom)
    if (Test-Path -LiteralPath $Path -PathType Leaf) {
      [System.IO.File]::Replace($tempPath, $Path, $backupPath, $true)
      Remove-Item -LiteralPath $backupPath -Force
    }
    else { [System.IO.File]::Move($tempPath, $Path) }
  }
  finally {
    if (Test-Path -LiteralPath $tempPath -PathType Leaf) { Remove-Item -LiteralPath $tempPath -Force }
    if (Test-Path -LiteralPath $backupPath -PathType Leaf) { Remove-Item -LiteralPath $backupPath -Force }
  }
}

function New-ResolutionSummary {
  param(
    [Parameter(Mandatory = $true)][System.Collections.IEnumerable]$Items,
    [Parameter(Mandatory = $true)][DateTimeOffset]$GeneratedAt,
    [Parameter(Mandatory = $true)][object]$Resolution
  )
  $counts = @{ pending = 0; quarantined = 0; resolved = 0; acknowledged = 0 }
  foreach ($item in @($Items)) {
    $stateName = [string]$item.triageState
    if ($counts.ContainsKey($stateName)) { $counts[$stateName]++ }
  }
  $lines = New-Object System.Collections.Generic.List[string]
  $lines.Add('# Canonical intake summary')
  $lines.Add('')
  $lines.Add('Generated: ' + (ConvertTo-UtcIsoString $GeneratedAt))
  $lines.Add('')
  $lines.Add('This surface contains redacted routing metadata and opaque source locators only. It stores no raw messages, requested outcomes, email addresses, phone numbers, secrets, codes, or other direct identifiers.')
  $lines.Add('')
  $lines.Add('## Triage inventory')
  $lines.Add('')
  $lines.Add('- Pending: ' + $counts.pending)
  $lines.Add('- Quarantined: ' + $counts.quarantined)
  $lines.Add('- Resolved to a canonical work item: ' + $counts.resolved)
  $lines.Add('- Acknowledged without promotion: ' + $counts.acknowledged)
  $lines.Add('')
  $lines.Add('## Latest resolution')
  $lines.Add('')
  $lines.Add('- Intake ID: `' + $Resolution.intakeId + '`')
  $lines.Add('- Action: ' + $Resolution.action)
  $lines.Add('- Resulting state: ' + $Resolution.triageState)
  if (-not [string]::IsNullOrWhiteSpace([string]$Resolution.promotedWorkItemId)) {
    $lines.Add('- Promoted work item: `' + $Resolution.promotedWorkItemId + '`')
  }
  $lines.Add('')
  $lines.Add('Use `scripts/Get-PendingIntake.ps1` to list safe locators and `scripts/Resolve-IntakeObservation.ps1` to promote, acknowledge, or quarantine an observation.')
  return ($lines -join [Environment]::NewLine) + [Environment]::NewLine
}

if ([string]::IsNullOrWhiteSpace($CanonicalRoot)) { $CanonicalRoot = Split-Path -Parent $PSScriptRoot }
$CanonicalRoot = [System.IO.Path]::GetFullPath($CanonicalRoot)
$indexPath = Join-Path $CanonicalRoot 'intake\index.json'
$summaryPath = Join-Path $CanonicalRoot 'intake\summary.md'
$registryPath = Join-Path $CanonicalRoot 'registry\clients.json'
$queuePath = Join-Path $CanonicalRoot 'queue\work-items.json'
$chiefLockPath = Join-Path $CanonicalRoot 'state\.marketing-chief.lock'
foreach ($requiredPath in @($indexPath, $registryPath, $queuePath)) {
  if (-not (Test-Path -LiteralPath $requiredPath -PathType Leaf)) { throw ('Required canonical file is missing: ' + $requiredPath) }
}

$expectedTimestamp = [DateTimeOffset]::MinValue
if (-not [DateTimeOffset]::TryParse($ExpectedIndexGeneratedAtUtc, [ref]$expectedTimestamp)) { throw 'ExpectedIndexGeneratedAtUtc is invalid.' }

$mutex = [System.Threading.Mutex]::new($false, $MutexName)
$lockTaken = $false
$chiefLock = $null
try {
  try { $lockTaken = $mutex.WaitOne([TimeSpan]::FromSeconds($MutexWaitSeconds)) }
  catch [System.Threading.AbandonedMutexException] { $lockTaken = $true }
  if (-not $lockTaken) { throw ('Timed out after {0} seconds waiting for the canonical intake mutex.' -f $MutexWaitSeconds) }

  $index = Get-Content -LiteralPath $indexPath -Raw -Encoding UTF8 | ConvertFrom-Json
  if ([int]$index.schemaVersion -ne 2) { throw 'The canonical intake index must be schema version 2.' }
  $allowedIndexProperties = @('schemaVersion', 'generatedAtUtc', 'privacy', 'source', 'lastRun', 'lastResolution', 'items')
  foreach ($property in @($index.PSObject.Properties)) {
    if ([string]$property.Name -notin $allowedIndexProperties) { throw 'The intake index contains a non-contract property.' }
  }
  foreach ($storedItem in @($index.items)) { Assert-SafeStoredItem $storedItem }
  if ([string]$index.generatedAtUtc -ne $ExpectedIndexGeneratedAtUtc) { throw 'Stale intake resolution rejected because the index changed. Refresh with Get-PendingIntake.ps1.' }
  $privacy = Get-OptionalProperty $index 'privacy'
  if ([bool](Get-OptionalProperty $privacy 'rawContentStored' $true) -or
      [bool](Get-OptionalProperty $privacy 'directIdentifiersStored' $true) -or
      [bool](Get-OptionalProperty $privacy 'secretsStored' $true)) {
    throw 'The intake privacy contract is not satisfied.'
  }

  $matches = @($index.items | Where-Object { [string]$_.intakeId -eq $IntakeId })
  if ($matches.Count -ne 1) { throw 'The intake observation did not resolve uniquely.' }
  $target = $matches[0]
  if ([string]$target.sourceLocator -notmatch '^agent-os-run:[A-Za-z0-9][A-Za-z0-9_-]{5,79}/task\.json$') { throw 'The intake observation has an unsafe source locator.' }

  $currentState = [string]$target.triageState
  $nextState = switch ($Action) {
    'promote' { 'resolved' }
    'acknowledge' { 'acknowledged' }
    'quarantine' { 'quarantined' }
  }
  $allowedTransitions = @{
    pending = @('resolved', 'acknowledged', 'quarantined')
    quarantined = @('resolved', 'acknowledged')
    resolved = @('acknowledged')
    acknowledged = @()
  }
  if (-not $allowedTransitions.ContainsKey($currentState) -or $nextState -notin $allowedTransitions[$currentState]) {
    throw ('The intake transition from {0} to {1} is not allowed.' -f $currentState, $nextState)
  }

  # Hold the canonical queue lock while validating the linked work item so a
  # concurrent Chief mutation cannot invalidate the intake resolution.
  $chiefLock = [System.IO.File]::Open($chiefLockPath, [System.IO.FileMode]::OpenOrCreate, [System.IO.FileAccess]::ReadWrite, [System.IO.FileShare]::None)
  $registry = Get-Content -LiteralPath $registryPath -Raw -Encoding UTF8 | ConvertFrom-Json
  $queue = Get-Content -LiteralPath $queuePath -Raw -Encoding UTF8 | ConvertFrom-Json
  if ([int]$registry.schemaVersion -ne 1 -or [int]$queue.schemaVersion -ne 1) { throw 'The registry or queue schema is not supported.' }

  $resolvedClientId = $null
  $resolvedWorkItemId = [string](Get-OptionalProperty $target 'promotedWorkItemId')
  if ($Action -eq 'promote') {
    if ([string]::IsNullOrWhiteSpace($WorkItemId)) { throw 'WorkItemId is required for promotion.' }
    if (-not [string]::IsNullOrWhiteSpace($QuarantineReason)) { throw 'QuarantineReason cannot be supplied for promotion.' }
    $workItemMatches = @($queue.workItems | Where-Object { [string]$_.id -eq $WorkItemId })
    if ($workItemMatches.Count -ne 1) { throw 'The canonical work item did not resolve uniquely.' }
    $workItem = $workItemMatches[0]
    if ([string](Get-OptionalProperty $workItem 'scope') -ne 'client') { throw 'Only a client-scoped work item can resolve client intake.' }
    if ([string](Get-OptionalProperty $workItem 'status') -eq 'cancelled') { throw 'A cancelled work item cannot resolve intake.' }
    $workItemSource = Get-OptionalProperty $workItem 'source'
    $workItemSourceLocator = [string](Get-OptionalProperty $workItemSource 'locator')
    $workItemEvidence = Get-OptionalProperty $workItem 'evidence'
    $workItemEvidenceRefs = @((Get-OptionalProperty $workItemEvidence 'refs' ([object[]]@())))
    $targetSourceLocator = [string]$target.sourceLocator
    if ($workItemSourceLocator -ne $targetSourceLocator -and $targetSourceLocator -notin $workItemEvidenceRefs) {
      throw 'The work item is not bound to this exact intake source locator.'
    }
    $workItemClientId = [string](Get-OptionalProperty $workItem 'clientId')
    if ($workItemClientId -notmatch '^[a-z0-9][a-z0-9-]{0,79}$') { throw 'The work item does not have a safe client identifier.' }
    if (-not [string]::IsNullOrWhiteSpace($ClientId) -and $ClientId -ne $workItemClientId) { throw 'ClientId does not match the work item client.' }
    $storedClientId = [string](Get-OptionalProperty $target 'clientId')
    if (-not [string]::IsNullOrWhiteSpace($storedClientId) -and $storedClientId -ne $workItemClientId) { throw 'The intake client does not match the work item client.' }
    $workItemRouting = Get-OptionalProperty $workItem 'routing'
    if ([string](Get-OptionalProperty $workItemRouting 'status') -ne 'resolved' -or [string](Get-OptionalProperty $workItemRouting 'registryStatus') -ne 'active') {
      throw 'The work item routing is not currently resolved to an active client.'
    }
    $clientMatches = @($registry.clients | Where-Object { [string]$_.id -eq $workItemClientId -and [string]$_.status -eq 'active' })
    if ($clientMatches.Count -ne 1) { throw 'The work item client is not uniquely active in the canonical registry.' }
    $resolvedClientId = $workItemClientId
    $resolvedWorkItemId = $WorkItemId
  }
  elseif ($Action -eq 'quarantine') {
    if ([string]::IsNullOrWhiteSpace($QuarantineReason)) { throw 'QuarantineReason is required for quarantine.' }
    if (-not [string]::IsNullOrWhiteSpace($WorkItemId) -or -not [string]::IsNullOrWhiteSpace($ClientId)) { throw 'WorkItemId and ClientId cannot be supplied for quarantine.' }
    $resolvedWorkItemId = $null
  }
  else {
    if (-not [string]::IsNullOrWhiteSpace($WorkItemId) -or -not [string]::IsNullOrWhiteSpace($ClientId) -or -not [string]::IsNullOrWhiteSpace($QuarantineReason)) {
      throw 'Acknowledge does not accept WorkItemId, ClientId, or QuarantineReason.'
    }
    $resolvedClientId = [string](Get-OptionalProperty $target 'clientId')
    if ([string]::IsNullOrWhiteSpace($resolvedClientId)) { $resolvedClientId = $null }
  }

  $now = [DateTimeOffset]::UtcNow
  $target.triageState = $nextState
  $target.promotedWorkItemId = $resolvedWorkItemId
  if ($Action -eq 'promote') {
    $target.clientId = $resolvedClientId
    $target.quarantineReason = $null
    $target.resolutionAction = 'promoted'
  }
  elseif ($Action -eq 'quarantine') {
    $target.quarantineReason = $QuarantineReason
    $target.resolutionAction = $null
  }
  else {
    $target.quarantineReason = $null
    $target.resolutionAction = 'acknowledged'
  }
  if ($nextState -in @('resolved', 'acknowledged')) { $target.resolvedAtUtc = ConvertTo-UtcIsoString $now }
  else { $target.resolvedAtUtc = $null }

  $resolution = [pscustomobject][ordered]@{
    resolvedAtUtc = ConvertTo-UtcIsoString $now
    intakeId = $IntakeId
    action = $Action
    triageState = $nextState
    promotedWorkItemId = $resolvedWorkItemId
  }
  $index.generatedAtUtc = ConvertTo-UtcIsoString $now
  $lastResolutionProperty = $index.PSObject.Properties['lastResolution']
  if ($null -eq $lastResolutionProperty) { $index | Add-Member -NotePropertyName lastResolution -NotePropertyValue $resolution }
  else { $index.lastResolution = $resolution }

  if ($PSCmdlet.ShouldProcess($IntakeId, ('Resolve canonical intake as ' + $Action))) {
    $indexJson = $index | ConvertTo-Json -Depth 8
    $summaryText = New-ResolutionSummary -Items @($index.items) -GeneratedAt $now -Resolution $resolution
    Write-AtomicUtf8File -Path $indexPath -Content ($indexJson + [Environment]::NewLine)
    Write-AtomicUtf8File -Path $summaryPath -Content $summaryText
  }

  $reportedGeneration = [string]$index.generatedAtUtc
  $proposedGeneration = $null
  if ($WhatIfPreference) {
    $reportedGeneration = $ExpectedIndexGeneratedAtUtc
    $proposedGeneration = [string]$index.generatedAtUtc
  }
  [pscustomobject][ordered]@{
    status = $(if ($WhatIfPreference) { 'validated-whatif' } else { 'resolved' })
    intakeId = $IntakeId
    triageState = $nextState
    promotedWorkItemId = $resolvedWorkItemId
    indexGeneratedAtUtc = $reportedGeneration
    proposedIndexGeneratedAtUtc = $proposedGeneration
  } | ConvertTo-Json -Compress
}
finally {
  if ($null -ne $chiefLock) { $chiefLock.Dispose() }
  if ($lockTaken) { $mutex.ReleaseMutex() }
  $mutex.Dispose()
}
