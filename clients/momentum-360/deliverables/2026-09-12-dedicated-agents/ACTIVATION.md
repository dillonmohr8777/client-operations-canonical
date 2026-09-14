# Momentum agent activation package

State: LOCAL SHADOW READY, no new Slack app installed, provider automation changed, model API job dispatched, or message sent. The working local lead adapter and restricted Slack receiver are the first bounded pilot. Existing REPORT.md and agent-contracts.json define the broader team; this file specifies the route from local evidence to a real Slack presence.

## Ownership and outcomes

| Person | Dedicated mode | First useful deliverable | Acceptance measure |
|---|---|---|---|
| Jason Fallon | Lead desk | Source/campaign/owner/task/next-action draft for each inquiry | Exact retry yields one inquiry; second inquiry for same contact survives; CRM and delivery receipts reconcile |
| Sean Boyle | Operations | Bounded decision packet for blocked Apollo import and production briefs | Needed decision, evidence, owner and next step explicit; no invented budget or credit purchase |
| Mac Frederick | Revenue/reporting | Weekly Meta/GHL lead-to-outcome exceptions with source references | Reconcile to source totals or mark partial; no unsupported revenue attribution |
| Melissa Silber | Marketing production | Complete creative brief and requested asset-count checklist | Retains supplied freeform answers, produces requested counts, explicit human review |
| Melissa Rigby | Delivery | Milestone and specialist dependency draft | Local packet ready; external assignment and authority confirmed before activation |

Start with Jason's lead desk. One Slack app named Momentum Workmate, with explicit mode names; these are dedicated roles sharing a governed runtime, not five independent human identities. Agent-to-agent requests use a local work queue and reference evidence IDs. No open-ended Slack bot conversations. Promote another mode only after its own examples pass review.

## Exact first pilot boundary

- Workspace: momentum3d, T066HGS7N, independently read back September 13. The new app must additionally prove its own bot identity in this team before connecting.
- Input/possible future response channel: #360leads, C05R2B1ULF6. Initially invoked only by a human mention. No autonomous channel-wide harvesting.
- CRM: momentum-360 / jason-momentum / portal50612503, read-only. Conversations read is currently denied403; contacts and tasks work. Conversation scopes are not needed for the first pilot.
- Existing automations:379667050 source,365085675 companion. Preserve companion's existing unpublished draft. Follow zapier-live-verification.md for exact mapped-field repair proposal.
- First preview: redacted review for contact247699043386, existing owner84251079, campaign2026 Suspension Ads, existing HIGH NOT_STARTED task116697661742. Suggest owner review of that existing task; do not create another task. Second record has HIGH IN_PROGRESS task116694308362, so the same generic follow-up suggestion is inappropriate. All statuses are as of live-crm-snapshot.json readAt.
- Draft output retains source reference, read timestamp, missing provider event mapping and unknown contact response status. No claim that absence of associated calls means no one contacted the lead.

## Proposed Slack access

The companion slack-app-manifest.draft.json is a minimal Socket Mode mention bot manifest, not a running app. Bot scopes: app_mentions:read receives directed requests; channels:history reads permitted public-channel context; chat:write replies after activation approval. These scopes are not channel-specific: runtime must enforce C05R2B1ULF6. No chat:write.public, private-channel/DM history, broad user token, or new CRM write grant. Socket Mode also requires a separately issued app-level connections:write token in a secret store, never a repository.

Manifest syntax follows [Slack app manifest reference](https://docs.slack.dev/reference/app-manifest/). This ordinary mention pilot does not yet declare Slack's native agent interface; agent session features are a later optional step described in platform-research.md and [Slack agent quickstart](https://docs.slack.dev/ai/agent-quickstart/). No fake endpoint or unimplemented agent event subscriptions.

More channel access: inventory public channels visible to the approved identity first; public channels not joined can already be discoverable. Private channels require a channel member/admin invitation and matching approved app scope. Real-time search can offer permission-aware discovery, but it does not bypass access or transfer Dillon's connector permissions to a new app. Request specific channels and business purposes; do not request blanket private history.

## Remaining implementation before install

The current receiver lives in `lead-agent/slack_shadow_receiver.py`, with checks in `lead-agent/shadow_receiver_test.py`. It wraps the existing adapter with signed HTTP and official SDK Socket Mode entry points, exact Momentum identity restrictions, persistent event/delivery records, and stop state. `slack-receiver/receiver.py` is the earlier offline prototype, retained for history and not the deployment target. See the current receiver README for supported commands and exact capabilities; local tests do not establish live delivery.

Remaining: approve creation/installation of Momentum Workmate, validate the manifest through the actual Slack installation route, and place real app/bot credentials in a protected external store. No Workmate app was visible in the September 13 inventory. The existing Momemtum Webhook app is not this receiver. Workspace and channel are already known; app and bot IDs must come from the new installation, never demo IDs. Review the exact first payload and authorize a controlled #360leads delivery only when the installed sender is ready.

## Cost and release controls

Current local adapter/model runtime API cost: zero paid API calls (Codex coordinator/worker usage still applies). Use one Luna worker at a time; do not rescan Slack archives. Deterministic extraction/reconciliation before model use. Proposed future pilot ceiling: max20 human-invoked tasks/day, one bounded routine model call/task, no recursive delegation, no background heartbeat. Dollar budget remains0 until Dillon approves a specific API spend cap and the runner can enforce it before dispatch. No claimed token-to-dollar conversion for Codex model aliases.

## Concrete approval boundary

Complete local code and tests before requesting installation. New app credentials can only be issued through that external installation route; do not claim that missing credentials are a local code task. Installation approval covers only the named workspace/scopes. A controlled test post and any Zap publication require their own concrete payload/change review unless explicitly authorized together. The companion draft must be preserved before any approved edit.

After approval, prove a controlled positive Slack receipt, duplicate retry producing no second delivery, same-contact second inquiry preserved, stop preventing dispatch, wrong-team/channel rejection, and crash recovery from an uncertain send without blind resend. Only then enable bounded use. Rollback disables receiver/dispatch and revokes only new app access; retain receipts; leave existing automation versions intact until separately approved.
