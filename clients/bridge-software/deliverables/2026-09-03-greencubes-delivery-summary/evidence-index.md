# Evidence index — The Greencubes Delivery (2026-09-03)

Maps every claim, status, and number in `Bridge-Greencubes-Delivery-Summary-2026-09-03.pdf`
to the source it was verified against. This is a fresh build; the prior attempt at this
deliverable failed before producing output and left nothing to reconcile against.

**Redaction rule applied throughout:** no contract dollar amounts, milestone prices, or
percentages appear anywhere in the PDF, this index, or the HTML source. A machine scan of
the rendered PDF's extracted text layer (`pdftotext -enc UTF-8`) returns zero `$` characters,
zero comma-grouped numbers, zero occurrences of "dollars"/"USD"/"cents", and zero `%`
characters. The founding-member pricing callout on `/join` is described in words only,
with no digits, matching the redaction convention used in the 2026-09-03 milestones report.

**Dash rule applied throughout:** the rendered PDF text layer contains zero em dash
(U+2014) and zero en dash (U+2013) characters, confirmed by direct character-count scan.
The single hyphen-minus character in the entire document is inside the literal route
`/my-profile`, a technical identifier rather than sentence punctuation. All bullet lists use
a CSS circular dot (`::before` with `border-radius:50%`), not a text dash character, so no
list in this document is built on a dash glyph.

Verification date for every live check below: **2026-09-03**.

---

## 1. Live verification performed directly for this report

| Claim in PDF | Method | Result |
|---|---|---|
| Backend sends `Access-Control-Allow-Credentials: true` with the origin echoed correctly | `curl -D -` against `https://bridge-software-backend.onrender.com/api/v1/session` and `/api/v1/auth/me`, with `Origin: https://bridge-connected-signal-dev.netlify.app` | Both responses: `access-control-allow-credentials: true`, `access-control-allow-origin: https://bridge-connected-signal-dev.netlify.app`, `vary: Origin` |
| `/api/v1/session` and `/api/v1/auth/me` both return 401 unauthenticated | Same two `curl` requests, no auth header sent | Both returned `HTTP/1.1 401 Unauthorized` with a JSON error body |
| Preview address root and five routes return 200 | `curl -o /dev/null -w "%{http_code}"` against `https://deploy-preview-16--bridge-connected-signal-dev.netlify.app` | `/` 200, `/login` 200, `/join` 200, `/join/account` 200, `/my-profile` 200, `/admin/dashboard` 200 |
| `/admin` returns 404 on the same preview | Same probe method | 404, confirmed; no redirect exists yet on this branch |
| Twelve roles on `/join` (used for context, not re-verified live in this pass) | Carried from the 2026-09-03 milestones report evidence index, itself a live page-text capture of `/join` on 2026-09-03 | Brand, Dispensary, Retailer, Sales rep, Cultivator, Manufacturer, Lab, Transport, Bank, Service, Media, Hydroponics |

## 2. Pull request 16 — repository verification

Repository: `dillonmohr8777/bridge-software-frontend`.

| Claim in PDF | Method | Result |
|---|---|---|
| PR 16, "Fix/unify cookie auth client," by `clickthedemo`, into `development`, OPEN, MERGEABLE | `gh pr view 16 --json number,title,author,headRefName,baseRefName,mergeable,state,files,additions,deletions,body` | Confirmed exactly as stated: head `fix/unify-cookie-auth-client`, base `development`, state `OPEN`, `mergeable: MERGEABLE` |
| 38 files changed | `gh pr view 16 --json files --jq '.files | length'` | `38` |
| 929 additions, 286 deletions | Same `gh pr view 16` JSON payload | `"additions":929,"deletions":286` |
| Not merged | `gh pr view 16` state field | `state: OPEN`; no `mergedAt` |
| Preserves credentialed requests; folds auth into the one shared HTTP client | File list in the PR 16 JSON payload: `lib/phase3/http-client.ts` (+71/-0), `lib/phase3/mock-client.ts` (+55/-0), `lib/phase3/types.ts` (+47/-0) modified; no `lib/auth/` files present in the change set | Consistent with auth being folded into the existing `Phase3Client` contract rather than a second client |
| Zero browser-stored tokens; the duplicate HTTP client is gone | `gh api repos/dillonmohr8777/bridge-software-frontend/contents/lib/auth?ref=development` and `?ref=fix/unify-cookie-auth-client` | Both return `404 Not Found` — the `lib/auth/` directory (which held `storage.ts` and `api.ts` on the still-open, unmerged PR 13 `feature/admin-login` branch) does not exist on `development` or on PR 16's branch. Net effect confirmed directly: PR 16's own branch carries no such files today |
| Restores Step 1 on `/join` (role grid) with `/join/account` as its own Step 2 | File list: `app/join/join-form.tsx` (+8/-106, i.e., the replacement signup card removed), `app/join/account/page.tsx` (new), `app/join/account/account-form.tsx` (new), `lib/onboarding/roles.ts` / `roles.test.ts` (new) | Matches the PR 16 body text describing the twelve-role catalogue restored and account creation split into its own step |
| PR 16 adopts Momentum's reference implementation | `gh pr view 15` body text (Dillon's hardening branch, same repository) describes an identical pattern: one HTTP client, `/join` Step 1 restored, `/join/account` as Step 2, no browser storage | Directly comparable file-level pattern between PR 15 (Momentum, `codex/milestone-3-hardening-20260902` into `development`) and PR 16 (Greencubes, `fix/unify-cookie-auth-client` into `development`) |

## 3. The outstanding repository-pointer issue

| Claim in PDF | Method | Result |
|---|---|---|
| Three files, four lines, still point at `getonthebridge0-max/thebridge` on PR 16's branch | `gh api repos/dillonmohr8777/bridge-software-frontend/contents/<file>?ref=fix/unify-cookie-auth-client`, decoded and grepped for `getonthebridge0-max` | `CLAUDE.md` line 9 (1 line), `CLAUDE_BUILD_SPEC.md` line 9 (1 line), `CLAUDE_SESSION_PROMPT.md` lines 3 and 7 (2 lines). Total 4 lines across 3 files. `README.md` checked and clean |
| That repository pointer is unreachable | `gh api repos/getonthebridge0-max/thebridge` | `404 Not Found` |

## 4. Backend security posture — supporting context

Primary source: `2026-09-02-greencubes-integration-reconciliation/reconciliation.md`.

| Claim in PDF | Source |
|---|---|
| Server-side RBAC rejecting missing and forged credentials on every protected route | reconciliation.md §2, "Delivered and verified," re-confirmed live today for `/api/v1/session` and `/api/v1/auth/me` (see §1 above) |
| Real CORS allowlist naming exact origins, no header for an unknown origin | reconciliation.md §2; the credentials fix re-confirmed live today adds to, rather than replaces, this existing allowlist behavior |
| Strong response security headers, consistent error envelope, working health/version endpoints | reconciliation.md §2 |
| The missing `Access-Control-Allow-Credentials` header was the single root cause behind three collapsed defects (B2 test failure, B3 undeclared bearer switch, B5 token-in-storage exposure) | `2026-09-02-milestone-3-hardening/build-report.md`, "What Miraj must change on his side," item 1, and reconciliation.md §3 |
| Backend described as half done on August 29, almost done on September 2 | `2026-09-03-milestones-1-3-report/evidence-index.md` §10, Slack timestamps `1788020849.049499` (Aug 29) and `1788357584.557269` (Sep 2) |

## 5. Miraj's reported claims — attributed, not asserted

These appear in the PDF inside the "What Miraj reports, stated as his report" callout and
in the "Say this, not that" table, explicitly separated from the independently verified
items in §1 and §2 above. Per the task brief, these are Miraj's account and were not
independently re-verified against a live, signed-in session in this pass, because doing so
requires a real registered test account against the branch's own preview build.

| Reported claim | Attribution |
|---|---|
| Login issues secure HttpOnly cookies | Miraj, reported to Dillon, 2026-09-02 to 2026-09-03 |
| Credentialed CORS works end to end | Miraj, same window |
| `/api/v1/session` authenticates through the cookie | Miraj, same window |
| Bearer-token compatibility remains for other callers | Miraj, same window |
| Logout clears the cookie and revokes the refresh session server-side | Miraj, same window |
| A session check right after logout returns 401 again | Miraj, same window |
| Every admin- and member-only route is protected server-side | Miraj, same window |
| Greencubes' own tests pass | Miraj, same window |

Independently confirmed today, and called out as such in the PDF: the credentials header
(§1), and the unauthenticated 401 response from both `/api/v1/session` and
`/api/v1/auth/me` (§1). Everything else in the list above is presented in the PDF as
Miraj's report.

## 6. The Join flow, Steps 1 through 4

| Claim in PDF | Source |
|---|---|
| Step 1 of 4, `/join`, twelve-role grid, live in production | `2026-09-03-milestones-1-3-report/evidence-index.md` §1; unchanged by this report, re-described here for context only |
| Step 2 of 4, `/join/account`, display name/email/password/confirm, built | `2026-09-02-milestone-3-hardening/build-report.md` §1; confirmed present on PR 16 via the file list in §2 above, and returns 200 on the PR 16 preview (§1 above) |
| Step 3 of 4, organization details, needs organization-scoped draft persistence, not started | `bridge-software-frontend/docs/INTEGRATION-API-CONTRACT.md`, "Step 2: organization details"; no route for it exists on `development` or on PR 16's branch |
| Step 4 of 4, verification evidence and review, needs upload intents/scanning/case record, not started | `INTEGRATION-API-CONTRACT.md`, "Step 3: verification evidence" and "Step 4: review and submit"; no route exists |
| Step 2 and Step 4 product approval sits with Melissa and Tori; do not represent as client approved | `2026-09-03-milestones-1-3-report/evidence-index.md` §10, Slack timestamp `1788189518.841319`, 2026-08-31, quoted in substance in both the milestones report and this one |
| What evidence each role must supply, and what "Verified" promises, are open decisions | `bridge-software-frontend/docs/decision-log.md`, open decision register D-03 and D-04 |

## 7. Design provenance

| Element | Source |
|---|---|
| Page size, palette, type system, stat-row, table, pill, and section-footer conventions | Adapted directly from `2026-09-03-milestones-1-3-report/report.html`, the established Bridge client-report template: 8.5in by 11in, Poppins 400/600/700/800, purple `#9b4df6`, indigo `#4b0082`, ink `#1a1a1a`, muted `#5f5964`, lavender `#d8d0dd` |
| Bridge mark | `bridge-mark.svg`, copied unchanged from `../2026-09-03-milestones-1-3-report/bridge-mark.svg` |
| Bullet glyph changed from the template's text-dash bullet (`content:'–'`) to a CSS circular dot | Deliberate change for this document only, to satisfy the zero-dash requirement below |
| Render method | HTML and CSS rendered to PDF with Playwright Chromium `page.pdf()`, 8.5in by 11in, print backgrounds on, zero page margins with page-level padding, matching the established template's render method |

## 8. What this report does not independently re-verify

1. **Miraj's session, cookie, and logout claims beyond the two checks in §1.** Confirming
   these fully requires a real registered account exercised against the PR 16 preview once
   it can be reached with a browser session; that is listed as an outstanding item owned by
   Momentum in the PDF itself.
2. **Whether the four-line repository-pointer fix has been made since this report was
   assembled.** Checked as of 2026-09-03; if Greencubes pushes a fix to the PR 16 branch
   after this document is prepared, this index will be out of date on that one point.
3. **The state of Steps 3 and 4 backend endpoints beyond "no route exists."** This report
   does not claim to know how far Greencubes' internal, unshipped work on those endpoints
   has progressed, only that nothing reachable exists yet on the frontend routes or the
   preview build.
