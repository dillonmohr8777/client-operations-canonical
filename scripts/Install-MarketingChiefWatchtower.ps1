[CmdletBinding()]
param(
    [string]$TaskName = 'MarketingChief-Watchtower',
    [ValidateRange(1, 60)]
    [int]$EveryMinutes = 5,
    [ValidateRange(60, 3600)]
    [int]$WorkerTimeoutSeconds = 1200,
    [ValidateSet('codex', 'cursor')]
    [string]$WorkerEngine = 'codex',
    [switch]$SensorOnly,
    [switch]$StartNow,
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version 2.0

if ($TaskName -notmatch '^[A-Za-z0-9][A-Za-z0-9 _-]{2,79}$') {
    throw 'TaskName is not a safe scheduled-task name.'
}

$watchtowerScript = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot 'Invoke-MarketingChiefWatchtower.ps1'))
if (-not (Test-Path -LiteralPath $watchtowerScript -PathType Leaf)) {
    throw "Watchtower script not found: $watchtowerScript"
}

$parseErrors = $null
[void][Management.Automation.Language.Parser]::ParseFile($watchtowerScript, [ref]$null, [ref]$parseErrors)
if (@($parseErrors).Count -gt 0) {
    throw 'Watchtower script contains PowerShell parse errors.'
}

$workerArgument = if ($SensorOnly) { '' } else { ' -EnableWorker' }
$powerShell = "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe"
$arguments = '-NoLogo -NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File "{0}" -IntervalMinutes {1} -WorkerTimeoutSeconds {2} -WorkerEngine {3}{4}' -f `
    $watchtowerScript, $EveryMinutes, $WorkerTimeoutSeconds, $WorkerEngine, $workerArgument
$nextRun = (Get-Date).AddMinutes(1)

if ($DryRun) {
    $previewOutput = & $watchtowerScript -IntervalMinutes $EveryMinutes -WorkerTimeoutSeconds $WorkerTimeoutSeconds -WorkerEngine $WorkerEngine -EnableWorker:(-not $SensorOnly) -SkipSlackPoll -DryRun
    $preview = ($previewOutput -join [Environment]::NewLine) | ConvertFrom-Json
    [pscustomobject][ordered]@{
        status = 'dry-run'
        taskName = $TaskName
        intervalMinutes = $EveryMinutes
        hidden = $true
        multipleInstances = 'IgnoreNew'
        workerEnabled = -not $SensorOnly
        workerEngine = $WorkerEngine
        previewStatus = [string]$preview.status
        wouldRegister = $true
    } | ConvertTo-Json -Compress
    exit 0
}

# Establish the protected watermark before the task can run. Existing backlog is
# deliberately recorded as baseline and cannot be unleashed by installation.
$initializeOutput = & $watchtowerScript -IntervalMinutes $EveryMinutes -WorkerTimeoutSeconds $WorkerTimeoutSeconds -WorkerEngine $WorkerEngine -EnableWorker:(-not $SensorOnly) -InitializeOnly -SkipSlackPoll
$initialize = ($initializeOutput -join [Environment]::NewLine) | ConvertFrom-Json
if ([string]$initialize.status -notin @('baseline-established', 'initialized')) {
    throw 'Watchtower baseline initialization did not complete safely.'
}

$action = New-ScheduledTaskAction -Execute $powerShell -Argument $arguments
$trigger = New-ScheduledTaskTrigger -Once -At $nextRun `
    -RepetitionInterval (New-TimeSpan -Minutes $EveryMinutes) `
    -RepetitionDuration (New-TimeSpan -Days 3650)
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -Hidden `
    -MultipleInstances IgnoreNew `
    -ExecutionTimeLimit (New-TimeSpan -Seconds ($WorkerTimeoutSeconds + 300))
$principal = New-ScheduledTaskPrincipal `
    -UserId ([Security.Principal.WindowsIdentity]::GetCurrent().Name) `
    -LogonType Interactive `
    -RunLevel Limited

Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Principal $principal `
    -Description "Poll Slack read-only, validate owner-authored Cursor Slack intake, and complete at most one exact-routed, local, reversible Marketing Chief episode per guarded $WorkerEngine worker run." `
    -Force | Out-Null

if ($StartNow) {
    Start-ScheduledTask -TaskName $TaskName
}

$task = Get-ScheduledTask -TaskName $TaskName -ErrorAction Stop
$info = Get-ScheduledTaskInfo -TaskName $TaskName -ErrorAction Stop
[pscustomobject][ordered]@{
    status = 'installed'
    taskName = $TaskName
    intervalMinutes = $EveryMinutes
    hidden = [bool]$task.Settings.Hidden
    multipleInstances = [string]$task.Settings.MultipleInstances
    workerEnabled = -not $SensorOnly
    workerEngine = $WorkerEngine
    nextRunAt = if ($info.NextRunTime.Year -le 1900) { $null } else { ([DateTimeOffset]$info.NextRunTime).ToString('o') }
    baselineStatus = [string]$initialize.status
    script = $watchtowerScript
} | ConvertTo-Json -Compress
