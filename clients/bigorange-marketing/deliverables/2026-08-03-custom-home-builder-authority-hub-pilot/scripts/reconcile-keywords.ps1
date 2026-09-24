param(
  [Parameter(Mandatory = $true)]
  [string]$PackageRoot
)

$semrushPath = Join-Path $PackageRoot 'keyword-opportunity-map-semrush-validated.csv'
$mozPath = Join-Path $PackageRoot 'evidence\2026-08-17-moz-bom-rankings.csv'
$outputPath = Join-Path $PackageRoot 'keyword-opportunity-map-reconciled-2026-08-20.csv'

$semrush = Import-Csv -LiteralPath $semrushPath
$mozRows = Import-Csv -LiteralPath $mozPath

$latestMoz = @{}
foreach ($row in $mozRows) {
  $key = $row.Keyword.Trim().ToLowerInvariant()
  $dateText = $row.'Google en-US SERP Date'
  if (-not $dateText) {
    $dateText = $row.'Google Mobile en-US SERP Date'
  }

  $date = [datetime]::MinValue
  [void][datetime]::TryParse($dateText, [ref]$date)

  if (-not $latestMoz.ContainsKey($key) -or $date -gt $latestMoz[$key].Date) {
    $latestMoz[$key] = [pscustomobject]@{
      Date = $date
      Row = $row
    }
  }
}

$result = foreach ($item in $semrush) {
  $queryKey = $item.'Proposed Query'.Trim().ToLowerInvariant()
  $match = if ($latestMoz.ContainsKey($queryKey)) { $latestMoz[$queryKey].Row } else { $null }

  $note = if (-not $match) {
    'Not tracked in the August 17 Moz export; retain the Semrush demand and difficulty decision.'
  } elseif ($match.'Google en-US Rank' -or $match.'Google Mobile en-US Rank') {
    'Moz supplies current rank and landing-page evidence; Semrush remains the source for US volume, difficulty, intent, and build priority.'
  } else {
    'Tracked by Moz but not ranking on the latest date; Semrush remains the demand and opportunity source.'
  }

  $ordered = [ordered]@{}
  foreach ($property in $item.PSObject.Properties) {
    $ordered[$property.Name] = $property.Value
  }
  $ordered['Moz SERP Date'] = if ($match) { $match.'Google en-US SERP Date' } else { '' }
  $ordered['Moz Desktop Rank'] = if ($match) { $match.'Google en-US Rank' } else { '' }
  $ordered['Moz Desktop Change'] = if ($match) { $match.'Google en-US Change (vs previous date)' } else { '' }
  $ordered['Moz Desktop URL'] = if ($match) { $match.'Google en-US URL' } else { '' }
  $ordered['Moz Volume Range'] = if ($match) { "$($match.'Google en-US Search Volume Min')-$($match.'Google en-US Search Volume Max')" } else { '' }
  $ordered['Moz Mobile Rank'] = if ($match) { $match.'Google Mobile en-US Rank' } else { '' }
  $ordered['Moz Mobile Change'] = if ($match) { $match.'Google Mobile en-US Change (vs previous date)' } else { '' }
  $ordered['Moz Mobile URL'] = if ($match) { $match.'Google Mobile en-US URL' } else { '' }
  $ordered['Evidence Note'] = $note

  [pscustomobject]$ordered
}

$result | Export-Csv -LiteralPath $outputPath -NoTypeInformation -Encoding utf8
Write-Output $outputPath
