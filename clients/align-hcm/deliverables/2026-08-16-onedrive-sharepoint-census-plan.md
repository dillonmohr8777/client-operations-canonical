# OneDrive and SharePoint File Census — Execution Plan

Date: 2026-08-16 (revised same day after three-lens adversarial review: completeness, feasibility, compliance)
Client route: `align-hcm` (census target is Dillon's alignhcm.com Microsoft 365 tenant; `registry/clients.json` resolves `align-hcm` active with email domain `alignhcm.com`)
Status: prepare-only plan. Execution is blocked on the three Phase 0 gates below.
Boundaries: read-only census. No file is moved, renamed, deleted, or shared by the agent under this plan. This plan does not touch `queue/work-items.json`, `CONTROL.md`, or `state/corrections.jsonl`.

## 1. Purpose

Produce one complete, honestly-bounded census of Dillon's OneDrive and all in-scope SharePoint document libraries, and turn it into an exact, approval-gated move list keyed to the client-file taxonomy from the 2026-08-16 claude.ai working session. The census answers four questions:

1. What exists — per-folder file counts, last-modified dates, and creators/owners where the connector exposes them.
2. What is duplicated — families of the same document living in multiple places, under near-identical names, or (where content evidence is available) renamed copies.
3. What violates client separation — files whose subject client does not match the client folder they sit in, or client material in mixed/unclassified locations.
4. What moves where — one disposition per inventoried item: correctly filed, MoveList row (`move` or `hold`), Quarantine row, `personal — leave in place`, or `internal/template`.

## 2. Execution vehicle

The census runs in a **Claude Code session** (this one or a successor on the same repository), not a plain chat, because the census needs what only this environment provides: durable files for the ledger and inventory, git for checkpointing, scripted aggregation and workbook assembly, and workflow fan-out for parallel sweeps. The Microsoft 365 connector must be toggled on **for that session**.

The connector is Graph-backed and expected to be search/read oriented. The plan therefore assumes **search-mode** as the default method everywhere; folder-walk enumeration is a conditional upgrade used only if the Phase 0 probe proves a folder-listing tool with real pagination exists. No phase may silently assume capabilities the probe did not confirm.

## 3. Binding references

- **The taxonomy.** Produced in a separate claude.ai session on 2026-08-16; not in this repository. Phase 0 obtains it by: (a) Dillon pastes it; (b) Dillon points to the saved file; or (c) the agent retrieves it from the tenant by search. Retrieval stores only the taxonomy content plus a safe source locator — never Outlook/Teams message bodies — as a narrow exception to the Section 4 scope. Dillon confirms the binding copy before any move list is keyed to it, and the MoveList header records which copy was used.
- **Repository invariants that carry over** (`AGENTS.md`): one client, one canonical home; quarantine over guessing; destructive/external actions approval-gated; no secrets, raw communications, or unnecessary PII in this repository.

## 4. Scope

In scope: Dillon's OneDrive for Business, plus the SharePoint sites/libraries on the frozen scope list (Phase 0.2).

Out of scope unless Dillon widens it: Outlook attachments, Teams chat file tabs, recycle bins, version histories (evidence only, not censused), other users' OneDrives, and **sharing-audience auditing** (who can see each file). Sharing-based separation violations are real but unqueryable through a read/search connector; they are recorded here as an explicit exclusion for Dillon to confirm or reassign to an admin-side SharePoint sharing report.

Personal (non-work) files: flagged `personal — leave in place`, never routed into client folders.

## 5. Phases

### Phase 0 — Blocking gates and preflight

1. **Connector gate.** Microsoft 365 `enabledInChat: true` in the executing session; re-authentication by Dillon expected after the token expiry that ended the prior session.
2. **Scope gate.** The site/library denominator cannot be derived from a search-only connector, so it comes from Dillon: a SharePoint admin "Active sites" export or a Site-contents screenshot/list. The connector is used only to spot-check reachability of each named site. The confirmed list is frozen in the coverage ledger.
3. **Queue gate.** Before execution and before any completion-summary commit, the Marketing Chief materializes a truthfully-classed work item (`read_only_verification` / `local_research`) from an authorized writer host (DESKTOP-4AHKEC4 or AHCM-3LCQVF4) under the normal expected-revision rules. This plan is a drafting artifact and never becomes a second queue.
4. **Capability probe.** Enumerate the connector's actual tools and record, in the ledger: folder-listing yes/no, pagination control yes/no, per-item fields actually returned (path, dates, size, createdBy, hashes, item ID). Every downstream phase adapts to this record; every capability the probe does not confirm is treated as absent.
5. **Taxonomy gate.** Binding taxonomy confirmed (Section 3); the client list the census keys against is extracted from it.

### Phase 1 — Inventory sweep

- **Default (search-mode):** a multi-modal sweep per scope-list container — by site/path prefix, by file type, by client name from the taxonomy, by date window — each mode run to its cap, sequentially unless this session's workflow subagents can genuinely parallelize connector calls. Caps are expected: every capped query is logged with its query string and cap size. Search cannot prove absence; coverage claims are stated per-mode, never as blanket completeness.
- **Upgrade (enumeration-mode, only if probed):** walk each container's folder tree to pagination exhaustion.
- Per item, best-effort by probe record: full path, name, extension, modified date, created date, createdBy/owner, size, content hashes, and web URL as the durable locator. Items reachable by multiple paths are deduplicated on canonicalized web URL.
- **Durable ledger:** the coverage ledger and raw inventory are files in the executing session's workspace, checkpointed after every container sweep (committed as redacted ledger updates where appropriate). Resume after any interruption = re-ingest the ledger, not re-derive it from chat memory.

### Phase 2 — Duplicate families

- Deterministic pass: normalize name stems (strip `copy`, `final`, `v2`, `(1)`, date suffixes, case, separators); cluster by normalized stem + extension; flag exact-name matches across folders. Where the probe confirmed hashes/size, add a size+hash clustering pass — this is what catches renamed copies. Where it did not, **renamed-copy detection is a stated blind spot** in the deliverable, partially mitigated by budgeted content peeks (Phase 3 budget) on high-suspicion pairs.
- Judgment pass on candidates only: distinguish true duplicate families from legitimate siblings (per-client instances of the master template are expected copies, noted with their canonical original). Family evidence is name-stem + path + modified date; size/hash strengthen it when present. A stated false-positive rate is expected and acceptable — Dillon reviews families before any deletion, which is a separate approval this plan never executes.
- Shortcut-vs-copy discrimination requires item facets the connector may not expose; where it doesn't, suspected shortcuts get a `manual check` flag rather than a claimed determination.
- Output: `Duplicates` sheet — family ID, member paths, proposed canonical survivor, evidence, disposition suggestion.

### Phase 3 — Client-separation audit

- Bulk classification by path/name rules against the taxonomy client list first. Content peeks are capped at a fixed per-session budget (default 20 items, Dillon-adjustable); items beyond the budget that rules cannot classify go to Quarantine by rule.
- A violation is: an item whose mapped client differs from the client folder containing it; multi-client material in a client-specific location; or client material in an unclassified dumping ground.
- Ambiguity rule: if the client cannot be determined without guessing, the item goes to `Quarantine` with the reason. Never guessed.
- Output: `Violations` sheet — path, mapped client, containing-folder client, violation type, evidence.

### Phase 4 — Exact move list

- Every misplaced or unfiled item gets exactly one row: `source path → target path` under the taxonomy, confidence tier (`exact` / `probable`), the rule that produced it, and collision handling (same-named file at target → tied into its Phase 2 family, never overwritten).
- **Hold rows, not omissions:** items that should not move yet (active external sharing links, suspected flow/automation dependencies, fragile synced paths Dillon names) stay in the MoveList with status `hold` and the reason — the list remains an exhaustive account of everything misplaced. Sharing-link and automation checks are unqueryable by the agent; they are Dillon/admin pre-execution gates (SharePoint sharing report, Power Automate connection review) run before any `move` row executes.
- **Prepare-only.** Execution routes, each separately approved by Dillon: manual moves, Power Automate, or Zapier once enabled. The census never assumes the connector can write.

### Phase 5 — Verification and delivery

- **Independent instrument:** Dillon opens a random sample of folders in the OneDrive/SharePoint UI and reports item counts, compared against the inventory — the census is not verified against the same search tool that built it. Duplicate families get a sample re-verification pass; every Violations row is independently re-read before delivery. Findings loop back until a full pass surfaces nothing new.
- Deliverable: one workbook (`Inventory`, `Duplicates`, `Violations`, `MoveList`, `Quarantine`, `Coverage`) sent to Dillon as a file, plus a written summary. **Delivered, not committed** — it contains client-identifying file names.
- Committed afterwards (post queue-gate reconciliation): a redacted completion summary keying counts per taxonomy client, naming the align-hcm tenant as the single source system, containing **zero file names or paths**.

## 6. Failure handling

| Failure | Handling |
|---|---|
| Connector error / throttling | Wait, retry the sweep query once, log the failure with its query in the ledger; no HTTP-level control is assumed |
| Token expires mid-census | Ledger and inventory are on disk; resume by re-ingesting them after Dillon re-authenticates |
| Session/context limits | Census is pre-chunked per site/top-level container; each chunk emits a partial ledger; aggregation and workbook assembly are scripted in the Claude Code session, not held in chat memory |
| Capped container | Closed via an alternate sweep mode where possible; otherwise explicitly accepted by Dillon as a named coverage gap — a silent cap never counts as done |
| Taxonomy version drift | Binding copy confirmed in Phase 0; MoveList header records which copy it was keyed to |
| Unmappable client | Quarantine, never guess |

## 7. Definition of done

1. Every scope-list container swept; enumeration-mode containers enumerated to completion; search-mode containers have all planned sweep modes executed, every cap recorded, and each remaining gap either closed by an alternate mode or explicitly accepted by Dillon. Search-mode coverage carries an explicit residual-risk statement in place of a completeness attestation.
2. Full reconciliation: every inventoried item has exactly one recorded disposition (correctly filed / MoveList `move` / MoveList `hold` / Quarantine / personal / internal-template).
3. Every Violations row independently re-verified; duplicate families sample-verified; Dillon's UI spot-counts reconciled against the inventory.
4. Workbook delivered to Dillon; redacted, path-free completion summary committed via the queue-gated route.
5. No write of any kind performed against the tenant; move list and duplicate dispositions remain pending Dillon's explicit approval.

## 8. Triggers to execute

All three Phase 0 gates: (1) Microsoft 365 enabled in the executing Claude Code session (+ re-auth), (2) scope list supplied by Dillon, (3) taxonomy confirmed — plus the Marketing Chief queue gate for the canonical trail. From there this plan is straight execution.
