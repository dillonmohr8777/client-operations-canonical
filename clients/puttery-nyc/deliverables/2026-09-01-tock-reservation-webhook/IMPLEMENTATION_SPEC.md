# Puttery NYC Tock Measurement Implementation Specification

## Outcome

Deliver a Puttery NYC prepaid-booking measurement MVP that reconciles eligible Tock booking and payment outcomes, sends validated signals to Meta and Google under each platform's rules, and reports exact, platform-attributed, and unmatched value separately.

## Non-goals for Phase 1

- Toast walk-in attribution
- Rory's Rooftop, Easy Tiger, High Line Comedy, Rojo Room, Tripleseat, Eventbrite, or other Puttery locations
- Guaranteed click-to-booking matching
- Causal incrementality or full multi-touch attribution
- Automatic targeting from Tock guest data
- Making a new Google conversion primary before burn-in passes
- Production hosting before the exact host, source repository, account, and rollback route are approved

## Architecture decision order

### 1. Bind the exact account

Laura Benedetto at Resy API Integrations confirmed the following on August 28, 2026:

- Puttery NYC is eligible for the Data Exports API and Reservation Webhook.
- Tom's email is sufficient to request and gain access.
- Reservation fields cover the requested identity, lifecycle, monetary, payment, refund, and checkout data.
- Click and campaign metadata is provided through reservation `KeyValue` entries.
- GA4 can be enabled from Tock's integration directory.

The exact webhook binding is now confirmed:

- Puttery New York `business.id`: `37824`
- Business Group ID: `28086`
- Webhook scope: the full business group
- Authoritative downstream venue filter: `business.id`
- Protected role-credential locator: `wincred://Codex.ClientAccess.PutteryNYC.TockRoleAccount`

The current role credential arrived through ordinary email. It is protected locally, but production use requires revocation and replacement through an approved secure route. A read-only exact-scope request returned HTTP `503`, so Data Exports access is not considered validated.

Still require Tock-written, account-screen, or controlled-event evidence for:

- Whether Tock exposes a separate NYC location identifier in any relevant export
- Rotated credential and Data Exports provisioning confirmation
- Native GA4 event behavior under a controlled paid booking
- Native Facebook Pixel entitlement and behavior

Reject national, all-location, or similarly named records unless the NYC identifier is explicitly isolated.

### 2. Prove native paths before custom pipelines

#### Google

Preferred path:

1. Tock emits a paid Purchase event into the correct Puttery GA4 stream.
2. Cross-domain behavior preserves the intended user or click context from Puttery to ExploreTock.
3. The event contains a unique transaction ID, dynamic value, and USD currency.
4. The validated key event is imported once into the exact Google Ads account.
5. The conversion remains secondary during validation.

Fallback path:

- Use a Tock server feed with Google Ads Data Manager only when the native event cannot meet the contract.
- Do not upload the same purchase through native GA4 and Data Manager without a shared transaction ID and verified deduplication.

#### Meta

Decision order:

1. Inspect Tock's native Facebook Pixel event on a controlled booking.
2. Determine whether it emits Purchase, value, currency, and a stable event ID.
3. Determine whether Meta click and browser signals survive the Puttery-to-ExploreTock transition.
4. Add Conversions API only when a defensible event source, permitted match signals, stable event ID, and browser/server deduplication design exist.
5. Keep production delivery off until Test Events and Diagnostics pass.

Event acceptance is not attribution. Match rate is observed, not guaranteed.

## Source event model

The source may represent more than one reservation in a single checkout. Do not assume `reservationId == transactionId`.

The current receiver is intentionally a privacy-safe ingestion state, not the finished normalized conversion ledger. It may accept and order reservation updates before transaction grain, approved value, event type, and ad-platform eligibility are known. Promotion into the normalized schema occurs only after those gates are resolved.

Tock's published Reservation model exposes `business.id` as the venue-scoping identifier but does not document a second immutable `locationId` field in the webhook object. The receiver binds `business.id = 37824` as the NYC allowlist. Populate the normalized `locationId` only if Tock supplies a separate authoritative identifier.

Required source identities:

- Business ID
- Location ID
- Reservation ID
- Checkout, order, or payment transaction ID when available
- Sequence or update identity
- Confirmation code when available
- Created, updated, service, payment, cancellation, refund, and party-state timestamps

## Conversion event definitions

| Event | Meaning | Initial ad-platform treatment |
|---|---|---|
| `booking_created` | Reservation record created | Analytics only |
| `payment_captured` | Approved amount was charged for an eligible checkout | Candidate Purchase event after validation |
| `booking_updated` | Reservation details changed | Ledger update only |
| `booking_cancelled` | Booking cancelled | Ledger state; value effect depends on refund |
| `refund_partial` | Some captured value was returned | Ledger adjustment; platform treatment must be verified |
| `refund_full` | All captured value was returned | Ledger adjustment; Google retraction path may apply |
| `visit_arrived` | Venue marked guest arrived | Operational analytics only until reliable |
| `visit_completed` | Approved party-state rule indicates completed visit | Separate later event, not a synonym for payment |
| `no_show` | Venue marked no-show | Does not automatically reverse prepaid revenue |

## Value definition gate

Puttery must approve exactly one advertising value basis:

- Full guest charge
- Net amount paid
- Subtotal excluding tax and gratuity
- Another finance-approved field with a written definition

Store all source monetary fields in integer cents. Never calculate production value from formatted strings or floating-point currency. Count only refunds with Tock status `COMPLETE` as completed refunded value. Keep `DEFERRED`, `ERROR`, and unknown refund value separate.

For a checkout with multiple reservations, count the checkout once at transaction value unless Tock supplies an authoritative allocation rule.

## Idempotency and updates

Tock confirms at-least-once, eventually ordered delivery. `reservation.id` is stable through edits, reschedules, and cancellations, and `versionId` defines update order. Treat Tock uint64 identifiers as validated decimal strings, not JavaScript or SQLite numbers. Use `business.id + reservation.id + versionId` as the source-delivery key. The receiver must:

- Accept retries without producing another purchase
- Reject or quarantine missing NYC scope
- Ignore stale sequence updates
- Update the existing ledger record for cancellation, refund, transfer, and status changes
- Preserve a canonical payload hash and safe source locator without storing the raw payload in the reporting model
- Support replay from a protected event store or Tock-approved backfill route

An update with a lower `versionId` than the stored state is stale and can be discarded. The same version and same canonical payload hash is a duplicate. The same version with a different hash is a conflict and must be written to a dedicated safe quarantine record without replacing accepted state. A guest transfer is represented as cancellation of the original reservation plus a new reservation.

## Delivery and recovery

- Tock sends updates immediately and retries a failure or timeout up to three times in immediate succession.
- The webhook delivers all businesses in the business group. A non-NYC business is an expected filtered outcome, not a receiver error.
- Production must require a static authorization header even though Tock permits an unauthenticated endpoint. The secret value stays in an approved secret manager and is not sent in ordinary email, Slack, logs, or source control.
- Daily exports are the recovery and reconciliation source. They are exposed through seven-day signed URLs, split into files of up to 5,000 records, and refreshed at approximately 1:30 AM and 1:30 PM Central.
- The export request uses `X-Tock-Authorization`, `User-Agent`, and `X-Tock-Scope` with the exact business and group identifiers.

## Privacy boundary

- Do not store raw email, phone, name, address, payment data, or full guest objects in the reporting ledger.
- Tock email-marketing opt-in is not advertising-measurement consent.
- Capture only the consent state and presence of permitted match signals in the general ledger.
- Keep any approved hashed identifiers in a restricted delivery component with a documented retention period.
- Suppress ad-platform uploads when consent or permitted purpose is absent.
- Never place secrets in source control, logs, email, dashboard data, or this package.

## Required monitoring

- Event received and processed counts
- Invalid or non-NYC events
- Duplicate suppression count
- Stale update count
- Processing lag
- Meta accepted and rejected test events
- Google import diagnostics
- Source-to-ledger count and cent variance
- Match coverage and unmatched value
- Last successful event and last failure

## Completion gate

The MVP is complete only when:

1. Exact account binding is documented.
2. A controlled booking traces from marketing entry to Tock payment and the selected platform test path.
3. Every required acceptance case has a recorded pass, supported exception, or explicit out-of-scope decision.
4. Booking counts and approved value reconcile to the agreed source window.
5. No duplicate purchase occurs under replay, reload, or dual browser/server delivery.
6. NYC-only isolation is proven.
7. The dashboard contains live verified fields and visibly labels any remaining modeled data.
8. The runbook, monitoring, rollback, ownership, and known limitations are delivered.
