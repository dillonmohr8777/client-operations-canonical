# Momentum Prospect Radar — Daily 12

Builds 12 prospect homepages a day in the approved house style, QAs them, deploys a
dated preview, and **stops for Dillon's approval**. It contacts nobody.

## Pieces
- `select_batch.py` — reads the live radar, filters `lifecycle == queued_build`,
  drops anything in `built-registry.json`, ranks by priority, writes `batches/<date>.json`.
- `built-registry.json` — every slug ever built. The dedupe key. Seeded with the
  first 20 (2026-09-02/03).
- `batches/` — one selection + report per day.
- Automation definition: `C:\Users\dillo\.codex\automations\momentum-radar-daily-12\automation.toml`

## Run the selector by hand
```
python select_batch.py 12
```

## Queue depth (as of 2026-09-03)
| | |
|---|---|
| radar total | 1311 |
| `queued_build` | 215 |
| already built | 20 |
| remaining after today | 185 |
| **runway at 12/day** | **~15 days** |

The other 1096 records are graded, not queued: polish 825, nurture 191, ads_seo 29,
enrich 24. They are not buildable without a verdict change upstream. **The radar has
to refill before ~2026-09-18** or the automation will start returning short batches —
it will say so rather than invent prospects.

## Deliberate constraints
- **Artwork is hand-drawn animated SVG**, not generated images. It inherits each
  brand's palette, animates, and keeps a page near 60KB. No image API is used.
- **Logos are never displayed above ~1.4× native pixel width.** Several radar logos
  are only ~100–180px wide; upscaling them is what made earlier builds look cheap.
  Below the cap, the typographic lockup is used instead.
- **Preview URLs only.** Nothing is promoted to a client-facing address.
- **No outbound contact.** Jesse's update is drafted as text in the report; Dillon
  sends it after approving.

## Not configured
`sheet.json` does not exist yet. Until it does, the automation writes
`blocked:no-sheet-configured` instead of guessing a spreadsheet. To wire it:
```json
{ "spreadsheet_id": "…", "tab": "Radar Builds" }
```
