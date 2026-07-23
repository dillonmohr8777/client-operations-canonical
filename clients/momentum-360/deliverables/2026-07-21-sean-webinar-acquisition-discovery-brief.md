# Sean organic webinar acquisition system

Date: 2026-07-21
Status: pilot system and prototype complete; no external activation

## Decision

Build a permission-based webinar funnel around owned audiences and the Skool community. Do not silently add events to third-party calendars. Calendar placement happens only after explicit registration through a Google Calendar link or downloaded ICS file.

Sean's July 21 Slack audio confirms the original growth concept: place the webinar
on a target audience's Google Calendars automatically, then use the session to
pitch the growth offer. That message is the source of truth for the intended
mechanic. The production interpretation is an explicit registration and calendar
consent flow because unsolicited calendar insertion is not an acceptable launch
path. A registrant can receive an automatic invite from the approved host event
after the event date, meeting URL, sender account, and permissioned audience are
confirmed.

The declined July 21 `Sean x Dillon` calendar event means no completed discovery call can be claimed. The pilot below uses reversible assumptions so progress does not depend on another meeting.

## Pilot assumptions

- Working webinar: `Build a Business That Grows Without You`.
- Audience: existing Skool members, opted-in subscribers, referrals, and individually approved prospects.
- Promise: a practical local-growth operating system that turns attention into qualified conversations without buying the referenced high-cost program.
- Conversion: one strategy-call application after the live session or replay.
- Delivery: one live 45-minute webinar plus 15 minutes of Q&A.
- Test cap: 100 permissioned invitations.
- Cost ceiling: $500 excluding labor, using existing tools first.

## System map

1. Approved audience segment receives one invitation with unsubscribe support.
2. Registration page captures name, email, business stage, primary constraint, reminder consent, and explicit calendar consent.
3. Confirmation page offers Google Calendar and ICS actions only after registration.
4. Reminder sequence runs at registration, 24 hours, 1 hour, and 10 minutes before the event.
5. Webinar delivers the framework, proof, and one clear strategy-call CTA.
6. Attendees and no-shows receive separate replay follow-ups.
7. Applications route to qualification and booking; each funnel event is measured separately.

## Pilot targets and stop rules

- 100 maximum permissioned invitations.
- 20 registrations.
- At least 40% live attendance.
- At least 3 qualified strategy-call bookings.
- Stop immediately on any evidence of non-consensual calendar placement.
- Pause the sequence if spam complaints appear or unsubscribes exceed 3%.
- Do not increase volume or add spend until attribution and lead quality are reviewed.

## Ownership

- Sean: offer proof, presentation, community announcement, and lead follow-up.
- Mac: offer approval, positioning, and sales criteria.
- Dillon: funnel copy, prototype, event instrumentation, QA, and reporting design.
- Joint approval: exact audience, send dates, webinar date, and any platform activation.

## Completed local artifact

The working registration prototype, funnel event schema, implementation checklist, calendar consent flow, and KPI definitions are in `2026-07-21-sean-webinar-pilot/`.

No audience was uploaded, no event was inserted into another person's calendar, no message was sent, no account was changed, and no paid spend occurred.
