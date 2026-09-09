---
date: 2026-07-26
client: momentum-360
workItemId: wi-20260726-0001
status: graph-blocked-unsafe-source-locator
external_changes: none
---

# Reporting package episode blocker

## Observation

`New-MarketingExecutionGraph.ps1` rejected `wi-20260726-0001` because `source.locator` and matching evidence refs use a non-canonical `user://` scheme. That scheme fails `Test-MarketingSafeLocator`, so a version-bound execution graph cannot be created for the item as written.

## Safe replacement binding

Use the already-committed canonical contract path:

- `clients/momentum-360/deliverables/2026-07-26-paid-media-reporting-contract.md`
- `clients/momentum-360/deliverables/2026-07-26-paid-media-reporting-contract.json`
- `state/paid-media/daily-review-2026-07-26.json`

## Boundaries

- No platform mutation, send, publish, deploy, or spend change was attempted.
- Fresh eight-lane platform appendices remain required before any client-facing packet can pass the acceptance checklist.
