Set-StrictMode -Version Latest

if (-not ('MarketingChief.Win32.CredentialApi' -as [type])) {
    Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;

namespace MarketingChief.Win32 {
    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
    public struct Credential {
        public UInt32 Flags;
        public UInt32 Type;
        [MarshalAs(UnmanagedType.LPWStr)] public string TargetName;
        [MarshalAs(UnmanagedType.LPWStr)] public string Comment;
        public System.Runtime.InteropServices.ComTypes.FILETIME LastWritten;
        public UInt32 CredentialBlobSize;
        public IntPtr CredentialBlob;
        public UInt32 Persist;
        public UInt32 AttributeCount;
        public IntPtr Attributes;
        [MarshalAs(UnmanagedType.LPWStr)] public string TargetAlias;
        [MarshalAs(UnmanagedType.LPWStr)] public string UserName;
    }

    public static class CredentialApi {
        [DllImport("advapi32.dll", EntryPoint = "CredWriteW", CharSet = CharSet.Unicode, SetLastError = true)]
        public static extern bool CredWrite(ref Credential credential, UInt32 flags);

        [DllImport("advapi32.dll", EntryPoint = "CredReadW", CharSet = CharSet.Unicode, SetLastError = true)]
        public static extern bool CredRead(string target, UInt32 type, Int32 reservedFlag, out IntPtr credentialPtr);

        [DllImport("advapi32.dll", EntryPoint = "CredDeleteW", CharSet = CharSet.Unicode, SetLastError = true)]
        public static extern bool CredDelete(string target, UInt32 type, UInt32 flags);

        [DllImport("advapi32.dll")]
        public static extern void CredFree(IntPtr credentialPtr);
    }
}
'@
}

function Assert-MarketingChiefCredentialTarget {
    param([Parameter(Mandatory = $true)][string]$Target)
    if ($Target -notmatch '^MarketingChief-[A-Za-z0-9._-]{1,100}$') {
        throw 'Credential target must use the MarketingChief namespace.'
    }
}

function Set-MarketingChiefSitesCredential {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)][string]$Target,
        [Parameter(Mandatory = $true)][string]$Token,
        [string]$UserName = 'marketing-chief-windows'
    )

    Assert-MarketingChiefCredentialTarget -Target $Target
    if ($Token.Length -lt 32 -or $Token.Length -gt 512 -or $Token -notmatch '^[A-Za-z0-9_-]+$') {
        throw 'The machine credential must be a 32 to 512 character base64url token.'
    }
    if ($UserName -notmatch '^[A-Za-z0-9._@-]{1,160}$') { throw 'Credential username is invalid.' }

    $bytes = [Text.Encoding]::UTF8.GetBytes($Token)
    $blob = [Runtime.InteropServices.Marshal]::AllocCoTaskMem($bytes.Length)
    try {
        [Runtime.InteropServices.Marshal]::Copy($bytes, 0, $blob, $bytes.Length)
        $credential = New-Object MarketingChief.Win32.Credential
        $credential.Flags = 0
        $credential.Type = 1
        $credential.TargetName = $Target
        $credential.Comment = 'Marketing Chief private Sites machine bridge'
        $credential.CredentialBlobSize = [uint32]$bytes.Length
        $credential.CredentialBlob = $blob
        $credential.Persist = 2
        $credential.AttributeCount = 0
        $credential.Attributes = [IntPtr]::Zero
        $credential.TargetAlias = $null
        $credential.UserName = $UserName
        if (-not [MarketingChief.Win32.CredentialApi]::CredWrite([ref]$credential, 0)) {
            throw [ComponentModel.Win32Exception]::new([Runtime.InteropServices.Marshal]::GetLastWin32Error())
        }
    }
    finally {
        for ($index = 0; $index -lt $bytes.Length; $index++) {
            [Runtime.InteropServices.Marshal]::WriteByte($blob, $index, 0)
        }
        [Runtime.InteropServices.Marshal]::FreeCoTaskMem($blob)
        [Array]::Clear($bytes, 0, $bytes.Length)
    }
}

function Get-MarketingChiefSitesCredential {
    [CmdletBinding()]
    param([Parameter(Mandatory = $true)][string]$Target)

    Assert-MarketingChiefCredentialTarget -Target $Target
    $pointer = [IntPtr]::Zero
    if (-not [MarketingChief.Win32.CredentialApi]::CredRead($Target, 1, 0, [ref]$pointer)) {
        $errorCode = [Runtime.InteropServices.Marshal]::GetLastWin32Error()
        if ($errorCode -eq 1168) { throw "Marketing Chief credential is not installed for target $Target." }
        throw [ComponentModel.Win32Exception]::new($errorCode)
    }
    try {
        $credential = [Runtime.InteropServices.Marshal]::PtrToStructure(
            $pointer,
            [type][MarketingChief.Win32.Credential]
        )
        if ($credential.CredentialBlobSize -lt 32 -or $credential.CredentialBlobSize -gt 512) {
            throw 'The stored Marketing Chief credential has an invalid size.'
        }
        $bytes = New-Object byte[] $credential.CredentialBlobSize
        [Runtime.InteropServices.Marshal]::Copy(
            $credential.CredentialBlob,
            $bytes,
            0,
            [int]$credential.CredentialBlobSize
        )
        try {
            $token = [Text.Encoding]::UTF8.GetString($bytes)
            if ($token -notmatch '^[A-Za-z0-9_-]{32,512}$') {
                throw 'The stored Marketing Chief credential has an invalid shape.'
            }
            return $token
        }
        finally {
            [Array]::Clear($bytes, 0, $bytes.Length)
        }
    }
    finally {
        [MarketingChief.Win32.CredentialApi]::CredFree($pointer)
    }
}

function Remove-MarketingChiefSitesCredential {
    [CmdletBinding()]
    param([Parameter(Mandatory = $true)][string]$Target)

    Assert-MarketingChiefCredentialTarget -Target $Target
    if (-not [MarketingChief.Win32.CredentialApi]::CredDelete($Target, 1, 0)) {
        $errorCode = [Runtime.InteropServices.Marshal]::GetLastWin32Error()
        if ($errorCode -ne 1168) { throw [ComponentModel.Win32Exception]::new($errorCode) }
    }
}

function New-MarketingChiefSitesToken {
    [CmdletBinding()]
    param()

    $bytes = New-Object byte[] 48
    $rng = [Security.Cryptography.RandomNumberGenerator]::Create()
    try { $rng.GetBytes($bytes) } finally { $rng.Dispose() }
    try {
        return [Convert]::ToBase64String($bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_')
    }
    finally {
        [Array]::Clear($bytes, 0, $bytes.Length)
    }
}
