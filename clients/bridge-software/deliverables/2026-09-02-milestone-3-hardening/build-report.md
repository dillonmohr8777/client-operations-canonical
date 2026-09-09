# Milestone 3 hardening — build report

Date: 2026-09-02
Repository: `dillonmohr8777/bridge-software-frontend`
Branch: `codex/milestone-3-hardening-20260902` (from `origin/development` @ `f548013`)
Status: draft pull request into `development`. Nothing merged, deployed, or promoted.

---

## Vocabulary warning — read before quoting any "Phase" number

"Phase" means two different things in this engagement and confusing them is expensive.

| Term | Meaning | Status |
|---|---|---|
| **Contract Phase / Milestone 4** | Directory MVP, **$13,500** | **Not started.** Nothing in this work touches it |
| **Contract Milestone 3** | Accounts, auth, verification | In progress. This work hardens it |
| **Contract Phase / Milestone 6** | Testing and QA | Where Bridge's test and audit work sits contractually |
| **Build-spec Phase 4** (`CLAUDE_BUILD_SPEC.md`) | Supabase integration, gated by Human Gate B | Blocked. Five of eight items undefined |
| **Build-spec Phases 5 and 6** | Required states/resilience; test and audit | Delivered here |

The signed proposal ("The Ecosystem Proposal 45k — Updated 2026-06-08", $45,000 across six
milestones) organises the work into six milestones, titles the sections Phase 1–6, and heads
the pricing table "MILESTONE SCOPE". In the client's contract, Phase and Milestone are the
same thing.

**This pull request is Milestone 3 hardening plus build-spec Phases 5 and 6. It does not
start contract Phase 4 and it triggers no payment.** Whenever "Phase 4" appears below it is
qualified as build-spec Phase 4.

---

## What shipped

### 1. `/join` Step 1 restored as the entry screen, account creation added as its own step

Greencubes' `feature/admin-login` deleted `/join` Step 1 — the twelve-role grid, the
"Step 1 of 4" heading, the per-role requirements copy, the $349 founding-member callout and
the Steps 2–4 boundary note — and replaced it with a signup card. That removed the only
place the product captures a member's role, which the organization-onboarding and
verification slices both depend on, and destroyed the exact surface whose Step 2 and Step 4
product approval is still open with Melissa and Tori.

Nothing was reverted. The correct sequence was designed so both screens survive:

| Screen | Route | Contents |
|---|---|---|
| Step 1 of 4 | `/join` | Twelve-role grid, per-role next-step title and requirements, "Step 1 of 4" heading, $349 founding-member callout, Steps 2–4 boundary note. Visual design unchanged |
| Step 2 of 4 | `/join/account` | Display name, email, password, confirm. Shows the role selected in Step 1 with a "Change role" link back |

- `lib/join-roles.ts` — the twelve-role catalog lifted out of the form so both screens share
  one source and it can be tested.
- `app/join/join-form.tsx` — Continue now submits to `/join/account?role=<role>`.
- `app/join/account/page.tsx`, `app/join/account/join-account-form.tsx` — Step 2.

Verified in the running app: all twelve role radio values, "Step 1 of 4", the $349 callout
and the "Steps 2–4" boundary copy are present in `/join`.

### 2. One HTTP client, with a mock-mode fallback

Greencubes added `lib/auth/api.ts` as a second HTTP client bypassing the Phase 3 adapter, so
the contract's status mapping (401/403/400/422/409) existed once and not at all in the auth
layer, and `/login` had no mock-mode fallback — it posted to the Netlify origin itself and
404'd in the repo's documented default configuration.

- `register` / `login` / `logout` were added to the **existing `Phase3Client` contract**
  (`lib/phase3/types.ts`), so auth inherits the same base URL, the same `mapStatus`, the
  same `Phase3Error`, and the same mock fallback as every other call.
- `lib/phase3/http-client.ts` — `credentials: "include"` preserved. Contracted paths:
  `/api/v1/auth/register`, `/api/v1/auth/login`, `/api/v1/auth/logout`.
- `lib/phase3/mock-client.ts` — mock `register` / `login` / `logout`, so `/login` and
  `/join/account` work with no backend. An email containing "admin" returns admin claims,
  which is how role routing is exercisable in preview.
- `components/auth/AuthProvider.tsx` — no token, nothing in `sessionStorage` or
  `localStorage`; the session is read from the API each load, as an httpOnly cookie session
  requires. `unavailable` is a distinct status from signed-out.

**Tokens and D-10.** Cookie sessions stay the default and the only mode the app ships in.
The bearer path is a narrow, clearly-marked seam: the token is held in memory on the client
instance, never persisted, never logged, and `credentials` is `"omit"` in that mode because
a credentialed request fails outright without `Access-Control-Allow-Credentials`. D-10 can
be settled either way without a rewrite. A test asserts no client file references web
storage.

### 3. Required states and resilience (build-spec Phase 5)

`components/RouteState.tsx` — one component covering loading, empty, error, forbidden,
unavailable and retry, with correct `role="status"` / `role="alert"` and `aria-busy`.
`safeMessage()` only lets a `Phase3Error`'s curated `userMessage` through; a raw `TypeError`,
a stack, or a backend string collapses to the caller's fallback, so internals cannot leak.

| Route | States covered |
|---|---|
| `/login` | Session loading, unavailable + retry, already-authenticated, sign-in error (never distinguishes "no such account" from "wrong password"), submit-blocked |
| `/join` | Populated; static Steps 2–4 boundary note |
| `/join/account` | Inline validation (name, email, password length, mismatch), submit blocked, submitting, registration error by kind, submitted/pending, preview-mode note |
| `/my-profile` | Loading, error with retry, forbidden without a retry (retrying a permission denial is pointless), plus the existing pending/success/conflict mutation states |
| `/create` | Session loading, session error with retry, forbidden, existing upload/publish validation and success states |
| `/explore` | Loading while favorites hydrate, two distinct empty states, and a visible notice when browser storage is unavailable instead of failing silently |
| `/admin/*` | Checking access, unavailable + retry, forbidden (administrator required), queue empty with a reset action |

### 4. Role-aware routing

- `/login` sends members to `/my-profile` and admins to `/admin`.
- `/admin` no longer 404s — `app/admin/page.tsx` redirects. On this branch the target is
  `/admin/verification`; when the Greencubes dashboard lands, the target becomes
  `/admin/dashboard` (one line, commented in place).
- `components/NavMenu.tsx` — Admin link for admins, Sign in / Sign out by session status.
- `lib/safe-next.ts` — `?next=` accepts only same-origin single-slash paths; absolute URLs,
  `//host` and `/\host` are rejected.

Every one of these carries an explicit comment that client-side routing is presentation
only and never authorization, and that the API must still return 401/403 when it is
bypassed.

### 5. Admin panel retokenised, accessibility fixed

The Greencubes admin block was ~110 lines of raw hex — its own accent purple, its own dark
ground, its own radii — ignoring the theme switcher entirely. That is a second visual
system, which Dillon explicitly ruled out ("a separate admin panel is fine … no separate
visual system").

- Rewritten against the semantic tokens. **Zero raw hex colours**, asserted by test. Radii
  derive from `var(--radius)`.
- Verified live: the admin shell background resolves to `--canvas` and follows the theme —
  switching to Trusted Current gives a light shell (`#f5f8f7`) with dark text, where the
  Greencubes version stayed dark regardless.
- The skip link is no longer hidden on admin pages (WCAG 2.4.1 bypass-blocks). Verified in
  the running app: present, `display: block`.
- Sidebar close/sign-out controls given 44px minimum targets; `prefers-reduced-motion`
  respected.

**Contrast, measured.**

| Element | Before (Greencubes, hardcoded) | After (token, per theme) |
|---|---|---|
| "WORKSPACE" sidebar label | `#5f5868` on `#0d0a11` — **2.88:1** | `--muted`: 8.58 / 5.36 / 5.44 : 1 |
| Signed-in account email | `#625b69` on `#0d0a11` — **3.01:1** | `--muted`: 8.58 / 5.36 / 5.44 : 1 |
| Membership meta, empty states | `#746d7d` on `#0f0c13` — **3.90:1** | `--muted`: 8.58 / 5.36 / 5.44 : 1 |
| Card subtitles | `#756e7e` on `#0f0c13` — **3.96:1** | `--muted`: 8.58 / 5.36 / 5.44 : 1 |
| "Admin" role caption | `#766e80` on `#0f0c13` — **3.98:1** | `--muted`: 8.58 / 5.36 / 5.44 : 1 |

(After column: Modern Network / Trusted Current / Botanical, `--muted` on `--surface`. AA
needs 4.5:1 for this text size. All five were failures; all five now pass in all three
themes.)

**Two pre-existing token failures the automated check found on `development`,** neither
introduced by Greencubes and neither previously known:

| Token | Was | Now |
|---|---|---|
| Botanical `--muted` on `--surface-alt` | 4.34:1 — **fails AA** | `#606c63`, **4.61:1** |
| Botanical `--danger` (never declared, inherited the dark-theme red `#ff8179`) | **2.22:1 on the light ground** — form errors were effectively unreadable in the Botanical theme | `#b42318`, **6.02:1** |

### 6. Test and audit (build-spec Phase 6)

**CI, which did not exist.** The repository had no GitHub Actions at all, which is how a
branch failing `npm run test:phase3` reached a pull request. `.github/workflows/ci.yml` runs
`npm ci`, `test:phase3`, `typecheck`, `lint` and `build` on pull requests into `development`
and `production`. No new dependencies. `npm ci` rather than `npm install`, so lockfile drift
fails loudly instead of silently (the exact drift seen on `feature/admin-login`). The build
step pins `NEXT_PUBLIC_BRIDGE_API_BASE` empty so CI always proves the documented mock-mode
default still builds.

**Automated accessibility check, no new dependencies.** `lib/contrast.ts` implements the
W3C relative-luminance and contrast-ratio formulas; `lib/contrast.test.ts` parses the token
blocks straight out of `app/globals.css` — so the measured values can never drift from what
ships — and asserts WCAG 2.2 AA for every rendered foreground/background pair in all three
themes. It also asserts the admin block declares no raw hex and that the skip link is never
hidden. Self-checked against the published WCAG worked example (`#777777` on white = 4.48:1,
fails; `#767676` = 4.54:1, passes).

**Suite: 24 → 45 tests.** New coverage: the twelve-role catalog and its copy, role
round-trip from Step 1 to Step 2 with unknown values discarded, post-sign-in landing paths,
the open-redirect guard, auth going through one client with one base URL and one status
mapping, auth errors mapping to `Phase3Error`, the bearer seam omitting credentials and
being inert under cookie transport, no client file touching web storage, the full mock auth
flow with no backend, mock validation rejections, and `getPhase3Client` falling back to the
in-memory adapter.

---

## Verification

All commands run on Dillon's machine in a clean worktree with `node_modules` and `.next`
deleted and `npm ci` re-run. Node v24.18.0, npm 12.0.2, Next.js 16.3.1.

| Gate | Baseline (`origin/development` @ `f548013`) | This branch |
|---|---|---|
| `npm ci` | ok | ok |
| `npm run test:phase3` | **24 tests, 24 pass, 0 fail** | **45 tests, 45 pass, 0 fail** |
| `npm run typecheck` | pass | pass |
| `npm run lint` | pass | pass |
| `npm run build` | pass, 33 static pages | pass, **36 static pages** |

The three new pages are `/login`, `/join/account` and `/admin`.

**Mock mode with no backend, verified live** (`next start`, `NEXT_PUBLIC_BRIDGE_API_BASE`
unset):

| Route | Status |
|---|---|
| `/`, `/join`, `/join/account`, `/login`, `/my-profile`, `/explore`, `/create`, `/admin`, `/admin/verification` | all **200** |

`/admin` redirects to `/admin/verification` (it returned **404** on the Greencubes deploy
preview). Signed out through the nav, `/login` rendered the working form with its preview
notice, signing in as `admin@example.invalid` landed on the admin portal, the retokenised
shell rendered with the skip link present, and the queue's empty state and reset action
both worked.

**No environment binding.** `NEXT_PUBLIC_BRIDGE_API_BASE` was never set. No Netlify, Render
or GitHub settings were changed, no accounts created, no Slack posted, no PR #13 comment,
nothing merged or promoted.

---

## What stays blocked on Human Gate B, and who owes it

Build-spec Phase 4 is Supabase integration and is gated by Human Gate B. Five of its eight
required items are still undefined, so no backend integration was invented.

| Gate B item | Status | Owner |
|---|---|---|
| Auth provider and session contract | Partial — auth routes exist and were probed live, but the contracted `/api/v1/session` and the served `/api/v1/auth/me` disagree | **Miraj** |
| User↔profile and user↔organization relationships | Undefined | **Miraj** |
| Tables/views, identifiers, enums, timestamps, nullability | **Missing** | **Miraj** |
| Row-level-security intent for every read/write path | **Missing** | **Miraj** |
| Storage buckets, file types, size limits, signed URLs, retention | **Missing** | **Miraj** |
| Server action / API / RPC boundaries and error shapes | Partial — a consistent `{error, message}` envelope exists; no route table | **Miraj** |
| Audit-event requirements and admin-role assignment | **Missing** | **Miraj** |
| Local / preview / production environment-variable strategy | **Missing** | **Miraj**, with Dillon on the Netlify side |

Also still open and not addressed here:

| Item | Owner |
|---|---|
| D-01 production brand approval; Steps 2 and 4 product approval on `/join` | **Tori / Melissa** |
| D-03 exact verification evidence per role | **Tori / Miraj / compliance** |
| D-09 canonical repository (`getonthebridge0-max/thebridge` returns 404 to an admin token) | **Dillon** |
| D-10 cookie sessions vs bearer tokens | **Dillon / Miraj** |
| Verification queue contract: paginated cases, case detail, evidence references, scan state, decisions with reason codes, audit events | **Miraj** |

---

## What Miraj must change on his side

1. **Send `Access-Control-Allow-Credentials: true`.** It is absent on every response and on
   the preflight. This single header restores cookie sessions and resolves the failing test,
   the undeclared bearer switch, and the refresh-token-in-`sessionStorage` problem together.
   The CORS allowlist itself is already correct — a genuine three-origin allowlist that
   returns no header for a bogus origin.
2. **Do not put tokens in browser storage.** `docs/INTEGRATION-PIPELINE.md` names access
   tokens and browser storage explicitly. The refresh token is the long-lived credential and
   any XSS on any Bridge page can read it today. It is also stored but never used — no
   refresh call, no expiry check, no 401 re-auth — which is full exposure for no benefit.
3. **Reconcile the session-claims path.** The contract says `/api/v1/session`; staging serves
   `/api/v1/auth/me`. Pick one and record it.
4. **Supply the missing session claims.** Six of nine are absent: `ageEligible`,
   `membershipStatus`, `organizationVerificationState`, `delegatedPermissions`,
   `stateLicenseEligibility`, `adminScope`. Age eligibility matters most — Bridge runs a 21+
   gate with no server-authoritative signal behind it.
5. **Settle one shape per concept.** `/auth/me` returns `platformRoles: "admin"[]`;
   `/admin/users` returns `platformRole: string | null`.
6. **Supply the verification-queue response schema.** The frontend currently probes five
   possible envelope keys and three names per field, typed `unknown`. That defensive code is
   direct evidence no schema was ever given.
7. **Move `/admin/users` search and filters server-side.** They run client-side over the 50
   loaded rows, so a match on page 3 is invisible while the header still reports unfiltered
   totals.
8. **Two health endpoints report two service names** — `thebridge-api` at the root,
   `bridge-api` under `/api/v1`. One question: two apps, or a rename mid-flight?
9. **Housekeeping on `feature/admin-login`:** revert the repository-pointer rewrite in
   `CLAUDE.md` / `CLAUDE_BUILD_SPEC.md` / `CLAUDE_SESSION_PROMPT.md` (D-09), restore
   `credentials: "include"`, revert the `next-env.d.ts` edit and the lockfile drift, and
   squash the three identically-messaged commits.

The backend security posture remains the strongest part of the Greencubes delivery: real
server-side RBAC rejecting missing and forged bearer tokens on every protected route, a
correct CORS allowlist, and strong response headers. The gaps above are cheap to close.

---

## Files

**New:** `lib/join-roles.ts`, `lib/safe-next.ts`, `lib/contrast.ts`, `lib/contrast.test.ts`,
`lib/join-roles.test.ts`, `components/RouteState.tsx`, `components/auth/AuthProvider.tsx`,
`components/auth/RequireAuth.tsx`, `components/admin/AdminShell.tsx`,
`app/join/account/page.tsx`, `app/join/account/join-account-form.tsx`, `app/login/page.tsx`,
`app/login/login-form.tsx`, `app/admin/page.tsx`, `app/admin/layout.tsx`,
`.github/workflows/ci.yml`.

**Modified:** `lib/phase3/types.ts`, `lib/phase3/http-client.ts`, `lib/phase3/mock-client.ts`,
`lib/phase3/index.ts`, `lib/phase3/phase3.test.ts`, `app/globals.css`, `app/layout.tsx`,
`app/join/join-form.tsx`, `app/my-profile/my-profile-client.tsx`,
`app/create/create-client.tsx`, `app/explore/explore-client.tsx`,
`app/admin/verification/page.tsx`, `app/admin/verification/verification-client.tsx`,
`components/NavMenu.tsx`, `package.json`, `docs/decision-log.md`.
