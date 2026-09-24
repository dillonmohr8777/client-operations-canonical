# Momentum dedicated agents: review package

State: STAGED. This package connects the evidence, the first local implementation, and the remaining deployment work. It does not claim that Momentum's operational problems are resolved or that new employees/bots are live.

## Start here

1. [Organization plan](MOMENTUM-ORG-PLAN.md): executive operating model, owner responsibilities, rollout sequence, acceptance gates and cost policy.
2. [First useful lead review](lead-review-preview.md): two redacted CRM examples with actual owner, campaign and different existing task states.
3. [Live automation finding](zapier-live-verification.md): exact current source and companion Zaps, blank-source root cause, published versions and safe repair sequence.
4. [Runnable local adapter](lead-agent/README.md): Python/SQLite processing, persistent inquiry and draft records, bounded CRM snapshot enrichment. Synthetic transport events are labelled; live provider subscriptions are not implemented.
5. [Activation package](ACTIVATION.md): dedicated responsibilities, exact initial channel and scopes, delivery acceptance, cost limits and rollback. [Slack manifest](slack-app-manifest.draft.json) is draft JSON only. The current receiver is [lead-agent/slack_shadow_receiver.py](lead-agent/slack_shadow_receiver.py). The earlier `slack-receiver` prototype is retained as historical work, not a second deployment target.
6. [Five-mode shadow runtime](org-modes/README.md): reusable local packets for Jason, Sean, Mac, Melissa Silber and Melissa Rigby, generated from existing contracts and evidence.
7. [Original evidence report](REPORT.md), [coverage](coverage.json), [role contracts](agent-contracts.json) and [offline role replay](PILOT.md) retain the wider organizational investigation. The 2026 search had remaining pages; this is not a claim to have read every message.

## Practical sequence

The first operational change should repair the current blank-source lead template and establish reliable inquiry identity. Building more agents on top of ambiguous duplicate alerts would spread the same defect. The local adapter keeps uncertain matches for review and preserves separate new inquiries.

The scoped Slack receiver and five-mode packets are built locally. Workspace T066HGS7N and channel C05R2B1ULF6 were verified September 13. A new Workmate installation and its protected app/bot credentials remain pending. Use [the September 13 closeout](STACK-CLOSEOUT-2026-09-13.md) for current acceptance results and automation ownership.

Promote roles in this order: Jason lead desk, Sean operational decisions, Mac reconciled reporting, Melissa production support. Both Melissa identities already have separate local packets. Confirm external assignment and authority only when activating that role. Each role needs bounded inputs, an owned outcome, a stopping rule, evidence of completion and a clear escalation destination.

## Remaining dependencies

- One existing source Zap event now has independently checked provider-to-CRM-to-Slack proof in [the receipt](provider-linkage-receipt-2026-09-13.json). The new Workmate path still needs its own delivery and retry acceptance.
- CompanionZap365085675 has an existing draft that must be reconciled with its owner before publishing changes.
- Live Slack installation consent, verified workspace/app/bot/user IDs, restricted secret store, manifest validation and approved first delivery. The local receiver core cannot post by itself.
- Actual send receipt ledger, retry/uncertain-send test and a positive Slack readback before enabling future delivery.
- Any paid API budget approved and enforced before dispatch; none spent by this package's runtime.
- Daily health now defaults to deterministic local checks and a dated receipt, before any model or sender. The legacy external branch requires explicit `-LiveDelivery` and remains unexercised. Provider/browser access gaps still prevent a claim of full external health.

No broad Slack rescan, new repository clone, historical CRM rewrite, paid runtime model job, or external message was used. Exact scheduler repairs and consolidation are documented in the closeout. Codex session and worker usage still apply.
