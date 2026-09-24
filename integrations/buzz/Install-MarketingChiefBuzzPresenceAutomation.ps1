[CmdletBinding()]
param([string]$TaskName = 'MarketingChief-BuzzPresenceKeeper')

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$wrapper = 'C:\Users\dillo\.codex\tools\Run-HiddenScheduledTask.vbs'
$manifestPath = 'C:\Users\dillo\.codex\tools\hidden-scheduled-tasks.tsv'
if (-not (Test-Path -LiteralPath $wrapper -PathType Leaf) -or
    -not (Test-Path -LiteralPath $manifestPath -PathType Leaf)) {
    throw 'The console-free scheduled-task wrapper is unavailable.'
}
$manifestEntry = Get-Content -LiteralPath $manifestPath |
    Where-Object { $_ -like "$TaskName`t*" } |
    Select-Object -First 1
if (-not $manifestEntry) {
    throw "The hidden-task manifest does not contain $TaskName."
}
$taskRun = '"C:\Windows\System32\wscript.exe" "' + $wrapper + '" "' + $TaskName + '"'
$result = & C:\Windows\System32\schtasks.exe /Create /F /TN $TaskName /SC MINUTE /MO 1 /TR $taskRun 2>&1
if ($LASTEXITCODE -ne 0) {
    throw "Could not register the hidden Buzz presence task: $($result -join ' ')"
}
& C:\Windows\System32\schtasks.exe /Run /TN $TaskName | Out-Null

[pscustomobject][ordered]@{
    taskName = $TaskName
    action = 'wscript-hidden-wrapper'
    intervalMinutes = 1
    registered = $true
    runtimeMode = 'nostr-presence-only'
}
