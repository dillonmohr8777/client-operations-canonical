---
version: 1
slug: "notary-documents-html"
primary_target: "notary-documents.html"
related_targets: []
---

# Notary and Document Services Surface Brief

- **Scope:** A public Google Search destination under `tags2go.pro` for nonrestricted local services.
- **Visitor mode:** Persuade.
- **Audience:** Philadelphia residents and local businesses looking for in-person notary, document preparation, business formation, fax, scan, or copy help.
- **Job:** Confirm that Tags 2 Go handles the requested service, understand how to prepare for a visit, and call or email the office.
- **Primary action:** Call `215-494-0300`.
- **Secondary action:** Email `info@tags2go.pro` with a service question.
- **Proof:** Verified business name, logo, address, phone number, email address, and services already published on the live site.
- **Constraints:** No vehicle or public-service offer, no external site navigation, no invented prices, processing times, availability, guarantees, testimonials, or outcomes.
- **Chosen direction:** Service Counter Split, translated through the existing Tags 2 Go design system.
- **Memorable moment:** A large local-service promise is paired with a four-lane service router and an immediate call path.
- **Measurement:** Phone and email clicks emit intent events. No click is reported as a lead conversion until the exact conversion action is validated.

## Detector Exception

The static detector reports the light text used in the blue hero, service, visit, and charcoal footer sections as though it were rendered on the page's white default background. These are context false positives: the rendered pairs are `#e8efff` on `#174ecd`, `#dce7ff` and `#edf3ff` on `#0d348f`, `#fefe00` on `#0d348f` or `#33373d`, and `#e8efff` on `#174ecd`. Browser inspection remains required to confirm the actual sectional backgrounds and contrast.
