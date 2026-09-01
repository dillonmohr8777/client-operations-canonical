<#
.SYNOPSIS
  Pull pending Tock events from the public relay into a local inbox folder, then acknowledge them.

.DESCRIPTION
  Runs on the Windows machine next to the tested local receiver. Each event is written as
  <OutDir>\<reservationId>_<digest>.json exactly as the relay stored it (the original Tock body
  is in the `body` field). The receiver ingests from that folder with its existing insertion,
  duplicate suppression, and venue filtering. Acks are sent only after every file in the batch
  is written, so a crash mid-batch re-delivers rather than loses.

  The drain token is read from the environment variable named by -TokenEnvName. Put it there
  from Windows Credential Manager or Access Broker in the calling shell; never pass it on the
  command line and never write it to disk.

.EXAMPLE
  $env:TOCK_RELAY_DRAIN_TOKEN = <from Credential Manager>
  .\Drain-TockRelay.ps1 -RelayBase https://<site>.netlify.app -OutDir C:\path\to\receiver\inbox -DryRun
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$RelayBase,
    [Parameter(Mandatory = $true)][string]$OutDir,
    [string]$TokenEnvName = 'TOCK_RELAY_DRAIN_TOKEN',
    [ValidateRange(1, 500)][int]$Limit = 100,
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
$token = [Environment]::GetEnvironmentVariable($TokenEnvName)
if ([string]::IsNullOrWhiteSpace($token)) { throw "Environment variable $TokenEnvName is empty. Load the drain token into it first." }
$headers = @{ Authorization = "Bearer $token" }
$base = $RelayBase.TrimEnd('/')

if (-not (Test-Path -LiteralPath $OutDir)) { New-Item -ItemType Directory -Path $OutDir -Force | Out-Null }

$health = Invoke-RestMethod -Method Get -Uri "$base/tock/health" -Headers $headers
Write-Host ("relay ok={0} pending={1} acked={2} venue={3}" -f $health.ok, $health.pending, $health.acked, $health.venue)

$batch = Invoke-RestMethod -Method Get -Uri "$base/tock/drain?limit=$Limit" -Headers $headers
$events = @($batch.events)
if ($events.Count -eq 0) { Write-Host 'nothing pending'; exit 0 }

$written = New-Object System.Collections.Generic.List[string]
foreach ($event in $events) {
    $fileName = ($event.key -replace '/', '_') + '.json'
    $path = Join-Path $OutDir $fileName
    if ($DryRun) { Write-Host "would write $path (reservation $($event.reservationId), received $($event.receivedAt))"; continue }
    [IO.File]::WriteAllText($path, ($event | ConvertTo-Json -Depth 20), [Text.UTF8Encoding]::new($false))
    $written.Add([string]$event.key)
}

if ($DryRun) { Write-Host ("dry run: {0} events would be written and acked" -f $events.Count); exit 0 }
if ($written.Count -eq 0) { exit 0 }

$ackBody = @{ keys = @($written) } | ConvertTo-Json -Compress
$ack = Invoke-RestMethod -Method Post -Uri "$base/tock/drain/ack" -Headers $headers -ContentType 'application/json' -Body $ackBody
Write-Host ("wrote {0} events; acked {1}; missing {2}" -f $written.Count, @($ack.acked).Count, @($ack.missing).Count)
if (@($ack.missing).Count -gt 0) { Write-Warning ("relay did not recognise: {0}" -f (@($ack.missing) -join ', ')) }
