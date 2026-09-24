[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$release = Join-Path $root 'release'
$sourceOutput = Join-Path $release 'source-markdown'
$implementationOutput = Join-Path $release 'implementation'
$evidenceOutput = Join-Path $release 'evidence'
$workbookOutput = Join-Path $release 'workbook'

New-Item -ItemType Directory -Force -Path $sourceOutput, $implementationOutput, $evidenceOutput, $workbookOutput | Out-Null

$sourceMap = [ordered]@{
    'HUB-01.md' = 'content\pillar-page-interview-integrated.md'
    'ART-01.md' = 'content\supporting-article-01-interview-integrated.md'
    'ART-02.md' = 'content\supporting-article-02-interview-integrated.md'
    'HUB-01-FAQ-companion.md' = 'content\faq-set-and-schema-candidate.md'
    'STR-01.md' = 'content\production-drafts\STR-01-home-builder-marketing-plan.md'
    'VIS-01.md' = 'content\production-drafts\VIS-01-seo-local-ai-visibility-home-builders.md'
    'WEB-01.md' = 'content\production-drafts\WEB-01-home-builder-website-design.md'
    'AUD-01.md' = 'content\production-drafts\AUD-01-custom-home-builder-target-market-segments.md'
    'LEAD-01.md' = 'content\production-drafts\LEAD-01-home-builder-lead-generation.md'
    'LOCAL-01.md' = 'content\production-drafts\LOCAL-01-local-seo-home-builders.md'
    'NUR-01.md' = 'content\production-drafts\NUR-01-home-builder-email-marketing-crm.md'
    'AUTO-01.md' = 'content\production-drafts\AUTO-01-home-builder-marketing-automation.md'
    'SOC-01.md' = 'content\production-drafts\SOC-01-social-media-marketing-home-builders.md'
    'CNT-01.md' = 'content\production-drafts\CNT-01-home-builder-content-marketing.md'
    'GAL-01.md' = 'content\production-drafts\GAL-01-best-home-builder-websites.md'
    'TPL-01.md' = 'content\production-drafts\TPL-01-home-builder-website-templates.md'
    'SEOCHK-01.md' = 'content\production-drafts\SEOCHK-01-home-builder-website-seo-checklist.md'
    'MKTRES-01.md' = 'content\production-drafts\MKTRES-01-home-builder-market-research.md'
    'PPC-01.md' = 'content\production-drafts\PPC-01-ppc-home-builders.md'
    'CONSULT-01.md' = 'content\production-drafts\CONSULT-01-home-builder-marketing-consulting.md'
}

foreach ($name in $sourceMap.Keys) {
    Copy-Item -LiteralPath (Join-Path $root $sourceMap[$name]) -Destination (Join-Path $sourceOutput $name) -Force
}

Copy-Item -LiteralPath (Join-Path $root 'implementation\AEO-GEO-SEO-CONTENT-STANDARD.md') -Destination $implementationOutput -Force
Copy-Item -LiteralPath (Join-Path $root 'implementation\WORDPRESS-IMPLEMENTATION-AND-RELEASE-GATE.md') -Destination $implementationOutput -Force
Copy-Item -LiteralPath (Join-Path $root 'evidence\live-technical-refresh-2026-08-28.md') -Destination $evidenceOutput -Force
Copy-Item -LiteralPath (Join-Path $root 'outputs\01a04906-96f3-7072-b3bf-0c2589aed6fa\BigOrange-19-Asset-Content-Production-Plan-2026-08-28.xlsx') -Destination $workbookOutput -Force

$zipName = 'BigOrange-19-Asset-AEO-GEO-SEO-Content-Package-2026-08-28.zip'
$temporaryZip = Join-Path (Join-Path $root 'working') $zipName
$finalZip = Join-Path $release $zipName
$staging = Join-Path (Join-Path $root 'working') 'release-zip-staging'
$resolvedRoot = [System.IO.Path]::GetFullPath($root)
$resolvedStaging = [System.IO.Path]::GetFullPath($staging)

if (-not $resolvedStaging.StartsWith($resolvedRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to use a staging directory outside the package root: $resolvedStaging"
}

if (Test-Path -LiteralPath $temporaryZip) {
    Remove-Item -LiteralPath $temporaryZip -Force
}
if (Test-Path -LiteralPath $staging) {
    Remove-Item -LiteralPath $staging -Recurse -Force
}
New-Item -ItemType Directory -Force -Path $staging | Out-Null

$archiveInputs = Get-ChildItem -LiteralPath $release | Where-Object { $_.Name -ne $zipName }
foreach ($item in $archiveInputs) {
    if ($item.Name -eq 'qa') {
        $qaStaging = Join-Path $staging 'qa'
        New-Item -ItemType Directory -Force -Path $qaStaging | Out-Null
        Get-ChildItem -LiteralPath $item.FullName | Where-Object {
            $_.Name -notin @('release-integrity.json', 'release-integrity.md')
        } | Copy-Item -Destination $qaStaging -Recurse -Force
    }
    else {
        Copy-Item -LiteralPath $item.FullName -Destination $staging -Recurse -Force
    }
}

$stagedInputs = Get-ChildItem -LiteralPath $staging | Select-Object -ExpandProperty FullName
Compress-Archive -LiteralPath $stagedInputs -DestinationPath $temporaryZip -CompressionLevel Optimal
Move-Item -LiteralPath $temporaryZip -Destination $finalZip -Force
Remove-Item -LiteralPath $staging -Recurse -Force

[pscustomobject]@{
    Zip = $finalZip
    ZipBytes = (Get-Item -LiteralPath $finalZip).Length
    SourceFiles = (Get-ChildItem -LiteralPath $sourceOutput -File).Count
    HtmlFiles = (Get-ChildItem -LiteralPath (Join-Path $release 'wordpress-ready-html') -File).Count
    SchemaFiles = (Get-ChildItem -LiteralPath (Join-Path $release 'schema') -File).Count
}
