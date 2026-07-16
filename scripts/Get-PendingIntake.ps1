[CmdletBinding()]
param(
  [string]$CanonicalRoot,
  [ValidateSet('pending', 'quarantined', 'resolved', 'acknowledged')]
  [string[]]$TriageState = @('pending', 'quarantined'),
  [string]$ClientId,
  [ValidateRange(1, 500)]
  [int]$Limit = 100,
  [ValidateRange(1, 45)]
  [int]$MutexWaitSeconds = 45,
  [string]$MutexName = 'Global\CodexMarketingOsIntakeV2',
  [switch]$AsJson
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

function Assert-SafeItem {
  param([Parameter(Mandatory = $true)][object]$Item)

  $allowedProperties = @('intakeId', 'receivedAtUtc', 'sourceChannel', 'sourceLocator', 'clientId', 'route', 'outcomeFingerprint', 'occurrenceFingerprint', 'triageState', 'quarantineReason', 'promotedWorkItemId', 'resolvedAtUtc', 'resolutionAction')
  foreach ($property in @($Item.PSObject.Properties)) {
    if ([string]$property.Name -notin $allowedProperties) { throw 'Intake contains a non-contract property.' }
  }
  if ([string]$Item.intakeId -notmatch '^intake-[a-f0-9]{20}$') { throw 'Intake contains an invalid intake identifier.' }
  if ([string]$Item.sourceLocator -notmatch '^agent-os-run:[A-Za-z0-9][A-Za-z0-9_-]{5,79}/task\.json$') { throw 'Intake contains an unsafe source locator.' }
  if ([string]$Item.sourceChannel -notin @('gmail', 'slack', 'inbox', 'unknown')) { throw 'Intake contains an unsafe source channel.' }
  if ([string]$Item.route -notmatch '^[a-z0-9][a-z0-9-]{0,39}$') { throw 'Intake contains an unsafe route.' }
  if ([string]$Item.triageState -notin @('pending', 'quarantined', 'resolved', 'acknowledged')) { throw 'Intake contains an invalid triage state.' }
  if ([string]$Item.outcomeFingerprint -notmatch '^[a-f0-9]{64}$' -or [string]$Item.occurrenceFingerprint -notmatch '^[a-f0-9]{64}$') { throw 'Intake contains an invalid fingerprint.' }
  $receivedAt = [DateTimeOffset]::MinValue
  if (-not [DateTimeOffset]::TryParse([string]$Item.receivedAtUtc, [ref]$receivedAt)) { throw 'Intake contains an invalid received timestamp.' }
  $storedClientId = [string](Get-OptionalProperty $Item 'clientId')
  if (-not [string]::IsNullOrWhiteSpace($storedClientId) -and $storedClientId -notmatch '^[a-z0-9][a-z0-9-]{0,79}$') { throw 'Intake contains an unsafe client identifier.' }
  $workItemId = [string](Get-OptionalProperty $Item 'promotedWorkItemId')
  if (-not [string]::IsNullOrWhiteSpace($workItemId) -and $workItemId -notmatch '^wi-[A-Za-z0-9][A-Za-z0-9_-]{5,79}$') { throw 'Intake contains an unsafe promoted work-item identifier.' }
  $quarantineReason = [string](Get-OptionalProperty $Item 'quarantineReason')
  $allowedReasons = @('ambiguous-client', 'client-status-not-active', 'known-false-or-cross-client-route', 'unresolved-client', 'missing-current-outcome', 'unsafe-execution-mode', 'invalid-client-route', 'manual-quarantine', 'legacy-quarantine')
  if (-not [string]::IsNullOrWhiteSpace($quarantineReason) -and $quarantineReason -notin $allowedReasons) { throw 'Intake contains an unsafe quarantine reason.' }
  $resolutionAction = [string](Get-OptionalProperty $Item 'resolutionAction')
  if (-not [string]::IsNullOrWhiteSpace($resolutionAction) -and $resolutionAction -notin @('promoted', 'acknowledged')) { throw 'Intake contains an invalid resolution action.' }
}

if ([string]::IsNullOrWhiteSpace($CanonicalRoot)) { $CanonicalRoot = Split-Path -Parent $PSScriptRoot }
$CanonicalRoot = [System.IO.Path]::GetFullPath($CanonicalRoot)
$indexPath = Join-Path $CanonicalRoot 'intake\index.json'
if (-not (Test-Path -LiteralPath $indexPath -PathType Leaf)) { throw 'The canonical intake index does not exist.' }
if (-not [string]::IsNullOrWhiteSpace($ClientId) -and $ClientId -notmatch '^[a-z0-9][a-z0-9-]{0,79}$') { throw 'The client filter is invalid.' }

$mutex = [System.Threading.Mutex]::new($false, $MutexName)
$lockTaken = $false
try {
  try { $lockTaken = $mutex.WaitOne([TimeSpan]::FromSeconds($MutexWaitSeconds)) }
  catch [System.Threading.AbandonedMutexException] { $lockTaken = $true }
  if (-not $lockTaken) { throw ('Timed out after {0} seconds waiting for the canonical intake mutex.' -f $MutexWaitSeconds) }

  $index = Get-Content -LiteralPath $indexPath -Raw -Encoding UTF8 | ConvertFrom-Json
  if ([int]$index.schemaVersion -ne 2) { throw 'Run Sync-AgentOsIntake.ps1 once to migrate the intake index to schema version 2.' }
  $allowedIndexProperties = @('schemaVersion', 'generatedAtUtc', 'privacy', 'source', 'lastRun', 'lastResolution', 'items')
  foreach ($property in @($index.PSObject.Properties)) {
    if ([string]$property.Name -notin $allowedIndexProperties) { throw 'The intake index contains a non-contract property.' }
  }
  $generatedAt = [DateTimeOffset]::MinValue
  if (-not [DateTimeOffset]::TryParse([string]$index.generatedAtUtc, [ref]$generatedAt)) { throw 'The intake index generation timestamp is invalid.' }
  $privacy = Get-OptionalProperty $index 'privacy'
  if ([bool](Get-OptionalProperty $privacy 'rawContentStored' $true) -or
      [bool](Get-OptionalProperty $privacy 'directIdentifiersStored' $true) -or
      [bool](Get-OptionalProperty $privacy 'secretsStored' $true)) {
    throw 'The intake privacy contract is not satisfied.'
  }

  $selected = New-Object System.Collections.ArrayList
  foreach ($item in @($index.items | Sort-Object -Property receivedAtUtc, intakeId -Descending)) {
    Assert-SafeItem $item
    if ([string]$item.triageState -notin $TriageState) { continue }
    $itemClientId = [string](Get-OptionalProperty $item 'clientId')
    if (-not [string]::IsNullOrWhiteSpace($ClientId) -and $itemClientId -ne $ClientId) { continue }
    if ($selected.Count -ge $Limit) { break }
    [void]$selected.Add([pscustomobject][ordered]@{
      intakeId = [string]$item.intakeId
      receivedAtUtc = [string]$item.receivedAtUtc
      sourceChannel = [string]$item.sourceChannel
      sourceLocator = [string]$item.sourceLocator
      clientId = $(if ([string]::IsNullOrWhiteSpace($itemClientId)) { $null } else { $itemClientId })
      route = [string]$item.route
      triageState = [string]$item.triageState
      quarantineReason = Get-OptionalProperty $item 'quarantineReason'
      promotedWorkItemId = Get-OptionalProperty $item 'promotedWorkItemId'
    })
  }

  $result = [pscustomobject][ordered]@{
    schemaVersion = 1
    indexGeneratedAtUtc = [string]$index.generatedAtUtc
    count = $selected.Count
    items = @($selected)
  }
  if ($AsJson) { $result | ConvertTo-Json -Depth 5 }
  else { $result }
}
finally {
  if ($lockTaken) { $mutex.ReleaseMutex() }
  $mutex.Dispose()
}
