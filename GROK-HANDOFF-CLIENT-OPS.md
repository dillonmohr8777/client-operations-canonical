# Grok handoff: Client Operations Canonical

Snapshot: 2026-08-06 (America/New_York)  
Repository: `dillonmohr8777/client-operations-canonical`  
Source baseline before this handoff: `main` at `116235f259f885cb5eb76dc473f1a7c820282523`

## Purpose and authority

This private repository is the shared transport, backup, and coordination surface for Dillon's Canonical Client Operations project. It contains the registry, queue, client folders, redacted evidence, policies, schemas, scripts, execution graphs, and deliverables used by the Marketing Chief.

The “DESKTOP-4AHKEC4 is the sole canonical writer” statement in the original prompt is no longer current. The live `AGENTS.md` and `REMOTE_WORKSPACE.md` authorize both `DESKTOP-4AHKEC4` and `AHCM-3LCQVF4` as execution machines and canonical-state writer hosts. There is still only **one logical writer role: Marketing Chief**. Host-level processes coordinate through fetch/fast-forward, exact expected queue revisions, atomic supported scripts, and normal non-force Git history.

Grok is a bounded worker unless Dillon explicitly promotes it into the Marketing Chief role. As a worker, Grok may read, analyze, draft, test, and return evidence. It must not directly mutate `queue/work-items.json`, generated `CONTROL.md`, durable corrections, approvals, access state, or external systems.

## Repository map

- `registry/clients.json`: canonical non-secret client index and aliases.
- `queue/work-items.json`: canonical machine queue; every accepted mutation increments the root revision and work-item version.
- `CONTROL.md`: deterministic human-readable queue projection. Never hand-edit it out of sync.
- `clients/<client-id>/`: one canonical folder per resolved client, including context, evidence, drafts, deliverables, and client-specific systems.
- `context/`: Dillon voice, operating history, marketing context, and design standards.
- `intake/`: redacted, deduplicated sensor observations. Intake is not automatically a queue item.
- `state/`: append-only/validated receipts, corrections, health, training, paid-media readbacks, execution graphs, and worker handoffs.
- `scripts/`: supported mutation, validation, routing, projection, intake, graph, SitesBridge, and Marketing Chief tools.
- `schemas/`: worker-handoff, design, paid-media, authority, and execution-graph contracts.
- `workflows/`: declarative Marketing Chief and paid-media workflows.
- `integrations/`: bounded integrations such as Buzz; these do not supersede the queue.
- `docs/`: operating notes and narrow relay contracts.

## Actively tracked clients

The current local registry resolves 22 active client IDs:

`align-hcm`, `momentum-360`, `kimberly-james-bridal`, `bok-law-firm`, `fagan-painting`, `pro-fence-deck`, `replenish-7-eleven`, `fresh-blends-kwik-trip`, `nkcdc`, `hope-wellness-center`, `omega-landscaping`, `shadow-heating-cooling`, `va-claims-edge`, `bercos-popcorn`, `ami-cleaning`, `cindy-may-christmas`, `bar-crawl-usa`, `bridge-software`, `onsite-concrete-landscape`, `revive-systems`, `bigorange-marketing`, and `pritzker-law-group`.

`zen-spa-tropicana` exists but is currently marked inactive. Do not create new active work for it without a registry/status decision. IMMOHRTAL is Dillon-owned product/artist work, not a client registry lane; keep its assets isolated from client sites.

## How Grok should interact

1. Fetch and fast-forward `main`, then read `AGENTS.md`, `REMOTE_WORKSPACE.md`, `context/DILLON_OPERATING_HISTORY.md`, `context/marketing-context.md`, `context/DILLON_VOICE.md`, and `context/DESIGN_STANDARD.md`.
2. Resolve the exact client with `scripts/Resolve-Client.ps1`; an inactive or ambiguous route blocks client-state writes.
3. Read the exact client folder and current source evidence. Communication summaries are context, not delivery authority.
4. Prefer read-heavy analysis and bounded artifacts. Put client deliverables inside the existing canonical client folder; never create a disconnected dated client home.
5. Return a schema-valid, redacted worker handoff. Marketing Chief alone reconciles queue transitions.
6. Never send, publish, spend, change accounts, or perform destructive actions without the exact approval envelope.
7. Never force-push. On a non-fast-forward, pull and reconcile the newer revision.

## Relationship to individual repos and Drive

This repository stores canonical routing, status, evidence locators, approvals, and reviewable deliverables. Individual GitHub repos remain the source of truth for product/site code when they exist, for example `shadow-heating-website`, `align-hcm-august-2026-content`, `align-hcm-lead-intelligence`, `bigorange-marketing-homepage`, and the IMMOHRTAL repos. Google Drive may be the source for client-provided documents or large approved assets. Client Operations should store the safe locator, lineage, status, and verification result rather than silently duplicating raw private content.

When sources conflict: current live account evidence beats cached reports; canonical queue/registry beats the generated agent vault; exact client evidence beats portfolio summaries; and the newest approved deliverable beats an older PR draft.

## Current published state and remaining local gap

The remote base contained queue revision 335 and 21 active registry records. This handoff commit published the reviewed tracked delta: queue revision 388, 22 active registry records, and 85 tracked modifications across policy, queue, registry, intake, scripts, Buzz/SitesBridge, health state, and client deliverables.

The persistent local worktree still contains roughly 15,000 untracked entries, overwhelmingly `.tmp`, `node_modules`, rendered assets, runtime reports, and other generated work products. Some newer reviewable deliverables and worker evidence are mixed into that set and require selective lineage/privacy review before publication.

The published tracked canonical state is intentionally distinct from the generated/untracked bulk. Do not use `git add -A`. Selectively add only approved deliverables/evidence with clear lineage. Generated dependencies, `.tmp`, runtime caches, and raw source dumps must stay out of Git.

Open GitHub pull requests: 16. Issues are disabled. PRs `#4` and `#8`-`#19` include client packets, environment work, reports, dashboards, videos, and Need Momentum designs. Treat most draft PRs as candidate inputs, not current canonical truth.

## Grok: next 48 hours

1. Treat revision 388 as the published queue baseline. Review the remaining untracked set by lineage and publish only unique, approved canonical artifacts; exclude generated dependencies and caches.
2. Review all 16 open PRs by exact client and deliverable; close connectivity tests and superseded design/report drafts after preserving unique evidence.
3. Keep website status centralized in `GROK-HANDOFF-WEBSITES.md` and update exact code-repo locators as branches merge.
4. Work only the highest safe automatic queue action after exact client routing; return one schema-valid worker handoff.
5. Keep external delivery, publishing, spend, authentication, and account changes gated.

## Core commands

```powershell
./scripts/Resolve-Client.ps1 -Query '<client or alias>'
./scripts/Get-NextActions.ps1
./scripts/Update-MarketingControl.ps1
./scripts/Test-MarketingHandoff.ps1
./scripts/Test-MarketingOS.ps1
```

Read each script's parameters before use. Never guess an expected queue revision.
