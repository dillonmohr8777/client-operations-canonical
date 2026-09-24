[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$credentialTarget = 'Codex.ClientAccess.BigOrange.WordPress'
$loginUrl = 'https://bigorange.marketing/wp-login.php'
$adminUrl = 'https://bigorange.marketing/wp-admin/'

if (-not ('BigOrange.Win32.CredentialApi' -as [type])) {
    Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;

namespace BigOrange.Win32 {
    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
    public struct Credential {
        public UInt32 Flags;
        public UInt32 Type;
        public string TargetName;
        public string Comment;
        public System.Runtime.InteropServices.ComTypes.FILETIME LastWritten;
        public UInt32 CredentialBlobSize;
        public IntPtr CredentialBlob;
        public UInt32 Persist;
        public UInt32 AttributeCount;
        public IntPtr Attributes;
        public string TargetAlias;
        public string UserName;
    }

    public static class CredentialApi {
        [DllImport("advapi32.dll", EntryPoint = "CredReadW", CharSet = CharSet.Unicode, SetLastError = true)]
        public static extern bool CredRead(string target, UInt32 type, Int32 reservedFlag, out IntPtr credentialPtr);

        [DllImport("advapi32.dll")]
        public static extern void CredFree(IntPtr credentialPtr);
    }
}
'@
}

$pointer = [IntPtr]::Zero
$password = $null
$bytes = $null

try {
    if (-not [BigOrange.Win32.CredentialApi]::CredRead($credentialTarget, 1, 0, [ref]$pointer)) {
        throw [ComponentModel.Win32Exception]::new([Runtime.InteropServices.Marshal]::GetLastWin32Error())
    }

    $stored = [Runtime.InteropServices.Marshal]::PtrToStructure($pointer, [type][BigOrange.Win32.Credential])
    if ([string]::IsNullOrWhiteSpace($stored.UserName) -or $stored.CredentialBlobSize -eq 0) {
        throw 'The stored WordPress credential is incomplete.'
    }

    $bytes = New-Object byte[] $stored.CredentialBlobSize
    [Runtime.InteropServices.Marshal]::Copy($stored.CredentialBlob, $bytes, 0, [int]$stored.CredentialBlobSize)
    $zeroByteCount = @($bytes | Where-Object { $_ -eq 0 }).Count
    if ($zeroByteCount -ge [Math]::Floor($bytes.Length / 4)) {
        $password = [Text.Encoding]::Unicode.GetString($bytes).TrimEnd([char]0)
    }
    else {
        $password = [Text.Encoding]::UTF8.GetString($bytes).TrimEnd([char]0)
    }

    $session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
    $session.UserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/139 Safari/537.36'
    Invoke-WebRequest -Uri $loginUrl -WebSession $session -MaximumRedirection 5 | Out-Null

    $form = @{
        log = $stored.UserName
        pwd = $password
        'wp-submit' = 'Log In'
        redirect_to = $adminUrl
        testcookie = '1'
    }

    $headers = @{
        Referer = $loginUrl
        Origin = 'https://bigorange.marketing'
        Accept = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
        'Accept-Language' = 'en-US,en;q=0.9'
        'Upgrade-Insecure-Requests' = '1'
    }
    $response = Invoke-WebRequest -Uri $loginUrl -Method Post -Body $form -ContentType 'application/x-www-form-urlencoded' -Headers $headers -WebSession $session -MaximumRedirection 8
    $success = $response.BaseResponse.RequestMessage.RequestUri.AbsoluteUri -like "$adminUrl*" -and $response.Content -match 'wp-admin-bar|wpwrap|Dashboard'

    [ordered]@{
        credentialFound = $true
        loginSucceeded = [bool]$success
        finalHost = $response.BaseResponse.RequestMessage.RequestUri.Host
        reachedAdmin = $response.BaseResponse.RequestMessage.RequestUri.AbsolutePath -like '/wp-admin/*'
        dashboardDetected = [bool]($response.Content -match 'wp-admin-bar|wpwrap|Dashboard')
    } | ConvertTo-Json

    if (-not $success) { exit 2 }
}
finally {
    if ($bytes) { [Array]::Clear($bytes, 0, $bytes.Length) }
    $password = $null
    if ($pointer -ne [IntPtr]::Zero) { [BigOrange.Win32.CredentialApi]::CredFree($pointer) }
}
