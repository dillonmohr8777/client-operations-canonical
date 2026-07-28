# Align HCM Customer Agent avatar assets

Date: 2026-07-28  
Portal use: HubSpot Customer Agent identity image (1:1)  
Brand basis: Align favicon mark + site colors `#17324D` / `#F05A28` / `#FC9121`

## Recommended upload

**Primary for chat avatar:**  
`align-customer-agent-robot-hubspot-1024.png`

Friendly geometric robot using Align navy/orange, with the official Align diagonal mark as a chin badge.

**Alternate (readiness-report monogram direction):**  
`align-customer-agent-monogram-hubspot-1024.png`

Rounded navy tile with the Align A-mark only. Best if brand wants mark-first, not character-first.

## Files

| File | Use |
|---|---|
| `align-customer-agent-robot.svg` | Source vector robot |
| `align-customer-agent-robot-hubspot-512.png` | HubSpot small |
| `align-customer-agent-robot-hubspot-1024.png` | HubSpot upload |
| `align-customer-agent-monogram.svg` | Source vector monogram |
| `align-customer-agent-monogram-hubspot-512.png` | HubSpot small |
| `align-customer-agent-monogram-hubspot-1024.png` | HubSpot alternate upload |
| `align-favicon.svg` | Official Align favicon reference |
| `align-hcm-logo.png` | Official wordmark reference |

## Portal step

1. HubSpot → Customer Agent → Identity  
2. Replace default robot/cube with `align-customer-agent-robot-hubspot-1024.png`  
3. Confirm legibility in tester chat bubble  
4. Keep as draft/proposal until Dillon brand-approves if needed

## Deliverable fonts

`fonts/` carries the two typefaces the PDF deliverables are built with, committed so
`../../output/pdf/build-customer-agent-pdfs.py` renders identically offline and on any machine.

| Family | Weights | Use | Licence |
|---|---|---|---|
| Poppins | 500, 600, 700, 800 | Display type — cover titles, headings, stat numbers, labels | SIL Open Font Licence 1.1 |
| Mulish | 400, 500, 600, 700 | Body type — paragraphs, tables, card copy | SIL Open Font Licence 1.1 |

These are the same two families the July 23 / July 24 designed passes used (confirmed from the
`source/assets/` tree on the design-pass branches), so the July 28 rebuild matches the baseline
instead of approximating it. Mulish is committed as static weights rather than the variable file the
earlier pass shipped — Chrome converts variable instances to Type3 outlines when printing, which
bloats the PDF and makes the body text unsearchable. Do not swap either family without regenerating
all three PDFs.

## Where these assets are used

- `align-hcm-logo.png` — the white logo tile on every PDF cover.
- `align-customer-agent-robot-hubspot-1024.png` — the "ready to upload" avatar rendered in the
  Readiness Report (Phase One) and the Correction Package (operator checklist).
- `align-customer-agent-monogram-hubspot-1024.png` — the mark-first alternate rendered beside it.

Status: local asset package only. Not uploaded to HubSpot in this pass.
