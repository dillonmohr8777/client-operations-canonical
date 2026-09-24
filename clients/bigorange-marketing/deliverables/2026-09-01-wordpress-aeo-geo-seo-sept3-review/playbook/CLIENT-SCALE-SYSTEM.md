# Client-scale system — the same AEO/GEO/SEO contract BigOrange uses on itself

**Prepared:** 2026-09-01  
**Review:** Sept 3, 2026  
**Client route:** `bigorange-marketing`  
**POC:** this package is the live demonstration BOM can show other clients. The demonstration is the **method and the artifacts**, not a promised rank, traffic, lead, or AI-citation result.

BigOrange already runs public hubs for MSP, StoryBrand, manufacturing, landscaping, and builders. The builder authority pilot produced the block contract and the WordPress gate. Emelia’s Moz export plus the Sep 1 public fetch produced the ownership map. Together they are a product: **export in → page map out → one URL per reader job → reusable WordPress blocks → gated publish**.

---

## 1. What “the system” is

One sentence: every public URL owns one reader job, answers it in extractable blocks, cites experience separately from generic advice, and is allowed to publish only after SME and technical gates.

| Layer | BOM artifact (this package / prior) | Client deliverable |
| --- | --- | --- |
| Keyword ownership ledger | `evidence/emelia-moz-page-map.csv` + `emelia-moz-analysis.md` | One row per tracked query → one owned URL |
| Per-URL playbook | `playbook/PER-PAGE-RECOMMENDATIONS.md` + `per-page-recs.csv` | Same columns, client domain |
| Full-site ledger | `playbook/ALL-PAGES-LEDGER.md` + `all-pages-ledger.csv` (370 BOM URLs) | Same columns for every published URL, then `client-blank-page-map.csv` |
| Site health + ranking | `playbook/SITEWIDE-HEALTH-AND-RANKING.md` | Origin, robots, sitemap, H1, nofollow, LCP, families |
| Content contract | `2026-08-28-content-authority-proposal/implementation/AEO-GEO-SEO-CONTENT-STANDARD.md` | Unchanged rules, new vertical copy |
| WordPress gate | `WORDPRESS-IMPLEMENTATION-AND-RELEASE-GATE.md` | Private draft → staging QA → exact-revision publish |
| Supporting-article QA | `evidence/article-aeo-geo-gaps.md` | Scorecard before any post goes public |

The contract does **not** change by vertical. Copy, SME, imagery, hub URL, and proof sources change.

---

## 2. Keyword ownership ledger — one URL per reader job

### Ledger columns (minimum)

| Column | Rule |
| --- | --- |
| `keyword` | Exact string from Moz, Semrush, or GSC. Do not case-fold away a tracked variant until the export is collapsed the same way Emelia’s file was (6 case duplicates on 2026-08-14). |
| `volume_min` / `volume_max` | Keep the source range. Do not invent a midpoint. |
| `cluster` | One primary vertical. Secondary clusters allowed (builder+Cincinnati, MSP+StoryBrand). |
| `owned_url` | The single public URL allowed to target the query. Empty = unassigned, not “the homepage.” |
| `bucket` | `protect_1_3` / `improve_4_10` / `opportunity_11_20` / `unranked` / `not_in_snapshot` |
| `best_rank` + `evidence_date` | Snapshot only. Never a live claim without a new export. |
| `reader_job` | One sentence the page must answer. If two keywords share a job, they share a URL. |
| `status` | `owner` / `support` / `retire` / `noindex` / `blocked` |

### Rules that transfer to every BOM client

1. **A keyword variation is not a page.** `msp marketing` and `What is MSP marketing?` are one definition job. `msp marketing company` (desktop) and the same string (mobile) cannot own two URLs.
2. **Commercial vs editorial.** Agency/company/services queries sit on the hub. Definition, examples, checklist, cost, and how-to queries sit on supporting URLs that link back.
3. **Proof pages are not second hubs.** Case studies, logos, Homearama recaps, and “why they chose us” posts support the hub. They do not take the hub’s title, H1, or slug. BOM’s own `/home-builder-marketing-agency/` post vs `/marketing-agency-for-builders/` page is the cautionary example.
4. **Unranked high-volume vertical terms get a job, not a post-mortem.** `managed services provider marketing` (501-850) and `msp website` (201-500) are unfinished owners, not proof that current pages “failed.”
5. **Generic head terms stay off the ledger as must-own.** `small business marketing`, `digital marketing`, `social media marketing` are too broad for a specialist agency page unless the client’s product is that category.
6. **Blocked URLs stay blocked.** CONSULT-01 and PPC-01 stay out of the builder ledger until leadership defines a distinct offer. Clients get the same fail-closed rule for undefined service lines.

### How to apply a client’s own keywords (export in, page map out)

1. **Intake the export.** Moz “rankings by engine variant” or Semrush position tracker. Record source file, date, engines, and locale. BOM’s source of record for this POC: Emelia Gmail 2026-08-17, file through 2026-08-14.
2. **Snapshot, do not average history.** Use one date. BOM collapsed case-variant duplicates on that date only. Historical rows without that date go in an “absent from snapshot” appendix (BOM has 31).
3. **Cluster by the client’s sold verticals**, not by the agency’s verticals. For an MSP client: service pages, local, comparison, and “what is” jobs. Do not import BOM’s builder cluster onto an MSP site.
4. **Join to the live IA.** Crawl or WP REST + sitemap. Flag: in REST not in sitemap; `nofollow` on published URLs; multiple H1s; title/H1 mismatch; near-duplicate slugs.
5. **Emit the page map.** One row per URL × keyword (BOM: `emelia-moz-page-map.csv`). Then roll up to one playbook row per URL (`per-page-recs.csv`).
6. **Assign empty owners.** Unranked vertical terms get an existing URL or a named new supporting URL. They do not all land on the homepage.
7. **Name the families.** If two owned URLs rank for the same family, pick one owner before writing new copy.
8. **Stop at the ledger** until SME interview notes exist. Do not generate public HTML from keywords alone.

Script pattern already in this package: `scripts/analyze-emelia-moz-keywords.py`. For a client, clone the script, point it at their CSV, and keep the same column contract so playbooks stay comparable.

---

## 3. Reusable WordPress blocks

Current BOM pattern for supporting articles: one monolithic `<!-- wp:html -->` block with ~210 lines of scoped CSS. That is fine for a private visual review. It is **not** the client-scale editing model.

Install these as reusable blocks (Gutenberg) or as a Beaver Builder row map. One H1 lives in the hero only.

| Block | Reader job | Required content | Schema / extract note |
| --- | --- | --- | --- |
| **BOM / Answer box** | Answer the primary question in the first screenful | 2–3 sentences + 3 bullets. Labeled “Direct answer” or “Key takeaway.” | First 100 words. Speakable candidate. |
| **BOM / Definition** | Make one term citable | Term + 1–2 sentence definition. No metaphor-only definitions. | Use on “what is” URLs. |
| **BOM / Decision table** | Compare options without a ranking promise | HTML table: symptom × fix, article type × buyer stage, agency vs in-house, free vs guide. | Excerptable as a table. |
| **BOM / FAQ accordion** | Five distinct questions | 5 visible Q&A pairs. Wording **identical** to FAQPage. | No FAQPage without visible answers. ART-01/02 currently fail this. |
| **BOM / Entity** | Who / where / what this organization is | Legal or brand name, city or service area, vertical, one sentence of scope. | Feed Organization once via Yoast; do not duplicate Organization JSON-LD in the block. |
| **BOM / Sources** | Dated, attributable claims | Publisher, date, scope, link. Review date + named reviewer in the hero meta. | Firsthand BOM/client experience in a separate attributed callout. |
| **BOM / Numbered how-to** | Checklist or sequence | 5–8 steps or a visible checklist. | HowTo schema only when the visible steps fully match. Default is no HowTo. |
| **BOM / Cluster links** | Reciprocal IA | Hub + one sibling + one CTA. | Targets must exist in the same environment. |
| **BOM / Schema** | Machine description | Yoast + one reconciled `@graph`. | Not a visual block. Staging QA rejects duplicate Article, FAQ, Organization, or Breadcrumb objects. |

### Beaver Builder 12-row map (marketer-editable)

When the client team will not edit HTML, map the same contract onto the hub’s existing row pattern and **add** two rows the supporting articles still lack:

- Row 2b: Answer box (missing on ART-01/02)
- Row 10: FAQ accordion with schema parity (hub has a pattern; ART-01/02 do not)

Do not ship unanswered “questions this article should answer” stubs (WP 5552 anti-pattern).

### What never goes in a reusable block

- Ranking, traffic, lead, revenue, featured-snippet, or AI-citation promises
- Janice/SME quotes with permission `?`
- Raw Homearama visitor counts, client identity, or outcomes without independent evidence and approval
- Another client’s logo, case, or city page cloned with find-replace
- Secrets, cookies, form tokens, or credential locators

---

## 4. Vertical hubs BigOrange already has

Clone the **architecture**, not the builder copy.

```
Industry hub (one commercial URL, updated in place)
├── Supporting posts (definitions, checklists, examples, how-to)
├── Topic pages (visibility, website, local, lead-gen, paid-ready)
├── FAQ companion inside the hub (not a second FAQ URL)
└── Internal links: hub ↔ cluster ↔ book-appointment
```

| Vertical | Existing public anchor | Ledger focus from Emelia 2026-08-14 | First system move |
| --- | --- | --- | --- |
| **MSP / IT** | `/msp-it-services-marketing-agency/` | 80 tracked / 33 ranked / 47 unranked. Resources page owns 13 keywords. | Protect `Best MSP Marketing Company` (3). Collapse `/top-msp-marketing-agencies/` engine split. Expand resources for `managed services provider marketing` (501-850). |
| **StoryBrand** | `/website-design-and-storybrand-seo-services/` (commercial); hero examples page (editorial, 8 keywords, best rank 1) | 26 tracked / 23 ranked / 3 unranked. `StoryBrand Framework` (201-500) unranked. | Protect `storybrand examples` (1) and declining `storybrand website examples` (2). Assign BrandScript terms to the BrandScript URL. Decide owner for `/storybrand-framework/`. |
| **Manufacturing** | `/manufacturing-services-marketing-agency/`, `/manufacturing-marketing/` | 3 tracked / 2 ranked / 1 unranked. Examples page holds position 3 and is declining. Ads article at 16. | Protect the examples URL. Give `marketing for manufacturers` (201-500) to the hub, not a third blog. |
| **Landscaping** | `/landscaping-marketing-services/`, `/landscape-marketing-services/` | 1 tracked / 0 ranked (`landscaping marketing`, 11-50) | Pick **one** hub slug. Apply answer + definition + local proof + 5 FAQs. Do not build two landscaping service pages. |
| **Custom home builders** | `/marketing-agency-for-builders/` (page 1381) | 21 tracked / 17 ranked / 4 unranked. All ranked terms on the hub. Eight satellites own zero snapshot keywords. | Finish the hub. Supporting articles only. No second service URL. No 1381 swap until mobile LCP work and approval. |

Homepage `/` is the **router**, not a fifth vertical hub. It currently owns only local Cincinnati terms (9 and 17, both declining) and carries the Stategic typo.

---

## 5. Operating workflow — SME interview → local QA → private WP draft → gated publish

This is the productized sequence. BOM used it on the builder pilot. Clients get the same gates.

### Step 1 — SME interview (about 1 hour)

- Named practitioner (for BOM: Janice / Margee / vertical owner; for a client: their owner or operator).
- Permission-coded transcript. Unclear quotes stay `[NAME REVIEW REQUIRED]` and non-public.
- Capture: who the customer is, the job the page must do, firsthand examples, numbers that have evidence, numbers that do not.
- Output: redacted notes + a proposed reader-job list. Not a published article.

### Step 2 — Ledger and page map

- Import the client’s Moz/Semrush export.
- Join to their WP REST + sitemap.
- Emit ownership CSV + per-URL playbook.
- Leadership (or the client sponsor) confirms owners before copy starts.

### Step 3 — Local production

- Markdown with title ≤60, meta 150–160, one H1, review date, sources.
- Answer box, definition, decision table or checklist, 5 FAQs, entity, sources.
- Schema candidate that matches visible copy.
- Image direction and alt text. No stock-as-proof.

### Step 4 — Content-system QA

- Score against `AEO-GEO-SEO-CONTENT-STANDARD.md`.
- Fail closed on: missing answer box, 0 FAQs, FAQ/schema mismatch, ranking promises, permission-gated anecdotes, ART-style cross-system divergence (markdown ≠ WP draft).
- BOM’s own ART-01/02 would **fail this gate today**. That is part of the POC: the system catches the gap before publish.

### Step 5 — Private WordPress assembly

- Draft or private only. A WP draft is not publication.
- Rollback snapshot of any live URL that will be updated (BOM: 5545 pattern for 1381).
- Set Yoast title, meta, slug, canonical, robots, sitemap behavior in admin — not only in HTML.
- Reusable blocks preferred; monolithic HTML only for motion-heavy review builds (Orange Press).
- Wordfence 2FA/passkey remains a human gate.

### Step 6 — Staging QA

From `WORDPRESS-IMPLEMENTATION-AND-RELEASE-GATE.md`: layout, keyboard, headings, title/H1/canonical/robots, JSON-LD parse and de-dupe, every link, forms, analytics observed without inventing a conversion, console, rollback owner.

### Step 7 — Publication approval

- Exact staged revision only.
- Live readback of URL, HTTP, rendered fields, FAQ/schema parity, sitemap, Search Console canonical when available.
- No ranking result is implied by a clean readback.

Release states (do not skip):

1. Complete local review draft  
2. Factual review approved  
3. Leadership approved  
4. Staged and technically verified  
5. Publication approved  
6. Live and receipt-verified  

---

## 6. How a client engagement uses this package

| Client asks | BOM shows | BOM does next |
| --- | --- | --- |
| “Can you do AEO/GEO for our site?” | This Sept 3 matrix on **bigorange.marketing** — 28 ranking URLs plus commercial zeros, health and ranking in one view | Run their export through the same script and return a page map in a week of local work |
| “We need more pages for these keywords” | The cannibalization families and the eight builder satellites that own zero tracked terms | Ownership first; pages second |
| “Just add schema / llms.txt” | Content standard: Google treats AEO/GEO as helpful content + crawl/index + satisfying pages. `llms.txt` is not required. FAQPage only when FAQs are visible | Blocks on existing owners before new URLs |
| “Guarantee page-one / ChatGPT citations” | Refuse. The POC is the system, the ledger, and the gates | Same refusal on every vertical |
| “Can our marketers edit it?” | Beaver Builder row map + reusable blocks vs coded HTML | Choose the editing model before assembly |
| “What about our other locations?” | One owner per reader job. No cloned city pages | Local proof on the hub or a distinct local job, not 50 thin variants |

### What BOM should not sell as the POC

- The Aug 20 mobile Lighthouse 32 / LCP 36s on the builder hub
- The homepage typo in schema
- The AI service page with four H1s and `index, nofollow`
- ART-01 markdown vs WP 5550 divergence
- Campaign landers that are published, nofollow, and sitemap-missing

Those defects are **why** the system exists. Show them as the before-state BigOrange is repairing on its own site, then apply the same repair path to the client.

---

## 7. POC proof — this package is the demonstration

A client-facing walkthrough (no secrets, no ranking promises):

1. **Source honesty.** Emelia’s Moz file through 2026-08-14. Public HTML and REST on 2026-09-01. Two dates, labeled.
2. **Two lanes.** Lane A finishes the builder hub that already holds 17 ranked builder terms. Lane B applies the same contract to 27 URLs that already rank for MSP, StoryBrand, manufacturing, and Cincinnati.
3. **Machine + human.** `per-page-recs.csv` for the 39 working-session URLs; `all-pages-ledger.csv` for every published URL; `review-ui/index.html` to filter them in the room.
4. **Health is ranking.** Origin 520 → recovered; typo; nofollow; sitemap gaps; LCP on the #1 ownership URL. One document.
5. **Reusable blocks.** Answer, definition, decision table, FAQ, entity, sources — named so a WP editor can install them on an MSP page the same week as a landscaping page.
6. **Gates.** Private draft, SME permission, staging QA, exact-revision publish. The builder drafts (5546, 5585, 5550, 5552) are still behind those gates. That is the point.
7. **Client replica.** Hand them a blank ledger template and the script. Their keywords in; their page map out.

### Suggested Sept 3 demo path (15 minutes)

1. Open `SITEWIDE-HEALTH-AND-RANKING.md` — origin, typo, AI nofollow, LCP, protect list.  
2. Open the builder hub row and the StoryBrand examples row in the per-page matrix.  
3. Open the MSP resources row — 13 keywords, best rank 5, twelve of them still 11–20.  
4. Show `/home-builder-marketing-agency/` vs `/marketing-agency-for-builders/` as the “proof page is not a hub” lesson.  
5. Show ART-01 gap report as the QA gate catching a publish blocker.  
6. Close on CLIENT-SCALE: “this is what we run for you, starting with your export.”

Do not walk a prospect through Credential Manager, Wordfence, or `live-site-inventory.json` headers.

---

## 8. Template kit to copy per client

Create `clients/<client-id>/deliverables/<date>-aeo-geo-seo-review/`:

```
evidence/
  moz-or-semrush-source-note.md
  keyword-page-map.csv
  live-site-health.md
  live-site-inventory.json    # no cookies, no tokens
playbook/
  PER-PAGE-RECOMMENDATIONS.md
  SITEWIDE-HEALTH-AND-RANKING.md
  CLIENT-SCALE-SYSTEM.md      # optional; link here if the client is not an agency
  per-page-recs.csv
scripts/
  analyze-keywords.py
```

Registry the client first (`registry/clients.json`). Do not invent a second dated home. Do not blend two clients’ keywords, logos, or case studies.

---

*This file describes a repeatable operating system. It does not authorize publication, 301s, spend, or send. It does not forecast rankings.*
