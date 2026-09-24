param(
    [string]$BaseUrl = 'https://www.mezatilestone.com/',
    [string]$OutputPath,
    [switch]$SkipLinkChecks
)

$ErrorActionPreference = 'Stop'

function Get-AbsoluteUrl {
    param([string]$Url, [string]$Base)
    if ([string]::IsNullOrWhiteSpace($Url)) { return $null }
    if ($Url -match '^(mailto:|tel:|javascript:|#)') { return $null }
    try { return ([uri]::new([uri]$Base, $Url)).AbsoluteUri } catch { return $null }
}

function Get-Attribute {
    param([string]$Tag, [string]$Name)
    $pattern = '(?i)\b' + [regex]::Escape($Name) + '\s*=\s*["'']([^"'']*)["'']'
    $match = [regex]::Match($Tag, $pattern)
    if ($match.Success) { return [System.Net.WebUtility]::HtmlDecode($match.Groups[1].Value) }
    return $null
}

function ConvertFrom-HtmlText {
    param([string]$Html)
    if ([string]::IsNullOrWhiteSpace($Html)) { return '' }
    $text = [regex]::Replace($Html, '<script\b[^>]*>.*?</script>', ' ', 'IgnoreCase,Singleline')
    $text = [regex]::Replace($text, '<style\b[^>]*>.*?</style>', ' ', 'IgnoreCase,Singleline')
    $text = [regex]::Replace($text, '<[^>]+>', ' ')
    $text = [System.Net.WebUtility]::HtmlDecode($text)
    return ([regex]::Replace($text, '\s+', ' ')).Trim()
}

$baseUri = [uri]$BaseUrl
$sitemapIndex = Invoke-WebRequest -Uri ([uri]::new($baseUri, '/sitemap.xml').AbsoluteUri) -UseBasicParsing -TimeoutSec 15
$childSitemaps = [regex]::Matches($sitemapIndex.Content, '<loc><!\[CDATA\[(.*?)\]\]></loc>|<loc>(.*?)</loc>', 'IgnoreCase') |
    ForEach-Object { if ($_.Groups[1].Success) { $_.Groups[1].Value } else { $_.Groups[2].Value } }

$urls = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
foreach ($sitemapUrl in $childSitemaps) {
    $map = Invoke-WebRequest -Uri $sitemapUrl -UseBasicParsing -TimeoutSec 15
    foreach ($m in [regex]::Matches($map.Content, '<loc><!\[CDATA\[(.*?)\]\]></loc>|<loc>(.*?)</loc>', 'IgnoreCase')) {
        $candidate = if ($m.Groups[1].Success) { $m.Groups[1].Value } else { $m.Groups[2].Value }
        if (([uri]$candidate).Host -eq $baseUri.Host -or ([uri]$candidate).Host -eq $baseUri.Host.Replace('www.','')) {
            [void]$urls.Add($candidate)
        }
    }
}
[void]$urls.Add($BaseUrl)

$pages = @()
$allInternalLinks = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
foreach ($url in ($urls | Sort-Object)) {
    try {
        $started = Get-Date
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing -MaximumRedirection 10 -TimeoutSec 15
        $elapsedMs = [math]::Round(((Get-Date) - $started).TotalMilliseconds)
        $html = $response.Content
        $titleMatch = [regex]::Match($html, '<title[^>]*>(.*?)</title>', 'IgnoreCase,Singleline')
        $metaTags = [regex]::Matches($html, '<meta\b[^>]*>', 'IgnoreCase') | ForEach-Object { $_.Value }
        $description = $null
        $robots = $null
        foreach ($tag in $metaTags) {
            $name = Get-Attribute $tag 'name'
            if ($name -eq 'description') { $description = Get-Attribute $tag 'content' }
            if ($name -eq 'robots') { $robots = Get-Attribute $tag 'content' }
        }
        $canonical = $null
        foreach ($tag in ([regex]::Matches($html, '<link\b[^>]*>', 'IgnoreCase') | ForEach-Object { $_.Value })) {
            if ((Get-Attribute $tag 'rel') -match 'canonical') { $canonical = Get-Attribute $tag 'href' }
        }

        $headings = @{}
        foreach ($level in 1..3) {
            $headings["h$level"] = @([regex]::Matches($html, "<h$level\b[^>]*>(.*?)</h$level>", 'IgnoreCase,Singleline') | ForEach-Object { ConvertFrom-HtmlText $_.Groups[1].Value })
        }

        $images = @([regex]::Matches($html, '<img\b[^>]*>', 'IgnoreCase') | ForEach-Object { $_.Value })
        $missingAlt = @($images | Where-Object { $null -eq (Get-Attribute $_ 'alt') -or [string]::IsNullOrWhiteSpace((Get-Attribute $_ 'alt')) })
        $links = @([regex]::Matches($html, '<a\b[^>]*>', 'IgnoreCase') | ForEach-Object { Get-Attribute $_.Value 'href' } | Where-Object { $_ })
        $internal = @()
        foreach ($link in $links) {
            $absolute = Get-AbsoluteUrl $link $url
            if ($absolute) {
                try {
                    $linkUri = [uri]$absolute
                    if ($linkUri.Host -in @($baseUri.Host, $baseUri.Host.Replace('www.',''))) {
                        $normalized = $linkUri.GetLeftPart([System.UriPartial]::Path)
                        $internal += $normalized
                        [void]$allInternalLinks.Add($normalized)
                    }
                } catch {}
            }
        }

        $schemaTypes = @()
        foreach ($schemaMatch in [regex]::Matches($html, '<script[^>]+type=["'']application/ld\+json["''][^>]*>(.*?)</script>', 'IgnoreCase,Singleline')) {
            $schemaText = $schemaMatch.Groups[1].Value
            $schemaTypes += @([regex]::Matches($schemaText, '"@type"\s*:\s*"([^"]+)"', 'IgnoreCase') | ForEach-Object { $_.Groups[1].Value })
        }

        $mainMatch = [regex]::Match($html, '<main\b[^>]*>(.*?)</main>', 'IgnoreCase,Singleline')
        $mainHtml = if ($mainMatch.Success) { $mainMatch.Groups[1].Value } else { $html }
        $visibleText = ConvertFrom-HtmlText $mainHtml
        $words = @($visibleText -split '\s+' | Where-Object { $_ }).Count
        $pages += [pscustomobject]@{
            url = $url
            status = [int]$response.StatusCode
            elapsed_ms = $elapsedMs
            bytes = [Text.Encoding]::UTF8.GetByteCount($html)
            title = if ($titleMatch.Success) { ConvertFrom-HtmlText $titleMatch.Groups[1].Value } else { $null }
            title_length = if ($titleMatch.Success) { (ConvertFrom-HtmlText $titleMatch.Groups[1].Value).Length } else { 0 }
            meta_description = $description
            meta_description_length = if ($description) { $description.Length } else { 0 }
            meta_robots = $robots
            canonical = $canonical
            h1 = $headings.h1
            h2 = $headings.h2
            h3 = $headings.h3
            word_count = $words
            image_count = $images.Count
            missing_alt_count = $missingAlt.Count
            internal_link_count = $internal.Count
            unique_internal_link_count = @($internal | Sort-Object -Unique).Count
            form_count = [regex]::Matches($html, '<form\b', 'IgnoreCase').Count
            schema_types = @($schemaTypes | Sort-Object -Unique)
            main_text = $visibleText
        }
    } catch {
        $pages += [pscustomobject]@{ url = $url; status = 0; error = $_.Exception.Message }
    }
}

$linkChecks = @()
if (-not $SkipLinkChecks) {
    foreach ($link in ($allInternalLinks | Sort-Object)) {
        try {
            $head = Invoke-WebRequest -Uri $link -Method Head -UseBasicParsing -MaximumRedirection 10 -TimeoutSec 8
            $linkChecks += [pscustomobject]@{ url = $link; status = [int]$head.StatusCode }
        } catch {
            $status = 0
            if ($_.Exception.Response -and $_.Exception.Response.StatusCode) { $status = [int]$_.Exception.Response.StatusCode }
            $linkChecks += [pscustomobject]@{ url = $link; status = $status; error = $_.Exception.Message }
        }
    }
}

$result = [pscustomobject]@{
    generated_at_utc = (Get-Date).ToUniversalTime().ToString('o')
    base_url = $BaseUrl
    sitemap_count = $childSitemaps.Count
    page_count = $pages.Count
    pages = $pages
    internal_link_checks = $linkChecks
}

$json = $result | ConvertTo-Json -Depth 12
if ($OutputPath) {
    [IO.File]::WriteAllText($OutputPath, $json, [Text.UTF8Encoding]::new($false))
}
$json
