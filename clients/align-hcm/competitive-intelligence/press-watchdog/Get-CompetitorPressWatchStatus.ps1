param(
  [string]$TaskName = "Align HCM Competitor Press Watchdog"
)

$ErrorActionPreference = "Stop"
$statePath = Join-Path $PSScriptRoot "runtime\state.json"
$reportPath = Join-Path $PSScriptRoot "reports\latest.md"
$dataPath = Join-Path $PSScriptRoot "reports\latest.json"

$task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
$taskInfo = if ($task) { Get-ScheduledTaskInfo -TaskName $TaskName } else { $null }
$state = if (Test-Path -LiteralPath $statePath) { Get-Content -LiteralPath $statePath -Raw -Encoding UTF8 | ConvertFrom-Json } else { $null }

[pscustomobject]@{
  installed = [bool]$task
  taskName = $TaskName
  taskState = if ($task) { [string]$task.State } else { $null }
  nextRunTime = if ($taskInfo -and $taskInfo.NextRunTime -gt [datetime]::MinValue) { $taskInfo.NextRunTime.ToString('o') } else { $null }
  lastTaskRunTime = if ($taskInfo -and $taskInfo.LastRunTime -gt [datetime]::MinValue) { $taskInfo.LastRunTime.ToString('o') } else { $null }
  lastTaskResult = if ($taskInfo) { $taskInfo.LastTaskResult } else { $null }
  lastWatchdogRun = if ($state) { $state.updatedAt } else { $null }
  lastRunMode = if ($state) { $state.lastRunMode } else { $null }
  lastSuccessfulSources = if ($state) { $state.lastSuccessfulSources } else { $null }
  lastSourceFailures = if ($state) { $state.lastSourceFailures } else { $null }
  lastRetrievedItems = if ($state) { $state.lastRetrievedItems } else { $null }
  lastNewItems = if ($state) { $state.lastNewItems } else { $null }
  latestReport = if (Test-Path -LiteralPath $reportPath) { $reportPath } else { $null }
  latestData = if (Test-Path -LiteralPath $dataPath) { $dataPath } else { $null }
} | ConvertTo-Json -Depth 5
