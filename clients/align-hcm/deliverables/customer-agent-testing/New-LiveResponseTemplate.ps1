[CmdletBinding()]
param(
    [string]$ConfigurationPath = (Join-Path $PSScriptRoot '..\2026-07-23-hubspot-customer-agent-configuration.md'),
    [string]$OutputPath = (Join-Path $PSScriptRoot 'live-responses.json')
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path -LiteralPath $ConfigurationPath -PathType Leaf)) {
    throw "Configuration file not found: $ConfigurationPath"
}

$lines = Get-Content -Encoding UTF8 -LiteralPath $ConfigurationPath
$acceptanceStart = ($lines | Select-String -Pattern '^## Acceptance test suite$').LineNumber
$checklistStart = ($lines | Select-String -Pattern '^## Live portal completion checklist$').LineNumber

if (-not $acceptanceStart -or -not $checklistStart -or $checklistStart -le $acceptanceStart) {
    throw 'Could not locate the canonical acceptance-test table.'
}

$rows = @(
    $lines[$acceptanceStart..($checklistStart - 2)] |
        Where-Object { $_ -match '^\|[^-].+\|$' -and $_ -notmatch '^\| Test \|' }
)

if ($rows.Count -ne 26) {
    throw "Expected 26 canonical acceptance tests, found $($rows.Count)."
}

$tests = foreach ($row in $rows) {
    $columns = @($row.Trim('|').Split('|') | ForEach-Object { $_.Trim() })
    if ($columns.Count -ne 3) {
        throw "Malformed acceptance-test row: $row"
    }

    $id = ($columns[0].ToLowerInvariant() -replace '[^a-z0-9]+', '-').Trim('-')
    [ordered]@{
        id = $id
        name = $columns[0]
        prompt = $columns[1]
        requiredBehavior = $columns[2]
        response = ''
        testingInsightsSummary = ''
        sourceCitations = @()
        manualReview = 'pending'
        notes = ''
    }
}

$document = [ordered]@{
    schemaVersion = 1
    portalId = 242825734
    agentName = 'Align HCM Customer Agent'
    channel = 'live-chat-test'
    capturedAt = $null
    tester = 'Dillon Mohr'
    tests = @($tests)
}

$json = $document | ConvertTo-Json -Depth 8
[System.IO.File]::WriteAllText(
    [System.IO.Path]::GetFullPath($OutputPath),
    $json + [Environment]::NewLine,
    [System.Text.UTF8Encoding]::new($false)
)

Write-Output "Created $OutputPath with $($tests.Count) tests."

