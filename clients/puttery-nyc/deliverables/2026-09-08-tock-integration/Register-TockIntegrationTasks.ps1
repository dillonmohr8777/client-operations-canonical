[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
$manifestPath = 'C:\Users\dillo\.codex\tools\hidden-scheduled-tasks.tsv'
$wrapper = 'C:\Users\dillo\.codex\tools\Run-HiddenScheduledTask.vbs'
$pwsh = 'C:\Users\dillo\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\powershell\pwsh.exe'
$identity = [Security.Principal.WindowsIdentity]::GetCurrent().Name
$principal = New-ScheduledTaskPrincipal -UserId $identity -LogonType Interactive -RunLevel Limited
$specs = @(
    @{ Name='Codex-PutteryNYC-TockDataExports'; Script='Sync-TockExports.ps1'; Minutes=30 },
    @{ Name='Codex-PutteryNYC-TockOperationalStatus'; Script='Refresh-TockStatus.ps1'; Minutes=4 }
)
$lines = [Collections.Generic.List[string]]::new()
foreach ($line in [IO.File]::ReadAllLines($manifestPath)) {
    if (($line -split "`t",2)[0] -notin $specs.Name) { $lines.Add($line) }
}
foreach ($spec in $specs) {
    $scriptPath = Join-Path $PSScriptRoot $spec.Script
    if (!(Test-Path -LiteralPath $scriptPath)) { throw 'integration_script_missing' }
    $command = '"{0}" -NoLogo -NoProfile -NonInteractive -ExecutionPolicy Bypass -File "{1}"' -f $pwsh,$scriptPath
    $lines.Add($spec.Name + "`t" + $command)
}
[IO.File]::WriteAllLines($manifestPath + '.puttery.tmp', $lines, [Text.UTF8Encoding]::new($false))
[IO.File]::Move($manifestPath + '.puttery.tmp', $manifestPath, $true)
foreach ($spec in $specs) {
    $action = New-ScheduledTaskAction -Execute "$env:WINDIR\System32\wscript.exe" -Argument ('//B //Nologo "{0}" "{1}"' -f $wrapper,$spec.Name)
    if ($spec.Name -eq 'Codex-PutteryNYC-TockDataExports') {
        # Tock publishes at 01:30 and 13:30 Central; this host uses Eastern time.
        $triggers = @((New-ScheduledTaskTrigger -Daily -At '03:00'),(New-ScheduledTaskTrigger -Daily -At '15:00'))
    } else {
        $triggers = @((New-ScheduledTaskTrigger -AtLogOn -User $identity),
            (New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 5) -RepetitionDuration (New-TimeSpan -Days 3650)))
    }
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Minutes $spec.Minutes)
    Register-ScheduledTask -TaskName $spec.Name -Action $action -Trigger $triggers -Principal $principal -Settings $settings -Force | Out-Null
}
$specs | ForEach-Object { Get-ScheduledTask -TaskName $_.Name } | Select-Object TaskName,State,@{n='Executable';e={$_.Actions.Execute}} | ConvertTo-Json
