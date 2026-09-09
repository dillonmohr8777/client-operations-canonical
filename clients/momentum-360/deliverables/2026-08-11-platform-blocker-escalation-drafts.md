# Momentum 360 platform blocker escalation drafts

Date: 2026-08-11

These are prepared drafts only. They have not been sent or submitted.

## CallRail access request

Please grant `dillonmohr8777@gmail.com` access to the existing CallRail account `Momentum Digital LLC`, account ID `671942387`, or confirm the approved Bitwarden item for the direct Momentum CallRail login.

The current Google sign-in succeeds but opens the unrelated QC Kinetix account `906396198`. No QC Kinetix data or configuration was changed. Momentum reporting and configuration must fail closed until account `671942387` is visible.

Requested minimum access: account metadata, Activity/reporting, call-flow routing, and SMS configuration read access. Configuration writes should remain limited to separately requested changes.

## HubSpot support case

Subject: Customer Agent guideline publishing fails in portal 50612503

Portal: `50612503`

Customer Agent user ID: `89602231`

Impact: The live Customer Agent, CRM contact writes, Help Desk handoff, ticket/task creation, and alert workflow remain operational. A stricter handoff-specific guideline is autosaved but cannot be published. General drafts restored to their exact published text also cannot be promoted.

Reproduction:

1. Open Customer Agent guidelines.
2. Save a draft guideline.
3. Run validation and attempt Publish.
4. The validation request stalls and the promotion request fails.

Failing RPC: `bulkPromoteDraftGuidelines`

Observed response: HTTP 400, `INTERNAL_ERROR`, `An unexpected error occurred while generating goal determination subguideline`, `shouldRetry: false`.

The failure was reproduced with each general guideline ID individually, including drafts restored to the exact currently published content:

- `60816696`, GLOBAL / RESPONSE_STRUCTURE
- `60816697`, GLOBAL / RESPONSE_TEMPLATES
- `60816699`, GLOBAL / CUSTOM

Correlation IDs:

- `019ff1bb-d5e5-7359-97c7-7276c8e9f8f5`
- `019ff1bd-139e-7eba-8a40-c8b780e3d6bf`
- `019ff1bd-68c8-78c0-9766-1c03ed53a89a`

Requested resolution: repair or reset the goal-determination subguideline generation state for this agent so saved drafts can validate and publish. Please preserve the currently published live guidelines and existing agent configuration.
