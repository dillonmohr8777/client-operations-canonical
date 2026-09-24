$ErrorActionPreference = "Stop"

$deliverableDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$sourcePath = Join-Path $deliverableDirectory "Replenish-Weekly-Performance-2026-07-20-to-2026-07-26.pptx"
$outputPath = Join-Path $deliverableDirectory "Replenish-All-Campaign-CPC-Performance-2026-07-20-to-2026-07-26.pptx"

Copy-Item -LiteralPath $sourcePath -Destination $outputPath -Force

$powerPoint = $null
$presentation = $null

try {
    $powerPoint = New-Object -ComObject PowerPoint.Application
    $presentation = $powerPoint.Presentations.Open($outputPath, $false, $false, $false)
    $slide = $presentation.Slides.Item(5)

    $slide.Shapes.Item("TextBox 4").TextFrame.TextRange.Text =
        "ALL CAMPAIGN CPC DETAIL`rEvery Replenish campaign row"

    $rows = @(
        @("Coral Springs", "985 / 24", '$36.73 / $1.53', "2.44%", "Eligible"),
        @("Torrey Del Mar", "1,216 / 107", '$33.92 / $0.32', "8.80%", "Eligible"),
        @("Miramar", "1,143 / 67", '$25.45 / $0.38', "5.86%", "Eligible"),
        @("Miami", "638 / 20", '$23.52 / $1.18', "3.13%", "Eligible"),
        @("Carmel Mountain", "418 / 42", '$21.03 / $0.50', "10.05%", "Eligible"),
        @("Solana Beach", "634 / 28", '$13.07 / $0.47', "4.42%", "Eligible"),
        @("Pampano", "15 / 0", '$0.00 / N/A', "0.00%", "Limited delivery"),
        @("All 7 rows", "5,049 / 288", '$153.72 / $0.53', "5.70%", "6 spent / 1 limited")
    )

    $rowTop = 169.92
    $rowHeight = 28.8
    $existingRows = @(
        @("Rectangle 13", "TextBox 14", "TextBox 15", "TextBox 16", "TextBox 17", "TextBox 18"),
        @("Rectangle 19", "TextBox 20", "TextBox 21", "TextBox 22", "TextBox 23", "TextBox 24"),
        @("Rectangle 25", "TextBox 26", "TextBox 27", "TextBox 28", "TextBox 29", "TextBox 30"),
        @("Rectangle 31", "TextBox 32", "TextBox 33", "TextBox 34", "TextBox 35", "TextBox 36")
    )

    $rowShapes = New-Object System.Collections.Generic.List[object]
    foreach ($rowNames in $existingRows) {
        $shapeRow = New-Object System.Collections.Generic.List[object]
        foreach ($shapeName in $rowNames) {
            $shapeRow.Add($slide.Shapes.Item($shapeName))
        }
        $rowShapes.Add($shapeRow)
    }

    for ($rowIndex = 4; $rowIndex -le 6; $rowIndex++) {
        $templateNames = $existingRows[$rowIndex % 2]
        $shapeRow = New-Object System.Collections.Generic.List[object]
        foreach ($shapeName in $templateNames) {
            $templateShape = $slide.Shapes.Item($shapeName)
            $duplicateRange = $templateShape.Duplicate()
            $duplicateShape = $duplicateRange.Item(1)
            $duplicateShape.Left = $templateShape.Left
            $duplicateShape.Width = $templateShape.Width
            $shapeRow.Add($duplicateShape)
        }
        $rowShapes.Add($shapeRow)
    }

    $totalRow = New-Object System.Collections.Generic.List[object]
    foreach ($shapeName in @("Rectangle 37", "TextBox 38", "TextBox 39", "TextBox 40", "TextBox 41", "TextBox 42")) {
        $totalRow.Add($slide.Shapes.Item($shapeName))
    }
    $rowShapes.Add($totalRow)

    for ($rowIndex = 0; $rowIndex -lt $rowShapes.Count; $rowIndex++) {
        $top = $rowTop + ($rowIndex * $rowHeight)
        $shapeRow = $rowShapes[$rowIndex]

        for ($shapeIndex = 0; $shapeIndex -lt $shapeRow.Count; $shapeIndex++) {
            $shape = $shapeRow[$shapeIndex]
            $shape.Top = $top
            $shape.Height = $rowHeight

            if ($shapeIndex -gt 0) {
                $shape.TextFrame.TextRange.Text = $rows[$rowIndex][$shapeIndex - 1]
                $shape.TextFrame.TextRange.Font.Size = 10.5
            }
        }
    }

    $separatorShapes = New-Object System.Collections.Generic.List[object]
    foreach ($shapeName in @("Rectangle 43", "Rectangle 44", "Rectangle 45", "Rectangle 46", "Rectangle 47")) {
        $separatorShapes.Add($slide.Shapes.Item($shapeName))
    }
    for ($index = 0; $index -lt 3; $index++) {
        $separatorTemplate = $slide.Shapes.Item("Rectangle 44")
        $duplicateRange = $separatorTemplate.Duplicate()
        $duplicateShape = $duplicateRange.Item(1)
        $duplicateShape.Left = $separatorTemplate.Left
        $duplicateShape.Width = $separatorTemplate.Width
        $separatorShapes.Add($duplicateShape)
    }

    for ($index = 0; $index -lt $separatorShapes.Count; $index++) {
        $separator = $separatorShapes[$index]
        $separator.Top = $rowTop + ($index * $rowHeight) - ($separator.Height / 2)
        $separator.ZOrder(0)
    }

    foreach ($shapeName in @("Rectangle 48", "Rectangle 49", "Rectangle 50", "Rectangle 51", "Rectangle 52")) {
        $slide.Shapes.Item($shapeName).ZOrder(0)
    }
    foreach ($shapeRow in $rowShapes) {
        for ($shapeIndex = 1; $shapeIndex -lt $shapeRow.Count; $shapeIndex++) {
            $shapeRow[$shapeIndex].ZOrder(0)
        }
    }

    $slide.Shapes.Item("TextBox 53").TextFrame.TextRange.Text =
        'Every Replenish campaign row is shown with spend, impressions, clicks, CTR, and average CPC. The account blended to $0.53 CPC. Torrey Del Mar ($0.32), Miramar ($0.38), Solana Beach ($0.47), and Carmel Mountain ($0.50) ran at or below that account average.'
    $slide.Shapes.Item("TextBox 53").TextFrame.TextRange.Font.Size = 10

    $presentation.Save()
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
