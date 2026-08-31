# Jason franchisee email expansion — 2026-08-31

Jason asked in the Sean/Jason group DM for an updated franchisee email database from `HubSpot_Service_Franchise_Top_100.xlsx` so he can upload a new HubSpot list and work webinar attendees plus cold outreach at the same time. Corporate brands stay in HubSpot; franchisee-level mailboxes are the new list.

Client: Momentum 360 (`momentum-360`). Owner: Jason Fallon. Portal: `50612503`. Slack source: group DM `C0B2N20A0SW`, file `F0BTE933M6X`.

## What this package is

A local, reversible research list. It is not a send, not a HubSpot import, and not a calendar invite.

## Files

- `source/HubSpot_Service_Franchise_Top_100.xlsx` — Jason's starter workbook.
- `source/brand-index.csv` — the 100 brands plus harvest-lane notes.
- `output/franchisee-emails-hubspot-import.csv` — 676 HubSpot-ready franchisee/office mailboxes.
- `output/corporate-sitewide-hold.csv` — one mailbox printed on many location pages; keep off the franchisee upload.
- `output/franchisee-emails-canada-hold.csv` — Canadian rows held for CASL review.
- `output/franchisee-emails-mx-rejected.csv` — DNS MX failures.
- `output/hubspot-brand-match.json` — live portal read of the 100 brand companies.
- `output/qa-summary.json` and `output/qa-summary.md` — counts and receipts.
- `harvest/build_franchisee_emails.py` — reproducible GET-only harvester.

## Rules used

Same as the Momentum 360 franchise playbook:

- Accept only an email printed on a first-party location page, team page, or unauthenticated brand locator dump.
- Never guess `first.last@` patterns.
- Keep source URL and access date on every row.
- Neighborly-family locators and known JS-shell brands are not recrawled.
- No outreach, HubSpot mutation, or calendar insertion.

## HubSpot upload (Jason)

1. Contacts → Import → File from computer.
2. Use `output/franchisee-emails-hubspot-import.csv`.
3. Map `email`, `firstname`, `lastname`, `company`, `phone`, `website`, `city`, `state`, `jobtitle`.
4. Create or add to a new static list, for example `Jason Service Franchisees 2026-08-31`.
5. Do not enable any workflow, sequence, or webinar invite from this import.

The 100 corporate brands already exist as companies on portal `50612503`. This import is the franchisee layer, not a second brand-company load.

## Rebuild

```powershell
python -m pip install -r harvest/requirements.txt
python .\harvest\build_franchisee_emails.py
```
