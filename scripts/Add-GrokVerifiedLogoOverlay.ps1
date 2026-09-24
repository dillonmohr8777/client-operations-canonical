[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [ValidateScript({ Test-Path -LiteralPath $_ -PathType Leaf })]
    [string]$InputVideo,

    [Parameter(Mandatory)]
    [ValidateScript({ Test-Path -LiteralPath $_ -PathType Leaf })]
    [string]$VerifiedLogo,

    [Parameter(Mandatory)]
    [string]$OutputVideo,

    [ValidateSet("bottom-right", "bottom-left", "top-right", "top-left")]
    [string]$Position = "bottom-right",

    [ValidateRange(80, 1200)]
    [int]$LogoWidth = 270,

    [ValidateRange(0, 200)]
    [int]$EdgeMargin = 24,

    [ValidateRange(0, 120)]
    [int]$PanelPaddingX = 24,

    [ValidateRange(0, 120)]
    [int]$PanelPaddingY = 18,

    [string]$FfmpegPath
)

$ErrorActionPreference = "Stop"

$inputPath = (Resolve-Path -LiteralPath $InputVideo).Path
$logoPath = (Resolve-Path -LiteralPath $VerifiedLogo).Path
$outputPath = [IO.Path]::GetFullPath($OutputVideo)
$outputParent = Split-Path -Parent $outputPath

if (-not (Test-Path -LiteralPath $outputParent -PathType Container)) {
    New-Item -ItemType Directory -Force -Path $outputParent | Out-Null
}

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
    throw "ffprobe was not found beside ffmpeg at $ffprobePath."
}

$logoDimensions = (& $ffprobePath -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 $logoPath).Trim()
if ($logoDimensions -notmatch "^(\d+)x(\d+)$") {
    throw "Could not read logo dimensions from $logoPath."
}

$sourceLogoWidth = [int]$Matches[1]
$sourceLogoHeight = [int]$Matches[2]
$scaledLogoHeight = [Math]::Max(1, [Math]::Round($LogoWidth * $sourceLogoHeight / $sourceLogoWidth))
$panelWidth = $LogoWidth + ($PanelPaddingX * 2)
$panelHeight = $scaledLogoHeight + ($PanelPaddingY * 2)

$placement = switch ($Position) {
    "bottom-right" {
        @{
            BoxX = "iw-$panelWidth-$EdgeMargin"
            BoxY = "ih-$panelHeight-$EdgeMargin"
            LogoX = "W-w-$EdgeMargin-$PanelPaddingX"
            LogoY = "H-h-$EdgeMargin-$PanelPaddingY"
        }
    }
    "bottom-left" {
        @{
            BoxX = "$EdgeMargin"
            BoxY = "ih-$panelHeight-$EdgeMargin"
            LogoX = "$($EdgeMargin + $PanelPaddingX)"
            LogoY = "H-h-$EdgeMargin-$PanelPaddingY"
        }
    }
    "top-right" {
        @{
            BoxX = "iw-$panelWidth-$EdgeMargin"
            BoxY = "$EdgeMargin"
            LogoX = "W-w-$EdgeMargin-$PanelPaddingX"
            LogoY = "$($EdgeMargin + $PanelPaddingY)"
        }
    }
    "top-left" {
        @{
            BoxX = "$EdgeMargin"
            BoxY = "$EdgeMargin"
            LogoX = "$($EdgeMargin + $PanelPaddingX)"
            LogoY = "$($EdgeMargin + $PanelPaddingY)"
        }
    }
}

$filter = "[0:v:0]drawbox=x=$($placement.BoxX):y=$($placement.BoxY):w=${panelWidth}:h=${panelHeight}:color=white@0.92:t=fill[panel];[1:v]scale=${LogoWidth}:${scaledLogoHeight}:flags=lanczos[logo];[panel][logo]overlay=x=$($placement.LogoX):y=$($placement.LogoY):format=auto[v]"

& $resolvedFfmpeg `
    -hide_banner `
    -loglevel error `
    -y `
    -i $inputPath `
    -i $logoPath `
    -filter_complex $filter `
    -map "[v]" `
    -map "0:a?" `
    -c:v libx264 `
    -preset medium `
    -crf 17 `
    -pix_fmt yuv420p `
    -c:a copy `
    -movflags +faststart `
    $outputPath

if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $outputPath -PathType Leaf)) {
    throw "Logo overlay failed for $inputPath."
}

Get-Item -LiteralPath $outputPath
