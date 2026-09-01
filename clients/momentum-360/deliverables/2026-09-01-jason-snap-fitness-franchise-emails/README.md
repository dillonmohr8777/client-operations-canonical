# Snap Fitness franchise emails for Jason

Jason asked in the Momentum group DM on 2026-09-01 for a Snap Fitness franchise list, pointing at `https://www.snapfitness.com/us`.

This package is HubSpot-import ready. Nothing was imported or emailed.

## Result

- Source: official US gym locator, accessed 2026-09-01
- 458 production US gyms with a published location email
- 458 unique MX-ok mailboxes (`snapfitness.com`)
- 46 states
- Largest states: MN 70, TX 40, OH 27, WI 25
- 4 of these already exist in Jason HubSpot: springfield, lynchburgva, allentownnj, newnanga; importing by email updates those records instead of creating duplicates
- Not in the 2026-08-31 Top 100 franchisee import

Live gym pages were spot-checked for Jacksonville FL, Abbeville LA, and Allentown NJ. The locator emails matched the live pages.

## Shared sheet

HubSpot import sheet, writer shared with Jason and Sean:

https://docs.google.com/spreadsheets/d/1OJwC-Xejcbdgpr-SRK0JAxTiqumxPyfJdBJzVd-dC6g/edit

Use File, Download, CSV for the HubSpot import. Same columns as the 2026-08-31 Top 100 franchisee import.

## Files

- `snap-fitness-franchise-emails-hubspot-import.csv` — MX-ok unique rows, same column contract as the 2026-08-31 Jason import
- `summary.json` — counts by state
- `build_list.py` — locator parse and MX check

Do not send outreach or calendar invites from this list unless Jason or Dillon separately approves that send.
