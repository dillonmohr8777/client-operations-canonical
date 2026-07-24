[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version 2.0

$watchtower = Join-Path $PSScriptRoot 'Invoke-MarketingChiefWatchtower.ps1'
$installer = Join-Path $PSScriptRoot 'Install-MarketingChiefWatchtower.ps1'
$wrapper = Join-Path $PSScriptRoot 'Invoke-CursorAgentPrompt.ps1'
$checks = New-Object System.Collections.ArrayList

function Add-Check {
    param([string]$Name, [bool]$Passed)
    [void]$checks.Add([pscustomobject][ordered]@{ name = $Name; passed = $Passed })
    if (-not $Passed) { throw "Cursor Marketing Chief check failed: $Name" }
}

foreach ($path in @($watchtower, $installer, $wrapper)) {
    $errors = $null
    [void][Management.Automation.Language.Parser]::ParseFile($path, [ref]$null, [ref]$errors)
    Add-Check -Name ("PowerShell parses: " + [IO.Path]::GetFileName($path)) -Passed (@($errors).Count -eq 0)
}

$cursor = Get-Command cursor-agent.cmd -ErrorAction SilentlyContinue
if ($null -eq $cursor) {
    $fallback = Join-Path $env:LOCALAPPDATA 'cursor-agent\cursor-agent.cmd'
    if (Test-Path -LiteralPath $fallback -PathType Leaf) {
        $cursor = [pscustomobject]@{ Source = $fallback }
    }
}
Add-Check -Name 'Cursor Agent launcher is installed' -Passed ($null -ne $cursor)

$statusOutput = @(& $cursor.Source status 2>$null)
Add-Check -Name 'Cursor Agent is authenticated' -Passed ($LASTEXITCODE -eq 0 -and ($statusOutput -join ' ') -match '(?i)logged in')

$dryRunOutput = @(& $watchtower -WorkerEngine cursor -EnableWorker -SkipSlackPoll -DryRun)
$dryRun = ($dryRunOutput -join [Environment]::NewLine) | ConvertFrom-Json
Add-Check -Name 'Cursor Watchtower dry run returns governed state' -Passed (
    [string]$dryRun.status -in @('dry-run', 'idle', 'baseline-established', 'initialized', 'already-processed')
)

[pscustomobject][ordered]@{
    status = 'passed'
    checkCount = $checks.Count
    checks = @($checks)
    secretPrinted = $false
} | ConvertTo-Json -Depth 5
