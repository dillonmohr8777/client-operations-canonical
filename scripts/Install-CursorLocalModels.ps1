[CmdletBinding()]
param(
    [string]$RosterPath,
    [string]$PluginSource,
    [string]$PluginDestination,
    [string]$UserCatalogPath,
    [switch]$Apply
)

$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
if ([string]::IsNullOrWhiteSpace($RosterPath)) { $RosterPath = Join-Path $projectRoot 'registry\local-models.json' }
if ([string]::IsNullOrWhiteSpace($PluginSource)) {
    $PluginSource = Join-Path $projectRoot 'integrations\cursor\marketing-chief-local-models'
}
if ([string]::IsNullOrWhiteSpace($PluginDestination)) {
    $PluginDestination = Join-Path $HOME '.cursor\plugins\local\marketing-chief-local-models'
}
if ([string]::IsNullOrWhiteSpace($UserCatalogPath)) {
    $UserCatalogPath = Join-Path $HOME '.cursor\marketing-chief-local-models.json'
}

function Write-Utf8Text {
    param([string]$Path, [string]$Text)
    $dir = Split-Path -Parent $Path
    if (-not [string]::IsNullOrWhiteSpace($dir) -and -not (Test-Path -LiteralPath $dir)) {
        [void][IO.Directory]::CreateDirectory($dir)
    }
    [IO.File]::WriteAllText($Path, $Text, [Text.UTF8Encoding]::new($false))
}

$validator = Join-Path $PSScriptRoot 'Test-LocalModelRoster.ps1'
[void](& $validator -RosterPath $RosterPath)
$packJson = ((& (Join-Path $PSScriptRoot 'New-CursorLocalModelPack.ps1') -RosterPath $RosterPath) + "`n")
$pack = $packJson | ConvertFrom-Json
$pluginManifestPath = Join-Path $PluginSource '.cursor-plugin\plugin.json'
if (-not (Test-Path -LiteralPath $pluginManifestPath -PathType Leaf)) {
    throw 'Plugin source is missing .cursor-plugin/plugin.json.'
}
$plugin = Get-Content -LiteralPath $pluginManifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
if ([string]$plugin.name -ne 'marketing-chief-local-models') {
    throw 'Refusing to install a plugin whose name is not marketing-chief-local-models.'
}

$eligible = @($pack.models | Where-Object { [bool]$_.pickerEligible })
$result = [ordered]@{
    status = 'dry-run'
    pluginSource = $PluginSource
    pluginDestination = $PluginDestination
    userCatalogPath = $UserCatalogPath
    modelCount = @($pack.models).Count
    pickerEligibleCount = $eligible.Count
    recommendedChatCount = @($eligible | Where-Object { [string]$_.status -eq 'recommended' }).Count
    pickerIds = @($eligible | ForEach-Object { [string]$_.pickerId })
    applyAttempted = [bool]$Apply
    pluginInstalled = $false
    catalogWritten = $false
    secretsWritten = $false
    tunnelsEnabled = $false
    stateDbEdited = $false
    omnirouteMutated = $false
    canonicalQueueMutated = $false
    pullAttempted = $false
}

if (-not $Apply) {
    $result | ConvertTo-Json -Depth 6
    return
}

if (Test-Path -LiteralPath $PluginDestination) {
    $existingManifest = Join-Path $PluginDestination '.cursor-plugin\plugin.json'
    if (Test-Path -LiteralPath $existingManifest -PathType Leaf) {
        $existing = Get-Content -LiteralPath $existingManifest -Raw -Encoding UTF8 | ConvertFrom-Json
        if ([string]$existing.name -ne 'marketing-chief-local-models') {
            throw ("Refusing to overwrite a different Cursor plugin at {0}" -f $PluginDestination)
        }
    }
    Remove-Item -LiteralPath $PluginDestination -Recurse -Force
}

[void][IO.Directory]::CreateDirectory((Split-Path -Parent $PluginDestination))
Copy-Item -LiteralPath $PluginSource -Destination $PluginDestination -Recurse -Force
Write-Utf8Text -Path (Join-Path $PluginDestination 'references\cursor-local-models.json') -Text $packJson
Write-Utf8Text -Path $UserCatalogPath -Text $packJson

$result.status = 'installed'
$result.pluginInstalled = $true
$result.catalogWritten = $true
$result | ConvertTo-Json -Depth 6
