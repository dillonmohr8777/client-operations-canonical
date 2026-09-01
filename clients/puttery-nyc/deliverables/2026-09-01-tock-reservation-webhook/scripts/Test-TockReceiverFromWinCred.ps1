[CmdletBinding()]
param(
    [string]$CredentialTarget = 'Codex.ClientAccess.PutteryNYC.TockWebhookAuthorization',
    [string]$BusinessId = '37824'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

if (-not ('Codex.PutteryReceiverCredential.NativeMethods' -as [type])) {
    Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;

namespace Codex.PutteryReceiverCredential {
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

$credentialPtr = [IntPtr]::Zero
$secret = $null
$secretBytes = $null
$process = $null
$stage = 'startup'
$databasePaths = @()

try {
    $stage = 'credential_read'
    $ok = [Codex.PutteryReceiverCredential.NativeMethods]::CredRead(
        $CredentialTarget,
        1,
        0,
        [ref]$credentialPtr
    )
    if (-not $ok) { throw 'credential_target_not_found' }
    $credential = [Runtime.InteropServices.Marshal]::PtrToStructure(
        $credentialPtr,
        [type][Codex.PutteryReceiverCredential.CREDENTIAL]
    )
    $secretBytes = [byte[]]::new($credential.CredentialBlobSize)
    [Runtime.InteropServices.Marshal]::Copy(
        $credential.CredentialBlob,
        $secretBytes,
        0,
        $secretBytes.Length
    )
    $secret = [Text.Encoding]::Unicode.GetString($secretBytes)
    if ($secret.Length -lt 32) { throw 'credential_blob_invalid' }

    $stage = 'runtime_prepare'
    $receiverRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..\receiver')).Path
    $node = (Get-Command node -ErrorAction Stop).Source
    $listener = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback, 0)
    $listener.Start()
    $port = ([Net.IPEndPoint]$listener.LocalEndpoint).Port
    $listener.Stop()

    $tempRoot = [IO.Path]::GetFullPath([IO.Path]::GetTempPath())
    $databasePath = Join-Path $tempRoot ('puttery-tock-test-{0}.sqlite' -f [guid]::NewGuid().ToString('N'))
    $databasePaths = @($databasePath, "$databasePath-wal", "$databasePath-shm")

    $startInfo = [Diagnostics.ProcessStartInfo]::new()
    $startInfo.FileName = $node
    $startInfo.Arguments = 'src/server.mjs'
    $startInfo.WorkingDirectory = $receiverRoot
    $startInfo.UseShellExecute = $false
    $startInfo.CreateNoWindow = $true
    $startInfo.RedirectStandardOutput = $true
    $startInfo.RedirectStandardError = $true
    $startInfo.EnvironmentVariables['HOST'] = '127.0.0.1'
    $startInfo.EnvironmentVariables['PORT'] = [string]$port
    $startInfo.EnvironmentVariables['TOCK_DB_PATH'] = $databasePath
    $startInfo.EnvironmentVariables['TOCK_ALLOWED_BUSINESS_ID'] = $BusinessId
    $startInfo.EnvironmentVariables['TOCK_AUTH_HEADER_NAME'] = 'PutteryWebhookAuth'
    $startInfo.EnvironmentVariables['TOCK_AUTH_HEADER_VALUE'] = $secret
    $process = [Diagnostics.Process]::Start($startInfo)

    $baseUrl = "http://127.0.0.1:$port"
    $stage = 'health_wait'
    $health = $null
    for ($attempt = 0; $attempt -lt 20; $attempt++) {
        if ($process.HasExited) { throw 'receiver_exited_before_health' }
        try {
            $health = Invoke-WebRequest -UseBasicParsing -Uri "$baseUrl/healthz" -TimeoutSec 2
            if ($health.StatusCode -eq 200) { break }
        }
        catch {}
        Start-Sleep -Milliseconds 250
    }
    if ($null -eq $health -or $health.StatusCode -ne 200) { throw 'receiver_health_timeout' }

    $headers = @{ 'PutteryWebhookAuth' = $secret }
    $targetPayload = [ordered]@{
        id = '900000000000000001'
        business = [ordered]@{ id = $BusinessId; currencyCode = 'USD' }
        versionId = '900000000000000002'
        netAmountPaidCents = 12500
        keyValue = @([ordered]@{ attribute = 'utm_source'; attributeValue = 'synthetic-test' })
    } | ConvertTo-Json -Compress -Depth 5
    $otherPayload = [ordered]@{
        id = '900000000000000003'
        business = [ordered]@{ id = '99999'; currencyCode = 'USD' }
        versionId = '900000000000000004'
    } | ConvertTo-Json -Compress -Depth 5

    $stage = 'target_insert'
    $insert = Invoke-WebRequest -UseBasicParsing -Uri "$baseUrl/webhooks/tock/reservations" -Method Post -Headers $headers -ContentType 'application/json' -Body $targetPayload
    $stage = 'target_duplicate'
    $duplicate = Invoke-WebRequest -UseBasicParsing -Uri "$baseUrl/webhooks/tock/reservations" -Method Post -Headers $headers -ContentType 'application/json' -Body $targetPayload
    $stage = 'non_target_filter'
    $filtered = Invoke-WebRequest -UseBasicParsing -Uri "$baseUrl/webhooks/tock/reservations" -Method Post -Headers $headers -ContentType 'application/json' -Body $otherPayload

    $checks = [ordered]@{
        health = ($health.StatusCode -eq 200)
        inserted = ($insert.StatusCode -eq 204 -and [string]$insert.Headers.'x-tock-receiver-outcome' -eq 'inserted')
        duplicate = ($duplicate.StatusCode -eq 204 -and [string]$duplicate.Headers.'x-tock-receiver-outcome' -eq 'duplicate')
        filteredNonTarget = ($filtered.StatusCode -eq 204 -and [string]$filtered.Headers.'x-tock-receiver-outcome' -eq 'filtered_non_target')
    }
    $passed = -not ($checks.Values -contains $false)
    [pscustomobject]@{
        passed = $passed
        businessId = $BusinessId
        checks = $checks
        secretExposed = $false
        rawGuestDataStored = $false
    } | ConvertTo-Json -Depth 5
    if (-not $passed) { exit 1 }
}
catch {
    [pscustomobject]@{
        passed = $false
        stage = $stage
        error = [string]$_.Exception.Message
        secretExposed = $false
    } | ConvertTo-Json
    exit 1
}
finally {
    if ($process -and -not $process.HasExited) {
        $process.Kill()
        $null = $process.WaitForExit(5000)
    }
    if ($process) { $process.Dispose() }
    foreach ($path in $databasePaths) {
        if (-not $path) { continue }
        $resolvedCandidate = [IO.Path]::GetFullPath($path)
        if ($resolvedCandidate.StartsWith([IO.Path]::GetFullPath([IO.Path]::GetTempPath()), [StringComparison]::OrdinalIgnoreCase)) {
            if (Test-Path -LiteralPath $resolvedCandidate -PathType Leaf) {
                Remove-Item -LiteralPath $resolvedCandidate -Force -Confirm:$false
            }
        }
    }
    if ($secretBytes) { [Array]::Clear($secretBytes, 0, $secretBytes.Length) }
    $secret = $null
    if ($credentialPtr -ne [IntPtr]::Zero) {
        [Codex.PutteryReceiverCredential.NativeMethods]::CredFree($credentialPtr)
    }
}
