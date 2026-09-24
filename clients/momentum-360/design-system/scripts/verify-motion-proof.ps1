param([switch]$SkipExport)
$ErrorActionPreference = 'Stop'
$bootstrap = Join-Path ([Environment]::GetFolderPath('UserProfile')) '.codex\terminal-bootstrap.ps1'
if (Test-Path -LiteralPath $bootstrap) { . $bootstrap }
$watch = [Diagnostics.Stopwatch]::StartNew()
$root = Split-Path $PSScriptRoot -Parent
$out = Join-Path $root 'output\motion-proof'
$pptx = Join-Path $out 'momentum-digital-design-motion-proof.pptx'
$skill = if ($env:MOMENTUM_DECK_SKILL_ROOT) { $env:MOMENTUM_DECK_SKILL_ROOT } else { Join-Path ([Environment]::GetFolderPath('UserProfile')) '.claude\skills\client-deck' }
Add-Type -AssemblyName System.IO.Compression.FileSystem
function Read-Slides([string]$File) {
  $zip = [IO.Compression.ZipFile]::OpenRead($File)
  try {
    $result = @{}
    foreach ($entry in $zip.Entries) {
      if ($entry.FullName -match '^ppt/slides/slide(\d+)\.xml$') {
        $reader = [IO.StreamReader]::new($entry.Open())
        try { $result[$entry.FullName] = $reader.ReadToEnd() } finally { $reader.Dispose() }
      }
    }
    return $result
  } finally { $zip.Dispose() }
}
$original = Read-Slides $pptx
$diagnostics = Join-Path $out 'diagnostics'
$null = New-Item -ItemType Directory -Force -Path $diagnostics
$copy = Join-Path $diagnostics 'idempotence-copy.pptx'
& python (Join-Path $skill 'scripts\choreograph.py') $pptx --out $copy --style subtle --json
if ($LASTEXITCODE -ne 0) { throw 'Idempotence choreography failed.' }
& python (Join-Path $skill 'scripts\choreograph.py') $copy --style subtle --json
if ($LASTEXITCODE -ne 0) { throw 'Second idempotence choreography failed.' }
$repeated = Read-Slides $copy
$idempotent = $original.Count -eq $repeated.Count
foreach ($key in $original.Keys) { if ($original[$key] -cne $repeated[$key]) { $idempotent = $false } }
if (-not $idempotent) { throw 'Reapplying motion changed slide XML.' }
function Get-ZipContentHashes([string]$File) {
  $zip = [IO.Compression.ZipFile]::OpenRead($File)
  $sha = [Security.Cryptography.SHA256]::Create()
  try {
    $hashes = @{}
    foreach ($entry in $zip.Entries) {
      $stream = $entry.Open()
      try { $hashes[$entry.FullName] = [BitConverter]::ToString($sha.ComputeHash($stream)) } finally { $stream.Dispose() }
    }
    return $hashes
  } finally { $zip.Dispose(); $sha.Dispose() }
}
$originalHashes = Get-ZipContentHashes $pptx
$repeatedHashes = Get-ZipContentHashes $copy
if ($originalHashes.Count -ne $repeatedHashes.Count) { throw 'Reapplication changed package entry count.' }
foreach ($key in $originalHashes.Keys) {
  if ($originalHashes[$key] -cne $repeatedHashes[$key]) { throw "Reapplication changed package contents: $key" }
}
$zip = [IO.Compression.ZipFile]::OpenRead($pptx)
$notesWithSources = 0
try {
  foreach ($entry in $zip.Entries) {
    if ($entry.FullName -match '^ppt/notesSlides/notesSlide\d+\.xml$') {
      $reader = [IO.StreamReader]::new($entry.Open())
      try { $raw = $reader.ReadToEnd() } finally { $reader.Dispose() }
      if ($raw.Contains('[Sources]') -and $raw.Contains('[/Sources]')) { $notesWithSources++ }
    }
  }
} finally { $zip.Dispose() }
if ($notesWithSources -ne 8) { throw 'Every slide must carry source notes.' }
$xmlSlides = @()
foreach ($key in ($original.Keys | Sort-Object { [int]([regex]::Match($_, 'slide(\d+)').Groups[1].Value) })) {
  [xml]$doc = $original[$key]
  $ns = [Xml.XmlNamespaceManager]::new($doc.NameTable)
  $ns.AddNamespace('p', 'http://schemas.openxmlformats.org/presentationml/2006/main')
  $ns.AddNamespace('a', 'http://schemas.openxmlformats.org/drawingml/2006/main')
  $transitions = $doc.SelectNodes('/p:sld/p:transition', $ns)
  $timings = $doc.SelectNodes('/p:sld/p:timing', $ns)
  if ($transitions.Count -ne 1 -or $timings.Count -ne 1) { throw "Missing or duplicate motion: $key" }
  if (-not $doc.SelectSingleNode('/p:sld/p:transition/p:fade', $ns)) { throw "Non-fade transition: $key" }
  $roles = @{}
  foreach ($node in $doc.SelectNodes('//p:cNvPr', $ns)) {
    if ($roles.ContainsKey($node.id)) { throw "Duplicate shape id: $key / $($node.id)" }
    $roles[$node.id] = $node.name
  }
  $staticIds = @($roles.Keys | Where-Object { $roles[$_] -in @('role:foot', 'role:static') })
  $targets = @($doc.SelectNodes('//p:timing//p:spTgt', $ns) | ForEach-Object { $_.spid } | Sort-Object -Unique)
  if (@($staticIds | Where-Object { $_ -in $targets }).Count) { throw "Static footer animated: $key" }
  $effects = @($doc.SelectNodes('//p:cTn[@presetClass="entr"]', $ns))
  $maxMs = 0
  foreach ($effect in $effects) {
    $delay = [int]$effect.SelectSingleNode('p:stCondLst/p:cond', $ns).delay
    $duration = ($effect.SelectNodes('.//p:cTn[@dur]', $ns) | ForEach-Object { [int]$_.dur } | Measure-Object -Maximum).Maximum
    $maxMs = [math]::Max($maxMs, $delay + $duration)
  }
  if ($maxMs -gt 2000) { throw "Animation exceeds 2 seconds: $key" }
  $xmlSlides += [ordered]@{ slide = $key; effects = $effects.Count; transition = 'fade'; staticShapes = $staticIds.Count; animatedStaticShapes = 0; envelopeMs = $maxMs; editableTextShapes = $doc.SelectNodes('//p:sp[p:txBody]', $ns).Count; nativeTables = $doc.SelectNodes('//a:tbl', $ns).Count; scaleBehaviors = $doc.SelectNodes('//p:animScale', $ns).Count; translateBehaviors = $doc.SelectNodes('//p:anim', $ns).Count; filters = @($doc.SelectNodes('//p:animEffect', $ns) | ForEach-Object { $_.filter } | Sort-Object -Unique) }
}
$app = $null; $pres = $null; $comSlides = @()
try {
  $app = New-Object -ComObject PowerPoint.Application
  # No visible fallback: this proof must open and inspect without any window.
  $pres = $app.Presentations.Open($pptx, -1, 0, 0)
  if ($app.Windows.Count -ne 0) { throw 'Unexpected visible PowerPoint window.' }
  foreach ($slide in $pres.Slides) {
    $effects = @()
    foreach ($effect in $slide.TimeLine.MainSequence) {
      if ($effect.Shape.Name -in @('role:foot', 'role:static')) { throw 'PowerPoint timeline animates static furniture.' }
      $effects += [ordered]@{ shape = $effect.Shape.Name; type = [int]$effect.EffectType; durationSeconds = [double]$effect.Timing.Duration; delaySeconds = [double]$effect.Timing.TriggerDelayTime; triggerType = [int]$effect.Timing.TriggerType }
    }
    $comSlides += [ordered]@{ number = $slide.SlideIndex; shapeCount = $slide.Shapes.Count; effects = $effects; transitionEffect = [int]$slide.SlideShowTransition.EntryEffect }
  }
  if ($comSlides.Count -ne 8) { throw 'PowerPoint did not open all 8 slides.' }
  if (@($comSlides.effects.type | Sort-Object -Unique).Count -lt 3) { throw 'PowerPoint did not expose distinct role effect types.' }
  if (@($comSlides.effects).Count -ne ($xmlSlides.effects | Measure-Object -Sum).Sum) { throw 'PowerPoint effect count differs from XML.' }
  if (@($comSlides | Where-Object { $_.transitionEffect -eq 0 }).Count) { throw 'PowerPoint reports a missing transition.' }
  $pres.Close() | Out-Null
  $pres = $app.Presentations.Open($copy, -1, 0, 0)
  if ($app.Windows.Count -ne 0 -or $pres.Slides.Count -ne $comSlides.Count) { throw 'Reapplied deck failed hidden PowerPoint opening.' }
  foreach ($slide in $pres.Slides) {
    $expected = $comSlides[$slide.SlideIndex - 1]
    if ($slide.Shapes.Count -ne $expected.shapeCount -or $slide.TimeLine.MainSequence.Count -ne $expected.effects.Count) { throw 'Reapplied deck changed PowerPoint shapes or effect count.' }
  }
} finally {
  if ($pres) { $pres.Close() | Out-Null }
  if ($app) { $app.Quit() | Out-Null; [Runtime.InteropServices.Marshal]::ReleaseComObject($app) | Out-Null }
  [GC]::Collect()
}
if (-not $SkipExport) {
  & (Join-Path $skill 'scripts\to-pdf.ps1') -Pptx $pptx
  & (Join-Path $skill 'scripts\render-qa.ps1') -Pptx $pptx -OutDir (Join-Path $out 'slides') -Width 1600
}
$png = @(Get-ChildItem -LiteralPath (Join-Path $out 'slides') -Filter '*.PNG')
if ($png.Count -ne 8) { throw 'Not every slide has a PNG review export.' }
$receipt = [ordered]@{
  verifiedAt = [DateTime]::UtcNow.ToString('o'); pptx = $pptx; sha256 = (Get-FileHash -LiteralPath $pptx -Algorithm SHA256).Hash;
  powerpointOpenedHidden = $true; idempotentSlideXml = $idempotent; idempotentPackageContents = $true; reapplications = 2; reappliedPowerpointOpenedHidden = $true; slideCount = $comSlides.Count;
  effects = ($xmlSlides.effects | Measure-Object -Sum).Sum; maximumEnvelopeMs = ($xmlSlides.envelopeMs | Measure-Object -Maximum).Maximum;
  nativeTextShapes = ($xmlSlides.editableTextShapes | Measure-Object -Sum).Sum; nativeTables = ($xmlSlides.nativeTables | Measure-Object -Sum).Sum;
  staticShapes = ($xmlSlides.staticShapes | Measure-Object -Sum).Sum; animatedStaticShapes = 0;
  effectTypes = @($comSlides.effects.type | Sort-Object -Unique); pngCount = $png.Count; slidesWithSourceNotes = $notesWithSources;
  pdf = [IO.Path]::ChangeExtension($pptx, '.pdf'); xmlSlides = $xmlSlides; powerpointSlides = $comSlides;
  elapsedSeconds = [math]::Round($watch.Elapsed.TotalSeconds, 2);
  limitations = @('PDF and PNG exports are static and cannot prove motion playback.', 'Native timing and effect types were inspected in PowerPoint; no slide-show or MP4 playback was captured.', 'The proof demonstrates Momentum Digital / Need Momentum assets, not a Momentum 360 identity replacement.');
  warnings = @()
}
$receipt | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath (Join-Path $root 'evidence\motion-proof-verification.json') -Encoding utf8
[pscustomobject]$receipt | Select-Object verifiedAt,powerpointOpenedHidden,idempotentSlideXml,slideCount,effects,maximumEnvelopeMs,nativeTextShapes,nativeTables,staticShapes,animatedStaticShapes,effectTypes,pngCount,elapsedSeconds | ConvertTo-Json -Depth 4
