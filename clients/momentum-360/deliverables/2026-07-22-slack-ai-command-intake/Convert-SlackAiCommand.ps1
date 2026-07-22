[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][string]$EventPath,
  [Parameter(Mandatory = $true)][string]$ConfigPath,
  [Parameter(Mandatory = $true)][string]$OutputDirectory
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version 2.0

function Get-Sha256([string]$Value) {
  $sha = [Security.Cryptography.SHA256]::Create()
  try { return ([BitConverter]::ToString($sha.ComputeHash([Text.Encoding]::UTF8.GetBytes($Value)))).Replace('-', '').ToLowerInvariant() }
  finally { $sha.Dispose() }
}

function Fail([string]$Reason) {
  [pscustomobject]@{ accepted = $false; reason = $Reason } | ConvertTo-Json -Compress
  exit 2
}

$event = Get-Content -LiteralPath $EventPath -Raw -Encoding UTF8 | ConvertFrom-Json
$config = Get-Content -LiteralPath $ConfigPath -Raw -Encoding UTF8 | ConvertFrom-Json

foreach ($name in @('team_id', 'channel_id', 'user_id', 'ts', 'text')) {
  if (-not $event.PSObject.Properties[$name] -or [string]::IsNullOrWhiteSpace([string]$event.$name)) { Fail "missing-$name" }
}
if ([string]$event.team_id -ne [string]$config.teamId) { Fail 'team-not-allowed' }
if ([string]$event.user_id -notin @($config.allowedUserIds)) { Fail 'user-not-allowed' }

$isDm = [string]$event.channel_type -eq 'im'
if (-not $isDm -and [string]$event.channel_id -notin @($config.allowedChannelIds)) { Fail 'channel-not-allowed' }

$text = ([string]$event.text).Trim()
$match = [regex]::Match($text, '^(?:/ai|ai:)\s+([a-z0-9][a-z0-9-]{0,79})\s*:\s*(.{3,2000})$', 'IgnoreCase')
if (-not $match.Success) { Fail 'invalid-command-syntax' }
$clientId = $match.Groups[1].Value.ToLowerInvariant()
$prompt = $match.Groups[2].Value.Trim()
if ($clientId -notin @($config.allowedClientIds)) { Fail 'client-not-allowed' }

$approvalPattern = '(?i)\b(send|post|publish|deploy|launch|enable|activate|delete|remove|spend|purchase|refund|billing|credential|password|oauth|sms|call routing|phone number)\b'
$approvalRequired = [regex]::IsMatch($prompt, $approvalPattern)
$occurrence = Get-Sha256("$($event.team_id)|$($event.channel_id)|$($event.ts)")
$runId = 'slackcmd-' + $occurrence.Substring(0, 20)
$runDirectory = Join-Path ([IO.Path]::GetFullPath($OutputDirectory)) $runId
$taskPath = Join-Path $runDirectory 'task.json'

if (Test-Path -LiteralPath $taskPath) {
  [pscustomobject]@{ accepted = $true; duplicate = $true; runId = $runId; taskPath = $taskPath } | ConvertTo-Json -Compress
  exit 0
}

[IO.Directory]::CreateDirectory($runDirectory) | Out-Null
$task = [ordered]@{
  job_id = $runId
  created_at = ([DateTimeOffset]::UtcNow.ToString('o'))
  event_key = "slack:$($event.channel_id):$($event.ts)"
  client = $clientId
  client_alias = $null
  source_identity_keys = @("slack-channel:$($event.channel_id)", "slack-user:$($event.user_id)")
  route = 'marketing-chief'
  requested_output = $prompt
  safe_execution = 'local_deliverable_only'
  approval_required = $approvalRequired
  approval_reason = $(if ($approvalRequired) { 'Command contains an external or account-changing action.' } else { $null })
}
$json = $task | ConvertTo-Json -Depth 5
[IO.File]::WriteAllText($taskPath, $json + [Environment]::NewLine, [Text.UTF8Encoding]::new($false))

[pscustomobject]@{
  accepted = $true
  duplicate = $false
  runId = $runId
  taskPath = $taskPath
  approvalRequired = $approvalRequired
} | ConvertTo-Json -Compress
