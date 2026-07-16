# Fagan Painting operating context

Last updated: 2026-07-16
Canonical client ID: `fagan-painting`
Evidence cutoff: 2026-07-16
Privacy: redacted; no prospect, contact, credential, token, account-ID, or raw-message data
Context status: V1; operational follow-up facts remain incomplete

## Bottom line

Fagan is a Pittsburgh-area painting business with a website-led estimate funnel and Meta-supported demand generation. The highest-value operating priority is closed-loop lead handling: prove that each legitimate inquiry reached the approved destination, has a human owner and disposition, and retains trustworthy campaign attribution before scaling spend or claiming results.

The production attribution path was reported repaired on 2026-07-13. That does not prove the ad account, campaign delivery, mailbox processing, CRM path, or follow-up status is healthy today. The canonical 2026-07-16 work item remains blocked on operational access and ownership evidence.

Confidence: high for the historical repair and current reconciliation gap; current live campaign and lead-handling status unverified.

## Current outcome and action

- Current work item: `wi-20260715-0002`.
- Status: blocked.
- Current task: reconcile two unique July 15 website leads and one high-confidence duplicate notification.
- Verified so far: both direct notifications addressed the approved destination; the source mailbox shows both direct notifications.
- Not verified: operational receipt or processing, response owner, response-time expectation, disposition, CRM or Zapier destination records, and deduplicated conversion evidence.
- Next safe action: read-only verification in the approved Fagan mailbox, CRM, or Zapier context before any prospect contact.
- External boundary: no calls, emails, spend changes, or other prospect-facing action without separately verified ownership and authorization.

Confidence: high; canonical queue and redacted reconciliation evidence recorded 2026-07-16.

## Offer, market, and audience

Verified offer signals:

- Local painting services with visible estimate and phone calls to action.
- Website and advertising history include interior, exterior, cabinet, commercial, and HOA-oriented painting angles.
- The public site was observed with broad service coverage and Pittsburgh-area service-location pages.

Likely audience, pending customer-language validation:

- Homeowners planning interior, exterior, cabinet, or curb-appeal work.
- Property, commercial, or HOA decision-makers evaluating a painting project.
- Local prospects who want a clear estimate path and trustworthy proof that the company serves their location and project type.

These audience segments are evidence-supported marketing inferences from existing pages and ad labels. Do not invent service guarantees, project minimums, service radius, pricing, turnaround, licensing, warranty, or availability.

## Primary jobs to be done

- Help an appropriate local prospect quickly confirm service and location fit.
- Convert project intent into a complete estimate request or a trackable phone-intent action.
- Route a legitimate inquiry to a named human owner without duplicates, parser noise, or lost source data.
- Distinguish real leads from tests, solicitations, reactions, and forwarded duplicates.
- Attribute future website leads to the correct source only when identifiers and deduplication evidence support the claim.

## Message and voice standard

Voice: local, capable, direct, practical, reassuring, and specific.

Do:

- Lead with the project type, service area, estimate path, and real project proof.
- Use clear homeowner or property-manager language rather than advertising jargon.
- Match each service page or ad to the corresponding estimate path.
- Show unique local project evidence on priority service-area pages when approved assets exist.
- State what is verified and label unknown timing, pricing, or availability.

Do not:

- Claim a lead came from Meta when campaign, click, or event evidence is absent.
- Count tests, solicitations, replies, reactions, or duplicate notifications as qualified leads.
- Promise price, timing, warranty, project acceptance, or outcome without approved business facts.
- Publish generic city pages without unique local proof.
- Treat a phone-intent click as a connected or qualified call.

No approved verbatim customer-language or testimonial corpus was found. Build copy from verified service and project facts until that evidence exists.

## Funnel and attribution contract

Operating path:

`ad or organic visit -> service or location page -> estimate form or phone intent -> canonical lead record -> human owner -> disposition -> qualified outcome`

Current source-of-truth rules:

- The direct Attribution Ledger is the preferred source for future website-lead attribution.
- The legacy notification parser may remain as a notification layer, but it is not authoritative because historical records included field misreads and duplicate reply noise.
- Use submission or platform lead IDs first, then shared event ID, then normalized contact fields only as controlled fallback deduplication keys.
- Browser and server Lead events must share one event ID and resolve to one event.
- A website lead is Meta-attributed only when the preserved campaign and click identifiers support that conclusion.
- Native platform lead forms and website Lead events are distinct paths and must not be double counted.
- Phone-intent tracking proves a click, not a connected call; connected-call proof requires a forwarding number or call-tracking provider.

The exact identifiers, tokens, account IDs, and prospect data belong in authorized systems, not this context file.

## Evidence windows and proof boundaries

### Historical audit window: 2026-06-22 through 2026-07-12

- Paid media delivery was verified, but platform results were unavailable.
- A full Zapier review found four qualified website inquiries and eighteen tests, solicitations, or duplicate-reply records in the wider June 15 through July 12 run set.
- None of the four historical qualified website inquiries could be conclusively attributed to Meta because the old notification path did not preserve the required identifiers.
- The production attribution repair was recorded complete on 2026-07-13 for the website form, URL parameters, browser and server event deduplication, and direct ledger path.

### Current reconciliation window: 2026-07-15 through 2026-07-16

- Two unique website leads were detected.
- One additional notification is a high-confidence duplicate, with residual uncertainty caused by preview truncation.
- Receipt, ownership, response, disposition, CRM delivery, and conversion tracking remain unknown.

Never blend these windows or retroactively assign the historical leads to Meta.

## Growth priorities after the operational gate

1. Verify the next real form submission end to end in the direct ledger and deduplicated browser/server event path.
2. Assign and document a human response owner and response-time expectation.
3. Record lead disposition with minimal necessary personal data in the authorized system.
4. Add forwarding-number or call-tracking proof if completed-call attribution is required.
5. Add unique local project proof to priority service and location pages.
6. Strengthen service-to-location internal linking and test the estimate and phone journey.
7. Run a technical crawl for indexability, canonicals, sitemaps, redirects, performance, and schema when access and scope are approved.

Scaling spend is not the next step until current delivery and the closed-loop lead path are verified.

## Known unknowns

- Current Meta account, billing, campaign, ad-set, and ad-delivery state.
- Whether the two July 15 notifications were accepted and processed by the approved destination.
- Named human response owner and response-time expectation.
- Each lead's disposition and downstream outcome.
- Matching CRM or Zapier destination records for the current leads.
- Current browser/server event deduplication evidence for a real submission.
- Current estimate-form completion rate, qualified-lead rate, booked-estimate rate, and completed-project rate.
- Approved service radius, pricing, project minimums, warranty, availability, and seasonality.
- Approved customer language, testimonials, and project-photo rights.

Never estimate or silently fill these gaps.

## Source ledger

| Source | Observed or prepared | Claim scope | Confidence |
| --- | --- | --- | --- |
| `queue/work-items.json`, item `wi-20260715-0002` | 2026-07-16 | Current reconciliation status, action, boundaries, and access gate | High |
| `clients/fagan-painting/evidence/2026-07-16-lead-reconciliation.json` | 2026-07-16 | Redacted current-lead findings and remaining unknowns | High |
| `C:\Users\dillo\Documents\Codex\2026-07-12\did-you-get-a-chance-to\outputs\reports\Fagan_Attribution_Audit_2026-06-22_to_2026-07-12.md` | updated 2026-07-13 | Historical delivery, attribution defects, production repair, and proof boundaries | High for recorded audit window; current live status unknown |
| `C:\Users\dillo\Documents\Codex\2026-07-12\my-vault-is-apparently-very-behind\vault-cleanup-staging\01_Clients\Fagan Painting\overview.md` | 2026-07-12 | Operating summary and pre-scale posture | Medium; superseded where newer evidence differs |
| `C:\Users\dillo\Documents\Codex\2026-07-12\check-on-fagan-paining-spending-for\fagan_account_check_2026-07-12.md` | 2026-07-12 | Website scope and then-current billing block | Medium; point-in-time evidence only |
