[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
. (Join-Path $PSScriptRoot 'MarketingChief.SitesBridgeCredential.ps1')

$checks = New-Object System.Collections.Generic.List[object]
function Add-Check {
    param([string]$Name, [bool]$Passed)
    $checks.Add([pscustomobject]@{ name = $Name; passed = $Passed })
    if (-not $Passed) { throw "Bridge check failed: $Name" }
}

$target = 'MarketingChief-SitesBridge-Test-' + [guid]::NewGuid().ToString('N')
$dispatchTarget = 'MarketingChief-SitesBridge-Dispatch-Test-' + [guid]::NewGuid().ToString('N')
$token = New-MarketingChiefSitesToken
$dispatchToken = New-MarketingChiefSitesToken
try {
    Add-Check 'generated token is base64url and at least 32 characters' ($token -match '^[A-Za-z0-9_-]{32,512}$')
    Set-MarketingChiefSitesCredential -Target $target -Token $token -UserName 'marketing-chief-test'
    $roundTrip = Get-MarketingChiefSitesCredential -Target $target
    Add-Check 'Windows Credential Manager round trip is exact' ($roundTrip -ceq $token)
    Set-MarketingChiefSitesCredential -Target $dispatchTarget -Token $dispatchToken -UserName 'marketing-chief-test'
    $dispatchRoundTrip = Get-MarketingChiefSitesCredential -Target $dispatchTarget
    Add-Check 'Sites dispatch credential round trip is exact' ($dispatchRoundTrip -ceq $dispatchToken)
    $configPath = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\state\hosted-sync-config.json'))
    $configContainsToken = (
        (Test-Path -LiteralPath $configPath -PathType Leaf) -and
        (Select-String -LiteralPath $configPath -SimpleMatch $token -Quiet)
    )
    Add-Check 'non-secret bridge config does not contain the credential' (-not $configContainsToken)
}
finally {
    Remove-MarketingChiefSitesCredential -Target $target
    Remove-MarketingChiefSitesCredential -Target $dispatchTarget
    $token = $null
    $roundTrip = $null
    $dispatchToken = $null
    $dispatchRoundTrip = $null
}

[pscustomobject]@{
    status = 'passed'
    checkCount = $checks.Count
    checks = $checks
    secretPrinted = $false
} | ConvertTo-Json -Depth 5
