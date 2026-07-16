# Client Operations Rules

- Resolve every client through `registry/clients.json` before creating or updating client-specific work.
- Use the global `client_router` specialist for names, aliases, contacts, domains, or Slack channels that need routing.
- Put client-specific work in `clients/<client-id>/`. Do not create another dated client home when a canonical folder exists.
- Keep clients, brands, channels, accounts, reports, and metrics separate. Cross-client summaries must preserve client-level source attribution.
- Communication history supplies context but does not authorize sending, publishing, spend, or live-system changes.
- Store only non-secret access references. Resolve credentials through Access Broker or Bitwarden; never put passwords, tokens, cookies, one-time codes, or recovery material in this repository.
- Treat `needs-confirmation` records and ambiguous aliases as blockers to writing client state.
- Prefer one owner, one next action, and one current status per client outcome.

## Marketing Chief manual pilot

- `queue/work-items.json` is the canonical machine state. `CONTROL.md` is its human-readable projection. `state/corrections.jsonl` is append-only learning state.
- Load `context/marketing-context.md`, `context/DILLON_VOICE.md`, and `context/DESIGN_STANDARD.md` before planning consequential marketing work. Then load the exact client's context and current source evidence.
- When Dillon says `continue`, refresh redacted intake and live system health, inspect and materialize exact-routed pending intake through the intake-to-queue contract below, rank the queue, execute the highest safe automatic action within WIP limits, reconcile verified handoffs, and surface at most one human-only decision.
- Use `scripts/Get-NextActions.ps1` for ranking, `scripts/Update-MarketingControl.ps1` for deterministic projection, `scripts/Test-MarketingHandoff.ps1` for validation, and `scripts/Accept-WorkerHandoff.ps1` for versioned reconciliation. Do not manually make `CONTROL.md` disagree with the queue.
- Record Dillon's accept, modify, defer, or reject response to a predicted action with `scripts/Record-MarketingDecision.ps1`. Record redacted voice, design, routing, process, context, and prediction deltas only through the locked `scripts/Record-MarketingCorrection.ps1`; never append that ledger manually. Read the mixed legacy-v1/current-v2 ledger through `scripts/Get-MarketingCorrections.ps1`, which validates and normalizes every line.
- The Marketing Chief is the sole canonical-state writer during the manual pilot. Workers must not edit those three files.
- A client work item may advance only when its registry record resolves uniquely and has `status: active`. A match to a `needs-confirmation` record remains quarantined even if the resolver reports a name match.
- Increment the queue root `revision` and the changed work item's `version` on every accepted mutation, then regenerate `CONTROL.md` from the queue.
- Canonical updates must be atomic and reversible. Preserve a backup before replacement and reject stale writes.
- Store redacted summaries and source locators, never raw message bodies, credentials, cookies, codes, or unnecessary PII.
- Before marking a password-required client task blocked, validate Access Broker, resolve the exact Bitwarden `bw://` locator, and attempt the supported autofill, passwordless, or passkey route in persistent Chrome. Raw vault values never enter canonical state. MFA, one-time codes, recovery, and provider consent remain human handoffs.
- Automatic work is limited to local, reversible research, drafting, artifact creation, testing, verification, and state updates. External delivery, publishing, deployment, spend, account changes, and destructive actions still require explicit approval.

Workers return one bounded JSON handoff to the Chief with: `schemaVersion`, a path-safe `handoffId`, `workItemId`, `expectedWorkItemVersion`, `clientId`, `workerRole`, `status`, `startedAt`, `finishedAt`, `summary`, `artifacts`, safe locator-only `evidence`, `verification`, `assumptions`, `risks`, `privacy` set to `redacted`, `containsSecrets`, `containsDirectIdentifiers`, and `containsRawCommunications` all set to `false`, `approvalGate`, `proposedTransition`, `canonicalWriteAttempted`, and `externalActionAttempted`.

Handoffs are limited to 20 KB, 10 artifacts, 10 evidence entries, 10 verification checks, 5 assumptions, and 5 risks. Worker status and proposed transition must agree with the queue transition matrix; a worker cannot bypass a pending approval or mark failed or blocked work complete. The Chief rejects a handoff when the work-item version is stale, the client is unresolved or inactive, an artifact escapes the intended project boundary, a locator is unsafe, evidence is insufficient, direct identifiers, secrets, or raw communications are included, or an external action lacks recorded approval. Reconciliation rechecks these rules under the canonical lock and enforces separate normal and emergency WIP limits.

Background Gmail and Slack mechanisms are sensors only. They may write redacted, deduplicated observations under `intake/` through `scripts/Sync-AgentOsIntake.ps1`; they may not create Codex tasks, send completion notifications, or mutate the canonical queue.

## Intake-to-queue Chief contract

- After syncing intake, list pending observations with `scripts/Get-PendingIntake.ps1 -TriageState pending -AsJson`. For each exact-routed pending observation, retain its returned `indexGeneratedAtUtc`, inspect the exact authorized source behind that observation's opaque `sourceLocator`, and verify the requested outcome and active client route before changing canonical state. Redacted intake metadata alone is not enough to invent an outcome.
- Search `queue/work-items.json` for the exact `sourceLocator`, requiring exact equality with either `source.locator` or one entry in `evidence.refs`. If exactly one non-cancelled, correctly routed canonical work item is bound to that source, link that exact item with `scripts/Resolve-IntakeObservation.ps1 -Action promote`; never link by client, topic, or semantic similarity alone.
- If no source-bound canonical work item exists and the inspected source supports an actionable outcome, reread the current queue `revision` immediately before the write and call `scripts/New-MarketingWorkItem.ps1` with `-SourceType intake`, the exact opaque `-SourceLocator`, that `-ExpectedQueueRevision`, and a truthful action class. Use `read_only_verification`, `local_research`, `local_draft`, `local_artifact`, or `local_test` only for a genuinely local, reversible next step. Then promote the observation with `scripts/Resolve-IntakeObservation.ps1`, using the newly returned work-item ID and the retained intake generation timestamp.
- If the requested next step is external delivery, publishing, deployment, spend, an account change, destructive work, human authentication, or a business decision, do not disguise it as a safe automatic class. Use the correct approval-gated class and pending explicit approval, or create only a genuinely local preparatory step. Do not perform the gated action while materializing intake.
- If multiple work items claim the same source locator, the source is unavailable, the outcome is not current, or the client route is ambiguous or inactive, do not guess. Record the supported acknowledge or quarantine resolution, or surface the invariant breach for repair. A stale queue revision or intake generation timestamp must be refreshed rather than overridden.
