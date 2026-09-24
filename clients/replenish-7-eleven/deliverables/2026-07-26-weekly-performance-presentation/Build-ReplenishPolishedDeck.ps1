$ErrorActionPreference = "Stop"

$deliverableDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$outputPath = Join-Path $deliverableDirectory "Replenish-Weekly-Performance-2026-07-20-to-2026-07-26-UPDATED-DIRECTIONS.pptx"
$logoPath = Join-Path $deliverableDirectory "netlify\assets\7-eleven-logo.png"
$dashboardUrl = "https://replenish-2026-06-06.netlify.app/"

$campaigns = @(
    [pscustomobject]@{ Name = "Torrey Del Mar"; Spend = 33.92; Impressions = 1216; Clicks = 107; Ctr = "8.80%"; Cpc = 0.32; DirectionRate = 0.33; WeeklyDirections = 35; CostPerDirection = 0.97; LifetimeClicks = 614; LifetimeDirections = 203 }
    [pscustomobject]@{ Name = "Miramar"; Spend = 25.45; Impressions = 1143; Clicks = 67; Ctr = "5.86%"; Cpc = 0.38; DirectionRate = 0.26; WeeklyDirections = 17; CostPerDirection = 1.50; LifetimeClicks = 677; LifetimeDirections = 176 }
    [pscustomobject]@{ Name = "Carmel Mountain"; Spend = 21.03; Impressions = 418; Clicks = 42; Ctr = "10.05%"; Cpc = 0.50; DirectionRate = 0.22; WeeklyDirections = 9; CostPerDirection = 2.34; LifetimeClicks = 558; LifetimeDirections = 123 }
    [pscustomobject]@{ Name = "Solana Beach"; Spend = 13.07; Impressions = 634; Clicks = 28; Ctr = "4.42%"; Cpc = 0.47; DirectionRate = 0.28; WeeklyDirections = 8; CostPerDirection = 1.63; LifetimeClicks = 140; LifetimeDirections = 39 }
)

function Convert-RgbToOfficeColor {
    param([int]$Red, [int]$Green, [int]$Blue)
    return $Red + ($Green * 256) + ($Blue * 65536)
}

$colors = @{
    Ink = Convert-RgbToOfficeColor 24 31 27
    Muted = Convert-RgbToOfficeColor 91 103 96
    Paper = Convert-RgbToOfficeColor 249 248 244
    White = Convert-RgbToOfficeColor 255 255 255
    Green = Convert-RgbToOfficeColor 0 114 67
    GreenDark = Convert-RgbToOfficeColor 0 78 48
    GreenSoft = Convert-RgbToOfficeColor 226 240 232
    Orange = Convert-RgbToOfficeColor 244 122 32
    OrangeSoft = Convert-RgbToOfficeColor 253 236 222
    Red = Convert-RgbToOfficeColor 224 35 44
    Rule = Convert-RgbToOfficeColor 220 223 218
}

function Add-Text {
    param(
        $Slide,
        [string]$Text,
        [double]$Left,
        [double]$Top,
        [double]$Width,
        [double]$Height,
        [double]$Size = 18,
        [int]$Color = $colors.Ink,
        [bool]$Bold = $false,
        [string]$Font = "Aptos",
        [int]$Align = 1
    )
    $shape = $Slide.Shapes.AddTextbox(1, $Left, $Top, $Width, $Height)
    $shape.TextFrame.MarginLeft = 0
    $shape.TextFrame.MarginRight = 0
    $shape.TextFrame.MarginTop = 0
    $shape.TextFrame.MarginBottom = 0
    $shape.TextFrame.WordWrap = -1
    $shape.TextFrame.TextRange.Text = $Text
    $shape.TextFrame.TextRange.Font.Name = $Font
    $shape.TextFrame.TextRange.Font.Size = $Size
    $shape.TextFrame.TextRange.Font.Bold = $(if ($Bold) { -1 } else { 0 })
    $shape.TextFrame.TextRange.Font.Color.RGB = $Color
    $shape.TextFrame.TextRange.ParagraphFormat.Alignment = $Align
    return $shape
}

function Add-Rect {
    param(
        $Slide,
        [double]$Left,
        [double]$Top,
        [double]$Width,
        [double]$Height,
        [int]$Fill,
        [int]$Line = $Fill,
        [double]$Radius = 0
    )
    $shapeType = $(if ($Radius -gt 0) { 5 } else { 1 })
    $shape = $Slide.Shapes.AddShape($shapeType, $Left, $Top, $Width, $Height)
    $shape.Fill.ForeColor.RGB = $Fill
    $shape.Line.ForeColor.RGB = $Line
    if ($Line -eq $Fill) {
        $shape.Line.Visible = 0
    }
    return $shape
}

function Add-Base {
    param($Slide, [string]$Section, [int]$Page)
    $background = $Slide.Background.Fill
    $background.ForeColor.RGB = $colors.Paper
    $background.Solid()
    Add-Rect $Slide 0 0 960 8 $colors.Green | Out-Null
    Add-Text $Slide "REPLENISH  |  7 ELEVEN" 54 24 340 18 10 $colors.Green $true | Out-Null
    Add-Text $Slide $Section 54 49 640 34 25 $colors.Ink $true | Out-Null
    Add-Text $Slide "JULY 20 TO JULY 26, 2026" 700 29 206 16 9 $colors.Muted $true "Aptos" 3 | Out-Null
    Add-Rect $Slide 54 501 852 1 $colors.Rule | Out-Null
    Add-Text $Slide "Verified platform reporting  |  Reporting prepared July 27, 2026" 54 512 640 14 8.5 $colors.Muted | Out-Null
    Add-Text $Slide "$Page" 880 510 26 14 8.5 $colors.Muted $true "Aptos" 3 | Out-Null
}

function Add-Metric {
    param($Slide, [string]$Value, [string]$Label, [double]$Left, [double]$Top, [double]$Width)
    Add-Text $Slide $Value $Left $Top $Width 37 28 $colors.Ink $true | Out-Null
    Add-Text $Slide $Label.ToUpperInvariant() $Left ($Top + 39) $Width 17 9 $colors.Muted $true | Out-Null
}

$powerPoint = $null
$presentation = $null

try {
    $powerPoint = New-Object -ComObject PowerPoint.Application
    $presentation = $powerPoint.Presentations.Add()
    $presentation.PageSetup.SlideWidth = 960
    $presentation.PageSetup.SlideHeight = 540

    # Slide 1: cover
    $slide = $presentation.Slides.Add(1, 12)
    $slide.Background.Fill.ForeColor.RGB = $colors.Paper
    $slide.Background.Fill.Solid()
    Add-Rect $slide 0 0 24 540 $colors.Green | Out-Null
    Add-Rect $slide 24 0 936 10 $colors.Orange | Out-Null
    $slide.Shapes.AddPicture($logoPath, 0, -1, 730, 55, 118, 118) | Out-Null
    Add-Text $slide "WEEKLY PERFORMANCE" 72 81 420 20 11 $colors.Green $true | Out-Null
    Add-Text $slide "Replenish campaign`nperformance report" 72 126 640 120 38 $colors.Ink $true | Out-Null
    Add-Text $slide "A clear view of weekly spend, traffic efficiency, and cost per click across four San Diego locations." 72 276 580 54 17 $colors.Muted | Out-Null
    Add-Rect $slide 72 366 760 1 $colors.Rule | Out-Null
    Add-Text $slide "REPORTING PERIOD" 72 390 160 16 9 $colors.Muted $true | Out-Null
    Add-Text $slide "July 20 to July 26, 2026" 72 411 300 28 18 $colors.Ink $true | Out-Null
    Add-Text $slide "Prepared July 27, 2026" 72 451 300 18 10 $colors.Muted | Out-Null
    $dashboardText = Add-Text $slide "Open the live performance dashboard" 600 409 245 22 11 $colors.Green $true "Aptos" 3
    $dashboardText.ActionSettings.Item(1).Hyperlink.Address = $dashboardUrl
    Add-Text $slide "REPLENISH  |  7 ELEVEN" 600 451 245 18 9 $colors.Muted $true "Aptos" 3 | Out-Null

    # Slide 2: overview
    $slide = $presentation.Slides.Add(2, 12)
    Add-Base $slide "Weekly account overview" 2
    Add-Rect $slide 54 105 288 142 $colors.Green $colors.Green 8 | Out-Null
    Add-Text $slide '$93.47' 78 129 240 52 39 $colors.White $true | Out-Null
    Add-Text $slide "TOTAL WEEKLY SPEND" 78 186 240 18 10 $colors.White $true | Out-Null
    Add-Text $slide "Across Torrey Del Mar, Miramar, Carmel Mountain, and Solana Beach." 78 211 236 27 10.5 $colors.White | Out-Null
    Add-Metric $slide "3,411" "Impressions" 386 122 140
    Add-Metric $slide "244" "Clicks" 555 122 120
    Add-Metric $slide "7.15%" "Click through rate" 704 122 170
    Add-Metric $slide '$0.38' "Blended cost per click" 386 205 190
    Add-Text $slide "The four San Diego locations generated 244 clicks at a blended cost of thirty eight cents. Torrey Del Mar led click volume, while Carmel Mountain produced the strongest click through rate." 54 294 552 89 16 $colors.Ink | Out-Null
    Add-Rect $slide 640 285 266 144 $colors.White $colors.Rule 6 | Out-Null
    Add-Text $slide "Directional benchmark" 664 307 218 19 11 $colors.Green $true | Out-Null
    Add-Text $slide "91% lower" 664 339 218 34 26 $colors.Ink $true | Out-Null
    Add-Text $slide "The `$0.38 blended cost per click is 91% below the `$4.14 search benchmark for Shopping, Collectibles, and Gifts." 664 380 210 52 11 $colors.Muted | Out-Null
    Add-Text $slide "Because these campaigns use Performance Max inventory, this is a directional cost comparison, not an exact format match." 54 423 552 45 11 $colors.Muted | Out-Null

    # Slide 3: spend
    $slide = $presentation.Slides.Add(3, 12)
    Add-Base $slide "San Diego budget allocation" 3
    Add-Text $slide "All four San Diego locations were active during the reporting period. Torrey Del Mar represented 36% of weekly spend." 54 92 760 34 12 $colors.Muted | Out-Null
    $maxSpend = 33.92
    $startTop = 140
    $barMax = 430
    for ($i = 0; $i -lt $campaigns.Count; $i++) {
        $item = $campaigns[$i]
        $top = $startTop + ($i * 45)
        Add-Text $slide $item.Name 54 $top 170 20 11 $colors.Ink $true | Out-Null
        Add-Rect $slide 232 ($top + 2) $barMax 14 $colors.Rule | Out-Null
        if ($item.Spend -gt 0) {
            $barWidth = [Math]::Max(6, ($item.Spend / $maxSpend) * $barMax)
            Add-Rect $slide 232 ($top + 2) $barWidth 14 $(if ($i -lt 2) { $colors.Green } else { $colors.GreenDark }) | Out-Null
        }
        Add-Text $slide ('$' + $item.Spend.ToString("0.00")) 684 ($top - 1) 92 20 12 $colors.Ink $true "Aptos" 3 | Out-Null
        $share = $(if ($item.Spend -gt 0) { [Math]::Round(($item.Spend / 93.47) * 100) } else { 0 })
        Add-Text $slide ($share.ToString() + "% of spend") 792 ($top - 1) 114 20 9.5 $colors.Muted $false "Aptos" 3 | Out-Null
    }

    # Slide 4: CPC comparison
    $slide = $presentation.Slides.Add(4, 12)
    Add-Base $slide "Cost per click by location" 4
    Add-Text $slide "Every San Diego location remained below the `$4.14 directional search benchmark. The four locations blended to `$0.38." 54 92 760 34 12 $colors.Muted | Out-Null
    $scaleMax = 4.14
    $barMax = 430
    $startTop = 141
    for ($i = 0; $i -lt $campaigns.Count; $i++) {
        $item = $campaigns[$i]
        $top = $startTop + ($i * 44)
        Add-Text $slide $item.Name 54 $top 170 20 11 $colors.Ink $true | Out-Null
        Add-Rect $slide 232 ($top + 2) $barMax 14 $colors.Rule | Out-Null
        if ($null -ne $item.Cpc) {
            $barWidth = [Math]::Max(6, ($item.Cpc / $scaleMax) * $barMax)
            $barColor = $(if ($item.Cpc -le 0.38) { $colors.Green } else { $colors.Orange })
            Add-Rect $slide 232 ($top + 2) $barWidth 14 $barColor | Out-Null
            Add-Text $slide ('$' + $item.Cpc.ToString("0.00")) 684 ($top - 1) 88 20 12 $colors.Ink $true "Aptos" 3 | Out-Null
            $below = [Math]::Round((1 - ($item.Cpc / 4.14)) * 100)
            Add-Text $slide ($below.ToString() + "% below benchmark") 784 ($top - 1) 122 20 9.5 $colors.Muted $false "Aptos" 3 | Out-Null
        }
        else {
            Add-Text $slide "N/A" 684 ($top - 1) 88 20 12 $colors.Muted $true "Aptos" 3 | Out-Null
            Add-Text $slide "No clicks" 784 ($top - 1) 122 20 9.5 $colors.Muted $false "Aptos" 3 | Out-Null
        }
    }
    Add-Rect $slide 232 465 14 14 $colors.Green | Out-Null
    Add-Text $slide "At or below `$0.38 San Diego average" 253 463 220 18 9 $colors.Muted | Out-Null
    Add-Rect $slide 492 465 14 14 $colors.Orange | Out-Null
    Add-Text $slide "Above San Diego average, still below benchmark" 513 463 270 18 9 $colors.Muted | Out-Null

    # Slide 5: table
    $slide = $presentation.Slides.Add(5, 12)
    Add-Base $slide "Complete San Diego location detail" 5
    $columns = @(
        [pscustomobject]@{ Label = "LOCATION"; Left = 54; Width = 245; Align = 1 }
        [pscustomobject]@{ Label = "SPEND"; Left = 322; Width = 92; Align = 3 }
        [pscustomobject]@{ Label = "IMPRESSIONS"; Left = 433; Width = 104; Align = 3 }
        [pscustomobject]@{ Label = "CLICKS"; Left = 556; Width = 80; Align = 3 }
        [pscustomobject]@{ Label = "CTR"; Left = 656; Width = 76; Align = 3 }
        [pscustomobject]@{ Label = "CPC"; Left = 754; Width = 80; Align = 3 }
    )
    Add-Rect $slide 54 105 852 32 $colors.Green | Out-Null
    foreach ($column in $columns) {
        Add-Text $slide $column.Label $column.Left 115 $column.Width 15 9 $colors.White $true "Aptos" $column.Align | Out-Null
    }
    $rowTop = 146
    for ($i = 0; $i -lt $campaigns.Count; $i++) {
        $item = $campaigns[$i]
        if ($i % 2 -eq 1) {
            Add-Rect $slide 54 ($rowTop - 4) 852 39 $colors.White | Out-Null
        }
        Add-Text $slide $item.Name 54 $rowTop 245 20 11 $colors.Ink $true | Out-Null
        Add-Text $slide ('$' + $item.Spend.ToString("0.00")) 322 $rowTop 92 20 11 $colors.Ink $false "Aptos" 3 | Out-Null
        Add-Text $slide $item.Impressions.ToString("N0") 433 $rowTop 104 20 11 $colors.Ink $false "Aptos" 3 | Out-Null
        Add-Text $slide $item.Clicks.ToString("N0") 556 $rowTop 80 20 11 $colors.Ink $false "Aptos" 3 | Out-Null
        Add-Text $slide $item.Ctr 656 $rowTop 76 20 11 $colors.Ink $false "Aptos" 3 | Out-Null
        $cpcText = $(if ($null -ne $item.Cpc) { '$' + $item.Cpc.ToString("0.00") } else { "N/A" })
        Add-Text $slide $cpcText 754 $rowTop 80 20 11 $(if ($null -ne $item.Cpc -and $item.Cpc -le 0.38) { $colors.Green } else { $colors.Ink }) $true "Aptos" 3 | Out-Null
        $rowTop += 39
    }
    Add-Rect $slide 54 429 852 1 $colors.Rule | Out-Null
    Add-Text $slide "FOUR LOCATION TOTAL" 54 443 245 20 11 $colors.Ink $true | Out-Null
    Add-Text $slide '$93.47' 322 443 92 20 11 $colors.Ink $true "Aptos" 3 | Out-Null
    Add-Text $slide "3,411" 433 443 104 20 11 $colors.Ink $true "Aptos" 3 | Out-Null
    Add-Text $slide "244" 556 443 80 20 11 $colors.Ink $true "Aptos" 3 | Out-Null
    Add-Text $slide "7.15%" 656 443 76 20 11 $colors.Ink $true "Aptos" 3 | Out-Null
    Add-Text $slide '$0.38' 754 443 80 20 11 $colors.Green $true "Aptos" 3 | Out-Null

    # Slide 6: clicked directions
    $slide = $presentation.Slides.Add(6, 12)
    Add-Base $slide "Clicked directions by location" 6
    Add-Text $slide "Direction-click estimates apply the city-specific rates to verified ad clicks. Cost per direction uses weekly spend divided by displayed direction clicks." 54 91 800 28 12 $colors.Muted | Out-Null

    Add-Rect $slide 54 127 260 72 $colors.Green $colors.Green 6 | Out-Null
    Add-Text $slide "69" 76 140 80 33 27 $colors.White $true | Out-Null
    Add-Text $slide "EST. DIRECTION CLICKS THIS WEEK" 142 146 150 26 9.5 $colors.White $true | Out-Null

    Add-Rect $slide 332 127 260 72 $colors.GreenSoft $colors.GreenSoft 6 | Out-Null
    Add-Text $slide '$1.35' 354 140 90 33 27 $colors.GreenDark $true | Out-Null
    Add-Text $slide "BLENDED COST PER`nDIRECTION THIS WEEK" 448 140 122 35 9.5 $colors.GreenDark $true | Out-Null

    Add-Rect $slide 610 127 296 72 $colors.White $colors.Rule 6 | Out-Null
    Add-Text $slide "541" 632 140 100 33 27 $colors.Ink $true | Out-Null
    Add-Text $slide "EST. DIRECTION CLICKS`nCAMPAIGN TO DATE" 740 140 142 35 9.5 $colors.Muted $true | Out-Null

    $directionColumns = @(
        [pscustomobject]@{ Label = "LOCATION"; Left = 54; Width = 155; Align = 1 }
        [pscustomobject]@{ Label = "WEEK CLICKS"; Left = 220; Width = 80; Align = 3 }
        [pscustomobject]@{ Label = "RATE"; Left = 312; Width = 55; Align = 3 }
        [pscustomobject]@{ Label = "WEEK DIRECTIONS"; Left = 380; Width = 95; Align = 3 }
        [pscustomobject]@{ Label = "COST / DIRECTION"; Left = 488; Width = 90; Align = 3 }
        [pscustomobject]@{ Label = "LIFETIME CLICKS"; Left = 594; Width = 105; Align = 3 }
        [pscustomobject]@{ Label = "LIFETIME DIRECTIONS"; Left = 715; Width = 136; Align = 3 }
    )
    Add-Rect $slide 54 223 852 32 $colors.Green | Out-Null
    foreach ($column in $directionColumns) {
        Add-Text $slide $column.Label $column.Left 233 $column.Width 15 8.5 $colors.White $true "Aptos" $column.Align | Out-Null
    }
    $directionRowTop = 264
    for ($i = 0; $i -lt $campaigns.Count; $i++) {
        $item = $campaigns[$i]
        if ($i % 2 -eq 1) {
            Add-Rect $slide 54 ($directionRowTop - 4) 852 39 $colors.White | Out-Null
        }
        Add-Text $slide $item.Name 54 $directionRowTop 155 20 10.5 $colors.Ink $true | Out-Null
        Add-Text $slide $item.Clicks.ToString("N0") 220 $directionRowTop 80 20 10.5 $colors.Ink $false "Aptos" 3 | Out-Null
        Add-Text $slide (($item.DirectionRate * 100).ToString("0") + "%") 312 $directionRowTop 55 20 10.5 $colors.Ink $false "Aptos" 3 | Out-Null
        Add-Text $slide $item.WeeklyDirections.ToString("N0") 380 $directionRowTop 95 20 10.5 $colors.Green $true "Aptos" 3 | Out-Null
        Add-Text $slide ('$' + $item.CostPerDirection.ToString("0.00")) 488 $directionRowTop 90 20 10.5 $colors.Ink $true "Aptos" 3 | Out-Null
        Add-Text $slide $item.LifetimeClicks.ToString("N0") 594 $directionRowTop 105 20 10.5 $colors.Ink $false "Aptos" 3 | Out-Null
        Add-Text $slide $item.LifetimeDirections.ToString("N0") 715 $directionRowTop 136 20 10.5 $colors.Green $true "Aptos" 3 | Out-Null
        $directionRowTop += 39
    }
    Add-Rect $slide 54 421 852 1 $colors.Rule | Out-Null
    Add-Text $slide "FOUR LOCATION TOTAL" 54 434 155 20 10.5 $colors.Ink $true | Out-Null
    Add-Text $slide "244" 220 434 80 20 10.5 $colors.Ink $true "Aptos" 3 | Out-Null
    Add-Text $slide "-" 312 434 55 20 10.5 $colors.Muted $false "Aptos" 3 | Out-Null
    Add-Text $slide "69" 380 434 95 20 10.5 $colors.Green $true "Aptos" 3 | Out-Null
    Add-Text $slide '$1.35' 488 434 90 20 10.5 $colors.Ink $true "Aptos" 3 | Out-Null
    Add-Text $slide "1,989" 594 434 105 20 10.5 $colors.Ink $true "Aptos" 3 | Out-Null
    Add-Text $slide "541" 715 434 136 20 10.5 $colors.Green $true "Aptos" 3 | Out-Null
    Add-Text $slide "Whole-number direction counts are rounded from the city rates. Campaign-to-date covers the July 7 launch through July 26." 54 471 852 18 9 $colors.Muted | Out-Null

    # Slide 7: action plan
    $slide = $presentation.Slides.Add(7, 12)
    Add-Base $slide "What we are doing next" 7
    Add-Text $slide "All four San Diego locations are buying traffic efficiently. The next week should build on the strongest local engagement signals and keep the reporting focused on these markets." 54 95 786 44 14 $colors.Muted | Out-Null
    $actions = @(
        [pscustomobject]@{ Number = "01"; Title = "Build on Torrey Del Mar volume"; Body = "Torrey Del Mar produced 107 clicks at a thirty two cent cost per click while maintaining an 8.80% click through rate." }
        [pscustomobject]@{ Number = "02"; Title = "Use Carmel Mountain engagement"; Body = "Carmel Mountain delivered the strongest click through rate at 10.05%, with 42 clicks from 418 impressions." }
        [pscustomobject]@{ Number = "03"; Title = "Keep all four locations visible"; Body = "Continue comparing Miramar and Solana Beach with the two leaders while connecting platform traffic with store level outcomes." }
    )
    for ($i = 0; $i -lt $actions.Count; $i++) {
        $action = $actions[$i]
        $top = 168 + ($i * 93)
        Add-Text $slide $action.Number 54 $top 55 28 22 $colors.Orange $true | Out-Null
        Add-Text $slide $action.Title 128 $top 330 25 17 $colors.Ink $true | Out-Null
        Add-Text $slide $action.Body 128 ($top + 31) 430 42 11 $colors.Muted | Out-Null
    }
    Add-Rect $slide 624 164 282 237 $colors.GreenSoft $colors.GreenSoft 6 | Out-Null
    Add-Text $slide "Reporting note" 652 191 226 23 13 $colors.GreenDark $true | Out-Null
    Add-Text $slide "Platform delivery and traffic metrics are verified for the four San Diego locations from July 20 through July 26. The industry comparison uses the 2026 WordStream Shopping, Collectibles, and Gifts search benchmark of `$4.14 per click.`r`rBecause the campaigns use Performance Max inventory, the benchmark is directional. Store level outcomes can add context as they become available." 652 229 224 135 11 $colors.Ink | Out-Null
    $link = Add-Text $slide "Open the live dashboard" 652 374 224 20 11 $colors.Green $true
    $link.ActionSettings.Item(1).Hyperlink.Address = $dashboardUrl

    $presentation.SaveAs($outputPath)
}
finally {
    if ($presentation) {
        $presentation.Close()
        [Runtime.InteropServices.Marshal]::ReleaseComObject($presentation) | Out-Null
    }
    if ($powerPoint) {
        $powerPoint.Quit()
        [Runtime.InteropServices.Marshal]::ReleaseComObject($powerPoint) | Out-Null
    }
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
}

Write-Output $outputPath
