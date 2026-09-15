[CmdletBinding()]
param([switch]$ConfigureCredentials, [switch]$Start, [switch]$RegisterTask)
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..\..\..')).Path
. (Join-Path $projectRoot 'scripts\MarketingChief.SitesBridgeCredential.ps1')
$config = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'org-modes\faq-config.json') -Raw | ConvertFrom-Json
$python = Join-Path $env:LOCALAPPDATA 'Dillon\MomentumWorkmate\venv\Scripts\python.exe'
$bridge = Join-Path $PSScriptRoot 'org-modes\faq_bridge.py'
if (-not (Test-Path -LiteralPath $python)) { throw 'Existing Workmate Python environment is missing.' }
if (-not ($ConfigureCredentials -or $Start -or $RegisterTask)) {
    & $python $bridge --probe
    if ($LASTEXITCODE) { throw 'FAQ validation failed.' }
    return
}
if ($config.app_id -notmatch '^A[A-Z0-9]{8,}$' -or $config.app_id -eq 'A0C2K8ZU6AU') {
    throw 'Set the separate verified Momentum Answers app_id first.'
}
$targets = [ordered]@{
    FAQ_SLACK_BOT_TOKEN = @("MarketingChief-FAQ-Bot-$($config.app_id)", 'xoxb-')
    FAQ_SLACK_APP_TOKEN = @("MarketingChief-FAQ-Socket-$($config.app_id)", 'xapp-')
}
if ($ConfigureCredentials) {
    foreach ($name in $targets.Keys) {
        $secret = Read-Host "Enter $name for Momentum Answers $($config.app_id) (hidden)" -AsSecureString
        $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secret)
        try {
            $token = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
            if (-not $token.StartsWith($targets[$name][1], [StringComparison]::Ordinal)) { throw 'Wrong credential type.' }
            Set-MarketingChiefSitesCredential -Target $targets[$name][0] -Token $token -UserName 'momentum-answers'
        }
        finally {
            $token = $null
            [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
            $secret.Dispose()
        }
    }
    Write-Output 'FAQ credentials stored in Windows Credential Manager. No service started.'
    return
}
if ($RegisterTask) {
    if (-not $config.enabled -or @($config.allowed_channels).Count -eq 0) { throw 'Complete approved activation first.' }
    $user = [Security.Principal.WindowsIdentity]::GetCurrent().Name
    $shell = Join-Path $PSHOME 'powershell.exe'
    if (-not (Test-Path -LiteralPath $shell)) { $shell = Join-Path $PSHOME 'pwsh.exe' }
    $action = New-ScheduledTaskAction -Execute $shell -Argument ('-NoLogo -NoProfile -NonInteractive -WindowStyle Hidden -File "' + $PSCommandPath + '" -Start') -WorkingDirectory $PSScriptRoot
    $trigger = New-ScheduledTaskTrigger -AtLogOn -User $user
    $principal = New-ScheduledTaskPrincipal -UserId $user -LogonType Interactive -RunLevel Limited
    $settings = New-ScheduledTaskSettingsSet -MultipleInstances IgnoreNew -StartWhenAvailable -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1) -ExecutionTimeLimit ([TimeSpan]::Zero)
    Register-ScheduledTask -TaskName 'Momentum360-TeamAnswers' -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Description 'Momentum internal FAQ and five-role drafts. Requires this user signed in and Ollama available.' | Out-Null
    Write-Output 'Registered Momentum360-TeamAnswers at user logon. Not started; run Start-ScheduledTask after acceptance.'
    return
}
$saved = @{}
try {
    foreach ($name in $targets.Keys) {
        $saved[$name] = [Environment]::GetEnvironmentVariable($name, 'Process')
        [Environment]::SetEnvironmentVariable($name, (Get-MarketingChiefSitesCredential -Target $targets[$name][0]), 'Process')
    }
    & $python $bridge --serve
    if ($LASTEXITCODE) { throw 'Momentum Answers exited unsuccessfully; check its redacted startup message.' }
}
finally {
    foreach ($name in $saved.Keys) { [Environment]::SetEnvironmentVariable($name, $saved[$name], 'Process') }
}
