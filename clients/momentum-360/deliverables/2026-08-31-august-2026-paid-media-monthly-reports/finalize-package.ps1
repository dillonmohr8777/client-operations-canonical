$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$pdfInfo = (Get-Command pdfinfo -ErrorAction Stop).Source
$renderResults = Get-Content -LiteralPath (Join-Path $root "render-results.json") -Raw | ConvertFrom-Json
$generatedAt = (Get-Date).ToUniversalTime().ToString("o")

$reportSpecs = @(
    [pscustomobject]@{ Id = "kimberly-james-bridal"; Name = "Kimberly James Bridal"; Vault = "01_Clients/Kimberly James Bridal/overview.md"; Benchmark = "18% lower"; Verification = "partial"; SlackTs = "1788195187.219509"; SlackFile = "F0BURLPKY2C"; DraftId = "r-289068546166256623"; DraftMessage = "1a059095242bbf1e" }
    [pscustomobject]@{ Id = "replenish-7-eleven"; Name = "Replenish and 7 Eleven"; Vault = "01_Clients/Replenish/overview.md"; Benchmark = "53% lower"; Verification = "verified"; SlackTs = "1788203384.489109"; SlackFile = "F0BU24AEX5J"; DraftId = "r1967016676275655719"; DraftMessage = "1a05939cc73d5f1a" }
    [pscustomobject]@{ Id = "omega-landscaping"; Name = "Omega Landscaping and Concrete"; Vault = "01_Clients/Omega Landscaping/overview.md"; Benchmark = "9% lower"; Verification = "verified"; SlackTs = "1788195191.025149"; SlackFile = "F0BTVBLG8S2"; DraftId = "r-4284499632042575556"; DraftMessage = "1a058bad09e4737f" }
    [pscustomobject]@{ Id = "onsite-concrete-landscape"; Name = "Onsite Concrete and Landscape"; Vault = "01_Clients/Onsite Concrete/overview.md"; Benchmark = "98% lower"; Verification = "partial"; SlackTs = "1788195192.840959"; SlackFile = "F0BTR2L00G3"; DraftId = "r31758029996920197"; DraftMessage = "1a058badb90f128a" }
    [pscustomobject]@{ Id = "nexla"; Name = "Nexla"; Vault = "01_Clients/Nexla/overview.md"; Benchmark = "40% lower"; Verification = "verified"; SlackTs = "1788195195.388849"; SlackFile = "F0BU107Q9N0"; DraftId = "r2013811896562371890"; DraftMessage = "1a058bae46a15774" }
    [pscustomobject]@{ Id = "puttery"; CanonicalId = "puttery-nyc"; Name = "Puttery NYC"; Vault = "01_Clients/Puttery NYC/overview.md"; Benchmark = ""; Verification = "partial"; SlackTs = "1788195197.186039"; SlackFile = "F0BTR2LNS8K"; DraftId = "r-5691375280000020505"; DraftMessage = "1a058b9cd77f2684" }
    [pscustomobject]@{ Id = "fagan-painting"; Name = "Fagan Painting"; Vault = "01_Clients/Fagan Painting/overview.md"; Benchmark = ""; Verification = "partial"; SlackTs = "1788202591.703319"; SlackFile = "F0BTY9MGM1Q"; DraftId = "r2970757487471283653"; DraftMessage = "1a0592b29f0675da" }
    [pscustomobject]@{ Id = "nkcdc"; Name = "NKCDC"; Vault = "01_Clients/NKCDC/overview.md"; Benchmark = ""; Verification = "verified"; SlackTs = "1788202593.817909"; SlackFile = "F0BUSMGQF8Q"; DraftId = "r-6455926872320057258"; DraftMessage = "1a0592b4eced2c4f" }
    [pscustomobject]@{ Id = "hope-wellness-center"; Name = "Hope Wellness Center"; Vault = "01_Clients/Hope Wellness Center/overview.md"; Benchmark = ""; Verification = "partial"; SlackTs = "1788202595.629599"; SlackFile = "F0BTY9M0PJ6"; DraftId = "r7835437098841164451"; DraftMessage = "1a0592b82b2f3432" }
    [pscustomobject]@{ Id = "bar-crawl-usa"; Name = "Bar Crawl USA"; Vault = "01_Clients/Bar Crawl USA/overview.md"; Benchmark = ""; Verification = "verified"; SlackTs = "1788202598.860869"; SlackFile = "F0BU07YMYQ1"; DraftId = "r-7549344221654521472"; DraftMessage = "1a0592c581c51729" }
    [pscustomobject]@{ Id = "va-claims-edge"; Name = "VA Claims Edge"; Vault = "01_Clients/VA Claims/overview.md"; Benchmark = ""; Verification = "verified"; SlackTs = "1788202600.856949"; SlackFile = "F0BTWCDS7LN"; DraftId = "r-8355734381525103143"; DraftMessage = "1a0592c9579ca923" }
    [pscustomobject]@{ Id = "revive-systems"; Name = "Revive Systems"; Vault = "01_Clients/Revive Systems/overview.md"; Benchmark = ""; Verification = "partial"; SlackTs = "1788202602.825559"; SlackFile = "F0BTS3CS2HZ"; DraftId = "r8476149539318222076"; DraftMessage = "1a0592cd26720506" }
    [pscustomobject]@{ Id = "bridge-software"; Name = "Bridge Software"; Vault = "01_Clients/Bridge Software Development/overview.md"; Benchmark = ""; Verification = "verified"; SlackTs = "1788202605.094159"; SlackFile = "F0BU07ZKYSV"; DraftId = "r2308166349582542619"; DraftMessage = "1a0592d078bbecd6" }
)

$qaReports = @()
foreach ($spec in $reportSpecs) {
    $reportDir = Join-Path $root ("reports\" + $spec.Id)
    $pdfPath = Join-Path $reportDir ($spec.Id + "-august-2026-monthly-report.pdf")
    $htmlPath = Join-Path $reportDir "index.html"
    $pdfText = & $pdfInfo $pdfPath 2>&1
    $pages = [int](($pdfText | Where-Object { $_ -match '^Pages:\s+(\d+)' } | Select-Object -First 1) -replace '^Pages:\s+', '')
    $html = Get-Content -LiteralPath $htmlPath -Raw
    $linkTexts = @([regex]::Matches($html, '<a\b[^>]*>(.*?)</a>', 'Singleline,IgnoreCase') | ForEach-Object { [regex]::Replace($_.Groups[1].Value, '<[^>]+>', '').Trim() })
    $render = $renderResults | Where-Object { $_.clientId -eq $spec.Id }
    $qaReports += [pscustomobject]@{
        client_id = $(if ($spec.CanonicalId) { $spec.CanonicalId } else { $spec.Id })
        source_id = $spec.Id
        pdf = $pdfPath
        pdf_sha256 = (Get-FileHash -LiteralPath $pdfPath -Algorithm SHA256).Hash.ToLowerInvariant()
        pdf_pages = $pages
        html_sha256 = (Get-FileHash -LiteralPath $htmlPath -Algorithm SHA256).Hash.ToLowerInvariant()
        mobile_overflow_px = [int]$render.mobileOverflowPx
        linked_text = $linkTexts
        linked_text_only_percentages = (@($linkTexts | Where-Object { $_ -notmatch '^\d+% lower$' }).Count -eq 0)
        expected_benchmark_link = $spec.Benchmark
        benchmark_link_matches = $(if ($spec.Benchmark) { $linkTexts.Count -eq 1 -and $linkTexts[0] -eq $spec.Benchmark } else { $linkTexts.Count -eq 0 })
    }
}

Add-Type -AssemblyName System.IO.Compression.FileSystem
$pptxPath = Join-Path $root "Replenish-August-2026-Monthly-Performance.pptx"
$zip = [IO.Compression.ZipFile]::OpenRead($pptxPath)
$pptxLinkTargets = @()
$pptxLinkedTexts = @()
try {
    foreach ($entry in $zip.Entries) {
        if ($entry.FullName -like 'ppt/slides/_rels/*.rels' -or $entry.FullName -like 'ppt/slides/slide*.xml') {
            $reader = [IO.StreamReader]::new($entry.Open())
            try { $xmlText = $reader.ReadToEnd() } finally { $reader.Dispose() }
            if ($xmlText -match 'wordstream.com/blog/2026-google-ads-benchmarks') { $pptxLinkTargets += $entry.FullName }
            foreach ($match in [regex]::Matches($xmlText, '<a:hlinkClick[^>]*>.*?</a:hlinkClick></a:rPr><a:t>(.*?)</a:t>', 'Singleline,IgnoreCase')) {
                $pptxLinkedTexts += [System.Net.WebUtility]::HtmlDecode($match.Groups[1].Value)
            }
        }
    }
}
finally { $zip.Dispose() }

$deckQa = Get-Content -LiteralPath (Join-Path $root "replenish-deck-qa.json") -Raw | ConvertFrom-Json
$corpus = Get-Item -LiteralPath (Join-Path $root "august-client-session-corpus.json")

$spendLedger = [ordered]@{
    period = "2026-08-01/2026-08-31"
    observed_at = "2026-08-31"
    currency = "USD"
    google_ads = [ordered]@{
        accounts = @(
            [ordered]@{ client_id = "kimberly-james-bridal"; account_id = "814-550-6229"; spend = 504.49; clicks = 138; impressions = 2393; average_cpc = 3.66; ctr_percent = 5.77 }
            [ordered]@{ client_id = "replenish-7-eleven"; account_id = "627-501-4654"; spend = 684.74; clicks = 705; impressions = 38690; average_cpc = 0.97; ctr_percent = 1.82 }
            [ordered]@{ client_id = "omega-landscaping"; account_id = "285-398-1364"; spend = 1318.69; clicks = 174; impressions_approx = 3730; average_cpc = 7.58; ctr_percent_approx = 4.67 }
            [ordered]@{ client_id = "onsite-concrete-landscape"; account_id = "103-371-5894"; spend = 88.07; clicks = 538; impressions_approx = 13400; average_cpc = 0.16; ctr_percent = 4.03 }
            [ordered]@{ client_id = "nexla"; account_id = "791-780-2207"; spend = 742.72; clicks = 210; impressions_approx = 6310; average_cpc = 3.54; ctr_percent_approx = 3.33 }
        )
        verified_spend_total = 3338.71
    }
    meta_ads = [ordered]@{
        client_id = "kimberly-james-bridal"
        evidence_scope = "two confirmed weekly windows, not full month"
        verified_partial_spend = 138.28
        verified_partial_leads = 11
        campaign_total_screenshot = [ordered]@{ observed_at = "2026-08-30"; leads = 18; spend = 295.24; cost_per_result = 16.40; scope = "campaign total, not August only" }
        full_month_total = "pending validation"
    }
    puttery = [ordered]@{ client_id = "puttery-nyc"; spend = "pending"; reason = "no verified advertising account source is mapped" }
    non_paid_media_clients = @("fagan-painting", "nkcdc", "hope-wellness-center", "bar-crawl-usa", "va-claims-edge", "revive-systems", "bridge-software")
    exclusions = @("tags2go", "fresh-blends-kwik-trip", "pritzker-law-group")
    boundary = "Channel and client totals remain separate. No unsupported cross channel total is claimed."
}
$spendLedger | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath (Join-Path $root "spend-ledger.json") -Encoding UTF8

$communications = [ordered]@{
    gmail = [ordered]@{
        from = "dillonmohr8777@gmail.com"
        status = "drafts-created-not-sent"
        drafts = @($reportSpecs | ForEach-Object { [ordered]@{ client_id = $(if ($_.CanonicalId) { $_.CanonicalId } else { $_.Id }); draft_id = $_.DraftId; message_id = $_.DraftMessage; subject = ($_.Name + " August 2026 report"); attachments_verified = $true } })
    }
    slack = [ordered]@{
        status = "posted-and-read-back"
        reports = @($reportSpecs | ForEach-Object { [ordered]@{ client_id = $(if ($_.CanonicalId) { $_.CanonicalId } else { $_.Id }); message_ts = $_.SlackTs; file_id = $_.SlackFile } })
        replenish_deck = [ordered]@{ message_ts = "1788203384.674659"; file_id = "F0BU0B99QNM" }
        ruben_dm = [ordered]@{ message_ts = "1788192693.662029"; permalink = "https://momentum3d.slack.com/archives/D0BEMU3E1H7/p1788192693662029"; status = "sent-and-read-back" }
    }
}
$communications | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath (Join-Path $root "communications-log.json") -Encoding UTF8

$qa = [ordered]@{
    generated_at = $generatedAt
    status = "verified"
    roster = @($reportSpecs | ForEach-Object { if ($_.CanonicalId) { $_.CanonicalId } else { $_.Id } })
    exclusions = @("tags2go", "fresh-blends-kwik-trip", "pritzker-law-group")
    reports = $qaReports
    report_assertions = [ordered]@{
        report_count = $qaReports.Count
        all_pdfs_four_pages = (@($qaReports | Where-Object { $_.pdf_pages -ne 4 }).Count -eq 0)
        all_mobile_overflow_zero = (@($qaReports | Where-Object { $_.mobile_overflow_px -ne 0 }).Count -eq 0)
        all_links_percentage_only = (@($qaReports | Where-Object { -not $_.linked_text_only_percentages -or -not $_.benchmark_link_matches }).Count -eq 0)
    }
    replenish_deck = [ordered]@{
        pptx = $pptxPath
        pptx_sha256 = (Get-FileHash -LiteralPath $pptxPath -Algorithm SHA256).Hash.ToLowerInvariant()
        slide_count = [int]$deckQa.slideCount
        linked_text = $pptxLinkedTexts
        link_relationship_entries = $pptxLinkTargets
        only_percentage_linked = ($pptxLinkedTexts.Count -eq 1 -and $pptxLinkedTexts[0] -eq "53% lower" -and $pptxLinkTargets.Count -eq 1)
    }
    session_history = [ordered]@{
        corpus = $corpus.FullName
        corpus_sha256 = (Get-FileHash -LiteralPath $corpus.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
        relevant_sessions = [int]((Get-Content -LiteralPath $corpus.FullName -Raw | ConvertFrom-Json).sessionCount)
        period = "2026-08-01/2026-08-31"
    }
    communications = [ordered]@{
        gmail_drafts = $reportSpecs.Count
        gmail_attachments_verified = $true
        gmail_contains_ai_or_coding_language = $false
        gmail_contains_quoted_history = $false
        slack_reports_posted_and_read_back = $reportSpecs.Count
        replenish_deck_posted_and_read_back = $true
        ruben_dm_sent_and_read_back = $true
    }
}
if (-not $qa.report_assertions.all_pdfs_four_pages -or -not $qa.report_assertions.all_mobile_overflow_zero -or -not $qa.report_assertions.all_links_percentage_only -or -not $qa.replenish_deck.only_percentage_linked) {
    $qa.status = "failed"
}
$qa | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath (Join-Path $root "qa-checklist.json") -Encoding UTF8

$manifestReports = @()
foreach ($spec in $reportSpecs) {
    $clientId = $(if ($spec.CanonicalId) { $spec.CanonicalId } else { $spec.Id })
    $pdfPath = (Join-Path $root ("reports\" + $spec.Id + "\" + $spec.Id + "-august-2026-monthly-report.pdf")).Replace('\', '/')
    $manifestReports += [ordered]@{
        report_id = "momentum-360-august-2026-$clientId"
        cadence = "monthly"
        title = ($spec.Name + " August 2026 Monthly Report")
        period_start = "2026-08-01"
        period_end = "2026-08-31"
        generated_at = $generatedAt
        verification_status = $spec.Verification
        delivery_status = "slack-posted; gmail-draft-created"
        summary = "Four page August client report from the verified Momentum 360 cross channel delivery package, with uncertainty and next actions preserved."
        source_refs = @((Join-Path $root "README.md").Replace('\', '/'), (Join-Path $root "qa-checklist.json").Replace('\', '/'), (Join-Path $root "spend-ledger.json").Replace('\', '/'))
        client = [ordered]@{ id = $clientId; name = $spec.Name; vault_note = $spec.Vault }
        artifact = [ordered]@{ path = $pdfPath }
    }
}
$manifest = [ordered]@{ batch_id = "M360-AUGUST-2026-MONTHLY-REPORTS"; generated_at = $generatedAt; reports = $manifestReports }
$manifestPath = Join-Path $root "report-run.json"
$manifest | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $manifestPath -Encoding UTF8
$incomingPath = "C:\Users\dillo\repos\dillon-os\_os\automation\incoming\reports\2026-08-31-momentum-august-monthly-reports.json"
$manifest | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $incomingPath -Encoding UTF8

$zipPath = Join-Path $root "August-2026-Monthly-Client-Reports.zip"
if ([IO.File]::Exists($zipPath)) { [IO.File]::Delete($zipPath) }
$zipStream = [IO.File]::Open($zipPath, [IO.FileMode]::CreateNew)
$packageZip = [IO.Compression.ZipArchive]::new($zipStream, [IO.Compression.ZipArchiveMode]::Create)
try {
    foreach ($spec in $reportSpecs) {
        $reportFile = Join-Path $root ("reports\" + $spec.Id + "\" + $spec.Id + "-august-2026-monthly-report.pdf")
        [void][IO.Compression.ZipFileExtensions]::CreateEntryFromFile($packageZip, $reportFile, ("reports/" + [IO.Path]::GetFileName($reportFile)), [IO.Compression.CompressionLevel]::Optimal)
    }
    foreach ($artifact in @("Replenish-August-2026-Monthly-Performance.pptx", "Replenish-August-2026-Monthly-Performance.pdf", "README.md", "qa-checklist.json", "spend-ledger.json", "source-ledger.json", "logo-provenance.json", "communications-log.json", "report-run.json", "slack-last-week-cross-reference.json")) {
        $artifactPath = Join-Path $root $artifact
        [void][IO.Compression.ZipFileExtensions]::CreateEntryFromFile($packageZip, $artifactPath, $artifact, [IO.Compression.CompressionLevel]::Optimal)
    }
}
finally {
    $packageZip.Dispose()
    $zipStream.Dispose()
}

[ordered]@{ status = $qa.status; qa = (Join-Path $root "qa-checklist.json"); spend = (Join-Path $root "spend-ledger.json"); communications = (Join-Path $root "communications-log.json"); manifest = $incomingPath; zip = $zipPath; zip_sha256 = (Get-FileHash -LiteralPath $zipPath -Algorithm SHA256).Hash.ToLowerInvariant() } | ConvertTo-Json
