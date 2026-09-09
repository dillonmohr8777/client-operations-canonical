# Nexla live measurement validation handoff

Status: isolation correction required before controlled test; unpublished; no ad delivery or spend change.

## Staged unpublished objects

- Trigger: `Momentum - HubSpot Success - MCP Paid LP Form`
- Event: `hubspot-form-success`
- Required form GUID: `663d7e71-eb1c-4e1b-94fe-61cac6f16a90`
- Google Ads tag: `GAds Conversion - Form Submit`
- Google Ads conversion: `AW-10857703077 / lf1HCMiSo_4ZEKXNrbko`
- GA4 tag: `Momentum - GA4 - generate_lead - MCP Paid LP`
- GA4 event: `generate_lead`
- Landing page: `https://nexla.com/lp/mcp-servers/`

The staged Ads and GA4 tags currently share the exact-form trigger. Dana confirmed the form is reused outside the selected MCP landing page, so the trigger must also require `/lp/mcp-servers/`. The legacy generic Ads path must be restored for other campaigns and excluded only on the MCP page before the dedicated MCP tags are tested.

## Verified negative control

GTM Preview connected to the selected landing page and showed both conversion tags under Tags Not Fired on page load. The container, Google tags, consent tag, conversion linker, and landing-page support tag loaded normally. This proves the conversion tags are not page-view triggers.

## Controlled test data approved by Dillon

- First name: `GTM`
- Last name: `Test`
- Job title: `Measurement QA`
- Company: `Momentum 360 TEST`
- Work email: `dillonmohr8777+gtmtest@gmail.com`
- Phone: `202-555-0147`
- Goal or use case: `TEST — Momentum GTM validation — do not contact or qualify`

Submitting this form writes a record to Nexla's HubSpot and represents Momentum to a third party. Dillon approved this exact test payload on 2026-08-26. Do not submit until the GTM isolation correction above is saved and reverified.

## Success criteria after approval

1. HubSpot accepts the form and produces one success event for the exact form GUID.
2. The staged Google Ads conversion tag fires exactly once.
3. The staged GA4 `generate_lead` tag fires exactly once.
4. Neither tag fires on generic field interaction, validation errors, or page reload.
5. The test record is clearly identifiable as non-prospect test data and no real sales follow-up is requested.
6. GA4 DebugView and Google Ads diagnostics receive the expected event without duplicate conversion behavior.

## Remaining human-only gate

After measurement passes, reopen Google Ads draft `10210296901`, complete Google's passkey prompt, verify the saved campaign fields and `$40.75/day` draft budget, and keep the campaign unpublished until the final release decision.
