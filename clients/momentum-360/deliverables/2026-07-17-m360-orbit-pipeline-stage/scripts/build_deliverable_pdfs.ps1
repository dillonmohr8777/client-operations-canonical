$ErrorActionPreference = 'Stop'

$workspace = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$sourceDir = Join-Path $workspace 'docs'
$outputDir = Join-Path $workspace 'artifacts\deliverable-pdfs'
$htmlDir = Join-Path $outputDir 'html'
$chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'

New-Item -ItemType Directory -Path $htmlDir -Force | Out-Null

$documents = @(
  @{ Source = 'BUSINESS_PLAN.md'; Output = 'M360-Orbit-Business-Plan.pdf'; Title = 'M360 Orbit Business Plan' },
  @{ Source = 'BRAND_GUIDELINES.md'; Output = 'M360-Orbit-Brand-Guidelines.pdf'; Title = 'M360 Orbit Brand Guidelines' },
  @{ Source = 'SALES_PLAYBOOK.md'; Output = 'M360-Orbit-Sales-Playbook.pdf'; Title = 'M360 Orbit Sales Playbook' },
  @{ Source = 'ACCESSIBILITY_AUDIT.md'; Output = 'M360-Orbit-Accessibility-Audit.pdf'; Title = 'M360 Orbit Accessibility Audit' },
  @{ Source = 'RELEASE_REPORT.md'; Output = 'M360-Orbit-Release-Report.pdf'; Title = 'M360 Orbit Release Report' }
)

$css = @'
@page { size: Letter; margin: 0.64in 0.68in 0.7in; }
:root { --navy:#071632; --night:#041027; --blue:#2f82ff; --gold:#d99016; --ink:#17233b; --muted:#53627a; --line:#d9e1ec; }
* { box-sizing: border-box; }
html { font-size: 10.5pt; }
body { margin:0; color:var(--ink); background:#fff; font-family: "Segoe UI", Arial, sans-serif; line-height:1.48; }
.masthead { display:flex; align-items:center; gap:12px; padding:0 0 14px; margin:0 0 22px; border-bottom:3px solid var(--gold); }
.masthead img { width:42px; height:42px; border-radius:50%; object-fit:cover; }
.masthead strong { color:var(--navy); font-size:14pt; letter-spacing:.06em; }
.masthead em { color:var(--gold); font-style:normal; }
.masthead small { display:block; margin-top:2px; color:var(--muted); font-size:7.5pt; letter-spacing:.16em; text-transform:uppercase; }
h1 { margin:.1in 0 .14in; color:var(--navy); font-size:25pt; line-height:1.08; letter-spacing:-.02em; }
h2 { margin:24px 0 8px; padding-bottom:4px; border-bottom:1px solid var(--line); color:var(--navy); font-size:16pt; line-height:1.18; page-break-after:avoid; }
h3 { margin:16px 0 5px; color:#173c70; font-size:12.5pt; page-break-after:avoid; }
p { margin:7px 0; }
ul, ol { margin:6px 0 10px 22px; padding:0; }
li { margin:3px 0; }
blockquote { margin:12px 0; padding:10px 14px; border-left:4px solid var(--gold); background:#fff8e8; color:#35425a; }
code { padding:1px 4px; border-radius:3px; background:#edf2f8; color:#173c70; font-family:Consolas, monospace; font-size:9pt; }
pre { padding:10px 12px; border-radius:6px; background:var(--night); color:#ecf4ff; white-space:pre-wrap; }
table { width:100%; margin:10px 0 14px; border-collapse:collapse; font-size:9pt; page-break-inside:avoid; }
th { padding:7px 8px; background:var(--navy); color:#fff; text-align:left; }
td { padding:6px 8px; border:1px solid var(--line); vertical-align:top; }
tr:nth-child(even) td { background:#f7f9fc; }
a { color:#155bb8; text-decoration:none; }
hr { border:0; border-top:1px solid var(--line); margin:18px 0; }
img { max-width:100%; }
.footer { margin-top:26px; padding-top:8px; border-top:1px solid var(--line); color:var(--muted); font-size:8pt; }
.page-break { break-before: page; }
'@

foreach ($document in $documents) {
  $sourcePath = Join-Path $sourceDir $document.Source
  $fragmentPath = Join-Path $htmlDir ($document.Source -replace '\.md$', '.fragment.html')
  $htmlPath = Join-Path $htmlDir ($document.Source -replace '\.md$', '.html')
  $pdfPath = Join-Path $outputDir $document.Output

  & npx.cmd --yes marked --gfm -i $sourcePath -o $fragmentPath
  if ($LASTEXITCODE -ne 0) { throw "Markdown conversion failed for $($document.Source)" }
  $fragment = Get-Content -LiteralPath $fragmentPath -Raw
  $html = @"
<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>$($document.Title)</title><style>$css</style></head>
<body>
  <div class="masthead"><img src="file:///$($workspace.Replace('\','/'))/site/assets/momentum-360-logo.png" alt="Momentum 360 logo"><div><strong>M360 <em>ORBIT</em></strong><small>Momentum 360 / Every angle. One next move.</small></div></div>
  $fragment
  <div class="footer">M360 Orbit by Momentum 360 · https://momentum-360-agents.netlify.app/</div>
</body></html>
"@
  Set-Content -LiteralPath $htmlPath -Value $html -Encoding utf8

  $profile = Join-Path $env:TEMP ("m360-pdf-" + [IO.Path]::GetRandomFileName())
  $arguments = @('--headless=new','--disable-gpu','--hide-scrollbars','--no-first-run',"--user-data-dir=$profile",'--no-pdf-header-footer',"--print-to-pdf=$pdfPath", "file:///$($htmlPath.Replace('\','/'))")
  Start-Process -FilePath $chrome -ArgumentList $arguments -Wait -WindowStyle Hidden
  if (-not (Test-Path -LiteralPath $pdfPath)) { throw "PDF export failed for $($document.Source)" }
  if ((Get-Item -LiteralPath $pdfPath).Length -lt 10000) { throw "PDF export is unexpectedly small for $($document.Source)" }
}

Get-ChildItem -LiteralPath $outputDir -Filter '*.pdf' | Select-Object Name, Length | Format-Table -AutoSize
