# BigOrange.Marketing Live Site Health Summary

**Audit date (UTC):** 2026-09-01T23:13:52.6254558Z  
**Site:** https://bigorange.marketing  
**Purpose:** Sept 3, 2026 leadership review (public evidence only)

## URL inventory counts

| Source | Count |
|--------|------:|
| Yoast sitemap total URLs | 349 |
| post-sitemap.xml | 299 |
| page-sitemap.xml | 50 |
| WP REST published posts | 299 |
| WP REST published pages | 71 |
| Unique URLs in combined inventory | 370 |
| Published REST URLs not in sitemap | 21 |
| Sitemap URLs missing from REST publish set | 0 |

**Sitemap index child sitemaps:** only post-sitemap.xml and page-sitemap.xml (no category, author, or taxonomy sitemaps exposed).

**REST vs sitemap alignment:** Posts and sitemap post count match (299). Page sitemap lists 50 URLs while REST returns 71 published pages; 21 published pages are intentionally or accidentally excluded from the page sitemap (mostly confirmation/thank-you, campaign, and utility landing pages).

## Origin and infrastructure

| Check | Result |
|-------|--------|
| Origin healthy | **Yes** — homepage, /wp-json/, and sitemap index all returned HTTP 200 |
| Cloudflare | Detected (Server: cloudflare, CF-RAY present) |
| WP Engine | Detected (X-Cache, X-Cacheable, X-Cache-Group headers on HTML responses) |
| Cloudflare 5xx origin errors | **None observed** on sampled critical pages |

## Critical page spot-check (HTTP 200 on all six)

| Path | Title (truncated) | H1 count | JSON-LD | Notable issues |
|------|-------------------|---------:|---------|----------------|
| / | Top Digital Marketing Services for MSPs and Builders | 1 | WebPage, Organization, FAQPage, etc. | Typo **Stategic** in meta description, OG, and schema; 8/50 images missing alt |
| /marketing-agency-for-builders/ | Marketing Agency for Builders | 1 | Present | Clean |
| /msp-it-services-marketing-agency/ | IT and MSP Marketing Services | 1 | Present | Clean |
| /ai-search-optimization-services/ | AI Search Optimization Services | **4** | Present | **4 H1 tags**; **index, nofollow** robots meta |
| /website-design-and-storybrand-seo-services/ | StoryBrand Website Design and SEO Services | 1 | Present | Clean |
| /book-appointment/ | Take the Next Step | 1 | Present | Clean |

## Top site-health issues (priority order)

1. **Homepage meta typo — "Stategic"** — Appears in meta description, Open Graph, and Yoast JSON-LD on /. Hurts brand quality signals in SERPs and AI snippets.
2. **AI landing page has four H1 headings** — /ai-search-optimization-services/ uses four Beaver Builder pp-headline H1 elements; weakens primary-topic clarity for SEO/AEO.
3. **AI landing page set to nofollow** — Yoast robots on `/ai-search-optimization-services/` is `index, nofollow`, blocking link equity from that strategic page. **15 published pages** total have Yoast `nofollow` in REST metadata.
4. **Homepage accessibility** — 8 of 50 images on / lack usable alt text.
5. **Sitemap gap for 21 published pages** — Includes /thanks-for-booking/, /contact-confirmation/, campaign landers, and similar utility URLs. Many are likely noindex confirmation pages, but some indexed campaign URLs (e.g. /revenue-engine-campaign/, /msp-marketing-campaign/) may warrant sitemap inclusion review.

## robots.txt notes

- Yoast block allows general crawling with search disallows.
- Custom AI bot policy: allows OAI-SearchBot, PerplexityBot, ChatGPT-User, etc.; blocks GPTBot, ClaudeBot, Google-Extended for training.
- Googlebot and Bingbot explicitly allowed.
- Disallows /admin/, /internal/, and /*incorrect_parameter=*.

## Evidence files

- Full inventory JSON: `live-site-inventory.json`
- Raw fetches: `raw/` (robots.txt, sitemaps, wp-json root, critical page HTML)

