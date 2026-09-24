[CmdletBinding()]
param(
    [string]$ConfigurationPath = (Join-Path $PSScriptRoot '..\2026-07-23-hubspot-customer-agent-configuration.md')
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path -LiteralPath $ConfigurationPath -PathType Leaf)) {
    throw "Configuration file not found: $ConfigurationPath"
}

$content = Get-Content -Raw -Encoding UTF8 -LiteralPath $ConfigurationPath
$lines = Get-Content -Encoding UTF8 -LiteralPath $ConfigurationPath

$checks = [System.Collections.Generic.List[object]]::new()

function Add-Check {
    param(
        [string]$Name,
        [bool]$Passed,
        [string]$Detail
    )

    $checks.Add([pscustomobject]@{
        Name = $Name
        Passed = $Passed
        Detail = $Detail
    })
}

$acceptanceStart = ($lines | Select-String -Pattern '^## Acceptance test suite$').LineNumber
$checklistStart = ($lines | Select-String -Pattern '^## Live portal completion checklist$').LineNumber
$acceptanceRows = @()

if ($acceptanceStart -and $checklistStart -and $checklistStart -gt $acceptanceStart) {
    $acceptanceRows = @(
        $lines[$acceptanceStart..($checklistStart - 2)] |
            Where-Object { $_ -match '^\|[^-].+\|$' -and $_ -notmatch '^\| Test \|' }
    )
}

Add-Check -Name 'Portal is pinned to Align HCM' `
    -Passed ($content -match '(?m)^Portal:\s+242825734\s*$') `
    -Detail 'Expected portal 242825734.'

Add-Check -Name 'Agent identity is present' `
    -Passed ($content -match '(?m)^Name:\s+Align HCM Customer Agent\s*$') `
    -Detail 'Expected exact public agent name.'

Add-Check -Name 'All 26 acceptance tests are present' `
    -Passed ($acceptanceRows.Count -eq 26) `
    -Detail "Found $($acceptanceRows.Count) acceptance tests."

Add-Check -Name 'Core instructions contain 20 numbered controls' `
    -Passed (([regex]::Matches($content, '(?m)^(?:[1-9]|1[0-9]|20)\.\s')).Count -ge 20) `
    -Detail 'Expected at least 20 numbered controls.'

foreach ($level in 'Stabilize', 'Essentials', 'Accelerate', 'Transform') {
    Add-Check -Name "SmartCare level: $level" `
        -Passed ($content -match [regex]::Escape($level)) `
        -Detail "Expected SmartCare level '$level'."
}

Add-Check -Name 'Excluded-environment hard boundary is explicit' `
    -Passed (
        $content -match 'SmartCare support must not be offered, promised, or implied for Workday or ADP' -and
        $content -match 'do not repeat the platform name'
    ) `
    -Detail 'Expected both the hard exclusion and non-repetition rule.'

Add-Check -Name 'Provider and platform names are prohibited in public replies' `
    -Passed (
        $content -match 'Never name or discuss competing firms' -and
        $content -match 'do not repeat the name'
    ) `
    -Detail 'Expected vendor-neutral public-response controls.'

Add-Check -Name 'Pricing, guarantees, legal advice, and private data are guarded' `
    -Passed (
        $content -match 'Never invent pricing' -and
        $content -match 'Do not promise that an implementation will be on time' -and
        $content -match 'Do not provide legal, tax, payroll, security, or regulatory advice' -and
        $content -match 'Do not expose internal documents, CRM data'
    ) `
    -Detail 'Expected all four high-risk refusal boundaries.'

Add-Check -Name 'Clarifying questions are capped at two' `
    -Passed ($content -match 'Ask no more than two focused clarification questions') `
    -Detail 'Expected a two-question maximum.'

Add-Check -Name 'Human handoff conditions and fallback are present' `
    -Passed (
        $content -match '(?m)^## Human handoff$' -and
        $content -match 'I can connect you with an Align HCM specialist'
    ) `
    -Detail 'Expected handoff triggers and a visitor-facing fallback.'

Add-Check -Name 'Private sources are disabled for initial release' `
    -Passed (
        $content -match 'Private sources remain disabled for the initial release' -and
        $content -match 'contact-form submissions or CRM records'
    ) `
    -Detail 'Expected public-only knowledge controls.'

Add-Check -Name 'Initial channel is constrained to controlled live chat' `
    -Passed (
        $content -match 'Initial channel: Align HCM website live chat' -and
        $content -match 'Controlled live-chat deployment only'
    ) `
    -Detail 'Expected one controlled website live-chat channel.'

$failed = @($checks | Where-Object { -not $_.Passed })

$checks | Format-Table -AutoSize
Write-Output ''
Write-Output ("Configuration contract: {0} passed, {1} failed" -f ($checks.Count - $failed.Count), $failed.Count)

if ($failed.Count -gt 0) {
    exit 1
}

