# Momentum review handoff

State: staged. Use the existing client-operations and dedicated-agent package; this is a bounded addition, not a replacement service.

1. Resolve canonical client and exact source account. Keep shared Replenish/Fresh campaigns partitioned. Quarantine unknown campaigns; never use the cancelled KJB account. Preserve Align and BigOrange separation.
2. Read the latest client decision, current provider state and existing completed artifact. Record source time and observation time separately. A Slack statement is testimony until a system readback or delivery receipt supports it.
3. Apply deterministic checks first: source freshness, known brand, exclusion status, exact ID, duplicate event, arithmetic, matching reporting windows and approved state. Do not pay a model to add numbers or identify an already excluded term.
4. Give Jev only a minimal, sanitized, task-specific packet for a typed decision. Do not give it full Slack history, credentials or customer medical/legal/financial data. Low confidence, unknown label, disagreement, contradictory evidence or missing input stays in review.
5. Frontier review resolves the difficult cases and records the reason. Classification is separate from action: competitor does not mean exclude, conversion does not mean qualified lead, published tag does not mean successful delivery, and a paused Search campaign does not prove the whole account is paused.
6. Produce the exact proposed change with account/object ID, before/after, evidence, expected result and rollback. Follow the existing send/publish/spend/MFA/destructive/client-message boundaries. The current files are drafts and cannot execute changes.
7. After an authorized execution, read back provider state and the business outcome. Record the receipt or retain partial/blocked state. Do not mark a task complete from a successful tool call alone.

## Existing components to reuse

- client-operations registry/clients.json for identity; this audit proposes corrections but does not mutate the registry.
- September 12 dedicated-agent package's lead-agent match-back and review contracts for lead identity, owner and next action.
- Existing Jev verify-claims.mjs for claim/evidence checks after a task is finished; the UI chooser remains restricted to supplied UI actions.
- Existing Momentum Answers FAQ source/receipt flow, verified in the September 15 Slack thread. No duplicate bot or scheduler.

## Local commands

Run from this folder:

```powershell
node benchmark.mjs
& 'C:\Users\dillo\AppData\Local\Dillon\GoogleAdsProbe\.venv\Scripts\python.exe' summarize.py
& 'C:\Users\dillo\AppData\Local\Dillon\GoogleAdsProbe\.venv\Scripts\python.exe' validate.py
```

The benchmark is intentionally fixed to the dated 200-row experiment. It is not a production worker. A new client batch needs its own fresh source, minimal context and reviewed rubric; do not silently reuse these historical results. The live flag is optional and billable; completed rows are resumed from receipts. Preserve original receipts before changing a model configuration.

## Promotion decision

Search sorting is recommended only as an advisory candidate. Before unattended use, test against independently reviewed labels across actual client services, measure harmful false exclusions, capture business outcomes, and confirm API cost/availability. Do not turn the uncalibrated 0.90 threshold into a statistical accuracy claim. The other six lanes remain unbenchmarked. Existing production approvals remain in force.
