# Workshop calendar workflow status

Verified July 27, 2026.

## Current event

- Title: `Build a Business That Grows Without You`
- Schedule: Thursday, August 6, 2026, 12:00 PM to 1:00 PM Eastern
- Connected calendar: Dillon Mohr, `dillonmohr8777@gmail.com`
- Google Calendar event ID: `2k0h8gn9r7i7oi59u7e9ibmdob`
- Google Meet: provisioned on the event
- Current attendees: 0

The connected profile and event were re-read from Google Calendar on July 27.
This confirms that the organizer event exists on Dillon's connected primary
calendar. Dillon approved that account as the organizer on July 27 while
taking launch authority for Sean and Mac.

## Live registration intake

- Netlify site: `momentum-workshop-pilot`
- Production URL: `https://momentum-workshop-pilot.netlify.app`
- Verified production deploy: `6a6778675c36a8301dbcad05`
- Form: `workshop-registration`
- Form ID: `6a6238908c25fe0008ba4577`
- Current submissions: 0
- Calendar-intake ledger: empty `processed` list
- Live form fields now include `utm_content`, `source_prospect_id`, and
  `source_list`, so every `PHL-WORKSHOP-###` registration link can be matched
  back to the corresponding research row.

The form provides explicit, separate consent for one workshop invitation.
Registrants also receive manual Google, Outlook, and ICS calendar options.
The live production response and Netlify form schema were rechecked after the
July 27 deployment.

## Production automation state

- `calendar-invites-api` is deployed as the Netlify form-event processor.
- `calendar-invites-webhook` is deployed as the signed HTTP fallback.
- Netlify webhook `6a6777c58af3e6356e4e96e3` is enabled for
  `submission_created` on the exact workshop form.
- Private production configuration binds the approved Composio Google Calendar
  connection, Dillon's calendar, the existing event ID, the organizer email,
  and a shared webhook-signature secret.
- The implementation has no fallback calendar or event. It verifies the event
  organizer, title, date, start, and end before changing attendees; suppresses
  duplicates; keeps guest privacy restrictions in place; and uses
  `sendUpdates=all`.
- Ten isolated tests pass. A live, consented production registration added the
  controlled test attendee once with RSVP status `needsAction`; a replay left
  exactly one attendee.
- Cleanup removed the test attendee and four QA submissions. Final live state
  is zero event attendees and zero Netlify submissions.

The automatic organizer-attendee path is production-active. Manual Google,
Outlook, and ICS options remain available after registration.

## Safe launch path for the 250 prospects

1. Use the tracked `registration_url` in `prospects.csv` only through an
   approved outreach channel and exact sender.
2. A prospect registers and explicitly selects calendar consent.
3. The prospect can immediately use the Google, Outlook, or ICS option.
4. Only consenting registrants may be added as attendees to the organizer
   event.
5. Mark a registration processed only after Google Calendar confirms the save
   and attendee notification.

## Production decisions

- Final date and existing Google Meet: approved July 27.
- Philadelphia local-service-owner audience: approved July 27.
- Dillon's connected Google Calendar as organizer: approved July 27.
- Technical activation and controlled production verification: completed July
  27.

No prospect was cold-added to the calendar. One controlled test invitation was
sent to Dillon's alias and removed after verification.
