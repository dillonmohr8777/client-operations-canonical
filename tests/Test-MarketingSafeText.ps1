$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot '..\scripts\MarketingOs.Common.ps1')

$approvedLocator = 'agent-os-run:20260717-091245-dfa2009c/task.json'
if (-not (Test-MarketingSafeText $approvedLocator)) {
    throw 'Approved Agent OS intake locator was rejected as unsafe text.'
}
if (-not (Test-MarketingSafeLocator $approvedLocator)) {
    throw 'Approved Agent OS intake locator was rejected as an unsafe locator.'
}
$approvedSlackLocator = 'slack://channel/C0B2N20A0SW/message/1785511579.769919'
if (-not (Test-MarketingSafeText $approvedSlackLocator)) {
    throw 'Approved canonical Slack message locator was rejected as unsafe text.'
}
if (-not (Test-MarketingSafeLocator $approvedSlackLocator)) {
    throw 'Approved canonical Slack message locator was rejected as an unsafe locator.'
}
if (Test-MarketingSafeLocator 'slack://channel/not-safe/message/1785511579.769919') {
    throw 'Malformed Slack message locator was accepted.'
}
if (Test-MarketingSafeText '4111-1111-1111-1111') {
    throw 'Payment-card-like text was not rejected.'
}
if (Test-MarketingSafeText 'contact person@example.com') {
    throw 'Direct email identifier was not rejected.'
}

[pscustomobject]@{
    status = 'passed'
    assertions = 7
} | ConvertTo-Json -Compress
