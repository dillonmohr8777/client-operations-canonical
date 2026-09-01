# Puttery NYC Tock webhook: path to production

Status on 2026-09-01: the secure credential setup and the local receiver are done (13/13 receiver tests, protected end-to-end passed). The integration is not live. This plan closes the four remaining gaps in order. Nothing here sends, deploys, spends, or changes an account without Dillon.

Venue binding: Business Group `28086`, Business ID `37824`.

## 1. The HTTP 503 is not a verdict on the credential

Observed at `2026-09-01T20:31:35Z`: a credentialed Tock API call returned 503. Unauthenticated probes from a separate network at `2026-09-01T20:50Z` showed `api.exploretock.com` alive: the reservation model docs return 200, unknown paths return 400. So the host is up and the 503 is endpoint- or account-scoped. A 503 never proves or disproves a credential; only 401 or 403 does.

Triage protocol, run from the machine that holds the credential with `scripts/Invoke-TockProbeTriage.ps1` (Windows PowerShell 5.1; the original `../scripts/Invoke-TockDataExportProbe.ps1` needs PowerShell 7, which is not installed on the desktop):

1. Repeat the exact call three times, five minutes apart (`-Mode credentialed -AllowEmailedCredential`). Record for each: HTTP status, `Retry-After`, the `cf-ray` id, body size and shape, and the wall-clock time. The body itself is never printed.
2. There is no lighter authenticated read: Data Exports `/api/data/export/urls` is the only documented API call, so it is both the credential check and the endpoint under test.
3. Send the same request with no credential (`-Mode none`) and with a deliberately wrong one (`-Mode wrong`, a fresh random value). A 401 or 403 proves the auth layer is reachable; a 503 for the wrong value means the failure is upstream of credential validation.
4. Only after 1 to 3: ask Resy API Integrations in the existing thread using the verified unsent draft in `../VENDOR_REPLY_DRAFT_2026-09-01.md`, quoting business IDs, `cf-ray` ids, timestamps, and the pattern. Do not include the credential.

Result on 2026-09-01 (desktop, 21:35Z to 21:48Z, details in `../VERIFICATION_2026-09-01.md`): no credential answers 403 with an empty body; a random wrong credential answers 503 with a 9,102-byte `text/html` Cloudflare origin-error response shape; the stored credential answers the same redacted response shape on all three five-minute probes, with no `Retry-After`. This strongly indicates that the 503 occurs upstream of credential validation: any presented `X-Tock-Authorization` value reaches an origin that is unavailable, while the stored credential is neither validated nor rejected. Step 4 is the next move. The readiness doc keeps "credential provisioning unvalidated".

## 2. Durable public webhook host: the relay in this folder

Tock has to deliver to a stable HTTPS URL that is up when the Windows machine is not. Rather than expose the local receiver, the relay accepts and stores events durably and the receiver pulls them.

```
Tock  ── POST /tock/webhook ──▶  Netlify Function + Blobs (this folder)
                                          │  pending/<opaque-digest>
Drain-TockRelay.ps1  ◀── GET /tock/drain ─┘
        │ POST /webhooks/tock/reservations (original body, PutteryWebhookAuth header)
        ▼
Local receiver (../receiver, SQLite)  ── 2xx ──▶  POST /tock/drain/ack
```

- Auth from Tock: the static header is ours to name (Tock treats it as optional and registers what we give them). It is `PutteryWebhookAuth`, the name already bound in `../account-binding.json` and enforced by the receiver; the relay default matches and a test pins the two together. The value is the relay's own `TOCK_WEBHOOK_SECRET`, not the receiver's value.
- Venue filter: events for any other business or group are answered 202 and never stored.
- Idempotency: the key is an opaque digest of the reservation id and exact body. Identical redeliveries dedupe; a changed reservation is a new event without exposing the source id in queue keys.
- Consistency: both functions use strong Netlify Blobs reads so a successful acknowledgement and raw-payload deletion are visible immediately across function instances.
- Drain auth: a separate `DRAIN_TOKEN` as `Authorization: Bearer`, so Tock's credential can never read events back.
- Drain client: hands each stored body to the local receiver unchanged so the receiver's version ordering, duplicate suppression, and NYC filter stay authoritative. Acks 2xx responses; dead-letters and acks only permanent payload errors (`400`, `413`, `415`, `422`). Authentication, routing, rate-limit, server, and connection failures stop the batch unacked so the next run retries.
- Privacy: the raw Tock body lives in Blobs only while pending. On ack it is deleted and a `{key, receivedAt, ackedAt}` marker remains for dedupe.

Deploy steps (Dillon or Codex, from the desktop, after review):

```
npm install
npm test
netlify sites:create --name puttery-tock-relay
netlify env:set TOCK_WEBHOOK_SECRET <generate 32+ random bytes>
netlify env:set TOCK_WEBHOOK_HEADER PutteryWebhookAuth
netlify env:set TOCK_BUSINESS_ID 37824
netlify env:set TOCK_BUSINESS_GROUP_ID 28086
netlify env:set DRAIN_TOKEN <generate a second 32+ byte secret>
netlify deploy --prod
```

Store both secrets in Windows Credential Manager and register them in Access Broker, the same way the API key was handled. They never enter Git or a chat. The drain client reads `DRAIN_TOKEN` from target `Codex.ClientAccess.PutteryNYC.TockRelayDrainToken` and the receiver header value from the existing `Codex.ClientAccess.PutteryNYC.TockWebhookAuthorization`.

Smoke test before telling Tock anything: POST a synthetic reservation (see `test/relay-core.test.mjs` for the shape) with the correct header and confirm `stored: true`; POST it again and confirm `duplicate: true`; POST one with `business.id` set to another value and confirm 202; run `scripts/Drain-TockRelay.ps1 -DryRun`.

## 3. Vendor registration

Tock registers the webhook on their side. Draft request, to be sent by Dillon through the account's established Tock contact or support route:

> Please register a reservation webhook for Business Group 28086, Business ID 37824 (Puttery NYC).
> Endpoint: `https://<site>.netlify.app/tock/webhook` (HTTPS only, POST, JSON).
> Events: reservation created, updated, and cancelled.
> Authentication: we will accept the shared secret in the header your documentation specifies; please confirm the header name and whether it is a bearer token or an HMAC signature.
> Please also confirm your retry policy on non-2xx responses and whether you can send a test delivery so we can validate end to end before the first real reservation.

Approval gate: external send. Gmail draft `r-164939560219168303` is verified and remains unsent until Dillon says go.

## 4. Credential rotation

The API key used during setup was exercised in test traffic and should be rotated before production.

1. Generate the replacement in the Tock dashboard for the same business group.
2. Store it in Windows Credential Manager under a new item name; register the new locator in Access Broker; update the receiver's config to the new locator.
3. Run the section 1 credential check with the new key. A 200 on the lightest read proves it.
4. Revoke the old key in the Tock dashboard.
5. Record the rotation date and Access Broker locator (never the value) in `../VERIFICATION_2026-09-01.md`.

## 5. Controlled real reservation event

Only after sections 2 to 4:

1. Announce the window internally in the Puttery channel so no one treats it as a real booking.
2. Create one refundable, minimum-size reservation at Puttery NYC on a low-demand slot, with the UTM metadata the attribution spec expects (`keyValue` rows such as `utm_source`, `utm_campaign`).
3. Confirm within two minutes: relay `/tock/health` shows `pending: 1`; drain writes the file; the receiver inserts one row with the metadata intact; a second drain shows nothing pending.
4. Cancel the reservation. Confirm the cancellation arrives as a second event and the receiver marks the row cancelled, not duplicated.
5. Record both events, timings, and the reservation id in the verification doc. Refund is confirmed in Tock.

## Go-live checklist

- [ ] Section 1 result recorded; credential validated by a 200 on an authenticated read
- [ ] Relay deployed; smoke test passed; secrets in Credential Manager and Access Broker
- [ ] Vendor registration confirmed by Tock, including the auth header they use
- [ ] Rotated credential live; old key revoked
- [ ] Controlled reservation and cancellation observed end to end
- [ ] Drain scheduled on the desktop (Task Scheduler, every 5 minutes, `Drain-TockRelay.ps1`)
- [ ] Rollback written: remove the webhook registration at Tock; the relay keeps buffering, nothing is lost

## Not in scope here

The Puttery branded dashboard, the two-venue-day booking validation, and the GA4, GTM, Google Ads, Meta, and CMS access requests are tracked as their own work items.
