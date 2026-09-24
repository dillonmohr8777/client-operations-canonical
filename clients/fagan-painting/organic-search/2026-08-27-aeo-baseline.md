---
note_type: evidence
status: in-progress
created: 2026-08-27
verified_at: 2026-08-27T22:05:00Z
clientId: fagan-painting
agent: marketing-chief-operator
privacy: redacted
external_action_attempted: none
mail_ready: hold
---

# Fagan Painting AEO baseline - 2026-08-27

Dillon instructed to start AEO and fix site-health issues. This packet is the organic and AI-citation baseline plus the first implementation specs. WordPress publication stays with Phil and Mac. No live page was edited. SiteGround captcha blocked this worker's WordPress REST and most www/sitemap fetches. Google Search Console still reports a successful Google fetch of the apex homepage.

## Live verification

| Check | Result |
|---|---|
| Apex homepage `https://faganpainting.com/` | HTTP 200 via Firecrawl stealth. Title: Fagan Painting - Pittsburgh Painting Professionals. Robots meta: index, follow. Last modified 2026-08-10. |
| `https://www.faganpainting.com/` | This worker: HTTP 202 SiteGround captcha, `X-Robots-Tag: noindex`. GSC inspect: Page with redirect to apex, Google fetch SUCCESSFUL, last crawl 2026-08-19. |
| `robots.txt` | HTTP 200 (intermittent captcha). Sitemap points to `sitemap_index.xml`. Truncated trailing rule `Disallow: /header`. No GPTBot, PerplexityBot, ClaudeBot, or Google-Extended allow. |
| `sitemap_index.xml` | This worker: HTTP 202 captcha. GSC homepage inspect still lists that sitemap. Direct sitemap URL inspect: unknown as a page (expected). |
| `wp-json` pages list | Captcha redirect from this IP. Page inventory taken from homepage nav instead. |
| Homepage GSC inspect | PASS. Submitted and indexed. Google fetch SUCCESSFUL. Last crawl 2026-08-27T10:36:37Z. Canonical apex. Rich results: Product snippets, Breadcrumbs, Review snippets. Product snippets on a local painting homepage is the wrong entity type for AEO. |
| FAQ page | HTTP 200. Confirmed 2026-08-27T22:05Z: "How do I choose the right paint colors and sheens?" still repeats the furniture-moving answer. Residential FAQ already has the correct color/sheen answer. Prep FAQ also says "drops cloths". |
| Homepage copy | Live-verified two-year warranty on all work. Area list includes Murrysville in prose and "Murraysville" in the city grid. |
| Phil blog | `https://faganpainting.com/how-to-fix-landlord-special-paint-job-pittsburgh/` HTTP 200, indexable article. |

## Search Console 2026-08-21 through 2026-08-25

Account `google_search_console_kindle-spurt`, property `sc-domain:faganpainting.com`. Web search. 2026-08-26 empty.

| Date | Clicks | Impressions | Avg position |
|---|---:|---:|---:|
| 2026-08-21 | 0 | 780 | 22.8 |
| 2026-08-22 | 0 | 797 | 23.2 |
| 2026-08-23 | 1 | 583 | 20.9 |
| 2026-08-24 | 0 | 1158 | 24.6 |
| 2026-08-25 | 0 | 988 | 24.0 |
| **Total** | **1** | **4306** | ~23 |

The one click was branded `fagan painting llc` (5 impressions, avg position 1.6). Non-brand demand is visible and not converting.

## Ten-query monitoring set

First eight are live GSC query rows from this window. Last two are proposed from the live FAQ and service nav; do not treat them as current GSC totals until Phil and Mac review.

1. fagan painting llc (brand)
2. affordable painters
3. affordable painting contractors for residential work near me?
4. are flat and matte paint the same
5. best interior painters pittsburgh pa
6. best metallic paint for walls
7. best painting companies pittsburgh
8. bridgeville pa painting company
9. proposed: interior house painting pittsburgh
10. proposed: exterior house painting pittsburgh

## Site-health issues to fix (Phil / SiteGround)

1. **SiteGround captcha on www, sitemap, and wp-json** from non-Google IPs. Google can fetch the apex homepage. AI crawlers used for AEO citations often cannot. Whitelist Googlebot, Bingbot, GPTBot, PerplexityBot, ClaudeBot, and Google-Extended. Keep human bot protection.
2. **Complete `robots.txt`**. Replace the truncated `Disallow: /header` rule. Allow AI crawlers explicitly. Keep xmlrpc disallowed. File: `organic-search/2026-08-27-robots-recommended.txt`.
3. **Homepage schema**. GSC detects Product snippets. Replace with PaintingContractor / LocalBusiness JSON-LD plus the existing FAQPage only where visible Q and A match. Spec: `organic-search/2026-08-27-schema-spec.md`.
4. **FAQ copy defect**. Color/sheen question currently answers furniture moving. Swap in the color-selection answer already used under Residential Painting FAQs. Fix "drops cloths" to "drop cloths".
5. **Murrysville spelling**. Prose says Murrysville; the city grid says Murraysville. Use Murrysville.
6. **Do not invent** pricing, service radius, or extra guarantees. The homepage already states a two-year warranty; that fact may be used in schema. Do not add a street address or numeric service radius.

## First AEO implementation lane

Priority pages from live nav:

- Residential / Interior / Exterior / Cabinet
- Commercial / HOA
- Areas we serve (start with pages that already exist, including Allison Park and Baldwin)
- FAQs
- Estimate / contact
- The landlord-special blog Phil already published

Each priority page needs one direct answer in the first 200 words, process, prep, estimate expectation, and internal links. Publication remains Phil and Mac.

## Lead path (context, not AEO success)

Mailbox subject `New Fagan Painting lead` since 2026-08-12: one website estimate-form notification on 2026-08-12. Client reported a closed job of $9600 on 2026-08-20 and good incoming data. No new form notifications 2026-08-13 through 2026-08-27. Meta remains outside this lane (Benson / Legacy Paint Holdings).

## Not done

- No WordPress login, no live robots edit, no schema publish, no client email, no Semrush login.
- No ChatGPT / Perplexity / Copilot citation log this tick (captcha and time). Next cycle: run the ten queries in those surfaces after robots allow AI crawlers.

Phil packet: `organic-search/2026-08-27-phil-publish-packet.md`. FAQ paste: `organic-search/2026-08-27-faq-copy-fix.md`.
