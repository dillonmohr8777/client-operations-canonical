[CmdletBinding()]
param(
    [string]$TaskName = 'MarketingChief-DailyCalibration',
    [datetime]$DailyAt = ([datetime]::Today.AddHours(8).AddMinutes(15))
)

$ErrorActionPreference = 'Stop'
$trainingScript = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot 'Update-MarketingTrainingCheckpoint.ps1'))
if (-not (Test-Path -LiteralPath $trainingScript -PathType Leaf)) { throw "Training script not found: $trainingScript" }
$powerShell = "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe"
$arguments = '-NoLogo -NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File "{0}" -Trigger daily' -f $trainingScript
$action = New-ScheduledTaskAction -Execute $powerShell -Argument $arguments
$trigger = New-ScheduledTaskTrigger -Daily -At $DailyAt
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -Hidden -ExecutionTimeLimit (New-TimeSpan -Minutes 15)
$principal = New-ScheduledTaskPrincipal -UserId ([Security.Principal.WindowsIdentity]::GetCurrent().Name) -LogonType Interactive -RunLevel Limited
Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Description 'Compile the redacted Marketing Chief operating model once daily without fabricating preference labels.' -Force | Out-Null
[pscustomobject]@{ status = 'installed'; taskName = $TaskName; dailyAt = $DailyAt.ToString('HH:mm'); script = $trainingScript } | ConvertTo-Json -Compress
