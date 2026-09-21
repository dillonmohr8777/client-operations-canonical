# VA Claims Edge — Phase 3 closeout reconciliation (2026-09-21)

Nineteen-day follow-up on `closeout.md` (2026-09-02). Re-checks every open item against
current evidence rather than restating the original claim.

Sources: `#va-claims` 2026-09-04 → 2026-09-21, and fresh unauthenticated probes of
`https://vaclaims-portal.vercel.app` on 2026-09-21.

## Production re-verified, unchanged

All eleven routes still return `200`, and every protected API route still returns `401`
unauthenticated (`/api/clients`, `/api/advisors`, `/api/settings`). Nothing regressed in
nineteen days.

## Decision 1 — Resend sender domain: CLOSED

Resolved on 2026-09-15. James Frederick and Obaid set the domain up together: DNS records
were added at the registrar and the domain moved into authenticating. James confirmed the
same day that he "helped David with the changes to the nexus page and helped set up resend."

The alert engine should no longer be stuck on a test sender. **Not independently verified
from this side** — sending is not externally observable — so confirm a real digest has
landed before telling David alerts are live.

## Decision 2 — Website self-registration: STILL OPEN

No decision was recorded between 2026-09-04 and 2026-09-21. James asked for both self and
staff onboarding on 2026-09-01; staff intake shipped; self-registration has not been
scoped, deferred, or rejected on the record. It is still an open question, not a closed one.

Obaid estimated 4–5 weeks to final testing and go-live on 2026-09-05, which implies
self-registration is out of the current phase, but that is an inference and not a decision.

## The acceptance gate has not moved — this is the whole story

`closeout.md` said Phase 3 should not be presented to David as finished until an
authenticated seven-stage walkthrough was done. Nineteen days later that walkthrough still
has not happened, and it is now the single thing holding the phase open.

The record:

| Date | Event |
|---|---|
| 2026-09-04 | James: "I think we need to do a walk through of it next week and then we can move on to phase 4" |
| 2026-09-05 | Obaid declares Phase 3 complete on the development side, to Mac and James |
| 2026-09-14 | Dillon's weekly report: the walkthrough "was agreed on the 4th for the following week, and there is no record of it happening" |
| 2026-09-16 | James proposes Friday 11am EST with David; Dillon and Obaid both accept |
| 2026-09-18 | David cancels. James asks Dillon and Obaid to write David an email with steps to try the demo himself beforehand |
| 2026-09-21 | James chases: "progress on the demo email to david?" |

Two scheduling attempts have now failed. The demo-steps email is the workaround James
proposed, and it is currently the critical path: it is what lets David form an opinion
without a meeting, which is what unblocks acceptance and Phase 4.

**That email is outstanding and was chased today.** A draft is in `slack-drafts.md` under
"Draft 4".

## What is still owed by Dillon

1. Send the demo-steps email to David (draft ready, approval-gated).
2. Run the authenticated seven-stage walkthrough. It remains the acceptance gate whether or
   not David runs the demo himself; his self-serve pass is not a substitute for internal
   verification.
3. Confirm the operations dashboard reflects the seven-stage model, not the retired
   four-stage grouping.
4. Confirm the large-text accessibility pass for older claimants survived the Phase 3 merges.
5. Get a recorded decision on self-registration, rather than letting the 4–5 week estimate
   imply one.

Items 3 and 4 have been open since 2026-08-10 and have now survived two phase closeouts
without being re-verified.

## Process note, not a client item

On 2026-09-15 a one-time verification code and a personal phone number were posted in
`#va-claims` while setting up the shared account. The code is long expired and no action is
needed now. Worth raising once as a practice point: one-time codes and phone numbers should
move through the vault route rather than a client channel, the same rule already applied to
the Resy credential on Puttery.
