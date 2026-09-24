# Group A: generate every still in a manifest in parallel. Reads GEMINI_API_KEY from User scope.
# Never prints the key. Retries 429/503 three times. Skips files that already exist unless -Force.
param([string]$Manifest = 'batch-images.json', [switch]$Force)
$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$env:GEMINI_API_KEY = [Environment]::GetEnvironmentVariable('GEMINI_API_KEY','User')
if (-not $env:GEMINI_API_KEY) { throw 'GEMINI_API_KEY is not set at User scope.' }
$cfg = Get-Content "$root\$Manifest" -Raw | ConvertFrom-Json
New-Item -ItemType Directory -Force "$root\stills" | Out-Null

$budgetPath = "$root\budget.json"; $budget = Get-Content $budgetPath -Raw | ConvertFrom-Json
$jobs = foreach ($j in $cfg.jobs) {
  $out = "$root\stills\$($j.name).png"
  if ((Test-Path $out) -and -not $Force) { continue }
  if ([double]$budget.spent_usd + [double]$budget.unit_prices.still_flash_image -gt [double]$budget.cap_usd) { "BUDGET STOP at $($j.name)"; break }
  $budget.spent_usd = [math]::Round([double]$budget.spent_usd + [double]$budget.unit_prices.still_flash_image, 3); $budget | ConvertTo-Json -Depth 4 | Set-Content $budgetPath
  Start-Job -ArgumentList $j.name, $j.prompt, $j.aspect, $cfg.model, $cfg.negative, $out, $env:GEMINI_API_KEY -ScriptBlock {
    param($name, $prompt, $aspect, $model, $negative, $out, $key)
    $body = @{ contents = @(@{ parts = @(@{ text = "$prompt`n`nDo not include: $negative." }) })
               generationConfig = @{ responseModalities = @('IMAGE'); imageConfig = @{ aspectRatio = $aspect } } } | ConvertTo-Json -Depth 8
    for ($try = 1; $try -le 4; $try++) {
      try {
        $r = Invoke-RestMethod -Method Post -Uri "https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent" `
              -Headers @{ 'x-goog-api-key' = $key; 'Content-Type' = 'application/json' } -Body $body
        $img = $r.candidates[0].content.parts | Where-Object { $_.inlineData } | Select-Object -First 1
        if (-not $img) { return "$name : NO IMAGE (finishReason=$($r.candidates[0].finishReason))" }
        [IO.File]::WriteAllBytes($out, [Convert]::FromBase64String($img.inlineData.data))
        return "$name : OK $($r.usageMetadata.candidatesTokenCount) img tokens"
      } catch {
        $code = $_.Exception.Response.StatusCode.value__
        if (($code -eq 429 -or $code -eq 503) -and $try -lt 4) { Start-Sleep (10 * $try); continue }
        return "$name : FAILED $code " + (($_.ErrorDetails.Message) -replace 'AQ\.[A-Za-z0-9_\-]+','[REDACTED]')
      }
    }
  }
}
"Started $($jobs.Count) image jobs from $Manifest"
$jobs | Wait-Job -Timeout 600 | Out-Null
$jobs | ForEach-Object { Receive-Job $_ }
"--- stills on disk: $((Get-ChildItem "$root\stills" -Filter *.png).Count)"
