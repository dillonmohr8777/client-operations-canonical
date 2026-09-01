# Puttery NYC Reservation Webhook Production Readiness

## Current decision

The exact account is bound, both secrets are protected, and the receiver passes local end-to-end verification. Production registration remains on hold.

## Confirmed current facts

- Canonical client: `puttery-nyc`, active.
- Tock Business Group ID: `28086`.
- Puttery NYC Business ID: `37824`.
- Authoritative venue filter: `business.id`.
- Desired webhook: Reservation Webhook only.
- Receiver path: `POST /webhooks/tock/reservations`.
- Required inbound authorization header name: `PutteryWebhookAuth`.
- Tock Data Exports endpoint: `https://api.exploretock.com/api/data/export/urls`.
- Existing public dashboard site is mapped, but it has no database and must not be used as the durable receiver.
- A portable non-root container definition is included for a future approved durable host.

## Security state

- The vendor role credential arrived through ordinary email and a user-supplied screenshot.
- The credential was imported directly into Windows Credential Manager without writing it to source, logs, command arguments, clipboard, or project files.
- Production use remains held pending rotation because the original value remains in ordinary email.
- A separate 256-bit inbound webhook authorization value is generated and stored in Windows Credential Manager.

## Data Exports verification state

- An unauthenticated request to the official endpoint returned HTTP `403`.
- One exact-scope, credentialed, read-only request returned HTTP `503`.
- No signed URLs or credential values were printed or stored in the project.
- The different response is not sufficient proof of authentication or provisioning. Access remains unverified until a rotated credential returns a successful response or Tock confirms the service state.

## Verified local controls

- Exact NYC business allowlist.
- Constant-time authorization comparison.
- JSON-only endpoint and bounded request body.
- Durable SQLite state with full synchronous writes and WAL.
- Duplicate, stale-update, and same-version conflict handling.
- Privacy-safe summaries with no raw guest or click values.
- Completed, deferred, error, and unknown refund separation.
- Business-group non-target events acknowledged and discarded without source identifiers.
- Thirteen of thirteen Node tests passed on September 1, 2026.
- The Windows Credential Manager end-to-end check passed health, target insertion, duplicate suppression, and non-target filtering.

## Production blockers

1. Signed agreement and completed payment form.
2. Rotated role credential stored through the approved protected route.
3. Approved durable HTTPS host, source repository, backup, restore, and rollback route.
4. Vendor registration of the Reservation Webhook endpoint and secure header exchange.
5. One controlled Puttery NYC payload proving `business.id = 37824`.
6. Approved transaction grain, booking-value definition, consent treatment, and retention owner.
7. Exact GA4, GTM, Google Ads, Meta, and CMS account mapping before conversion delivery.

The ordered deployment, backup, registration, controlled-test, and rollback procedure is in `DEPLOYMENT_RUNBOOK.md`.

No live webhook, production booking value, or ad-platform conversion should be claimed until these blockers pass.
