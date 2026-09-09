# PSI Wix editor repair checklist

Use this checklist after the exact `psiaz` site is shared with website editing rights. It is ordered to prevent repeated per-page work.

## Executed draft state: August 28, 2026

- [x] Exact PSI site access verified and draft saved.
- [x] Global quote button linked to Contact.
- [x] Home hero quote button linked to Contact.
- [x] Global phone button linked to `tel:+1 602-694-4523`.
- [x] Home fence request and Learn More actions linked to Fence Rentals.
- [x] Industrial and Facility Maintenance quote buttons linked to Contact.
- [x] Home Industrial Painting and Technical Coatings cards linked to Industrial; Power Plants feature linked to Power Plants.
- [x] Mobile menu widened and centered; clipped Industries label resolved.
- [x] Desktop header action group moved fully inside the 1,280px QA viewport.
- [x] Global footer divider changed to responsive full-width stretch; desktop overflow eliminated in Preview.
- [x] Full 12-page editor sweep returned 320px mobile width and 320px mobile scroll width before the final conversion-link edits.
- [x] Targeted post-edit Preview confirmation completed on Home, Industrial, Facility Maintenance, and Contact, including visual Home and Contact mobile checks.
- [x] Confirmed `paintingsolutionsinc@outlook.com` with Melissa as the intended business inbox.
- [x] Entered the address in Wix Business Info and visually read back the exact address after a full page reload; the same reloaded panel retained `+16026944523` as the business phone.
- [x] Verified `Business Email` and `Collaborator Roles (1)` on all three in-use form automation drafts without publishing them.
- [x] Linked Facebook and Instagram to Melissa's verified destinations and removed the unverified LinkedIn icon.
- [x] Accepted and verified Cecilia Guerrero's GoDaddy `Products & Domains` delegate access read-only.
- [x] Verified `paintingsolutionsaz.com`, current GoDaddy WebsiteBuilder routing, nameservers, and auto-renew without changing anything.
- [ ] Convert the global footer quick-link labels and the five remaining Home `LEARN MORE` labels into real links, or record the owner's explicit acceptance of that launch debt.
- [ ] Normalize heading levels, missing/weak image alt text, and supported form autocomplete attributes.
- [x] Reran the complete 12-page editor regression after the final accepted edit and repeated visual mobile checks on Home and Contact through the Contact form submit action.
- [ ] Hold the Wednesday owner review and confirm the final launch-domain, canonical, indexing, sitemap, and schema plan.
- [ ] After explicit approval, publish the automation and site, connect the domain, and rerun live form, desktop, and mobile QA.

## 1. Global master-page repair

### Site shell

- Remove the fixed 980px mobile canvas behavior from the page background, site root, master page, pages container, and footer.
- At phone breakpoints, every full-width section must resolve to the viewport width with no negative left or right offsets.
- At desktop, center the site and prevent decorative or animated elements from increasing the document width beyond the viewport.
- Keep content in a consistent desktop max-width container while section backgrounds remain full bleed.

### Header and navigation

- Preserve the current PSI wordmark and navy, red, and white identity.
- Create a phone header with the PSI wordmark, one menu button, and one optional call action.
- Hide the full desktop navigation and side-by-side quote and phone buttons on mobile.
- Make the menu button at least 44 by 44px, label it for screen readers, expose expanded state, and return focus when the menu closes.
- The opened phone menu must include Home, Water Treatment, Power Plants, Industrial, Facility Maintenance, Commercial, Fence Rentals, PSI Home, Contact, and About.
- Verify keyboard access and visible focus on every menu item.

### Global CTA wiring

- `GET A QUOTE` -> `/contact` or the homepage project-inquiry anchor.
- `REQUEST A QUOTE` -> the same verified quote destination.
- Phone actions -> `tel:6026944523` after the correct lead number is confirmed.
- `REQUEST FENCE RENTAL` -> `/fence-rentals` or a fence-specific form section.
- Fence `LEARN MORE` -> `/fence-rentals`.
- Make the full service card or its `LEARN MORE` control a real link, not heading text.

### Footer

- Convert Services, Industries, Projects, About PSI, and Contact into real links.
- Link Facebook and Instagram to the verified PSI profiles and omit LinkedIn until a verified company profile exists.
- Stack footer groups vertically on phones and keep all text and actions inside the viewport.
- Keep the phone number as a real `tel:` link.

## 2. Page-specific repairs

### Home `/`

- Hero: keep the worker and structural beam visible at 320px to 430px; stack copy and CTA without cropping the headline.
- Proof strip: change the four proof points to a two-by-two or single-column phone layout.
- Services: change the six-card desktop grid to one card per row on phones; link each card to its matching route.
- Power and water: stack Water Treatment and Power Plants vertically.
- Fence banner: stack copy, actions, and image; keep both actions visible without overlap.
- Featured projects: stack the two project stories and keep before and after labels legible.
- Project inquiry: use one column on phones; all fields and the submit action must fill the available width.
- Brand logos: allow wrapping and preserve readable logo proportions.

Service-card destination map:

| Card | Destination |
| --- | --- |
| Industrial Painting | `/industrial` |
| Technical Coatings | `/industrial` unless a distinct verified route is added |
| Facilities Maintenance | `/facility-maintenance` |
| Commercial Painting | `/commercial` |
| Temporary Fencing | `/fence-rentals` |
| Residential Painting | `/psi-home` |

### Water Treatment `/water-treatment`

- Stack the hero image and copy for phones.
- Stack every image and text pair in reading order.
- Keep coating-selection and substrate-system content inside one phone column.
- Keep the project inquiry form fully visible and keyboard usable.
- Collapse or stack FAQ items without clipped answers.

### Power Plants `/power-plants`

- Stack the hero and generating-station content.
- Keep intumescent and live-equipment sections in a single phone column.
- Preserve technical language and do not reduce it to decorative image text.
- Keep the power-facility inquiry form and FAQ inside the viewport.

### Industrial `/industrial`

- Keep one descriptive H1 for the page.
- Change process numbers `01` through `05` from H1 elements to decorative text or list markers.
- Stack coating-system, intumescent, industry, and job-process sections.
- Keep the chemical-engineers proof section inside the centered content container.

### Facility Maintenance `/facility-maintenance`

- Stack service and maintenance-program sections.
- Rework the `DEPENDABLE MAINTENANCE vs. REACTIVE REPAINTING` comparison into two phone-safe blocks.
- Stack Properties We Maintain, Walk-Through, and FAQ content in reading order.

### Commercial `/commercial`

- Keep one descriptive H1.
- Change process numbers `01` through `05` from H1 elements to list markers.
- Stack property types, services, process, timeline, proof, and FAQ sections.
- Keep the phone action visible after the timeline copy.

### Fence Rentals `/fence-rentals`

- Keep one descriptive H1.
- Convert the six `WHAT'S INCLUDED` items from H2 headings into an actual list.
- Stack the service image, included-items list, How It Works, inquiry, audience, service-area, and FAQ sections.
- Correct `WHATS INCLUDED` to `WHAT'S INCLUDED`.
- Wire every fence CTA to the verified fence destination.

### PSI Home `/psi-home`

- Keep `RESIDENTIAL PAINTING IN PHOENIX, AZ` as the single page H1; treat `PSI HOME` as brand text.
- Stack residential service cards, quote section, brand logos, service area, and FAQ.
- Keep residential imagery cropped around the property rather than trimming the primary subject.

### Contact `/contact`

- Stack the hero, project inquiry, and How We Can Help sections.
- Use a single-column form at phone widths.
- Set name, phone, email, and project-description autocomplete values where supported.
- Keep the phone country-code control and submit action at least 44px high.
- Confirm the form recipient and test submission only after explicit authorization.

### About `/about`

- Stack the hero, Why Choose PSI, About PSI, services, quote, brand, and organization sections.
- Wrap organization and brand logos without reducing them below readable size.
- Keep one descriptive H1 and demote the PSI wordmark from page-heading semantics.

## 3. Accessibility and content cleanup

- Use one H1 per page and follow it with logical H2 and H3 levels.
- Give meaningful images concise alt text; use intentionally empty alt text for decorative images.
- Make every control at least 44 by 44px where feasible.
- Verify text contrast over every hero and image background.
- Add visible keyboard focus to links, buttons, menu items, and form fields.
- Add autocomplete values to name, phone, email, organization, and message fields where Wix supports them.
- Keep focus order aligned with visual reading order after sections are stacked.

## 4. Search and migration gate

- Keep `noindex` while this remains a staging build.
- Resolve the correct lead phone number before migration: `602-694-4523` versus the existing production quote action at `602-571-6071`.
- Normalize internal links to the final domain; remove the mixed staging-to-production link behavior.
- After the responsive and functional pass, connect the intended domain, set self-referencing canonical URLs, remove `noindex`, verify the sitemap, and add verified organization or local-business schema.
- Do not replace the current production site until the full QA matrix passes.

## 5. Final QA matrix

Run every route at these viewports:

- 320 by 720
- 390 by 844
- 430 by 932
- 1,440 by 900

For each route verify:

- Document scroll width equals the viewport client width.
- Header and menu are usable by touch and keyboard.
- Every CTA and service card reaches the intended destination.
- Forms remain inside the viewport and labels remain associated with fields.
- Images load, crop intentionally, and have correct alt behavior.
- No clipped text, overlapping sections, blank columns, or desktop-only spacing remains.
- No browser console error or failed required resource appears.

After the last edit, rerun the entire 12-route matrix. Earlier evidence is not final evidence after a change.
