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

## Full work breakdown through Phase 5

The contracted plan is five phases mapped to six execution milestones (the mapping artifact `2026-08-05-milestone-2-alignment-and-reply-draft.md` is referenced by `wi-20260805-0002` but missing from this mirror; the mapping below is reconstructed from the July 10 execution plan, the Aug 1 Phase 2 plan PDF provenance, the phase2 product contract, and the phased backlog, and should be confirmed against that artifact and the signed proposal). Source note: no Slack MCP exists in this session's connector set, so Slack facts below come from the redacted Slack synthesis already in this repository (channel `C0BGWRK03B2` evidence, 2026-08-05 readback). The July 23 Tori meeting is an Otter transcript (39:17, 344 segments), not in Fireflies.

### Phase 1 — Discovery, requirements, architecture (Milestone 1) — COMPLETE

Delivered: role definitions (brand, retailer, dispensary, sales rep, admin), application map, initial backlog, Phase 1 tracker, accepted proposal ($45,000), tori source package, discovery prototype.

### Phase 2 — Product definition and UX system (Milestone 2) — AT EXIT GATE

Build work is done (live five-route review prototype, product contract, role/visibility matrix, five priority journeys with acceptance criteria, Miraj backend contract, canonical Next.js port merged via PR #3). Remaining to formally close — all human gates:

1. **Tori:** route-by-route written accept/revise on the five routes (Home, Community News, Create, My Profile, Explore) recorded with dated locators in `phase2-acceptance-record.md`; sign-off PDF is prepared in Drive (`Bridge-Phase-2-Sign-Off-2026-08-06.pdf`).
2. **Tori:** default feed decision — News grid (recommended) vs Classic.
3. **Tori + Miraj + legal:** approve the field-level visibility matrix and vendor-to-vendor protected visibility (recommend deny-by-default).
4. **Dillon + Miraj:** lock the first vertical slice (recommended: Targeted Promotion creation + protected profile projection) with fixtures and a staging date.
5. **Miraj:** confirm the nine contract areas (claims, authorization, uploads/storage/scanning, post/audience persistence, profile projection, contact confirmation/reminders, search/favorites, introductions, audit events) with inspectable evidence: repository, branch, PR/commit, migrations, RLS tests, endpoint evidence, first staging slice.
6. **Dillon:** confirm final imagery and production copy where prototype fixtures remain.
7. **Dillon:** verify the GitHub and Supabase account path (explicitly unverified per `wi-20260805-0002`).

### Phase 3 — Front-end foundation and Miraj contracts (Milestone 3)

- Promote the approved visual direction into production design-system tokens and component rules on the canonical Next.js stack (route naming, shared layout, reusable components, form patterns, responsive behavior).
- Set up the AI-assisted dev workflow (Claude/Codex/Cursor) with review gates and a decision log; keep secrets and compliance-sensitive data out of prompts.
- Human gate: obtain and document Miraj's backend contract before connecting Supabase — auth provider and session contract, user/profile/organization relationships, tables/views/enums/nullability, RLS intent per read/write path, storage buckets and signed-URL behavior, API/RPC boundaries and error shapes, audit-event requirements, environment-variable strategy for local/preview/production.
- Build the locked vertical slice end to end against the eight required API behaviors (claims; audience-safe Community News with cursor pagination; upload intent → validation → scan → processing state; multi-audience post persistence; public/B2B profile projections; contact-confirmation event + next-due date; Explore search with composable filters + favorites; permissioned introduction requests).
- Server-side enforcement from day one: authorization on every protected record/upload/audience/projection/introduction; protected-detail posts must reject Adults 21+ targeting server-side; disabled client controls are never a security boundary.
- Begin automated tests as soon as real APIs exist.

### Phase 4 — Core MVP build and integration (Milestones 4–5)

- Build the shared authenticated shell: navigation, page structure, responsive layout, notifications, account context.
- Onboarding and account setup with validation and recovery paths; verification-facing screens coordinated with Miraj's EIN/business/license/jurisdiction/status requirements.
- Role-aware dashboards; first usable flows for listings/discovery, messaging, and admin review (verification queue, moderation, disputes).
- Replace mock adapters with Supabase-backed flows one bounded flow at a time (users/memberships, organizations/locations, profiles, licenses/verification, contact requests, favorites, announcements/notifications, moderation/audit).
- State machines: verification `draft → submitted → in_review → approved | changes_requested | rejected` (plus re-verification), contact request `draft → sent → accepted | declined | withdrawn`, profile `draft → pending_review → published`.
- Full state coverage on every data-dependent route: loading, empty, populated, validation-blocked, permission-denied, network error with retry, pending/in-review, rejected-with-reason, success without duplicate submission.
- Integration QA as endpoints land: permissions match the role matrix; verification/account states (incomplete, pending, rejected, approved); age-gating, jurisdiction, and license-status assumptions validated with the team; responsive, cross-browser, keyboard, and accessibility checks (WCAG 2.2 AA target); failures become tickets with reproduction steps, severity, and owner.
- Maintain the implementation log: complete, blocked, changed, needs client confirmation.

### Phase 5 — Acceptance, launch readiness, and handoff (Milestone 6)

- Convert acceptance criteria into automated tests against real APIs (unit: filters/validation/state transitions/permission rendering; component: forms/dialogs/tables/state views; end-to-end: the five priority journeys; automated accessibility plus manual keyboard/screen-reader spot checks).
- Prepare and run the demo-ready acceptance path with Tori; no hidden manual fixes.
- Confirm final MVP scope and record everything intentionally deferred; coordinate final fixes, environment checks, and release sequencing with Miraj; establish staged launch criteria and rollback paths.
- Launch operations (from the phased backlog P3): recruit initial retailers/service providers/brands, define verification-operations ownership, moderation, support, and escalation; validate analytics definitions, privacy notices, consent, retention, advertising rules, and legal-state coverage; run usability sessions with Tori and representative roles.
- Documentation and handoff: app map, role behavior, component conventions, AI workflow, known limitations, next-priority backlog; user-flow walkthrough for client and team; case-study assets pending approval.
- Pricing/packaging decided on the commercial track only after value validation (the discussed $349–$350 tier is not final); HR concept stays out pending its own legal charter.

### Standing items across all phases

- Route decisions through Melissa and Mac to Tori; keep Mac's sign-off at milestone gates.
- Keep the tracker/decision log current; assumptions labeled and visible.
- No legal or regulatory determinations in-product without confirmed guidance; no client credentials or verification data in AI prompts; no silent MVP expansion — new ideas become backlog items.
- External action (posting, deploying, inviting, account changes) stays approval-gated per the canonical operating rules.

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
