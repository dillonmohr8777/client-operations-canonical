param([switch]$PortraitOnly,[string]$OnlyName)
. C:\Users\dillo\.codex\terminal-bootstrap.ps1
$ErrorActionPreference = 'Stop'
$filmRoot = $PSScriptRoot
$renderReceipt = Get-Content -LiteralPath (Join-Path $filmRoot 'render-receipt.json') -Raw | ConvertFrom-Json
if ($renderReceipt.status -ne 'passed' -or $renderReceipt.films.Count -ne 10) { throw 'Require all ten verified renders before encoding.' }
$reviewRoot = Join-Path $filmRoot 'opaque-review-mp4'
New-Item -ItemType Directory -Path $reviewRoot -Force | Out-Null
$reviewReceipts = @()
if ($PortraitOnly) { $reviewReceipts = @(Get-Content -LiteralPath (Join-Path $reviewRoot 'encode-receipt.json') -Raw | ConvertFrom-Json | Where-Object name -Like '*16x9') }
if ($OnlyName) { $reviewReceipts = @(Get-Content -LiteralPath (Join-Path $reviewRoot 'encode-receipt.json') -Raw | ConvertFrom-Json | Where-Object name -NE $OnlyName) }
foreach ($filmResult in $renderReceipt.films) {
    if ($PortraitOnly -and $filmResult.name -notlike '*9x16') { continue }
    if ($OnlyName -and $filmResult.name -ne $OnlyName) { continue }
    if ($filmResult.frames -ne 540 -or $filmResult.errors.Count -ne 0 -or -not $filmResult.deterministic) { throw 'Render receipt is incomplete.' }
    $frameRoot = Join-Path (Join-Path $filmRoot 'rgba-frames') $filmResult.name
    $frameCount = @(Get-ChildItem -LiteralPath $frameRoot -Filter 'frame_*.png').Count
    if ($frameCount -ne 540) { throw "Unexpected PNG frame count: $frameCount" }
    $reviewPath = Join-Path $reviewRoot ($filmResult.name + '-opaque-navy-review.mp4')
    $frameSize = "$($filmResult.width)x$($filmResult.height)"
    & ffmpeg -hide_banner -loglevel error -y -f lavfi -i "color=c=0x03172e:s=${frameSize}:r=30:d=18" -framerate 30 -i (Join-Path $frameRoot 'frame_%04d.png') -filter_complex '[0:v][1:v]overlay=shortest=1:format=auto,format=yuv420p[v]' -map '[v]' -c:v libx264 -threads 2 -preset medium -crf 18 -frames:v 540 -an -movflags +faststart $reviewPath
    if ($LASTEXITCODE -ne 0) { throw 'MP4 encoding failed.' }
    $probeJson = & ffprobe -v error -show_entries 'format=duration,size:stream=codec_name,width,height,r_frame_rate,nb_frames' -of json $reviewPath
    if ($LASTEXITCODE -ne 0) { throw 'MP4 probe failed.' }
    $probe = $probeJson | ConvertFrom-Json
    $video = $probe.streams | Where-Object codec_name -eq 'h264'
    if ($video.nb_frames -ne '540' -or $video.r_frame_rate -ne '30/1' -or $video.width -ne $filmResult.width -or $video.height -ne $filmResult.height -or [math]::Abs([double]$probe.format.duration - 18) -gt 0.04) { throw 'Encoded MP4 contract failed.' }
    & ffmpeg -hide_banner -loglevel error -i $reviewPath -f null -
    if ($LASTEXITCODE -ne 0) { throw 'Full MP4 decode failed.' }
    $reviewReceipts += [pscustomobject]@{name=$filmResult.name;path=$reviewPath;alpha=$false;audio='silent review';probe=$probe;sha256=(Get-FileHash -LiteralPath $reviewPath).Hash;verifiedUtc=[datetime]::UtcNow.ToString('o')}
    $reviewReceipts | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $reviewRoot 'encode-receipt.json')
    Write-Output "Verified $($filmResult.name): 540 frames, 18 seconds, opaque navy review."
}
