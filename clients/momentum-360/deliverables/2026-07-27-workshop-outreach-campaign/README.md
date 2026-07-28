# Momentum 360 workshop outreach campaign

Prepared July 27, 2026 for the August 6, 2026 Philadelphia owner workshop.

## Campaign status

- Audience: 250 deduplicated public business contacts
- Named contacts: 236
- Generic business contacts: 14
- Registration links: 250 unique tracked URLs
- Calendar rule: invitation only after registration and explicit calendar consent
- Sender verified in Gmail: `Dillon Mohr <dillonmohr8777@gmail.com>`
- Momentum sender alias in Gmail: not configured
- Invitation capacity: Dillon Mohr, on behalf of Momentum 360
- Default Gmail signature artwork: deployed live
- Delivery status: 50 individual messages sent and verified
- Sent verification: wave 1 contained prospects 001 through 025; Dillon
  authorized another 25 and wave 2 sent prospects 026 through 050 from
  `2026-07-28T02:46:13Z` through `2026-07-28T02:49:42Z`
- Gmail verification: all 25 wave 2 recipient-specific Sent searches matched;
  the combined subject search displayed 49 conversations because Gmail grouped
  at least one same-subject conversation
- Live delivery review: 3 hard bounces were verified and suppressed at
  `2026-07-28T00:57:00Z`; 22 messages remain delivered or pending
- Observed hard bounce rate from wave 1: 12 percent
- Wave 2 delivery review: 5 hard bounces were verified and suppressed; 20
  messages remain delivered or pending
- Total verified outcome: 8 hard bounces across 50 attempts, with 42 delivered
  or pending
- Registrations: 0 in the live Netlify form at the same review
- Gmail signature: the old cached block was replaced with the Momentum 360
  HTML signature and verified in a fresh compose

The campaign package is complete and 50 individual invitations were attempted.
The remaining 200 are held because 8 hard bounces were verified across the two
batches and Gmail currently has no authenticated Momentum sender alias. The
prospect list has only syntax and domain mail validation rather than individual
mailbox validation.

## Package contents

- `signature/dillon-momentum-signature.html`: reusable Momentum 360 signature
- `signature/dillon-momentum-signature.txt`: plain text fallback
- `campaign/first-touch.html`: merge ready HTML message
- `campaign/first-touch-gmail.html`: Gmail body that relies on the default signature
- `campaign/first-touch.txt`: plain text alternative
- `campaign/subject-lines.md`: approved subject line set
- `campaign/send-plan.md`: staged delivery, suppression, and calendar rules
- `campaign/batch-manifest.json`: planned waves and verified audience counts
- `campaign/send-ledger.csv`: non-PII operational delivery ledger
- `campaign/preview.html`: reviewable sample rendering
- `assets/momentum-360-logo.png`: approved Momentum workshop mark
- `assets/dillon-momentum-signature.jpg`: exact hosted signature artwork

## Live signature

Gmail's existing default `Dillon Mohr` signature already references:

`https://dm-marketing-specialist-signature.netlify.app/dm-marketing-specialist-signature.jpg`

That exact production asset now contains the Momentum 360 artwork and title.
The prior image is preserved in the mapped Netlify source folder as
`dm-marketing-specialist-signature-legacy-2026-07-27.jpg`.

## Canonical audience

The campaign references:

`../2026-07-27-philadelphia-workshop-prospects/prospects.csv`

That private runtime audience file is intentionally not part of this campaign
commit. Do not duplicate or commit the public email addresses inside this
campaign folder. Each row's `registration_url` must stay paired with that
recipient.

## Production decision

Preferred route for the remaining 200:

1. Configure an authenticated `needmomentum.com` sender with SPF, DKIM, and
   DMARC alignment in a mail platform that supports suppression and
   unsubscribe handling.
2. Review hard bounces, spam complaints, opt outs, replies, and registrations
   from both completed 25-recipient batches.
3. Continue only if the first wave is healthy.

The fallback Gmail route was used for both 25-recipient batches. Every message
was sent individually from Dillon's authenticated Gmail account. The list was
never exposed with a shared To, Cc, or Bcc field.
