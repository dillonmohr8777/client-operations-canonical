param([ValidateSet('A','B')][string]$Film)
. C:\Users\dillo\.codex\terminal-bootstrap.ps1
$root=$PSScriptRoot
$old=@{A='momentum-your-next-chapter-1080p.mp4';B='momentum-meet-your-next-team-1080p.mp4'}
$out=@{A='book-before-after.mp4';B='team-before-after.mp4'}
& ffmpeg -hide_banner -loglevel error -y -i (Join-Path (Split-Path $root) $old[$Film]) -framerate 30 -i (Join-Path $root "$Film-after-full\f%05d.png") -i (Join-Path $root "$Film-score.wav") -filter_complex '[0:v]scale=960:540,setsar=1[l];[1:v]scale=960:540,setsar=1[r];[l][r]hstack=inputs=2[v]' -map '[v]' -map 2:a -t 6 -c:v libx264 -threads 2 -crf 22 -pix_fmt yuv420p -af 'loudnorm=I=-20:TP=-2:LRA=7' -c:a aac -b:a 192k -movflags +faststart (Join-Path $root $out[$Film])
if($LASTEXITCODE -ne 0){throw 'Comparison encode failed'}
Get-Item -LiteralPath (Join-Path $root $out[$Film]) | Select-Object Name,Length
