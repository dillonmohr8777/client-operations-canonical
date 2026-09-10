param(
  [string]$CredentialTarget = "Codex/TelegramModelGateway/OpenRouter",
  [string]$OutPath = (Join-Path $PSScriptRoot "..\openrouter-canaries.json")
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if (-not ("Codex.OpenRouterCanary.NativeMethods" -as [type])) {
  Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
namespace Codex.OpenRouterCanary {
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
  "openai/gpt-6-astra",
  "anthropic/claude-fable-5.1",
  "anthropic/claude-opus-5",
  "meta/muse-spark-1.3",
  "openai/gpt-5.6-sol",
  "x-ai/grok-4.6",
  "google/gemini-3.8-flash",
  "z-ai/glm-5.3-flash",
  "z-ai/glm-5.2:free"
)

$credentialPtr = [IntPtr]::Zero
$blob = $null
$secret = $null
$results = @()
$keyMeta = $null
$creditsMeta = $null

try {
  $ok = [Codex.OpenRouterCanary.NativeMethods]::CredRead($CredentialTarget, 1, 0, [ref]$credentialPtr)
  if (-not $ok) {
    throw "OpenRouter credential locator missing (Win32 $([Runtime.InteropServices.Marshal]::GetLastWin32Error()))."
  }
  $credential = [Runtime.InteropServices.Marshal]::PtrToStructure(
    $credentialPtr,
    [type][Codex.OpenRouterCanary.CREDENTIAL]
  )
  $blob = New-Object byte[] $credential.CredentialBlobSize
  [Runtime.InteropServices.Marshal]::Copy($credential.CredentialBlob, $blob, 0, [int]$credential.CredentialBlobSize)
  $unicodeCandidate = [Text.Encoding]::Unicode.GetString($blob).TrimEnd([char]0)
  $utf8Candidate = [Text.Encoding]::UTF8.GetString($blob).TrimEnd([char]0)
  if ($unicodeCandidate -match '^sk-or-') { $secret = $unicodeCandidate }
  elseif ($utf8Candidate -match '^sk-or-') { $secret = $utf8Candidate }
  else { throw "Resolved OpenRouter credential is not a key record." }

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
      $response = Invoke-WebRequest -Uri "https://openrouter.ai/api/v1/chat/completions" -Method Post -Headers @{
        Authorization = "Bearer $secret"
        "HTTP-Referer" = "https://127.0.0.1"
        "X-Title" = "Momentum360 OmniRoute canary"
      } -ContentType "application/json" -Body $body -TimeoutSec 90
      $status = [int]$response.StatusCode
      $json = $response.Content | ConvertFrom-Json
      $text = [string]$json.choices[0].message.content
      $pong = $text -match '(?i)\bPONG\b'
      $preview = if ($text.Length -gt 80) { $text.Substring(0, 80) } else { $text }
    } catch {
      $status = $null
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

  try {
    $keyResponse = Invoke-WebRequest -Uri "https://openrouter.ai/api/v1/auth/key" -Method Get -Headers @{
      Authorization = "Bearer $secret"
    } -TimeoutSec 30
    $keyJson = $keyResponse.Content | ConvertFrom-Json
    $data = $keyJson.data
    $keyMeta = [pscustomobject]@{
      httpStatus = [int]$keyResponse.StatusCode
      isFreeTier = [bool]$data.is_free_tier
      limit = $data.limit
      limitRemaining = $data.limit_remaining
      usage = $data.usage
      limitReset = $data.limit_reset
    }
  } catch {
    $keyStatus = $null
    try { $keyStatus = [int]$_.Exception.Response.StatusCode } catch {}
    $keyMeta = [pscustomobject]@{
      httpStatus = $keyStatus
      isFreeTier = $null
      limit = $null
      limitRemaining = $null
      usage = $null
      limitReset = $null
      errorClass = if ($keyStatus -eq 401) { "auth" } else { "request-failed" }
    }
  }

  $creditsMeta = $null
  try {
    $creditsResponse = Invoke-WebRequest -Uri "https://openrouter.ai/api/v1/credits" -Method Get -Headers @{
      Authorization = "Bearer $secret"
    } -TimeoutSec 30
    $creditsJson = $creditsResponse.Content | ConvertFrom-Json
    $creditsMeta = [pscustomobject]@{
      httpStatus = [int]$creditsResponse.StatusCode
      totalCredits = $creditsJson.data.total_credits
      totalUsage = $creditsJson.data.total_usage
    }
  } catch {
    $creditsStatus = $null
    try { $creditsStatus = [int]$_.Exception.Response.StatusCode } catch {}
    $creditsMeta = [pscustomobject]@{
      httpStatus = $creditsStatus
      totalCredits = $null
      totalUsage = $null
      errorClass = if ($creditsStatus -eq 401) { "auth" } else { "request-failed" }
    }
  }
} finally {
  $secret = $null
  if ($blob) { [Array]::Clear($blob, 0, $blob.Length) }
  if ($credentialPtr -ne [IntPtr]::Zero) {
    [Codex.OpenRouterCanary.NativeMethods]::CredFree($credentialPtr)
  }
}

$payload = [pscustomobject]@{
  generatedAtUtc = [DateTime]::UtcNow.ToString("o")
  credentialTarget = $CredentialTarget
  keyMetadata = $keyMeta
  credits = $creditsMeta
  liveCount = @($results | Where-Object { $_.live }).Count
  results = $results
}
$payload | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $OutPath -Encoding utf8
$payload | ConvertTo-Json -Depth 6
