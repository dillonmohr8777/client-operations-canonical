param(
  [string]$BaseUrl = "http://127.0.0.1:20128",
  [string]$OutPath = (Join-Path $PSScriptRoot "..\prefixed-gateway-canaries.json")
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$targets = @(
  @{ id = "inference-deepseek"; model = "openai-compatible-chat-7c8738b6-0b2c-45a2-a6f9-63c0f4341902/deepseek-v4-pro-0813" },
  @{ id = "openrouter-free"; model = "openrouter/free" },
  @{ id = "openrouter-astra"; model = "openai-compatible-chat-4212900d-eee7-4df6-ad33-bec2ee4f1be0/openai/gpt-6-astra" },
  @{ id = "openrouter-fable"; model = "openai-compatible-chat-4212900d-eee7-4df6-ad33-bec2ee4f1be0/anthropic/claude-fable-5.1" },
  @{ id = "xai-grok"; model = "openai-compatible-responses-cfbf2a15-65d7-4b57-8478-703f254016a8/grok-4.6" }
)

$clientKey = [Environment]::GetEnvironmentVariable("OMNIROUTE_API_KEY", "Process")
if ([string]::IsNullOrWhiteSpace($clientKey)) {
  $clientKey = [Environment]::GetEnvironmentVariable("OMNIROUTE_API_KEY", "User")
}
if ([string]::IsNullOrWhiteSpace($clientKey)) {
  throw "OMNIROUTE_API_KEY is not set."
}

$results = @()
try {
  foreach ($target in $targets) {
    $started = Get-Date
    $status = $null
    $errorClass = $null
    $pong = $false
    $preview = $null
    $returnedModel = $null
    try {
      $body = @{
        model = $target.model
        messages = @(@{ role = "user"; content = "Reply with the single word PONG and nothing else." })
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
      $message = [string]$_
      try { $status = [int]$_.Exception.Response.StatusCode } catch {}
      $errorClass = switch ($status) {
        401 { "auth" }
        402 { "payment-required" }
        403 { "forbidden-or-limit" }
        404 { "model-missing" }
        429 { "rate-limit" }
        default { if ($message -match 'No active credentials for provider') { "slug-split" } else { "request-failed" } }
      }
      $preview = $errorClass
    }
    $results += [pscustomobject]@{
      id = $target.id
      model = $target.model
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
  route = "omniroute-prefixed-provider-nodes"
  liveCount = @($results | Where-Object { $_.live }).Count
  results = $results
}
$payload | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $OutPath -Encoding utf8
$payload | ConvertTo-Json -Depth 6
