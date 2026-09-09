# Lane B research summary — 2026-08-28

## Result

- Accepted 30 unique US franchise, territory, or local-office business emails in `new-franchise-emails.csv`.
- Geographic priority was applied first to Pennsylvania, New Jersey, and Delaware; nationwide rows were retained only when a first-party franchise source printed the local email.
- Every accepted email was directly published on a first-party franchise announcement, local office page, team-member page, or local contact page. No email pattern was inferred.
- Lowercase-email deduplication produced 30 unique addresses from 30 CSV rows.

## Brands and first-party source patterns

| Brand | First-party endpoints/source pattern | Rows |
| --- | --- | ---: |
| PuroClean | Franchise-owner announcements and local blog pages on `puroclean.com`, with an explicit “For more information about PuroClean of … email …” line | 14 |
| Always Best Care | Local territory `/about-us/` pages on `alwaysbestcare.com` | 8 |
| Paul Davis Restoration | Local franchise contact pages on `[region].pauldavis.com/contact-us/` | 3 |
| Blue Kangaroo Packoutz | North Central NJ local services page on `bluekangaroopackoutz.com` | 1 |
| Griswold Home Care | Berks community page and Greater Temecula local blog on `griswoldcare.com` | 2 |
| CarePatrol | Pittsburgh team-member page and East Long Island local content page on `carepatrol.com` | 2 |

## Brands attempted with no usable row

- Mosquito Authority: location/contact pages expose local forms and phone numbers, but no directly printed local business email.
- Mighty Dog Roofing: local pages printed the shared `help@mightydogroofing.com` inbox, which was dropped as a shared brand inbox rather than a local mailbox.
- HomeWell Care Services: location directory and local pages did not print a local email.
- ComForCare: PA/NJ location and contact pages exposed forms and phones but no local email.
- Restoration 1, SERVPRO, Visiting Angels, FirstLight Home Care, Senior Helpers, Home Helpers, Assisting Hands, Right at Home, and related probes did not yield an in-scope, directly published local email in the bounded pass.
- Pet Butler local pages printed the shared `info@petbutler.com` inbox and were dropped.

## Rows found and dropped during cleanup

- Duplicate `ccarpico@puroclean.com` Lansdale pages were collapsed to one row.
- Duplicate `calston@abc-seniors.com` Always Best Care territory use was collapsed to one row.
- A malformed `email%20ejohnson@abc-seniors.com` rendering was dropped rather than normalized by guesswork.
- Third-party directory email formats, masked addresses, personal-only contacts, shared corporate inboxes, and any inferred address patterns were excluded.
- No Canada or `.ca` rows were retained.

## Validation

- CSV schema exactly matches the required 16 columns.
- `Import-Csv` readback: 30 data rows; 30 unique lowercase emails.
- DNS MX lookup succeeded for every accepted email domain: `puroclean.com`, `abc-seniors.com`, `pauldavis.com`, `bkpackz.com`, `griswoldcare.com`, `griswoldhomecare.com`, `carepatrol.com`, and `alwaysbest.care`.
- `mx_status` is `mx_ok` for all rows; this confirms domain MX presence, not mailbox-level delivery.
- Access date is `2026-08-28` for every row. No outreach, Google Drive mutation, or sharing occurred in this lane.
