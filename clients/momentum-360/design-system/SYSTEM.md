# Momentum system architecture

Internal specification, version 0.1.0. Incumbent rules are distinguished below from proposed implementation contracts. Website deployment and a unified corporate Momentum 360 website palette are pending authenticated inspection.

## 1. Brand architecture

One client record is the routing boundary, not permission to blend visual identities. Momentum Digital is represented by Need Momentum and the blue wordmark in today's sales deck. Momentum 360 has its own corporate lockup and visual-media work. Orbit is a named product. Signal and Map are review concepts. Each needs a named surface profile.

The reusable layer is the **process**: evidence, exact assets, semantic tokens, layout roles, content contracts, native presentation motion, and quality checks. Color, type, logo, imagery, and expression remain specific to the brand and surface.

| Layer | Responsibility | Source of truth |
| --- | --- | --- |
| Client identity | Correct client, brand, account, and destination | Canonical clients registry |
| Brand primitives | Artwork, intrinsic brand colors, font families | Actual approved assets or inspected implementation |
| Semantic roles | Text, action, status, surface, focus | Explicit surface profile, with contrast checks |
| Components | Reusable anatomy, behavior, states, content contract | Existing implementation plus this extraction plan |
| Templates | Page/slide narrative and proof sequence | Named surface brief |
| Adapters | WordPress, editable PPTX, email, reports | Format-specific implementation |
| Evidence | Sources, dates, hashes, verification, approval state | Local evidence and source records |

Do not move the Signal palette into the production homepage, use Orbit typography in a sales deck, or make the M360 signature's palette the corporate website default. These sources establish specific surfaces.

## 2. Foundations already recovered

### Momentum Digital presentation

The installed `client-deck/brands/momentum-digital.json` owns the current production primitive values. `build-system.mjs` reads it directly on every run. No competing copy is edited here.

| Role | Existing value | Application |
| --- | --- | --- |
| Brand blue | `#2A80C2` | Exact artwork and large emphasis |
| Deep blue | `#17557F` | Proposed normal-size link and action surface |
| Navy | `#0A1825` | Dark openings, dividers, closing |
| White | `#FFFFFF` | Paper or inverse text |
| Ink | `#0F151B` | Primary text on light |
| Slate | `#5A6772` | Secondary text on light |
| Tint | `#F1F6FA` | Secondary light surface |
| Soft inverse | `#9DB5C8` | Secondary copy on navy |
| Orange / green | `#F58320` / `#23A455` | Existing secondary colors; choose semantic use deliberately |

Brand blue on white does not meet the normal-text contrast target. Preserve logo pixels; use the existing deeper blue for small text and action fills. A brand color and a readable small-text color can have separate roles. `evidence/contrast.json` records the actual ratios.

Presentation type is Arial. The incumbent point scale is 54 display, 39 title, 25 heading, 19 section heading, 14 body, 12.5 small body, and 10.5 caption/kicker. Figures may use 40, 62, or 92 points. These are **PowerPoint points**, not a CSS scale. Presentation width is 13.333 inches, height 7.5 inches, margins 0.78 inches, normal gap 0.34 inches, and wide gap 0.62 inches.

Web type in today's source notes is Roboto / Roboto Slab. Those notes also record another existing blue, `#1E73BE`, plus near-black `#1A181D`. A CMS inventory must identify their real consumers before choosing a consolidation. The exported web adapter is an accessible local proposal based on recovered primitives, not a verbatim theme export.

### Momentum 360 email

Today's signature carries blue `#075CA8`, navy `#14314F`, gold `#F2B84B`, secondary `#526679`, and white. It uses Arial/Helvetica with 20px name, 16px role/body, 18px phone, and 44px link line height. These values were checked against the current HTML during generation.

Keep email output as literal inline CSS and presentation tables. Exported variables support previews only. Image blocking must leave name, role, company, website, and contact links legible. Do not use CSS animation, JavaScript, custom-font dependencies, or a layout that requires media queries to become usable.

### Artwork

`output/assets.json` contains six source-located assets and SHA-256 values. It distinguishes the Momentum Digital wordmark, existing white derivative, cropped monogram derivatives, M360 full lockup, and signature mark. The full M360 logo has a light tagline; use it on a dark ground where that tagline remains visible. Use the correctly sourced signature asset for compact contact footers.

Preserve aspect ratio, spelling, alpha, and identity. Do not trace or regenerate corporate marks. A cropped existing monogram is not interchangeable with the full lockup. A new crop, recolor, or knockout needs its own derivation record and visual check. The current system references existing files instead of duplicating asset libraries.

## 3. Typography and composition contracts

For presentations, retain the existing kit's editorial cadence: dark opener, light explanations, dark act dividers, proof with strong figures, and a dark close. Full-bleed panels can create contrast; hairlines organize rows. Content scripts provide narrative, while the kit provides geometry. Use the flow helper's returned baseline instead of hardcoded stacked positions.

For website adaptation, use the current approved typeface and prove loading/fallback behavior first. Proposed roles are display, heading, body, label, control, and data. Their actual responsive sizes remain a staging decision after source extraction. Do not reuse slide point values as pixels. For long reading, choose a comfortable text measure, clear paragraph spacing, and explicit headings; for operator UI, prioritize state and scanability.

Density changes with the surface: sales decks support a spoken argument; case-study pages let people verify it; dashboards communicate current decisions. An ornate homepage motion sequence should not be imposed on a report or form.

## 4. Component contracts

These are implementation and extraction contracts. They do not claim that new WordPress components have already shipped. Extract a component only when the same intent recurs at least three times; retain existing code for single-use structures.

| Component | Anatomy and content | Required behavior and states | Reuse destination |
| --- | --- | --- | --- |
| Brand lockup | Exact asset, brand name, optional descriptor | Correct light/dark asset; readable fallback; no distortion | Navigation, slide opener, footer |
| Primary action | Specific verb, destination, optional context | Default, hover, visible focus, disabled reason, pending, success/error; no duplicate submission | Service page, inquiry, proposal |
| Heading group | Eyebrow, thesis, short explanation | Real heading hierarchy; readable wrap; one dominant thesis | Page section, deck act |
| Service summary | Service name, fit, deliverables, relevant proof, next action | Clear detail destination; no whole-card nested-link conflict | Service listings, sales map |
| Proof block | Claim, metric definition, dates, source, caveat | Whole-number lead counts; show pending fields explicitly; avoid fabricated totals | Case study, slide, report |
| Comparison/pricing | Plan, inclusions, exclusions, term, price date | Label unapproved scope; taxes/spend/fees explicit when applicable; accessible table fallback | Approved offer pages and slides |
| Process | Named steps, owner, outcome | Meaningful order without motion; current step when interactive | Onboarding, engagement, native deck |
| Media/virtual tour | Thumbnail, actual project context, caption, destination | Keyboard-operable play; loading/error/poster states; reserve aspect ratio | M360 portfolio, project page |
| Inquiry form | Purpose, labels, essential fields, consent, submit feedback | Inline errors + summary; focus on error; retain entered data; human-readable confirmation | Lead capture |
| Report metric | Value, unit, source, period, comparison, confidence | Explain data freshness; zero only when verified; no mixed channel totals | Existing Momentum reporting shell |
| Contact footer | Actual sender and brand, text contacts, exact logo | Mobile-readable; useful with blocked images; matching sender identity | Email/PDF |

A component is ready only when content, accessibility, motion, and failure behavior are specified together. Animation cannot be its only indication of a state change.

## 5. Proof and content model

Keep these fields with every reusable result: `brand`, `client`, `claim`, `value`, `unit`, `periodStart`, `periodEnd`, `sourceLocator`, `sourceCheckedAt`, `definition`, `status`, `caveat`, and `approvedForUse`. Not every field needs to appear visually, but the presenter or editor must be able to retrieve it. A source note is not commercial sign-off.

Use real client names and images only within their authorized context. Do not carry numbers from one case-study template into another. Today's sales-deck source ledger explicitly identifies shared-template inconsistencies and unresolved offer/pricing approvals; those items stay unresolved until an authorized owner confirms them.

For M360 portfolio work, record the actual property, service category, photo/tour rights, project URL, poster, aspect ratio, alt text, and whether a customer identity can be public. Preserve actual creator credit when required. Generated illustrations cannot stand in for client results.

## 6. Accessibility and motion

The exported normal-text pairs pass 4.5:1. Large text and non-text UI still need their own context checks; passing one pair does not certify the whole page. Use a visible focus indicator distinguishable from surrounding surfaces, underline links in prose, preserve keyboard access, and never rely on color alone for status.

Web motion should respond to `prefers-reduced-motion`; the reduced state contains the complete message and all controls. Auto-moving media needs usable control, and offscreen or hidden content must not receive focus. Motion timing, role choreography, and PowerPoint-specific reduced-animation variants are documented in [MOTION.md](MOTION.md).

## 7. WordPress integration plan

1. **Inventory on staging.** Record site identity, active/child theme, WordPress version, Elementor kit, global colors/fonts, builder per template, Gutenberg patterns, reusable blocks, forms, menu/footer ownership, custom CSS, cache layers, existing backups, and deployment owner. Inspect a representative homepage, service page, case study, blog, inquiry form, and mobile menu for each site.
2. **Map, don't blindly import.** Match semantic roles to the actual Elementor globals. For Gutenberg, merge the generated `theme-fragment.json` into a staging child theme's current configuration only after version support and conflicts are checked. It uses [WordPress's version 3 theme.json format](https://developer.wordpress.org/block-editor/reference-guides/theme-json-reference/theme-json-living/), which requires WordPress 6.6 or later. For WPBakery, inventory the legacy shortcode dependency and preserve page readability during migration. The generated fragment intentionally contains only a palette.
3. **Prove one page.** Adapt one representative service or case-study page. Compare before/after desktop and mobile, headings, keyboard order, form behavior, page weight, and tracking. A visual change must preserve canonical URLs and established conversion destinations unless separately approved.
4. **Expand verified patterns.** Apply shared tokens to actual repeated components. Keep a before/after selector map and rollback artifact. Test template consumers before replacing a global value.
5. **Release through the real host.** Website hosting evidence points to SiteGround, so a mapped Netlify prototype is not the deployment destination for these production sites. Verify a staging backup and exact production target before a separately authorized WordPress/SiteGround release.

A hosting login, a WordPress editor role, and permission to change site-wide globals are different capabilities. The requested invitation should cover the work actually needed; do not assume full administrator rights are required or already granted.

## 8. Reuse across Dillon's other clients

The onboarding unit is a verified client profile, not a new generator. Resolve that client's registry route, identify approved brand assets and references, add a separate `client-deck` brand definition, verify token contrast in context, and generate the same semantic slide patterns. Each client keeps its own claims ledger and output folder.

For websites, choose the adapter from the real backend. WordPress can use Elementor globals/Gutenberg tokens; a coded site uses the existing token system; email requires inline values. Do not introduce WordPress assumptions into a different CMS.

Before a profile is reusable, verify exact identity, asset provenance, required font fallback, representative light/dark output, real content fit, native animation, and editor compatibility. No other client profile was created by this Momentum release.

## 9. Governance and change control

`client-deck` remains the installed presentation engine. This directory supplies a source registry, generated adapters, evidence, and reusable guidance. Existing prototype and product `DESIGN.md` files remain authoritative for their own surfaces. This document does not overwrite them.

Treat a change to corporate identity or core typography as a major design decision; adding an approved component or surface as a minor revision; correcting documentation or output without changing the visual contract as a patch. Store a source locator, reason, affected surfaces, verification, and owner decision with each material change. A source hash change invalidates generated-artifact verification until review and rebuild.

Open decisions: current CMS invitations and staging; completed versus intended builder migration; official M360 website token export; which prototype direction, if any, should inform a production redesign; sales-deck commercial sign-off. These gaps are explicit so later automation cannot turn an exploratory choice into an approved standard.
