$ErrorActionPreference = 'Stop'

function Assert-True {
    param([bool]$Condition, [string]$Message)
    if (-not $Condition) { throw $Message }
    $script:AssertionCount++
}

function New-TempPath {
    param([string]$Suffix)
    return Join-Path $script:TempRoot $Suffix
}

$script:AssertionCount = 0
$root = Split-Path -Parent $PSScriptRoot
$script:TempRoot = Join-Path ([IO.Path]::GetTempPath()) ('cursor-local-models-tests-' + [guid]::NewGuid().ToString('N'))
[void][IO.Directory]::CreateDirectory($script:TempRoot)

$validatorPath = Join-Path $root 'scripts\Test-CursorLocalModels.ps1'
$installPath = Join-Path $root 'scripts\Install-CursorLocalModels.ps1'
$packPath = Join-Path $root 'registry\cursor-local-models.json'
$docsPath = Join-Path $root 'docs\LOCAL_MODELS.md'

try {
    foreach ($path in @($validatorPath, $installPath, $packPath, $docsPath)) {
        Assert-True (Test-Path -LiteralPath $path -PathType Leaf) "Missing required file: $path"
    }

    foreach ($script in @($validatorPath, $installPath, (Join-Path $root 'scripts\New-CursorLocalModelPack.ps1'))) {
        $parseErrors = $null
        [void][Management.Automation.Language.Parser]::ParseFile($script, [ref]$null, [ref]$parseErrors)
        Assert-True (@($parseErrors).Count -eq 0) ("Parser errors in {0}" -f [IO.Path]::GetFileName($script))
    }

    $validation = & $validatorPath | ConvertFrom-Json
    Assert-True ([string]$validation.status -eq 'valid') 'Cursor pack must validate.'
    Assert-True ([int]$validation.modelCount -ge 8) 'Cursor pack must keep the full roster.'
    Assert-True ([int]$validation.recommendedChatCount -ge 8) 'Cursor pack must keep recommended chat IDs.'
    Assert-True ([string]$validation.deepseekProPickerId -eq 'deepseek-v4-pro-0813') 'DeepSeek Pro picker ID must stay official.'

    $dryRun = & $installPath | ConvertFrom-Json
    Assert-True ([string]$dryRun.status -eq 'dry-run') 'Installer must default to dry-run.'
    Assert-True (-not [bool]$dryRun.applyAttempted) 'Dry-run must not apply.'
    Assert-True (-not [bool]$dryRun.pluginInstalled) 'Dry-run must not copy the plugin.'
    Assert-True (-not [bool]$dryRun.secretsWritten) 'Installer must not write secrets.'
    Assert-True (-not [bool]$dryRun.tunnelsEnabled) 'Installer must not enable tunnels.'
    Assert-True (-not [bool]$dryRun.omnirouteMutated) 'Installer must not mutate OmniRoute.'
    Assert-True (-not [bool]$dryRun.canonicalQueueMutated) 'Installer must not mutate the queue.'
    Assert-True (-not [bool]$dryRun.pullAttempted) 'Installer must not pull weights.'

    $pluginDest = New-TempPath 'plugin'
    $catalogPath = New-TempPath 'catalog.json'
    $applied = & $installPath -Apply -PluginDestination $pluginDest -UserCatalogPath $catalogPath | ConvertFrom-Json
    Assert-True ([string]$applied.status -eq 'installed') 'Apply must install the plugin into the requested destination.'
    Assert-True ([bool]$applied.pluginInstalled) 'Apply must report the plugin copy.'
    Assert-True (Test-Path -LiteralPath (Join-Path $pluginDest '.cursor-plugin\plugin.json') -PathType Leaf) 'Applied plugin must include the manifest.'
    Assert-True (Test-Path -LiteralPath $catalogPath -PathType Leaf) 'Apply must write the non-secret user catalog.'
    $catalog = Get-Content -LiteralPath $catalogPath -Raw -Encoding UTF8 | ConvertFrom-Json
    Assert-True (@($catalog.models).Count -eq [int]$validation.modelCount) 'User catalog must contain every pack model.'
    Assert-True (-not [bool]$applied.secretsWritten) 'Apply must still refuse secrets.'
    Assert-True (-not [bool]$applied.stateDbEdited) 'Apply must not edit state.vscdb.'

    $docs = Get-Content -LiteralPath $docsPath -Raw -Encoding UTF8
    Assert-True ($docs -match 'Install-CursorLocalModels') 'Docs must name the Cursor installer.'
    Assert-True ($docs -match 'deepseek-v4-pro-0813') 'Docs must keep the DeepSeek Pro picker ID.'
    Assert-True ($docs -match 'ornith:35b') 'Docs must keep the Ornith daily-coding picker ID.'

    Write-Output ("cursor-local-models tests passed ({0} assertions)" -f $script:AssertionCount)
    exit 0
}
catch {
    Write-Error $_
    exit 1
}
finally {
    if (Test-Path -LiteralPath $script:TempRoot) {
        Remove-Item -LiteralPath $script:TempRoot -Recurse -Force -ErrorAction SilentlyContinue
    }
}
