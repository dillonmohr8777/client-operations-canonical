param(
  [string]$BaseUrl = "http://127.0.0.1:20128",
  [string]$OutPath = (Join-Path $PSScriptRoot "..\tokenrouter-canaries.json")
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$prefix = "openai-compatible-chat-07666d43-74ee-4745-bf40-b4d84f57307d"
$models = @(
  "moonshotai/kimi-k3-free",
  "anthropic/claude-fable-5",
  "anthropic/claude-opus-5",
  "openai/gpt-5.6-sol",
  "openai/gpt-5.6-terra",
  "x-ai/grok-4.5",
  "google/gemini-3.6-flash"
)

$clientKey = [Environment]::GetEnvironmentVariable("OMNIROUTE_API_KEY", "Process")
if ([string]::IsNullOrWhiteSpace($clientKey)) {
  $clientKey = [Environment]::GetEnvironmentVariable("OMNIROUTE_API_KEY", "User")
}
if ([string]::IsNullOrWhiteSpace($clientKey)) {
  throw "OMNIROUTE_API_KEY is not set in the process or user environment."
}

$results = @()
try {
  foreach ($model in $models) {
    $started = Get-Date
    $status = $null
    $errorClass = $null
    $pong = $false
    $preview = $null
    $returnedModel = $null
    $fullModel = "$prefix/$model"
    try {
      $body = @{
        model = $fullModel
        messages = @(
          @{ role = "system"; content = "Answer directly and briefly." }
          @{ role = "user"; content = "Reply with the single word PONG and nothing else." }
        )
        temperature = 0
        max_tokens = 16
        stream = $false
      } | ConvertTo-Json -Depth 6 -Compress
      $response = Invoke-WebRequest -Uri ($BaseUrl.TrimEnd("/") + "/v1/chat/completions") -Method Post -Headers @{
        Authorization = "Bearer $clientKey"
        Accept = "application/json"
      } -ContentType "application/json" -Body $body -TimeoutSec 45
      $status = [int]$response.StatusCode
      $json = $response.Content | ConvertFrom-Json
      $text = [string]$json.choices[0].message.content
      $returnedModel = [string]$json.model
      $pong = $text -match '(?i)\bPONG\b'
      $preview = if ($text.Length -gt 80) { $text.Substring(0, 80) } else { $text }
    } catch {
      try { $status = [int]$_.Exception.Response.StatusCode } catch {}
      if ($null -eq $status -and $_.Exception.Message -match 'timed? ?out') {
        $errorClass = "timeout"
      } else {
        $errorClass = switch ($status) {
          401 { "auth" }
          402 { "payment-required" }
          403 { "forbidden-or-limit" }
          404 { "model-missing" }
          429 { "rate-limit" }
          default { "request-failed" }
        }
      }
      $preview = $errorClass
    }
    $results += [pscustomobject]@{
      model = $model
      routedAs = $fullModel
      returnedModel = $returnedModel
      status = $status
      errorClass = $errorClass
      pong = [bool]$pong
      live = [bool]($status -eq 200 -and $pong)
      elapsedMs = [int]((Get-Date) - $started).TotalMilliseconds
      outputPreview = $preview
    }
  }
} finally {
  $clientKey = $null
}

$payload = [pscustomobject]@{
  generatedAtUtc = [DateTime]::UtcNow.ToString("o")
  route = "omniroute-loopback-tokenrouter"
  credentialLocator = "env://OMNIROUTE_API_KEY"
  liveCount = @($results | Where-Object { $_.live }).Count
  results = $results
}
$payload | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $OutPath -Encoding utf8
$payload | ConvertTo-Json -Depth 6
