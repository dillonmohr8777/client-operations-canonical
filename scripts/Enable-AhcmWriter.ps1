[CmdletBinding()]
param(
    [string]$RepositoryRoot = (Split-Path -Parent $PSScriptRoot)
)

$ErrorActionPreference = 'Stop'
$expectedMachine = 'AHCM-3LCQVF4'
$actualMachine = [Environment]::MachineName

if ($actualMachine -ne $expectedMachine) {
    throw "This writer setup is only for $expectedMachine. Current machine: $actualMachine"
}

$root = [IO.Path]::GetFullPath($RepositoryRoot)
$gitDirRaw = (& git -C $root rev-parse --git-dir 2>&1 | Out-String).Trim()
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($gitDirRaw)) {
    throw "Not a Git repository: $root"
}

$gitDir = if ([IO.Path]::IsPathRooted($gitDirRaw)) { $gitDirRaw } else { Join-Path $root $gitDirRaw }
$hookPath = Join-Path (Join-Path $gitDir 'hooks') 'pre-push'
$legacyGuardRemoved = $false
$customHookPreserved = $false

if (Test-Path -LiteralPath $hookPath) {
    $hookText = [IO.File]::ReadAllText($hookPath, [Text.UTF8Encoding]::new($false))
    $isLegacyGuard = $hookText.Contains('AHCM may push only ahcm/* contribution branches.') -and
        $hookText.Contains('AHCM contribution modifies protected canonical state:')

    if ($isLegacyGuard) {
        Remove-Item -LiteralPath $hookPath -Force
        $legacyGuardRemoved = $true
    }
    else {
        $customHookPreserved = $true
    }
}

& git -C $root config pull.ff only
if ($LASTEXITCODE -ne 0) { throw 'Failed to configure fast-forward-only pulls.' }
& git -C $root config fetch.prune true
if ($LASTEXITCODE -ne 0) { throw 'Failed to configure fetch pruning.' }
& git -C $root config push.default simple
if ($LASTEXITCODE -ne 0) { throw 'Failed to configure simple pushes.' }

[pscustomobject]@{
    status = 'writer-enabled'
    machine = $actualMachine
    repository = $root
    writers = @('DESKTOP-4AHKEC4', 'AHCM-3LCQVF4')
    legacyContributorGuardRemoved = $legacyGuardRemoved
    unrelatedCustomHookPreserved = $customHookPreserved
    pullMode = 'fast-forward-only'
    forcePushPolicy = 'prohibited-for-canonical-state'
} | ConvertTo-Json -Compress
