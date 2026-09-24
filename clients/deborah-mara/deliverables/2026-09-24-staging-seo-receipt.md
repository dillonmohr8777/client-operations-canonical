# Deborah Mara staging SEO receipt — 2026-09-24

Scope: the open commitment `slack:1789406415.455699:deborah-staging-seo-fixes` only. The public site was inspected read-only. No WordPress mutation, publication, message, spend, or production change was made in this pass.

## Fresh staging readback

Source: `https://deborah.azldigital.com/`, fetched 2026-09-24.

| Check | Evidence | State |
|---|---|---|
| Staging response | HTTP 200 | verified |
| Page title | `Deborah Mara \| Central New Jersey Real Estate` | verified |
| Meta description | `Buy or sell in Central New Jersey with Deborah Mara of RE/MAX Homeland. Get local guidance, a home value review and a plan for your next move.` | verified |
| Open Graph title/description | Matches the current Deborah title and description | verified |
| Staging protection | `<meta name="robots" content="noindex, nofollow">` | verified active |
| Heading | Exactly one H1: `Your Real Estate Goals Deserve a Proven Strategy.` | verified |
| Structured data | Yoast JSON-LD graph contains `WebPage`, `WebSite`, and `BreadcrumbList`; the graph parses as JSON | verified present |
| Contact CTA | `917.747.5055` and `marasurrealestate@gmail.com` are visible; no `a[href^="tel:"]` was found in the home page DOM | phone link open fix |
| Canonical | No `link[rel="canonical"]` in the rendered home or Sample Page head | open fix |
| Crawl surface | `robots.txt` is crawlable so crawlers can see the noindex directive; Yoast sitemap still lists page, author, and category sitemap files | open cleanup |
| Answer pages | Known slugs for draft IDs 101, 103, 105, and 107 return HTTP 404 publicly | correctly unpublished |
| Auth | `/wp-json/wp/v2/users/me` returns HTTP 401; `/wp-admin/` redirects to the WordPress login form | blocked |

The host is treated as staging because the existing client records identify it as the staging host. No production hostname was supplied or touched.

Historical access path: the 2026-09-14 rollout recorded a successful authenticated Codex in-app browser session at `/wp-admin/` (tab `1632001798`, dashboard under Dillon's account). That in-app browser surface is not exposed in the current child session, so it was not guessed or replaced with a password login.

The approved access route is also recorded in the September 11 `#deborah-mara` Slack evidence: Muhammad U granted administrator access to `dillonmohr8777@gmail.com` for this exact host. A plaintext password was present in that historical channel; it is intentionally not reproduced or used.

Current protected-access check (2026-09-24): no Deborah-specific `bw://` locator was present in the local Access Broker/repository registry. In current Chrome tab `1632003559`, the approved WordPress login URL was opened and Bitwarden's supported `Ctrl+Shift+L` autofill shortcut was attempted on both username and password fields; neither field was populated and no vault prompt appeared. No secret was read, typed, or stored. The exact human handoff is to unlock/select the current protected Bitwarden item (or complete passkey/MFA if offered) on that login tab, then leave the authenticated session open for the staged edits below.

## Exact scoped edits ready after authenticated access

1. Keep the current global `noindex, nofollow` protection while staging remains under review. Keep `robots.txt` crawlable; blocking the URL in robots would hide the noindex signal.
2. Restore/verify Yoast canonical output on the homepage and each staged page. Use the exact staging URL while staging is private; set production self-canonicals only when the approved production release is made.
3. In Yoast sitemap settings, exclude author, category, and other empty archive surfaces from the staging sitemap. Re-read `sitemap_index.xml`, `author-sitemap.xml`, and `category-sitemap.xml` after save.
4. Keep the existing valid Yoast `WebPage`/`WebSite`/`BreadcrumbList` graph. Add the prepared `RealEstateAgent` JSON-LD only after the brokerage identity, logo, phone, and disclosure text are confirmed; do not invent legal or organization data.
5. Preserve the current single homepage H1. Add the approved `tel:+19177475055` href to the phone CTA, then apply the same one-H1/title/description pattern to draft pages 101, 103, 105, and 107 when their private editor readback is available.
6. Build three local area pages only after Deborah supplies the three priority towns. The content plan explicitly leaves those towns unanswered; the current homepage area buttons are not authorization to choose or publish three pages.
7. Configure measurement after the owner property decision: GA4 `generate_lead` on successful form submit, source-page parameter, UTM convention `utm_source=chatgpt&utm_medium=cpc&utm_campaign=<ad-group>`, and Search Console ownership. A property ID or event receipt is not currently available.

## Remaining blockers

- Approved WordPress administrator/application-password session is required for the canonical, sitemap, schema, draft-page, and measurement mutations.
- Deborah must supply the three priority towns.
- RE/MAX Homeland disclosure text and organization logo/identity need owner confirmation before structured data or publication.
- GA4 and Search Console property ownership/access is not established.
- Lead-form SMTP and one real inbox receipt remain separate release gates in the existing runbook.

This receipt is evidence of current staging state and a bounded implementation plan; it is not a claim that the site is production-ready or publicly launched.
