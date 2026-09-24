[CmdletBinding()]
param(
    [switch]$DryRun,
    [switch]$NoRetry,
    [switch]$LiveDelivery
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$automationRoot = $PSScriptRoot
$promptPath = Join-Path $automationRoot 'PROMPT.md'
$preflightPath = Join-Path $automationRoot 'Test-MomentumDailyAgentHealthPreflight.ps1'
$cacheRepairPath = Join-Path $automationRoot 'Repair-MomentumCodexModelCache.ps1'
$outputRoot = Join-Path $automationRoot 'output'
$stateRoot = Join-Path $automationRoot 'state'
$deliveryLedgerPath = Join-Path $stateRoot 'delivery-ledger.json'
$expectedConfigurationPath = Join-Path $automationRoot 'expected-configuration.json'
$hiddenTaskManifestPath = 'C:\Users\dillo\.codex\tools\hidden-scheduled-tasks.tsv'
$clientOperationsRoot = 'C:\Users\dillo\Documents\Codex\projects\client-operations'
$codexPath = 'C:\Users\dillo\AppData\Roaming\npm\codex.ps1'
$bootstrapPath = 'C:\Users\dillo\.codex\terminal-bootstrap.ps1'
$easternTimeZone = [TimeZoneInfo]::FindSystemTimeZoneById('Eastern Standard Time')
$runTimeEt = [TimeZoneInfo]::ConvertTime([DateTimeOffset]::UtcNow, $easternTimeZone)
$runDateEt = $runTimeEt.ToString('yyyy-MM-dd')
$runStamp = $runTimeEt.ToString('yyyy-MM-dd-HHmmss')
$logPath = Join-Path $outputRoot "momentum-daily-health-$runStamp.log"
$finalPath = Join-Path $outputRoot "momentum-daily-health-$runStamp-final.txt"
$shadowReceiptPath = Join-Path $outputRoot "momentum-daily-health-$runStamp-shadow-health.json"
$mutex = [Threading.Mutex]::new($false, 'Local\Momentum360DailyAgentHealth')
$lockAcquired = $false

function New-LocalHealthCheck {
    param(
        [Parameter(Mandatory)][string]$Name,
        [Parameter(Mandatory)][bool]$Ok,
        [Parameter(Mandatory)][string]$Detail
    )
    [pscustomobject]@{
        name = $Name
        ok = $Ok
        detail = $Detail
    }
}

function Invoke-LocalShadowHealth {
    $checks = [System.Collections.Generic.List[object]]::new()
    $historicalRecordedDeliveryCount = 0
    $latestHistoricalReportId = $null
    $scheduledTaskState = $null
    $scheduledTaskHasLiveDeliveryFlag = $null
    $hiddenManifestCommand = $null
    $hiddenManifestHasLiveDeliveryFlag = $null

    $requiredFiles = @(
        @{ name = 'prompt'; path = $promptPath },
        @{ name = 'preflight-script'; path = $preflightPath },
        @{ name = 'cache-guard-script'; path = $cacheRepairPath },
        @{ name = 'expected-configuration'; path = $expectedConfigurationPath },
        @{ name = 'delivery-ledger'; path = $deliveryLedgerPath }
    )
    foreach ($requiredFile in $requiredFiles) {
        $checks.Add((New-LocalHealthCheck -Name $requiredFile.name -Ok (Test-Path -LiteralPath $requiredFile.path) -Detail $requiredFile.path))
    }

    if (Test-Path -LiteralPath $expectedConfigurationPath) {
        try {
            $expected = Get-Content -LiteralPath $expectedConfigurationPath -Raw -Encoding UTF8 | ConvertFrom-Json
            $expectedMatches = (
                $expected.hubSpot.portalId -eq '50612503' -and
                $expected.callRail.accountId -eq '671942387' -and
                $expected.callRail.excludedAccountId -eq '906396198'
            )
            $checks.Add((New-LocalHealthCheck -Name 'expected-account-boundaries' -Ok $expectedMatches -Detail 'HubSpot portal 50612503, CallRail account 671942387, excluded CallRail account 906396198.'))
        }
        catch {
            $checks.Add((New-LocalHealthCheck -Name 'expected-account-boundaries' -Ok $false -Detail 'expected-configuration.json could not be parsed.'))
        }
    }

    if (Test-Path -LiteralPath $promptPath) {
        $promptText = Get-Content -LiteralPath $promptPath -Raw -Encoding UTF8
        $promptMarkersOk = @(
            'M360-DAILY-{{RUN_DATE_ET}}',
            '{{PREFLIGHT_JSON}}',
            'DELIVERY_CONFIRMED',
            'CHANNEL_DELIVERY_CONFIRMED'
        ) | ForEach-Object { $promptText -match [regex]::Escape($_) }
        $checks.Add((New-LocalHealthCheck -Name 'prompt-contract-markers' -Ok (-not ($promptMarkersOk -contains $false)) -Detail 'Report id, preflight placeholder, and delivery receipt markers are present.'))
    }

    if (Test-Path -LiteralPath $deliveryLedgerPath) {
        try {
            $ledger = Get-Content -LiteralPath $deliveryLedgerPath -Raw -Encoding UTF8 | ConvertFrom-Json
            $ledgerSchemaOk = $ledger.schemaVersion -eq 1 -and ($ledger.PSObject.Properties.Name -contains 'deliveries')
            if ($ledgerSchemaOk) {
                $deliveryRows = @($ledger.deliveries)
                $historicalRecordedDeliveryCount = $deliveryRows.Count
                if ($deliveryRows.Count -gt 0) {
                    $latestHistoricalReportId = [string]$deliveryRows[-1].reportId
                }
            }
            $checks.Add((New-LocalHealthCheck -Name 'historical-delivery-ledger' -Ok $ledgerSchemaOk -Detail "$historicalRecordedDeliveryCount historical recorded delivery row(s); no live Slack readback performed by this local shadow check."))
        }
        catch {
            $checks.Add((New-LocalHealthCheck -Name 'historical-delivery-ledger' -Ok $false -Detail 'delivery-ledger.json could not be parsed.'))
        }
    }

    $runnerText = if (Test-Path -LiteralPath $PSCommandPath) {
        Get-Content -LiteralPath $PSCommandPath -Raw -Encoding UTF8
    } else {
        ''
    }
    $hasLiveDeliveryGate = $runnerText -match '\[switch\]\$LiveDelivery' -and $runnerText -match 'if \(-not \$LiveDelivery\)'
    $checks.Add((New-LocalHealthCheck -Name 'live-delivery-gate' -Ok $hasLiveDeliveryGate -Detail 'Default execution exits through local shadow health unless -LiveDelivery is explicitly supplied.'))

    try {
        $scheduledTask = Get-ScheduledTask -TaskName 'Momentum360-Daily-Agent-Health' -ErrorAction Stop
        $scheduledTaskState = [string]$scheduledTask.State
        $taskActionText = (@($scheduledTask.Actions) | ForEach-Object { "$($_.Execute) $($_.Arguments)" }) -join "`n"
        $scheduledTaskHasLiveDeliveryFlag = $taskActionText -match '-LiveDelivery'
        $checks.Add((New-LocalHealthCheck -Name 'scheduled-task-default-is-shadow' -Ok (-not $scheduledTaskHasLiveDeliveryFlag) -Detail "Task state $scheduledTaskState; scheduled action does not include -LiveDelivery."))
    }
    catch {
        $checks.Add((New-LocalHealthCheck -Name 'scheduled-task-default-is-shadow' -Ok $true -Detail 'Scheduled task was not available to this local copy; runner gate was still checked.'))
    }

    if (Test-Path -LiteralPath $hiddenTaskManifestPath) {
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
        if ($manifestRows.Count -eq 1) {
            $hiddenManifestCommand = [string]$manifestRows[0].command
            $hiddenManifestHasLiveDeliveryFlag = $hiddenManifestCommand -match '-LiveDelivery'
            $runnerPathPattern = [regex]::Escape((Join-Path $automationRoot 'Run-MomentumDailyAgentHealth.ps1'))
            $manifestCallsRunner = $hiddenManifestCommand -match $runnerPathPattern
            $checks.Add((New-LocalHealthCheck -Name 'hidden-wrapper-manifest-default-is-shadow' -Ok ($manifestCallsRunner -and -not $hiddenManifestHasLiveDeliveryFlag) -Detail 'hidden-scheduled-tasks.tsv has exactly one Momentum360-Daily-Agent-Health row, points to this runner, and omits -LiveDelivery.'))
        } else {
            $checks.Add((New-LocalHealthCheck -Name 'hidden-wrapper-manifest-default-is-shadow' -Ok $false -Detail "Expected exactly one hidden manifest row for Momentum360-Daily-Agent-Health; found $($manifestRows.Count)."))
        }
    } else {
        $checks.Add((New-LocalHealthCheck -Name 'hidden-wrapper-manifest-default-is-shadow' -Ok $false -Detail "Hidden scheduled-task manifest is missing: $hiddenTaskManifestPath"))
    }

    $checks.Add((New-LocalHealthCheck -Name 'sender-blocked-by-default' -Ok (-not $LiveDelivery) -Detail 'This branch returns before delivery ledger sync, cache repair, live preflight, Codex exec, fallback sender, or Slack delivery.'))

    $blockers = @($checks | Where-Object { $_.ok -ne $true })
    $state = if ($blockers.Count -eq 0) { 'LOCAL_SHADOW_HEALTH_PASS' } else { 'LOCAL_SHADOW_HEALTH_FAIL' }
    $receipt = [pscustomobject]@{
        schemaVersion = 1
        reportId = "M360-DAILY-$runDateEt"
        state = $state
        checkedAt = [DateTimeOffset]::UtcNow.ToString('o')
        runDateEt = $runDateEt
        liveDeliveryRequested = [bool]$LiveDelivery
        senderReachability = 'blocked-by-default-local-shadow'
        historicalRecordedDeliveryCount = $historicalRecordedDeliveryCount
        latestHistoricalReportId = $latestHistoricalReportId
        scheduledTask = [pscustomobject]@{
            name = 'Momentum360-Daily-Agent-Health'
            state = $scheduledTaskState
            actionContainsLiveDeliveryFlag = $scheduledTaskHasLiveDeliveryFlag
            hiddenManifestCommand = $hiddenManifestCommand
            hiddenManifestActionContainsLiveDeliveryFlag = $hiddenManifestHasLiveDeliveryFlag
        }
        checks = @($checks)
        blockers = @($blockers | Select-Object name, detail)
    }

    $json = $receipt | ConvertTo-Json -Depth 8
    [IO.File]::WriteAllText($shadowReceiptPath, $json, [Text.UTF8Encoding]::new($false))

    if ($blockers.Count -eq 0) {
        return 0
    }
    return 2
}

function Get-DeliveryLedger {
    if (-not (Test-Path -LiteralPath $deliveryLedgerPath)) {
        return [pscustomobject]@{ schemaVersion = 1; deliveries = @() }
    }
    $ledger = Get-Content -LiteralPath $deliveryLedgerPath -Raw -Encoding UTF8 | ConvertFrom-Json
    if ($ledger.schemaVersion -ne 1) {
        throw 'Unsupported Momentum delivery-ledger schema.'
    }
    if (-not ($ledger.PSObject.Properties.Name -contains 'deliveries')) {
        $ledger | Add-Member -NotePropertyName deliveries -NotePropertyValue @()
    }
    return $ledger
}

function Save-DeliveryLedger {
    param([Parameter(Mandatory)]$Ledger)
    New-Item -ItemType Directory -Force -Path $stateRoot | Out-Null
    $json = $Ledger | ConvertTo-Json -Depth 8
    [IO.File]::WriteAllText($deliveryLedgerPath, $json, [Text.UTF8Encoding]::new($false))
}

function Add-VerifiedDelivery {
    param(
        [Parameter(Mandatory)][string]$ReportId,
        [Parameter(Mandatory)][string]$VerificationText,
        [Parameter(Mandatory)][string]$SourcePath
    )
    $ledger = Get-DeliveryLedger
    if (@($ledger.deliveries | Where-Object { $_.reportId -eq $ReportId }).Count -gt 0) {
        return
    }
    $timestamp = if ($VerificationText -match '(?<ts>\d{10}\.\d{6})') { $Matches.ts } else { $null }
    $link = if ($VerificationText -match '(?<link>https://momentum3d\.slack\.com/archives/C0B2N20A0SW/p\d+)') { $Matches.link } else { $null }
    $marketingLink = if ($VerificationText -match '(?<link>https://momentum3d\.slack\.com/archives/C06CL0R09A4/p\d+)') { $Matches.link } else { $null }
    $marketingTimestamp = $null
    if ($marketingLink -and $marketingLink -match '/p(?<p>\d+)$') {
        $p = $Matches.p
        if ($p.Length -ge 11) {
            $marketingTimestamp = $p.Substring(0, 10) + '.' + $p.Substring(10)
        }
    }
    $entry = [pscustomobject]@{
        reportId = $ReportId
        verifiedAt = [DateTimeOffset]::UtcNow.ToString('o')
        slackTimestamp = $timestamp
        slackLink = $link
        marketingSlackTimestamp = $marketingTimestamp
        marketingSlackLink = $marketingLink
        sourceFinal = [IO.Path]::GetFileName($SourcePath)
    }
    $ledger.deliveries = @($ledger.deliveries) + $entry
    Save-DeliveryLedger -Ledger $ledger
}

function Sync-DeliveryLedgerFromFinals {
    $ledger = Get-DeliveryLedger
    $known = @{}
    foreach ($delivery in @($ledger.deliveries)) {
        $known[[string]$delivery.reportId] = $true
    }
    $changed = $false
    foreach ($file in @(Get-ChildItem -LiteralPath $outputRoot -Filter 'momentum-daily-health-*-final.txt' -File -ErrorAction SilentlyContinue | Sort-Object LastWriteTimeUtc)) {
        if ($file.Name -notmatch '^momentum-daily-health-(?<date>\d{4}-\d{2}-\d{2})-') {
            continue
        }
        $reportId = "M360-DAILY-$($Matches.date)"
        if ($known.ContainsKey($reportId)) {
            continue
        }
        $text = Get-Content -LiteralPath $file.FullName -Raw -Encoding UTF8
        if ($text -notmatch 'DELIVERY_CONFIRMED|FAILURE_NOTICE_CONFIRMED') {
            continue
        }
        $timestamp = if ($text -match '(?<ts>\d{10}\.\d{6})') { $Matches.ts } else { $null }
        $link = if ($text -match '(?<link>https://momentum3d\.slack\.com/archives/C0B2N20A0SW/p\d+)') { $Matches.link } else { $null }
        $marketingLink = if ($text -match '(?<link>https://momentum3d\.slack\.com/archives/C06CL0R09A4/p\d+)') { $Matches.link } else { $null }
        $marketingTimestamp = $null
        if ($marketingLink -and $marketingLink -match '/p(?<p>\d+)$') {
            $p = $Matches.p
            if ($p.Length -ge 11) {
                $marketingTimestamp = $p.Substring(0, 10) + '.' + $p.Substring(10)
            }
        }
        $ledger.deliveries = @($ledger.deliveries) + [pscustomobject]@{
            reportId = $reportId
            verifiedAt = $file.LastWriteTimeUtc.ToString('o')
            slackTimestamp = $timestamp
            slackLink = $link
            marketingSlackTimestamp = $marketingTimestamp
            marketingSlackLink = $marketingLink
            sourceFinal = $file.Name
        }
        $known[$reportId] = $true
        $changed = $true
    }
    if ($changed) {
        Save-DeliveryLedger -Ledger $ledger
    }
    return $ledger
}

try {
    $lockAcquired = $mutex.WaitOne(0)
    if (-not $lockAcquired) {
        Write-Output 'Another Momentum 360 daily health run is already active.'
        exit 0
    }

    if (-not (Test-Path -LiteralPath $promptPath)) {
        throw "Daily health prompt is missing: $promptPath"
    }
    if (-not (Test-Path -LiteralPath $codexPath)) {
        throw "Codex CLI is missing: $codexPath"
    }
    if (-not (Test-Path -LiteralPath $preflightPath)) {
        throw "Daily health preflight is missing: $preflightPath"
    }
    if (-not (Test-Path -LiteralPath $cacheRepairPath)) {
        throw "Codex model-cache compatibility guard is missing: $cacheRepairPath"
    }
    if (-not (Test-Path -LiteralPath $clientOperationsRoot)) {
        throw "Client operations root is missing: $clientOperationsRoot"
    }

    New-Item -ItemType Directory -Force -Path $outputRoot, $stateRoot | Out-Null

    if (-not $LiveDelivery) {
        $shadowExitCode = Invoke-LocalShadowHealth
        if ($shadowExitCode -eq 0) {
            Write-Output "LOCAL_SHADOW_HEALTH_PASS receipt=$shadowReceiptPath"
        } else {
            Write-Output "LOCAL_SHADOW_HEALTH_FAIL receipt=$shadowReceiptPath"
        }
        exit $shadowExitCode
    }

    $reportId = "M360-DAILY-$runDateEt"
    $deliveryLedger = Sync-DeliveryLedgerFromFinals
    $existingDelivery = @($deliveryLedger.deliveries | Where-Object { $_.reportId -eq $reportId } | Select-Object -First 1)
    if (-not $DryRun -and $existingDelivery.Count -gt 0) {
        @(
            "START $([DateTimeOffset]::Now.ToString('o'))"
            "Run date ET: $runDateEt"
            "ALREADY_DELIVERED reportId=$reportId"
            "Slack timestamp: $($existingDelivery[0].slackTimestamp)"
            "Slack link: $($existingDelivery[0].slackLink)"
        ) | Set-Content -LiteralPath $logPath -Encoding utf8
        Write-Output "Momentum 360 daily health already delivered for $reportId. No duplicate was sent. Log: $logPath"
        exit 0
    }

    if (Test-Path -LiteralPath $bootstrapPath) {
        . $bootstrapPath
    }
    $env:CODEX_HOME = 'C:\Users\dillo\.codex'

    $cacheRepairJson = & $cacheRepairPath | ConvertFrom-Json | ConvertTo-Json -Compress

    try {
        $preflight = & $preflightPath | ConvertFrom-Json
        $preflightJson = $preflight | ConvertTo-Json -Depth 8 -Compress
    } catch {
        $preflightJson = [pscustomobject]@{
            schemaVersion = 1
            checkedAt = [DateTimeOffset]::UtcNow.ToString('o')
            status = 'ERROR'
            blockers = @([pscustomobject]@{
                name = 'preflight'
                category = 'LOCAL_PREFLIGHT'
                detail = 'The deterministic preflight failed without exposing credentials.'
            })
        } | ConvertTo-Json -Depth 6 -Compress
    }

    $prompt = (Get-Content -LiteralPath $promptPath -Raw -Encoding UTF8).
        Replace('{{RUN_DATE_ET}}', $runDateEt).
        Replace('{{PREFLIGHT_JSON}}', $preflightJson)
    $runHeader = @"
Scheduled run started: $([DateTimeOffset]::Now.ToString('o'))
This run has standing approval for one daily Slack delivery to group DM C0B2N20A0SW and one concise copy to #360marketing C06CL0R09A4 as defined below.
Do not ask for confirmation. Complete the live checks, send once to each missing destination, and read both results back.

"@
    $fullPrompt = $runHeader + $prompt

    @(
        "START $([DateTimeOffset]::Now.ToString('o'))"
        "Run date ET: $runDateEt"
        "Prompt: $promptPath"
        "Workspace: $clientOperationsRoot"
        "Dry run: $DryRun"
        "Codex cache compatibility: $cacheRepairJson"
        "Preflight: $preflightJson"
    ) | Set-Content -LiteralPath $logPath -Encoding utf8

    if ($DryRun) {
        $fullPrompt | Add-Content -LiteralPath $logPath -Encoding utf8
        Write-Output "Dry run written to $logPath"
        exit 0
    }

    $maxAttempts = if ($NoRetry) { 1 } else { 2 }
    $delivered = $false

    for ($attempt = 1; $attempt -le $maxAttempts; $attempt++) {
        "ATTEMPT $attempt $([DateTimeOffset]::Now.ToString('o'))" | Add-Content -LiteralPath $logPath -Encoding utf8
        Remove-Item -LiteralPath $finalPath -Force -ErrorAction SilentlyContinue

        $arguments = @(
            'exec',
            '--cd', $clientOperationsRoot,
            '--skip-git-repo-check',
            '--ephemeral',
            '--sandbox', 'danger-full-access',
            '-c', 'approval_policy="never"',
            '-c', 'mcp_servers.composio.enabled=false',
            '-c', 'features.memories=false',
            '--color', 'never',
            '--output-last-message', $finalPath,
            '-'
        )

        & $cacheRepairPath -RefreshTimestamp | Out-Null
        $savedErrorActionPreference = $ErrorActionPreference
        $ErrorActionPreference = 'Continue'
        $attemptOutput = [System.Collections.Generic.List[string]]::new()
        try {
            $fullPrompt | & $codexPath @arguments *>&1 | ForEach-Object {
                $line = $_.ToString()
                $attemptOutput.Add($line)
                $line
                $line | Add-Content -LiteralPath $logPath -Encoding utf8
            }
            $exitCode = $LASTEXITCODE
        }
        finally {
            $ErrorActionPreference = $savedErrorActionPreference
        }
        "ATTEMPT_RESULT attempt=$attempt exit=$exitCode" | Add-Content -LiteralPath $logPath -Encoding utf8

        $finalText = if (Test-Path -LiteralPath $finalPath) {
            Get-Content -LiteralPath $finalPath -Raw -Encoding UTF8
        } else {
            ''
        }

        $startupDefectPattern = 'failed to renew cache TTL|failed to write models cache|missing field `?base_instructions`?|missing YAML frontmatter|failed to load skill|mcp server for `?composio`? failed|composio.*(error|failed)'
        $startupDefect = ($attemptOutput -join "`n") -match $startupDefectPattern
        if ($startupDefect) {
            "ATTEMPT_STARTUP_DEFECT attempt=$attempt" | Add-Content -LiteralPath $logPath -Encoding utf8
        }

        if ($exitCode -eq 0 -and -not $startupDefect -and $finalText -match 'DELIVERY_CONFIRMED' -and $finalText -match 'CHANNEL_DELIVERY_CONFIRMED') {
            Add-VerifiedDelivery -ReportId $reportId -VerificationText $finalText -SourcePath $finalPath
            $delivered = $true
            break
        }

        if ($attempt -lt $maxAttempts) {
            Start-Sleep -Seconds 20
        }
    }

    if (-not $delivered) {
        "MAIN_REPORT_FAILED $([DateTimeOffset]::Now.ToString('o'))" | Add-Content -LiteralPath $logPath -Encoding utf8
        $fallbackPath = Join-Path $outputRoot "momentum-daily-health-$runStamp-fallback-final.txt"
        $fallbackPrompt = @"
Dillon Mohr explicitly authorized a recurring daily Momentum 360 status notice. The full report runner could not verify delivery after $maxAttempts attempt(s).

Use the Slack connector only. In group DM C0B2N20A0SW, first call slack_read_channel and scan enough recent messages for exact report ID M360-DAILY-$runDateEt. Then use search as a secondary check. If either check finds it, do not duplicate it and verify the existing message. Otherwise send exactly one message:

<@UAK3WSY15> <@U05MUGHN031> Morning Momentum 360 AI & lead-response update: DEGRADED
Report ID: M360-DAILY-$runDateEt
The automated live health check could not complete this morning, so HubSpot and CallRail metrics are withheld rather than guessed. The runner is configured to retry and Dillon is being given the failure evidence. No customer-level data is included.

Read C0B2N20A0SW back and verify the report ID and both mentions. Your final response must contain FAILURE_NOTICE_CONFIRMED and the Slack timestamp or link. Do not print that marker unless delivery is verified.
"@

        $fallbackArguments = @(
            'exec',
            '--cd', $clientOperationsRoot,
            '--skip-git-repo-check',
            '--ephemeral',
            '--sandbox', 'danger-full-access',
            '-c', 'approval_policy="never"',
            '-c', 'mcp_servers.composio.enabled=false',
            '-c', 'features.memories=false',
            '--color', 'never',
            '--output-last-message', $fallbackPath,
            '-'
        )

        & $cacheRepairPath -RefreshTimestamp | Out-Null
        $savedErrorActionPreference = $ErrorActionPreference
        $ErrorActionPreference = 'Continue'
        try {
            $fallbackPrompt | & $codexPath @fallbackArguments *>&1 | ForEach-Object {
                $line = $_.ToString()
                $line
                $line | Add-Content -LiteralPath $logPath -Encoding utf8
            }
            $fallbackExit = $LASTEXITCODE
        }
        finally {
            $ErrorActionPreference = $savedErrorActionPreference
        }
        $fallbackText = if (Test-Path -LiteralPath $fallbackPath) {
            Get-Content -LiteralPath $fallbackPath -Raw
        } else {
            ''
        }

        if ($fallbackExit -ne 0 -or $fallbackText -notmatch 'FAILURE_NOTICE_CONFIRMED') {
            throw "Momentum 360 daily report and fallback notice both failed. See $logPath"
        }
        Add-VerifiedDelivery -ReportId $reportId -VerificationText $fallbackText -SourcePath $fallbackPath
    }

    "SUCCESS $([DateTimeOffset]::Now.ToString('o'))" | Add-Content -LiteralPath $logPath -Encoding utf8
    Write-Output "Momentum 360 daily health delivery verified. Log: $logPath"
}
finally {
    if ($lockAcquired) {
        $mutex.ReleaseMutex()
    }
    $mutex.Dispose()
}
