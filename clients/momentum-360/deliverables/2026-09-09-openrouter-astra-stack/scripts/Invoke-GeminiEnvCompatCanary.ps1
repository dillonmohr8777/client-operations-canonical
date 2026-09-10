param(
  [string]$OutPath = (Join-Path $PSScriptRoot "..\gemini-env-compat-canaries.json")
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$secret = [Environment]::GetEnvironmentVariable("GEMINI_API_KEY", "Process")
if ([string]::IsNullOrWhiteSpace($secret)) {
  $secret = [Environment]::GetEnvironmentVariable("GEMINI_API_KEY", "User")
}
if ([string]::IsNullOrWhiteSpace($secret)) {
  throw "GEMINI_API_KEY is not set."
}

$probes = @(
  @{
    id = "openai-compat-gemini-3.8-flash"
    uri = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"
    method = "POST"
    headers = @{ Authorization = "Bearer $secret"; Accept = "application/json" }
    body = (@{
      model = "gemini-3.8-flash"
      messages = @(@{ role = "user"; content = "Reply with the single word PONG and nothing else." })
      max_tokens = 16
    } | ConvertTo-Json -Depth 5)
  },
  @{
    id = "models-list-query"
    uri = "https://generativelanguage.googleapis.com/v1beta/models?pageSize=20"
    method = "GET"
    headers = @{ "x-goog-api-key" = $secret; Accept = "application/json" }
    body = $null
  },
  @{
    id = "generate-header-gemini-3.8-flash"
    uri = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent"
    method = "POST"
    headers = @{ "x-goog-api-key" = $secret; Accept = "application/json" }
    body = (@{
      contents = @(@{ role = "user"; parts = @(@{ text = "Reply with the single word PONG and nothing else." }) })
      generationConfig = @{ maxOutputTokens = 16 }
    } | ConvertTo-Json -Depth 6 -Compress)
  }
)

$results = @()
try {
  foreach ($probe in $probes) {
    $started = Get-Date
    $status = $null
    $errorClass = $null
    $pong = $false
    $preview = $null
    $modelHits = @()
    try {
      if ($probe.method -eq "GET") {
        $response = Invoke-WebRequest -Uri $probe.uri -Method Get -Headers $probe.headers -TimeoutSec 30
      } else {
        $response = Invoke-WebRequest -Uri $probe.uri -Method Post -Headers $probe.headers -ContentType "application/json" -Body $probe.body -TimeoutSec 45
      }
      $status = [int]$response.StatusCode
      $json = $response.Content | ConvertFrom-Json
      if ($probe.id -eq "models-list-query") {
        $ids = @($json.models | ForEach-Object { [string]$_.name })
        $modelHits = @($ids | Where-Object { $_ -match 'gemini-3\.8-flash|gemini-2\.5-flash|gemini-2\.0-flash' })
        $preview = "listed-$($ids.Count)"
      } else {
        $text = $null
        if ($json.choices) { $text = [string]$json.choices[0].message.content }
        elseif ($json.candidates) { $text = [string]$json.candidates[0].content.parts[0].text }
        $pong = [string]$text -match '(?i)\bPONG\b'
        $preview = if ($text -and $text.Length -gt 80) { $text.Substring(0, 80) } elseif ($text) { $text } else { "ok" }
      }
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
      id = $probe.id
      status = $status
      errorClass = $errorClass
      pong = [bool]$pong
      live = [bool]($status -eq 200 -and $pong)
      modelHits = $modelHits
      elapsedMs = [int]((Get-Date) - $started).TotalMilliseconds
      outputPreview = $preview
    }
  }
} finally {
  $secret = $null
}

$payload = [pscustomobject]@{
  generatedAtUtc = [DateTime]::UtcNow.ToString("o")
  locator = "env://GEMINI_API_KEY"
  liveCount = @($results | Where-Object { $_.live }).Count
  results = $results
}
$payload | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $OutPath -Encoding utf8
$payload | ConvertTo-Json -Depth 6
