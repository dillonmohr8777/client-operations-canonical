# Bridge Software — reconciled phase and milestone map

**Date:** 2026-09-02
**Client route:** `bridge-software` (child client under Momentum 360)
**Status:** Internal reconciliation. Nothing here has been sent, posted, merged, or approved.

---

## HEADLINE — read before Thursday

**In the client-facing agreement, "Phase 4" and "Milestone 4" are the same thing, and that
thing is the Directory MVP — the single largest payment milestone at $13,500, 30% of the
contract. It has not started.**

**In `CLAUDE_BUILD_SPEC.md`, "Phase 4" means Supabase integration — a bounded engineering
step that Greencubes has already partly begun.**

Dillon has used both words with the client. Telling Tori, Melissa, or Mac "we're starting
Phase 4" reads, in the agreement's own vocabulary, as **triggering a $13,500 milestone for
the largest body of unbuilt work in the project.** In the build-spec vocabulary it means
"wire up one auth endpoint."

The source proposal makes the collision explicit: its scope section is headed
*"The work is organized into six milestones"*, and the sections underneath are titled
**Phase 1 … Phase 6**. The investment table then calls the same six rows **"MILESTONE
SCOPE."** Phase and Milestone are 1:1 synonyms in the contract document. There is no
version of that vocabulary in which Phase 4 is a small step.

**Fix:** in every client-facing sentence, say the milestone number *and its contract name*
("Milestone 3, Accounts, Authentication and Verification"). Never say a bare "Phase N."

> **Note on the comparison hypothesis.** The VA Claims contract's Phase 4 is "Testing,
> Revisions & Optimization," and the concern was that Bridge might inherit that label. **It
> does not.** Bridge is a six-phase schedule, not five; its testing and QA sit in Phase 6.
> Bridge Phase 4 is Directory MVP. The conflict is real but its content is different — and
> materially worse, because $13,500 is at stake rather than a labelling mismatch. Full
> template comparison in §2.

---

## 0. Source and evidence boundary — read this second

**The signed agreement PDF was not read.** Three retrieval paths were attempted and all failed:

| Path | Locator | Result |
|---|---|---|
| Slack file | `F0B9HT6HWRM`, Mac Frederick, 2026-06-11 | **Failed, 3 attempts.** `slack_read_file` returns MCP error `-32602: Invalid tools/call result` — the connector's response schema rejects `content[1]` (binary payload, `_meta: null`). Reproduced on `F0BL7ES1JP6`. Deterministic connector bug, not transient. |
| Gmail attachment | `gmail://message/19eb7f3e203331dd/attachment/ANGjdJ9-z5Lb…` | Attachment **confirmed present**, `application/pdf`. Gmail connector exposes metadata only; no attachment-download tool available. |
| Composio → Gmail | `GMAIL_GET_ATTACHMENT` | **Blocked.** `has_active_connection: false` for the gmail toolkit; OAuth cannot be completed in a non-interactive session. |

Disk and Drive searches found no copy of the agreement anywhere.

**What replaced it.** The direct antecedent *was* recovered in full:

> **`The Ecosystem Proposal 45k - Updated 2026-06-08`**
> Google Doc `1DO4laJqKRKBXj8v3Ui4FLApbH_ESG7qdg3ySm_tsdVk`, owner `dillonmohr8777@gmail.com`,
> last modified 2026-06-09 20:13 UTC — **read in full.**

This is the document Mac approved on 2026-06-09 (*"I think your 6 phases and pricing is
fine actually"*), that Dillon finalised on 2026-06-11 12:30, and that Mac converted into
the agreement PDF ninety minutes later (*"thanks ill revise and send"*, 13:25 →
*"Final agreement PDF please review"*, 14:03). Its milestone names, scope lists,
deliverables and dollar amounts match every downstream artifact — Miraj's six-milestone
brief, Dillon's July 10 plan, and the August 14 acceptance review — with no discrepancy.

**Confidence.** Milestone names, sequence, scope, deliverables, dollar amounts, timeline
and the exclusion list are **high confidence**. Legal terms added by Mac at the PDF
stage — ownership, non-compete, rights, acceptance mechanics, signature block — are
**unverified** and flagged inline as such.

**Recovery action:** open the 17hats quote at `momentum.17hats.com/p#/quote/-aJVEhvvJzQG`,
or ask Mac to re-share the agreement as a Doc.

---

## 1. What the agreement contracted

### 1.1 Six milestones, $45,000

| # | Contract name | Investment | What it owes |
|---|---|---:|---|
| **1** | **Discovery, Requirements, and Architecture** | **$5,000** | NDA-protected prototype walkthrough, product requirements map, user role definitions, MVP feature prioritization, cannabis compliance intake checklist, EIN/business verification requirements, initial database and architecture plan.<br>**Deliverables:** confirmed MVP feature list · platform architecture plan · milestone build plan · open questions list |
| **2** | **UX, Product Flow, and Data Model** | **$6,500** | Application map, core user flows, signup/onboarding flow, brand + retailer/dispensary + sales-rep profile structures, product and category taxonomy, search and filter requirements, admin review workflow, Supabase/PostgreSQL schema, permission and access model.<br>**Deliverables:** UX flow map · data model · core screen plan · admin workflow plan |
| **3** | **Accounts, Authentication, and Verification** | **$7,500** | Registration and login, email verification, password reset, role-based accounts, EIN capture, state/jurisdiction/license-status fields, account approval status, admin verification queue, privacy and terms acceptance.<br>**Deliverables:** secure account system · role-based onboarding · EIN-gated profile creation · admin verification workflow |
| **4** | **Directory MVP** | **$13,500** | Brand + retailer/dispensary + sales-rep profiles, company and contact info, rep territory/coverage, product and category fields, logos, visibility controls, search by company/category/role/state/territory/verification status, profile update workflow, claim/correction workflow, contact request workflow, email notifications.<br>**Deliverables:** searchable directory · editable profiles · update and correction flow · contact request routing |
| **5** | **Early Engagement Layer** | **$4,500** | Basic updates and posts tied to verified profiles, announcement/news module, saved and favorited profiles, basic notification framework, foundation for a future feed.<br>**Deliverables:** early content layer · saved profiles · notification foundation · future roadmap |
| **6** | **Admin, Security, QA, and Launch** | **$8,000** | Admin dashboard, user management, profile approval and moderation, content flagging, secure DB permissions, access control review, SSL/hosting, AWS deployment, backup and recovery, QA testing, bug fixes, launch checklist, handoff documentation, team training.<br>**Deliverables:** production-ready MVP · admin tools · secure deployment · QA-tested launch package · handoff docs |
| | **TOTAL** | **$45,000** | |

**Timeline:** *"10 to 14 weeks after project kickoff, NDA completion, and prototype walkthrough."*

Milestone 4 is 30% of the contract on its own — larger than milestones 1, 2 and 5 combined.

### 1.2 Acceptance mechanism

The proposal does **not** contain a formal acceptance clause. Acceptance in practice is
per-milestone, client-side and explicit:

- Melissa's Phase 1 role list assigns Mac to *"Confirm Phase 1 deliverables are signed off
  before Phase 2 kicks off"* (`slack://C0BGWRK03B2/1783609953.192479`).
- Melissa's Aug 17 client email: Phase 2 is *"ready for you to look at and sign off on."*
- Operating context: *"Keep approval and acceptance criteria explicit at every handoff."*

**Unverified:** whether Mac's PDF added a deemed-acceptance clause (auto-accept after N days
of client silence). This matters directly — see R2.

Dillon's own internal standard is stricter and worth keeping:
*"Do not mark any box without a dated source locator"* (`docs/phase2/phase2-acceptance-record.md`).

### 1.3 Money in practice

| Item | Value | Source |
|---|---|---|
| Payment cadence | Per milestone | Mac, 2026-07-31: *"she is going to pay per milestone"* |
| M1 paid to team | $5,000 | Mac, 2026-07-31 — matches the proposal's M1 exactly |
| Dillon's share | 20% ($1,000 on M1) | Mac, 2026-07-08 and 2026-07-31 |
| Other shares | Melissa 15%, Miraj's team 40% | Mac, 2026-07-08 |
| Cost ceiling guidance | *"keep it under $50k for sure"* | Mac, 2026-06-02 |

Dillon's 20% across the full contract is **$9,000** if all six milestones complete. Of that,
**$2,700 sits in Milestone 4 alone.**

⚠️ **Do not reuse the 2026-07-20 `#va-claims` message** ("Client just paid for month 2 =
milestone 2"). Different client, different engagement. Not Bridge.

### 1.4 Exclusions — the "Section 10" list

Miraj cites *"Section 10"* of the signed scope as the exclusions list (2026-08-05). The
proposal's equivalent is a boxed callout headed **"OUTSIDE THIS FIRST BUILD"** plus two
Assumptions lines. Combined:

| Excluded | Where stated |
|---|---|
| Full algorithmic social feed / feed ranking | "Outside this first build" box + Assumptions |
| Advanced social graph | "Outside this first build" box |
| Native mobile apps | "Outside this first build" box |
| Complex recommendation engine | "Outside this first build" box |
| In-platform payment processing | "Outside this first build" box |
| Subscriptions | Assumptions |
| Marketplace / ordering flows | Assumptions |
| Expanded ecosystem directory (banks, transporters, labs, manufacturers, construction, HVAC, electricians) | Miraj 2026-08-05; not in the proposal's contracted role set |
| Private Bridge League / rewards | `docs/decision-log.md` 2026-08-15 |
| HR functionality | `docs/decision-log.md` 2026-08-15 |

**Contracted core users:** brands, retailers and dispensaries, sales reps, admins.

**Client-side pass-through costs** (explicitly not in the $45,000): hosting, domain,
third-party services, paid APIs, SMS/email usage, **AI model tokens and API credits**,
legal fees, payment-processor fees.

**Estimate disclaimer:** the $45,000 is *"a good-faith estimate"*; material scope changes,
technical discoveries or third-party constraints *"may create additional charges"*, reviewed
before the added work proceeds. **This is Momentum's protection and it is currently unused —
see R1.**

Dillon accepted every boundary in writing on 2026-08-05: *"The expanded ecosystem directory
can stay in the later phase backlog."*

---

## 2. Template comparison — Bridge vs. VA Claims

VA Claims reference (supplied): Momentum Digital **"Custom Software Development & Ownership
Agreement"** — five phases, $15,000 total, $3,000 prepaid per phase, next phase begins only
after prior-phase client approval **and** next prepayment, non-cancellable, $350/month
maintenance fixed for 24 months post-launch, full client ownership on payment, mutual NDA
and non-compete, weekly updates + monthly calls + phase review meetings, Phase 4 = "Testing,
Revisions & Optimization."

| Dimension | VA Claims | Bridge | Verdict |
|---|---|---|---|
| **Title** | "Custom Software Development **& Ownership** Agreement" | "Custom Software Development **MVP** Agreement" (filename) | **Same family, different variant** |
| **Phase / milestone count** | **5** | **6** | ❌ **DIFFERENT** |
| **Total** | $15,000 | $45,000 | ❌ **DIFFERENT** |
| **Payment shape** | Flat $3,000 × 5, **prepaid** | Variable: $5,000 / $6,500 / $7,500 / $13,500 / $4,500 / $8,000, *"paid across six milestones as the build progresses"* | ❌ **DIFFERENT** — variable and not stated as prepaid |
| **Prepayment gates next phase** | Yes, explicit | **Not present in the proposal.** No prepayment or non-cancellable language anywhere in the proposal or in any Slack/Gmail evidence. Mac's practice statement is only *"she is going to pay per milestone."* | ⚠️ **Likely different — UNVERIFIED in the PDF** |
| **Non-cancellable** | Yes | Not in the proposal | ⚠️ **UNVERIFIED in the PDF** |
| **Maintenance retainer** | $350/mo **fixed, 24 months**, auto-starts after final phase | **Section exists** — "Post-Launch Retainer and Support" — but **price and term are deliberately deferred**: scope, hours, response expectations and pricing *"will be confirmed separately before launch"*, and it is *"not included in the $45,000"* | ⚠️ **PRESENT BUT MATERIALLY WEAKER** |
| **Ownership clause** | Full client ownership of code and environment on payment | **No ownership section in the proposal.** Mac's cover email says he added *"terms around the NDA, non-compete, ownership, rights, phases"* | ⚠️ **Almost certainly present in the PDF — terms UNREAD** |
| **Mutual NDA + non-compete** | Yes | Separate NDA executed 2026-05-27 → 2026-06-01 by Melissa, Mac, Dillon, Miraj. Mac's email confirms NDA + non-compete terms in the agreement | ✅ **Same** |
| **Communication obligations** | Weekly updates + monthly calls + phase review meetings | **Not in the proposal.** In practice the team runs weekly reports and monthly client updates anyway | ⚠️ **UNVERIFIED in the PDF** |
| **Phase 4 meaning** | "Testing, Revisions & Optimization" | **"Directory MVP" — $13,500** | ❌ **DIFFERENT** |

### Answer to the question asked

**Bridge uses the same Momentum Digital template *family* — same title convention, same
clause families (NDA, non-compete, ownership, rights, phases) — but a bespoke commercial
core.** The scope, phase count, phase names, payment schedule and retainer terms were
written from scratch by Dillon for this engagement and approved by Mac on 2026-06-09. Only
the surrounding legal boilerplate is templated.

**Therefore the VA Claims Phase 4 label does not transfer.** Bridge Phase 4 is Directory
MVP. Testing and QA are Phase 6.

**The Phase 4 conflict is nonetheless real, and larger than the hypothesis.** See the
Headline.

### Two different "$350/month" — do not conflate

- **2026-06-10:** Miraj quoted **$350/month** for *post-launch maintenance* (8 support hours,
  bug fixes, monitoring, DB health checks, security updates, backup verification). This fed
  the proposal's retainer section, which then declined to lock the number.
- **2026-08-05:** Miraj flagged a **$350/month** *subscription pricing hypothesis* in Dillon's
  Phase 2 doc — Bridge charging its own users — as excluded MVP scope.

Same number, unrelated meanings. Anyone reading only one Slack message will merge them.

### Signature block — stated plainly

**It could not be inspected.** The PDF was unreadable through every available path.

**But the more useful finding is that the PDF may never have been the signature vehicle.**
The execution trail runs through 17hats, not the PDF:

- 2026-06-11 14:03 — Mac posts the PDF internally: *"Final agreement PDF please review"*
- 2026-06-11 18:31 — Mac emails it to Tori as *"our new standing proposal"* — proposal language, not an executed contract
- 2026-07-08 13:27 — Mac posts **a 17hats quote link**: *"please review the final contract for any revisions before I send it"*
- 2026-07-08 12:56 — Melissa: *"Update: Green light!"*
- 2026-07-08 16:09 — Mac: *"Contract Approved"*, hyperlinked to **`momentum.17hats.com/p#/quote/-aJVEhvvJzQG`**

**Assessment:** the operative executed instrument is most likely the **17hats quote**, which
Mac sent *after* the PDF and described as "the final contract." The 2026-06-11 PDF is
plausibly an unsigned proposal superseded by it. **Neither has been confirmed as carrying a
completed signature block with names and dates.** Verify which document Tori actually signed
before relying on any clause — including the phase schedule this map is built on.

---

## 3. Dated timeline, 2026-05-27 → 2026-09-02

| Date | Event | Source |
|---|---|---|
| 2026-05-27 | Dillon drafts NDA intake form; Melissa sends NDA; Mac and Dillon sign | Group DM `C0B1CVD1EJF` |
| 2026-06-01 | Miraj returns signed NDA — **NDA fully executed** | Gmail thread `19e6a5791432651c` |
| 2026-06-01/02 | Miraj sends the stack overview to Tori and Mac (Supabase/PostgreSQL, Claude + Cursor, AWS) | Gmail |
| 2026-06-02 | Mac: *"we would probably need to put into milestones/phases"*; *"keep it under $50k"* | Group DM |
| 2026-06-02 | **Dillon drafts the proposal — $45K, milestones/phases**, under the NDA name "The Ecosystem" | Drive `1FEyI1Sbv…` |
| 2026-06-07 | Tori renames the product **The Ecosystem → Bridge**; Miraj approves the proposal | Gmail; Group DM |
| 2026-06-08 | Proposal updated: client-side token costs, Project Team section | Drive `1DO4laJ…` |
| 2026-06-09 | **Mac approves the structure:** *"I think your 6 phases and pricing is fine actually"* (after floating "5 phases x $9000") | Group DM |
| 2026-06-10 | Miraj supplies maintenance terms — **$350/month, 8 hours** | Group DM |
| 2026-06-11 12:30 | Dillon finalises: retainer section, estimate disclaimer, pass-through costs | Group DM |
| 2026-06-11 13:25 | Mac: *"thanks ill revise and send"* | Group DM |
| 2026-06-11 14:03 | **Mac posts the agreement PDF** (`F0B9HT6HWRM`) | Group DM |
| 2026-06-11 18:31 | **Mac emails the agreement to Tori** — *"terms around the NDA, non-compete, ownership, rights, phases"* | Gmail `19eb7f3e203331dd` |
| 2026-06-22 / 06-29 / 07-06 | Tori delays; apologises; says she is reviewing | Group DM |
| **2026-07-08 12:56** | **Melissa: "Green light!" — client approves** | Group DM |
| 2026-07-08 13:27 | Mac circulates the **17hats quote** as the final contract | Group DM |
| 2026-07-08 16:05 | `#bridge-software-development` created | Channel |
| 2026-07-08 16:09 | Mac: **"Contract Approved"** (17hats link); *"Start Phase 1 = Milestone 1"*; commission split set | Channel |
| 2026-07-09 | Melissa publishes the Phase 1 responsibility split; Miraj: *"i have prepared all 6 milestones plan"* | Channel |
| 2026-07-10 | Miraj posts the six-milestone brief (`F0BGQFDASA0`); Dillon posts his execution plan | Channel |
| 2026-07-13 | Internal team call | Channel |
| 2026-07-19 | Tori sends her prototype and source materials | Channel |
| 2026-07-20 | **Client onboarding / prototype walkthrough call**; Dillon ships a prototype hours later | Channel |
| 2026-07-21 | Miraj's EIN verification provider research | Channel |
| 2026-07-23 | Tori product transcript session (Otter) | `docs/phase3/03-…` |
| 2026-07-25 | Melissa relays Tori's reaction: *"loves the colors and the UX"* | Channel |
| **2026-07-27** | **Miraj delivers the Milestone 1 architecture document**; Melissa forwards it to Tori | Channel |
| 2026-07-28 | Dillon issues the purple-direction / milestone-roadmap client PDF (**introduces vocabulary C**) | Deliverables |
| **2026-07-31** | **Mac pays the team for M1 = $5,000**; confirms per-milestone billing; notes Tori had not yet paid | Group DM `C0B1Y5XDQMA` |
| 2026-08-01 | Tori's written feedback → Phase 2 execution plan | Deliverables |
| **2026-08-05** | **Miraj starts Milestone 2**; raises the 5-phase vs 6-milestone mismatch and Section 10; Dillon confirms alignment | Channel |
| 2026-08-06 | Phase 2 acceptance record opened — **all items pending** | `docs/phase2/…` |
| 2026-08-07 | Dillon posts "ready for review / acceptance" | Channel |
| **2026-08-14** | **Miraj reports M2 backend complete. Dillon's review returns "Revise: evidence and security remediation required"** (credentials + OTP exposed in Slack) | Deliverables |
| 2026-08-16 | Dillon completes his M2/Phase 2 frontend; Melissa approves sending to Tori | Channel |
| **2026-08-17** | **Melissa emails Tori: "Phase 2 is complete… ready to sign off"** | Gmail `1a010a5e…` |
| **2026-08-18** | **Tori: will review "tomorrow"; "I'll get payment out tomorrow"** | Gmail |
| 2026-08-19 | Phase 3 opened (build-spec lane) | `docs/phase3/00-status.md` |
| 2026-08-21 | 21+ entry gate restored; **Miraj starts Milestone 3**; Dillon emails Tori directly | Channel; decision log |
| 2026-08-23 | Tori: will review "tonight" — **no response followed** | Gmail |
| 2026-08-24 | Dillon issues the **"Milestone 3 Progress"** client PDF | Deliverables |
| **2026-08-29** | **Melissa ↔ Mac disagree on what shipped**; Melissa unsure if one or two milestones are being billed; Dillon: *"she needs to approve the 5 routes"* | DM `D0B6F3J423F` |
| 2026-08-31 | Integration pipeline built; repo made public; admin invites sent; Dillon sets backend-evidence preconditions | Deliverables |
| 2026-09-01 | Melissa sends the monthly update; Tori will catch up "tomorrow night" | Gmail `1a05dd55…` |
| **2026-09-02** | **Greencubes PR #13 reviewed — 5 blocking items.** This map written | Deliverables |
| **2026-09-03** | **Client meeting with Tori (Thursday)** | reconciliation.md |

**Payments confirmed: exactly one.** $5,000 for Milestone 1, paid by Mac to the team
2026-07-31. No evidence of any Tori payment landing. No invoice references appear anywhere
in Slack or Gmail.

---

## 4. The three vocabularies

### A — The contract (client-facing, commercial)
Milestones 1–6 per §1.1, with "Phase N" used interchangeably in the source document.
**This is what Tori pays against.**

### B — `CLAUDE_BUILD_SPEC.md` (engineering only)

| Step | Name |
|---|---|
| Phase 0 | Verify and inventory |
| Phase 1 | Make the discovery prototype meeting-ready |
| **Human gate A** | **Tori product and brand walkthrough** |
| Phase 2 | Implement the approved UX system |
| Phase 3 | Productionize the front-end flows (typed view models + mock adapters) |
| **Human gate B** | **Miraj backend contract** |
| Phase 4 | Supabase integration |
| Phase 5 | Required states and resilience |
| Phase 6 | Test and audit |
| Phase 7 | Release and traceability |

Eight phases (0–7) plus two gates. Frontend lane only. No commercial meaning.

> ⚠️ `2026-09-02-greencubes-integration-reconciliation/reconciliation.md` §6 calls this
> "the six-phase build process," silently dropping Phase 0 and Phase 7. Gate positions and
> Phase 4's meaning are right; the count is wrong.

### C — Dillon's July 28 "six-milestone lane" (drift — retire this)

`2026-07-28-bridge-purple-direction-next-milestone-plan.pdf`, section 03, headed
**"DILLON'S SIX-MILESTONE LANE"**:

| # | July 28 label | Contract milestone with that number |
|---|---|---|
| M1 | Discovery, requirements, and architecture | ✅ same |
| M2 | Product definition and UX system | ≈ same (contract adds "Data Model") |
| M3 | **Frontend foundation and AI-assisted workflow** | ❌ contract M3 = **Accounts, Authentication and Verification** |
| M4 | **Core MVP frontend build** | ❌ contract M4 = **Directory MVP, $13,500** |
| M5 | **Integration, QA, and acceptance readiness** | ❌ contract M5 = **Early Engagement Layer** |
| M6 | **Launch readiness, documentation, and handoff** | ≈ overlaps M6 but drops Admin + Security |

**This went to a client review** under a heading claiming milestone authority, using the
contract's own numbers with different meanings.

### The mapping

| Contract milestone | Build-spec phases |
|---|---|
| M1 Discovery, Requirements & Architecture | Phase 0, Phase 1, **Human gate A** |
| M2 UX, Product Flow & Data Model | Phase 2, Phase 3 *(mock adapters — no backend needed)* |
| M3 Accounts, Auth & Verification | **Human gate B**, Phase 4 *(auth slice only)* |
| M4 Directory MVP | Phase 4 (remaining flows), Phase 5 |
| M5 Early Engagement Layer | Phase 4 (posts/favorites), Phase 5 |
| M6 Admin, Security, QA & Launch | Phase 6, Phase 7 |

### Where they do not line up

1. **"Phase 4" collides at maximum cost.** See the Headline.
2. **The numbers desynchronize at 3.** Contract M3 = backend accounts/auth. Build-spec
   Phase 3 = frontend mock productionization. July 28 M3 = design-system foundation.
3. **Phase and Milestone have been used as synonyms in client comms** — correctly, per the
   contract document, but against build-spec phase numbers that mean something else.
4. **A fourth artifact exists.** Miraj flagged the "5-phase plan" on 2026-08-05. Dillon's
   answer was right — five phases are the UX execution layer inside six milestones — but it
   lives only in one Slack reply and one internal file. It was never promoted.
5. **`CLAUDE_BUILD_SPEC.md` self-declares historical**, deferring to
   `INTEGRATION-PIPELINE.md` and `INTEGRATION-API-CONTRACT.md` — yet the Sept 2
   reconciliation still gates work on its Phase 4 and Gate B.

---

## 5. Status per milestone as of 2026-09-02

| Milestone | $ | Status | Evidence |
|---|---:|---|---|
| **M1** Discovery, Requirements & Architecture | $5,000 | **Delivered · paid · acceptance not formally recorded** | Miraj's architecture doc 2026-07-27; Melissa forwarded to Tori; Mac paid the team 2026-07-31. No dated client sign-off artifact. |
| **M2** UX, Product Flow & Data Model | $6,500 | **Delivered pending acceptance — internally marked Revise** | Dillon: five routes live and QA'd (2026-08-16 report). Miraj: schema/RLS/roles reported complete. Dillon's own review: **"Revise: evidence and security remediation required."** Client record: **ALL ITEMS PENDING.** |
| **M3** Accounts, Auth & Verification | $7,500 | **In progress — backend live, integration blocked** | Started 2026-08-21. Backend live at `bridge-software-backend.onrender.com` (`bridge-api` 0.1.0, env `development`). PR #13 delivered auth, RBAC, admin queue — **5 blocking items**. |
| **M4** Directory MVP | **$13,500** | **NOT STARTED** | Explore/profiles exist as reviewable frontend on sample data only. No production directory data, no connected search, no claim/correction workflow, no email notifications. |
| **M5** Early Engagement Layer | $4,500 | **Not started** | Community News / Create exist as mock UI. |
| **M6** Admin, Security, QA & Launch | $8,000 | **Not started** | `/admin/verification` exists as frontend; Greencubes' admin portal arrived in PR #13, unmerged. |

**$26,000 of the $45,000 — 58% — sits in milestones that have not started, with 3 to 7 weeks
left in the estimated window.**

### Build-spec phase status (Dillon's lane)

| Phase | Status |
|---|---|
| Phase 0 verify/inventory | Complete (`docs/phase0-baseline-report.md`) |
| Phase 1 meeting-ready prototype | Complete (2026-07-11 defect repair) |
| **Human gate A** | **PARTIAL — never formally closed; 4 of 7 unmet** (§6.2) |
| Phase 2 approved UX system | Build complete, acceptance pending |
| Phase 3 productionize vs. mocks | Complete — 24 adapter tests passing |
| **Human gate B** | **PARTIAL — 0 met, 4 partial, 4 unmet** (§6.1) |
| Phase 4 Supabase integration | **Conditionally started — one bounded flow only** |
| Phase 5 states/resilience | Not started |
| Phase 6 test and audit | Partial — gates run locally, **no CI at all** |
| Phase 7 release/traceability | Not started |

---

## 6. Phase 4 preconditions

### 6.1 Human Gate B — verbatim, with status

`CLAUDE_BUILD_SPEC.md` §5: *"Before installing or connecting Supabase, obtain and document:"*

| # | Gate B item (verbatim) | Status | Owner |
|---|---|---|---|
| 1 | "Auth provider and session contract" | **PARTIAL** — bearer tokens live, Supabase fragment recovery observed; TTL, refresh/rotation and 6 of 9 claims undocumented | Greencubes |
| 2 | "User-to-profile and user-to-organization relationships" | **PARTIAL** — `/auth/me` returns `memberships` with role + status; no schema | Greencubes |
| 3 | "Tables/views, identifiers, enums, timestamps, and nullability" | **UNMET** | Greencubes |
| 4 | "Row-level-security intent for every read/write path" | **UNMET** | Greencubes |
| 5 | "Storage buckets, file types, size limits, signed URL behavior, and retention" | **UNMET** — the evidence-upload design requested 2026-08-31 | Greencubes |
| 6 | "Server actions/API/RPC boundaries and error shapes" | **PARTIAL** — `{error, message}` envelope confirmed; no route table | Greencubes |
| 7 | "Audit-event requirements and admin-role assignment" | **UNMET** | Greencubes |
| 8 | "Local, preview, and production environment-variable strategy" | **PARTIAL** — one Render `development` origin; no staging/production split | Greencubes + Dillon |

**Score: 0 met · 4 partial · 4 unmet. All eight are Greencubes-owed.**

**Verdict.** Build-spec Phase 4 is **conditionally open for exactly one bounded flow** —
auth/session/RBAC, which Miraj has effectively begun. Nothing else qualifies. Do not set
`NEXT_PUBLIC_BRIDGE_API_BASE` on the preview site until B1–B5 clear and Miraj supplies
backend repo, branch and commit.

**Contract Milestone 4 ($13,500) is blocked outright** — it sits behind M3 acceptance, and
M3 sits behind an M2 that was never accepted.

### 6.2 Human Gate A — verbatim, with status

*"Capture, do not infer:"*

| Gate A item (verbatim) | Status | Owner |
|---|---|---|
| "Primary audience and role priority" | **PARTIAL** — five MVP roles agreed by team; D-07 open | Tori/Melissa |
| "Approved MVP screens and navigation" | **UNMET** — all five routes Pending | Tori |
| "Contact model and privacy expectations" | **UNMET** — D-05 open | Tori |
| "Verification meaning, evidence, review process, expiration, and appeal" | **UNMET** — D-03, D-04 open | Tori/Miraj/compliance |
| "Required profile fields and visibility by role" | **UNMET** — working matrix only | Tori |
| "Approved visual direction, logo/wordmark status, colors, typography, imagery, and tone" | **PARTIAL** — Connected purple in production; written acceptance pending (D-01) | Tori |
| "Explicit exclusions and success criteria for the first release" | **MET (team-side)** — exclusions restated and accepted 2026-08-05 | done |

**Phases 2, 3 and 4 have all proceeded past a gate that is 4-of-7 unmet.** That is the
structural risk under everything else here.

---

## 7. Who owes what

### Dillon

| # | Item | Blocked by |
|---|---|---|
| 1 | Decide **D-09** (canonical repository) and **D-10** (cookie sessions vs. bearer) before Thursday | Nothing |
| 2 | Decide whether `/join` Step 1 is reverted; design the account-creation → role-selection sequence | Nothing |
| 3 | Unify `lib/auth/api.ts` into the Phase 3 adapter; add mock-mode fallback so `npm run dev` works | Nothing |
| 4 | Add CI running `test:phase3`, `typecheck`, `lint`, `build` | Nothing |
| 5 | Retokenise the admin portal; fix 4 WCAG AA contrast failures and the hidden skip link | Nothing |
| 6 | Decide what Tori sees Thursday, and whether to show the replaced `/join` | Nothing |
| 7 | Decide whether to post the PR #13 review as drafted | Nothing |
| 8 | Update `INTEGRATION-API-CONTRACT.md`, `INTEGRATION-PIPELINE.md`, `docs/phase3/00-status.md` | PR #13 |
| 9 | Session-claim handling; make `ageEligible` server-authoritative | Miraj's claim list |
| 10 | Join Steps 2–4 screens | Melissa/Tori approval |
| 11 | **Publish one canonical milestone↔phase map; retire vocabulary C** | Nothing |
| 12 | **Verify which instrument Tori signed — the PDF or the 17hats quote** | Nothing |

### Greencubes / Miraj

1. **B1** — revert the repo-pointer rewrite (`getonthebridge0-max/thebridge` 404s to an admin token)
2. **B2** — restore `credentials: "include"`; `test:phase3` is 23 pass / 1 fail
3. **B3** — the unflagged bearer-token switch; add `Access-Control-Allow-Credentials: true`
4. **B4** — restore `/join` Step 1 (role grid, per-role copy, "Step 1 of 4", pricing callout, boundary note)
5. **B5** — move access + refresh tokens out of `sessionStorage`; refresh token → httpOnly cookie
6. **All eight Human Gate B items** (§6.1)
7. Backend repo, branch, commit SHA, staging origin — the 2026-08-31 precondition
8. The nine session claims, **`ageEligible` first**
9. Route table with request/response examples
10. **M2 security remediation — rotate the exposed password, revoke sessions/tokens, confirm the OTP expired. Open since 2026-08-14.**
11. Accept the pending GitHub admin invite (`mirajmor`)
12. Resolve two service names: `/api/v1/version` says `bridge-api`, root `/health` says `thebridge-api`

### Client (Tori)

| # | Item | Promised |
|---|---|---|
| 1 | **Route-by-route accept or revise, all five routes** | 08-18 "tomorrow" · 08-23 "tonight" · 09-01 "tomorrow night" — **outstanding** |
| 2 | Default Community feed (News Grid vs. Classic) | Outstanding |
| 3 | D-01 formal brand approval of Connected purple | Outstanding — **already in production** |
| 4 | D-03 / D-04 / D-05 verification meaning, evidence, field visibility | Outstanding |
| 5 | D-07 first market and priority role | Outstanding |
| 6 | **Payment** | 2026-08-18: "I'll get payment out tomorrow" — no receipt evidence |
| 7 | Accept the GitHub admin invite (`getonthebridge0-max`) | Pending since 08-31 |
| 8 | Supabase paid plan (Miraj's 2026-07-27 request) | Unresolved |

### Melissa / Mac

1. Melissa: drive Tori's five route decisions to a dated written answer on 2026-09-03
2. Mac: confirm which milestone(s) August's payment covers — Melissa asked 08-29, answers conflicted
3. Mac: confirm whether M2 and M3 payment triggers have fired
4. Melissa: confirm the GitHub/Supabase account ownership path — **open since 2026-08-05**

---

## 8. Contract risk flags

### R1 — Excluded scope built and shipped to the client's review URL 🔴

`docs/phase3/00-status.md` records live on the URL Tori reviews:

- Nationwide discovery across **cultivators, manufacturers, laboratories, transport,
  cannabis-aware banking, service trades, media, hydroponics** — the expanded ecosystem
  directory Dillon agreed on 2026-08-05 would stay in the backlog.
- **Pricing and Bridge League concept pages** — subscriptions are excluded.
- **Menu preview, ordering state, directions** — ordering is excluded.

Labeled as "concepts" in the docs, and correctly logged as future scope. **But they are live
where the client looks**, and they were built while $26,000 of contracted, unstarted work
waited.

The proposal contains the exact instrument for this — *"material scope changes… may create
additional charges, which will be reviewed before the added work proceeds"* — and it has
never been invoked. Momentum has absorbed the cost of out-of-scope work **and** created a
client expectation.

**Action:** on 2026-09-03 state which surfaces are concepts, and get the acknowledgement in
writing.

### R2 — Three milestones reported complete with zero dated acceptances 🔴

| Claim | Date | Reality |
|---|---|---|
| "Phase 2 is complete… ready to sign off" (Melissa → Tori) | 08-17 | Acceptance record: **ALL ITEMS PENDING** |
| "MILESTONE 3 PROGRESS" client PDF | 08-24 | M2 not accepted; M3 backend "reported" only |
| "I finished milestone 3 a week ago" (Dillon → Melissa) | 08-29 | Dillon's *frontend* lane; contract M3 is backend accounts/auth, mid-flight |

Dillon's 2026-08-14 review issued **"Revise: evidence and security remediation required"**
against M2. No document records that finding being cleared. Three days later the client was
told Phase 2 was complete.

**It is not verified whether the agreement has a deemed-acceptance clause.** If it does,
Tori's silence since 08-18 may already have auto-accepted M2 — favourable. If not, three
milestones have been reported complete with no client sign-off on file. **Read the
acceptance clause before Thursday.**

### R3 — No defensible payment trigger after M1, with the window closing 🔴

- Only **M1 ($5,000)** has a confirmed payment.
- **M2 ($6,500)** — internally marked Revise, client acceptance pending.
- **M3 ($7,500)** — in progress with five blocking items.
- Melissa (08-29): *"I told Mac that we did both two and three this month and he was like no we didn't"* — **account manager and principal disagree on what shipped.**
- Dillon: *"she needs to approve the 5 routes"* — correct, and it means neither M2 nor M3 has a clean trigger.

**$40,000 of $45,000 is unbilled or unconfirmed.** From a 2026-07-08 kickoff, the 10–14 week
window closes **2026-09-16 to 2026-10-14** — 2 to 6 weeks out — with M4, M5 and M6 not
started. The largest milestone ($13,500) has not begun.

### Secondary flags

- **R4 — M2 security remediation open 19 days.** Credentials and a one-time code were posted
  in the shared channel. Rotation was required *before* M2 acceptance on 08-14. No
  confirmation exists. An unclosed security incident that also blocks a $6,500 milestone.
- **R5 — No branch protection, no CI.** `production` is writable by four admin invitees with
  the rule enforced only by prose. `gh pr checks 13` reports zero checks — which is exactly
  why B2 (a failing required test) reached a PR.
- **R6 — Vendor rewrote the canonical repository pointer.** PR #13 commit `9f5fa49` redirects
  three spec files to `getonthebridge0-max/thebridge`, which 404s to an admin token. If
  merged, the documented source of truth points at an unreadable repository.
- **R7 — Vocabulary drift is itself a contract risk.** Dillon's July 28 client PDF renumbers
  contract milestones 3–6 under a heading claiming milestone authority. If Mac or Tori reads
  "M4 = Core MVP frontend build" while the contract says "M4 = Directory MVP, $13,500," a
  payment dispute has a supporting document authored by Momentum.
- **R8 — The retainer was never locked.** VA Claims secured $350/month × 24 months = $8,400
  of guaranteed post-launch revenue. Bridge deferred it: *"confirmed separately before
  launch."* Nobody has confirmed it, launch is the last milestone, and Miraj's costed terms
  have been sitting unused since 2026-06-10.

---

## 9. One-page answer

- **Six milestones, $45,000**, non-uniform: $5,000 · $6,500 · $7,500 · **$13,500** · $4,500 ·
  $8,000. Paid per milestone. 10–14 weeks from kickoff.
- **Phase = Milestone in the contract document.** Client-facing **Phase 4 = Directory MVP =
  $13,500 = not started.** Build-spec **Phase 4 = Supabase integration.** Dillon has used
  both words with the client.
- **M1** delivered and paid, acceptance unrecorded. **M2** delivered, internally marked
  Revise, client acceptance pending. **M3** in progress, five blocking items. **M4–M6 not
  started — 58% of contract value.**
- **Human Gate B: 0 of 8 met** (4 partial, 4 unmet), all Greencubes-owed. Phase 4 integration
  is open for one bounded flow only — auth/session/RBAC.
- **Human Gate A: 4 of 7 unmet**, never closed. Everything since Phase 2 sits on top of it.
- **Bridge is the same Momentum template family as VA Claims** (title convention, NDA,
  non-compete, ownership, rights, phases) **with a bespoke commercial core**: 6 phases not 5,
  $45,000 not $15,000, variable milestones not flat prepayments, a deferred retainer not a
  fixed 24-month one. **The VA Claims "Phase 4 = Testing" label does not transfer.**
- **The signature block could not be inspected, and the PDF may never have been the
  signature vehicle** — the execution trail runs through the 17hats quote Mac circulated on
  2026-07-08 and labeled "Contract Approved."
- **Top three risks:** excluded scope live on the client's review URL with the change-order
  clause never invoked · three milestones reported complete with zero dated acceptances ·
  no defensible payment trigger after M1 with the window closing in 2–6 weeks.

**Before Thursday 2026-09-03:** determine which instrument Tori actually signed, then read
its acceptance clause, payment schedule, and exclusions. Milestone names, scope and amounts
above are high-confidence from the approved source proposal; the legal terms Mac added at the
PDF stage remain unread.
