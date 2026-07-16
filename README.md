# Client Operations

This is the canonical client operating system for Codex. It connects client names, aliases, domains, contacts, Slack channels, access references, communications, and deliverables without storing secrets.

## Marketing Chief control surface

The Marketing Chief operating loop is running as a manual pilot. Open `CONTROL.md` first. Dillon uses one pinned Marketing Chief task for priorities, approvals, risks, reviewable artifacts, and continuation. Internal workers remain invisible implementation details.

- `queue/work-items.json`: canonical, versioned work state
- `CONTROL.md`: deterministic human-readable projection of the queue
- `state/corrections.jsonl`: append-only, redacted learning ledger
- `state/prediction-outcomes.jsonl`: accept, modify, defer, and reject feedback, created on first use
- `intake/`: redacted, exact-routed observations from background sensors
- `context/`: durable marketing, voice, design, and client-context contracts
- `workflows/marketing-chief.workflow.json`: the executable orchestration contract

The Marketing Chief is the only writer to canonical state during the pilot. Focused workers may research, build, or verify, but they return bounded handoff JSON and never update the queue themselves. Background schedules may only sync safe intake metadata. External delivery and human authentication remain gated.

## Continue contract

In the pinned task, Dillon can say `continue`. The Chief then refreshes safe intake and live health, loads corrections and exact client context, ranks the queue, completes the highest safe local action, reconciles verified worker handoffs, and returns the result plus at most one human-only decision.

### Intake-to-queue contract

Pending intake is not merely summarized. The Chief lists safe metadata with `Get-PendingIntake.ps1`, inspects the exact authorized source behind each exact-routed observation's opaque locator, and verifies the current outcome and active client before queue work is linked or created.

The Chief first searches the canonical queue for exact locator equality in `source.locator` or `evidence.refs`. Exactly one source-bound item is promoted with `Resolve-IntakeObservation.ps1`. If none exists, the Chief rereads the current queue revision, calls `New-MarketingWorkItem.ps1` with `SourceType` set to `intake`, the exact opaque `SourceLocator`, the current `ExpectedQueueRevision`, and a truthfully safe local action class, then promotes the observation to the newly returned work-item ID. Multiple matches are an invariant breach and are never resolved by guessing.

Automatic classes remain limited to read-only verification and local, reversible research, drafting, artifact creation, or testing. A source that requires sending, publishing, deploying, spend, account changes, destructive work, human authentication, or a business decision remains explicitly approval-gated; intake materialization never authorizes the external action. Unsupported, stale, ambiguous, inactive-client, or non-actionable observations are acknowledged or quarantined with a recorded resolution instead of silently disappearing.

Useful local commands:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\Get-NextActions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\Sync-AgentOsIntake.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\Update-AccessCoverage.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\Update-MarketingSystemHealth.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\Update-MarketingControl.ps1 -Check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\Test-MarketingOS.ps1
```

Canonical writes use optimistic queue and work-item revisions, one exclusive lock, same-volume temporary files, deterministic rendering, and rollback backups. New work is captured through `New-MarketingWorkItem.ps1`; existing work changes through `Update-MarketingQueue.ps1`; bounded worker results are validated by `Test-MarketingHandoff.ps1` and reconciled by `Accept-WorkerHandoff.ps1`.

Prediction outcomes are recorded through `Record-MarketingDecision.ps1`. Voice, design, routing, process, context, and prediction lessons are appended only through the locked and redaction-validating `Record-MarketingCorrection.ps1`.

`CONTROL.md` is regenerated automatically inside those locked mutations. A standalone repair render requires `-ExpectedQueueRevision`; `-Check` is the safe direct status command. `Get-NextActions.ps1` is read-only and never patches the control file.

## Structure

- `registry/clients.json`: canonical client and alias index
- `clients/<client-id>/`: stable home for each client
- `scripts/Resolve-Client.ps1`: resolve a name, alias, domain, or contact
- `scripts/Test-ClientRegistry.ps1`: validate IDs, folders, and safe schema
- `.codex/environments/environment.toml`: safe setup and routing actions

The current registry is based on a live communication scan covering 463 Gmail message records observed between June 2 and July 15, 2026, existing verified HubSpot routes, and Slack-draft evidence. Gmail pagination back to April 16 is still in progress. Complete Slack channel and DM enumeration is blocked until the Slack connector receives channel, private-channel, group-DM, and DM read scopes.

## Routing policy

When a client or alias is named, resolve it first:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\Resolve-Client.ps1 -Name "KJB"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\Resolve-Client.ps1 -List
```

One client gets one canonical folder. New work belongs there unless the match is ambiguous or the client is not active. `Resolve-Client.ps1` rejects a blank resolution request, requires `-List` for inventory mode, returns only the minimal routing fields, and returns `blocked-inactive-client` with exit code `3` for a unique `needs-confirmation` match. Callers must require `status: resolved`, not merely exit code `0`, before client work begins.
