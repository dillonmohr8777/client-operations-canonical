param(
  [string]$CredentialTarget = "Codex/TelegramModelGateway/InferenceNet",
  [string]$OutPath = (Join-Path $PSScriptRoot "..\inferencenet-catalog-frontier.json")
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if (-not ("Codex.InferenceCatalog.NativeMethods" -as [type])) {
  Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
namespace Codex.InferenceCatalog {
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

$want = @(
  "gpt-6-astra",
  "claude-fable-5.1",
  "claude-opus-5",
  "muse-spark-1.3",
  "gpt-5.6-sol",
  "grok-4.6",
  "gemini-3.8-flash"
)

$credentialPtr = [IntPtr]::Zero
$blob = $null
$secret = $null
$payload = $null
try {
  $ok = [Codex.InferenceCatalog.NativeMethods]::CredRead($CredentialTarget, 1, 0, [ref]$credentialPtr)
  if (-not $ok) { throw "Inference.net credential locator missing." }
  $credential = [Runtime.InteropServices.Marshal]::PtrToStructure(
    $credentialPtr,
    [type][Codex.InferenceCatalog.CREDENTIAL]
  )
  $blob = New-Object byte[] $credential.CredentialBlobSize
  [Runtime.InteropServices.Marshal]::Copy($credential.CredentialBlob, $blob, 0, [int]$credential.CredentialBlobSize)
  $oddByteSlots = [Math]::Floor($blob.Length / 2)
  $oddZeroBytes = 0
  for ($index = 1; $index -lt $blob.Length; $index += 2) {
    if ($blob[$index] -eq 0) { $oddZeroBytes++ }
  }
  $looksUtf16 = $oddByteSlots -gt 0 -and ($oddZeroBytes / $oddByteSlots) -ge 0.75
  $secret = if ($looksUtf16) {
    [Text.Encoding]::Unicode.GetString($blob).TrimEnd([char]0)
  } else {
    [Text.Encoding]::UTF8.GetString($blob).TrimEnd([char]0)
  }
  if ($secret.Length -lt 20) { throw "Inference.net credential is malformed." }

  $response = Invoke-WebRequest -Uri "https://api.inference.net/v1/models" -Headers @{
    Authorization = "Bearer $secret"
  } -TimeoutSec 45
  $json = $response.Content | ConvertFrom-Json
  $ids = @($json.data | ForEach-Object { [string]$_.id })
  $matches = foreach ($needle in $want) {
    [pscustomobject]@{
      needle = $needle
      hits = @($ids | Where-Object { $_ -like "*$needle*" })
    }
  }
  $payload = [pscustomobject]@{
    generatedAtUtc = [DateTime]::UtcNow.ToString("o")
    httpStatus = [int]$response.StatusCode
    totalModels = $ids.Count
    frontier = $matches
  }
} catch {
  $status = $null
  try { $status = [int]$_.Exception.Response.StatusCode } catch {}
  $exType = $_.Exception.GetType().FullName
  $payload = [pscustomobject]@{
    generatedAtUtc = [DateTime]::UtcNow.ToString("o")
    httpStatus = $status
    totalModels = $null
    frontier = $null
    errorClass = if ($status) { "http-$status" } else { "request-failed" }
    exceptionType = $exType
  }
} finally {
  $secret = $null
  if ($blob) { [Array]::Clear($blob, 0, $blob.Length) }
  if ($credentialPtr -ne [IntPtr]::Zero) {
    [Codex.InferenceCatalog.NativeMethods]::CredFree($credentialPtr)
  }
}

$payload | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $OutPath -Encoding utf8
$payload | ConvertTo-Json -Depth 6
