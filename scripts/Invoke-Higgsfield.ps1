[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [ValidateSet('Status','Doctor','Cli','Workflows','Mcp')]
    [string]$Action,
    [string]$ProjectRoot,
    [ValidateRange(5,60)]
    [int]$TimeoutSeconds = 15
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version 2.0

if ([string]::IsNullOrWhiteSpace($ProjectRoot)) {
    $ProjectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
}

$capabilityPath = Join-Path $ProjectRoot 'integrations/higgsfield/capability.json'
$schemaPath = Join-Path $ProjectRoot 'schemas/higgsfield-capability.schema.json'
$skillPath = Join-Path $ProjectRoot 'integrations/higgsfield/skills/higgsfield-marketing-chief/SKILL.md'
$cursorMcpPath = Join-Path $ProjectRoot '.cursor/mcp.json'
$cursorSkillPath = Join-Path $ProjectRoot '.cursor/skills/higgsfield-marketing-chief/SKILL.md'
$cursorRulePath = Join-Path $ProjectRoot '.cursor/rules/higgsfield-mcp.mdc'
$mcpTemplatePath = Join-Path $ProjectRoot 'integrations/higgsfield/mcp.cursor.json'

function Read-JsonFile {
    param([string]$Path)
    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        throw "Required Higgsfield file is missing: $Path"
    }
    return Get-Content -LiteralPath $Path -Raw -Encoding UTF8 | ConvertFrom-Json
}

function Get-CliInfo {
    $command = Get-Command higgsfield -ErrorAction SilentlyContinue
    $installed = $null -ne $command
    $version = $null
    if ($installed) {
        try {
            $raw = & $command.Source version 2>&1 | Out-String
            $version = ($raw -replace '\s+', ' ').Trim()
            if ([string]::IsNullOrWhiteSpace($version)) { $version = 'installed-version-unparsed' }
        } catch {
            $version = 'installed-version-unparsed'
        }
    }
    return [pscustomobject][ordered]@{
        installed = $installed
        path = if ($installed) { [string]$command.Source } else { $null }
        version = $version
        authIsHumanHandoff = $true
    }
}

function Test-McpEndpoint {
    param([string]$Url, [int]$TimeoutSeconds, [int[]]$HealthyStatuses)
    $statusCode = 0
    $alive = $false
    $errorText = $null
    try {
        $previous = [Net.ServicePointManager]::SecurityProtocol
        try {
            [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        } catch {
            # Keep the existing protocol set when the runtime already defaults to TLS 1.2+.
        }
        try {
            $response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec $TimeoutSeconds -MaximumRedirection 0 -UseBasicParsing -ErrorAction Stop
            $statusCode = [int]$response.StatusCode
        } catch {
            $response = $_.Exception.Response
            if ($null -ne $response -and $null -ne $response.StatusCode) {
                $statusCode = [int]$response.StatusCode
            } else {
                $errorText = [string]$_.Exception.Message
            }
        } finally {
            try { [Net.ServicePointManager]::SecurityProtocol = $previous } catch { }
        }
        $alive = $HealthyStatuses -contains $statusCode
    } catch {
        $errorText = [string]$_.Exception.Message
    }
    return [pscustomobject][ordered]@{
        url = $Url
        httpStatus = $statusCode
        alive = $alive
        authenticatedProbe = $false
        error = $errorText
        note = 'Unauthenticated GET only. 401 means the hosted MCP is up and OAuth-gated.'
    }
}

function Get-RequiredWorkflowIds {
    return @(
        'ad-multiplier','brand-asset-creation','character-sheet','faceless-video','narrator',
        'product-photoshoot','subtitles','thumbnail-generation','ugc-product-video','ugc-review-video',
        'ugc-try-on-video','ugc-tutorial-video','ugc-unboxing-video','ugc-website-video','video-editing',
        'website-builder-flow'
    )
}

$capability = Read-JsonFile $capabilityPath
$cli = Get-CliInfo
$healthyStatuses = @($capability.mcp.unauthenticatedProbeHealthyStatuses)
if ($healthyStatuses.Count -eq 0) { $healthyStatuses = @(200, 401, 405, 406) }

switch ($Action) {
    'Status' {
        $result = [pscustomobject][ordered]@{
            action = 'Status'
            checkedAt = [DateTimeOffset]::UtcNow.ToString('o')
            capabilityId = [string]$capability.id
            productionSurfaces = @($capability.productionRank | Where-Object { [bool]$_.production } | ForEach-Object { [string]$_.id })
            nonProductionSurfaces = @($capability.productionRank | Where-Object { -not [bool]$_.production } | ForEach-Object { [string]$_.id })
            mcpUrl = [string]$capability.mcp.url
            cursorMcpConfigPresent = Test-Path -LiteralPath $cursorMcpPath -PathType Leaf
            skillPresent = Test-Path -LiteralPath $skillPath -PathType Leaf
            cli = $cli
            chatgptPluginIsProduction = $false
            spendIsApprovalGated = $true
            containsSecrets = $false
        }
        $result | ConvertTo-Json -Depth 8
    }
    'Doctor' {
        $failures = New-Object System.Collections.ArrayList
        $checks = New-Object System.Collections.ArrayList

        function Add-DoctorCheck {
            param([string]$Name, [bool]$Passed, [string]$Detail)
            [void]$checks.Add([pscustomobject][ordered]@{ name = $Name; passed = $Passed; detail = $Detail })
            if (-not $Passed) { [void]$failures.Add($Name) }
        }

        foreach ($path in @($capabilityPath, $schemaPath, $skillPath, $cursorMcpPath, $cursorSkillPath, $cursorRulePath, $mcpTemplatePath)) {
            Add-DoctorCheck ("file:" + [IO.Path]::GetFileName($path)) (Test-Path -LiteralPath $path -PathType Leaf) $path
        }

        Add-DoctorCheck 'schemaVersion' ([int]$capability.schemaVersion -eq 1) ([string]$capability.schemaVersion)
        Add-DoctorCheck 'containsSecrets-false' (($capability.containsSecrets -is [bool]) -and -not [bool]$capability.containsSecrets) 'must-be-false'
        Add-DoctorCheck 'mcp-url' ([string]$capability.mcp.url -ceq 'https://mcp.higgsfield.ai/mcp') ([string]$capability.mcp.url)
        Add-DoctorCheck 'chatgpt-plugin-not-production' (-not [bool](@($capability.productionRank | Where-Object { $_.id -eq 'chatgpt-plugin' })[0].production)) 'chatgpt-plugin-must-stay-non-production'
        Add-DoctorCheck 'clip-rule' ([bool]$capability.clipLimits.neverStopAtPlanTalk) 'never-stop-at-plan-talk'
        Add-DoctorCheck 'logo-lock' ([bool]$capability.clientCreativeRules.requireVerifiedLogo -and [bool]$capability.clientCreativeRules.requireApprovedReferenceImage) 'logo-and-reference-required'

        $workflowIds = @($capability.workflows | ForEach-Object { [string]$_.id })
        $required = Get-RequiredWorkflowIds
        $missing = @($required | Where-Object { $_ -notin $workflowIds })
        $extra = @($workflowIds | Where-Object { $_ -notin $required })
        Add-DoctorCheck 'workflow-count-16' ($workflowIds.Count -eq 16) ("count={0}" -f $workflowIds.Count)
        Add-DoctorCheck 'workflow-catalog-exact' ($missing.Count -eq 0 -and $extra.Count -eq 0) ("missing={0};extra={1}" -f ($missing -join ','), ($extra -join ','))

        $cursorMcp = Read-JsonFile $cursorMcpPath
        $templateMcp = Read-JsonFile $mcpTemplatePath
        $cursorUrl = [string]$cursorMcp.mcpServers.higgsfield.url
        $templateUrl = [string]$templateMcp.mcpServers.higgsfield.url
        Add-DoctorCheck 'cursor-mcp-url' ($cursorUrl -ceq 'https://mcp.higgsfield.ai/mcp') $cursorUrl
        Add-DoctorCheck 'template-mcp-url' ($templateUrl -ceq 'https://mcp.higgsfield.ai/mcp') $templateUrl

        $spendGate = @($capability.approvalGates | Where-Object { $_ -match 'credit spend' }).Count -ge 1
        Add-DoctorCheck 'spend-gate' $spendGate 'credit-spend-must-be-gated'

        $secretHits = @(Select-String -Path @(
            $capabilityPath, $schemaPath, $skillPath, $cursorMcpPath, $mcpTemplatePath
        ) -Pattern '(?i)(sk-[A-Za-z0-9]{16,}|hf_[A-Za-z0-9]{16,}|Bearer [A-Za-z0-9._\-]{16,}|password\s*=\s*\S+)' -ErrorAction SilentlyContinue | Where-Object { $null -ne $_ })
        Add-DoctorCheck 'no-secret-shaped-strings' ($secretHits.Count -eq 0) ("hits={0}" -f $secretHits.Count)

        $failureArray = @($failures.ToArray())
        $checkArray = @($checks.ToArray())
        $doctorStatus = 'failed'
        if ($failureArray.Count -eq 0) { $doctorStatus = 'passed' }
        $result = [pscustomobject][ordered]@{
            action = 'Doctor'
            checkedAt = [DateTimeOffset]::UtcNow.ToString('o')
            status = $doctorStatus
            failureCount = $failureArray.Count
            failures = $failureArray
            checks = $checkArray
            containsSecrets = $false
        }
        $result | ConvertTo-Json -Depth 8
        if ($failureArray.Count -gt 0) { exit 1 }
    }
    'Cli' {
        [pscustomobject][ordered]@{
            action = 'Cli'
            checkedAt = [DateTimeOffset]::UtcNow.ToString('o')
            cli = $cli
            nextHumanAuth = if ($cli.installed) { 'higgsfield auth login' } else { 'Install the CLI first, then higgsfield auth login' }
            containsSecrets = $false
        } | ConvertTo-Json -Depth 6
    }
    'Workflows' {
        [pscustomobject][ordered]@{
            action = 'Workflows'
            checkedAt = [DateTimeOffset]::UtcNow.ToString('o')
            count = @($capability.workflows).Count
            workflows = @($capability.workflows)
            loadTool = 'get_workflow_instructions'
            neverStopAtPlanTalk = [bool]$capability.clipLimits.neverStopAtPlanTalk
            containsSecrets = $false
        } | ConvertTo-Json -Depth 6
    }
    'Mcp' {
        $probe = Test-McpEndpoint -Url ([string]$capability.mcp.url) -TimeoutSeconds $TimeoutSeconds -HealthyStatuses $healthyStatuses
        $result = [pscustomobject][ordered]@{
            action = 'Mcp'
            checkedAt = [DateTimeOffset]::UtcNow.ToString('o')
            probe = $probe
            status = if ($probe.alive) { 'passed' } else { 'failed' }
            containsSecrets = $false
        }
        $result | ConvertTo-Json -Depth 6
        if (-not $probe.alive) { exit 1 }
    }
}
