<#
.SYNOPSIS
  Redacted HTTP 503 triage for the Tock Data Exports endpoint (PRODUCTION_PLAN.md section 1).

.DESCRIPTION
  Windows PowerShell 5.1 compatible companion to ../../scripts/Invoke-TockDataExportProbe.ps1,
  which needs PowerShell 7 (-SkipHttpErrorCheck). Same endpoint, same scope header, same
  User-Agent, same Windows Credential Manager read. Three modes:

    none          no credential header at all           (expect 401/403: proves the auth layer answers)
    wrong         a freshly generated random value       (expect 401/403: proves auth runs before the 503)
    credentialed  the stored role credential             (requires -AllowEmailedCredential, as the original)

  Output is one JSON object: status, elapsed time, Retry-After, request-id style headers, body byte
  count, the body's top-level JSON keys, and which of a fixed vocabulary of words the body mentions.
  The body itself, any signed URL, and the credential are never printed or written.
#>
[CmdletBinding()]
param(
    [ValidateSet('credentialed', 'wrong', 'none')][string]$Mode = 'credentialed',
    [string]$CredentialTarget = 'Codex.ClientAccess.PutteryNYC.TockRoleAccount',
    [string]$BusinessId = '37824',
    [string]$BusinessGroupId = '28086',
    [switch]$AllowEmailedCredential
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12

if ($Mode -eq 'credentialed' -and -not $AllowEmailedCredential) {
    throw 'The current credential arrived through ordinary email. Re-run only after rotation, or pass -AllowEmailedCredential for an explicitly authorized read-only probe.'
}

if (-not ('Codex.PutteryTriageCredential.NativeMethods' -as [type])) {
    Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;

namespace Codex.PutteryTriageCredential {
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
$endpoint = 'https://api.exploretock.com/api/data/export/urls'

try {
    $headers = @{
        'X-Tock-Scope' = ([ordered]@{ businessId = $BusinessId; businessGroupId = $BusinessGroupId } | ConvertTo-Json -Compress)
        'User-Agent'   = 'Momentum360-PutteryNYC-Attribution/0.1'
    }
    switch ($Mode) {
        'credentialed' {
            $ok = [Codex.PutteryTriageCredential.NativeMethods]::CredRead($CredentialTarget, 1, 0, [ref]$credentialPtr)
            if (-not $ok) { throw 'credential_target_not_found' }
            $credential = [Runtime.InteropServices.Marshal]::PtrToStructure($credentialPtr, [type][Codex.PutteryTriageCredential.CREDENTIAL])
            if ($credential.CredentialBlobSize -lt 64 -or $credential.CredentialBlob -eq [IntPtr]::Zero) { throw 'credential_blob_invalid' }
            $secretBytes = [byte[]]::new($credential.CredentialBlobSize)
            [Runtime.InteropServices.Marshal]::Copy($credential.CredentialBlob, $secretBytes, 0, $secretBytes.Length)
            $secret = [Text.Encoding]::Unicode.GetString($secretBytes)
            $headers['X-Tock-Authorization'] = $secret
        }
        'wrong' {
            $random = [byte[]]::new(32)
            [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($random)
            $headers['X-Tock-Authorization'] = -join ($random | ForEach-Object { $_.ToString('x2') })
        }
    }

    $status = 0
    $responseHeaders = $null
    $body = ''
    $errorCategory = $null
    $stopwatch = [Diagnostics.Stopwatch]::StartNew()
    try {
        $r = Invoke-WebRequest -UseBasicParsing -Uri $endpoint -Method Get -Headers $headers -TimeoutSec 30
        $status = [int]$r.StatusCode
        $responseHeaders = $r.Headers
        $body = [string]$r.Content
    }
    catch [Net.WebException] {
        $resp = $_.Exception.Response
        if ($null -eq $resp) {
            $errorCategory = [string]$_.Exception.Status
        }
        else {
            $status = [int]$resp.StatusCode
            $responseHeaders = $resp.Headers
            $reader = New-Object IO.StreamReader($resp.GetResponseStream())
            $body = $reader.ReadToEnd()
            $reader.Dispose()
        }
    }
    $stopwatch.Stop()

    function Get-ResponseHeader([string]$Name) {
        if ($null -eq $responseHeaders) { return $null }
        $value = $responseHeaders[$Name]
        if ($null -eq $value) { return $null }
        return [string]$value
    }

    $jsonKeys = @()
    $parsed = $null
    if ($body -and $body.TrimStart().StartsWith('{')) {
        try { $parsed = $body | ConvertFrom-Json; $jsonKeys = @($parsed.PSObject.Properties.Name) } catch {}
    }
    $reservationDataUrlCount = 0
    $guestDataUrlCount = 0
    if ($status -eq 200 -and $null -ne $parsed -and $null -ne $parsed.PSObject.Properties['result']) {
        $reservationDataUrlCount = @($parsed.result.reservationDataUrls).Count
        $guestDataUrlCount = @($parsed.result.guestDataUrls).Count
    }
    $vocabulary = @('unavailable', 'maintenance', 'provision', 'not enabled', 'unauthorized', 'forbidden', 'invalid', 'expired', 'rate', 'try again',
        'just a moment', 'challenge', 'cf-chl', 'cloudflare', 'ray id', 'origin', 'host error', 'timed out', 'gateway')
    $mentions = @($vocabulary | Where-Object { $body -and $body.ToLowerInvariant().Contains($_) })

    [pscustomobject][ordered]@{
        checkedAt               = (Get-Date).ToUniversalTime().ToString('o')
        mode                    = $Mode
        endpoint                = $endpoint
        businessId              = $BusinessId
        businessGroupId         = $BusinessGroupId
        httpStatus              = $status
        elapsedMs               = [int]$stopwatch.ElapsedMilliseconds
        errorCategory           = $errorCategory
        retryAfter              = Get-ResponseHeader 'Retry-After'
        server                  = Get-ResponseHeader 'Server'
        date                    = Get-ResponseHeader 'Date'
        contentType             = Get-ResponseHeader 'Content-Type'
        requestIds              = [ordered]@{
            'x-request-id'     = Get-ResponseHeader 'x-request-id'
            'x-amzn-requestid' = Get-ResponseHeader 'x-amzn-requestid'
            'x-amz-cf-id'      = Get-ResponseHeader 'x-amz-cf-id'
            'cf-ray'           = Get-ResponseHeader 'cf-ray'
            'via'              = Get-ResponseHeader 'via'
        }
        bodyBytes               = [Text.Encoding]::UTF8.GetByteCount($body)
        bodyJsonKeys            = $jsonKeys
        bodyMentions            = $mentions
        reservationDataUrlCount = $reservationDataUrlCount
        guestDataUrlCount       = $guestDataUrlCount
        credentialExposed       = $false
        signedUrlsExposed       = $false
        bodyPrinted             = $false
    } | ConvertTo-Json -Depth 4

    if ($status -ne 200) { exit 1 }
}
finally {
    if ($secretBytes) { [Array]::Clear($secretBytes, 0, $secretBytes.Length) }
    $secret = $null
    if ($credentialPtr -ne [IntPtr]::Zero) { [Codex.PutteryTriageCredential.NativeMethods]::CredFree($credentialPtr) }
}
