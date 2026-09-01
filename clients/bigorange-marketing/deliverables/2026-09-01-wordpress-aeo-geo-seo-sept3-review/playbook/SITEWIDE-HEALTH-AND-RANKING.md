# BigOrange site health and ranking — one operating view

**Prepared:** 2026-09-01  
**Review:** Sept 3, 2026 leadership package  
**Client route:** `bigorange-marketing`  
**Evidence:** 2026-08-14 Moz National Google en-US / Google Mobile en-US snapshot (Emelia Pitlick export) plus 2026-09-01 public fetch. These are not live current ranks. Re-export Moz or another rank source before any post-August-14 ranking claim.

This document treats crawl/index/performance health and keyword ownership as one system. A healthy origin that still leaks equity, splits one reader job across five URLs, or ships AEO pages with `nofollow` will not hold the terms Emelia already tracks.

No ranking, traffic, lead, revenue, rich-result, or AI-citation promises. Health fixes and content ownership are controllable. Outcomes are not.

---

## 1. Origin recovered (Sep 1 healthy after Aug 31 HTTP 520)

| Date | Check | Result |
| --- | --- | --- |
| 2026-08-28 | Public builder hub | HTTP 200, H1 `Home Builder Marketing`, self-canonical, in Yoast sitemap |
| 2026-08-31 | WordPress origin via admin login | **Failed.** Cloudflare reachable; origin returned **HTTP 520**. Private draft readback treated stale. |
| 2026-09-01 | Public origin | **Recovered.** Homepage, `/wp-json/`, and sitemap index HTTP 200. No Cloudflare 5xx on sampled critical pages. |
| 2026-09-01 | Edge / host | Cloudflare (`Server: cloudflare`, CF-RAY). WP Engine (`X-Cache`, `X-Cacheable`, `X-Cache-Group`). |
| 2026-09-01 | Private drafts 5546 / 5585 / 5550 / 5552 | **Not re-verified.** Public fetch only. Do not treat Sep 1 public health as authenticated preview proof. |

**Operating rule:** the Aug 31 520 is a closed public-origin incident, not a closed WordPress-readiness incident. Before any send, publish, or 1381 swap: authenticated readback of the four private IDs, especially Orange Press on 5585 and ART-01 on 5550.

**Do not** copy, log, or store raw `Set-Cookie` values from `live-site-inventory.json`. Those headers are session material.

---

## 2. Homepage `Stategic` typo

**URL:** `https://bigorange.marketing/`  
**WP:** page 3709, last modified 2026-08-20T12:32:53, robots `index, follow`  
**Rendered H1 (Sep 1):** `Your Digital and AI Marketing Guides`  
**Yoast title:** `Top Digital Marketing Services for MSPs and Builders - BigOrange.Marketing`

The misspelling **Stategic** appears in three public surfaces on the homepage:

- meta description
- Open Graph description
- Yoast JSON-LD

Exact Yoast description string from REST (2026-09-01):

> Top digital marketing services for MSPs, landscapers and builders. Small and mighty. Stategic. Get local leads with BigOrange Marketing.

**Why it matters with ranking, not as a vanity typo:** Moz (2026-08-14) already attaches two declining local terms to `/`:

| Keyword | Best rank | Desktop | Mobile | Vol | Direction |
| --- | ---: | --- | --- | --- | --- |
| cincinnati marketing agency | 9 | 9 / -1 | 9 / -1 | 11-50 | declining both engines |
| inbound marketing cincinnati | 17 | 18 / -5 | 17 / -4 | 0-10 | declining both engines |

A typo in the snippet, OG, and schema is a quality and trust defect on the URL that owns those terms. Fix the spelling in Yoast first. Then rewrite the description so it states the actual homepage job (Cincinnati multi-vertical agency that routes to MSP, builder, StoryBrand, manufacturing, and landscaping hubs) without “get local leads” or ranking language.

Related homepage health (same Sep 1 fetch): **8 of 50 images** lack usable alt text.

---

## 3. AI page: four H1s + `index, nofollow`

**URL:** `https://bigorange.marketing/ai-search-optimization-services/`  
**WP:** page 5067, modified 2026-04-23T12:59:57  
**Yoast robots:** `index, nofollow`  
**JSON-LD:** present  
**Moz keywords owned (2026-08-14):** **0**

Four rendered H1s (Sep 1 HTML):

1. `Stop Being Invisible to AI Search: Start Being the Answer`
2. `AI Search Optimization Services That Help You Move Forward With Confidence`
3. `Can You Afford to Wait While Competitors Get Found?`
4. `Get Your Free AI Visibility Report`

Keep H1 1 or H1 2 as the single H1. Demote the rest to H2. The page currently has no one primary topic for extractors.

**Nofollow on an indexed commercial page** is the larger ranking defect. The page can appear in the index while every outbound link, including internal links to `/msp-it-services-marketing-agency/`, `/marketing-agency-for-builders/`, `/website-design-and-storybrand-seo-services/`, and `/book-appointment/`, is told not to be followed. That isolates a strategic service URL from the rest of the graph.

Action: change Yoast to `index, follow` unless leadership intentionally wants a crawl sink. If the page is a campaign lander that should not pass equity, set `noindex, follow` and remove it from the commercial IA. Do not leave `index, nofollow` on a named service.

Copy issue: Yoast description includes “Drive qualified leads, boost visibility, and outrank competitors.” Remove ranking and lead promises before this page is treated as the AEO/GEO proof of concept.

---

## 4. Fifteen nofollow published pages

Sep 1 REST: **15 published pages** with Yoast `follow: nofollow`. **0 posts** with nofollow.

| URL | Likely job | Recommended robots / sitemap call |
| --- | --- | --- |
| `/ai-search-optimization-services/` | Commercial AI/AEO service | `index, follow` if it remains a real service; else `noindex` |
| `/digital-marketing-campaign-solutions/` | Campaign / solutions lander | Confirm: index+follow only if it owns a distinct reader job |
| `/marketing-agency-referral-program/` | Referral program | Index+follow if public program; else noindex |
| `/revenue-engine-campaign/` | Campaign lander | Usually `noindex, follow`; already sitemap-missing |
| `/msp-marketing-book/` | Book / magnet | `noindex` if thank-you adjacent; index only if it is the book sales page |
| `/top-website-design-for-msps/` | MSP website campaign | Resolve vs `/website-design-for-msps/` and `/website-design-and-storybrand-seo-services/` |
| `/website-design-for-msps/` | MSP website campaign | Same family; one indexed owner |
| `/web-accessibility-services/` | Accessibility service | Index+follow if this is the real offer |
| `/top-digital-marketing-agency-msp/` | MSP campaign variant | Collapse or noindex |
| `/top-digital-marketing-agency-2/` | Draft/challenger lander | `noindex` unless it replaces a live URL |
| `/msp-marketing-campaign/` | Campaign lander | Usually noindex; sitemap-missing |
| `/exit-survey/` | Utility | `noindex, nofollow` |
| `/top-manufacturing-marketing-agency-2/` | Manufacturing campaign variant | Collapse vs `/manufacturing-services-marketing-agency/` |
| `/top-digital-marketing-agency/` | Generic campaign | Do not let this compete with `/` or MSP/builder hubs |
| `/7-figure-msp-it-services-marketing-agency/` | Event / campaign variant of MSP hub | `noindex` or 301 to `/msp-it-services-marketing-agency/` |

**Rule:** nofollow is not a substitute for a reader-job decision. Either the URL is a public owner (`index, follow`, in sitemap, one H1) or it is a utility/campaign sink (`noindex`, out of sitemap). `index, nofollow` is the worst of both.

---

## 5. Twenty-one sitemap-missing published pages

Yoast sitemap index (Sep 1): **349** URLs — 299 posts + 50 pages. REST published pages: **71**. **21 published pages** are absent from `page-sitemap.xml`. Sitemap URLs missing from REST: **0**. Child sitemaps: posts and pages only (no category, author, or taxonomy sitemaps).

Exact Sep 1 gap list (`mismatches.publishedRestNotInSitemap`):

| URL | Class | Default call |
| --- | --- | --- |
| `/thanks-for-booking/` | Confirmation | Keep out of sitemap; `noindex` |
| `/contact-confirmation/` | Confirmation | Keep out; `noindex` |
| `/web-accessibility-services/accessibility-confirmation/` | Confirmation | Keep out; `noindex` |
| `/msp-marketing-chatgpt-confirmation/` | Confirmation | Keep out; `noindex` |
| `/msp-marketing-resource-confirmation/` | Confirmation | Keep out; `noindex` |
| `/podcast-confirmation/` | Confirmation | Keep out; `noindex` |
| `/squeeze-confirmation/` | Confirmation | Keep out; `noindex` |
| `/ebook-confirmation/` | Confirmation | Keep out; `noindex` |
| `/exit-survey/` | Utility | Keep out; `noindex` |
| `/squeeze-the-day-subscribe/` | Subscribe utility | Keep out unless it is a public show page |
| `/squeeze-the-day/` | Show / series hub? | Review: may deserve sitemap if it is the public series URL |
| `/revenue-engine-campaign/` | Campaign | Review indexation; do not sitemap a noindex lander |
| `/msp-marketing-campaign/` | Campaign | Same |
| `/msp-marketing-book/` | Magnet / book | Sitemap only if it is the canonical book URL |
| `/top-website-design-for-msps/` | Campaign variant | Do not sitemap until owner is chosen |
| `/website-design-for-msps/` | Campaign variant | Same |
| `/top-digital-marketing-agency-msp/` | Campaign variant | Same |
| `/top-digital-marketing-agency-2/` | Draft/challenger | Keep out |
| `/top-digital-marketing-agency/` | Campaign variant | Same |
| `/top-manufacturing-marketing-agency-2/` | Campaign variant | Same |
| `/7-figure-msp-it-services-marketing-agency/` | Event/campaign | Keep out or redirect to MSP hub |

Confirmations are correctly excluded if they are `noindex`. The risk is the **indexed campaign URLs** that are also nofollow and sitemap-missing: they can still rank or split clicks while the graph and sitemap tell two different stories.

---

## 6. Mobile Lighthouse 32 / LCP 36s on the builder hub (Aug 20)

Source: `2026-08-03-custom-home-builder-authority-hub-pilot/live-site-technical-audit-2026-08-20.md`, synthesized 2026-09-01.

Public URL measured: `https://bigorange.marketing/marketing-agency-for-builders/` (WP page **1381**).

| Metric | Mobile | Desktop |
| --- | ---: | ---: |
| Performance | 26 → **32** (Aug 20 refresh) | 67 → 75 |
| Accessibility | 86 | 86 |
| Best practices | 54–57 | 54–57 |
| Lighthouse SEO | 92 | 92 |
| LCP | 28.6s → **36.1s** | 2.6s → 2.7s |
| TBT | 2,650ms → 1,110ms | 210ms → 20ms |

This is the same URL that owns **17** Moz builder keywords and **13** protect-band (position 1–3) terms on 2026-08-14. Mobile lab LCP at 36 seconds is a material experience defect on the highest-ownership commercial URL in the snapshot.

Spec blockers called out in the prior audit: Elementor/widget CSS on a Beaver Builder page, render-blocking assets, unused JavaScript (~703 KiB lab estimate), and image sizing. Apply remediation to the **live public architecture**, not only to private coded drafts 5546/5585.

**Gate:** do not swap 1381 to Cinematic Authority or Orange Press until a staging mobile Lighthouse confirmation run beats this baseline and leadership approves the exact revision. A new visual direction on a 36-second LCP page is not a ranking sequence.

---

## 7. Plugin stack (public REST, Sep 1)

Namespaces from `raw/wp-json-root.json` / inventory. No secrets.

| Layer | Evidence | Ranking / health job |
| --- | --- | --- |
| WP Engine | `wpe/cache-plugin/v1`, `wpe_sign_on_plugin/v1`, `X-Cache*` | Origin cache. Aug 31 520 sat here. |
| Cloudflare | CF-RAY, `Server: cloudflare` | Edge. Do not change WAF/bot rules as a ranking tactic. |
| Yoast SEO | `yoast/v1`, robots block, sitemaps, JSON-LD | **Owner of title, meta, robots, sitemap, schema graph.** All per-page SEO actions go through Yoast, then rendered-HTML readback. |
| Beaver Builder | `fl-controls/v1`, `fl-builder` / `bb-plugin` on HTML | **Primary page builder.** Multiple H1s on the AI page are PP headline modules, not Yoast. |
| Beaver Builder Theme | `bb-theme` / `bb-theme-child` | Header/footer templates. Keep Organization/breadcrumb emission once. |
| WP Rocket | `wp-rocket/v1` | Cache. Coordinate with WP Engine; do not stack conflicting page-cache experiments on 1381. |
| WP Smush | `wp-smush/v1` | Image weight. Required for hub LCP work. |
| Wordfence | `wordfence/v1`, `wordfence-login-security/v1` | Login/2FA. Publication gate, not ranking. |
| Redirection | `redirection/v1` | Use for approved 301s when collapsing campaign variants. |
| Simple History | `simple-history/v1` | Audit log for robots/sitemap/title edits. |
| WPMU DEV Dashboard | `wpmudev-dashboard/v1` | Plugin management. |
| Elementor One | `elementor-one/v1` | Present. **Not** the primary builder on audited MSP/builder pages. Residual CSS is a performance suspect. |
| EA11y | `ea11y/v1` | Accessibility assist. Does not replace alt-text work on `/`. |
| QuadLayers Search Exclude | `quadlayers/search-exclude` | Internal WP search. Not a Google robots control. |

**Robots.txt policy (leave unless leadership reopens it):** search and agent crawlers allowed (`Googlebot`, `Bingbot`, `OAI-SearchBot`, `PerplexityBot`, `ChatGPT-User`, and the listed research bots). Training crawlers blocked (`GPTBot`, `ClaudeBot`, `Google-Extended`, `CCBot`, `ByteSpider`). Disallow `/admin/`, `/internal/`, search URLs, and `/*incorrect_parameter=*`.

---

## 8. Protect declining position-1 terms

Moz best rank still 1–3 on 2026-08-14, but a change column is already declining. These are hold-and-refresh jobs, not new-content calendar items.

| Keyword | Cluster | Best rank | Slip | Owner URL |
| --- | --- | ---: | --- | --- |
| storybrand website examples | storybrand | 2 | desktop 2 / -1 | `/who-is-the-hero-of-your-website-storybrand-examples-that-make-your-customer-the-hero/` |
| digital home builder marketing agency | home-builder | 1 | mobile 3 / -2 | `/marketing-agency-for-builders/` |
| home builder digital marketing agency | home-builder | 2 | both engines -1 | `/marketing-agency-for-builders/` |
| ad agency for home builders | home-builder | 2 | desktop 3 / -1 | `/marketing-agency-for-builders/` |
| homebuilder brand agency | home-builder | 3 | mobile unranked / > -18 | `/marketing-agency-for-builders/` |
| manufacturing storybrand websites | manufacturing | 3 | both engines -1 | `/manufacturing-storybrand-website-examples-to-inspire-you/` |
| What is the process plan of a StoryBrand Website? | storybrand | 3 | mobile 4 / -2 | `/what-is-the-process-plan-of-storybrand/` |
| Best MSP Blog list | msp-it | 3 | desktop -1; mobile unranked / > -19 | `/best-msp-blog-list-big-orangemarketing/` |

Also still in the protect band and **not** declining, but treat as watch: `storybrand examples` (1), `agency for home builders` (1), `home builder marketing agency` (1), `marketing agency for home builders` (1), `Not Lose SEO When Moving Offices` (1), `StoryBrand MSP Website` (2), `What is Included in an MSP Marketing Plan?` (2), `Best MSP Marketing Company` (3), `inbound marketing msp` (3).

**Protect protocol (same on every URL):**

1. Do not publish a second URL that targets the same reader job.
2. Refresh the first 100 words into a labeled direct-answer block that names the entity and the job.
3. Add five visible FAQs that match FAQPage exactly.
4. Reciprocal internal links: owner ↔ hub ↔ one sibling, not a spray of near-duplicate anchors.
5. Confirm `index, follow`, self-canonical, sitemap inclusion, one H1.
6. Separate firsthand BigOrange experience from generic how-to. No ranking promises in title, meta, H1, or FAQ answers.

---

## 9. Cannibalization families

A family is flagged when two or more distinct ranking URLs appear among related 2026-08-14 snapshot terms. Assign **one owner**. Other URLs become supporting, proof, or noindex.

| Family | Ranked terms / URLs | Canonical owner | Supporting / retire |
| --- | --- | --- | --- |
| `cincinnati-agency` | 3 ranked / 2 URLs | `/` owns city-agency and inbound-cincinnati | `/marketing-agency-for-builders/` keeps `home builder ad agency cincinnati` only. Do not retarget homepage copy at builder+Cincinnati. |
| `it-marketing` | 3 ranked / 2 URLs | `/what-is-marketing-in-the-it-industry/` owns definition (`it marketing` 5; question 8) | `/top-performing-marketing-content-for-it-services/` owns content-types only. Unranked `marketing for it` / `it company marketing` stay on the definition page. |
| `manufacturing-marketing` | 2 ranked / 2 URLs | `/manufacturing-storybrand-website-examples-to-inspire-you/` owns StoryBrand+manufacturing websites (3) | `/google-ads-for-manufacturing-firms/` owns paid search only (16). Unranked `marketing for manufacturers` (201-500) needs a **hub** job on `/manufacturing-services-marketing-agency/` or `/manufacturing-marketing/`, not a third article that repeats both. |
| `msp-marketing-agency` | 6 ranked / 2 URLs | `/msp-it-services-marketing-agency/` owns agency/company commercial terms | `/top-msp-marketing-agencies/` is a comparison article. It currently ranks **mobile** for `msp marketing company` while the hub ranks **desktop**. Resolve the engine split: comparison page must not use “MSP marketing company” as title/H1. |
| `msp-website` | 3 ranked / 2 URLs | `/7-awesome-msp-story-based-website-examples-to-inspire-you/` owns `MSP website examples` (11) and unranked `msp website` (201-500) | `/msp-lead-generation/` keeps `StoryBrand MSP Website` (2) and `MSP storybrand websites` (3). Do not retitle the lead-gen post as a generic MSP website gallery. Also review sibling `/7-awesome-msp-storybrand-examples-to-inspire-your-new-website/` (in post sitemap, not in this Moz snapshot). |
| `storybrand-brandscript` | 5 ranked / 3 URLs | `/storybrand-brandscript-examples/` owns `StoryBrand BrandScript` (7) and “what is” (13) | `/how-is-a-storybrand-brandscript-used/` owns the how-to (8, declining -6). Hero examples page must **stop accumulating** `storybrand brandscript examples` (3) and “examples of BrandScript” (3) — those belong on the BrandScript URL. |
| `storybrand-certified-guide` | 4 ranked / 3 URLs | `/storybrand-certified-guide-cost/` owns cost + certified agency/guide | `/is-storybrand-free/` owns the free-vs-paid question. **Engine split today:** desktop `Is StoryBrand Free?` ranks the cost page (18); mobile ranks the free page (8). `/is-it-worth-it-to-become-a-storybrand-guide/` owns the career question only. |
| `storybrand-examples` | 6 ranked / 2 URLs | `/who-is-the-hero-.../` owns website/examples | BrandScript examples stay on `/storybrand-brandscript-examples/`. Cross-link; do not interleave H2s that invite both jobs. |
| `storybrand-website` | 10 ranked / 5 URLs | Hero page owns generic `storybrand website(s)` | Checklist owns checklist terms. Process-plan owns process. MSP lead-gen owns MSP+StoryBrand websites. Manufacturing examples owns manufacturing+StoryBrand websites. Five owners is acceptable **only if** each H1 states the modifier (MSP / manufacturing / checklist / process / generic examples). |

**Builder slug collision (health + ranking):** `/home-builder-marketing-agency/` is a **post** (id 5156, Chris Gorman case) whose slug is a near-duplicate of the live hub `/marketing-agency-for-builders/`. Moz currently attaches every ranked builder term to the hub. That is not permission to leave the post titled and slugged as a second agency page. Retitle/reslug toward the case, or 301 if leadership prefers one URL.

**CONSULT-01** `/home-builder-marketing-consulting/` and **PPC-01** `/ppc-for-home-builders/` remain unpublished / blocked (prior synthesis). Do not create them as a ranking response to unranked `advertising for builders`.

---

## 10. High-volume unranked vertical terms

Filter from Emelia’s map: unranked on both engines, Moz volume max ≥ 51, primary cluster in a BOM vertical. **15** terms. Broad generic terms (`small business marketing`, `tech marketing`, etc.) are excluded here; they are not must-own.

| Keyword | Cluster | Vol | Assign to this existing URL / job | Do not |
| --- | --- | --- | --- | --- |
| managed services provider marketing | msp-it | 501-850 | Expand `/msp-marketing-resources/` “What is MSP marketing?” block; commercial close to `/msp-it-services-marketing-agency/` | New thin “MSP marketing” service page |
| marketing for manufacturers | manufacturing | 201-500 | Manufacturing hub (`/manufacturing-services-marketing-agency/` or `/manufacturing-marketing/`) | Force onto the Google Ads article or the StoryBrand examples article |
| msp website | msp-it | 201-500 | `/7-awesome-msp-story-based-website-examples-to-inspire-you/` plus StoryBrand services page for the commercial job | Retitle `/msp-lead-generation/` |
| StoryBrand Framework | storybrand | 201-500 | Prefer `/what-are-the-7-steps-of-storybrand/` or `/what-is-the-purpose-of-storybrand/`; live page `/storybrand-framework/` already exists and owns **zero** snapshot keywords | A sixth StoryBrand definition URL |
| marketing for it | msp-it | 101-200 | `/what-is-marketing-in-the-it-industry/` | Another “IT marketing” blog |
| advertising for builders | home-builder | 51-100 | Supporting article under the hub (ideas / advertising), **not** a second service URL | CONSULT-01 or PPC-01 without approval |
| digital marketing for msps | msp-it | 51-100 | `/what-is-digital-marketing-for-msps/` (already ranks the question at 13) | Hub title change |
| it company marketing | msp-it | 51-100 | `/what-is-marketing-in-the-it-industry/` | Split to resources |
| managed service provider marketing | msp-it | 51-100 | Same owner as the plural “provider” term | Duplicate page |
| marketing an it company | msp-it | 51-100 | Same IT-industry definition page | — |
| marketing for an it company | msp-it | 51-100 | Same | — |
| MSP Lead Generation | msp-it | 51-100 | `/msp-lead-generation/` — page currently ranks StoryBrand-website terms, **not** this query | New lead-gen lander |
| MSP Marketing Services | msp-it | 51-100 | `/msp-it-services-marketing-agency/` | Campaign URLs in the nofollow list |
| msp seo | msp-it | 51-100 | New supporting article under the MSP hub **or** a scoped H2 on resources; do not retitle the hub | Generic SEO service page |
| storybrand marketing | storybrand | 51-100 | `/website-design-and-storybrand-seo-services/` (commercial) + purpose/framework article (definition) | Hero examples page |

`landscaping marketing` (11-50, unranked) is the only landscaping snapshot term. Owner candidates already live: `/landscaping-marketing-services/`, `/landscape-marketing-services/`. Pick one hub. Out of this 39-URL matrix, but inside the 90-day sequence.

---

## 11. Ninety-day ranking sequence

Controllable work only. Dates are work order, not predicted rank dates. Re-export Moz before month-two and month-three reviews.

### Days 1–14 — health and protect

1. Authenticated readback of drafts 5546, 5585, 5550, 5552. Install Orange Press on 5585 only if that direction is still in play.
2. Fix homepage **Stategic** in meta, OG, and schema. Rewrite description; add missing alt text.
3. AI page: one H1; decide `index, follow` vs `noindex`; remove outrank/lead promises.
4. Classify the 15 nofollow pages and 21 sitemap gaps into owner / campaign-noindex / confirmation-noindex. Apply Yoast + Redirection. Log in Simple History.
5. Protect refresh (direct answer + 5 FAQs + sources, no new URL) on:
   - `/marketing-agency-for-builders/`
   - `/who-is-the-hero-of-your-website-storybrand-examples-that-make-your-customer-the-hero/`
   - `/manufacturing-storybrand-website-examples-to-inspire-you/`
   - `/what-is-the-process-plan-of-storybrand/`
   - `/best-msp-blog-list-big-orangemarketing/`
6. Do **not** publish a second builder service URL. Do **not** swap 1381.

### Days 15–45 — improve and collapse families

1. Resolve engine splits: `Is StoryBrand Free?` and `msp marketing company`. One title/H1/canonical per query.
2. Move BrandScript example terms off the hero page onto `/storybrand-brandscript-examples/`.
3. Retitle `/msp-lead-generation/` toward lead generation; keep StoryBrand-MSP-website modifiers in an H2 and on the examples URL.
4. Apply the reusable AEO/GEO blocks (answer, definition, decision table, FAQ, entity, sources) to the top ownership URLs: resources, MSP hub, inbound fundamentals, checklist, BrandScript, IT-industry, MSP plan.
5. Reconcile ART-01 (manifest diagnostic vs WP 5550 must-haves) before any supporting-article publish. Add the missing AEO modules documented in `evidence/article-aeo-geo-gaps.md`.
6. Start mobile performance remediation on public 1381 (Smush, unused JS/CSS, image dimensions). Staging confirmation run required.

### Days 46–90 — unfinished hub work and high-volume gaps

1. Builder supporting path for unranked / 11–20 terms: `advertising for builders`, `home builder marketing solutions`, `custom home builder marketing agency`, `builder advertising and marketing`, `home builder marketing firm`, `marketing ideas for homebuilders`. Supporting articles only; hub remains the commercial owner.
2. Write or expand owners for `managed services provider marketing`, `msp website`, `StoryBrand Framework`, `marketing for manufacturers`.
3. Re-job the eight builder satellites (zero Moz keywords) as proof/case/archive. Reslug `/home-builder-marketing-agency/` if it remains a case study.
4. Pick one landscaping hub. Apply the same block contract.
5. Re-export Moz. Compare to 2026-08-14. Do not narrate movement from memory.
6. Only after staging QA, leadership approval, and mobile confirmation: consider an in-place 1381 revision. Publication is a separate gate.

### WIP and approval

Automatic work: local drafts, Yoast field proposals, private WP drafts, QA, this playbook. External publication, 301s that change live commercial URLs, spend, and invoice/send remain approval-gated. The Marketing Chief queue is not mutated by this package.

---

## Evidence index

| File | Use |
| --- | --- |
| `evidence/emelia-moz-analysis.md` | Snapshot counts, protect/improve/opportunity, families, risks |
| `evidence/emelia-moz-page-map.csv` | One row per URL + keyword |
| `evidence/live-site-health.md` | Sep 1 public health |
| `evidence/live-site-inventory.json` | REST, sitemap, nofollow list, gaps (do not copy cookies) |
| `evidence/prior-audit-synthesis.md` | Plugins, draft IDs, Aug 20 Lighthouse, Aug 31 520 |
| `evidence/article-aeo-geo-gaps.md` | ART-01/02 AEO contract gaps |
| `playbook/PER-PAGE-RECOMMENDATIONS.md` | URL-level actions |
| `playbook/per-page-recs.csv` | Machine table |
| `playbook/CLIENT-SCALE-SYSTEM.md` | How BOM sells the same system |

---

*Compiled from local evidence only. Ranks are the 2026-08-14 Moz snapshot. Public HTML is the 2026-09-01 fetch. Authenticated WordPress draft state was not re-read for this document.*
