# Decision Packet: Zapier Lead Notification Match-Back Repair

Status: PREPARED, APPROVAL-GATED
Prepared: 2026-09-14
Client route: momentum-360
Owner decision: Dillon

## Decision Needed

Approve the narrow repair to Momentum's companion lead-alert Zap `365085675` so future Slack lead notifications include source, campaign, owner, and a verified HubSpot contact link instead of ending with an empty `Source =`.

Recommended answer:

> Approve the narrow companion Zap repair for `365085675`. Preserve the existing draft, capture before and after mappings, do not replay historical runs, do not change Zap `379667050`, and do not send client messages.

## Why This Is The Blocker

The approval queue labels this as the unlock behind 13 broken match-back promises: 9 Omega, 2 KJB, 2 Onsite, plus the Fresh Blends deck. Current evidence says the problem is upstream Zap payload shape, not downstream report writing.

The source-specific Meta Zap `379667050` can carry campaign and HubSpot link evidence. The generic companion Zap `365085675` is also ON, but its published and draft Slack templates end with a literal empty `Source =` and no CRM link. That creates duplicate or ambiguous lead alerts that cannot be reconciled reliably.

## Approved Scope If Dillon Says Yes

1. In Zap `365085675`, preserve all existing default HubSpot trigger properties.
2. Add `utm_source`, `utm_campaign`, and `hubspot_owner_id` to the trigger additional-properties list.
3. Update the Slack template to render missing source, campaign, or owner as `Unknown`, never blank or inferred.
4. Add the HubSpot portal link using `hs_object_id` for portal `50612503`.
5. Capture pre-edit and post-edit mappings and keep rollback to the edited fields only.

## Explicitly Not Approved By This Packet

No historical run replay.
No Zap publish until the reviewed change is ready and approval still covers the exact version.
No edits to source Zap `379667050`.
No `Facebok` to `facebook` spelling change in historical data.
No client messaging.
No spend, account ownership change, permission expansion, or credential exposure.
No normal Workmate delivery enablement.

## Acceptance Check After Approval

1. Published and draft `365085675` mappings are captured before editing.
2. One approved synthetic inquiry produces one Slack alert with source, campaign, owner, and CRM link.
3. A retry of the same synthetic inquiry does not produce a duplicate action.
4. A second same-contact inquiry remains distinct and produces its own reviewable record.
5. Evidence maps provider event ID to HubSpot record ID to Slack timestamp.
6. Slack readback confirms the alert content from the actual destination.

## Evidence Read

- `C:\Users\dillo\repos\dillon-os\System\approval-queue.md`, 2026-09-14 item: "THE UNLOCK FOR EVERY MATCH-BACK PROMISE"
- `clients\momentum-360\deliverables\2026-09-12-dedicated-agents\zapier-live-verification.md`
- `clients\momentum-360\deliverables\2026-09-12-dedicated-agents\zap-repair-review-2026-09-13.md`
- `clients\momentum-360\deliverables\2026-09-12-dedicated-agents\provider-linkage-receipt-2026-09-13.json`
- `C:\Users\dillo\repos\dillon-os\12_Brain\03_Concepts\2026-09-07 - Conversion match-back is the differentiator.md`

## Current Gaps

The live Zapier editor was not opened in this run, and no provider mutation was attempted. The packet is based on current local evidence and the approval queue readback. Before editing, re-open Zapier in the Codex in-app browser and capture the exact current draft and published mappings.
