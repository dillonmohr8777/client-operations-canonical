# Bridge — Greencubes integration reconciliation, 2026-09-02

**Status: internal working document. Nothing here has been sent, posted, or merged.**

| | |
|---|---|
| Client | Bridge Software (Tori / Mac) |
| Vendor | Greencubes (Miraj, Fahad `clickthedemo`) |
| Reviewed | PR #13 "Feature/admin login", head `fde9cf035ba011592a997fb33fbd99c44c1bcc1b` |
| Base | `development` @ `f548013a2f6985a8be5c52de8338abaa67c81e85` (branch is current; PR is MERGEABLE) |
| Backend | `https://bridge-software-backend.onrender.com` — `bridge-api` v0.1.0, environment `development` |
| Deploy preview | `https://deploy-preview-13--bridge-connected-signal-dev.netlify.app` (live) |
| Client meeting | Thursday 2026-09-03 with Tori |
| Full evidence | `docs/phase3/06-greencubes-integration-review-2026-09-02.md` on branch `claude/va-claims-slack-bridge-qg1vqa` (PR #14, still DRAFT) |
| Draft PR review | `docs/phase3/07-pr13-review-draft-2026-09-02.md` — DRAFT, NOT POSTED |

---

## 1. Status in one line

Greencubes delivered a genuinely secure backend and a working admin/auth frontend, but the
branch cannot merge as it stands: five blocking items, one of which replaced an approved
product screen and one of which breaks a written security rule.

## 2. What Greencubes delivered vs the contract

### Delivered and verified working

| Area | Verified |
|---|---|
| Server-side RBAC | `/api/v1/auth/me`, `/api/v1/admin/users`, `/api/v1/admin/verification-queue` all return `401` unauthenticated **and** with a forged `Bearer` token. This is the 2026-08-31 requirement, met. |
| CORS | Real allowlist. Echoes exactly `bridge-connected-signal-dev.netlify.app`, `bridge-connected-signal.netlify.app`, `http://localhost:3000`; returns no header for an unknown origin. `Vary: Origin` present. Preflight returns 204 with the right headers/methods. |
| Security headers | HSTS, restrictive CSP, `nosniff`, `Referrer-Policy: no-referrer`, COOP, CORP, `X-Frame-Options`. Consistent `{error, message}` error envelope. |
| Health/version | `/api/v1/health` 200, `/api/v1/version` 200 (`bridge-api` 0.1.0, `development`). Root `/health` also 200 but reports `thebridge-api` — two service names, worth one question. |
| Frontend gates | `typecheck`, `lint`, `build` all pass locally (43 routes). |
| Sign-in routing | `/login` sends admins to `/admin/dashboard` and members to `/my-profile` — matches Dillon's 2026-08-31 direction. `?next=` is properly sanitised against open redirects. |
| Role-aware nav | `NavMenu` shows Sign in / Admin dashboard / Sign out by state. `/unauthorized` exists. `RequireAuth` guards `/admin/*` and `/my-profile`. |
| Registration + recovery | `/join` signup posts to `/auth/register` with 409 handling and a client-side password policy; forgot-password, reset-password (Supabase fragment-token flow), and resend-verification screens all work. |
| Verification queue | Filters are sent as real server-side query parameters. |

### Not delivered, or delivered against the contract

| Contract item | Reality |
|---|---|
| Nine required session claims | About four arrive. **`ageEligible` is missing** and Bridge runs a 21+ gate, so there is no server-authoritative age signal. `membershipStatus`, `organizationVerificationState`, `delegatedPermissions`, `stateLicenseEligibility`, `adminScope` also absent. |
| Cookie sessions with `credentials: include` | Switched to pure bearer tokens without the contract-required flag. `Access-Control-Allow-Credentials` is absent from every response and from the preflight — that single missing header is the whole cause. |
| Route table and response examples | Still not supplied. The frontend's `normalizeQueue` probes five possible envelope keys because nobody documented the shape. |
| "Do not restyle the product or replace screens" | `/join` Step 1 was replaced. |
| Never place access tokens in browser storage | Both access and refresh tokens are written to `sessionStorage`. |
| Design tokens, no separate visual system | The admin portal uses ~35 raw hex colours and ignores the theme system. |
| Backend repo / branch / commit | Still not supplied. This was the precondition Dillon set on 2026-08-31 for turning off mock mode. |

## 3. Blocking items (must clear before merge to `development`)

1. **B1 — Repository pointer rewritten.** `9f5fa49` changes `dillonmohr8777/bridge-software-frontend`
   to `getonthebridge0-max/thebridge` in `CLAUDE.md`, `CLAUDE_BUILD_SPEC.md` and
   `CLAUDE_SESSION_PROMPT.md` (four lines). **Evidence:** `gh api repos/getonthebridge0-max/thebridge`
   returns HTTP 404 to a `repo`-scoped admin token, and `getonthebridge0-max` is still a
   pending invitee. That repository cannot be canonical. Greencubes reverts the four lines.
2. **B2 — `npm run test:phase3` fails.** 23 pass, 1 fail, because `credentials: "include"`
   was commented out in `lib/phase3/http-client.ts`. A required gate in both `CLAUDE.md` and
   `CONTRIBUTING.md`.
3. **B3 — Bearer-token switch never flagged.** The contract explicitly requires flagging this
   before changing the frontend client. Fixable at source with one response header.
4. **B4 — `/join` Step 1 was replaced, not integrated.** The twelve-role selection grid, the
   per-role requirements copy, the "Step 1 of 4" framing, the founding-member pricing callout,
   and the boundary note were all deleted and replaced with a plain signup card. This breaks
   three written instructions, removes the only place the product captures a member's role,
   and deletes the exact surface Melissa and Tori are still approving.
5. **B5 — Access and refresh tokens in `sessionStorage`.** `docs/INTEGRATION-PIPELINE.md`
   names browser storage as a prohibited location for access tokens. Any XSS reads the
   long-lived credential.

B2, B3 and B5 collapse into one change: Greencubes adds `Access-Control-Allow-Credentials: true`,
the frontend restores `credentials: "include"`, and the refresh token moves to an httpOnly cookie.

## 4. Should-fix before production

- Session claims, `ageEligible` first.
- No mock-mode fallback in `lib/auth/api.ts` — with `NEXT_PUBLIC_BRIDGE_API_BASE` unset, the
  documented `npm run dev` gives a `/login` screen that cannot work and does not say why.
- The refresh token is stored but never used: no refresh call, no expiry check, no 401 re-auth.
- Two parallel HTTP clients — the auth layer bypasses `lib/phase3/` and its status mapping.
- `platformRoles` (array) vs `platformRole` (string) shape mismatch across two endpoints.
- `/admin/users` search and filters run only over the loaded page, while the header shows
  unfiltered totals above a filtered table.
- Verification-queue response shape undocumented.
- Admin dashboard shows four hardcoded tiles as if they were live metrics.
- Admin portal is a separate palette; retokenise without changing the layout.
- Accessibility: four text colours fail WCAG AA (2.9:1 to 3.9:1 at 0.6–0.8rem), and the skip
  link is hidden on every admin page.
- Minor: `/admin` itself 404s, commented-out dead code, edited `next-env.d.ts`, lockfile drift,
  three identical commit messages, one missing `role="alert"`.

## 5. What needs improvement on Dillon's end

This is Dillon-owned frontend and process work, not Greencubes'.

| # | Item | Why it is Dillon's | Effort |
|---|---|---|---|
| 1 | **Restore `/join` Step 1 and design the real relationship between account creation and role selection.** Greencubes should revert, but the *sequence* — create account, then choose role, then organization details — is a product/UX decision Dillon owns. Decide whether signup becomes `/join/account` ahead of role selection, or a step 0 inside the existing flow. | Canonical UX ownership per `INTEGRATION-PIPELINE.md` | Half a day of design, then a small PR |
| 2 | **Give the auth layer a mock-mode fallback, or fail loudly.** `lib/phase3/client.ts` already does this correctly; `lib/auth/api.ts` does not. Dillon owns the adapter pattern. | Adapter architecture is Dillon's | 1–2 hours |
| 3 | **Fold `lib/auth/api.ts` into the Phase 3 adapter** so there is one client, one base-URL computation, and one error model with the contract's 401/403/400/422/409 mapping. | Frontend architecture | Half a day |
| 4 | **Retokenise the admin portal** onto the Bridge semantic tokens and fix the four contrast failures and the hidden skip link. Keep Miraj's layout. | Design system is Dillon's | Half a day |
| 5 | **`/login` polish.** Currently functional but bare: no "signing in" skeleton beyond a button label, `status !== "unauthenticated"` renders a bare "Checking your session…" paragraph, no Bridge editorial treatment, no remember-me, no explicit unverified-email path. | Dillon's screen | Half a day |
| 6 | **Member routing and the `/admin` redirect.** Add `/admin` → `/admin/dashboard`. Confirm `/my-profile` is the right member landing now that it is auth-gated, and decide what a member with no organization membership sees. | Product routing | 1–2 hours |
| 7 | **Role-aware navigation beyond sign-in/sign-out.** The nav now knows admin vs member; it should also reflect membership status and verification state once those claims land. | Dillon's component | Blocked on claims |
| 8 | **Join Steps 2–4 screens.** Still pending Melissa/Tori product approval. Dillon can build them against the mock adapter now and bind them later. | Dillon's screens, client-gated | 2–3 days once approved |
| 9 | **Session-claim handling.** Extend the frontend session model to the nine contract claims and make `ageEligible` authoritative for the 21+ gate instead of the current localStorage-only confirmation. | Dillon's model | Half a day, blocked on backend |
| 10 | **Documentation debt Miraj's delivery creates.** `docs/INTEGRATION-API-CONTRACT.md` still lists only the seven Phase 3 endpoints and marks the auth/admin routes "to confirm"; `docs/INTEGRATION-PIPELINE.md` still explains why `/join` shows Step 1; `docs/phase3/00-status.md` still says the live bind is waiting on a staging origin that now exists. All three need updating once PR #13 resolves. | Dillon's docs | 2 hours |
| 11 | **CI.** `gh pr checks 13` reports no checks at all. The four required gates run only on someone's laptop. A minimal GitHub Actions workflow running `test:phase3`, `typecheck`, `lint`, `build` on every PR would have caught B2 automatically. | Repo owner | 1 hour, high leverage |

## 6. Can Dillon start Phase 4 on his side?

**Definition.** "Phase" here is the six-phase build process in `CLAUDE_BUILD_SPEC.md`, not
Greencubes' six-milestone commercial plan (where milestone 3 is the integration Miraj is
finishing). The build phases are: 1 direction, 2 UX system, 3 productionize flows against
typed mock adapters, **Human gate B — Miraj backend contract**, 4 Supabase integration
(replace mock adapters one bounded flow at a time), 5 required states and resilience,
6 test and audit.

**Phase 4 is explicitly gated behind Human gate B**, which requires eight documented items
before any live service is connected.

| Gate B requirement | Status after 2026-09-02 |
|---|---|
| Auth provider and session contract | **Partial** — bearer tokens confirmed live, Supabase fragment recovery flow observed, but TTL, refresh/rotation and six of nine claims are undocumented |
| User-to-profile and user-to-organization relationships | **Partial** — `/auth/me` returns `memberships` with role and status; no schema |
| Tables/views, identifiers, enums, timestamps, nullability | **Missing** |
| Row-level-security intent per read/write path | **Missing** |
| Storage buckets, file types, size limits, signed URLs, retention | **Missing** — this is the evidence-upload design Dillon asked for on 2026-08-31 |
| API boundaries and error shapes | **Partial** — `{error, message}` envelope confirmed; no route table |
| Audit events and admin-role assignment | **Missing** |
| Environment-variable strategy per environment | **Partial** — one Render `development` origin exists; no staging/production split |

**Answer: conditional yes — one bounded flow only.**

Phase 4 says to replace mock adapters *one bounded flow at a time*. The auth/session/RBAC
flow now has enough live contract to be that first bounded flow, and Miraj has effectively
already started it. Nothing else does. Do not bind `NEXT_PUBLIC_BRIDGE_API_BASE` on the
preview site until B1–B5 clear and Miraj supplies backend repo/branch/commit.

**The first three things Dillon can start today, in parallel, without waiting on Greencubes:**

1. **Unify the HTTP client and add the mock-mode fallback** (items 2 and 3 above). This is
   pure frontend, needs no backend answer, and is the precondition for every later bounded
   flow. It also makes `npm run dev` work again for anyone cloning the repo.
2. **Restore `/join` Step 1 and design the account-creation sequence** (item 1). Product/UX
   work Dillon owns outright, and it needs to be settled before Melissa and Tori can approve
   Steps 2–4.
3. **Add the CI workflow and retokenise the admin portal** (items 11 and 4). Both are
   self-contained, both remove recurring review cost, and the CI job would have caught the
   failing test before it reached a PR.

Item 9 (session-claim handling) is the fourth, and it is the one to start the moment Miraj
confirms the claim list — it unblocks the 21+ gate becoming server-authoritative.

## 7. What Dillon must decide before Thursday

1. **D-09 — canonical repository.** Recommendation: stays `dillonmohr8777/bridge-software-frontend`;
   Greencubes reverts the four pointer lines. Evidence: 404 to an admin token.
2. **D-10 — cookie sessions or pure bearer tokens.** Recommendation: ask for
   `Access-Control-Allow-Credentials: true` and go back to cookies. If the answer is bearer,
   it must be recorded as an accepted risk with a short access-token TTL and server-side
   revocation, and the refresh token still cannot sit in `sessionStorage`.
3. **`/join` — revert, or accept the replacement?** Recommendation: revert, and treat account
   creation as a separate screen. This one is time-sensitive because it changes what Tori sees.
4. **What Tori sees on Thursday.** The deploy preview is live and looks finished. Decide
   whether to demo it, and if so, whether to show the replaced `/join` at all.
5. **Whether to bind `NEXT_PUBLIC_BRIDGE_API_BASE` on the preview site.** Recommendation: not
   yet — the backend reports `environment: development` and the evidence list is incomplete.
6. **Whether to post the PR #13 review** in `docs/phase3/07-pr13-review-draft-2026-09-02.md`
   as written, or to send the Slack reply first and let Miraj's "final update tomorrow" land.

## 8. Links

- PR #13: https://github.com/dillonmohr8777/bridge-software-frontend/pull/13
- PR #14 (draft, holds the review): https://github.com/dillonmohr8777/bridge-software-frontend/pull/14
- Deploy preview: https://deploy-preview-13--bridge-connected-signal-dev.netlify.app
- Backend: https://bridge-software-backend.onrender.com/api/v1/version
- Full evidence: `docs/phase3/06-greencubes-integration-review-2026-09-02.md`
- Draft PR review text: `docs/phase3/07-pr13-review-draft-2026-09-02.md`
- Slack reply draft: `slack-draft.md` in this folder — DRAFT, NOT SENT
