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
- `workflows/communication-triggered-ad-launch.workflow.json`: Gmail, Slack, or user request to terminal launch contract

The Marketing Chief is the only writer to canonical state during the pilot. Focused workers may research, build, or verify, but they return bounded handoff JSON and never update the queue themselves. Background schedules may only sync safe intake metadata. External delivery and human authentication remain gated.

## Continue contract

In the pinned task, Dillon can say `continue`. The Chief then refreshes safe intake and live health, loads corrections and exact client context, ranks the queue, completes the highest safe local action, reconciles verified worker handoffs, and returns the result plus at most one human-only decision.

### Graph-backed execution

Nontrivial automatic work now runs through a persistent, version-bound execution graph under `state/execution-graphs/<work-item-id>/<graph-run-id>/`. The graph connects the exact queue item, active client, source evidence, artifacts, approval boundary, worker step, one verifier per definition-of-done check, bounded handoff, and Chief reconciliation. It improves context continuity, provenance, restartability, and QA without becoming another queue.

The graph is prepare-only evidence. It cannot mutate `queue/work-items.json`, write durable memory, authorize external action, or replace `Accept-WorkerHandoff.ps1`. Exact queue and work-item versions remain authoritative, and semantic retrieval can suggest context but cannot bind work.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\New-MarketingExecutionGraph.ps1 -WorkItemId <wi-id> -ExpectedQueueRevision <revision> -ExpectedWorkItemVersion <version>
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\Test-MarketingExecutionGraph.ps1 -GraphPath <state\execution-graphs\...\execution-graph.json>
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\Update-MarketingExecutionGraph.ps1 -GraphPath <graph.json> -ExpectedGraphRevision <revision> -NodeId <ready-node> -Status completed -Actor <role> -Summary <safe-summary>
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\New-MarketingGraphHandoff.ps1 -GraphPath <graph.json> -ExpectedGraphRevision <revision> -WorkerRole <role> -Status completed -ProposedTransition <transition> -Summary <safe-summary>
```

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

Prediction outcomes are recorded through `Record-MarketingDecision.ps1`. `Get-NextActions.ps1` applies an intentionally small learned prior only after three cross-item outcomes match the same client, prediction lane, and action class; exact feedback on the current work-item version and action still controls suppression or replacement. `Get-PredictionLearning.ps1` shows which patterns have enough evidence to be active. Voice, design, routing, process, context, and prediction lessons are appended only through the locked and redaction-validating `Record-MarketingCorrection.ps1`.

`CONTROL.md` is regenerated automatically inside those locked mutations. A standalone repair render requires `-ExpectedQueueRevision`; `-Check` is the safe direct status command. `Get-NextActions.ps1` is read-only and never patches the control file.

## Communication to terminal ad launch

An exact current-client Gmail, Slack, or direct user request can now trigger the whole paid-media deliverable chain: location interpretation, landing-page reuse or build, creative and copy, conversion tracking, UTMs, campaign and ad-group manifests, provider validation, paused creation, enablement, live readback, and observation. The durable contract is `workflows/communication-triggered-ad-launch.workflow.json`.

Current platform eligibility lives only in `registry/paid-media-roster.json`. Google Ads has five exact client lanes: KJB, Replenish, Omega, Onsite, and Fresh Blends for Kwik Trip Ice Box campaigns. Meta Ads has three: Fagan, Shadow Heating, and KJB. Persistent Chrome live-verified every Google child-account mapping on July 16. KJB Google is enabled, not paused; the cancelled KJB duplicate is excluded. The observed Fresh Blends Ice Box campaigns remain paused unless a fresh exact-account readback proves otherwise.

The terminal entry points are:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\New-AdLaunchRequest.ps1 <exact redacted request parameters>
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\Invoke-AdLaunch.ps1 -RequestPath <request.json> -Mode Plan
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\Invoke-AdLaunch.ps1 -RequestPath <request.json> -Mode Validate -ProviderPacketPath <work\...\provider-packet.json>
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\Invoke-AdLaunch.ps1 -RequestPath <request.json> -Mode CreatePaused -ProviderPacketPath <work\...\provider-packet.json>
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\Invoke-AdLaunch.ps1 -RequestPath <request.json> -Mode Enable -ProviderPacketPath <work\...\provider-packet.json>
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\Invoke-AdLaunch.ps1 -RequestPath <request.json> -Mode Readback -ProviderPacketPath <work\...\provider-packet.json>
```

The redacted request is canonical client state and is bound to the exact per-client, per-platform blueprint under `clients/<client-id>/paid-media/blueprints/`. Exact provider arguments and account identifiers stay in the ignored `work/` runtime area. Every provider packet is phase-restricted: validation requires validate-only operations, paused creation rejects enabled or removal operations, enablement accepts updates only, and remove/delete tools are prohibited.

The client authority file is the one-time operating envelope. It must name the exact requester route, platform account reference, allowed trigger and location scopes, deployment environments, budget ceilings, location ceiling, permissions, QA requirements, approval evidence, and expiration. A draft file still lets the Chief build and QA locally but cannot deploy, create provider objects, enable campaigns, or spend.

Mia is deliberately not one blended route. The Replenish address maps to `replenish-7-eleven`; the Fresh Blends address maps to `fresh-blends-kwik-trip`. Fresh Blends owns the Kwik Trip Ice Box campaign lane. A generic name match is insufficient, and the two clients' locations, landing pages, campaign states, accounts, assets, conversions, and budgets never cross even when the provider displays them inside one child account.

The daily optimization workflow runs once per America/New_York day during the Marketing Chief `continue` contract. It reviews every roster lane for account/session state, delivery and pacing, tracking and deduplication, landing-page health, search terms or creative fatigue, placement quality, change history, and readback freshness. It never creates a competing queue or changes a provider by itself. Only a material, source-backed finding is promoted into `queue/work-items.json`.

Provider readiness is separate from connection discovery and lives in `state/ad-provider-readiness.json`. As verified on July 16, 2026, persistent Chrome can switch through the authorized Google Ads account list and read all five exact current child accounts. The project now holds opaque account references plus normalized account fingerprints; Replenish and Fresh Blends remain separate routes even though both appear in one child account. Persistent Chrome also live-verified exact Fagan and KJB Meta ad accounts; Shadow is not visible in the current Meta portfolio and remains unmapped. Terminal provider operations and all live mutation are still blocked by incomplete execution coverage and draft-only client authority. Netlify CLI is installed and authenticated for previews, but canonical client landing-page source is unmapped and the current Replenish production host is not mapped to that preview route. `Test-AdProviderReadiness.ps1` therefore keeps live mutation closed while local build and read-only browser review remain available.

## Structure

- `registry/clients.json`: canonical client and alias index
- `registry/paid-media-roster.json`: exact current Google Ads and Meta Ads eligibility lanes
- `clients/<client-id>/`: stable home for each client
- `scripts/Resolve-Client.ps1`: resolve a name, alias, domain, or contact
- `scripts/Test-ClientRegistry.ps1`: validate IDs, folders, and safe schema
- `.codex/environments/environment.toml`: safe setup and routing actions

The current registry contains 20 records: 18 active clients, `zen-spa-tropicana` retained as inactive historical context only, and `revive-systems` quarantined as `needs-confirmation`. The original fully paginated Gmail audit remains the fixed 18-route base across 189 search pages, 2,555 globally deduplicated messages, and 897 distinct threads from July 21, 2025 through July 16, 2026. Two exact-route supplements add the later-promoted clients: Bridge covers 27 messages across 5 threads, and Onsite Concrete & Landscape covers 3 messages in 1 thread. Supplement counts stay separate from the base because a supplement message or thread may also match a base client query; together, the exact-route artifacts cover all 20 current registry routes without inventing a combined mailbox total. BOK Law Firm, AMI Commercial Cleaning, and Cindy May Christmas remain explicitly separate from Momentum 360.

Bridge Software is a real active client, is portfolio rank 1, and requires exact source identity for intake routing. VA Claims Edge is rank 2. The older Bridge incident was an unrelated newsletter packet falsely routed by generic label matching; it was not evidence that the actual Bridge client was fake. Canonical portfolio ordering lives in `state/portfolio-priorities.json`. `Get-NextActions.ps1` applies portfolio value only after exact route and lane eligibility, so rank never bypasses due dates, evidence requirements, approvals, safety gates, or WIP limits. Economics and current client strategy remain incomplete, so inferred ranks below the two explicit priorities are reviewable operating judgments rather than profitability claims.

The redacted Slack audit is complete within the workspace's visible scope. It exhausted cursors across 106 visible conversations, found 1,232 Dillon-authored messages, and produced live evidence for 12 active clients. Public-channel, private-channel, DM, and group-DM read access was verified, and `files:write` passed a live capability probe. No file was uploaded or shared and no Slack write was performed.

## Routing policy

When a client or alias is named, resolve it first:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\Resolve-Client.ps1 -Name "KJB"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\Resolve-Client.ps1 -List
```

One client gets one canonical folder. New work belongs there unless the match is ambiguous or the client is not active. `Resolve-Client.ps1` rejects a blank resolution request, requires `-List` for inventory mode, returns only the minimal routing fields, and returns `blocked-inactive-client` with exit code `3` for a unique inactive or `needs-confirmation` match. Callers must require `status: resolved`, not merely exit code `0`, before client work begins.
