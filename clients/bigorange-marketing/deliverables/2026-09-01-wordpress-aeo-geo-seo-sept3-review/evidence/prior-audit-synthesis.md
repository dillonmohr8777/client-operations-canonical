# BigOrange WordPress Backend — Prior Audit Synthesis

**Prepared:** September 1, 2026  
**Purpose:** Sept 3 leadership review package — consolidate WordPress backend evidence, prior technical audits, draft installation history, access model, verification state, publication gates, and vertical scaling model.  
**Thoroughness:** Medium. No secrets or credential values are included.

---

## Source documents reviewed

| Source | Date | Role |
| --- | --- | --- |
| `2026-08-03-custom-home-builder-authority-hub-pilot/live-site-technical-audit-2026-08-20.md` | Aug 20 | Lighthouse lab baseline and performance blockers |
| `2026-08-03-custom-home-builder-authority-hub-pilot/technical-ai-search-spec.md` | Aug 3 | URL, metadata, schema, performance, and AI-search implementation spec |
| `2026-08-03-custom-home-builder-authority-hub-pilot/wordpress/beaver-builder-assembly-guide.md` | Aug 20 | How private drafts were installed; module map |
| `2026-08-28-content-authority-proposal/evidence/live-technical-refresh-2026-08-28.md` | Aug 28 | Live hub, robots, sitemap readback |
| `2026-08-28-content-authority-proposal/implementation/WORDPRESS-IMPLEMENTATION-AND-RELEASE-GATE.md` | Aug 28 | Assembly, staging QA, publication gates |
| `2026-08-28-content-authority-proposal/implementation/AEO-GEO-SEO-CONTENT-STANDARD.md` | Aug 28 | Reusable content contract for all verticals |
| `2026-08-28-content-authority-proposal/release/publication-manifest.csv` | Aug 28 | 19-asset URL register and approval states |
| `2026-08-31-send-readiness-audit.md` | Aug 31 | Send blockers including HTTP 520 and draft 5585 gap |
| `2026-08-31-final-client-handoff/FINAL-HANDOFF-README.md` | Aug 31 | WordPress review set and release gates |
| `2026-09-01-wordpress-aeo-geo-seo-sept3-review/evidence/live-site-health.md` | Sep 1 | Current public origin health |
| `2026-09-01-wordpress-aeo-geo-seo-sept3-review/evidence/live-site-inventory.json` | Sep 1 | Plugin namespaces, sitemap counts, REST inventory |
| `2026-09-01-wordpress-aeo-geo-seo-sept3-review/evidence/article-aeo-geo-gaps.md` | Sep 1 | ART-01/02 cross-system gaps |
| `clients/bigorange-marketing/scripts/Test-BigOrangeWordPressAccess.ps1` | — | Credential Manager login probe |
| `clients/bigorange-marketing/scripts/Start-BigOrangeWordPressCredentialBridge.ps1` | — | Loopback-only credential bridge |
| `CLIENT.md` | Jul 16 | Initial access boundary (superseded by later authenticated work) |

---

## 1. Known WordPress stack and plugins

Evidence comes from WP REST API namespaces (`wp-json-root.json`), rendered page HTML (`fl-builder`, `bb-plugin`), Yoast sitemap output, and prior audits.

### Hosting and edge

| Layer | Evidence |
| --- | --- |
| **WP Engine** | `X-Cache`, `X-Cacheable`, `X-Cache-Group` headers; `wpe/cache-plugin/v1`, `wpe_sign_on_plugin/v1` REST namespaces |
| **Cloudflare** | `Server: cloudflare`, `CF-RAY` on all sampled responses |
| **Timezone** | `America/New_York` (GMT offset −4) |

### Confirmed plugin and tool surface

| Plugin / tool | Evidence | Notes |
| --- | --- | --- |
| **Yoast SEO** | `yoast/v1` namespace; Yoast block in `robots.txt`; Yoast-generated sitemaps; Yoast JSON-LD on live pages | Primary SEO metadata and sitemap owner |
| **Beaver Builder** | `fl-controls/v1`; `bb-plugin` CSS/JS on live pages; `fl-builder` body classes; assembly guide module map | **Primary page builder** for live site layout |
| **WP Rocket** | `wp-rocket/v1` namespace; spec references cache behavior on anonymous mobile requests | Performance / caching |
| **Wordfence** | `wordfence/v1`, `wordfence-login-security/v1` namespaces | Login security; 2FA/passkey enrollment required before publication gate clears |
| **WP Smush** | `wp-smush/v1` namespace | Image optimization |
| **Redirection** | `redirection/v1` namespace | Redirect management |
| **Simple History** | `simple-history/v1` namespace | Admin audit log |
| **WPMU DEV Dashboard** | `wpmudev-dashboard/v1` namespace | Plugin management |
| **Elementor One** | `elementor-one/v1` namespace | Present in REST; **not** the primary builder on audited builder/MSP pages (Beaver Builder dominates rendered HTML) |
| **EA11y** | `ea11y/v1` namespace | Accessibility tooling |
| **QuadLayers Search Exclude** | `quadlayers/search-exclude` namespace | Search exclusion control |

### Theme

- **Beaver Builder Theme** (`bb-theme`, child theme `bb-theme-child`) with Theme Builder header/footer templates on sampled pages.

### Builder hub technical baseline (Aug 3 / Aug 20)

| Metric | Mobile | Desktop |
| --- | ---: | ---: |
| Performance | 26 → 32 (Aug 20 refresh) | 67 → 75 |
| Accessibility | 86 | 86 |
| Best practices | 54–57 | 54–57 |
| SEO (Lighthouse) | 92 | 92 |
| Mobile LCP | 28.6s → 36.1s | 2.6s → 2.7s |
| Mobile TBT | 2,650ms → 1,110ms | 210ms → 20ms |

Mobile performance remains a **material launch blocker** until staging remediation and confirmation runs complete. The spec calls out Elementor/widget CSS, render-blocking assets, unused JavaScript (~703 KiB lab estimate), and image sizing as priority fixes — applied to the **existing public page architecture**, not the private coded drafts alone.

---

## 2. Known draft and public post IDs

| ID | Type | Role | Status |
| --- | --- | --- | --- |
| **1381** | Public post/page | Live builder hub at `/marketing-agency-for-builders/` | **Unchanged.** Canonical commercial owner. Do not replace until leadership approves exact revision. |
| **5546** | Private page | **Cinematic Authority** pillar direction | Installed Aug 20 as coded Custom HTML block with `No Header/Footer` template and scoped CSS. Preview: `?page_id=5546&preview=true` |
| **5585** | Private page | **Orange Press** pillar direction | Draft exists; **atomic Orange Press revision not yet installed** as of Aug 31. Source ready at `orange-press/wordpress-draft.html`. Preview: `?page_id=5585&preview=true` |
| **5545** | Private draft | Reversible copy of current public page | Rollback snapshot referenced in assembly guide |
| **5550** | Private post | Supporting article 1 (branded HTML) | Installed; slug candidate `custom-home-builder-website-must-haves`. Preview: `?p=5550&preview=true` |
| **5552** | Private post | Supporting article 2 (branded HTML) | Installed; slug candidate `custom-home-builder-blog-articles`. Preview: `?p=5552&preview=true` |

**Cross-system warning:** Post **5550** content does **not** match ART-01 in the publication manifest. The manifest owns the diagnostic query *"home builder website not generating leads"*; the WordPress draft owns *"What a Custom Home Builder Website Must Include"*. Leadership must pick one canonical reader job before publication (see `article-aeo-geo-gaps.md`).

---

## 3. Access model

| Mechanism | Detail |
| --- | --- |
| **Credential storage** | Windows Credential Manager target `Codex.ClientAccess.BigOrange.WordPress` (username stored; password never written to repo) |
| **Login probe** | `scripts/Test-BigOrangeWordPressAccess.ps1` — form POST to `wp-login.php`, checks for admin dashboard markers |
| **Loopback bridge** | `scripts/Start-BigOrangeWordPressCredentialBridge.ps1` — localhost-only, nonce-gated JSON handoff for authorized automation |
| **Wordfence** | Login security plugin active; publication gate requires Dillon 2FA or passkey enrollment during Wordfence grace period |
| **Application passwords** | Mentioned in `CLIENT.md` as the preferred future OAuth/Application Password route before admin work; not the documented primary path for the Aug 20 draft installation |
| **Authenticated session** | Aug 20 account check succeeded; Dillon Mohr dashboard access confirmed when creating private drafts 5546, 5550, 5552 |

No credential values, application password strings, or session tokens appear in this synthesis.

---

## 4. How drafts were installed

### Pillar directions (5546, 5585)

1. Authenticated WordPress admin session (Aug 20).
2. Created **private draft pages** — not published, not indexed.
3. Applied **`No Header/Footer`** page template where needed.
4. Pasted coded authority hub into a **WordPress Custom HTML block** (`<!-- wp:html -->` wrapper) with scoped CSS (`bom-*` classes, `:has()` selectors to hide default theme header rows).
5. Used existing media-library assets for logo, hero, case-study, and testimonial imagery.
6. Left global header, footer, navigation, analytics, forms, and cookie tooling untouched on the public site.

**5546 (Cinematic Authority):** Installed per `beaver-builder-assembly-guide.md`. Coded block for immediate visual review; optional rebuild into native Beaver Builder modules using the 12-row module map before final handoff if marketers need non-HTML editing.

**5585 (Orange Press):** Draft page created and shared for review. The Aug 31 atomic particle-logo refinement exists locally (`build-orange-press-wordpress-draft.mjs` → `orange-press/wordpress-draft.html`) and on Netlify (`bigorange-orange-press.netlify.app`) but was **not yet pasted into WordPress draft 5585** when the Aug 31 send audit ran.

### Supporting articles (5550, 5552)

1. Source HTML generated in pilot deliverable folder.
2. `build-branded-supporting-articles.mjs` wraps body in scoped CSS + branded layout.
3. Output: single monolithic `<!-- wp:html -->` block per post (~210 lines CSS + article markup).
4. Scoped selectors hide default post header and specific Beaver Builder rows (`fl-builder-content-2154`).
5. Installed as **private WordPress posts** with proposed slugs; Yoast title/meta set in admin (not embedded in HTML fragment).

### Sixteen additional manifest assets

Complete locally (`wordpress-ready-html/`, `schema/`, `publication-manifest.csv`) but **not installed in WordPress**. They are a Dillon-authorized production extension beyond the paid pilot scope and require separate approval before assembly.

---

## 5. Last verified vs failed

| Check | Date | Result |
| --- | --- | --- |
| WordPress admin login | Aug 20 | **Succeeded** — private drafts created |
| Public builder hub HTTP 200 | Aug 28 | **Verified** — H1 `Home Builder Marketing`, self-canonical, Yoast sitemap |
| Robots AI policy | Aug 28 | **Verified** — search bots allowed; training bots blocked; intentional policy |
| Orange Press Netlify review | Aug 31 | **Verified** — HTTP 200, noindex, atomic logo sequence, reduced-motion fallback |
| WordPress origin via admin login | Aug 31 | **Failed** — Cloudflare reachable; **origin returned HTTP 520**; private draft readback treated stale |
| Draft 5585 atomic update | Aug 31 | **Not done** — local source ready; WordPress install pending |
| Public origin health | Sep 1 | **Recovered** — homepage, `/wp-json/`, sitemaps HTTP 200; **no Cloudflare 5xx on sampled critical pages** |
| Private draft readback (5546, 5585, 5550, 5552) | Sep 1 | **Not re-verified in this pass** — public fetch only; authenticated preview state still needs readback before send |
| ART-01/02 AEO contract | Sep 1 | **Gap report complete** — blocking cross-system divergence on ART-01; missing visible FAQs and direct-answer blocks on both |

**Interpretation for Sept 3:** The Aug 31 HTTP 520 blocker appears resolved for **public** endpoints as of Sep 1, but leadership should not assume private draft previews match latest local sources until authenticated readback completes — especially **5585** (Orange Press atomic pass) and **5550** (ART-01 reconciliation).

---

## 6. What we must NOT publish

### Hard blocks — no exceptions without named approval

| Item | Reason |
| --- | --- |
| **Public page 1381 / live hub URL** | Unchanged until leadership selects direction and approves exact revision |
| **Any draft without publication gate** | Draft ≠ published; all four private IDs remain review-only |
| **Duplicate hub URL** | Spec and manifest require in-place update of `/marketing-agency-for-builders/` only |
| **Janice interview language with unresolved permission** | `[JANICE REVIEW REQUIRED]` / permission `?` blocks remain non-public |
| **Homearama anecdote beyond approved paraphrase** | Visitor counts, client identity, timeframe, outcomes need independent evidence and Janice approval |
| **CONSULT-01** (`/home-builder-marketing-consulting/`) | Blocked until leadership defines distinct consulting offer that will not cannibalize hub |
| **PPC-01** (`/ppc-for-home-builders/`) | Deferred until conversion tracking and proof validated |
| **16 extended manifest pages** | Local-only production extension; not part of paid pilot WordPress deliverable |
| **Unsupported claims** | No ranking, traffic, lead, revenue, rich-result, or AI-citation promises |
| **Schema without visible parity** | FAQPage, Service, review, or award markup where content is absent |
| **ART-01 as currently installed in 5550** | Conflicts with manifest slug, H1, and schema until reconciled |
| **Invoice, client email, or package send** | Aug 31 audit: do not send full package until WordPress readback and approval gates clear |

### Site-wide issues to fix before scaling (public evidence, Sep 1)

- Homepage meta typo **"Stategic"** in description, OG, and schema
- `/ai-search-optimization-services/` — four H1 tags; `index, nofollow` robots meta
- 21 published pages excluded from page sitemap (review intentional noindex vs accidental omission)

---

## 7. Scaling the system for BigOrange client verticals

BigOrange already operates multi-vertical public hubs (MSP, manufacturing, landscaping) alongside builders. The builder pilot produced a **repeatable authority-system pattern** BigOrange can clone per vertical using the same AEO/GEO/SEO blocks.

### Reusable architecture (from manifest + content standard)

```
Industry hub (HUB-01)          ← one canonical commercial URL, updated in place
├── Supporting posts (ART-*)   ← 2+ answer-ready articles
├── Topic pages (STR, VIS, WEB, LOCAL, LEAD, …)  ← reader-job-owned URLs
├── FAQ companion (inside hub) ← not a separate URL
└── Internal link graph        ← hub ↔ cluster ↔ CTA paths
```

**Rules that transfer unchanged:**

1. **One owner per reader job** — 62-query ledger resolves to owned URLs; no thin query variants.
2. **AEO/GEO blocks on every URL** — direct answer in first 100 words; definition/decision table/checklist; 5–8 visible FAQs matching FAQPage schema; attributable sources; no ranking promises.
3. **Traditional SEO blocks** — title ≤60, meta 150–160, one H1, descriptive H2s, self-canonical, reciprocal internal links.
4. **Structured data** — one coherent `@graph` reconciled with Yoast/theme output; no duplicate Organization or FAQ objects.
5. **Robots policy** — allow search and agent crawlers (OAI-SearchBot, PerplexityBot, ChatGPT-User); block training crawlers (GPTBot, ClaudeBot, Google-Extended); review intentionally, do not change reflexively.
6. **Release states** — local draft → SME factual review → leadership approval → staged QA → publication approval → live verification.

### Vertical application map

| Vertical | Existing public anchor | Clone from builder pilot |
| --- | --- | --- |
| **MSP / IT services** | `/msp-it-services-marketing-agency/` | Hub + visibility, lead-gen, content, local SEO, automation pages; SME interview with MSP practitioner; StoryBrand + IT proof patterns already on site |
| **Manufacturing** | `/manufacturing-services-marketing-agency/`, `/manufacturing-marketing/` | Hub + market research, website design, lead generation, PPC readiness pages; industrial buyer questions and proof requirements |
| **Landscaping / green industry** | `/landscape-marketing-services/`, `/landscaping-marketing-services/` | Hub + local SEO, seasonal content, gallery/proof pages; local-market and visual-proof emphasis |

### WordPress implementation choices per vertical

| Approach | When to use |
| --- | --- |
| **Coded `wp:html` block** (pilot pattern) | Fast visual proof, deterministic motion (Orange Press), scoped review builds |
| **Beaver Builder module map** (12-row pattern) | Marketer-editable handoff without HTML; map hero, TOC, cards, FAQ accordion, CTA |
| **Manifest-driven batch** | `publication-manifest.csv` + `wordpress-ready-html/` + `schema/` per vertical; run same QA scripts |

### Operational workflow BigOrange can productize

1. **SME interview** (1 hour) → permission-coded transcript  
2. **Keyword / reader-job ledger** → one URL per job  
3. **Local production** → markdown + HTML fragments + schema candidates  
4. **Content-system QA** → zero-error gate before staging  
5. **Private WordPress assembly** → draft/private only; rollback snapshot of any live URL touched  
6. **Leadership review** → direction, imagery, CTA, commercial terms  
7. **Staging QA checklist** → metadata, schema, links, forms, accessibility, performance  
8. **Publication approval** → exact revision only  
9. **Live readback** → Search Console, analytics, CRM receipt where configured  

This is the same system demonstrated for custom home builders; vertical-specific copy, imagery, SME, and hub URL change while the **block contract** (`AEO-GEO-SEO-CONTENT-STANDARD.md`) and **WordPress gate** (`WORDPRESS-IMPLEMENTATION-AND-RELEASE-GATE.md`) stay constant.

---

## 8. Sept 3 package implications

### Ready to present

- Complete 19-asset local authority system with QA pass
- Two visual directions (5546 installed; 5585 + Netlify Orange Press for comparison)
- Two supporting article drafts (with documented ART-01 reconciliation decision)
- Technical audits, AI-search spec, implementation gates, and scaling workflow
- Sep 1 public site health inventory (349 sitemap URLs, plugin surface, critical page spot-check)

### Decisions leadership must make Sept 3

1. Cinematic Authority (5546), Orange Press (5585), or bounded hybrid  
2. Confirm `/marketing-agency-for-builders/` remains sole hub URL  
3. Reconcile ART-01 canonical copy (manifest diagnostic vs WP 5550 must-haves)  
4. Janice factual and public-use permissions  
5. Staging target, WordPress owner, rollback owner, publication gate  
6. Invoice and commercial terms (outside WordPress scope)

### Immediate post-review technical sequence

1. Authenticated readback of 5546, 5585, 5550, 5552  
2. Install atomic Orange Press into 5585 if that direction wins  
3. Reconcile ART-01 surfaces if supporting articles proceed  
4. Add missing AEO modules (direct answer, FAQs, FAQPage schema) before any staging approval  
5. Run mobile performance remediation on chosen hub before public swap of 1381  

---

## Evidence index (this package)

| File | Contents |
| --- | --- |
| `live-site-health.md` | Sep 1 public health summary |
| `live-site-inventory.json` | Full REST/sitemap inventory |
| `article-aeo-geo-gaps.md` | ART-01/02 AEO/GEO/SEO gap report |
| `raw/wp-json-root.json` | Plugin namespace discovery |
| `raw/*.html` | Critical page HTML captures |

---

*Synthesis compiled from prior audits and local evidence only. Authenticated WordPress draft readback and credential verification were not re-run for this document.*
