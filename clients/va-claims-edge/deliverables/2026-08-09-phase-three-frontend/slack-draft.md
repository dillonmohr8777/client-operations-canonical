# Slack draft

Intended channel: `#va-claims`

Status: draft only; not posted.

## Exact proposed message

Obaid and James, quick correction and Phase 3 review update.

Phase 2 remains complete for its approved scope in the authenticated Vercel application: authentication, protected routes, the design system, core portal shell, dashboard structure, sidebar, and navigation.

The newer Phase 3 frontend review is now updated here: https://va-claims-edge-phase-two-review.netlify.app/

The review now includes all seven operational stages with CLIENT, FIRM, and VA ownership; visible event-based stage controls; Stop the Clock with protected confirmation, outcome selection, and inactive-list placement; separate Stage 1 contract and deposit states; Stage 4 day 15, 30, 45, and 60 reminder states; and the unfavorable-decision restart at Stage 2 while the master relationship clock continues.

David's feedback is also represented: a larger VA-rating treatment, a much larger appointment countdown, exact appointment and named time-zone handling with explicit claimant confirmation, a month calendar with an additional-scheduling entry point, and the rotating ten-item Did You Know content.

Important boundary: this Netlify URL is the broad review environment using illustrative data and browser-local workflow state. It is not a claim that the authenticated Vercel backend now has the same persistence or automation. The production handoff still covers schema and database writes, server-side transition validation, permissions and audit history, Stage 4 alert delivery and deduplication, VA-stage alert suppression, calendar and Meet connections, and compliant claimant-file handling.

The remaining product decisions are the final terminal-outcome terminology, where stopped clients live, the exact Stage 6-to-7 event, partial-record completion authority, lapsed prospects, appeal-cycle treatment, compliance requirements, and production-domain launch checks.

Source handoff: `feature/phase-3-frontend` at `7e5f4ae`.
