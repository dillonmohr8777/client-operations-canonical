# Pilot activation checklist

## Sean

- Approve the promise, proof, webinar outline, and strategy-call CTA.
- Confirm the live date, meeting link, and follow-up owner.

## Mac

- Approve offer positioning, qualification criteria, audience, and stop rules.

## Dillon

- Configure `GOOGLE_CALENDAR_CLIENT_ID`,
  `GOOGLE_CALENDAR_CLIENT_SECRET`, and
  `GOOGLE_CALENDAR_REFRESH_TOKEN` as private Netlify environment variables for
  the approved organizer account. Optionally set `GOOGLE_CALENDAR_ID` and
  `GOOGLE_CALENDAR_EVENT_ID`.
- Verify one test registration creates the organizer event, adds the submitted
  address as an attendee, sends exactly one RSVP invitation, and does not log
  the attendee email.
- Replace prototype date and meeting-link placeholders.
- Verify the public calendar hub remains the fallback destination until the
  final meeting URL is approved.
- Verify the Netlify `workshop-registration` submission in the live site dashboard.
- Confirm each production submission includes attendee identity, company, growth constraint, email-reminder choice, calendar choice, event details, registration ID, page/referrer, and available UTM attribution.
- Configure confirmation, reminder, replay, unsubscribe, and suppression handling.
- Map the event schema into the approved analytics destination.
- Test desktop, mobile, form validation, Google Calendar, Outlook Calendar,
  Apple/ICS download, Eastern Time conversion, reminders, and booking
  attribution.

## Required joint approvals

- Exact permissioned audience and invitation count.
- Sender identity and message copy.
- Webinar date and calendar details.
- Retention period and unsubscribe route. The page already links Momentum Digital's published privacy policy.
- Production deployment and any paid budget.

## QA acceptance

- Calendar delivery runs only after a verified registration with the required
  one-workshop invitation consent.
- A guest invitation is sent with `sendUpdates=all`; the recipient's calendar
  settings control whether it appears immediately or after acceptance.
- No reminder or replay email is sent unless the registrant selects workshop updates.
- Suppressed and unsubscribed contacts cannot be invited.
- Test registrations appear once in the approved system and carry source attribution.
- Every KPI can be calculated from separate funnel events.
