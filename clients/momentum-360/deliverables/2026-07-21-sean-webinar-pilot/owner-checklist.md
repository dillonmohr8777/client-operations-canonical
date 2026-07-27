# Pilot activation checklist

## Sean

- Promise, hosts, audience, and workshop direction approved through Dillon on
  July 27, 2026.
- Final live date and existing Google Meet approved through Dillon on July 27,
  2026.

## Mac

- Offer positioning, Philadelphia local-service-owner audience, and
  consent-based stop rules approved through Dillon on July 27, 2026.

## Dillon

- Calendar delivery is configured through the approved Composio Google
  Calendar connection. Netlify has the private Composio key and exact
  connection, calendar, event, organizer, and webhook-signature values.
- The configured event was re-read and verified against the approved
  organizer, title, August 6 schedule, and existing Google Meet.
- A controlled, consented production registration added the submitted test
  address to that exact event and sent one RSVP invitation. A replay left one
  attendee, proving idempotency.
- The controlled attendee and all four QA submissions were removed after
  verification. The event and Netlify intake returned to zero attendees and
  zero submissions.
- The production page, schema, Google/Outlook links, and ICS file all use the
  approved August 6 schedule and existing meeting details.
- Netlify's signed `submission_created` webhook is scoped to the exact
  `workshop-registration` form and invokes the deployed calendar function.
- Confirm each production submission includes attendee identity, company, growth constraint, email-reminder choice, calendar choice, event details, registration ID, page/referrer, and available UTM attribution.
- Configure confirmation, reminder, replay, unsubscribe, and suppression handling.
- Map the event schema into the approved analytics destination.
- Test desktop, mobile, form validation, Google Calendar, Outlook Calendar,
  Apple/ICS download, Eastern Time conversion, reminders, and booking
  attribution.

## Required joint approvals

- Philadelphia local-service-owner audience approved for tracked registration
  outreach; organizer invitations remain limited to explicitly consenting
  registrants.
- Dillon's connected Google Calendar approved as the organizer.
- Thursday, August 6, 2026 from 12:00 PM to 1:00 PM Eastern and the existing
  event's Google Meet approved.
- Retention period and unsubscribe route. The page already links Momentum Digital's published privacy policy.
- Production deployment completed and verified July 27, 2026. Any paid budget
  remains a separate approval.

## QA acceptance

- Calendar delivery runs only after a verified registration with the required
  one-workshop invitation consent.
- A guest invitation is sent with `sendUpdates=all`; the recipient's calendar
  settings control whether it appears immediately or after acceptance.
- No reminder or replay email is sent unless the registrant selects workshop updates.
- Suppressed and unsubscribed contacts cannot be invited.
- Test registrations appear once in the approved system and carry source attribution.
- Every KPI can be calculated from separate funnel events.

Calendar activation acceptance passed July 27, 2026. Email-reminder, replay,
and outbound campaign operations remain separate workflows and do not affect
the live one-workshop calendar invitation path.
