[CmdletBinding()]
param(
    [string]$PackageRoot = 'C:\Users\dillo\Documents\Codex\work\prospect-radar-all-198-20260812',
    [string]$DillonOsRepo = 'C:\Users\dillo\repos\dillon-os',
    [string]$OutputRoot = $PSScriptRoot
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$activeManifestPath = Join-Path $PackageRoot 'ALL-BUILDS-MANIFEST.json'
$excludedManifestPath = Join-Path $PackageRoot 'REMOVED-AND-HELD-MANIFEST.json'
$week33Path = '02_Campaigns/AI Site Builder Outreach Engine/batches/phl-2026-w33/manifest.csv'
$week34Path = '02_Campaigns/AI Site Builder Outreach Engine/batches/phl-2026-w34/manifest.csv'

foreach ($requiredPath in @($activeManifestPath, $excludedManifestPath, $DillonOsRepo, $OutputRoot)) {
    if (-not (Test-Path -LiteralPath $requiredPath)) {
        throw "Required path not found: $requiredPath"
    }
}

function Read-GitCsv {
    param(
        [Parameter(Mandatory = $true)][string]$Ref,
        [Parameter(Mandatory = $true)][string]$Path
    )

    $spec = "${Ref}:$Path"
    $content = & git -C $DillonOsRepo show $spec
    if ($LASTEXITCODE -ne 0) {
        throw "Unable to read $spec from $DillonOsRepo"
    }

    return @($content | ConvertFrom-Csv)
}

function Test-Hub {
    param(
        [Parameter(Mandatory = $true)][string]$Url,
        [Parameter(Mandatory = $true)][int]$ManifestCount,
        [Parameter(Mandatory = $true)][string]$Role,
        [bool]$MeasureBuildCards = $false
    )

    $checkedAt = (Get-Date).ToUniversalTime().ToString('o')
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 30
        $html = [string]$response.Content
        $titleMatch = [regex]::Match($html, '<title>([^<]+)</title>', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
        return [pscustomobject][ordered]@{
            url = $Url
            role = $Role
            checkedAt = $checkedAt
            rootHttpStatus = [int]$response.StatusCode
            title = $titleMatch.Groups[1].Value
            noindex = [bool]($html -match 'noindex')
            manifestCount = $ManifestCount
            displayedBuildCards = if ($MeasureBuildCards) {
                ([regex]::Matches($html, 'class="build"', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)).Count
            }
            else {
                $null
            }
        }
    }
    catch {
        return [pscustomobject][ordered]@{
            url = $Url
            role = $Role
            checkedAt = $checkedAt
            rootHttpStatus = $null
            title = $null
            noindex = $null
            manifestCount = $ManifestCount
            displayedBuildCards = $null
            error = $_.Exception.Message
        }
    }
}

$activeManifest = Get-Content -Raw -LiteralPath $activeManifestPath | ConvertFrom-Json
$excludedManifest = Get-Content -Raw -LiteralPath $excludedManifestPath | ConvertFrom-Json
$week33 = Read-GitCsv -Ref 'origin/pr-281' -Path $week33Path
$week34 = Read-GitCsv -Ref 'origin/pr-283' -Path $week34Path

$historicalHub = 'https://momentum-prospect-radar-next20-2026-08-11.netlify.app'
$week33Hub = 'https://phl-2026-w33.netlify.app'
$week34Hub = 'https://phl-2026-w34.netlify.app'

$observations = New-Object 'System.Collections.Generic.List[object]'

foreach ($record in @($excludedManifest.excluded)) {
    [void]$observations.Add([pscustomobject][ordered]@{
        slug = [string]$record.slug
        business = [System.Net.WebUtility]::HtmlDecode([string]$record.name)
        batch = [string]$record.batch
        sourceClass = 'historical-held-or-removed'
        qaReady = 'hold'
        mailReady = 'hold'
        publicationState = [string]$record.publicationStatus
        siteUrl = ''
        sourceUrl = ''
        route = [string]$record.route
        sourceLocator = [string]$record.source
        precedence = 10
    })
}

foreach ($record in @($activeManifest.records)) {
    [void]$observations.Add([pscustomobject][ordered]@{
        slug = [string]$record.slug
        business = [System.Net.WebUtility]::HtmlDecode([string]$record.name)
        batch = [string]$record.batch
        sourceClass = 'historical-curated-active'
        qaReady = 'ready'
        mailReady = 'hold'
        publicationState = 'publication-ready'
        siteUrl = $historicalHub + [string]$record.route
        sourceUrl = ''
        route = [string]$record.route
        sourceLocator = [string]$record.source
        precedence = 20
    })
}

foreach ($record in @($week33)) {
    [void]$observations.Add([pscustomobject][ordered]@{
        slug = [string]$record.slug
        business = [string]$record.business
        batch = 'phl-2026-w33'
        sourceClass = 'week-33-current-review'
        qaReady = [string]$record.qa_ready
        mailReady = [string]$record.mail_ready
        publicationState = if ($record.qa_ready -eq 'ready') { 'qa-ready' } else { 'qa-hold' }
        siteUrl = [string]$record.site_url
        sourceUrl = [string]$record.source_url
        route = "/sites/$($record.slug)/"
        sourceLocator = "git://dillonmohr8777/dillon-os/origin-pr-281/$week33Path"
        precedence = 30
    })
}

foreach ($record in @($week34)) {
    [void]$observations.Add([pscustomobject][ordered]@{
        slug = [string]$record.slug
        business = [string]$record.business
        batch = 'phl-2026-w34'
        sourceClass = 'week-34-current-review'
        qaReady = [string]$record.qa_ready
        mailReady = [string]$record.mail_ready
        publicationState = if ($record.qa_ready -eq 'ready') { 'qa-ready' } else { 'qa-hold' }
        siteUrl = [string]$record.site_url
        sourceUrl = [string]$record.source_url
        route = "/sites/$($record.slug)/"
        sourceLocator = "git://dillonmohr8777/dillon-os/origin-pr-283/$week34Path"
        precedence = 40
    })
}

$inventory = @(
    $observations |
        Group-Object slug |
        ForEach-Object {
            $latest = $_.Group | Sort-Object precedence | Select-Object -Last 1
            $batches = @($_.Group.batch | Sort-Object -Unique)
            [pscustomobject][ordered]@{
                slug = $latest.slug
                business = $latest.business
                currentBatch = $latest.batch
                sourceClass = $latest.sourceClass
                qaReady = $latest.qaReady
                mailReady = $latest.mailReady
                publicationState = $latest.publicationState
                siteUrl = $latest.siteUrl
                sourceUrl = $latest.sourceUrl
                route = $latest.route
                occurrenceCount = $_.Count
                sourceBatches = ($batches -join ' | ')
                sourceLocator = $latest.sourceLocator
            }
        } |
        Sort-Object slug
)

$historicalObservations = @($observations | Where-Object { $_.precedence -lt 30 })
$historicalUniqueSlugs = @($historicalObservations.slug | Sort-Object -Unique)
$week33Slugs = @($week33.slug)
$week34Slugs = @($week34.slug)
$week33HistoricalOverlap = @($week33Slugs | Where-Object { $historicalUniqueSlugs -contains $_ })
$week34HistoricalOverlap = @($week34Slugs | Where-Object { $historicalUniqueSlugs -contains $_ })
$week34Week33Overlap = @($week34Slugs | Where-Object { $week33Slugs -contains $_ })

$liveHubs = @(
    Test-Hub -Url $historicalHub -ManifestCount @($activeManifest.records).Count -Role 'archive-index-only-until-live-card-list-matches-curated-manifest' -MeasureBuildCards $true
    Test-Hub -Url $week33Hub -ManifestCount @($week33).Count -Role 'current-week-33-review'
    Test-Hub -Url $week34Hub -ManifestCount @($week34).Count -Role 'current-week-34-review'
)

$registry = [pscustomobject][ordered]@{
    schemaVersion = 1
    generatedAt = (Get-Date).ToUniversalTime().ToString('o')
    clientId = 'momentum-360'
    program = 'AI Tech News / AI Site Builder Outreach Engine'
    operatingRule = 'One canonical business row per slug. QA readiness is separate from outreach approval. mail_ready remains hold unless Dillon approves the exact outreach batch.'
    counts = [pscustomobject][ordered]@{
        rawRouteArtifacts = $observations.Count
        uniqueBusinesses = $inventory.Count
        duplicateOrReplacementArtifacts = $observations.Count - $inventory.Count
        historicalRouteArtifacts = $historicalObservations.Count
        historicalUniqueBusinesses = $historicalUniqueSlugs.Count
        historicalCuratedReady = @($activeManifest.records).Count
        historicalHeldOrRemoved = @($excludedManifest.excluded).Count
        week33Sites = @($week33).Count
        week33QaReady = @($week33 | Where-Object { $_.qa_ready -eq 'ready' }).Count
        week33HistoricalOverlap = $week33HistoricalOverlap.Count
        week33NetNewUnique = @($week33).Count - $week33HistoricalOverlap.Count
        week34Sites = @($week34).Count
        week34QaReady = @($week34 | Where-Object { $_.qa_ready -eq 'ready' }).Count
        week34QaHold = @($week34 | Where-Object { $_.qa_ready -ne 'ready' }).Count
        week34HistoricalOverlap = $week34HistoricalOverlap.Count
        week34Week33Overlap = $week34Week33Overlap.Count
        week34NetNewUnique = @($week34Slugs | Where-Object { ($historicalUniqueSlugs -notcontains $_) -and ($week33Slugs -notcontains $_) }).Count
        currentQaReadyUnique = @($inventory | Where-Object { $_.qaReady -eq 'ready' }).Count
        currentQaHoldUnique = @($inventory | Where-Object { $_.qaReady -ne 'ready' }).Count
        currentMailReady = @($inventory | Where-Object { $_.mailReady -eq 'ready' }).Count
    }
    overlaps = [pscustomobject][ordered]@{
        week33HistoricalSlugs = $week33HistoricalOverlap
        week34HistoricalSlugs = $week34HistoricalOverlap
        week34Week33Slugs = $week34Week33Overlap
    }
    liveHubs = $liveHubs
    pullRequestLineage = @(
        [pscustomobject][ordered]@{ number = 278; role = 'week-33 precursor build'; disposition = 'superseded for review by pull request 281'; url = 'https://github.com/dillonmohr8777/dillon-os/pull/278' }
        [pscustomobject][ordered]@{ number = 279; role = 'week-33 Netlify batch deploy workflow'; disposition = 'open infrastructure change'; url = 'https://github.com/dillonmohr8777/dillon-os/pull/279' }
        [pscustomobject][ordered]@{ number = 281; role = 'authoritative week-33 QA revision'; disposition = 'open, 25 of 25 qa_ready, mail hold'; url = 'https://github.com/dillonmohr8777/dillon-os/pull/281' }
        [pscustomobject][ordered]@{ number = 282; role = 'Prospect Radar audit engine'; disposition = 'merged infrastructure, not counted as a site batch'; url = 'https://github.com/dillonmohr8777/dillon-os/pull/282' }
        [pscustomobject][ordered]@{ number = 283; role = 'week-34 batch'; disposition = 'open, 14 of 25 qa_ready, 11 held, mail hold'; url = 'https://github.com/dillonmohr8777/dillon-os/pull/283' }
    )
    sources = [pscustomobject][ordered]@{
        activeManifest = $activeManifestPath
        excludedManifest = $excludedManifestPath
        week33Manifest = "git://dillonmohr8777/dillon-os/origin-pr-281/$week33Path"
        week34Manifest = "git://dillonmohr8777/dillon-os/origin-pr-283/$week34Path"
    }
}

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$registryPath = Join-Path $OutputRoot 'batch-registry.json'
$inventoryPath = Join-Path $OutputRoot 'site-inventory.csv'

[System.IO.File]::WriteAllText($registryPath, (($registry | ConvertTo-Json -Depth 12) + [Environment]::NewLine), $utf8NoBom)
$csv = @($inventory | ConvertTo-Csv -NoTypeInformation)
[System.IO.File]::WriteAllLines($inventoryPath, $csv, $utf8NoBom)

[pscustomobject]@{
    registry = $registryPath
    inventory = $inventoryPath
    rawRouteArtifacts = $registry.counts.rawRouteArtifacts
    uniqueBusinesses = $registry.counts.uniqueBusinesses
    currentQaReadyUnique = $registry.counts.currentQaReadyUnique
    currentMailReady = $registry.counts.currentMailReady
}
