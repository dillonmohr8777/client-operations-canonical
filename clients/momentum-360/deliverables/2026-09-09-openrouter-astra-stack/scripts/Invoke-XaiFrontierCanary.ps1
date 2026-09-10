param(
  [string]$SecretPath = "C:\Users\dillo\AppData\Local\Codex\Secrets\xai-dillon-os-daily-x-search.dpapi",
  [string]$OutPath = (Join-Path $PSScriptRoot "..\xai-canaries.json")
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$models = @(
  "grok-4.6",
  "grok-4.5",
  "grok-4"
)

if (-not (Test-Path -LiteralPath $SecretPath)) {
  throw "Protected xAI locator is missing."
}

$secret = $null
$results = @()
try {
  $protected = Get-Content -Raw -LiteralPath $SecretPath
  $secure = ConvertTo-SecureString $protected
  $credential = [System.Net.NetworkCredential]::new("", $secure)
  $secret = $credential.Password
  if ([string]::IsNullOrWhiteSpace($secret) -or $secret.Length -lt 20) {
    throw "Protected xAI credential is empty or malformed."
  }

  foreach ($model in $models) {
    $started = Get-Date
    $status = $null
    $errorClass = $null
    $pong = $false
    $preview = $null
    $returnedModel = $null
    try {
      $body = @{
        model = $model
        input = "Reply with the single word PONG and nothing else."
      } | ConvertTo-Json -Depth 5 -Compress
      $response = Invoke-WebRequest -Uri "https://api.x.ai/v1/responses" -Method Post -Headers @{
        Authorization = "Bearer $secret"
      } -ContentType "application/json" -Body $body -TimeoutSec 45
      $status = [int]$response.StatusCode
      $json = $response.Content | ConvertFrom-Json
      $returnedModel = [string]$json.model
      $text = ""
      if ($json.output_text) { $text = [string]$json.output_text }
      elseif ($json.output) {
        $chunks = @($json.output | ForEach-Object {
          if ($_.content) {
            @($_.content | ForEach-Object { [string]$_.text })
          }
        })
        $text = ($chunks -join " ").Trim()
      }
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
  $secret = $null
  Remove-Item Env:\XAI_API_KEY -ErrorAction SilentlyContinue
  $credential = $null
  $secure = $null
  $protected = $null
}

$payload = [pscustomobject]@{
  generatedAtUtc = [DateTime]::UtcNow.ToString("o")
  credentialLocator = "dpapi-bootstrap://xai/dillon-os/daily-x-search"
  liveCount = @($results | Where-Object { $_.live }).Count
  results = $results
}
$payload | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $OutPath -Encoding utf8
$payload | ConvertTo-Json -Depth 6
