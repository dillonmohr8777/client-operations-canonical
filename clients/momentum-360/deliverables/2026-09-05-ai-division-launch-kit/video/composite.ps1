<#
.SYNOPSIS
  Join Higgsfield plates and composite the verified logo layer locally, then
  derive the social aspect ratios.

.DESCRIPTION
  No model joins clips and no model draws the mark. Higgsfield supplies
  background plates only; this script concatenates them, derives 9:16 and 1:1
  by centre crop where asked, and overlays the verified logo PNG on EACH
  derivative after cropping (so the mark is never cut off). Only position,
  opacity and scale of the mark are animated.

  Read-only against the plates. Writes only into -OutDir.

.EXAMPLE
  ./composite.ps1 -PlateDir ./plates/F01 -Mark ./assets/momentum-logo-white.png -OutDir ./out -Name F01-opener -Derive 9x16,1x1
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory)][string]$PlateDir,
  [string]$Mark,
  [string]$OutDir = './out',
  [string]$Name = 'piece',
  [string[]]$Derive = @(),          # any of: 9x16, 1x1
  [int]$MarkHeight = 64,
  [int]$Margin = 96,
  [double]$FadeInSeconds = 1,
  [switch]$WhatIfOnly
)

$ErrorActionPreference = 'Stop'
if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) { throw 'ffmpeg is not on PATH.' }
if (-not (Test-Path $PlateDir)) { throw "PlateDir not found: $PlateDir" }
if (-not (Test-Path $OutDir)) { New-Item -ItemType Directory -Force $OutDir | Out-Null }
$haveMark = $Mark -and (Test-Path $Mark)
if (-not $haveMark) {
  Write-Warning 'No -Mark supplied (or missing). Emitting plates only, with NO logo layer. Do not ship this as final.'
}

$plates = Get-ChildItem -Path $PlateDir -Filter *.mp4 | Sort-Object Name
if ($plates.Count -eq 0) { throw "No .mp4 plates in $PlateDir" }
Write-Host "Plates ($($plates.Count)):"; $plates | ForEach-Object { Write-Host "  $($_.Name)" }

# --- 1. concat -------------------------------------------------------------
$listPath = Join-Path $OutDir "$Name.concat.txt"
$plates | ForEach-Object { "file '$($_.FullName -replace "'","'\''")'" } | Set-Content -Path $listPath -Encoding utf8
$joined = Join-Path $OutDir "$Name.plates.mp4"
$cmds = @(, @('-y','-f','concat','-safe','0','-i',$listPath,'-c','copy',$joined))

# --- 2. per-derivative crop + overlay --------------------------------------
# crop first, overlay second: the mark is placed relative to the FINAL frame.
$targets = @(@{ tag = ''; crop = $null }) + ($Derive | ForEach-Object {
  switch ($_) {
    '9x16' { @{ tag = '.9x16'; crop = 'crop=ih*9/16:ih:(iw-ih*9/16)/2:0' } }
    '1x1'  { @{ tag = '.1x1';  crop = 'crop=ih:ih:(iw-ih)/2:0' } }
    default { throw "Unknown -Derive value '$_' (use 9x16, 1x1)" }
  }
})
$outputs = @()
foreach ($t in $targets) {
  $final = Join-Path $OutDir "$Name$($t.tag).mp4"
  $outputs += $final
  $chain = @()
  if ($t.crop) { $chain += "[0:v]$($t.crop)[c]" } else { $chain += "[0:v]null[c]" }
  if ($haveMark) {
    $chain += "[1:v]scale=-1:$MarkHeight[mk]"
    $chain += "[c][mk]overlay=x=W-w-$Margin`:y=H-h-$Margin`:alpha='min(1,max(0,(t-0.3)/$FadeInSeconds))'[v]"
    $cmds += , @('-y','-i',$joined,'-i',$Mark,'-filter_complex',($chain -join ';'),'-map','[v]',
                 '-c:v','libx264','-crf','18','-preset','slow','-pix_fmt','yuv420p','-movflags','+faststart','-an',$final)
  } else {
    $cmds += , @('-y','-i',$joined,'-filter_complex',($chain -join ';'),'-map','[c]',
                 '-c:v','libx264','-crf','18','-preset','slow','-pix_fmt','yuv420p','-movflags','+faststart','-an',$final)
  }
}

if ($WhatIfOnly) { $cmds | ForEach-Object { Write-Host ("ffmpeg " + ($_ -join ' ')) }; return }
foreach ($c in $cmds) { & ffmpeg @c; if ($LASTEXITCODE -ne 0) { throw "ffmpeg failed ($LASTEXITCODE): $($c -join ' ')" } }

# --- 3. QA frames + receipt --------------------------------------------------
# The acceptance criteria name opening, middle, closing and final frames.
$receipt = [ordered]@{
  name        = $Name
  generatedAt = (Get-Date).ToString('o')
  plates      = @($plates | ForEach-Object { @{ file = $_.Name; sha256 = (Get-FileHash $_.FullName -Algorithm SHA256).Hash } })
  mark        = if ($haveMark) { @{ file = (Split-Path $Mark -Leaf); sha256 = (Get-FileHash $Mark -Algorithm SHA256).Hash; heightPx = $MarkHeight } } else { $null }
  outputs     = @()
  logoRule    = 'Position, opacity and scale only. Mark not generated, not redrawn, not recoloured. Overlaid after crop so it is never cut.'
  reviewPending = @('no logo deformation in opening/mid/closing/final frame of EVERY derivative',
                    'duration and dimensions match shots.json', 'reduced-motion still exists for this piece')
}
foreach ($f in $outputs) {
  $dur = [double](& ffprobe -v error -show_entries format=duration -of csv=p=0 $f)
  $dims = (& ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 $f) -replace ',', 'x'
  $qa = Join-Path $OutDir ((Split-Path $f -Leaf) -replace '\.mp4$', '.qa')
  New-Item -ItemType Directory -Force $qa | Out-Null
  foreach ($p in @(0.0, [math]::Round($dur/2,2), [math]::Round($dur*0.85,2), [math]::Max(0,[math]::Round($dur-0.1,2)))) {
    & ffmpeg -y -ss $p -i $f -frames:v 1 (Join-Path $qa "frame-$p.png") 2>$null
  }
  $receipt.outputs += @{ file = (Split-Path $f -Leaf); sha256 = (Get-FileHash $f -Algorithm SHA256).Hash; durationSeconds = $dur; dimensions = $dims; qaFrames = @(Get-ChildItem $qa -Filter *.png | ForEach-Object { $_.Name }) }
}
$receiptPath = Join-Path $OutDir "$Name.receipt.json"
$receipt | ConvertTo-Json -Depth 6 | Set-Content -Path $receiptPath -Encoding utf8
Write-Host "`nOutputs:"; $outputs | ForEach-Object { Write-Host "  $_" }
Write-Host "Receipt $receiptPath"
Write-Host 'Review the QA frames before calling this accepted. The receipt records what was made, not that it passed.'
