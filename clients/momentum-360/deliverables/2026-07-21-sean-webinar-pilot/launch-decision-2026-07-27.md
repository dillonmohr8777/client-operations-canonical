# Workshop launch decision

Finalized July 27, 2026 by Dillon Mohr, acting with full approval for Sean
Boyle and Mac Frederick.

## Approved production configuration

- Workshop: `Build a Business That Grows Without You`
- Date: Thursday, August 6, 2026
- Time: 12:00 PM to 1:00 PM Eastern
- Hosts: Mac Frederick and Sean Boyle
- Audience: owners and operators of local service businesses in Philadelphia
  and the nearby Pennsylvania, New Jersey, and Delaware market
- Organizer: Dillon Mohr's connected Google Calendar account
- Event: the single existing Google Calendar event matching the title and
  August 6 schedule
- Meeting location: the Google Meet already provisioned on that event
- Registration: `https://momentum-workshop-pilot.netlify.app`

## Research reconciliation

A workspace-wide Slack search covered public channels, private channels, DMs,
group DMs, and accessible files using the workshop title, live URL, August 6,
webinar, invitation, and weekly-webinar language. Gmail was searched using the
same title, date, URL, and Sean/Mac sender combinations. Neither source
contained a competing workshop date.

Relevant Slack evidence appeared in:

- `#skool-gbp-course`, where Dillon introduced the live pilot and Mac and Sean
  were named as hosts.
- `#ai-tech-news`, where Mac described the weekly-webinar acquisition concept.
- Dillon and Sean's DM, where Sean approved the concept direction and asked
  for the prospect/calendar final step.

The live page, event schema, ICS file, and the only matching Google Calendar
event all agree on August 6 from noon to 1:00 PM Eastern. The Google Calendar
event is the authoritative scheduled instance.

## Delivery boundary

Approval covers the production workflow end to end. It does not convert public
business contact data into recipient calendar consent. The 250 researched
contacts receive tracked registration links only through a separately approved
outreach channel. An organizer invitation may be sent only after the recipient
registers and explicitly selects the one-workshop calendar invitation option.

## Production verification

Production activation passed on July 27, 2026:

- Netlify deploy `6a6778675c36a8301dbcad05` contains the signed webhook
  receiver and the exact-event calendar processor.
- Webhook `6a6777c58af3e6356e4e96e3` is enabled for verified submissions to
  form `6a6238908c25fe0008ba4577`.
- Ten isolated tests pass, including consent gating, exact organizer/event
  enforcement, signed-webhook rejection, duplicate suppression, and confirmed
  attendee delivery.
- A controlled production registration added
  `dillonmohr8777+momentumtest@gmail.com` once with RSVP status
  `needsAction`. A repeat registration did not create a duplicate.
- The controlled attendee and all four QA submissions were removed after the
  test. The final event and form intake both contain zero test records.
