<#
.SYNOPSIS
  Pull pending Tock events from the public relay, hand each to the local receiver, then acknowledge.

.DESCRIPTION
  Runs on the Windows machine next to the tested local receiver (../../receiver/src/server.mjs).
  For every pending event the relay stored, the original Tock body is POSTed unchanged to
  <ReceiverBase>/webhooks/tock/reservations with the PutteryWebhookAuth header, so the receiver's
  own insertion, version ordering, duplicate suppression, and venue filtering apply.

  Acks go back to the relay only for events the receiver answered 2xx. Explicit permanent
  payload errors (400, 413, 415, or 422) are written to the dead-letter folder and acked so
  they cannot block the queue. Authentication, routing, rate-limit, server, and connection
  failures stop the batch unacked; the next run retries from the same event.

  Secrets: the relay drain token and the receiver header value are read from Windows Credential
  Manager (the two targets below), or for local testing from the TOCK_RELAY_DRAIN_TOKEN and
  TOCK_RELAY_RECEIVER_AUTH environment variables. They are never printed or written to disk.
  Windows PowerShell 5.1 compatible.

.EXAMPLE
  .\Drain-TockRelay.ps1 -RelayBase https://<site>.netlify.app -DryRun
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$RelayBase,
    [string]$ReceiverBase = 'http://127.0.0.1:8787',
    [string]$DeadLetterDir = (Join-Path $env:LOCALAPPDATA 'Codex\ClientAccess\PutteryNYC\tock-dead-letter'),
    [string]$DrainTokenTarget = 'Codex.ClientAccess.PutteryNYC.TockRelayDrainToken',
    [string]$ReceiverAuthTarget = 'Codex.ClientAccess.PutteryNYC.TockWebhookAuthorization',
    [ValidateRange(1, 500)][int]$Limit = 100,
    [switch]$DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12

if (-not ('Codex.PutteryDrainCredential.NativeMethods' -as [type])) {
    Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;

namespace Codex.PutteryDrainCredential {
  [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
  public struct CREDENTIAL {
    public UInt32 Flags;
    public UInt32 Type;
    public IntPtr TargetName;
    public IntPtr Comment;
    public System.Runtime.InteropServices.ComTypes.FILETIME LastWritten;
    public UInt32 CredentialBlobSize;
    public IntPtr CredentialBlob;
    public UInt32 Persist;
    public UInt32 AttributeCount;
    public IntPtr Attributes;
    public IntPtr TargetAlias;
    public IntPtr UserName;
  }

  public static class NativeMethods {
    [DllImport("Advapi32.dll", EntryPoint = "CredReadW", CharSet = CharSet.Unicode, SetLastError = true)]
    public static extern bool CredRead(string target, UInt32 type, UInt32 flags, out IntPtr credentialPtr);

    [DllImport("Advapi32.dll", SetLastError = true)]
    public static extern void CredFree(IntPtr buffer);
  }
}
'@
}

function Read-ProtectedValue {
    param([string]$EnvName, [string]$Target)
    $fromEnv = [Environment]::GetEnvironmentVariable($EnvName)
    if (-not [string]::IsNullOrWhiteSpace($fromEnv)) { return $fromEnv }
    $ptr = [IntPtr]::Zero
    try {
        if (-not [Codex.PutteryDrainCredential.NativeMethods]::CredRead($Target, 1, 0, [ref]$ptr)) { throw "credential_target_not_found:$Target" }
        $cred = [Runtime.InteropServices.Marshal]::PtrToStructure($ptr, [type][Codex.PutteryDrainCredential.CREDENTIAL])
        if ($cred.CredentialBlobSize -lt 32 -or $cred.CredentialBlob -eq [IntPtr]::Zero) { throw "credential_blob_invalid:$Target" }
        $bytes = [byte[]]::new($cred.CredentialBlobSize)
        [Runtime.InteropServices.Marshal]::Copy($cred.CredentialBlob, $bytes, 0, $bytes.Length)
        $value = [Text.Encoding]::Unicode.GetString($bytes)
        [Array]::Clear($bytes, 0, $bytes.Length)
        return $value
    }
    finally {
        if ($ptr -ne [IntPtr]::Zero) { [Codex.PutteryDrainCredential.NativeMethods]::CredFree($ptr) }
    }
}

function Invoke-Receiver {
    param([string]$Uri, [string]$Body, [hashtable]$Headers)
    try {
        $r = Invoke-WebRequest -UseBasicParsing -Uri $Uri -Method Post -Headers $Headers -ContentType 'application/json; charset=utf-8' -Body ([Text.Encoding]::UTF8.GetBytes($Body)) -TimeoutSec 30
        return @{ status = [int]$r.StatusCode; outcome = [string]$r.Headers['x-tock-receiver-outcome'] }
    }
    catch [Net.WebException] {
        $resp = $_.Exception.Response
        if ($null -eq $resp) { return @{ status = 0; outcome = [string]$_.Exception.Status } }
        return @{ status = [int]$resp.StatusCode; outcome = [string]$resp.Headers['x-tock-receiver-outcome'] }
    }
}

$drainToken = $null
$receiverAuth = $null
try {
    $drainToken = Read-ProtectedValue -EnvName 'TOCK_RELAY_DRAIN_TOKEN' -Target $DrainTokenTarget
    if (-not $DryRun) { $receiverAuth = Read-ProtectedValue -EnvName 'TOCK_RELAY_RECEIVER_AUTH' -Target $ReceiverAuthTarget }

    $relayHeaders = @{ Authorization = "Bearer $drainToken" }
    $base = $RelayBase.TrimEnd('/')
    $receiverUri = $ReceiverBase.TrimEnd('/') + '/webhooks/tock/reservations'

    $health = Invoke-RestMethod -Method Get -Uri "$base/tock/health" -Headers $relayHeaders
    $batch = Invoke-RestMethod -Method Get -Uri "$base/tock/drain?limit=$Limit" -Headers $relayHeaders
    $events = @($batch.events)

    $result = [ordered]@{
        relayPending = [int]$health.pending
        relayAcked = [int]$health.acked
        venue = [string]$health.venue
        fetched = $events.Count
        delivered = 0
        deadLettered = 0
        acked = 0
        missing = 0
        stopped = $null
        dryRun = [bool]$DryRun
    }

    if ($DryRun) {
        foreach ($e in $events) { Write-Host ("would deliver event received {0} key {1}" -f $e.receivedAt, $e.key) }
    }
    else {
        $receiverHeaders = @{ PutteryWebhookAuth = $receiverAuth }
        $permanentPayloadStatuses = @(400, 413, 415, 422)
        $toAck = New-Object System.Collections.Generic.List[string]
        foreach ($e in $events) {
            $r = Invoke-Receiver -Uri $receiverUri -Body ([string]$e.body) -Headers $receiverHeaders
            if ($r.status -ge 200 -and $r.status -lt 300) {
                $toAck.Add([string]$e.key); $result.delivered++
                continue
            }
            if ($permanentPayloadStatuses -contains $r.status) {
                if (-not (Test-Path -LiteralPath $DeadLetterDir)) { New-Item -ItemType Directory -Path $DeadLetterDir -Force | Out-Null }
                $path = Join-Path $DeadLetterDir ((([string]$e.key) -replace '/', '_') + '.json')
                [IO.File]::WriteAllText($path, ($e | ConvertTo-Json -Depth 20), [Text.UTF8Encoding]::new($false))
                Write-Warning ("receiver rejected event {0} with HTTP {1} ({2}); dead-lettered to {3}" -f $e.key, $r.status, $r.outcome, $path)
                $toAck.Add([string]$e.key); $result.deadLettered++
                continue
            }
            $result.stopped = ("receiver returned HTTP {0} ({1}) for event {2}; batch stopped before ack, next run retries" -f $r.status, $r.outcome, $e.key)
            Write-Warning $result.stopped
            break
        }
        if ($toAck.Count -gt 0) {
            $ackBody = @{ keys = @($toAck) } | ConvertTo-Json -Compress
            $ack = Invoke-RestMethod -Method Post -Uri "$base/tock/drain/ack" -Headers $relayHeaders -ContentType 'application/json' -Body $ackBody
            $result.acked = @($ack.acked).Count
            $result.missing = @($ack.missing).Count
            if ($result.missing -gt 0) { Write-Warning ("relay did not recognise: {0}" -f (@($ack.missing) -join ', ')) }
        }
    }

    [pscustomobject]$result | ConvertTo-Json -Compress
    if ($result.stopped) { exit 1 }
}
finally {
    $drainToken = $null
    $receiverAuth = $null
}
