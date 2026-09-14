# Dedicated agents offline review pilot

Historical investigation/replay record. For the final September 13 implementation, 168 local checks, restored local schedule, and remaining external gates, see [STACK-CLOSEOUT-2026-09-13.md](STACK-CLOSEOUT-2026-09-13.md) and [STATUS.json](STATUS.json). Earlier disabled-runner and prototype test counts below describe their observation time.

State: DRAFT. This is an offline orchestration plumbing test only. It does not deploy a Slack app, contact Slack, call a model API, mutate HubSpot/GHL/CallRail/Apollo, send messages, spend credits, publish work or mark any business issue complete.

## What this pilot proves

- Evidence cards conform to the expected schema.
- Cards route to known Momentum owners and lanes.
- Dependencies are ordered and cycles/missing prerequisites fail.
- Resolved evidence can suppress stale reminders.
- Repeated sources are not merged into one work item when card IDs are distinct.
- Output is compact ordered DRAFT packets for human review.
- Assistant-loop cards carry acceptance terms for exact invocation triggers, reuse of answered fields, freeform answer acceptance and artifact-completion proof.
- Same input replay is deterministic, but there is no durable delivery ledger and no duplicate-delivery proof.

## What this pilot does not prove

- No autonomous employee is live.
- No Slack agent is installed.
- No bottleneck is fixed.
- No provider configuration is current.
- No lead, invoice, payment, call, client message or report has been changed.
- No NLP detector is implemented for repeated questions or non-directed bot triggers; those are contract requirements carried into the draft packet.
- The static import scan is a limited no-network check, not a comprehensive security proof.

## Activation packet

1. Confirm the single Slack app approach: one internal Slack agent app with named modes/personas for Sean operations, Mac revenue/reporting, Melissa Silber marketing, Melissa Rigby delivery, Jason sales and a non-public shared verifier.
2. If distinct @mentionable workers are required, create separate Slack apps/bot users or use another verified Slack multi-identity route. A single app with display overrides is not proof of separate bot accounts.
3. Install scopes only after review: Real-time Search for discovery, targeted `conversations.replies` and `conversations.history` for exact evidence, and write scopes only for approved draft/status surfaces.
4. Keep private/DM/MPIM coverage user-consented. Public discovery may use public search access, but do not auto-join every public channel.
5. Keep all consequential actions gated: send, post, publish, spend, MFA, destructive work, CRM mutation, payment collection, calls/SMS and client messaging.
6. For AskRocco-style assistant work, require no repeated question for a field already answered in plain text, exact invocation triggers, freeform answers accepted as valid field answers, artifact output proven by links/receipts and non-directed human-to-human chatter ignored.

## Cost and routing policy

Routine work routes to Luna medium. Demanding work routes to gpt-5.5 xhigh. Do not use Astra unless Dillon explicitly asks. Cap concurrent workers at 3 unless changed in `agent-contracts.json`. Do not make dollar-cost claims without measured usage receipts.

## Files

- `agent-contracts.json`: owners, lanes, allowed outputs, stop gates and cost policy.
- `replay.py`: Python stdlib offline validator and packet builder.
- `replay-results.json`: latest dry-run output from `evidence-cards.json`.
- `evidence-cards.json`: parent-supplied redacted source cards, not edited by this pilot.
