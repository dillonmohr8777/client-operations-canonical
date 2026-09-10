param(
  [string]$CredentialTarget = "gemini:antigravity",
  [string]$OutPath = (Join-Path $PSScriptRoot "..\gemini-antigravity-canaries.json")
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if (-not ("Codex.GeminiCanary.NativeMethods" -as [type])) {
  Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
namespace Codex.GeminiCanary {
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

function Get-SecretShape([string]$value) {
  if ([string]::IsNullOrWhiteSpace($value)) {
    return [pscustomobject]@{ kind = "empty"; length = 0; prefix = $null }
  }
  $prefix = if ($value.Length -ge 6) { $value.Substring(0, 6) } else { $value.Substring(0, $value.Length) }
  $kind = if ($value -match '^AIza') { "google-api-key" }
    elseif ($value -match '^ya29') { "google-oauth-access" }
    elseif ($value -match '^\{') { "json-blob" }
    elseif ($value -match '^sk-') { "sk-style" }
    else { "opaque" }
  return [pscustomobject]@{ kind = $kind; length = $value.Length; prefix = $prefix }
}

function Resolve-GeminiKey([string]$raw) {
  $trimmed = $raw.Trim().TrimEnd([char]0)
  if ($trimmed -match '^\{') {
    try {
      $json = $trimmed | ConvertFrom-Json
      foreach ($name in @("apiKey", "api_key", "key", "token", "access_token")) {
        if ($json.PSObject.Properties.Name -contains $name -and $json.$name) {
          return [string]$json.$name
        }
      }
    } catch {}
  }
  return $trimmed
}

$models = @(
  "gemini-3.8-flash",
  "gemini-3.8-flash-latest",
  "models/gemini-3.8-flash"
)

$credentialPtr = [IntPtr]::Zero
$blob = $null
$secret = $null
$shape = $null
$results = @()
try {
  $ok = [Codex.GeminiCanary.NativeMethods]::CredRead($CredentialTarget, 1, 0, [ref]$credentialPtr)
  if (-not $ok) { throw "gemini:antigravity locator missing (Win32 $([Runtime.InteropServices.Marshal]::GetLastWin32Error()))." }
  $credential = [Runtime.InteropServices.Marshal]::PtrToStructure(
    $credentialPtr,
    [type][Codex.GeminiCanary.CREDENTIAL]
  )
  $blob = New-Object byte[] $credential.CredentialBlobSize
  [Runtime.InteropServices.Marshal]::Copy($credential.CredentialBlob, $blob, 0, [int]$credential.CredentialBlobSize)
  $oddByteSlots = [Math]::Floor($blob.Length / 2)
  $oddZeroBytes = 0
  for ($index = 1; $index -lt $blob.Length; $index += 2) {
    if ($blob[$index] -eq 0) { $oddZeroBytes++ }
  }
  $looksUtf16 = $oddByteSlots -gt 0 -and ($oddZeroBytes / $oddByteSlots) -ge 0.75
  $raw = if ($looksUtf16) {
    [Text.Encoding]::Unicode.GetString($blob).TrimEnd([char]0)
  } else {
    [Text.Encoding]::UTF8.GetString($blob).TrimEnd([char]0)
  }
  $secret = Resolve-GeminiKey $raw
  $shape = Get-SecretShape $secret
  if ($secret.Length -lt 12) { throw "Resolved Gemini credential is too short." }

  foreach ($model in $models) {
    $started = Get-Date
    $status = $null
    $errorClass = $null
    $pong = $false
    $preview = $null
    $uri = "https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=$secret"
    if ($model.StartsWith("models/")) {
      $uri = "https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=$secret"
    }
    try {
      $body = @{
        contents = @(@{ role = "user"; parts = @(@{ text = "Reply with the single word PONG and nothing else." }) })
        generationConfig = @{ maxOutputTokens = 16 }
      } | ConvertTo-Json -Depth 6 -Compress
      $response = Invoke-WebRequest -Uri $uri -Method Post -ContentType "application/json" -Body $body -TimeoutSec 45
      $status = [int]$response.StatusCode
      $json = $response.Content | ConvertFrom-Json
      $text = [string]$json.candidates[0].content.parts[0].text
      $pong = $text -match '(?i)\bPONG\b'
      $preview = if ($text.Length -gt 80) { $text.Substring(0, 80) } else { $text }
    } catch {
      try { $status = [int]$_.Exception.Response.StatusCode } catch {}
      $errorClass = switch ($status) {
        400 { "bad-request" }
        401 { "auth" }
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
  $raw = $null
  if ($blob) { [Array]::Clear($blob, 0, $blob.Length) }
  if ($credentialPtr -ne [IntPtr]::Zero) {
    [Codex.GeminiCanary.NativeMethods]::CredFree($credentialPtr)
  }
}

$payload = [pscustomobject]@{
  generatedAtUtc = [DateTime]::UtcNow.ToString("o")
  credentialTarget = $CredentialTarget
  secretShape = $shape
  liveCount = @($results | Where-Object { $_.live }).Count
  results = $results
}
$payload | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $OutPath -Encoding utf8
$payload | ConvertTo-Json -Depth 6
