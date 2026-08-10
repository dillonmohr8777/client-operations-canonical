# Phase 3 state and event contract for backend implementation

This contract translates the approved review behavior into persistence requirements. Field names are recommendations for Obaid to adapt to the production schema. The event semantics and invariants are the required behavior.

## Core records

### Client relationship

- `client_id`
- `master_started_at`
- `master_stopped_at`, nullable
- `lifecycle_status`: `active` or `inactive`
- `terminal_outcome`, nullable; working review values are `successful` and `non_successful`
- `terminal_outcome_recorded_at`, nullable
- `terminal_outcome_recorded_by`, nullable

The master relationship clock begins once and must not reset when a new claim cycle starts. Relationship duration is derived from `master_started_at` to `master_stopped_at` or the current time.

### Claim cycle

- `claim_cycle_id`
- `client_id`
- `cycle_number`
- `started_at`
- `closed_at`, nullable
- `current_stage_number`
- `decision_outcome`, nullable
- `decision_letter_file_id`, nullable
- `previous_claim_cycle_id`, nullable for linked restarts

An unfavorable Stage 7 decision closes the current cycle and creates a linked cycle at Stage 2. It does not reset `master_started_at`.

### Stage event

- `stage_event_id`
- `client_id`
- `claim_cycle_id`
- `stage_number`
- `event_key`
- `occurred_at`
- `recorded_at`
- `recorded_by`
- `source`
- `metadata`
- `idempotency_key`

Stage changes must be derived from recorded events and validated transitions. Time in a stage creates alerts; it never advances a stage.

## Stage gates

1. Onboarding, CLIENT: open when the contract is sent; close only after `contract_signed` and `deposit_received` are both recorded. These remain independent events.
2. Records intake, FIRM: open when Stage 1 closes or a linked claim cycle restarts; record `welcome_email_sent` and `records_status` as `none`, `incomplete`, or `complete`; close only with the authorized complete-records event.
3. Strategy development, FIRM: close when `strategy_plan_sent_to_client` is recorded.
4. Client task completion, CLIENT: separately record `client_tasks_completed` and `filing_appointment_booked`; close only after both. Generate day 15, 30, 45, and 60 alert events with idempotent deduplication and visible alert history.
5. Claim filing and VA scheduling, VA: informational; close only from the defined external filing or scheduling event. Suppress ordinary client-action reminders while VA owns the stage.
6. Pre-exam briefings, FIRM: record each briefing and the final briefing; capture `last_va_exam_at`. The team must approve the exact Stage 6-to-7 exit event.
7. VA adjudication, VA: record `decision_reported` and `decision_letter_uploaded`. Suppress ordinary client-action reminders. A favorable decision may proceed to Stop the Clock; an unfavorable decision starts a linked cycle at Stage 2 while the master clock continues.

## Stop the Clock

Stop the Clock is an explicit command, never a derived timeout.

1. Require confirmation and an outcome.
2. Validate role authority.
3. Write the terminal outcome and actor.
4. Set `master_stopped_at` once.
5. Move the client out of active work without deleting stage or cycle history.
6. Preserve total relationship duration and all event history.
7. Make the inactive record queryable by outcome and accessible only to approved roles.

## Alerts and notifications

- Store every alert instance with rule, due threshold, owner, target, created time, sent time, status, and deduplication key.
- Do not emit CLIENT-action reminders for VA-owned stages.
- Do not re-send a Stage 4 threshold that is already recorded for the same client, cycle, and threshold.
- Keep an operator-visible history of day 15, 30, 45, and 60 alerts and escalations.
- Treat VA-owned stage pacing as informational unless a separately approved escalation rule exists.

## Required safeguards

- Server-side transition validation, not UI-only gating.
- Transactional event write plus stage-state update.
- Idempotent commands and alert creation.
- Actor and timestamp audit trail.
- Role-based authorization for event recording and clock stopping.
- File security, retention, and compliance approval before real claimant documents are introduced.
- Calendar and Meet integrations must store exact timestamps and IANA time zones; never persist a manual hour-offset conversion as the source of truth.

## Product decisions needed before production completion

- Final terminal-outcome terminology.
- Exact inactive-list location and access model.
- Exact Stage 6-to-7 exit event.
- Authority for partial-record completion.
- Lapsed-prospect behavior.
- Appeal relationship to claim cycles.
- Claimant-file compliance policy.

