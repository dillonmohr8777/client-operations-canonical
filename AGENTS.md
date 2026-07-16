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
- The Marketing Chief is the sole canonical-state writer during the manual pilot. Workers must not edit those three files.
- A client work item may advance only when its registry record resolves uniquely and has `status: active`. A match to a `needs-confirmation` record remains quarantined even if the resolver reports a name match.
- Increment the queue root `revision` and the changed work item's `version` on every accepted mutation, then regenerate `CONTROL.md` from the queue.
- Canonical updates must be atomic and reversible. Preserve a backup before replacement and reject stale writes.
- Store redacted summaries and source locators, never raw message bodies, credentials, cookies, codes, or unnecessary PII.
- Automatic work is limited to local, reversible research, drafting, artifact creation, testing, verification, and state updates. External delivery, publishing, deployment, spend, account changes, and destructive actions still require explicit approval.

Workers return one bounded JSON handoff to the Chief with: `schemaVersion`, `handoffId`, `workItemId`, `expectedWorkItemVersion`, `clientId`, `workerRole`, `status`, `startedAt`, `finishedAt`, `summary`, `artifacts`, `evidence`, `verification`, `assumptions`, `risks`, `approvalGate`, `proposedTransition`, `canonicalWriteAttempted`, and `externalActionAttempted`.

Handoffs are limited to 20 KB, 10 artifacts, 10 evidence entries, 10 verification checks, 5 assumptions, and 5 risks. The Chief rejects a handoff when the work-item version is stale, the client is unresolved or inactive, an artifact escapes the intended project boundary, evidence is insufficient, secrets or raw communications are included, or an external action lacks recorded approval.
