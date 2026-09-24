# Lane B: Slack evidence sweep for the ranking and AI Overview proof asset

Prepared 2026-09-15 for Momentum 360 (Dillon Mohr). Workspace: momentum3d.slack.com. Read only. Nothing was posted, reacted to, scheduled, or changed.

Every row below is a claim someone made in Slack, or a screenshot someone posted. Nothing in this file is a measurement. Measurements (Search Console, GA4, live SERP checks) belong to Lane A and Lane D. Where a Slack screenshot shows a dashboard, the tool that produced the dashboard is named and the row is labeled "screenshot, claim".

Permalink format: https://momentum3d.slack.com/archives/CHANNEL_ID/pTIMESTAMP. Channel IDs are listed in Section 0. Permalinks in the tables are shortened to the pTIMESTAMP suffix after the first full example in each section to keep the tables readable; the CSV carries every permalink in full.

Quote handling: quoted Slack text is verbatim except that hyphens inside a quote were replaced with a space or a comma because of the standing no dash rule. The permalink carries the exact original.

## Section 0. What could and could not be read

### Tools used

Exactly five read only Slack MCP tools were loaded through one ToolSearch call: slack_read_channel, slack_search_public_and_private, slack_read_thread, slack_read_file, slack_read_canvas. No send, schedule, react, or update tool was loaded or called.

### Method

1. Channel scoped searches (in:#channel, 20 results per page) for ranking, AI Overview, "number one", "page 1", "happy", "loves", report, launch, and file listings (content_types=files).
2. Channel reads newest first (concise mode for breadth, detailed mode when file IDs or exact timestamps were needed, narrow oldest/latest windows to resolve permalinks).
3. Image rendering through slack_read_file for every ranking or dashboard screenshot that mattered (28 images rendered).
4. Keyword searches across all channels and DMs for the two named anchors (Align HCM, Bar Crawl USA).

### Channels read and depth

Client channels (registry displayName where the client is in registry/clients.json; otherwise the channel name is used and the section says so).

| Channel | ID | Depth read | Oldest message reached |
| --- | --- | --- | --- |
| #bar-crawl-usa | C0AEGE1V5KR | 3 channel pages (100 messages each) plus 9 phrase searches plus file list | 2026-03-01 (an older cursor exists, not fetched; contract began March 2026) |
| #onsite-construction | C087GM7SEJF | 3 channel pages plus 2 file list pages plus 6 phrase searches plus 1 detailed window | 2026-04-14 |
| #everyday-life-insurance | C051QQL8UNS | 2 channel pages plus 6 phrase searches | 2026-04-01 (searches reached 2024-05-14) |
| #fagan-painting | C0AMD2E444E | 3 channel pages plus file list plus 10 phrase searches plus 3 detailed windows | 2026-05-13 (searches reached 2026-04-08) |
| #pro-fence-deck | C09DEEBMW0J | 2 channel pages plus 3 file list pages plus 5 phrase searches plus 3 detailed windows | 2026-07-28 (windows reached 2026-04-23) |
| #revive-systems | C0B9V5QDGJH | 1 channel page plus 2 searches | history start |
| #shadow-hvac | C06TQALM4JF (archived 2026-07-30) | 1 channel page plus 2 searches | history start |
| #tags-2-go | C0BMDSVT4JG (archived 2026-08-24) | 1 channel page plus 1 search | history start |
| #jeff-hozias | C07E7MHK22C (archived 2026-05-15) | 1 channel page plus 1 search | history start |
| #kimberly-james-bridal | C0530MVK371 | 1 channel page plus 2 searches | 2026-03 |
| #capsule-and-tonic | C04MB3ZQ7FT | 1 channel page plus 4 searches | 2025-10 |
| #hope-wellness-center | C092MVBN8SV | 1 channel page plus 3 searches | 2025-06 (via search) |
| #puttery | C0BT1P1PGJF | 1 channel page plus 1 search | history start |
| #nexla | C0BRY1H1L9W | 1 channel page plus 2 searches | history start |
| #deborah-mara | C05UM2X3FQS | 1 channel page plus 2 searches | 2026-08 |
| #bridge-software-development | C0BGWRK03B2 | 1 channel page plus 1 search | history start |
| #esquivel-bail-bonds | C09QWF575SS (archived 2026-06-01) | 1 channel page plus 1 detailed window | 2026-01 |
| #nkcdc | C0AQB2TF1AB | 1 channel page plus 1 search | history start |
| #green-slate-masonry | C08UWCW6PCH | 1 channel page plus 1 search | history start |
| #hardwood-artisan-llc | C0A7ZFGF2JU (archived 2026-05-13) | 1 channel page plus 1 search | history start |
| #neat-tidy | C0AMRUGGWTE (archived 2026-06-12) | 1 channel page plus 1 search | history start |
| #va-claims | C0AU6GMGY73 | 1 channel page plus 1 search | history start |
| #pritzker-law-group | C0BB04ZFZ26 | 1 channel page plus 1 search | history start |
| #gt-clinic | C0C0RR57B25 | 1 channel page plus 1 search | history start |
| #omega-landscape | C09DP3AMNQ7 | 1 channel page plus 1 search | 2026 |
| #fresh-blends | C0A8XE76XGR | 1 channel page plus 1 search | history start |
| #blissful-zen-spa | C0B3HBCR8AZ (archived 2026-07-30) | 1 channel page | history start; preserved only, not ranked |

Internal channels read (1 channel page plus keyword searches each): #momentumsites C1CFQBC79, #accountmanagement C0223RR7R6D, #360marketing C06CL0R09A4, #360ops C0245CEKF16, #general C066HKJ2E, #content-media C01SPGA9C1F, #design-social-email C1DEJDQ7Q, #gmbs-reinstatement C08PB4N3L6L, #skool-gbp-course CNYCM0GAZ, #momentum360xplg C0BQV7N570T. Surfaced by search only: #360leads C05R2B1ULF6, #ai-tech-news C04HXSVN2CS, #shipmate-racklify C01U0RUNAV8. DMs surfaced by search only (Align HCM hits, two Dillon DMs in the unverified leads section).

There is no Align channel. See the Align HCM section.

### What could not be read

1. PDFs. slack_read_file fails on every PDF tried (Vista River Hospice keyword rankings F0B7506VC0Y and AI prompts F0B5V7JHEBH in #general; the Bar Crawl, Fagan, and Onsite monthly report PDFs were therefore judged by their covering messages, not their contents). Exact error returned for F0B7506VC0Y on 2026-09-15:

```
MCP error -32602: Invalid tools/call result: [
  {
    "code": "invalid_union",
    "errors": [
      [
        { "code": "invalid_value", "values": [ "text" ], "path": [ "type" ], "message": "Invalid input: expected \"text\"" },
        { "expected": "string", "code": "invalid_type", "path": [ "text" ], "message": "Invalid input: expected string, received undefined" }
      ],
      [
        { "code": "invalid_value", "values": [ "image" ], "path": [ "type" ], "message": "Invalid input: expected \"image\"" },
        { "expected": "string", "code": "invalid_type", "path": [ "data" ], "message": "Invalid input: expected string, received undefined" },
        { "expected": "string", "code": "invalid_type", "path": [ "mimeType" ], "message": "Invalid input: expected string, received undefined" }
      ],
      [
        { "code": "invalid_value", "values": [ "audio" ], "path": [ "type" ], "message": "Invalid input: expected \"audio\"" },
        { "expected": "string", "code": "invalid_type", "path": [ "data" ], "message": "Invalid input: expected string, received undefined" },
        { "expected": "string", "code": "invalid_type", "path": [ "mimeType" ], "message": "Invalid input: expected string, received undefined" }
      ],
      [
        { "expected": "string", "code": "invalid_type", "path": [ "name" ], "message": "Invalid input: expected string, received undefined" },
        { "expected": "string", "code": "invalid_type", "path": [ "uri" ], "message": "Invalid input: expected string, received undefined" },
        { "code": "invalid_value", "values": [ "resource_link" ], "path": [ "type" ], "message": "Invalid input: expected \"resource_link\"" }
      ],
      [
        {
          "code": "invalid_union",
          "errors": [
            [
              { "expected": "record", "code": "invalid_type", "path": [ "_meta" ], "message": "Invalid input: expected record, received null" },
              { "expected": "string", "code": "invalid_type", "path": [ "text" ], "message": "Invalid input: expected string, received undefined" }
            ],
            [
              { "expected": "record", "code": "invalid_type", "path": [ "_meta" ], "message": "Invalid input: expected record, received null" },
              { "expected": "string", "code": "invalid_type", "path": [ "blob" ], "message": "Invalid input: expected string, received undefined" }
            ]
          ],
          "path": [ "resource" ],
          "message": "Invalid input"
        }
      ]
    ],
    "path": [ "content", 1 ],
    "message": "Invalid input"
  }
]
```

The JSON above is reproduced with its whitespace collapsed onto fewer lines; every key, value, and path is as returned.

2. The search `in:#onsite-construction has:file` with content_types=files returned exactly: `No results found.` The plain `in:#onsite-construction` query with content_types=files worked and was used instead.
3. Concise channel reads do not expose message timestamps. Every capture in the tables below was re resolved to a permalink through a phrase search or a detailed window read. Captures that could not be re resolved sit in the unverified leads section with a channel and date locator instead of a permalink.
4. Audio clips (m4a) and docx files were not opened.
5. Canvases: none contained ranking evidence; slack_read_canvas was not needed after the search pass.

### Credentials seen and not copied

Six messages contain a login or password. None was copied. Locators only:

1. #onsite-construction, Grace Slagle, 2026-04-17 09:26 EDT (GMB login).
2. #fagan-painting, Phil A, 2026-06-26 10:59 EDT (site login).
3. #capsule-and-tonic, Beth Kann, 2026-06-02 15:29 EDT (shared mailbox password).
4. #pro-fence-deck, Sean Boyle, ts 1785336663.704099 (2026-07-29 11:11 EDT) (citation account password).
5. #deborah-mara, Muhammad U, 2026-09-11 03:46 EDT (WordPress admin password).
6. #hope-wellness-center, John Belaska, ts 1780598159.455419 (2026-06-04 14:35 EDT) (WP Engine login and password inside a forwarded client email).

### Standing restrictions honored

Google Ads account 7214914099 was never queried. No account level total was taken on 6275014654. This lane touched no ad platform at all; every ads figure below is a Slack claim.

### How to turn a claim below into a measurement

Search Console query for the property and date range named in the row (Lane A); GA4 landing page and session source report for the same range; a dated live SERP capture for the exact query string with location set to the client's city; Semrush or Site Kit export re pulled from inside the account rather than from a screenshot.

---

## Align HCM (registry id align-hcm)

No Slack channel exists for Align HCM. Searches run across all channels and DMs: "alignhcm" (2 hits), "Align HCM" (4 hits), "alignhcm.com" (0 hits), "HCM" (8 hits), "SmartCare" (2 hits), `align from:<@U0A6MD920MA>` (32 hits, all uses of "aligned" or "alignment"). Every hit is a bot or self DM about an unreleased readiness package, not a result.

| Date | Permalink | Author role | Short quote | Evidence label |
| --- | --- | --- | --- | --- |
| 2026-07-28 | https://momentum3d.slack.com/archives/D0A6ECK6CSZ/p1785269573491959 | Dillon Mohr, self DM | Customer Agent readiness package, "Still LAUNCH HOLD", HubSpot portal reference, PR #9 in client-operations-canonical | scope, claim (no result) |
| 2026-07-20 | https://momentum3d.slack.com/archives/D0BJEC2MM6V/p1784526219348499 | Cursor bot posting for Dillon | "Align HCM (full time lane) Keep LinkedIn/content cadence current; SmartCare assessment + ROI calculator" | scope, claim (no result) |
| 2026-07-24 | https://momentum3d.slack.com/archives/D0BJEC2MM6V/p1784924762609229 and p1784925080905079 | Cursor bot | connectivity test, clientId "align-hcm" | not evidence |
| 2026-06-18 | https://momentum3d.slack.com/archives/D0ALGRTE6CF/p1781810243010409 | Dillon Mohr, DM | OneDrive path reference only | not evidence |
| 2026-04-25 | https://momentum3d.slack.com/archives/D0A6ECLQ0S1/p1777138186763309 | Dillon Mohr, DM | OneDrive path reference only | not evidence |

Testimonial candidates: none.

Strongest line a salesperson could say from Slack: none. Slack contains no Align HCM ranking, AI Overview, or client praise evidence. Any Align HCM proof must come from Lane A (Search Console) or Lane D (local files).

---

## Bar Crawl USA (registry id bar-crawl-usa)

Channel #bar-crawl-usa (C0AEGE1V5KR). Client contact: Andy Zirger, Owner (identity confirmed by an email screenshot Mac posted 2026-09-09, file F0C0K07FDGB, message p1788988663421089). Work: Google Ads for ticketed events, event landing pages, on page SEO, weekly and monthly reports. Contract framing per Mac 2026-03-25: landing pages $100 per page, website SEO $450 per month, ads management $450 per month.

| Date | Permalink | Author role | Short quote | Evidence label |
| --- | --- | --- | --- | --- |
| 2026-09-14 | https://momentum3d.slack.com/archives/C0AEGE1V5KR/p1789420450940369 | Dillon Mohr, AM and SEO | "Search Console and Eventbrite were both verified from inside the accounts rather than from screenshots, all ten Halloween guides are confirmed indexed, and organic clicks are up 160 percent on the prior 29 days" (report at momentum-weekly-client-reports.netlify.app/reports/bar-crawl-usa/) | shared report (artifact) plus claim by Momentum |
| 2026-09-14 | p1789422941571639 | Mac Frederick, owner | "I dont understand his response from last week." | context, client response unclear |
| 2026-09-10 | p1789068545819079 | Dillon Mohr | "+160% organic search clicks (Aug 10 to Sep 7 vs prior 29 days)"; "2,356 organic clicks on 68,203 impressions with $0 paid"; "August 2,300 vs July 749 (+207%)"; "All ten 2026 Halloween city guides indexed (Search Console PASS)"; "407 clicks / 8,203 impressions"; "October hub 10,040 impressions" (report bar-crawl-usa-2026-09-10-andy-report.netlify.app) | claim by Momentum with numbers; shared report |
| 2026-09-09 | p1788990426506209 | Dillon Mohr | "Got much deeper access today!!" (after Andy granted admin access) | context |
| 2026-08-31 | p1788202598860869 | Dillon Mohr | August report PDF (F0BU07YMYQ1): "All 10 Halloween city pages are live with a 92 out of 100 average readiness score" | shared report; internal score, not a ranking |
| 2026-08-31 | p1788187843626959 and p1788188357306949 | Mac Frederick | "building + optimizing 10 new pages = $750"; "charged = $750 for AUG" | scope, claim |
| 2026-08-27 | p1787853301908509 | Dillon Mohr | scorecard PDF (F0BU1GSFHA4) | shared report |
| 2026-08-10 | p1786401914308059 | Dillon Mohr | 24 page analytics PDF (F0BPDAC7Z09) | shared report |
| 2026-08-04 | p1785873725734119 | Dillon Mohr | "Check his last email mac he said that we are doing a great job, but he wants to pause until we do October event events there's 12 of them!" | claim by client, relayed by Momentum |
| 2026-08-04 | p1785880071300869 | Mac Frederick | "that defeats the purpose of SEO he has tons of pages still needs optimized means he either doesnt have the money (only $450/mo) or doesnt see the value/results from SEO" | counter signal, internal |
| 2026-08-04 | file F0BMZML2GA2 in this channel | Mac Frederick | Semrush Domain Overview crop: AI Visibility 20, Mentions 112, Cited Pages 84 (ChatGPT 21/43, AI Overview 29/28, AI Mode 47/44, Gemini 15/12), Authority 30, Organic Traffic 3.5K (down 9.3%), Organic Keywords 2.2K; Mac: "looks like it plateaued" | screenshot, claim (Semrush); domain not visible in crop, see unverified leads |
| 2026-06-10 | p1781135552767979 | Mac Frederick | Semrush "Domain Overview: barcrawlusa.com" (file F0B9VE1BG04): AI Visibility 21, Mentions 153, Cited Pages 87 (ChatGPT 22/50, AI Overview 50/18, AI Mode 51/54, Gemini 30/24), Authority Score 29, Organic Traffic 3.1K (down 13%), Organic Keywords 2.2K (down 2.8%), Referring domains 350, Backlinks 1.4K, top cited sources eventbrite.com 64, barcrawlusa.com 63, reddit.com 30, SERP distribution Organic 91.1%, AI Overviews 1.3% | screenshot, claim (Semrush) |
| 2026-06-10 | p1781138526641019 and p1781138532001159 | Dillon Mohr | "Direct correlation with heavy ad runs! That's insane monthly organic traffic even being down 13 %" with IMG_0691 (F0B9VMC0HRA): Semrush organic traffic line rising from about 2K (Dec 2025) to a 5.1K peak (2026) | screenshot, claim (Semrush) |
| 2026-06-30 | p1782830304528299 | Dillon Mohr | June on page work thread, AIOSEO score 86 to 88 | claim by Momentum; plugin score |
| 2026-06-01 | p1780354568939729 | Dillon Mohr | May report: 53 tickets on $324.37 ($6.12 per ticket) plus 12 page metadata cleanup | shared report; claim with numbers (ads) |
| 2026-05-14 | p1778794740426469 | Dillon Mohr | "He seemed happy overall, and I walked him through the organic clicks plus the broader SEO profile"; "He's top 8 for basically every page on the site, and the newly inspected URLs are ranking well too" | claim by Momentum (position) plus relayed sentiment |
| 2026-04-30 | p1777593125947649 | Dillon Mohr | April taco campaign: "307,862 impressions, 5,075 clicks, and $3,977.17 in spend"; "We've now sold 436 tickets"; "averaged about $0.78 CPC" | claim by Momentum with numbers (ads) |
| 2026-04-27 | p1777337739384329 | Dillon Mohr | week of 4/20 to 4/26: "402 tickets sold (form submission conversions)", "$3,594.89 total spend", "$8.94 true cost per ticket" (report barcrawlusa-gads-report.netlify.app) | shared report; claim with numbers (ads) |
| 2026-04-21 | p1776774614372579 | Melissa Silber, ops | "Great reporting Dillon Mohr what are next steps here? Think we could do a case study on these results?" | internal, case study interest |
| 2026-04-21 | p1776778339735139 | Mac Frederick | "is he seeing the same conversion ticket sales numbers on his side? And can you check new pages are indexing and getting impressions (GSC)" | internal, verification request (open) |
| 2026-04-20 | p1776743720182669 | Dillon Mohr | "214 tickets sold across 18 active PMax cities / campaigns"; "Mid flight report with the interactive dashboard has already been shared with Andy" | claim by Momentum with numbers (ads) |
| 2026-03-19 | p1773959048274619 | Dillon Mohr | "Great job signing him for a few months mac!! So can I move forward building out all of those landing pages" | scope, claim (about 20 city pages) |
| 2026-03-13 | p1773438549652819 | Dillon Mohr | "We have sold 177 tickets on $1,130 in ad spend. That's a 15.7% Conversion Rate!"; "I know Andy is super happy about it" | claim by Momentum with numbers (ads); relayed sentiment |
| 2026-03-11 | p1773247159590849 | Dillon Mohr | "great call he seemed pretty happy" | relayed sentiment |
| 2026-03-01 | p1772396287141759 and p1772396125152209 | Dillon Mohr | "He basically already confirmed he wanted to keep working with us"; "Cleveland bar crawl is $4.24 Cost per conversion so far!!" | relayed retention signal; claim with number (ads) |

Testimonial candidates (verbatim client words): none in Slack. Everything positive from Andy is relayed ("he said that we are doing a great job", p1785873725734119; "Andy is super happy", p1773438549652819). The email itself lives in Gmail (Lane C).

Counter signals to keep in view: the client paused SEO in August for budget reasons (p1785873725734119, p1785880071300869); Mac's 2026-04-21 request to confirm ticket numbers on the client's side and page indexing in GSC (p1776778339735139) was answered only for indexing ("all but one page is indexed", p1776778608525549).

Strongest line a salesperson could say, with its source: "For Bar Crawl USA we built ten Halloween city guides, got all ten indexed, and organic clicks rose 160 percent over the prior 29 days with zero paid spend on those pages" (p1789068545819079 and p1789420450940369). This is a Momentum claim that Momentum says it verified inside Search Console; Lane A should confirm the 2,356 clicks and 68,203 impressions for 2026-08-10 to 2026-09-07 before it goes in front of a prospect.

---

## Onsite Concrete & Landscape (registry id onsite-concrete-landscape)

Channel #onsite-construction (C087GM7SEJF). Vacaville, California. Client contact: Nicki. Work: Shehzad Khan (SEO pages, schema, internal links), Grace Slagle (AM), Dillon Mohr (Google Ads, blogs, reports).

This is the best AI Overview evidence in Slack: Momentum made Google SERP screenshots that show the client's page named in, or cited under, an AI Overview.

| Date | Permalink | Author role | Short quote | Evidence label |
| --- | --- | --- | --- | --- |
| 2026-09-14 | https://momentum3d.slack.com/archives/C087GM7SEJF/p1789414336360669 | Shehzad Khan, SEO contractor | "Here is a Vacaville, Fairfield, & Davis Rankings. The Vacaville is good (I think best), and Fairfield is now improving and Davis has started from last week." Ten screenshots. Rendered: 1.PNG (F0C2M1N47EU) Google SERP "concrete pouring vacaville CA", onsiteconcretelandscape.com at organic position 6; 4.PNG (F0C1LDR0C3D) "concrete patio in vacaville ca" with an AI Overview and a Local Contractors pack listing "Onsite Concrete & Landscape 5.0 (7)" second; 8.PNG (F0C1LDSNBFV) "landscaping outdoor living spaces in vacaville ca" with Onsite in the local pack and onsiteconcretelandscape.com in the AI Overview sources sidebar. Not rendered: F0C1UJHBHED, F0C1UJHSTG9, F0C2M1PMF40, F0C1WAKQWFN, F0C1N0RBSF7, F0C1B9KMHPZ, F0C1B9KL2K1 | screenshot, claim (Google SERP) |
| 2026-09-14 | p1789420197535409 | Dillon Mohr, ads | "The 'not even one call' claim was answered with the account record rather than argued with. The bigger find was a system generated Local Services campaign sitting enabled at $80 a day and delivering nothing. It is now paused" | counter signal (client says no calls); ads |
| 2026-08-03 | p1785782384542329 | Shehzad Khan | July monthly report: "Landscaping outdoor spaces in Vacaville" near the top of the AI Overview and #6 organic; "Landscaping living spaces in Vacaville" #4 organic and #1 in the AI Overview | claim by Momentum (positions) |
| 2026-07-12 | p1783881494044299 | Shehzad Khan | "On Keyword: 'Landscaping outdoor spaces in Vacaville', Onsite is appearing approximately top on AI Overview and on Search Engine it's appearing on 6th Number. On Keyword: 'Landscaping living spaces in Vacaville', The site page is appearing on 4th Number on Search Engine and appearing on first number on AI overview." Rendered: F0BGMB7UHRR shows the AI Overview for "Landscaping living spaces in vacaville" listing "Onsite Concrete & Landscaping" first among "Top rated landscape and hardscape contractors serving the Vacaville area" with a link to the Onsite Vacaville page, and onsiteconcretelandscape.com first of the 6 cited sites; F0BGMB7RBL3 shows the AI Overview for "landscaping outdoor spaces in vacaville" with an onsiteconcretelandscape.com source card dated Jul 8, 2026. Not rendered: F0BHMU5V308, F0BGRJAEB3Q, F0BGXBCK6A0, F0BGVH5KCSV | screenshot, claim (Google SERP with AI Overview) |
| 2026-07-13 | channel, Grace Slagle | "Rankings are getting better" (permalink not captured) | internal |
| 2026-07-06 | p1783342839484999 | Shehzad Khan | June monthly: "Concrete Contractors" in Vacaville approximately #1 top position; AI Overview inclusion confirmed for targeted keywords. Rendered: F0BEYNXBMM5 shows organic position 4 for "landscaping outdoor living spaces in vacaville ca". Not rendered: F0BEYNY5Z7Z, F0BF7SBLEHZ, F0BFAQY4GAH, F0BFE4F0EAE | claim by Momentum; screenshot, claim (Google SERP) |
| 2026-07-06 and 2026-07-07 | p1783356480552099 and p1783452600420659 | Dillon Mohr | June Google Ads: "$218.68 spend, 22,295 impressions, 752 clicks/interactions, 3.37% interaction rate, $0.29 average CPC, 34 tracked conversion events, and $6.43 cost per conversion" (dashboard onsite-concrete-construction-2026-06-06.netlify.app) | shared report; claim with numbers (ads) |
| 2026-06-22 | p1782161065239699 | Grace Slagle, AM | Screenshot (F0BCGCKKB0C) of her weekly email to Nicki: "June 15 to 22 highlights: 10 total Google conversions at a $5.27 cost per conversion on $52.70 spend"; "Month to date context: 20 total conversions on $148.67 spend at a $7.43 cost per conversion"; "Three Blogs Created + Two Pages Created for Landscaping + Created these pages FAQs and Article Schema + Improved the internal linking of 7 Pages"; "We are ranking higher and higher for concrete keywords." | shared report to client (artifact); claim by Momentum |
| 2026-06-22 | p1782142060026099 | Shehzad Khan | "ranking on from 15 to 5th on Concrete Driveway in Vacaville, and Ranking on First page for Main keyword: Concrete Contractors in Vacaville CA". Rendered: F0BCC01257T shows "Concrete contractors in vacaville ca" with onsiteconcretelandscape.com at organic position 9 | claim by Momentum; screenshot, claim (Google SERP) |
| 2026-06-18 | p1781812677762279 | Grace Slagle | "from client, can you start helping her rank higher for landscaping?" | client request, relayed (engagement, not a win) |
| 2026-06-09 | p1781000325397689 | Shehzad Khan | "We are on a approximately top on 'Concrete Contractors' in Vacaville. The flactuations in ranking are normal but for now we are on top approximately" | claim by Momentum |
| 2026-06-09 | p1781013895206219 and p1781014124055919 | Grace Slagle | "i'll let the client know now, she'll be super happy" then four minutes later "Client is super happy Shehzad Khan keep up the great work!" | relayed sentiment; timing makes it ambiguous whether the client had replied |
| 2026-06-02 | p1780428696979039 and p1780428735968589 | Grace Slagle | "Pages look great and glad we're ranking higher!"; "ads look to be performing super well, great work!" | internal |
| 2026-06-01 | p1780343133205359 | Shehzad Khan | pages delivered plus "pics of how our pages are doing... also for AI Overview" | claim by Momentum |
| 2026-04-22 | p1776866864721379 | Grace Slagle | "client seems super happy" (ads landing page) | relayed sentiment |
| 2026-04-21 | p1776829800131249 | Dillon Mohr | "Ads launching tomorrow! Client loves the design" | launch announcement; relayed sentiment |

Testimonial candidates: none verbatim from the client in Slack. Relayed: "Client is super happy" (p1781014124055919), "client seems super happy" (p1776866864721379), and the client's own request to extend ranking work to landscaping (p1781812677762279), which reads as a vote of confidence.

Counter signals: the client's "not even one call" complaint on 2026-09-14 (p1789420197535409) and a slow leads text on 2026-08-12 (channel, permalink not captured). Rankings and AI Overview inclusion did not, by the client's account, produce calls by September.

Strongest line a salesperson could say, with its source: "For a concrete and landscaping contractor in Vacaville we built landscaping pages with FAQ and article schema, and within six weeks Google's AI Overview for 'landscaping living spaces in Vacaville' named the client first and cited the page we built" (Slack screenshot F0BGMB7UHRR on p1783881494044299, 2026-07-12; reconfirmed with the 2026-09-14 screenshots on p1789414336360669). This is a Momentum made screenshot; a dated live SERP check from Lane A or D for the same query, location set to Vacaville CA, would make it a measurement.

---

## Everyday Life Insurance (not in registry/clients.json; channel name used)

Channel #everyday-life-insurance (C051QQL8UNS). Client contact: Jake. Work: Bella (Isabella Rementer, AM and on page), Tiffany K (SEO and backlinks), Obaid (web). Long running SEO retainer (13th monthly noted 2026-05-13).

| Date | Permalink | Author role | Short quote | Evidence label |
| --- | --- | --- | --- | --- |
| 2026-09-08 | channel, Bella | "GSC setting is already set to include in AI results" (permalink not captured) | scope, claim |
| 2026-08-04 | https://momentum3d.slack.com/archives/C051QQL8UNS/p1785850122734849 | Bella, AM | "KW rankings are through the roof" with IMG_7175 (F0BMVBN9R6J): Semrush Organic Keywords Trend, 2 years: Keywords 1.9K (+3.79%), Traffic 461 (+8.98%), Traffic Cost $3.2K (+12.88%), Branded 91, Non Branded 370; bars about 600 in Aug 2024 rising to about 1.9K by Jul 2026 with the steepest growth from Feb 2026 | screenshot, claim (Semrush) |
| 2026-06-08 | p1780943176424769 | Bella | "Jake just sent us an excellent new sale that came from SEO! Go team" | claim by client (a sale attributed to SEO), relayed by AM |
| 2026-06-01 | channel, Bella | "LLM Rankings, Bellas On Page Optimizations" sheet (F0B7L0MBE12), plus LLM traffic audit spreadsheet p1780329933357599 | artifact, not opened |
| 2026-05-18 | p1779124472590419 | Bella | "Jake approved the MPI optimizations and said they look great." | client approval, relayed |
| 2026-04-27 | p1777314985126819 | Bella | "I know Jake is thrilled with the results. I'll share the stat you mentioned on our call tomorrow" | relayed sentiment |
| 2026-04-27 | p1777320300366489 | Tiffany K, SEO | "Please just double check everything mentioned with GA before mentioning anything to the client." | caveat |
| 2026-04-24 | p1777046250759119 | Tiffany K | "ELI page one keywords (1 to 10) increased from a total of 229 keywords in that position to 323 keywords." Images the same day: F0B03DB6PQ9 (small trend chart rising Mar to Apr 2026) and F0B0JRRRG3S (comparison table "Everyday Life Insurance | Life Insurance Company": Apr 1 to Apr 23, 2026 rows 1,068 (5%) and 463 (11.42%) versus Mar 9 to Mar 31 rows 241 (0.82%) and 102 (1.44%); percent change 343.15% and 353.92%; column headers not in crop) | claim by Momentum with numbers; screenshot, claim (GA style table, tool not visible) |
| 2026-04-24 | p1777047937191989 | Tiffany K | "Hold off on that. Something is not adding up here. I will have to dive deeper." | caveat on the row above |
| 2025-09-24 | p1758723230579129 | Bella | "Jake said to tell you he is thrilled with everything you've been doing so far." | relayed praise |
| 2025-08-26 | p1756226097841469 | Bella | call notes: "New MPI content has been a massive success, they went from around 12 to 70+ mortgage related keywords with our new content" | claim by Momentum with numbers |
| 2024-05-14 | p1715709957370259 | Bella | "He said he loves working with us and appreciates everything we've done for their brand"; "overall their sales from organic search this year were around 15%. In years past they never got close to double digits, so he was super happy about that"; "over the past 5 months his sales from organic search have only increased, despite the SEO problems. And that he believes our work has leveled up their clientele" | claim by client with a number, relayed by AM (flag: worth confirming with the client) |

Testimonial candidates (relayed, not verbatim from the client):

1. "Jake said to tell you he is thrilled with everything you've been doing so far." (p1758723230579129)
2. "He said he loves working with us and appreciates everything we've done for their brand" and the 15 percent of sales from organic search statement (p1715709957370259).
3. "Jake just sent us an excellent new sale that came from SEO!" (p1780943176424769)

Strongest line a salesperson could say, with its source: "A life insurance client told his account manager that organic search went from never reaching double digits to about 15 percent of sales, and two years later he was still sending us sales he attributed to SEO" (p1715709957370259 and p1780943176424769). Both are relayed by the AM. The 229 to 323 page one keyword claim (p1777046250759119) should not be used until the same author's "Hold off on that" caveat (p1777047937191989) is resolved.

---

## Fagan Painting (registry id fagan-painting)

Channel #fagan-painting (C0AMD2E444E). Pittsburgh. Client contact: James (parent company Legacy Paint Holdings). Work: Phil A (SEO), Melissa Rigby (content and GBP), Dillon Mohr (Meta ads through July, then AEO proposal). Contract renews on the 24th.

Read this section whole. It holds the only client confirmed number in the entire Slack sweep and also the sharpest negative client message in the sweep, five weeks apart.

| Date | Permalink | Author role | Short quote | Evidence label |
| --- | --- | --- | --- | --- |
| 2026-09-15 | channel, Phil A relaying James | "Please do not run the backlinks until this is fixed" (permalink not captured) | counter signal |
| 2026-09-14 | https://momentum3d.slack.com/archives/C0AMD2E444E/p1789391169626169 | Phil A, SEO, relaying James | "It has been dropping like a stone for 30 days. I pulled up the drive and it didn't look good. A ton of pages are not indexing. We have nothing in the top 3 and we are losing a word a day in 4 to 10. Online presence is very poor and AI visibility is at zero. We aren't getting any leads. Momentum has 90 days to get it right or Legacy Paint holdings will have no choice but to take over all digital marketing." | claim by client (negative), relayed |
| 2026-09-14 | p1789391474888139 | Phil A | "expected traffic dropped 15% over the weekend (see image)" with F0C1P7452EN: Semrush Positions view, Keywords 452 (down 4.64%), Traffic 283 (down 15.77%), Traffic Cost $3.0K (down 4.03%), 6 month bars Apr 26 to Sep 26 | screenshot, claim (Semrush), negative |
| 2026-09-14 | p1789400721676879 | Mac Frederick, owner | "yea a few weeks ago he was singing out praises Phil A whats going on?" | context |
| 2026-08-31 | p1788202591703319 | Dillon Mohr | "August report is attached. Organic visibility reached 512 ranking keywords with 39 top ten terms." (PDF F0BTY9MGM1Q) | shared report; claim with numbers |
| 2026-08-06 | p1786029069776639 | Phil A | EOM email to James: "For July, the site hit 512 ranking organic keywords, a jump from 370 in June. I took a peek at current positions, and as of today, the site's ranking in the top 10 (page 1) for 39 keywords." | claim by Momentum with numbers (sent to client) |
| 2026-08-06 | p1786029145152579 | Phil A | "Things are looking pretty good, increasing keywords and improved rankings. He got a lead last night. Would definitely like to see more organic leads, though." | claim by Momentum |
| 2026-08-06 | p1786043231326969 | Mac Frederick | Screenshot (F0BNPC7JGBE): Semrush Domain Overview faganpainting.com, Aug 5 2026: AI Visibility 14, Mentions 3, Cited Pages 11 (ChatGPT 0/11, AI Overview 0/0, AI Mode 2/0, Gemini 1/0), Authority 17, Organic Traffic 753 (down 1.2%), Organic Keywords 516 (+0.8%), Referring domains 594, Backlinks 6.9K; keyword chart from about 137 (Oct 2025) to 548 (Aug 2026) | screenshot, claim (Semrush); note AI Overview mentions 0 |
| 2026-08-04 | p1785855691891499 | Dillon Mohr, ads | "he had a really positive last week of advertising. He had booked over $20,000 worth of estimates!" | claim by Momentum with number (Meta ads) |
| 2026-07-28 | p1785273140841619 | Dillon Mohr | "He specifically asked me in an email to keep me on board to do ai optimizations (I brought it up on a call and text one time so he must've been happy with how detailed I made it)" | client request, relayed |
| 2026-07-27 | p1785181855154749 | Cursor bot posting for Dillon | client "is pleased with the direction of the SEO work, wants that program to continue long term, and specifically wants Dillon retained for AI search optimization" (name corrected in thread: James) | relayed sentiment (bot summary) |
| 2026-07-24 | p1784917680531679 | Dillon Mohr | IMG_3872 (F0BKGRS462F): Gmail thread "Four new Fagan Painting Meta leads from the tightened form"; Fagan Painting replies "2 were good. Still waiting on the 3rd." and "$15,000.00 $10,000.00" | claim by client, client's own words in screenshot, with numbers |
| 2026-06-24 | p1782316712505619 | Phil A | "9 organic leads for June so far. He emails me every time something comes in so he seems really on top of it and happy overall." | claim by Momentum with number |
| 2026-06-08 | p1780931580366049 | Phil A | "He's really on top of his stuff, on Sunday he emailed me saying he noticed a 20% jump in traffic." | claim by client with a number, relayed |
| 2026-06-01 | p1780333669776599 | Phil A | May report to James (Semrush PDF F0B7B0XHN2X): "Removed 1600 toxic links"; "Organic traffic growth by 67%" | claim by Momentum with numbers; shared report |
| 2026-05-19 | p1779213189187809 | Mac Frederick | "good call guys he seems happy and trusts us" | relayed sentiment |
| 2026-05-04 | p1777922887665439 | Melissa Rigby, content | "He's happy. Just focus on the wins moving forward" | relayed sentiment |
| 2026-04-28 | p1777388294913869 | Phil A | "Staging site is live" | launch announcement |

Testimonial candidates:

1. Client's own words (screenshot): "2 were good. Still waiting on the 3rd." with estimate values $15,000.00 and $10,000.00 (p1784917680531679). Usable for Meta ads lead quality, not for rankings.
2. Relayed: the client asked to keep Dillon on for AI optimizations (p1785273140841619) and noticed a 20 percent traffic jump himself (p1780931580366049).

Counter signals that must travel with any Fagan claim: the 2026-09-14 message from the client (p1789391169626169) says nothing in the top 3, AI visibility at zero, no leads, and gives a 90 day deadline; Mac's own Semrush screenshot on 2026-08-06 shows AI Overview mentions at 0 (p1786043231326969). Do not use Fagan as an AI Overview proof point.

Strongest line a salesperson could say, with its source: "A Pittsburgh painting contractor confirmed in writing that two of the first three Meta leads from our tightened form were good, worth $15,000 and $10,000 in estimates" (p1784917680531679). For SEO the honest line is narrower: "ranking keywords went from 370 in June to 512 in July with 39 on page one" (p1786029069776639), and it should be paired with the September decline before it is used.

---

## Pro Fence & Deck (registry id pro-fence-deck)

Channel #pro-fence-deck (C09DEEBMW0J). Churchville, Pennsylvania. Client contact: Sergi. Work: Shehzad Khan (SEO pages, FAQs, schema, citations, speed), Sean Boyle (owner, account lead), Beth Kann (AM from August).

| Date | Permalink | Author role | Short quote | Evidence label |
| --- | --- | --- | --- | --- |
| 2026-09-14 | https://momentum3d.slack.com/archives/C09DEEBMW0J/p1789410971656279 | Shehzad Khan | "HomePage page speed fixed from 17sec to 8sec (very awesome improvement)" | claim by Momentum with number |
| 2026-09-10 | p1789061527041449 and p1789060195468839 | Shehzad Khan | "Sean Please tell him SEO is a long term game"; "he is angry in the last meeting" | counter signal |
| 2026-08-19 | p1787176519672559 | Shehzad Khan | "he's a little stressed that he hasn't received anything from the last couple of months" | counter signal |
| 2026-08-14 | p1786724263858809 | Shehzad Khan | "Win: Yelp is now successfully created, approved, and live." | claim by Momentum (citation) |
| 2026-07-28 | p1785264168280989 | Shehzad Khan | "the impressions improved great... as compared to the results I have send on 11th June" with F0BL81MJJEP: Google Site Kit (WordPress, Pro Fence Deck LLC) last 90 days: Total Impressions 51K (up 48.8%), Total Clicks 224 (down 0.4%), Unique Visitors from Search 215 (up 0.9%) | screenshot, claim (Google Site Kit) |
| 2026-06-11 | p1781191857331319 | Shehzad Khan | "Unique Visitors increased up to 41.9% for the last 14 days. Unique Visitors increased up to 176.5% for the last 90 days" with F0B9ZQCA1G9: Site Kit last 90 days: Total Impressions 42K (up 19.1%), Total Clicks 279 (up 156%), Unique Visitors from Search 271 (up 176.5%); Sean: "Oh wow", "Send that to client" | screenshot, claim (Google Site Kit) |
| 2026-05-14 | p1778791568375189 | Shehzad Khan | AI answer screenshots. F0B3VJ2P2K0 "Profence One keywords Answer on AI overview": Google AI Mode result for "gate motor operator repair in ivyland pa": "For gate motor operator repair in Ivyland, PA, Pro Fence & Deck is the top rated local specialist located nearby in Churchville" with profencedeck.com cited and Pro Fence Deck 4.9 (87) under Local Repair Specialists. F0B4RUH5F40 "Profence Second keywords Answer on AI overview": AI Mode result for "fence contractor in richboro pa" listing Pro Fence Deck second under Top Local Fence Contractors | screenshot, claim (Google AI Mode tab, not the AI Overview block) |
| 2026-05-04 | p1777908337803899 | Shehzad Khan | F0B2C9Z7N3A: Site Kit last 90 days, All Visitors 508, down 28% compared to the previous 90 days | screenshot, claim (Google Site Kit), baseline, negative |
| 2026-04-23 | p1776994118389059 | Shehzad Khan | two PVC deck pages created; "Proof of Profence Site Metrics" link to a Search Atlas site explorer dashboard; F0AUVT6BUDB organic traffic chart (all time) near zero before Oct 2025, rising to 146 at Apr 26 | screenshot, claim (Search Atlas style chart, tool inferred from the linked dashboard) |

Testimonial candidates: none. The client's recorded sentiment in Slack is frustration (2026-08-19, 2026-09-10).

Strongest line a salesperson could say, with its source: "Google's AI Mode answer for gate motor operator repair in Ivyland PA named Pro Fence & Deck the top rated local specialist and cited their site" (screenshot F0B3VJ2P2K0 on p1778791568375189, 2026-05-14). Note it is AI Mode, not an AI Overview, and it is a Momentum made screenshot. The Site Kit 90 day figures (clicks up 156 percent to 2026-06-11, p1781191857331319) are the numeric support and should be re pulled from Search Console by Lane A.

---

## Revive Systems (registry id revive-systems)

Channel #revive-systems (C0B9V5QDGJH). Chambersburg, Pennsylvania. Client contact: Mike. Mac described the account as pro bono on 2026-06-11 (channel, permalink not captured).

| Date | Permalink | Author role | Short quote | Evidence label |
| --- | --- | --- | --- | --- |
| 2026-06-29 | https://momentum3d.slack.com/archives/C0B9V5QDGJH/p1782774556637819 | Dillon Mohr | pricing error found and fixed: "he seemed really happy that we caught that" | relayed sentiment |
| 2026-06-12 | p1781282173256249 | Mac Frederick, owner | "your GBP now ranking top 3 in Google 3 pack for personal trainers chambersburg pa, fitness coaches chambersburg pa, nutrition coaches chambersburg pa, personal trainers franklin county pa, nutrition coaches franklin county pa" | claim by Momentum (map pack positions) |
| 2026-08 | channel | five AEO, GEO and SEO articles drafted, unpublished (permalink not captured) | scope, claim |

Testimonial candidates: none.

Strongest line: "Within weeks of taking over the profile, the client's Google Business Profile was in the top 3 of the map pack for five personal training and nutrition coaching searches in Chambersburg and Franklin County" (p1781282173256249). Momentum claim, no screenshot; a geo grid check would make it a measurement.

---

## Shadow Heating and Cooling (registry id shadow-heating-cooling)

Channel #shadow-hvac (C06TQALM4JF, archived 2026-07-30). Client contact: Mike. Work: Meta ads, new website.

| Date | Permalink | Author role | Short quote | Evidence label |
| --- | --- | --- | --- | --- |
| 2026-07-14 | https://momentum3d.slack.com/archives/C06TQALM4JF/p1784067314493189 | Dillon Mohr | site live, Search Console verified, sitemap accepted, 14 URLs | launch announcement |
| 2026-07-06 | p1783348708455969 | Dillon Mohr | 15 Meta leads at $4.41 cost per lead | claim by Momentum with numbers (ads) |
| 2026-07-05 | p1783304594618439 | Dillon Mohr | "he's REALLY happy with it" | relayed sentiment |
| 2026-06-29 | p1782756550027009 | Dillon Mohr | "Meta leads: 9, Cost / lead: $9.12, Spend: $82.11"; "Client is now reciting leads" (report shadow-hvac-2026-05-31-report.netlify.app) | shared report; claim with numbers (ads) |

Testimonial candidates: none verbatim.

Strongest line: "An HVAC client's Meta lead campaign produced 15 leads in a week at $4.41 each" (p1783348708455969). Ads claim, not rankings.

---

## Tags 2 Go (registry id tags-2-go)

Channel #tags-2-go (C0BMDSVT4JG, archived 2026-08-24). Client contact: Silver. Work: Google Ads call campaign.

| Date | Permalink | Author role | Short quote | Evidence label |
| --- | --- | --- | --- | --- |
| 2026-08-20 | https://momentum3d.slack.com/archives/C0BMDSVT4JG/p1787261986606109 | Dillon Mohr | 7 calls on $84.05 spend, $12.01 per call; "Yesterday she confirmed the earlier callers were real customers and that one call reached the business" | claim with numbers; client confirmation relayed |
| 2026-08-20 | p1787262012754649 | Sean Boyle, owner | "incredible work" | internal praise |

Testimonial candidates: none verbatim.

Strongest line: "The client confirmed the callers from the ad campaign were real customers, at $12.01 per call" (p1787261986606109). Relayed confirmation.

---

## Jeff Hozias (not in registry/clients.json; channel name used)

Channel #jeff-hozias (C07E7MHK22C, archived 2026-05-15). Individual broker. Work: Meta lead ads.

| Date | Permalink | Author role | Short quote | Evidence label |
| --- | --- | --- | --- | --- |
| 2026-05-14 | https://momentum3d.slack.com/archives/C07E7MHK22C/p1778780878852059 | Dillon Mohr | 12 leads | claim with number (ads) |
| 2026-05-14 | p1778782161778889 | Dillon Mohr | "extremely successful considering he's an individual broker" | claim by Momentum |
| 2026-05-14 | p1778781240816319 | Dillon Mohr | "He said a lot of them are responsive" | relayed client confirmation |
| 2026-05-11 | p1778550345348219 | Dillon Mohr | $10.34 cost per lead | claim with number (ads) |

Testimonial candidates: none verbatim. Strongest line: "12 leads at $10.34 each, and the client said a lot of them were responsive" (p1778780878852059, p1778781240816319).

---

## Kimberly James Bridal (registry id kimberly-james-bridal)

Channel #kimberly-james-bridal (C0530MVK371). Client contact: Kim. Work: Google Ads, Meta ads, landing pages, site pages, some organic reporting.

| Date | Permalink | Author role | Short quote | Evidence label |
| --- | --- | --- | --- | --- |
| 2026-09-09 | https://momentum3d.slack.com/archives/C0530MVK371/p1788995509211339 | Dillon Mohr | organic Aug 30 to Sep 5: 37 clicks, 2,787 impressions | claim with numbers (organic) |
| 2026-09-02 | p1788360397580259 and p1788365924305829 | Dillon Mohr | "Meta has made a killing she has been in contact with a ton of brides"; "she's super happy overall" | relayed sentiment |
| 2026-07-13 | p1783981577041759 | Dillon Mohr | "Kim is very happy with the awareness we're generating and the continued value we're adding to her website. She was especially happy with the new Google Ads landing page." Same update: Google Ads $173.04 spend, 365 clicks, 0 tracked conversions | relayed sentiment; honest zero conversions |
| 2026-05-04 | p1777909515492999 | Dillon Mohr | April: "940 clicks, 51,796 impressions, 1.81% CTR, $605.31 spend, $0.65 average CPC"; "Kimberly loved both" new pages | claim with numbers (ads); relayed sentiment |
| 2026-04-20 | p1776710973341969 | Dillon Mohr | "she's very very happy"; "689 clicks at a $0.58 CPC (bridal average is $2 to $5)" | claim with numbers (ads); relayed sentiment |
| 2026-04-02 | p1775154525821539 | Dillon Mohr | "she wants to upgrade her package if you are down! She wants to do blogs with keyword intent. She is very very happy right now with us!" | upsell signal; relayed sentiment |
| 2026-03-15 | p1773609893224009 | Dillon Mohr | site audit delivered | artifact |

Testimonial candidates: none verbatim; "very very happy" is relayed three times (p1776710973341969, p1775154525821539, p1777909515492999).

Strongest line: "A bridal boutique ran Google Ads at $0.58 per click against a category average of $2 to $5 and asked to add SEO blogs on the strength of it" (p1776710973341969, p1775154525821539). Ads claim.

---

## Capsule and Tonic (not in registry/clients.json; channel name used)

Channel #capsule-and-tonic (C04MB3ZQ7FT). Record store. Client contact: Jeff. Work: Beth Kann (AM), Google Ads, GBP.

| Date | Permalink | Author role | Short quote | Evidence label |
| --- | --- | --- | --- | --- |
| 2026-08-24 | https://momentum3d.slack.com/archives/C04MB3ZQ7FT/p1787580414358149 | Beth Kann, AM | "we saw a 400% increase in conversions this week from 1 to 5 and an 82% decrease in cost per conversion to just $17.86" | claim with numbers (ads) |
| 2026-08-04 | p1785880666082099 | Beth Kann | July: "Spend: $455; Cost per Conversion: $15.18 (this is a major improvement from $31 CPC in June!); Phone Call Leads: 15 (huge improvement from 4 calls in June); Submit Form Fill Leads: 15 (also a nice improvement from 11 in June)" | claim with numbers (ads) |
| 2026-07-26 | p1785111626944439 | Beth Kann | "one earlier campaign lead returned in July and resulted in a purchase of approximately 100 records. Three additional calls last weekend resulted in approximately 80 records purchased." | client outcome with numbers, relayed |
| 2025-10-17 | p1760721651438559 | Beth Kann | meeting notes: eBay YTD sales $42,500 (about 25% growth YoY); "Phone Call (10/15): Purchased 100 records for $150" | client business figures; attribution to Momentum not established |

Testimonial candidates: none verbatim.

Strongest line: "After we restructured a record store's search campaign, cost per lead fell from $31 to $15.18 and calls went from 4 to 15 in a month, and the client traced about 180 records purchased back to campaign leads" (p1785880666082099, p1785111626944439). Ads claim with relayed client outcome.

---

## Hope Wellness Center (registry id hope-wellness-center)

Channel #hope-wellness-center (C092MVBN8SV). Client contact: Joseph. Work: John Belaska (AM), Sam Syed (Google Ads), website edits, GBP, video.

| Date | Permalink | Author role | Short quote | Evidence label |
| --- | --- | --- | --- | --- |
| 2026-09-10 | https://momentum3d.slack.com/archives/C092MVBN8SV/p1789057435129199 | John Belaska, AM | "Just met with Joseph. He is happy with the wbesite changes"; "While interactions were up from july, calls were down" (GBP August) | relayed sentiment; mixed GBP result, no figures |
| 2026-09-03 | p1788444247645019 | John Belaska | "This client is solid. We have a lot of projects we are working on from previous upsells." | retention signal |
| 2026-05-04 | p1777919896004229 | Sam Syed, ads | April monthly: "Phone Leads: 26 (+30.00%)" on $402.91 spend | claim with numbers (ads) |

Testimonial candidates: none verbatim. Strongest line: "Phone leads rose 30 percent to 26 in April on about $400 of spend" (p1777919896004229). Ads claim.

---

## Puttery NYC (registry id puttery-nyc)

Channel #puttery (C0BT1P1PGJF). Work: ads and reporting dashboard.

| Date | Permalink | Author role | Short quote | Evidence label |
| --- | --- | --- | --- | --- |
| 2026-09-10 | https://momentum3d.slack.com/archives/C0BT1P1PGJF/p1789073021437869 | Jesse DiLaura, sales | "Dillon you are a beast!!" | internal praise |

No ranking evidence. Testimonial candidates: none (internal). Strongest line: none for rankings.

---

## Nexla (registry id nexla)

Channel #nexla (C0BRY1H1L9W). Work: Google Ads audit and management, launch.

| Date | Permalink | Author role | Short quote | Evidence label |
| --- | --- | --- | --- | --- |
| 2026-09-03 | https://momentum3d.slack.com/archives/C0BRY1H1L9W/p1788483245194029 | Dillon Mohr | launch announcement | launch announcement |
| 2026-08-31 | p1788195195388849 | Dillon Mohr | "Google delivered $742.72 in spend and 210 clicks at a $3.54 average CPC, 40% lower than the category benchmark. Brand Exact led with a 21.06% click through rate." | claim with numbers (ads); shared report |

No ranking evidence. Testimonial candidates: none. Strongest line: none for rankings.

---

## Deborah Mara (registry id deborah-mara)

Channel #deborah-mara (C05UM2X3FQS). Realtor. Work: Beth Kann (AM), GBP posting, scope discussions.

| Date | Permalink | Author role | Short quote | Evidence label |
| --- | --- | --- | --- | --- |
| 2026-09-14 | https://momentum3d.slack.com/archives/C05UM2X3FQS/p1789406415455699 and p1789407685424659 | channel | scope discussion | scope, claim |
| 2026-09-10 | p1789002310621119 | channel | scope discussion | scope, claim |
| 2026-08-11 | p1786471004931549 | Beth Kann | "She's getting customers asking about how she's using AI or if their listings will be included in AI results." | demand signal, not a result |

No ranking evidence. Testimonial candidates: none. Strongest line: none.

---

## Bridge Software (registry id bridge-software)

Channel #bridge-software-development (C0BGWRK03B2). Client contact: Tori. Work: app development.

| Date | Permalink | Author role | Short quote | Evidence label |
| --- | --- | --- | --- | --- |
| 2026-09-10 | https://momentum3d.slack.com/archives/C0BGWRK03B2/p1789068479267789 | Melissa Rigby relaying Tori | "Baby my wallet is ready lets fkin goooo" | client excitement, relayed (informal) |
| 2026-09-03 | p1788491743844919 | Miraj | development update | not ranking evidence |

No ranking evidence. Testimonial candidate: the Tori quote above, informal and about product delivery, not search.

---

## Esquivel Bail Bonds (not in registry/clients.json; channel name used)

Channel #esquivel-bail-bonds (C09QWF575SS, archived 2026-06-01; engagement ended 2026-05-28).

| Date | Permalink | Author role | Short quote | Evidence label |
| --- | --- | --- | --- | --- |
| 2026-05-18 | https://momentum3d.slack.com/archives/C09QWF575SS/p1779127481901419 | channel | GBP suspension lifted | claim by Momentum (reinstatement) |
| 2026-01-08 | p1767891156037739 | Vijay, SEO | December 2025: "Total impressions: 401, Total Clicks: 21, Average CTR: 5.2 (Source: Google Search Console)"; "83 New Users (Source: Google Analytics)"; GMB asking for postal verification | claim with numbers (stated as GSC and GA figures) |

No AI Overview evidence. Testimonial candidates: none. Strongest line: none worth using (21 clicks in a month).

---

## NKCDC (registry id nkcdc)

Channel #nkcdc (C0AQB2TF1AB). Engagement paused; a proposal was posted 2026-07-27 (https://momentum3d.slack.com/archives/D0BJEC2MM6V/p1785181870016439, Cursor bot). No ranking evidence, no testimonial, no line.

## Green Slate Masonry (not in registry/clients.json; channel name used)

Channel #green-slate-masonry (C08UWCW6PCH). No ranking wins, screenshots, or client praise found in one channel page plus search. No line.

## Hardwood Artisan LLC (not in registry/clients.json; channel name used)

Channel #hardwood-artisan-llc (C0A7ZFGF2JU, archived 2026-05-13). No ranking wins or praise found. No line.

## Neat Tidy (not in registry/clients.json; channel name used)

Channel #neat-tidy (C0AMRUGGWTE, archived 2026-06-12). No ranking wins or praise found. No line.

## VA Claims Edge (registry id va-claims-edge)

Channel #va-claims (C0AU6GMGY73). No ranking wins or praise found. No line.

## Pritzker Law Group (registry id pritzker-law-group)

Channel #pritzker-law-group (C0BB04ZFZ26). No ranking wins or praise found. No line.

## GT Clinic (not in registry/clients.json; channel name used)

Channel #gt-clinic (C0C0RR57B25). Scope only (https://momentum3d.slack.com/archives/C0C0RR57B25/p1789407419991559, 2026-09-14). No results yet. No line.

## Omega Landscaping and Concrete (registry id omega-landscaping)

Channel #omega-landscape (C09DP3AMNQ7). Ads only in the period read (John Belaska on Facebook). No ranking wins found. No line.

## Fresh Blends / Kwik Trip (registry id fresh-blends-kwik-trip)

Channel #fresh-blends (C0A8XE76XGR). One internal note: Dillon 2026-09-02, "AEO + GEO maybe I have a bunch of evidence" (https://momentum3d.slack.com/archives/C0A8XE76XGR/p1788362270700199). That evidence is not in Slack; Lane D should look for it locally. No ranking wins in channel. No line.

## Zen Spa at Tropicana (registry id zen-spa-tropicana, inactive; channel #blissful-zen-spa)

Channel #blissful-zen-spa (C0B3HBCR8AZ, archived 2026-07-30). Content is a refund and cancellation dispute. History preserved only, per the brief. Not ranked, no line, do not use.

---

## Cross client and internal channel wins

None of the businesses below is on the registry channel list for this sweep. Each needs an owner to confirm it is a Momentum client and that the figures were reported to the client before any external use.

| Date | Permalink | Author role | Short quote | Evidence label |
| --- | --- | --- | --- | --- |
| 2026-06-18 | https://momentum3d.slack.com/archives/C1CFQBC79/p1781791528662479 (Mac's search p1781790874834969) | Melissa Silber, ops | needmomentum.com: "woo we're page 1 for me too, first organic result actually under AI overview" for "google grants partner agency" | claim by Momentum about its own site (position under an AI Overview) |
| 2025-02-28 | p1740769054540269 (#momentumsites) | Mac Frederick | needmomentum.com "#4 and first page for digital marketing agencies philadelphia" | claim by Momentum about its own site |
| 2026-06-02 | p1780419661922899 (#momentumsites) | intake bot | Mosser Legal case study intake: page 1 plus AI Overview citations for civil, business, family, personal injury and immigration appeal lawyer Philadelphia queries | claim by Momentum (intake form) |
| 2026-06-01 | p1780341719553829 (#momentumsites) | intake bot | Bedford Corporate Housing: 11 plus keywords in AI Overview or local pack, GSC clicks and WhatConverts leads cited | claim by Momentum (intake form) |
| 2026-01-12 | p1768246582164459 (#momentumsites) | intake bot | DDS: organic clicks +129% YoY, AI Visibility 35, 9 AI mentions, 15 cited pages | claim by Momentum (intake form) |
| 2026-06-30 | p1782826225743659 (#momentumsites) | intake bot | Sell My Jewelry case study intake | claim by Momentum (intake form) |
| 2026-01-28 | p1769638927000519 (#momentumsites) | intake bot | Sweetlife NYC case study intake | claim by Momentum (intake form) |
| 2026-08-04 | p1785881540396939 (#momentumsites) | intake bot | Penn Village case study intake | claim by Momentum (intake form) |
| 2026-06-16 | https://momentum3d.slack.com/archives/D0A6ECK6CSZ/p1781645411745589 (DM) | Dillon Mohr | "Vista River Hospice case study: 100% revenue growth, 5,761 keyword ranking improvements, and 801 AI citations" | claim by Momentum; supporting PDFs in #general (p1779827435297969, files F0B7506VC0Y and F0B5V7JHEBH) could not be read |
| 2026-08-10 | p1786457842571769 (#design-social-email) | channel | Mosser Legal case study sent | artifact |
| 2026-08-18 | p1787149707115309 (#design-social-email) | channel | Tristate case study | artifact |
| 2026-08-19 and 2026-09-14 | p1787234988251019 and p1789422629711529 (#design-social-email) | channel | Jade AEO case study sent, then live | artifact |
| 2026-09-14 | https://momentum3d.slack.com/archives/CNYCM0GAZ/p1789433297412979 (#skool-gbp-course) | Max | "When you search GBP or SEO we are in the top 10" | claim by Momentum, vague |
| 2026-09-15 | #360marketing, Jason Fallon, VP Sales | case study title "How Elite Doors Achieved 71.6% Top 3 Google Map Pack Visibility and Generated 631 Lead Actions" (permalink not captured) | see unverified leads |

Strongest cross client line, with its source: "Our own agency site ranks as the first organic result under the AI Overview for 'google grants partner agency'" (p1781791528662479). Self reported by staff from their own searches; a dated SERP capture would make it a measurement.

---

## Unverified leads

Claims worth chasing that do not carry a usable source, or whose source is incomplete.

1. Two unnamed clients with AI Overview results. Dillon to Jenny, DM, 2026-09-01, https://momentum3d.slack.com/archives/D0ALGRTE6CF/p1788287656379669: "the one now has 15 Google AI overview blogs. The other is up 230 times their search impression since I helped launch their newly designed website". Clients not named. Ask Dillon which two.
2. "multiple blogs right now ranking at number one and links to google AI overview". Dillon to Jason, DM, 2026-05-01, https://momentum3d.slack.com/archives/D0A6ECLQ0S1/p1777653719267879. No client named.
3. #general 2026-04-21, https://momentum3d.slack.com/archives/C066HKJ2E/p1776792601349439: an AI Overview appearance described as "three times in my career". No client or query named.
4. Bar Crawl USA Semrush crop of 2026-08-04 (file F0BMZML2GA2, #bar-crawl-usa): domain name not visible in the crop. Figures (AI Overview 29 mentions, 28 cited pages) match the barcrawlusa.com panel of 2026-06-10, but the domain must be confirmed before use.
5. Everyday Life Insurance comparison table of 2026-04-24 (file F0B0JRRRG3S): column headers not in the crop and the author said "Hold off on that" the same day (p1777047937191989). The 343 percent and 353 percent changes are unusable until the metric is identified.
6. Elite Doors case study title (#360marketing, Jason Fallon, 2026-09-15): 71.6 percent top 3 map pack visibility, 631 lead actions. Permalink not captured and the client is not on the registry list.
7. Vista River Hospice keyword ranking and AI prompt PDFs (#general, p1779827435297969): unreadable through the tool. Download from Slack manually or ask Jason for the source files.
8. Onsite Concrete & Landscape: Shehzad 2026-04-27 "It takes 3 to 6 months to see results in SEO" and Grace 2026-07-13 "Rankings are getting better", seen in concise reads, permalinks not captured (channel C087GM7SEJF, dates given).
9. Fagan Painting minor lead notes seen in concise reads without permalinks: Phil 2026-06-10 "3 organic leads today", 2026-06-15 "3 organic leads last week", Melissa Rigby 2026-05-20 "really good phone lead today from regent square", Dillon 2026-07-21 "$6000 estimate too today!", Mac 2026-06-22 "great email from him", and the client's 2026-09-15 "Please do not run the backlinks until this is fixed".
10. Bar Crawl USA: Mac 2026-04-01 "he gave us feedback on LPs" (concise read, no permalink); Andy's 2026-08-04 email with the "great job" wording lives in Gmail, not Slack (Lane C).
11. Revive Systems described as pro bono by Mac on 2026-06-11 (concise read, no permalink); matters for how the map pack claim is framed.
12. Everyday Life Insurance 2026-09-08 "GSC setting is already set to include in AI results" and the 2026-06-01 LLM rankings sheet (F0B7L0MBE12): not opened, permalinks not captured.
13. Fresh Blends: Dillon's 2026-09-02 note that he "may have a bunch of evidence" for AEO and GEO (p1788362270700199) points to files outside Slack.
14. Capsule and Tonic 2025-10-17 eBay figures ($42,500 YTD, about 25 percent growth) are the client's business numbers with no attribution to Momentum work.

---

## Row counts

See LANE-B-ROWS.csv in this folder. Counts by strength are printed at the end of the CSV build and repeated in the lane reply: 1 strong, 62 medium, 34 weak.

## Three strongest Slack backed client stories for the ranking and AI Overview pitch

1. Onsite Concrete & Landscape: Google SERP screenshots showing the client named first in, and cited under, the AI Overview for Vacaville landscaping queries (p1783881494044299, 2026-07-12; p1789414336360669, 2026-09-14), with first page organic positions for concrete queries (p1782142060026099). Momentum made screenshots; the client's September complaint about calls travels with it.
2. Bar Crawl USA: organic clicks up 160 percent on the prior 29 days after ten Halloween city guides were indexed, 2,356 clicks on 68,203 impressions with no paid support (p1789068545819079, p1789420450940369), plus a Semrush panel showing 50 AI Overview mentions for barcrawlusa.com (p1781135552767979). Momentum claim that Momentum says it checked inside Search Console.
3. Everyday Life Insurance: client relayed statements that organic search went from never reaching double digits to about 15 percent of sales (p1715709957370259), a sale the client attributed to SEO in June 2026 (p1780943176424769), and a Semrush trend from about 600 to 1.9K organic keywords over two years (p1785850122734849). Relayed and screenshot based.

The single client confirmed number in the sweep is Fagan Painting's written reply on Meta lead quality ($15,000 and $10,000 estimates, p1784917680531679). It is an ads result, and the same client's 2026-09-14 message (p1789391169626169) makes Fagan unusable for an SEO or AI Overview claim right now.
