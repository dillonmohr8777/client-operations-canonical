# UPS Store franchise emails for IMMOHRTAL

This is a HubSpot-import-ready franchisee list for IMMOHRTAL Marketing Solutions. It is not a Momentum 360 list and it was not built from the Momentum prospect radar.

Sector: older shipping, print, and mailbox storefronts. UPS Store franchisees are typically owner-operators with a physical counter, print shop, and mailbox business. Local websites and Google profiles are often weak, which matches IMMOHRTAL website, search, and HubSpot work.

HubSpot import is still off. Dillon approved a 50 per day outreach send from `dillon@immohrtalmarketing.com` until the list is finished. Warmup caps the first two weeks. See `outreach/RUNBOOK.md` and `outreach/DELIVERABILITY.md`.

2026-09-02 daily run: warmup 10 queued, not sent. Workspace Gmail is still disconnected. Personal Gmail, AgentMail, and Momentum mailboxes were refused. Remaining 5801.

## Result

- Source: official UPS Store locator, accessed 2026-09-01
- 5807 US store pages in the locator sitemaps
- 5801 unique MX-ok location mailboxes (`store####@theupsstore.com`)
- 0 MX failures
- Largest states: CA 879, FL 638, TX 503, GA 292, NY 271
- Same HubSpot import columns as the Snap Fitness / Top 100 franchisee import
- Owner field is Dillon Mohr, not Jason Fallon

## Shared sheet

https://docs.google.com/spreadsheets/d/1Uc-vptwtpo6GXjknVHQhioctDTbz-ZyIbDuUNdTi924/edit

Use File, Download, CSV for the HubSpot import.

## Files

- `ups-store-franchise-emails-hubspot-import.csv` — MX-ok unique rows
- `summary.json` — counts by state
- `build_list.py` — locator parse and MX check

Daily outreach lives in `outreach/`. Send only from `dillon@immohrtalmarketing.com`. Never send from personal Gmail, AgentMail, or Momentum.
