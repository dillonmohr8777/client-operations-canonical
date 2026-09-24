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
if ($runnerText -notmatch '\[switch\]\$LiveDelivery' -or $runnerText -notmatch 'if \(-not \$LiveDelivery\)') {
    throw 'Runner does not require an explicit -LiveDelivery flag before reaching the historical sender path.'
}
$shadowGateIndex = $runnerText.IndexOf('if (-not $LiveDelivery)')
$ledgerSyncIndex = $runnerText.IndexOf('$deliveryLedger = Sync-DeliveryLedgerFromFinals')
$cacheRepairIndex = $runnerText.IndexOf('$cacheRepairJson = & $cacheRepairPath')
$codexInvokeIndex = $runnerText.IndexOf('$fullPrompt | & $codexPath')
if ($shadowGateIndex -lt 0 -or $ledgerSyncIndex -lt 0 -or $cacheRepairIndex -lt 0 -or $codexInvokeIndex -lt 0) {
    throw 'Runner local-shadow and historical-sender checkpoints could not be located.'
}
if ($shadowGateIndex -gt $ledgerSyncIndex -or $shadowGateIndex -gt $cacheRepairIndex -or $shadowGateIndex -gt $codexInvokeIndex) {
    throw 'Runner default local-shadow branch is not before ledger sync, cache repair, and Codex execution.'
}
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
if ($runnerText -notmatch 'hidden-scheduled-tasks\.tsv' -or $runnerText -notmatch 'hidden-wrapper-manifest-default-is-shadow') {
    throw 'Runner is missing the hidden scheduled-task manifest guard.'
}
if ($runnerText -notmatch 'first call slack_read_channel') {
    throw 'Fallback deduplication is not channel-read first.'
}
if ($runnerText -notmatch 'CHANNEL_DELIVERY_CONFIRMED' -or $runnerText -notmatch 'C06CL0R09A4') {
    throw 'Runner does not require the concise #360marketing delivery.'
}

$hiddenTaskManifestPath = 'C:\Users\dillo\.codex\tools\hidden-scheduled-tasks.tsv'
if (-not (Test-Path -LiteralPath $hiddenTaskManifestPath)) {
    throw "Hidden scheduled-task manifest is missing: $hiddenTaskManifestPath"
}
$manifestRows = @()
foreach ($line in (Get-Content -LiteralPath $hiddenTaskManifestPath -Encoding UTF8)) {
    $trimmed = $line.Trim()
    if (-not $trimmed -or $trimmed.StartsWith('#')) {
        continue
    }
    $parts = $line -split "`t", 2
    if ($parts.Count -eq 2 -and $parts[0] -eq 'Momentum360-Daily-Agent-Health') {
        $manifestRows += [pscustomobject]@{
            taskName = $parts[0]
            command = $parts[1]
        }
    }
}
if ($manifestRows.Count -ne 1) {
    throw "Expected exactly one hidden manifest row for Momentum360-Daily-Agent-Health; found $($manifestRows.Count)."
}
$runnerPathPattern = [regex]::Escape((Join-Path $PSScriptRoot 'Run-MomentumDailyAgentHealth.ps1'))
if ($manifestRows[0].command -notmatch $runnerPathPattern) {
    throw 'Hidden scheduled-task manifest row does not point at the restored daily health runner.'
}
if ($manifestRows[0].command -match '-LiveDelivery') {
    throw 'Hidden scheduled-task manifest row would enter the live-delivery path by default.'
}

$runnerPath = Join-Path $PSScriptRoot 'Run-MomentumDailyAgentHealth.ps1'
$defaultRunOutput = & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $runnerPath 2>&1
$defaultRunExit = $LASTEXITCODE
if ($defaultRunExit -ne 0) {
    throw "Default local shadow runner failed: $($defaultRunOutput -join ' ')"
}
$shadowReceipt = Get-ChildItem -LiteralPath (Join-Path $PSScriptRoot 'output') -Filter 'momentum-daily-health-*-shadow-health.json' -File |
    Sort-Object LastWriteTimeUtc -Descending |
    Select-Object -First 1
if (-not $shadowReceipt) {
    throw 'Default local shadow runner did not write a dated JSON receipt.'
}
$shadowHealth = Get-Content -LiteralPath $shadowReceipt.FullName -Raw -Encoding UTF8 | ConvertFrom-Json
if ($shadowHealth.state -ne 'LOCAL_SHADOW_HEALTH_PASS' -or $shadowHealth.liveDeliveryRequested -ne $false -or $shadowHealth.senderReachability -ne 'blocked-by-default-local-shadow') {
    throw 'Default local shadow receipt does not prove the sender is blocked by default.'
}
if (@($shadowHealth.blockers).Count -ne 0) {
    throw "Default local shadow receipt has blockers: $(@($shadowHealth.blockers | ForEach-Object { $_.name }) -join ', ')"
}
if ($shadowHealth.scheduledTask.hiddenManifestActionContainsLiveDeliveryFlag -ne $false) {
    throw 'Default local shadow receipt did not prove the hidden wrapper manifest omits -LiveDelivery.'
}
if (@($shadowHealth.checks | Where-Object { $_.name -eq 'hidden-wrapper-manifest-default-is-shadow' -and $_.ok -eq $true }).Count -ne 1) {
    throw 'Default local shadow receipt did not pass the hidden wrapper manifest guard.'
}

$faultRoot = Join-Path ([IO.Path]::GetTempPath()) ("m360-daily-health-fault-" + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Force -Path $faultRoot | Out-Null
try {
    foreach ($name in @(
        'Run-MomentumDailyAgentHealth.ps1',
        'PROMPT.md',
        'Test-MomentumDailyAgentHealthPreflight.ps1',
        'Repair-MomentumCodexModelCache.ps1',
        'expected-configuration.json'
    )) {
        Copy-Item -LiteralPath (Join-Path $PSScriptRoot $name) -Destination (Join-Path $faultRoot $name) -Force
    }
    New-Item -ItemType Directory -Force -Path (Join-Path $faultRoot 'state') | Out-Null
    Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'state\delivery-ledger.json') -Destination (Join-Path $faultRoot 'state\delivery-ledger.json') -Force
    Remove-Item -LiteralPath (Join-Path $faultRoot 'expected-configuration.json') -Force
    $faultOutput = & powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $faultRoot 'Run-MomentumDailyAgentHealth.ps1') 2>&1
    $faultExit = $LASTEXITCODE
    if ($faultExit -eq 0) {
        throw "Fault-injected local shadow runner unexpectedly passed: $($faultOutput -join ' ')"
    }
    $faultReceipt = Get-ChildItem -LiteralPath (Join-Path $faultRoot 'output') -Filter 'momentum-daily-health-*-shadow-health.json' -File |
        Sort-Object LastWriteTimeUtc -Descending |
        Select-Object -First 1
    if (-not $faultReceipt) {
        throw 'Fault-injected local shadow runner did not write a JSON receipt.'
    }
    $faultHealth = Get-Content -LiteralPath $faultReceipt.FullName -Raw -Encoding UTF8 | ConvertFrom-Json
    if ($faultHealth.state -ne 'LOCAL_SHADOW_HEALTH_FAIL') {
        throw 'Fault-injected local shadow receipt did not fail.'
    }
    if (@($faultHealth.checks | Where-Object { $_.name -eq 'expected-configuration' -and $_.ok -eq $false }).Count -ne 1) {
        throw 'Fault-injected local shadow receipt did not identify the missing expected configuration.'
    }
}
finally {
    $tempRoot = [IO.Path]::GetTempPath()
    $resolvedFaultRoot = [IO.Path]::GetFullPath($faultRoot)
    if ($resolvedFaultRoot.StartsWith($tempRoot, [StringComparison]::OrdinalIgnoreCase) -and (Test-Path -LiteralPath $resolvedFaultRoot)) {
        Remove-Item -LiteralPath $resolvedFaultRoot -Recurse -Force
    }
}

[pscustomobject]@{
    passed = $true
    filesChecked = $files.Count
    portalId = $preflight.portalId
    callRailAccountId = $preflight.callRailAccountId
    preflightStatus = $preflight.status
    defaultShadowReceipt = $shadowReceipt.FullName
    faultInjection = 'missing expected-configuration fails local health'
} | ConvertTo-Json
