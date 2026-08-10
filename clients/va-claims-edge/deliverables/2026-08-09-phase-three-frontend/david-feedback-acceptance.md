# David feedback acceptance record

Evidence locators:

- David feedback email: Gmail message `19fddb5f5972bef8`, thread `19fc995257730d8f`, observed 2026-08-09.
- Dillon response: Gmail message `19fe79b435aa5762`, same thread, observed 2026-08-09.
- Did You Know source: attachment `Did You Know.docx` on David's message.

## Acceptance mapping

| Request or commitment | Review implementation | Verification |
| --- | --- | --- |
| Make the current VA rating larger and wider | Persistent rating panel with a 14px label floor and a 30px percentage treatment | Measured live at desktop and 390px mobile |
| Make the appointment countdown much larger | Countdown is the appointment-page primary heading and repeats in the persistent appointment summary | Measured at 43.2px on 390px mobile |
| Keep supporting appointment labels at least 14px | Appointment details, local-time state, Meet state, compact countdown, and persistent sidebar labels use a 14px floor | Live computed styles checked |
| Show exact date, time, client time zone, and days/hours/minutes | Exact appointment timestamp, named source zone, large countdown, and confirmed local-time row | Rendered review checked |
| Do not use a manual or fixed time-zone conversion | Local time remains unavailable until the claimant confirms an IANA time-zone identifier | Live checks passed for Chicago, New York, Los Angeles, Phoenix, London, and Tokyo, including Tokyo's next-day date |
| Put the large countdown where the prior appointment-page headline was | Appointment page now opens with the countdown as its primary heading | Rendered review checked |
| Add month/calendar appointment scheduling | August month view marks the next appointment and exposes Schedule another | Rendered review checked; production calendar write remains open |
| Use the right-side card for rotating Did You Know content | Ten supplied topics rotate per session and by explicit Show another tip control | All ten review topics present |
| Keep appointment details and Meet access available from every portal page | The persistent sidebar now shows exact source time, countdown, local-time confirmation state, and Meet connection status | Live sidebar checked at desktop, 390px mobile, and 320px reflow width |
| Preserve accessibility commitments from Dillon's reply | Responsive layout, readable text floors, skip-link focus, focus-visible styles, reduced-motion handling, and semantic controls | Build, detector, keyboard path, desktop/mobile, and zero-overflow 320px reflow checks passed |

## Additional current-spec acceptance

- Stage 6 captures scheduled VA exam count and completed briefing count. Advancement stays gated until the counts match, at least one exam exists, the final briefing is complete, and the last exam date is recorded.
- Stage 7 displays the 90–120 day target range and keeps the 120-day review informational because the VA owns the stage.
- The evidence review accepts PDF, JPG, and PNG selections up to 250 MB so large record packages are not rejected by the earlier 10 MB prototype limit. Production file policy and persistence remain a compliance handoff.

## Production follow-through

The review implementation intentionally does not claim production calendar, Meet, notification, profile, or claimant-file persistence. Those connections belong in the authenticated production backend after schema, authorization, and compliance approval.
