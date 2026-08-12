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

## Card and edge system

There is one card treatment in the deck and it is used everywhere — executive
summary, timeline note, investment cards, engagement callout:

- **Fill** navy `#232E3E`, or `#1D2735` when the card sits on a navy slide
- **Edge** `#4A5C75` at 1.25pt (`#55606E` on navy). The original `#DCE2E9`
  hairline all but vanished on screen; these read at presentation distance
  without turning into a box-drawing exercise
- **Icon** orange `#E97722` glyph on a raised `#2B3849` disc, ringed in the same
  edge colour as the cards so the discs and the cards read as one system
- **Copy** white titles, `#AEB9C8` body — 6.8:1 on the card fill

Running one dark card style across both the light and the dark slides is what
keeps the deck reading as a single object rather than two halves. Table edges
follow the same logic in two steps: `#C5CEDA` for row rules and the outer
frame, `#E3E8EE` for the column separators, which need to be felt rather than
seen.

Icons are recoloured, never redrawn — `build/recolor_icons.py` keeps the
original coverage mask and swaps only the fill, preserving the stroke weights
and optical sizing of the house set.

## Text colours

The source decks' `#8792A3` / `#AEB9C8` / `#55606E` were being used for running
copy, where they read as washed-out gray. Body text now uses a dedicated set,
and those original tokens are kept for fills and rules only:

| Token | Hex | Use | Contrast |
|---|---|---|---|
| `TEXT_ON_DARK` | `#EDF2F8` | Body on navy — reads as white | 12:1 |
| `MUTED_ON_DARK` | `#C7D2DF` | Labels and footers on navy | 7.8:1 |
| `TEXT_ON_LIGHT` | `#2B3849` | Body on white | 11:1 |
| `MUTED_ON_LIGHT` | `#4A5563` | Footers and captions on white | 7.5:1 |

Brand orange needed splitting. `#E97722` is fine on navy (5:1) but only **2.95:1
on white**, so it fails as small type — which it was being used for in the
eyebrows, the go-live marker, the Weeks column, and the engagement scale. Those
now use same-hue darkenings, while every fill, rule, and icon stays `#E97722`:

- `ORANGE_TEXT` `#B05512` — 5.1:1 on white, 4.8:1 on the zebra row tint
- `ORANGE_TEXT_DEEP` `#94480F` — 6.6:1, the top of the engagement scale

The engagement heat scale therefore runs navy → orange → deep orange, with every
level above AA rather than a light gray "Low" that recedes off the slide.

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
python3 recolor_icons.py                                   # orange copies of the house icons
python3 build_deck.py                                      # writes the .pptx
python3 render_qa.py ../Align_HCM_*.pptx ../qa             # rasterizes for review
python3 audit_contrast.py ../Align_HCM_*.pptx              # WCAG check, exits non-zero on a fail
```

`audit_contrast.py` walks every text run and resolves what is actually behind it
— the card, panel, or slide background it sits on in z-order, or the cell fill
for table text — then reports WCAG contrast against the threshold for that run's
size. It is what caught the orange-on-white failures above. All 139 runs
currently pass AA.

`render_qa.py` exists because LibreOffice is only partially installed in the
build container and cannot open any presentation. It walks the real shape tree
of the built file with Pillow, mapping Calibri to Liberation Sans and Cambria to
Liberation Serif — both wider than the Office originals, so anything that fits
in `qa/` also fits in PowerPoint. It reports text that overruns its box; the
current build reports none.

`python3 scripts/office/validate.py <deck>` from the `pptx` skill passes clean.
