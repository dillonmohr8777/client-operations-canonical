[CmdletBinding()]
param(
    [string]$ProjectRoot
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version 2.0

if ([string]::IsNullOrWhiteSpace($ProjectRoot)) {
    $ProjectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
}

$invoke = Join-Path $PSScriptRoot 'Invoke-Higgsfield.ps1'
$install = Join-Path $PSScriptRoot 'Install-HiggsfieldCapability.ps1'
$capabilityPath = Join-Path $ProjectRoot 'integrations/higgsfield/capability.json'
$schemaPath = Join-Path $ProjectRoot 'schemas/higgsfield-capability.schema.json'
$agentsPath = Join-Path $ProjectRoot 'AGENTS.md'
$readmePath = Join-Path $ProjectRoot 'README.md'
$workflowPath = Join-Path $ProjectRoot 'workflows/marketing-chief.workflow.json'
$bindingsPath = Join-Path $ProjectRoot 'integrations/buzz/stack.bindings.json'
$checks = New-Object System.Collections.ArrayList
$failed = $false

function Add-Check {
    param([string]$Name, [bool]$Passed, [string]$Detail)
    [void]$checks.Add([pscustomobject][ordered]@{ name = $Name; passed = $Passed; detail = $Detail })
    if (-not $Passed) { $script:failed = $true }
}

function Invoke-JsonAction {
    param([string[]]$Arguments)
    $output = & pwsh -NoProfile -File $invoke @Arguments
    if ($LASTEXITCODE -ne 0) { throw "Invoke-Higgsfield failed: $($Arguments -join ' ')" }
    return ($output | Out-String | ConvertFrom-Json)
}

foreach ($path in @(
    $invoke, $install, $capabilityPath, $schemaPath,
    (Join-Path $ProjectRoot 'integrations/higgsfield/README.md'),
    (Join-Path $ProjectRoot 'integrations/higgsfield/mcp.cursor.json'),
    (Join-Path $ProjectRoot 'integrations/higgsfield/skills/higgsfield-marketing-chief/SKILL.md'),
    (Join-Path $ProjectRoot 'integrations/higgsfield/references/surfaces.md'),
    (Join-Path $ProjectRoot 'integrations/higgsfield/references/workflows.md'),
    (Join-Path $ProjectRoot '.cursor/mcp.json'),
    (Join-Path $ProjectRoot '.cursor/rules/higgsfield-mcp.mdc'),
    (Join-Path $ProjectRoot '.cursor/skills/higgsfield-marketing-chief/SKILL.md')
)) {
    Add-Check ("exists:" + [IO.Path]::GetFileName($path)) (Test-Path -LiteralPath $path -PathType Leaf) $path
}

foreach ($script in @($invoke, $install, $PSCommandPath)) {
    $parseErrors = $null
    [void][Management.Automation.Language.Parser]::ParseFile($script, [ref]$null, [ref]$parseErrors)
    Add-Check ("parse:" + [IO.Path]::GetFileName($script)) (@($parseErrors).Count -eq 0) ("errors={0}" -f @($parseErrors).Count)
}

$capability = Get-Content -LiteralPath $capabilityPath -Raw -Encoding UTF8 | ConvertFrom-Json
$schema = Get-Content -LiteralPath $schemaPath -Raw -Encoding UTF8 | ConvertFrom-Json
Add-Check 'capability-json' ($null -ne $capability) 'parsed'
Add-Check 'schema-json' ($null -ne $schema) 'parsed'
Add-Check 'schemaVersion' ([int]$capability.schemaVersion -eq 1) ([string]$capability.schemaVersion)
Add-Check 'id' ([string]$capability.id -ceq 'higgsfield') ([string]$capability.id)
Add-Check 'secrets-false' (($capability.containsSecrets -is [bool]) -and -not [bool]$capability.containsSecrets) 'false'
Add-Check 'mcp-url' ([string]$capability.mcp.url -ceq 'https://mcp.higgsfield.ai/mcp') ([string]$capability.mcp.url)
Add-Check 'workflow-count' (@($capability.workflows).Count -eq 16) ("count={0}" -f @($capability.workflows).Count)

$chatgpt = @($capability.productionRank | Where-Object { $_.id -eq 'chatgpt-plugin' })[0]
Add-Check 'chatgpt-not-production' (($null -ne $chatgpt) -and -not [bool]$chatgpt.production) 'chatgpt-plugin-disabled'
$cursorMcp = @($capability.productionRank | Where-Object { $_.id -eq 'cursor-mcp' })[0]
Add-Check 'cursor-mcp-production' (($null -ne $cursorMcp) -and [bool]$cursorMcp.production) 'cursor-mcp-enabled'

$cursorMcpJson = Get-Content -LiteralPath (Join-Path $ProjectRoot '.cursor/mcp.json') -Raw -Encoding UTF8 | ConvertFrom-Json
Add-Check 'project-mcp-url' ([string]$cursorMcpJson.mcpServers.higgsfield.url -ceq 'https://mcp.higgsfield.ai/mcp') ([string]$cursorMcpJson.mcpServers.higgsfield.url)

$status = Invoke-JsonAction @('-Action','Status','-ProjectRoot',$ProjectRoot)
Add-Check 'status-action' ([string]$status.action -ceq 'Status') ([string]$status.action)
Add-Check 'status-no-chatgpt-prod' (-not [bool]$status.chatgptPluginIsProduction) 'false'
Add-Check 'status-spend-gated' ([bool]$status.spendIsApprovalGated) 'true'

$doctor = Invoke-JsonAction @('-Action','Doctor','-ProjectRoot',$ProjectRoot)
Add-Check 'doctor-passed' ([string]$doctor.status -ceq 'passed') ("failures={0}" -f ($doctor.failures -join ','))

$workflows = Invoke-JsonAction @('-Action','Workflows','-ProjectRoot',$ProjectRoot)
Add-Check 'workflows-16' ([int]$workflows.count -eq 16) ([string]$workflows.count)
Add-Check 'never-plan-talk' ([bool]$workflows.neverStopAtPlanTalk) 'true'

$cli = Invoke-JsonAction @('-Action','Cli','-ProjectRoot',$ProjectRoot)
Add-Check 'cli-auth-handoff' ([bool]$cli.cli.authIsHumanHandoff) 'true'
Add-Check 'cli-no-secrets' (-not [bool]$cli.containsSecrets) 'false'

$dryRunOutput = & pwsh -NoProfile -File $install @('-ProjectRoot',$ProjectRoot,'-DryRun')
if ($LASTEXITCODE -ne 0) { throw 'Install dry-run failed.' }
$dryRun = $dryRunOutput | Out-String | ConvertFrom-Json
Add-Check 'install-dry-run' ([string]$dryRun.status -ceq 'dry-run') ([string]$dryRun.status)
$authMentions = @(@($dryRun.humanHandoffs) | Where-Object { $_ -match 'auth login|OAuth' })
Add-Check 'install-mentions-auth-handoff' ($authMentions.Count -ge 1) 'human-auth-present'
Add-Check 'install-no-secrets' (-not [bool]$dryRun.containsSecrets) 'false'

$agents = Get-Content -LiteralPath $agentsPath -Raw -Encoding UTF8
Add-Check 'agents-section' ($agents -match 'Higgsfield creative capability') 'AGENTS.md'
Add-Check 'agents-chatgpt-nonprod' ($agents -match 'ChatGPT plugin is not the production path') 'plugin-demoted'
Add-Check 'agents-plan-talk' ($agents -match 'I have a good plan') 'plan-talk-blocked'

$readme = Get-Content -LiteralPath $readmePath -Raw -Encoding UTF8
Add-Check 'readme-section' ($readme -match 'Higgsfield capability') 'README.md'

$workflow = Get-Content -LiteralPath $workflowPath -Raw -Encoding UTF8 | ConvertFrom-Json
Add-Check 'workflow-capability' ($null -ne $workflow.capabilities.higgsfield) 'marketing-chief.workflow.json'
Add-Check 'workflow-mcp-url' ([string]$workflow.capabilities.higgsfield.mcpUrl -ceq 'https://mcp.higgsfield.ai/mcp') ([string]$workflow.capabilities.higgsfield.mcpUrl)

$bindings = Get-Content -LiteralPath $bindingsPath -Raw -Encoding UTF8 | ConvertFrom-Json
$higgsBinding = @($bindings.bindings | Where-Object { $_.id -eq 'higgsfield' })[0]
Add-Check 'buzz-binding' ($null -ne $higgsBinding) 'stack.bindings.json'
Add-Check 'buzz-binding-gated' ([string]$higgsBinding.mode -ceq 'read-first-approval-gated') ([string]$higgsBinding.mode)

$contentCreative = Get-Content -LiteralPath (Join-Path $ProjectRoot 'integrations/buzz/prompts/content-creative.md') -Raw -Encoding UTF8
Add-Check 'content-creative-higgsfield' ($contentCreative -match 'Higgsfield') 'content-creative.md'

$checkArray = @($checks.ToArray())
$testStatus = 'passed'
if ($failed) { $testStatus = 'failed' }
$result = [pscustomobject][ordered]@{
    status = $testStatus
    checkedAt = [DateTimeOffset]::UtcNow.ToString('o')
    checkCount = $checkArray.Count
    failedCount = @($checkArray | Where-Object { -not $_.passed }).Count
    checks = $checkArray
    containsSecrets = $false
}
$result | ConvertTo-Json -Depth 8
if ($failed) { exit 1 }
