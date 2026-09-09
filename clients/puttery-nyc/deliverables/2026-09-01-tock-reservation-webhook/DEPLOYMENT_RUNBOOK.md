# Puttery NYC Reservation Webhook Deployment Runbook

## Decision boundary

Do not deploy or register the receiver until the signed agreement, payment form, rotated role credential, exact host, protected runtime secret route, persistent storage, backup and restore route, and owner are verified. The existing dashboard site is not the webhook host.

## 1. Clear the preflight gates

Record current evidence for all of the following:

1. Agreement signed and payment form complete.
2. Emailed role credential revoked and rotated through an approved secure route.
3. Data Exports returns a successful exact-scope response or Tock confirms the required provisioning.
4. Exact existing host, repository, public hostname, environment owner, and rollback owner approved.
5. Host secret manager entries created for the role credential and the webhook authorization value.
6. Persistent encrypted storage, volume snapshot, restore test, retention, and monitoring approved.
7. Transaction grain, advertising value, consent treatment, and retention owner approved.

## 2. Build and verify the immutable receiver image

Use `receiver/` as the build context:

```powershell
docker build --pull --tag puttery-nyc-tock-receiver:2026-09-01 .
```

The image build runs the receiver test suite in a separate build stage and fails if any test fails.

Do not bake a secret, `.env` file, database, guest payload, or signed export URL into the image.

## 3. Configure the approved host

Required non-secret runtime values:

- `HOST=0.0.0.0`
- `PORT=8787`
- `TOCK_ALLOWED_BUSINESS_ID=37824`
- `TOCK_DB_PATH=/data/tock-events.sqlite`
- `TOCK_AUTH_HEADER_NAME=PutteryWebhookAuth`
- `TOCK_MAX_BODY_BYTES=1048576`

Required secret runtime value:

- `TOCK_AUTH_HEADER_VALUE`, injected from the host secret manager

Mount `/data` on durable encrypted storage writable by container user `node` and place an approved HTTPS reverse proxy or managed load balancer in front of port `8787`. Expose only `/healthz` and `/webhooks/tock/reservations`. Never expose the SQLite volume.

## 4. Verify staging before vendor registration

1. Confirm HTTPS certificate and hostname ownership.
2. Confirm `/healthz` returns HTTP `200` with `outcome=healthy`.
3. Confirm no authorization value appears in platform logs.
4. Send a synthetic target event and verify `inserted`.
5. Replay it and verify `duplicate`.
6. Send a synthetic non-target business and verify `filtered_non_target` with no source identifiers retained.
7. Send missing and incorrect authorization values and verify HTTP `401`.
8. Snapshot the persistent volume and complete one restore test into an isolated staging instance.

## 5. Register with Tock

Reply in the existing API Integrations thread with:

1. Reservation Webhook as the only requested webhook.
2. The exact approved HTTPS URL ending in `/webhooks/tock/reservations`.
3. Header name `PutteryWebhookAuth`.
4. The header value through the approved secure vendor route, never ordinary email or Slack.
5. A request for one controlled Puttery NYC event after registration.

## 6. Validate the controlled event

Accept the event only when `business.id` is `37824`. Record the reservation ID, version ID, delivery outcome, and payload hash as protected evidence without copying guest identity fields into the general project. Reconcile the controlled booking to the Tock record and approved value definition. Confirm that another group business is acknowledged and excluded.

## 7. Promotion and monitoring

Keep Google and Meta delivery disabled until the relevant acceptance cases pass. Monitor health, received and processed counts, filtered events, duplicates, stale updates, conflicts, processing lag, and the last success and failure. Treat daily Data Exports as recovery evidence only after access is successfully validated.

## 8. Rollback

1. Ask Tock to disable the webhook registration or point it to the last verified receiver.
2. Stop the new receiver without deleting its volume.
3. Preserve a snapshot of the database and service logs under the approved retention policy.
4. Restore the last verified image and volume snapshot.
5. Verify health and duplicate safety before resuming delivery.
6. Rotate the inbound authorization value if exposure is suspected.

No rollback step deletes production evidence. Any permanent deletion requires a separate approved retention action.
