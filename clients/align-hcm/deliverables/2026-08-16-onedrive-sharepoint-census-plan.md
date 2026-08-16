# OneDrive and SharePoint File Census — Execution Plan

Date: 2026-08-16
Client route: `align-hcm` (census target is Dillon's alignhcm.com Microsoft 365 tenant)
Status: prepare-only plan. Execution is blocked until the Microsoft 365 connector is enabled in the working chat and the binding taxonomy is supplied or located.
Boundaries: read-only census. No file is moved, renamed, deleted, or shared by the agent under this plan. This plan does not touch `queue/work-items.json` or `CONTROL.md`; the Marketing Chief may materialize a work item for it separately.

## 1. Purpose

Produce one complete, verifiable census of Dillon's OneDrive and all reachable SharePoint document libraries, and turn it into an exact, approval-gated move list keyed to the client-file taxonomy from the 2026-08-16 claude.ai working session. The census answers four questions:

1. What exists — per-folder file counts, last-modified dates, and owners where available.
2. What is duplicated — families of the same document living in multiple places or under near-identical names.
3. What violates client separation — files whose subject client does not match the client folder they sit in, or files in mixed/unclassified locations.
4. What moves where — an exact source-path → target-path list under the taxonomy, with a quarantine list for everything that cannot be classified without guessing.

## 2. Binding references

- **The taxonomy.** The target folder structure was produced in a separate claude.ai session on 2026-08-16 and is not in this repository. It is the binding key for phases 3–4. Phase 0 must obtain it by one of: (a) Dillon pastes it into the working chat; (b) the agent retrieves it from the tenant once Microsoft 365 is enabled — it was discussed over Outlook/Teams and derived from a "master template," so it should be findable by search; or (c) Dillon points to the saved file. Whichever copy is used, Dillon confirms it is the current version before any move list is keyed to it.
- **Repository invariants that carry over** (from `AGENTS.md` / `README.md`): one client has exactly one canonical home; ambiguous routing is quarantined, never guessed; destructive or external actions are approval-gated; no secrets, raw communications, or unnecessary PII enter this repository.

## 3. Scope

In scope:

- Dillon's OneDrive for Business (alignhcm.com), full folder tree.
- Every SharePoint site and document library the connector identity can reach, enumerated explicitly in Phase 0 so coverage is a checked list, not an assumption.

Out of scope unless Dillon widens it:

- Outlook attachments, Teams chat file tabs (they surface as SharePoint/OneDrive items where relevant), recycle bins, version histories (used as evidence, not censused as items), and other users' OneDrives.
- Personal (non-work) files: flagged as `personal — leave in place`, never routed into client folders.

## 4. Phases

### Phase 0 — Preflight (blocking gates)

1. Confirm Microsoft 365 is `enabledInChat: true`; re-authentication by Dillon is expected after the token expiry that ended the prior session.
2. Probe the connector's actual tool surface and record it. The census method depends on what the tools really are: true drive/folder enumeration is the preferred path; if the connector is search-oriented (Graph search), fall back to a multi-modal search sweep (by site, by folder path, by file type, by client name from the taxonomy) and document the coverage limits of each sweep. No silent caps: every truncated listing or capped search is logged in the coverage ledger.
3. Enumerate all sites/drives reachable by the connector identity and freeze the scope list with Dillon.
4. Ingest the taxonomy (section 2) and extract from it the canonical client list the census will key against.

### Phase 1 — Inventory sweep

- Walk each drive in scope, folder by folder, to exhaustion of pagination. Fan out one worker per site/top-level folder where parallelism is available.
- Record per item: full path, name, extension, size (if exposed), created/modified dates, last-modified-by (if exposed), and web URL as the durable locator.
- Output: `Inventory` sheet plus a per-folder rollup (`counts by folder`, newest/oldest last-touched) and the coverage ledger (every container visited, item count, and whether enumeration completed or was capped).

### Phase 2 — Duplicate families

- Deterministic pass first: normalize name stems (strip `copy`, `final`, `v2`, `(1)`, date suffixes, case, separators) and cluster by normalized stem + extension; flag exact name matches in different folders; corroborate with size and modified dates where exposed.
- Judgment pass second, only on deterministic candidates: distinguish true duplicate families from legitimate siblings (e.g., per-client instances of the master template are *expected* copies, not violations; the family is noted with its canonical original).
- Distinguish OneDrive shortcuts/links to a SharePoint original from real copies — a linked item is one file, not two.
- Output: `Duplicates` sheet — family ID, member paths, proposed canonical survivor, evidence (dates/size), and disposition suggestion. Deletion of losers is never executed under this plan; it is a separate approval after Dillon reviews the families.

### Phase 3 — Client-separation audit

- Map every in-scope item to exactly one taxonomy client (or `internal`, `template`, `personal`) using folder context, file name, and — only where the name is insufficient and the stakes justify it — a metadata/content peek.
- A violation is: an item whose mapped client differs from the client folder containing it; an item containing more than one client's material in a client-specific location; or client material sitting in an unclassified/shared dumping ground.
- Ambiguity rule (mirrors this repository's invariant): if the client cannot be determined without guessing, the item goes to `Quarantine` with the reason, not into the move list.
- Output: `Violations` sheet — path, mapped client, containing-folder client, violation type, evidence.

### Phase 4 — Exact move list

- For every item that is misplaced or unfiled under the taxonomy: one row of `source path → target path`, with confidence tier (`exact` / `probable`), the rule that produced it, and collision handling (target already has a same-named file → tie into the Phase 2 family rather than overwriting).
- Do-not-move flags, checked per row before it enters the list: items with active external sharing links (moves break links), items pinned by flows/automations if any are detected, and anything inside a synced-library path Dillon names as fragile.
- Output: `MoveList` sheet. **Prepare-only.** Execution routes, each separately approved by Dillon: manual moves, Power Automate, or Zapier once that connector is enabled. The Microsoft 365 connector itself is expected to be read-oriented; the census never assumes it can write.

### Phase 5 — Verification and delivery

- Adversarial verification before delivery: re-count a random sample of folders against the inventory; independently re-verify every `Violations` row by re-reading the item's metadata; run a completeness critic over the coverage ledger ("which container, file type, or search mode was not exercised?"). Findings loop back into phases 1–4 until two consecutive passes surface nothing new.
- Deliverable: one workbook (`Inventory`, `Duplicates`, `Violations`, `MoveList`, `Quarantine`, `Coverage`) sent to Dillon as a file, plus a short written summary with per-folder counts and the top duplicate families.
- The workbook contains client-identifying file names, so it is **delivered, not committed**. What gets committed here afterwards is a redacted completion summary (counts, family totals, violation totals, coverage attestation) under this client folder.

## 5. Risks and handling

| Risk | Handling |
|---|---|
| Connector is search-based, not enumeration-based | Phase 0 probe decides the method before any counting; multi-modal sweep with a per-mode coverage ledger; limits stated in the deliverable, never papered over |
| Token expires mid-census | Checkpoint after every container; the census resumes from the ledger instead of restarting |
| Graph throttling (429) | Pace requests, back off, and prefer per-container batching over item-by-item calls |
| Same document reachable via two paths (shared library + shortcut) | Deduplicate by item ID/web URL before counting |
| Taxonomy version drift (chat copy vs. saved copy) | Dillon confirms the binding copy in Phase 0; the move list header records which copy it was keyed to |
| Wrong-client mapping | Quarantine over guessing, and Phase 5 re-verifies every violation row independently |

## 6. Definition of done

1. Coverage ledger shows every in-scope container enumerated to completion, or its cap explicitly recorded.
2. Every violation row independently re-verified; two consecutive clean verification passes.
3. Workbook delivered to Dillon; redacted summary committed to this folder.
4. No write of any kind performed against the tenant; move list and duplicate dispositions remain pending Dillon's explicit approval.

## 7. Trigger to execute

Microsoft 365 toggled on in the working chat (+ re-auth), taxonomy confirmed. From there this plan is straight execution — no further design decisions are required before Phase 4 output exists.
