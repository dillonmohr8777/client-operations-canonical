# Puttery NYC Reservation Webhook Receiver Contract

## Endpoint

- Method: `POST`
- Path: `/webhooks/tock/reservations`
- Content type: `application/json`
- Initial desired webhook: reservations only
- Walk-in and guest-profile webhooks: outside Phase 1

The public endpoint URL remains pending an approved host and deployment route.

This endpoint currently produces a privacy-safe reservation ingestion summary. It does not yet emit the production normalized conversion event. The production mapping remains gated on a controlled Puttery NYC payload, approved transaction grain and value, and the exact venue-location rule.

## Security

- Production requires a static authorization header even though Tock makes it optional.
- Header name and value are loaded from protected environment variables.
- The value is compared in constant time.
- The value must be exchanged through an approved secure route, not ordinary email or Slack.
- Raw request bodies, guest names, emails, phones, addresses, payment data, and click-ID values are never logged.
- Startup rejects placeholder business IDs, placeholder secrets, secrets shorter than 32 characters, and invalid body-size configuration.

## Source acceptance

Required fields before an event can enter the NYC state ledger:

- `id`
- `business.id`
- `versionId`

The receiver acknowledges a non-NYC business as a successful filtered outcome so business-group traffic does not create retries. Only the exact allowlisted Puttery NYC `business.id` can reach the NYC state table.

## Idempotency and ordering

The authoritative delivery key is:

`business.id + reservation.id + versionId`

- Higher version: update the accepted reservation state.
- Same version and same payload hash: duplicate, no additional ledger effect.
- Lower version: stale, no state change.
- Same version and different canonical payload hash: write a safe conflict record without replacing state.

Tock uint64 reservation, business, and version identifiers are handled as validated decimal strings so JavaScript or SQLite does not round them. Payloads are canonically serialized before hashing so whitespace or object-key ordering does not create a false conflict.

The SQLite scaffold persists only a safe NYC summary, the NYC source identifiers, the version, and a SHA-256 payload hash. Filtered non-NYC deliveries are counted without retaining their business ID, reservation ID, version, or payload hash. Same-version conflicts are written to a dedicated safe quarantine table. It does not persist raw payloads or guest information.

Completed refunds affect `completedRefundCents`. Deferred, error, and unknown refunds are counted and valued separately and never represented as completed refunds.

## Attribution metadata

The receiver recognizes the presence of `gclid`, `gbraid`, `wbraid`, `fbclid`, `fbc`, `fbp`, and allowlisted UTM keys inside the flexible Tock `keyValue` array. The general reporting ledger stores only normalized allowlisted key names, presence flags, and a count of unknown keys. It stores neither raw values nor arbitrary custom field names. Raw values require a separate restricted delivery component after consent, retention, and platform-purpose approval.

## Acknowledgment behavior

- Valid target, duplicate, stale, or filtered non-target: successful acknowledgment.
- Invalid JSON, missing required identity, or invalid version: client error so Tock's immediate retry behavior is observable.
- Durable-store failure: server error so Tock retries.
- Same-version hash conflict: accepted into quarantine without replacing state or causing a retry storm.
- Health checks query SQLite rather than reporting a static process-only result.

## Recovery

The production recovery job will query Tock's Data Exports API after each twice-daily snapshot window, download the reservation files from their seven-day signed URLs, filter on the NYC business ID, and feed missing or newer versions through the same idempotent state transition. Export data is a recovery and reconciliation source, not a second conversion source.

The local scaffold proves SQLite state survives a process restart and still suppresses a duplicate. Production still requires a selected durable store topology, retention schedule, cleanup invocation, backup, restore proof, and a replay procedure for open conflict records.

## Registration package for Tock

When deployment is approved, provide:

1. Desired webhook: Reservation Webhook only.
2. Exact HTTPS endpoint URL.
3. Authorization-header name.
4. Authorization-header value through the approved secure handoff.
5. Request for one controlled test event after configuration.
