<#
  Add restrained, native PowerPoint animation to any editable .pptx.

  Generated decks call this automatically from Deck.save(). Existing decks can use:

    pwsh -File animate-pptx.ps1 -Pptx .\deck.pptx -OutPath .\deck-animated.pptx

  In-place mode is intended for freshly generated files that can be rebuilt:

    pwsh -File animate-pptx.ps1 -Pptx .\deck.pptx -InPlace
#>
[CmdletBinding(DefaultParameterSetName = "Output")]
param(
  [Parameter(Mandatory = $true)][string]$Pptx,
  [Parameter(ParameterSetName = "Output")][string]$OutPath,
  [Parameter(ParameterSetName = "InPlace", Mandatory = $true)][switch]$InPlace,
  [ValidateSet("subtle", "transition-only")][string]$Style = "subtle",
  [switch]$ReplaceExisting,
  [switch]$InspectOnly,
  [switch]$Force,
  [switch]$Json
)

$ErrorActionPreference = "Stop"
$msoTrue = -1
$msoFalse = 0
$ppEffectNone = 0
$ppEffectFadeSmoothly = 3849
$ppTransitionSpeedMedium = 2
$msoAnimEffectFade = 10
$msoAnimateLevelNone = 0
$msoAnimTriggerWithPrevious = 2

function Release-ComObject([object]$Value) {
  if ($null -ne $Value -and [Runtime.InteropServices.Marshal]::IsComObject($Value)) {
    try { [void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($Value) } catch {}
  }
}

function Get-Text([object]$Shape) {
  try {
    if ($Shape.HasTextFrame -eq $msoTrue -and $Shape.TextFrame.HasText -eq $msoTrue) {
      return [string]$Shape.TextFrame.TextRange.Text
    }
  } catch {}
  return ""
}

function Test-IsAnimationCandidate([object]$Shape, [double]$SlideWidth, [double]$SlideHeight) {
  $slideArea = $SlideWidth * $SlideHeight
  $area = [double]$Shape.Width * [double]$Shape.Height
  $ratio = if ($slideArea -gt 0) { $area / $slideArea } else { 0 }
  $text = (Get-Text $Shape).Trim()
  $hasText = $text.Length -gt 0

  # Keep backgrounds, rules, tiny furniture, page numbers, and corner logos static.
  if ($ratio -ge 0.68) { return $false }
  if ([double]$Shape.Width -lt 6 -or [double]$Shape.Height -lt 6) { return $false }
  if ($hasText -and [double]$Shape.Top -gt ($SlideHeight * 0.88) -and $text -match '^\s*\d{1,3}\s*$') { return $false }
  if (-not $hasText -and $ratio -lt 0.025 -and [double]$Shape.Top -lt ($SlideHeight * 0.18)) { return $false }

  $hasTable = $false
  $hasChart = $false
  try { $hasTable = $Shape.HasTable -eq $msoTrue } catch {}
  try { $hasChart = $Shape.HasChart -eq $msoTrue } catch {}

  # Pictures, groups, tables, charts, diagrams, and meaningful text are content.
  $contentShapeTypes = @(3, 6, 11, 13, 19, 24, 28)
  return $hasText -or $hasTable -or $hasChart -or ($contentShapeTypes -contains [int]$Shape.Type)
}

function Get-AnimationSummary([object]$Presentation) {
  $slides = [int]$Presentation.Slides.Count
  $transitions = 0
  $effects = 0
  $automaticEffects = 0
  for ($slideIndex = 1; $slideIndex -le $slides; $slideIndex += 1) {
    $slide = $Presentation.Slides.Item($slideIndex)
    try {
      if ([int]$slide.SlideShowTransition.EntryEffect -ne $ppEffectNone) { $transitions += 1 }
      $sequence = $slide.TimeLine.MainSequence
      try {
        $effects += [int]$sequence.Count
        for ($effectIndex = 1; $effectIndex -le $sequence.Count; $effectIndex += 1) {
          $effect = $sequence.Item($effectIndex)
          try {
            $timing = $effect.Timing
            try {
              if ([int]$timing.TriggerType -in @(2, 3)) { $automaticEffects += 1 }
            } finally {
              Release-ComObject $timing
            }
          } finally {
            Release-ComObject $effect
          }
        }
      } finally {
        Release-ComObject $sequence
      }
    } finally {
      Release-ComObject $slide
    }
  }
  return [ordered]@{
    file = [string]$Presentation.FullName
    slides = $slides
    transitionedSlides = $transitions
    objectAnimations = $effects
    automaticObjectAnimations = $automaticEffects
    style = $Style
  }
}

$source = (Resolve-Path -LiteralPath $Pptx).Path
if ([IO.Path]::GetExtension($source) -ine ".pptx") {
  throw "Expected a .pptx file: $source"
}

if ($InspectOnly) {
  $target = $source
} elseif ($InPlace) {
  $target = $source
} else {
  if (-not $OutPath) {
    $directory = [IO.Path]::GetDirectoryName($source)
    $name = [IO.Path]::GetFileNameWithoutExtension($source)
    $OutPath = [IO.Path]::Combine($directory, "$name-animated.pptx")
  }
  $target = [IO.Path]::GetFullPath($OutPath)
  if ((Test-Path -LiteralPath $target) -and -not $Force) {
    throw "Output already exists. Pass -Force to replace it: $target"
  }
  $parent = [IO.Path]::GetDirectoryName($target)
  if (-not (Test-Path -LiteralPath $parent)) { $null = New-Item -ItemType Directory -Path $parent -Force }
  Copy-Item -LiteralPath $source -Destination $target -Force
}

$app = $null
$presentation = $null
try {
  $app = New-Object -ComObject PowerPoint.Application
  try {
    $presentation = $app.Presentations.Open($target, $msoFalse, $msoFalse, $msoFalse)
  } catch {
    $app.WindowState = 2
    $presentation = $app.Presentations.Open($target, $msoFalse, $msoFalse, $msoTrue)
  }

  if (-not $InspectOnly) {
    $slideWidth = [double]$presentation.PageSetup.SlideWidth
    $slideHeight = [double]$presentation.PageSetup.SlideHeight

    for ($slideIndex = 1; $slideIndex -le $presentation.Slides.Count; $slideIndex += 1) {
      $slide = $presentation.Slides.Item($slideIndex)
      try {
        $slide.SlideShowTransition.EntryEffect = $ppEffectFadeSmoothly
        $slide.SlideShowTransition.Speed = $ppTransitionSpeedMedium
        $slide.SlideShowTransition.AdvanceOnClick = $msoTrue
        $slide.SlideShowTransition.AdvanceOnTime = $msoFalse

        $sequence = $slide.TimeLine.MainSequence
        try {
          if ($ReplaceExisting) {
            for ($effectIndex = $sequence.Count; $effectIndex -ge 1; $effectIndex -= 1) {
              $effect = $sequence.Item($effectIndex)
              try { $effect.Delete() } finally { Release-ComObject $effect }
            }
          }

          # Never duplicate a manually authored sequence. Generated decks begin empty.
          if ($Style -eq "subtle" -and $sequence.Count -eq 0) {
            $candidates = @()
            for ($shapeIndex = 1; $shapeIndex -le $slide.Shapes.Count; $shapeIndex += 1) {
              $shape = $slide.Shapes.Item($shapeIndex)
              if (Test-IsAnimationCandidate $shape $slideWidth $slideHeight) {
                $candidates += [pscustomobject]@{
                  Shape = $shape
                  Top = [double]$shape.Top
                  Left = [double]$shape.Left
                  Area = [double]$shape.Width * [double]$shape.Height
                }
              } else {
                Release-ComObject $shape
              }
            }

            # Reading order first. Twelve effects keeps dense slides moving without becoming slow.
            $selected = @($candidates | Sort-Object Top, Left, @{ Expression = "Area"; Descending = $true } | Select-Object -First 12)
            for ($candidateIndex = 0; $candidateIndex -lt $selected.Count; $candidateIndex += 1) {
              $candidate = $selected[$candidateIndex]
              $effect = $null
              try {
                $effect = $sequence.AddEffect(
                  $candidate.Shape,
                  $msoAnimEffectFade,
                  $msoAnimateLevelNone,
                  $msoAnimTriggerWithPrevious
                )
                $timing = $effect.Timing
                try {
                  $timing.Duration = 0.28
                  $timing.TriggerDelayTime = [math]::Min(0.72, $candidateIndex * 0.06)
                } finally {
                  Release-ComObject $timing
                }
              } catch {
                Write-Warning "Slide $slideIndex shape animation skipped: $($_.Exception.Message)"
              } finally {
                Release-ComObject $effect
              }
            }
            foreach ($candidate in $candidates) { Release-ComObject $candidate.Shape }
          }
        } finally {
          Release-ComObject $sequence
        }
      } finally {
        Release-ComObject $slide
      }
    }

    $presentation.Save()
  }

  $summary = Get-AnimationSummary $presentation
  if ($summary.transitionedSlides -ne $summary.slides) {
    throw "Animation verification failed: $($summary.transitionedSlides) of $($summary.slides) slides have transitions."
  }
  if ($Style -eq "subtle" -and $summary.objectAnimations -lt 1) {
    throw "Animation verification failed: the deck has no object animations."
  }

  if ($Json) { $summary | ConvertTo-Json -Compress }
  else {
    Write-Output "Animated $($summary.slides) slides: $($summary.transitionedSlides) transitions and $($summary.automaticObjectAnimations) automatic object effects."
    Write-Output $summary.file
  }
} finally {
  if ($presentation) { try { $presentation.Close() } catch {}; Release-ComObject $presentation }
  if ($app) { try { $app.Quit() } catch {}; Release-ComObject $app }
  [GC]::Collect()
  [GC]::WaitForPendingFinalizers()
}
