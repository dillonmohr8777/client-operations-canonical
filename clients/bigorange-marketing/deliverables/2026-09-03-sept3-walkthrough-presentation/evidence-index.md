# Evidence index — Sept 3 walkthrough deck

**Deck:** `index.html` (17 slides) · **Export:** `BigOrange-Sept3-Walkthrough-2026-09-03.pdf`
**Compiled:** 2026-09-03 · **Client route:** `bigorange-marketing`

Every figure that appears on screen is listed below with the file it came from. Paths are relative to
`C:\Users\dillo\Documents\Codex\projects\client-operations\clients\bigorange-marketing\` unless stated.

Two evidence dates run through the whole deck and are labelled on screen wherever they appear:

| Date | What it covers |
| --- | --- |
| **2026-08-14** | Moz rankings snapshot (Emelia Pitlick export). **Not live ranks.** |
| **2026-09-01** | Public HTML, Yoast, WP REST and sitemap fetch. |

No ranking, traffic, lead, revenue, rich-result or AI-citation outcome is promised anywhere in the deck.
No contract values appear on any slide.

---

## Slide 1 — Overture

| On screen | Source |
| --- | --- |
| BigOrange wordmark and mark | `deliverables/2026-08-03-custom-home-builder-authority-hub-pilot/wordpress/netlify-hardcoded/assets/bigorange-logo-orange.png` (1000×338), split into `assets/logo-mark.png` and `assets/logo-wordmark.png` |
| Brand orange `#FF7C00` | Sampled from that PNG — dominant opaque pixel, 67,049 px |
| Brick positions (318 bricks) | Derived from the alpha channel of `assets/logo-mark.png` on an 18.5 × 9.0 px running-bond grid, ≥38% coverage. Generator output cached in `assets/brick-map.json` |
| Display / body faces | `Unbounded` and `Manrope` — the client's own faces, per `deliverables/2026-08-03-custom-home-builder-authority-hub-pilot/DESIGN.md`; woff2 copied from `deliverables/2026-08-23-bigorange-homepage-trio/orange-press/assets/fonts/` |
| Palette (`#F6F2EA` paper, `#191919` ink, `#B94800` ember, `#D8D0C4` plan-line, `#69645E` slate) | `deliverables/2026-08-03-custom-home-builder-authority-hub-pilot/DESIGN.md` design tokens |
| "370 live URLs" | See slide 2 |

## Slide 2 — The engagement in one line

| Claim | Value | Source |
| --- | --- | --- |
| Live URLs inventoried | **370** | `deliverables/2026-09-01-wordpress-aeo-geo-seo-sept3-review/evidence/live-site-health.md` — "Unique URLs in combined inventory: 370" |
| Builder terms ranked / in positions 1–3 | **17** / **13** | `.../2026-09-01-.../evidence/emelia-moz-analysis.md` — Lane A: "Ranked / unranked: 17 / 4… Protect 1-3 / improve 4-10 / opportunity 11-20: 13 / 1 / 3" |
| WordPress drafts staged | **9** (5546, 5585, 5550, 5552, 5619, 5621, 5623, 5625, 5627) | 5546/5585/5550/5552 from `.../2026-09-01-.../README.md` and `.../client-review-2026-08-24-final/README.md`; 5619–5627 from the 2026-09-02 package email (Gmail thread `1a05f90a0e1a4a49`) |
| Pages published or changed | **0** | `.../client-review-2026-08-24-final/README.md` — "Both pages remain unpublished WordPress drafts. The existing public page at post ID 1381 was not changed." |

## Slide 3 — Where we started

| Claim | Source |
| --- | --- |
| Jul 27 approval, quoted | Gmail thread `19fa4cb8f6812394`, Margee Moore, 2026-07-27 18:16:59Z — "We would like you to proceed with the approved project building the pillar into our WordPress website." |
| Evolve the existing page rather than build new | `.../2026-08-03-.../keyword-strategy-2026-08-20.md` — "Evolve … as the one commercial authority hub. Do not launch a second custom-home-builder-agency pillar." Rationale: "Splitting the pillar would risk cannibalizing an established page." |
| Jul 29 — Moz instead of Semrush | Gmail, Paula Rae Forastiero, 2026-07-29 20:36:07Z — "we can't give you access to SEM Rush because of our login rules but we can pull reports or we an give you access to our Moz." |
| Aug 17 Moz export | Gmail thread `1a010b2ea84d1e4f`, Emelia Pitlick, subject `BOM Keywords from Moz`. Attachment `moz_bom_-_bigorange_marketing_rankings_by_engine_variant_2022-04-01_to_2026-08-14.csv`. Local copy: `.../2026-08-03-.../evidence/2026-08-17-moz-bom-rankings.csv` |
| Aug 28 Janice interview | `.../2026-08-28-content-authority-proposal/evidence/transcript-synthesis.md` |
| Approved pilot described as a fixed hour cap over two milestones | `.../2026-07-17-paid-trial-terms/paid-trial-decision-sheet.md` and `.../2026-08-31-final-client-handoff/FINAL-HANDOFF-README.md`. **Figures deliberately kept off the slide.** |
| Extra work carries no additional charge | `.../2026-09-02-five-blog-growth-package/README.md` — "no-charge proof of investment beyond the original … pilot"; `.../2026-08-28-content-authority-proposal/PACKAGE-INDEX.md` — "do not … imply a new client fee" |
| Invoice fields unconfirmed | `FINAL-HANDOFF-README.md` — "Invoice timing, recipient, legal billing address, invoice number, payment method, due date, acceptance mechanics and revision allowance were not stated in the approved terms." |
| No written client sign-off on any deliverable | Gmail sweep of all BigOrange threads to 2026-09-02: no reply to the Aug 24 review email or the Sep 2 package email. Only positive feedback on record is Margee, 2026-07-17, on a dashboard, pre-dating the pillar project. |

## Slide 4 — The site as we found it

All from `.../2026-09-01-wordpress-aeo-geo-seo-sept3-review/evidence/live-site-health.md`
(audit timestamp **2026-09-01T23:13:52.6254558Z**) and `playbook/SITEWIDE-HEALTH-AND-RANKING.md`.

| Claim | Value |
| --- | --- |
| Unique published URLs | **370** (299 posts, 71 pages) |
| Yoast sitemap total | **349** (299 posts + 50 pages) |
| Published pages missing from the page sitemap | **21** (sitemap URLs missing from REST: 0) |
| Published pages with Yoast `nofollow` | **15** (0 posts) |
| Homepage typo `Stategic` in meta, Open Graph and Yoast JSON-LD | Exact string quoted in `SITEWIDE-HEALTH-AND-RANKING.md` §2 |
| `/ai-search-optimization-services/` four H1s + `index, nofollow`, 0 Moz keywords | `SITEWIDE-HEALTH-AND-RANKING.md` §3 (WP page 5067) |
| Homepage images missing alt text | **8 of 50** |
| Origin recovered after 2026-08-31 HTTP 520 | `SITEWIDE-HEALTH-AND-RANKING.md` §1 |

## Slide 5 — Baseline

| Metric | Mobile | Desktop | Source |
| --- | ---: | ---: | --- |
| Performance | **32** | **75** | `.../2026-08-03-.../evidence/lighthouse-mobile-2026-08-20.json` (fetchTime 2026-08-20T18:19:07.453Z) and `lighthouse-desktop-2026-08-20.json` (18:19:31.834Z), Lighthouse 13.4.1, `throttlingMethod: simulate` |
| LCP | **36.1 s** | **2.7 s** | same |
| TBT | **1,110 ms** | **20 ms** | same |
| Accessibility | 86 | 86 | same |
| Best practices | 54 | 54 | same |
| Lighthouse SEO | 92 | 92 | same |
| URL measured | `https://bigorange.marketing/marketing-agency-for-builders/` (WP page 1381) | | same |
| ~703 KiB unused JS, render-blocking assets, unsized images, Elementor CSS on a Beaver Builder page | | | `.../2026-08-03-.../live-site-technical-audit-2026-08-20.md` |
| GSC July 2026: **389 clicks**, **210K impressions** (web) | | | Google Search Console monthly summary, reported 2026-08-04. Labelled on the slide as a baseline predating the work, and as the only third-party performance figure in the package. |

> Slide 5 deliberately does **not** repeat the "desktop 86" figure that appears in
> `meeting-and-source-reconciliation-2026-08-20.md`. No desktop performance run ever scored 86 —
> 86 is the accessibility score. The Aug 12 meeting recap transposed the two. Desktop performance is 67 → 75.

## Slide 6 — Pinned scroll-scrub centrepiece

| Callout | Source |
| --- | --- |
| Authority hub — one commercial URL per vertical, updated in place | `.../2026-09-01-.../playbook/CLIENT-SCALE-SYSTEM.md` §4 |
| Content engine — one SME interview → hub update, articles, FAQs, checklist, emails | `.../2026-08-03-.../ai-assisted-editorial-workflow.md` (repurposing map, explicitly a planning estimate) |
| Nine reusable blocks | `CLIENT-SCALE-SYSTEM.md` §3 — answer, definition, decision table, FAQ, entity, sources, numbered how-to, cluster links, schema |
| AEO/GEO — visible FAQs matched word-for-word to FAQPage JSON-LD | `.../2026-08-28-content-authority-proposal/implementation/AEO-GEO-SEO-CONTENT-STANDARD.md` |
| Six gates before publish, each with a named owner | `ai-assisted-editorial-workflow.md` — brief, SME truth, editorial, SEO, technical, publication |
| Dimension annotations "370 URLs" / "9 drafts" | Slides 2 and 4 above |

## Slides 7–9 — The WordPress build

| Claim | Source |
| --- | --- |
| Draft 5546 = Cinematic Authority; draft 5585 = Orange Press | `.../2026-08-03-.../2026-08-27-janice-interview-command-brief.md` and `client-review-2026-08-24-final/README.md` |
| Private preview URLs `?page_id=5546` / `5585` | `client-review-2026-08-24-final/README.md` |
| Rollback snapshot of 1381 staged as draft 5545 | `.../2026-08-03-.../wordpress/beaver-builder-assembly-guide.md` |
| Post 5550 blocked; post 5552 upgraded | `.../2026-09-01-.../README.md` and `evidence/article-aeo-geo-gaps.md` |
| 5619–5627 = five new blogs, 6,093 words, not authorised for release | 2026-09-02 package email; `.../2026-09-02-five-blog-growth-package/blog-manifest.json` |
| Beaver Builder is primary (`fl-builder`); Elementor One residual and a performance suspect | `SITEWIDE-HEALTH-AND-RANKING.md` §7 (public REST namespaces, 2026-09-01) |
| Screenshots — 1425×868 desktop, 375×812 mobile, captured 2026-08-24 | `client-review-2026-08-24-final/` (files copied into `assets/`) |
| QA list: 390/768/1024/1440 px, no horizontal overflow, one H1 each, three CTAs each, keyboard focus and reduced motion retained, no error-level console messages, design detector clean | `client-review-2026-08-24-final/README.md` |
| Imagery is art direction, not client proof | same file — "It is not presented as BigOrange client work, a customer testimonial, or performance proof." |

## Slide 10 — Content engine

| Claim | Value | Source |
| --- | --- | --- |
| Assets in the authority content model | **24** | 2026-09-02 package email |
| Production drafts with matching schema; total words; QA result | **19** / **26,845 words** / 0 errors, 0 warnings | `.../2026-08-28-content-authority-proposal/release/qa/content-system-qa.json` (`asset_count: 19`, `status: "pass"`, `checked_at: 2026-08-28`) |
| Reusable blocks | **9** | `CLIENT-SCALE-SYSTEM.md` §3 |
| Human review gates | **6** | `ai-assisted-editorial-workflow.md` |
| Quality scorecard: 0–2 on ten criteria, nothing publishes below **17/20** | | `ai-assisted-editorial-workflow.md` |
| Six ownership rules | | `CLIENT-SCALE-SYSTEM.md` §2 |

## Slide 11 — Two lanes

All from `.../2026-09-01-.../evidence/emelia-moz-analysis.md` (generated 2026-09-01T23:26:18Z).

| Claim | Value |
| --- | --- |
| Lane A tracked / ranked / positions 1–3 | **21 / 17 / 13** |
| Lane A ranking URL | `/marketing-agency-for-builders/` — every ranked builder term |
| Position-1 builder terms named on the slide | `agency for home builders`, `home builder marketing agency`, `marketing agency for home builders` |
| Lane B tracked / ranked / distinct URLs | **150 / 61 / 27** |
| Lane B protect / improve / opportunity | **14 / 27 / 20** |
| Cluster counts (MSP 80, StoryBrand 26, manufacturing 3, landscaping 1, Cincinnati 4) | Cluster table |
| Export rows / snapshot rows / unique keywords / ranking URLs | **27,802 / 177 / 171 / 28** |
| Source integrity | `meeting-and-source-reconciliation-2026-08-20.md` — 4,626,986 bytes, SHA-256 `C7C2FB…F1FA`, independently recomputed and matching |

## Slide 12 — Cannibalisation families

All from `SITEWIDE-HEALTH-AND-RANKING.md` §9 and §10.

Eight families shown with their terms/URLs counts: storybrand-website 10/5, msp-marketing-agency 6/2,
storybrand-examples 6/2, storybrand-brandscript 5/3, storybrand-certified-guide 4/3, cincinnati-agency 3/2,
it-marketing 3/2, msp-website 3/2. Slug collision `/home-builder-marketing-agency/` (post 5156).
Eight builder satellites with zero snapshot keywords (listed in `emelia-moz-analysis.md`).
Fifteen high-volume unranked vertical terms, including `managed services provider marketing` (501–850)
and `msp website` (201–500).

> The playbook records **nine** families. The slide shows the eight with two or more ranked URLs in
> the snapshot; `manufacturing-marketing` is covered in the roadmap rather than the table.

## Slide 13 — Ledger and client-scale product

| Claim | Value | Source |
| --- | --- | --- |
| Published URLs scored / deep write-ups / health flags / P0 | **370 / 39 / 30 / 8** | `.../2026-09-01-.../playbook/ALL-PAGES-LEDGER.md` counts table |
| Page templates named | **11** | `ALL-PAGES-LEDGER.md` templates table |
| Ledger UI panel rows | Real rows from `playbook/all-pages-ledger.csv` and `per-page-recs.csv` (keyword counts and best ranks match `emelia-moz-analysis.md`) | Panel is captioned **illustration** on screen |
| "Export in → page map out"; the refusal to guarantee page one | | `CLIENT-SCALE-SYSTEM.md` §2 and §6 |

## Slide 14 — Five-blog growth package

All from `.../2026-09-02-five-blog-growth-package/blog-manifest.json` and `qa-report.json`.

| ID | Words | FAQs | Primary query | WP |
| --- | ---: | ---: | --- | --- |
| BLOG-01 | 1,420 | 5 | marketing ideas for homebuilders | 5619 |
| BLOG-02 | 1,221 | 5 | advertising for builders | 5621 |
| BLOG-03 | 1,118 | 5 | home builder marketing automation | 5623 |
| BLOG-04 | 1,109 | 5 | home builder marketing solutions | 5625 |
| BLOG-05 | 1,225 | 5 | custom home builder marketing agency | 5627 |

Totals: **6,093 words**, **25 visible FAQs**, `qa-report.json` → `"status": "PASS"`, `"errors": []`.
Post IDs from the 2026-09-02 package email. Four target terms unranked and
`custom home builder marketing agency` at position 13 on 2026-08-14 (`emelia-moz-analysis.md`).
Release conditions quoted from `.../2026-09-02-five-blog-growth-package/README.md`.

## Slide 15 — Validated vs pending

| Verified item | Source |
| --- | --- |
| Public site inventory | `evidence/live-site-health.md`, `evidence/live-site-inventory.json` |
| Health defects | `SITEWIDE-HEALTH-AND-RANKING.md` §2–§5 |
| Draft QA on 5546 / 5585 | `client-review-2026-08-24-final/README.md` |
| Lighthouse baseline | `lighthouse-mobile-2026-08-20.json` |
| Five-blog QA | `qa-report.json` |
| Moz export provenance | `meeting-and-source-reconciliation-2026-08-20.md` (hash and row count reconciled) |

| Pending item | Source |
| --- | --- |
| Ranks are an Aug 14 snapshot | `emelia-moz-analysis.md` — "These are not live current ranks." |
| No Semrush validation | Paula, 2026-07-29 Gmail |
| Private drafts not re-read since Aug 31 | `evidence/wordpress-access-2026-09-01.md` — "Passkey / Wordfence enrollment remains a human gate." |
| Janice factual review outstanding; most of the transcript not cleared for quotation | `evidence/transcript-synthesis.md` — "explicit on-record permission to quote or paraphrase most of the interview was not captured"; `evidence/permission-and-claims-register.csv` — 14 of 16 claims coded `?` |
| Post 5550 blocked on a canonical reader-job decision | `evidence/article-aeo-geo-gaps.md` — "Publication cannot proceed until leadership picks one canonical reader job" |
| Conversion reporting unvalidated | `90-day-roadmap.md` exit criteria; `wordpress/qa-checklist.md` |
| Queue item blocked on four things | `queue/work-items.json` → `wi-20260718-0001`, `status: "blocked"`, nextAction names Janice SME review, Moz or Semrush validation, verified WordPress staging access, invoice or payment timing |

## Slide 16 — Next 90 days

Days 1–14 / 15–45 / 46–90 items are taken item-for-item from
`.../2026-09-01-.../playbook/SITEWIDE-HEALTH-AND-RANKING.md` §11.
"Dates are a work order, not predicted ranking dates" is quoted from the same section.
Janice's "ninety days is not much time … six months is a more realistic period" is the
approved paraphrase recorded at `overflow 00:00-00:40` in `evidence/transcript-synthesis.md`.

## Slide 17 — The decision

The seven decisions are the seven asks in the 2026-09-02 package email (Gmail thread `1a05f90a0e1a4a49`),
reordered so the three that need a live answer come first. The nine-decision list in
`2026-08-27-janice-interview-command-brief.md` is the fuller internal version.

---

## Deliberately excluded

| Not on any slide | Why |
| --- | --- |
| Contract hour cap, hourly rate, pilot total, invoice amount | Instructed to keep contract values off the deck |
| Homearama visitor estimate | `transcript-synthesis.md` — "omit the approximately 30,000-person figure unless Homearama or client evidence verifies the timeframe and BigOrange approves its use" |
| The `$8M–$12M` builder fit threshold | `permission-and-claims-register.csv` BO-002 — coded internal only; Janice described it as an uncertain recollection |
| Verbatim Janice quotations | 14 of 16 claims carry unresolved permission codes |
| Any post-2026-08-14 ranking movement | No re-export exists |
| Comparable-client analytics (Align HCM, Shadow, AMI) | Different clients; not BigOrange's data |

## Accessibility and performance measurements

| Measurement | Method | Result |
| --- | --- | --- |
| WCAG contrast | Script walked every rendered text node across all 17 slides, composited each element's real background stack (including the worst gradient stop) and computed the WCAG 2.x ratio | **27 unique pairs, 0 failures.** Lowest 4.71:1 against a 4.5 requirement |
| Scroll-scrub cost | 230 timed invocations of the pinned-sequence handler at varying scroll progress | mean **0.034 ms**, median 0.00 ms, p95 **0.10 ms**, max 2.1 ms against a 16.7 ms frame budget |
| Animated properties | All sequences animate `transform` and `opacity` only; layout geometry is measured once and cached so the per-frame loop never forces a synchronous layout | — |
| Reduced motion | `prefers-reduced-motion: reduce` resolves the wordmark immediately, shows the mark and all orbit chips, un-pins the scroll sequence and reveals every callout and caption as a static composition | — |
