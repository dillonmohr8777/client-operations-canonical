---
note_type: evidence
status: complete
created: 2026-08-27
verified_at: 2026-08-27T22:05:00Z
clientId: ami-cleaning
agent: marketing-chief-operator
privacy: redacted
external_action_attempted: none
mail_ready: hold
---

# AMI Cleaning site and lead check - 2026-08-27

## Website health

| Check | Result |
|---|---|
| `https://www.ami-cleaning.com/` | HTTP 200. Title: AMI Commercial Cleaning / The Clean You Expect. Firecrawl stealth 200. |
| robots.txt | Allows `/wp-admin/admin-ajax.php`, disallows `/wp-admin/` and `/ami-preview/`. Sitemap listed. No AI-crawler exception. |
| sitemap.xml | Present. Many lastmod dates still 2026-06-17 or 2026-07-03. |
| GSC inspect | PASS. Submitted and indexed. Google fetch SUCCESSFUL. Canonical www. Last crawl 2026-08-16T23:03:24Z. |
| GSC 2026-08-21..25 | 2 clicks / 495 impressions. Both clicks were branded `ami cleaning`. Avg position ~33 to 50. |

The public walkthrough form is still delivering WordPress notifications, so the July 23 origin fix is still working. Performance / Lighthouse was not rerun this tick.

## Walkthrough leads, last 30 days

Source: mailbox subject `New AMI walkthrough lead`. Counts are notifications, not qualified opportunities. Identifiers below are lead IDs only.

| Lead ID | Date (UTC) | Disposition this tick |
|---|---|---|
| 1543 | 2026-08-12 | Bot spam. Random name, garbage city, plus-obfuscated Gmail. Not a commercial-cleaning prospect. |
| 1544 | 2026-08-13 | Vendor-like. Not counted as a qualified walkthrough without Corinne confirmation. |
| 1545 | 2026-08-14 | Plausible facility-services inquiry. No Gmail disposition thread after the notification. Do not contact. |
| 1546 | 2026-08-18 | Not a real walkthrough. SmartReach-style outreach, garbled city field. Corinne asked 2026-08-18 if it was legitimate. That ask is still unread in Dillon's mailbox. |

No walkthrough notifications from 2026-08-19 through 2026-08-27. Mailbox rechecked 2026-08-27T22:05Z: still four notifications in 16 days, none after 2026-08-18. Corinne's 1546 legitimacy ask remains unread. Daily GA4 PDFs continue, so traffic exists. Conversion to real walkthroughs is not showing in the last nine days.

## Recommended next local actions

1. Reply to Corinne that 1546 is not a qualified walkthrough. Local draft: `deliverables/2026-08-27-corinne-1546-draft.md`. Hold until Dillon says send.
2. Ask Corinne for the 1545 disposition. Do not email the prospect.
3. Add form spam traps (honeypot / company-name heuristics) on the next Bluehost plugin deploy. Not deployed this tick.
4. Vendor (Leads at Scale) still needs to confirm DKIM in their panel. DNS was published 2026-08-20. No production outreach.

No HubSpot mutation. No outbound. No plugin publish.
