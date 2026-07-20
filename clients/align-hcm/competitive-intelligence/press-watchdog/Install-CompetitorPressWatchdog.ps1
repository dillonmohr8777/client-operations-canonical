param(
  [string]$TaskName = "Align HCM Competitor Press Watchdog",
  [datetime]$DailyAt = ([datetime]::Today.AddHours(6).AddMinutes(35))
)

$ErrorActionPreference = "Stop"

$runner = Join-Path $PSScriptRoot "Run-CompetitorPressWatchdog.ps1"
if (!(Test-Path -LiteralPath $runner)) {
  throw "Watchdog runner not found at $runner"
}

$powershell = "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe"
$arguments = "-NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$runner`""
$action = New-ScheduledTaskAction -Execute $powershell -Argument $arguments
$trigger = New-ScheduledTaskTrigger -Daily -At $DailyAt
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Minutes 15)
$userId = [Security.Principal.WindowsIdentity]::GetCurrent().Name
$principal = New-ScheduledTaskPrincipal -UserId $userId -LogonType Interactive -RunLevel Limited

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Description "Private read-only monitoring of official competitor and HCM platform press sources for Align HCM. Produces local evidence and strategy briefs; never publishes or writes to HubSpot." -Force | Out-Null

$task = Get-ScheduledTask -TaskName $TaskName
$info = Get-ScheduledTaskInfo -TaskName $TaskName
[pscustomobject]@{
  installed = $true
  taskName = $TaskName
  state = [string]$task.State
  nextRunTime = if ($info.NextRunTime -gt [datetime]::MinValue) { $info.NextRunTime.ToString('o') } else { $null }
  runAs = $userId
  runner = $runner
} | ConvertTo-Json -Depth 4
