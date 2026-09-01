# Puttery Tock relay

Durable public webhook host for the Puttery NYC Tock reservation integration. Tock posts here; the tested local receiver on the Windows machine drains from here. No inbound port on the desktop, no event lost while it is offline.

```
netlify/functions/tock-webhook.mjs   POST /tock/webhook            Tock delivers here
netlify/functions/tock-drain.mjs     GET  /tock/drain?limit=N      receiver pulls oldest pending
                                     POST /tock/drain/ack          receiver acknowledges
                                     GET  /tock/health             counts
lib/relay-core.mjs                   all logic, no platform imports
test/relay-core.test.mjs             node --test test/*.test.mjs
scripts/Drain-TockRelay.ps1          the desktop side of the drain cycle
PRODUCTION_PLAN.md                   503 triage, deploy, vendor registration, rotation, controlled test
```

Environment variables on Netlify: `TOCK_WEBHOOK_SECRET`, `TOCK_WEBHOOK_HEADER` (default `authorization`), `TOCK_BUSINESS_ID` (37824), `TOCK_BUSINESS_GROUP_ID` (28086), `DRAIN_TOKEN`.

Run locally:

```
npm install
npm test
```

Built 2026-09-01 by Claude from a remote session against the documented Tock reservation model (`reservation.swagger.json`, model version 2.7). The receiver, credential handling, and verification records live in the parent folder on the desktop and are Codex's; this folder adds only the public host and the drain client. Deployment is approval-gated.
