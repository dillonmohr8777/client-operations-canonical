[CmdletBinding()]
param(
    [string]$InputPath = (Join-Path $PSScriptRoot '..\output\momentum-360-need-momentum-snow-logo.mp4')
)

$ErrorActionPreference = 'Stop'

$resolvedInput = (Resolve-Path -LiteralPath $InputPath).Path
$deliverableRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$verificationRoot = Join-Path $deliverableRoot 'verification'
New-Item -ItemType Directory -Path $verificationRoot -Force | Out-Null

foreach ($commandName in @('ffprobe', 'ffmpeg')) {
    if (-not (Get-Command $commandName -ErrorAction SilentlyContinue)) {
        throw "$commandName is required for video verification."
    }
}

$probeJson = & ffprobe -v error `
    -show_entries 'format=duration,format_name:stream=index,codec_type,codec_name,width,height,r_frame_rate,avg_frame_rate,sample_rate,channels' `
    -of json `
    $resolvedInput
if ($LASTEXITCODE -ne 0) {
    throw "ffprobe failed for $resolvedInput"
}

$probe = $probeJson | ConvertFrom-Json
$video = @($probe.streams | Where-Object codec_type -eq 'video') | Select-Object -First 1
$audio = @($probe.streams | Where-Object codec_type -eq 'audio') | Select-Object -First 1

if ($null -eq $video) {
    throw 'No video stream was found.'
}
if ($null -eq $audio) {
    throw 'No audio stream was found.'
}

function Convert-RationalToDouble {
    param([string]$Value)

    if ($Value -notmatch '^(-?\d+(?:\.\d+)?)/(\d+(?:\.\d+)?)$') {
        return [double]$Value
    }

    $denominator = [double]$Matches[2]
    if ($denominator -eq 0) {
        return 0
    }

    return [double]$Matches[1] / $denominator
}

$duration = [math]::Round([double]$probe.format.duration, 3)
$fps = [math]::Round((Convert-RationalToDouble ([string]$video.avg_frame_rate)), 3)
$checks = [ordered]@{
    width1920 = [int]$video.width -eq 1920
    height1080 = [int]$video.height -eq 1080
    fps30 = [math]::Abs($fps - 30) -lt 0.01
    durationNear21Seconds = $duration -ge 19.5 -and $duration -le 22.5
    h264Video = [string]$video.codec_name -eq 'h264'
    aacAudio = [string]$audio.codec_name -eq 'aac'
}

$contactSheet = Join-Path $verificationRoot 'final-contact-sheet.jpg'
& ffmpeg -hide_banner -loglevel error -y `
    -i $resolvedInput `
    -vf 'fps=1,scale=480:270:force_original_aspect_ratio=decrease,pad=480:270:(ow-iw)/2:(oh-ih)/2:black,tile=5x5:padding=4:margin=4' `
    -frames:v 1 `
    $contactSheet
if ($LASTEXITCODE -ne 0) {
    throw 'Contact-sheet generation failed.'
}

$report = [ordered]@{
    verifiedAtUtc = [DateTimeOffset]::UtcNow.ToString('o')
    input = $resolvedInput
    durationSeconds = $duration
    width = [int]$video.width
    height = [int]$video.height
    fps = $fps
    videoCodec = [string]$video.codec_name
    audioCodec = [string]$audio.codec_name
    audioChannels = [int]$audio.channels
    contactSheet = $contactSheet
    checks = $checks
    deterministicChecksPassed = -not ($checks.Values -contains $false)
    visualReviewRequired = $true
}

$reportPath = Join-Path $verificationRoot 'qa-report.json'
$report | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $reportPath -Encoding utf8
$report | ConvertTo-Json -Depth 6

if (-not $report.deterministicChecksPassed) {
    exit 1
}
