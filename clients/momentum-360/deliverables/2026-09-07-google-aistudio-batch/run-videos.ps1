# Group B: image-to-video for every job in a manifest. Reads GEMINI_API_KEY from User scope. Never prints the key.
# Per job: image (start frame), optional lastFrame, optional referenceImages[]. Caps concurrency (this key's tier 429s above 3 Fast).
# Polls each operation to completion, downloads the mp4, skips existing unless -Force.
param([string]$Manifest = 'batch-videos.json', [int]$MaxConcurrent = 3, [switch]$Force)
$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$env:GEMINI_API_KEY = [Environment]::GetEnvironmentVariable('GEMINI_API_KEY','User')
if (-not $env:GEMINI_API_KEY) { throw 'GEMINI_API_KEY is not set at User scope.' }
$cfg = Get-Content "$root\$Manifest" -Raw | ConvertFrom-Json
New-Item -ItemType Directory -Force "$root\clips" | Out-Null

$worker = {
  param($name, $prompt, $imgPath, $lastPath, $refPaths, $model, $paramsJson, $out, $key)
  $H = @{ 'x-goog-api-key' = $key }
  $scrub = { param($s) ($s -replace 'AQ\.[A-Za-z0-9_\-]+','[REDACTED]') -replace 'key=[^&"\s]+','key=[REDACTED]' }
  $b64 = { param($p) @{ bytesBase64Encoded = [Convert]::ToBase64String([IO.File]::ReadAllBytes($p)); mimeType = 'image/png' } }
  try {
    $inst = @{ prompt = $prompt; image = (& $b64 $imgPath) }
    # Verified live 2026-09-07: lastFrame works at instance level with bytesBase64Encoded (probe A accepted); referenceImages need the inlineData wrapper.
    if ($lastPath) { $inst.lastFrame = (& $b64 $lastPath) }
    if ($refPaths -and $refPaths.Count) { $inst.referenceImages = @($refPaths | ForEach-Object { @{ image = @{ inlineData = @{ mimeType = 'image/png'; data = [Convert]::ToBase64String([IO.File]::ReadAllBytes($_)) } }; referenceType = 'asset' } }) }
    $params = $paramsJson | ConvertFrom-Json
    $body = @{ instances = @($inst); parameters = $params } | ConvertTo-Json -Depth 10 -Compress
    $op = Invoke-RestMethod -Method Post -Uri "https://generativelanguage.googleapis.com/v1beta/models/${model}:predictLongRunning" -Headers ($H + @{ 'Content-Type' = 'application/json' }) -Body $body
    $i = 0
    while (-not $op.done -and $i -lt 120) { Start-Sleep 8; $i++; $op = Invoke-RestMethod -Uri "https://generativelanguage.googleapis.com/v1beta/$($op.name)" -Headers $H }
    if (-not $op.done) { return "$name : TIMEOUT after $($i*8)s ($($op.name))" }
    if ($op.error) { return "$name : OP ERROR " + (& $scrub ($op.error | ConvertTo-Json -Compress)) }
    $uri = $op.response.generateVideoResponse.generatedSamples[0].video.uri
    if (-not $uri) { return "$name : NO URI " + (& $scrub (($op.response | ConvertTo-Json -Depth 6 -Compress).Substring(0, 400))) }
    Invoke-WebRequest -Uri $uri -Headers $H -OutFile $out
    return "$name : OK $([IO.File]::ReadAllBytes($out).Length) bytes after $($i*8)s"
  } catch { return "$name : FAILED " + (& $scrub ($_.Exception.Message + ' || ' + $_.ErrorDetails.Message)) }
}


# ---- hard budget guard: refuse to start any job that would cross Dillon's cap ----
$budgetPath = "$root\budget.json"
$budget = Get-Content $budgetPath -Raw | ConvertFrom-Json
$unit = if ($cfg.model -match 'lite') { $budget.unit_prices.veo_lite_4s_720p } else { $budget.unit_prices.veo_fast_8s_1080p }
function Test-Budget { param($n) $projected = [double]$budget.spent_usd + $n * $unit; if ($projected -gt [double]$budget.cap_usd) { return $false }; return $true }

$queue = @($cfg.jobs | Where-Object { $Force -or -not (Test-Path "$root\clips\$($_.name).mp4") })
"Queued $($queue.Count) video jobs from $Manifest ($($cfg.model), $($cfg.parameters.durationSeconds)s, $($cfg.parameters.resolution), max $MaxConcurrent concurrent)"
$running = @(); $results = @()
foreach ($j in $queue) {
  if (-not (Test-Budget 1)) { "BUDGET STOP: spent $($budget.spent_usd) + $unit would exceed cap $($budget.cap_usd). Skipping $($j.name) and everything after it."; break }
  $budget.spent_usd = [math]::Round([double]$budget.spent_usd + $unit, 2); $budget | ConvertTo-Json -Depth 4 | Set-Content $budgetPath
  while (@($running | Where-Object { $_.State -eq 'Running' }).Count -ge $MaxConcurrent) { Start-Sleep 5 }
  $params = $cfg.parameters
  if ($j.parameters) { $params = $j.parameters }
  $refs = @(); if ($j.referenceImages) { $refs = @($j.referenceImages | ForEach-Object { "$root\$_" }) }
  $last = $null; if ($j.lastFrame) { $last = "$root\$($j.lastFrame)" }
  $running += Start-Job -ScriptBlock $worker -ArgumentList $j.name, $j.prompt, "$root\$($j.image)", $last, $refs, $cfg.model, ($params | ConvertTo-Json -Compress), "$root\clips\$($j.name).mp4", $env:GEMINI_API_KEY
}
$running | Wait-Job -Timeout 1800 | Out-Null
$running | ForEach-Object { Receive-Job $_ }
"--- clips on disk: $((Get-ChildItem "$root\clips" -Filter *.mp4 | Where-Object { $_.Name -notmatch 'tail' }).Count)"
