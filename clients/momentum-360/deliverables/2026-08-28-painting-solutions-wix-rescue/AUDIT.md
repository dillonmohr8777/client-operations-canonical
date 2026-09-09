# Painting Solutions Inc. Wix rescue audit

Status: **Wix launch-critical repairs and form-routing drafts saved; final editor regression completed; publication held for Wednesday owner review; remaining accessibility/navigation cleanup is still open**

Public build reviewed: `https://melissadianer.wixsite.com/psiaz`

Existing production site left untouched: `https://paintingsolutionsaz.com/`

Review date: August 28, 2026

## August 28 live intervention update

This update supersedes the access and responsive-shell findings in the baseline audit below. The baseline is retained as the before-state evidence.

### Confirmed current state

- Exact PSI Wix site and editor access verified: meta site `1cf14586-b1ec-4662-b0bb-f8c16945858b`, document `250c340a-39fc-441a-8794-fa037a298c59`.
- Draft saved to the existing Wix staging address `https://melissadianer.wixsite.com/psiaz`.
- The draft has **not** been published. The public staging URL still shows the prior published version until publication is explicitly approved.
- The existing production site and domain were not changed.
- GoDaddy delegate access was accepted and verified read-only under Cecilia Guerrero with `Products & Domains` access.
- The delegated account contains `paintingsolutionsaz.com`; no DNS, nameserver, renewal, contact, or connection settings were changed.

### Repairs applied and read back

- Global `GET A QUOTE` now routes to Contact.
- Home hero `REQUEST A QUOTE` now routes to Contact.
- Global `602-694-4523` now uses `tel:+1 602-694-4523`.
- Home `REQUEST FENCE RENTAL` and the adjacent fence `LEARN MORE` action now both route to the Fence Rentals page.
- Industrial and Facility Maintenance `REQUEST A QUOTE` buttons were repaired from unlinked controls to the Contact page.
- Home service-card readback now confirms Industrial Painting and Technical Coatings route to Industrial, and the Power Plants feature routes to Power Plants. Five other Home `LEARN MORE` labels remain unlinked and are recorded below rather than overstated as complete.
- Mobile navigation width changed from 188px at X 66 to 260px at X 30, eliminating the clipped `INDUSTRIES` label.
- Desktop quote and phone group moved from X 860 to X 825, keeping the complete phone number visible at the 1,280px QA viewport.
- The global footer divider was changed from a 1,943px fixed-width line at X -507 to responsive full-width stretch with zero margins.
- Melissa confirmed `paintingsolutionsinc@outlook.com` as the intended business inbox. The exact address was entered in Wix Business Info and visually read back after a full page reload. The same reloaded panel read back the saved phone as `+16026944523`.
- All three in-use form automations were independently opened and read back with `Business Email` and `Collaborator Roles (1)` selected: the August 21 Project Inquiry form, the July 11 Project Inquiry form, and the Inquiry Services form. These automation changes are saved as drafts and remain unpublished.
- Footer Facebook now routes to `https://facebook.com/PaintingSolutionsAZ`.
- Footer Instagram now routes to `https://instagram.com/paintingsolutionsinc`.
- The unverified LinkedIn icon was removed.

### Final draft QA evidence

- A fresh 12-page editor regression was completed after the last conversion-link and Business Info edits: Home, Water Treatment, Power Plants, Industrial, Facility Maintenance, Commercial, Fence Rentals, PSI Home, Projects, Contact, About, and Inquiry Services.
- All 12 draft routes loaded in the editor. Every route retained the global `tel:+1 602-694-4523` header action, and each route with a project form retained the expected form controls. The sweep also reconfirmed the previously documented heading, alt-text, and autocomplete debt rather than masking it.
- In that sweep, every inspected mobile route returned a 320px site-container width and a 320px site-container scroll width.
- After the last edits, targeted Preview regression checks were rerun on Home, Industrial, Facility Maintenance, and Contact. Home and Contact were visually inspected again in the Wix phone shell; the Contact form fields and submit action remained inside the mobile canvas.
- Mobile Preview menu opened and showed complete Home, Industries, Services, Contact, and About labels after the last edit.
- Mobile global quote navigation reached Contact in Preview.
- Desktop Preview returned `body.clientWidth = 1265` and `body.scrollWidth = 1265` after the footer-divider repair.
- Desktop Preview showed the full `602-694-4523` label and read back `tel:+1 602-694-4523`.
- Final desktop Preview showed only the verified Facebook and Instagram footer icons with no visible horizontal overflow.
- Final mobile Preview showed the single-column Contact Project Inquiry form through its submit action without visible clipping or overlap.
- Footer link readback returned the exact Facebook and Instagram URLs above, with no LinkedIn destination present.
- The final Preview console readback contained no error-level entries. It did contain repeated Wix preview-only rendering and member-login warnings, which require a live post-publication recheck but are not evidence of a broken draft page.

### Launch inputs received from Melissa

A Slack DM was sent to Melissa R requesting:

1. The exact recipient email for quote and project-inquiry form submissions.
2. Verified Facebook, Instagram, and LinkedIn destinations, or approval to remove those icons.
3. The intended launch-domain plan and, if applicable, the exact domain and management location.

Slack delivery receipt: `https://momentum3d.slack.com/archives/D0B6F3J423F/p1787933933406819`

Melissa confirmed:

1. Use `paintingsolutionsinc@outlook.com` as the public and form-notification business inbox.
2. Facebook is `https://facebook.com/PaintingSolutionsAZ`.
3. Instagram is `https://instagram.com/paintingsolutionsinc`.
4. The owner wants to review the site at the Wednesday meeting before it goes live.

GoDaddy verification also confirmed:

- Domain: `paintingsolutionsaz.com`.
- Current root record: GoDaddy `WebsiteBuilder Site`.
- Nameservers: GoDaddy `ns13.domaincontrol.com` and `ns14.domaincontrol.com`.
- Auto-renew: on; renewal date shown as July 1, 2030.
- Existing production routing remains intact.

### Remaining launch gates

- Either complete or explicitly accept the remaining accessibility/navigation debt before launch: footer quick-link labels are plain text, five Home `LEARN MORE` labels remain non-interactive, heading levels are inconsistent, several images have missing or weak alt text, and form fields expose no autocomplete attributes.
- Do not submit a form, publish the Wix automation update, publish the site, connect the domain, or change DNS before the Wednesday owner review.
- At review, confirm the launch-domain cutover plan and whether the existing production WebsiteBuilder site will be replaced.
- After explicit approval, publish the form automation and Wix site, connect `paintingsolutionsaz.com`, confirm canonical and indexing settings, and rerun live desktop/mobile and form-delivery QA.

## Launch decision

Do not connect the production domain yet. The draft's global mobile shell, launch-critical CTAs, persisted business contact details, form-notification recipient selections, and verified social destinations are staged, saved, and regression-checked. Wednesday's owner review, the remaining accessibility/navigation decisions, and explicit approval of the domain cutover, automation publication, site publication, and indexing plan remain open. The existing production site remains live and unchanged.

## Audit health score

| Dimension | Score | Key finding |
| --- | ---: | --- |
| Accessibility | 1/4 | Mobile content is clipped; links and headings are used inconsistently; 15 to 19 interactive targets per route are below 44px. |
| Performance | 2/4 | No broken images were observed, but the Wix homepage carries 28 images and the full transfer profile still needs a post-repair lab run. |
| Responsive design | 0/4 | Every linked route renders a 980px desktop shell inside a 375px content area. |
| Theming | 3/4 | Navy, red, white, typography, and industrial imagery are visually coherent. |
| Implementation integrity | 1/4 | Primary CTAs and most discovery links are not wired; desktop and mobile overflow is systemic. |
| **Total** | **7/20** | **Poor: launch-blocking repair required** |

## Implementation integrity verdict

**Fail for launch.** The content and visual identity are coherent and product-specific, but the published implementation does not support phone use and several visible calls to action are presentation-only elements.

## Blocking findings

### P0: The mobile version is not implemented

All 10 linked Wix routes produced the same global failure at a 390 by 844 viewport:

- Browser content width: 375px
- Site shell width: 980px
- Document scroll width: 1,436px
- Result: more than 1,000px of horizontal overflow, desktop navigation on phones, clipped headings, forms outside the viewport, and unusable side-by-side cards

This must be repaired at the global header, page shell, section, and footer level before page-specific spacing work.

### P0 execution gate: Current Wix access cannot edit the site

The in-app browser currently reaches the Wix sign-in screen. A fresh August 28 recheck opened the existing-account flow and attempted the registered Google login route, but no authenticated Wix session was created. No email address or credential was transmitted. The connected Gmail account is the intended `dillonmohr8777@gmail.com` collaborator identity, and a 90-day inbox search found no Wix or PSI collaborator invitation. The registered Wix Studio route is tied to that Google account but is recorded as **Billing Manager only, website editing not authorized**. The generic connected-app route allows authentication and account metadata checks, not website editing. The exact PSI site must be shared with the current Wix **Website Designer** role, or the broader **Website Manager** role, before repair can be applied.

## Major findings

### P1: Primary calls to action do nothing

The following visible buttons were clicked and read back without a URL change, destination, or target-section movement:

- Header: `GET A QUOTE`
- Hero: `REQUEST A QUOTE`
- Fence section: `REQUEST FENCE RENTAL`
- Fence section: `LEARN MORE`

Wire quote actions to the project inquiry section or Contact page, and wire fence actions to the fence rental page or the appropriate form.

### P1: Service discovery and footer navigation are not interactive

- The six homepage service-card `LEARN MORE` labels are plain headings, not links or buttons.
- The homepage footer `QUICK LINKS` list is plain heading text.
- Facebook, Instagram, and LinkedIn icons are not links.
- Only the footer phone number is interactive.

### P1: No mobile navigation pattern exists

The phone viewport retains the full desktop menu and pushes most of it off-screen. Replace it with an accessible menu button and a vertical navigation panel with keyboard focus management.

### P1: Desktop horizontal overflow is also present

At the 1,440px desktop viewport, every route returned a 1,659px document width against a 1,425px content width. Several full-width Wix elements extend beyond both sides of the viewport. Remove fixed-width and off-canvas elements that increase the document scroll width.

### P1 launch condition: Search visibility is disabled on the Wix build

- Robots directive: `noindex`
- Canonical URL: the Wix staging URL
- Structured data blocks found on the homepage: none

`noindex` is appropriate while the build is staging. It becomes a launch blocker if this build is meant to replace the production site. Domain connection, canonical URLs, indexing, sitemap, and organization or local-business schema should be handled only after responsive and functional QA passes.

## Minor and cleanup findings

### P2: Heading structure is overused and inconsistent

The homepage has three H1 elements: the `PSI` wordmark, the primary service headline, and `TEMPORARY CONSTRUCTION FENCING`. Industrial and commercial pages also use H1 elements for process numbers such as `01` through `05`. Use one descriptive page H1 and demote decorative labels and process numbers.

### P2: Image and form accessibility needs a final pass

- Each route has between one and four images with missing or empty alt text.
- The homepage form fields have accessible labels, but no autocomplete attributes.
- The phone input country-code control is 40 by 24px.
- Many visible controls are shorter than the 44px touch-target floor.

### P2: Phone routing must be reconciled before migration

The Wix build consistently presents `602-694-4523`. The existing production homepage also presents that number in the top bar, but its `Get a Quote` action points to `602-571-6071`. Confirm the correct lead phone route before changing or connecting the domain.

### P2: One staging link exits to the production domain

The homepage `water clarifier tanks` link points to `https://paintingsolutionsaz.com/power-plants` while the rest of the new content uses Wix staging routes. Decide the final domain map, then normalize every internal link before launch.

## Positive findings

- All 10 linked Wix routes loaded.
- No broken rendered images were found in the route sweep.
- Page titles and service-specific copy are present on all routes.
- The navy, red, and white identity is coherent across the build.
- The homepage inspected without browser console warnings or errors.
- The existing production homepage is mobile-width safe and remains available during the repair.

## Route inventory

| Route | Mobile result | Missing alt text |
| --- | --- | ---: |
| `/` | 1,436px scroll width; fail | 3 |
| `/water-treatment` | 1,436px scroll width; fail | 2 |
| `/power-plants` | 1,436px scroll width; fail | 2 |
| `/industrial` | 1,436px scroll width; fail | 4 |
| `/facility-maintenance` | 1,436px scroll width; fail | 1 |
| `/commercial` | 1,436px scroll width; fail | 1 |
| `/fence-rentals` | 1,436px scroll width; fail | 2 |
| `/psi-home` | 1,436px scroll width; fail | 2 |
| `/contact` | 1,436px scroll width; fail | 2 |
| `/about` | 1,436px scroll width; fail | 2 |

## Repair order

1. Grant website editing access to the exact PSI Wix site.
2. Repair the global mobile shell: page width, header, menu, footer, and full-width sections.
3. Stack and resize every page section for 320px, 390px, and 430px phone widths.
4. Wire every CTA, service card, footer quick link, social icon, phone link, and form destination.
5. Normalize heading levels, alt text, autocomplete, focus treatment, and 44px touch targets.
6. Resolve the production phone number and final internal-domain mapping.
7. Configure launch SEO only after the functional pass: domain, canonical URLs, indexing, sitemap, and schema.
8. Run one full desktop and mobile QA pass across all 10 routes, fix the batch, then run one confirmation pass.

## Definition of done

- Zero horizontal overflow at 320px, 390px, 430px, and 1,440px.
- Mobile menu opens, traps or manages focus correctly, closes by keyboard, and exposes every route.
- Every CTA and `Learn More` element reaches the intended destination.
- Project inquiry forms remain fully visible and keyboard usable.
- One H1 per page; headings follow a logical hierarchy.
- Required images have useful alt text; decorative images have empty alt text intentionally.
- No broken links, images, console errors, or blocked resources.
- Existing production domain remains unchanged until the Wix build passes and a migration decision is explicit.
