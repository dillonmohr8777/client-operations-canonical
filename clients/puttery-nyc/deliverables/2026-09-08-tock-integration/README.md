# Puttery NYC Tock integration completion

Latest update: the [full dashboard release](DASHBOARD-LIVE.md) adds verified reservation reporting, service-date filters, source-field readiness and downloads. Its deployment and browser receipts supersede the status-only dashboard deployment below. The second Laura reply is SENT and verified in `excluded-entry-sent-receipt.json`.

Verified September 8, 2026. The replacement role-account key works against Tock Data Exports (HTTP 200), reservation exports are synced, the existing reservation webhook is receiving events, and the existing dashboard reads verified operational status from the relay. Tock confirmed that walk-in records use `walkinId`; the normalizer now retains them as walk-ins rather than treating them as invalid reservations. Campaign attribution and booking-value validation remain pending.

## Live deployment

- [Existing Puttery dashboard](https://nyc-entertainment-attribution-dashboard-20260804.netlify.app/): site `3d07c320-2f5a-4d74-adad-8c6ed257b19b`, current deploy `6aa08e5d507822aa18d15f86`.
- [Operational status](https://puttery-tock-relay.netlify.app/tock/status): relay site `af1733a0-9da3-4cd9-b724-f84f1739667d`, deploy `6aa02ec54db8d7d841610dc4`.
- Dashboard source remains `../2026-09-04-dashboard-motion-restored/public/`. This update preserves its existing visual system and adds current integration data, source exclusions, and stale/offline handling.
- Active receiver and relay source remain in the existing `client-ops-claude-creative-factory-20260902` worktree under `clients/puttery-nyc/deliverables/2026-09-01-tock-reservation-webhook/`.

## Verified data and boundaries

The exact venue is business `37824`, group `28086`. Reservation records use Tock's standard record ID and walk-in records use `walkinId`; both are normalized under the venue scope. Guest export files were not downloaded. Raw guest payloads and signed export URLs are not persisted.

Export snapshots replace the prior snapshot atomically only after every file completes and validates. Combined operational counts select the greatest unsigned 64-bit version for each reservation ID; webhook state wins equal versions, and normalized differences are flagged. The latest aggregate counts and timestamps are in `operational-verification.json`; they continue changing as events arrive. These are reservation states, not completed visits, ad conversions, or approved revenue.

The relay acknowledgment total is one greater than the local webhook-delivery total in the inspected receipts. That historical counter difference remains unreconciled. Version merging has no open conflicts or normalized tie mismatches in the saved receipt; this is not financial reconciliation.

## Operation

The replacement secret is stored only at `wincred://Codex.ClientAccess.PutteryNYC.TockRoleAccount.Rotated20260908`. The old role-account locator is retired. Existing webhook and relay-drain credentials remain protected in Windows Credential Manager. Access Broker records the exact client scope and current non-secret locators.

Two tasks run through the existing hidden Windows task wrapper:

- `Codex-PutteryNYC-TockDataExports`: daily at 03:00 and 15:00 Eastern, with start when available and overlap suppression.
- `Codex-PutteryNYC-TockOperationalStatus`: at logon and every five minutes; publishes an allowlisted aggregate and verifies its readback.

The existing receiver stays running and the existing relay-drain task runs every five minutes. This processing depends on the Windows host being online with the configured user session available. The hosted relay buffers incoming events while the worker is unavailable. The dashboard marks operational data stale after 15 minutes and exports stale after 36 hours. Transient network failures retain the last verified public snapshot and are retried on the next scheduled run. A failed export attempt cannot clear known exclusions or publish an unverified mixed snapshot.

Manual refresh entry points are `Sync-TockExports.ps1` and `Refresh-TockStatus.ps1`; both load protected credentials internally. `Register-TockIntegrationTasks.ps1` installs the two bounded tasks through the hidden wrapper. Do not pass secrets as command arguments.

## Verification

- Current receiver suite: 14 of 14 passed, including confirmed `walkinId` normalization. Existing relay suite: 18 of 18 passed.
- `core-check.json`: unsigned IDs, exact venue scope, reservation and walk-in identity handling, normalized version merging, distinct-date counts, atomic failure preservation, snapshot removal, public field allowlist, and failed-refresh guard passed.
- `local-browser-check.json`: 20 checks passed, using a local CORS fixture override.
- `live-browser-check.json`: 20 checks passed against production without interception. Desktop and mobile verified actual API timestamp readback, whole counts, source exclusions, pending attribution, overflow, reduced motion, retained discovery questions, keyboard focus, and no page errors.
- Screenshots: `live-desktop.png` and `live-mobile.png`. Deployment and public-file receipts accompany this report.
- `runtime-verification.json` records scheduled-task state at handoff. A running task result of 267009 means it remains running, not failure. A transient status-publish failure recovered on manual refresh and then on a scheduler-launched run at 12:10 Eastern. Export, relay-drain, and operational-status tasks have latest result 0.
- `detector.json` has existing design findings and exit 2; see the narrow preservation exception in `detector-exceptions.md`. This is an explained exception, not a clean detector pass.

## Vendor reply

Replied in the existing Laura/Resy thread from `dillonmohr8777@gmail.com` to `api-integration@resy.com`, copying `tluciano@driveshack.com` and `joe@highlinecomedy.com`. Sent message `1a081c1658fa3e56` was read back with SENT, exact recipients, matching new body, and no quoted history. The reply confirms access and ingestion, asks about the malformed row, and leaves attribution/value validation as separate next steps. See `vendor-reply-receipt.json`.

## Remaining measurement work and rollback

Controlled booking validation, click/UTM key population, approved booking-value definition, consent treatment, GA4/tag evidence, and exact ad-account/campaign matching remain unresolved. Existing modeled dashboard metrics remain labeled as modeled. No ad changes, spend, or financial performance claims are authorized by this integration.

To pause this addition, disable only the two new tasks named above; preserve the existing receiver, drain, and normalized databases. To revert the hosted changes, select the prior verified production deploy in each exact site's Netlify history. The task manifest entries can be removed by their exact task names if uninstalling. Do not remove shared wrapper entries or unrelated work.
