param(
  [string]$CredentialTarget = "Codex.Dillon.Vercel.dillon-ai-model-gateway.MODEL_GATEWAY_ACCESS_TOKEN",
  [string]$BaseUrl = "https://dillon-ai-model-gateway.vercel.app",
  [string]$OutPath = (Join-Path $PSScriptRoot "..\dillon-model-gateway-canaries.json")
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if (-not ("Codex.GatewayCanary.NativeMethods" -as [type])) {
  Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
namespace Codex.GatewayCanary {
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
  "openai/gpt-6-astra",
  "anthropic/claude-fable-5.1",
  "anthropic/claude-opus-5",
  "meta/muse-spark-1.3",
  "openai/gpt-5.6-sol",
  "x-ai/grok-4.6",
  "google/gemini-3.8-flash"
)

$credentialPtr = [IntPtr]::Zero
$blob = $null
$secret = $null
$catalog = $null
$results = @()
try {
  $ok = [Codex.GatewayCanary.NativeMethods]::CredRead($CredentialTarget, 1, 0, [ref]$credentialPtr)
  if (-not $ok) { throw "Model gateway credential locator missing (Win32 $([Runtime.InteropServices.Marshal]::GetLastWin32Error()))." }
  $credential = [Runtime.InteropServices.Marshal]::PtrToStructure(
    $credentialPtr,
    [type][Codex.GatewayCanary.CREDENTIAL]
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
  if ($secret.Length -lt 12) { throw "Model gateway credential is malformed." }

  try {
    $catalogResponse = Invoke-WebRequest -Uri ($BaseUrl.TrimEnd("/") + "/api/catalog") -Headers @{
      Authorization = "Bearer $secret"
      Accept = "application/json"
    } -TimeoutSec 30
    $catalogJson = $catalogResponse.Content | ConvertFrom-Json
    $ids = @()
    if ($catalogJson.models) { $ids = @($catalogJson.models | ForEach-Object { [string]($_.id) }) }
    elseif ($catalogJson.data) { $ids = @($catalogJson.data | ForEach-Object { [string]($_.id) }) }
    $catalog = [pscustomobject]@{
      httpStatus = [int]$catalogResponse.StatusCode
      totalModels = $ids.Count
      frontierHits = @($want | Where-Object { $ids -contains $_ -or ($ids | Where-Object { $_ -like "*$_" }) })
    }
  } catch {
    $catalogStatus = $null
    try { $catalogStatus = [int]$_.Exception.Response.StatusCode } catch {}
    $catalog = [pscustomobject]@{
      httpStatus = $catalogStatus
      totalModels = $null
      frontierHits = @()
      errorClass = if ($catalogStatus) { "http-$catalogStatus" } else { "request-failed" }
    }
  }

  foreach ($model in $want) {
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
      $response = Invoke-WebRequest -Uri ($BaseUrl.TrimEnd("/") + "/api/gateway/v1/chat/completions") -Method Post -Headers @{
        Authorization = "Bearer $secret"
        Accept = "application/json"
      } -ContentType "application/json" -Body $body -TimeoutSec 60
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
    [Codex.GatewayCanary.NativeMethods]::CredFree($credentialPtr)
  }
}

$payload = [pscustomobject]@{
  generatedAtUtc = [DateTime]::UtcNow.ToString("o")
  route = $BaseUrl
  credentialTarget = $CredentialTarget
  catalog = $catalog
  liveCount = @($results | Where-Object { $_.live }).Count
  results = $results
}
$payload | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $OutPath -Encoding utf8
$payload | ConvertTo-Json -Depth 6
