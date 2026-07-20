# Fagan Meta closed-loop lead correction packet

Prepared: 2026-07-16
Status: local redacted draft; live correction not authorized
Lane: Meta Ads only

## Decision

Keep campaign publishing and scaling blocked until each legitimate inquiry has a canonical record, one human owner, a disposition, and deduplicated source evidence. Routing repair and email delivery are necessary but do not prove follow-up or business outcome.

## Verified facts

- Persistent Chrome verified the exact Fagan Meta account and six campaigns.
- The primary new campaign was in draft and another campaign was off. Neither state was changed.
- Meta lead access for Zapier was repaired on July 16. A fresh synthetic test lead reached the Zapier trigger and routing-code step successfully.
- That synthetic test did not exercise the Gmail alert because it did not contain a qualifying real-lead payload.
- One recovered qualified-lead alert was sent to the established five-recipient group, and Gmail readback confirmed the intended subject, recipients, and `SENT` state.
- The July 15 reconciliation found two unique website leads and one high-confidence duplicate notification. Direct notifications were visible in the source mailbox.
- Existing evidence still does not prove a named response owner, response-time expectation, contact attempt, disposition, matching CRM record, or valid deduplicated advertising conversion for each current lead.
- One reviewed lead was disqualified because the submitter said they were not the property owner. Another was potentially qualified, but identity and phone ownership were not verified.
- Browser and server lead events must share one event ID. Native Meta lead forms and website lead events are separate paths and must not be double counted.
- The launch authority is draft-only. It allows local artifacts but no deployment, provider mutation, publishing, enablement, or budget change.

## Hypotheses, not findings

- The repaired Meta-to-Zapier route may now work for real leads, but a qualifying production lead has not yet proved the entire trigger, routing, email, ownership, and disposition chain.
- The duplicate notification may come from the legacy parser or forwarding path rather than a second prospect.
- A website lead could be counted once in browser events, again in server events, and again in a downstream import if event IDs are not preserved.
- A delivered alert may still remain unowned or unanswered.

## Required readbacks

1. Reconfirm all six Meta campaign states and preserve the observed draft and off states.
2. For each current legitimate inquiry, retrieve a privacy-safe canonical lead key and record: received, accepted, assigned owner, first-contact time, contact result, qualification, estimate status, booked status, won or lost state, and reason.
3. Read the real Zapier run and downstream steps for each current lead, including whether the qualifying Gmail step ran.
4. Match each notification to one canonical website or native-form record and identify the duplicate-of relationship.
5. Read CRM or approved destination records for the same lead keys without copying prospect data into this repository.
6. Verify campaign, click, form, and event identifiers before applying Meta attribution. Preserve `unknown` where those identifiers are absent.
7. Verify browser and server event-ID equality and confirm a single Meta Lead result after deduplication.
8. Keep native instant-form leads separate from website-form leads through reporting and outcome reconciliation.
9. Read current creative, placement, frequency, budget pacing, and change history only after the closed-loop rows are available.

## Recommended local correction build

- Use the canonical state path `received -> accepted -> assigned -> contacted -> qualified or unqualified -> estimate booked -> won or lost`.
- Require one privacy-safe `leadKey`, one owner, one current state, one state timestamp, one source classification, and one duplicate-of field per inquiry.
- Apply the deduplication hierarchy already established in client context: submission or platform lead ID, shared event ID, then normalized contact fields only as a controlled fallback.
- Treat the direct attribution ledger as authoritative for future website leads; keep legacy parser alerts as notifications, not attribution truth.
- Add explicit source classes: `meta_native_form`, `website_meta_verified`, `website_other_verified`, and `unknown`. Never promote inference to verified Meta attribution.
- Define the proposed primary outcome as `qualified_estimate`; keep raw lead, form submit, and phone intent secondary until disposition exists.
- Prepare a local real-lead QA record that can prove one production submission, one Zapier route, one alert, one canonical lead, one owner, and one deduplicated event without storing prospect data.

## Success criteria

- Every legitimate current inquiry has one canonical row, one owner, and one current disposition.
- Each duplicate points to exactly one canonical lead and is excluded from lead and conversion totals.
- A real qualifying production lead passes Meta or website source, Zapier, alert, owner, disposition, and event-deduplication readback.
- Meta attribution is used only when campaign or click evidence survives the path.
- Draft and off campaign states remain unchanged until separately approved.

## Approval-gated live actions

Explicit current approval is required before any of the following:

- publishing or enabling a campaign, changing budget, targeting, placements, creative, optimization, or campaign state;
- changing Zapier, website, tag, event, CRM, mailbox, or alert routing configuration;
- writing lead dispositions into an external CRM or spreadsheet;
- contacting a prospect or sending another client or internal message.

## Evidence

- `clients/fagan-painting/paid-media/blueprints/meta_ads.json`
- `clients/fagan-painting/paid-media/launch-config.json`
- `clients/fagan-painting/paid-media/launch-authority.json`
- `clients/fagan-painting/context/operating-context.md`
- `clients/fagan-painting/evidence/2026-07-16-meta-lead-routing-verification.json`
- `clients/fagan-painting/evidence/2026-07-16-recovered-lead-delivery.json`
- `clients/fagan-painting/evidence/2026-07-16-lead-reconciliation.json`
- `state/paid-media/daily-review-2026-07-16.json#lane=meta-ads--fagan-painting`
