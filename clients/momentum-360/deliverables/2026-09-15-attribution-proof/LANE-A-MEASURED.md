# Lane A, measured search performance (evidence sweep, 2026-09-15)

Read only sweep. Nothing was sent, posted, published or changed. Every number below is either **measured** (a Search Console or GA4 API response saved as raw JSON under `raw\`), **live verified** (a Google SERP observed on 2026-09-15 and saved under `raw\live-serp\`), or explicitly marked not measured. Nothing in this file is a Slack or email claim; those belong to the other lanes.

Companion row file: `LANE-A-ROWS.csv` (same folder). Raw pulls: `raw\gsc\<site>\<window>__<start>_<end>__dims-<dims>__type-web__final.json`, `raw\ga4\<property>\<report>__2025-08-01_2026-09-14.json`, `raw\live-serp\*.json`.

## Section 0. Access actually achieved

### Identity and route

- Route: gcloud Application Default Credential at `%APPDATA%\gcloud\application_default_credentials.json`, account dillonmohr8777@gmail.com, Cloud project 150963436905 (`momentum-360-489301`), scopes used `webmasters.readonly` and `analytics.readonly`, loaded in process with google-auth from the GoogleAdsProbe venv. No token was printed or written.
- `GET https://searchconsole.googleapis.com/webmasters/v3/sites` returned HTTP 200 with 11 site entries (`raw\gsc\_sites_list.json`).
- `GET https://analyticsadmin.googleapis.com/v1beta/accountSummaries` returned HTTP 200 with 11 accounts and 14 properties (`raw\ga4\_accountSummaries.json`).
- Every Search Console pull used `searchAnalytics.query` with `type=web`, `dataState=final`, end date 2026-09-12 (final data lags about three days). 123 response files were written; `raw\gsc\_pull_index.json` lists each file and its row count.

### Search Console properties on this identity

| Property | Permission | Client id | Data present from | Readable |
|---|---|---|---|---|
| sc-domain:barcrawlusa.com | siteFullUser | bar-crawl-usa | 2025-05-13 (full 16 months, 488 days) | yes |
| https://bigorange.marketing/ | siteFullUser | bigorange-marketing | 2025-05-13 (full 16 months, 488 days) | yes |
| https://www.alignhcm.com/ | siteOwner | align-hcm | 2026-07-27 (48 days) | yes |
| sc-domain:shadow-heating.com | siteOwner | shadow-heating-cooling | 2026-07-13 (62 days) | yes |
| https://www.zenspatropicana.com/ | siteOwner | zen-spa-tropicana (inactive since 2026-07-16) | 2026-06-20 (85 days) | yes |
| sc-domain:ami-cleaning.com | siteOwner | ami-cleaning (inactive) | 2026-07-02 (73 days) | yes |
| https://revive-systems.com/ | siteUnverifiedUser | revive-systems | none | no, HTTP 403 |
| sc-domain:revive-systems.com | siteUnverifiedUser | revive-systems | none | no, HTTP 403 |
| sc-domain:momentumvirtualtours.com | siteUnverifiedUser | momentum-360 (own) | none | no, HTTP 403 |
| https://ironicineptocracy.com/ | siteOwner | not a client (Dillon's own) | 2026-04-11 | yes, excluded |
| sc-domain:immohrtalmarketing.com | siteOwner | not a client (Dillon's own) | 2026-08-25 | yes, excluded |

Exact 403 text (from `raw\gsc\sc-domain_revive-systems.com\full16__2025-05-13_2026-09-12__dims-date__type-web__final.json` and the two sibling folders): `{"error": {"code": 403, "message": "User does not have sufficient permission for site 'sc-domain:revive-systems.com'. See also: https://support.google...`. The same message, with the respective site URL, was returned for `https://revive-systems.com/` and `sc-domain:momentumvirtualtours.com`.

Only two properties carry the 16 month history that a before and after comparison needs: **barcrawlusa.com** and **bigorange.marketing**. Every other readable property was added to this identity in June to August 2026, so Search Console history for them starts then and no year over year comparison is possible from this identity.

### GA4 properties on this identity (Data API v1beta `runReport`, 2025-08-01 to 2026-09-14, monthly by default channel group)

| Property | Account and name | Client id | Rows |
|---|---|---|---|
| 360663315 | Bar Crawl USA > barcrawlusa.com GA4 (MonsterInsights) | bar-crawl-usa | 136 |
| 390008448 | Bar Crawl USA > uglysweaterbarcrawls.com | bar-crawl-usa | 46 |
| 320235048 | Align HCM > Align HCM GA4 | align-hcm | 50 |
| 299086253 | BigOrange Marketing > BigOrange Marketing GA4 | bigorange-marketing | 114 |
| 352113918 | BigOrange Marketing > Clutch | bigorange-marketing | 0 (empty property) |
| 347294023 | Nexla > Nexla Main Website GA4 | nexla | 175 |
| 276233773 | Drive Shack > Puttery GA4 | puttery-nyc | 160 |
| 486650928 | Replenish > getreplenish.com | replenish-7-eleven | 81 |
| 544090354 | AMI Commercial Cleaning > AMI Website GA4 | ami-cleaning (inactive) | 12 |
| 425431390, 515687285, 544804947 | DataStrike, LinkEZE, Look Alive | not in the client registry, excluded | 153, 89, 22 |
| 532537300, 551783374 | Ironic Ineptocracy, IMMOHRTAL | Dillon's own, excluded | 10, 2 |

All 14 `runReport` calls returned HTTP 200. Nexla, Puttery and Replenish have GA4 but no Search Console property on this identity, so for them organic sessions are measured but rankings are not.

### Third party and live tools

- **OpenRush** (`mcp__abeef63e...`): `describe_capabilities` worked (0 credits) and reported costs of inspect_domain 9, inspect_search_visibility 10, inspect_keyword 5, inspect_serp 2, inspect_ai_visibility 20, discover_ai_citations 22. Every credited call failed with the same error. Exact text for the three tools tried: `openrush /v1/tools/inspect_domain returned 402: Insufficient credits. Refill at https://www.openrush.com/dashboard/billing`, `openrush /v1/tools/inspect_ai_visibility returned 402: Insufficient credits. Refill at https://www.openrush.com/dashboard/billing`, `openrush /v1/tools/inspect_serp returned 402: Insufficient credits. Refill at https://www.openrush.com/dashboard/billing`. Because the 2 credit tool failed, discover_ai_citations, inspect_search_visibility and inspect_keyword were not attempted. Nothing from OpenRush is in this file.
- **Abency / OpenRush owned data wrappers**: not retried, per the lead's note that they return no connection.
- **Live Google SERPs**: the Claude Code built in browser reached Google web search and rendered AI Overviews. 14 checks were run and saved verbatim in `raw\live-serp\live-serp-batch1__2026-09-15.json` (6 checks, collapsed AI Overview) and `raw\live-serp\live-serp-batch2__2026-09-15.json` (8 checks, "Show more" expanded). Caveat recorded in both files: the browser session is signed in to a Google account (Google rendered Search Console oneboxes for barcrawlusa.com and bigorange.marketing, which only happens for accounts with access to those properties), so results can be personalised even with `pws=0`. Each check is one observation on one day.
- **Playwright (separate headless profile, signed out)**: reached the same Google SERP for "taco and tequila bar crawl" with no account signed in (page header shows "Sign in", `signed_in_hint` false). The AI Overview rendered and its text carries the source label "Bar Crawl USA" twice. Playwright could not resolve which URLs were cited because Google wrapped every link in a `google.com/goto` redirect in that profile, so the signed out check confirms the AI Overview and the labelled source, not the exact URL. The full page screenshot shows the "Bar Crawl USA" chip inside the AI Overview, barcrawlusa.com as organic result 2 (`barcrawlusa.com › taco-tequila-crawl`), a "Sign in" button in the header, and the footer "15229, Pennsylvania, from your IP address", so that observation is signed out and geolocated to Pittsburgh. Files: `raw\live-serp\playwright__taco-and-tequila-bar-crawl__2026-09-15.json` and the full page screenshot `raw\live-serp\playwright__taco-and-tequila-bar-crawl__2026-09-15.png`.

### Client domain resolution

Resolved from registry email domains or CLIENT.md bodies: faganpainting.com (fagan-painting), onsiteconcretelandscape.com (onsite-concrete-landscape), soldbymara.com plus staging deborah.azldigital.com (deborah-mara), puttery.com (puttery-nyc), shadow-heating.com (shadow-heating-cooling), thehopewellnesscenter.com (hope-wellness-center). Not resolved: pro-fence-deck (CLIENT.md states the website is unverified), bridge-software (no domain in CLIENT.md or the vault folder), Green Slate Masonry (no registry record; only mentioned in Slack and Gmail capture notes), Everyday Life Insurance and Capsule and Tonic (vault folders hold an overview.md with no domain). None of the resolved domains outside the table above has a Search Console or GA4 property on this identity, so nothing was measured for them.

## Section 1. Bar Crawl USA (bar-crawl-usa)

Property: `sc-domain:barcrawlusa.com` (siteFullUser). GA4 properties 360663315 (barcrawlusa.com) and 390008448 (uglysweaterbarcrawls.com). This is the only client with full 16 month Search Console history and a measured before and after.

### Monthly Search Console series (measured, GSC, `raw\gsc\sc-domain_barcrawlusa.com\full16__2025-05-13_2026-09-12__dims-date__type-web__final.json`)

| Month | Clicks | Impressions | CTR | Avg position |
|---|---|---|---|---|
| 2025-05 (from the 13th) | 569 | 28,224 | 2.0% | 21.7 |
| 2025-06 | 1,069 | 48,455 | 2.2% | 18.5 |
| 2025-07 | 760 | 48,782 | 1.6% | 19.3 |
| 2025-08 | 1,254 | 52,666 | 2.4% | 18.6 |
| 2025-09 | 1,504 | 49,282 | 3.1% | 12.6 |
| 2025-10 | 7,507 | 154,840 | 4.9% | 6.1 |
| 2025-11 | 1,856 | 59,173 | 3.1% | 9.8 |
| 2025-12 | 3,534 | 94,242 | 3.8% | 9.5 |
| 2026-01 | 906 | 68,812 | 1.3% | 12.3 |
| 2026-02 | 1,796 | 82,933 | 2.2% | 10.8 |
| 2026-03 | 5,601 | 131,241 | 4.3% | 7.2 |
| 2026-04 | 4,069 | 83,047 | 4.9% | 8.6 |
| 2026-05 | 1,615 | 69,032 | 2.3% | 11.1 |
| 2026-06 | 989 | 60,556 | 1.6% | 11.3 |
| 2026-07 | 749 | 60,452 | 1.2% | 12.4 |
| 2026-08 | 2,300 | 70,567 | 3.3% | 12.0 |
| 2026-09 (to the 12th) | 832 | 28,625 | 2.9% | 8.7 |

The business is seasonal (Halloween in October, St. Patrick's Day in March), so the honest comparison is same month year over year, not consecutive months.

### Before and after (measured, GSC)

- August 2025 vs August 2026: clicks 1,254 to 2,300 (+83.4%), impressions 52,666 to 70,567 (+34.0%), average position 18.6 to 12.0, CTR 2.4% to 3.3%. Sources: `aug2025__2025-08-01_2025-08-31__dims-none__type-web__final.json` and `aug2026__2026-08-01_2026-08-31__dims-none__type-web__final.json`.
- First eight months (2025-05-13 to 2026-01-12) vs last eight months (2026-01-13 to 2026-09-12): clicks 18,401 to 18,509 (flat), impressions 560,317 to 630,612 (+12.5%), average position 12.0 to 10.2. Sources: `winA__...dims-none` and `winB__...dims-none`.
- Last 28 days (2026-08-16 to 2026-09-12): 2,501 clicks, 67,474 impressions, CTR 3.7%, average position 10.3.

### Strong position queries, unbranded (measured, GSC, window 2026-01-13 to 2026-09-12, `winB__...dims-query`)

| Query | Avg position | Impressions | Clicks | Last 28 days position |
|---|---|---|---|---|
| taco and tequila bar crawl | 2.16 | 733 | 181 | 1.62 |
| bar crawl asheville nc | 2.61 | 415 | 26 | 2.04 |
| taco bar crawl | 2.59 | 273 | 48 | not in last 28 days |
| roswell st patrick's bar crawl | 1.02 | 181 | 55 | seasonal, not in last 28 days |
| lakewood st patty's bar crawl | 1.32 | 177 | 40 | seasonal |
| lakewood bar crawl st patrick's day | 1.14 | 156 | 59 | seasonal |
| taco and tequila crawl chattanooga | 1.10 | 160 | 29 | seasonal |
| taco crawl lawrenceville ga | 1.01 | 137 | 52 | seasonal |
| tequila crawl | 1.91 | 140 | 16 | seasonal |
| lawrenceville brunch crawl | 1.26 | 90 | 56 | 1.25 (89 impressions, 55 clicks) |
| pub crawl challenges | 2.42 | 476 | 0 | 1.54 (150 impressions, 0 clicks) |
| bar crawl bingo ideas | 1.86 | 545 | 3 | 1.02 (59 impressions, 1 click) |

Brand query `barcrawlusa`: position 1.0, 922 impressions, 561 clicks (navigational, not proof of SEO work). 68 unbranded and branded queries met the position 3.0 or better with 50 or more impressions threshold in the window.

### Queries that improved by five or more positions (measured, GSC)

First eight months vs last eight months (`winA` vs `winB`, query dimension, 97 qualifying queries):

| Query | Position before | Position after | Impressions after | Clicks before to after |
|---|---|---|---|---|
| bar hopping | 15.2 | 4.5 | 3,876 | 1 to 5 |
| bar crawl asheville nc | 12.1 | 2.6 | 415 | 7 to 26 |
| bar crawl columbus ohio | 10.7 | 5.7 | 579 | 3 to 11 |
| taco and tequila cleveland | 22.1 | 7.5 | 569 | 0 to 3 |
| party bus bar crawl | 28.9 | 14.7 | 515 | 1 to 6 |
| birmingham pub crawl | 17.4 | 6.7 | 372 | 10 to 6 |
| bar crawl definition | 18.5 | 5.7 | 618 | 0 to 0 |
| pub crawl near me | 19.4 | 13.7 | 751 | 8 to 6 |

August 2025 vs August 2026 (19 qualifying queries): bar crawl meaning 47.7 to 9.4 (1,091 impressions in Aug 2026), bar hopping 34.4 to 8.7, bar crawl bingo 12.4 to 7.1, bar crawl bingo ideas 18.0 to 1.0, shamrock crawl 57.0 to 10.4, bar crawl columbus ohio 20.8 to 6.4.

Top pages in the last eight months by clicks: `/` 1,227; `/bar-crawls-atlanta/` 676 (64,090 impressions, position 9.6); `/taco-tequila-crawl/` 641; `/soulard-bar-crawls/` 608; `/cleveland-bar-crawls/` 516; `/columbia-bar-crawls/` 506.

### GA4 organic trend (measured, GA4 property 360663315, `raw\ga4\360663315\yearMonth+channel__2025-08-01_2026-09-14.json`)

Organic Search sessions by month: Aug 2025 1,904; Sep 2,201; Oct 10,932; Nov 3,555; Dec 6,041; Jan 2026 1,190; Feb 2,543; Mar 8,174; Apr 7,050; May 2,740; Jun 1,325; Jul 1,017; Aug 2026 3,771; Sep (to the 14th) 1,395. August 2025 to August 2026: 1,904 to 3,771 (+98.1%). Thirteen full months total 52,443 organic sessions. Top organic landing pages 2026 to date: `/` 3,160; `/crawl-maps/` 1,696; `/bar-crawls-atlanta/` 794. The second property (uglysweaterbarcrawls.com) is a seasonal microsite: 488 organic sessions in Nov 2025, single digits most other months.

### AI Overview findings (live verified, Google SERP, 2026-09-15, signed in session)

| Query | AI Overview shown | barcrawlusa.com cited in it | Live organic rank | GSC last 28 days position |
|---|---|---|---|---|
| taco and tequila bar crawl | yes | **yes**, three URLs: `/taco-tequila-crawl/`, `/how-to-master-the-taco-tequila-bar-crawl/`, `/how-to-be-a-taco-tequila-bar-crawl-expert-2/`; the overview text shows "Bar Crawl USA" as the source label three times | 2 | 1.62 |
| lawrenceville brunch crawl | yes | **yes**, `/event/the-brunch-crawl-lawrenceville/`; the overview text reads "Organized by Bar Crawl USA" | 1 | 1.25 |
| bar crawl asheville nc | no ("Can't generate an AI overview right now") | n/a | 1 | 2.04 |
| pub crawl challenges | yes (expanded) | no | not on page 1 | 1.54 |
| bar crawl bingo ideas | no ("Can't generate an AI overview right now") | n/a | 7 | 1.02 |

A second, signed out observation of "taco and tequila bar crawl" through Playwright at 21:28 UTC also rendered the AI Overview with "Bar Crawl USA" as the labelled source (Section 0, Playwright bullet).

The last two rows matter for interpretation: Search Console reports position 1.0 to 1.5 with almost no clicks for queries where the live classic ranking was 7 or absent. That pattern is what Search Console produces when the impressions come from an AI surface (see Section 6), so those "position 1" rows should not be presented as classic number one rankings.

### Strongest provable line

"Bar Crawl USA's organic Google clicks rose 83 percent year over year, from 1,254 in August 2025 to 2,300 in August 2026, average position improved from 18.6 to 12.0, and GA4 organic sessions nearly doubled from 1,904 to 3,771; as of 15 September 2026 barcrawlusa.com is cited inside Google's live AI Overview for 'taco and tequila bar crawl' and ranks number one for 'bar crawl asheville nc'." (Sources: Search Console property sc-domain:barcrawlusa.com; GA4 property 360663315; `raw\live-serp\live-serp-batch1__2026-09-15.json`.)

Caveat for the salesperson: this lane measured the outcome, not the cause. The Bar Crawl USA CLIENT.md contains no engagement start date or SEO scope, so whether Momentum's work produced this trend must come from Lane B or C evidence before the line is used as attribution.

## Section 2. Align HCM (align-hcm)

Property: `https://www.alignhcm.com/` (siteOwner). GA4 property 320235048. Search Console history on this identity starts 2026-07-27, so there is no before and after; everything below is a snapshot.

Relationship caveat (not this lane's call, but it must be flagged): the registry lists align-hcm as active, while the access ledger records that Dillon left Align on 2026-09-02 and still holds siteOwner, and `pull_client_metrics.py` labels Align "ENDED 2026-09-02, not a client". Dillon should decide how Align is described before any of this goes into a sales asset.

### Snapshot (measured, GSC)

- August 2026: 347 clicks, 62,700 impressions, CTR 0.55%, average position 16.4. July (from the 27th): 89 clicks, 10,827 impressions. September to the 12th: 117 clicks, 20,690 impressions.
- Last 28 days (2026-08-16 to 2026-09-12): 274 clicks, 53,038 impressions, average position 16.2.
- Top pages (2026-07-27 to 2026-09-12): `/` 212 clicks; `/careers` 111; `/partners/ukg` 18 clicks on 7,309 impressions; `/blog/the-strategic-buyers-guide-to-ukg` 12 clicks on 9,254 impressions at position 9.3; `/blog/hris-hcm-implementation-checklist` 15 clicks on 3,337 impressions.

### Strong position queries (measured, GSC, 2026-07-27 to 2026-09-12)

| Query | Avg position | Impressions | Clicks | Last 28 days position |
|---|---|---|---|---|
| ukg pro implementation partner | 1.49 | 146 | 0 | 1.30 (82 impressions) |
| how long to implement ukg? | 2.66 | 111 | 0 | 2.29 (56) |
| what are the hidden costs of implementing hcm software? | 1.92 | 53 | 0 | 1.41 (39) |
| best firms offering client-side hcm implementation support | 1.39 | 44 | 0 | 1.38 (39) |
| what should an hris implementation checklist include | (last 28 days only) | 36 | 0 | 1.33 |
| how internal champions justify vendor selection | (last 28 days only) | 36 | 0 | 3.00 |
| align hcm (brand) | 1.48 | 319 | 190 | 1.51 |

Every unbranded query above has zero clicks despite position 1 to 3. 1,066 of the 3,343 queries in the window are 60 characters or longer, prompt style questions (for example "dayforce consulting partners known for responsive support and quick issue resolution with integrations that fit", 239 impressions, position 3.2, and a family of "i am a chief human resources officer. my job seniority is at the executive, vp, director, or manager level..." prompts). Together they carry 9,325 impressions and 0 clicks and resolve mostly to `/blog/the-strategic-buyers-guide-to-ukg`, `/blog/5-critical-mistakes-to-avoid-during-hcm-implementation` and `/dayforce-implementation`. Search Console does not say which surface produced them; the shape is consistent with AI answer surfaces or with synthetic monitoring prompts, and this file does not claim either.

### GA4 organic trend (measured, GA4 property 320235048)

Organic Search sessions: Aug 2025 435; Sep 556; Oct 707; Nov 535; Dec 475; Jan 2026 59; Feb 0; Mar to May no rows; Jun 0; Jul 12; Aug 2026 196; Sep (to the 14th) 78. August 2025 to August 2026 is 435 to 196, a 54.9 percent decline, but the property recorded essentially nothing from February to July 2026, which is a collection gap (tag removed, site rebuilt or property switched), not a traffic reading. Do not use the Align GA4 series for any claim until that gap is explained.

### AI Overview findings (live verified, Google SERP, 2026-09-15, signed in session)

| Query | AI Overview shown | alignhcm.com cited in it | Live organic rank |
|---|---|---|---|
| ukg pro implementation partner | yes | **yes**, `https://www.alignhcm.com/partners/ukg` (plus the UKG Marketplace listing for Align HCM); overview text: "Align HCM: Specializes exclusively in UKG project planning, implementations, integrations, and ongoing optimization." | 3 |
| what are the hidden costs of implementing hcm software | yes | **yes**, `https://www.alignhcm.com/blog/the-hidden-price-tag-why-diy-hcm-implementation-costs-more-than-you-think` | 2 |
| best firms offering client-side hcm implementation support | yes (expanded) | **yes**, `https://www.alignhcm.com/services/client-side-services`; overview text: "Top firms offering independent, client-side Human Capital Management (HCM) implementation support include HRchitect, Align HCM, and Ascend." | 4 |
| how long to implement ukg | yes (expanded) | no | not on page 1 |

### Strongest provable line

"As of 15 September 2026, alignhcm.com is cited as a source inside Google's live AI Overview for 'ukg pro implementation partner', 'what are the hidden costs of implementing hcm software' and 'best firms offering client-side hcm implementation support', and Google Search Console shows the site at average position 1.3 for 'ukg pro implementation partner' over the last 28 days." (Sources: `raw\live-serp\live-serp-batch1__2026-09-15.json`, `raw\live-serp\live-serp-batch2__2026-09-15.json`, `raw\gsc\https_www.alignhcm.com\last28__2026-08-16_2026-09-12__dims-query__type-web__final.json`.) No traffic growth claim is supportable for Align from this identity.

## Section 3. BigOrange Marketing (bigorange-marketing)

Property: `https://bigorange.marketing/` (siteFullUser), full 16 months. GA4 property 299086253. CLIENT.md scope: capability showcase, SEO, AEO, GEO and design support, account work read only.

### Before and after (measured, GSC)

- August 2025 vs August 2026: clicks 610 to 313 (a 48.7 percent decline), impressions 377,882 to 215,082 (a 43.1 percent decline), average position 38.7 to 26.8.
- First eight months vs last eight months: clicks 4,768 to 3,450, impressions 2,322,227 to 1,878,847, average position 32.2 to 22.4.
- Monthly clicks ran 420 to 773 through January 2026 and 313 to 445 from April to August 2026. Last 28 days: 288 clicks, 212,295 impressions, average position 24.5.

Average position improved while clicks fell. The improvement is concentrated in large impression, zero click rows, so it is not a traffic result.

### Strong position queries (measured, GSC, 2026-01-13 to 2026-09-12)

Unbranded queries at position 3.0 or better with 50 or more impressions: 114. The largest all have zero or one click: brand strategy agency (1.03, 1,186 impressions, 0 clicks), experiential marketing agency (1.01, 833, 0), branding agency (1.09, 573, 0), internet marketing service in cincinnati (1.00, 499, 0), social media marketing agency (1.65, 497, 1), content marketing (1.10, 384, 0), marketing strategy (1.05, 370, 0), best digital marketing agency in cincinnati (2.64, 329, 0), marketing consultant (1.27, 299, 0). Last 28 days: home builder marketing agency (1.84, 5,857 impressions, 1 click), "where can i find expert help for ai driven search visibility?" (2.57, 5,576, 0), marketing agency for home builders (2.81, 610, 0).

1,814 of 21,846 queries in the window are prompt style questions of 60 characters or more, carrying 40,008 impressions and 1 click; the largest single one, "where can i find expert help for ai driven search visibility?", has 12,673 impressions at position 3.25 and resolves to `/ai-search-optimization-services/`.

Position improvements of five or more places, first eight months to last eight months (752 qualifying queries, none of which produced more than a handful of clicks): builders marketing 47.3 to 11.1 (8,168 impressions), marketing agencies for builders 19.0 to 5.6, ai search optimization services 59.2 to 22.8, landscaping marketing 76.8 to 22.3, digital marketing agency for manufacturers 56.7 to 25.1. Year over year: digital marketing agency for manufacturers 82.6 to 13.8, manufacturing marketing agency 67.1 to 29.0, builders marketing 34.3 to 10.9.

Top pages by clicks in the last eight months: `/` 1,169; the StoryBrand examples post 999; `/b2b-social-media-holidays-for-2026/` 122; `/careers/` 108; `/marketing-agency-for-builders/` 45 clicks on 163,294 impressions at position 21.2.

### GA4 organic trend (measured, GA4 property 299086253)

Organic Search sessions: Aug 2025 900; Sep 890; Oct 988; Nov 904; Dec 886; Jan 2026 1,219; Feb 843; Mar 669; Apr 549; May 635; Jun 791; Jul 811; Aug 2026 586. August to August: 900 to 586, a 34.9 percent decline. The property records zero key events, so no conversion reading exists.

### AI Overview findings (live verified, 2026-09-15, signed in session)

| Query | AI Overview shown | bigorange.marketing cited | Live organic rank | GSC last 28 days position |
|---|---|---|---|---|
| home builder marketing agency | no | n/a | 4 | 1.84 |
| marketing agency for home builders | yes (expanded) | no | 3 | 2.81 |
| brand strategy agency | yes (expanded) | no | not on page 1 | 1.00 |

### Strongest provable line

"For BigOrange Marketing, Google Search Console shows average position improving from 38.7 in August 2025 to 26.8 in August 2026 and 'builders marketing' moving from position 47 to 11 across the two eight month windows, and the site ranks third live for 'marketing agency for home builders'." Use with care: clicks fell 49 percent and GA4 organic sessions fell 35 percent over the same year, and no live AI Overview citation was found, so this account is a rankings story, not a traffic or AI Overview story.

## Section 4. Other properties with measured data

### Shadow Heating and Cooling (shadow-heating-cooling)

`sc-domain:shadow-heating.com`, siteOwner, data from 2026-07-13. Window 2026-01-13 to 2026-09-12 (effectively two months): 5 clicks, 331 impressions, average position 18.2. August 2026: 4 clicks, 166 impressions, position 17.1. No query reached position 3 with 30 or more impressions. Top page `/` at position 9.3 on 239 impressions. No GA4 property on this identity. Verdict: a baseline exists, nothing is provable yet. Strongest honest line: "Search Console was connected in July 2026 and shows the site indexed and receiving impressions; growth cannot be measured until at least two more months accumulate."

### Zen Spa at Tropicana (zen-spa-tropicana, inactive since 2026-07-16 by Dillon's direction)

`https://www.zenspatropicana.com/`, siteOwner, data from 2026-06-20. August 2026: 473 clicks, 3,796 impressions, CTR 12.5%, position 9.2; 1,040 clicks in the window. Every strong query is brand navigational (zen spa tropicana atlantic city 1.42, 353 impressions, 127 clicks; tropicana spa atlantic city 2.07 in the last 28 days). Not usable as SEO proof and the client is inactive.

### AMI Cleaning (ami-cleaning, inactive)

`sc-domain:ami-cleaning.com`, siteOwner, data from 2026-07-02. Window total 47 clicks, 8,406 impressions, average position 44.0. Only "ami cleaning" (brand) is at position 2.5. GA4 544090354 shows 27 organic sessions in July 2026 and 17 in August. Not usable.

### Revive Systems (revive-systems)

Both Search Console properties are listed at siteUnverifiedUser and return HTTP 403 on query. Not measured. To measure: verify site ownership or have the property owner grant dillonmohr8777@gmail.com full or restricted user access.

### Nexla (nexla), GA4 only

GA4 property 347294023 Organic Search sessions: Aug 2025 6,101; Sep 6,953; Oct 6,461; Nov 6,487; Dec 5,635; Jan 2026 6,437; Feb 5,919; Mar 5,946; Apr 5,236; May 4,239; Jun 3,473; Jul 2,873; Aug 2026 2,055. August to August is a 66.3 percent decline; thirteen full months total 67,815 sessions. Top organic landing pages 2026 to date: `/` 6,030; `/jobs/` 1,982; `/ai-infrastructure/vector-databases/` 1,404; `/ai-readiness/ai-data-collection/` 1,237. No Search Console property on this identity. This is a measured decline, not a proof point; it should be raised with the client, not pitched.

### Puttery NYC (puttery-nyc), GA4 only

GA4 property 276233773 (the national Puttery property, not NYC only) Organic Search sessions: Aug 2025 116,482 to Aug 2026 74,670, a 35.9 percent decline; 2026 to date top organic landing pages are `/locations/dallas/` 96,587 and `/locations/charlotte/` 73,007, with `/locations/new-york-city/` at 49,778. CLIENT.md scope is reservation attribution and reporting readiness, not SEO. No Search Console property. Not a proof point.

### Replenish / 7-Eleven (replenish-7-eleven), GA4 only

GA4 property 486650928 Organic Search sessions: Aug 2025 124 to Aug 2026 80 (a 35.5 percent decline), peak 257 in May 2026. Too small and declining. Not a proof point.

## Section 5. Clients with nothing measured

No Search Console or GA4 property exists on the ADC identity for: kimberly-james-bridal (kimberlyjamesbridal.com), omega-landscaping (omegalandscapingandconcrete.com), hope-wellness-center (thehopewellnesscenter.com), va-claims-edge (vaclaimsedge.com), nkcdc (nkcdc.org), pritzker-law-group (pritzkerlg.com), tags-2-go (tags2go.pro), bercos-popcorn (bercospopcorn.com), cindy-may-christmas (cindymaychristmas.com), fresh-blends-kwik-trip (freshblends.com), fagan-painting (faganpainting.com), onsite-concrete-landscape (onsiteconcretelandscape.com), deborah-mara (soldbymara.com), pro-fence-deck (domain unverified), bridge-software (domain not resolved), and the three names without a registry record (Green Slate Masonry, Everyday Life Insurance, Capsule and Tonic; domains not resolved). Status for all: not measured. What would measure them: the property owner adds dillonmohr8777@gmail.com as a user in Search Console and GA4 (read access is enough), after which the same scripts run unchanged; or OpenRush credits are refilled and `inspect_search_visibility` (10 credits) and `inspect_ai_visibility` (20 credits) are run per domain, which gives third party positions but not owned data.

## Section 6. AI Overview verdict

### Substantiated today, with a source

1. **barcrawlusa.com is cited inside live Google AI Overviews** for "taco and tequila bar crawl" (three barcrawlusa.com URLs listed as sources, the overview text credits "Bar Crawl USA" three times) and for "lawrenceville brunch crawl" (event page cited, overview text says "Organized by Bar Crawl USA"). Source: `raw\live-serp\live-serp-batch1__2026-09-15.json` and `live-serp-batch2__2026-09-15.json`, checked 2026-09-15 21:14 to 21:19 UTC. The taco and tequila result was reproduced signed out through Playwright at 21:28 UTC (`raw\live-serp\playwright__taco-and-tequila-bar-crawl__2026-09-15.json` and `.png`): AI Overview present, "Bar Crawl USA" labelled as the source, cited URLs not extractable in that profile.
2. **alignhcm.com is cited inside live Google AI Overviews** for "ukg pro implementation partner", "what are the hidden costs of implementing hcm software" and "best firms offering client-side hcm implementation support", and the overview text names Align HCM in two of them. Same source files.
3. The Search Console rows for those same queries show position 1.3 to 2.4 with zero clicks, which is the signature Search Console produces when impressions come from an AI Overview (all links in an AI Overview share the position of the overview block and clicks are rare). Sources: `raw\gsc\https_www.alignhcm.com\last28__...dims-query...json`, `raw\gsc\sc-domain_barcrawlusa.com\last28__...dims-query...json`. Google's own documentation, captured verbatim in `raw\live-serp\gsc-help-ai-features__2026-09-15.json` from https://support.google.com/webmasters/answer/7042828 on 2026-09-15, states: "An AI Overview occupies a single position in search results, and all links in the AI Overview are assigned that same position." and "Clicking a link to an external page in the AI Overview counts as a click." That is why an AI Overview citation shows up in Search Console as a position 1 to 3 row with few or no clicks, and why a Search Console "position 1" cannot be quoted as a classic number one ranking without a live check.

That is two client domains, five queries, one day, one signed in observation each. It supports the sentence "clients of ours are cited in Google AI Overviews today" for Bar Crawl USA and Align HCM. It does not support "a multitude", and it does not by itself show that Momentum's work caused the citations.

### Not substantiated

- **bigorange.marketing**: three live checks, no AI Overview citation, despite Search Console showing position 1 rows with thousands of zero click impressions. Those rows are consistent with AI surface impressions but were not confirmed live.
- **Every other client**: no property access and no live check, so nothing can be said either way.
- **Causation**: this lane has no engagement dates or scope for Bar Crawl USA, and the Align relationship needs Dillon's framing. Attribution is Lane B and Lane C's evidence.
- **Persistence and reach**: AI Overviews vary by user, location and day. A single signed in observation is not a share of citations figure.

### Exactly what would substantiate the rest

- Refill OpenRush credits and run `inspect_ai_visibility` (20 credits per domain, solo call returns `sample_answers`, the real questions where the domain is cited) for barcrawlusa.com, alignhcm.com and bigorange.marketing, then `discover_ai_citations` (22 credits) with `topic` set to "bar crawl events", "ukg implementation partner" and "marketing agency for home builders" to get the category citation map. That converts today's five spot checks into a sampled corpus measurement.
- Repeat the live checks signed out on three separate days. The Playwright route in `raw\live-serp\playwright__*` is the signed out path and already renders AI Overviews; its extractor needs the `google.com/goto` redirect links unwrapped before it can record cited URLs. Keep the JSON and PNG per check.
- For every other client, obtain Search Console read access and rerun `gsc_pull.py`; the prompt style query share and the zero click position 1 rows will show immediately whether AI surfaces are exposing them.
- Ask Lane B for the Bar Crawl USA engagement start date and the pages Momentum built or rewrote, then join to the `winB__...dims-page` file to show that the cited and improved URLs are Momentum's pages.

## Section 7. Unverified leads

- Bar Crawl USA `/bar-crawl-bingo/` and `/the-best-halloween-cocktails-you-can-make-at-home/` carry position 1 to 2 rows with hundreds of impressions and zero clicks (for example "what are some easy cocktails to prepare for halloween pregaming?", 345 impressions, position 1.9). Likely AI surface citations; not checked live.
- BigOrange `/ai-search-optimization-services/` receives 12,673 impressions on a single prompt style query at position 3.25 with zero clicks; likely an AI surface, not checked live.
- Align HCM prompt style queries (1,066 of them) may be produced by a third party AI visibility monitoring tool running persona prompts rather than by real buyers; the pattern ("i am a chief human resources officer. my job seniority is...") reads like a synthetic persona. If Align or a vendor runs such a tool, those impressions are not demand.
- Bar Crawl USA GA4 shows 55,117 key events in March 2026 against 2,300 to 6,000 in neighbouring months; likely a tagging change, worth checking before any conversion claim.
- Nexla's organic sessions fell two thirds in twelve months; if Momentum is responsible for Nexla SEO this is a retention risk, and if it is not, it is a pitch opportunity. Either way it needs the engagement scope from Lane B.
- The gcloud identity still holds siteOwner on alignhcm.com after Dillon's departure (access ledger, 2026-09-14). Access hygiene decision for Dillon, not a measurement.
