<#
  Export a .pptx to PDF using the installed desktop PowerPoint (COM), with no window so
  nothing steals focus. There is no LibreOffice on this host.

    pwsh -File to-pdf.ps1 -Pptx .\deck.pptx [-OutPath .\deck.pdf]
#>
param(
  [Parameter(Mandatory = $true)][string]$Pptx,
  [string]$OutPath
)

$ErrorActionPreference = "Stop"
$Pptx = (Resolve-Path $Pptx).Path
if (-not $OutPath) { $OutPath = [IO.Path]::ChangeExtension($Pptx, ".pdf") }
$OutPath = [IO.Path]::GetFullPath($OutPath)

$app = $null; $pres = $null
try {
  $app = New-Object -ComObject PowerPoint.Application
  # COM wants MsoTriState (-1 / 0), not PowerShell booleans. WithWindow:=msoFalse keeps
  # PowerPoint from taking focus; a few builds refuse it, so fall back to minimized.
  $msoTrue = -1; $msoFalse = 0
  try { $pres = $app.Presentations.Open($Pptx, $msoFalse, $msoFalse, $msoFalse) }
  catch { $app.WindowState = 2; $pres = $app.Presentations.Open($Pptx, $msoFalse, $msoFalse, $msoTrue) }

  # ppSaveAsPDF = 32. SaveAs rather than ExportAsFixedFormat, whose optional COM
  # parameters PowerShell fails to bind ("cannot convert the 2 value of type int").
  $pres.SaveAs($OutPath, 32)
  $size = [math]::Round((Get-Item $OutPath).Length / 1KB)
  Write-Output "Exported $($pres.Slides.Count) slides to $OutPath (${size} KB)"
}
finally {
  if ($pres) { $pres.Close() | Out-Null }
  if ($app)  { $app.Quit()   | Out-Null }
  [System.Runtime.InteropServices.Marshal]::ReleaseComObject($app) | Out-Null 2>$null
  [GC]::Collect()
}
