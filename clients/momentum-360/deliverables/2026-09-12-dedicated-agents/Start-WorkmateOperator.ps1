[CmdletBinding()]
param([switch]$ConfigureCredentials, [switch]$Start)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..\..\..')).Path
. (Join-Path $projectRoot 'scripts\MarketingChief.SitesBridgeCredential.ps1')
$python = Join-Path $env:LOCALAPPDATA 'Dillon\MomentumWorkmate\venv\Scripts\python.exe'
$bridge = Join-Path $PSScriptRoot 'org-modes\operator_bridge.py'
$targets = [ordered]@{
    MOMENTUM_SLACK_BOT_TOKEN = @('MarketingChief-Workmate-Bot-A0C2K8ZU6AU', 'xoxb-')
    MOMENTUM_SLACK_APP_TOKEN = @('MarketingChief-Workmate-Socket-A0C2K8ZU6AU', 'xapp-')
}

if ($ConfigureCredentials) {
    foreach ($name in $targets.Keys) {
        $secret = Read-Host "Enter $name for Momentum Workmate A0C2K8ZU6AU (hidden)" -AsSecureString
        $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secret)
        try {
            $token = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
            if (-not $token.StartsWith($targets[$name][1], [StringComparison]::Ordinal)) {
                throw "Wrong credential type for $name. Nothing stored for this field."
            }
            Set-MarketingChiefSitesCredential -Target $targets[$name][0] -Token $token -UserName 'momentum-workmate'
        }
        finally {
            $token = $null
            [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
            $secret.Dispose()
        }
    }
    Write-Output 'Workmate credentials saved in Windows Credential Manager. No service started.'
    return
}

if (-not (Test-Path -LiteralPath $python -PathType Leaf)) { throw 'Workmate Python environment is missing.' }
if (-not (Test-Path -LiteralPath $bridge -PathType Leaf)) { throw 'Workmate operator bridge is missing.' }
$saved = @{}
try {
    if ($Start) {
        foreach ($name in $targets.Keys) {
            $saved[$name] = [Environment]::GetEnvironmentVariable($name, 'Process')
            [Environment]::SetEnvironmentVariable($name, (Get-MarketingChiefSitesCredential -Target $targets[$name][0]), 'Process')
        }
        $saved['MOMENTUM_OPERATOR_ENABLED'] = $env:MOMENTUM_OPERATOR_ENABLED
        $env:MOMENTUM_OPERATOR_ENABLED = '1'
        & $python $bridge --serve
    }
    else { & $python $bridge --probe }
    if ($LASTEXITCODE -ne 0) { throw 'Workmate returned a non-success status; inspect its redacted status.' }
}
finally {
    foreach ($name in $saved.Keys) { [Environment]::SetEnvironmentVariable($name, $saved[$name], 'Process') }
    $saved.Clear()
}
