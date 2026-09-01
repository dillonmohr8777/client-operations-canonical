# Puttery NYC Tock webhook: path to production

Status on 2026-09-01: the secure credential setup and the local receiver are done (13/13 receiver tests, protected end-to-end passed). The integration is not live. This plan closes the four remaining gaps in order. Nothing here sends, deploys, spends, or changes an account without Dillon.

Venue binding: Business Group `28086`, Business ID `37824`.

## 1. The HTTP 503 is not a verdict on the credential

Observed at `2026-09-01T20:31:35Z`: a credentialed Tock API call returned 503. Unauthenticated probes from a separate network at `2026-09-01T20:50Z` showed `api.exploretock.com` alive: the reservation model docs return 200, unknown paths return 400. So the host is up and the 503 is endpoint- or account-scoped. A 503 never proves or disproves a credential; only 401 or 403 does.

Triage protocol, run from the machine that holds the credential:

1. Repeat the exact call three times, five minutes apart. Record for each: HTTP status, `Retry-After`, any request-id header, response body (redacted), and the wall-clock time.
2. Call the lightest authenticated read the vendor documentation offers (a business or whoami style endpoint) with the same credential. A 200 there validates the credential and isolates the 503 to the reservation endpoint.
3. Send the same request with a deliberately wrong credential. A 401 or 403 proves the auth layer is reachable; a 503 again means the failure is upstream of auth.
4. Only after 1 to 3: open a Tock support ticket quoting business IDs, request ids, timestamps, and the pattern. Do not include the credential.

Record every result in `../VERIFICATION_2026-09-01.md`. Until step 2 or a live delivery succeeds, the readiness doc keeps "credential provisioning unvalidated".

## 2. Durable public webhook host: the relay in this folder

Tock has to deliver to a stable HTTPS URL that is up when the Windows machine is not. Rather than expose the local receiver, the relay accepts and stores events durably and the receiver pulls them.

```
Tock  ── POST /tock/webhook ──▶  Netlify Function + Blobs (this folder)
                                          │  pending/<reservationId>/<digest>
Windows receiver  ◀── GET /tock/drain ────┘  then POST /tock/drain/ack
```

- Auth from Tock: a shared secret in a configurable header. The header name and value scheme must come from the vendor documentation. Set `TOCK_WEBHOOK_HEADER` accordingly; default is `authorization` with `Bearer <secret>`.
- Venue filter: events for any other business or group are answered 202 and never stored.
- Idempotency: key is reservation id plus a digest of the body. Identical redeliveries dedupe; a changed reservation is a new event.
- Drain auth: a separate `DRAIN_TOKEN`, so Tock's credential can never read events back.
- Nothing about a guest is logged by the platform beyond the stored record, and the stored record is exactly what Tock sent.

Deploy steps (Dillon or Codex, from the desktop, after review):

```
npm install
npm test
netlify sites:create --name puttery-tock-relay
netlify env:set TOCK_WEBHOOK_SECRET <generate 32+ random bytes>
netlify env:set TOCK_WEBHOOK_HEADER authorization      # or the header the vendor docs name
netlify env:set TOCK_BUSINESS_ID 37824
netlify env:set TOCK_BUSINESS_GROUP_ID 28086
netlify env:set DRAIN_TOKEN <generate a second 32+ byte secret>
netlify deploy --prod
```

Store both secrets in Windows Credential Manager and register them in Access Broker, the same way the API key was handled. They never enter Git or a chat.

Smoke test before telling Tock anything: POST a synthetic reservation (see `test/relay-core.test.mjs` for the shape) with the correct header and confirm `stored: true`; POST it again and confirm `duplicate: true`; POST one with `business.id` set to another value and confirm 202; run `scripts/Drain-TockRelay.ps1 -DryRun`.

## 3. Vendor registration

Tock registers the webhook on their side. Draft request, to be sent by Dillon through the account's established Tock contact or support route:

> Please register a reservation webhook for Business Group 28086, Business ID 37824 (Puttery NYC).
> Endpoint: `https://<site>.netlify.app/tock/webhook` (HTTPS only, POST, JSON).
> Events: reservation created, updated, and cancelled.
> Authentication: we will accept the shared secret in the header your documentation specifies; please confirm the header name and whether it is a bearer token or an HMAC signature.
> Please also confirm your retry policy on non-2xx responses and whether you can send a test delivery so we can validate end to end before the first real reservation.

Approval gate: external send. Draft only until Dillon says go.

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
