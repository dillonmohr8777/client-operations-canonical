# BOK W38 weekly social — 2026-09-15

**Nothing here has been emailed, scheduled, posted or published.** The PDF cover
is stamped CLIENT REVIEW · NOT PUBLISHED.

## What this is

Three 1080x1080 graphics in the July 2026 *This Week With BOK* house template —
illustrated scene, teal wave, ribbon day-label, serif headline, three icon
badges, takeaway line, footer bar — plus the packet PDF in the same format.
Same template three times, three different scenes.

| # | Day label | Headline |
|---|---|---|
| 01 | Wednesday Wisdom | Small Routines Help Children Settle |
| 02 | Turn the Page Thursday | Mediation Can Lower the Temperature |
| 03 | Family Friday | Weekends Work Better With a Plan |

- `separate-monthly-pdfs/This-Week-With-BOK-2026-W38.pdf` — 4 pages, US Letter.
- `separate-graphics/week-of-september-15-2026/*.png` — the three graphics.
- `previews/w38-page-*.png` — page previews.

Rebuild: `python build_reference_packet.py` (costs nothing — it only packages).

## How the graphics were made

`gpt-image-2.5-sunburst` (2026-09-08), 1088x1088, quality `high`, via
`_os/automation/weekly-images/generate.py --brief briefs/bok-law-firm-house.json`,
week `2026-W38-house-v2`. BOK's real frozen logo is composited in-process at
top-centre, 22% width — the model never draws it. `composite_logo()` gained a
`position` argument for this; `top-center` is where the July reference puts it.

`gpt-6-astra` is listed on the key but the images endpoint rejects it
(`HTTP 400: The model 'gpt-6-astra' does not exist`). It is not an image
generator.

## Cost

**$0.7876 total across four passes.** Only the last one is delivered.

| Pass | Week | What | Cost |
|---|---|---|---|
| 1 | `2026-W38-reference` | flat infographic cards — rejected | $0.150085 |
| 2 | `2026-W38-ref-v2` | same, contrast-corrected — rejected | $0.15036 |
| 3 | `2026-W38-house` | house template, logo landed on a face | $0.17339 |
| 4 | `2026-W38-house-v2` | **delivered** | $0.175745 |

Per-image costs are in `weekly-images/ledger.jsonl`, computed from each call's
own reported usage. The 2026-09-14 scrapbook set was a further $0.2049.

## Contrast — measured, not asserted

Measured from the rendered pixels (5th/90th percentile luminance per text
region, WCAG 2.1 formula).

| Element | Ratio | AA |
|---|---|---|
| headline navy on cream | 13.91–15.33:1 | ✅ 3.0 |
| badge captions | 11.66–12.50:1 | ✅ 4.5 |
| takeaway italic navy | 14.85–16.87:1 | ✅ 4.5 |
| footer white on deep teal | 10.48–12.69:1 | ✅ 4.5 |
| **ribbon white on teal #5599A8** | **2.77 / 3.18 / 3.20:1** | ❌ |

### The ribbon

White on teal `#5599A8` is the one failing pair, on all three. It clears the
3.0 large-text threshold on two of the three and misses on Wednesday at 2.77:1;
against the 4.5 normal-text threshold all three fail.

**This is inherited, not introduced.** The supplied July 2026 reference uses the
same teal-ribbon-with-white-text treatment, so BOK's existing approved graphics
carry it too.

One-line fix if you want it: deepen the ribbon to `#246E7E`, BOK's own darker
teal, already in the palette. White on it measures **5.90:1** and it reads as
the same ribbon, just a shade deeper. That is a prompt change plus one more
generation, about $0.18.

## Content boundaries

No legal advice, no outcome promises, no invented law, no client stories, and no
statistics — a number the model invented would be a fabricated claim on a law
firm's page, so the brief bans them outright. Every graphic and every caption
carries the general-information disclaimer.

## Also in this folder

`build_weekly_packet.py` and `monthly-content.json` are an earlier
photo-plus-bullets attempt, kept only because the packet PDF builder is shared.
Its graphics were rejected. Two defects were fixed in it along the way:

- its QA gate was hardcoded to a two-month, eight-piece, five-page shape and
  reported `fail` on any correct build of a different size — counts now come
  from the content file, and the graphic-size check accepts either the 1080x1350
  card template or the 1080x1080 house template while still requiring all
  graphics in a packet to match each other;
- it used teal `#5599A8` as text on cream (2.89:1 on the cover) and navy on a
  teal disc (4.33:1). Teal is now split: `#5599A8` fill, `#246E7E` text on
  cream, `#5C9DAB` under navy numerals.

## Open before this goes anywhere

1. The ribbon contrast above — fix or accept as house style.
2. BOK is `not-client-of momentum-360` in the registry (observed 2026-07-16,
   confidence 1.0). Momentum's token system does not govern this; BOK's own
   palette does, which is what was used.
3. D18 in `pending-decisions.json` — *what spend is authorised, for which tools,
   and who approves an increase* — reads `open`. $0.79 of client-facing paid
   generation ran against it here.
4. No posting dates or platform placement are set. Legal wording, creative
   pairing and dates need BOK approval and a duplicate check.
