param(
  [string]$ConfigPath = (Join-Path $PSScriptRoot "watchlist.json"),
  [switch]$ResetBaseline
)

$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Add-Type -AssemblyName System.Web

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$root = $PSScriptRoot
$runtimeRoot = Join-Path $root "runtime"
$reportRoot = Join-Path $root "reports"
$statePath = Join-Path $runtimeRoot "state.json"
$latestMarkdownPath = Join-Path $reportRoot "latest.md"
$latestJsonPath = Join-Path $reportRoot "latest.json"

New-Item -ItemType Directory -Force -Path $runtimeRoot, $reportRoot | Out-Null

function ConvertTo-PlainText {
  param([object]$Value)
  if ($null -eq $Value) { return "" }
  $text = [string]$Value
  $text = [System.Net.WebUtility]::HtmlDecode($text)
  $text = [regex]::Replace($text, '<[^>]+>', ' ')
  $text = [regex]::Replace($text, '\s+', ' ').Trim()
  return $text
}

function Get-NodeText {
  param(
    [System.Xml.XmlNode]$Node,
    [string[]]$LocalNames
  )
  foreach ($name in $LocalNames) {
    $match = $Node.SelectSingleNode("*[local-name()='$name']")
    if ($match) { return [string]$match.InnerText }
  }
  return ""
}

function Get-LinkText {
  param([System.Xml.XmlNode]$Node)
  $matches = @($Node.SelectNodes("*[local-name()='link']"))
  foreach ($match in $matches) {
    if ($match.Attributes['href']) { return [string]$match.Attributes['href'].Value }
    if (![string]::IsNullOrWhiteSpace($match.InnerText)) { return [string]$match.InnerText }
  }
  return ""
}

function Get-CanonicalUrl {
  param([string]$Value)
  if ([string]::IsNullOrWhiteSpace($Value)) { return "" }
  try {
    $uri = [Uri]$Value
    if ($uri.Host -match '(^|\.)bing\.com$' -and $uri.AbsolutePath -match 'apiclick') {
      $query = [System.Web.HttpUtility]::ParseQueryString($uri.Query)
      if ($query['url']) { $uri = [Uri]$query['url'] }
    }

    $builder = New-Object System.UriBuilder($uri)
    $builder.Fragment = ""
    $queryValues = [System.Web.HttpUtility]::ParseQueryString($builder.Query)
    foreach ($key in @($queryValues.AllKeys)) {
      if ($key -and ($key -match '^utm_' -or $key -in @('gclid','fbclid','msclkid','mc_cid','mc_eid'))) {
        $queryValues.Remove($key)
      }
    }
    $builder.Query = $queryValues.ToString()
    return $builder.Uri.AbsoluteUri.TrimEnd('/')
  } catch {
    return $Value.Trim()
  }
}

function Test-AllowedDomain {
  param(
    [string]$Url,
    [object[]]$Domains
  )
  if ([string]::IsNullOrWhiteSpace($Url)) { return $false }
  try { $domainHost = ([Uri]$Url).Host.ToLowerInvariant() } catch { return $false }
  foreach ($domainValue in $Domains) {
    $domain = ([string]$domainValue).ToLowerInvariant().TrimStart('.')
    if ($domainHost -eq $domain -or $domainHost.EndsWith(".$domain")) { return $true }
  }
  return $false
}

function ConvertTo-DateTimeOffset {
  param([string]$Value)
  if ([string]::IsNullOrWhiteSpace($Value)) { return $null }
  $parsed = [DateTimeOffset]::MinValue
  if ([DateTimeOffset]::TryParse($Value, [Globalization.CultureInfo]::InvariantCulture, [Globalization.DateTimeStyles]::AllowWhiteSpaces, [ref]$parsed)) {
    return $parsed.ToUniversalTime()
  }
  return $null
}

function Get-Fingerprint {
  param([string]$WatchId, [string]$Url, [string]$Title)
  $material = "$WatchId|$Url|$Title".ToLowerInvariant()
  $sha = [Security.Cryptography.SHA256]::Create()
  try {
    $bytes = [Text.Encoding]::UTF8.GetBytes($material)
    return ([BitConverter]::ToString($sha.ComputeHash($bytes))).Replace('-', '').ToLowerInvariant()
  } finally {
    $sha.Dispose()
  }
}

function Get-Category {
  param([string]$Text)
  $value = $Text.ToLowerInvariant()
  if ($value -match 'acquir|merger|merges|investment|funding|private equity') { return 'acquisition-or-funding' }
  if ($value -match 'award|recogn|ranked|certif|best workplace') { return 'award-or-recognition' }
  if ($value -match 'partner|partnership|alliance|collaborat|reseller|joins .*network') { return 'partnership' }
  if ($value -match 'launch|introduc|unveil|new service|new offering|expands? .*practice') { return 'service-or-product-launch' }
  if ($value -match 'selected|customer|client success|case study|go-live|implementation success') { return 'customer-win-or-proof' }
  if ($value -match 'appoint|named .*chief|named .*president|vice president|leadership') { return 'leadership' }
  if ($value -match 'report|study|survey|benchmark|research|index') { return 'research-or-thought-leadership' }
  if ($value -match 'expand|new office|new market|enters .*market') { return 'market-expansion' }
  return 'general-company-news'
}

function Test-StrategicRelevance {
  param([object]$Watch, [string]$Text, [string]$Category)
  $value = $Text.ToLowerInvariant()
  if ($Watch.kind -eq 'platform-ecosystem') {
    return $value -match 'partner|partnership|implementation|service delivery|systems integrator|award|network'
  }
  if ($Category -ne 'general-company-news') { return $true }
  return $value -match 'human capital|\bhcm\b|\bhr tech|payroll|workforce|implementation|client-side|go-live|managed support|managed service|ukg|dayforce|hibob'
}

function Get-Score {
  param([object]$Watch, [string]$Category, [string]$Text, [string]$SourceType)
  $score = if ($Watch.kind -eq 'direct-competitor') { 30 } else { 20 }
  if ([int]$Watch.tier -eq 1) { $score += 8 }
  $weights = @{
    'acquisition-or-funding' = 28
    'partnership' = 24
    'service-or-product-launch' = 24
    'customer-win-or-proof' = 20
    'award-or-recognition' = 16
    'market-expansion' = 16
    'leadership' = 12
    'research-or-thought-leadership' = 12
    'general-company-news' = 5
  }
  $score += [int]$weights[$Category]
  foreach ($term in @('UKG','Dayforce','HiBob')) {
    if ($Text -match [regex]::Escape($term)) { $score += 5 }
  }
  if ($Text -match '(?i)implementation|client-side|go-live|optimization|managed support|service delivery') { $score += 12 }
  if ($SourceType -eq 'rss') { $score += 6 } else { $score += 3 }
  return [Math]::Min(100, $score)
}

function Get-WhyItMatters {
  param([string]$Category, [object]$Watch)
  $platformText = (@($Watch.platforms) -join ', ')
  switch ($Category) {
    'acquisition-or-funding' { return "Could change delivery capacity, reach, pricing pressure, or category visibility around $platformText." }
    'partnership' { return "Strengthens ecosystem authority and may influence buyers searching for a $platformText implementation partner." }
    'service-or-product-launch' { return "Creates a named offer that can capture high-intent implementation, rescue, or optimization searches." }
    'customer-win-or-proof' { return "Adds proof that can shape buyer shortlists and AI-generated partner recommendations." }
    'award-or-recognition' { return "Adds third-party credibility that can improve shortlist consideration and citation likelihood." }
    'market-expansion' { return "May signal new delivery coverage, capacity, or segment focus." }
    'leadership' { return "May precede a practice expansion, positioning shift, or stronger go-to-market activity." }
    'research-or-thought-leadership' { return "Can create a citation asset and influence the questions buyers use during partner selection." }
    default { return "Relevant official-source movement from a monitored $($Watch.kind) in the $platformText market." }
  }
}

function Get-ReleaseConcept {
  param([string]$Category, [object]$Watch)
  $platformText = (@($Watch.platforms) -join ' and ')
  switch ($Category) {
    'partnership' {
      return [ordered]@{
        headline = "Align HCM expands its $platformText implementation ecosystem to give buyers clearer delivery ownership"
        angle = "Lead with the buyer problem: software, partner, and internal-team responsibilities are often unclear before signature."
        proofRequired = "Current authorized relationship, named service scope, delivery capacity, geography, and an approved executive quote."
      }
    }
    'service-or-product-launch' {
      return [ordered]@{
        headline = "Align HCM launches a rapid $platformText implementation readiness and rescue assessment"
        angle = "Position a defined assessment around scope, data, integrations, testing, ownership, go-live risk, and the recovery plan."
        proofRequired = "Final offer name, owner, deliverables, turnaround time, availability, pricing approach, and at least one approved proof point."
      }
    }
    'customer-win-or-proof' {
      return [ordered]@{
        headline = "Align HCM helps an enterprise team stabilize its $platformText implementation and build post-go-live ownership"
        angle = "Use a client-approved implementation story with quantified before-and-after operating evidence."
        proofRequired = "Written client permission, approved name or anonymization, baseline, outcome metric, method, timeframe, and quotes."
      }
    }
    'research-or-thought-leadership' {
      return [ordered]@{
        headline = "Align HCM releases the 2026 HCM Implementation Partner Selection Benchmark"
        angle = "Own the buyer-intent conversation with evidence on scope gaps, client effort, data readiness, testing, and post-go-live support."
        proofRequired = "Original dataset, documented methodology, sample size, review owner, limitations, and a downloadable citation asset."
      }
    }
    'award-or-recognition' {
      return [ordered]@{
        headline = "Align HCM publishes a proof-led buyer scorecard for selecting the right HCM implementation partner"
        angle = "Answer award-heavy competitor messaging with transparent buyer criteria and verifiable delivery evidence."
        proofRequired = "Approved scoring method, current platform relationships, service definitions, reviewer, and downloadable scorecard."
      }
    }
    'acquisition-or-funding' {
      return [ordered]@{
        headline = "Align HCM strengthens independent client-side HCM implementation advisory for $platformText buyers"
        angle = "Differentiate around buyer-side ownership, practical operating readiness, and platform-neutral accountability."
        proofRequired = "Approved positioning, current delivery capacity, named services, leadership quote, and credible client evidence."
      }
    }
    default {
      return [ordered]@{
        headline = "Align HCM introduces a practical $platformText implementation buyer toolkit"
        angle = "Package readiness, partner selection, quote comparison, responsibility mapping, and rescue triggers into one evidence-led resource."
        proofRequired = "Completed toolkit, subject-matter review, current service links, methodology note, and approved launch date."
      }
    }
  }
}

function Invoke-RssSource {
  param([object]$Source, [object]$Watch, [int]$Maximum)
  $response = Invoke-WebRequest -Uri ([string]$Source.url) -UseBasicParsing -Headers @{'User-Agent'='AlignHCM-CompetitorPressWatch/1.0'} -TimeoutSec 35
  [xml]$document = $response.Content
  $nodes = @($document.SelectNodes("//*[local-name()='item']"))
  if ($nodes.Count -eq 0) { $nodes = @($document.SelectNodes("//*[local-name()='entry']")) }
  $results = @()
  foreach ($node in ($nodes | Select-Object -First $Maximum)) {
    $title = ConvertTo-PlainText (Get-NodeText $node @('title'))
    $url = Get-CanonicalUrl (Get-LinkText $node)
    $description = ConvertTo-PlainText (Get-NodeText $node @('description','summary','content'))
    $publishedText = Get-NodeText $node @('pubDate','published','updated','date')
    $published = ConvertTo-DateTimeOffset $publishedText
    if (!$title -or !$url -or !(Test-AllowedDomain $url @($Watch.domains))) { continue }
    $results += [pscustomobject]@{
      title = $title
      url = $url
      description = $description
      publishedAt = if ($published) { $published.ToString('o') } else { $null }
      dateMeaning = [string]$Source.dateMeaning
      sourceId = [string]$Source.id
      sourceType = [string]$Source.type
    }
  }
  return $results
}

function Invoke-BingWebSource {
  param([object]$Source, [object]$Watch, [int]$Maximum, [string]$Market)
  $encoded = [Uri]::EscapeDataString([string]$Source.query)
  $url = "https://www.bing.com/search?q=$encoded&format=rss&setlang=$Market"
  $response = Invoke-WebRequest -Uri $url -UseBasicParsing -Headers @{'User-Agent'='Mozilla/5.0'} -TimeoutSec 35
  [xml]$document = $response.Content
  $nodes = @($document.SelectNodes("//*[local-name()='item']"))
  $results = @()
  foreach ($node in ($nodes | Select-Object -First $Maximum)) {
    $title = ConvertTo-PlainText (Get-NodeText $node @('title'))
    $itemUrl = Get-CanonicalUrl (Get-LinkText $node)
    $description = ConvertTo-PlainText (Get-NodeText $node @('description'))
    $publishedText = Get-NodeText $node @('pubDate','date')
    $published = ConvertTo-DateTimeOffset $publishedText
    if (!$title -or !$itemUrl -or !(Test-AllowedDomain $itemUrl @($Watch.domains))) { continue }
    $results += [pscustomobject]@{
      title = $title
      url = $itemUrl
      description = $description
      publishedAt = if ($published) { $published.ToString('o') } else { $null }
      dateMeaning = [string]$Source.dateMeaning
      sourceId = [string]$Source.id
      sourceType = [string]$Source.type
    }
  }
  return $results
}

function Escape-MarkdownCell {
  param([object]$Value)
  return ([string]$Value).Replace('|','\|').Replace("`r",' ').Replace("`n",' ').Trim()
}

$config = Get-Content -LiteralPath $ConfigPath -Raw -Encoding UTF8 | ConvertFrom-Json
$now = [DateTimeOffset]::UtcNow
$cutoff = $now.AddDays(-[int]$config.lookbackDays)
$sourceFailures = @()
$allItems = @()
$successfulSources = 0

foreach ($watch in @($config.watches)) {
  foreach ($source in @($watch.sources)) {
    try {
      $sourceItems = if ($source.type -eq 'rss') {
        Invoke-RssSource $source $watch ([int]$config.maxItemsPerSource)
      } elseif ($source.type -eq 'bing-web') {
        Invoke-BingWebSource $source $watch ([int]$config.maxItemsPerSource) ([string]$config.market)
      } else {
        throw "Unsupported source type: $($source.type)"
      }
      $successfulSources++

      foreach ($sourceItem in @($sourceItems)) {
        $published = ConvertTo-DateTimeOffset ([string]$sourceItem.publishedAt)
        if ($published -and $published -lt $cutoff) { continue }
        $combined = "$($sourceItem.title) $($sourceItem.description)"
        $category = Get-Category $combined
        if (!(Test-StrategicRelevance $watch $combined $category)) { continue }
        $score = Get-Score $watch $category $combined ([string]$sourceItem.sourceType)
        $fingerprint = Get-Fingerprint ([string]$watch.id) ([string]$sourceItem.url) ([string]$sourceItem.title)
        $allItems += [pscustomobject][ordered]@{
          fingerprint = $fingerprint
          watchId = [string]$watch.id
          company = [string]$watch.name
          watchKind = [string]$watch.kind
          tier = [int]$watch.tier
          platforms = @($watch.platforms)
          title = [string]$sourceItem.title
          url = [string]$sourceItem.url
          description = [string]$sourceItem.description
          publishedAt = [string]$sourceItem.publishedAt
          dateMeaning = [string]$sourceItem.dateMeaning
          sourceId = [string]$sourceItem.sourceId
          sourceType = [string]$sourceItem.sourceType
          category = $category
          score = $score
          whyItMatters = Get-WhyItMatters $category $watch
          releaseConcept = Get-ReleaseConcept $category $watch
        }
      }
    } catch {
      $sourceFailures += [pscustomobject]@{
        watchId = [string]$watch.id
        sourceId = [string]$source.id
        error = $_.Exception.Message
      }
    }
  }
}

if ($successfulSources -eq 0) {
  $details = @($sourceFailures | ForEach-Object { "$($_.watchId)/$($_.sourceId): $($_.error)" }) -join '; '
  throw "Every competitor press source failed. No report was written. $details"
}

$deduped = @($allItems | Sort-Object score -Descending | Group-Object fingerprint | ForEach-Object { $_.Group | Select-Object -First 1 })
$stateExists = Test-Path -LiteralPath $statePath
$seen = @{}
if ($stateExists -and !$ResetBaseline) {
  try {
    $existing = Get-Content -LiteralPath $statePath -Raw -Encoding UTF8 | ConvertFrom-Json
    if ($existing.seen) {
      foreach ($property in $existing.seen.PSObject.Properties) { $seen[$property.Name] = $property.Value }
    }
  } catch {
    throw "Existing watchdog state could not be read: $($_.Exception.Message)"
  }
}

$runMode = if (!$stateExists -or $ResetBaseline) { 'baseline' } else { 'incremental' }
$selected = if ($runMode -eq 'baseline') { @($deduped) } else { @($deduped | Where-Object { !$seen.ContainsKey($_.fingerprint) }) }
$selected = @($selected | Sort-Object -Property @{Expression='score'; Descending=$true}, @{Expression='publishedAt'; Descending=$true})

foreach ($item in $deduped) {
  if ($seen.ContainsKey($item.fingerprint)) {
    $firstSeen = [string]$seen[$item.fingerprint].firstSeenAt
  } else {
    $firstSeen = $now.ToString('o')
  }
  $seen[$item.fingerprint] = [ordered]@{
    firstSeenAt = $firstSeen
    lastSeenAt = $now.ToString('o')
    company = $item.company
    title = $item.title
    url = $item.url
  }
}

$statePayload = [ordered]@{
  schemaVersion = 1
  clientId = 'align-hcm'
  updatedAt = $now.ToString('o')
  lastRunMode = $runMode
  lastSuccessfulSources = $successfulSources
  lastSourceFailures = $sourceFailures.Count
  lastRetrievedItems = $deduped.Count
  lastNewItems = $selected.Count
  seen = $seen
}
[IO.File]::WriteAllText($statePath, ($statePayload | ConvertTo-Json -Depth 8), $utf8NoBom)

$concepts = @()
$conceptKeys = @{}
foreach ($item in ($selected | Select-Object -First 8)) {
  if ($item.category -eq 'general-company-news') { continue }
  $key = "$($item.category)|$(@($item.platforms) -join ',')"
  if (!$conceptKeys.ContainsKey($key)) {
    $conceptKeys[$key] = $true
    $concepts += [pscustomobject]@{
      triggeredBy = "$($item.company): $($item.title)"
      category = $item.category
      platforms = @($item.platforms)
      headline = $item.releaseConcept.headline
      angle = $item.releaseConcept.angle
      proofRequired = $item.releaseConcept.proofRequired
    }
  }
  if ($concepts.Count -ge 5) { break }
}

$forecast = @()
$categoryGroups = @($selected | Group-Object category | ForEach-Object {
  [pscustomobject]@{
    Name = $_.Name
    Count = $_.Count
    MaxScore = [int](($_.Group | Measure-Object -Property score -Maximum).Maximum)
  }
} | Sort-Object -Property @{Expression='Count'; Descending=$true}, @{Expression='MaxScore'; Descending=$true})
foreach ($group in ($categoryGroups | Select-Object -First 3)) {
  $confidence = if ($group.Count -ge 3) { 'medium-high' } elseif ($group.Count -eq 2) { 'medium' } else { 'low-medium' }
  $prediction = switch ($group.Name) {
    'partnership' { 'Platform-authority and ecosystem messaging is likely to increase across partner shortlist content.' }
    'service-or-product-launch' { 'Competitors are likely to package implementation expertise into more named, outcome-specific offers.' }
    'customer-win-or-proof' { 'Competitors are likely to publish more implementation case evidence and outcome claims.' }
    'award-or-recognition' { 'Competitors are likely to amplify third-party validation in partner-selection pages and sales materials.' }
    'research-or-thought-leadership' { 'Competitors are likely to use proprietary reports and benchmarks as citation and lead-generation assets.' }
    'acquisition-or-funding' { 'Competitors are likely to emphasize capacity, reach, and expanded delivery coverage.' }
    default { 'Competitors are likely to convert recent company news into partner-authority messaging.' }
  }
  $forecast += [pscustomobject]@{
    signal = $group.Name
    supportingItems = $group.Count
    confidence = $confidence
    prediction = $prediction
    caveat = 'Hypothesis based on newly observed official-source items; not a confirmed future action.'
  }
}

$reportPayload = [ordered]@{
  schemaVersion = 1
  clientId = 'align-hcm'
  generatedAt = $now.ToString('o')
  runMode = $runMode
  privacy = 'private local report'
  externalActions = 'none'
  successfulSources = $successfulSources
  sourceFailures = @($sourceFailures)
  retrievedItems = $deduped.Count
  newOrBaselineItems = $selected.Count
  alerts = @($selected)
  forecasts = @($forecast)
  releaseConcepts = @($concepts)
}
[IO.File]::WriteAllText($latestJsonPath, ($reportPayload | ConvertTo-Json -Depth 12), $utf8NoBom)

$stamp = $now.ToString('yyyy-MM-dd-HHmmss')
$historyJson = Join-Path $reportRoot "$stamp.json"
[IO.File]::WriteAllText($historyJson, ($reportPayload | ConvertTo-Json -Depth 12), $utf8NoBom)

$lines = New-Object System.Collections.Generic.List[string]
$lines.Add('# Align HCM Competitor Press Watch')
$lines.Add('')
$lines.Add("Generated: $($now.ToLocalTime().ToString('MMMM d, yyyy h:mm tt zzz'))")
$lines.Add("Run mode: **$runMode**")
$lines.Add('Mode: **private, read-only OSINT**. No HubSpot record, website page, email, or press release was created or published.')
$lines.Add('')
$lines.Add('## Executive signal')
$lines.Add('')
if ($selected.Count -eq 0) {
  $lines.Add("No new official-domain items were discovered across $successfulSources successful sources. Hold the response queue and keep monitoring.")
} else {
  $label = if ($runMode -eq 'baseline') { 'baseline items' } else { 'new items' }
  $high = @($selected | Where-Object { $_.score -ge 70 }).Count
  $signalWord = if ($high -eq 1) { 'signal' } else { 'signals' }
  $lines.Add("The watchdog found **$($selected.Count) $label**, including **$high high-priority $signalWord** scoring 70 or higher.")
}
if ($sourceFailures.Count -gt 0) {
  $lines.Add("$($sourceFailures.Count) source checks failed and are listed below; the rest of the report remains usable.")
}
$lines.Add('')
$lines.Add('## Priority alerts')
$lines.Add('')
if ($selected.Count -eq 0) {
  $lines.Add('No new alerts.')
} else {
  $lines.Add('| Score | Company | Observed date | Signal | Confirmed source title | Why it matters |')
  $lines.Add('| ---: | --- | --- | --- | --- | --- |')
  foreach ($item in ($selected | Select-Object -First 20)) {
    $date = if ($item.publishedAt) { (ConvertTo-DateTimeOffset $item.publishedAt).ToString('yyyy-MM-dd') } else { 'undated' }
    if ($item.dateMeaning -eq 'search-index') { $date = "$date index date" }
    $titleLink = "[$(Escape-MarkdownCell $item.title)]($($item.url))"
    $lines.Add("| $($item.score) | $(Escape-MarkdownCell $item.company) | $date | $(Escape-MarkdownCell $item.category) | $titleLink | $(Escape-MarkdownCell $item.whyItMatters) |")
  }
}
$lines.Add('')
$lines.Add('## Likely next competitor moves')
$lines.Add('')
if ($forecast.Count -eq 0) {
  $lines.Add('No new evidence supports a fresh directional forecast on this run.')
} else {
  foreach ($item in $forecast) {
    $lines.Add("- **$($item.confidence) confidence:** $($item.prediction) Evidence: $($item.supportingItems) new item(s) tagged $($item.signal). This is a hypothesis, not a confirmed action.")
  }
}
$lines.Add('')
$lines.Add('## Align HCM press-release concepts')
$lines.Add('')
$lines.Add('These are strategic concepts only. Do not publish a headline until every proof requirement is satisfied and leadership approves the release.')
$lines.Add('')
if ($concepts.Count -eq 0) {
  $lines.Add('No new signal-triggered concepts on this run. Keep the existing release queue unchanged.')
} else {
  $index = 1
  foreach ($concept in $concepts) {
    $lines.Add("### $index. $($concept.headline)")
    $lines.Add('')
    $lines.Add("- **Triggered by:** $($concept.triggeredBy)")
    $lines.Add("- **Strategic angle:** $($concept.angle)")
    $lines.Add("- **Proof required before publication:** $($concept.proofRequired)")
    $lines.Add('- **Suggested release structure:** Buyer problem, verified announcement, why it matters now, evidence, executive quote, service or resource details, availability, and approved CTA.')
    $lines.Add('')
    $index++
  }
}
$lines.Add('## Source health')
$lines.Add('')
$lines.Add("- Successful source checks: $successfulSources")
$lines.Add("- Failed source checks: $($sourceFailures.Count)")
$lines.Add("- Official-domain items retrieved inside the $($config.lookbackDays)-day window: $($deduped.Count)")
$lines.Add('- RSS dates are treated as publication dates. Bing web RSS dates are labeled as search-index dates and must be verified on-page before public use.')
if ($sourceFailures.Count -gt 0) {
  foreach ($failure in $sourceFailures) {
    $lines.Add("- Failed: $($failure.watchId) / $($failure.sourceId): $($failure.error)")
  }
}
$lines.Add('')
$lines.Add('## Guardrails')
$lines.Add('')
$lines.Add('- Confirmed facts are limited to source titles, URLs, descriptions, and dates returned by official-domain sources.')
$lines.Add('- Strategic implications and predicted moves are labeled inferences or hypotheses.')
$lines.Add('- Never claim a partnership, award, client outcome, expansion, benchmark, or new service without current evidence and approval.')
$lines.Add('- This watchdog does not publish, send, update HubSpot, or make external changes.')

$markdown = ($lines -join "`r`n") + "`r`n"
[IO.File]::WriteAllText($latestMarkdownPath, $markdown, $utf8NoBom)
$historyMarkdown = Join-Path $reportRoot "$stamp.md"
[IO.File]::WriteAllText($historyMarkdown, $markdown, $utf8NoBom)

[pscustomobject]@{
  ok = $true
  generatedAt = $now.ToString('o')
  runMode = $runMode
  successfulSources = $successfulSources
  sourceFailures = $sourceFailures.Count
  retrievedItems = $deduped.Count
  newOrBaselineItems = $selected.Count
  latestReport = $latestMarkdownPath
  latestData = $latestJsonPath
} | ConvertTo-Json -Depth 4
