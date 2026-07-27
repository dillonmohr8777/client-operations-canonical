# Mac + Sean owner workshop

The production site is a cinematic, consent-first workshop registration
experience with a separate browser-only operator studio. Local previews keep
test settings and registrations in that browser. On Netlify, the public form is
captured as `workshop-registration`; no email reminder is sent unless the
registrant selects the optional updates checkbox.

## Included

- Responsive attendee registration and confirmation views.
- Founder-led story sequence with close-cropped Mac and Sean portraiture.
- Canonical individual, branded founder portraits for Sean and Mac with documented identity and crop rules.
- Concrete workshop outcomes: one priority, one offer statement, one lead path, and one 30-day scorecard.
- Continuous five-logo recognition swipe with a static reduced-motion fallback.
- Scroll-controlled desktop agenda and native swipe agenda on mobile.
- Mobile agenda controls and a shared purpose-based motion theme adapted from Motion UI principles.
- Explicit email reminder and required one-workshop calendar invitation consent.
- A verified-form event function that fails closed unless the exact approved
  organizer and existing event are configured, adds each consenting registrant
  once, and sends Google Calendar RSVP updates.
- Immediate Google, Outlook, or Apple Calendar opening after registration plus
  a subscribable ICS feed for workshop updates.
- Netlify registration capture with duplicate-click protection, clear submit states, a honeypot, event metadata, page/referrer attribution, UTM fields, a validated Philadelphia prospect/source-list identifier, and a linked Momentum Digital privacy policy.
- Operator event configuration with local persistence.
- Funnel scorecard, test-registration table, and safe reminder simulator.
- Original workshop hero artwork under `assets/`.
- Funnel event contract in `event-schema.json`.
- Activation and QA checklist in `owner-checklist.md`.

## Production state and remaining operations

The visual experience, responsive behavior, Netlify form destination, signed
webhook, and consent-gated Calendar delivery are active for the approved
August 6 workshop and existing Google Meet. The exact production configuration
and controlled acceptance evidence are recorded in
`launch-decision-2026-07-27.md`.

Email reminders, replay delivery, analytics mapping, the strategy-call route,
outbound audience delivery, and any paid budget remain separate workflows.
Those operations do not block the live registration and one-workshop Calendar
invitation path.

## Verified locally

- HTML parses successfully and `script.js` passes `node --check`.
- `node --test tools/calendar-invites-api.test.mjs` verifies no-consent no-op,
  missing-configuration failure, organizer matching, duplicate suppression,
  and exact-event RSVP delivery behavior.
- Desktop attendee, desktop operator, and responsive mobile captures are included as `qa-desktop.png`, `qa-operator.png`, and `qa-mobile.png`.
- Automated browser checks confirmed operator navigation, registration,
  confirmation, responsive swipe behavior, local QA persistence, Google and
  Outlook Calendar URL generation, and Eastern Time conversion.
- The July 23 clarity pass confirmed gold-on-navy display hierarchy, intact
  descenders at desktop and mobile widths, no decorative process line or
  calendar orbit, and a successful five-field local registration.
