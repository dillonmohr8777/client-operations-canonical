# Local Momentum lead review

Python stdlib and SQLite for the deterministic lead core. The shadow receiver adds signed Slack request checks, a Socket Mode wrapper, and a local delivery ledger. It never sends automatically. The separate `approved_delivery.py` supports one explicitly approved controlled test; see [APPROVED-TEST.md](APPROVED-TEST.md). No bot is deployed, and no model call, CRM write or public tunnel is part of this runtime.

From this folder:

```powershell
python self_test.py
python shadow_receiver_test.py
python approved_delivery_test.py
python lead_agent.py --demo --crm-json ../live-crm-snapshot.json --db run/demo.sqlite --output run/demo.json --allowed-source-id synthetic-demo --allowed-channel-id C05R2B1ULF6 --as-of 2026-09-12T22:47:53.9474049Z
```

The demo generates two explicitly synthetic events against the two actual redacted CRM records captured in the companion snapshot. It does not claim those event IDs came from Meta or Zapier. The first task is NOT_STARTED; the second is IN_PROGRESS. Both drafts remain held because provider event linkage is unverified. Repeat the demo command to exercise persisted retries; it still stores two inquiry rows. Demo JSON and SQLite remain local under run/.

For normalized input, replace --demo with --event-json path.json and supply exact approved source/channel allowlists. Every supplied allowlist must match. Event fields: source_system, event_id, occurred_at (timezone required), source_locator, portal_id50612503, source_id/channel_id; optional contact_id, campaign_id, ad_id, form_id, status(open/resolved), resolved_evidence_ref. No names, phones, emails or raw notes are required. Arbitrary extra event fields are not persisted.

CRM snapshots follow ../live-crm-snapshot.json: route.clientId momentum-360, route.portalId50612503, route.identity valid, readAt, status live-read-only, records with unique contactId. These are caller-supplied assertions at this offline boundary, not cryptographic connector verification. read_error/stale/token_expired/unverified and unknown text states produce held drafts. Data older than24h or more than5minutes in the future is held. --as-of sets the evaluation clock for reproducible replay; it never alters the snapshot readAt.

Each exact source-system/event-ID tuple gets one stable inquiry. Retries enrich blank event fields and retain prior nonempty facts; conflicts preserve all observed candidates. Latest CRM values update context, while missing new values preserve older facts with their original read timestamps and an explicit retained-context hold. A second provider event always stays a separate inquiry, including for the same contact. No cross-source inquiry merge is implemented. Optional verified_event_link needs boolean verified:true, matching contact_id/crm_record_id and evidence_ref; without it the contact is context only. This evidence structure must be populated by a trusted adapter after real provider mapping is checked.

Stop without touching input files or opening a database:

```powershell
python lead_agent.py --stop --db run/demo.sqlite --output run/stopped.json
```

The isolated lead_review_v2 table supersedes the interrupted prototype without migrating its unused tables. CLI processes an input batch in one SQLite transaction and replaces JSON output atomically; a local output failure can occur after ledger commit, so rerun the same events to regenerate the draft. This is inquiry/draft persistence, not proof of exactly-once Slack sending.

`slack_shadow_receiver.py` adds the current receiver boundary:

- verifies Slack HTTP signatures against the raw body, timestamp and replay window;
- accepts only `app_mention` events from Momentum workspace `T066HGS7N`, channel `C05R2B1ULF6`, the configured app id, and approved human user ids;
- rejects bot events, wrong app/team/channel/user, oversized bodies, event-id body conflicts, stale signatures and missing bot mentions;
- strips any Slack-supplied `verified_event_link`, because provider-to-CRM mapping must come from a trusted mapping source, not message metadata;
- durably deduplicates Slack event ids and lead inquiry ids in SQLite;
- stages local delivery intents as `HELD_REVIEW`, `AWAITING_APPROVAL`, `DUPLICATE_INQUIRY`, `RECONCILE_REQUIRED`, `STOPPED` or `CANCELLED`;
- latches stop/cancel so later events preserve drafts but create no delivery intent;
- exposes a loopback-only HTTP server and an optional no-post Slack Socket Mode listener using the official `slack_bolt` SDK pinned in `requirements.txt`.

Required receiver configuration stays outside the repository:

```powershell
$env:MOMENTUM_SLACK_SIGNING_SECRET = '<secret store value>'
$env:MOMENTUM_SLACK_TEAM_ID = 'T066HGS7N'
$env:MOMENTUM_SLACK_CHANNEL_ID = 'C05R2B1ULF6'
$env:MOMENTUM_SLACK_APP_ID = '<approved Workmate app id>'
$env:MOMENTUM_SLACK_BOT_USER_ID = '<approved bot user id>'
$env:MOMENTUM_ALLOWED_HUMAN_USER_IDS = '<comma-separated approved human Slack user ids>'
$env:MOMENTUM_ALLOWED_SOURCE_IDS = '<comma-separated trusted lead source ids>'
```

Socket Mode additionally requires `MOMENTUM_SLACK_BOT_TOKEN` and `MOMENTUM_SLACK_APP_TOKEN`, both from the secret store. The listener acknowledges the mention and writes the local ledger only; it does not call `say`, `chat.postMessage` or any CRM endpoint.

The pinned SDK is installed in `C:\Users\dillo\AppData\Local\Dillon\MomentumWorkmate\venv`, outside the repository. Its Python executable is the runtime for Socket Mode and the separately approved sender. The listener checks Slack `auth.test` against the configured Momentum team and bot user before connecting.

Ordinary human request syntax is `@Momentum Workmate review contact <numeric-id>`. Include `slack_review_request` in the explicit allowed source IDs. The request uses its Slack event ID and permalink as the review source; it does not invent a Meta inquiry or provider linkage. Provider mapping remains held unless supplied by a separately trusted adapter. Stop commands are exactly `stop`, `cancel`, `stop all`, `cancel all`, `stop dispatch` or `cancel dispatch` after the bot mention. Stop is persistent; this pilot requires deliberate local state reconciliation before resuming.

The exact staged fixture is `fixtures/slack-first-synthetic-request.json`. Its current output is `run/shadow-first-response.json`, with one Slack event row, one lead review row and one delivery-ledger row in `HELD_REVIEW`. That is correct: the fixture uses a synthetic provider event and has no trusted provider-to-CRM mapping receipt.

The draft manifest is still Socket Mode. The signed HTTP path is for raw-request verification and a future Events API deployment if an approved private endpoint exists. Do not install the existing `Momemtum Webhook` app as this receiver; live inventory found no `Momentum Workmate` app yet.

See ../ACTIVATION.md and ../zapier-live-verification.md for actual remaining receiver, consent, provider repair and delivery verification work.
