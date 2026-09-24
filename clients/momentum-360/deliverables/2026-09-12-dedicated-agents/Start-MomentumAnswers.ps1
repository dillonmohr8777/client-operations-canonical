[CmdletBinding()]
param([switch]$ConfigureCredentials, [switch]$Start, [switch]$RegisterTask)
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$openRouterTarget = 'MarketingChief-FAQ-OpenRouter'
$openRouterEnv = 'OPENROUTER_API_KEY'
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..\..\..')).Path
. (Join-Path $projectRoot 'scripts\MarketingChief.SitesBridgeCredential.ps1')
$config = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'org-modes\faq-config.json') -Raw | ConvertFrom-Json
$python = Join-Path $env:LOCALAPPDATA 'Dillon\MomentumWorkmate\venv\Scripts\python.exe'
$bridge = Join-Path $PSScriptRoot 'org-modes\faq_bridge.py'
if (-not (Test-Path -LiteralPath $python)) { throw 'Existing Workmate Python environment is missing.' }

function Write-FaqStartupFailure([string]$Stage, [System.Exception]$Exception) {
    $directory = Join-Path $env:LOCALAPPDATA 'Dillon\MomentumAnswers'
    $log = Join-Path $directory 'startup-errors.jsonl'
    $message = [string]$Exception.Message
    $message = $message -replace '(?i)(xox[baprs]-|xapp-|sk-(?:proj-)?|gh[pousr]_)[a-z0-9_-]{16,}', '[redacted]'
    $message = $message -replace '(?i)(bearer\s+)\S+', '$1[redacted]'
    $message = $message -replace '(?i)(password|access_token|api_key)\s*[:=]\s*\S{8,}', '$1=[redacted]'
    if ($message.Length -gt 240) { $message = $message.Substring(0, 240) }
    try {
        New-Item -ItemType Directory -Path $directory -Force | Out-Null
        $entry = [pscustomobject]@{ time = [DateTime]::UtcNow.ToString('o'); stage = $Stage; error_type = $Exception.GetType().Name; message = $message }
        Add-Content -LiteralPath $log -Value ($entry | ConvertTo-Json -Compress) -Encoding utf8
    } catch { }
}

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
    if (-not $config.enabled -or -not $config.provider_enabled -or -not $config.external_data_approved -or @($config.allowed_channels).Count -eq 0) {
        throw 'Complete provider and external-data approval before registering the reply listener.'
    }
    $user = [Security.Principal.WindowsIdentity]::GetCurrent().Name
    $shell = Join-Path $PSHOME 'powershell.exe'
    if (-not (Test-Path -LiteralPath $shell)) { $shell = Join-Path $PSHOME 'pwsh.exe' }
    $action = New-ScheduledTaskAction -Execute $shell -Argument ('-NoLogo -NoProfile -NonInteractive -WindowStyle Hidden -File "' + $PSCommandPath + '" -Start') -WorkingDirectory $PSScriptRoot
    $trigger = New-ScheduledTaskTrigger -AtLogOn -User $user
    $principal = New-ScheduledTaskPrincipal -UserId $user -LogonType Interactive -RunLevel Limited
    $settings = New-ScheduledTaskSettingsSet -MultipleInstances IgnoreNew -StartWhenAvailable -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1) -ExecutionTimeLimit ([TimeSpan]::Zero)
    Register-ScheduledTask -TaskName 'Momentum360-TeamAnswers' -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Description 'Momentum internal FAQ and five-role drafts. Requires approved OpenRouter settings and this user signed in.' | Out-Null
    Write-Output 'Registered Momentum360-TeamAnswers at user logon. Not started; run Start-ScheduledTask after acceptance.'
    return
}
if ($Start -and (-not $config.enabled -or -not $config.provider_enabled -or -not $config.external_data_approved)) {
    Write-Output 'Momentum Answers migration is staged and disabled; no listener started.'
    return
}
$saved = @{}
$stage = 'protected_credentials'
try {
    foreach ($name in $targets.Keys) {
        $saved[$name] = [Environment]::GetEnvironmentVariable($name, 'Process')
        [Environment]::SetEnvironmentVariable($name, (Get-MarketingChiefSitesCredential -Target $targets[$name][0]), 'Process')
    }
    $saved[$openRouterEnv] = [Environment]::GetEnvironmentVariable($openRouterEnv, 'Process')
    [Environment]::SetEnvironmentVariable($openRouterEnv, (Get-MarketingChiefSitesCredential -Target $openRouterTarget), 'Process')
    $stage = 'faq_startup'
    & $python $bridge --serve
    if ($LASTEXITCODE) { throw "Momentum Answers bridge exited with code $LASTEXITCODE." }
} catch {
    Write-FaqStartupFailure -Stage $stage -Exception $_.Exception
    throw 'Momentum Answers failed; redacted startup details were saved locally.'
}
finally {
    foreach ($name in $saved.Keys) { [Environment]::SetEnvironmentVariable($name, $saved[$name], 'Process') }
}
