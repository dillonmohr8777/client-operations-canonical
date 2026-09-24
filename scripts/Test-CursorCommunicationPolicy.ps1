[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version 2.0

$projectRoot = Split-Path -Parent $PSScriptRoot
$policyPath = Join-Path $projectRoot 'policies\cursor-communication-policy.json'
$workflowPath = Join-Path $projectRoot 'workflows\marketing-chief.workflow.json'
$agentsPath = Join-Path $projectRoot 'AGENTS.md'
$watchtowerPath = Join-Path $PSScriptRoot 'Invoke-MarketingChiefWatchtower.ps1'
$checks = New-Object System.Collections.ArrayList

function Add-Check {
    param([string]$Name, [bool]$Passed)
    [void]$checks.Add([pscustomobject][ordered]@{ name = $Name; passed = $Passed })
    if (-not $Passed) { throw "Cursor communication policy check failed: $Name" }
}

$policy = Get-Content -LiteralPath $policyPath -Raw -Encoding UTF8 | ConvertFrom-Json
$workflow = Get-Content -LiteralPath $workflowPath -Raw -Encoding UTF8 | ConvertFrom-Json
$agents = Get-Content -LiteralPath $agentsPath -Raw -Encoding UTF8
$watchtower = Get-Content -LiteralPath $watchtowerPath -Raw -Encoding UTF8

Add-Check 'policy schema is supported' ([int]$policy.schemaVersion -eq 1)
Add-Check 'operating mode is automatic prepare with human-approved send' (
    [string]$policy.operatingMode -ceq 'automatic_prepare_human_approved_send'
)
Add-Check 'preview is required before delivery' ([bool]$policy.preview.requiredBeforeDelivery)
Add-Check 'Cursor cannot send without approval' (-not [bool]$policy.authority.cursorMaySendWithoutApproval)
Add-Check 'Cursor cannot post' (-not [bool]$policy.authority.cursorMayPost)
Add-Check 'Marketing Chief owns the notification' ([bool]$policy.authority.marketingChiefOwnsNotification)
Add-Check 'latest information is required' ([bool]$policy.latestInformation.required)

$prohibited = @($policy.paidMediaLanguage.prohibitedClaims | ForEach-Object { ([string]$_).ToLowerInvariant() })
foreach ($phrase in @('zero conversions','no conversions','not enough conversions','insufficient conversions')) {
    Add-Check "paid-media client language prohibits: $phrase" ($prohibited -contains $phrase)
}
Add-Check 'neutral pending-validation fallback exists' (
    [string]$policy.paidMediaLanguage.fallback -ceq 'Conversion reporting is pending validation.'
)
Add-Check 'workflow loads the communication policy' (
    [string]$workflow.authority.cursorCommunicationPolicy -ceq 'policies/cursor-communication-policy.json' -and
    -not [bool]$workflow.authority.cursorMaySendWithoutExactPreviewApproval
)
Add-Check 'project instructions bind Cursor to the policy' (
    $agents.Contains('policies/cursor-communication-policy.json') -and
    $agents.Contains('Cursor may automatically triage')
)
Add-Check 'Watchtower prompt binds workers to the policy' (
    $watchtower.Contains('Read policies/cursor-communication-policy.json') -and
    $watchtower.Contains('it may never answer, post, or send')
)

[pscustomobject][ordered]@{
    status = 'passed'
    checkCount = $checks.Count
    checks = @($checks)
    containsSecrets = $false
} | ConvertTo-Json -Depth 6
