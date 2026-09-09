# GT Clinic access, booking, and launch handoff

Status: pre-onboarding; no signed contract or accepted quote verified; no migration, publication, or spend change performed.

## Commercial document to reconcile first

- Monthly Momentum service fee: current issued quote `7776543` says `$900`.
- Starting paid-media budget: meeting instruction says `$1,000`.
- Commission basis currently recorded for Dillon: `75%` of the issued `$900` service fee, or `$675`; ad spend is excluded.
- Required written correction: one scope must state included channels, landing-page count, six-month term, cancellation terms, and whether the clinic or Momentum pays Google and Meta directly.

## Access request matrix

| System | Exact purpose | Minimum access | Current state |
|---|---|---|---|
| Domain registrar and DNS | Preserve domain, mail, SSL, and rollback | DNS administrator | Not registered |
| SiteGround | Backup and hosting baseline | Site collaborator/admin | Not registered |
| WordPress and Elementor | Landing page, forms, redirects | Administrator | Not registered |
| Microsoft 365 | Validate mail routing only if DNS changes | Global/DNS admin or supervised verification | Not registered |
| Google Tag Manager and GA4 | Privacy-safe conversion tracking | Publish access | Not registered |
| Google Ads | Build and launch after measurement approval | Standard/admin as required | Not registered |
| Meta Business Manager | Pixel and campaign access | Partner access | Not registered |
| Search Console and GBP | SEO and local visibility | Full/manager | Not registered |
| Boulevard | Booking route and privacy-safe milestone testing | Account owner-approved implementation access | Not registered |

Store only non-secret account identifiers and approved login routes in Access Broker. Do not store credentials in this folder.

## Booking implementation decision

The public site currently sends all booking and consultation calls to the Contact Form 7 page at `/contact-us/`. No public Boulevard link, widget, or script was found.

After access is granted:

1. Confirm the clinic-approved Boulevard scheduling URL, service selection flow, cancellation policy, and owner.
2. Replace each public booking CTA with the approved Boulevard route or approved embedded workflow.
3. Preserve a fallback contact route and verify desktop, mobile, keyboard, and error behavior.
4. Track privacy-safe milestones such as booking-flow opened and appointment confirmed. Never send treatments, symptoms, patient records, or other protected health information to GTM, GA4, Google Ads, Meta, or AI tools.
5. Validate one non-patient test appointment with the clinic before public launch.

## Launch order

1. Written commercial reconciliation and accepted onboarding.
2. Access grants and reversible website/DNS/email baseline.
3. Boulevard booking implementation and clinic acceptance.
4. First service-specific paid landing page with approved claims.
5. GTM, GA4, Google Ads, and Meta measurement validation.
6. Budget split and geography approval.
7. Campaign activation only after the preceding evidence is complete.

## Communication state

- The verified follow-up was sent to Ghazala in Gmail thread `1a026842dcaf10fb` at 2026-08-26 15:03 EDT, message `1a03f751271dfca1`, with Jesse, Mac, and Melissa copied. It answers hosting, SSL, email continuity, Boulevard, landing pages, and states the current `$900` service plus `$1,000` media interpretation as pending written confirmation.
- Jesse's verified meeting notes are in Slack `#ai-tech-news`, channel `C04HXSVN2CS`, messages `1787758807.991229` and `1787764079.681739`.
- No newer GT Clinic Gmail or Slack source was found in the 2026-08-26 refresh.
