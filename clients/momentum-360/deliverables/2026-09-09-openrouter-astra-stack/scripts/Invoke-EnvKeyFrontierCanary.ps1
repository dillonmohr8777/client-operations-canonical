param(
  [string]$OutPath = (Join-Path $PSScriptRoot "..\env-key-canaries.json")
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Get-Shape([string]$value) {
  if ([string]::IsNullOrWhiteSpace($value)) {
    return [pscustomobject]@{ present = $false; kind = "missing"; length = 0 }
  }
  $kind = if ($value -match '^AIza') { "google-api-key" }
    elseif ($value -match '^sk-or-') { "openrouter" }
    elseif ($value -match '^sk-') { "sk-style" }
    elseif ($value -match '^ya29') { "google-oauth" }
    else { "opaque" }
  return [pscustomobject]@{
    present = $true
    kind = $kind
    length = $value.Length
  }
}

function Invoke-OpenRouterModel([string]$secret, [string]$model) {
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
      "X-Title" = "Momentum360 env-key canary"
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
  return [pscustomobject]@{
    route = "env://OPENROUTER_API_KEY"
    model = $model
    status = $status
    errorClass = $errorClass
    pong = [bool]$pong
    live = [bool]($status -eq 200 -and $pong)
    elapsedMs = [int]((Get-Date) - $started).TotalMilliseconds
    outputPreview = $preview
  }
}

function Invoke-GeminiModel([string]$secret, [string]$model) {
  $started = Get-Date
  $status = $null
  $errorClass = $null
  $pong = $false
  $preview = $null
  try {
    $body = @{
      contents = @(@{ role = "user"; parts = @(@{ text = "Reply with the single word PONG and nothing else." }) })
      generationConfig = @{ maxOutputTokens = 16 }
    } | ConvertTo-Json -Depth 6 -Compress
    $response = Invoke-WebRequest -Uri "https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=$secret" -Method Post -ContentType "application/json" -Body $body -TimeoutSec 45
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
  return [pscustomobject]@{
    route = "env://GEMINI_API_KEY"
    model = $model
    status = $status
    errorClass = $errorClass
    pong = [bool]$pong
    live = [bool]($status -eq 200 -and $pong)
    elapsedMs = [int]((Get-Date) - $started).TotalMilliseconds
    outputPreview = $preview
  }
}

function Get-FirstEnv([string]$name) {
  $process = [Environment]::GetEnvironmentVariable($name, "Process")
  if (-not [string]::IsNullOrWhiteSpace($process)) { return $process }
  return [Environment]::GetEnvironmentVariable($name, "User")
}

$orSecret = Get-FirstEnv "OPENROUTER_API_KEY"
$gemSecret = Get-FirstEnv "GEMINI_API_KEY"
$orShape = Get-Shape $orSecret
$gemShape = Get-Shape $gemSecret
$orCredits = $null
$results = @()

try {
  if ($orShape.present) {
    try {
      $creditsResponse = Invoke-WebRequest -Uri "https://openrouter.ai/api/v1/credits" -Headers @{
        Authorization = "Bearer $orSecret"
      } -TimeoutSec 30
      $creditsJson = $creditsResponse.Content | ConvertFrom-Json
      $orCredits = [pscustomobject]@{
        httpStatus = [int]$creditsResponse.StatusCode
        totalCredits = $creditsJson.data.total_credits
        totalUsage = $creditsJson.data.total_usage
      }
    } catch {
      $creditsStatus = $null
      try { $creditsStatus = [int]$_.Exception.Response.StatusCode } catch {}
      $orCredits = [pscustomobject]@{
        httpStatus = $creditsStatus
        totalCredits = $null
        totalUsage = $null
        errorClass = "request-failed"
      }
    }
    foreach ($model in @(
      "openai/gpt-6-astra",
      "anthropic/claude-fable-5.1",
      "anthropic/claude-opus-5",
      "meta/muse-spark-1.3",
      "openai/gpt-5.6-sol",
      "x-ai/grok-4.6",
      "google/gemini-3.8-flash"
    )) {
      $results += Invoke-OpenRouterModel $orSecret $model
    }
  }
  if ($gemShape.present) {
    foreach ($model in @("gemini-3.8-flash", "gemini-2.5-flash", "gemini-2.0-flash")) {
      $results += Invoke-GeminiModel $gemSecret $model
    }
  }
} finally {
  $orSecret = $null
  $gemSecret = $null
}

$payload = [pscustomobject]@{
  generatedAtUtc = [DateTime]::UtcNow.ToString("o")
  openrouterShape = $orShape
  geminiShape = $gemShape
  openrouterCredits = $orCredits
  liveCount = @($results | Where-Object { $_.live }).Count
  results = $results
}
$payload | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $OutPath -Encoding utf8
$payload | ConvertTo-Json -Depth 6
