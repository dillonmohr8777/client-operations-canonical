[CmdletBinding()]
param(
    [switch]$RefreshTimestamp
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$codexPath = 'C:\Users\dillo\AppData\Roaming\npm\codex.ps1'
$cachePath = 'C:\Users\dillo\.codex\models_cache.json'
$backupPath = 'C:\Users\dillo\.codex\skill-metadata-backups\20260814-m360-daily-repair\models_cache.json.latest-before-runner-compat'

if (-not (Test-Path -LiteralPath $codexPath)) {
    throw "Codex CLI is missing: $codexPath"
}

$versionText = (& $codexPath --version | Out-String).Trim()
if ($versionText -notmatch '(?<version>\d+\.\d+\.\d+)') {
    throw 'Unable to determine the Codex CLI version.'
}
$cliVersion = $Matches.version

if (-not (Test-Path -LiteralPath $cachePath)) {
    [pscustomobject]@{
        changed = $false
        cliVersion = $cliVersion
        state = 'cache-absent'
    } | ConvertTo-Json
    exit 0
}

$cache = Get-Content -LiteralPath $cachePath -Raw | ConvertFrom-Json
$changed = [string]$cache.client_version -ne $cliVersion -or $RefreshTimestamp
foreach ($model in @($cache.models)) {
    if (-not ($model.PSObject.Properties.Name -contains 'base_instructions')) {
        $model | Add-Member -NotePropertyName base_instructions -NotePropertyValue ''
        $changed = $true
    } elseif ($null -eq $model.base_instructions) {
        $model.base_instructions = ''
        $changed = $true
    }
}

if ($changed) {
    $backupDirectory = Split-Path -Parent $backupPath
    New-Item -ItemType Directory -Force -Path $backupDirectory | Out-Null
    Copy-Item -LiteralPath $cachePath -Destination $backupPath -Force
    $cache.client_version = $cliVersion
    $cache.fetched_at = [DateTimeOffset]::UtcNow.ToString('o')
    $json = $cache | ConvertTo-Json -Depth 100
    [IO.File]::WriteAllText($cachePath, $json, [Text.UTF8Encoding]::new($false))
}

[pscustomobject]@{
    changed = $changed
    cliVersion = $cliVersion
    state = if ($changed) { 'normalized' } else { 'compatible' }
    modelCount = @($cache.models).Count
} | ConvertTo-Json
