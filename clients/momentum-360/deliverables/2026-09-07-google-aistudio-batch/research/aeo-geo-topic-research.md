# Momentum AI content launch: AEO/GEO topic research

Research date: 2026-09-07. Read-only research; this file is the only output.
Prepared for the five-ebook and blog launch under Dillon Mohr's name, against the offers and initial-customer definition in `..\2026-09-04-ai-division-plan\PLAN.md` ("Three offers with finite delivery contracts", "Initial customer and qualification", and the 2026-09-07 extension).

## How to read the numbers

- **Connector:** the SEO MCP connector identifies itself as **OpenRush** (`describe_capabilities`, domains: ai_visibility, analytics, audit, backlinks, core, gsc, seo, serp). `list_websites` returned an empty list with `connection_required: true`, so no Search Console or Analytics data for needmomentum.com was available. The account ran out of credits at 23:14 UTC (`402 Insufficient credits`); the five `inspect_keyword` calls that failed are listed in section 6.
- **Volume** = tool's `monthly_volume`, United States, English, `source_class: search_index`, provenance confidence 0.7. Twelve-month trend covers Aug 2025 to Jul 2026 (`inspect_keyword` gives 24 months back to Aug 2024).
- **Competition** = the tool's `competition_level` (LOW / MEDIUM / HIGH). The connector returns no organic keyword-difficulty score, so "difficulty" below is this Ads-style competition level, not a KD number.
- **Intent** = tool's `intent` field. **CPC** = tool's `cpc_usd`.
- **n/a** = the tool returned `null` or the call failed. No value below is estimated.
- **SERP** facts are `live_serp`, observed 2026-09-07 ~23:12 UTC, confidence 0.95.
- **AI visibility** facts cover **Google AI Overview only** (not ChatGPT, Claude, Gemini, Perplexity or Copilot), measure "domain cited as a source", and come from a sampled prompt corpus (first call: observed 2025-08-26 to 2026-08-03; second call: "a recent sampled window"), confidence 0.6. Treat movement as directional.

Source tags: [RK] research_keywords · [IK] inspect_keyword · [IS] inspect_serp · [AIV] inspect_ai_visibility · [AIC] discover_ai_citations · [DC] discover_competitors · [WS] WebSearch · [WF] WebFetch · [PLAN] PLAN.md · [SPOT] SPOT-SCRIPT.md in this batch.

---

## 1. Keyword landscape (59 keywords, 12 clusters)

### Cluster 1 — "What is AEO / GEO?" (definition demand; the on-ramp)

| Keyword | Vol/mo | Competition | Intent | CPC | Notes |
|---|---:|---|---|---:|---|
| what is aeo | 4,400 | LOW | informational | $6.84 | [IK] Trend 140 (Aug 2024) → 6,600 (Jul 2026). SERP: tryprofound.com #1, HubSpot #2, content-science #3, Coursera #4, Digiday #5, Salesforce #8. AI Overview + PAA present. |
| answer engine optimization | 2,400 | MEDIUM | informational | $32.53 | [RK] Flat 1,900–2,900 all year. |
| what is answer engine optimization | 590 | LOW | informational | $11.28 | [RK] 210 (Aug 2025) → 2,400 (Jul 2026). |
| generative engine optimization | 4,400 | MEDIUM | informational | $34.79 | [RK] **Declining:** 6,600 (Aug–Sep 2025) → 2,900 (Jul 2026). |
| what is generative engine optimization | 1,000 | LOW | informational | $11.72 | [RK] 590 → 2,400 (Jul 2026). |
| answer engine optimization vs generative engine optimization | 70 | LOW | commercial | $7.93 | [RK] |
| ai engine optimization | 390 | MEDIUM | informational | $43.84 | [RK] Note: Momentum's own Aug 2026 press release renders "AEO" as "AI Engine Optimization" in the fetch summary ([WF], section 2) — reconcile the expansion before the books ship. |

Also returned: "what is answer engine optimization aeo" 170 LOW; "what is aeo answer engine optimization" 90 LOW; "generative engine optimization geo" 1,300 MEDIUM; "what is generative engine optimization geo" 210 LOW [RK].

Read: the acronym "AEO" is the fastest-growing term in the whole set (×47 in 24 months) while the spelled-out "generative engine optimization" is falling. Lead with "AEO" in titles; define GEO once.

### Cluster 2 — "How do I show up in ChatGPT?" (the buyer's actual question)

| Keyword | Vol/mo | Competition | Intent | CPC | Notes |
|---|---:|---|---|---:|---|
| how to get your business on chatgpt | n/a | n/a | informational | n/a | [IK] Volume returned `null`. SERP: Reddit r/DigitalMarketing #1, chatgpt.com/business #2, IMPACT #3, chatgpt.com/merchants #4, ROI Amplified #5, The HOTH #6, eseospace #7, openai.com "ChatGPT for small business program" #8. AI Overview, PAA, video present. |
| how to show up in chatgpt search results for local business | n/a | n/a | n/a | n/a | [IS] Organic: Reddit r/b2bmarketing #1, YouTube "How to Rank Your Local Business on ChatGPT in 2026" #2, digitaldrewsem #3, HubSpot #4, andreashah.com (wedding-vendor angle) #5, Quora #6, pbjmarketing #7. PAA: "How to appear in ChatGPT results?", "How do I get ChatGPT to recommend my business?", "How do I promote my business on ChatGPT?". Related: "How to get my business on ChatGPT", "Bing Places", "Google Business Profile". Features: AI Overview, video, PAA, discussions & forums. |
| how does chatgpt recommend businesses | n/a | n/a | n/a | n/a | [IK] Call failed (402, credits exhausted). |
| chatgpt for small business | 1,900 | LOW | commercial | $8.87 | [RK] 720 (Aug 2025) → 9,900 (Jul 2026). |
| chatgpt for business | 27,100 | LOW | commercial | $13.56 | [RK] Spiky: 165,000 (Aug 2025), 2,900 (Jan 2026), 14,800 (Jul 2026). Navigational to OpenAI's product; do not target. |

Also returned: "chatgpt for small business owners" 110 LOW commercial $38.98; "how to use chatgpt for business" 50 LOW informational $21.43; "is chatgpt for business worth it" 30 LOW commercial $70.75; "is chatgpt secure for business" 40 LOW [RK].

Read: no keyword tool has volume for the plain-English question, yet the live SERP for it is Reddit, Quora, YouTube and vendor blogs, with an AI Overview on top. That is a page nobody with a service-business client base has written well. Target the PAA phrasing verbatim as H2s.

### Cluster 3 — Google AI Overviews (where the connector can actually measure)

| Keyword | Vol/mo | Competition | Intent | CPC | Notes |
|---|---:|---|---|---:|---|
| ai overviews | 110,000 | LOW | informational | $2.77 | [RK] 33,100 (Aug 2025) → 201,000 (Apr 2026) → 110,000 (Jul 2026). |
| google ai overviews | 22,200 | LOW | informational | $6.44 | [RK] |
| how to rank in ai overviews | 260 | LOW | informational | $26.72 | [IK] Peak 1,300 (Sep 2025). SERP: seocrawl.ai #1, SE Ranking #2, developers.google.com "succeeding in AI search" #3, segmetrics #4, Semrush #5, Ahrefs #6, Search Engine Land #7. All written for marketers. |
| how to rank in google ai overviews | 140 | LOW | informational | n/a | [RK] |
| ai overviews tracker | 720 | LOW | commercial | $36.09 | [RK] Buyers looking for measurement, which is the offer's named deliverable. |

Also returned: "what is ai overviews" 1,000 LOW $1.77; "ai overviews seo" 140 LOW commercial $30.40; "hide google ai overviews chrome extension" 5,400 LOW (a signal that a slice of searchers actively dislike the feature — useful colour for the "does AI replace Google" chapter) [RK].

### Cluster 4 — AI search vs. Google (macro framing)

| Keyword | Vol/mo | Competition | Intent | CPC | Notes |
|---|---:|---|---|---:|---|
| does ai search replace google | n/a | n/a | informational | n/a | [IK] Volume `null`. SERP: Reddit r/Bard #1, TIME (2026-05-20) #2, seo.com "Will AI replace Google? The answer is no" #3, Andy Crestodina LinkedIn research #4, Medium #5, Quora #6, MIT Technology Review #7. Features: AI Overview, PAA, discussions & forums, perspectives. |
| ai search | 22,200 | LOW | informational | $3.62 | [RK] Steady 18,100 → 27,100. |
| ai search engine optimization | 8,100 | MEDIUM | commercial | $41.79 | [RK] 12,100 (Sep 2025) → 5,400 (Jul 2026). |
| google search ai mode | 18,100 | LOW | informational | $4.01 | [RK] |

Also returned: "ai-powered search engines" 49,500 LOW commercial; "ai search engine" 12,100 MEDIUM commercial; "perplexity ai search engine" 9,900 LOW [RK].

### Cluster 5 — Buying AEO/GEO and "AI marketing agency" (commercial)

| Keyword | Vol/mo | Competition | Intent | CPC | Notes |
|---|---:|---|---|---:|---|
| answer engine optimization services | 590 | LOW | informational | $24.65 | [RK] 210 → 880 (Jul 2026). |
| answer engine optimization agency | 260 | LOW | navigational | $19.36 | [RK] 90 (Aug 2025) → 590 (Jul 2026). |
| generative engine optimization services | 720 | LOW | commercial | $53.72 | [RK] |
| generative engine optimization agency | 390 | LOW | commercial | $114.49 | [RK] 170 → 1,300 (Jul 2026). |
| ai marketing agency | 1,900 | LOW | commercial | $22.70 | [RK] 880 (Nov 2025) → 3,600 (Jul 2026). |

Also returned: "generative engine optimization companies" 110 LOW commercial $190.62; "best answer engine optimization services" 110 LOW commercial $91.20; "ai marketing agency near me" 320 LOW commercial $22.98; "ai digital marketing agency" 260 LOW; "what is an ai marketing agency" 20 LOW informational [RK]. "ai automation agency" [IK] failed (402).

Read: CPCs of $53–$190 on the agency terms say buyers exist and are expensive to reach with ads; the books are the cheap way in.

### Cluster 6 — AI receptionist and missed-call intake (lane: AI Automation)

| Keyword | Vol/mo | Competition | Intent | CPC | Notes |
|---|---:|---|---|---:|---|
| ai receptionist | 12,100 | LOW | navigational | $33.64 | [RK] 3,600 (Aug 2025) → 90,500 (Jul 2026). |
| ai receptionist for small business | 1,600 | LOW | commercial | $61.34 | [IK] 0 (Aug 2024) → 4,400 (Jul 2026). SERP: NextPhone #1, Reddit r/smallbusiness #2, smash.vc #3, RingCentral #4, GoTo #5, Smith.ai #6, Upfirst #7, Dapta #8. AI Overview, PAA, video. |
| best ai receptionist for small business | 260 | HIGH | commercial | $80.86 | [RK] |
| missed call text back | 390 | MEDIUM | informational | $18.58 | [IK] SERP: help.gohighlevel.com #1, Allo #2, leadsorbit #3, everycatch #4, Weave #5, Upfirst #6, Facebook HighLevel group #7, omnyra #8. AI Overview, PAA, video. |
| ai phone receptionist | 320 | MEDIUM | commercial | $42.12 | [RK] |
| jobber ai receptionist | 140 | MEDIUM | navigational | $26.16 | [RK] Momentum is a Jobber partner per its Aug 2026 release ([WF], section 2). |

Also returned: "ai virtual receptionist" 480 LOW commercial $41.08; "ai receptionist software" 390 LOW commercial $52.32; "dental ai receptionist" 170 MEDIUM $152.07; "ai dental receptionist" 170 LOW $174.95; "ai receptionist for law firms" 90 MEDIUM $50.00; "ai receptionist for hvac" 40 MEDIUM (0 → 110 by Jun 2026); "ai receptionist for contractors" 10 HIGH $40.76 [RK].

Read: this is the second-largest and fastest-moving demand pool in the set, and the SERP is all vendors. A buyer's test checklist written by someone who has to make it work in an HVAC shop is missing.

### Cluster 7 — Lead follow-up, workflows and agents

| Keyword | Vol/mo | Competition | Intent | CPC | Notes |
|---|---:|---|---|---:|---|
| lead follow up | 210 | LOW | informational | $13.78 | [RK] |
| ai lead follow up | 40 | LOW | informational | $38.67 | [RK] |
| automated lead follow up | 20 | LOW | commercial | $35.93 | [RK] |
| ai automation for small business | 210 | MEDIUM | commercial | $19.83 | [RK] |
| ai workflows | 2,900 | MEDIUM | informational | $32.42 | [RK] Rising 2,400 → 3,600. |
| what is an ai agent | 14,800 | MEDIUM | informational | $8.30 | [RK] 8,100 (Dec 2025) → 22,200 (Feb–May 2026). Largest informational term in the automation lane. |

Also returned: "lead follow up system" 50 LOW $44.15; "how to follow up on a lead" 30 LOW; "workflow automation for small business" 110 LOW commercial; "ai tools for small businesses" 880 LOW commercial $18.04; "ai tools for business" 2,400 LOW commercial $69.91; "best ai tools for businesses" 1,000 LOW commercial $51.06 [RK].

### Cluster 8 — Vertical queries (the initial customer's industries)

| Keyword | Vol/mo | Competition | Intent | CPC | Notes |
|---|---:|---|---|---:|---|
| ai for law firms | 1,600 | LOW | commercial | $46.73 | [RK] 880 (Dec 2025) → 2,900 (Jul 2026). |
| ai intake for law firms | 40 | HIGH | commercial | $44.63 | [RK] Note [PLAN]: no legal case records in the founding experiment; intake routing only. |
| ai for hvac companies | 30 | MEDIUM | commercial | $62.74 | [RK] "ai for hvac" 70 MEDIUM $16.87. |
| ai for general contractors | 30 | MEDIUM | commercial | $5.33 | [RK] "ai for electrical contractors" 30 MEDIUM $55.57. |

"ai for local business" 20 MEDIUM commercial $12.99; "ai for restaurants" [IK] failed (402). Landscaping, bridal, painting, dental were not queried before credits ran out; "ai dental receptionist" (170, $174.95) is the only dental datapoint.

Read: vertical "AI for X" demand is tiny except law (1,600). The books should be vertical-agnostic with vertical sidebars, not one book per trade.

### Cluster 9 — AI marketing production (lane: AI Design / AI Marketing)

| Keyword | Vol/mo | Competition | Intent | CPC | Notes |
|---|---:|---|---|---:|---|
| ai marketing tools | 4,400 | LOW | commercial | $34.55 | [RK] |
| ai tools for small businesses | 880 | LOW | commercial | $18.04 | [RK] |
| ai video generator for marketing | 390 | MEDIUM | commercial | $26.62 | [RK] Volatile 40–1,300. |
| how to create a marketing video with ai | 10 | HIGH | informational | $12.03 | [RK] |

Also returned: "ai marketing" 5,400 MEDIUM commercial $32.29; "ai marketing video" 140 MEDIUM; "ai video marketing" 70 MEDIUM $18.86; "ai presentation maker" 12,100 MEDIUM commercial $10.88; "infographic ai" 590 MEDIUM; "small business marketing" 1,300 LOW commercial $30.87 [RK]. "ai in marketing" [IK] failed (402).

### Cluster 10 — Brand voice and consistency

| Keyword | Vol/mo | Competition | Intent | CPC | Notes |
|---|---:|---|---|---:|---|
| brand voice | 1,000 | LOW | informational | $11.50 | [RK] |
| what is brand voice | 390 | LOW | informational | $126.20 | [RK] |
| brand voice guidelines | 170 | LOW | informational | $12.07 | [RK] |

Also: "brand voice examples" 320 LOW $2.33; "brand tone of voice" 140 LOW $26.29 [RK]. "brand consistency ai" returned **zero** suggestions [RK]. Read: the "don't lose the brand" theme has no AI-specific search demand; carry it inside the tools and video queries rather than as a standalone keyword.

### Cluster 11 — Attribution: which leads are real?

| Keyword | Vol/mo | Competition | Intent | CPC | Notes |
|---|---:|---|---|---:|---|
| marketing attribution | 720 | MEDIUM | informational | $55.45 | [IK] **Declining:** 1,600 (Aug 2024–Jan 2025) → 720 (Jul 2026). SERP: marketingattribution.com #1, Amazon Ads #2, Supermetrics #3, Wikipedia #4, Adobe #5, Domo #6, HubSpot #7. All enterprise-framed. |
| what is attribution in marketing | 480 | LOW | informational | $10.10 | [RK] |
| lead attribution | 70 | LOW | informational | n/a | [RK] Top-of-page bid range $10.00–$55.74. |
| call tracking | 1,600 | LOW | informational | $33.86 | [RK] |
| call tracking software | 880 | LOW | commercial | $57.87 | [RK] |
| how to track leads from google ads | n/a | n/a | n/a | n/a | [IK] Failed (402). "google ads lead tracking" 10 LOW [RK]. |
| crm for small business | 3,600 | MEDIUM | commercial | $54.52 | [RK] "best crm for small business" 2,900 LOW $53.69. |

Also: "what is lead attribution" 20; "lead source attribution" 10; "call tracking number" 210 MEDIUM $25.76; "marketing mix modeling" 2,900 MEDIUM $69.24 (enterprise) [RK].

Read: the attribution book will not win on search volume. Its buyer language is "which leads came from my ads / are my leads real", which the tools cannot see. Its job is differentiation and sales enablement, not traffic.

### Cluster 12 — Operating system / SOPs (theme d)

| Keyword | Vol/mo | Competition | Intent | CPC | Notes |
|---|---:|---|---|---:|---|
| standard operating procedures for small business | 40 | MEDIUM | informational | $19.02 | [RK] |
| how to use ai in my business | 30 | MEDIUM | informational | $72.20 | [RK] "how to use ai in my small business" 10. |
| workflow automation for small business | 110 | LOW | commercial | n/a | [RK] |

Read: the "workflows and operating system" theme has almost no demand under SOP language and real demand under "ai workflows" (2,900) and "what is an ai agent" (14,800). Reframe theme (d) as the AI operating system, not the SOP manual.

---

## 2. AI visibility check (Google AI Overview only)

### needmomentum.com

`inspect_ai_visibility` (solo) [AIV], corpus observed 2025-08-26 → 2026-08-03: **81 citations**. Sample answers where needmomentum.com was cited as a source, with the question and the co-cited sources:

| Question in corpus | needmomentum.com page cited | Co-cited alongside |
|---|---|---|
| "online marketing company in usa" | needmomentum.com/ | thriveagency.com, smartsites.com, moburst.com, ibisworld.com, hawkemedia.com, feedbird.com |
| "google ads management near me" | /google-ads/ | thirdmarblemarketing.com, digitalthirdcoast.com, clicksgeek.com, seoteric.com, aiad.com.au |
| "custom designed website" | /diy-web-design/ | YouTube ×2, designity.com, octaveagency.com, freshbooks.com, pcmag.com, others |
| "google postcards" | /verify-google-my-business-account-with-a-postcard/ | support.google.com ×5, YouTube ×2, thirdmarblemarketing.com, amyntas.in |
| "community guidelines ig" | /instagram-marketing-for-cannabis-dispensaries/ | about.instagram.com, agorapulse.com, help.instagram.com, facebook.com/help |

Fact: none of the five sampled citations is on an AI, AEO or automation topic. Momentum's current AI-answer footprint is its legacy how-to content (GBP verification, Google Ads, DIY web design). The pages that get cited are specific, evergreen procedures.

### Competitor set (same call, competitors batched) [AIV]

| Domain | Citations | Share of set | Rank | Location / basis |
|---|---:|---:|---:|---|
| thriveagency.com | 4,998 | 42.78% | 1 | Not a PA agency; included as the national benchmark because the corpus cited it next to needmomentum.com for "online marketing company in usa". |
| webfx.com | 4,981 | 42.63% | 2 | Harrisburg, PA per [PLAN]; the page fetched does not state a location. |
| seerinteractive.com | 1,070 | 9.16% | 3 | Philadelphia HQ, founded 2002 (seerinteractive.com via [WS]). |
| 1digitalagency.com | 553 | 4.73% | 4 | Philadelphia, founded 2012 (1digitalagency.com via [WS]). |
| **needmomentum.com** | **81** | **0.69%** | **5** | Philadelphia, 1635 Market St #1601 (lengreo.com list via [WF]). |
| muscularmarketing.com | 0 | 0% | 6 | Publishes "AEO for Franchises in Philadelphia" page ([WS]); zero citations in corpus. |

Scope note from the tool: "Small and new brands may legitimately show zero."

### What the category cites instead (topic = "answer engine optimization") [AIC]

Top 20 sources by citation count, share in parentheses: youtube.com 5,000 (28.3%), reddit.com 2,456 (13.9%), semrush.com 1,464 (8.3%), developers.google.com 1,352 (7.7%), linkedin.com 856 (4.9%), mtu.edu 680, quora.com 592, wix.com 504, en.wikipedia.org 456, digitalmarketinginstitute.com 456, coursera.org 440, searchengineland.com 424, searchenginejournal.com 408, salesforce.com 400, medium.com 400, bruceclay.com 376, shopify.com 360, forbes.com 360, moz.com 352, ahrefs.com 328. `category_confidence: explicit`.

Fact: one agency (bruceclay.com) is in the top 20; the rest are platforms, publishers, forums and tool vendors. Reddit and Quora together hold 17% of citations in this category. Practical consequence: answers posted on Reddit/Quora and video on YouTube are citable surfaces, not just needmomentum.com pages.

### Organic competitors on the launch's seed queries [DC]

Seed-keyword mode over "answer engine optimization", "generative engine optimization", "ai search optimization for local business", "ai marketing agency", "ai automation agency small business": reddit.com (avg pos 4), developers.google.com (avg pos 1), coursera.org (4.5), youtube.com (10.3), semrush.com (20.5), o8.agency (31.3), linkedin.com (32), mindstudio.ai (32.5), surferseo.com (33), foundationinc.co (41.5). No Philadelphia agency appears in the top 10 overlap set.

### Competitor facts that can be quoted (sourced)

- **WebFX:** "Starting at $3,000/month" for GEO Services on `webfx.com/seo/services/ai-search-optimization/` ([WF] 2026-09-07). Deliverables named on page: "AI query research & targeting strategy", "Content assets for building authority", "Exclusive AI visibility tracking software"; platforms named: Google AI Overviews and AI Mode, ChatGPT, Perplexity, Copilot, Meta AI. WebFX's cost article (`/blog/ai/generative-engine-optimization-cost/`, dated May 26, 2026) gives agency ranges of "$1,500 – $5,000 per month" (small business), "$5,000 to $25,000+" (mid) and "$25,000 – $50,000+" (enterprise), and DIY tools "$10 – $1,000+ per month". This confirms the plan's $3,000 anchor from the primary vendor page, which the plan flagged as unverified.
- **Seer Interactive:** GEO service page "Updated August 2026"; Seer states it has been "in AI search since January 2023" and that "since January 2025, 15% of Seer's inbound conversions have been from someone who found them in an LLM"; 130+ enterprise clients; Chief AI Officer Alisa Scharf (seerinteractive.com pages via [WS]). Enterprise-positioned; not an SMB competitor.
- **1Digital Agency:** AEO services page describes "content audits, question/answer rewrites, FAQ/HowTo/Product schema, entity linking, content clustering" and a proprietary "WorkspaceCRM" that "runs weekly prompt panels across ChatGPT, Perplexity, Gemini, Claude, Google AI Overviews" (1digitalagency.com via [WS]). E-commerce focus.
- **Lengreo's "10 Best AEO, GEO, and LLMO Companies in Philadelphia"** (published 2025-09-30, updated 2026-06-25) lists Momentum Digital at #10 with SEO Locale, Arc Intermedia (King of Prussia), Single Grain, First Page Sage, Seer, BCC Interactive, 1SEO (Bristol, PA) and Sagapixel; no prices stated for any firm ([WF]).
- **Momentum's own public claims** (PRWeb, 2026-08-21, [WF]): third consecutive Inc. 5000, #124 Philadelphia-Camden-Wilmington metro, #145 Pennsylvania, #391 Advertising/Marketing/PR; 11th year; all 50 states; services named include AI search optimization, AEO, GEO, automation, chatbot integration; partnerships: Google Partner, Meta Business Partner, Mailchimp, Wix, Jobber; **no named clients or case studies; no quote from Dillon Mohr.** The fetch summary expanded the acronyms as "AI Engine Optimization" and "Geographic Engine Optimization" — check the release text; the books should use Answer/Generative consistently.
- **Discrepancy with PLAN.md:** the plan states "needmomentum.com has no AEO page". A domain-restricted search returns `needmomentum.com/answer-engine-optimization/` titled "Answer Engine Optimization in 2026 for AI Search Visibility" ([WS]), plus `/zero-click-searches/`, `/googles-sge-affects-small-business-rankings/` and `/how-to-use-ai-for-seo-keyword-research/`. Two WebFetch attempts (www and bare host) returned an empty body, so whether it is a service page with scope and price or an editorial article is **unverified**; the search snippet reads as editorial (zero-click, structured content). Someone with a browser should check before the AEO book links to it.

---

## 3. Five ebook briefs

Constraints carried from [PLAN] and [SPOT]: no client names without authorisation; no numbers that were not measured; no guarantees of rankings, citations, leads or revenue; "Built, not prompted." is the launch tagline; named-lead match-back is not sold until the Zap fix lands. All titles below are working titles.

### Book A — "Show Up When They Ask AI"

- **Promise:** An owner of a local service business finishes this book knowing the 20 questions their buyers ask AI engines, whether their business is cited today, and the six page-level changes that make it citable — with a way to measure it monthly that does not depend on a ranking number.
- **Target reader:** Owner of an established contractor, HVAC, landscaping, bridal, painting, restaurant, law or dental business who has heard "AEO" from a salesperson and wants a straight answer before spending $1,500–$3,000 a month.
- **Questions it must answer** (cluster → evidence):
  1. What is AEO, and how is it different from SEO and GEO? (C1: "what is aeo" 4,400; "answer engine optimization" 2,400; "AEO vs GEO" 70)
  2. How do I get my business to show up in ChatGPT? (C2: PAA "How do I get ChatGPT to recommend my business?")
  3. Does AI search replace Google for a local business? (C4 SERP; C3 "ai overviews" 110,000 and "hide google ai overviews chrome extension" 5,400 as the two-sided evidence)
  4. How do I rank in Google AI Overviews? (C3: 260 + 140)
  5. Which sources do AI engines actually cite in my category, and can a small business get in? ([AIC] top-20 map; Reddit/Quora/YouTube share)
  6. How do I measure it when there is no ranking? (C3 "ai overviews tracker" 720; the offer's engine/prompt/date/source rule)
  7. What does AEO cost and what should a retainer include? (C5; WebFX $3,000 anchor; the AI Visibility Program scope)
- **Primary cluster:** C1 + C2 (secondary C3, C4, C5).
- **Outline:**
  1. The question changed — from "who ranks" to "who gets cited" (zero-click, AI Overviews, ChatGPT)
  2. AEO, GEO, SEO: one table, one paragraph each, and why "AEO" is the word customers use
  3. Does AI search replace Google? What the numbers say and what a service business should do about it
  4. The 20-question baseline: how to find your buyers' questions and test two engines
  5. Who AI cites in your category (and why Reddit, YouTube and Google's own docs beat agencies)
  6. Six page changes that make a business citable: service page, GBP, reviews, FAQs, author, schema
  7. Measuring without a rank: engine, prompt, date, source on every observation
  8. What to buy, what to skip, what a fair retainer looks like
- **Evidence the book needs from Momentum's own work (type, not numbers):** the 20-question baseline run against needmomentum.com itself on two engines, dated, with sources (the offer's own deliverable, applied to the author first); a before/after citation screenshot pair for one page change on one client site, with client permission; the connector's own count for needmomentum.com (81 citations, rank 5 of 6 in a named set) as the honest "we measured ourselves before selling this" opener; the list of Momentum pages that already get cited (GBP postcard how-to, Google Ads page) as proof that specific procedural content earns citations.

### Book B — "From Missed Call to Booked Job"

- **Promise:** Shows an owner how to build one intake-to-follow-up workflow — call, text or form in; deduplicated; routed; a drafted reply a human sends; an exception queue — that a named employee can run, and how to test it with 30 cases before trusting it.
- **Target reader:** The same owner, specifically one who knows calls are being missed after hours and leads sit in an inbox; has a CRM or booking tool (Jobber, HighLevel, ServiceTitan, a spreadsheet) and one employee who could own it.
- **Questions it must answer:**
  1. What is an AI receptionist, and does a small business need one? (C6: 12,100; 1,600; SERP is vendor listicles)
  2. What is missed-call text-back, and what should the first text say? (C6: 390; SERP led by a HighLevel help doc)
  3. How fast should I follow up, and what does the sequence look like? (C7: "lead follow up" 210; "ai lead follow up" 40 at $38.67)
  4. What is the difference between an AI agent and an automation, and which do I need first? (C7: "what is an ai agent" 14,800; "ai workflows" 2,900; [PLAN] "begin with a simple workflow and add agents when the task requires them")
  5. Which tools fit a field-service business and what do they cost? (C6 branded queries: Jobber, RingCentral, Weave, Smith.ai, Upfirst)
  6. How do I know it works before it touches real customers? (the pilot's acceptance: 30 named test cases, ≥95% pass, 100% destination readback, 5 supervised operator cases)
  7. What must stay human, and what must never be automated? ([PLAN]: no healthcare or legal case records; business-hours acknowledgment, not 24/7 promises)
- **Primary cluster:** C6 + C7 (secondary C8).
- **Outline:**
  1. The lead that never called back: where service-business leads actually leak
  2. Receptionist, text-back, router, agent: four things people mean by "AI answering"
  3. The first sixty seconds: text-back scripts, timing and the hand-off rule
  4. One intake source, one destination, one route: designing the workflow on paper first
  5. Follow-up sequences that do not sound like a robot (draft-then-human-sends)
  6. The 30-case test: how to prove it works, log failures and assign owners
  7. Tools for the trades: Jobber, HighLevel and the phone-system receptionists, compared on what they log
  8. Running it: the operator, the exception queue and the monthly improvement
- **Evidence the book needs:** the scenario test log from the home-services (garage-door) missed-call proof of concept referenced in [PLAN] — number of scenarios, pass rate, which ones failed and why; the Lead Operations Pilot acceptance scorecard itself as a printable checklist; a before/after on time-to-first-response for one home-services account, with permission; the parsed-email lead flow on the one painting account where intake data is captured in the message body ([PLAN]: the only account where the loop closes) as the reference implementation; Momentum's Jobber partnership as the field-services context.

### Book C — "Built, Not Prompted"

- **Promise:** How to use AI for design, video and copy production and end up with work that still looks like your business — by writing the brand down and putting a measurable gate in front of anything that ships.
- **Target reader:** The owner (or the office manager who "does the Facebook") who has tried Canva AI or ChatGPT copy, got something generic, and wants a system rather than better prompts. Also the small agency producing for such owners.
- **Questions it must answer:**
  1. What is a brand voice, and how do I write one down so AI can follow it? (C10: 1,000; 390; 170)
  2. Which AI marketing tools are worth it for a small business? (C9: "ai marketing tools" 4,400; "ai tools for small businesses" 880)
  3. Can AI make my marketing video, and will it look cheap? (C9: 390; "how to create a marketing video with ai" 10 HIGH)
  4. How do I keep colour, type and logo consistent across AI output? (C10 "brand consistency ai" = 0 volume — answered inside the tools chapter)
  5. How do I know a design "fails the design test"? (contrast and accessibility as a build gate, from the design-system audit)
  6. What should an AI marketing agency actually deliver each month? (C5: "ai marketing agency" 1,900; "what is an ai marketing agency" 20; the Campaign Production System scope)
  7. What does a month of AI campaign production cost and what is excluded? ([PLAN]: $750 / $1,250; no shoot, no custom animation, no paid placement)
- **Primary cluster:** C9 + C10 (secondary C5).
- **Outline:**
  1. Prompted vs built: why generic output is a system problem, not a prompt problem
  2. Write the brand down: voice, tone, claims you can make, claims you cannot
  3. Tokens, not taste: colour, type, spacing and radius as a file the tools read
  4. The gate: contrast, legibility and the one-token-cannot-do-two-jobs rule
  5. Four concepts, eight variants: a production month for one brand
  6. AI video without the uncanny: what to generate, what to shoot, what to overlay
  7. Tools that respect a brand file, tools that do not
  8. Hiring for this: what to ask an agency that says "AI marketing"
- **Evidence the book needs:** Momentum's own contrast audit — the new system's measured pairs with zero failures, and the drift audit across ten shipped prospect builds with its AA failures, near-misses and one invisible eyebrow ([PLAN] design section) — told as "we measured our own work first"; the accent-colour finding (one orange cannot be both field and text) as the worked example; the measured deck-assembly turnaround from [PLAN] presented as one measured example, not an SLA; one brand's brief → four concepts → eight size variants from the Campaign Production System, with permission.

### Book D — "The Small Business AI Operating System"

- **Promise:** The operating system Momentum runs itself on — one client registry, one source of truth per client, reusable skills that carry the brand's assets, and approval gates for anything that sends, spends or publishes — translated into what a 5–25-person service business or small agency can copy in 30 days.
- **Target reader:** The owner who has bought three AI tools and has no system; the small-agency owner who wants to deliver AI work repeatably. Reframed from "SOPs" because SOP queries are ~40/mo and "what is an ai agent" is 14,800.
- **Questions it must answer:**
  1. What is an AI agent, and what is just an automation? (C7: 14,800; 2,900)
  2. How do I use AI in my business without breaking what already works? (C12: 30 at $72.20 CPC; C7 "ai automation for small business" 210)
  3. Which AI tools does a small business actually need? (C7/C9: "ai tools for business" 2,400; "best ai tools for businesses" 1,000)
  4. What should stay human — approvals, sends, spend, deletes? ([PLAN] approval gates)
  5. How do I write the one page that tells the AI who the client is? (per-client context; "tell the code who the client is")
  6. How do I measure whether the machine is working? ([PLAN] metrics: task success, critical errors, human repair minutes, cost per accepted artifact, latency)
  7. Do I need SOPs first? (C12: 40 — answer: the workflow is the SOP)
- **Primary cluster:** C7 + C12 (secondary C9).
- **Outline:**
  1. Tools are not a system: what an operating system is for a small business
  2. Agents, workflows, automations: plain definitions and a decision table
  3. One source of truth: the client registry and the per-client context page
  4. Skills that carry your assets: brand file, deck template, report template, intake checklist
  5. Gates: what a human approves, and how the machine asks
  6. Plan, critique, repair, accept: the loop and its five numbers
  7. The first 30 days: one workflow, one operator, one dashboard
  8. When to add an agent, and when not to
- **Evidence the book needs:** the honest before-state of Momentum's own operating system from [PLAN] — the registry field that is populated for only a handful of records, the inbox-triage backlog, the vault/Slack naming divergence — described as "here is what we found when we audited ourselves", with numbers only if Dillon authorises them; the five Momentum skills and what each carries; the plan → critique → repair → acceptance loop with its instrumented metrics from at least one delivered task; the one-setup-per-week / two-active-builds capacity rule as the scheduling example.

### Book E — "Names, Not Numbers"

- **Promise:** How to know which real people your marketing produced — call tracking, parsed form emails, a CRM source field, and a match-back from platform "conversions" to named leads — and why the platform totals disagree with your phone.
- **Target reader:** The owner who is paying an agency or Google directly and asks "are these leads real?"; the agency that keeps promising a lead list and cannot produce it. Lowest search demand of the five; highest sales value.
- **Questions it must answer:**
  1. What is marketing attribution, in plain terms? (C11: 720 declining; 480)
  2. What is lead attribution / lead-source attribution? (C11: 70; 10)
  3. How do I track leads from Google Ads to actual customers? (C11: "google ads lead tracking" 10; "how to track leads from google ads" n/a)
  4. What is call tracking and do I need call-tracking software? (C11: 1,600; 880)
  5. Which small-business CRM makes attribution possible? (C11: 3,600; 2,900)
  6. Why do my ad platform's conversions not match my phone ringing?
  7. How do I do a match-back with a spreadsheet and one integration change?
- **Primary cluster:** C11.
- **Outline:**
  1. Conversions are not customers: the gap every report hides
  2. Attribution for a business with a phone, a form and a front desk
  3. The three plumbing fixes: tracking number, parsed form email, CRM source field
  4. Call tracking without wrecking your listings
  5. The match-back worksheet: platform export → named lead → job
  6. The one integration change that makes or breaks it (notification links vs. parsed data)
  7. Reading the monthly report: which real people, from which source
  8. What to demand from any agency, including us
- **Evidence the book needs:** the four-account contrast from [PLAN] — one account where match-back works because leads are parsed into the email body, three where the Zapier notification carries only a link — as "one configuration difference, thirteen broken promises", anonymised unless authorised; the access lesson from the landscaping account whose Google Ads export could not be authorised (Standard vs Admin) as the "get admin access before you promise" chapter; a completed match-back for one account in the fixed state — **this book cannot publish until the Zap fix in [PLAN] has landed and produced at least one true month**, because a book about naming leads that Momentum cannot yet name for three of four accounts would repeat the thirteen promises in print.

### Theme adjustments the data forced

- (a) AEO/GEO: strongest and fastest-rising demand; unchanged. Use "AEO" not "GEO" in titles.
- (b) Automation: demand is concentrated on "AI receptionist" and "missed call"; the book leads with intake, not generic automation.
- (c) Production: "brand consistency + AI" has zero search demand; the book rides "ai marketing tools" and the tagline.
- (d) Workflows/OS: SOP language is dead (40/mo); reframed around agents and workflows (14,800 + 2,900).
- (e) Attribution: the term is declining (1,600 → 720) and "lead attribution" is 70/mo; kept because it is the differentiator, sequenced last, gated on the fix.

---

## 4. Blog calendar (10 posts)

| # | Title | Target query (vol, comp, intent) | Feeds | Angle (3 lines) |
|---|---|---|---|---|
| 1 | What is AEO? Answer engine optimization explained for a local business | "what is aeo" (4,400, LOW, informational) [IK] | A | The page-one answers are Profound, HubSpot, Salesforce — written for marketers. Define AEO/GEO/SEO in one table an HVAC owner can read in two minutes. Close with the 20-question baseline template as the download. |
| 2 | How do I get my business to show up in ChatGPT? | PAA "How do I get ChatGPT to recommend my business?" + "how to get your business on chatgpt" (n/a) [IK][IS] | A | Reddit and Quora rank because nobody with a client base answered plainly. List the surfaces AI cites (GBP, Bing Places, reviews, one clear service page, forum answers). Show Momentum's own citation count as the honest baseline. |
| 3 | Does AI search replace Google for a local business? | "does ai search replace google" (n/a; SERP: TIME, seo.com, Reddit) [IK] | A | Use the demand data itself: 110,000/mo search "ai overviews", 5,400/mo search how to hide them. What changes for a service business (zero-click, citations) and what does not (GBP, reviews, the phone). |
| 4 | How to rank in Google AI Overviews: the local-service version | "how to rank in ai overviews" (260, LOW, $26.72) + "how to rank in google ai overviews" (140) [IK][RK] | A | Every ranking guide is by an SEO tool vendor. Write it for one trade: which page types get cited (Momentum's cited pages are procedures), Google's own guidance, the one page to fix first. |
| 5 | AI receptionist for a small business: what it is, what it costs, what to test | "ai receptionist for small business" (1,600, LOW, commercial, $61.34) [IK] | B | The SERP is vendor listicles. Give the buyer's 30-case test checklist instead. Draw the line between a receptionist and a routing workflow; note Jobber/HighLevel fit for field services. |
| 6 | Missed-call text-back: the first text, the next three, and what to log | "missed call text back" (390, MEDIUM, informational) [IK] | B | #1 is a HighLevel setup screen, not advice. Provide the script, timing and the human hand-off rule. Name the log fields that make a later match-back possible (bridge to E). |
| 7 | AI lead follow-up: the sequence that does not sound like a robot | "lead follow up" (210) + "ai lead follow up" (40, $38.67) + "automated lead follow up" (20) [RK] | B | Low volume, high CPC means buyers, not browsers. Publish the draft-then-human-sends sequence from the pilot design. Show what to measure: time to first response, exceptions per week. |
| 8 | AI marketing tools for a small business: the ones that respect your brand | "ai marketing tools" (4,400, LOW, commercial) + "ai tools for small businesses" (880) [RK] | C | Tool lists are commodity; the gate is the differentiator. Explain the brand file and the contrast check before anything ships. Use Momentum's own audit of its shipped work as the cautionary example. |
| 9 | What is an AI agent? (And what is just an automation) | "what is an ai agent" (14,800, MEDIUM, informational) [RK] | D | Largest informational term in the set; the SERP will be vendor definitions. Answer for an owner with the rule from the plan: start with a workflow, add an agent only when the task needs it. Decision table, then the OS preview. |
| 10 | Marketing attribution for a small business: which leads did your ads actually produce? | "what is attribution in marketing" (480, LOW) + "marketing attribution" (720, MEDIUM, $55.45) + "call tracking" (1,600) [RK][IK] | E | Why platform conversion counts and the phone log disagree. The three plumbing fixes and the match-back worksheet. Publish only after the Zap fix so the worked example is true. |

Format notes for every post, because the goal is citation, not just ranking: H2s in the exact question form; a 40–60-word direct answer under each H2; an author page for Dillon Mohr; FAQ schema; publication and updated dates visible. Given [AIC], also post the short-answer version of posts 2, 5 and 9 as replies on the relevant Reddit threads (r/DigitalMarketing, r/smallbusiness) and as a YouTube short; those surfaces hold 42% of citations in the category.

---

## 5. Launch sequence

**Lead book: A, "Show Up When They Ask AI".** Reasons, in order of weight:
1. Demand: "what is aeo" grew ×47 in 24 months and the definitional cluster (C1) is the only one where informational volume, low competition and a buying cluster (C5, CPCs $53–$190) line up.
2. Offer fit: it is the AI Visibility Program's own deliverable (20-question baseline, two engines, source-linked report), so the book is a sales document for the second offer and the free "15-minute qualification snapshot".
3. Positioning: [PLAN] states no Philadelphia SMB agency has named an AI division; Lengreo already lists Momentum among Philadelphia AEO/GEO firms; the AI Overview citation map shows no local agency owns the category. The first lane on screen in the launch spot is "AEO / GEO" [SPOT].
4. Existing assets: needmomentum.com already has an indexed AEO page and zero-click / SGE articles to update rather than start cold.

Book B goes second because "ai receptionist" is the largest fast-moving demand pool and it sells the flagship Lead Operations Pilot. C third, tied to the tagline. D fourth. E last, gated on the fix.

| Week | Publish | Purpose |
|---|---|---|
| 1 | Blog 1, Blog 2; **Book A** (PDF plus every chapter as a crawlable HTML page — a gated PDF alone cannot be cited) | Own the definition and the buyer's question in the same week the spot runs. Start the 20-question baseline on needmomentum.com itself and date it. |
| 2 | Blog 3, Blog 4 | Extend A's cluster into the "does it replace Google" and "AI Overviews" questions; both have AI Overviews on the SERP today. |
| 3 | Blog 5, Blog 6; **Book B** | Move from discovery to intake. Blog 5 targets the highest-CPC commercial query in the set. |
| 4 | Blog 7, Blog 8; **Book C** | Close the automation cluster; open production with the tagline book. |
| 5 | Blog 9; **Book D** | The 14,800/mo "what is an ai agent" post carries D. |
| 6 | Blog 10; **Book E only if the match-back Zap fix has landed** and one month of named-lead reporting exists. Otherwise publish the week-1 baseline re-measurement post ("what changed in 30 days") in E's slot and hold E. | The re-measurement is the audit trail the offer sells; it also re-runs `inspect_ai_visibility` on needmomentum.com against the same competitor set for a before/after. |

Cross-cutting: re-run `inspect_ai_visibility` for needmomentum.com with the same five competitors at week 6 and monthly after; the book about measurement must itself be measured with the same tool, or the claim "every observation has engine, prompt, date and source" is not true of Momentum's own content.

---

## 6. Method: exactly what was run

OpenRush MCP connector (`mcp__abeef63e-...`), all calls location "United States", language English, 2026-09-07 23:10–23:14 UTC:

| Tool | Calls | Result |
|---|---:|---|
| `describe_capabilities` | 1 | Returned 18 tools across 8 domains; defaults US/English. |
| `list_websites` | 1 | Empty; `connection_required: true`. No owned-data (GSC/GA) access. |
| `research_keywords` mode=ideas | 5 | Seeds: "answer engine optimization", "AI for small business", "AI lead follow up", "marketing attribution small business", "AI marketing for small business". All returned 30 rows but the "ideas" expansion is category-level noise (e.g. "google colab", "character ai", "dropshipping business"); only a handful of rows were usable and are cited above where used. |
| `research_keywords` mode=suggestions | 22 | Returned data: "answer engine optimization" (30 of 53), "generative engine optimization" (30 of 128), "chatgpt for business" (30 of 187), "ai search" (30 of 5,439), "ai receptionist" (30 of 259), "lead follow up" (30 of 251; cache hit), "lead attribution" (23), "call tracking" (30; mostly FedEx/UPS noise, four rows usable), "ai marketing agency" (30 of 69), "ai video marketing" (30 of 57), "ai overviews" (30 of 168), "brand voice" (30 of 677), "ai for law firms" (26), "ai for hvac" (7), "standard operating procedures small business" (4), "ai for contractors" (3), "workflow automation small business" (3), "ai automation for small business" (2), "ai for local business" (2), "how to use ai in my business" (2), "google ads lead tracking" (1). **Zero rows:** "how to show up in ChatGPT", "brand consistency ai". |
| `inspect_keyword` | 12 | **Succeeded (7):** "what is aeo", "how to get your business on chatgpt" (volume null, SERP returned), "does ai search replace google" (volume null, SERP returned), "ai receptionist for small business", "missed call text back", "marketing attribution", "how to rank in ai overviews". **Failed 402 Insufficient credits (5):** "how to track leads from google ads", "ai automation agency", "ai for restaurants", "ai in marketing", "how does chatgpt recommend businesses". |
| `inspect_ai_visibility` | 2 | needmomentum.com solo (81 citations, 5 sample answers); needmomentum.com vs webfx.com, seerinteractive.com, 1digitalagency.com, muscularmarketing.com, thriveagency.com (ranked set). |
| `discover_ai_citations` | 1 | topic="answer engine optimization", 20 sources, `category_confidence: explicit`. |
| `inspect_serp` | 1 | "how to show up in chatgpt search results for local business", depth 10. |
| `discover_competitors` | 1 | seed_keywords mode, 5 seeds, 10 of 232 returned. |
| `inspect_domain`, `audit_site`, `inspect_backlinks`, `compare_keyword_coverage` | 0 | Not run; credits exhausted before `inspect_domain` on needmomentum.com could be attempted. |

WebSearch (9): Philadelphia AEO agencies; WebFX GEO pricing (×2); Philadelphia "AI division" 2026 (no such announcement found); ChatGPT Ads self-serve May 2026; needmomentum.com AEO; seerinteractive.com (domain-restricted); 1digitalagency.com (domain-restricted); needmomentum.com "answer engine optimization" (domain-restricted); openai.com "new ways to buy ChatGPT ads" and "small business program" (domain-restricted).

WebFetch (10): **returned content** — PRWeb Momentum Inc. 5000 release (2026-08-21); webfx.com AI search optimization services page; webfx.com GEO cost article (2026-05-26); lengreo.com Philadelphia AEO/GEO/LLMO list. **Empty body** — needmomentum.com/answer-engine-optimization/ (www and bare host; page exists in the index, body not retrievable); developers.google.com "succeeding in AI search" (×2; navigation only, though the summariser reported the article's line that no special optimisation is needed — unverified). **403** — openai.com "new ways to buy ChatGPT ads"; openai.com "ChatGPT for small business program". For the two OpenAI posts, only search-snippet facts are used: self-serve Ads Manager beta open to "SMBs and startups to global brands", CPC bidding added to CPM, expansion to 31 European markets; and the SMB program's webinars, in-person academies, partner integrations (Dropbox, Shopify, Intuit, Slack, Atlassian, Wix), with OpenAI's stated Jam results "78% of participants built a functional AI workflow in a single day" and "42% saved more than five hours a week" — OpenAI's figures, not independently verified. The plan's "2026-05-05, no minimum" claim for ChatGPT Ads is supported by third-party coverage (the-decoder.com, briefs.co via [WS]) but the primary post could not be fetched.

Local reads: `PLAN.md` (offer definitions, initial customer, extension), `SPOT-SCRIPT.md` and `research\copy-skills-scan.md` in this batch (launch messaging and "what not to say"), and a grep of `client-operations\registry\clients.json` to confirm the verticals of the accounts named in the plan (Fagan Painting, Kimberly James Bridal, Omega Landscaping and Concrete, Shadow Heating and Cooling, Fresh Blends / Kwik Trip). No client-operations file was modified.

Not done and worth doing when credits are refilled: `inspect_domain needmomentum.com` (current ranking footprint for the blog calendar's internal-link plan); `inspect_keyword` on the five failed queries; `research_keywords` suggestions for landscaping, bridal, painting and dental "AI for" queries; and the same `inspect_ai_visibility` competitor set re-run at week 6.
