# Omega qualified-opportunity reconciliation specification

Prepared: 2026-07-16  
Status: local redacted specification; no live implementation authorized  
Scope: bind the 13 currently observed Google Ads actions to unique landscaping or concrete opportunities

## Outcome

The accompanying ledger has exactly 13 unbound slots because the current readback reports 13 platform actions: eight calls from ads and five form submissions. The aggregate split is verified, but item-level event identities and outcomes are not available in current repository evidence. A slot becomes a reconciled row only after it is bound to a privacy-safe platform event reference and a downstream disposition from the same reporting window.

Do not calculate qualified cost per lead from the platform count alone. The observed platform CPA remains a platform metric until every row is bound, deduplicated, classified, and dispositioned.

## Privacy and identity contract

- Never put a name, raw contact value, raw message, full click identifier, or other direct identifier in this ledger.
- Hash or replace source identifiers with client-scoped opaque references before they enter the artifact.
- Use `canonicalLeadKey` to join forms, calls, analytics, and downstream records for one prospect.
- Use `opportunityKey` for one distinct landscaping or concrete project inquiry.
- Use `duplicateOfRowId` only when the same underlying prospect and project is represented more than once.
- A retry of the same imported outcome must retain one `conversionTransactionKey`.

## Exact required downstream fields

| Field | Required rule | Allowed values or evidence |
| --- | --- | --- |
| `rowId` | Required and unique. | Local slot `omega-action-01` through `omega-action-13`. |
| `rowIdentityState` | Required. | `unbound`, `bound`, `reconciled`, `missing_source`. |
| `expectedActionClass` | Required from verified aggregate. | `calls_from_ads` or `form_submission`. This is a quota slot, not item identity. |
| `platformEventKeyHash` | Required before `bound`. | Client-scoped opaque hash of the item-level platform event reference. |
| `platformActionName` | Required before `bound`. | Exact action label after it is reduced to safe non-identifying text. |
| `platformOccurredAt` | Required before `bound`. | Timestamp from the same platform reporting window. |
| `campaignRef` | Required. | Safe campaign reference; current expected route is the active Omega Performance Max lane. |
| `clickOrSourceRefHash` | Required when available. | Opaque hash of the source or click reference, never the raw identifier. |
| `canonicalLeadKey` | Required before unique-lead totals. | Stable privacy-safe key shared by form, call, analytics, and downstream records. |
| `opportunityKey` | Required before qualified totals. | Stable key for one genuine project inquiry. |
| `downstreamRecordRef` | Required before outcome claims. | Opaque CRM, lead-destination, or estimate-system record reference. |
| `serviceIntent` | Required before qualification. | `landscaping`, `concrete`, `mixed`, `other`, or `unknown`. |
| `contactType` | Required. | `call`, `form`, `offline_outcome`, or `unknown`. |
| `callStage` | Required for call rows. | `phone_click`, `dial_attempt`, `unconnected`, `connected`, `duration_qualified`, `disposition_imported`, or `unknown`; `not_applicable` for forms. |
| `formStage` | Required for form rows. | `submitted`, `success_confirmed`, `downstream_received`, `failed`, or `unknown`; `not_applicable` for calls. |
| `isUniqueLead` | Required before totals. | Boolean after alias matching and duplicate review. |
| `qualificationState` | Required before business-performance reporting. | `unreviewed`, `qualified`, `unqualified`, `duplicate`, `test`, or `missing_source`. |
| `disqualificationCategory` | Required for every non-qualified row. | `none`, `supplier`, `vendor`, `employment`, `wrong_company`, `spam`, `test`, `duplicate`, `unconnected`, `out_of_area`, `out_of_scope`, `other`, or `unknown`. |
| `estimateStatus` | Required after qualification review. | `not_started`, `requested`, `scheduled`, `completed`, `quoted`, `declined`, `lost`, `won`, or `unknown`. |
| `bookedStatus` | Required for a complete disposition. | `not_booked`, `booked`, `cancelled`, `completed`, or `unknown`. |
| `revenueState` | Required; a value is optional and authorization-sensitive. | `not_collected`, `not_applicable`, `verified`, or `unknown`. |
| `duplicateOfRowId` | Required when duplicate. | Another ledger row ID with the canonical instance. |
| `conversionTransactionKey` | Required for a qualified offline outcome. | Privacy-safe idempotency key derived from the opportunity, not a timestamp. |
| `exclusionApplied` | Required. | Boolean indicating whether the row is excluded from unique or qualified totals. |
| `dispositionObservedAt` | Required for a completed review. | Timestamp from the authorized downstream source. |
| `evidenceRef` | Required for a completed review. | Safe repository or opaque system locator supporting the disposition. |
| `reviewState` | Required. | `pending_source_binding`, `pending_downstream`, `complete`, or `exception`. |

## Classification rules

### Service intent

- `landscaping`: verified request for landscaping work.
- `concrete`: verified request for concrete work.
- `mixed`: one opportunity explicitly includes both service lines.
- `other`: valid business contact but outside the two paid-service groups.
- `unknown`: current evidence cannot classify the inquiry.

Never merge landscaping and concrete totals. A mixed request remains separately visible and may be assigned only after the actual project scope is known.

### Disqualification categories

- `supplier`: trying to sell or source materials rather than request work.
- `vendor`: offering a service to Omega rather than requesting an estimate.
- `employment`: job-seeking or recruiting contact.
- `wrong_company`: intended for a different business.
- `spam`: automated or clearly irrelevant solicitation.
- `test`: authorized QA event.
- `duplicate`: another row already represents the same lead and opportunity.
- `unconnected`: call did not establish a two-way connection.
- `out_of_area`: genuine service request outside the accepted service area.
- `out_of_scope`: genuine contact for an unsupported service.
- `other`: verified disqualification that fits none of the named classes; include a safe evidence note in the source system, not raw text here.
- `unknown`: disposition evidence is missing or inconclusive.

`supplier`, `vendor`, `employment`, `wrong_company`, `spam`, and `unknown` must remain separately reportable because they imply different intent and targeting corrections.

## Counting formulas

- Platform actions: count all 13 bound source rows; never present this as unique or qualified volume.
- Unique leads: distinct non-excluded `canonicalLeadKey` where `isUniqueLead` is true.
- Qualified opportunities: distinct non-excluded `opportunityKey` where `qualificationState` is `qualified`.
- Landscaping qualified opportunities: qualified distinct opportunities with `serviceIntent` equal to `landscaping`.
- Concrete qualified opportunities: qualified distinct opportunities with `serviceIntent` equal to `concrete`.
- Qualified cost per lead: same-window platform cost divided by qualified distinct opportunity count. If that count is zero or incomplete, report `pending`, not infinity or an estimate.
- Booked opportunities: distinct qualified opportunities with `bookedStatus` equal to `booked`, `completed`, or a verified won estimate state.

## Completion checks

1. All 13 slots are bound to distinct platform event hashes or marked `missing_source` with evidence.
2. Exactly eight bound rows are calls from ads and five are form submissions, matching the verified aggregate.
3. Every duplicate points to one canonical row; no duplicate contributes to unique or qualified totals.
4. Every row has a service-intent value and a completed or explicitly unknown disposition.
5. Landscaping, concrete, supplier, vendor, employment, wrong-company, spam, and unknown totals can be calculated independently.
6. Every qualified row has one opportunity key and one idempotent conversion transaction key.
7. Platform, unique, qualified, estimated, and booked counts are reported separately for the same window.
8. The seven observed paused Search campaigns remain unchanged.

## Approval boundary

This specification and ledger are local, reversible artifacts. Reading or changing Ads conversion settings, tags, imports, lead systems, targeting, negatives, search themes, bidding, budgets, campaigns, or client records remains separately approval gated.

## Evidence

- `clients/omega-landscaping/paid-media/blueprints/google_ads.json`
- `clients/omega-landscaping/paid-media/correction-packet-2026-07-16-qualified-lead-reconciliation.md`
- `clients/omega-landscaping/context/operating-context.md`
- `state/paid-media/daily-readback-2026-07-16.json#lane=google-ads--omega-landscaping`

