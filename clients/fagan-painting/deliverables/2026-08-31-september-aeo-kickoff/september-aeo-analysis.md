# Fagan Painting September AEO / GEO plan

Prepared: 2026-08-31  
Canonical client: `fagan-painting` (active)  
Site: `https://faganpainting.com/`  
Privacy: redacted. No prospect names, phones, job addresses, or raw lead bodies.  
External action: none. Client email is drafted and unsent.

## Bottom line

September is the month this account already reserved for AI search work. Phil kept traditional SEO moving in August. Dillon's AEO / GEO add-on stayed parked for cash flow. Melissa asked Dillon on 2026-08-25 to start the AI optimizations in the meantime, and Dillon confirmed yes in `#fagan-painting`.

The site still is not extractable by the systems that create AI answers. Google can fetch and index the homepage. This worker, SiteGround captcha, and typical AI crawlers often cannot. Live `robots.txt` still has a truncated `/header` rule and no GPTBot / PerplexityBot / ClaudeBot / Google-Extended allow. Search Console still detects Product snippets on a local painting homepage, which is the wrong entity. The FAQ page still answers the color and sheen question with furniture-moving copy.

Those are first-order AEO blockers. Citation monitoring cannot honestly start until crawlers can read the pages.

Paid media stays off. Benson and Legacy Paint Holdings own Facebook. Do not reopen Meta, spend, or roster work unless Dillon explicitly reactivates Fagan on the paid-media roster.

## What already exists (do not invent a parallel program)

| Artifact | Locator | Role |
|---|---|---|
| Designed weekly PDF (navy / gold Letter) | Drive `1N2Q9ywL-oTnW415jpd_Q6pnBIcMQ92HL` | Client weekly report, Aug 10 to 16. Extra AEO / GEO parked until early September. |
| Weekly HTML template | `clients/fagan-painting/deliverables/2026-08-24-weekly-report-2026-08-17-to-2026-08-23/report.html` | Same Momentum 360 template. Bug: location says Central New York. Fagan is Pittsburgh. Do not ship that error. |
| July monthly PDF (Dillon) | Gmail `19fca7c756b50ed2`, attachment `Momentum-360-July-2026-Fagan-Painting.pdf` | Designed monthly closeout sent to James with the usual Momentum CC. |
| Phil Semrush EOM | Gmail `19fd7a0af7d939c6`, PDF `Semrush-Position_Tracking__Landscape_(organic)-faganpainting_com-6th_Aug_2026.pdf` | July KPI table plus live URLs. |
| Aug 11 meeting deck | https://docs.google.com/presentation/d/1Ll5Jd9slLyHnDu2Z4ZxgcBE5JhLyLS80QUjuWhm3-FI/edit | Client meeting. Phil proposed September 15 for the next call. |
| AEO baseline + Phil packet | `clients/fagan-painting/organic-search/2026-08-27-*` | Specs already written. Still unpublished as of 2026-08-31. |
| Add-on proposal | `clients/fagan-painting/deliverables/2026-08-12-aeo-geo-add-on-proposal/` | $500 / month, 90 days, $1,500. Written addendum still required before treating it as sold. |
| Transition plan | `organic-search/2026-07-27-aeo-seo-transition-plan.md` | Dillon owns AEO / GEO structure. Phil / Mac own SEO publish and backlinks. |

## Live verification on 2026-08-31

### Crawl and index

- Apex homepage: live. Title `Fagan Painting - Pittsburgh Painting Professionals`. Two-year warranty, BBB A+, licensed and insured, Lead Safe, 15+ years, 1000+ projects, estimate form with CAPTCHA.
- GSC inspect (`sc-domain:faganpainting.com`, account `google_search_console_kindle-spurt`): homepage **Submitted and indexed**. Google fetch **SUCCESSFUL**. Last crawl **2026-08-31T18:14:03Z**. Canonical apex. Robots **ALLOWED**. Sitemap `sitemap_index.xml`.
- Rich results still: **Product snippets** (wrong entity), Breadcrumbs, Review snippets.
- Live `robots.txt`: sitemap declared; `Disallow: /xmlrpc.php`; truncated `Disallow: /header`; **no AI crawler allow list**. Phil packet is not live.
- This worker's IP still hits SiteGround captcha (HTTP 202) on many fetches. Google can fetch. AI crawlers used for ChatGPT, Perplexity, and similar citation systems often cannot.

### Copy defects still live

- `/faqs/`: "How do I choose the right paint colors and sheens?" still repeats the furniture-moving answer. Interior prep still says "drops cloths". Residential FAQ already has the correct color / sheen answer.
- Homepage: 15+ years. Interior house page: "Over 20 Years in Business". Warranty wording is consistently two years on those pages.
- Interior URL is live at `/services/interior-house-painting-services/` (Phil's July EOM email pasted the exterior URL for interior; the separate interior URL exists now).

### Search Console, 2026-08-01 through 2026-08-28

Web search, property `sc-domain:faganpainting.com`, data state includes fresh rows.

| Window | Clicks | Impressions |
|---|---:|---:|
| Aug 1 to 7 | 5 | 7,622 |
| Aug 8 to 14 | 8 | 5,855 |
| Aug 15 to 21 | 7 | 6,473 |
| Aug 22 to 28 | 4 | 6,532 |
| **Aug 1 to 28** | **24** | **26,482** |

Average position sits in the low-to-mid 20s most days. Demand is visible. Click-through is thin.

Queries that already earned a click in this window:

| Query | Clicks | Impressions | Avg position |
|---|---:|---:|---:|
| fagan painting | 2 | 15 | 2.8 |
| fagan painting llc | 2 | 31 | 8.1 |
| house painters pittsburgh | 1 | 101 | 6.6 |
| commercial painting pittsburgh pa | 1 | 71 | 22.2 |
| painters in pittsburgh pa | 1 | 56 | 7.5 |
| painting contractors pittsburgh pa | 1 | 37 | 20.1 |
| exterior house painters near me | 1 | 17 | 4.8 |
| best painters near me | 1 | 1 | 22 |

High-impression, low-click rows that AEO must treat as answer targets, not vanity keywords: `house painters pittsburgh`, `commercial painting pittsburgh pa`, `painters in pittsburgh pa`, `painting contractors pittsburgh pa`. Keep the original ten-query monitor, and add these commercial / "near me" variants to the September set after Phil review.

Do not describe this as a conversion failure. Click-through from Google is the visibility problem. Qualified estimate outcomes stay in James's and Phil's lead path. Conversion reporting for organic estimates remains pending validation as a closed-loop metric.

### Organic production already live (Phil / Melissa)

Published and still the current SEO lane:

- North Hills: `https://faganpainting.com/areas-we-serve/north-hills-pa/`
- Highland Park: `https://faganpainting.com/areas-we-serve/highland-park-pa/`
- FAQs: `https://faganpainting.com/faqs/`
- Multifamily: `https://faganpainting.com/services/professional-multifamily-property-painting/`
- Exterior house: `https://faganpainting.com/services/exterior-house-painting-services/`
- Interior house: `https://faganpainting.com/services/interior-house-painting-services/`
- Landlord-special blog: `https://faganpainting.com/how-to-fix-landlord-special-paint-job-pittsburgh/`

Phil July EOM (client-facing, Semrush): ranking keywords 512 in July (from 370 in June); top 10 at 39 as of Aug 6; traffic 822; organic leads 10. Treat those as Phil's SEO snapshot, not a new GSC pull.

Slack Aug 17: four more service pages, nav update, call-now button, new blog. Melissa R flagged wonky internal links at the bottom of a draft on Aug 24.

### Demand the client already confirmed (no PII)

James told the account thread that incoming data looked good and that a job from the prior week closed. Website estimate-form notifications continued in August, including a new form alert on 2026-08-28. Do not mix those form events with Meta history. Do not put prospect names in client mail or this packet.

## Every AI optimization this site actually needs

These are not optional extras. They are the extractability layer a Pittsburgh painting contractor needs if ChatGPT, Perplexity, Google AI Overviews, Copilot, or Gemini is going to quote Fagan instead of a competitor or a generic "hire a painter" answer.

### 1. Let answer engines read the site

**Why 100%:** Citation is impossible if GPTBot, PerplexityBot, ClaudeBot, and Google-Extended hit captcha or a broken robots file.

**Do now (Phil / SiteGround):**

1. Whitelist Googlebot, Bingbot, GPTBot, PerplexityBot, ClaudeBot, Google-Extended. Keep human captcha.
2. Publish `organic-search/2026-08-27-robots-recommended.txt`. Complete the truncated `/header` rule. Keep xmlrpc disallowed.
3. After publish, Dillon re-inspects GSC and retries a non-Google fetch of homepage, FAQs, interior, exterior, and sitemap.

**Do not:** Turn off all bot protection. Do not allow xmlrpc. Do not wait for the $500 add-on to fix robots.

### 2. Fix the entity so Google stops treating the company as a Product

**Why 100%:** GSC still emits Product snippets on the homepage after today's crawl. Answer engines that read schema will file Fagan as a SKU, not a PaintingContractor / LocalBusiness.

**Do now:** Replace homepage Product JSON-LD with the PaintingContractor / LocalBusiness block in `organic-search/2026-08-27-schema-spec.md`. Keep Breadcrumbs. Keep review markup only if it matches visible `/reviews/` content.

**Facts allowed:** name Fagan Painting LLC; url apex; telephone +1-412-680-0102; email as published; areaServed Pittsburgh, PA; sameAs Facebook page already on the spec; two-year warranty as live copy.

**Facts forbidden:** invented street address, numeric service radius, priceRange, extra warranties, fabricated review counts.

### 3. One entity fact sheet (GEO local + generative)

**Why 100%:** Conflicting years (15+ vs 20+), misspelled Murrysville / Murraysville, and mixed warranty phrasing make generative answers hedge or pick a competitor with cleaner NAP.

**Lock with James, then publish everywhere:**

- Legal name
- Years in business (pick one number and use it on homepage, interior, schema, GBP)
- Warranty sentence (use the live two-year wording)
- Phone, email, Facebook URL
- Lead-Safe / EPA, BBB A+, licensed and insured
- Service area list that already exists on the site (do not invent towns)
- No fabricated street address until James confirms one for GBP / schema

Then align Google Business Profile category (Painter / Painting Contractor), service areas, and NAP on the directories Phil already uses. GEO here means both generative citations and Pittsburgh geography.

### 4. Repair extractable Q and A

**Why 100%:** A mismatched FAQ is worse than no FAQ. Models copy the nearest paragraph. The color / sheen question currently teaches furniture moving.

**Do now:** Paste `organic-search/2026-08-27-faq-copy-fix.md`. Fix "drops cloths". Fix Murrysville in the city grid.

**Then (AEO sprint):** Up to 15 service-grouped questions, visible on the matching page, with FAQPage schema only where the same Q and A is on-page. Sources: live FAQs, GSC queries, James's estimate conversations (redacted), and the painting research brief. Flag anything that needs James (pricing, radius, paint brand, lead-paint protocol beyond "Lead Safe Certified").

Priority question families:

- Interior timeline, prep, furniture, color / sheen, warranty
- Exterior seasonality and Pittsburgh weather (already on FAQs; keep honest)
- Commercial hours, multifamily, HOA
- Lead-safe / older homes (only verified EPA language)
- How to get an estimate and what happens next

### 5. Answer-first rebuild of priority pages

**Why 100%:** HubSpot / contractor AEO guidance and the existing Fagan research brief agree: the first 200 words must be a self-contained answer (who, where, what project types, how to estimate). Current interior copy is competent marketing prose, not an extractable definition.

Priority URLs (live nav + GSC demand):

1. Homepage
2. Interior house
3. Exterior house
4. Residential
5. Commercial
6. HOA
7. Cabinet (if still a distinct live page)
8. Multifamily
9. FAQs
10. Estimate / contact
11. North Hills and Highland Park (unique local proof, not doorway clones)
12. Landlord-special blog (already has a Quick Answer block; keep and link from interior / residential)

Each page needs: direct answer, process, prep, estimate expectation, internal links to related service + area + proof + estimate. Publication stays with Phil / Mac. Dillon writes the spec. No invented pricing.

### 6. Internal link architecture

**Why 100%:** Melissa R already flagged broken bottom links. Answer engines follow crawlable HTML relationships. Thin service pages that do not point at the matching suburb, FAQ, and estimate form get treated as orphans.

Map: service <-> area <-> project proof / reviews <-> estimate. Fix the landlord-special blog footer. After Phil's residential vs commercial IA split, rewrite those clusters so commercial queries such as `commercial painting pittsburgh pa` land on the commercial tree, not a generic house page.

### 7. llms.txt and crawlable HTML (not image-only answers)

**Why 100% once robots are open:** A short `llms.txt` / `llms-full.txt` at the apex that points models at the entity fact sheet, priority service URLs, FAQs, and estimate path. Only after robots allow AI crawlers. Critical answers must remain in HTML, not hero images.

### 8. Ten-query (now expanded) citation monitor

Run weekly after crawlers can fetch:

Original set: fagan painting llc; affordable painters; affordable painting contractors for residential work near me?; are flat and matte paint the same; best interior painters pittsburgh pa; best metallic paint for walls; best painting companies pittsburgh; bridgeville pa painting company; proposed interior house painting pittsburgh; proposed exterior house painting pittsburgh.

September additions from live GSC clicks (Phil review before treating as targets): house painters pittsburgh; commercial painting pittsburgh pa; painters in pittsburgh pa; painting contractors pittsburgh pa; exterior house painters near me.

Surfaces: Google AI Overviews when present, ChatGPT search, Perplexity, Copilot. Log cited URL, competitor, and whether Fagan appears. No citation log this tick because captcha / robots still block the path.

### 9. Measurement that matches the existing contract

Weekly and monthly, not rankings in isolation:

- Specs written -> Phil published -> GSC indexed
- Technical blockers (captcha, robots, Product schema)
- Target-query impressions and clicks
- AI citations once crawlers work
- Qualified organic estimate requests and James's downstream outcomes, without calling form volume "conversions" unless the closed loop is proven
- Competitor pages winning the same questions

If a defensible conversion result is unavailable, say conversion reporting is pending validation. Never "zero conversions."

### 10. Content cadence that feeds AEO (Melissa R / Phil)

Keep the blog list moving, but every new article needs a Quick Answer, one service link, one area link, and no wonky footer. Landlord-special is the pattern. Do not flood thin city posts.

### 11. Austin backlink path (~$300 / month)

Aligned on Aug 11. Melissa posted shortlisted sites on Aug 26. Phil will relay to James. This is SEO authority, not AEO copy. Keep it as a separate yes / hold from James. Do not bundle it into the $500 AEO add-on.

### 12. Out of scope unless Dillon reopens it

- Meta ads, Benson work, spend, creatives
- Invented pricing, radius, extra warranties
- WordPress edits from this worker (no WP login; captcha blocks REST)
- Claiming the $500 add-on is sold without a written addendum

## September operating plan

### Week of Sep 1 (must-fix, no extra invoice required)

Owner: Phil / SiteGround publish. Dillon specifies and verifies.

1. Robots + crawler whitelist
2. Homepage schema swap
3. FAQ color / sheen + drop cloths + Murrysville
4. James confirms years-in-business number
5. Dillon GSC re-inspect + first AI fetch retry

### Weeks of Sep 8 and Sep 15 (AEO layer)

Owner: Dillon specs. Phil / Mac publish. Melissa R content.

1. Answer-first blocks on interior, exterior, commercial, homepage, FAQs
2. Fifteen grouped Q and A + FAQPage where visible
3. Internal link pass
4. Confirm or reschedule the September 15 client meeting Phil proposed
5. If James wants the add-on: written addendum for $500 / month x 90 days

### Weeks of Sep 22 and Sep 29 (measure and GEO)

1. Citation log on the expanded query set
2. GBP / NAP / directory consistency
3. `llms.txt` only if robots allow AI crawlers
4. August monthly closeout in the designed Momentum PDF (Pittsburgh, not Central New York)
5. Resume weekly navy / gold reports (Dillon skipped a weekly on Aug 24 because AEO was slated for September)

### Owners

| Lane | Owner | Partner |
|---|---|---|
| AEO / GEO specs, query monitor, schema spec, client AI narrative | Dillon | Phil review |
| WordPress publish, robots, SiteGround, Semrush, service IA, backlinks | Phil | Mac / SiteGround |
| Blog / content drafts | Melissa R | Phil |
| Account / billing / meeting logistics | Mac / Matt / Melissa Silber | James |
| Facebook / Meta | Benson / Legacy | Out of this lane |
| Business facts (years, address, paint brands) | James | Before schema / copy lock |

## Reporting James already knows

1. **Weekly:** Momentum 360 navy / gold four-page PDF. Last designed client file: Aug 10 to 16 on Drive. Resume in September with Pittsburgh as location, GSC clicks / impressions, pages published, AEO blocker state, and next action. Slack `#fagan-painting` gets the short version.
2. **Monthly (Dillon designed):** Same family as `Momentum-360-July-2026-Fagan-Painting.pdf` sent 2026-08-04 to James, CC Phil, Sean, Mac, Melissa, Matt.
3. **Monthly (Phil Semrush):** EOM keyword / traffic / organic-lead table plus PDF export. Keep it. Do not replace it with GSC-only.
4. **Meeting:** Deck from Aug 11. Next date proposed Sep 15, not confirmed in this pass.

Usual strategic email routing (union of Dillon July closeout and Phil EOM / follow-up):

- To: `faganpainting@gmail.com`
- CC: `philasyr@gmail.com`, `sean@needmomentum.com`, `mac@needmomentum.com`, `mjfrederick334@gmail.com`, `melissa@needmomentum.com`, `mrigby@needmomentum.com`
- From: `dillonmohr8777@gmail.com` with Momentum 360 signature. Not IMMOHRTAL.
- Do not use the Zapier lead-alert list (`melissarobinn@gmail.com`) as the strategic CC.

## Commercial posture for the email

Be honest. The extra $500 / month package is ready and was parked for early September cash flow. Must-fix crawl, schema, and FAQ repairs should start now because they unblock every later citation. The deeper answer-first rebuild, citation log, and 90-day sprint are the add-on. Do not invoice language. Ask James to confirm September 15 and whether to start the written add-on now or run the must-fix layer first.

## Client email

Unsent draft: `client-email.html` in this folder. Gmail draft created in Dillon's mailbox only after this packet is written. Do not send until Dillon approves the exact preview.
