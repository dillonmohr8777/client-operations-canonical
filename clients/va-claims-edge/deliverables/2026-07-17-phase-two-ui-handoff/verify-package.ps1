[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$required = @(
    'README.md',
    'design-system.md',
    'integration-map.md',
    'developer-checklist.md',
    'preflight-report.md',
    'obaid-handoff-draft.txt',
    'src/app/globals.css',
    'src/app/login/page.js',
    'src/app/dashboard/page.js',
    'src/app/components/AppShell.js',
    'public/va-claims-edge-logo.png',
    'public/shield-motion-ribbons.png',
    'preview/index.html',
    'preview/preview.js'
)

$assertions = 0
foreach ($relative in $required) {
    $path = Join-Path $root $relative
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { throw "Missing required file: $relative" }
    if ((Get-Item -LiteralPath $path).Length -lt 20) { throw "Required file is unexpectedly empty: $relative" }
    $assertions++
}

$css = Get-Content -LiteralPath (Join-Path $root 'src/app/globals.css') -Raw
foreach ($token in @('--vace-red','--vace-navy','prefers-reduced-motion','focus-visible')) {
    if ($css -notmatch [regex]::Escape($token)) { throw "Missing design-system requirement: $token" }
    $assertions++
}

$dashboard = Get-Content -LiteralPath (Join-Path $root 'src/app/dashboard/page.js') -Raw
foreach ($state in @('loading','ready','empty','error','Sample data')) {
    if ($dashboard -notmatch [regex]::Escape($state)) { throw "Missing dashboard state or label: $state" }
    $assertions++
}

$login = Get-Content -LiteralPath (Join-Path $root 'src/app/login/page.js') -Raw
if ($login -notmatch 'signInWithPassword') { throw 'Login adapter does not preserve the expected Supabase password-auth boundary.' }
$assertions++

$shell = Get-Content -LiteralPath (Join-Path $root 'src/app/components/AppShell.js') -Raw
foreach ($requirement in @('supabase.auth.signOut','router.replace("/login")','onSignOut','signingOut','signOutError')) {
    if ($shell -notmatch [regex]::Escape($requirement)) { throw "Application shell is missing a sign-out requirement: $requirement" }
    $assertions++
}

$visibleFiles = @(
    'src/app/login/page.js',
    'src/app/dashboard/page.js',
    'src/app/components/AppShell.js',
    'preview/index.html'
)
$visibleText = ($visibleFiles | ForEach-Object { Get-Content -LiteralPath (Join-Path $root $_) -Raw }) -join "`n"
if ($visibleText -match '[\u2013\u2014]') { throw 'Visible interface copy contains an en dash or em dash.' }
$assertions++

$behaviorText = $visibleText + "`n" + $css
if ($behaviorText -match 'window\.addEventListener\s*\(\s*["'']scroll') { throw 'A direct window scroll listener was found.' }
if ($css -match '(?<!d)100vh') { throw 'Use dynamic viewport units instead of 100vh.' }
$assertions += 2

foreach ($imageMatch in [regex]::Matches($visibleText, '<img\b[^>]*>', [Text.RegularExpressions.RegexOptions]::Singleline)) {
    if ($imageMatch.Value -notmatch '\bwidth=' -or $imageMatch.Value -notmatch '\bheight=') { throw 'An image is missing intrinsic width or height.' }
}
$assertions++

function Get-RelativeLuminance([string]$Hex) {
    $clean = $Hex.TrimStart('#')
    $channels = @(0,2,4 | ForEach-Object { [Convert]::ToInt32($clean.Substring($_,2),16) / 255.0 })
    $linear = @($channels | ForEach-Object { if ($_ -le 0.04045) { $_ / 12.92 } else { [Math]::Pow(($_ + 0.055) / 1.055, 2.4) } })
    return 0.2126 * $linear[0] + 0.7152 * $linear[1] + 0.0722 * $linear[2]
}

function Get-ContrastRatio([string]$Foreground, [string]$Background) {
    $first = Get-RelativeLuminance $Foreground
    $second = Get-RelativeLuminance $Background
    $lighter = [Math]::Max($first,$second)
    $darker = [Math]::Min($first,$second)
    return ($lighter + 0.05) / ($darker + 0.05)
}

$contrastPairs = @(
    @{ name='primary text'; foreground='#EEF2F8'; background='#0B1124'; minimum=4.5 },
    @{ name='muted text'; foreground='#A5AFC2'; background='#0B1124'; minimum=4.5 },
    @{ name='primary button'; foreground='#FFFFFF'; background='#A83232'; minimum=4.5 },
    @{ name='cyan accent'; foreground='#61D8D0'; background='#0B1124'; minimum=4.5 }
)
foreach ($pair in $contrastPairs) {
    $ratio = Get-ContrastRatio $pair.foreground $pair.background
    if ($ratio -lt $pair.minimum) { throw "$($pair.name) contrast is below $($pair.minimum):1." }
    $assertions++
}

$designSystem = Get-Content -LiteralPath (Join-Path $root 'design-system.md') -Raw
foreach ($documentedValue in @('#61D8D0','#EEF2F8','#A5AFC2','#FF9A9E')) {
    if ($designSystem -notmatch [regex]::Escape($documentedValue)) { throw "Design-system documentation is missing current token value: $documentedValue" }
    $assertions++
}

$readme = Get-Content -LiteralPath (Join-Path $root 'README.md') -Raw
if ($readme -notmatch [regex]::Escape('https://va-claims-edge-design-sprint.netlify.app/')) { throw 'README is missing the approved signup design source.' }
$assertions++

$assetHashes = @{
    'public/va-claims-edge-logo.png' = 'CE4A67FB15A05079E4018C4EF9EEE5B246902FD663164B08F70EABEFC441CE1E'
    'public/shield-motion-ribbons.png' = '9DFD430EC8136F628854E1D1EE7C5C19855C270C4F1904FA9FEAAEFFD5C29515'
}
foreach ($relative in $assetHashes.Keys) {
    $actual = (Get-FileHash -LiteralPath (Join-Path $root $relative) -Algorithm SHA256).Hash
    if ($actual -ne $assetHashes[$relative]) { throw "Brand asset does not match the approved source: $relative" }
    $assertions++
}

$allText = ($required | ForEach-Object { Get-Content -LiteralPath (Join-Path $root $_) -Raw }) -join "`n"
if ($allText -match '(?i)anthropic[_ -]?api[_ -]?key\s*[:=]\s*\S+') { throw 'Possible secret value found in package text.' }
$assertions++

[pscustomobject]@{ status = 'passed'; assertions = $assertions; files = $required.Count } | ConvertTo-Json -Compress
