---
client: Align HCM
deliverable: UKG Rep Placemat, redesign
date: 2026-07-31
status: delivered
format: PDF, 2 pages, 11in x 8.5in landscape
---

# UKG Rep Placemat, redesign

Rebuild of `Align_HCM_UKG_Rep_Placemat.docx` as a designed 2 page PDF leave
behind for UKG sales reps. Same content, restructured layout, real logos,
larger type.

## What changed from the DOCX

| Area | Before | After |
|------|--------|-------|
| Logos | Text-only "ALIGN HCM" wordmark, no UKG mark | Real Align HCM logo plus the current UKG mark, locked up in a shared brand bar on both pages |
| Type size | Roughly 7 to 8pt body copy | 9.2 to 9.7pt body copy, 12.6pt card titles |
| Phase blocks | Flat table cells | Full cards with gradient headers, numbered badges, metadata pills, and a color-matched "what's in it for my customer" band that lines up across all three |
| Dashes | Em and en dashes throughout | Zero em or en dashes. Ranges read "5 to 10", "12 to 26", "500 to 15,000". Hyphens kept only inside real compounds (go-live, post-go-live, 60-day) |
| Page 2 structure | Three stacked full-width tables | Two column grid (ICP alongside objection handling), then the 6 step deal flow ribbon, then the CTA bar |
| Talk track | Loose italic paragraph | Panel with pull-quote styling and three proof chips pinned to the bottom (No cost / No commitment / 60 days included) |
| Buying signals | Bullet-separated run-on line | Individual tokens |
| CTA | Plain navy bar | Split bar with an action badge |

**Copy is unchanged from the DOCX.** Every headline, bullet, table cell, talk
track, objection answer, and deal flow step is reproduced word for word. The
only text edits are the em and en dash removals above. The three talk track
chips and the CTA badge are the sole additions, and both reuse phrases already
in the doc.

Page count is unchanged at two.

## Brand tokens used

- Navy `#0A1628`, gradient to `#1B3E63`
- Align orange `#E8832A`, deep orange `#F05A28`
- Align teal, darkened for contrast on white: `#0E9C88`
- Phase 1 blue `#1B4F72`
- UKG mark ships in its own `#005151`
- Typeface: Plus Jakarta Sans, weights 400 to 800

## Files

- `Align_HCM_UKG_Rep_Placemat.pdf` — the deliverable
- `placemat.source.html` — layout and copy source
- `build.py` — renders the PDF via headless Chromium
- `assets/align-hcm-logo.png` — Align HCM logo, pulled from alignhcm.com
- `assets/ukg-logo-2025.svg` — current UKG mark
- `assets/preview-page-1.png`, `assets/preview-page-2.png` — page previews

## Rebuild

```
python3 build.py
```

Edit copy or layout in `placemat.source.html`, then rerun. The script inlines
the fonts and both logos, so the PDF is self-contained.
