[CmdletBinding()]
param(
    [string]$OutputRoot = (Join-Path (Split-Path -Parent $PSScriptRoot) 'deliverables')
)

$ErrorActionPreference = 'Stop'
$SourceRoot = (Resolve-Path -LiteralPath $PSScriptRoot).Path
$ProjectRoot = (Resolve-Path -LiteralPath (Split-Path -Parent $SourceRoot)).Path
$OutputRoot = [System.IO.Path]::GetFullPath($OutputRoot)
$RenderRoot = Join-Path $OutputRoot 'page-renders'
$PdfPath = Join-Path $OutputRoot 'NKCDC-Phase-Two-Growth-Strategy.pdf'
$HtmlPath = Join-Path $SourceRoot 'index.html'

$chromeCandidates = @(
    'C:\Program Files\Google\Chrome\Application\chrome.exe',
    'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe'
)
$Chrome = $chromeCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
if (-not $Chrome) { throw 'Google Chrome was not found.' }

$PdfToPpm = 'C:\Users\dillo\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\poppler\Library\bin\pdftoppm.exe'
if (-not (Test-Path -LiteralPath $PdfToPpm)) {
    $PdfToPpm = (Get-Command pdftoppm.exe -ErrorAction SilentlyContinue).Source
}
if (-not $PdfToPpm) { throw 'pdftoppm was not found in the Codex runtime.' }

New-Item -ItemType Directory -Path $OutputRoot -Force | Out-Null
New-Item -ItemType Directory -Path $RenderRoot -Force | Out-Null
Get-ChildItem -LiteralPath $RenderRoot -Filter 'page-*.png' -File -ErrorAction SilentlyContinue | Remove-Item -Force

$ProfileRoot = Join-Path $ProjectRoot '.build\chrome-profile'
$fullProfile = [System.IO.Path]::GetFullPath($ProfileRoot)
if (-not $fullProfile.StartsWith($ProjectRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw 'Refusing to manage a Chrome build profile outside the project root.'
}
if (Test-Path -LiteralPath $fullProfile) { Remove-Item -LiteralPath $fullProfile -Recurse -Force }
New-Item -ItemType Directory -Path $fullProfile -Force | Out-Null

$HtmlUri = ([System.Uri]$HtmlPath).AbsoluteUri
$chromeArgs = @(
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    "--user-data-dir=$fullProfile",
    '--print-to-pdf-no-header',
    "--print-to-pdf=$PdfPath",
    $HtmlUri
)

$process = Start-Process -FilePath $Chrome -ArgumentList $chromeArgs -PassThru -Wait -WindowStyle Hidden
if ($process.ExitCode -ne 0 -or -not (Test-Path -LiteralPath $PdfPath)) {
    throw "Chrome PDF export failed with exit code $($process.ExitCode)."
}

& $PdfToPpm -png -r 144 $PdfPath (Join-Path $RenderRoot 'page')
if ($LASTEXITCODE -ne 0) { throw "Page rendering failed with exit code $LASTEXITCODE." }

$renders = @(Get-ChildItem -LiteralPath $RenderRoot -Filter 'page-*.png' -File | Sort-Object Name)
if ($renders.Count -ne 8) { throw "Expected 8 page renders; found $($renders.Count)." }

[pscustomobject]@{
    pdf = $PdfPath
    pages = $renders.Count
    renders = $RenderRoot
    chrome = $Chrome
} | ConvertTo-Json -Depth 3
