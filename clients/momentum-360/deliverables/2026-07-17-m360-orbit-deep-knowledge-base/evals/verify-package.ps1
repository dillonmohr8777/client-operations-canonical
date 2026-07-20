[CmdletBinding()]
param(
    [string]$PackageRoot
)

$ErrorActionPreference = 'Stop'
if ([string]::IsNullOrWhiteSpace($PackageRoot)) {
    $PackageRoot = Split-Path -Parent $PSScriptRoot
}
$failures = [System.Collections.Generic.List[string]]::new()

$expectedFiles = @(
    'README.md',
    '00-knowledge-governance.md',
    'knowledge\01-capture-showcase.md',
    'knowledge\02-get-found.md',
    'knowledge\03-win-customers.md',
    'knowledge\04-content-operations.md',
    'architecture\00-frozen-site-boundary.md',
    'architecture\01-momentum-pipeline-architecture.md',
    'architecture\02-work-object-contracts.md',
    'architecture\03-july-17-pilot-decision-sheet.md',
    'architecture\04-jesse-jason-momentum-intel-integration.md',
    'evals\eval-contract.md',
    'communications\slack-drafts.md',
    'communications\email-drafts.md'
)

foreach ($relativePath in $expectedFiles) {
    $path = Join-Path $PackageRoot $relativePath
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
        $failures.Add("Missing file: $relativePath")
    }
    elseif ((Get-Item -LiteralPath $path).Length -eq 0) {
        $failures.Add("Empty file: $relativePath")
    }
}

$chapterMap = [ordered]@{
    'knowledge\01-capture-showcase.md' = @('VERA','LENS','AERO','FRAME','WAVE')
    'knowledge\02-get-found.md' = @('ATLAS','MAPS','SIGNAL','GRID')
    'knowledge\03-win-customers.md' = @('PULSE','HOOK','PIN','REVIVE','ECHO','STUDIO')
    'knowledge\04-content-operations.md' = @('FORGE','PRISM','SCOPE','PATCH')
}

$requiredConcepts = @(
    'mission',
    'boundar',
    'required input',
    'source',
    'diagnostic',
    'template',
    'SOP',
    'quality',
    'approval',
    'KPI',
    'evaluation',
    'failure',
    'handoff'
)

foreach ($relativePath in $chapterMap.Keys) {
    $path = Join-Path $PackageRoot $relativePath
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { continue }
    $text = Get-Content -Raw -Encoding UTF8 -LiteralPath $path
    foreach ($agent in $chapterMap[$relativePath]) {
        if ($text -notmatch "(?i)\b$([regex]::Escape($agent))\b") {
            $failures.Add("$relativePath does not name $agent")
        }
    }
    foreach ($concept in $requiredConcepts) {
        if ($text -notmatch "(?i)$([regex]::Escape($concept))") {
            $failures.Add("$relativePath lacks concept: $concept")
        }
    }
    if (([regex]::Matches($text, 'https?://')).Count -lt 3) {
        $failures.Add("$relativePath has fewer than three direct source URLs")
    }
}

$architecturePath = Join-Path $PackageRoot 'architecture\01-momentum-pipeline-architecture.md'
if (Test-Path -LiteralPath $architecturePath) {
    $architecture = Get-Content -Raw -Encoding UTF8 -LiteralPath $architecturePath
    foreach ($term in @('site.*frozen','client_id','ApprovalPacket','Maps-first','GPT-5\.6')) {
        if ($architecture -notmatch "(?is)$term") {
            $failures.Add("Pipeline architecture lacks required pattern: $term")
        }
    }
}

$integrationPath = Join-Path $PackageRoot 'architecture\04-jesse-jason-momentum-intel-integration.md'
if (Test-Path -LiteralPath $integrationPath) {
    $integration = Get-Content -Raw -Encoding UTF8 -LiteralPath $integrationPath
    foreach ($term in @('Jesse','Jason','Momentum Intel','second.*19.agent page','Website Health','Weekly Executive Brief','No change to the existing live Orbit site')) {
        if ($integration -notmatch "(?is)$term") {
            $failures.Add("Jesse/Jason/Momentum Intel integration lacks required pattern: $term")
        }
    }
}

foreach ($relativePath in @('communications\slack-drafts.md','communications\email-drafts.md')) {
    $path = Join-Path $PackageRoot $relativePath
    if (Test-Path -LiteralPath $path) {
        $text = Get-Content -Raw -Encoding UTF8 -LiteralPath $path
        if ($text -notmatch '(?i)draft only|review-only') {
            $failures.Add("$relativePath does not state its draft-only boundary")
        }
        if ($text -notmatch '(?i)not.*sent|nothing.*sent') {
            $failures.Add("$relativePath does not state that it was not sent")
        }
    }
}

$result = [pscustomobject]@{
    packageRoot = $PackageRoot
    expectedFileCount = $expectedFiles.Count
    specialistCount = 19
    failureCount = $failures.Count
    failures = @($failures)
    status = if ($failures.Count -eq 0) { 'pass' } else { 'fail' }
}

$result | ConvertTo-Json -Depth 5
if ($failures.Count -gt 0) { exit 1 }
