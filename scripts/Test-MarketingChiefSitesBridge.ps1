[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
. (Join-Path $PSScriptRoot 'MarketingChief.SitesBridgeCredential.ps1')
. (Join-Path $PSScriptRoot 'MarketingOs.Common.ps1')

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
    $syncPath = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot 'Sync-MarketingChiefSitesBridge.ps1'))
    $syncSource = Get-Content -LiteralPath $syncPath -Raw -Encoding UTF8
    $parseTokens = $null
    $parseErrors = $null
    [void][Management.Automation.Language.Parser]::ParseFile($syncPath, [ref]$parseTokens, [ref]$parseErrors)
    Add-Check 'bridge script parses after owner-intent expansion' (@($parseErrors).Count -eq 0)
    Add-Check 'owner intents remain backward compatible before the site upgrade' (
        $syncSource -match 'PSObject\.Properties\[''ownerIntents''\]' -and
        $syncSource -match 'processedOwnerIntents'
    )
    Add-Check 'safe owner intent modes map to reversible local action classes' (
        $syncSource -match '''analyze''\s*\{\s*return ''local_research''' -and
        $syncSource -match '''prepare''\s*\{\s*return ''local_artifact''' -and
        $syncSource -match '''execute_safe''\s*\{\s*return ''local_test''' -and
        $syncSource -match '''draft_for_approval''\s*\{\s*return ''local_draft''' -and
        $syncSource -match '''monitor''\s*\{\s*return ''read_only_verification'''
    )
    Add-Check 'consequential owner intent content is approval gated' (
        $syncSource -match 'return ''account_change''' -and
        $syncSource -match 'return ''external_delivery''' -and
        $syncSource -match 'ApprovalTier = if \(\$automaticAction\)' -and
        $syncSource -match 'Explicit owner approval is required'
    )
    Add-Check 'owner intents use exact idempotent source and dedupe bindings' (
        $syncSource -match 'DedupeKey = "sites-intent:\$intentId"' -and
        $syncSource -match 'SourceLocator = "sites-intent:\$intentId"' -and
        $syncSource -match 'Get-ExistingIntentWorkItem'
    )
    Add-Check 'version-bound Studio intent locators are safe graph evidence' (
        Test-MarketingSafeLocator 'sites-intent:6c665734-ab1f-4f2b-986e-f7d92ab0b193'
    )
    Add-Check 'malformed Studio intent locators remain rejected' (
        -not (Test-MarketingSafeLocator 'sites-intent:not-a-version-bound-id')
    )
    Add-Check 'owner intent completion preserves consequential approval gates' (
        $syncSource -match 'Keep external delivery, publishing, spend, account changes, and destructive actions pending explicit approval'
    )
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
