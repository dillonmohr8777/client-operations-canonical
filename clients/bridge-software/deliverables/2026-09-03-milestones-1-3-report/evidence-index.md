# Evidence index — Bridge Milestones 1–3 Report (2026-09-03)

Maps every claim, status and number in `Bridge-Milestones-1-3-Report-2026-09-03.pdf`
to the source it was verified against.

**Redaction rule applied throughout:** no contract dollar amounts, milestone prices, totals,
payment terms or commission splits appear in the PDF, in this index, or in `email-draft.md`.
Scope is described in words only. A machine scan of the rendered PDF's extracted text returns
**zero currency tokens** — the founding-member callout is described in words rather than by
number, even though its public price would have been permissible as product copy. The only place
that figure could appear at all is inside a screenshot of the live public `/join` page, and it does
not fall within the captured viewport.

Verification date for every live check: **2026-09-03**.

---

## 1. Live-site verification (done directly for this report)

| Claim in PDF | Method | Result |
|---|---|---|
| 13 routes returning HTTP 200 in production | `curl` status probe of each route on `https://bridge-connected-signal.netlify.app` | `/`, `/join`, `/create`, `/my-profile`, `/explore`, `/admin/verification`, `/community`, `/pricing`, `/directory`, `/dashboard`, `/design-system`, `/directions`, `/league` — all 200 |
| 3 legacy paths redirect correctly | Same probe + live browser navigation | `/studio` → 301 → `/create`; `/business` → 301 → `/my-profile`; `/signal` → 301 → `/explore`. Browser `location.pathname` after navigation confirmed `/create`, `/my-profile`, `/explore` |
| 2 deploy environments running | Identical probe against `https://bridge-connected-signal-dev.netlify.app` | Same route set, same status codes, same three redirects |
| `/login`, `/join/account`, `/admin` are **not** live | Same probe, both environments | All three return **404** in production and preview — the branch adding them is unmerged. Stated explicitly in the PDF's metrics footnote |
| 12 member roles | Live page text of `/join` | Brand, Dispensary, Retailer, Sales rep, Cultivator, Manufacturer, Lab, Transport, Bank, Service, Media, Hydroponics — numbered 01–12 |
| "Step 1 of 4" heading live | Live page text of `/join` | `STEP 1 OF 4` present, with per-role next-step copy and the provisional-requirements note referencing decision D-03 |
| Founding-member callout live (product copy) | Live page text of `/join` | "FOUNDING MEMBER CONCEPT — First six months proposed free, then $349 per month for a verified business membership." Public product copy, not a contract term |
| Explore covers 50 states + D.C. | Live state selector enumerated on `/explore` | 51 geographies plus "All states"; sample records currently illustrate 12 states |
| Explore result count and verification states | Live page text of `/explore` | "18 results"; records show Verified and Pending review states |
| My Profile has two projections | Live page text of `/my-profile` | "Public view / B2B verified view" toggle; protected sales and accounting contacts marked "Protected field · not shown in Public view"; required monthly contact check with next-due date |
| Create has the protected-detail guardrail | Live page text of `/create` | Audience selection with "Include protected wholesale / business-only detail"; upload accepts PNG, JPEG, WebP, PDF up to 25 MB; "Publish unavailable" gating state |
| Admin queue renders real case rows | Live page text of `/admin/verification` | 4 case rows with organization, type, market, status (EIN received / License mismatch / Ready for review / Documents missing) and waiting days; "14 awaiting review"; labelled "Fictional sample queue" |
| Screens state their own boundaries | Live page text, all routes | Explore: "favorites stay on this device in the prototype". Create: "Draft, library, review, and download actions remain on this device until the production API is connected". My Profile: "Email reminder integration is pending production" |
| 21+ entry gate blocks every route | Live browser, first load | Modal "Before you enter Bridge" with 21-or-older / under-21 choice, shown ahead of page content |
| All screenshots | Playwright Chromium, deviceScaleFactor 2, against production | `shots/d-*.png` at 1440×900; `shots/m-*.png` at 390×844 |

Screenshot files: `shots/d-home.png`, `d-join.png`, `d-explore.png`, `d-my-profile.png`,
`d-create.png`, `d-community.png`, `d-admin-verification.png` and the `m-` mobile equivalents.

---

## 2. Repository and CI verification

Repository: `dillonmohr8777/bridge-software-frontend` (public since 2026-08-31; default branch `production`).

| Claim in PDF | Source | Result |
|---|---|---|
| 77 commits on development | `git rev-list --count origin/development` | 77; first commit 2026-07-11 "Add Bridge discovery prototype and Claude handoff" |
| 15 pull requests opened, 9 merged | `gh pr list --state all` | PRs #1–#15. Merged: #1–#9. Open: #13 (Greencubes), #14 (review evidence, draft), #15 (Milestone 3 hardening). Closed unmerged: #10, #11, #12 |
| Milestone 3 hardening branch | `git log origin/codex/milestone-3-hardening-20260902` | 4 commits on top of `origin/development` @ `f548013`, dated 2026-09-02 |
| CI passing on the Milestone 3 PR | `gh run list`, `gh pr checks 15` | 4 workflow runs, all `success`. Latest run `33721412884`, combined `test, typecheck, lint, build` check **pass in 44s** |
| CI did not previously exist | Milestone 3 build report; absence of `.github/workflows` on `development` | `.github/workflows/ci.yml` is listed as a **new** file on the hardening branch |
| 3 new pages on the branch | `git ls-tree` comparison | `development` has 14 `page.tsx` files; the hardening branch has 17. New: `app/login/page.tsx`, `app/join/account/page.tsx`, `app/admin/page.tsx` |
| Nothing merged or deployed | PR #15 state | OPEN, not merged. Consistent with the 404s observed live |

---

## 3. Build-report figures (verified run, cross-checked by CI)

Source: `../2026-09-02-milestone-3-hardening/build-report.md` (2026-09-02).
Environment stated there: Node v24.18.0, npm 12.0.2, Next.js 16.3.1, clean worktree, `npm ci` re-run.

| Figure in PDF | Baseline | After | Cross-check |
|---|---|---|---|
| Tests passing | 24 pass / 0 fail | **45 pass / 0 fail** | CI `test` step passes on PR #15 |
| Type check | pass | pass | CI |
| Lint | pass | pass | CI |
| Static pages built | 33 | **36** | CI `build` step |
| Contrast failures fixed | — | **7** | 5 admin-panel failures (worst 2.88:1 vs the 4.5:1 AA requirement) + 2 pre-existing theme-token failures (Botanical `--muted` 4.34:1 → 4.61:1; Botanical danger 2.22:1 → 6.02:1) |
| Themes verified | — | **3** | Modern Network, Trusted Current, Botanical — theme names confirmed in the repo source |
| Zero raw hex in the admin panel | ~110 lines of hardcoded hex | 0, asserted by test | build-report §5 |
| Skip link restored | hidden on admin pages | present | build-report §5 |
| 21 new tests | — | listed individually | build-report §6 |

PDF claims traced to build-report sections: join sequence §1 · unified HTTP client and no-web-storage
rule §2 · required states per route §3 · role-aware routing and open-redirect guard §4 ·
accessibility and contrast §5 · CI and automated contrast check §6 · gate table under "Verification".

---

## 4. Milestone status and scope

Primary source: `../2026-09-02-phase-and-proposal-map/phase-map.md` (2026-09-02) — the reconciled
milestone map, built from the source proposal document read in full.

| PDF claim | Source |
|---|---|
| Six contract milestones; "Phase" and "Milestone" are the same word | phase-map §1.1 and Headline. The proposal's scope section is headed "The work is organized into six milestones", its sections are titled Phase 1–6, and its pricing table is headed "MILESTONE SCOPE" |
| Milestone 1 = Discovery, Requirements and Architecture | phase-map §1.1 |
| Milestone 2 = UX, Product Flow and Data Model | phase-map §1.1 |
| Milestone 3 = Accounts, Authentication and Verification | phase-map §1.1 |
| Milestone 4 = Directory MVP, **not started** | phase-map §5. Amount deliberately omitted from the PDF |
| Contracted core users: brands, retailers and dispensaries, sales reps, admins | phase-map §1.4 |
| Exclusion list (algorithmic feed, social graph, native apps, recommendation engine, in-platform payments, subscriptions, marketplace ordering) | phase-map §1.4 "OUTSIDE THIS FIRST BUILD" |
| M1 delivered and paid; no dated acceptance artifact | phase-map §5 and §1.2 |
| M2 delivered pending acceptance; internally marked Revise | phase-map §5; `2026-08-14-milestone-2-acceptance-review.md` |
| M3 in progress; backend live; integration blocked | phase-map §5 |
| Timeline entries (May 27 – Sep 3) | phase-map §3 dated timeline |

**Deliberate omissions from the PDF:** all six milestone prices, the contract total, the
commission split, per-milestone payment status, the maintenance retainer figure, the estimate
disclaimer amount, and the phase-map's contract-risk section. None of these belong in a client
deliverable stored beside a public repository.

---

## 5. Milestone 1 evidence

| PDF claim | Source |
|---|---|
| Client concept set: four original HTML concepts | `../../artifacts/2026-07-20-tori-source-package/` — `bridge-landing.html`, `bridge-dashboard-feed.html`, `bridge-post-designer.html`, `bridge-profiles-directory.html`, plus rendered PNGs |
| Bridge branding guide is the client's own brand source | Same folder — `Bridge-Branding-Guide.png` |
| Business verification requirements | Same folder — `BRIDGE-Business-Verification-Requirements.pdf` |
| Legal and compliance platform strategy | Same folder — `BRIDGE-Legal-Compliance-Platform-Strategy.pdf` |
| Momentum discovery prototype | `C:\Users\dillo\repos\bridge-discovery-prototype` — 65 commits |
| MVP boundary, roles, journeys, ownership split, open decisions | `../2026-07-16-milestone-decision-brief.md` |
| Architecture: Next.js / React / TypeScript front end, PostgreSQL + RLS | Same brief, "Verified current state" |
| Handoff of the source package | `../2026-07-20-prototype-source-handoff.md` |
| Architecture document delivered 2026-07-27 | phase-map §3; Gmail — `BRIDGE_Milestone_1_Technical_Plan.pdf` and `Bridge_Phase1_Research_Findings.docx` delivered in thread `19fa4bc6482f0ae8` |
| Client response "the specs are awesome, the research is top tier" | Gmail thread `19fa4bc6482f0ae8`, client message 2026-08-05. Quoted in the PDF **as warm feedback, explicitly not as formal acceptance** |
| Compliance shaped the 21+ gate, protected-field boundary and admin queue | Live product (§1 above) + `docs/phase3/00-status.md` item 10 |

---

## 6. Milestone 2 evidence

| PDF claim | Source |
|---|---|
| Five review routes and what each does | `bridge-software-frontend/docs/phase2/phase2-acceptance-record.md` — route-by-route implementation evidence table |
| Every route's acceptance is Pending | Same file — "Tori route-by-route review" table: all five rows Pending, no date, no source locator |
| Default Community feed undecided | Same file — "Default feed" table, both options Pending |
| Data model: schema, RLS, roles reported complete | `../2026-08-14-milestone-2-acceptance-review.md` acceptance matrix |
| Conditional acceptance pending evidence and security remediation | Same file — stated decision, plus the 8-item technical evidence request and the 5-item security remediation list |
| Handoff package contents | `docs/phase2/01-route-and-screen-map.md`, `02-role-and-field-permission-matrix.md`, `03-journey-maps-and-acceptance.md`, `04-phased-backlog-and-decisions.md`, `05-miraj-handoff-one-pager.md` |
| Build sent for sign-off 2026-08-17 | Gmail thread `1a010a5e42734ccc` — "Bridge — Phase 2 Complete, Ready for Your Review", listing the same five routes and naming what is not yet connected |
| Review promised 08-18, 08-23, 09-01 | Gmail threads `1a010a5e42734ccc` (08-18), `1a0267f62c115333` (08-23), `1a05dd557b5c4368` (09-01) |
| Momentum stated in writing the routes are not approved | Gmail thread `1a0267f62c115333`, 2026-08-21: *"I know the five routes aren't officially approved yet…"* |
| Non-algorithmic feed for MVP | `phase2-acceptance-record.md`, closing note |

---

## 7. Milestone 3 evidence

| PDF claim | Source |
|---|---|
| M3 scope (registration, login, email verification, password reset, role accounts, EIN capture, jurisdiction/licence fields, approval status, admin queue, terms acceptance) | phase-map §1.1, Milestone 3 row |
| Milestone 3 started 2026-08-21 | phase-map §3; `docs/phase3/00-status.md` |
| Join Step 1 live; Steps 2–4 sequence and why | `docs/INTEGRATION-API-CONTRACT.md` — "Why `/join` shows Step 1 but not Steps 2–4", with the four-step integration sequence |
| Step 2 built at `/join/account` | build-report §1; `app/join/account/page.tsx` on the hardening branch; 404 in production confirms unmerged |
| Steps 3–4 blocked on backend + product approval | build-report "What stays blocked"; API contract as above |
| One HTTP client, one status mapping | build-report §2; `docs/INTEGRATION-API-CONTRACT.md` status mapping (401/403/400/422/409) |
| No token in browser storage; session read from the API | build-report §2, including the test asserting no client file references web storage |
| Role-aware routing; open-redirect guard | build-report §4 |
| Required states per route | build-report §3 route/state table |
| Accessibility and contrast | build-report §5 |
| CI and automated contrast check | build-report §6 |
| Age-eligibility signal has no server-authoritative source | build-report "What Miraj must change", item 4; reconciliation.md §2 |

---

## 8. Integration handoff evidence

| PDF claim | Source |
|---|---|
| Two documents published 2026-08-31 and handed over | `docs/INTEGRATION-PIPELINE.md`, `docs/INTEGRATION-API-CONTRACT.md`; `../2026-08-31-integration-pipeline-approval.md` |
| Endpoint contract the front end already calls | `INTEGRATION-API-CONTRACT.md` — seven endpoints under `/api/v1` with request and response shapes |
| Required CORS origins | Same file — production, preview and the agreed local origin |
| Security rules (no keys, tokens, passwords or verification documents in Git, build logs, browser storage or public client variables) | `INTEGRATION-PIPELINE.md`, "Never place…" |
| Repository and hosting invitations issued, acceptance pending | `INTEGRATION-PIPELINE.md`, "Access status as of 2026-08-31" |
| Backend delivered: server-side RBAC rejecting missing and forged credentials | `../2026-09-02-greencubes-integration-reconciliation/reconciliation.md` §2 "Delivered and verified" |
| Real CORS allowlist, strong headers, health/version endpoints | Same table |
| Registration, sign-in, recovery, re-verification screens; server-side queue filters | Same table |
| Six of nine session claims absent, including age eligibility | reconciliation.md §2 "Not delivered" |
| One missing response header is the root cause of three defects | reconciliation.md §2; build-report "What Miraj must change" item 1 |
| Tokens written to browser storage against the written rule | reconciliation.md §2 |
| No route table or response examples supplied | reconciliation.md §2 |
| Backend repo / branch / commit still not supplied | reconciliation.md §2 |
| Join Step 1 was replaced, and how it was restored without reverting | build-report §1; reconciliation.md §2 |
| Security posture is the strongest part of the delivery | build-report closing paragraph |

---

## 9. "What happens next" — owner attribution

| Lane | Source |
|---|---|
| Greencubes items | build-report "What Miraj must change on his side" (9 items) + "What stays blocked on Human Gate B" (8 items); reconciliation.md §3 blocking items |
| Client items | phase-map §7 "Client (Tori)"; `docs/decision-log.md` open decision register D-01 through D-08; `phase2-acceptance-record.md` pending tables |
| Momentum items | phase-map §7 "Dillon"; build-report "What stays blocked" |
| Join Steps 2 and 4 product approval sits with Melissa and Tori | build-report §1 and "What stays blocked"; `INTEGRATION-API-CONTRACT.md` |
| Milestone 4 not started | phase-map §5 |

---

## 10. Slack evidence

Channel `#bridge-software-development` = `C0BGWRK03B2` (created 2026-07-08, Slack Connect shared with
Greencubes). Pre-channel origin/negotiation group DM = `C0B1CVD1EJF`. Account-lead DM = `D0B6F3J423F`.

Permalink pattern: `https://momentum3d.slack.com/archives/<CHANNEL_ID>/p<ts without the dot>`

| PDF claim | Channel | Timestamp | Note |
|---|---|---|---|
| Contract approved; channel created; "Start Phase 1 = Milestone 1: Discovery, Requirements, and Architecture" | C0BGWRK03B2 | `1783541340.810669` | Mac's canonical project record, 2026-07-08. Confirms the milestone name and the kickoff |
| Client green light | C0B1CVD1EJF | `1783529761.187279` | 2026-07-08, "Update: Green light!" |
| Six-milestone brief delivered | C0BGWRK03B2 | `1783675484.900689` | 2026-07-10, `Bridge-milestones.docx` |
| Momentum execution plan | C0BGWRK03B2 | `1783712691.859469` | 2026-07-10 |
| Client source package sent | C0BGWRK03B2 | `1784496457.594869` | 2026-07-19 |
| Verification approach: manual review, encrypted storage, Momentum owns the admin UX | C0BGWRK03B2 | `1784558576.679129` | 2026-07-20. Supports the M1 "compliance shaped the product" claim |
| EIN + state-licence dual-layer verification research | C0BGWRK03B2 | `1784577128.674309` | 2026-07-20 |
| First working prototype live on the review URL | C0BGWRK03B2 | `1784580725.154419` | 2026-07-20, hours after the walkthrough call |
| Milestone 1 technical plan delivered | C0BGWRK03B2 | `1785151434.927159` | 2026-07-27 |
| Client reception of Milestone 1 work | C0BGWRK03B2 | `1785003579.672399` | 2026-07-25, relayed: "loves the colors and the UX" |
| **Phase 2 = Milestone 2, confirmed** | C0BGWRK03B2 | `1785939681.959579` | 2026-08-05: "I'll keep the current Phase 2 work mapped to Milestone 2." Supports the PDF's vocabulary note |
| Exclusion list confirmed in writing | C0BGWRK03B2 | `1785905321.250469` (thread) | 2026-08-05. Expanded directory, algorithmic feed, subscriptions/payments and in-platform ordering all held outside the MVP |
| 39-minute product session + written feedback from the client | C0BGWRK03B2 | `1785638012.711159` | 2026-08-01 |
| Milestone 2 backend delivered (schema, RLS, `/api/v1`, health/version, migrations validated) | C0BGWRK03B2 | `1786723904.070059` | 2026-08-14 |
| Milestone 2 frontend complete, formal acceptance still pending | C0BGWRK03B2 | `1786919046.237479` | 2026-08-16: "The frontend is ready for Tori to review. Formal acceptance is still pending." |
| Five routes ready for review/acceptance, with the four open items listed | C0BGWRK03B2 | `1786114196.795519` | 2026-08-07 |
| Client confirmed the purple direction is her own branding | C0BGWRK03B2 | `1787240345.222959` | 2026-08-20 |
| Milestone 3 started | C0BGWRK03B2 | `1787285041.786199` | 2026-08-21: "We will be starting Milestone 3 work from Monday" |
| Milestone 3 RBAC foundation complete | C0BGWRK03B2 | `1787572088.189689` | 2026-08-24 |
| **Milestone 3 is half done** | C0BGWRK03B2 | `1788020849.049499`, `1788020861.278419` | 2026-08-29: "No. We have completed the API development… So half done." Supports the PDF's in-progress status |
| Integration pipeline + API contract handed over | C0BGWRK03B2 | `1788189518.841319` | 2026-08-31. The formal handoff message |
| **Steps 2 and 4 are not client-approved** | C0BGWRK03B2 | `1788189518.841319` | 2026-08-31: "Step 2 and Step 4 product approval is still with Melissa/Tori… do not represent those screens as client approved yet." Quoted in substance in the PDF |
| Same point, asked and answered directly | C0BGWRK03B2 | `1788187704.416449`, `1788188129.273849` | 2026-08-31: "Step 2 and 4 are not yet approved by Tori?" — answer was that follow-up was still needed |
| Repository and hosting access granted; invitations pending | C0BGWRK03B2 | `1788195156.505139` | 2026-08-31 |
| Backend staging origin shared | C0BGWRK03B2 | `1788356206.315599` | 2026-09-02, `bridge-software-backend.onrender.com` |
| Milestone 3 backend "almost done", final update due | C0BGWRK03B2 | `1788357584.557269`, `1788357594.416469` | 2026-09-02 |
| Client meeting scheduled for 2026-09-03 | C0BGWRK03B2 | `1788196316.688169` (thread) | Scheduling origin; confirmed by the client's own 09-01 email reply |

### The pricing-exposure instruction this report was written under

| Item | Channel | Timestamp |
|---|---|---|
| Backend lead, 2026-09-03: keep pricing out of the now-public GitHub repository, since developers have access | C0BGWRK03B2 | `1788412561.428559` |
| Momentum's reply confirming it was actioned | C0BGWRK03B2 | `1788415425.672619` |

This is the operative reason no contract figure appears anywhere in this deliverable. The frontend
repository is public.

### Open item observed but deliberately not in the PDF

A brand and URL conflict was raised on 2026-07-27 (`C0BGWRK03B2` `1785170728.022849`, thread) — an
existing dispensary reportedly holds the name and a number of the URLs and usernames. No resolution
appears anywhere later in the record. This is a client-side brand and legal matter rather than a
milestone deliverable, so it is not reported in the milestone PDF; it is flagged here because it is
still unresolved and belongs in the account lead's lane.

---

## 11. Design provenance

| Element | Source |
|---|---|
| Page size, palette, structure, stat-row and section-footer conventions | `../2026-07-27-bridge-deliverables-current-state-forward-plan.pdf` — 612×792 pt, Poppins ExtraBold/Bold/SemiBold/Regular |
| Typeface | **Poppins**, loaded from Google Fonts. Confirmed applied at render time: weights 400/600/700/800 reported loaded by the browser font API. Fallback stack is Segoe UI → system-ui → sans-serif |
| Bridge mark | `bridge-mark.svg`, copied unchanged from `../2026-08-24-milestone-3-progress-update/bridge-mark.svg` |
| Colours | Primary purple `#9b4df6`, deep indigo `#4b0082`, ink `#1a1a1a`, muted grey `#5f5964`, light lavender `#d8d0dd` |
| Render method | HTML + CSS → Playwright Chromium `page.pdf()`, Letter, print backgrounds on, zero page margins with page-level padding |

---

## 12. What could not be verified

1. **The signed agreement PDF itself was not read for this report.** All contract structure comes
   from the reconciled phase map, which recovered the immediate antecedent proposal document in
   full and cross-checked it against downstream artifacts with no discrepancy. The phase map
   records three failed retrieval paths for the executed PDF.
2. **No dated client acceptance exists for any milestone.** This is a finding, not a gap in
   research — the acceptance record's decision columns are empty and the client's own messages
   defer review three times. The PDF states this plainly rather than implying acceptance.
3. **Milestone 1 payment is recorded in internal sources but no invoice or receipt artifact was
   located.** Payment status is deliberately absent from the PDF regardless.
4. **Join Step 2 / Step 4 approval does not exist.** No approval was found in email or Slack. What
   was found is the opposite: an explicit written instruction on 2026-08-31 not to represent those
   screens as client approved, restated when asked directly the same day, with no approval recorded
   since. The PDF reflects this.
5. **The pricing-exposure concern is real and was located in Slack, not email** — see §10. It was
   raised on 2026-09-03 and actioned the same morning.
6. **The same two people use different addresses in each system.** The account lead appears in Slack
   as the address supplied in the brief but sends all client email from a Momentum work address; the
   backend lead appears in Slack under the Greencubes address and in email under a personal one. Both
   identities were confirmed by name, role and message content across both systems.
7. **PDF and DOCX attachments referenced in email could not be opened** through the mail connector,
   which returns metadata only. Where their content mattered, the same material was verified from
   the repository or the live product instead.
