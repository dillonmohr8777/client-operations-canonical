[CmdletBinding()]
param(
    [string]$StatePath
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
if ([string]::IsNullOrWhiteSpace($StatePath)) {
    $StatePath = Join-Path $projectRoot 'state\ai-stack.json'
}
if (-not (Test-Path -LiteralPath $StatePath -PathType Leaf)) {
    throw "AI stack state was not found at $StatePath"
}

$state = Get-Content -LiteralPath $StatePath -Raw -Encoding UTF8 | ConvertFrom-Json
$observedAt = [DateTimeOffset]::Now.ToString('o')

try {
    $null = Invoke-WebRequest -Uri 'http://127.0.0.1:20128/' -Method Get -TimeoutSec 10 -UseBasicParsing
    $providers = Invoke-RestMethod -Uri 'http://127.0.0.1:20128/api/providers' -Method Get -TimeoutSec 10
    $state.gateway.status = 'healthy'
    $state.gateway.connectedProviderCount = @($providers.connections).Count
}
catch {
    $state.gateway.status = 'unavailable'
}

$installedByName = @{}
try {
    $runtimeVersion = Invoke-RestMethod -Uri 'http://127.0.0.1:11434/api/version' -Method Get -TimeoutSec 10
    $runtimeTags = Invoke-RestMethod -Uri 'http://127.0.0.1:11434/api/tags' -Method Get -TimeoutSec 20
    foreach ($installed in @($runtimeTags.models)) {
        $installedByName[[string]$installed.name] = $installed
    }
    foreach ($model in @($state.localRuntime.models)) {
        if ($installedByName.ContainsKey([string]$model.id)) {
            $installed = $installedByName[[string]$model.id]
            $model.status = 'ready'
            if ([double]$installed.size -gt 0) {
                $model.sizeGb = [math]::Round(([double]$installed.size / 1GB), 2)
            }
        }
        else {
            $model.status = 'missing'
        }
    }
    $state.localRuntime.version = [string]$runtimeVersion.version
    $state.localRuntime.status = 'healthy'
    $state.localRuntime.modelCount = @($runtimeTags.models).Count
}
catch {
    $state.localRuntime.status = 'unavailable'
    foreach ($model in @($state.localRuntime.models)) {
        $model.status = 'unverified'
    }
}

if ($state.PSObject.Properties.Name -contains 'modelRoutes') {
    foreach ($route in @($state.modelRoutes)) {
        switch ([string]$route.id) {
            'qwen-local' {
                $route.status = if ($installedByName.ContainsKey('qwen3.5:9b')) { 'ready' } elseif ($state.localRuntime.status -eq 'unavailable') { 'unverified' } else { 'missing' }
                $route.verification = 'live-local-model-inventory'
            }
            'deepseek-local' {
                $route.status = if ($installedByName.ContainsKey('deepseek-r1:8b')) { 'ready' } elseif ($state.localRuntime.status -eq 'unavailable') { 'unverified' } else { 'missing' }
                $route.verification = 'live-local-model-inventory'
            }
            'gemma3-local' {
                $route.status = if ($installedByName.ContainsKey('gemma3:4b')) { 'ready' } elseif ($state.localRuntime.status -eq 'unavailable') { 'unverified' } else { 'missing' }
                $route.verification = 'live-local-model-inventory'
            }
            'kimi-k3-free' {
                if ($state.gateway.status -ne 'healthy') {
                    $route.status = 'unavailable'
                    $route.verification = 'gateway-unavailable'
                }
            }
        }
    }
}

$state.observedAt = $observedAt
$state.status = if (
    $state.gateway.status -eq 'healthy' -and
    $state.localRuntime.status -eq 'healthy'
) { 'operational-with-human-gates' } else { 'degraded' }

$tempPath = "$StatePath.tmp.$([guid]::NewGuid().ToString('N')).json"
try {
    [IO.File]::WriteAllText(
        $tempPath,
        (($state | ConvertTo-Json -Depth 30) + [Environment]::NewLine),
        [Text.UTF8Encoding]::new($false)
    )
    Move-Item -LiteralPath $tempPath -Destination $StatePath -Force
}
finally {
    Remove-Item -LiteralPath $tempPath -Force -ErrorAction SilentlyContinue
}

[pscustomobject]@{
    status = [string]$state.status
    observedAt = [string]$state.observedAt
    gatewayStatus = [string]$state.gateway.status
    connectedProviderCount = [int]$state.gateway.connectedProviderCount
    localRuntimeStatus = [string]$state.localRuntime.status
    localModelCount = [int]$state.localRuntime.modelCount
}
