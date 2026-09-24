<#
  Render every slide of a .pptx to PNG using the installed desktop PowerPoint (COM).
  This host has no LibreOffice and no pdftoppm, so this is the visual-QA path.

    pwsh -File render-qa.ps1 -Pptx .\deck.pptx -OutDir .\tmp\render
#>
param(
  [Parameter(Mandatory = $true)][string]$Pptx,
  [string]$OutDir = "tmp/render",
  [int]$Width = 1600
)

$ErrorActionPreference = "Stop"
$Pptx = (Resolve-Path $Pptx).Path
$null = New-Item -ItemType Directory -Force -Path $OutDir
$OutDir = (Resolve-Path $OutDir).Path
Get-ChildItem -Path $OutDir -Filter "Slide*.PNG" -ErrorAction SilentlyContinue | Remove-Item -Force

$app = $null; $pres = $null
try {
  $app = New-Object -ComObject PowerPoint.Application
  # COM wants MsoTriState (-1 / 0), not PowerShell booleans, and PowerPoint refuses
  # WithWindow:=msoFalse on many builds — open with a window and minimize instead.
  $msoTrue = -1; $msoFalse = 0
  # WithWindow:=msoFalse keeps PowerPoint from stealing focus. Some builds refuse it, so
  # fall back to a minimized window.
  try { $pres = $app.Presentations.Open($Pptx, $msoFalse, $msoFalse, $msoFalse) }
  catch { $app.WindowState = 2; $pres = $app.Presentations.Open($Pptx, $msoFalse, $msoFalse, $msoTrue) }
  $h = [int]([math]::Round($Width * ($pres.PageSetup.SlideHeight / $pres.PageSetup.SlideWidth)))
  $pres.Export($OutDir, "PNG", $Width, $h)
  Write-Output "Exported $($pres.Slides.Count) slides at ${Width}x${h} to $OutDir"
}
finally {
  if ($pres) { $pres.Close() | Out-Null }
  if ($app)  { $app.Quit()   | Out-Null }
  [System.Runtime.InteropServices.Marshal]::ReleaseComObject($app) | Out-Null 2>$null
  [GC]::Collect()
}

Get-ChildItem -Path $OutDir -Filter "*.PNG" | Sort-Object Name | ForEach-Object { $_.FullName }
