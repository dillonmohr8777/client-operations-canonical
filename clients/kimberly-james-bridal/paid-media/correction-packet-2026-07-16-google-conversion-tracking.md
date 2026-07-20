# Kimberly James Bridal Google conversion correction packet

Prepared: 2026-07-16
Status: local redacted draft; live correction not authorized
Lane: Google Ads only; keep KJB Meta separate

## Decision

Do not optimize bids, budget, targeting, or campaign state until the appointment path is proved end to end. The enabled primary Google campaign is spending while reporting zero conversions, so measurement is the first correction gate.

## Verified facts

- Persistent Chrome verified the primary KJB Google account and excluded the cancelled duplicate.
- `Campaign #1` was enabled as Performance Max at an observed $20 per day.
- The July 16 live read showed 54,814 impressions, $585.42 spend, and zero conversions for the observed last-30-day window.
- A separate July 6 through July 12 communication record also showed 365 clicks and zero tracked conversions. This is corroborating history, not the current live window.
- The client blueprint defines `appointment_request` as the primary event; `form_submit`, `phone_click`, and `schedule_start` are secondary signals. Deduplication is required.
- Tests must never be counted as leads, appointments, or bookings.
- The launch authority is draft-only. It allows local artifacts but no deployment, provider mutation, enablement, pausing, or budget change.

## Hypotheses, not findings

- The primary conversion action may be missing, inactive, unselected at campaign level, or not firing on successful appointment completion.
- A secondary click or form event may exist without being imported or classified correctly in Google Ads.
- The appointment page or scheduler handoff may lose source parameters or fail before confirmation.
- Genuine appointments may exist downstream but remain unreconciled to Google Ads.

None of these explanations is proven by the zero shown in the campaign view.

## Required readbacks

1. Reconfirm the primary account and keep the cancelled duplicate excluded.
2. Export the current conversion-action table: name, source, category, primary or secondary status, recording status, count setting, attribution model, and last recorded date.
3. Read the campaign goal selection and identify exactly which actions influence bidding.
4. Read the current final URL and complete the mobile appointment journey through confirmation without submitting prospect data.
5. Verify tag diagnostics and the event sequence for `schedule_start`, `form_submit`, and `appointment_request`.
6. Reconcile the same date window across Google Ads, analytics, the form or scheduler, CRM or appointment records, and qualified or booked outcomes.
7. Inspect event identifiers and test flags to prove that one real appointment produces one primary conversion and test submissions produce none.
8. Read change history for conversion, goal, URL, tag, and campaign-state changes.

## Recommended local correction build

- Produce a measurement map with one row per funnel event, its owner, trigger, system of record, deduplication key, Google classification, and test-exclusion rule.
- Keep `appointment_request` as the proposed primary outcome only after a real successful appointment can be read back once in every required system.
- Keep `schedule_start`, `form_submit`, and `phone_click` secondary so they remain diagnostic rather than equivalent to an appointment.
- Define the exact UTM pattern as `kjb_google_{intent}_{campaign_type}` and confirm source fields survive the scheduler handoff.
- Create a local QA script covering mobile completion, success-state firing, refresh protection, repeat submission, test exclusion, and source-to-booking reconciliation.
- Prepare any required Google goal or tag edits as a paused change set with before-state capture and rollback steps.

## Success criteria

- One controlled real appointment request records exactly once as the primary Google conversion.
- The same record is present downstream with preserved source data and a qualified or booked disposition field.
- Test events, duplicate submissions, page refreshes, phone clicks, and schedule starts do not inflate the primary count.
- A same-window reconciliation explains every difference between platform events and downstream appointments.

## Approval-gated live actions

Explicit current approval is required before any of the following:

- changing conversion actions, campaign goals, attribution, counting, bidding, budget, targeting, or campaign state;
- editing or deploying page, scheduler, tag-manager, analytics, CRM, or webhook configuration;
- importing offline conversions or customer data;
- sending a client message or requesting client-side follow-up.

## Evidence

- `clients/kimberly-james-bridal/paid-media/blueprints/google_ads.json`
- `clients/kimberly-james-bridal/paid-media/launch-config.json`
- `clients/kimberly-james-bridal/paid-media/launch-authority.json`
- `clients/kimberly-james-bridal/context/operating-context.md`
- `state/paid-media/daily-review-2026-07-16.json#lane=google-ads--kimberly-james-bridal`
