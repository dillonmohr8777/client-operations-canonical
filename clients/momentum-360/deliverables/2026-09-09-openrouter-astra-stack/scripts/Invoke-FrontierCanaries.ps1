param(
  [string]$OutPath = (Join-Path $PSScriptRoot "..\verification-canaries.json")
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Continue"

$prompt = "Reply with the single word PONG and nothing else."
$targets = @(
  @{ id = "gpt-6-astra"; model = "openai/gpt-6-astra"; reason = "tiktok-subject"; maxTokens = 24; effort = "low" }
  @{ id = "claude-fable-5.1"; model = "anthropic/claude-fable-5.1"; reason = "tiktok-named"; maxTokens = 24; effort = "low" }
  @{ id = "claude-opus-5"; model = "anthropic/claude-opus-5"; reason = "frontier"; maxTokens = 24; effort = "low" }
  @{ id = "muse-spark-1.3"; model = "meta/muse-spark-1.3"; reason = "frontier"; maxTokens = 24; effort = "low" }
  @{ id = "gpt-5.6-sol"; model = "openai/gpt-5.6-sol"; reason = "frontier"; maxTokens = 24; effort = "low" }
  @{ id = "grok-4.6"; model = "x-ai/grok-4.6"; reason = "frontier"; maxTokens = 24; effort = "low" }
  @{ id = "gemini-3.8-flash"; model = "google/gemini-3.8-flash"; reason = "frontier"; maxTokens = 24; effort = "low" }
  @{ id = "deepseek-v4-pro"; model = "deepseek-v4-pro-0813"; reason = "inference-net"; maxTokens = 24; effort = "low" }
  @{ id = "kimi-k3-free"; model = "moonshotai/kimi-k3-free"; reason = "tokenrouter"; maxTokens = 24; effort = "low" }
)

$results = @()
foreach ($target in $targets) {
  $started = [DateTime]::UtcNow
  $outputFile = Join-Path $env:TEMP ("omniroute-canary-" + $target.id + ".txt")
  $args = @(
    "chat",
    "--no-history",
    "--model", $target.model,
    "--max-tokens", [string]$target.maxTokens,
    "--reasoning-effort", $target.effort,
    $prompt
  )
  $proc = Start-Process -FilePath "omniroute" -ArgumentList $args -NoNewWindow -Wait -PassThru -RedirectStandardOutput $outputFile -RedirectStandardError "$outputFile.err"
  $stdout = ""
  $stderr = ""
  if (Test-Path $outputFile) { $stdout = Get-Content -LiteralPath $outputFile -Raw -ErrorAction SilentlyContinue }
  if (Test-Path "$outputFile.err") { $stderr = Get-Content -LiteralPath "$outputFile.err" -Raw -ErrorAction SilentlyContinue }
  $combined = (($stdout + "`n" + $stderr) -replace '(?i)sk-[A-Za-z0-9\-_]{8,}', '[redacted]')
  $looksSecret = $combined -match '(?i)(sk-|api[_-]?key|bearer )'
  $pong = $combined -match '(?i)\bPONG\b'
  $results += [pscustomobject]@{
    id = $target.id
    model = $target.model
    reason = $target.reason
    exitCode = $proc.ExitCode
    elapsedMs = [int]([DateTime]::UtcNow - $started).TotalMilliseconds
    pong = [bool]$pong
    ok = [bool]($proc.ExitCode -eq 0 -and $pong)
    outputPreview = if ($looksSecret) { "[redacted]" } else { (($combined.Trim() -replace '\s+', ' ').Substring(0, [Math]::Min(280, ($combined.Trim().Length)))) }
  }
}

$payload = [pscustomobject]@{
  generatedAtUtc = [DateTime]::UtcNow.ToString("o")
  prompt = $prompt
  results = $results
  liveCount = @($results | Where-Object { $_.ok }).Count
}
$payload | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $OutPath -Encoding utf8
Write-Output "Wrote $OutPath liveCount=$($payload.liveCount)"
$payload | ConvertTo-Json -Depth 6
