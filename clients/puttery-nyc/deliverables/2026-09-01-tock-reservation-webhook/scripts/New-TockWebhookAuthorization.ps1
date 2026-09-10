[CmdletBinding()]
param(
    [string]$CredentialTarget = 'Codex.ClientAccess.PutteryNYC.TockWebhookAuthorization',
    [switch]$Force
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

if (-not ('Codex.PutteryWebhookCredential.NativeMethods' -as [type])) {
    Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;

namespace Codex.PutteryWebhookCredential {
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

    [DllImport("Advapi32.dll", EntryPoint = "CredWriteW", CharSet = CharSet.Unicode, SetLastError = true)]
    public static extern bool CredWrite(ref CREDENTIAL credential, UInt32 flags);

    [DllImport("Advapi32.dll", SetLastError = true)]
    public static extern void CredFree(IntPtr buffer);
  }
}
'@
}

$existingPtr = [IntPtr]::Zero
$targetPtr = [IntPtr]::Zero
$userPtr = [IntPtr]::Zero
$commentPtr = [IntPtr]::Zero
$blobPtr = [IntPtr]::Zero
$secret = $null
$secretBytes = $null

try {
    $exists = [Codex.PutteryWebhookCredential.NativeMethods]::CredRead(
        $CredentialTarget,
        1,
        0,
        [ref]$existingPtr
    )
    if ($exists -and -not $Force) { throw 'credential_target_already_exists' }

    $randomBytes = [byte[]]::new(32)
    [Security.Cryptography.RandomNumberGenerator]::Fill($randomBytes)
    $secret = [Convert]::ToHexString($randomBytes).ToLowerInvariant()
    [Array]::Clear($randomBytes, 0, $randomBytes.Length)

    $secretBytes = [Text.Encoding]::Unicode.GetBytes($secret)
    $targetPtr = [Runtime.InteropServices.Marshal]::StringToCoTaskMemUni($CredentialTarget)
    $userPtr = [Runtime.InteropServices.Marshal]::StringToCoTaskMemUni('Puttery NYC Reservation Webhook')
    $commentPtr = [Runtime.InteropServices.Marshal]::StringToCoTaskMemUni(
        'Static inbound webhook authorization value; exchange only through an approved secure route.'
    )
    $blobPtr = [Runtime.InteropServices.Marshal]::AllocCoTaskMem($secretBytes.Length)
    [Runtime.InteropServices.Marshal]::Copy($secretBytes, 0, $blobPtr, $secretBytes.Length)

    $credential = New-Object Codex.PutteryWebhookCredential.CREDENTIAL
    $credential.Type = 1
    $credential.TargetName = $targetPtr
    $credential.UserName = $userPtr
    $credential.Comment = $commentPtr
    $credential.CredentialBlobSize = [uint32]$secretBytes.Length
    $credential.CredentialBlob = $blobPtr
    $credential.Persist = 2

    $written = [Codex.PutteryWebhookCredential.NativeMethods]::CredWrite([ref]$credential, 0)
    if (-not $written) { throw 'windows_credential_write_failed' }

    [pscustomobject]@{
        stored = $true
        target = $CredentialTarget
        headerName = 'PutteryWebhookAuth'
        strengthBits = 256
    } | ConvertTo-Json
}
finally {
    if ($existingPtr -ne [IntPtr]::Zero) {
        [Codex.PutteryWebhookCredential.NativeMethods]::CredFree($existingPtr)
    }
    if ($blobPtr -ne [IntPtr]::Zero) {
        $secretByteCount = 0
        if ($null -ne $secretBytes) { $secretByteCount = $secretBytes.Length }
        for ($index = 0; $index -lt $secretByteCount; $index++) {
            [Runtime.InteropServices.Marshal]::WriteByte($blobPtr, $index, 0)
        }
        [Runtime.InteropServices.Marshal]::FreeCoTaskMem($blobPtr)
    }
    foreach ($pointer in @($targetPtr, $userPtr, $commentPtr)) {
        if ($pointer -ne [IntPtr]::Zero) {
            [Runtime.InteropServices.Marshal]::FreeCoTaskMem($pointer)
        }
    }
    if ($secretBytes) { [Array]::Clear($secretBytes, 0, $secretBytes.Length) }
    $secret = $null
}
