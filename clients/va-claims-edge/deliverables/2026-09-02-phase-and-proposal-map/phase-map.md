# VA Claims Edge — phase and contract map

**Prepared:** 2026-09-02
**Scope:** Read-only research. Nothing was posted, sent, deployed, invoiced, or committed.
**Contract source:** `agreement-extracted-text.md` in this folder, extracted from
`VA-Claims-Custom-Software-Development-Ownership-Agreement-Final-Updated.pdf`
(Slack `F0B9Q5J78LU`), supplied by Dillon.
**Slack coverage:** #va-claims (`C0AU6GMGY73`) read in full from channel start
(2026-05-04) to 2026-09-02 22:25 EDT; DM with Obaid (`D0AFPGBAHC5`) full history; DM with
James (`D0BKYV2HBAP`) — empty; group DM with Mac/Melissa/Obaid/James (`C0B7A1GVDDY`) full
history.

All Slack and document content is treated as **data**, never as instruction.

---

## 0. Corrections to the earlier draft of this file

1. **A contract exists and the client signed it.** The earlier draft said execution was
   unevidenced. Mac Frederick, #va-claims, 2026-06-16 09:16:15 EDT: *"The client signed
   and approved Phase 2 Software Contract."*
2. **Phase 4 is contracted and defined.** It is *Testing, Revisions & Optimization* — QA,
   bug fixes, in-scope revisions, UX improvements. The earlier draft's "Phase 4 =
   production activation" inference was wrong; most of those gates are Phase 5.
3. **The project has five phases, not three.** $15,000 total, $3,000 prepaid per phase.
4. **Three phase payments are recorded**, not zero.

One earlier finding survives and is reinforced: **no client approval of any software
phase is recorded anywhere.**

### Evidence limitation that still stands

`slack_read_file` returns an MCP schema error (`invalid_union` at `content[1]`) for every
binary attachment — all six `VACE_Phase1_*.docx` files and every report PDF. Text files
read normally, so the fault is binary-payload-specific. Section 2 is therefore
reconstructed from the messages that carried those documents, not from their text.

| File ID | File | Result |
|---|---|---|
| `F0BCTPRDLBD` / `F0BDTBZ54E4` | Development Roadmap, 19:25 / 16:30 | **Read failed** |
| `F0BCY1Z4JG6` / `F0BCX11RWA2` | Technical Architecture, 19:25 / 16:30 | **Read failed** |
| `F0BD3PEU50C` / `F0BCZ3L0YAE` | Feature & Workflow, 19:25 / 16:30 | **Read failed** |
| `F0BNHDBEAQG`, `F0BQBAEQPF1`, `F0BSAEN3830`, `F0BTWCDS7LN` | July/weekly/August reports | **Read failed** (bodies recovered from local `source-data.json`) |

---

## 1. The contract

**"VA Claims - Custom Software Development & Ownership Agreement."** Client: VA Claims.
Agency: Momentum Digital. Proposal date: May 2026.

| Term | Value |
|---|---|
| Total investment | **$15,000** across five phases |
| Phase billing | **$3,000 prepaid per phase** |
| Maintenance retainer | **$350/month fixed for 24 months**, starting only when the final phase is complete and maintenance actually begins — explicitly *not* on signing |
| Maintenance inclusions | ~7 hours/month at $50/hour |
| Duration | Five months |

### The gating rule — the spine of the whole agreement

> Phase 1 begins after the agreement is signed, the onboarding call is complete, and the
> Phase 1 prepayment has been received. Phases 2 through 5 do not begin until the previous
> phase has been reviewed and approved by the client and the next phase prepayment has
> been received.

Two conditions, both required, in order: **client approval, then prepayment, then work.**
Section 5 shows the project has not been run this way.

### The five phases, verbatim in scope

| Phase | Title | Deliverables |
|---|---|---|
| **1** | Discovery, Strategy & Technical Planning | Project discovery and planning; review of core software requirements; workflow and feature planning; technical architecture recommendations; tool, environment, and software planning; **development roadmap creation** |
| **2** | Software Environment, Tools & Core Setup | Development environment setup; software framework setup; user access and permissions planning; **database or backend structure setup**; tool and platform configuration; secure access setup |
| **3** | Core Development & Feature Buildout | Core feature development; frontend and backend development; software logic; user dashboard and admin tools; data handling and integrations; internal testing during development; **Payment Watch tracking** — 60–120 and 121+ days post C&P exam, manual timer initiation, two-group dashboard, paid status management |
| **4** | **Testing, Revisions & Optimization** | **Quality assurance testing; bug testing and troubleshooting; functionality improvements; client-requested revisions within the agreed scope; user experience improvements; final pre-launch development updates** |
| **5** | Final Delivery, Handoff & Launch Support | Final software review; final edits and cleanup; **client access confirmation**; **code and environment handoff**; **documentation and training support**; launch or deployment assistance; final project approval |

### Other operative clauses

- **Non-cancellation.** The development contract cannot be cancelled once begun except by
  mutual written agreement, uncured material breach, or law. The maintenance retainer is
  cancellable on 60 days written notice.
- **Scope management.** Additional features or major functionality changes outside the
  agreed scope "may be estimated separately before development begins." Payment Watch is
  the one named inclusion, tied to *"client correspondence dated May 2026"* — recoverable
  as David's email of 2026-05-16/17 (Section 4).
- **Communication.** Weekly project updates; monthly client calls; ad hoc update
  meetings; **phase review meetings**; **progress updates before phase approval**.
- **Ownership.** On payment for approved phases, the client gets full ownership and
  access — code repositories, software tools, hosting environment, admin accounts,
  documentation, credentials, management systems.
- **Confidentiality.** Mutual NDA, non-compete, non-solicitation, non-circumvention.
- **Non-resale.** Momentum will not resell or redistribute the custom software.

### Is the PDF in hand executed? No.

Verified structurally, not merely by eye:

| Check | Result |
|---|---|
| `/AcroForm` (form fields) | **absent** |
| `/Widget`, `/Annots` (field/annotation objects) | **absent** |
| `/Sig`, `/FT/Sig`, `ByteRange` (digital signature) | **absent** |
| Page 9 text extraction | Labels only — "Client Signature", "Momentum Digital Signature", "Name / Title" ×2, "Date" ×2 — **no names, no titles, no dates** |
| Images | 9, all page furniture; none on the signature block |

**This PDF is the blank, unexecuted version** — the same file Mac circulated internally
on 2026-06-10 saying *"Here is the Final Contract I'll be sending."* It is the template,
not the returned copy.

**That is not the same as saying nothing was signed.** Mac states plainly six days later
that the client signed and approved it, and the deposit was paid two hours after that.
The executed counterpart simply is not in this file or anywhere in Slack.

**Recommendation:** obtain the countersigned copy from Mac (or 17hats) and store it
alongside this one. Right now the *only* evidence of execution is a colleague's Slack
message, which is adequate for working purposes and inadequate for a dispute.

---

## 2. Obaid's June 24 roadmap mapped onto the contract

### What the roadmap actually contained

Obaid posted the three Phase 1 documents on 2026-06-24 at 16:30:47 (`1782333047.449409`):
*"From my end, Phase 1 docs are ready"* — Technical Architecture, Feature & Workflow,
Development Roadmap — covering *"the tech stack and database structure to the full feature
list and build order."* Dillon reviewed all three at 18:08:57 (`1782338937.266799`);
Obaid resent revised copies at 19:25:43.

Recoverable structure, from that review:

- The roadmap contains a **phase table** with a Timeline column, and
  *"the timeline cells are blank."*
- *"Phase 1 lists database schema design as a deliverable"* — but no schema appears in
  any of the three documents.
- The phase vocabulary is *"Phase 2 setup vs Phase 3 buildout vs later enhancements."*
- Dillon proposed making the gate explicit as *"approved workflow + approved wireframes +
  locked architecture, then build."*
- Feature & Workflow (*"the strongest of the three"*): an **11-step process**, onus
  tracking, alerts, AI assistant, and Payment Watch.
- Technical Architecture: *"Next.js, Supabase/Postgres, Vercel, Resend, Anthropic,
  GitHub."*

### Where roadmap and contract diverge

| # | Contract says | Roadmap says | Severity |
|---|---|---|---|
| 1 | **Five** phases, each a $3,000 billing cycle | A phase table using **"Phase 2 setup / Phase 3 buildout / later enhancements"** — a three-plus-tail shape inherited from Obaid's original internal 3-phase pitch of 2026-05-11 | **High.** The document the client is meant to plan against does not enumerate the five phases he is being billed for. Phases 4 and 5 have no roadmap presence at all. |
| 2 | Phase 1 = discovery, planning, architecture *recommendations*, roadmap. **Database structure setup is Phase 2** | Phase 1 deliverables include **database schema design** | **Medium.** Pulls a Phase 2 deliverable into Phase 1. Harmless in execution — the schema was designed early — but it means Phase 1 was reported complete against a different bill of materials than the contract defines. |
| 3 | Five-month project with monthly billing cycles | Timeline column present but **blank**, and probably deleted in the 19:25 revision | **High.** The contract's own phase table has a "Billing & Start Requirement" column but no dates either. **Neither document contains a single date.** Every scheduling expectation in this project is verbal. |
| 4 | Phase 4 = **Testing, Revisions & Optimization** | *"later enhancements"* — unnamed, unnumbered, undated | **High.** These are opposites. The contract's Phase 4 is hardening what exists; "later enhancements" implies new features. Reading one as the other invites a scope fight at exactly the moment $3,000 is due. |
| 5 | Payment Watch explicitly inside Phase 3, at no additional cost | Payment Watch described in Feature & Workflow with **no phase attribution** — Dillon's review item 3 asked for exactly that | **Medium.** The contract is unambiguous; the roadmap is not. If the roadmap was ever sent to David, it is weaker than the contract on the one feature he specifically negotiated. |
| 6 | Silent on process granularity | **11-step process** | **Now moot.** Replaced by the seven-stage model (Obaid, 2026-08-05: *"The pipeline is now formally 7 stages not 11 steps"*). |

### The 16:30 → 19:25 revision

Byte-level diff impossible. File sizes plus the review thread support this, as
**inference**:

| Document | 16:30 | 19:25 | Delta | Consistent with |
|---|---|---|---|---|
| Technical Architecture | 13.4 KB | 24.4 KB | **+11.0 KB** | Expanding security/data handling and adding the client-dependency list (review items 5–6). Separately confirmed: Obaid posted at 21:52 that the Technical Architecture doc *"has been updated"* with five schema additions. |
| Feature & Workflow | 13.6 KB | 13.6 KB | **±0** | The Phase-availability notes (item 3) appear **not** to have been added |
| Development Roadmap | 14.4 KB | **13.7 KB** | **−0.7 KB** | The blank Timeline column **removed** rather than filled (item 1) |

### The finding that matters most

**No message anywhere records the three Phase 1 documents being sent to David.** Obaid's
ask was internal — *"before we share with the client."* On 2026-06-29 he told Luke *"I
have sent the required documents for the Phase 1,"* but that is delivery to Momentum, not
to the client.

Under the contract, Phase 1's deliverable is roadmap creation and Phase 1 must be
*"reviewed and approved by the client"* before Phase 2 begins. If the roadmap never
reached David, **Phase 1 could not have been approved, because he never saw its principal
deliverable.**

---

## 3. Which contract phase is the work actually in?

### Development status: Phase 3 complete on the builders' account

Obaid, #va-claims, 2026-09-02 19:10:25 EDT: *"Phase 3 is complete from the development
side. Everything is live and verified on production at vaclaims-portal.vercel.app."*
He lists staff intake, client directory, notes with actor/timestamp, seven-stage
advancement, onus toggle, contact dates, Stop the Clock, **Payment Watch**, AI assistant,
advisor management, and alert summaries. PR #3 merged; head of `origin/main` is `f00141e`.

Payment Watch — the one feature the contract names inside Phase 3 — is live. On that
measure Phase 3's contracted scope is met.

### But the contract's test is not "built." It is "reviewed and approved by the client."

| Contract precondition | Status | Evidence |
|---|---|---|
| Phase 3 delivered | **Yes**, on the builders' account | Obaid 2026-09-02; `f00141e`; 18/18 tests, lint, build |
| Phase 3 **reviewed and approved by the client** | **No record anywhere** | See below |
| Phase 4 prepayment received | **No record** | Last payment 2026-08-19 |
| Phase 4 begun | **No** | Correctly so |

### One dispute inside the delivery claim

Obaid's completion message states *"the daily cron job [is] confirmed working on
production."* Dillon's code review the same evening (22:14:37, and
`deliverables/2026-09-02-phase-3-completion-review/review.md`) finds no `vercel.json`, no
route under `src/app/api/cron/**`, `/api/cron` and `/api/cron/notify` both returning 404,
and `/api/notify` exported POST-only behind a session cookie — which a Vercel cron GET
could not satisfy. Two further defects: the digest dedupe key can never match, and the
signed-URL route signs any caller-supplied path.

Before Phase 3 is presented for approval, either the cron evidence is produced or the
claim is withdrawn. **Presenting an unverified completion for client approval — where
approval releases $3,000 — is the one thing worth getting right here.**

### Phase approvals and payments: what exists, what is absent

**Every payment record found in Slack:**

| Date | Message | Reads as |
|---|---|---|
| 2026-06-16 18:34 | Mac: *"Deposit = PAID"* | Phase 1 prepayment |
| 2026-06-30 18:23 | Mac: *"Phase 1 = FULLY PAID"* | **The website engagement, not this contract** — see the naming collision below |
| 2026-07-20 15:37 | Mac: *"Client just paid for month 2 = milestone 2"* | Phase 2 prepayment |
| 2026-08-19 10:12 | Mac: *"next milestone = PAID"* | Phase 3 prepayment |

**Three phase prepayments recorded: $9,000 of $15,000.** No Phase 4 or Phase 5 payment.

**Every phase-approval record found: none.** Not one message, deliverable, repo document,
or commit records David reviewing and approving software Phase 1, 2, or 3. Searched:
full #va-claims history, both DMs, the group DM, all eleven deliverable folders, and the
`vace-platform` repo.

**The clearest proof that approval and payment came apart** — Mac, 2026-07-20 15:37:35,
in a single message:

> *"did we finish Milestone 1 yet? Client just paid for month 2 = milestone 2"*

The month-2 prepayment had arrived while the person asking did not know whether Milestone
1 was finished. The contract requires Phase 1 approval *before* the Phase 2 prepayment.
Here the payment preceded even an internal completion check.

### The naming collision that has confused this project throughout

Two independent engagements, each with its own "Phase 1":

- **Engagement A — the marketing website.** Mac, 2026-05-04: *"keep progressing on phase 1
  with the new website... we will get you involved on **phase 2 with the custom dev
  project**."* Launched 2026-06-30 (`vaclaimsedge.com`), *"Phase 1 = FULLY PAID"* the same
  day. James's lane. **Not governed by this contract.**
- **Engagement B — this $15,000 agreement**, which Mac calls *"the Phase 2 Software
  Contract"* and which internally has its own Phases 1–5.

So "Phase 1 = FULLY PAID" (2026-06-30) and "Deposit = PAID" (2026-06-16) refer to
different engagements. Any future status line should say *"Software Phase N"* or
*"Website"* explicitly.

### Dated timeline

**Sale and agreement**

| Date | Event | Source |
|---|---|---|
| 2026-05-04 | Mac splits the work: website = "phase 1", custom dev = "phase 2" | `1746398612` window |
| 2026-05-11 | Obaid's internal 3-phase pitch: $3,000 / $7,000 / $10,500 | #va-claims |
| 2026-05-12 | Revised to $2,500 / $5,000 / $8,500 = $16k. Mac: *"still seems like a lot"*; floats *"$15k for full buildout"* | #va-claims |
| 2026-05-13 | Luke: *"an ask of $15,000"*; *"He is very open to it if it carries a $350 a month carrying cost"* | #va-claims |
| 2026-05-15 ~14:00 | Software presented to David by Luke and Obaid | #va-claims |
| **2026-05-15 14:33** | **Luke: *"Verbal commitment"*** | `1778863989` |
| 2026-05-15 14:40 | Melissa: *"7500 down, 7500 upon completion / 350 ongoing monthly maintenance"* — **the original structure, later replaced by 5 × $3,000** | #va-claims |
| 2026-05-15 15:19 | First quote drafted in 17hats | #va-claims |
| **2026-05-17 06:36** | **Obaid relays David's Payment Watch email; recommends "Option 2 (manual timer button)"** — this is the *"client correspondence dated May 2026"* the contract cites | `1778751365` |
| 2026-05-18 08:16 | Luke: the added functionality *"could/should come at the quoted price"* → becomes the no-additional-cost clause | #va-claims |
| 2026-05-18 18:54 | Mac: *"were quoting a total of $15k over **3 months**"* — the contract says five | #va-claims |
| 2026-05-26 09:56 | Luke: *"client needs a little more information on the build before he is comfortable signing off"* | #va-claims |
| 2026-06-01 | Mac presses for a cheaper AI-built version; Obaid defends the price | group DM `C0B7A1GVDDY` |
| **2026-06-10 08:45** | **Final contract PDF circulated internally** with team roles | `1781095507.196699` |
| 2026-06-11 10:47 | Mac: *"I'll be sending the contract today for approval"* | #va-claims |
| **2026-06-16 09:16** | **Mac: *"The client signed and approved Phase 2 Software Contract. I'll invoice him and send onboarding email"*** | `1781795775` |
| **2026-06-16 18:34** | **Mac: *"Deposit = PAID"*** | #va-claims |

**Delivery**

| Date | Event | Contract phase |
|---|---|---|
| 2026-06-16 12:12 | Mac posts the contract's Phase 1 bullets with owners assigned per person | P1 start |
| 2026-06-17 16:21 | Client meeting (James, David, Dillon) — Amelia licence, Squarespace login | Website topics |
| 2026-06-24 | Three Phase 1 documents delivered **internally** | P1 deliverable |
| 2026-06-29 12:20 | Obaid to Luke: *"I have sent the required documents for the Phase 1"* | P1 delivered internally |
| — | **Phase 1 client approval** | **absent** |
| 2026-07-17 19:20 | Obaid: *"Phase 2 is live here"* — repo, Supabase with 6 tables, auth, Vercel | P2 delivered |
| 2026-07-20 15:37 | Phase 2 prepayment received | **before P1 approval** |
| 2026-07-23 19:09 | Obaid: *"Phase 2 is done from both our sides"* | P2 complete |
| — | **Phase 2 client approval** | **absent** |
| 2026-08-05 13:01 | Obaid fixes the boundary: *"Phase 2 was environment setup, database structure, authentication, and design system"*; David's new spec *"fall[s] under Phase 3"* | P3 start |
| 2026-08-19 10:12 | Phase 3 prepayment received | **before P2 approval** |
| 2026-08-31 / 09-01 | Backend routes, live data, Resend engine, security patch | P3 |
| 2026-09-02 19:10 | Obaid: *"Phase 3 is complete from the development side"* | P3 delivered |
| 2026-09-02 22:14 | Dillon's code review disputes the cron; lists remaining UI work | P3 contested |
| — | **Phase 3 client approval; Phase 4 prepayment** | **absent** |

**Explicit gaps, stated rather than inferred**

1. No executed copy of the agreement — only Mac's statement that it was signed.
2. **No onboarding call is evidenced.** The contract makes it a start condition. Mac said
   he would *send an onboarding email*; a client meeting occurred 2026-06-17 but its
   recorded content is website work (Amelia, Squarespace).
3. No client approval of software Phase 1, 2, or 3.
4. No invoice documents in Slack — only Mac's paid confirmations.
5. No record the Phase 1 roadmap documents ever reached David.
6. No record of the 2026-08-20 client meeting's outcome.
7. Gmail was not queried this session; approvals may exist there. **Check before treating
   any of gaps 2–6 as settled.**

---

## 4. Phase 4: what it actually obligates

Phase 4 is contracted, defined, and **not yet started or payable**. It is worth $3,000 and
begins only after Phase 3 approval plus the Phase 4 prepayment.

**Six deliverables, verbatim:** quality assurance testing; bug testing and
troubleshooting; functionality improvements; client-requested revisions within the agreed
scope; user experience improvements; final pre-launch development updates.

Note what is absent: no new features, no infrastructure provisioning, no launch. Phase 4
hardens what Phase 3 built. Launch belongs to Phase 5.

### Every open item, assigned to its contract phase

| Open item | Source | Phase | Why |
|---|---|---|---|
| P1 proxy in wrong directory; sessions never refresh | 09-02 review | **4** | Bug troubleshooting |
| P2 cron absent / unreachable | 09-02 review | **3 then 4** | Phase 3 completion if it was never built; Phase 4 if it exists and is broken. Obaid's evidence decides. |
| P3 signed-url signs any caller path | 09-02 review | **4** | Bug fix; also a confidentiality exposure |
| P4 digest dedupe key + `today` mutation | 09-02 review | **4** | Bug fix |
| P5 archive can never return a row | 09-02 review | **4** | Functionality improvement |
| P6 unvalidated `client_id` in storage path | 09-02 review | **4** | Bug fix |
| P7 dead 313-line component | 09-02 review | **4** | Cleanup (also Phase 5 "final edits and cleanup") |
| P8 / D5 generic errors, unbound validation messages | 09-02 review | **4** | UX improvement |
| D1 document upload/download UI | 09-02 review | **3** | Core feature buildout — storage API shipped with no surface. Phase 3 is not complete without it. |
| D3 settings page wiring | 09-02 review | **3** | Admin tools — a named Phase 3 deliverable |
| D2 the seven decisions reflected in UI | 08-20 packet | **4** | *"Client-requested revisions within the agreed scope"* — textbook Phase 4 |
| D6 accessibility and mobile re-verification | 09-02 review | **4** | QA testing |
| RLS / role isolation tests | P3 checklist | **4** | QA testing |
| Auth and role enforcement readback | 08-20 packet | **4** | QA testing |
| Storage RLS policies for `client-documents` | 09-02 review | **3 → 4** | Build in 3; test in 4 |
| Resend **verified sender domain** | 09-02 review | **5** | Launch support; blocked on David |
| `portal.vaclaimsedge.com` DNS / TLS / canonical host | 08-15, 08-20 | **5** | Deployment assistance |
| Production environment configuration + health readback | 08-20 packet | **5** | Environment handoff |
| Analytics destination and privacy review | P3 checklist | **5** | Launch |
| Calendar / Google Meet provider connection | 08-20 packet | **3 → 5** | Integration in 3; provider readback in 5 |
| Client access confirmation, documentation, training | Contract P5 | **5** | Named Phase 5 deliverables |
| Formal HIPAA / compliance review | Obaid 08-03 | **Outside all five** | Legal determination, not development. Needs a qualified reviewer and probably a separate engagement. |
| **Website self-registration** | Obaid 09-01/09-02 | **Out of scope** | Not in any of the five phases. Obaid: *"a larger build that we would plan for a later phase."* Under Scope Management it must be **estimated separately before development begins**. |
| **Appeals / HLR / supplemental claims workflow** | 08-15, 08-20 | **Out of scope, probably** | Recommended as *"a separate linked workflow."* A new workflow is a new feature, not a revision. Price it or scope it out in writing. |

### The correction

My earlier draft called production activation "Phase 4." **It is mostly Phase 5.** The
practical consequence: the team currently frames the remaining work as one undifferentiated
"activation" bucket, but it spans two separately-approved, separately-paid phases. Mixing
them means either performing Phase 5 work on Phase 4 money, or stalling Phase 4 on Phase 5
blockers (DNS, sender domain) that do not gate it.

**Phase 4 can be executed almost entirely without David and entirely without DNS.** That
is the useful finding.

---

## 5. Contract-compliance risks

Ordered by exposure.

### 5.1 Three phases were paid; none was approved — HIGH

The contract's core mechanism is approve → prepay → begin. The project has run
prepay → begin, three times.

- Phase 2 prepayment 2026-07-20; Phase 1 approval never recorded — and the Phase 1
  roadmap may never have reached David.
- Phase 3 prepayment 2026-08-19; Phase 2 approval never recorded.
- Phase 3 now declared complete with no approval mechanism ever exercised.

**Exposure is two-directional.** Momentum has been paid $9,000 for phases the client has
never formally accepted, so any of the three remains open to a retrospective "I never
approved that." And the client can argue Phases 2 and 3 began without a contractual
precondition being met.

Neither side appears to be acting in bad faith — this reads as informality, not evasion.
It is still the largest contractual risk in the file, and it compounds: each unapproved
phase makes the next approval harder, because approving Phase 3 implicitly ratifies the
two beneath it.

**Fix, cheaply:** a single written phase-approval record — one page, per phase, listing
deliverables against the contract's own bullets, with David's written confirmation. Three
retrospective, one going forward. Under 30 minutes of work; it closes the entire exposure.

### 5.2 The seven lifecycle decisions are Phase 3 approval items, not blockers — HIGH, and a reframe

The seven decisions from the 2026-08-20 packet — Stage 6→7 boundary, records completeness
authority, day-10 lapsed prospect, terminal labels, archive layout, appeals handling, time
language — have been carried since 2026-08-15 as "waiting on David."

Under the contract they are precisely *"reasonable revisions within the agreed phase scope
[that] may be addressed before phase approval."* They are not an external dependency. They
are **the substance of the Phase 3 review meeting that the contract requires and that has
never been held.**

Ratification status, re-verified this session across the full channel history, both DMs,
the group DM, all deliverables, and the repo: **zero of seven decided.**

| # | Decision | Recommended | Ratified |
|---|---|---|---|
| 1 | Stage 6 → Stage 7 boundary | End 6 at final pre-exam briefing; begin 7 at attendance at the final VA exam | **No** |
| 2 | Records completeness | One named case owner/reviewer decides, with an audit note | **No** |
| 3 | Day-10 lapsed prospect | Staff-confirmed status plus an automatic day-10 reminder | **No** |
| 4 | Terminal labels | `Claim completed` / `Services concluded` | **No** |
| 5 | Archive layout | One archive with outcome filters | **No** |
| 6 | Appeals / HLR / supplemental | Separate linked workflow | **No** |
| 7 | Time language | Averages as estimates; reminders as guidance not deadlines; Central plus user-local | **No** |

The 2026-08-20 meeting is not evidenced as having occurred with a recorded outcome. Its
own instruction — *"Record the seven lifecycle decisions and one accountable owner for each
activation workstream"* — produced no artifact.

**Reframe:** stop tracking these as blockers on Dillon. Put all seven on a single Phase 3
review agenda, hold the meeting the contract already requires, and capture the outcomes as
the approval record. That converts a five-week stall into one meeting.

### 5.3 Communication obligations partially met — MEDIUM

| Obligation | Status |
|---|---|
| Weekly project updates | **Partial.** James posted status 5/11, 5/18, 7/6, 7/20, 7/27; Dillon posted weekly reports 8/10, 8/17, 8/24, and the August monthly 8/31. **A seven-week gap, 5/18 to 7/6, has no weekly update on record** — spanning signing, deposit, and the whole of Phase 1. |
| Monthly client calls | **Appears met.** Client meetings 5/15, 6/17, 6/30, 7/9, plus 7/25 and 8/20 sessions. |
| Ad hoc update meetings | **Met.** |
| **Phase review meetings** | **Not met. No phase review meeting is evidenced for any phase.** This is the clause that would have produced the approvals in 5.1. |
| Progress updates before phase approval | **Moot** — no phase approval has occurred. |

### 5.4 Unauthenticated production data exposure — MEDIUM, remediated

On 2026-08-29 Dillon reproduced a signed-out `GET /api/clients` on production returning
six records. Remediated in PR #2 (merged, verified 401 on 2026-08-31). Against a contract
carrying a mutual confidentiality clause and an **open** HIPAA determination, this was a
material incident while it was live. It is closed technically; it is not documented
anywhere the client can see. Disclose it in the Phase 3 review rather than letting it
surface later.

### 5.5 Credential handling contradicts the confidentiality clause — MEDIUM

Encountered while reading; **values deliberately not reproduced in this document.**

- A Google account password was posted in plaintext in #va-claims on **2026-06-17** and
  again on **2026-07-09**. That account is the identity behind GitHub, Vercel, Supabase,
  and Anthropic for this project.
- An **OpenAI API key** was posted in plaintext in the Obaid DM on **2026-03-19**
  (a different, non-VA-Claims project).

**Recommend rotating all three now**, independent of this engagement. Slack history is
durable and searchable by every workspace member.

Related: on 2026-07-22, Vercel blocked Dillon's commits (seat limit); the workaround was
to set `git config user.email/user.name` to the shared project account. It unblocked the
release, and it also means commits from that period are not attributable to a person —
awkward for an audit trail on a system that will hold claimant data.

### 5.6 Scope creep with no written estimate — MEDIUM

The 11-step process became a seven-stage event model on David's August spec — a
substantial rework of schema, pipeline, and alert logic. Obaid correctly ruled it Phase 3
rather than Phase 2 (2026-08-05), and it was absorbed at no charge.

That is defensible as in-scope refinement. But two genuinely new items are now queued with
no estimate and no written scope decision: **website self-registration** and the
**appeals/HLR/supplemental workflow**. The Scope Management clause requires an estimate
*before development begins*. Decide and price both in writing before either is started.

### 5.7 The five-month clock — LOW, worth watching

Contract start ≈ 2026-06-16. Five months lands mid-November 2026. Three phases are
delivered in about two and a half months. **Delivery pace is fine.** The schedule risk is
not development speed — it is that Phases 4 and 5 cannot start until approvals happen, and
approvals have taken zero calendar time so far because they have not happened at all.

The maintenance retainer is unaffected: its 24 months begin only when the final phase is
complete and maintenance actually starts, explicitly not on signing.

---

## 6. Ownership and access — is the obligation already satisfied?

**The clause:** on payment for approved phases, the client receives full ownership and
access to code repositories, software tools, hosting environment, admin accounts,
documentation, credentials, and management systems.

### Repository — satisfied

Obaid, 2026-07-17 19:20: *"Fresh Next.js project under the **client's GitHub account**
(vaclaims-dev/vace-platform)."*

`vaclaims-dev` is the client's own GitHub organisation, not a Momentum-owned org. Code has
lived on the client's side of the line since Phase 2. Momentum contributors are
collaborators on the client's repo — the correct shape, and better than most agencies
manage.

One qualification worth stating rather than glossing: the `vaclaims-dev` identity is
backed by an email account **Momentum created and handed to the client** on 2026-06-17.
Custody is the client's; provenance is Momentum's. That satisfies the clause, and it means
the credential rotation in 5.5 should be done *with* David rather than around him.

### Everything else — not yet due, and not yet evidenced

| Item | Status |
|---|---|
| Code repositories | **Satisfied** — client org since Phase 2 |
| Hosting environment (Vercel) | **Partial.** Client project exists; David can log in. Seat limits blocked a Momentum contributor in July, which implies Momentum does not control the account — correct for ownership, friction for delivery. |
| Database (Supabase) | **Unverified.** No message confirms account ownership sits with the client. |
| Admin accounts | **Partial.** Obaid, 2026-07-09: *"David has full access to everything."* An assertion, not a readback. |
| Anthropic | **Unresolved.** David needed help logging in on 7/13 and again on 8/24; Dillon was still awaiting a Developer invitation on 7/22. |
| Credentials | **Not in an acceptable form.** Passwords in a Slack channel are not a credentials handoff. |
| Documentation | **None produced for the client.** The repo docs are engineering handoffs between Dillon and Obaid. |

**Assessment:** the repository obligation is met ahead of schedule. The rest —
access confirmation, environment handoff, documentation, training — are **Phase 5
deliverables and are not yet due.** Nothing is in breach.

What *would* be a problem is arriving at Phase 5 assuming this is already done because the
repo is client-owned. It is not. Phase 5 needs a real artifact: an inventory of every
account, its owner of record, its access route, and a verified readback — assembled with
David, not delivered as a list of passwords.

---

## 7. What to do next, in order

1. **Get the countersigned agreement** from Mac or 17hats into this folder.
2. **Hold the Phase 3 review meeting** the contract requires. Agenda: demo, the seven
   lifecycle decisions, the `/api/clients` exposure disclosure, the cron question.
3. **Capture approvals in writing** — Phase 3 now, Phases 1 and 2 retrospectively.
4. **Resolve the cron** before presenting Phase 3: Obaid produces the definition and one
   delivery receipt, or it moves to the Phase 3 remainder.
5. **Finish Phase 3's actual remainder** — D1 document UI, D3 settings wiring — both
   against endpoints already live, neither blocked on anyone.
6. **Invoice Phase 4 only after Phase 3 approval**, and scope it to the contract's six
   deliverables.
7. **Price self-registration and the appeals workflow separately**, in writing, before
   either starts.
8. **Rotate the three exposed credentials.**
9. **Get the HIPAA determination moving** — it is not development work, it has been open
   since 2026-08-03, and it gates real claimant data entering the system.

---

## Evidence locators

**Contract:** `agreement-extracted-text.md` and the source PDF, this folder. Slack
`F0B9Q5J78LU`.

**Slack** (`momentum3d`, #va-claims `C0AU6GMGY73`) — full history read 2026-05-04 →
2026-09-02:
`1781095507.196699` contract circulated · 2026-06-16 09:16 signed + invoice ·
2026-06-16 12:12 Phase 1 owners · 2026-06-16 18:34 deposit paid ·
`1782333047.449409` Phase 1 docs v1 · `1782338937.266799` Dillon's roadmap review ·
`1782343543.385309` docs v2 · 2026-06-24 21:39 schema additions ·
2026-06-30 09:44–18:23 website launch, sign-off, fully paid ·
2026-07-17 19:20 Phase 2 live · 2026-07-20 15:37 month-2 payment ·
`1784848181.680879` Phase 2 done · `1785949293.559339` Phase 2/3 boundary ·
`1785948909.996649` seven stages · `1786838749.468169` Phase 2 closeout ·
2026-08-19 10:12 next milestone paid · 2026-09-02 19:10 Phase 3 complete ·
2026-09-02 22:14 review posted.
DMs: `D0AFPGBAHC5` (Obaid), `D0BKYV2HBAP` (James, empty), `C0B7A1GVDDY` (group).

**Local:**
`context/operating-context.md` · `registry/clients.json` ·
`deliverables/2026-07-16-phase-two-demo-readiness-brief.md` ·
`deliverables/2026-07-17-phase-two-ui-handoff/README.md` ·
`deliverables/2026-08-05-phase-two-closeout/` ·
`deliverables/2026-08-09-phase-three-frontend/` ·
`deliverables/2026-08-20-portal-meeting-readiness/meeting-readiness.md` ·
`deliverables/2026-09-02-phase-3-completion-review/review.md` ·
`workspace/vace-platform/docs/{phase-2-closeout-2026-08-15,phase-3-data-activation,phase-3-review-checklist,phase-3-ui-handoff-2026-08-29}.md`

## Limits

- The executed agreement was not located. Execution rests on Mac's Slack statement.
- No Phase 1 document body was read; Section 2 is secondary reconstruction, and the
  16:30 → 19:25 diff is inference from file size plus the review thread.
- **Gmail was not queried this session.** Phase approvals, invoices, and the onboarding
  call may exist there. Every "absent" in Section 3 means absent from Slack, the
  deliverables, and the repo — not absent from the world.
- No production system was authenticated against; no live readback was performed.
- Exposed credential values were deliberately not reproduced.
