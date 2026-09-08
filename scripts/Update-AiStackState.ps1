[CmdletBinding()]
param(
    [string]$RosterPath,
    [string]$OutputPath,
    [int]$ProbeTimeoutMilliseconds = 2000,
    [switch]$NoWrite
)

$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
if ([string]::IsNullOrWhiteSpace($RosterPath)) { $RosterPath = Join-Path $projectRoot 'registry\local-models.json' }
if ([string]::IsNullOrWhiteSpace($OutputPath)) { $OutputPath = Join-Path $projectRoot 'state\ai-stack.json' }

$validator = Join-Path $PSScriptRoot 'Test-LocalModelRoster.ps1'
$validation = & $validator -RosterPath $RosterPath | ConvertFrom-Json
$roster = Get-Content -LiteralPath $RosterPath -Raw -Encoding UTF8 | ConvertFrom-Json

function Invoke-LoopbackGet {
    param(
        [Parameter(Mandatory = $true)][string]$Uri,
        [int]$TimeoutMilliseconds = 2000
    )
    $uriObject = [Uri]$Uri
    if ($uriObject.Host -notin @('127.0.0.1', 'localhost')) {
        throw 'AI stack probes may only target loopback.'
    }
    try {
        $handler = [System.Net.Http.HttpClientHandler]::new()
        $client = [System.Net.Http.HttpClient]::new($handler)
        try {
            $client.Timeout = [TimeSpan]::FromMilliseconds($TimeoutMilliseconds)
            $response = $client.GetAsync($uriObject).GetAwaiter().GetResult()
            $text = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult()
            return [pscustomobject]@{
                ok = [bool]$response.IsSuccessStatusCode
                text = $text
            }
        }
        finally {
            $client.Dispose()
            $handler.Dispose()
        }
    }
    catch {
        return [pscustomobject]@{
            ok = $false
            text = $null
        }
    }
}

function Test-CloudOllamaName {
    param([string]$Name)
    return [string]$Name -match '(?i)((^|:)cloud($|-)|-cloud$)'
}

$ollamaProbe = Invoke-LoopbackGet -Uri 'http://127.0.0.1:11434/api/tags' -TimeoutMilliseconds $ProbeTimeoutMilliseconds
$gatewayProbe = Invoke-LoopbackGet -Uri 'http://127.0.0.1:20128/' -TimeoutMilliseconds $ProbeTimeoutMilliseconds

$installed = @()
if ($ollamaProbe.ok -and -not [string]::IsNullOrWhiteSpace([string]$ollamaProbe.text)) {
    try {
        $tags = $ollamaProbe.text | ConvertFrom-Json
        foreach ($model in @($tags.models)) {
            $name = [string]$model.name
            if ([string]::IsNullOrWhiteSpace($name)) { continue }
            $installed += [pscustomobject]@{
                name = $name
                local = -not (Test-CloudOllamaName $name)
            }
        }
    }
    catch {}
}

$localInstalled = @($installed | Where-Object { [bool]$_.local })
$cloudInstalled = @($installed | Where-Object { -not [bool]$_.local })
$localInstalledNames = @($localInstalled | ForEach-Object { [string]$_.name })
$recommendedLocalTags = @(
    $roster.models |
        Where-Object { [string]$_.status -eq 'recommended' -and -not [string]::IsNullOrWhiteSpace([string]$_.ollamaLocalTag) } |
        ForEach-Object { [string]$_.ollamaLocalTag }
)
$matchedRecommended = @($recommendedLocalTags | Where-Object { $_ -in $localInstalledNames })

function Get-PullSetCoverage {
    param([string[]]$Tags)
    $installedTags = @($Tags | Where-Object { $_ -in $localInstalledNames })
    $missingTags = @($Tags | Where-Object { $_ -notin $localInstalledNames })
    return [ordered]@{
        requested = @($Tags)
        installed = @($installedTags)
        missing = @($missingTags)
    }
}

$pullSetCoverage = [ordered]@{
    daily24gb = Get-PullSetCoverage -Tags @($roster.pullSets.daily24gb)
    edge16gb = Get-PullSetCoverage -Tags @($roster.pullSets.edge16gb)
    recommendedIfFits = Get-PullSetCoverage -Tags @($roster.pullSets.recommendedIfFits)
}

$localRuntimeStatus = if ($ollamaProbe.ok) { 'listening' } else { 'unreachable' }
$gatewayStatus = if ($gatewayProbe.ok) { 'listening' } else { 'unreachable' }
$overall = if ($localRuntimeStatus -eq 'listening' -and $matchedRecommended.Count -gt 0) {
    'ready'
} elseif ([string]$validation.status -eq 'valid') {
    'degraded'
} else {
    'invalid'
}

$result = [ordered]@{
    schemaVersion = 1
    asOf = [DateTimeOffset]::UtcNow.ToString('o')
    status = $overall
    gatewayStatus = $gatewayStatus
    localRuntimeStatus = $localRuntimeStatus
    localModelCount = @($localInstalled).Count
    connectedProviderCount = 0
    roster = [ordered]@{
        path = 'registry/local-models.json'
        reviewedAt = [string]$roster.reviewedAt
        modelCount = [int]$validation.modelCount
        recommendedCount = [int]$validation.recommendedCount
        localOllamaCount = [int]$validation.localOllamaCount
        deepseekPro = [string]$validation.deepseekPro
    }
    pullHosts = @($roster.pullSets.hosts)
    cloudAgentMayPull = [bool]$roster.pullSets.cloudAgentMayPull
    installedLocalNames = @($localInstalledNames)
    installedCloudAliasesIgnored = @($cloudInstalled | ForEach-Object { [string]$_.name })
    matchedRecommendedLocalTags = @($matchedRecommended)
    pullSets = $pullSetCoverage
    probes = [ordered]@{
        ollama = 'http://127.0.0.1:11434/api/tags'
        omniroute = 'http://127.0.0.1:20128/'
        pullAttempted = $false
        omnirouteMutated = $false
        canonicalQueueMutated = $false
    }
    privacy = 'redacted'
    containsSecrets = $false
}

if (-not $NoWrite) {
    $directory = Split-Path -Parent $OutputPath
    if (-not (Test-Path -LiteralPath $directory -PathType Container)) {
        [void][IO.Directory]::CreateDirectory($directory)
    }
    $json = ($result | ConvertTo-Json -Depth 8)
    [IO.File]::WriteAllText($OutputPath, $json + [Environment]::NewLine, [Text.UTF8Encoding]::new($false))
}

[pscustomobject]$result
