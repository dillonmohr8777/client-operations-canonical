# Puttery NYC Tock Reservation Webhook

This is the canonical, privacy-safe implementation package for the Puttery NYC Reservation Webhook receiver. It binds the business-group stream to Puttery NYC and deliberately stops before production registration or ad-platform delivery.

## Current state

- Canonical client: `puttery-nyc`.
- Tock Business Group ID: `28086`.
- Puttery NYC Business ID: `37824`.
- Authoritative venue filter: `business.id`.
- Receiver route: `POST /webhooks/tock/reservations`.
- Inbound header name: `PutteryWebhookAuth`.
- The role credential and the independently generated webhook authorization value are stored in Windows Credential Manager, not in this package.
- The emailed role credential is held from production use until Tock revokes and rotates it.
- One exact-scope, read-only Data Exports request returned HTTP `503`; access is therefore not considered validated.
- All thirteen receiver tests and the protected local end-to-end credential test pass.
- The existing public reporting dashboard has no durable database and is not a valid webhook host.
- Production registration remains held by the commercial, credential-rotation, hosting, controlled-payload, value, consent, and platform-account gates in `PRODUCTION_READINESS_2026-09-01.md`.

## Package map

- `IMPLEMENTATION_SPEC.md`: Measurement architecture, event semantics, and completion gates.
- `account-binding.json`: Verified non-secret account and routing facts.
- `PRODUCTION_READINESS_2026-09-01.md`: Current decision and blockers.
- `DEPLOYMENT_RUNBOOK.md`: Durable-host, registration, test, backup, and rollback sequence.
- `WEBHOOK_RECEIVER_CONTRACT.md`: Receiver, security, ordering, filtering, and recovery behavior.
- `acceptance-cases.json`: Required production acceptance cases.
- `receiver/`: Dependency-free Node 24 receiver with SQLite persistence, tests, and a portable container definition.
- `scripts/`: Protected credential import, read-only API probing, access registration, and local end-to-end verification.
- `VENDOR_REPLY_DRAFT_2026-09-01.md`: Exact unsent vendor handoff copy.

## Safe local verification

From `receiver/`:

```powershell
npm test
```

From the package root, after the webhook authorization value exists in Windows Credential Manager:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\Test-TockReceiverFromWinCred.ps1
```

Neither command requires or prints the Tock role credential.

## Production boundary

The receiver is an ingestion and ordering layer, not a finished conversion ledger. Do not register it with Tock or send booking signals to Google or Meta until every blocking item in the readiness file is cleared and one controlled NYC payload reconciles to the approved booking value definition.
