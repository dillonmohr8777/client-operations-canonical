[CmdletBinding()]
param(
    [string]$RosterPath,
    [string]$PackPath,
    [string]$PluginRoot
)

$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
if ([string]::IsNullOrWhiteSpace($RosterPath)) { $RosterPath = Join-Path $projectRoot 'registry\local-models.json' }
if ([string]::IsNullOrWhiteSpace($PackPath)) { $PackPath = Join-Path $projectRoot 'registry\cursor-local-models.json' }
if ([string]::IsNullOrWhiteSpace($PluginRoot)) {
    $PluginRoot = Join-Path $projectRoot 'integrations\cursor\marketing-chief-local-models'
}

function Assert-True {
    param([bool]$Condition, [string]$Message)
    if (-not $Condition) { throw $Message }
}

function Get-JoinedInstructions {
    param($Items)
    return ((@($Items) | ForEach-Object { [string]$_ }) -join "`n")
}

function Get-InstructionMatchCount {
    param($Items, [string]$Pattern)
    return @(@($Items) | Where-Object { [string]$_ -match $Pattern }).Count
}

$roster = Get-Content -LiteralPath $RosterPath -Raw -Encoding UTF8 | ConvertFrom-Json
$pack = Get-Content -LiteralPath $PackPath -Raw -Encoding UTF8 | ConvertFrom-Json
$generated = & (Join-Path $PSScriptRoot 'New-CursorLocalModelPack.ps1') -RosterPath $RosterPath | ConvertFrom-Json

Assert-True ([int]$pack.schemaVersion -eq 1) 'Cursor pack schemaVersion must be 1.'
Assert-True ([string]$pack.generatedFrom -eq 'registry/local-models.json') 'Cursor pack must be generated from the roster.'
Assert-True (-not [bool]$pack.authority.writesCursorUserSecrets) 'Pack must not write Cursor secrets.'
Assert-True (-not [bool]$pack.authority.enablesTunnels) 'Pack must not enable tunnels.'
Assert-True (-not [bool]$pack.authority.editsCursorStateDb) 'Pack must not edit state.vscdb.'
Assert-True (-not [bool]$pack.authority.pullsOllamaWeights) 'Pack must not pull weights.'
Assert-True (-not [bool]$pack.authority.mutatesOmniRoute) 'Pack must not mutate OmniRoute.'
Assert-True (-not [bool]$pack.authority.mutatesCanonicalQueue) 'Pack must not mutate the queue.'
Assert-True ([bool]$pack.authority.cloudAgentsUseHostedModels) 'Cloud Agents must stay on hosted models.'
Assert-True ([bool]$pack.authority.cursorByokLoopbackForbidden) 'Pack must forbid localhost Cursor BYOK.'
Assert-True (-not [bool]$pack.endpoints.loopbackReachableFromCursorCloud) 'Loopback must stay unreachable from Cursor Cloud.'
Assert-True ([bool]$pack.endpoints.cursorBackendCannotReachLoopback) 'Cursor backend cannot reach desktop loopback.'
Assert-True ((Get-JoinedInstructions $pack.howToAdd) -match 'ollama_cloud_run') 'Pack howToAdd must name ollama_cloud_run.'
Assert-True ((Get-InstructionMatchCount $pack.howToAdd 'Enable OpenAI API Key and Override OpenAI Base URL') -eq 0) 'Pack howToAdd must not propagate localhost Cursor BYOK.'
Assert-True ((Get-InstructionMatchCount $pack.howToAdd 'click Add Custom Model') -eq 0) 'Pack howToAdd must not tell Cursor to add localhost custom models.'
Assert-True ((Get-InstructionMatchCount $pack.howToAdd 'Set the base URL to http://127.0.0.1:11434/v1') -eq 0) 'Pack howToAdd must not set a loopback OpenAI base URL.'
Assert-True ((Get-JoinedInstructions $pack.howToAdd) -eq (Get-JoinedInstructions $generated.howToAdd)) 'Committed pack howToAdd must match a fresh generator run.'
Assert-True ([string]$pack.purpose -eq [string]$generated.purpose) 'Committed pack purpose must match a fresh generator run.'
Assert-True ([bool]$pack.authority.cursorByokLoopbackForbidden -eq [bool]$generated.authority.cursorByokLoopbackForbidden) 'Committed pack BYOK gate must match a fresh generator run.'

$rosterIds = @($roster.models | ForEach-Object { [string]$_.id })
$packIds = @($pack.models | ForEach-Object { [string]$_.id })
Assert-True ($packIds.Count -eq $rosterIds.Count) 'Cursor pack must include every roster model.'
Assert-True ($packIds.Count -eq (@($packIds | Select-Object -Unique).Count)) 'Cursor pack model IDs must be unique.'
foreach ($id in $rosterIds) {
    Assert-True ($id -in $packIds) ("Cursor pack is missing roster model {0}" -f $id)
}

$generatedIds = @($generated.models | ForEach-Object { [string]$_.id })
Assert-True ($generatedIds.Count -eq $packIds.Count) 'Committed pack must match a fresh generator run.'
foreach ($entry in @($pack.models)) {
    $fresh = @($generated.models | Where-Object { [string]$_.id -eq [string]$entry.id })[0]
    Assert-True ($null -ne $fresh) ("Generator dropped {0}" -f $entry.id)
    Assert-True ([string]$fresh.pickerId -eq [string]$entry.pickerId) ("Picker ID drift for {0}" -f $entry.id)
    Assert-True ([string]$fresh.upstreamId -eq [string]$entry.upstreamId) ("Upstream ID drift for {0}" -f $entry.id)
    Assert-True ([bool]$fresh.pickerEligible -eq [bool]$entry.pickerEligible) ("Eligibility drift for {0}" -f $entry.id)
}

$reserved = @($roster.cursor.reservedBuiltinIds | ForEach-Object { ([string]$_).ToLowerInvariant() })
$pickerIds = @($pack.models | ForEach-Object { [string]$_.pickerId })
Assert-True ($pickerIds.Count -eq (@($pickerIds | Select-Object -Unique).Count)) 'Picker IDs must be unique.'
foreach ($entry in @($pack.models)) {
    Assert-True ([string]$entry.pickerId -notin $reserved) ("Picker ID collides with a Cursor built-in: {0}" -f $entry.pickerId)
    if ($null -ne $entry.ollamaLocalTag -and -not [string]::IsNullOrWhiteSpace([string]$entry.ollamaLocalTag)) {
        Assert-True ([string]$entry.ollamaLocalTag -notmatch '(?i)(:cloud($|-)|-cloud$)') ("Pack local tag cannot be a cloud alias: {0}" -f $entry.id)
    }
}

$kimi = @($pack.models | Where-Object { [string]$_.id -eq 'kimi-k2.7-code' })[0]
Assert-True ($null -ne $kimi) 'Kimi K2.7 Code must stay in the pack.'
Assert-True ([string]$kimi.pickerId -eq 'mc-kimi-k2.7-code') 'Kimi must use the mc- picker prefix to avoid the Cursor built-in.'
Assert-True ([bool]$kimi.requiresGatewayAlias) 'Prefixed Kimi picker IDs require a gateway alias.'

$glm = @($pack.models | Where-Object { [string]$_.id -eq 'glm-5.1' })[0]
Assert-True ([string]$glm.pickerId -eq 'mc-glm-5.1') 'GLM-5.1 must use the mc- picker prefix.'

$embed = @($pack.models | Where-Object { [string]$_.id -eq 'nomic-embed-text' })[0]
Assert-True (-not [bool]$embed.pickerEligible) 'Embedding models must not enter the chat picker.'
Assert-True ([string]$embed.serveClass -eq 'not-chat') 'Embedding models are not chat models.'

$ornith = @($pack.models | Where-Object { [string]$_.id -eq 'ornith-35b' })[0]
Assert-True ([string]$ornith.pickerId -eq 'ornith:35b') 'Ornith 35B must keep the exact Ollama tag as its picker ID.'
Assert-True ([string]$ornith.serveClass -eq 'loopback-ollama') 'Ornith 35B is a loopback Ollama model.'

$pro = @($pack.models | Where-Object { [string]$_.id -eq 'deepseek-v4-pro-0813' })[0]
Assert-True ([bool]$pro.pickerEligible) 'DeepSeek Pro must be in the Cursor pack.'
Assert-True ([string]$pro.serveClass -eq 'cluster-vllm') 'DeepSeek Pro local serve is vLLM or SGLang.'

$pluginJsonPath = Join-Path $PluginRoot '.cursor-plugin\plugin.json'
$rulePath = Join-Path $PluginRoot 'rules\local-models.mdc'
$skillPath = Join-Path $PluginRoot 'skills\use-local-models\SKILL.md'
$commandPath = Join-Path $PluginRoot 'commands\local-models.md'
$readmePath = Join-Path $PluginRoot 'README.md'
$referencePath = Join-Path $PluginRoot 'references\cursor-local-models.json'
foreach ($path in @($pluginJsonPath, $rulePath, $skillPath, $commandPath, $readmePath, $referencePath)) {
    Assert-True (Test-Path -LiteralPath $path -PathType Leaf) ("Missing plugin file: {0}" -f $path)
}

$plugin = Get-Content -LiteralPath $pluginJsonPath -Raw -Encoding UTF8 | ConvertFrom-Json
Assert-True ([string]$plugin.name -eq 'marketing-chief-local-models') 'Plugin name must stay marketing-chief-local-models.'
Assert-True ([string]$plugin.name -match '^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$') 'Plugin name must be path-safe kebab-case.'

$rule = Get-Content -LiteralPath $rulePath -Raw -Encoding UTF8
$skill = Get-Content -LiteralPath $skillPath -Raw -Encoding UTF8
$command = Get-Content -LiteralPath $commandPath -Raw -Encoding UTF8
$projectRule = Get-Content -LiteralPath (Join-Path $projectRoot '.cursor\rules\local-models.mdc') -Raw -Encoding UTF8
$projectCommand = Get-Content -LiteralPath (Join-Path $projectRoot '.cursor\commands\local-models.md') -Raw -Encoding UTF8
Assert-True ($rule -match '(?m)^---[\s\S]*description:[\s\S]*---') 'Plugin rule needs YAML frontmatter with description.'
Assert-True ($skill -match '(?m)^---[\s\S]*name:\s*use-local-models[\s\S]*description:[\s\S]*---') 'Plugin skill needs name and description frontmatter.'
Assert-True ($command -match '(?m)^---[\s\S]*name:\s*local-models[\s\S]*description:[\s\S]*---') 'Plugin command needs name and description frontmatter.'
Assert-True ($projectRule -match 'alwaysApply:\s*true') 'Project Cursor rule must always apply.'
Assert-True ($projectCommand -match 'name:\s*local-models') 'Project Cursor command must be named local-models.'

$docsToSearch = @($rule, $command, $projectRule, $projectCommand)
$requiredPickerIds = @($pack.models | Where-Object { [bool]$_.pickerEligible -and [string]$_.status -eq 'recommended' } | ForEach-Object { [string]$_.pickerId })
foreach ($pickerId in $requiredPickerIds) {
    foreach ($doc in $docsToSearch) {
        Assert-True ($doc.Contains($pickerId)) ("Cursor surface is missing picker ID {0}" -f $pickerId)
    }
}

$reference = Get-Content -LiteralPath $referencePath -Raw -Encoding UTF8 | ConvertFrom-Json
Assert-True (@($reference.models).Count -eq @($pack.models).Count) 'Plugin reference pack must match the committed pack.'
Assert-True ((Get-JoinedInstructions $reference.howToAdd) -eq (Get-JoinedInstructions $generated.howToAdd)) 'Plugin reference howToAdd must match a fresh generator run.'
Assert-True ((Get-InstructionMatchCount $reference.howToAdd 'Enable OpenAI API Key and Override OpenAI Base URL') -eq 0) 'Plugin reference must not propagate localhost Cursor BYOK.'

[pscustomobject]@{
    status = 'valid'
    modelCount = $pack.models.Count
    pickerEligibleCount = @($pack.models | Where-Object { [bool]$_.pickerEligible }).Count
    recommendedChatCount = $requiredPickerIds.Count
    deepseekProPickerId = [string]$pro.pickerId
} | ConvertTo-Json
