# Top 30 Story Shortlist, branded edition (2026-08-10)

Branded restyle of the 10 Aug 2026 Top 30 story shortlist. Two files, same
data, one design system:

- `Align_HCM_Top30_Story_Shortlist_Branded.xlsx` — the working file. Navy
  masthead with the exact Align logo, brand palette throughout, editable
  yellow columns preserved (Reference Status / Validator / Validation Notes),
  live TOTAL formulas, freeze panes and autofilter, orange tab.
- `Align_HCM_Top30_Story_Shortlist_Branded.html` — the twin read view. Same
  four sections (shortlist, reference candidates, representation gaps, method
  notes), client logo wall, search + platform filters + sort, stat band,
  print-ready CSS.

## What was added vs the source file

Story rows, values, and the three TOTAL formulas are unchanged from the
source build. Three columns were appended on the Top 30 tab, read from
HubSpot portal 242825734 on 10 Aug 2026 (read-only): **Website**, **HQ (CRM)**,
**Employees (CRM)**. In the HTML twin the same values fold into the client cell.

CRM domain divergences, resolved to public primary domains for display and
logos: OhioHealth (CRM record carries `ohiohealthems.com`), MTA NY (CRM
carries `mtany.org`), McCain Foods (CRM carries `mccain.ca`). JACAM Catalyst
and REI had no usable CRM domain; public domains used. Ace Parking's CRM
record is a project entry ("UKG Pro WFM Flip"), so its HQ stays blank.

## Brand provenance

Tokens and the logo come from the shipped Align editorial PDF set (Aug 2026):
navy `#0A1628`, orange `#F05A28` / `#FF6B2B`, rust `#AD3D1B`, teal `#136E61`,
paper `#FCFAF7`, panel `#F5F1EA`, hairline `#E9E4DC`. The logo in
`assets/align-hcm-logo-reverse.png` is the exact production mark extracted
from those PDFs with its transparency mask (268x108), not a recreation.
Canonical brand page: `dillon-os/02_FullTimeJob/AlignHCM/brand-guidelines.md`.

## Client logos

The HTML loads each client mark from its public domain via
`logo.clearbit.com/<domain>` at view time (transparent marks on a white chip)
and falls back to a styled monogram offline. No third-party logo files are
redistributed in this repo.

## Regenerate

`python3 build_deliverables.py` (needs `openpyxl`, `pillow`; reads the source
xlsx path at the top of the script). The build injects cached values for the
three formulas and sets `fullCalcOnLoad` because the remote sandbox has no
LibreOffice Calc; Excel re-verifies the formulas on open.
