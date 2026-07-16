# Canonical Agent OS intake

This directory is the redacted observation surface between the prepare-only Agent OS sensors and the Marketing Chief. It is actionable without copying message content into canonical state.

## Safety contract

- The sync reads only `runs/<safe-run-id>/task.json`. It never opens message bodies, email exports, contact files, deliverables, or other run artifacts.
- Only task routing metadata is inspected. Raw client labels, aliases, event keys, requested outcomes, email addresses, phone numbers, contacts, message content, credentials, tokens, codes, and recovery material are never written or printed.
- `requested_output` is normalized only in memory and contributes only to a SHA-256 semantic fingerprint.
- Every retained observation has a retrievable opaque locator shaped like `agent-os-run:<safe-run-id>/task.json`. The locator lets the Chief deliberately load the authorized source run on demand; it does not expose the content in intake.
- Client routing is exact against `registry/clients.json`. Only uniquely matched `active` clients enter `pending`; unresolved, ambiguous, inactive, mixed-client, or known false routes enter `quarantined`.
- Intake never creates Codex tasks, sends notifications, sends messages, publishes content, executes deliverables, or mutates `queue/work-items.json` or `CONTROL.md`.
- `Sync-AgentOsIntake.ps1` and `Resolve-IntakeObservation.ps1` share the named `Global\CodexMarketingOsIntakeV2` mutex. They fail safely after at most 45 seconds instead of racing a read, merge, or atomic replacement.

## Lifecycle

Each observation has one of four states:

- `pending`: exact active client route awaiting triage.
- `quarantined`: unresolved or deliberately held observation.
- `resolved`: linked to an existing canonical client work item through `promotedWorkItemId`.
- `acknowledged`: reviewed and intentionally closed without creating or linking work.

The resolver validates the canonical registry and queue under the mutex, requires the index generation timestamp as an optimistic concurrency guard, and never creates a work item itself.

## Recurrence-safe deduplication

An exact source occurrence is retained once. A matching semantic outcome is suppressed only while an open `pending` or `quarantined` observation exists inside the configured 72-hour window. Resolved, acknowledged, or later recurring weekly requests are not permanently suppressed.

Schema version 1 records are migrated by matching their legacy SHA-256 source reference to an existing safe run folder. A legacy record without a retrievable source is excluded from version 2 and counted as `migrationUnresolved`; it is never converted into a fake locator.

## Commands

Preview or synchronize the current safe window:

```powershell
& .\scripts\Sync-AgentOsIntake.ps1 -DryRun
& .\scripts\Sync-AgentOsIntake.ps1
```

List safe pending and quarantined metadata. The returned `indexGeneratedAtUtc` is the resolver concurrency token:

```powershell
$pending = & .\scripts\Get-PendingIntake.ps1
$pending.items | Format-Table intakeId, clientId, route, triageState, sourceLocator
```

Link an observation to an existing canonical work item:

```powershell
& .\scripts\Resolve-IntakeObservation.ps1 `
  -IntakeId $pending.items[0].intakeId `
  -Action promote `
  -WorkItemId 'wi-20260715-0001' `
  -ExpectedIndexGeneratedAtUtc $pending.indexGeneratedAtUtc
```

Acknowledge it without promotion, or quarantine it with a controlled reason:

```powershell
& .\scripts\Resolve-IntakeObservation.ps1 -IntakeId $id -Action acknowledge -ExpectedIndexGeneratedAtUtc $generation
& .\scripts\Resolve-IntakeObservation.ps1 -IntakeId $id -Action quarantine -QuarantineReason manual-quarantine -ExpectedIndexGeneratedAtUtc $generation
```

Use `-WhatIf` on the resolver to validate a transition without writing. The old poll runner calls the sync only after a successful `-PrepareOnly` poll.
