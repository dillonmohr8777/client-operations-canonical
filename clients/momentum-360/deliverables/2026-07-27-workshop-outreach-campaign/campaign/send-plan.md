# Controlled send plan

## Sender

Live Gmail verification on July 27, 2026 found one configured identity:

`Dillon Mohr <dillonmohr8777@gmail.com>`

No `needmomentum.com` sender alias is configured. The recommended production
sender is an authenticated Momentum domain identity with SPF, DKIM, and DMARC
alignment.

## Merge rules

- One message per recipient
- Never place the audience in a shared To, Cc, or Bcc field
- Use `contact_name` when present
- If no contact name exists, use `there` as `{{greeting_name}}`
- Use the row's exact `business_name`
- Use the row's exact `registration_url`
- Keep HTML and plain text alternatives paired
- Use the primary subject for the first wave
- For Gmail, use `first-touch-gmail.html` so the default hosted Momentum
  signature is not duplicated
- For another provider, use `first-touch.html` and disable any provider level
  automatic signature

## Waves

| Wave | Recipients | Earliest action |
| --- | ---: | --- |
| 1 | 25 | Sent and verified in Gmail Sent at 2026-07-28T00:34:00Z |
| 2 | 50 | Prospects 026 through 050 sent after Dillon's explicit authorization; remaining 25 held |
| 3 | 50 | After bounce, complaint, opt out, and registration review |
| 4 | 50 | After continued healthy delivery |
| 5 | 50 | After continued healthy delivery |
| 6 | 25 | Final clean recipients only |

A live Gmail review at `2026-07-28T00:57:00Z` found 3 hard delivery
failures among the 25 wave 1 messages. All 3 addresses are suppressed in the
protected audience file and the non-PII campaign ledger. The observed hard
bounce rate is 12 percent, above the campaign's 2 percent pause threshold.
Despite the pause threshold, Dillon explicitly authorized another 25 messages.
Prospects 026 through 050 were sent individually between
`2026-07-28T02:46:13Z` and `2026-07-28T02:49:42Z`. All 25 were verified with
recipient-specific Gmail Sent searches. Five then produced hard delivery
failures and were suppressed; 20 remain delivered or pending. The remaining
200 stay held.

Pause immediately for:

- any spam complaint
- hard bounce rate above 2 percent
- evidence of a broken merge field or mismatched registration URL
- a missing suppression mechanism
- sender authentication failure

## Suppression

Before each wave, remove:

- prior opt outs
- hard bounces
- addresses with a previous spam complaint
- recipients already registered
- recipients already contacted in this campaign

The repository ledger intentionally contains no raw email addresses. The
production sender or CRM must hold the enforceable suppression list in its
protected system.

## Calendar rule

The email links to registration. The prospect is not added to the event merely
because the outreach was sent. The existing automation may invite only a
verified registrant who explicitly selects the calendar invitation option.

## Reply handling

- `no`, `no thanks`, `unsubscribe`, `remove me`, and equivalent language:
  suppress before any later wave
- interested reply: answer personally and include the same tracked link
- registration confirmation: do not send another prospecting touch
- wrong person: suppress unless they explicitly introduce the correct contact
