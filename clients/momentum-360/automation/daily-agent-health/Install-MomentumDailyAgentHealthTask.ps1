[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$taskName = 'Momentum360-Daily-Agent-Health'
$retiredTaskName = 'Momentum360-Daily-CallRail-Summary'
$runner = Join-Path $PSScriptRoot 'Run-MomentumDailyAgentHealth.ps1'
$hiddenLauncher = 'C:\Users\dillo\.codex\tools\Run-HiddenScheduledTask.vbs'
$manifest = 'C:\Users\dillo\.codex\tools\hidden-scheduled-tasks.tsv'

if (-not (Test-Path -LiteralPath $runner)) {
    throw "Runner not found: $runner"
}
if (-not (Test-Path -LiteralPath $hiddenLauncher)) {
    throw "Hidden launcher not found: $hiddenLauncher"
}
if (-not (Test-Path -LiteralPath $manifest)) {
    throw "Hidden task manifest not found: $manifest"
}
if (-not (Select-String -LiteralPath $manifest -SimpleMatch -Pattern "$taskName`t" -Quiet)) {
    throw "The hidden task manifest does not contain $taskName"
}

$action = New-ScheduledTaskAction `
    -Execute 'C:\Windows\System32\wscript.exe' `
    -Argument "//B //Nologo `"$hiddenLauncher`" `"$taskName`""
$trigger = New-ScheduledTaskTrigger -Daily -At '09:00'
$settings = New-ScheduledTaskSettingsSet `
    -StartWhenAvailable `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -ExecutionTimeLimit (New-TimeSpan -Hours 2) `
    -RestartCount 3 `
    -RestartInterval (New-TimeSpan -Minutes 15) `
    -MultipleInstances IgnoreNew
$principal = New-ScheduledTaskPrincipal `
    -UserId $env:USERNAME `
    -LogonType Interactive `
    -RunLevel Limited

Register-ScheduledTask `
    -TaskName $taskName `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Principal $principal `
    -Description 'Daily 9:00 AM ET Momentum 360 HubSpot agent, alerting, contact-record, debugging, and CallRail health report to Jason and Sean.' `
    -Force | Out-Null

$retired = Get-ScheduledTask -TaskName $retiredTaskName -ErrorAction SilentlyContinue
if ($retired -and $retired.State -ne 'Disabled') {
    Disable-ScheduledTask -TaskName $retiredTaskName | Out-Null
}

$task = Get-ScheduledTask -TaskName $taskName
$info = Get-ScheduledTaskInfo -TaskName $taskName
[pscustomobject]@{
    TaskName = $task.TaskName
    State = $task.State
    NextRunTime = $info.NextRunTime
    Action = $task.Actions[0].Execute
    Arguments = $task.Actions[0].Arguments
    RestartCount = $task.Settings.RestartCount
    RetiredTaskState = if ($retired) { (Get-ScheduledTask -TaskName $retiredTaskName).State } else { 'NotFound' }
}

