# VA Claims Edge: Dillon's remaining responsibilities
Verified September 6, 2026. Research and local draft only. No Slack message, email, tracker edit, code change, merge, deployment, invoice, or production-data write was performed.

This review supersedes the short reply prepared earlier today. It distinguishes work already built, work still needing release verification, original role assignments, later promises, and dependencies owned by other people.

## The answer
Dillon is the frontend and UX lead. His remaining work is to bring the already-prepared PR 5 package through the agreed release sequence, reconcile the implementation with David's later workflow and claimant-portal requirements, complete the final frontend QA and client revisions, finish user-facing handoff/training materials, and keep the task/decision record accurate with James.

The project is further along than a list saying "build documents, settings, Payment Watch, and training" implies. Conversely, the staff dashboard's production status does not establish that the claimant portal's appointments, uploads, or messages are ready.

## Source authority and recovered evidence
1. [Signed SoftwareContract.pdf](./SoftwareContract.pdf): David's June 15 attachment in the [contract email thread](https://mail.google.com/mail/u/0/#all/19ebcc792da7603d). All nine pages were extracted again. Pages 1–8 match the agency's final agreement after whitespace normalization. The inspected signature page shows David's signature/name/title/date; Momentum's signature line is blank in this copy. This is an evidence description, not a determination about enforceability.
2. [Original development roadmap](./sources-2026-09-06/VACE_Phase1_Development_Roadmap.docx), [feature/workflow document](./sources-2026-09-06/VACE_Phase1_Feature_Workflow.docx), and [technical architecture](./sources-2026-09-06/VACE_Phase1_Technical_Architecture.docx): recovered directly from the final June 24, 19:25 EDT Slack attachments F0BCTPRDLBD, F0BD3PEU50C, and F0BCY1Z4JG6. Their complete text is saved alongside them. These files were unreadable through the earlier connector and had previously been reconstructed from messages. They are now actually read.
3. [Original quote discussion](https://mail.google.com/mail/u/0/#all/19e7ac79aa960b5e), May 30–June 8: Dillon's discovery/build/handoff commitments and David's requirement for client ownership without dependence on an agency's subscription.
4. [June contract/assignment thread](https://mail.google.com/mail/u/0/#all/19ebcc792da7603d): Mac assigns workflow/feature planning, roadmap, communication and updates to Dillon and James on June 16. Dillon's June 16 sent message accepts frontend work with James, workflows, roadmap, feature planning, and AI collaboration with Obaid.
5. [Unified portal thread](https://mail.google.com/mail/u/0/#all/19fa4a51620386fb): David's July 31 requirements; Dillon's August 1 response; David's August 4 seven-stage specification; Dillon's August 5 implementation and decision list.
6. [July recap and August plan thread](https://mail.google.com/mail/u/0/#all/19fc995257730d8f): David's August 7 readability/countdown/calendar/education requests, Dillon's August 12 completion/readiness report, David's August 12 request to clarify what he needs to approve, and Nexus scope discussion. An August 15 checklist message is explicitly labeled DRAFT and is not evidence of delivery or approval.
7. August 20 meeting evidence: [Read AI recap](https://mail.google.com/mail/u/0/#all/1a01fc7c6d64306a), [Otter summary/actions](https://mail.google.com/mail/u/0/#all/1a01fcc1842fc85c), and Fireflies notification. They establish a meeting and phase review occurred. The Otter action specifically assigns Dillon to check whether anything remains needed from David and email him if so. Only available summary/action content was read; this is not a claim that the full recording/transcript was reviewed. Otter assigns other tasks differently than later first-person ownership statements; the later direct statements control current owner routing.
8. [September 3 sender-domain email](https://mail.google.com/mail/u/0/#all/1a06838e68ad7511): James asks David to confirm vaclaimsedge.com as sender, says James has DNS access, and presents the private Nexus page for review. This thread still contains one message at readback.
9. Slack #va-claims: latest 60 channel messages, exact August 20/August 28/September 1 handoff threads, and focused approval/decision searches. September 3 messages explicitly hold PR 5 until Phase 3 closes; September 5 Mac asks for remaining work and Obaid estimates four to five weeks.
10. Live [Portal Tracker](https://docs.google.com/spreadsheets/d/11_5rNDBz4l-uEKj9yZ8DLNfobUL20Lmo5dVlU7mX26I/edit): all five phase tabs read through row 65, columns A–L for Phases 3–5 and A–H for Phases 1–2.
11. Live GitHub: PR 2 merged August 31; PR 3 merged September 2; PR 6 merged September 3. [PR 5](https://github.com/vaclaims-dev/vace-platform/pull/5) remains open, draft, mergeable, head f50c1b6c36c50e0e7610b33ab4afe185f08a6396. Remote main is 04e7168d88f28f7b7a3338483c5248fa660662f7.

## Independent current-source findings that change the remaining list
A separate read-only reviewer checked remote main and the exact PR 5 head cited above. No production workflow or new test suite was run.

| Finding | Exact source | Owner and next action |
|---|---|---|
| Stage advancement checks that the stage is below 7, increments it, and stamps today's date. It does not enforce signature/deposit, complete records or the specified exit events, and it does not derive Stage 7 entry from the final exam. | [main lifecycle route, lines 32–47](https://github.com/vaclaims-dev/vace-platform/blob/04e7168d88f28f7b7a3338483c5248fa660662f7/src/app/api/lifecycle/route.js#L32) | Dillon documents the behavior mismatch and required UI states; Obaid implements the agreed server enforcement; both verify the complete path. This is a source-confirmed gap, not a reason to rebuild all seven-stage visuals. |
| Editable settings do not currently drive the digest's stage thresholds as claimed in the PR description. Main still uses fixed STAGE_TARGETS; the effective settings consumed are admin_email and needs_attention_days. | [main daily-digest.js](https://github.com/vaclaims-dev/vace-platform/blob/04e7168d88f28f7b7a3338483c5248fa660662f7/src/app/lib/daily-digest.js#L13); PR 5 head api/notify/route.js lines 16,77 | Dillon and Obaid reconcile the settings/digest contract. Dillon verifies that displayed saved values match actual alert behavior and corrects unsupported completion wording. |
| PR 5 handoff documentation still says the cron route/secret and service-role execution path do not exist, although main includes them after PR 6. | [PR 5 environment.md, line 84](https://github.com/vaclaims-dev/vace-platform/blob/f50c1b6c36c50e0e7610b33ab4afe185f08a6396/docs/handoff/environment.md#L84); architecture.md lines 204–209,410–412; main vercel.json and api/cron/notify/route.js | Refresh prepared documentation against the final release with Obaid. Do not assign creation of the already-built cron route as remaining work. |
| Main staff AI sends requests to /api/ai. Payment Watch start/paid buttons PATCH cp_exam_date; marking paid clears the timer. | main dashboard/ai/AiAssistant.js lines 33–44; dashboard/payment-watch/PaymentWatch.js lines 21–60; api/clients/[id]/route.js lines 47–60 | Correct stale tracker notes. Dillon still performs authenticated UI/persistence tests; this is not new UI wiring and does not establish payment processing or ledger accounting. |
| Main Settings page is read-only; the editable form is prepared in PR 5. | [main Settings page](https://github.com/vaclaims-dev/vace-platform/blob/04e7168d88f28f7b7a3338483c5248fa660662f7/src/app/dashboard/settings/page.js#L8) | Carry the prepared form through release and verify real save/reload and consumer behavior. |
| Claimant booking uses synthetic appointments and localStorage, its Meet URL is null, message sending is disabled, and there is no actual claimant file-upload API call. | [main ClientPortal.js](https://github.com/vaclaims-dev/vace-platform/blob/04e7168d88f28f7b7a3338483c5248fa660662f7/src/app/portal/ClientPortal.js#L117), particularly lines 173–180,241,251,295–302 | Settle the first-release boundary explicitly. Obaid owns claimant identity/data/storage/provider contracts; Dillon owns the included UI integration and end-to-end user experience. |
| PR 5 contains the access checklist and launch runbook, but its acceptance rows say Not started and the runbook says nothing has been executed. | [access-confirmation-checklist.md](https://github.com/vaclaims-dev/vace-platform/blob/f50c1b6c36c50e0e7610b33ab4afe185f08a6396/docs/handoff/access-confirmation-checklist.md#L11); launch-runbook.md line 3 | Complete and record actual access/training/handoff with David and the team. Document existence is not completed acceptance. |

Another description correction: PR 5 still claims document-ID UUID validation in the signed-URL handler, but that check is absent from its current head and the handler is no longer in the PR's changed-file list. Ownership-based stored-path lookup is present. Reconcile the description with actual code instead of repeating the old claim.

## What the original documents assign
The contract describes agency deliverables. The June roadmap and architecture allocate named roles.

| Area | Dillon | Other owner |
|---|---|---|
| Planning | UI/UX planning, page structure, navigation, design system, initial wireframes; workflow and roadmap collaboration with James | Obaid: architecture, schema, backend dependencies; James: client coordination |
| Phase 3 | All page UI, client detail panel, Payment Watch UI, mobile responsiveness, transitions/loading states | Obaid: APIs, database queries, AI backend, notification engine, timers, frontend integration review |
| Phase 4 | Frontend bug fixes/polish, final mobile pass, animation/transition refinement, accessibility, client revisions | Obaid: backend performance, database optimization, security/RLS/auth review, backend fixes, notification testing |
| Phase 5 | Final visual cleanup, user-facing documentation, training materials including screenshots and walkthroughs | Obaid: production deployment/configuration, backups, technical documentation, environment handoff, monitoring; James: phase review and client coordination |
| Communication | Shared roadmap/workflow updates and closing the specific information request to David | James: account communication and approvals; Mac: contract/phase billing and oversight |

The roadmap plans up to two revision rounds and a 30-day support window. The final agreement uses broader in-scope revision/training/launch-support language; the roadmap's planning detail must not be treated as an independently verified signed limitation.

The original roadmap plans Phase 4 at approximately 2–3 weeks and Phase 5 at 1–2 weeks. Their combined 3–5 week planning range supports the plausibility of Obaid's current 4–5 week estimate. It is not a newly verified launch date. The signed agreement requires prior-phase approval and the next phase prepayment. There are five development phases; maintenance is not a sixth development phase.

## Exact remaining work on Dillon's end

| Work item | Current evidence | Dillon's next action | Completion evidence |
|---|---|---|---|
| 1. Close the remaining questions for David | August 20 meeting assigns this to Dillon. August 12 David asked what he needed to approve. The tracker still lists seven unresolved lifecycle/terminology decisions. | Prepare one consolidated approve/change list for the walkthrough with James. Include final launch boundary and differences between the reviewed experience and production. Capture each actual answer and owner; don't describe draft recommendations as approvals. | Dated decision record, approved scope, assigned follow-ups; actual sent/readback evidence if a follow-up is later authorized. |
| 2. Carry PR 5 through the agreed release | Documents UI, editable settings, reachable archive, session refresh, errors, and accessibility changes are already prepared. Obaid explicitly holds the merge for Phase 3 signoff. | Reconcile the branch/docs with latest main; support Obaid's review and approved merge; verify the released pages against real APIs using an approved test identity/data set. | Exact merged/deployed commit plus authenticated workflow evidence. A clean mergeability flag is insufficient. |
| 3. Validate David's seven-stage requirements | August 4 specification is more detailed than a stage selector. Earlier review package demonstrated the full model; source-level and provider behavior need reconciliation. | Walk the implemented experience against the event/clock/reminder checklist below. Fix UI omissions; route server enforcement, scheduling, and persistence gaps to Obaid; jointly retest. | Requirement-to-test map with passing evidence or an explicit approved deferral. |
| 4. Resolve and finish the claimant experience promised later | July/August emails explicitly describe client evidence readiness, appointments/Meet, rating, progression, and secure intake. Main's claimant portal remains demonstrative, separate from the live staff dashboard. | Confirm with David/James/Obaid exactly which claimant functions belong in the first usable release. For included functions, finish UI integration after Obaid supplies claimant-scoped authentication, data/storage and provider contracts. Verify saved state after reload/relogin. | An agreed first-release list and authentic end-to-end evidence for each included capability. A live staff dashboard or generic endpoint is insufficient. |
| 5. Complete final frontend QA and in-scope revisions | Roadmap explicitly assigns this to Dillon. Earlier reports document local/synthetic tests and Chromium/device-size checks. | Recheck the released dashboard, clients, detail panel, alerts, advisors, AI, Payment Watch, settings/documents, and included claimant pages. Cover mobile, keyboard/focus, accessibility, errors, loading/empty states, readability, time zones and reduced motion. Carry out the agreed browser/device matrix with the team. | Final release QA report, resolved issues, and client acceptance. Previous local tests do not prove current production or Safari/Firefox/iOS behavior. |
| 6. Finish and deliver user documentation/training | PR 5 already includes a staff-training guide and handoff documents. The original roadmap specifically assigns screenshots and walkthrough materials to Dillon. | Update guides against final screens and current integrations; supply the actual screenshots/walkthrough; rehearse add-client, lifecycle, Payment Watch, documents, settings, and user-facing tasks; support the training session with David's team. | Final user/admin guide, usable training assets, completed walkthrough/training record. Prepared technical files alone are not completed training. |
| 7. Reconcile the tracker and next-phase plan | Dillon's Phase 3 rows 22 and 24 still say PR 2 awaits merge. Phase 4 and Phase 5 contain headers only in the inspected range. Other completed rows contain stale pending notes. | Update the plan with James: distinguish built, merged, deployed, validated, and accepted. Add Phase 4/5 work with accountable owners, dependencies and agreed dates. Use verified milestones rather than inventing dates. | Tracker aligned with release evidence and a reviewable work/acceptance schedule. No live tracker edit occurred during this research. |
| 8. Support launch acceptance and client ownership | Contract requires client access, code/environment handoff, documentation, training and final approval. Dillon also promised independent client ownership in May. | Verify the final frontend and help David complete the user/access walkthrough; obtain Obaid/James's production, account-ownership, backup and operational receipts before recording completion. | David's access/training/acceptance record and exact live release evidence. Credentials are handled through approved vault/account flows, never in documents or chat. |

### Seven-stage acceptance checklist
This is a checklist derived from David's supplied specification, not a claim that each item is currently broken.

- Stage progression uses recorded business events and stores the relevant timestamps.
- Signature and deposit are independent Stage 1 requirements; elapsed time alone does not advance a stage.
- Records can be received but incomplete; someone explicitly owns the completeness decision.
- The 24-hour welcome-email task is tracked separately from the Stage 2 elapsed-time threshold.
- Delivery of the strategy/task list is recorded as the relevant transition event.
- Stage 4 separately tracks client tasks and booking, with 15/30/45-day reminders and a 60-day staff escalation.
- FIRM, CLIENT and VA stages carry appropriate alert tone; VA-controlled timing remains informational.
- Briefing counts and last-exam date are distinct; Stage 7 timing uses the final exam date.
- Stop the Clock preserves outcome/history; the agreed repeat-claim path restarts at Stage 2 without losing the master relationship history.
- Payment Watch covers timer start/restart, 0–59 exclusion, 60–120 grouping, 121+ grouping, and removing a paid client.
- Settings save/reload correctly, archived outcomes can actually be reached, and notes/documents retain the intended ownership/audit behavior.

### The seven decisions to close
Stage 6/7 event boundary; records-completeness authority; automatic versus staff-confirmed day-10 lapsed status; client-facing terminal labels; archive organization; appeals/HLR/supplemental versus repeat primary-claim handling; final average/reminder/time-zone language.

These are currently unresolved in the tracker and no later itemized written ratification was found in the searched messages. Do not state that David never approved anything or that no phase review occurred. The August 20 meeting did occur, and the available summaries do not establish individual answers to all seven decisions.

## Work already delivered or prepared
- Phase 3 page UI and Payment Watch UI: PR 2 merged, with follow-on staff integrations in PR 3 merged.
- Staff intake, lifecycle controls, notes and advisor UI wiring: PR 3 merged; September 2 Obaid reported production verification.
- Notification hardening: PR 6 merged. Do not list the September 2 missing-cron, arbitrary signed-URL and old digest-deduplication findings as current unresolved bugs.
- David's larger rating, countdown/calendar and education UI: reported completed in the August 12 review build. Remaining production integration/verification is distinct from rebuilding those visuals.
- PR 5 UI fixes and documentation: built in a draft branch, not merged or deployed.
- Staff AI and Payment Watch source wiring are present on current main; stale tracker notes should not cause them to be assigned as fresh builds.

## Dependencies and ownership
- **David:** product/launch decisions, sender-domain confirmation, intended notification recipient, phase review/acceptance and client-controlled access decisions.
- **James:** client coordination and sender DNS setup, expressly owned in September 3 email; current website/Nexus-page coordination. The live tracker assigns portal DNS/TLS/canonical routing to James.
- **Obaid:** backend/API/database changes, role and data isolation, claimant authentication/storage, production configuration/deployment, notification execution and actual delivery checks, backups and technical handoff.
- **Mac:** contract and phase-billing coordination/oversight. No payment status was inferred from approval gaps, and no new invoice action was taken.
- **Dillon:** frontend behavior and release verification; user-facing documentation/training; clear requirements/decision record and tracker collaboration.

Dillon's own frontend work need not be described as waiting indefinitely on DNS. The review should identify which specific test or integration depends on it. The public website/Nexus marketing work is distinct from the software release; the later claimant-portal promises must still be resolved explicitly, rather than silently dismissed as new paid scope.

## Corrections to earlier research
- The June source DOCX documents are now recovered and read.
- David's signed contract attachment exists. The earlier September 2 claim that it was unavailable is superseded.
- The August 20 meeting and its follow-up action for Dillon are evidenced. Claims that no meeting outcome existed are superseded.
- PR 2/3/6 are merged; PR 5 remains draft. Several tracker notes and the September 2 build report predate those changes.
- The portal hostname was approved in David's August 5 reply, discovered again in current Gmail search. That does not establish that DNS/TLS/provider deployment is completed.
- Sender-domain confirmation for Resend is a separate question from the approved portal hostname.
- Anthropic access was confirmed resolved in August; do not present it as a current blocker.
- Website self-registration and later claimant-portal functionality cannot be categorically ruled out from the broad original contract without reconciling the later written requirements and promises.

## Verification limits
This review uses current source/PR/connector readback plus original documents. It did not operate authenticated production workflows, contact a claimant, run notification delivery, access real claimant records, perform a new browser/device QA pass, or prove deployed configuration/RLS policies. No test count from an old report is presented as freshly rerun.

The available meeting summaries are not full transcripts. Targeted searches do not prove that an unseen verbal decision or inaccessible message does not exist. Every unresolved decision should be closed through an explicit recorded answer at the walkthrough.
