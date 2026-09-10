param(
  [string]$CatalogPath = "$env:TEMP\openrouter-models-catalog.json",
  [string]$OutPath = (Join-Path $PSScriptRoot "..\openrouter-catalog-frontier.json")
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Invoke-WebRequest -Uri "https://openrouter.ai/api/v1/models" -TimeoutSec 60 -OutFile $CatalogPath
$catalog = Get-Content -Raw -LiteralPath $CatalogPath | ConvertFrom-Json
$want = @(
  "openai/gpt-6-astra",
  "anthropic/claude-fable-5.1",
  "anthropic/claude-opus-5",
  "meta/muse-spark-1.3",
  "openai/gpt-5.6-sol",
  "x-ai/grok-4.6",
  "google/gemini-3.8-flash"
)
$frontier = foreach ($id in $want) {
  $match = @($catalog.data | Where-Object { $_.id -eq $id }) | Select-Object -First 1
  if ($null -eq $match) {
    [pscustomobject]@{ id = $id; listed = $false; prompt = $null; completion = $null }
  } else {
    [pscustomobject]@{
      id = $id
      listed = $true
      prompt = $match.pricing.prompt
      completion = $match.pricing.completion
    }
  }
}
$freeModels = @($catalog.data | Where-Object {
  $_.id -like "*:free" -or ([string]$_.pricing.prompt -eq "0" -and [string]$_.pricing.completion -eq "0")
} | ForEach-Object { [string]$_.id } | Sort-Object -Unique)

$payload = [pscustomobject]@{
  generatedAtUtc = [DateTime]::UtcNow.ToString("o")
  totalModels = @($catalog.data).Count
  frontier = $frontier
  freeRouterId = "openrouter/free"
  freeModelCount = $freeModels.Count
  freeModelIds = $freeModels
}
$payload | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $OutPath -Encoding utf8
$payload | ConvertTo-Json -Depth 6
