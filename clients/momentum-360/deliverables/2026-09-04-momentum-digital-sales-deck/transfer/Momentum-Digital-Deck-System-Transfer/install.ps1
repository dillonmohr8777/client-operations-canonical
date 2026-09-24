[CmdletBinding()]
param(
    [ValidateSet('Claude', 'Codex', 'Both')]
    [string]$Target = 'Both',
    [switch]$Force,
    [switch]$SkipDependencies
)

$ErrorActionPreference = 'Stop'
$sourceRoot = Join-Path $PSScriptRoot 'skills'
$skills = @('client-logo', 'client-deck')
$destinations = @()

if ($Target -in @('Claude', 'Both')) {
    $destinations += [pscustomobject]@{ Name = 'Claude'; Root = Join-Path $env:USERPROFILE '.claude\skills' }
}
if ($Target -in @('Codex', 'Both')) {
    $destinations += [pscustomobject]@{ Name = 'Codex'; Root = Join-Path $env:USERPROFILE '.codex\skills' }
}

foreach ($skill in $skills) {
    $source = Join-Path $sourceRoot $skill
    if (-not (Test-Path -LiteralPath (Join-Path $source 'SKILL.md'))) {
        throw "Missing source skill: $source"
    }
}

$stamp = (Get-Date).ToUniversalTime().ToString('yyyyMMddTHHmmssZ')

foreach ($destination in $destinations) {
    New-Item -ItemType Directory -Force -Path $destination.Root | Out-Null

    foreach ($skill in $skills) {
        $source = Join-Path $sourceRoot $skill
        $targetPath = Join-Path $destination.Root $skill

        if (Test-Path -LiteralPath $targetPath) {
            if (-not $Force) {
                throw "$($destination.Name) already has $skill at $targetPath. Rerun with -Force to back it up and replace it."
            }
            $backupPath = "$targetPath.backup-$stamp"
            Move-Item -LiteralPath $targetPath -Destination $backupPath
            Write-Host "Backed up $targetPath to $backupPath"
        }

        Copy-Item -LiteralPath $source -Destination $targetPath -Recurse
        Write-Host "Installed $skill for $($destination.Name): $targetPath"

        if (-not $SkipDependencies -and (Test-Path -LiteralPath (Join-Path $targetPath 'package-lock.json'))) {
            if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
                throw "npm is required to restore dependencies. Rerun with -SkipDependencies only if you will restore them separately."
            }
            & npm ci --prefix $targetPath
            if ($LASTEXITCODE -ne 0) {
                throw "npm ci failed for $targetPath"
            }
        }

        if (-not (Test-Path -LiteralPath (Join-Path $targetPath 'SKILL.md'))) {
            throw "Validation failed: SKILL.md missing from $targetPath"
        }
    }

    $brandFile = Join-Path $destination.Root 'client-deck\brands\momentum-digital.json'
    $assetRoot = Join-Path $destination.Root 'client-deck\assets\momentum-digital'
    $assetCount = if (Test-Path -LiteralPath $assetRoot) { (Get-ChildItem -LiteralPath $assetRoot -Filter '*.png' -File).Count } else { 0 }
    if (-not (Test-Path -LiteralPath $brandFile) -or $assetCount -ne 4) {
        throw "Validation failed: Momentum brand payload is incomplete for $($destination.Name)."
    }
}

Write-Host "Install complete. Verify ffmpeg for video and logo animation. Microsoft PowerPoint on Windows is required for native presentation rendering and export."
