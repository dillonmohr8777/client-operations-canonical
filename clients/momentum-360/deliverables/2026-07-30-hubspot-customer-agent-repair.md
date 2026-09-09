# Momentum 360 HubSpot Customer Agent Repair

Date: 2026-07-30  
Portal: `50612503`  
Account verified: Jason Fallon / Momentum 360

## Completed

- Resumed `Momentum 360 Assistant`; HubSpot confirmed the agent is active.
- Confirmed the website channel is live for all hours at 100% Customer Agent coverage.
- Renamed the chatflow to `Momentum 360 Website Assistant`.
- Replaced the Jason-personalized chat header with `Momentum 360 Assistant` custom branding.
- Applied the existing HubSpot-hosted Momentum 360 chatbot avatar.
- Kept the approved website welcome message.
- Set email capture to occur after the first answer.
- Configured asynchronous human handoff to Help Desk.
- Configured handoff tickets to assign to Sean Boyle and keep the live chat open.
- Updated the handoff rules and visitor message so pricing inquiries receive safe dependency language without invented prices.
- Added least-privilege `tickets` and `automation` scopes to the existing Momentum 360 service key.

## Verification

- Ticket endpoint: HTTP `200`.
- Workflow endpoint: HTTP `200`.
- Reporting-agent automated tests: 6 passed, 0 failed.
- Live HubSpot report: 24 CallRail calls, 100% call-to-contact association, and explicit CallRail-only SMS/routing telemetry status.
- Customer Agent live-mode QA:
  - General Momentum 360 question answered from the public website knowledge source.
  - Pricing question returned the approved variable-pricing answer with no numeric price or dollar amount, requested project details and contact information, and did not trigger an unnecessary handoff.
- Public homepage loaded successfully with the branded Momentum 360 widget, avatar, and approved welcome copy visible.

## Remaining controlled verification

- Place the two scheduled controlled calls after 10:00 PM Eastern: one Momentum 360 tracking number and one GMB Suspension number.
- Confirm the calls reach the equal Sean/Jason CallRail round robin without terminating at voicemail.
- Confirm the approved Mia missed-call SMS arrives.
- Confirm each test call appears once in HubSpot with its CallRail call-to-contact association.

## Known CRM data-quality gap

The live July 29–30 report still shows 0% HubSpot call-owner coverage. CallRail associates the calls to contacts but does not assign a HubSpot owner. No contact/call owner workflow was created because the approved owner rule for HubSpot records has not been defined; the separate CallRail after-hours routing remains equal Sean/Jason round robin.
