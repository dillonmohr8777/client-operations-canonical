# VA Claims Edge Phase Two closeout plan

Date: 2026-08-05  
Client: `va-claims-edge` / VA Claims Edge  
Status: review package published to the existing Netlify review site; production integrations and client communication remain gated

## Decision summary

Phase Two is complete as a reviewable product and UX handoff. The remaining safe work is to align the review surface with David's seven-stage process specification, make the Phase Two to Phase Three boundary explicit, and preserve the unresolved production gates instead of presenting illustrative behavior as live.

Paid media is not mapped to VA Claims Edge in the July report. No Google Ads, Meta Ads, budget, creative, or campaign change is in scope or supported by the evidence. The work described as a campaign adjustment is the claimant lifecycle, booking path, measurement plan, and implementation handoff.

## Verified complete

- Unified Netlify review surface covering the claimant portal and internal operations workspace.
- Shield-only portal identity, slightly larger VA Claims Edge header, seven evidence categories, rating display, appointment context, stage pacing, and profile gate represented in the review build.
- Dashboard refinements: `Awaiting Nexus Letter`, `Needs Attention` at 60 or more days since recorded contact, and `Ready to File`.
- Two-step signup review flow and Phase Two UI handoff bundle.
- Production login and deployment access correction verified in the prior release evidence.
- Current local source contains clearly labeled illustrative data and preserves unknown last-contact dates as unknown.

## Live review verification

- Existing mapped site: `https://va-claims-edge-phase-two-review.netlify.app`.
- Production review deploy: `6a736cd92dfa4a14780f9a25`.
- `/portal`, `/dashboard`, and `/dashboard/clients/SAMPLE-1042` returned HTTP 200 after deployment.
- The live portal bundle contains the seven stage process markers and Records intake copy.
- The live client detail bundle contains the master relationship clock, successful outcome, relationship ended outcome, and Stage 2 restart controls.
- This is a review deployment only. No real claimant data, calendar connection, booking-rule mutation, DNS change, paid media change, or client message was made.

## David's process model to carry forward

The process is a linear, event-driven state machine. A record occupies one stage at a time. Stage duration is derived from recorded start and end events. The target is an average, not a promise. An alert flags a record for review without silently changing its stage.

| Stage | Owner | Target | Alert | Entry event | Exit event |
| --- | --- | ---: | ---: | --- | --- |
| 1. Onboarding | Client | 10 days | 10 days | Contract sent | Contract signed and $700 deposit received |
| 2. Records intake | Client | 30 days | 30 days | Contract and deposit received | Medical records received |
| 3. Strategy development | Firm | 14 days | 14 days | Medical records received | Strategy plan and task list sent |
| 4. Client task completion | Client | 60 days | 60 days | Plan and task list delivered | Tasks complete and filing appointment booked |
| 5. Claim filing and VA scheduling | VA | 60 days | 60 days, informational | Claim filing appointment occurs | First pre-exam briefing booked |
| 6. Pre-exam briefings | Firm | 45 days | 45 days | First briefing booked | Final briefing completed |
| 7. VA adjudication | VA | 90 to 120 days | 120 days, informational | Final VA exam attended | Client reports VA decision |

Important semantics:

- Stage 1 tracks signature and deposit independently because they can arrive in either order.
- Stage 2 tracks the 24-hour welcome-email SLA separately from the 30-day stage timer and supports incomplete partial submissions.
- Stage 4 needs interim client touchpoints around days 15, 30, and 45 before the day-60 staff escalation.
- Stage 5 and Stage 7 are VA-owned. Their alerts are informational and must not label a client late for an external-agency delay.
- Stage 6 tracks both the 30-day briefing cluster and the 45-day overall stage duration.
- Stage 7 starts from the last exam date, not the last briefing date.

## Repeat and terminal paths

- At the end of Stage 7, the operator stops the master relationship clock and classifies the client as `successful` or `relationship ended`.
- A successful client leaves the active list and appears in the successful-client list with total relationship days.
- A client receiving an unfavorable decision uploads the VA decision letter, then returns to Stage 2 with a new claim cycle. The initial onboarding stages are not repeated.
- The same Stage 2 through Stage 7 loop can repeat for a second or later claim.
- The system should retain claim-cycle number, per-stage durations, total relationship days, terminal outcome, and decision-letter evidence.
- Post-decision appeals, higher-level review, and supplemental claims are outside this seven-stage pipeline and need a separate workflow.

## Decisions required before Phase Three

David's specification is detailed enough to implement, but these choices still need an explicit owner decision before production behavior is treated as final:

- Confirm that Stage 6 closes on the final pre-exam briefing and Stage 7 starts on the last VA exam attended. The specification describes both a briefing cluster and a final exam boundary, so the event names must be accepted before timestamps are persisted.
- Define what makes a records submission complete, including whether staff or the client owns the final completeness decision for large or partial PDFs.
- Decide whether `LAPSED_PROSPECT` after the Stage 1 ten-day threshold is automatic or a staff-confirmed status.
- Confirm the client-facing label for a terminal relationship outcome and whether the success or non-success lists are separate views or filters.
- Confirm the handling of appeals, Higher Level Review, and supplemental claims outside the seven-stage pipeline.
- Approve the owner and DNS route for `portal.vaclaimsedge.com`; James has recommended it, but the latest email asks for David's approval rather than recording it.

## Production gates still open

1. Apply the four verified booking corrections: minimum 24-hour notice, maximum 45-day horizon, Monday through Friday 10:30 AM to 4:00 PM Central owner availability, and 75-minute claim-filing duration. Verify automatic calendar sync, Google Meet link creation, and confirmation delivery.
2. Map the exact authorized WordPress or Amelia account. The prior verification reached WordPress admin, but the exact credential locator was not registered and the authorized Bitwarden vault was locked. No booking configuration was changed.
3. Complete a formal compliance review before real claimant files or client information enter the system. Current controls include Row Level Security, protected routes, HTTPS, and environment-variable API keys; those controls are not a legal or regulatory determination.
4. Connect the approved data model for appointments, VA rating, evidence status, `step_entered_at`, claim cycles, terminal outcomes, decision letters, permissions, and audit history.
5. Define the production calendar source, local-time display policy, stage-average source, and client-facing copy for reminders and escalation.
6. Configure `portal.vaclaimsedge.com` only after the owner approves the DNS route and the authorized DNS/hosting access is verified. The current evidence supports that subdomain as the preferred direction, not a completed DNS change.
7. Instrument the production signup, portal, appointment, and meeting journey after booking QA. Conversion reporting remains pending validation.

## Acceptance record for Phase Two

Phase Two can be represented as closed for design and review when the team has a single current review URL, the seven-stage model is visible in the handoff, the client and operator outcome paths are defined, all illustrative states are labeled, and the remaining production gates above have named owners. It cannot be represented as production-complete until booking, compliance, real-data persistence, DNS, and measurement are independently verified.

## Source locators

- Gmail thread `19fa4a51620386fb`, latest David message `19fcfdcc2d92a366`, subject `Re: VA Claims Edge unified portal review`.
- Gmail thread `19fc995257730d8f`, David response `19fcf67bbe368c47`, subject `Re: VA Claims Edge | July portal recap and August plan`.
- Gmail thread `19fa3e74b9e2919d`, current subdomain discussion messages `19fd225fb716091e` and `19fd22ff0fb8bbeb`, subject `Re: Weekly Checking`.
- Slack channel `C0AU6GMGY73` (`#va-claims`), messages around `1785946521.839949` through `1785947713.935359` and the August 3 implementation readback at `1785730812.858609`.
- `clients/va-claims-edge/evidence/2026-07-25-booking-routing-verification.json`.
- `clients/va-claims-edge/evidence/2026-07-24-dashboard-review-feedback.md`.
- `clients/va-claims-edge/deliverables/2026-07-16-phase-two-demo-readiness-brief.md`.
- `Momentum-360-July-2026-VA-Claims-Edge.pdf`, four-page July report attached by Dillon and supplied for this closeout.
