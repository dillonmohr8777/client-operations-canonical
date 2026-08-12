# Align HCM — Bosley HairClub UKG Pro Merger proposal deck

Prepared August 12, 2026. Rebuilds the Bosley HairClub implementation proposal
as a native PowerPoint file on the current Align HCM deck template, using the
real Align HCM logo rather than a typed approximation of it.

Deliverable: `Align_HCM_Bosley_HairClub_UKG_Pro_Merger.pptx` — 7 slides,
13.333 x 7.5in (16:9), fully native shapes, tables, and text. Nothing is a
flattened image except the logo and the icons.

## Where the brand system came from

The template was reverse-engineered from the two most recent Align HCM decks
rather than invented, so this deck matches what is already going out the door.

| Source | Date | What was taken |
|---|---|---|
| `Align_HCM_SmartCare_Services.pptx` | June 2026 | Palette, 13.333in canvas, header block (eyebrow / title / orange rule / subtitle), three-part footer, icon set, the logo artwork itself |
| `Align_HCM_TPI_Composites_FIXED.pptx` (Google Drive) | April 2026 | Client-proposal slide order: title → summary → timeline → milestones → investment → team ask → contact |

Every hex below was read out of `ppt/slides/*.xml` in those files:

| Token | Hex | Use |
|---|---|---|
| Orange | `#E97722` | Primary accent, eyebrows, rules, key figures |
| Orange deep | `#C0521A` | "High" on the engagement heat scale |
| Navy | `#232E3E` | Primary dark, titles, table headers |
| Navy deep | `#1D2735` | Deepest panel |
| Navy elevated | `#2B3849` | Raised card on navy |
| Slate | `#8792A3` | Muted text on dark |
| Slate light | `#AEB9C8` | Body copy on dark |
| Border | `#DCE2E9` | Hairlines, table rules |
| Ink | `#333333` / `#55606E` | Body copy on light |

Type is Calibri for body and UI (matching both source decks) and Cambria for
slide titles and the investment figure, which keeps the serif character of the
original Bosley deck. Both ship with Office, so nothing substitutes on open.

## Logos

- **Align HCM** — `assets/align-hcm-logo.png`, extracted byte-for-byte from
  `ppt/media/image-1-2.png` inside the SmartCare deck. Straight alpha, already
  transparent; no matte removal was needed and none was applied, so the artwork
  is unmodified. It is the light-on-dark version, which is why it sits on navy
  on slides 1 and 7.
- **Bosley HairClub** — `assets/bosley-hairclub-logo-white.png`, the real mark,
  supplied as white type on a solid `#1A365D` navy square. The navy is removed,
  so it sits directly on the deck's dark panel with no plate behind it.
  `assets/bosley-hairclub-logo-navy.png` is the same coverage mask filled navy,
  for use on light backgrounds later.

  Background removal is un-matting, not colour keying — see `build/extract_logo.py`.
  Keying on the navy would leave a fringe on every anti-aliased edge; instead
  each pixel is solved back through `p = white * a + bg * (1 - a)` per channel to
  recover true fractional coverage, giving pure white art with clean edges.

  **Resolution caveat:** the supplied file is a 200px JPEG, and the mark occupies
  157 x 54px of it. It is denoised and upscaled 4x to 628 x 216px, which is about
  260 DPI at the 2.9in placement — fine on screen and for normal printing, but
  it is the ceiling this source allows. If Bosley HairClub can send an SVG, EPS,
  or a large PNG, swap `assets/bosley-hairclub-logo-white.png` and rebuild;
  nothing else has to change.

## Slides

| # | Slide | Notes |
|---|---|---|
| 1 | Title | Split navy / deep-navy, Align logo left, Bosley HairClub mark right |
| 2 | Executive Summary | Four cards, house icons in navy circles |
| 3 | Proposed Timeline | Six phase chips on a navy ramp, go-live marker at week 12 |
| 4 | Milestones by Phase | Native 3-column table, seven phases |
| 5 | AlignHCM — Planned Investment | Navy slide, $93,955 headline, early go-live and scope cards |
| 6 | What We'll Need From Your Team | Native 6-column table, Low / Medium / High heat scale |
| 7 | Let's stay connected! | Allison Cox contact block |

Content is transcribed from the source deck screenshots without rewording.

## Open items

- Slides 6 and 7 of the source deck were not in the screenshots provided — the
  footers jumped from `05` to `08` — so two slides are unaccounted for and are
  not represented here. This deck renumbers 1 through 7 continuously.
- A higher-resolution Bosley HairClub logo would improve slide 1, as above.

## Rebuilding

```bash
cd build
python3 extract_logo.py                                    # client mark -> transparent PNGs
python3 build_deck.py                                      # writes the .pptx
python3 render_qa.py ../Align_HCM_*.pptx ../qa             # rasterizes for review
```

`render_qa.py` exists because LibreOffice is only partially installed in the
build container and cannot open any presentation. It walks the real shape tree
of the built file with Pillow, mapping Calibri to Liberation Sans and Cambria to
Liberation Serif — both wider than the Office originals, so anything that fits
in `qa/` also fits in PowerPoint. It reports text that overruns its box; the
current build reports none.

`python3 scripts/office/validate.py <deck>` from the `pptx` skill passes clean.
