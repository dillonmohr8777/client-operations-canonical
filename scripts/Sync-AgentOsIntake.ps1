[CmdletBinding()]
param(
  [string]$SourceRunsPath = 'C:\Users\dillo\Documents\Codex\2026-07-10\i-see-that-all-of-my\runs',
  [string]$CanonicalRoot,
  [ValidateRange(1, 168)]
  [int]$InitialLookbackHours = 24,
  [ValidateRange(0, 60)]
  [int]$OverlapMinutes = 5,
  [ValidateRange(1, 168)]
  [int]$SemanticDedupeHours = 72,
  [ValidateRange(1, 45)]
  [int]$MutexWaitSeconds = 45,
  [string]$MutexName = 'Global\CodexMarketingOsIntakeV2',
  [switch]$DryRun,
  [switch]$Quiet
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version 2.0

if ([string]::IsNullOrWhiteSpace($CanonicalRoot)) { $CanonicalRoot = Split-Path -Parent $PSScriptRoot }
$CanonicalRoot = [System.IO.Path]::GetFullPath($CanonicalRoot)
$SourceRunsPath = [System.IO.Path]::GetFullPath($SourceRunsPath)
$registryPath = Join-Path $CanonicalRoot 'registry\clients.json'
$intakeDirectory = Join-Path $CanonicalRoot 'intake'
$indexPath = Join-Path $intakeDirectory 'index.json'
$summaryPath = Join-Path $intakeDirectory 'summary.md'
$statePath = Join-Path $CanonicalRoot 'state\intake-sync.json'

function ConvertTo-UtcIsoString {
  param([Parameter(Mandatory = $true)][DateTimeOffset]$Value)
  return $Value.ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
}

function Get-Sha256Hex {
  param([AllowEmptyString()][string]$Value)

  $sha = [System.Security.Cryptography.SHA256]::Create()
  try {
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($Value)
    $hash = $sha.ComputeHash($bytes)
    return ([System.BitConverter]::ToString($hash)).Replace('-', '').ToLowerInvariant()
  }
  finally {
    $sha.Dispose()
  }
}

function Get-OptionalProperty {
  param(
    [AllowNull()][object]$InputObject,
    [Parameter(Mandatory = $true)][string]$Name,
    [AllowNull()][object]$DefaultValue = $null
  )

  if ($null -eq $InputObject) {
    return $DefaultValue
  }
  $property = $InputObject.PSObject.Properties[$Name]
  if ($null -eq $property) {
    return $DefaultValue
  }
  return $property.Value
}

function Normalize-Identity {
  param([AllowNull()][object]$Value)
  if ($null -eq $Value) { return '' }
  return ([string]$Value).Trim().ToLowerInvariant()
}

function Normalize-OutcomeText {
  param([AllowNull()][object]$Value)
  if ($null -eq $Value) { return '' }
  $normalized = ([string]$Value).Trim().ToLowerInvariant()
  return [System.Text.RegularExpressions.Regex]::Replace($normalized, '\s+', ' ')
}

function Get-SafeRoute {
  param([AllowNull()][object]$Value)
  if ($null -eq $Value) { return 'unknown' }
  $route = ([string]$Value).Trim().ToLowerInvariant().Replace('_', '-')
  if ($route -match '^[a-z0-9][a-z0-9-]{0,39}$') { return $route }
  return 'other'
}

function Get-SafeSourceChannel {
  param([AllowNull()][object]$EventKey)
  if ($null -eq $EventKey) { return 'unknown' }
  $prefix = (([string]$EventKey) -split ':', 2)[0].Trim().ToLowerInvariant()
  if ($prefix -in @('gmail', 'slack', 'inbox')) { return $prefix }
  return 'unknown'
}

function Test-SafeSourceLocator {
  param([AllowNull()][object]$Value)
  if ($null -eq $Value) { return $false }
  return ([string]$Value -match '^agent-os-run:[A-Za-z0-9][A-Za-z0-9_-]{5,79}/task\.json$')
}

function Get-SafeQuarantineReason {
  param([AllowNull()][object]$Value)
  $allowed = @(
    'ambiguous-client',
    'client-status-not-active',
    'exact-source-identity-required',
    'known-false-or-cross-client-route',
    'unresolved-client',
    'missing-current-outcome',
    'unsafe-execution-mode',
    'invalid-client-route',
    'manual-quarantine',
    'legacy-quarantine'
  )
  $candidate = ([string]$Value).Trim().ToLowerInvariant()
  if ($candidate -in $allowed) { return $candidate }
  return 'legacy-quarantine'
}

function Write-AtomicUtf8File {
  param(
    [Parameter(Mandatory = $true)][string]$Path,
    [Parameter(Mandatory = $true)][AllowEmptyString()][string]$Content
  )

  $directory = Split-Path -Parent $Path
  if (-not (Test-Path -LiteralPath $directory -PathType Container)) {
    [System.IO.Directory]::CreateDirectory($directory) | Out-Null
  }

  $tempPath = Join-Path $directory ('.' + [System.IO.Path]::GetFileName($Path) + '.' + [Guid]::NewGuid().ToString('N') + '.tmp')
  $backupPath = Join-Path $directory ('.' + [System.IO.Path]::GetFileName($Path) + '.' + [Guid]::NewGuid().ToString('N') + '.bak')
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  try {
    [System.IO.File]::WriteAllText($tempPath, $Content, $utf8NoBom)
    if (Test-Path -LiteralPath $Path -PathType Leaf) {
      [System.IO.File]::Replace($tempPath, $Path, $backupPath, $true)
      Remove-Item -LiteralPath $backupPath -Force
    }
    else {
      [System.IO.File]::Move($tempPath, $Path)
    }
  }
  finally {
    if (Test-Path -LiteralPath $tempPath -PathType Leaf) { Remove-Item -LiteralPath $tempPath -Force }
    if (Test-Path -LiteralPath $backupPath -PathType Leaf) { Remove-Item -LiteralPath $backupPath -Force }
  }
}

function Read-JsonFile {
  param([Parameter(Mandatory = $true)][string]$Path)
  if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) { return $null }
  return (Get-Content -LiteralPath $Path -Raw -Encoding UTF8 | ConvertFrom-Json)
}

function Add-IdentityMapping {
  param(
    [Parameter(Mandatory = $true)][hashtable]$Map,
    [AllowNull()][object]$Identity,
    [Parameter(Mandatory = $true)][object]$Client
  )

  $key = Normalize-Identity $Identity
  if ([string]::IsNullOrWhiteSpace($key)) { return }
  if (-not $Map.ContainsKey($key)) { $Map[$key] = New-Object System.Collections.ArrayList }
  foreach ($existingClient in $Map[$key]) {
    if ([string]$existingClient.id -eq [string]$Client.id) { return }
  }
  [void]$Map[$key].Add($Client)
}

function Resolve-ExactClient {
  param(
    [Parameter(Mandatory = $true)][hashtable]$IdentityMap,
    [AllowNull()][object]$ClientValue,
    [AllowNull()][object]$AliasValue
  )

  $matchesById = @{}
  foreach ($candidateValue in @($ClientValue, $AliasValue)) {
    $key = Normalize-Identity $candidateValue
    if (-not [string]::IsNullOrWhiteSpace($key) -and $IdentityMap.ContainsKey($key)) {
      foreach ($candidateClient in $IdentityMap[$key]) {
        $matchesById[[string]$candidateClient.id] = $candidateClient
      }
    }
  }

  if ($matchesById.Count -gt 1) { return [pscustomobject]@{ Client = $null; Reason = 'ambiguous-client' } }
  if ($matchesById.Count -eq 1) {
    $resolvedClient = @($matchesById.Values)[0]
    if ([string]$resolvedClient.status -ne 'active') {
      return [pscustomobject]@{ Client = $null; Reason = 'client-status-not-active' }
    }
    return [pscustomobject]@{ Client = $resolvedClient; Reason = $null }
  }

  $knownFalseIdentities = @('bridge', 'claude', 'general', 'gmail', 'google', 'inbox', 'slack', 'unknown')
  $normalizedClient = Normalize-Identity $ClientValue
  if ($normalizedClient.Contains('/') -or $knownFalseIdentities -contains $normalizedClient) {
    return [pscustomobject]@{ Client = $null; Reason = 'known-false-or-cross-client-route' }
  }
  return [pscustomobject]@{ Client = $null; Reason = 'unresolved-client' }
}

function Test-ExactSourceIdentityForClient {
  param(
    [Parameter(Mandatory = $true)][object]$Task,
    [Parameter(Mandatory = $true)][object]$Client
  )

  $routingPolicy = Get-OptionalProperty $Client 'intakeRouting'
  $requiresExactSource = $false
  if ($null -ne $routingPolicy) {
    $requiresExactSource = [bool](Get-OptionalProperty $routingPolicy 'requireExactSourceIdentity' $false)
  }
  if (-not $requiresExactSource) { return $true }

  $allowed = @{}
  foreach ($contact in @($Client.contacts)) {
    $email = Normalize-Identity (Get-OptionalProperty $contact 'email')
    if (-not [string]::IsNullOrWhiteSpace($email)) {
      $allowed[$email] = $true
      $allowed['email:' + $email] = $true
    }
  }
  foreach ($domainValue in @($Client.emailDomains)) {
    $domain = Normalize-Identity $domainValue
    if (-not [string]::IsNullOrWhiteSpace($domain)) {
      $allowed[$domain] = $true
      $allowed['domain:' + $domain] = $true
    }
  }
  foreach ($channelValue in @($Client.slackChannels)) {
    $channel = Normalize-Identity $channelValue
    if (-not [string]::IsNullOrWhiteSpace($channel)) {
      $allowed[$channel] = $true
      $allowed['slack:' + $channel] = $true
      $allowed['slack-channel:' + $channel] = $true
    }
  }

  foreach ($sourceKeyValue in @((Get-OptionalProperty $Task 'source_identity_keys' @()))) {
    $sourceKey = Normalize-Identity $sourceKeyValue
    if (-not [string]::IsNullOrWhiteSpace($sourceKey) -and $allowed.ContainsKey($sourceKey)) { return $true }
  }
  return $false
}

function Get-SourceRecord {
  param(
    [Parameter(Mandatory = $true)][System.IO.FileInfo]$TaskFile,
    [Parameter(Mandatory = $true)][string]$SourceRoot
  )

  $sourceRootPrefix = $SourceRoot.TrimEnd('\', '/') + [System.IO.Path]::DirectorySeparatorChar
  $fullPath = [System.IO.Path]::GetFullPath($TaskFile.FullName)
  if (-not $fullPath.StartsWith($sourceRootPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw 'Task file escaped the configured source root.'
  }
  $relativePath = $fullPath.Substring($sourceRootPrefix.Length).Replace('/', '\')
  $segments = @($relativePath -split '\\')
  if ($segments.Count -ne 2 -or $segments[1] -ne 'task.json' -or $segments[0] -notmatch '^[A-Za-z0-9][A-Za-z0-9_-]{5,79}$') {
    throw 'Task file did not have a safe one-run source path.'
  }
  if (($TaskFile.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) {
    throw 'Task source uses a reparse point.'
  }
  $pathNode = $TaskFile.Directory
  while ($null -ne $pathNode -and -not [string]::Equals($pathNode.FullName, $SourceRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    if (($pathNode.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) {
      throw 'Task source uses a reparse point.'
    }
    $pathNode = $pathNode.Parent
  }

  $task = Get-Content -LiteralPath $fullPath -Raw -Encoding UTF8 | ConvertFrom-Json
  $createdAt = [DateTimeOffset]::MinValue
  if ($null -eq (Get-OptionalProperty $task 'created_at') -or -not [DateTimeOffset]::TryParse([string](Get-OptionalProperty $task 'created_at'), [ref]$createdAt)) {
    throw 'Task file did not contain a valid created_at timestamp.'
  }
  $sourceMaterial = [string](Get-OptionalProperty $task 'job_id') + '|' + [string](Get-OptionalProperty $task 'event_key')
  return [pscustomobject]@{
    Task = $task
    CreatedAt = $createdAt.ToUniversalTime()
    FileObservedAt = [DateTimeOffset]$TaskFile.LastWriteTimeUtc
    SourceLocator = 'agent-os-run:' + $segments[0] + '/task.json'
    LegacySourceRef = 'sha256:' + (Get-Sha256Hex $sourceMaterial)
  }
}

function ConvertTo-CurrentIntakeItem {
  param(
    [Parameter(Mandatory = $true)][object]$LegacyItem,
    [Parameter(Mandatory = $true)][hashtable]$LegacyLocatorMap,
    [Parameter(Mandatory = $true)][hashtable]$ActiveClientById
  )

  $sourceLocator = [string](Get-OptionalProperty $LegacyItem 'sourceLocator')
  if (-not (Test-SafeSourceLocator $sourceLocator)) {
    $legacyRef = [string](Get-OptionalProperty $LegacyItem 'sourceRef')
    if ($LegacyLocatorMap.ContainsKey($legacyRef)) { $sourceLocator = [string]$LegacyLocatorMap[$legacyRef] }
  }
  if (-not (Test-SafeSourceLocator $sourceLocator)) { return $null }

  $receivedAt = [DateTimeOffset]::MinValue
  if (-not [DateTimeOffset]::TryParse([string](Get-OptionalProperty $LegacyItem 'receivedAtUtc'), [ref]$receivedAt)) { return $null }
  $receivedAt = $receivedAt.ToUniversalTime()

  $triageState = [string](Get-OptionalProperty $LegacyItem 'triageState')
  if ($triageState -notin @('pending', 'quarantined', 'resolved', 'acknowledged')) {
    if ([string](Get-OptionalProperty $LegacyItem 'disposition') -eq 'accepted') { $triageState = 'pending' }
    else { $triageState = 'quarantined' }
  }

  $clientId = [string](Get-OptionalProperty $LegacyItem 'clientId')
  if ([string]::IsNullOrWhiteSpace($clientId)) { $clientId = $null }
  elseif (-not $ActiveClientById.ContainsKey($clientId)) {
    $clientId = $null
    $triageState = 'quarantined'
  }

  $outcomeFingerprint = [string](Get-OptionalProperty $LegacyItem 'outcomeFingerprint')
  if ($outcomeFingerprint -notmatch '^[a-f0-9]{64}$') {
    $outcomeFingerprint = Get-Sha256Hex ('legacy-v2|' + $sourceLocator)
  }
  $occurrenceFingerprint = [string](Get-OptionalProperty $LegacyItem 'occurrenceFingerprint')
  if ($occurrenceFingerprint -notmatch '^[a-f0-9]{64}$') {
    $occurrenceFingerprint = Get-Sha256Hex ('occurrence-v1|' + $sourceLocator)
  }

  $intakeId = [string](Get-OptionalProperty $LegacyItem 'intakeId')
  if ($intakeId -notmatch '^intake-[a-f0-9]{20}$') { $intakeId = 'intake-' + $occurrenceFingerprint.Substring(0, 20) }
  $promotedWorkItemId = [string](Get-OptionalProperty $LegacyItem 'promotedWorkItemId')
  if ([string]::IsNullOrWhiteSpace($promotedWorkItemId) -or $promotedWorkItemId -notmatch '^wi-[A-Za-z0-9][A-Za-z0-9_-]{5,79}$') {
    $promotedWorkItemId = $null
  }
  $resolvedAtUtc = [string](Get-OptionalProperty $LegacyItem 'resolvedAtUtc')
  if ([string]::IsNullOrWhiteSpace($resolvedAtUtc)) { $resolvedAtUtc = $null }
  $resolutionAction = [string](Get-OptionalProperty $LegacyItem 'resolutionAction')
  if ($resolutionAction -notin @('promoted', 'acknowledged')) { $resolutionAction = $null }

  $quarantineReason = $null
  if ($triageState -eq 'quarantined') {
    $quarantineReason = Get-SafeQuarantineReason (Get-OptionalProperty $LegacyItem 'quarantineReason')
  }

  return [pscustomobject][ordered]@{
    intakeId = $intakeId
    receivedAtUtc = ConvertTo-UtcIsoString $receivedAt
    sourceChannel = Get-SafeSourceChannel (Get-OptionalProperty $LegacyItem 'sourceChannel')
    sourceLocator = $sourceLocator
    clientId = $clientId
    route = Get-SafeRoute (Get-OptionalProperty $LegacyItem 'route')
    outcomeFingerprint = $outcomeFingerprint
    occurrenceFingerprint = $occurrenceFingerprint
    triageState = $triageState
    quarantineReason = $quarantineReason
    promotedWorkItemId = $promotedWorkItemId
    resolvedAtUtc = $resolvedAtUtc
    resolutionAction = $resolutionAction
  }
}

function Test-RecentOpenSemanticDuplicate {
  param(
    [Parameter(Mandatory = $true)][System.Collections.IEnumerable]$Items,
    [Parameter(Mandatory = $true)][string]$OutcomeFingerprint,
    [Parameter(Mandatory = $true)][DateTimeOffset]$CreatedAt,
    [Parameter(Mandatory = $true)][int]$WindowHours
  )

  foreach ($item in @($Items)) {
    if ([string]$item.outcomeFingerprint -ne $OutcomeFingerprint) { continue }
    if ([string]$item.triageState -notin @('pending', 'quarantined')) { continue }
    $itemAt = [DateTimeOffset]::MinValue
    if (-not [DateTimeOffset]::TryParse([string]$item.receivedAtUtc, [ref]$itemAt)) { continue }
    if ([Math]::Abs(($CreatedAt - $itemAt.ToUniversalTime()).TotalHours) -le $WindowHours) { return $true }
  }
  return $false
}

function New-IntakeSummary {
  param(
    [Parameter(Mandatory = $true)][System.Collections.IEnumerable]$Items,
    [Parameter(Mandatory = $true)][DateTimeOffset]$GeneratedAt,
    [Parameter(Mandatory = $true)][object]$RunResult
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
  $lines.Add('## Latest sync')
  $lines.Add('')
  $lines.Add('- Metadata records scanned: ' + $RunResult.scanned)
  $lines.Add('- New pending routes: ' + $RunResult.accepted)
  $lines.Add('- New quarantined routes: ' + $RunResult.quarantined)
  $lines.Add('- Exact source occurrences suppressed: ' + $RunResult.occurrenceDuplicates)
  $lines.Add('- Recent open semantic duplicates suppressed: ' + $RunResult.semanticDuplicates)
  $lines.Add('- Legacy records migrated: ' + $RunResult.migrated)
  $lines.Add('- Legacy records without a retrievable source dropped: ' + $RunResult.migrationUnresolved)
  $lines.Add('')
  $lines.Add('Use `scripts/Get-PendingIntake.ps1` to list safe locators and `scripts/Resolve-IntakeObservation.ps1` to promote, acknowledge, or quarantine an observation.')
  return ($lines -join [Environment]::NewLine) + [Environment]::NewLine
}

if (-not (Test-Path -LiteralPath $SourceRunsPath -PathType Container)) { throw 'The configured Agent OS runs directory does not exist.' }
if (-not (Test-Path -LiteralPath $registryPath -PathType Leaf)) { throw 'The canonical client registry does not exist.' }
if ([string]::IsNullOrWhiteSpace($MutexName) -or $MutexName.Length -gt 180) { throw 'The intake mutex name is invalid.' }

$mutex = [System.Threading.Mutex]::new($false, $MutexName)
$lockTaken = $false
try {
  try { $lockTaken = $mutex.WaitOne([TimeSpan]::FromSeconds($MutexWaitSeconds)) }
  catch [System.Threading.AbandonedMutexException] { $lockTaken = $true }
  if (-not $lockTaken) { throw ('Timed out after {0} seconds waiting for the canonical intake mutex.' -f $MutexWaitSeconds) }

  $registry = Read-JsonFile $registryPath
  if ($null -eq $registry -or [int]$registry.schemaVersion -ne 1) { throw 'The canonical client registry schema is not supported.' }
  $identityMap = @{}
  $activeClientById = @{}
  foreach ($client in @($registry.clients)) {
    if ([string]$client.status -eq 'active') { $activeClientById[[string]$client.id] = $client }
    Add-IdentityMapping -Map $identityMap -Identity $client.id -Client $client
    Add-IdentityMapping -Map $identityMap -Identity $client.displayName -Client $client
    foreach ($alias in @($client.aliases)) { Add-IdentityMapping -Map $identityMap -Identity $alias -Client $client }
  }

  $now = [DateTimeOffset]::UtcNow
  $state = Read-JsonFile $statePath
  $savedWatermark = $null
  $watermarkValue = Get-OptionalProperty $state 'watermarkUtc'
  if (-not [string]::IsNullOrWhiteSpace([string]$watermarkValue)) {
    $parsedWatermark = [DateTimeOffset]::MinValue
    if ([DateTimeOffset]::TryParse([string]$watermarkValue, [ref]$parsedWatermark)) { $savedWatermark = $parsedWatermark.ToUniversalTime() }
  }
  if ($null -eq $savedWatermark) { $windowStart = $now.AddHours(-1 * $InitialLookbackHours) }
  else { $windowStart = $savedWatermark.AddMinutes(-1 * $OverlapMinutes) }

  $existingIndex = Read-JsonFile $indexPath
  if ($null -ne $existingIndex -and [int]$existingIndex.schemaVersion -notin @(1, 2)) { throw 'The canonical intake index schema is not supported.' }
  $legacyItems = @()
  if ($null -ne $existingIndex) { $legacyItems = @($existingIndex.items) }

  $stats = [ordered]@{
    scanned = 0
    accepted = 0
    quarantined = 0
    occurrenceDuplicates = 0
    semanticDuplicates = 0
    invalid = 0
    migrated = 0
    migrationUnresolved = 0
  }

  $sourceRecords = New-Object System.Collections.ArrayList
  $legacyLocatorMap = @{}
  $sourceRecordByLocator = @{}
  $taskFiles = @(Get-ChildItem -LiteralPath $SourceRunsPath -Filter 'task.json' -File -Recurse -ErrorAction Stop)
  foreach ($taskFile in $taskFiles) {
    try {
      $record = Get-SourceRecord -TaskFile $taskFile -SourceRoot $SourceRunsPath
      [void]$sourceRecords.Add($record)
      $legacyRef = [string]$record.LegacySourceRef
      if ($legacyLocatorMap.ContainsKey($legacyRef) -and [string]$legacyLocatorMap[$legacyRef] -ne [string]$record.SourceLocator) {
        $legacyLocatorMap[$legacyRef] = ''
      }
      else {
        $legacyLocatorMap[$legacyRef] = [string]$record.SourceLocator
      }
      $sourceRecordByLocator[[string]$record.SourceLocator] = $record
    }
    catch {
      if ($taskFile.LastWriteTimeUtc -ge $windowStart.UtcDateTime) { $stats.invalid++ }
    }
  }

  $existingItems = New-Object System.Collections.ArrayList
  foreach ($legacyItem in $legacyItems) {
    $currentItem = ConvertTo-CurrentIntakeItem -LegacyItem $legacyItem -LegacyLocatorMap $legacyLocatorMap -ActiveClientById $activeClientById
    if ($null -eq $currentItem) { $stats.migrationUnresolved++; continue }
    if ($sourceRecordByLocator.ContainsKey([string]$currentItem.sourceLocator)) {
      $sourceTask = $sourceRecordByLocator[[string]$currentItem.sourceLocator].Task
      $fingerprintClient = [string]$currentItem.clientId
      if ([string]::IsNullOrWhiteSpace($fingerprintClient)) { $fingerprintClient = 'quarantine' }
      $currentItem.outcomeFingerprint = Get-Sha256Hex ('v2|' + $fingerprintClient + '|' + [string]$currentItem.route + '|' + (Normalize-OutcomeText (Get-OptionalProperty $sourceTask 'requested_output')))
    }
    [void]$existingItems.Add($currentItem)
    if ($null -ne $existingIndex -and [int]$existingIndex.schemaVersion -eq 1) { $stats.migrated++ }
  }

  $knownOccurrences = @{}
  foreach ($existingItem in @($existingItems)) { $knownOccurrences[[string]$existingItem.occurrenceFingerprint] = $true }
  $newItems = New-Object System.Collections.ArrayList
  foreach ($record in @($sourceRecords | Sort-Object -Property CreatedAt)) {
    $createdAt = [DateTimeOffset]$record.CreatedAt
    $fileObservedAt = [DateTimeOffset]$record.FileObservedAt
    if (($createdAt -lt $windowStart -and $fileObservedAt -lt $windowStart) -or $createdAt -gt $now.AddMinutes(5)) { continue }
    $stats.scanned++

    $occurrenceFingerprint = Get-Sha256Hex ('occurrence-v1|' + [string]$record.SourceLocator)
    if ($knownOccurrences.ContainsKey($occurrenceFingerprint)) { $stats.occurrenceDuplicates++; continue }

    $task = $record.Task
    $resolution = Resolve-ExactClient -IdentityMap $identityMap -ClientValue (Get-OptionalProperty $task 'client') -AliasValue (Get-OptionalProperty $task 'client_alias')
    $reason = [string]$resolution.Reason
    $clientId = $null
    if ($null -ne $resolution.Client) { $clientId = [string]$resolution.Client.id }
    if ([string]::IsNullOrWhiteSpace($reason) -and $null -ne $resolution.Client -and -not (Test-ExactSourceIdentityForClient -Task $task -Client $resolution.Client)) {
      $reason = 'exact-source-identity-required'
      $clientId = $null
    }
    $normalizedOutcome = Normalize-OutcomeText (Get-OptionalProperty $task 'requested_output')
    if ([string]::IsNullOrWhiteSpace($reason) -and [string]::IsNullOrWhiteSpace($normalizedOutcome)) { $reason = 'missing-current-outcome' }
    if ([string]::IsNullOrWhiteSpace($reason) -and [string](Get-OptionalProperty $task 'safe_execution') -ne 'local_deliverable_only') { $reason = 'unsafe-execution-mode' }

    $safeRoute = Get-SafeRoute (Get-OptionalProperty $task 'route')
    $fingerprintClient = $clientId
    if ([string]::IsNullOrWhiteSpace($fingerprintClient)) { $fingerprintClient = 'quarantine' }
    $outcomeFingerprint = Get-Sha256Hex ('v2|' + $fingerprintClient + '|' + $safeRoute + '|' + $normalizedOutcome)
    $comparisonItems = @($existingItems) + @($newItems)
    if (Test-RecentOpenSemanticDuplicate -Items $comparisonItems -OutcomeFingerprint $outcomeFingerprint -CreatedAt $createdAt -WindowHours $SemanticDedupeHours) {
      $knownOccurrences[$occurrenceFingerprint] = $true
      $stats.semanticDuplicates++
      continue
    }

    $triageState = 'pending'
    $quarantineReason = $null
    if (-not [string]::IsNullOrWhiteSpace($reason)) {
      $triageState = 'quarantined'
      $quarantineReason = Get-SafeQuarantineReason $reason
      $clientId = $null
      $stats.quarantined++
    }
    else { $stats.accepted++ }

    $item = [pscustomobject][ordered]@{
      intakeId = 'intake-' + $occurrenceFingerprint.Substring(0, 20)
      receivedAtUtc = ConvertTo-UtcIsoString $createdAt
      sourceChannel = Get-SafeSourceChannel (Get-OptionalProperty $task 'event_key')
      sourceLocator = [string]$record.SourceLocator
      clientId = $clientId
      route = $safeRoute
      outcomeFingerprint = $outcomeFingerprint
      occurrenceFingerprint = $occurrenceFingerprint
      triageState = $triageState
      quarantineReason = $quarantineReason
      promotedWorkItemId = $null
      resolvedAtUtc = $null
      resolutionAction = $null
    }
    [void]$newItems.Add($item)
    $knownOccurrences[$occurrenceFingerprint] = $true
  }

  $runResult = [ordered]@{
    status = $(if ($DryRun) { 'dry-run' } else { 'synchronized' })
    windowStartUtc = ConvertTo-UtcIsoString $windowStart
    completedAtUtc = ConvertTo-UtcIsoString $now
    scanned = $stats.scanned
    accepted = $stats.accepted
    quarantined = $stats.quarantined
    occurrenceDuplicates = $stats.occurrenceDuplicates
    semanticDuplicates = $stats.semanticDuplicates
    invalid = $stats.invalid
    migrated = $stats.migrated
    migrationUnresolved = $stats.migrationUnresolved
    createdCodexTasks = 0
    notificationsSent = 0
  }

  if (-not $DryRun) {
    $allItems = @(@($existingItems) + @($newItems) | Sort-Object -Property receivedAtUtc, intakeId -Descending)
    $indexDocument = [ordered]@{
      schemaVersion = 2
      generatedAtUtc = ConvertTo-UtcIsoString $now
      privacy = [ordered]@{
        classification = 'redacted-metadata-and-opaque-locators-only'
        rawContentStored = $false
        directIdentifiersStored = $false
        secretsStored = $false
      }
      source = [ordered]@{
        kind = 'agent-os-task-json'
        locatorScheme = 'agent-os-run:<safe-run-id>/task.json'
        initialLookbackHours = $InitialLookbackHours
        overlapMinutes = $OverlapMinutes
        semanticDedupeHours = $SemanticDedupeHours
      }
      lastRun = [pscustomobject]$runResult
      items = $allItems
    }
    $stateDocument = [ordered]@{
      schemaVersion = 2
      sourceKind = 'agent-os-task-json'
      watermarkUtc = ConvertTo-UtcIsoString $now
      lastRunAtUtc = ConvertTo-UtcIsoString $now
      lastStatus = 'synchronized'
      lastRunStats = [pscustomobject]$runResult
    }

    $indexJson = $indexDocument | ConvertTo-Json -Depth 8
    $stateJson = $stateDocument | ConvertTo-Json -Depth 6
    $summaryText = New-IntakeSummary -Items $allItems -GeneratedAt $now -RunResult ([pscustomobject]$runResult)
    Write-AtomicUtf8File -Path $indexPath -Content ($indexJson + [Environment]::NewLine)
    Write-AtomicUtf8File -Path $summaryPath -Content $summaryText
    Write-AtomicUtf8File -Path $statePath -Content ($stateJson + [Environment]::NewLine)
  }

  if (-not $Quiet) { [pscustomobject]$runResult | ConvertTo-Json -Compress }
}
finally {
  if ($lockTaken) { $mutex.ReleaseMutex() }
  $mutex.Dispose()
}
