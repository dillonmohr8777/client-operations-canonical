# Andy access replies — Sep 9 2026 (UNSENT, Dillon sends)

Thread: Gmail `1a0592c581c51729` (Bar Crawl USA August 2026 monthly report).
Andy Zirger (`info@barcrawlusa.com`) sent two emails today:
1. 10:12 AM ET (`1a08683ef9c918c2`) "This work Dillon?" + screenshot `IMG_3093.jpeg`
2. 10:34 AM ET (`1a0869793489d1c9`) "let me know if you got admin acces" + screenshot `IMG_3094.jpeg`

Screenshot bodies were not viewable from Cursor (Gmail MCP exposes attachment
metadata only). Both grants were instead verified live from the inside, so the
reply does not depend on the screenshots.

## Verified live today

**Search Console** (Composio account `google_search_console_mooner-urban`, ~1:10 PM ET)
* `sc-domain:barcrawlusa.com` permission is **siteFullUser**.
* All 10 Halloween guides: Submitted and indexed, verdict PASS, last crawled Aug 28.
* Sitemaps: 0 errors, 2 non blocking warnings on index files.

**Eventbrite** (~3:59 PM ET, hidden automation Chrome, one time email login link)
* Invite accepted. Dillon is **admin** on org `198548074293` "Bar Crawl USA" (87 members).
* 56 live events; 12 are Halloween (Oct 24 or Oct 31). 46 tickets sold total as of ~4:04 PM ET.
* Orders endpoint readable (Atlanta shows 6 orders), which unblocks GA4 completed order validation.

**Website vs Eventbrite reconciliation**
* 10 guides embed 11 of the 12 live Halloween events (Cleveland guide covers West Park + Lakewood).
* **Birmingham, AL** (Oct 24) is live on Eventbrite with no 2026 guide page.
* Legacy `/event/` pages for Gainesville GA, Asheville, Fort Worth, Knoxville still draw Halloween
  impressions (1,565 impressions, 20 clicks in the window) with no live 2026 event behind them.
* GTM `GTM-WJW4DR99` and GA4 `G-2LNEWBT4XW` present on all 10 guides. JSON-LD is BreadcrumbList,
  Organization, WebPage, WebSite, FAQPage. **No Event schema yet.**

**Search performance, Aug 10 to Sep 7** (Search Console API, page dimension)
* Site: 2,292 clicks / 65,966 impressions.
* New 2026 guides: 27 clicks / 732 impressions, positions 3.2 to 9.5.
* Legacy `/event/` Halloween pages: 407 clicks / 8,203 impressions.
* Old hub `/halloween-bar-crawl-by-bar-crawl-usa-2/`: 10,040 impressions, 8 clicks, position 9.1 (quick win).
* 2025 costume article: 2,310 impressions, 21 clicks.

Full detail in `verification.json`.

## Draft (staged, UNSENT)

* Gmail draft **`r368305288189504972`** (message `1a087d8aa9b63ba7`), in thread `1a0592c581c51729`,
  reply to Andy's 10:34 AM message. To: Andy, Mac. Cc: mac@needmomentum.com, sean@, melissarobinn@.
* `andy-reply-draft.html` / `.txt` are the exact body.
* Two earlier drafts were superseded and trashed: `r-1959533213322712375` (the update call detached
  it from the thread) and `r-8222810164049983732` (off thread duplicate). Only one Bar Crawl draft remains.
* Nothing was sent by Cursor.

## Asks inside the draft
1. Build the Birmingham 2026 guide (recommendation: yes).
2. Are Gainesville GA, Asheville, Fort Worth, Knoxville running in 2026? If not, redirect those pages.

## Next after Andy replies
Event schema on all 10 guides from live Eventbrite data, GA4 completed order validation against
Eventbrite orders (start with Atlanta), old hub title/description rewrite, Birmingham page, costume
article 2026 refresh.
