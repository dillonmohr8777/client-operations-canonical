param(
  [string]$CredentialTarget = "Codex/TelegramModelGateway/InferenceNet",
  [string]$OutPath = (Join-Path $PSScriptRoot "..\inferencenet-canaries.json")
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if (-not ("Codex.InferenceCanary.NativeMethods" -as [type])) {
  Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
namespace Codex.InferenceCanary {
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

$models = @(
  "deepseek-v4-pro-0813",
  "glm-5.3",
  "glm-5.3-flash",
  "kimi-k3",
  "gpt-5.6-luna"
)

$credentialPtr = [IntPtr]::Zero
$blob = $null
$secret = $null
$results = @()

try {
  $ok = [Codex.InferenceCanary.NativeMethods]::CredRead($CredentialTarget, 1, 0, [ref]$credentialPtr)
  if (-not $ok) { throw "Inference.net credential locator missing." }
  $credential = [Runtime.InteropServices.Marshal]::PtrToStructure(
    $credentialPtr,
    [type][Codex.InferenceCanary.CREDENTIAL]
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

  foreach ($model in $models) {
    $started = Get-Date
    $status = $null
    $errorClass = $null
    $pong = $false
    $preview = $null
    try {
      $body = @{
        model = $model
        messages = @(@{ role = "user"; content = "Reply with the single word PONG and nothing else." })
        max_tokens = 16
      } | ConvertTo-Json -Depth 5
      $response = Invoke-WebRequest -Uri "https://api.inference.net/v1/chat/completions" -Method Post -Headers @{
        Authorization = "Bearer $secret"
      } -ContentType "application/json" -Body $body -TimeoutSec 90
      $status = [int]$response.StatusCode
      $json = $response.Content | ConvertFrom-Json
      $text = [string]$json.choices[0].message.content
      $pong = $text -match '(?i)\bPONG\b'
      $preview = if ($text.Length -gt 80) { $text.Substring(0, 80) } else { $text }
    } catch {
      try { $status = [int]$_.Exception.Response.StatusCode } catch {}
      $errorClass = switch ($status) {
        401 { "auth" }
        402 { "payment-required" }
        403 { "forbidden-or-limit" }
        404 { "model-missing" }
        429 { "rate-limit" }
        default { "request-failed" }
      }
      $preview = $errorClass
    }
    $results += [pscustomobject]@{
      model = $model
      status = $status
      errorClass = $errorClass
      pong = [bool]$pong
      live = [bool]($status -eq 200 -and $pong)
      elapsedMs = [int]((Get-Date) - $started).TotalMilliseconds
      outputPreview = $preview
    }
  }
} finally {
  $secret = $null
  if ($blob) { [Array]::Clear($blob, 0, $blob.Length) }
  if ($credentialPtr -ne [IntPtr]::Zero) {
    [Codex.InferenceCanary.NativeMethods]::CredFree($credentialPtr)
  }
}

$payload = [pscustomobject]@{
  generatedAtUtc = [DateTime]::UtcNow.ToString("o")
  credentialTarget = $CredentialTarget
  liveCount = @($results | Where-Object { $_.live }).Count
  results = $results
}
$payload | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $OutPath -Encoding utf8
$payload | ConvertTo-Json -Depth 6
