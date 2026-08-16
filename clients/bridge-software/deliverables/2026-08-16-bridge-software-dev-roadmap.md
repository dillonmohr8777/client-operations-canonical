# Bridge Software: development roadmap and current-state reconciliation

Date: 2026-08-16
Client: `bridge-software` (portfolio rank 1)
Status: local review roadmap. No client delivery, posting, deployment, account change, or queue mutation is performed or implied by this document.

## One-sentence status

The Phase 2 review package is built and live for client review, the canonical five-route Next.js reconciliation has now been merged to `main` in `dillonmohr8777/bridge-discovery-prototype` (pull request #3, pushed 2026-08-15), and the project is blocked on three human gates: Tori's written route-by-route acceptance, Miraj's inspectable backend evidence with a vertical-slice lock, and verification of the GitHub/Supabase account path.

## Verified current state (2026-08-16)

| Layer | State | Evidence |
| --- | --- | --- |
| Engagement | Active; $45,000 proposal; six contracted milestones; Milestone 2 work active | `clients/bridge-software/context/operating-context.md`; `queue/work-items.json#wi-20260805-0002` |
| Client-facing review prototype | Live at https://bridge-connected-signal.netlify.app (noindex); five routes: `/`, `/community/`, `/studio/`, `/business/`, `/signal/`; deploy `6a72bd466f5d1047322165bb` dated 2026-08-04 | `bridge-discovery-prototype-kimi-design` → `latest-signal-app/deliverables/BRIDGE-PHASE-2-READY-FOR-ACCEPTANCE-2026-08-06.md` |
| Canonical Next.js implementation | Five Phase 2 routes (`/`, `/community`, `/create`, `/my-profile`, `/explore`) merged to `main` at `c802366` via PR #3 from branch `phase2-reconcile-2026-08-06`; typecheck, lint, production build, staging build, route verifier, and mobile overflow checks recorded pre-merge | `dillonmohr8777/bridge-discovery-prototype` git history |
| Tori feedback from 2026-07-23 review | Implemented in the review prototype or explicitly deferred; this is implementation status, not acceptance | `BRIDGE-PHASE-2-READY-FOR-ACCEPTANCE-2026-08-06.md` |
| Tori route-by-route acceptance | All five routes pending; default feed choice pending | `docs/phase2/phase2-acceptance-record.md` (all rows pending, no dated locator) |
| Miraj backend confirmation | All nine areas pending (claims, authorization, uploads, persistence, projection, contact confirmation, search/favorites, introductions, audit events); backend claims remain self-reported without inspectable repo, migrations, RLS tests, or staging | `docs/phase2/phase2-acceptance-record.md`; `docs/phase2/phase2-miraj-handoff.md` |
| Account dependency | GitHub and Supabase account path explicitly unverified until confirmed | `queue/work-items.json#wi-20260805-0002` definition of done |
| Phase 2 formal close | Not closed | `docs/phase2/00-status-and-reconciliation.md` |

## Phase 2 exit gate (updated for the 2026-08-15 merge)

| Gate item | Owner | Status 2026-08-06 | Status 2026-08-16 |
| --- | --- | --- | --- |
| Five-route reviewable prototype live + QA'd | Dillon | Done | Done |
| Feedback items implemented in prototype | Dillon | Done | Done |
| Product + backend contracts written | Dillon | Done | Done |
| Canonical non-Kimi Next.js reconciliation | Dillon | Pending | **Done — merged via PR #3 (`c802366`)** |
| Route-by-route written accept/revise | Tori | Pending | **Pending — critical path** |
| Default feed choice recorded | Tori | Pending | Pending |
| Field matrix + vendor visibility final | Tori + Miraj + legal | Pending | Pending |
| Vertical-slice selection and fixtures | Dillon + Miraj | Pending | Pending |
| Auth, authorization, upload, search, reminder, audit contracts confirmed | Miraj | Pending | Pending |
| Automated tests against real APIs | Dillon + Miraj | After APIs exist | After APIs exist |

## What we need to do next (sequenced)

### 1. Close Phase 2 (human gates, this week)

1. Obtain Tori's written route-by-route accept/revise for the five routes and record each decision with a dated source locator in `docs/phase2/phase2-acceptance-record.md`. The live review URL is the Kimi static suite; the recommendation on default feed remains News grid.
2. Record Tori's default feed choice (News grid recommended; Classic retained as comparison).
3. Obtain Miraj's inspectable evidence: repository, branch, PR/commit, migrations, RLS tests, endpoint evidence, and the first staging vertical slice. Until then backend claims stay self-reported.
4. Lock the vertical slice in writing with Miraj: **Targeted Promotion creation + protected profile projection** (recommended), with a staging date.
5. Verify the GitHub and Supabase account path (per `wi-20260805-0002` this remains explicitly unverified). This is a prerequisite for any real backend integration work.

### 2. Phase 3 — front-end foundation + Miraj contracts (after gates)

- Production design-system tokens and component rules on the canonical Next.js stack.
- Auth claims integration: user ID, age eligibility (21+), membership status, organization ID and verification state, role, delegated permissions, state/license eligibility, admin scope on every protected request.
- Required API behaviors for the slice: current-user claims; audience-safe Community News retrieval with stable cursor pagination; upload intent → validation → scan → processing state; multi-audience post persistence; public and B2B profile projections; contact-confirmation event + next-due date; Explore search with composable filters + favorite state; permissioned introduction request without protected contact disclosure.
- Server-side enforcement rules: authorization on every protected record/upload/audience/projection/introduction; never rely on disabled client controls; multi-audience posts with protected detail must reject Adults 21+ targeting server-side.
- Audit events: role change, verification change, protected-field view, contact edit, contact confirmation, audience publication, introduction approval, moderation action.
- Automated tests once real APIs exist.

### 3. Later scope (do not start without written approval / change order)

- Nationwide live data providers; menu/order integrations; marketplace seeding and pilot launch; pricing packaging (commercial track only, out of product UI); HR concept (separate legal charter only). External menu, ordering, maps, and social destinations remain links only in the MVP.

## Open decisions register

| ID | Decision | Owner | Working recommendation |
| --- | --- | --- | --- |
| D-FEED | Default feed layout | Tori | News grid |
| D-FIELD | Final public/member/business field set | Tori + Miraj + legal | Baseline matrix in `phase2-product-contract.md` §2 |
| D-V2V | Vendor-to-vendor protected visibility | Tori + Miraj + legal | Deny by default; grant by explicit org role + relationship |
| D-SLICE | First production vertical slice | Dillon + Miraj | Targeted Promotion + protected profile projection |
| D-PRICE | Subscription packaging | Melissa / Mac / Tori | Commercial track only |
| D-HR | HR support concept | Legal | Deferred out of MVP |

## Repository hygiene findings (local, reversible)

1. **Stale status docs after the merge.** `docs/phase2/00-status-and-reconciliation.md`, `phase2-dillon-status-2026-08-06.md`, and `PRODUCT.md` in `bridge-discovery-prototype` still describe the five-route reconciliation as "implemented locally; approval to commit/push pending." The merge of PR #3 supersedes that. Update the status lines so the repo does not under-claim, and record the merge date.
2. **Merged branch cleanup.** `phase2-reconcile-2026-08-06` still exists on the remote after its merge; delete it once confirmed no unmerged work remains.
3. **Missing mirror artifact.** `queue/work-items.json#wi-20260805-0002` lists `clients/bridge-software/deliverables/2026-08-05-milestone-2-alignment-and-reply-draft.md` as an artifact, but the file is absent from this repository. Sync it from the canonical writer machine so the queue's artifact references resolve.
4. **Superseded completion claim.** `BRIDGE-PHASE-2-COMPLETE-2026-08-06.md` in the Kimi repo is superseded by `BRIDGE-PHASE-2-READY-FOR-ACCEPTANCE-2026-08-06.md`; keep citing only the latter.

## Boundaries

- The Kimi static suite at bridge-connected-signal.netlify.app remains the only client-facing Bridge review URL; the canonical Next.js build is not deployed and does not replace it.
- The prototype has no real auth, Supabase connection, payments, EIN verification, production file storage, marketplace, or algorithmic feed; do not claim otherwise.
- The public repositories (`bridge-discovery-prototype`, `bridge-discovery-prototype-kimi-design`) must not receive new client source material without separate explicit approval.
- Nothing in this roadmap authorizes sending, posting, publishing, deploying, spend, or account changes.

## Evidence references

- `queue/work-items.json#wi-20260805-0002`, `#wi-20260716-0001`, `#wi-20260724-0001`
- `clients/bridge-software/deliverables/2026-07-16-milestone-decision-brief.md`
- `clients/bridge-software/deliverables/2026-07-20-prototype-source-handoff.md`
- `dillonmohr8777/bridge-discovery-prototype` — `docs/phase2/` (status, acceptance record, Miraj handoff, phased backlog); `main` at `c802366`
- `dillonmohr8777/bridge-discovery-prototype-kimi-design` — `latest-signal-app/` at `39e06db`; deliverables and deploy record dated 2026-08-04 through 2026-08-06
