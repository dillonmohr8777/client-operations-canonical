# KJB Google Ads course adapter

Status: active local operating guidance
Client: `kimberly-james-bridal`
Shared source: `../../../docs/GOOGLE_ADS_BOOTCAMP_KNOWLEDGE_BASE.md`

## Business outcome

Apply the course to generate real bridal appointment requests and qualified bridal conversations. Clicks, page views, schedule starts, phone clicks, forms, and routing tests are diagnostic signals and must not be reported as appointments or bookings.

## Campaign structure

- Keep local bridal-shopping intent, appointment intent, designer or gown intent, and exclusions aligned to the approved KJB market and landing path.
- Preserve the verified Search controls and negative-keyword safeguards in `search-draft-controls-2026-07-22.md` unless newer live evidence and authority support a change.
- Treat Performance Max and Search status as live facts that must be re-read. The July 24 control record is historical evidence, not a permanent serving-state claim.
- Never route work to a cancelled or duplicate KJB account. Confirm the exact production account before analysis.

## Measurement contract

- Proposed primary outcome: scheduler-confirmed `appointment_request` after a successful production record commit.
- Secondary diagnostics: `schedule_start`, `form_submit`, and `phone_click`.
- Downstream quality outcomes: `qualified_conversation` and `booked_appointment`.
- Required campaign-source convention: `kjb_google_{intent}_{campaign_type}`.
- Preserve source and click identifiers through the appointment handoff. Deduplicate with the scheduler-issued appointment-request identifier and exclude QA or routing tests from every production total.

## Course adaptations

- Business intake must confirm the approved market, appointment capacity, bridal inventory and designer claims, size-inclusive language, offer, appointment page, and scheduler path before keyword or budget planning.
- Unit economics should use verified appointment requests, qualified conversations, booked appointments, and downstream value when available.
- Search-term and negative-keyword review must preserve valid bridal-shopping intent and avoid broad exclusions for core terms, appointment intent, size, alterations, or designer names without evidence.
- Ads and pages must mirror real bridal-shopping intent and use only approved inventory, designer, pricing, availability, and appointment claims.
- Do not optimize bidding toward appointments until real appointment rows flow once through the scheduler, downstream record, and Google conversion path without duplication.

## Approval boundary

Local research, audits, drafts, QA plans, and paused proposals are allowed. Live Google Ads, Squarespace, scheduler, tag, analytics, CRM, budget, bidding, campaign-state, conversion, or import changes remain governed by `launch-authority.json` and current explicit approval.
