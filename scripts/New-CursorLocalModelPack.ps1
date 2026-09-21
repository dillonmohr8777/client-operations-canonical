[CmdletBinding()]
param(
    [string]$RosterPath,
    [string]$OutputPath,
    [string]$PluginReferencePath,
    [switch]$Write
)

$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
if ([string]::IsNullOrWhiteSpace($RosterPath)) { $RosterPath = Join-Path $projectRoot 'registry\local-models.json' }
if ([string]::IsNullOrWhiteSpace($OutputPath)) { $OutputPath = Join-Path $projectRoot 'registry\cursor-local-models.json' }
if ([string]::IsNullOrWhiteSpace($PluginReferencePath)) {
    $PluginReferencePath = Join-Path $projectRoot 'integrations\cursor\marketing-chief-local-models\references\cursor-local-models.json'
}

function ConvertTo-StableJson {
    param($Object)
    return (($Object | ConvertTo-Json -Depth 12) + "`n")
}

function Write-Utf8Text {
    param([string]$Path, [string]$Text)
    $dir = Split-Path -Parent $Path
    if (-not [string]::IsNullOrWhiteSpace($dir) -and -not (Test-Path -LiteralPath $dir)) {
        [void][IO.Directory]::CreateDirectory($dir)
    }
    [IO.File]::WriteAllText($Path, $Text, [Text.UTF8Encoding]::new($false))
}

function Test-ReservedCursorId {
    param([string]$Candidate, [string[]]$Reserved)
    if ([string]::IsNullOrWhiteSpace($Candidate)) { return $false }
    $normalized = $Candidate.Trim().ToLowerInvariant()
    return $Reserved -contains $normalized
}

$roster = Get-Content -LiteralPath $RosterPath -Raw -Encoding UTF8 | ConvertFrom-Json
$reserved = @($roster.cursor.reservedBuiltinIds | ForEach-Object { ([string]$_).Trim().ToLowerInvariant() } | Where-Object { $_ })
$prefix = [string]$roster.cursor.pickerCollisionPrefix
$laneByModel = @{}
foreach ($recommendation in @($roster.recommendations)) {
    $laneByModel[[string]$recommendation.modelId] = [string]$recommendation.lane
}

$models = New-Object System.Collections.Generic.List[object]
foreach ($model in @($roster.models)) {
    $modelId = [string]$model.id
    $roles = @($model.roles | ForEach-Object { [string]$_ })
    $isEmbedding = $roles -contains 'embedding'
    $localTag = $null
    if ($null -ne $model.ollamaLocalTag -and -not [string]::IsNullOrWhiteSpace([string]$model.ollamaLocalTag)) {
        $localTag = [string]$model.ollamaLocalTag
    }
    $huggingfaceId = $null
    if ($null -ne $model.huggingfaceId -and -not [string]::IsNullOrWhiteSpace([string]$model.huggingfaceId)) {
        $huggingfaceId = [string]$model.huggingfaceId
    }

    $upstreamId = $modelId
    if ($localTag) { $upstreamId = $localTag }
    elseif ($huggingfaceId) { $upstreamId = $huggingfaceId }

    $pickerId = if ($localTag) { $localTag } else { $modelId }
    $collides = (Test-ReservedCursorId -Candidate $pickerId -Reserved $reserved) -or (Test-ReservedCursorId -Candidate $modelId -Reserved $reserved)
    if ($collides) {
        $pickerId = $prefix + $modelId
    }

    $serveClass = 'hosted-comparison'
    if ($isEmbedding) { $serveClass = 'not-chat' }
    elseif ($localTag) { $serveClass = 'loopback-ollama' }
    elseif ([bool]$model.localWeightsAvailable -and (@($model.preferredRuntimes) -contains 'vllm' -or @($model.preferredRuntimes) -contains 'sglang')) {
        $serveClass = 'cluster-vllm'
    }

    $lane = $null
    if ($laneByModel.ContainsKey($modelId)) { $lane = $laneByModel[$modelId] }
    $models.Add([pscustomobject]@{
        id = $modelId
        displayName = [string]$model.displayName
        status = [string]$model.status
        lane = $lane
        pickerId = $pickerId
        upstreamId = $upstreamId
        pickerEligible = ($serveClass -ne 'not-chat')
        serveClass = $serveClass
        requiresGatewayAlias = ($pickerId -ne $upstreamId)
        ollamaLocalTag = $localTag
        hardwareClass = [string]$model.hardwareClass
    })
}

$pickerIds = @($models | ForEach-Object { [string]$_.pickerId })
if ($pickerIds.Count -ne (@($pickerIds | Select-Object -Unique).Count)) {
    throw 'Generated Cursor picker IDs must be unique.'
}
foreach ($entry in $models) {
    if (Test-ReservedCursorId -Candidate ([string]$entry.pickerId) -Reserved $reserved) {
        throw ("Picker ID collides with a Cursor built-in: {0}" -f $entry.pickerId)
    }
}

$pack = [ordered]@{
    schemaVersion = 1
    generatedFrom = 'registry/local-models.json'
    reviewedAt = [string]$roster.reviewedAt
    title = 'Cursor local model picker pack'
    purpose = 'Register the canonical local and open-weight roster as unique Cursor custom-model IDs. This pack does not pull weights, write API keys, edit state.vscdb, enable tunnels, or change OmniRoute defaults.'
    authority = [ordered]@{
        writesCursorUserSecrets = $false
        enablesTunnels = $false
        editsCursorStateDb = $false
        pullsOllamaWeights = $false
        mutatesOmniRoute = $false
        mutatesCanonicalQueue = $false
        cloudAgentsUseHostedModels = $true
    }
    endpoints = [ordered]@{
        ollama = [string]$roster.cursor.loopbackOllamaBaseUrl
        omniroute = [string]$roster.cursor.loopbackOmnirouteBaseUrl
        loopbackReachableFromCursorCloud = $false
    }
    howToAdd = @(
        'On the desktop that can reach loopback, open Cursor Settings, then Models.'
        'Enable OpenAI API Key and Override OpenAI Base URL only for that desktop session.'
        'Set the base URL to http://127.0.0.1:11434/v1 for Ollama or http://127.0.0.1:20128/v1 for OmniRoute. The path must include /v1.'
        'Type each pickerId exactly and click Add Custom Model. Cursor does not auto-discover /v1/models.'
        'Do not add an ID that matches a Cursor built-in. Collision IDs already use the mc- prefix.'
        'Cloud Agents and this hosted Cursor session keep using Cursor-hosted models. Loopback URLs are not reachable from Cursor Cloud.'
        'Tunnels, LAN binds, Cloud Endpoint, and OmniRoute default changes stay approval-gated.'
    )
    models = @($models.ToArray())
}

$json = ConvertTo-StableJson $pack
if ($Write) {
    Write-Utf8Text -Path $OutputPath -Text $json
    Write-Utf8Text -Path $PluginReferencePath -Text $json
}
Write-Output $json.TrimEnd()
