$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$pptxPath = Join-Path $root "Replenish-August-2026-Monthly-Performance.pptx"
$pdfPath = Join-Path $root "Replenish-August-2026-Monthly-Performance.pdf"
$renderDir = Join-Path $root "replenish-deck-renders"
New-Item -ItemType Directory -Path $renderDir -Force | Out-Null

$powerPoint = $null
$presentation = $null
$linkEvidence = @()
try {
    $powerPoint = New-Object -ComObject PowerPoint.Application
    $presentation = $powerPoint.Presentations.Open($pptxPath, -1, 0, 0)
    $presentation.SaveAs($pdfPath, 32)

    foreach ($slide in $presentation.Slides) {
        $pngPath = Join-Path $renderDir ("slide-{0}.png" -f $slide.SlideIndex)
        $slide.Export($pngPath, "PNG", 1600, 900)
        foreach ($shape in $slide.Shapes) {
            try {
                $address = $shape.ActionSettings.Item(1).Hyperlink.Address
                if ($address) {
                    $text = ""
                    try { $text = $shape.TextFrame.TextRange.Text } catch {}
                    $linkEvidence += [pscustomobject]@{ slide = $slide.SlideIndex; text = $text; address = $address }
                }
            } catch {}
            try {
                if ($shape.HasTextFrame -and $shape.TextFrame.HasText) {
                    $range = $shape.TextFrame.TextRange
                    for ($i = 1; $i -le $range.Runs().Count; $i++) {
                        $run = $range.Runs().Item($i)
                        $address = $run.ActionSettings.Item(1).Hyperlink.Address
                        if ($address) {
                            $linkEvidence += [pscustomobject]@{ slide = $slide.SlideIndex; text = $run.Text; address = $address }
                        }
                    }
                }
            } catch {}
        }
    }

    $qa = [ordered]@{
        pptx = $pptxPath
        pdf = $pdfPath
        slideCount = $presentation.Slides.Count
        hyperlinks = @($linkEvidence | Sort-Object slide,text,address -Unique)
        renderedAt = (Get-Date).ToString("o")
    }
    $qa | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath (Join-Path $root "replenish-deck-qa.json") -Encoding UTF8
    $qa | ConvertTo-Json -Depth 6
}
finally {
    if ($presentation) { $presentation.Close() }
    if ($powerPoint) { $powerPoint.Quit() }
    if ($presentation) { [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($presentation) }
    if ($powerPoint) { [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($powerPoint) }
    [gc]::Collect()
    [gc]::WaitForPendingFinalizers()
}
