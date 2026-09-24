# Client work attribution, measured evidence

Compiled 2026-09-15. Every figure below carries its source. Nothing here is an
estimate unless the row says so.

Read `BASELINE-WARNING.md` before quoting any growth number. Most properties
were verified mid 2026 and cannot carry a before and after claim.

---

## Bar Crawl USA, strongest growth evidence

One of only two properties with a full baseline, 488 days back to 2025-05-13.
Compared on matched calendar months so seasonality cannot flatter it.

| Metric | Aug 2025 | Aug 2026 | Change |
|---|---:|---:|---:|
| Keywords in top 10 | 522 | 1,152 | **+121%** |
| Keywords in top 3 | 180 | 312 | **+73%** |
| Keywords at position 1 | 99 | 160 | **+62%** |
| Organic clicks | 1,254 | 2,300 | **+83%** |
| Impressions | 30,182 | 38,544 | +28% |
| Average position | 18.6 | 12.0 | 6.6 places better |

Footprint grew faster than traffic, which means compounding is still ahead of
the business rather than behind it.

**Seasonality correction.** A winA to winB comparison appears to show 381 lost
keywords. It is wrong. winA spans Halloween and Christmas and winB does not.
On matched months the real loss is **14 keywords**, and the material one is the
Macon cluster: position 1.3 on "bar crawl macon ga" in Aug 2025, nothing in
Aug 2026. Worth a look.

**Page evidence.** City and event pages each earn their own ranking. Top pages
by clicks in window B: homepage 1,227, Atlanta 676, taco and tequila 641,
Soulard 608, Cleveland 516, Columbia 506.

Source: Search Console, `sc-domain:barcrawlusa.com`, Search Analytics API,
pulled 2026-09-15. Raw in `raw/gsc/sc-domain_barcrawlusa.com/`.

---

## Align HCM, strongest depth and AI evidence

Property has a short history, first impression 2026-07-27. No growth claim is
available or made. Reported as a single 24 day programme window.

| Metric | 2026-07-27 to 2026-08-19 |
|---|---:|
| Distinct ranking keywords | 2,651 |
| In the top 10 | 1,089 |
| In the top 3 | 329 |
| Page and keyword pairs | 3,385 |
| Impressions | 29,778 |
| Share of impressions from AI shaped queries | **29.1%** |

**The content library is the engine.** Single pages in that window:

| Page | Impressions | Keywords | Top 3 | Top 10 |
|---|---:|---:|---:|---:|
| UKG buyer guide | 3,653 | 352 | 74 | 238 |
| UKG partner page | 3,253 | 175 | 8 | 36 |
| Workday best practice guide | 2,671 | 115 | 3 | 17 |
| Data conversion checklist | 1,268 | 137 | 20 | 46 |
| Paylocity buyer guide | 1,021 | 146 | 19 | 69 |

One guide ranking for 352 queries is the clearest argument in the portfolio for
long form over post volume.

**Buyer journey coverage**, share of impressions: awareness 19%, comparison 7%,
decision 29%, brand and other 45%. A genuine full funnel presence.

Source: Search Console, `https://www.alignhcm.com/`, pulled live 2026-09-15.

---

## BigOrange Marketing, real but not a sales asset

Reported honestly because the divergence is instructive, not because it sells.

| Metric | Aug 2025 | Aug 2026 |
|---|---:|---:|
| Clicks | 610 | 313 (**down 49%**) |
| Average position | 38.7 | 26.8 (improved) |

Resolved: 8 real keyword losses, all in the StoryBrand cluster where it held
positions 2 to 6 and converted. Meanwhile 259 keywords climbed, many from the
80 to 150 range into 10 to 25, on industrial and manufacturing marketing terms,
at zero clicks. It traded a small converting niche for a large non converting
one. Do not put this in client facing material without that explanation.

Check BigOrange against `registry/clients.json` before treating it as a client.

---

## Third party ranking evidence, clients with no Search Console

Position here is a third party index estimate, not measured from the client's
own property. Labelled accordingly everywhere it is used.

| Client | Keywords returned | In top 3 | Strongest term |
|---|---:|---:|---|
| NKCDC | 500 (capped) | **114** | "low income apartments philadelphia" pos 2, 6,600/mo |
| Momentum 360 | 500 (capped) | 36 | |
| Hope Wellness Center | 150 | 10 | |
| Fresh Blends | 137 | 24 | "fresh blends" pos 1, 2,400/mo |
| Kimberly James Bridal | 116 | 3 | |
| Align HCM | 99 | 3 | |
| Zen Spa Tropicana | 22 | 4 | |
| Replenish 7 Eleven | 14 | 1 | |
| Omega Landscaping | 3 | 0 | |
| VA Claims Edge | 3 | 0 | |

**NKCDC is the category ownership case.** Position 2 or 3 on eight separate
phrasings of the same 6,600 a month search, plus position 3 on a 14,800 a month
neighbourhood term. Holding every phrasing is what makes a position defensible,
because a rival has to displace all eight to take the traffic.

Source: marketing platform MCP `keywords_for_site`, brand 1789,
`location_code 2840`, `language_code en`, 2026-09-15.
Full rows in `keyword-analysis/THIRD-PARTY-RANKINGS.csv`.

---

## Portfolio wide AI search evidence

See `keyword-analysis/AI-QUERY-EVIDENCE.md` for the full method. Headline, across
53,392 page and keyword pairs on 8 properties:

| Query shape | Pairs | Impressions | Clicks | CTR | Avg position |
|---|---:|---:|---:|---:|---:|
| Persona prompt | 725 | 4,194 | 0 | 0.00% | 13.6 |
| Question | 1,168 | 12,255 | 2 | 0.02% | 13.4 |
| Conversational | 3,327 | 88,191 | 70 | 0.08% | 19.0 |
| Ordinary keyword | 48,172 | 1,723,352 | 9,003 | 0.52% | 28.3 |

AI shaped queries rank better and convert at near zero. That reconciles one way:
a machine reads the page and answers for the searcher.

---

## Files

| File | What it holds |
|---|---|
| `PROOF-TABLE.csv` | 32 rows, every claim with source and strength |
| `BASELINE-WARNING.md` | Which properties may carry a growth claim, binding |
| `AI-OVERVIEW.md` | What the AI claim does and does not support |
| `GAPS.md` | Clients with no evidence and what would close it |
| `keyword-analysis/ALL-PAGE-KEYWORDS.csv` | 53,392 page and keyword pairs |
| `keyword-analysis/AI-SHAPED-QUERIES.csv` | 5,200 AI shaped queries |
| `keyword-analysis/PAGE-KEYWORDS.md` | Readable, per page and per blog post |
| `keyword-analysis/THIRD-PARTY-RANKINGS.csv` | 1,544 rows, 10 clients |
| `raw/gsc/`, `raw/ga4/` | Untouched API responses |

Published anonymised sales asset built from this evidence:
https://claude.ai/artifact/JMAEeCRPtTx55oA6h9hYz9
