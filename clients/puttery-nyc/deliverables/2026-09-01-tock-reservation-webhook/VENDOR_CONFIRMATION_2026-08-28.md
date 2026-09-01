# Verified Tock Vendor Confirmation

**Source:** Gmail message `1a049e62f063f279`
**Thread:** `1a049e62f063f279`
**Subject:** `Follow Up: Puttery NYC | Tock API integration x Webhooks??`
**Sender:** Resy API Integrations
**Signed by:** Laura Benedetto, Technical Account Analyst
**Received:** August 28, 2026 at 3:43 PM Eastern

## Confirmed

- Puttery NYC's subscription is eligible for the Data Exports API and real-time Reservation Webhook.
- Tom Luciano's email is sufficient to request and gain access.
- The Reservation model contains the requested reservation, business/location, timestamps, party state, cancellation/no-show, monetary, payment, refund, and checkout fields.
- Ad click and UTM metadata is exposed through reservation `KeyValue` entries.
- Webhooks are configured at the business-group level and require filtering on the target business.
- Events are delivered immediately, retried up to three times after failure or timeout, and have no reported rate limit.
- Static authorization headers are optional on Tock's side.
- Daily export files are the recommended recovery source for missed webhook deliveries.
- GA4 can be enabled in Tock's integration directory.
- No Tock/Resy transition interruption or near-term API behavior change is anticipated.

## Attachment-derived contract

- `reservation.id` remains stable across edits, reschedules, and cancellations.
- `versionId` orders reservation updates; lower stored versions may be discarded.
- Delivery is at least once and eventually consistent.
- Transfers cancel the original reservation and create a new reservation.
- Daily export URLs are signed for seven days, files contain up to 5,000 records, and new snapshots are made available twice daily.
- API requests require an API key, `User-Agent`, and an exact `X-Tock-Scope` containing business and group identifiers.

## Attached evidence retained in Gmail

- `Tock - Real-time Reservation Webhook.pdf`
- `Tock - Real-time Guest Profile Webhook.pdf`
- `Tock - Guest Profile Ingest API.pdf`
- `Tock - Daily Data Exports API.pdf`

The attachments are proprietary and remain in the exact Gmail source thread. This project stores only a redacted implementation summary and no raw guest data or credentials.

## Still pending

- Exact Puttery NYC `business.id`
- Exact `businessGroupId`
- Secure API key issuance
- Deployed HTTPS Reservation Webhook endpoint
- Secure authorization-header exchange route
- Exact populated `KeyValue` names in a controlled booking
- Native GA4 event proof for transaction ID, value, currency, and cross-domain attribution
- Native Meta integration proof
- Approved conversion-value and consent treatment
