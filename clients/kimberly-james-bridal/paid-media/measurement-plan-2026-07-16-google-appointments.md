# Kimberly James Bridal Google appointment measurement plan

Prepared: 2026-07-16
Status: local, redacted, and ready for verification; no live change authorized
Work item: `wi-20260716-0005`
Platform lane: Google Ads only

## Outcome

Use one real scheduler-confirmed `appointment_request` as the proposed primary Google conversion. Keep `schedule_start`, `form_submit`, and `phone_click` secondary so they explain funnel behavior without being treated as appointments. Reconcile Google Ads to the same date window in the downstream records before making any optimization recommendation.

The exact scheduler product, current event implementation, Google conversion-action settings, and downstream record route are not established by the redacted repository evidence. This plan therefore defines the required logical records and acceptance criteria without inventing a vendor or claiming the current setup passes.

## Current verified baseline

- The primary KJB Google account was live-verified and the cancelled duplicate remained excluded.
- The enabled Performance Max campaign was observed at $20 per day.
- The June 16 through July 15, 2026 Google Ads window showed 1,154 clicks, 54,814 impressions, $585.42 cost, and zero reported conversions.
- The current conversion-action table, campaign goal selection, scheduler event stream, and downstream appointment counts have not yet been read back.
- Historical communication supports end-to-end appointment and source-field verification but does not authorize a live change.
- The client launch authority is draft-only. Local artifacts are allowed; provider, website, scheduler, tag, CRM, and campaign mutations are not.

## Event map

Each event has exactly one logical system of record. During implementation, the exact current product and route must be mapped to that record class before any test is run.

| Event | Funnel meaning | Trigger | Single system of record | Google role | Dedupe key | Test exclusion |
| --- | --- | --- | --- | --- | --- | --- |
| `ad_click` | Paid visit begins | Google sends a paid click to the approved KJB destination | Google Ads click log | Diagnostic only | Opaque click identifier under provider control | Exclude internal and controlled QA traffic from downstream outcome reporting |
| `schedule_start` | Visitor opens or begins the scheduler | First intentional scheduler-open action in a journey | Analytics event log | Secondary | `journey_id + schedule_start` | Require `is_test = false`; controlled QA run IDs never enter outcome totals |
| `form_submit` | Lead form transport accepts a submission | One successful form-receipt response | Form receipt log | Secondary | `submission_id` | Exclude records carrying a QA run ID, test flag, or non-production environment marker |
| `phone_click` | Visitor selects the phone action | One intentional phone-link click | Analytics event log | Secondary | `journey_id + phone_click + click_sequence` | Exclude controlled QA journeys and never infer a conversation or appointment from a click |
| `appointment_request` | Scheduler accepts a new appointment request | Scheduler confirms a new record was committed successfully | Scheduler appointment-request ledger | Proposed primary | `appointment_request_id` | Require production record, `is_test = false`, and a first successful commit; refreshes and transport retries cannot create a second conversion |
| `qualified_conversation` | Human confirms a real bridal-shopping conversation | Lead owner records a qualifying disposition | Client lead-disposition ledger | Downstream quality signal only | `lead_id` | Exclude tests, spam, duplicates, wrong-service inquiries, and records without a real disposition |
| `booked_appointment` | A valid appointment is booked | Appointment ledger reaches booked status | Appointment ledger | Downstream quality signal only | `appointment_id` | A reschedule or status update retains the same appointment ID and is not a new acquisition conversion |

### Required event fields

Every transported event must use opaque operational identifiers and avoid raw prospect data in analytics or local evidence:

- `schema_version`
- `event_name`
- `event_id`
- `occurred_at_utc`
- `journey_id`
- `dedupe_key`
- `is_test`
- `environment`
- `source_platform`
- `source_account_ref`
- `campaign_ref`
- `campaign_type`
- `intent`
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `click_id_present`
- `consent_state`
- the applicable opaque `submission_id`, `appointment_request_id`, `lead_id`, or `appointment_id`
- `record_status`

The required KJB campaign source convention is `kjb_google_{intent}_{campaign_type}`. The live readback must confirm how that convention maps to the actual `utm_campaign` value and which click identifier fields are available.

## Scheduler handoff checklist

### 1. Route and before-state

- [ ] Reconfirm the primary KJB Google account and record the opaque account reference.
- [ ] Confirm the cancelled duplicate is not selected.
- [ ] Capture the campaign final URL, redirect chain, goal selection, current conversion-action table, and current tag diagnostics without editing them.
- [ ] Identify the exact production landing page, scheduler host, form transport, analytics property, and downstream appointment ledger.
- [ ] Assign one owner role to each logical system of record: Ads owner, site owner, scheduler owner, analytics owner, and lead-disposition owner.

### 2. Landing page to scheduler

- [ ] Start with a new opaque `journey_id` and preserve it through the handoff.
- [ ] Preserve `utm_source`, `utm_medium`, `utm_campaign`, optional content and term fields, and the presence of an eligible Google click identifier through every redirect.
- [ ] Confirm the scheduler receives source fields before any prospect completes the form.
- [ ] Confirm mobile and desktop use the same field contract and success definition.
- [ ] Do not place raw prospect data in analytics events, URLs, local QA evidence, or the reconciliation files.

### 3. Successful appointment request

- [ ] Fire `appointment_request` only after the scheduler has committed a new production record.
- [ ] Use the scheduler-issued `appointment_request_id` as the acquisition dedupe key.
- [ ] Generate one immutable `event_id` for that successful commit and reuse it for retries.
- [ ] Mark refreshes, page revisits, webhook retries, and duplicate submits as the same record rather than new conversions.
- [ ] Preserve the original source fields on later status changes.

### 4. Downstream handoff

- [ ] Confirm the appointment-request record is visible in the scheduler ledger.
- [ ] Confirm exactly one matching record reaches the appointment or lead-disposition ledger.
- [ ] Retain one opaque join key across scheduler, transport, and downstream disposition.
- [ ] Record `qualified_conversation`, `booked_appointment`, `cancelled`, `spam`, `duplicate`, or `unresolved` as a disposition without rewriting the acquisition source.
- [ ] Treat reschedules and status updates as changes to the original appointment, not new acquisitions.

### 5. Failure and retry behavior

- [ ] A scheduler validation error produces no `appointment_request` event.
- [ ] A transport retry reuses the original event and dedupe IDs.
- [ ] A partial form with no scheduler commit produces no primary conversion.
- [ ] Missing source fields are quarantined as unattributed pending review; they are not force-attributed to Google.
- [ ] Test traffic remains visibly test traffic at every system boundary.

## Test exclusion and deduplication QA

The executable case definitions are in `measurement-qa-cases-2026-07-16.json`. Passing requires all of the following:

1. One controlled production appointment request creates one scheduler record, one downstream record, and exactly one primary conversion candidate.
2. Confirmation-page refresh, browser back, duplicate submit, and webhook retry do not increase the primary count.
3. `schedule_start`, `form_submit`, and `phone_click` remain secondary and never create a primary appointment conversion by themselves.
4. Every controlled test carries both an opaque QA run ID and `is_test = true`; it contributes zero leads, appointments, bookings, and primary conversions.
5. A reschedule, cancellation, or disposition update retains its original appointment ID and does not create a new acquisition.
6. Every eligible primary row has one unique `appointment_request_id`; every duplicate points to that canonical row.
7. Records with missing source or missing dedupe keys remain unresolved and are not silently credited.

## Same-window reconciliation contract

Use the two templates together:

- `same-window-reconciliation-template-2026-07-16.csv` is the event-level summary.
- `same-window-appointment-crosswalk-template-2026-07-16.csv` is the opaque record-level proof for appointment requests and downstream outcomes.

### Procedure

1. Freeze one America/New_York window with inclusive start and end times. The templates begin with the current live comparison window, June 16 through July 15, 2026.
2. Capture each source after its normal reporting latency and record the source snapshot time.
3. Count unique real records after removing tests and duplicates.
4. Join only on opaque event, request, lead, appointment, journey, or click-reference hashes. Do not place names, emails, phone numbers, or raw communications in the files.
5. Classify each difference as `timing`, `test`, `duplicate`, `missing_source`, `missing_transport`, `import_latency`, `attribution_window`, `consent_or_blocking`, `status_change`, `non_google`, or `unknown`.
6. A difference is explained only when it has an evidence reference and owner role. Unknown differences remain open.

### Required equations

- `eligible_primary = scheduler_unique - tests_excluded - duplicates_excluded`
- `google_primary_gap = google_primary - eligible_primary`
- `downstream_gap = scheduler_unique - disposition_ledger_unique`
- `capture_rate = google_primary / eligible_primary` only when `eligible_primary > 0`

Do not calculate appointment economics or recommend campaign optimization until the primary gap is explained and the downstream disposition is current.

## Approval and rollback boundary

### Allowed now

- Read-only account, page, scheduler, analytics, and downstream-record inspection.
- Local redacted copies of before-state fields and reconciliation outputs.
- Controlled test design and a paused proposed change set.

### Explicit approval required

- Creating, changing, importing, selecting, or reclassifying a Google conversion action.
- Changing campaign goals, attribution, count settings, bidding, budget, targeting, URLs, assets, or campaign state.
- Editing or deploying the site, scheduler, analytics, tag manager, CRM, webhook, or automation configuration.
- Submitting a real prospect record, importing customer data, sending a client message, or requesting client-side action.

### Before any approved live change

- Export or screenshot the exact current conversion-action, campaign-goal, tag, page, scheduler, webhook, and downstream-routing state.
- Record the approved account, action, owner, window, and rollback authority.
- Validate the proposed change without mutation when the provider supports it.
- Change one layer at a time and keep campaign spend and state unchanged unless separately approved.

### Rollback triggers

- A test is counted as a primary conversion.
- One appointment request creates more than one primary event.
- A scheduler commit succeeds but no matching downstream record appears after the normal transport window.
- Source fields disappear across the scheduler handoff.
- The appointment path fails, reporting regresses, or an unapproved campaign or bidding change appears.

### Rollback action

Restore the captured prior goal, tag, page, scheduler, or transport configuration for the changed layer; disable the newly introduced event or import without deleting historical evidence; preserve the failure record; verify the prior path; and leave all campaign, bidding, budget, and state changes untouched unless they were separately approved. Completion requires a fresh readback and a documented same-window reconciliation.

## Evidence

- `state/paid-media/daily-readback-2026-07-16.json#lane=google-ads--kimberly-james-bridal`
- `clients/kimberly-james-bridal/paid-media/correction-packet-2026-07-16-google-conversion-tracking.md`
- `clients/kimberly-james-bridal/paid-media/blueprints/google_ads.json`
- `clients/kimberly-james-bridal/paid-media/launch-config.json`
- `clients/kimberly-james-bridal/paid-media/launch-authority.json`
- `clients/kimberly-james-bridal/context/operating-context.md`

