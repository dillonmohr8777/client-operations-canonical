[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$files = @(
    (Join-Path $PSScriptRoot 'PROMPT.md'),
    (Join-Path $PSScriptRoot 'Run-MomentumDailyAgentHealth.ps1'),
    (Join-Path $PSScriptRoot 'Install-MomentumDailyAgentHealthTask.ps1'),
    (Join-Path $PSScriptRoot 'Test-MomentumDailyAgentHealthPreflight.ps1'),
    (Join-Path $PSScriptRoot 'Repair-MomentumCodexModelCache.ps1'),
    (Join-Path $PSScriptRoot 'expected-configuration.json')
)

foreach ($file in $files) {
    if (-not (Test-Path -LiteralPath $file)) {
        throw "Required automation file is missing: $file"
    }
    $text = Get-Content -LiteralPath $file -Raw -Encoding UTF8
    $badEncodingMarkers = @(
        (-join @([char]0x00E2, [char]0x20AC, [char]0x201D)),
        (-join @([char]0x00E2, [char]0x20AC, [char]0x201C)),
        (-join @([char]0x00EF, [char]0x00BF, [char]0x00BD)),
        [string][char]0xFFFD
    )
    if (@($badEncodingMarkers | Where-Object { $text.Contains($_) }).Count -gt 0) {
        throw "Mojibake detected in $file"
    }
}

foreach ($script in $files | Where-Object { $_ -like '*.ps1' }) {
    $null = [scriptblock]::Create((Get-Content -LiteralPath $script -Raw -Encoding UTF8))
}

$expected = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'expected-configuration.json') -Raw -Encoding UTF8 | ConvertFrom-Json
if ($expected.hubSpot.portalId -ne '50612503' -or $expected.callRail.accountId -ne '671942387' -or $expected.callRail.excludedAccountId -ne '906396198') {
    throw 'Expected-configuration account boundaries are incorrect.'
}

$prompt = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'PROMPT.md') -Raw -Encoding UTF8
foreach ($required in @(
    'M360-DAILY-{{RUN_DATE_ET}}',
    '{{PREFLIGHT_JSON}}',
    '50612503',
    '671942387',
    'conversations.read',
    'DELIVERY_CONFIRMED',
    'CHANNEL_DELIVERY_CONFIRMED',
    'C06CL0R09A4',
    'at most 12 short lines',
    'at most 10 short lines'
)) {
    if ($prompt -notmatch [regex]::Escape($required)) {
        throw "Prompt contract is missing: $required"
    }
}

$preflight = & (Join-Path $PSScriptRoot 'Test-MomentumDailyAgentHealthPreflight.ps1') -SkipLiveChecks | ConvertFrom-Json
if ($preflight.portalId -ne '50612503' -or $preflight.callRailAccountId -ne '671942387') {
    throw 'Preflight account guards are incorrect.'
}
if (@($preflight.checks | Where-Object { $_.name -eq 'codex-skill-metadata' -and $_.ok -ne $true }).Count -gt 0) {
    throw 'Codex skill metadata validation failed.'
}

$cacheRepair = & (Join-Path $PSScriptRoot 'Repair-MomentumCodexModelCache.ps1') | ConvertFrom-Json
if ($cacheRepair.state -notin @('compatible', 'normalized', 'cache-absent')) {
    throw 'Codex model-cache compatibility repair returned an unexpected state.'
}

$runnerText = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'Run-MomentumDailyAgentHealth.ps1') -Raw -Encoding UTF8
if ($runnerText -notmatch 'mcp_servers\.composio\.enabled=false') {
    throw 'Runner does not suppress the known unauthenticated legacy Composio startup path.'
}
if ($runnerText -notmatch 'features\.memories=false' -or $runnerText -notmatch 'ATTEMPT_STARTUP_DEFECT') {
    throw 'Runner is missing ephemeral-memory or startup-defect safeguards.'
}
if ($runnerText -match 'Enter-CodexModelCacheReadGuard' -or $runnerText -match '\[IO\.FileShare\]::Read') {
    throw 'Runner still contains the model-cache lock that breaks Codex cache writes.'
}
if ($runnerText -notmatch '\$fullPrompt \| & \$codexPath' -or $runnerText -notmatch '''--output-last-message'', \$finalPath,\s*''-''') {
    throw 'Runner does not pass the multiline prompt through stdin.'
}
if ($runnerText -notmatch 'delivery-ledger\.json' -or $runnerText -notmatch 'ALREADY_DELIVERED') {
    throw 'Runner is missing durable delivery idempotency.'
}
if ($runnerText -notmatch 'first call slack_read_channel') {
    throw 'Fallback deduplication is not channel-read first.'
}
if ($runnerText -notmatch 'CHANNEL_DELIVERY_CONFIRMED' -or $runnerText -notmatch 'C06CL0R09A4') {
    throw 'Runner does not require the concise #360marketing delivery.'
}

[pscustomobject]@{
    passed = $true
    filesChecked = $files.Count
    portalId = $preflight.portalId
    callRailAccountId = $preflight.callRailAccountId
    preflightStatus = $preflight.status
} | ConvertTo-Json
