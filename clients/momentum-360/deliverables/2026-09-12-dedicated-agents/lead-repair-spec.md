# Lead-context repair specification
State: DRAFT. September 12, 2026. Owner: Jason sales agent; campaign support: Melissa marketing agent; implementation: scoped systems worker.

Evidence: [September 10 thread](https://momentum3d.slack.com/archives/C05R2B1ULF6/p1789058361970009) explains a Meta-to-HubSpot automation triggering a second generic HubSpot-to-Slack notification. Source Zap reference 379667050 appeared in the reviewed channel. The other automation ID and both current configurations are unverified.

## Desired record
Each sales work item carries source system, provider event/lead ID, event occurrence time, exact HubSpot portal 50612503, CRM record ID, campaign/ad/form identifiers where supplied, intake route, accountable owner, next action, due time, latest activity, and source/readback locator. Missing fields are explicit, never generated from assumptions. No raw lead identity is needed in this review specification.

## Identity and reconciliation
1. Retries of one provider event are deduplicated by exact source system plus event ID.
2. A CRM-created notification and its original lead notification refer to the same inquiry only when a verified integration mapping links their source-event ID and CRM record. Contact ID alone is not enough: the same person may submit a new inquiry later.
3. If the link is unavailable, hold a possible-duplicate review item. Do not silently discard either lead based on a similar name, timestamp or summary.
4. Preserve the richest verified campaign fields. A generic blank Source field must not erase known attribution.
5. One accountable owner acknowledges each inquiry. Multiple notifications may be evidence for one work item. Distinct inquiries remain distinct.
6. Proposed next actions remain drafts until exact CRM/task write authority exists. Slack reactions and a bot's success text do not prove a CRM update.
7. The coordinator keeps a durable delivery ledger at the real integration boundary. The offline replay's deterministic packet IDs are not that ledger.

## Small acceptance matrix
| Input | Required result |
| --- | --- |
| Same provider event delivered twice | One inquiry task; retry receipt retained |
| Meta lead then mapped CRM-created event | One inquiry task with campaign context preserved |
| Same CRM contact, new provider lead/event | Two inquiries, unless a verified business rule says otherwise |
| No stable event/CRM relationship | Explicit review, no silent merge |
| Owner missing | Explicit owner gap, no invented assignment |
| Provider read fails or token expires | Stale/unverified state, no successful-sync claim |
| Previous task resolved with verified evidence | Suppress stale reminder; new inquiry remains eligible |
| Send succeeds but receipt write fails | Reconcile provider message/event before retry; avoid blind resend |
| Bot message emitted | Does not trigger fresh agent work without explicit handoff identity |
| Human stop | Cancel execution and prevent pending send; preserve resumable draft |

## First provider inspection
Locate both actual Zaps under the correct Momentum account. Inspect triggers, filters, mapped source fields, CRM creation logic and sample task histories read-only. Confirm whether September 10 remediation already changed them. Compare the current mappings to this specification before producing a minimal patch. Do not execute a Zap test that might create a CRM record or send Slack merely to inspect it.

The change is ready for review when those exact current mappings, a minimal patch, rollback, approved test destination and controlled sample are attached. This file alone is not a production-ready provider patch.
