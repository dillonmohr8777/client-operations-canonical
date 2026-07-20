$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot '..\scripts\MarketingOs.Common.ps1')

$approvedLocator = 'agent-os-run:20260717-091245-dfa2009c/task.json'
if (-not (Test-MarketingSafeText $approvedLocator)) {
    throw 'Approved Agent OS intake locator was rejected as unsafe text.'
}
if (-not (Test-MarketingSafeLocator $approvedLocator)) {
    throw 'Approved Agent OS intake locator was rejected as an unsafe locator.'
}
if (Test-MarketingSafeText '4111-1111-1111-1111') {
    throw 'Payment-card-like text was not rejected.'
}
if (Test-MarketingSafeText 'contact person@example.com') {
    throw 'Direct email identifier was not rejected.'
}

[pscustomobject]@{
    status = 'passed'
    assertions = 4
} | ConvertTo-Json -Compress
