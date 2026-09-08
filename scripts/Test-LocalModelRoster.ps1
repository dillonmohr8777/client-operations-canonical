[CmdletBinding()]
param(
    [string]$RosterPath,
    [string]$SchemaPath
)

$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
if ([string]::IsNullOrWhiteSpace($RosterPath)) { $RosterPath = Join-Path $projectRoot 'registry\local-models.json' }
if ([string]::IsNullOrWhiteSpace($SchemaPath)) { $SchemaPath = Join-Path $projectRoot 'schemas\local-models.schema.json' }

function Assert-True {
    param([bool]$Condition, [string]$Message)
    if (-not $Condition) { throw $Message }
}

$roster = Get-Content -LiteralPath $RosterPath -Raw -Encoding UTF8 | ConvertFrom-Json
$schema = Get-Content -LiteralPath $SchemaPath -Raw -Encoding UTF8 | ConvertFrom-Json

Assert-True ([int]$roster.schemaVersion -eq 1) 'Roster schemaVersion must be 1.'
Assert-True ([int]$schema.properties.schemaVersion.const -eq 1) 'Schema const must stay at 1.'
Assert-True ([string]$roster.reviewedAt -match '^\d{4}-\d{2}-\d{2}$') 'reviewedAt must be an ISO date.'
Assert-True ([bool]$roster.authority.rosterIsRecommendationOnly) 'Roster must remain recommendation-only.'
Assert-True ([string]$roster.authority.ollamaPullByRoster -eq 'forbidden') 'Roster must not pull Ollama models.'
Assert-True ([string]$roster.authority.omnirouteMutationByRoster -eq 'forbidden') 'Roster must not mutate OmniRoute.'
Assert-True ([string]$roster.authority.canonicalQueueMutationByRoster -eq 'forbidden') 'Roster must not mutate the queue.'
Assert-True ([string]$roster.authority.cursorUserSecretsByRoster -eq 'forbidden') 'Roster must not write Cursor API keys.'
Assert-True ([string]$roster.authority.cursorTunnelsByRoster -eq 'forbidden') 'Roster must not enable Cursor tunnels.'
Assert-True ([string]$roster.authority.cursorStateDbByRoster -eq 'forbidden') 'Roster must not edit Cursor state.vscdb.'
Assert-True (-not [bool]$roster.authority.cloudOllamaTagsCountAsLocal) 'Cloud Ollama tags must not count as local.'
Assert-True ([bool]$roster.authority.vendorBenchmarksAreObservations) 'Vendor scores must stay observations.'
Assert-True ([string]$roster.cursor.pickerCollisionPrefix -eq 'mc-') 'Cursor picker collisions must use the mc- prefix.'
Assert-True ([bool]$roster.cursor.cloudAgentsUseHostedModels) 'Cloud Agents must stay on hosted Cursor models.'
Assert-True ([bool]$roster.cursor.cloudAgentsCannotReachLoopback) 'Cloud Agents must not claim loopback Ollama or OmniRoute.'
Assert-True (@($roster.cursor.pullHosts) -contains 'DESKTOP' -and @($roster.cursor.pullHosts) -contains 'AHCM') 'Ollama pulls belong on DESKTOP or AHCM.'
Assert-True ([bool]$roster.cursor.doNotWriteApiKeys) 'Cursor pack must not write API keys.'
Assert-True ([bool]$roster.cursor.doNotEnableTunnels) 'Cursor pack must not enable tunnels.'
Assert-True ([bool]$roster.cursor.doNotEditStateDb) 'Cursor pack must not edit state.vscdb.'
Assert-True (@($roster.cursor.reservedBuiltinIds).Count -ge 8) 'Cursor reserved built-in IDs are required.'
Assert-True ('kimi-k2.7-code' -in @($roster.cursor.reservedBuiltinIds)) 'Kimi K2.7 Code is a Cursor built-in and must stay reserved.'

$hardwareIds = @($roster.hardwareClasses | ForEach-Object { [string]$_.id })
Assert-True ($hardwareIds.Count -eq (@($hardwareIds | Select-Object -Unique).Count)) 'Hardware class IDs must be unique.'
foreach ($requiredClass in @('edge-16gb', 'consumer-24gb', 'workstation-48-128gb', 'cluster-multi-gpu')) {
    Assert-True ($requiredClass -in $hardwareIds) "Missing hardware class: $requiredClass"
}

$models = @($roster.models)
Assert-True ($models.Count -ge 8) 'Roster must include at least eight models.'
$modelIds = @($models | ForEach-Object { [string]$_.id })
Assert-True ($modelIds.Count -eq (@($modelIds | Select-Object -Unique).Count)) 'Model IDs must be unique.'
Assert-True ('deepseek-v4-pro-0813' -in $modelIds) 'DeepSeek-V4-Pro-0813 is required.'
Assert-True ('deepseek-v4-flash-0731' -in $modelIds) 'DeepSeek-V4-Flash-0731 is required.'

$pro = @($models | Where-Object { [string]$_.id -eq 'deepseek-v4-pro-0813' })[0]
Assert-True ($null -ne $pro) 'DeepSeek Pro record is missing.'
Assert-True ([bool]$pro.localWeightsAvailable) 'DeepSeek Pro local weights must be marked available.'
Assert-True ([string]$pro.huggingfaceId -eq 'deepseek-ai/DeepSeek-V4-Pro-0813') 'DeepSeek Pro must bind the official 0813 Hugging Face id.'
Assert-True ($null -eq $pro.ollamaLocalTag -or [string]$pro.ollamaLocalTag -eq '') 'DeepSeek Pro must not claim a local Ollama tag.'
Assert-True ([string]$pro.ollamaCloudTag -match '(?i)(:cloud($|-)|-cloud$)') 'DeepSeek Pro Ollama alias must be labeled cloud.'
Assert-True ([string]$pro.hardwareClass -eq 'cluster-multi-gpu') 'DeepSeek Pro is cluster-class.'
$proBenchNames = @($pro.benchmarks | ForEach-Object { [string]$_.name })
foreach ($requiredBench in @('HLE', 'Terminal-Bench 2.1', 'NL2Repo', 'DeepSWE')) {
    Assert-True ($requiredBench -in $proBenchNames) "DeepSeek Pro is missing benchmark $requiredBench"
}
$terminal = @($pro.benchmarks | Where-Object { [string]$_.name -eq 'Terminal-Bench 2.1' })[0]
Assert-True ([double]$terminal.score -eq 87.9) 'DeepSeek Pro Terminal-Bench 2.1 score must stay on the official 0813 card.'

foreach ($model in $models) {
    Assert-True (-not [string]::IsNullOrWhiteSpace([string]$model.id)) 'Every model needs an id.'
    Assert-True (@($model.sources).Count -ge 1) ("Missing sources: {0}" -f $model.id)
    foreach ($source in @($model.sources)) {
        Assert-True ([string]$source.url -match '^https://') ("Source URL must be https: {0}" -f $model.id)
    }
    if ($null -ne $model.ollamaLocalTag -and -not [string]::IsNullOrWhiteSpace([string]$model.ollamaLocalTag)) {
        Assert-True ([string]$model.ollamaLocalTag -notmatch '(?i)(:cloud($|-)|-cloud$)') ("Local Ollama tag cannot be a cloud alias: {0}" -f $model.id)
        Assert-True ([bool]$model.localWeightsAvailable) ("Local Ollama tag requires localWeightsAvailable: {0}" -f $model.id)
    }
    if ($null -ne $model.ollamaCloudTag -and -not [string]::IsNullOrWhiteSpace([string]$model.ollamaCloudTag)) {
        Assert-True ([string]$model.ollamaCloudTag -match '(?i)(:cloud($|-)|-cloud$)') ("Cloud Ollama tag must include a cloud alias: {0}" -f $model.id)
    }
    foreach ($benchmark in @($model.benchmarks)) {
        Assert-True (-not [string]::IsNullOrWhiteSpace([string]$benchmark.name)) ("Benchmark name missing: {0}" -f $model.id)
        Assert-True ([string]$benchmark.sourceKind -in @('official-card', 'official-library', 'independent')) ("Unsupported benchmark sourceKind: {0}" -f $model.id)
        Assert-True ($null -ne $benchmark.score) ("Benchmark score missing: {0}" -f $model.id)
    }
}

$recommendations = @($roster.recommendations)
Assert-True ($recommendations.Count -ge 4) 'At least four recommendation lanes are required.'
$laneIds = @($recommendations | ForEach-Object { [string]$_.lane })
Assert-True ($laneIds.Count -eq (@($laneIds | Select-Object -Unique).Count)) 'Recommendation lanes must be unique.'
foreach ($recommendation in $recommendations) {
    Assert-True ([string]$recommendation.modelId -in $modelIds) ("Recommendation points at an unknown model: {0}" -f $recommendation.modelId)
    $target = @($models | Where-Object { [string]$_.id -eq [string]$recommendation.modelId })[0]
    Assert-True ([string]$target.status -eq 'recommended') ("Recommendation lane {0} must use a recommended model." -f $recommendation.lane)
}

$localTags = @(
    $models |
        Where-Object { -not [string]::IsNullOrWhiteSpace([string]$_.ollamaLocalTag) } |
        ForEach-Object { [string]$_.ollamaLocalTag }
)
$pullSets = $roster.pullSets
Assert-True ($null -ne $pullSets) 'Pull sets are required.'
Assert-True (-not [bool]$pullSets.cloudAgentMayPull) 'Cloud Agents must not pull Ollama weights.'
Assert-True ([bool]$pullSets.confirmLocalNotCloud) 'Installed tags must be confirmed local, not :cloud.'
Assert-True (@($pullSets.hosts) -contains 'DESKTOP' -and @($pullSets.hosts) -contains 'AHCM') 'Pull hosts must be DESKTOP and AHCM.'
foreach ($setName in @('daily24gb', 'edge16gb', 'recommendedIfFits')) {
    foreach ($tag in @($pullSets.$setName)) {
        Assert-True ([string]$tag -notmatch '(?i)(:cloud($|-)|-cloud$)') ("Pull set {0} cannot include a cloud alias: {1}" -f $setName, $tag)
        Assert-True ($tag -in $localTags) ("Pull set {0} tag is not a roster local Ollama tag: {1}" -f $setName, $tag)
    }
}
Assert-True (@($pullSets.daily24gb).Count -eq 5) '24 GB daily set must contain five exact tags.'
Assert-True (@($pullSets.edge16gb).Count -eq 4) '16 GB class set must contain four exact tags.'
Assert-True ('ornith:35b' -in @($pullSets.daily24gb)) '24 GB daily set must include ornith:35b.'
Assert-True ('qwen3.8:27b' -in @($pullSets.daily24gb)) '24 GB daily set must include qwen3.8:27b.'
Assert-True ('gemma4:31b' -in @($pullSets.daily24gb)) '24 GB daily set must include gemma4:31b.'
Assert-True ('gpt-oss:20b' -in @($pullSets.daily24gb)) '24 GB daily set must include gpt-oss:20b.'
Assert-True ('ornith:9b' -in @($pullSets.daily24gb)) '24 GB daily set must include ornith:9b.'
Assert-True ('qwen3.5:9b' -in @($pullSets.edge16gb)) '16 GB class set must include qwen3.5:9b.'
Assert-True ('gemma4:e4b' -in @($pullSets.edge16gb)) '16 GB class set must include gemma4:e4b.'
Assert-True ('glm-4.7-flash' -in @($pullSets.recommendedIfFits)) 'Recommended-if-fits set must include glm-4.7-flash.'

$localDaily = @($models | Where-Object {
    [string]$_.status -eq 'recommended' -and
    -not [string]::IsNullOrWhiteSpace([string]$_.ollamaLocalTag) -and
    [string]$_.hardwareClass -in @('edge-16gb', 'consumer-24gb')
})
Assert-True ($localDaily.Count -ge 6) 'Roster must include at least six recommended local Ollama daily models.'

[pscustomobject]@{
    status = 'valid'
    reviewedAt = [string]$roster.reviewedAt
    modelCount = $models.Count
    recommendedCount = @($models | Where-Object status -eq 'recommended').Count
    localOllamaCount = @($models | Where-Object { -not [string]::IsNullOrWhiteSpace([string]$_.ollamaLocalTag) }).Count
    deepseekPro = [string]$pro.id
} | ConvertTo-Json
