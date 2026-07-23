[CmdletBinding()]
param(
    [string]$SiteUrl = 'https://dillon-marketing-chief.dillonmohr8777.chatgpt.site',
    [string]$LocalStudioUrl = 'http://127.0.0.1:4317/api/studio',
    [string]$CredentialTarget = 'MarketingChief-SitesBridge',
    [string]$DispatchCredentialTarget = 'MarketingChief-SitesBridge-Dispatch',
    [string]$TaskName = 'MarketingChief-SitesBridge',
    [ValidateRange(5, 1440)][int]$EveryMinutes = 15,
    [switch]$KeepExistingCredential,
    [switch]$EmitTokenForConnector
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
. (Join-Path $PSScriptRoot 'MarketingChief.SitesBridgeCredential.ps1')

if ($SiteUrl -notmatch '^https://[A-Za-z0-9.-]+\.chatgpt\.site/?$') {
    throw 'SiteUrl must be an HTTPS chatgpt.site origin.'
}
if ($LocalStudioUrl -notmatch '^http://(?:127\.0\.0\.1|localhost):\d{2,5}/api/studio$') {
    throw 'LocalStudioUrl must be the loopback Marketing Chief Studio API.'
}
Assert-MarketingChiefCredentialTarget -Target $CredentialTarget
Assert-MarketingChiefCredentialTarget -Target $DispatchCredentialTarget

$token = if ($KeepExistingCredential) {
    Get-MarketingChiefSitesCredential -Target $CredentialTarget
}
else {
    $generated = New-MarketingChiefSitesToken
    Set-MarketingChiefSitesCredential -Target $CredentialTarget -Token $generated
    $generated
}

$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$configPath = Join-Path $projectRoot 'state\hosted-sync-config.json'
$config = [pscustomobject][ordered]@{
    schemaVersion = 1
    siteUrl = $SiteUrl.TrimEnd('/')
    localStudioUrl = $LocalStudioUrl
    credentialTarget = $CredentialTarget
    dispatchCredentialTarget = $DispatchCredentialTarget
    installedAt = [DateTimeOffset]::UtcNow.ToString('o')
}
$temp = "$configPath.tmp.$([guid]::NewGuid().ToString('N')).json"
try {
    [IO.File]::WriteAllText(
        $temp,
        (($config | ConvertTo-Json -Depth 5) + [Environment]::NewLine),
        [Text.UTF8Encoding]::new($false)
    )
    Move-Item -LiteralPath $temp -Destination $configPath -Force
}
finally {
    Remove-Item -LiteralPath $temp -Force -ErrorAction SilentlyContinue
}

$syncScript = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot 'Sync-MarketingChiefSitesBridge.ps1'))
if (-not (Test-Path -LiteralPath $syncScript -PathType Leaf)) { throw "Sync script not found: $syncScript" }
$powerShell = "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe"
$arguments = '-NoLogo -NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File "{0}" -EnableCanonicalWrites' -f $syncScript
$action = New-ScheduledTaskAction -Execute $powerShell -Argument $arguments
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) `
    -RepetitionInterval (New-TimeSpan -Minutes $EveryMinutes) `
    -RepetitionDuration (New-TimeSpan -Days 3650)
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
    -StartWhenAvailable -Hidden -ExecutionTimeLimit (New-TimeSpan -Minutes 10) `
    -MultipleInstances IgnoreNew
$principal = New-ScheduledTaskPrincipal `
    -UserId ([Security.Principal.WindowsIdentity]::GetCurrent().Name) `
    -LogonType Interactive -RunLevel Limited
Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings `
    -Principal $principal `
    -Description 'Synchronize the private Marketing Chief Studio with the canonical Windows queue through governed, version-bound scripts.' `
    -Force | Out-Null

if ($EmitTokenForConnector) {
    Write-Output $token
}
else {
    [pscustomobject]@{
        status = 'installed'
        taskName = $TaskName
        intervalMinutes = $EveryMinutes
        siteUrl = $config.siteUrl
        credentialTarget = $CredentialTarget
        dispatchCredentialTarget = $DispatchCredentialTarget
        credentialStoredInWindows = $true
        tokenPrinted = $false
    } | ConvertTo-Json -Compress
}
