[CmdletBinding()]
param(
    [string]$CredentialTarget = 'Codex.ClientAccess.PutteryNYC.TockRoleAccount',
    [string]$BusinessId = '37824',
    [string]$BusinessGroupId = '28086',
    [switch]$AllowEmailedCredential
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

if (-not $AllowEmailedCredential) {
    throw 'The current credential arrived through ordinary email. Re-run only after rotation, or pass -AllowEmailedCredential for an explicitly authorized one-time read-only probe.'
}

if (-not ('Codex.PutteryProbeCredential.NativeMethods' -as [type])) {
    Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;

namespace Codex.PutteryProbeCredential {
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

try {
    $ok = [Codex.PutteryProbeCredential.NativeMethods]::CredRead(
        $CredentialTarget,
        1,
        0,
        [ref]$credentialPtr
    )
    if (-not $ok) { throw 'credential_target_not_found' }
    $credential = [Runtime.InteropServices.Marshal]::PtrToStructure(
        $credentialPtr,
        [type][Codex.PutteryProbeCredential.CREDENTIAL]
    )
    if ($credential.CredentialBlobSize -lt 64 -or $credential.CredentialBlob -eq [IntPtr]::Zero) {
        throw 'credential_blob_invalid'
    }
    $secretBytes = [byte[]]::new($credential.CredentialBlobSize)
    [Runtime.InteropServices.Marshal]::Copy(
        $credential.CredentialBlob,
        $secretBytes,
        0,
        $secretBytes.Length
    )
    $secret = [Text.Encoding]::Unicode.GetString($secretBytes)

    $endpoint = 'https://api.exploretock.com/api/data/export/urls'
    $scope = [ordered]@{
        businessId = $BusinessId
        businessGroupId = $BusinessGroupId
    } | ConvertTo-Json -Compress
    $response = Invoke-WebRequest -Uri $endpoint -Method Get -Headers @{
        'X-Tock-Authorization' = $secret
        'X-Tock-Scope' = $scope
        'User-Agent' = 'Momentum360-PutteryNYC-Attribution/0.1'
    } -TimeoutSec 30 -SkipHttpErrorCheck

    $reservationDataUrlCount = 0
    $guestDataUrlCount = 0
    if ($response.StatusCode -eq 200) {
        $result = $response.Content | ConvertFrom-Json
        $reservationDataUrlCount = @($result.result.reservationDataUrls).Count
        $guestDataUrlCount = @($result.result.guestDataUrls).Count
    }
    [pscustomobject]@{
        checkedAt = (Get-Date).ToUniversalTime().ToString('o')
        endpoint = $endpoint
        businessId = $BusinessId
        businessGroupId = $BusinessGroupId
        httpStatus = [int]$response.StatusCode
        reservationDataUrlCount = $reservationDataUrlCount
        guestDataUrlCount = $guestDataUrlCount
        credentialExposed = $false
        signedUrlsExposed = $false
    } | ConvertTo-Json

    if ($response.StatusCode -ne 200) { exit 1 }
}
finally {
    if ($secretBytes) { [Array]::Clear($secretBytes, 0, $secretBytes.Length) }
    $secret = $null
    if ($credentialPtr -ne [IntPtr]::Zero) {
        [Codex.PutteryProbeCredential.NativeMethods]::CredFree($credentialPtr)
    }
}
