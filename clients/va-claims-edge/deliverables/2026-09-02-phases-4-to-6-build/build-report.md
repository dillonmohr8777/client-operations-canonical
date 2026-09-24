# VA Claims Edge — Phases 4 to 6 build report

**Prepared:** 2026-09-02
**Branch:** `codex/phase-4-qa-and-wiring-20260902`
**Draft PR:** https://github.com/vaclaims-dev/vace-platform/pull/5 — **DRAFT, not merged, not deployed**
**Base:** `origin/main` @ `f00141e`
**Repo:** `vaclaims-dev/vace-platform`
**Worktree:** `C:\Users\dillo\AppData\Local\Temp\claude\vace-phase4` (the main checkout stayed on `cursor/va-client-intake-3493`, untouched)
**Scope input:** the code-level review at `..\2026-09-02-phase-3-completion-review\review.md`

## What this document is not

**It is not a claim that any phase has been authorized to bill.**

The signed agreement makes Phase 4 conditional on two things that have not happened: **Phase 3 client approval**, and the **$3,000 Phase 4 prepayment**. Phase 5 repeats the gate after Phase 4 approval. The Phase 6 maintenance period ($350/month for 24 months, roughly 7 hours at $50/hour) begins only when the final development phase completes and support actually begins.

Everything below is work **built and ready**. Nothing here asserts that the gates are met.

## Boundaries observed

Nothing was merged, deployed, or written to production. No Vercel, Supabase, or Resend dashboard or setting was touched. No Slack message was posted. No environment variable was bound. No secret or `.env` value was read, printed, or persisted — the handoff documentation records environment variables by **name and purpose only**.

Every production check was an **unauthenticated HTTP GET**. Authenticated QA ran against a **local dev instance on port 3111 with the repository's own synthetic fixtures** (`VACE_REVIEW_FIXTURES=1`). No real credential was requested, accepted, or used, and no production record was created or modified.

---

## 1. Verification numbers

| Command | Before (`f00141e`) | After | Change |
|---|---|---|---|
| `npm ci` | exit 0 | exit 0 | — |
| `npm test` | **18 pass / 0 fail** | **131 pass / 0 fail** | **+113 tests** |
| `npm run lint` | exit 0, no output | exit 0, no output | clean |
| `npm run build` | exit 0, 27 routes | exit 0, 28 routes | +`/api/health` |
| Proxy in build output | **absent** | **`ƒ Proxy (Middleware)`** | P1 proven fixed |
| Dashboard route rendering | 4 of 8 marked `○ Static` | **8 of 8 `ƒ Dynamic`** | prerender risk removed |
| Line coverage | not measured | **92.47%** | — |
| Branch coverage | not measured | 72.72% | — |
| Function coverage | not measured | 88.89% | — |
| Client JS bundle | 1042.6 KB / 21 files | 1100.0 KB / 26 files | **+57.4 KB (+5.5%)** |
| CSS | 108.2 KB | 113.4 KB | +5.2 KB |
| Diff | — | 68 files, +8458 / −604 | — |

Both bundle figures come from a clean `npm ci && npm run build` — the baseline in a separate detached worktree at `f00141e`, the after-figure in the branch worktree.

Test files went from 5 to 12. `npm test` now runs with `--experimental-test-module-mocks` so route handlers can be exercised with a stubbed Supabase client; a `test:coverage` script was added.

---

## 2. Phase 4 — Testing, Revisions & Optimization

Contract items: quality assurance testing, bug testing and troubleshooting, functionality improvements, client-requested revisions within the agreed scope, UX improvements, final pre-launch development updates.

### 2.1 What shipped, and what each fix addresses

| # | Item | What it addresses | Files |
|---|---|---|---|
| 1 | Proxy moved to `src/proxy.js`, matcher narrowed to `/dashboard/:path*` | **P1 HIGH.** Next 16 resolves Proxy beside `app`, so the root-level file had never run and Supabase sessions were never refreshed — staff were being bounced to login mid-session on the access-token lifetime instead of rolling over. | `src/proxy.js` |
| 2 | Documents UI | **D1.** Obaid shipped the storage API in `f00141e` with no front end; nothing in `src/` called `/api/documents` at all. | `ClientDocuments.js`, `documents-contract.js`, `staff-request.js`, `[clientId]/page.js` |
| 3 | Signed URL by `document_id` with an ownership lookup | **P3 MEDIUM.** The route signed any caller-supplied path, so any authenticated user could mint a URL for any object in the claimant-document bucket by guessing paths. | `api/documents/signed-url/route.js` |
| 4 | Digest dedupe key, reference-date mutation, name escaping, table-driven thresholds | **P4 MEDIUM.** The guard could never match the row it wrote, and `setHours` mutated the shared date inside the loop so every client after the first was measured against a different clock. | `api/notify/route.js` |
| 5 | Terminal records reachable | **P5 MEDIUM.** `stop_clock` writes `is_active: false` while both loaders filtered `is_active = true`, so three filters and the "Terminal history" tile could never return a row. | `supabase-server.js`, `ClientDirectory.js`, `dashboard/page.js`, `api/clients/route.js`, `sample-client-data.js` |
| 6 | Settings wired, table made authoritative | **D3.** A live settings API with a static page, and `WORKFLOW_CONFIG` competing with the `settings` table as a source of truth — the UI showed one set of thresholds while the digest fired on another. | `settings-contract.js`, `SettingsForm.js`, `api/settings/route.js`, `api/notify/route.js` |
| 7 | Dead code removed, terminal labels single-sourced | **P7 LOW.** 313 unused lines that were the only consumer of `TERMINAL_OUTCOME_LABELS`, so changing the shared contract changed nothing a user saw. | deleted `LifecycleControls.js`; `workflow-data.js` + 5 consumers |
| 8 | Distinguishable, non-leaking errors | **P8 LOW / D5.** Every backend failure collapsed into one generic message; a duplicate email read as "The client record could not be created." | `staff-request.js`, `client-intake.js`, `AddClientForm.js`, 5 route handlers |
| 9 | Test suite, accessibility and device pass | **D6.** Accessibility beyond source-visible ARIA and mobile layout had never been verified; the only evidence predated every Phase 3 route. | 7 new test files, `tests/helpers/`, `globals.css` |

### 2.2 Fixes found during Phase 4 that were not on the original list

| Item | Severity | What it addresses |
|---|---|---|
| `client_id` validated as a UUID before it becomes a storage path prefix | **P6 LOW** | An unvalidated `client_id` could place an uploaded object outside the intended prefix. Two lines, in a route I was already building a UI for. |
| Orphan cleanup on a failed document insert | Low | The object was already in the bucket when the row insert failed, leaving a file no record would ever point at. |
| `GET /api/clients/[id]` returns 404 | Medium | `.single()` made a record RLS hides indistinguishable from a database failure. |
| Audit-write failures reported | Medium | The `stage_events` / `timeline_events` inserts never checked their result, so an RLS denial returned 200 with no audit row. Now `audit_recorded: false` in the response and a warning in the UI. |
| `dynamic = 'force-dynamic'` on the dashboard layout | Medium | A build with no Supabase configuration statically prerendered four authenticated routes into the "configuration missing" state. Now all eight build as dynamic. |
| Portal demo limits corrected | Low | The public portal advertised 250 MB and a `.pdf,.jpg,.jpeg,.png` list; the real API rejects both. Now 50 MB and the real MIME list. |
| `settingDays` falls back on a corrupt row | Low | A non-numeric saved value produced `NaN` and silently disabled a threshold. |

### 2.3 Security pass — results

Every route tested unauthenticated, authenticated-but-unauthorized, and cross-client. The test harness models RLS the way Postgres does: a hidden row returns **no rows**, not "denied", so a cross-client test proves the route cannot see what it must not see.

| Check | Result |
|---|---|
| Unauthenticated, every route | 401 (405 on POST-only). Never data |
| Missing configuration | 503, distinct from 500 |
| Cross-client document read | **404**, no signed URL minted |
| Cross-client document delete | **404**; the other client's row and object both survive |
| Cross-client notes read | Empty list; never another client's content |
| Cross-client lifecycle write | **404**; no event written, target record unchanged |
| Legacy `?file_url=` on signed-url | **400** — the pre-fix contract is refused outright |
| Path traversal in `client_id` / `document_id` | **400** before any storage or database call |
| SQL and HTML injection through search, filter, sort | Matches nothing; never widens the result set |
| `include_terminal` flag tampering | Only the exact value `1` opts in |
| Settings key injection | Dropped by the allowlist; nothing written |
| Actor spoofing via request body | Ignored; the actor comes from the session |
| Error payloads | No schema name, driver message, error code, stack trace, or other client's identifier |
| Upload MIME allowlist | `text/html` and `image/svg+xml` both excluded (stored-XSS vectors) |
| Health probe | Reports `RESEND_API_KEY` **presence only**; no value read, logged, or returned |

### 2.4 Accessibility — measured results

Contrast is computed in `tests/accessibility.test.mjs` from the real token values parsed out of `globals.css`, so a colour regression fails the build rather than shipping.

**Three measured failures found. Two fixed.**

| Surface | Before | After | Required | Criterion |
|---|---|---|---|---|
| Form control boundary (`--vace-line-strong`) | **1.65:1 FAIL** | **3.08:1 PASS** | 3:1 | 1.4.11 |
| Keyboard focus indicator on fields | **1.15:1 FAIL** | **10.56:1 PASS** | 3:1 | 2.4.7, 1.4.11 |
| Panel and divider lines (`--vace-line`) | 1.33:1 | Unchanged by default; **3.10:1** under `prefers-contrast: more` | 3:1 if load-bearing | 1.4.11 |

The focus failure was structural, not cosmetic: component rules used `:focus { outline: 0 }` with an 8%-alpha glow and sat later in the sheet than the global `:focus-visible` outline, so keyboard focus on inputs, selects and textareas had no measurable indicator.

**Verified in a real browser:** 26 Tab presses produced 28 focus events; every application element received `2px solid rgb(97, 216, 208)` at 2px offset. The only elements without an indicator were the Next.js dev-tools overlay.

All 19 text surfaces measure **5.46:1 to 17.47:1** — all pass AA. Lowest is the input placeholder at 5.46:1; body copy is 17.47:1.

**Target size (WCAG 2.5.8, 24×24 minimum), measured at 390px:**

| Route | Before | After |
|---|---|---|
| `/dashboard` | **16 of 41 below minimum** (one at 9px, several at 16–17px) | **0 of 41** |
| `/dashboard/alerts` | 12 below | 0 |
| `/dashboard/payment-watch` | 9 below | 0 |
| `/dashboard/advisors` | 1 below | 0 |
| `/dashboard/clients` | 0 | 0 |
| `/dashboard/clients/[id]` | 1 below | 0 |

### 2.5 Device matrix — measured

| Width | Routes | Horizontal overflow | Targets below 24px | Unlabelled fields | Buttons without a name |
|---|---|---|---|---|---|
| **390px** | 8 dashboard routes + client record | **none** | **0** | **0** | **0** |
| **768px** | dashboard, clients, settings | none | 0 | 0 | 0 |
| **1440px** | dashboard | none | 0 | 0 | 0 |

Also verified at 390px: one `h1` per route, no heading-level skips, every `th` carries `scope`, `main` and `nav` landmarks present, `lang="en"`, a working skip link, and every form field labelled. A light-preference viewer still receives the intended palette — the app declares `color-scheme: dark` and paints its own ground — so the contrast figures hold in both OS themes.

**Reduced motion** was already correct and needed no change: entrance animations sit behind `prefers-reduced-motion: no-preference`, and the `reduce` block cancels all animation and transition duration with `!important`. `prefers-reduced-transparency` is handled too. Nothing added in this branch introduces motion.

### 2.6 Resilience — verified with the backend unreachable

Added `src/app/error.js`, `src/app/dashboard/error.js`, `src/app/global-error.js` (which ships its own `html`/`body` and inline styles, since it replaces the root layout) and a client `not-found.js`.

With no Supabase configuration bound, the settings, health and documents panels each render a titled error with a specific, non-leaking message and a working retry:

> "Settings could not be loaded — This service is not configured yet. Contact the system administrator. [Try again]"

`role="alert"` present, no blank screens, no silent failures. `staffRequest` also survives a malformed body: an HTML gateway-timeout page yields a clean message rather than markup on screen.

The documents flow was then exercised end to end against a stubbed API in the browser: list renders with a caption and scoped headers and per-file accessible button names; a `.txt` file is rejected client-side with **zero network calls**; an upload sends `FormData` (proving the `staffRequest` fix); download requests `?document_id=` and opens the signed URL; delete requires a confirm step. The settings form was exercised the same way: dirty tracking, per-field validation bound with `aria-invalid` / `aria-describedby` / `role="alert"`, a blocked save with a summary alert, error recovery, and a successful save with `role="status"`.

### 2.7 Performance — measured

| Finding | Before | After |
|---|---|---|
| `/api/notify` dedupe query | **1 round trip per active client** (N+1) | **1 total** |
| Dashboard database round trips | 1 | 1 (terminal rows ride the same query) |
| Client list round trips | 2, already parallel | 2 |
| Client bundle | 1042.6 KB | 1100.0 KB (+5.5%) |
| Largest route payload at 390px | — | `/dashboard`, 62.6 KB HTML |

**Measured and not fixed** (see the known-issues register): `loadClientRows` and `GET /api/clients` are unbounded; `/api/lifecycle` and `/api/notify` use `select('*')`; the AI route embeds the entire active roster in its system prompt.

### 2.8 Data integrity — timezone and DST

| Check | Result |
|---|---|
| Payment Watch grouping across the 2026-11-01 US transition | Identical elapsed count at 00:30, 04:30, 06:30, 12:30 and 23:30 UTC |
| Payment Watch under `TZ` = UTC, America/Chicago, Pacific/Kiritimati, Pacific/Pago_Pago | Identical elapsed count in all four |
| Stage duration across the 2026-03-08 spring transition | Exactly 30 days for two instants 30 days apart |
| Group boundaries | Exact at 59 / 60 / 120 / 121 days |
| Future exam date | 0 elapsed, never negative |
| Missing contact date | Reads "Unknown", never 0 |
| Linked cycle restart | Master start preserved, previous cycle kept and closed, its events not rewritten, new cycle links back, history and audit appended not replaced |

The date arithmetic is UTC-day based (`startOfUtcDay`), which is why it is stable. This is pre-existing behaviour now covered by tests.

---

## 3. Phase 5 — Final Delivery, Handoff & Launch Support

Contract items: final software review, final edits and cleanup, client access confirmation, code and environment handoff, documentation and training support, launch or deployment assistance, final project approval.

Everything that does not require an external action was built. `docs/handoff/`:

| Document | Contents |
|---|---|
| `README.md` | Index and read-in-this-order list |
| `architecture.md` | App Router structure, server/client split, why `src/proxy.js` must live under `src/`, both request flows, the no-service-role → RLS-carries-everything argument, the settings fallback model |
| `environment.md` | 8 variables **by name and purpose only**, with file:line, failure mode, public/server, and owner. Explicit no-values warning |
| `repository.md` | Repo, branch model, draft-PR convention, local commands, test inventory |
| `api-reference.md` | All endpoints, every status and exact message, every allowlist — derived by reading the handlers |
| `data-model.md` | Tables and columns the code actually touches, the `client-documents` bucket, and an explicit RLS-expectations section |
| `third-party-services.md` | Supabase, Vercel, Resend, Anthropic — use, code path, open ownership question, failure mode |
| `runbook.md` | Seven operational procedures plus backup and recovery |
| `staff-training-guide.md` | For David's team, not engineers. 19 numbered sections plus "what the system will never do on its own" |
| `access-confirmation-checklist.md` | A **checklist, not a grant**. Every row "Not started". Includes an assessment of whether `vaclaims-dev/vace-platform` already satisfies the ownership clause |
| `launch-runbook.md` | 11 ordered steps with owners and verification checks. **First line states that nothing in it has been executed** |

**Final pre-launch review pass:** dependency audit, dead code (313 lines removed), duplicated contracts (terminal labels, storage limits, settings keys — all single-sourced), console noise (the only `console.error` calls are deliberate, in error boundaries and audit-failure paths), error handling (section 2.6), and the known-issues register below.

---

## 4. Phase 6 — Maintenance and support readiness

**Commercial terms, as facts from the contract:** $350/month fixed, 24 months, roughly 7 hours monthly at $50/hour, beginning only when the final phase completes and support actually begins. **Not active. Not authorized. Nothing here begins billing.**

`docs/maintenance/`:

| Document | Contents |
|---|---|
| `README.md` | Index plus the not-active / not-authorized statement and the start precondition |
| `maintenance-runbook.md` | Copy-paste monthly check-in template; bug and revision intake with required fields; four severity levels with examples drawn from this application; included hours versus separately billed, with an overrun procedure; escalation path with three named roles; monthly, quarterly and annual calendar |
| `support-request-template.md` | Fillable form plus a worked example |
| `hours-log.md` | Monthly table with categories and a running total against the ~7-hour allowance, a rollover and overage policy, and a worked example month |
| `health-check-procedure.md` | All six probes: what each checks, how to run it from the UI and as an authenticated GET, what healthy looks like, what a warning means, and the first three actions. Plus what the check deliberately does **not** cover |

**Monitoring, with real data behind it.** A new read-only `GET /api/health` probes authentication, the client database, the settings table, document storage, digest recency, and whether `RESEND_API_KEY` is bound — **presence only, no value read**. It writes nothing, runs every query under the caller's own RLS scope, and never returns a driver message. Surfaced as a "System health" panel on `/dashboard/settings`, with a re-run control.

---

## 5. Built versus still gated

| Item | State | Gated on |
|---|---|---|
| **Everything in PR #5** | Built, tested, draft PR | **Phase 3 client approval + the $3,000 Phase 4 prepayment before any Phase 4 billing** |
| Merge and deploy of PR #5 | Not done | Dillon and David; deliberately out of scope for this build |
| Cron definition and one delivery receipt (P2) | **Not built** | **Obaid.** `/api/cron` and `/api/cron/notify` are still 404 in production. `/api/notify` is POST-only and requires an authenticated Supabase session, so a plain scheduled HTTP call gets 401 — the cron design has to solve that, not just schedule a call |
| RLS policies for every table | **Not in the repo** | **Obaid.** No service-role key exists anywhere in the codebase, so Postgres RLS carries the entire enforcement weight |
| Storage policies for `client-documents` | **Not in the repo** | **Obaid.** The only control protecting claimant documents |
| Tighten `with check (true)` on `notes` / `timeline_events` | Not done | **Obaid.** Acceptable while every authenticated user is staff; not acceptable the moment self-registration opens |
| Resend verified sender domain | Not done | **David.** Still hardcoded to `onboarding@resend.dev`, Resend's shared test sender, which only delivers to the Resend account owner's own address. Recommend `vaclaimsedge.com` and moving the value to `RESEND_FROM_EMAIL` so the swap is an env change, not a deploy |
| Digest recipient confirmation | Defaults to `vaclaims14@gmail.com` | **David** |
| The seven 2026-08-20 lifecycle decisions | **Not ratified** | **David.** Includes the terminal wording this branch single-sourced — see below |
| `portal.vaclaimsedge.com` DNS, TLS, canonical host | Not done | **David** (domain ownership), **Obaid** (configuration) |
| Analytics destination and privacy review | Not done | **David** |
| Live claimant portal and self-registration | Not built | **Obaid** (claimant-scoped RLS) + **David** (phase approval, privacy) |
| Appeals / HLR / supplemental workflow | Not built | **David** (ratify the 2026-08-20 decision) |

**One wording decision needs David specifically.** The stop-clock radio read "Non-successful" while the client directory read "Relationship ended" for the same outcome code. Single-sourcing them had to pick one; it picked the directory's wording. The 2026-08-20 packet recommended "Claim completed" and "Services concluded" instead, and no artefact records that David ratified anything. Changing it is now a **one-line edit in one array** (`TERMINAL_OUTCOMES` in `src/app/lib/workflow-data.js`) rather than a hunt across five files.

---

## 6. Known-issues register — 2026-09-02

Everything found and deliberately not fixed, with severity, location, and reason.

| # | Severity | Issue | Location | Why deferred |
|---|---|---|---|---|
| K1 | Medium | Panel and divider lines measure 1.33:1 against the panel background | `--vace-line`, `src/app/globals.css` | Grouping affordances rather than component boundaries, so not a 1.4.11 failure on their own. Raising them globally is a visible change to a design the client has already approved. Compliant under `prefers-contrast: more`. One-line change if David wants it by default |
| K2 | Medium | `loadClientRows` and `GET /api/clients` are unbounded — every client row on every dashboard render | `src/app/lib/supabase-server.js:127`, `src/app/api/clients/route.js:3` | One query returning a dozen rows today; degrades linearly. Pagination changes a contract Obaid consumes and is a product decision |
| K3 | Medium | `advance_stage` is not event-gated; it only checks `stage < 7` | `src/app/api/lifecycle/route.js` | The event-gated model in `workflow-data.js` is called by nothing. The contract says event-gated; the shipped path is staff-confirmed. **David's decision**, and changing it changes daily operations |
| K4 | Medium | The AI route sends claimant names and VA ratings to Anthropic on every request | `src/app/api/ai/route.js` | A live data-sharing decision, not a future one. Needs **David's** explicit answer, and it should appear in the privacy review |
| K5 | Low | The digest health probe measures the last digest *sent*, not the last *run* | `src/app/api/health/route.js` | `/api/notify` returns early on a quiet day without logging, so a quiet stretch shows amber with nothing broken. Fixing it means logging quiet runs, which changes Obaid's `notifications_log` semantics. Documented in `health-check-procedure.md` |
| K6 | Low | Stage 4 day-15/30/45 reminder settings are stored but are not digest triggers | `src/app/lib/settings-contract.js`, `src/app/api/notify/route.js` | `stageAlertDays()` returns the day-60 escalation for Stage 4; the earlier reminders are client-facing and the digest is staff-facing. Making them fire changes the digest's meaning — needs David. Flagged in the quarterly threshold review |
| K7 | Low | Four `threshold_*` legacy keys have no consumer | `src/app/lib/settings-contract.js` | Carried over from the pre-seven-stage step model. Surfaced in a clearly-labelled "Legacy step thresholds" group so nothing is silently dropped before the model is retired |
| K8 | Low | `fail` and `warn` share a badge tone | `src/app/dashboard/settings/SystemHealth.js` | The design system has no distinct failure tone; the text label distinguishes them, and the maintenance docs tell operators to read the label rather than the colour |
| K9 | Low | Seven endpoints have no caller in the repository | `api/appointments`, `api/evidence`, `api/messages`, `api/notify`, others | Some are for surfaces not yet built, some for the cron that does not exist. Deleting them would remove work Obaid may be depending on. Recorded rather than removed |
| K10 | Low | `AGENTS.md` shows a diff | `AGENTS.md` | Written and re-added by `next dev` itself (`node_modules/next/dist/server/lib/generate-agent-files.js`); the block states that committing it keeps the tree clean |
| K11 | Informational | The client portal `/portal` is public and synthetic | `src/app/portal/` | Making it a real authenticated claimant surface is a distinct workstream gated on claimant-scoped RLS. Its demo copy was corrected so it no longer advertises limits the real API rejects |

---

## 7. Production re-check — unauthenticated GET only, 2026-09-02

| Path | Status | Reading |
|---|---|---|
| `/` | 200 | Public entry, unchanged by the narrowed matcher |
| `/login` | 200 | Reachable |
| `/dashboard` | 307 → `/login` | From `dashboard/layout.js`, as before |
| `/portal` | 200 | Public, unchanged by the narrowed matcher |
| `/api/clients`, `/advisors`, `/notes`, `/payment-watch`, `/documents`, `/documents/signed-url`, `/settings`, `/messages`, `/appointments`, `/evidence` | 401 | The JSON contract `staffRequest()` depends on, preserved |
| `/api/ai`, `/api/notify`, `/api/lifecycle` | 405 | POST-only |
| `/api/cron`, `/api/cron/notify` | 404 | **Still do not exist. P2 remains open on Obaid** |
| `/api/health` | 404 | New on this branch, not deployed |

Nothing on this branch assumes a different contract from the one production serves today. The narrowed proxy matcher was chosen specifically to preserve all of the above.

**This evidence verifies route availability and that no endpoint leaks data without a session. It does not verify RLS correctness, authenticated behaviour, storage policies, cron execution, or email delivery** — none of which can be checked without credentials and an approved test.

---

## 8. Method and limits

- Work was done in a separate git worktree so the main checkout stayed on `cursor/va-client-intake-3493`, untouched.
- `npm ci`, `npm test`, `npm run lint` and `npm run build` were run on `origin/main` @ `f00141e` before any change, and again on the branch after a clean `rm -rf .next && npm ci`.
- The P1 proxy conclusion is proven by differential build output, not inferred.
- Bundle figures come from two clean builds — the baseline in a detached worktree at `f00141e`.
- Contrast figures are computed from the token values parsed out of `globals.css`, not read off a design file, and the computation ships as a test.
- Focus, target size, overflow and labelling figures were measured in a real browser against a local dev instance with synthetic fixtures, not asserted from source.
- Route handlers are tested against an in-memory Supabase fake that models RLS as "no rows" rather than "denied", which is what makes the cross-client results meaningful. It is a fake: it proves the **route** cannot see what it must not see. It does **not** prove the production RLS policies are correct — those are not in the repository.
- No secret value was read, printed, or stored at any point. The handoff documentation records environment variables by name and purpose only.
- Only this folder was created under `client-operations`. No git operation was run there.
