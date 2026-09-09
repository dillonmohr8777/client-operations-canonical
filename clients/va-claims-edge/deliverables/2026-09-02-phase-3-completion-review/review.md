# VA Claims Edge — Phase 3 completion review (code level)

**Prepared:** 2026-09-02
**Reviewed commit:** `f00141e` (`origin/main`, "Phase 3 - storage API for secure file upload, download, and delete")
**Review branch:** `review/phase-3-completion-20260902` (local, off `origin/main`)
**Cleanup branch / PR:** `codex/phase-3-cleanup-20260902` → https://github.com/vaclaims-dev/vace-platform/pull/4 (DRAFT, not merged, not deployed)
**Repo:** `vaclaims-dev/vace-platform`
**Checkout:** `C:\Users\dillo\Documents\Codex\projects\client-operations\clients\va-claims-edge\workspace\vace-platform`

Nothing was posted, sent, deployed, merged, or written to production. All production
checks were unauthenticated read-only HTTP GETs.

---

## Verified

### Repository state

```
git fetch origin --prune
git log --oneline -3 origin/main
  f00141e Phase 3 - storage API for secure file upload, download, and delete
  2c8ca3e Docs - document RLS policy fixes for notes and timeline_events insert
  2dff98d Merge PR #3 - staff client intake, live lifecycle controls, notes, and advisor writes
git checkout -B review/phase-3-completion-20260902 origin/main
```

Confirms the Slack account of the merge and Obaid's two follow-up commits. The
`cursor/va-client-intake-3493` branch was not touched.

### Local toolchain

| Command | Result |
|---|---|
| `npm ci` | exit 0 |
| `npm test` (`node --test tests/*.test.mjs`) | **18 pass, 0 fail, 0 skipped**, 439ms |
| `npm run lint` (`eslint`) | exit 0, no output |
| `npm run build` (`next build`, Next.js 16.3.1 Turbopack) | exit 0, 27 routes, compiled in 3.3s |

Test files: `tests/appointments.test.mjs`, `domain-models.test.mjs`,
`payment-watch.test.mjs`, `staff-writes.test.mjs`, `workflow.test.mjs`.
Note the count rose from the 13/13 recorded in the 2026-08-15 closeout to 18/18.

### Authentication guards on every API route

Read every handler under `src/app/api/**`. Fifteen of sixteen handler files open with
the same three lines:

```js
const auth = await getAuthenticatedSupabase()
if (auth.configurationMissing) return jsonFailure('Service configuration is incomplete.', 503)
if (!auth.user) return jsonFailure('Authentication required.', 401)
```

Covered: `advisors`, `ai`, `appointments`, `clients`, `clients/[id]`, `documents`,
`documents/signed-url`, `evidence`, `lifecycle`, `messages`, `notes`, `notify`,
`payment-watch`, `settings`.

The one exception is `src/app/api/profile/validate/route.js:8` — POST with no auth
guard. It is a pure validator (`validateProfile`), performs no database access, and
returns only field keys and safe messages. Acceptable as designed; recorded here so
the exception is deliberate rather than overlooked.

`getAuthenticatedSupabase()` (`src/app/lib/supabase-server.js:109`) builds an SSR client
with `NEXT_PUBLIC_SUPABASE_ANON_KEY` and the request's cookies. No service-role key
appears anywhere in the codebase, so Postgres RLS is genuinely the enforcement layer on
every query — correct, and it means the RLS policies themselves carry the whole weight.

### Secret scan

```
git log --oneline -S"sk-ant-"  --all   -> 0
git log --oneline -S"eyJhbGciOiJIUzI1NiIs" --all -> 0
git log --oneline -S"service_role" --all -> 0
git log --oneline -S"SUPABASE_SERVICE" --all -> 0
git log --oneline -S"RESEND_API_KEY=" --all -> 0
git log --oneline -S"ANTHROPIC_API_KEY=" --all -> 0
git log --oneline -S"re_" --all -> 1  (0a02845, false positive)
git ls-files | grep -i env -> (empty)
```

**No secret is committed to git history.** The single `re_` hit is the identifier
`first_pre_exam_briefing_scheduled` in `src/app/lib/workflow-data.js:64`, not a Resend
key. No `.env*` file is tracked; `.gitignore` covers `.env*`. All three providers read
from `process.env` at call time, and `getResendClient()` lazily constructs the client
so a missing key degrades to 503 rather than crashing the module.

### Storage API behaviour (`f00141e`)

Read in full. Present and correct: MIME allowlist (PDF/JPEG/PNG/WebP), 50MB cap,
`upsert: false`, filename sanitised to `[^a-z0-9.-]` before use, one-hour signed URLs,
auth required on GET/POST/DELETE, and errors that never leak the driver message.
Gaps are in Findings S1–S3 below.

### Production, unauthenticated, read-only

See the Production checks table.

---

## Findings

Severity: **High** = exploitable or actively broken in production. **Medium** = real
defect with a bounded blast radius. **Low** = correctness or hygiene.

### P1 — HIGH — `proxy.js` has never executed; Supabase sessions are not being refreshed

`proxy.js` (repo root, now `src/proxy.js` on the PR branch)

Next.js 16 renamed Middleware to Proxy and resolves the file *"in the project root, or
inside `src` if applicable, so that it is located at the same level as `pages` or
`app`"* (`node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`). This
app's routes are at `src/app`, so the root-level `proxy.js` is silently ignored — no
warning, no error.

Proven three ways:

1. `npm run build` on `main` prints no Proxy entry. Copying the identical file to
   `src/proxy.js` makes the same build print `ƒ Proxy (Middleware)`.
2. Production returns **401** for unauthenticated `/api/clients`. A live proxy with the
   committed catch-all matcher would have returned **307 → /login** instead.
3. Production returns **200** for `/` and `/portal`, which that matcher would also have
   redirected. The `/dashboard` **307** comes from `redirect('/login')` in
   `src/app/dashboard/layout.js:13`, not from the proxy.

The consequence is not the redirect (route handlers and the dashboard layout each guard
themselves). It is **session refresh**. `src/app/lib/supabase-server.js:100` swallows the
cookie write with the comment *"Server Components cannot write cookies. Proxy refreshes
the session."* — and nothing is refreshing it. Staff sessions expire on the access-token
lifetime instead of rolling over on the refresh token, and users get bounced to `/login`
mid-session.

**Fixed in PR #4.** Moved to `src/proxy.js`; matcher narrowed from the catch-all to
`/dashboard/:path*` so `/`, `/portal`, and the 401-JSON contract on `/api/*` all keep
their current behaviour — `staffRequest()` (`src/app/lib/staff-request.js:10`) branches
on `response.status === 401` and would break on a 307 that hands it login HTML.

### P2 — HIGH — The daily cron is not in the repository and cannot be reaching `/api/notify` as written

`src/app/api/notify/route.js`

Obaid reported the daily cron as "confirmed working on production." Nothing in the
repository supports that:

- No `vercel.json`, so no `crons` array is deployed from source.
- No route under `src/app/api/cron/**`. Production confirms: `/api/cron` and
  `/api/cron/notify` both return **404**.
- `/api/notify` exports **POST only** (production returns **405** for GET) and requires
  an authenticated Supabase user cookie.

Vercel Cron issues a **GET** carrying `Authorization: Bearer $CRON_SECRET`, with no
Supabase session cookie. Against this handler that is a 405, and if it were changed to
GET it would be a 401. There is no `CRON_SECRET` check anywhere in the code.

Either the digest is being triggered by something outside the repo that we have not
seen, or it is not running at all. **This needs Obaid's exact evidence** — the cron
definition and one delivery receipt. Until then, treat "daily digest live" as unverified.
The repo's own `docs/phase-3-review-checklist.md` still lists the notification job
contract as unchecked, and `src/app/dashboard/settings/page.js:9` still reads
"Sender domain, cron job, and storage policies remain pending."

### P3 — MEDIUM — `/api/documents/signed-url` mints a URL for any path the caller names

`src/app/api/documents/signed-url/route.js:12-18`

```js
const file_url = searchParams.get('file_url')
const { data, error } = await auth.supabase.storage.from(BUCKET).createSignedUrl(file_url, 3600)
```

The path is taken verbatim from the query string with no check that a `documents` row
the caller may read actually references it. Any authenticated user can request a signed
URL for any object in the `client-documents` bucket by guessing or enumerating paths.

The only thing standing between that and a claimant-document disclosure is the
`storage.objects` RLS policy, which is not in this repo. Given that the one RLS artefact
we do have (`docs/supabase-rls-fixes.md`) uses `to authenticated ... with check (true)`,
a permissive storage policy is the likely shape.

**Fix (Obaid, ~10 lines):** take a `document_id`, `select('file_url').eq('id', id)` from
`documents` — which RLS already scopes — and sign the path that comes back. Never sign a
caller-supplied string.

### P4 — MEDIUM — The daily digest can never deduplicate, and mutates its own clock mid-loop

`src/app/api/notify/route.js:74-82` and `:79`

Two defects in the same block.

**(a) The dedupe check can never match.** Per client, the loop asks:

```js
.from('notifications_log').select('id').eq('client_id', client.id).eq('alert_type','daily_digest')
```

but the insert at the end of the run writes `client_id: null` (line 146). The lookup key
is never the key that was written, so `existingLog` is always empty and the "already
notified today" guard never fires. If the cron ever does run more than once a day, David
gets a duplicate digest every time.

**(b) `today` is mutated inside the loop.** Line 79 calls
`new Date(today.setHours(0,0,0,0))`. `Date.prototype.setHours` mutates in place, so from
the first iteration onward `today` is local midnight rather than now. Every subsequent
client's `daysInStage` and `daysSinceContact` is computed against a different reference
time than the first client's — an off-by-one that decides who lands in Critical vs
Warning. Fix is `new Date(new Date().setHours(0,0,0,0))` or a hoisted `startOfDay` const.

Also in this route: the per-client `notifications_log` query is an N+1 (one round trip per
active client), and client names are interpolated into the email HTML unescaped
(lines 111, 118, 125). Names come from staff intake rather than the public, so the
injection risk is low, but it should be escaped before any self-registration path opens.

### P5 — MEDIUM — The client archive can never return a row

`src/app/dashboard/clients/ClientDirectory.js:85`, `src/app/lib/supabase-server.js:148`,
`src/app/api/clients/route.js:12`, `src/app/dashboard/page.js:34`

`stop_clock` sets `is_active: false` (`src/app/api/lifecycle/route.js:71`). Both loaders
— `loadActiveClientRows()` and `GET /api/clients` — filter `.eq('is_active', true)`.
So terminal clients are never fetched.

Meanwhile the directory offers a **Terminal state** filter with options "Active and
history", "Successful", and "Relationship ended", and the dashboard's "Terminal history"
tile links to `/dashboard/clients?filter=successful`. All of them filter an array that,
by construction, contains only active clients. Every one of those views is
permanently empty, and the counts on the tile are derived from the same truncated set.

This is the 2026-08-20 "one archive with outcome filters" decision, unimplemented. Left
as a proposal rather than built (see Remaining on Dillon D1) because the right shape —
loosen the shared loader, add a parameter, or add a separate archive route — is a
product call and changes the `/api/clients` contract Obaid consumes.

### P6 — LOW — `client_id` is unvalidated before it becomes a storage path prefix

`src/app/api/documents/route.js:61`

```js
const filePath = `${client_id}/${Date.now()}-${file.name.replace(/[^a-z0-9.-]/gi,'_')}`
```

The filename is sanitised; `client_id` is not. It comes straight from `formData` and is
concatenated as the directory segment. A caller sending `client_id=../../something`
shapes the object key before the database insert (which would then fail on the UUID/FK
constraint) — so the upload can land outside the intended prefix even though the record
is never created, leaving an orphan. One `if (!UUID_RE.test(client_id)) return 400` at
the top closes it.

### P7 — LOW — Dead lifecycle component, 313 lines, diverging from the live one

`src/app/dashboard/clients/[clientId]/LifecycleControls.js`

Nothing imports it; `page.js:72` renders `LiveLifecycleControls` instead. It is the old
browser-local synthetic version. It matters beyond tidiness because it is the **only**
consumer of `TERMINAL_OUTCOME_LABELS` (`src/app/lib/workflow-data.js:101`) — so changing
the terminal labels in the shared workflow contract changes nothing a user sees. See D2.

### P8 — LOW — Every backend failure collapses to one generic message

`src/app/dashboard/clients/AddClientForm.js:74` and the other write surfaces

Route handlers deliberately return a single opaque 500 string (correct — no driver
detail leaks). But the UI has no branch for the cases a user can fix. A duplicate email
hitting a unique constraint surfaces as "The client record could not be created." with
no indication that the address is already on file. Validation errors also show only
`result.errors[0]` and are not tied to a field via `aria-invalid` / `aria-describedby`.

### Reviewed and found sound

- **AI route** (`src/app/api/ai/route.js`). Message capped at 2000 chars, history capped
  at 10 turns with role/type filtering, model given no tools, client rows read through
  the user's own RLS-scoped client, and the reply rendered as `{message.content}` in JSX
  (`AiAssistant.js:70`) so React escapes it — no `dangerouslySetInnerHTML` anywhere in
  `src/`. Prompt injection cannot reach a tool or a write. One scoping note: the system
  prompt embeds the **entire** active client roster, so the blast radius of a
  too-permissive `clients` RLS policy includes the AI route.
- **Settings route.** `ALLOWED_SETTINGS_KEYS` allowlist on PATCH, 16 keys, values coerced
  with `String()`.
- **Advisors PATCH.** `allowedFields` allowlist; deactivation reassigns
  `advisor_id = null` on that advisor's active clients before the update.
- **Lifecycle route.** Actions are a closed set; `stop_clock` requires both a supported
  outcome and a non-empty reason; every action writes `stage_events` **and**
  `timeline_events` with `recorded_by`/`logged_by` = `auth.user.email`.
- **`clients/[id]` PATCH.** `ALLOWED_UPDATE_FIELDS` allowlist plus an explicit
  `YYYY-MM-DD` check on `cp_exam_date`.
- **Storage upload.** MIME allowlist, 50MB cap, `upsert: false`, filename sanitisation.

---

## What needs improvement on Dillon's end

Prioritised. Everything here is frontend/product work in `src/app/dashboard/**` or
`src/app/lib/**` that does not require Obaid's backend or David's decisions, except
where noted.

### D1 — Document upload/download UI does not exist (highest value)

**Nothing in `src/` calls `/api/documents` or `/api/documents/signed-url`.** Verified by
grep across the whole tree: the only files mentioning those paths are the route handlers
themselves. Obaid shipped the storage API in `f00141e` and there is no surface that uses
it.

Needed on the client detail panel (`src/app/dashboard/clients/[clientId]/page.js`), as a
sibling of `ClientNarrative`:

- a document list — `GET /api/documents?client_id=…` returns
  `id, file_name, document_type, direction, status, uploaded_by, created_at, file_url`;
- an upload control — `multipart/form-data` POST with `file`, `client_id`,
  `document_type`, `direction`. Mirror the server's own limits client-side so the user
  learns before a 50MB round trip: `accept="application/pdf,image/jpeg,image/png,image/webp"`
  and a size check;
- download — `GET /api/documents/signed-url?file_url=…`, then open the returned URL.
  Signed URLs last one hour, so fetch on click, never at render;
- delete with a confirm step — `DELETE /api/documents?id=…`;
- the four states the rest of the dashboard already has: loading, empty, error, and
  a `role="status"` success line.

Note `staffRequest()` (`src/app/lib/staff-request.js`) always sets
`Content-Type: application/json` when a body is present, so the upload cannot use it
as-is — either pass `FormData` through with the header omitted, or extend the helper.
Sequence D1 **after** P3 is fixed, so the download path is asking for a document by id
rather than by path.

### D2 — The 2026-08-20 lifecycle decisions are not reflected in the UI

Each traced to the file that has to change. Note the caveat under "Waiting on David" —
these were *recommended directions* in the meeting packet, and I found no artefact
recording that David ratified them.

| Decision | Recommended | Current code | File |
|---|---|---|---|
| Terminal labels | "Claim completed" / "Services concluded" | Hardcoded "Successful" / "Relationship ended" | `LiveLifecycleControls.js:112,132,136`; `ClientDirectory.js:85,99`; `clients/page.js:23-24`; contract at `workflow-data.js:101` is unused (P7) |
| Archive layout | One archive, outcome filters | Filters exist but can never match (P5) | `ClientDirectory.js:85`; `supabase-server.js:148` |
| Appeals / HLR / supplemental | Separate linked workflow | Not built. One disclaimer sentence only | `src/app/portal/ClientPortal.js:655` |
| Stage 6→7 boundary | End 6 at final briefing; begin 7 at attendance at the final exam | Contract matches ("Last VA exam attended"); no UI captures the attendance event | `workflow-data.js:70-90`; `LiveLifecycleControls.js` advance is a blind `current_step + 1` |
| Day-10 lapsed prospect | Keep staff-confirmed, add automatic day-10 reminder | Config present (`lapsedProspect.afterDays: 10`), rendered read-only, no reminder | `workflow-data.js:95`; `settings/page.js:25` |
| Time language | Averages as estimates, reminders as guidance not deadlines, Central + user-local | Partial. `ownerGuidance` covers VA-owned framing; `targetLabel` "90–120 days" is unqualified; Payment Watch uses Central without showing user-local | `workflow-data.js:106`; `PaymentWatch.js:176` |
| Records completeness | Named reviewer + audit note | Not surfaced | Stage 2 UI |

The terminal-label change is the cheapest and is blocked only on David confirming the
wording. The single-source fix is to route `LiveLifecycleControls` through
`TERMINAL_OUTCOME_LABELS` and delete the dead component (P7), so the labels then have
exactly one definition.

### D3 — Settings page is a static document, not a control panel

`src/app/dashboard/settings/page.js`

`GET`/`PATCH /api/settings` have been live since `9c2fe7f` and the page calls neither.
It renders a hardcoded `integrationContracts` array (lines 3-10) and a read-only
threshold table. Its own copy says "API is live; operations UI still uses the canonical
workflow contract."

Wire the 16 allowlisted keys — `admin_email`, `needs_attention_days`, the four
`threshold_*`, and the ten `stage*_alert_days` — as an editable form with optimistic
update and rollback on error. This is the control surface David was promised, and
`admin_email` in particular decides where the digest goes.

Note the ordering trap: the alert thresholds *displayed* today come from the frozen
`WORKFLOW_CONFIG` in `workflow-data.js`, while the API persists a parallel set of keys in
the `settings` table. `/api/notify` reads the table; the dashboard reads the constant.
Wiring the form without reconciling those two sources means the UI will show one set of
thresholds while the digest fires on another. Reconcile first.

### D4 — Cron / notification status has no UI

Neither `/api/notify` nor any digest history has a surface. Once P2 is resolved, the
settings page should show last-run time, recipient, and result, reading
`notifications_log`. Today nobody can tell from the product whether the digest ran.

### D5 — Intake and client-detail error handling

Per P8: distinguish duplicate-email from generic failure on
`AddClientForm.js:74`; show all validation errors rather than `errors[0]`; bind messages
to fields with `aria-invalid`/`aria-describedby`. The rest of the intake form is in good
shape — `pending` disables every control, `role="status"` and `role="alert"` are both
present, `autoComplete` is set, and the advisor select degrades to "No advisors available
yet" when the roster is empty.

### D6 — Verification gaps I did not close in this pass

Stated as unknown rather than guessed. Accessibility beyond the ARIA roles visible in
source, and mobile layout, were **not** re-verified — the only evidence is the
2026-08-15 closeout's review and the two `qa-login-*.png` screenshots in the repo root,
both of which predate every Phase 3 route. A pass over `/dashboard/advisors`, `/ai`,
`/alerts`, `/payment-watch`, `/settings` at 375px, plus keyboard traversal of the
stop-clock confirmation dialog (`LiveLifecycleControls.js:126-147` — a custom confirm
block with no focus trap or `aria-modal`), is warranted.

---

## Remaining on Obaid

1. **P2 — cron.** Produce the cron definition and one delivery receipt, or build it:
   `src/app/api/cron/notify/route.js` exporting GET, gated on
   `Authorization: Bearer ${process.env.CRON_SECRET}`, plus a `vercel.json` `crons`
   entry so it lives in version control.
2. **P3 — signed-url ownership check.** Sign by `document_id`, never by caller path.
3. **P4 — digest dedupe key and the `today` mutation.**
4. **P6 — validate `client_id` as a UUID before building the storage path.**
5. **Storage RLS policies for `client-documents`**, documented in
   `docs/supabase-rls-fixes.md` the way the notes/timeline fixes were. This is the only
   control protecting claimant documents (see P3), and it is currently invisible to us.
6. **Tighten the permissive policies.** `with check (true)` on `notes` and
   `timeline_events` lets any authenticated user write against any client. Fine while
   every authenticated user is staff; not fine the moment self-registration opens.
7. **Escape client names in the digest HTML** before any public registration path exists.

## Waiting on David

1. **Resend sender domain.** `src/app/api/notify/route.js:134` hardcodes
   `VA Claims Edge <onboarding@resend.dev>` — Resend's shared test sender, which only
   delivers to the Resend account owner's own address. Every digest to a real recipient
   will fail or be filtered until a verified domain is set. Recommend `vaclaimsedge.com`,
   and that the value move to `process.env.RESEND_FROM_EMAIL` so the swap is a Vercel
   env change, not a code deploy.
2. **Admin recipient.** The code defaults to `vaclaims14@gmail.com` when the
   `admin_email` setting row is absent (line 38). Confirm that is the intended digest
   recipient.
3. **The seven 2026-08-20 lifecycle decisions.** I found no artefact recording that any
   of them were ratified — the packet lists them as "decisions needed," and no later
   deliverable, doc, or commit records an outcome. Everything in D2 is blocked on that
   confirmation. Terminal labels and the archive shape are the two that gate real work.
4. **Website self-registration** — deferred by Obaid to a later phase; David to confirm
   the phase.

---

## Production checks

Unauthenticated `curl` against `https://vaclaims-portal.vercel.app`, 2026-09-02. No
login, no POST, no data written.

| Path | Method | Status | Redirect | Reading |
|---|---|---|---|---|
| `/` | GET | 200 | — | Public marketing entry, as intended |
| `/login` | GET | 200 | — | Reachable |
| `/dashboard` | GET | 307 | `/login` | From `dashboard/layout.js:13`, not the proxy (P1) |
| `/portal` | GET | 200 | — | Public. Synthetic/illustrative content only |
| `/api/clients` | GET | 401 | — | Correct |
| `/api/advisors` | GET | 401 | — | Correct |
| `/api/notes` | GET | 401 | — | Correct |
| `/api/payment-watch` | GET | 401 | — | Correct |
| `/api/documents` | GET | 401 | — | Correct |
| `/api/settings` | GET | 401 | — | Correct |
| `/api/messages` | GET | 401 | — | Correct |
| `/api/appointments` | GET | 401 | — | Correct |
| `/api/evidence` | GET | 401 | — | Correct |
| `/api/ai` | GET | 405 | — | POST-only; 401 on POST without a session |
| `/api/notify` | GET | 405 | — | POST-only (see P2) |
| `/api/lifecycle` | GET | 405 | — | POST-only |
| `/api/cron` | GET | 404 | — | Does not exist (P2) |
| `/api/cron/notify` | GET | 404 | — | Does not exist (P2) |

**No API route leaks data unauthenticated.** Obaid's security posture on the route
handlers is sound; the open questions are the RLS policies underneath them and the cron.

---

## Can Dillon start Phase 4?

### Is Phase 4 defined anywhere?

**No.** Searched the repo (`docs/`, `README.md`, `PRODUCT.md`, `DESIGN.md`), the whole
`clients/va-claims-edge` tree including all ten deliverable folders, for
`phase 4` / `phase-4` / `phase four`, case-insensitive. **Zero matches.** The repo's
phase documents stop at `docs/phase-3-data-activation.md` and
`docs/phase-3-review-checklist.md`. The canonical queue's only open VA Claims item is
`wi-20260725-0007` (WordPress/Amelia booking routing), which is unrelated.

So Phase 4 has no agreed scope. What follows is a **proposal**, assembled from the
unchecked gates that Phase 3 explicitly deferred, not a plan anyone has signed off.

### Proposed Phase 4 scope

Drawn from `docs/phase-3-review-checklist.md` "Production activation gates" and the
2026-08-20 packet's "Production work to assign."

1. **Production activation** — auth and role enforcement readback, RLS and role tests
   against the exact Supabase project, storage policies for `client-documents`,
   `portal.vaclaimsedge.com` DNS/TLS/canonical-host verification, Resend verified
   sender domain, analytics destination and privacy review.
2. **Website self-registration** — the public intake path Obaid deferred; the largest
   product surface in the proposal and the one that changes the trust model, because it
   introduces the first non-staff authenticated user and makes every `with check (true)`
   policy a real problem.
3. **Client portal on live data** — `/portal` is currently public and synthetic. Making
   it a real authenticated claimant surface is a distinct workstream from the staff
   dashboard.
4. **Appeals / HLR / supplemental claims** — the separate linked workflow recommended on
   2026-08-20 and in `docs/phase-2-closeout-2026-08-15.md:43`.
5. **Documents, settings, and archive** — arguably Phase 3 completion rather than
   Phase 4 (D1, D3, P5). Worth resolving where they belong before scoping anything else.

### Answer: **conditional yes.**

Dillon can start today, but on Phase 3 completion work, not on the Phase 4 proposal.
Two reasons. First, Phase 3 is not actually done on Dillon's side — the storage API has
no UI (D1) and the settings API has no UI (D3), both against endpoints that are already
live. Second, every item in the Phase 4 proposal is gated on someone else:

| Phase 4 item | Gated on |
|---|---|
| Production activation | Obaid (RLS, storage policies, cron); David (sender domain, DNS ownership) |
| Self-registration | David (approve the phase); Obaid (RLS rework — `with check (true)` cannot survive a non-staff user) |
| Client portal on live data | Obaid (claimant-scoped RLS); David (privacy approval) |
| Appeals / HLR | David (ratify the 2026-08-20 decision) |
| Terminal labels, archive | David (ratify the 2026-08-20 decisions) |

Starting any of them before those gates would mean building against an unratified spec.

### The first three tasks Dillon can start today

1. **Document upload/download UI (D1).** Endpoints are live and verified 401.
   No dependency on David or Obaid. Highest user-visible value — it is the one Phase 3
   capability that shipped with no way to use it. Do the P3 fix first, or build against
   `document_id` from the outset so the UI needs no rework when P3 lands.
2. **Wire the settings page (D3).** `GET`/`PATCH /api/settings` are live. Reconcile the
   `WORKFLOW_CONFIG` constant against the `settings` table first — that reconciliation
   is itself useful and blocks nothing.
3. **Merge PR #4 and single-source the terminal labels (P1, P7, D2).** PR #4 is reviewed,
   tested, and draft-open. Then route `LiveLifecycleControls` through
   `TERMINAL_OUTCOME_LABELS` and delete the 313-line dead component, so that when David
   confirms the wording it is a one-line change in one file rather than a hunt across
   five.

A fourth, if David answers quickly: the archive fix (P5) — currently three filter
options and one dashboard tile that can never return a row.

---

## PR links

- **https://github.com/vaclaims-dev/vace-platform/pull/4** — `codex/phase-3-cleanup-20260902` → `main`.
  **DRAFT. Not merged. Not deployed.** Fixes P1 (proxy location + narrowed matcher) and
  the dead `fileExt` binding. Two files, +4 / −2.
  Verified on the branch: `npm test` 18/18 pass, `npm run lint` clean, `npm run build`
  succeeds and now emits `ƒ Proxy (Middleware)`.

Not built, by deliberate choice — each is either larger than a safe drive-by or needs a
decision first: D1 documents UI, D3 settings wiring, P5 archive, P7 dead-component
deletion, and everything in D2.

---

## Method and limits

- Every API route handler under `src/app/api/**` was read in full, not sampled.
- `npm ci`, `npm test`, `npm run lint`, `npm run build` were run locally on
  `origin/main` at `f00141e` and again on the PR branch.
- The P1 proxy conclusion was proven by differential build output, not inferred from the
  docs alone.
- Production evidence is unauthenticated HTTP status codes only. It verifies route
  availability and that no endpoint leaks data without a session. It does **not** verify
  RLS correctness, authenticated behaviour, storage policies, cron execution, or email
  delivery — none of which can be checked without credentials and an approved test.
- RLS policies, storage policies, `vercel.json`, and environment variables are not in the
  repository, so any claim about them here is inference from the code that depends on
  them, flagged as such.
- No secret value was read, printed, or stored at any point.
