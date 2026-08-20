# VA Claims Edge portal meeting-readiness packet

**Prepared:** 2026-08-20
**Work item:** `wi-20260820-0001`
**Status:** Local review artifact. Nothing was scheduled, sent, published, deployed, or changed in a live account.

## Meeting outcome

Use the review portal to confirm the client-facing seven-stage experience, secure the remaining lifecycle decisions, and assign the production activation work. The review implementation is ready to demonstrate with synthetic data. It is not yet a production claimant-data system.

## Current verified state

### Verified in this run

- The exact client route resolves to active client `va-claims-edge`.
- The current meeting request is bound to `agent-os-run:20260817-111244-0c7bab93/task.json`.
- On 2026-08-20, the Netlify review root, `/portal`, `/dashboard`, and `/dashboard/clients/SAMPLE-1029` each returned HTTP 200.
- On 2026-08-20, the Vercel `/login` route returned HTTP 200.
- `portal.vaclaimsedge.com` did not resolve in the current DNS check.
- The local source checkout is on `codex/va-claims-edge-phase-3-complete-20260812` at commit `0a02845`. `git diff --check` passed.

### Verified by the 2026-08-15 closeout package and the review checklist

- The client portal and operations dashboard implement the seven-stage review model with synthetic, browser-local records.
- Event-gated stage transitions, owner guidance, Stage 4 reminders, linked claim-cycle restart, master-clock continuity, Stop the Clock, and terminal history are supported by the dated closeout. The undated review checklist also marks appointment states, timezone handling, Stage 6 exam-to-briefing matching, and client/staff evidence boundaries complete in the review build; those checklist marks are implementation assertions, not production readback.
- The recorded closeout verification passed a clean install, dependency audit with no reported vulnerabilities, 13 of 13 automated tests, lint, production build, responsive route review, accessibility review, and `git diff --check`.
- The closeout explicitly states that production persistence, authentication enforcement, infrastructure activation, provider connections, DNS, and custom-host live readback remain incomplete.

## Recommended demo flow

1. **Set the boundary first**
   State that all visible records are deterministic synthetic review data. Do not imply that claimant data, production authentication, provider delivery, or persistent workflow events are active.

2. **Client portal**
   Show the persistent appointment card, explicit missing/past/cancelled states, timezone handling, booking rules, read-only evidence checklist, profile gate, and safe synthetic upload behavior.

3. **Seven-stage lifecycle**
   Walk through the stage owner, starting event, ending event, and event gate. Emphasize that VA-owned stages are informational and that advancement is event based.

4. **Operational exceptions**
   Demonstrate Stage 4 reminders, Stage 6 exam-to-briefing matching, the Stage 7 boundary, a linked claim-cycle restart that preserves the master clock, and Stop the Clock with terminal history.

5. **Operations dashboard**
   Show attention views, stage and owner filters, appointment controls, terminal outcomes, staff evidence updates, and audit metadata.

6. **Activation boundary**
   Close with the unchecked production gates: repository and migrations, role-level security, calendar and meeting provider, reminder provider, analytics/privacy approval, custom-domain DNS/TLS, authentication, and live readback.

## Decisions needed in the meeting

| Decision | Recommended direction | Proposed decision owner | Why it matters |
|---|---|---|---|
| Stage 6 to Stage 7 boundary | End Stage 6 after the final pre-exam briefing; begin Stage 7 after attendance at the final scheduled VA exam. | Client lifecycle owner | Removes ambiguity from the final exam transition and production event schema. |
| Records completeness | Assign one case owner/reviewer to decide whether partial, unusually large, or complicated packages are complete and require an audit note. | Client operations owner | Creates a defensible event gate for Stage 2. |
| Day-10 lapsed prospect | Keep status staff-confirmed and add an automatic day-10 reminder. | Client lifecycle owner | Separates reminder automation from an unsupported automatic status change. |
| Terminal labels | Use `Claim completed` and `Services concluded`. | Client lifecycle owner | Finalizes client-facing and reporting language. |
| Archive layout | Use one archive with outcome filters. | Client operations owner | Simplifies history while preserving terminal-state separation. |
| Appeals, HLRs, and supplemental claims | Use a separate linked workflow rather than forcing them into the primary seven-stage pipeline. | Client lifecycle owner | Preserves the primary lifecycle and linked-cycle audit trail. |
| Time language | Label averages as estimates, reminders as guidance rather than legal deadlines, and appointments in Central plus user-local time. | Client policy owner | Reduces legal and expectation risk. |

## Production work to assign, not perform in the meeting

| Workstream | Current condition | Accountable owner | Completion evidence |
|---|---|---|---|
| Database schema, repositories, migrations, and RLS | Not present in the review branch | Infrastructure engineering owner | Exact non-production project, additive migration/commit, role-isolation tests, repository contract tests, and readback. |
| Production environment configuration | Not verified | Infrastructure engineering owner | Redacted variable-name inventory, exact deployment mapping, and health/readback evidence. |
| Custom-domain DNS and TLS | `portal.vaclaimsedge.com` unresolved in the 2026-08-20 check | Domain owner with infrastructure engineering | Authoritative DNS answer, valid certificate, HTTPS redirect, and canonical-host readback. |
| Authentication and role enforcement | Vercel login foundation responds; custom-host and production role enforcement remain open | Infrastructure engineering owner | Signed-out redirect, authorized login, session continuity, and unauthorized-user denial. |
| Calendar and meeting provider | Synthetic only | Infrastructure engineering with product owner | Authorized event creation and provider readback without exposed credentials. |
| Reminder/email provider | Not connected in the review branch | Infrastructure engineering owner | Idempotent non-production delivery test and provider readback. |
| Analytics and consent | Allowlisted planning code only | Marketing/privacy owner | Approved destination, privacy review, consent behavior, and event readback without claimant data. |

### Separate live booking issue

The 2026-07-25 public booking readback recorded live-site mismatches against the requested rules: missing minimum-notice enforcement, a 365-day rather than 45-day horizon, weekday availability drift, and a 90-minute rather than 75-minute filing duration. The review branch models the requested rules, but that does not prove the public booking system was corrected. The existing account-change work item remains blocked pending exact authorized WordPress or Amelia access and a separately approved synthetic booking test.

## Demo checks before screen sharing

- Open the review root, `/portal`, `/dashboard`, and one synthetic client route.
- Confirm the pages still identify review/synthetic state.
- Keep all claimant information, credentials, tokens, calendar accounts, and private communications out of the demonstration.
- Do not present browser-local controls as server authorization.
- Do not promise a production date until the infrastructure owner confirms the exact project, schema, security tests, provider routes, and custom-domain path.
- Record the seven lifecycle decisions and one accountable owner for each activation workstream.

## Proposed next checkpoint

After the meeting, convert only approved lifecycle decisions into the production event/schema contract. Infrastructure engineering should then return a non-production activation receipt covering migrations, role isolation, repository tests, provider readbacks, and custom-domain verification. Production deployment, account configuration, external delivery, and claimant-data migration remain separately approval-gated.

## Evidence locators

- `agent-os-run:20260817-111244-0c7bab93/task.json`
- `queue/work-items.json` revision 412
- `clients/va-claims-edge/CLIENT.md`
- `clients/va-claims-edge/workspace/vace-platform/docs/phase-2-closeout-2026-08-15.md`
- `clients/va-claims-edge/workspace/vace-platform/docs/phase-3-data-activation.md`
- `clients/va-claims-edge/workspace/vace-platform/docs/phase-3-review-checklist.md`
- `clients/va-claims-edge/evidence/2026-07-25-booking-routing-verification.json`
- `clients/va-claims-edge/evidence/2026-08-20-portal-meeting-readiness-readback.json`

## Assumptions and limits

- The source request establishes a current need to review the portal, but it does not authorize this system to schedule the meeting or send this packet.
- Current HTTP 200 responses verify route availability only. They do not verify production persistence, authentication, database security, provider integration, or claimant-data readiness.
- The 2026-08-15 test results are cited as dated evidence and were not rerun as part of this packet-only task.
