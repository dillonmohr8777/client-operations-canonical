# WordPress install notes — posts 5550 and 5552

**Status:** private review drafts only  
**Review target:** Sept 3 2026 leadership review  
**Do not publish.**  
**Do not change public post / page 1381** (`/marketing-agency-for-builders/`).

These notes cover how to paste the upgraded branded HTML into the existing private supporting-article posts. They do not authorize sending, publishing, indexation, or a public hub swap.

## What each file is for

| Local file | WordPress target | Reader job | Action |
| --- | --- | --- | --- |
| `5550-must-include-upgraded.html` | Private post **5550** | What a custom home builder website must include | Replace the existing Custom HTML block. Keep this H1. |
| `5552-five-articles-upgraded.html` | Private post **5552** | Five articles every custom home builder blog needs | Replace the existing Custom HTML block. Keep this H1. |
| `ART-01-diagnostic-companion.md` | **No WordPress target** | Why a home builder website misses qualified leads | Review-only third draft. Do **not** paste into 5550. |
| `../schema/5550.schema.json` | Candidate graph for 5550 | Article + FAQPage | Reconcile with Yoast after paste. Do not submit as live schema until the post is public. |
| `../schema/5552.schema.json` | Candidate graph for 5552 | Article + FAQPage | Same as 5550. |

Post 5550 and the August 28 ART-01 markdown are **different articles**. Leadership still needs to decide whether the diagnostic query gets its own future URL. Until then, 5550 stays the must-include article.

## Hard stops

- Keep both posts **Private**. Do not switch to Draft-public, Pending, or Publish.
- Do not add the posts to a public menu, the public hub, or the Yoast sitemap.
- In Yoast, keep **noindex** if that field is available on a private post. A private post is not publication, but do not flip it to allow indexing.
- Do not edit, duplicate, or swap public post **1381**.
- Do not create new public posts from `ART-01-diagnostic-companion.md`.
- Do not link unpublished proposed slugs: `/home-builder-website-design/`, `/best-home-builder-websites/`, `/home-builder-website-seo-checklist/`, `/home-builder-content-marketing/`, `/home-builder-marketing-plan/`, `/home-builder-website-not-generating-leads/`.
- Live internal links only: `/marketing-agency-for-builders/` and `/book-appointment/`.
- Do not invent performance, ranking, traffic, lead, or revenue claims.
- Do not add the gated Homearama anecdote to 5550 or 5552.
- Keep the existing "cutie website" line in 5550. Do not invent or expand Janice quotes.

## How to paste post 5550

1. Sign in as a WordPress administrator who can save `unfiltered_html` (required for the scoped `<style>` and JSON-LD `<script>`).
2. Open **Posts → All Posts → 5550**. Preview path: `https://bigorange.marketing/?p=5550&preview=true`.
3. Keep visibility **Private**.
4. Keep the post title aligned with the H1: `What a Custom Home Builder Website Must Include`.
5. Keep slug candidate `custom-home-builder-website-must-haves`. Do not publish that URL.
6. Switch the editor to **Code editor** (or replace the single existing Custom HTML block).
7. Select the current `<!-- wp:html -->` ... `<!-- /wp:html -->` fragment and replace it with the full contents of `5550-must-include-upgraded.html`.
8. Do not split the fragment into extra blocks. The scoped CSS, article, and JSON-LD must travel together.
9. Update featured image only if the current library image is already `builder-blueprint-hero.webp`. Do not upload a substitute from another client.
10. Click **Update**. Do not click **Publish**.
11. Open the private preview and confirm: logo, H1, status line `Private review draft · Sept 3 2026`, Direct answer block, definition box, decision table, checklist, six FAQ H3s, hub and booking links, and no Homearama paragraph.

## How to paste post 5552

1. Open **Posts → All Posts → 5552**. Preview path: `https://bigorange.marketing/?p=5552&preview=true`.
2. Keep visibility **Private**.
3. Keep the post title aligned with the H1: `Five Articles Every Custom Home Builder Blog Needs`.
4. Keep slug candidate `custom-home-builder-blog-articles`. Do not publish that URL.
5. Replace the existing `<!-- wp:html -->` fragment with the full contents of `5552-five-articles-upgraded.html`.
6. Confirm the unanswered H3 question stubs are gone and the six FAQ answers are visible.
7. Confirm the short-form content section and the Semrush sources box are present.
8. Click **Update**. Do not click **Publish**.

## Yoast SEO fields to set

Set these in the Yoast panel on each private post. They are not inside the HTML fragment.

### Post 5550

| Field | Value | Count |
| --- | --- | --- |
| SEO title | `What a Custom Home Builder Website Must Include` | 47 characters |
| Meta description | `See the pages, proof, process, people, qualification, and next step a custom home builder website must include so the right buyers can trust the work.` | 152 characters |
| Slug | `custom-home-builder-website-must-haves` | candidate only |
| Canonical | Leave empty while private, or keep the post's own future URL. Do not canonicalize to 1381 or to the diagnostic companion. | — |
| Indexation | noindex / not in sitemap | required |
| Cornerstone | off | — |

### Post 5552

| Field | Value | Count |
| --- | --- | --- |
| SEO title | `Five Articles Every Custom Home Builder Blog Needs` | 50 characters |
| Meta description | `Build a useful custom home builder blog with five article types that answer buyer questions, demonstrate expertise, support sales, and create clear next steps.` | 159 characters |
| Slug | `custom-home-builder-blog-articles` | candidate only |
| Canonical | Leave empty while private. Do not canonicalize to 1381. | — |
| Indexation | noindex / not in sitemap | required |
| Cornerstone | off | — |

Do not paste ART-01 companion title or meta onto post 5550. Those fields belong to the diagnostic reader job only if leadership later creates a **new** private post.

## Schema reconciliation

Each HTML fragment already includes one `application/ld+json` graph with `Article` plus `FAQPage`. The same graphs live in:

- `schema/5550.schema.json`
- `schema/5552.schema.json`

Before any future publication approval:

1. View the private preview source.
2. Confirm the inline FAQ questions and answers match the visible H3/paragraph pairs exactly.
3. Check Yoast / theme output for a second Article, FAQPage, Organization, or BreadcrumbList object.
4. If Yoast already emits Article or FAQ, disable the duplicate. Keep **one** graph per type.
5. Do not add BreadcrumbList inside the article block. Site-wide breadcrumbs should emit once.
6. Candidate URLs in the JSON-LD are the intended slugs, not live public pages. They must not be treated as indexed URLs while the posts stay private.

## After-paste private checklist

- [ ] 5550 H1 is still `What a Custom Home Builder Website Must Include`.
- [ ] 5552 H1 is still `Five Articles Every Custom Home Builder Blog Needs`.
- [ ] Status text reads `Private review draft · Sept 3 2026`.
- [ ] Logo URL is `https://bigorange.marketing/wp-content/uploads/2026/08/bigorange-logo-orange.png`.
- [ ] Direct answer, definition, and decision table render with orange / paper / ink styling.
- [ ] Six visible FAQs on each post; JSON-LD names and texts match.
- [ ] 5550 still contains the cutie-website line and does **not** contain Homearama.
- [ ] 5552 contains the short-form section and the August 4, 2026 Semrush volume-30 note.
- [ ] Internal links resolve only to `/marketing-agency-for-builders/` and `/book-appointment/`.
- [ ] Both posts remain Private. 1381 is untouched.
- [ ] ART-01 companion remains a markdown file in this folder.

## Rollback

The previous branded fragments remain at:

- `clients/bigorange-marketing/deliverables/2026-08-03-custom-home-builder-authority-hub-pilot/wordpress/branded-articles/supporting-article-01-branded.html`
- `clients/bigorange-marketing/deliverables/2026-08-03-custom-home-builder-authority-hub-pilot/wordpress/branded-articles/supporting-article-02-branded.html`

If the upgraded paste fails, restore that older fragment into the same Custom HTML block and keep the post private.
