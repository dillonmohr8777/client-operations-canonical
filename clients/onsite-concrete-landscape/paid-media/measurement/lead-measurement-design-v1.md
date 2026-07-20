# Onsite lead and qualified-estimate measurement design

Prepared: 2026-07-16  
Status: local redacted design; no live implementation authorized  
Scope: Onsite Google Ads contact, lead, estimate, and booked-work measurement

## Outcome

Use one stable, privacy-safe `canonical_lead_key` to join every form, call, analytics event, CRM record, and disposition for the same prospect. Use a separate `opportunity_key` when one prospect has more than one genuine project. Count a `qualified_estimate` once per opportunity only after downstream qualification evidence exists.

The measurement funnel is:

`contact action -> canonical lead -> service-fit opportunity -> qualified estimate -> booked work`

`contact_form`, `phone_call`, and `estimate_start` remain secondary observations. They do not become the primary optimization outcome merely because a browser or ad platform recorded them.

## Canonical key contract

### Key roles

| Key | Format | Purpose | Count rule |
| --- | --- | --- | --- |
| `source_event_key` | `onsite:event:v1:<opaque-hash>` | Idempotency key for one raw event. Prevents refreshes, retries, webhook replays, and repeated imports from creating extra events. | Never a business conversion by itself. |
| `identity_alias_hash` | `onsite:alias:v1:<opaque-hash>` | Client-scoped HMAC of a normalized contact identifier. Raw contact data never enters reconciliation artifacts. | Used only to find or merge a canonical lead. |
| `canonical_lead_key` | `onsite:lead:v1:<opaque-id>` | Stable join key for one prospect across form, call, analytics, CRM, and disposition systems. | One unique lead regardless of event count. |
| `opportunity_key` | `onsite:opportunity:v1:<opaque-id>` | Stable key for one distinct service or project inquiry under a lead. | One qualified-estimate outcome at most per opportunity. |
| `conversion_transaction_key` | `onsite:qualified-estimate:v1:<opportunity-id>` | Idempotent transaction key for a verified downstream `qualified_estimate`. | Retries upsert; they never create another conversion. |

### Key creation and matching

1. Generate a unique `source_event_key` for every received form event, call event, analytics event, CRM update, and offline outcome.
2. Normalize contact identifiers only inside the authorized system, then compute client-scoped HMAC aliases. Store only the resulting hashes in the reconciliation layer.
3. If any alias already maps to a `canonical_lead_key`, reuse that key. If no alias matches, create a new opaque lead key and bind the available aliases.
4. A form and call that belong to the same prospect reuse one lead key. Matching must use a verified alias or an authorized deterministic system link, never timestamp alone.
5. Create an `opportunity_key` for the actual service or project inquiry. A second legitimate project may reuse the lead key but must receive a different opportunity key.
6. Preserve the lead and opportunity keys through analytics, the lead destination, qualification, estimate disposition, and any authorized offline import.
7. Generate the primary conversion transaction key from the opportunity key only after the outcome is verified as `qualified_estimate`.

### Cross-system map

| System stage | Required source reference | Canonical fields written | Join behavior | Primary conversion eligible |
| --- | --- | --- | --- | --- |
| Web form | Opaque form event reference | `source_event_key`, alias hashes, `canonical_lead_key`, `opportunity_key`, campaign and source references | Upsert event; attach to matching lead or create lead | No |
| Phone path | Opaque call event reference | `source_event_key`, caller alias hash when authorized, `canonical_lead_key`, `opportunity_key`, call stage | A click, dial, and connected call remain separate event stages under one call reference | No |
| Analytics | Opaque analytics event reference | `source_event_key`, lead and opportunity keys when available, campaign and landing references | Observe the same contact action; do not create a new lead when a source event is already bound | No |
| Lead destination or CRM | Opaque record reference | `canonical_lead_key`, `opportunity_key`, owner role, qualification and disposition fields | Canonical downstream source for service fit and outcome | Only after verified qualification |
| Estimate workflow | Opaque estimate reference | `opportunity_key`, estimate status, service intent, qualification evidence | One opportunity may progress through multiple statuses without new lead creation | Yes, once at `qualified_estimate` |
| Offline conversion import | Opaque transaction reference | `conversion_transaction_key`, click/source reference hash, outcome time | Idempotent upsert by transaction key | Yes, once |

## Contact classification

### Forms

| `form_stage` | Meaning | Unique lead allowed | Qualified estimate allowed |
| --- | --- | --- | --- |
| `viewed` | Form was displayed. | No | No |
| `started` | A visitor interacted with fields. | No | No |
| `submitted` | The browser attempted submission. | Not until receipt is verified | No |
| `success_confirmed` | The server or destination confirmed one accepted submission. | Yes, subject to deduplication | No |
| `downstream_received` | The accepted form is present in the lead destination. | Yes, subject to deduplication | No |
| `test` | Authorized QA event. | No | No |
| `duplicate` | Event repeats an existing inquiry or source event. | No new lead | No |
| `failed` | Submission did not reach the destination. | No | No |

### Calls

| `call_stage` | Meaning | Unique lead allowed | Qualified estimate allowed |
| --- | --- | --- | --- |
| `phone_click` | Visitor clicked a phone control. | No | No |
| `dial_attempt` | A call attempt occurred. | No | No |
| `unconnected` | No two-way connection was established. | No | No |
| `connected` | A two-way connection occurred. | Yes, subject to deduplication | No |
| `duration_qualified` | Call met the approved duration threshold. | Yes, subject to deduplication | No; duration is not service qualification |
| `service_qualified` | The connected caller fits service and market requirements and is seeking an estimate. | Yes | Yes, once the downstream estimate outcome is verified |
| `unqualified` | Connected but not a valid estimate opportunity. | Yes as a contact; zero qualified outcomes | No |
| `test` | Authorized QA call. | No | No |
| `duplicate` | Same call or inquiry already exists under the lead and opportunity. | No new lead | No |

### Qualification rule

A record is a `qualified_estimate` only when all of the following are true:

- one canonical lead and one opportunity have been established;
- the inquiry is a genuine Onsite concrete or landscaping service request in the accepted service area;
- the contact is connected or the accepted form reached the downstream owner;
- estimate intent is confirmed and an estimate status is recorded;
- the record is not a test, duplicate, spam, vendor, employment, wrong-company, or otherwise excluded interaction;
- the same `conversion_transaction_key` has not already been counted.

## Deduplication decisions

- Event replay: same `source_event_key` means update the existing event.
- Form refresh: no new source event after the accepted success state.
- Repeat form for the same project: separate event, same lead and opportunity, no additional qualified estimate.
- Form followed by call for the same project: separate events, same lead and opportunity.
- Call click followed by connected call: one call journey; only the connected stage can create a lead candidate.
- One prospect with two verified projects: same lead key, two opportunity keys, each independently eligible for one qualified estimate.
- Offline-import retry: same transaction key means upsert, not increment.

## QA checklist

| Case | Procedure | Expected secondary observations | Expected unique leads | Expected primary outcomes |
| --- | --- | ---: | ---: | ---: |
| One valid form | Submit once and verify accepted receipt plus downstream record. | 1 form | 1 | 0 until qualified; then exactly 1 |
| One qualified call | Click, connect, verify service fit, and record estimate disposition. | 1 call journey | 1 | 0 until qualified; then exactly 1 |
| Repeat form | Submit the same project again with a new event reference. | 2 form events | 1 | At most 1 |
| Refresh after form success | Refresh the confirmation state. | No new accepted form | 1 | No change |
| Test form | Submit with the approved test marker. | 1 excluded test event | 0 | 0 |
| Unconnected call | Click and dial without a two-way connection. | 1 call journey | 0 | 0 |
| Connected unqualified call | Connect, then record an allowed exclusion reason. | 1 call journey | 1 contact | 0 |
| Form then call | Complete both paths for one project and verify alias matching. | 2 source events | 1 | At most 1 |
| Two genuine projects | Create two distinct service or project inquiries under one known prospect. | At least 2 source events | 1 | At most 2, one per opportunity |
| Offline retry | Import the same verified estimate transaction twice. | 2 delivery attempts | No change | Exactly 1 |

### QA evidence required for every case

- Source event and transaction references are opaque and non-identifying.
- The form or call stage is visible separately from qualification.
- The same lead key is present in the authorized downstream record.
- The opportunity key changes only for a genuinely separate project.
- Test and exclusion flags are carried to reporting and imports.
- Repeating the event or import does not increase unique or qualified counts.
- The Google Ads count, local reconciliation count, and downstream count agree for the same reporting window.

## Acceptance criteria

- The two currently observed web conversions can each be bound to one event row and one downstream disposition, or explicitly marked `missing_source`.
- The separate historical two forms and six calls remain a different reporting window and are not blended into the current live readback.
- Unique leads equal distinct `canonical_lead_key` values after exclusions.
- Qualified estimates equal distinct qualified `opportunity_key` values after exclusions.
- A platform, tag, form, call, CRM, import, bidding, budget, or campaign edit remains separately approval gated.

## Evidence

- `clients/onsite-concrete-landscape/paid-media/blueprints/google_ads.json`
- `clients/onsite-concrete-landscape/paid-media/correction-packet-2026-07-16-conversion-deduplication.md`
- `clients/onsite-concrete-landscape/context/operating-context.md`
- `state/paid-media/daily-readback-2026-07-16.json#lane=google-ads--onsite-concrete-landscape`

