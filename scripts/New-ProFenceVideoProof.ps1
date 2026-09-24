[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[a-z0-9][a-z0-9-]{2,79}$')]
    [string]$BatchId
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version 2.0

$root = Split-Path -Parent $PSScriptRoot
$videoWorkRoot = [IO.Path]::GetFullPath((Join-Path $root 'work\video-factory'))
$batchRoot = [IO.Path]::GetFullPath((Join-Path $videoWorkRoot $BatchId))
$clientRoot = Join-Path $batchRoot 'pro-fence-deck'
$profilePath = Join-Path $root 'clients\pro-fence-deck\video-factory\profile.json'
$renderRoot = Join-Path $clientRoot 'renders'
$outputPath = Join-Path $renderRoot 'pro-fence-deck-stock-concept-NOT-FOR-PUBLISH.mp4'
$contactSheetPath = Join-Path $renderRoot 'pro-fence-deck-stock-concept-contact-sheet.jpg'
$metadataPath = Join-Path $renderRoot 'pro-fence-deck-stock-concept.metadata.json'
$filterPath = Join-Path $renderRoot 'pro-fence-deck-stock-concept.filter.txt'

if (-not $batchRoot.StartsWith(($videoWorkRoot.TrimEnd('\') + '\'), [StringComparison]::OrdinalIgnoreCase)) {
    throw 'Video batch path escapes the governed video work root.'
}
if (-not (Test-Path -LiteralPath $batchRoot -PathType Container)) {
    throw "Video batch does not exist: $BatchId"
}
if (-not (Test-Path -LiteralPath $profilePath -PathType Leaf)) {
    throw 'Pro Fence video profile is unavailable.'
}
if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
    throw 'FFmpeg is unavailable.'
}
if (-not (Get-Command ffprobe -ErrorAction SilentlyContinue)) {
    throw 'FFprobe is unavailable.'
}

$profile = Get-Content -LiteralPath $profilePath -Raw -Encoding UTF8 | ConvertFrom-Json
$sourceRoot = [IO.Path]::GetFullPath([string]$profile.sourcePolicy.localSourceRoot)
if (-not (Test-Path -LiteralPath $sourceRoot -PathType Container)) {
    throw "Pro Fence source repository is unavailable: $sourceRoot"
}
$manifestPath = Join-Path $sourceRoot ([string]$profile.sourcePolicy.sourceManifest)
$licensePath = Join-Path $sourceRoot ([string]$profile.sourcePolicy.licenseNotes)
if (-not (Test-Path -LiteralPath $manifestPath -PathType Leaf)) {
    throw 'Pro Fence source manifest is unavailable.'
}
if (-not (Test-Path -LiteralPath $licensePath -PathType Leaf)) {
    throw 'Pro Fence license notes are unavailable.'
}

$assets = @()
foreach ($relative in @($profile.proofStoryboard.assets)) {
    $asset = [IO.Path]::GetFullPath((Join-Path $sourceRoot ([string]$relative)))
    if (-not $asset.StartsWith(($sourceRoot.TrimEnd('\') + '\'), [StringComparison]::OrdinalIgnoreCase)) {
        throw "Storyboard asset escapes the approved source root: $relative"
    }
    if (-not (Test-Path -LiteralPath $asset -PathType Leaf)) {
        throw "Storyboard asset is unavailable: $asset"
    }
    $assets += $asset
}
if ($assets.Count -ne 12) {
    throw "Expected 12 proof assets, found $($assets.Count)."
}

New-Item -ItemType Directory -Path $renderRoot -Force | Out-Null

$inputArguments = @()
for ($index = 0; $index -lt $assets.Count; $index++) {
    $inputArguments += @('-loop', '1', '-t', '2.5', '-i', $assets[$index])
}

$filters = New-Object System.Collections.Generic.List[string]
for ($index = 0; $index -lt $assets.Count; $index++) {
    $direction = if ($index % 2 -eq 0) { "iw/2-(iw/zoom/2)" } else { "iw-(iw/zoom)" }
    $filters.Add(
        "[$index`:v]scale=1080:1920:force_original_aspect_ratio=increase," +
        "crop=1080:1920,trim=end_frame=1,setpts=PTS-STARTPTS," +
        "zoompan=z='min(zoom+0.0008,1.07)':x='$direction':" +
        "y='ih/2-(ih/zoom/2)':d=75:s=1080x1920:fps=30,setsar=1," +
        "fade=t=in:st=0:d=0.25,fade=t=out:st=2.25:d=0.25[v$index]"
    )
}
$concatInputs = (0..($assets.Count - 1) | ForEach-Object { "[v$_]" }) -join ''
$filters.Add(
    "$concatInputs" + "concat=n=$($assets.Count):v=1:a=0," +
    "scale=in_range=full:out_range=tv,format=yuv420p,setparams=range=tv[base]"
)

$fontFile = 'C\:/Windows/Fonts/arialbd.ttf'
$filters.Add(
    "[base]drawbox=x=0:y=0:w=iw:h=210:color=0x0E303A@0.78:t=fill," +
    "drawbox=x=0:y=h-120:w=iw:h=120:color=0x0E303A@0.82:t=fill[vbox]"
)

$overlaySequence = @($profile.proofStoryboard.overlaySequence)
$middleDot = [string][char]0x00B7
$windows = @(
    @(0, 4.8),
    @(4.8, 9.5),
    @(9.5, 14.2),
    @(14.2, 19.0),
    @(19.0, 24.2),
    @(24.2, 30.0)
)
$previous = 'vbox'
for ($index = 0; $index -lt $overlaySequence.Count; $index++) {
    $next = "text$index"
    $text = ([string]$overlaySequence[$index]).Replace($middleDot, '|').Replace('\', '\\').Replace(':', '\:').Replace("'", "\'")
    $start = [string]::Format([Globalization.CultureInfo]::InvariantCulture, '{0:0.0}', $windows[$index][0])
    $end = [string]::Format([Globalization.CultureInfo]::InvariantCulture, '{0:0.0}', $windows[$index][1])
    $filters.Add(
        "[$previous]drawtext=fontfile='$fontFile':text='$text':" +
        "fontcolor=white:fontsize=50:x=(w-text_w)/2:y=76:" +
        "enable='gte(t,$start)*lt(t,$end)'[$next]"
    )
    $previous = $next
}

$disclosure = ([string]$profile.proofStoryboard.visibleDisclosure).Replace($middleDot, '|').Replace(':', '\:').Replace("'", "\'")
$filters.Add(
    "[$previous]drawtext=fontfile='$fontFile':text='$disclosure':" +
    "fontcolor=white:fontsize=28:x=(w-text_w)/2:y=h-78[final]"
)
$filters -join ";`n" | Set-Content -LiteralPath $filterPath -Encoding ASCII

$arguments = @('-hide_banner', '-loglevel', 'warning', '-y')
$arguments += $inputArguments
$arguments += @(
    '-filter_complex_script', $filterPath,
    '-map', '[final]',
    '-an',
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-crf', '20',
    '-pix_fmt', 'yuv420p',
    '-r', '30',
    '-t', '30',
    '-movflags', '+faststart',
    $outputPath
)

& ffmpeg @arguments
if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $outputPath -PathType Leaf)) {
    throw 'FFmpeg failed to create the Pro Fence proof video.'
}

$probeRaw = & ffprobe -v error -show_entries format=duration,size,bit_rate -show_entries stream=width,height,r_frame_rate,codec_name -of json $outputPath
if ($LASTEXITCODE -ne 0) {
    throw 'FFprobe failed to inspect the Pro Fence proof video.'
}
$probe = $probeRaw -join "`n" | ConvertFrom-Json
$durationSeconds = [double]$probe.format.duration
if ($durationSeconds -lt 29.5 -or $durationSeconds -gt 30.5) {
    throw "Rendered proof duration is invalid: $durationSeconds seconds."
}
if ([int]$probe.streams[0].width -ne 1080 -or [int]$probe.streams[0].height -ne 1920) {
    throw 'Rendered proof dimensions are invalid.'
}

& ffmpeg -hide_banner -loglevel warning -y -i $outputPath `
    -vf "fps=1/5,scale=270:480,tile=3x2" -frames:v 1 -update 1 $contactSheetPath
if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $contactSheetPath -PathType Leaf)) {
    throw 'FFmpeg failed to create the Pro Fence proof contact sheet.'
}

$metadata = [pscustomobject][ordered]@{
    schemaVersion = 1
    batchId = $BatchId
    clientId = 'pro-fence-deck'
    productionState = 'draft-local'
    output = "work/video-factory/$BatchId/pro-fence-deck/renders/$([IO.Path]::GetFileName($outputPath))"
    contactSheet = "work/video-factory/$BatchId/pro-fence-deck/renders/$([IO.Path]::GetFileName($contactSheetPath))"
    sourceRepository = [string]$profile.sourcePolicy.sourceRepository
    sourceManifest = $manifestPath
    licenseNotes = $licensePath
    sourceAssets = @($assets)
    visibleDisclosure = [string]$profile.proofStoryboard.visibleDisclosure
    ffprobe = $probe
    sendApproved = $false
    publishApproved = $false
}
$metadata | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath $metadataPath -Encoding UTF8

[pscustomobject]@{
    status = 'rendered-local-proof'
    output = $outputPath
    contactSheet = $contactSheetPath
    durationSeconds = [math]::Round($durationSeconds, 2)
    width = [int]$probe.streams[0].width
    height = [int]$probe.streams[0].height
    bytes = [long]$probe.format.size
    disclosure = [string]$profile.proofStoryboard.visibleDisclosure
    publishApproved = $false
} | ConvertTo-Json -Depth 5
