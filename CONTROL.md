# Dillon Marketing OS Control

> Deterministic projection of `queue/work-items.json`. The Marketing Chief is the only canonical writer.
> Local reversible work may proceed automatically. External delivery, publishing, deployment, spend, account changes, destructive changes, and human authentication gates require approval or handoff.

Last reconciled: `2026-07-16T13:46:55.4864894+00:00`
Queue revision: `18`
Mode: `manual-pilot`

<!-- marketing-chief:predictions:start -->
## Predicted next actions

**Next automatic action:** No automatic action is currently eligible.

**Next Dillon decision:** **Approve Hope Wellness analysis, reel direction, and P0 release** (`wi-20260715-0001`, score 179): Present the review artifacts and seven decisions to Dillon; record approve or the exact revisions requested. Why: P0, due within 24 hours, current evidence, status needs_approval, action class is approval-gated; automatic eligibility is false; action is not reversible; approval state is not exactly automatic and not_required.

**Next unblock:** **Reconcile two Fagan Painting website leads** (`wi-20260715-0002`, score 130): Verify mailbox processing, the named response owner, and lead-level disposition through the approved Fagan mailbox, CRM, or Zapier records before any prospect contact. Why: P0, no evidenced deadline, current evidence, status blocked, next action contains gated action language.
<!-- marketing-chief:predictions:end -->

## Active execution (normal 0/3; emergency 0/1)

No client outcome currently consumes a normal WIP slot.

## Commitment queue

| ID | Client | Outcome | Status | Priority | Next action | Due |
|---|---|---|---|---|---|---|
| `wi-20260715-0001` | `hope-wellness-center` | Approve Hope Wellness analysis, reel direction, and P0 release | Needs Approval | P0 | Present the review artifacts and seven decisions to Dillon; record approve or the exact revisions requested. | 2026-07-16 16:00 +00:00 |
| `wi-20260715-0002` | `fagan-painting` | Reconcile two Fagan Painting website leads | Blocked | P0 | Verify mailbox processing, the named response owner, and lead-level disposition through the approved Fagan mailbox, CRM, or Zapier records before any prospect contact. | No evidenced deadline |
| `wi-20260715-0003` | `nkcdc` | Build NKCDC Phase Two Growth Strategy deck | Done | P1 | Verify the completed local deck package against the brief, rendered pages, output contract, and factual safety checks. | No evidenced deadline |

## Waiting on Dillon

### Approve Hope Wellness analysis, reel direction, and P0 release

**Decision:** Approve or revise the review package and authorize release of the P0 queue.

**Next action:** Present the review artifacts and seven decisions to Dillon; record approve or the exact revisions requested.

**Reviewable artifacts:**

- `clients/hope-wellness-center/deliverables/2026-07-15-hope-wellness-deeper-analysis.pdf`
- `clients/hope-wellness-center/deliverables/2026-07-15-hope-wellness-implementation-queue.csv`
- `C:\Users\dillo\Downloads\hope-wellness-60s-brand-reel-v2.mp4`

**Definition of done:**

- Reel direction is approved or specific revisions are recorded.
- All seven leadership decisions have an owner, answer, or explicit unresolved status.
- P0 queue release is approved or held with a documented reason.
- No external delivery occurs without separate explicit approval.

## Blocked or at risk

- **Reconcile two Fagan Painting website leads:** Verify mailbox processing, the named response owner, and lead-level disposition through the approved Fagan mailbox, CRM, or Zapier records before any prospect contact.
  Current evidence: Exactly two unique website leads were found. Both direct notifications addressed the canonical mailbox, and one forwarded packet is a high-confidence duplicate. Operational receipt, response ownership, disposition, CRM delivery, and conversion tracking remain unknown.

## Intake quarantine

- `q-20260715-0001` **cross-client-conflation:** A prior run combined Fresh Blends and Replenish despite the canonical separation rule. Required resolution: Resolve the exact client and split any mixed work before execution.
- `q-20260715-0002` **false-client-route:** A non-actionable newsletter was falsely routed to a client named Bridge. Required resolution: Suppress the message and remove the stale generic alias from executable routing.
- `q-20260715-0003` **recipient-not-human-verified:** An NKCDC auto-draft targeted a meeting bot rather than a verified human recipient. Required resolution: Read the full source thread and rebuild recipient routing before any delivery review.
- `q-20260715-0004` **possibly-already-completed:** A bridal-client call task may already have been completed despite a stale subject line. Required resolution: Review the latest thread state before creating or executing a call task.

## Visible backlog

- `bc-20260715-0001` Verify ownership and promised outcome for attribution tracking remediation. Why it is not active: Current artifacts support the recommendation, but an active owner and promised commitment were not verified.
- `bc-20260715-0002` Deduplicate and route the historical Agent OS prepared-job backlog. Why it is not active: The backlog contains weakly routed and potentially duplicate packets; importing it would contaminate canonical state.

## System backlog

- `sys-20260715-0001` **Verify and convert the Agent OS Slack bridge to prepare-only intake** [done]. The live task and durable installer now use -PrepareOnly. A canary returned 0 with no new jobs, events, handoffs, completions, approvals, or notifications.
- `sys-20260715-0002` **Replace substring routing with exact registry routing and outcome-level deduplication** [done]. The canonical intake bridge now accepts only exact active registry routes, quarantines mixed and false routes, suppresses normalized duplicates, and never promotes legacy Agent OS routing directly into the queue.
- `sys-20260715-0003` **Update live bridge descriptions to match prepare-only behavior** [done]. The durable installer was rerun after the prepare-only change; live Gmail and Slack task descriptions now state that execution and notification are disabled during the manual pilot.
- `sys-20260716-0004` **Map every authorized client login to an exact Bitwarden entry locator** [blocked]. Create or identify a Hope Wellness Center-specific login in the sole primary vault. In the Bitwarden Chrome extension, set vault timeout to On browser restart, timeout action to Lock, enable PIN unlock, and disable master-password-on-browser-restart for PIN. Rotate or close the retired secondary account. Keep Revive, Onsite, generic Wix, and generic Zapier items quarantined until uniquely routed.
- `sys-20260716-0005` **Operationalize the single Marketing Chief control loop** [done]. A global Marketing Chief agent, executable workflow, deterministic ranking and control rendering, stale-safe queue mutations, bounded handoff validation and reconciliation, prediction feedback, live system-health probes, voice rules, and design QA now point to this canonical project.
- `sys-20260716-0006` **Consolidate background observations without creating user-facing tasks** [done]. Gmail and Slack remain prepare-only and sync redacted metadata into canonical intake. The redundant morning preflight, daily brief, weekly closeout, Chrome watchdog, and standalone Slack Reply Watchdog remain disabled or paused.

## Source and system health

- **accessBroker:** `valid`
- **agentOsSlackBridge:** `enabled-prepare-only-canonical-intake-sync`
- **asOf:** `2026-07-16T13:46:55.4864894+00:00`
- **browserPolicy:** `persistent-remote-chrome-only-never-edge`
- **canonicalIntake:** `live-exact-route-deduplicated-redacted-no-task-no-notification`
- **canonicalRepository:** `dirty-user-work-preserved-no-outer-remote`
- **clientRegistry:** `valid-partial-live`
- **credentialBridge:** `v1.1.2-security-review-go-signed-cli-integrity-pinned-sanitized-exact-item-resolution-locked-bootstrap-present-no-secret-output`
- **credentialVault:** `sole-primary-vault-identity-verified-six-exact-item-locators-registered-hope-specific-item-missing-extension-timeout-unverified-secondary-route-retired-rotation-pending`
- **dailyBrief:** `disabled-manual-pilot`
- **gmailAccess:** `read-connected-verified-password-hint-delivery-confirmed-without-body-read-send-and-auth-code-use-prohibited`
- **gmailBridge:** `enabled-prepare-only-canonical-intake-sync`
- **marketingChief:** `operational-global-agent-executable-workflow-versioned-state-predictive-feedback-enabled`
- **morningOrchestrator:** `disabled-manual-pilot`
- **slackReplyWatchdog:** `paused-definitions-reconciled`
- **weeklyCloseout:** `disabled-manual-pilot`

## Live health probe

- **As of:** `2026-07-16T13:46:28.2320854+00:00`
- **Overall:** `healthy-with-human-gates`
- **Queue:** revision `17`, `3` work items, normal `0/3`, emergency `0/1` active
- **Client registry:** `valid`
- **Access Broker:** `valid`
- **Access coverage:** `5/18` canonical clients registered, `2/55` systems verified, `6` exact Bitwarden item locators
- **Credential bridge:** `locked`, secure bootstrap present `True`, review `go-no-critical-or-high-findings-integrity-verified`
- **Scheduled mechanisms:**
  - `Codex-Morning-Orchestrator-Preflight`: enabled `False`, state `Disabled`, prepare-only `False`, last result `0`
  - `DillonAgentOS-GmailBridge`: enabled `True`, state `Ready`, prepare-only `True`, last result `0`
  - `DillonAgentOS-SlackBridge`: enabled `True`, state `Ready`, prepare-only `True`, last result `0`
  - `DillonAgentOS-DailyBrief`: enabled `False`, state `Disabled`, prepare-only `False`, last result `0`
  - `DillonAgentOS-WeeklyCloseout`: enabled `False`, state `Disabled`, prepare-only `False`, last result `0`
  - `Codex-Chrome-Watchdog`: enabled `False`, state `Disabled`, prepare-only `False`, last result `0`
- **Human gates:** `active_client_exact_bw_item_mapping`, `bitwarden_extension_timeout_policy_verification`, `secondary_exposed_password_rotation`

## Standing operating contract

- Say `continue` in the pinned Marketing Chief task. The Chief refreshes health and intake, ranks current work, executes the highest safe local action, reconciles verified worker handoffs, and asks for at most one human decision.
- Background Gmail and Slack sensors may update redacted canonical intake only. They do not create Codex tasks, send notifications, or mutate the queue.
- Persistent remote Chrome is the browser route. Microsoft Edge is never used unless Dillon explicitly changes that rule.
- Bitwarden is the canonical vault. Only opaque account and item locators enter state. Raw passwords, tokens, cookies, and codes never do.
- Nothing is sent, published, deployed, purchased, or placed into spend without the required explicit approval.
