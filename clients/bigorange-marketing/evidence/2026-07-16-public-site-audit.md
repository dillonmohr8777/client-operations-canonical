# BigOrange public website audit

Captured: 2026-07-16

Scope: Public, non-authenticated website evidence only. This audit does not contain private analytics, WordPress administration data, Semrush project data, CRM data, or client records.

## Verified public facts

- Primary website: https://bigorange.marketing/
- The homepage returned HTTP 200 during inspection.
- The site is WordPress hosted on WP Engine and served through Cloudflare.
- Public page source identifies Elementor, Yoast, WP Rocket, Smush, Wordfence, Redirection, Simple History, and Equalize Digital Accessibility Checker.
- The live Yoast sitemap index reports 294 posts and 50 pages, for 344 indexable URLs in those two sitemap groups.
- The public WordPress REST index is available at https://bigorange.marketing/wp-json/.
- The REST index advertises an `mcp` namespace and a default MCP adapter route.
- The REST index advertises Yoast Semrush routes for authentication, country code, and related keyphrases.
- The robots policy allows search and research crawlers including OAI SearchBot, PerplexityBot, ChatGPT User, SemrushBot, and AhrefsBot.
- The robots policy restricts several model training crawlers, including GPTBot, ClaudeBot, CCBot, Google Extended, and ByteDance Spider.

## High-confidence opportunities

1. Correct the homepage meta description typo from `Stategic` to `Strategic`.
2. Normalize the AI search optimization service page from four H1 elements to one clear document H1 while preserving the visual design.
3. Establish repeatable mobile and desktop Lighthouse measurements plus Search Console field data before setting performance targets.
4. Connect forms, calls, CRM outcomes, and channel cost so reporting can show qualified pipeline instead of isolated traffic.
5. Use the existing WordPress and Semrush integration surfaces for a guarded research, content inventory, draft, link, and schema QA workflow.

## Recommended authentication model

- Semrush: OAuth through the official Semrush MCP endpoint, beginning with read-only Projects and analytics methods.
- WordPress: A dedicated, revocable Application Password over HTTPS, associated with a role-specific account.
- Default state: Read only.
- Content state: Draft or staging until a human approves publication.
- Audit state: Record the source date, affected URLs, and exact output from every batch.

## Sources

- https://bigorange.marketing/
- https://bigorange.marketing/ai-search-optimization-services/
- https://bigorange.marketing/website-design-and-storybrand-seo-services/
- https://bigorange.marketing/sitemap_index.xml
- https://bigorange.marketing/robots.txt
- https://bigorange.marketing/wp-json/
- https://developer.semrush.com/api/v3/introduction/semrush-mcp/
- https://developer.wordpress.org/rest-api/
- https://developer.wordpress.org/advanced-administration/security/application-passwords/
