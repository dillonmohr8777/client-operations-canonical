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
- Delivery status: not sent

The campaign is complete and ready for a controlled first wave. It is not safe
to send all 250 at once from Dillon's personal Gmail identity. Gmail currently
has no authenticated Momentum sender alias, and the prospect list has only
syntax and domain mail validation rather than individual mailbox validation.

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

Preferred route:

1. Configure an authenticated `needmomentum.com` sender with SPF, DKIM, and
   DMARC alignment in a mail platform that supports suppression and
   unsubscribe handling.
2. Send a 25-recipient first wave.
3. Review hard bounces, spam complaints, opt outs, replies, and registrations.
4. Continue only if the first wave is healthy.

Fallback route:

Send the same 25-recipient first wave from Dillon's currently authenticated
Gmail account, one personalized message per recipient. Do not expose the list
with a shared To or Cc field.
