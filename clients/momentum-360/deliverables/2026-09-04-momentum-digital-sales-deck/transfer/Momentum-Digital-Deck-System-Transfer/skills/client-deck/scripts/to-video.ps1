<#
  Render an animated .pptx to MP4 using desktop PowerPoint, with no window.

  Useful two ways: as proof the choreography actually plays, and as a shareable
  asset for social, email or a landing page.

    pwsh -File to-video.ps1 -Pptx .\deck.pptx [-OutPath .\deck.mp4] [-Seconds 2.5] [-Height 1080]
#>
param(
  [Parameter(Mandatory = $true)][string]$Pptx,
  [string]$OutPath,
  [double]$Seconds = 2.5,
  [int]$Height = 1080,
  [int]$Fps = 30
)

$ErrorActionPreference = "Stop"
$Pptx = (Resolve-Path $Pptx).Path
if (-not $OutPath) { $OutPath = [IO.Path]::ChangeExtension($Pptx, ".mp4") }
$OutPath = [IO.Path]::GetFullPath($OutPath)
if (Test-Path $OutPath) { Remove-Item $OutPath -Force }

$app = $null; $pres = $null
try {
  $app = New-Object -ComObject PowerPoint.Application
  try { $pres = $app.Presentations.Open($Pptx, 0, 0, 0) }
  catch { $app.WindowState = 2; $pres = $app.Presentations.Open($Pptx, 0, 0, -1) }

  # UseTimingsAndNarrations = false, so every slide gets DefaultSlideDuration and the
  # entrance animations still play inside it.
  $pres.CreateVideo($OutPath, $false, $Seconds, $Height, $Fps, 85)

  # ppMediaTaskStatusDone = 3, ppMediaTaskStatusFailed = 4
  $waited = 0
  while ($true) {
    $status = [int]$pres.CreateVideoStatus
    if ($status -eq 3) { break }
    if ($status -eq 4) { throw "PowerPoint reported the video export failed." }
    Start-Sleep -Milliseconds 1000
    $waited += 1
    if ($waited -gt 900) { throw "Video export timed out after 15 minutes." }
  }
  $size = [math]::Round((Get-Item $OutPath).Length / 1MB, 1)
  Write-Output "Rendered $($pres.Slides.Count) slides to $OutPath (${size} MB, ${Height}p, ${Fps}fps)"
}
finally {
  if ($pres) { try { $pres.Close() } catch {} }
  if ($app)  { try { $app.Quit() }  catch {} }
  [System.Runtime.InteropServices.Marshal]::ReleaseComObject($app) | Out-Null 2>$null
  [GC]::Collect()
}
