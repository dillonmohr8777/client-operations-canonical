# BigOrange WordPress SEO, AEO, and GEO finish package

Prepared: 2026-09-01  
Review: Thursday, September 3, 2026  
Client: `bigorange-marketing`  
Status: **Local review package. Private WordPress drafts are ready to paste. Nothing published. Email is drafted, not sent.**

This is the last builder-pilot package plus the rest of the live site. It treats site health and ranking as one job, upgrades the two Gmail / WordPress articles with answer-ready blocks, scores **every published WordPress URL**, and turns the same method into a client-scale product BigOrange can show other accounts.

## What leadership is looking at

Two lanes, one system.

**Lane A — finish the builder authority hub.** Emelia’s August 14 Moz snapshot already parks 17 ranked builder terms on `/marketing-agency-for-builders/` (13 of them in positions 1–3). The two supporting articles in Gmail and WordPress are posts `5550` and `5552`. They now have extractable AEO / GEO / SEO modules. Public hub `1381` stays unchanged.

**Lane B — apply the same contract to pages that already rank.** 150 rest-of-site tracked terms across 27 URLs (MSP, StoryBrand, manufacturing, inbound, Cincinnati). The 39-URL deep matrix covers those ranking URLs plus the AI service page, StoryBrand service page, booking page, and eight builder satellites that own zero Moz keywords. The all-pages ledger then applies the same SEO / AEO / GEO contract to the remaining published URLs (370 total).

## The two Gmail articles

Found in Gmail draft `r-3250021375807429264` on thread `19fa4cb8f6812394` (Margee, Paula, Emelia, Janice) and in private WordPress:

| WP | Gmail / live draft title | Local upgraded file |
| --- | --- | --- |
| Post 5550 | What a Custom Home Builder Website Must Include | `wordpress/5550-must-include-upgraded.html` |
| Post 5552 | Five Articles Every Custom Home Builder Blog Needs | `wordpress/5552-five-articles-upgraded.html` |

The August 28 markdown titled *Why Your Home Builder Website Is Not Generating Qualified Leads* is a **different reader job**. It is kept as `wordpress/ART-01-diagnostic-companion.md` and must not replace 5550.

Each upgraded article now includes:

- a labeled Direct answer block
- a definition box
- a decision table
- six visible FAQs with matching FAQPage JSON-LD
- review-state labeling
- live internal links only (`/marketing-agency-for-builders/`, `/book-appointment/`)
- no Homearama anecdote on the WordPress fragments
- no unpublished cluster 404s

Paste instructions: `wordpress/WORDPRESS-INSTALL-NOTES.md`.

## Site health (public fetch 2026-09-01)

Origin is healthy again after the August 31 HTTP 520. Cloudflare + WP Engine. 370 unique public URLs (299 posts, 71 pages). Sitemap lists 349.

Highest-leverage public defects:

1. Homepage typo **Stategic** in meta, Open Graph, and schema
2. `/ai-search-optimization-services/` has **four H1s** and `index, nofollow`
3. 15 published pages carry Yoast `nofollow`
4. 21 published pages are missing from the page sitemap
5. Builder-hub mobile Lighthouse from August 20: Performance 32, LCP about 36 seconds

Full write-up: `playbook/SITEWIDE-HEALTH-AND-RANKING.md`.

## Emelia’s keywords

Source: Emelia Pitlick Gmail, 2026-08-17, subject `BOM Keywords from Moz`, file through 2026-08-14.  
Local copy: `clients/bigorange-marketing/deliverables/2026-08-03-custom-home-builder-authority-hub-pilot/evidence/2026-08-17-moz-bom-rankings.csv`.

171 unique snapshot keywords. 27 protect (1–3), 28 improve (4–10), 23 opportunity (11–20), 93 tracked but unranked.

Analysis: `evidence/emelia-moz-analysis.md`  
Page map: `evidence/emelia-moz-page-map.csv`

These ranks are an August 14 snapshot, not live current ranks.

## WordPress access

Windows Credential Manager target `Codex.ClientAccess.BigOrange.WordPress` is present on this machine. Automated login from this non-interactive session did not reach the dashboard (PowerShell refused the interactive WebRequest, and passkey / Wordfence remains a human gate).

Authorized next step: Dillon signs in with the passkey, pastes the two upgraded fragments into private posts 5550 and 5552, and does not publish. Public 1381 stays untouched.

## Client-scale POC

`playbook/CLIENT-SCALE-SYSTEM.md` is the product story: export in, page map out, one URL per reader job, reusable answer / definition / table / FAQ / entity blocks, SME interview to gated publish. MSP, StoryBrand, manufacturing, and landscaping reuse the same contract with each client’s own keywords. The live demonstration is the 370-row ledger plus `playbook/client-blank-page-map.csv`.

This package is the demonstration. It is not a ranking, traffic, lead, or AI-citation promise.

## Review UI

Open `review-ui/index.html` for the leadership walkthrough. It includes a searchable filter over all 370 URLs. Click a row for that page’s SEO, AEO, GEO, and client-template recommendation.

## Email

Local draft: `drafts/2026-09-01-sept3-review-email.html`  
Gmail draft to update (unsent): `r-3250021375807429264` on the pillar-project thread.

Do not send until Dillon approves the exact preview.

## Folder map

```
evidence/     live inventory (cookies redacted), Moz analysis, article gaps, prior-audit synthesis
playbook/     39-URL deep matrix, 370-URL ledger, sitewide health+ranking, client-scale system
wordpress/    upgraded 5550/5552 HTML, diagnostic companion, install notes
schema/       Article + FAQPage candidates matching visible FAQs
review-ui/    leadership walkthrough plus filterable all-pages POC
drafts/       Sept 3 email
scripts/      Moz analyzer, cookie redaction, all-pages ledger builder
```
