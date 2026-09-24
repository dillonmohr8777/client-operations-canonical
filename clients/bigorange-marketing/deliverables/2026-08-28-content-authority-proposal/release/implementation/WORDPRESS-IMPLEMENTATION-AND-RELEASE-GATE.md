# WordPress Implementation and Release Gate

Prepared: August 28, 2026  
Status: ready for a named WordPress owner after factual and leadership approval

## Target rules

- Preserve `https://bigorange.marketing/marketing-agency-for-builders/` as HUB-01 unless leadership explicitly changes the canonical architecture.
- Update HUB-01 in place. Do not import a duplicate hub page.
- Create supporting URLs only from the approved publication manifest.
- Use draft or private status during assembly. A WordPress draft is not publication.
- Do not install copy on an unidentified staging or production target.

## Before assembly

- [ ] Janice or the appropriate SME approves factual accuracy and public-use permission.
- [ ] Leadership approves the exact asset, CTA, offer language, imagery, and owner.
- [ ] The target WordPress environment, page or post type, editor, SEO plugin, analytics owner, form owner, and rollback owner are named.
- [ ] Approved featured image, inline visuals, releases, captions, and alt text exist.
- [ ] The publication manifest has one primary URL and no cannibalizing owner.

## Assembly sequence

1. Capture a rollback snapshot of any URL being updated.
2. Install the reviewed HTML fragment into the correct editable WordPress content modules.
3. Set the title tag, meta description, slug, canonical, author or reviewer, featured image, alt text, and social-share fields.
4. Install only the approved internal links and confirm each target exists in the same environment.
5. Reconcile the candidate JSON-LD with existing theme and plugin output. Remove duplicates before release.
6. Keep visible FAQ wording exactly aligned with any `FAQPage` candidate.
7. Configure form routing, consent, analytics events, CRM source fields, and response ownership.
8. Confirm indexation and sitemap behavior for the intended release state.

## Staging QA

- [ ] Desktop and mobile layout reviewed.
- [ ] Keyboard navigation, visible focus, heading order, labels, contrast, and alt text reviewed.
- [ ] Reduced motion, overflow, image sizing, lazy loading, and layout stability reviewed.
- [ ] Title, description, H1, canonical, robots directive, breadcrumbs, and sitemap behavior verified from rendered HTML.
- [ ] JSON-LD parses and matches visible content; no duplicate Organization, BreadcrumbList, Article, Service, or FAQ objects.
- [ ] Every internal and external link returns the intended destination.
- [ ] Forms reach the correct owner and preserve approved source fields.
- [ ] Analytics and CRM events are observed without inventing a conversion result.
- [ ] Console and network errors are reviewed.
- [ ] Rollback artifact and owner are recorded.

## Publication and live verification

Publication requires explicit approval for the exact staged revision. After release, separately verify:

- the final public URL and HTTP status;
- rendered title, description, H1, canonical, robots directive, and structured data;
- visible FAQ and schema parity;
- internal links, featured image, alt text, forms, and CTA routing;
- mobile, keyboard, focus, accessibility, and overflow behavior;
- analytics and CRM receipt where configured;
- sitemap inclusion and the selected canonical in Search Console when available;
- rollback readiness.

No ranking, traffic, lead, revenue, rich-result, or AI-citation result is implied by a successful release.
