# BigOrange Supporting Articles — AEO / GEO / SEO Gap Report

**Prepared:** 2026-09-01  
**Auditor scope:** ART-01 and ART-02 against `AEO-GEO-SEO-CONTENT-STANDARD.md` (2026-08-28)  
**Sources audited:**

| Asset | Canonical markdown | Branded WordPress HTML | WP draft | Schema candidate |
| --- | --- | --- | --- | --- |
| ART-01 | `2026-08-28-content-authority-proposal/content/supporting-article-01-interview-integrated.md` | `2026-08-03-custom-home-builder-authority-hub-pilot/wordpress/branded-articles/supporting-article-01-branded.html` | Post **5550** | `release/schema/ART-01.schema.json` |
| ART-02 | `2026-08-28-content-authority-proposal/content/supporting-article-02-interview-integrated.md` | `.../supporting-article-02-branded.html` | Post **5552** | `release/schema/ART-02.schema.json` |

**Standard reference:** `2026-08-28-content-authority-proposal/implementation/AEO-GEO-SEO-CONTENT-STANDARD.md`

---

## Executive summary

Both supporting articles have strong editorial bones (numbered sections, checklists, hub CTAs, no ranking promises) but **fail the answer-ready AEO/GEO contract** on the highest-leverage extractors: direct-answer blocks, definition boxes, visible FAQ sections, FAQPage schema parity, Speakable-style Q&A pairs, and attributable sources.

**Blocking cross-system issue:** ART-01 markdown and WP post 5550 are **not the same article**. The markdown owns the diagnostic query *"home builder website not generating leads"*; the WordPress draft and Gmail draft title own *"What a Custom Home Builder Website Must Include"*. Slug, H1, title tag, schema headline, and body copy diverge. Publication cannot proceed until leadership picks one canonical reader job and reconciles all surfaces.

ART-02 markdown and WP 5552 are substantially aligned on title and topic, but the branded HTML omits one markdown section and two planned cluster links.

Neither article meets the user's **5–8 visible FAQ** bar. The August 28 content-system QA already recorded `faq_schema_entities: 0` and `visible_faq_entities: 0` for both assets (`release/qa/content-system-qa.json`), while peer assets (WEB-01, STR-01, etc.) ship five FAQs plus matching FAQPage markup.

---

## Scoring key

| Status | Meaning |
| --- | --- |
| **Present** | Meets standard as written |
| **Partial** | Substantive content exists but not in the required extractable form, or present in one surface only |
| **Missing** | Not found in audited sources |

---

## ART-01 — Why Your Home Builder Website Is Not Generating Qualified Leads

**Canonical markdown only** unless noted. WP 5550 is a **different article** (see cross-system table below).

### Cross-system divergence (blocking)

| Field | Markdown (`supporting-article-01-interview-integrated.md`) | WP 5550 branded HTML / Gmail draft |
| --- | --- | --- |
| H1 | `Why Your Home Builder Website Is Not Generating Qualified Leads` (line 19) | `What a Custom Home Builder Website Must Include` (HTML line 218) |
| Title tag (frontmatter) | `Why Home Builder Websites Miss Qualified Leads` (line 6, 46 chars) | Not set in HTML; Gmail uses H1 wording |
| Primary query | `home builder website not generating leads` (line 9) | Implied: `custom home builder website` (pilot slug `custom-home-builder-website-must-haves`) |
| Proposed slug | `home-builder-website-not-generating-leads` (line 4) | Pilot slug `custom-home-builder-website-must-haves` |
| Schema headline | Matches markdown H1 (`ART-01.schema.json` line 7) | No inline JSON-LD in HTML; would inherit SEO plugin + candidate |
| Body framing | 11 diagnostic causes + checklist (lines 29–181) | 10 prescriptive must-haves + checklist (HTML lines 249–363) |
| Homearama anecdote | Present (md line 155) | **Absent** from WP HTML |
| Cluster links | `/home-builder-website-design/`, `/best-home-builder-websites/`, `/home-builder-website-seo-checklist/` (md lines 27, 60, 167) | **Absent**; only `/book-appointment/` and hub (HTML lines 367–368) |

**Decision required before Sept 3 review:** reconcile to one URL/reader job or split into two manifest assets with distinct slugs.

---

### Criterion scorecard — ART-01 markdown

| Criterion | Status | Evidence and gap |
| --- | --- | --- |
| Answer in first 100 words | **Partial** | Opening is 77 words (lines 21–25) and frames the problem but does not answer *why* leads are missing. Thesis deferred: `"Here is what to check first."` (line 25). Standard requires the main question answered inside 100 words. |
| Direct-answer / TL;DR / key-takeaway block | **Missing** | No labeled TL;DR, summary box, or single-paragraph direct answer suitable for AI excerpting. Closest: `"When qualified leads are thin, the problem is rarely one missing button."` (line 23) — diagnostic, not a complete answer. |
| Definition box | **Missing** | `"qualified opportunity"` is touched (lines 119–120) but not defined in a standalone, citable block. No definition of *qualified lead* for builders. |
| Decision table or comparison | **Missing** | No table. Section 3 (lines 62–70) compares generic vs differentiated positioning in prose only. |
| Checklist or numbered how-to | **Present** | 11 numbered H2 diagnostic sections (lines 29–167); closing checklist with 11 items (lines 169–181). |
| 5–8 visible FAQs matching FAQPage schema | **Missing** | Zero FAQ headings or Q&A pairs. `content-system-qa.json` confirms `faq_schema_entities: 0`, `visible_faq_entities: 0`. `ART-01.schema.json` is **Article only** — no FAQPage (unlike WEB-01 which ships five matched pairs). |
| Entity clarity (BigOrange, custom home builder, qualified lead) | **Partial** | *Custom home builder* implied throughout; *BigOrange* named at lines 155, 187; *qualified lead* partially at 119–120, 177–179. No explicit *who BigOrange is / where they operate* for GEO citation. |
| Sources and dates | **Partial** | Frontmatter `last_reviewed: 2026-08-28` (line 13). Footer permission note (line 193). **No external source links.** Homearama claim (line 155) lacks date, visitor scope, client identity, and approval — standard flags this (AEO standard lines 46–47). |
| Title tag ≤60, meta 150–160, one H1, descriptive H2s | **Present** | Title 46 chars (line 6); meta 153 chars (line 7); one H1 (line 19); 13 descriptive numbered H2s. |
| Internal links to hub `/marketing-agency-for-builders/` | **Present** | Line 190: `Return to the complete custom home builder marketing blueprint`. Parent also in frontmatter (line 11). |
| Schema types | **Partial** | Candidate: `Article` + `isPartOf` hub (schema lines 4–24). Missing: `FAQPage`, `Speakable`, `BreadcrumbList` (frontmatter notes breadcrumb "only when visible and emitted once", line 14 — not visible in body). |
| Speakable / answer-ready Q&A pairs | **Missing** | No explicit question-heading + short-answer pairs. Section 5 lists buyer worries as a numbered list (lines 84–92) but not as speakable Q&A. |
| GEO: citable claims, experience vs generic, no ranking promises | **Partial** | **Good:** no ranking/traffic/lead/revenue promises. **Gap:** Homearama anecdote (line 155) is firsthand BigOrange experience but uncitable — `"The event generated a large audience"` with no number, date, or permission gate label. Remainder is largely generic best-practice advice without BigOrange-specific proof points. |
| WordPress block mapping | **N/A (md)** | See WP 5550 column below. Markdown is not installed in branded HTML block. |

---

### Criterion scorecard — ART-01 as deployed (WP 5550 branded HTML)

Audited because Gmail draft and post 5550 currently surface this version, not the markdown.

| Criterion | Status | Evidence and gap |
| --- | --- | --- |
| Answer in first 100 words | **Partial** | Body opens at HTML lines 246–248 (~94 words). Answers *what a builder website must do*, not *why it fails to generate leads*. Strong lede but wrong primary query vs ART-01 manifest. |
| Direct-answer / TL;DR / key-takeaway block | **Partial** | Hero summary (line 219): `"A practical field guide to the pages, proof, and decision support that help qualified home buyers trust the process."` — excerptable but not a direct answer block in the body; lives in hero, not a reusable AEO module. |
| Definition box | **Missing** | No definition module. |
| Decision table or comparison | **Missing** | No table. |
| Checklist or numbered how-to | **Present** | 10 numbered sections (HTML lines 249–350); interactive checklist (lines 351–363). |
| 5–8 visible FAQs | **Missing** | Line 339 mentions FAQ only as implementation guidance: `"visible FAQ where appropriate"` — meta-instruction, not reader-facing FAQs. |
| Entity clarity | **Partial** | Second-person *your* for builder audience; BigOrange in CTA (lines 366–367) and footer (lines 370–375). *Qualified* appears in hero summary (line 219) and measurement section (line 346) without definition. |
| Sources and dates | **Missing** | Hero meta shows `"Complete supporting article"` (line 222) — no review date, author, or source list in visible content. |
| Title tag / meta / H1 / H2s | **Partial** | One H1 (line 218, 47 chars). 13 H2s with anchor IDs. **Title tag and meta description not in HTML fragment** — must be set in WP SEO plugin; currently misaligned with ART-01 frontmatter if post is treated as ART-01. |
| Internal links to hub | **Present** | Body link (line 368) and footer CTA (line 375). |
| Schema types | **Missing (in fragment)** | No `application/ld+json` in branded HTML. Candidate JSON exists separately but references **different** headline/URL than WP content. |
| Speakable / answer-ready Q&A | **Partial** | Lines 247–248 pose six buyer questions rhetorically — good seed material, but no paired short answers formatted for extraction. |
| GEO | **Partial** | Mostly generic prescriptive guidance. No uncited performance claims. No firsthand BigOrange case proof (Homearama removed vs markdown). |
| WordPress block mapping | **Partial** | Single `<!-- wp:html -->` monolith (lines 1–378). Not decomposed into reusable blocks. See mapping section below. |

---

### ART-01 — recommended FAQ candidates (not in copy; for gap closure)

If reconciled to the **markdown diagnostic** article, five distinct FAQs might include:

1. Why would a polished home builder website still miss qualified leads?
2. What is the difference between a marketing lead and a qualified opportunity for a custom home builder?
3. Should a builder website publish investment ranges online?
4. What trust signals need context on a builder website?
5. How does weak sales follow-up affect website lead quality?

Each needs a visible accordion/section **and** identical FAQPage markup per standard lines 19–20 and 57.

---

## ART-02 — 5 Articles Every Custom Home Builder Blog Needs

Markdown and WP 5552 audited together; deltas noted.

### Criterion scorecard — ART-02 (markdown + WP 5552)

| Criterion | Status | Evidence and gap |
| --- | --- | --- |
| Answer in first 100 words | **Present** | Md lines 22–26 (~69 words): defines the blog's job and states `"these five articles create a useful foundation"`. WP lines 243–245 match. Answers primary query within limit. |
| Direct-answer / TL;DR / key-takeaway block | **Missing** | Hero summary exists (WP line 219) but no body-level TL;DR / key-takeaway module for excerpting. Md has no summary box after frontmatter. |
| Definition box | **Missing** | Metaphor `"patient sales teammate"` (md line 22) is not a citable definition block. |
| Decision table or comparison | **Missing** | Five article types listed (md lines 30–124) but no comparison table (e.g., article type × buyer stage × CTA). |
| Checklist or numbered how-to | **Present** | Five numbered article templates (md lines 30–124); 7-step project-story sequence (lines 94–100); consultation prep bullet list (lines 110–120). WP mirrors structure. |
| 5–8 visible FAQs | **Missing** | Zero reader-facing FAQ section. WP H3 `"Questions the article should answer"` (lines 258–265) lists five **unanswered** questions — instructions for a future article, not FAQs for this page. Schema: Article only (`ART-02.schema.json`). QA: 0 FAQ entities. |
| Entity clarity | **Partial** | *Custom home builder* throughout; *qualified prospect* (md line 24); BigOrange at md line 171 / WP line 354. No geographic or service-scope statement for BigOrange. |
| Sources and dates | **Partial** | `keyword_note` cites Semrush Aug 4, 2026, vol 30 (md line 14) — good dated evidence. `last_reviewed: 2026-08-28` (line 13). **No external links in body.** No named reviewer in visible copy. |
| Title tag ≤60, meta 150–160, one H1, descriptive H2s | **Present** | Title 47 chars (line 6); meta 159 chars (line 7); one H1 (line 20); 10 descriptive H2s. WP H1 matches (line 218). |
| Internal links to hub | **Present** | Md line 134; WP body line 337 and footer line 362. |
| Schema types | **Partial** | `Article` + `isPartOf` only. No FAQPage, Speakable, or visible breadcrumbs. |
| Speakable / answer-ready Q&A pairs | **Partial** | WP lines 258–265 are question-only stubs without answers — **anti-pattern** for AEO (questions visible, answers absent). |
| GEO | **Partial** | **Good:** `"Do not call raw traffic a result"` (md line 165 / WP line 351). **Good:** no ranking promises. **Gap:** `"BigOrange can turn one expert conversation into a sourced, reviewable content plan"` (md line 171) — service claim without approved proof link. Mostly generic editorial advice. |
| WordPress block mapping | **Partial** | Same monolithic `wp:html` pattern as 5550. See below. |

---

### ART-02 — markdown vs WP 5552 content gaps

| Item | Markdown | WP 5552 | Gap |
| --- | --- | --- | --- |
| Section `"Add useful short-form content without creating filler"` | Present (md lines 138–144) | **Absent** | WP index nav (lines 233–240) skips this section |
| Link to `/home-builder-content-marketing/` | Present (md line 136) | **Absent** | Planned cluster link missing in WP |
| Link to `/home-builder-marketing-plan/` | Present (md line 150) | **Absent** | Planned cluster link missing in WP |
| Hub return link in body close | Present (md line 134) | Footer only (line 362) | Acceptable but weaker in-body reciprocity |
| H3 unanswered questions | Absent in md | Present (WP 258–265) | WP adds non-answer-ready Q stub not in canonical md |

---

### ART-02 — recommended FAQ candidates (not in copy)

1. What articles should a custom home builder blog publish first?
2. How many blog posts does a home builder need before seeing results?
3. Should a builder blog include project photos without context?
4. How does a builder blog support sales without sounding promotional?
5. What should a builder measure beyond traffic?

Requires visible answers + FAQPage parity. Do **not** use the WP H3 list at lines 258–265 as schema source until answers are written.

---

## Shared gaps (both articles)

### 1. FAQ contract vs peer assets

Standard: five visible FAQs when they add distinct value; wording must match FAQPage (standard lines 19–20, 57).

| Asset | Visible FAQs | FAQPage in schema | Peer benchmark (WEB-01) |
| --- | ---: | --- | --- |
| ART-01 md | 0 | No | 5 matched pairs |
| ART-02 md | 0 | No | 5 matched pairs |
| WP 5550 | 0 | No inline | — |
| WP 5552 | 0 (5 unanswered Q stubs) | No inline | — |

### 2. AEO extractors absent on both

Neither article ships:

- A labeled **TL;DR / Direct answer / Key takeaway** block immediately after the opening
- A **definition box** (e.g., qualified lead, patient sales teammate, cutie website)
- A **decision table** (symptom × fix, article type × buyer stage)
- **Speakable**-ready Q→A pairs (short answer under explicit question heading)

### 3. Source and permission hygiene

Per standard lines 44–49:

| Claim | Location | Issue |
| --- | --- | --- |
| Homearama event + nurture prep | ART-01 md line 155 | **Permission-gated.** Standard: anonymized Homearama may be paraphrased but visitor estimate, client identity, timeframe, and outcomes require independent evidence and approval. Current copy says `"large audience"` without numbers but still names Homearama and implies BigOrange client work. **Do not publish until Janice/leadership approval.** Not present in WP 5550 (consistent omission). |
| Semrush keyword volume | ART-02 md line 14 | Dated, scoped — good. Not surfaced in visible WP copy. |
| Interview integration | Both md footers (ART-01 line 193, ART-02 line 175) | Correctly gated. Status `"Janice factual review and leadership approval required"`. |
| `"cutie website with a very expensive hobby"` | ART-01 md line 185; WP5550 line 365 | Branded Janice-isms — ensure explicit voice permission before public use. **Do not invent or expand Janice quotes.** |

### 4. Schema reconciliation

Both schema candidates:

```json
"@type": "Article" only
"headline": matches markdown H1
"dateModified": "2026-08-28"
"isPartOf": marketing-agency-for-builders/#authority-system
```

**Gaps:**

- No FAQPage objects (peer assets include them)
- No SpeakableSpecification
- ART-01 schema headline **does not match** WP 5550 H1 if 5550 is published as ART-01
- BreadcrumbList deferred — must emit once site-wide, not duplicated in article block (standard line 59)
- Branded HTML contains **no JSON-LD** — plugin/theme must inject reconciled graph at staging QA

### 5. Release-state honesty

Both assets remain **Complete local review draft** (md status lines 12–13). Neither meets **Factual review approved** or **Staged and technically verified** (standard release states 2–4). WP drafts labeled `"Complete supporting article"` in hero overstate readiness.

---

## WordPress block mapping — how to install as reusable blocks

Current state: both posts use one scoped `<!-- wp:html -->` block with embedded CSS (~210 lines) and full article markup. This matches the hub pilot pattern (`beaver-builder-assembly-guide.md` line 18) for visual review, **not** for answer-ready modular editing.

### Recommended reusable block decomposition

| Reusable block name | Source selector | Content | AEO/GEO notes |
| --- | --- | --- | --- |
| `BOM / Article / Scoped CSS` | `#bom-article-5550-styles` or `#bom-article-5552-styles` | Style block only | Keep scoped; one per post ID |
| `BOM / Article / Hero` | `.bom-article-hero` | Logo, H1, summary lede, meta row, hero image | **Add:** `dateModified`, reviewer, TL;DR slot below summary |
| `BOM / Article / Direct Answer` | *new* | 2–3 sentence answer + key takeaway bullets | **New block required** — highest AEO priority |
| `BOM / Article / Sticky TOC` | `.bom-article-index` | Section nav | Auto-generate from H2 IDs |
| `BOM / Article / Definition` | *new* | Term + 1–2 sentence definition | e.g., Qualified lead |
| `BOM / Article / Numbered Section` | `.bom-article-body h2` + following content | One H2 section per block instance | Enables reorder without HTML surgery |
| `BOM / Article / Checklist` | `#builder-website-checklist` or equivalent | Checkbox list | Keep native `<ul>` semantics |
| `BOM / Article / FAQ Accordion` | *new* | 5–8 Q&A pairs | Must match FAQPage JSON exactly |
| `BOM / Article / Decision Table` | *new* | HTML table | Symptom/fix or article-type matrix |
| `BOM / Article / CTA Close` | `.bom-article-close` | Orange footer CTA to hub | Preserve hub link |
| `BOM / Article / Schema` | SEO plugin or Custom HTML | JSON-LD | **Not** in visual block; inject via Yoast/RankMath + reconcile duplicates |

### Installation sequence (from `WORDPRESS-IMPLEMENTATION-AND-RELEASE-GATE.md`)

1. Resolve ART-01 canonical copy (markdown diagnostic **or** WP must-haves) before block extraction.
2. Add missing AEO modules to markdown first, then regenerate branded HTML or rebuild blocks.
3. Paste/rebuild in WP as reusable blocks; keep one H1 across hero block only.
4. Set title tag, meta, slug, canonical from **chosen** canonical frontmatter.
5. Install reconciled JSON-LD; verify no duplicate Article/Organization with theme.
6. Run staging QA checklist including FAQ/schema parity and internal link readback.

### Beaver Builder alternative

If BigOrange requires marketer-editable modules without HTML (`beaver-builder-assembly-guide.md` module map), map numbered sections to native Heading + Text + List modules using the hub's 12-row pattern — but **add** FAQ accordion (hub row 10) and direct-answer row (new row 2b) which supporting articles currently lack.

---

## Priority remediation list

### P0 — before any publication approval

1. **Reconcile ART-01 surfaces:** pick markdown diagnostic vs WP must-haves; update post 5550, Gmail draft, schema, slug, and manifest to match.
2. **Add 5–8 visible FAQs + FAQPage** to both articles; expand schema candidates like WEB-01.
3. **Gate Homearama copy** (ART-01 md line 155): label `[JANICE REVIEW REQUIRED]`, remove, or replace with approved anonymized evidence.

### P1 — answer-ready structure

4. Insert **direct-answer / TL;DR block** within first screenful of body (both articles).
5. Add **definition box** for qualified lead / qualified prospect.
6. Convert WP 5552 H3 question stubs (lines 258–265) into full FAQ entries or remove.
7. Restore ART-02 md section **short-form content** (lines 138–144) and cluster links in WP 5552.

### P2 — GEO and schema

8. Add **decision table** (ART-01: symptom × fix; ART-02: article × buyer stage).
9. Separate **BigOrange firsthand** callouts from generic guidance (styled attribution blocks).
10. Reconcile **schema headline/URL** with rendered WP; add Speakable candidates on direct-answer + FAQ blocks.
11. Decompose monolithic HTML into **reusable blocks** per table above.

### P3 — SEO housekeeping

12. Verify WP SEO fields for title/meta on 5550 (currently only in md frontmatter for ART-01 diagnostic).
13. Confirm reciprocal hub links and missing cluster URLs on 5550 (`/home-builder-website-design/`, etc.).
14. Add visible **review date and named reviewer** in hero meta row (replace `"Complete supporting article"`).

---

## File path

`C:\Users\dillo\Documents\Codex\projects\client-operations\clients\bigorange-marketing\deliverables\2026-09-01-wordpress-aeo-geo-seo-sept3-review\evidence\article-aeo-geo-gaps.md`

---

*Audit performed against local source files only. WordPress post 5550/5552 rendered SEO fields, live schema output, and Gmail draft body were not read back from production in this pass.*
