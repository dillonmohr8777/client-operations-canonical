param(
  [string]$OutPath = (Join-Path $PSScriptRoot "..\credential-names.json")
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$needles = @(
  "openrouter", "openai", "anthropic", "claude", "gemini", "xai", "grok",
  "inference", "tokenrouter", "zai", "glm", "astra", "muse", "omniroute",
  "model-gateway", "antigravity"
)
$raw = cmdkey /list | Out-String
$names = @()
foreach ($line in ($raw -split "`r?`n")) {
  if ($line -notmatch 'Target:\s*(.+)$') { continue }
  $target = $Matches[1].Trim()
  $lower = $target.ToLowerInvariant()
  if ($needles | Where-Object { $lower.Contains($_) }) {
    $names += $target
  }
}

$envNames = @(
  Get-ChildItem Env: |
    Where-Object { $_.Name -match 'API_KEY|OPENAI|ANTHROPIC|OPENROUTER|GEMINI|XAI|ZAI|INFERENCE|TOKENROUTER|OMNIROUTE' } |
    ForEach-Object { $_.Name }
)

$payload = [pscustomobject]@{
  generatedAtUtc = [DateTime]::UtcNow.ToString("o")
  credentialTargetNames = @($names | Sort-Object -Unique)
  envVarNames = @($envNames | Sort-Object -Unique)
}
$payload | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $OutPath -Encoding utf8
$payload | ConvertTo-Json -Depth 4
