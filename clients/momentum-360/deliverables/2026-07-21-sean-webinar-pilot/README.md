# Sean webinar pilot prototype

Open `index.html` locally to review the complete pilot. It has an attendee experience and an operator studio. Test event settings and registrations are stored only in that browser's local storage. Nothing is transmitted.

## Included

- Responsive attendee registration and confirmation views.
- Explicit email reminder and calendar consent controls.
- Google Calendar and ICS actions after registration.
- Operator event configuration with local persistence.
- Funnel scorecard, test-registration table, and safe reminder simulator.
- Original workshop hero artwork under `assets/`.
- Funnel event contract in `event-schema.json`.
- Activation and QA checklist in `owner-checklist.md`.

## Activation boundary

Before production, the owners must approve the audience, webinar date, privacy language, form destination, email sender, meeting link, analytics destination, and strategy-call route. Nothing in this package sends a message, stores contact data outside the reviewer's browser, or changes a live account.

## Verified locally

- HTML parses successfully and `script.js` passes `node --check`.
- Desktop attendee, desktop operator, and responsive mobile captures are included as `qa-desktop.png`, `qa-operator.png`, and `qa-mobile.png`.
- Automated browser checks confirmed operator navigation, reminder previews, registration, confirmation, local persistence, and Google Calendar URL generation.
