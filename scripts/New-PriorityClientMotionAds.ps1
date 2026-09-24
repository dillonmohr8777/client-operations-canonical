[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [ValidateScript({ Test-Path -LiteralPath $_ -PathType Leaf })]
    [string]$ManifestPath,

    [Parameter(Mandatory)]
    [string]$OutputRoot,

    [string]$FfmpegPath
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$manifest = Get-Content -Raw -LiteralPath $ManifestPath | ConvertFrom-Json
$outputRootPath = [IO.Path]::GetFullPath($OutputRoot)
$fontRegular = "C\:/Windows/Fonts/arial.ttf"
$fontBold = "C\:/Windows/Fonts/arialbd.ttf"

if (-not $FfmpegPath) {
    $ffmpegCommand = Get-Command ffmpeg -ErrorAction SilentlyContinue
    if (-not $ffmpegCommand) {
        throw "ffmpeg was not found. Pass -FfmpegPath with the exact executable path."
    }
    $FfmpegPath = $ffmpegCommand.Source
}

$resolvedFfmpeg = (Resolve-Path -LiteralPath $FfmpegPath).Path
$ffprobePath = Join-Path (Split-Path -Parent $resolvedFfmpeg) "ffprobe.exe"
if (-not (Test-Path -LiteralPath $ffprobePath -PathType Leaf)) {
    throw "ffprobe was not found beside ffmpeg."
}

New-Item -ItemType Directory -Force -Path $outputRootPath | Out-Null

$introSeconds = 1.2
$middleSeconds = 5.6
$outroSeconds = 1.2
$fps = [int]$manifest.format.fps
$middleFrames = [int]($middleSeconds * $fps)
$renderResults = [Collections.Generic.List[object]]::new()

function Resolve-RepoPath {
    param([string]$RelativePath)
    if ([string]::IsNullOrWhiteSpace($RelativePath)) {
        return $null
    }
    $candidate = Join-Path $repoRoot ($RelativePath -replace "/", "\")
    if (-not (Test-Path -LiteralPath $candidate -PathType Leaf)) {
        throw "Required asset is missing: $candidate"
    }
    return (Resolve-Path -LiteralPath $candidate).Path
}

function Invoke-Render {
    param(
        [string]$ReferencePath,
        [string]$LogoPath,
        [string]$OutputPath,
        [string]$Filter
    )

    & $resolvedFfmpeg `
        -hide_banner `
        -loglevel error `
        -y `
        -i $ReferencePath `
        -i $LogoPath `
        -filter_complex $Filter `
        -map "[out]" `
        -an `
        -c:v libx264 `
        -preset medium `
        -crf 20 `
        -pix_fmt yuv420p `
        -r $fps `
        -movflags +faststart `
        $OutputPath

    if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $OutputPath -PathType Leaf)) {
        throw "Render failed: $OutputPath"
    }
}

function Get-SharedSegments {
    param(
        [string]$Background,
        [string]$Accent
    )

    return @"
[1:v]format=rgba,split=3[logoA][logoB][logoC];
[logoA]scale=500:220:force_original_aspect_ratio=decrease[logoIntro];
[logoB]scale=250:92:force_original_aspect_ratio=decrease[logoMiddle];
[logoC]scale=500:220:force_original_aspect_ratio=decrease[logoOutro];
color=c=0x${Background}:s=720x1280:r=${fps}:d=$introSeconds[introBg];
[introBg]drawbox=x=60:y=470:w=600:h=340:color=white@0.96:t=fill[introCard];
[introCard][logoIntro]overlay=x=(W-w)/2:y=(H-h)/2:format=auto,fade=t=in:st=0:d=0.3,fade=t=out:st=0.9:d=0.3,scale=720:1280,setsar=1,format=yuv420p[intro];
color=c=0x${Background}:s=720x1280:r=${fps}:d=$outroSeconds[outroBg];
[outroBg]drawbox=x=60:y=470:w=600:h=340:color=white@0.96:t=fill[outroCard];
[outroCard][logoOutro]overlay=x=(W-w)/2:y=(H-h)/2:format=auto,fade=t=in:st=0:d=0.3,scale=720:1280,setsar=1,format=yuv420p[outro];
"@
}

foreach ($client in $manifest.clients) {
    $clientId = [string]$client.clientId
    $clientOutput = Join-Path $outputRootPath $clientId
    New-Item -ItemType Directory -Force -Path $clientOutput | Out-Null

    if ([string]$client.status -ne "ready") {
        $blockerPath = Join-Path $clientOutput "BLOCKED.txt"
        [IO.File]::WriteAllText(
            $blockerPath,
            "Render blocked for $($client.displayName).`r`n$($client.blocker)`r`nNo placeholder or generated logo was substituted.`r`n",
            [Text.UTF8Encoding]::new($false)
        )
        $renderResults.Add([pscustomobject]@{
            clientId = $clientId
            status = "blocked"
            blocker = [string]$client.blocker
            outputs = @()
        })
        continue
    }

    $logoPath = Resolve-RepoPath ([string]$client.logo)
    $references = @($client.references | ForEach-Object { Resolve-RepoPath ([string]$_) })
    $background = [string]$client.palette.background
    $accent = [string]$client.palette.accent
    $textColor = [string]$client.palette.text
    $headline = ([string]$client.headline).Replace("'", "").Replace(":", "\:")
    $subhead = ([string]$client.subhead).Replace("'", "").Replace(":", "\:")
    $shared = Get-SharedSegments -Background $background -Accent $accent
    $clientOutputs = [Collections.Generic.List[string]]::new()

    $scrollReference = $references[0]
    $scrollOutput = Join-Path $clientOutput "01-scroll-story.mp4"
    $scrollFilter = @"
$shared
[0:v]scale=900:1600:force_original_aspect_ratio=increase,crop=900:1600,
zoompan=z='min(1.0+0.0008*on,1.12)':x='iw/2-(iw/zoom/2)':y='(ih-ih/zoom)*(on/$middleFrames)':d=${middleFrames}:s=720x1280:fps=$fps,
eq=saturation=1.08:contrast=1.04,drawbox=x=0:y=0:w=iw:h=ih:color=black@0.18:t=fill,
drawbox=x=48:y=760:w=624:h=300:color=0x$Background@0.90:t=fill,
drawtext=fontfile='$fontBold':text='$headline':fontcolor=0x${textColor}:fontsize=42:x=(w-text_w)/2:y=820,
drawtext=fontfile='$fontRegular':text='$subhead':fontcolor=0x${textColor}:fontsize=26:x=(w-text_w)/2:y=900,
drawbox=x=210:y=1068:w=300:h=122:color=white@0.96:t=fill[scrollScene];
[scrollScene][logoMiddle]overlay=x=(W-w)/2:y=1083+(92-h)/2:format=auto,scale=720:1280,setsar=1,format=yuv420p[middle];
[intro][middle][outro]concat=n=3:v=1:a=0[out]
"@
    Invoke-Render -ReferencePath $scrollReference -LogoPath $logoPath -OutputPath $scrollOutput -Filter $scrollFilter
    $clientOutputs.Add($scrollOutput)

    $cardReference = if ($references.Count -gt 1) { $references[1] } else { $references[0] }
    $cardOutput = Join-Path $clientOutput "02-3d-card-motion.mp4"
    $cardFilter = @"
$shared
[0:v]format=rgba,split=2[cardBgSource][cardSource];
[cardBgSource]scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,gblur=sigma=32,
eq=brightness=-0.10:saturation=0.9,loop=loop=$($middleFrames - 1):size=1:start=0,setpts=N/($fps*TB)[cardBg];
[cardSource]scale=540:820:force_original_aspect_ratio=decrease,pad=590:890:(ow-iw)/2:(oh-ih)/2:color=white@0.95,
loop=loop=$($middleFrames - 1):size=1:start=0,setpts=N/($fps*TB),
rotate='0.035*sin(2*PI*t/5.6)':ow=rotw(iw):oh=roth(ih):c=none[card];
[cardBg][card]overlay=x=(W-w)/2:y=(H-h)/2-80+12*sin(2*PI*t/3.0):format=auto,
drawbox=x=48:y=880:w=624:h=190:color=0x$Background@0.92:t=fill,
drawtext=fontfile='$fontBold':text='$headline':fontcolor=0x${textColor}:fontsize=38:x=(w-text_w)/2:y=920,
drawtext=fontfile='$fontRegular':text='$subhead':fontcolor=0x${textColor}:fontsize=24:x=(w-text_w)/2:y=980,
drawbox=x=210:y=1080:w=300:h=122:color=white@0.96:t=fill[cardScene];
[cardScene][logoMiddle]overlay=x=(W-w)/2:y=1095+(92-h)/2:format=auto,scale=720:1280,setsar=1,format=yuv420p[middle];
[intro][middle][outro]concat=n=3:v=1:a=0[out]
"@
    Invoke-Render -ReferencePath $cardReference -LogoPath $logoPath -OutputPath $cardOutput -Filter $cardFilter
    $clientOutputs.Add($cardOutput)

    $kineticReference = $references[0]
    $kineticOutput = Join-Path $clientOutput "03-kinetic-social.mp4"
    $kineticFilter = @"
$shared
[0:v]scale=1000:1500:force_original_aspect_ratio=increase,crop=1000:1500,
zoompan=z='1.10':x='(iw-iw/zoom)/2+((iw-iw/zoom)/3)*sin(on/24)':y='(ih-ih/zoom)/2+((ih-ih/zoom)/5)*cos(on/30)':d=${middleFrames}:s=720x1280:fps=$fps,
eq=saturation=1.12:contrast=1.06,
drawbox=x=0:y=0:w=70:h=ih:color=0x$accent@0.94:t=fill,
drawbox=x=650:y=0:w=70:h=ih:color=0x$accent@0.94:t=fill,
drawbox=x=70:y=120:w=580:h=240:color=0x$Background@0.90:t=fill,
drawtext=fontfile='$fontBold':text='$headline':fontcolor=0x${textColor}:fontsize=40:x=(w-text_w)/2:y=180,
drawtext=fontfile='$fontRegular':text='$subhead':fontcolor=0x${textColor}:fontsize=25:x=(w-text_w)/2:y=250,
drawbox=x=210:y=1070:w=300:h=122:color=white@0.96:t=fill[kineticScene];
[kineticScene][logoMiddle]overlay=x=(W-w)/2:y=1085+(92-h)/2:format=auto,scale=720:1280,setsar=1,format=yuv420p[middle];
[intro][middle][outro]concat=n=3:v=1:a=0[out]
"@
    Invoke-Render -ReferencePath $kineticReference -LogoPath $logoPath -OutputPath $kineticOutput -Filter $kineticFilter
    $clientOutputs.Add($kineticOutput)

    $renderResults.Add([pscustomobject]@{
        clientId = $clientId
        status = "rendered"
        outputs = @($clientOutputs)
    })
}

$reportPath = Join-Path $outputRootPath "render-report.json"
$report = [pscustomobject]@{
    schemaVersion = 1
    batchId = [string]$manifest.batchId
    generatedAt = (Get-Date).ToString("o")
    results = @($renderResults)
}
[IO.File]::WriteAllText(
    $reportPath,
    ($report | ConvertTo-Json -Depth 8),
    [Text.UTF8Encoding]::new($false)
)

$report
