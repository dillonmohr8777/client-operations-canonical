[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][ValidateRange(49152, 65535)][int]$Port,
    [Parameter(Mandatory = $true)][ValidatePattern('^[A-Za-z0-9]{24,80}$')][string]$Nonce
)

$ErrorActionPreference = 'Stop'
$credentialTarget = 'Codex.ClientAccess.BigOrange.WordPress'

if (-not ('BigOrange.Bridge.CredentialApi' -as [type])) {
    Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;

namespace BigOrange.Bridge {
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

$listener = [Net.HttpListener]::new()
$listener.Prefixes.Add("http://127.0.0.1:$Port/")
$pointer = [IntPtr]::Zero
$bytes = $null
$password = $null

try {
    $listener.Start()
    $pending = $listener.GetContextAsync()
    if (-not $pending.Wait([TimeSpan]::FromSeconds(60))) { return }

    $context = $pending.Result
    $response = $context.Response
    $response.Headers['Cache-Control'] = 'no-store'
    $response.Headers['Pragma'] = 'no-cache'

    if ($context.Request.RemoteEndPoint.Address.ToString() -ne '127.0.0.1' -or $context.Request.QueryString['nonce'] -cne $Nonce) {
        $response.StatusCode = 403
        $response.Close()
        return
    }

    if (-not [BigOrange.Bridge.CredentialApi]::CredRead($credentialTarget, 1, 0, [ref]$pointer)) {
        $response.StatusCode = 404
        $response.Close()
        return
    }

    $stored = [Runtime.InteropServices.Marshal]::PtrToStructure($pointer, [type][BigOrange.Bridge.Credential])
    $bytes = New-Object byte[] $stored.CredentialBlobSize
    [Runtime.InteropServices.Marshal]::Copy($stored.CredentialBlob, $bytes, 0, [int]$stored.CredentialBlobSize)
    $zeroByteCount = @($bytes | Where-Object { $_ -eq 0 }).Count
    if ($zeroByteCount -ge [Math]::Floor($bytes.Length / 4)) {
        $password = [Text.Encoding]::Unicode.GetString($bytes).TrimEnd([char]0)
    }
    else {
        $password = [Text.Encoding]::UTF8.GetString($bytes).TrimEnd([char]0)
    }

    $payload = @{ username = $stored.UserName; password = $password } | ConvertTo-Json -Compress
    $payloadBytes = [Text.Encoding]::UTF8.GetBytes($payload)
    try {
        $response.StatusCode = 200
        $response.ContentType = 'application/json'
        $response.ContentLength64 = $payloadBytes.Length
        $response.OutputStream.Write($payloadBytes, 0, $payloadBytes.Length)
        $response.OutputStream.Flush()
        $response.Close()
    }
    finally {
        [Array]::Clear($payloadBytes, 0, $payloadBytes.Length)
        $payload = $null
    }
}
finally {
    if ($bytes) { [Array]::Clear($bytes, 0, $bytes.Length) }
    $password = $null
    if ($pointer -ne [IntPtr]::Zero) { [BigOrange.Bridge.CredentialApi]::CredFree($pointer) }
    if ($listener.IsListening) { $listener.Stop() }
    $listener.Close()
}
