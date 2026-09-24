$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$audio = Join-Path $root 'episode-58-source.mp3'
$artwork = Join-Path $root 'podcast-artwork.jpg'
$logo = Join-Path $root 'bok-law-logo.png'
$output = Join-Path $root 'BOK-Episode-58-Child-Therapy-Social-Clip.mp4'

$filter = @'
color=c=#102c31:s=1080x1920:r=30:d=120[base];
[1:v]scale=860:860:force_original_aspect_ratio=decrease,pad=900:900:20:20:color=white,setsar=1[art];
[2:v]crop=1460:1460:25:0,scale=250:250:force_original_aspect_ratio=decrease,colorkey=0xffffff:0.10:0.02[logo];
[0:a]asplit=2[aout][awave];
[awave]showwaves=s=880x170:mode=cline:rate=30:colors=0x8fd7de|0xf7b5ce,format=rgba[wave];
[base][art]overlay=x=(W-w)/2:y=390:enable='between(t,0,120)'[v1];
[v1][logo]overlay=x=(W-w)/2:y=80:enable='between(t,0,120)'[v2];
[v2][wave]overlay=x=(W-w)/2:y=1370:enable='between(t,0,120)'[v3];
[v3]drawbox=x=70:y=310:w=940:h=10:color=0xf7b5ce:t=fill,
drawtext=fontfile='C\:/Windows/Fonts/segoeuib.ttf':text='WHEN SHOULD PARENTS':fontcolor=white:fontsize=62:x=(w-text_w)/2:y=1510,
drawtext=fontfile='C\:/Windows/Fonts/segoeuib.ttf':text='CONSIDER CHILD THERAPY?':fontcolor=0xf7b5ce:fontsize=62:x=(w-text_w)/2:y=1585,
drawtext=fontfile='C\:/Windows/Fonts/segoeui.ttf':text='EPISODE 58  |  DR. ALLYSON CASEY-JOVANOVICH':fontcolor=white:fontsize=31:x=(w-text_w)/2:y=1685,
drawtext=fontfile='C\:/Windows/Fonts/segoeuib.ttf':text='LISTEN NOW  •  DONUTS & DIVORCE':fontcolor=0x102c31:fontsize=38:x=(w-text_w)/2:y=1775:box=1:boxcolor=0x8fd7de:boxborderw=18,
drawtext=fontfile='C\:/Windows/Fonts/segoeui.ttf':text='General information only • Not legal advice':fontcolor=0xc5d7d9:fontsize=25:x=(w-text_w)/2:y=1870[vout];
[aout]highpass=f=70,lowpass=f=7800,acompressor=threshold=-20dB:ratio=2.5:attack=20:release=200:makeup=3,loudnorm=I=-16:TP=-1.5:LRA=7,afade=t=in:st=0:d=0.2,afade=t=out:st=119.4:d=0.6[audio]
'@

ffmpeg -hide_banner -y `
  -ss 00:09:42 -t 120 -i $audio `
  -loop 1 -t 120 -i $artwork `
  -loop 1 -t 120 -i $logo `
  -filter_complex $filter `
  -map '[vout]' -map '[audio]' `
  -c:v libx264 -preset medium -crf 19 -pix_fmt yuv420p -r 30 `
  -c:a aac -b:a 192k -movflags +faststart -shortest $output

if ($LASTEXITCODE -ne 0) { throw "ffmpeg render failed with exit code $LASTEXITCODE" }

ffprobe -v error -show_entries format=duration,size:stream=index,codec_name,width,height,r_frame_rate `
  -of json $output
