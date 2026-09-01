# Puttery NYC Reservation Webhook Deployment Runbook

## Decision boundary

Do not deploy or register the relay and receiver until the signed agreement, payment form, rotated role credential, exact host, protected runtime secret routes, persistent storage, backup and restore route, and owner are verified. The existing dashboard site is not the webhook host. Tock delivers only to the Netlify relay at `/tock/webhook`; the local receiver is never public.

## 1. Clear the preflight gates

Record current evidence for all of the following:

1. Agreement signed and payment form complete.
2. Emailed role credential revoked and rotated through an approved secure route.
3. Data Exports returns a successful exact-scope response or Tock confirms the required provisioning.
4. Exact existing host, repository, public hostname, environment owner, and rollback owner approved.
5. Secret-manager entries created for the relay's Tock-facing secret, its separate drain token, and the local receiver authorization value.
6. Persistent encrypted storage, volume snapshot, restore test, retention, and monitoring approved.
7. Transaction grain, advertising value, consent treatment, and retention owner approved.

## 2. Build and verify the immutable receiver image

Use `receiver/` as the build context:

```powershell
docker build --pull --tag puttery-nyc-tock-receiver:2026-09-01 .
```

The image build runs the receiver test suite in a separate build stage and fails if any test fails.

Do not bake a secret, `.env` file, database, guest payload, or signed export URL into the image.

## 3. Configure the local receiver

Required non-secret runtime values:

- `HOST=0.0.0.0`
- `PORT=8787`
- `TOCK_ALLOWED_BUSINESS_ID=37824`
- `TOCK_DB_PATH=/data/tock-events.sqlite`
- `TOCK_AUTH_HEADER_NAME=PutteryWebhookAuth`
- `TOCK_MAX_BODY_BYTES=1048576`

Required secret runtime value:

- `TOCK_AUTH_HEADER_VALUE`, injected from the host secret manager

Mount `/data` on durable encrypted storage writable by container user `node`. Bind container port `8787` to host loopback only, such as `127.0.0.1:8787:8787`; never expose the receiver or SQLite volume publicly. `TOCK_AUTH_HEADER_VALUE` is a receiver-only secret used by the drain client and is not the value registered with Tock.

## 4. Configure and verify the public relay

Follow `public-relay/PRODUCTION_PLAN.md` on the exact approved Netlify site. Configure `TOCK_WEBHOOK_SECRET`, `TOCK_WEBHOOK_HEADER=PutteryWebhookAuth`, `TOCK_BUSINESS_ID=37824`, `TOCK_BUSINESS_GROUP_ID=28086`, and a separate `DRAIN_TOKEN` through the host secret manager.

1. Confirm the relay HTTPS hostname and `GET /tock/health` with the drain token.
2. Confirm the loopback receiver's `/healthz` returns HTTP `200` with `outcome=healthy`.
3. Send a synthetic bare target Reservation to `/tock/webhook` with the relay secret, drain it to the receiver, and verify `inserted` before acknowledging it.
4. Replay it and verify relay and receiver duplicate suppression.
5. Send a synthetic non-target business and verify HTTP `202` with no stored event.
6. Send missing and incorrect relay authorization values and verify HTTP `401`.
7. Confirm no secret, raw reservation ID, guest value, or raw acknowledged payload remains in logs, ack markers, or dead-letter metadata.
8. Snapshot the receiver volume and complete one restore test into an isolated staging instance.

## 5. Register with Tock

Reply in the existing API Integrations thread with:

1. Reservation Webhook as the only requested webhook.
2. The exact approved Netlify HTTPS URL ending in `/tock/webhook`.
3. Header name `PutteryWebhookAuth`.
4. The relay's `TOCK_WEBHOOK_SECRET` value through the approved secure vendor route, never ordinary email or Slack. Do not provide `DRAIN_TOKEN` or `TOCK_AUTH_HEADER_VALUE` to Tock.
5. A request for one controlled Puttery NYC event after registration.

## 6. Validate the controlled event

Accept the event only when `business.id` is `37824`. Verify the complete Tock to relay to drain to local-receiver path before acknowledging it. Record the reservation ID, version ID, delivery outcome, and payload hash as protected evidence without copying guest identity fields into the general project. Reconcile the controlled booking to the Tock record and approved value definition. Confirm that another group business is acknowledged and excluded.

## 7. Promotion and monitoring

Keep Google and Meta delivery disabled until the relevant acceptance cases pass. Monitor health, received and processed counts, filtered events, duplicates, stale updates, conflicts, processing lag, and the last success and failure. Treat daily Data Exports as recovery evidence only after access is successfully validated.

## 8. Rollback

1. Ask Tock to disable the webhook registration or point it to the last verified relay.
2. Pause the drain task so pending relay events remain unacknowledged, then stop the receiver without deleting its volume.
3. Preserve a snapshot of the database and privacy-safe service logs under the approved retention policy.
4. Restore the last verified relay deploy, receiver image, and volume snapshot.
5. Verify relay health, receiver health, and duplicate safety before resuming the drain.
6. Rotate only the affected relay, drain, or receiver secret if exposure is suspected.

No rollback step deletes production evidence. Any permanent deletion requires a separate approved retention action.
