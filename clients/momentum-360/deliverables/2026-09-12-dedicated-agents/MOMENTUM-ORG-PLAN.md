# Momentum Workmate and Marketing Chief operator

September 14 scope correction: Dillon explicitly requires Marketing Chief operator capabilities, workflows, knowledge, skills, tools, and delegation, plus all five organizational modes. Workmate is installed in team `T066HGS7N` as app `A0C2K8ZU6AU`. The local Codex runtime recognizes Dillon's Pro login, 912 enabled skills, and 32 callable apps. Slack transport activation remains pending. See [the current receipt](SLACK-INSTALLATION-2026-09-14.md); the September 13 rollout below is historical.

Date: September 12, 2026; implementation closeout September 13  
State: LOCAL OPERATOR VERIFIED, SLACK ACTIVATION PENDING  
Client route: `momentum-360`  
Purpose: give the team reliable AI support that completes bounded work, preserves source context, and shows evidence before claiming success.

## Executive decision

Use one Workmate app as a Slack entry point to the existing local Marketing Chief/Codex operator. Load installed skills and connected tools on demand, use the existing workflow files and canonical queue, and retain the five named modes as focus areas. Dillon's verified private DM is the full operator entry point; other workspace members do not inherit Dillon's private cross-client access by mentioning the app. Team-specific access must be routed and verified separately. The deterministic lead and organization adapters remain reusable specialist tools.

The earlier Jason-first pilot and rollout are preserved below as implementation history. They do not cap the new operator at lead review, fixed prompts, summaries, or read-only reporting. Reversible research, coding, artifact creation, workflow execution, and specialist work are in scope. Existing exact-action gates still apply to external delivery, publishing, spending, account changes, and destructive operations.

The local lead adapter, five owner modes, restricted Slack receiver, and separately gated controlled-test sender are implemented and locally verified. Workspace and channel were read back September 13. Live activation still requires a new app installation, protected credentials, installed bot identity verification, and an approved controlled post. See [the closeout](STACK-CLOSEOUT-2026-09-13.md) for actual scheduler and test receipts. No business process is represented as fixed until its own outcome receipts exist.

## What the organization needs first

| Priority | Owner | Agent mode | First outcome | Proof of success |
| --- | --- | --- | --- | --- |
| 1 | Jason Fallon | Lead desk | One inquiry record with source, campaign, owner, task state, next action, and CRM reference | An exact retry creates no duplicate; a second inquiry from the same contact remains separate; Slack and CRM receipts reconcile |
| 2 | Sean Boyle | Operations | Decision packets for blocked production, capacity, and scope choices | Each packet has one decision, current evidence, responsible person, deadline, and effect of delay |
| 3 | Mac Frederick | Revenue and reporting | Weekly client exceptions that reconcile media delivery, leads, CRM outcomes, and payment readiness | Correct client, account, and period are proven; unknown conversion or revenue fields stay pending validation |
| 4 | Melissa Silber | Marketing production | Complete briefs and dependency maps carried through to the requested artifact count | Supplied answers are retained; only material missing inputs are asked; every promised asset has a review link or precise blocker |
| 5 | Melissa Rigby | Client delivery | Milestone review agendas and specialist dependency packets | Build completion, internal review, client acceptance, and delivery remain separate evidenced states |
| Shared | Assigned per outcome | Verifier | Quiet scope, freshness, and receipt review | No agent can close its own work from a success message alone |

## How work moves

1. A human request or verified system event creates one work item with a stable source identity.
2. The coordinator resolves the exact client, owner, requested outcome, approval boundary, and current evidence.
3. One mode owns the result. It receives only the evidence and fields needed for that result.
4. Deterministic code handles schema validation, routing, deduplication, state checks, and receipt matching.
5. A model handles synthesis, judgment, and drafting only when deterministic logic cannot finish the step.
6. A separate verifier checks scope, freshness, artifact existence, and external receipts.
7. The coordinator closes the item, requests one precise decision, or preserves a resumable draft.

Bot messages do not create new work unless they carry an explicit handoff identity. A human stop cancels pending dispatch and preserves the draft. Client data never crosses into another client's channel or packet.

## Rollout

### Stage 0: complete locally

- Organization evidence report and 11 source backed work packets.
- Role contracts and offline organization replay, passing 22 checks.
- Five-mode `org-modes` shadow runtime producing all 11 per-owner packets, with persisted stop/cancel state, retained provided answers, requested asset counts, changed-source review, evidence snapshot dates, and verifier checks, passing 36 checks.
- Lead adapter with SQLite persistence, passing 46 checks.
- Current restricted receiver at `lead-agent/slack_shadow_receiver.py`: signed HTTP and official SDK Socket Mode, exact workspace/app/human/channel gates, ordinary human contact-review requests, persistent dedupe and stop, passing 51 checks. The earlier `slack-receiver` prototype is retained history.
- Separate controlled-test sender at `lead-agent/approved_delivery.py`: disabled by default, exact approval hash and destination, durable claim before send, no automatic retry after ambiguity, exact readback, passing 13 mocked checks and independent review.
- Two redacted CRM examples from portal `50612503` with actual owner, campaign, and different task states.
- Read only verification of Zaps `379667050` and `365085675`.
- Confirmed blank Source field in the published generic contact alert.
- Draft Slack manifest, first lead preview, repair sequence, acceptance cases, and rollback.

### Stage 1: Jason lead desk shadow pilot

Use the staged local Slack receiver core around the verified local adapter. It accepts only human mentions in `#360leads` (`C05R2B1ULF6`), reject the wrong workspace or channel, ignore bot events, deduplicate Slack event IDs, and keep every response staged until the exact test post is approved.

Before activation, verify the Momentum workspace identity, store Slack credentials outside the repository, validate the manifest, and capture the exact first payload. Then test one synthetic Meta inquiry, its exact retry, and a second inquiry for the same contact. Record provider event ID, CRM record ID, and Slack timestamp in the delivery ledger.

Exit criteria:

- one Slack delivery for one inquiry;
- no second delivery for an exact retry;
- a second delivery for a distinct second inquiry;
- source, campaign, owner, task state, and CRM reference preserved;
- wrong workspace and wrong channel rejected;
- stop prevents dispatch;
- uncertain sends reconcile before retry;
- positive Slack readback captured.

### Stage 2: repair the current alert path

Preserve the existing unpublished draft of Zap `365085675` before any edit. Stage a companion alert that maps current HubSpot source and campaign fields, uses `Unknown` when absent, and includes the canonical portal contact reference and owner. Separately stage correction of the future UTM source literal `Facebok` in Zap `379667050`; do not rewrite historical records.

Publish or test either Zap only after the exact change, rollback, sample event, and destination are approved. A successful Zap run is insufficient without the corresponding Slack readback.

### Stage 3: add Sean and Mac modes

Promote Sean's mode after the lead desk has reliable identity and receipts. It produces decision packets, not open ended summaries. Promote Mac's mode after reporting sources can be bound to the exact client and period. It reports reconciled facts, flags missing inputs, and never invents revenue attribution.

Each mode begins in shadow review with one owner, one channel set, one output type, and a hard stop. Expand only after five consecutive accepted outputs with no duplicate action, cross client routing error, or completion without proof.

### Stage 4: add the two Melissa modes

Keep Melissa Silber and Melissa Rigby separate. Their existing roles are evidenced, so no identity question is needed before local preparation. Confirm the exact assignment only when an external Slack mode or delivery authority is about to be activated.

Melissa Silber's production mode must remember freeform answers, carry briefs through production, and prove the requested number of assets. Melissa Rigby's delivery mode must track review, acceptance, dependencies, and client handoff as separate stages.

### Stage 5: durable agent runtime

Move the proven modes to a durable runtime only after the Slack pilot passes. Reuse the existing canonical Momentum queue and evidence contracts. Do not create a second organization wide task system. A managed Agents API or self hosted executor is appropriate only when it can preserve session recovery, cancellation, tool permissions, cost ceilings, and the same receipt rules.

## Cost policy

- Use deterministic code before a model call.
- Use one routine worker per ready outcome and stop it when the artifact exists.
- Pass source locators and compact evidence packets, not channel histories.
- No recursive delegation or heartbeat for the first pilot.
- Proposed pilot ceiling: 20 human invoked tasks per day and one bounded routine model call per task.
- Paid runtime budget remains zero until an exact cap is approved and enforced before dispatch.
- Measure total cost per accepted outcome, including retries and rejected work, rather than cost per model call.

## Current decision gates

| Gate | Current state | What makes it ready |
| --- | --- | --- |
| Local organization plan | Complete | This plan plus the verified package |
| Jason shadow receiver | Local shadow implemented | Protected secret route, real workspace/app/user readback, manifest validation, and install target |
| First Slack test | Approval gated; local payload staged | Exact destination, payload, scopes, rollback, receiver readiness, and approval to post |
| Zap repair | Approval gated | Preserved existing draft, exact field mapping, controlled sample, rollback, and owner review |
| Sean and Mac modes | Staged | Jason pilot acceptance plus one exact output contract per mode |
| Melissa modes | Staged | One exact external assignment per person and their acceptance fixtures |
| Daily runner recovery | Complete for local checks: existing 9 AM task enabled, scheduler-run result 0 and passing dated receipt | External provider health/report delivery remain blocked by their account access and live-delivery gates |

## Next concrete move

Review the new Workmate installation in verified team T066HGS7N using `slack-app-manifest.draft.json`. The exact controlled synthetic message is `lead-agent/run/controlled-test-message.txt`; its approval template remains false. After installation and protected credentials, prove the installed bot identity and authorize that one channel test. The exact Zap changes are separately reviewable in `zap-repair-review-2026-09-13.md`. No additional broad organization research is needed.
