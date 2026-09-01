# Puttery Tock relay

Durable public webhook host for the Puttery NYC Tock reservation integration. Tock posts here; the tested local receiver on the Windows machine drains from here. No inbound port on the desktop, no event lost while it is offline.

```
netlify/functions/tock-webhook.mjs   POST /tock/webhook            Tock delivers here
netlify/functions/tock-drain.mjs     GET  /tock/drain?limit=N      receiver pulls oldest pending
                                     POST /tock/drain/ack          receiver acknowledges
                                     GET  /tock/health             counts
lib/relay-core.mjs                   all logic, no platform imports
test/relay-core.test.mjs             node --test test/*.test.mjs
test/drain-script.test.mjs           runs the real drain script against a loopback fake (Windows only)
scripts/Drain-TockRelay.ps1          the desktop side: relay -> local receiver over HTTP -> ack
scripts/Invoke-TockProbeTriage.ps1   redacted 503 triage, Windows PowerShell 5.1 compatible
PRODUCTION_PLAN.md                   503 triage, deploy, vendor registration, rotation, controlled test
```

Environment variables on Netlify: `TOCK_WEBHOOK_SECRET`, `TOCK_WEBHOOK_HEADER` (default `PutteryWebhookAuth`, the name bound in `../account-binding.json` and used by the receiver), `TOCK_BUSINESS_ID` (37824), `TOCK_BUSINESS_GROUP_ID` (28086), `DRAIN_TOKEN` (sent as `Authorization: Bearer` by the drain client).

The drain client reads its two secrets from Windows Credential Manager targets `Codex.ClientAccess.PutteryNYC.TockRelayDrainToken` (new; create it with the same pattern as `../scripts/New-TockWebhookAuthorization.ps1`) and `Codex.ClientAccess.PutteryNYC.TockWebhookAuthorization` (existing). Both Netlify Functions open the shared store with strong consistency so acknowledgements and deletion of raw payloads are immediately visible to later reads. Acked events leave only a `{key, reservationId, receivedAt, ackedAt}` marker in Blobs; the raw Tock body is deleted on ack. Only permanent payload failures (`400`, `413`, `415`, `422`) are dead-lettered and acknowledged. Authentication, routing, rate-limit, server, and connection failures remain pending.

Run locally:

```
npm install
npm test
```

Built 2026-09-01 by Claude from a remote session against the documented Tock reservation model (`reservation.swagger.json`, model version 2.7). The receiver, credential handling, and verification records live in the parent folder on the desktop and are Codex's; this folder adds only the public host and the drain client. Deployment is approval-gated.
