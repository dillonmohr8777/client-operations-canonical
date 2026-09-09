# Beaver Builder Assembly Guide

Target: existing page at `https://bigorange.marketing/marketing-agency-for-builders/`

## Installed private review build

The exact WordPress account is authenticated. The coded authority hub is installed as private draft post `5546` with the `No Header/Footer` template and scoped CSS.

Private preview: `https://bigorange.marketing/?page_id=5546&preview=true`

The public target remains unchanged as post `1381`. A reversible copy of the current public page also exists as draft post `5545`.

Supporting article drafts:

- post `5550`, proposed slug `custom-home-builder-website-must-haves`
- post `5552`, proposed slug `custom-home-builder-blog-articles`

The review build is intentionally coded inside a WordPress Custom HTML block so BigOrange can inspect the finished visual direction immediately. If the final handoff requires routine marketer edits without touching HTML, use the module map below to rebuild the approved copy in Beaver Builder before publication.

## Safe implementation sequence

1. Clone the current page into a private, noindex staging or draft revision. Do not alter the public URL during assembly.
2. Preserve the existing global header, footer, navigation, cookie tooling, analytics, forms, and reusable BigOrange modules.
3. Add the scoped stylesheet from `authority-hub.css` to the verified child theme or approved page-level CSS location. All authority-hub classes begin with `bom-`.
4. Build the modules from `pillar-page.html` in the order below. The standalone document wrapper and `noindex` meta are for local preview only; do not paste those into production.
5. Use the existing WordPress media-library versions of the logo, hero, case-study image, and testimonials. The local `assets/` copies are design evidence and a fallback package.
6. Configure metadata from `seo-metadata.json`, schema from `schema-graph.json`, and links from `internal-link-map.csv`.
7. Run the staging QA checklist, obtain Janice's factual approval, then request publication approval for the exact staged revision.

## Module map

| Order | Beaver Builder module | Source block | Editor-owned fields |
|---:|---|---|---|
| 1 | Full-width hero row | `.bom-hero` | eyebrow, H1, lede, primary CTA, hero image |
| 2 | Sticky HTML/menu row | `.bom-index` | section labels and anchors |
| 3 | Two-column content row | `#difference .bom-section__intro` | difference copy |
| 4 | Card-grid row | `#difference .bom-studio` | four principle cards |
| 5 | Dark full-width row | `#blueprint` | five blueprint steps |
| 6 | Proof/image row | `#proof` | case image, caption, verified testimonials |
| 7 | Three-card row | `#visibility` | search, local, and AI summaries |
| 8 | Dark callout | `.bom-route` | 90-day route |
| 9 | Two-column scorecard | `#measure .bom-scorecard` | leading and business indicators |
| 10 | Accordion | `#faq .bom-faq` | visible FAQ questions and answers |
| 11 | Dark CTA row | `.bom-cta` | CTA heading, body, and link |
| 12 | Small editorial note | `.bom-editorial` | review and source status; remove after final approval if BigOrange prefers |

## Editable-field rules

- Keep all page copy in native text or heading modules; do not bury routine copy in theme PHP.
- Keep image alternatives in the media library and verify the rendered `alt` output.
- Keep CTAs in button modules with descriptive labels. Avoid empty icon links.
- Use native accordion semantics or verify the selected module supports keyboard activation, focus visibility, and correct expanded state.
- Maintain one H1. H2s define the main sections; H3s define cards, steps, and questions.
- Do not add auto-playing video, sliders, or new third-party libraries to this page.

## Performance work order

- Replace the current hero delivery with a correctly sized WebP or AVIF and preload only the final LCP image.
- Keep the logo dimensions explicit.
- Lazy-load below-the-fold images and iframes; never lazy-load the final hero image.
- Remove unused page-builder rows and disabled modules from the staged revision.
- Audit third-party scripts by purpose and load them only where needed.
- Use `font-display: swap` for the existing font files or self-hosted equivalents.
- Purge relevant caches after staging changes, then run one mobile and one desktop confirmation test.

## WordPress access boundary

The August 20 account check succeeded. The exact BigOrange WordPress dashboard is authenticated as Dillon Mohr, and the three private review drafts were created. No public page was changed or published.
