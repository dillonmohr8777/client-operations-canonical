param(
  [string]$BaseUrl = "http://127.0.0.1:20128",
  [string]$OutPath = (Join-Path $PSScriptRoot "..\tokenrouter-catalog-frontier.json")
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$prefix = "openai-compatible-chat-07666d43-74ee-4745-bf40-b4d84f57307d"
$want = @(
  "gpt-6-astra",
  "claude-fable-5.1",
  "claude-opus-5",
  "muse-spark-1.3",
  "gpt-5.6-sol",
  "grok-4.6",
  "gemini-3.8-flash"
)

$clientKey = [Environment]::GetEnvironmentVariable("OMNIROUTE_API_KEY", "Process")
if ([string]::IsNullOrWhiteSpace($clientKey)) {
  $clientKey = [Environment]::GetEnvironmentVariable("OMNIROUTE_API_KEY", "User")
}
if ([string]::IsNullOrWhiteSpace($clientKey)) {
  throw "OMNIROUTE_API_KEY is not set."
}

try {
  $response = Invoke-WebRequest -Uri ($BaseUrl.TrimEnd("/") + "/v1/models") -Headers @{
    Authorization = "Bearer $clientKey"
    Accept = "application/json"
  } -TimeoutSec 45
  $json = $response.Content | ConvertFrom-Json
  $ids = @($json.data | ForEach-Object { [string]$_.id })
  $prefixed = @($ids | Where-Object { $_ -like "$prefix/*" })
  $matches = foreach ($needle in $want) {
    [pscustomobject]@{
      needle = $needle
      hits = @($prefixed | Where-Object { $_ -like "*$needle*" })
    }
  }
  $payload = [pscustomobject]@{
    generatedAtUtc = [DateTime]::UtcNow.ToString("o")
    httpStatus = [int]$response.StatusCode
    totalModels = $ids.Count
    tokenRouterModels = $prefixed.Count
    frontier = $matches
  }
} finally {
  $clientKey = $null
}

$payload | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $OutPath -Encoding utf8
$payload | ConvertTo-Json -Depth 6
