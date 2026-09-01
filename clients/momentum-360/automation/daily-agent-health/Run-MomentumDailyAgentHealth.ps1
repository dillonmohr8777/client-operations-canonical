[CmdletBinding()]
param(
    [switch]$DryRun,
    [switch]$NoRetry
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
$clientOperationsRoot = 'C:\Users\dillo\Documents\Codex\projects\client-operations'
$codexPath = 'C:\Users\dillo\AppData\Roaming\npm\codex.ps1'
$bootstrapPath = 'C:\Users\dillo\.codex\terminal-bootstrap.ps1'
$easternTimeZone = [TimeZoneInfo]::FindSystemTimeZoneById('Eastern Standard Time')
$runTimeEt = [TimeZoneInfo]::ConvertTime([DateTimeOffset]::UtcNow, $easternTimeZone)
$runDateEt = $runTimeEt.ToString('yyyy-MM-dd')
$runStamp = $runTimeEt.ToString('yyyy-MM-dd-HHmmss')
$logPath = Join-Path $outputRoot "momentum-daily-health-$runStamp.log"
$finalPath = Join-Path $outputRoot "momentum-daily-health-$runStamp-final.txt"
$mutex = [Threading.Mutex]::new($false, 'Local\Momentum360DailyAgentHealth')
$lockAcquired = $false

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
