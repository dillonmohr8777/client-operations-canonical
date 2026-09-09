# Technical SEO and AI Search Implementation Specification

Prepared August 3, 2026 for the existing BigOrange WordPress page at `https://bigorange.marketing/marketing-agency-for-builders/`.

## Decision

Keep and evolve the existing URL. Do not publish a second page targeting the same central topic. Preserve the current page's useful builder proof and internal-link equity while replacing its architecture, metadata, copy hierarchy, and structured-data graph.

## Current public baseline

- Live status: HTTP 200.
- Canonical: self-referencing and correct.
- Visible body copy: approximately 2,057 words in the August 3 inventory.
- Headings: 43 H1–H3 elements; one H1.
- Internal-link instances: 83.
- Images: 34; two lacked alt text in the rendered inventory.
- Structured data: one JSON-LD block detected.
- Robots policy: OAI-SearchBot, ChatGPT-User, and PerplexityBot are allowed; GPTBot, ClaudeBot, and Google-Extended are disallowed. That is a defensible search-access versus model-training distinction and should be reviewed intentionally rather than changed reflexively.

## Lighthouse lab baseline

Single lab runs captured August 3, 2026. These are diagnostic snapshots, not CrUX field data.

| Profile | Performance | Accessibility | Best practices | SEO | LCP | TBT | CLS |
|---|---:|---:|---:|---:|---:|---:|---:|
| Mobile | 26 | 86 | 57 | 92 | 28.6s | 2,650ms | 0.007 |
| Desktop | 67 | 86 | 56 | 92 | 2.6s | 210ms | 0.004 |

The immediate risk is mobile loading and main-thread work. Official good Core Web Vitals thresholds are LCP at or below 2.5 seconds, INP at or below 200 milliseconds, and CLS at or below 0.1 at the 75th percentile. Field data should determine the actual pass/fail status; Lighthouse TBT is only a lab proxy for responsiveness.

## WordPress implementation requirements

### URL and publishing

- Edit the existing page in staging or as an unpublished revision.
- Preserve the current slug and self-canonical.
- Do not change the URL unless a redirect map, internal-link update, canonical QA, and Search Console monitoring plan are approved.
- Record pre-launch HTML, screenshots, metadata, schema, and Lighthouse evidence for rollback.

### Metadata

- Proposed title: `Custom Home Builder Marketing Agency | BigOrange Marketing`
- Proposed meta description: `A practical marketing system for custom home builders: positioning, website conversion, SEO, local and AI visibility, content, proof, and measurement.`
- H1: `Custom Home Builder Marketing That Builds Trust Before the First Call`
- Social title and description should match the page promise without unsupported result claims.
- Use a builder-specific Open Graph image with descriptive alt text.

### Content and navigation

- Add an anchored table of contents after the introduction.
- Use one H1 and a logical H2/H3 hierarchy.
- Put a short direct answer under every question-style heading before the detail.
- Add “last reviewed,” author, and SME reviewer fields.
- Link to the three subpillars and the first two supporting articles with descriptive anchor text.
- Preserve useful existing case examples, testimonials, awards, and package context only when their wording remains approved and attributable.
- Add a final source note distinguishing official guidance, BigOrange experience, and client-specific evidence.

### Media and accessibility

- Resize hero and case-study images to their rendered dimensions.
- Prefer AVIF or WebP with JPEG fallback where the existing stack supports it.
- Never lazy-load the LCP image; preload only the single real LCP candidate.
- Lazy-load below-the-fold media.
- Add meaningful alt text for informative images and empty alt text for decorative images.
- Preserve visible focus, semantic landmarks, keyboard access, sufficient contrast, and reduced-motion behavior.
- Re-run automated and manual accessibility checks before publishing.

### Performance work order

1. Identify the mobile LCP element and its request chain.
2. Remove any hero video, carousel, or background image from the critical path; use a lightweight poster or static image first.
3. Eliminate render-blocking CSS and unused Elementor/widget CSS on this page.
4. Delay nonessential third-party scripts until consent or interaction where appropriate.
5. Reduce JavaScript execution and long tasks; audit sliders, animation libraries, chat, tracking duplication, and tag-manager containers.
6. Serve critical fonts locally where licensing permits, subset weights, and use `font-display: swap`.
7. Confirm WP Rocket and Cloudflare caching behavior on anonymous mobile requests.
8. Test on a clean mobile connection after cache warm-up and cold-cache conditions.
9. Validate with PageSpeed Insights/CrUX and Search Console Core Web Vitals after launch.

### Internal linking

- Pillar links down to every subpillar and primary supporting article.
- Every supporting asset links back to the pillar in the first meaningful third of the copy.
- Cross-link adjacent assets only where the link answers the reader's next question.
- Add breadcrumbs and keep link anchor text descriptive.
- Remove accidental duplicate links caused by desktop/mobile widget copies if both are present in the DOM.

## Structured-data graph

Use a single coherent `@graph`, not disconnected duplicate objects from multiple plugins.

- `Organization`: stable BigOrange identity and approved profiles.
- `WebSite`: publisher relationship and site identity.
- `WebPage`: canonical URL, title, description, dates, breadcrumb, and primary image.
- `Article`: author, reviewer, dates, headline, image, publisher, and mainEntityOfPage where the final page qualifies as editorial content.
- `BreadcrumbList`: Home → Industries or Services → Custom Home Builder Marketing.
- `FAQPage`: only for questions and answers that are visible on the page. Do not expect or promise a Google rich result.
- Optional `VideoObject`: only when a public on-page video has a stable thumbnail, duration, upload date, and transcript.

Schema must match visible content. Do not add review, rating, service-area, award, price, or result claims that are absent from or unsupported on the page.

## AI-search implementation

There is no special “AI ranking” tag. Google states that its normal SEO foundations apply to AI features; OpenAI and Perplexity provide crawler controls for search discovery. The controllable program is:

1. Keep the page indexable and snippet-eligible.
2. Allow intended search crawlers through robots.txt and the CDN/WAF.
3. Use clear entity names, audience, services, markets, and authorship.
4. Answer specific builder questions in visible text.
5. Support important claims with original evidence or reputable citations.
6. Keep structured data consistent with the visible page.
7. Build internal links and external corroboration around the same entity and topic.
8. Track qualified referral traffic and assisted outcomes instead of promising placement.

## Measurement plan

### Search and discovery

- Search Console clicks, impressions, CTR, average position, indexed pages, and query mix for the cluster.
- Bing Webmaster Tools equivalent visibility.
- Organic landing sessions and engaged sessions in GA4.
- Referrals from ChatGPT, Perplexity, Gemini, Claude, Copilot, and other discoverable AI sources where referrer data is available.
- A monthly, versioned prompt set for directional mention/citation observation. Treat outputs as volatile samples, not rankings.

### Business outcomes

- Qualified consultation submissions.
- Sales-accepted leads.
- Service-area, project-type, budget, and timing fit.
- Assisted conversions and return visits across the long decision cycle.
- Pipeline and closed-won value only when attribution and CRM definitions are validated.

Conversion reporting is pending validation until GA4, Search Console, HubSpot, form, call, booking, and CRM outcome definitions are reviewed together.

## Pre-publish QA

- Staging URL and noindex behavior verified.
- Approved content and Janice SME revisions applied.
- One H1; no skipped heading levels that impair comprehension.
- Metadata, canonical, robots, sitemap, and status code verified.
- Schema passes syntax checks and matches visible content.
- All internal and external links tested.
- Form, thank-you, call tracking, and consent behavior tested.
- 390px, 768px, 1024px, and 1440px visual QA complete.
- Keyboard and screen-reader spot check complete.
- Fresh mobile and desktop performance captures archived.
- Rollback snapshot and responsible publisher recorded.

## Official references

- Google Search: https://developers.google.com/search/docs/appearance/ai-features
- Google Core Web Vitals: https://web.dev/articles/vitals
- OpenAI publishers and crawler controls: https://help.openai.com/en/articles/12627856-publishers-and-developers-faq
- OpenAI crawler information: https://platform.openai.com/docs/bots
- Perplexity crawler guidance: https://docs.perplexity.ai/guides/bots
- Anthropic crawler guidance: https://support.anthropic.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler
