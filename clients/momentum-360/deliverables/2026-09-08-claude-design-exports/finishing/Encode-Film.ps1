param([ValidateSet('A','B','M')][string]$Film)
. C:\Users\dillo\.codex\terminal-bootstrap.ps1
$ErrorActionPreference='Stop'
$root=$PSScriptRoot
$names=@{A='momentum-your-next-chapter-finished-1080p';B='momentum-meet-your-next-team-finished-1080p';M='momentum-momo-finished-1080p'}
$expected=@{A=780;B=750;M=900}
$frames=Join-Path $root "$Film-after-full"
$receipt=Get-Content -LiteralPath (Join-Path $frames 'receipt.json') -Raw | ConvertFrom-Json
if($receipt.frames -ne $expected[$Film] -or $receipt.errors.Count -ne 0){throw 'Render receipt failed'}
$output=Join-Path $root ($names[$Film]+'.mp4')
& ffmpeg -hide_banner -loglevel error -y -framerate 30 -i (Join-Path $frames 'f%05d.png') -i (Join-Path $root "$Film-score.wav") -vf 'scale=1920:1080' -c:v libx264 -threads 2 -preset medium -crf 20 -pix_fmt yuv420p -af 'loudnorm=I=-20:TP=-2:LRA=7' -c:a aac -b:a 192k -ar 48000 -movflags +faststart -shortest $output
if($LASTEXITCODE -ne 0){throw 'Encode failed'}
& ffprobe -v error -show_entries 'format=duration,size:stream=codec_name,width,height,r_frame_rate,nb_frames' -of json $output | Set-Content -LiteralPath (Join-Path $root "$Film-encode-receipt.json")
& ffmpeg -hide_banner -loglevel error -y -i $output -vf 'fps=1/4,scale=480:270,tile=4x2' -frames:v 1 (Join-Path $root "$Film-final-contact.jpg")
Get-Item -LiteralPath $output | Select-Object Name,Length
