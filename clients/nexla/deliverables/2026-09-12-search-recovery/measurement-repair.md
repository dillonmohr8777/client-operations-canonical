# Measurement repair status

September 12, 2026. Local staged patch; not installed in GTM or published.

Live browser: GTM account 4701213587, container 11055555 / GTM-K7B389B, workspace 73, seven pending changes. Export picker shows last published version 60, Pausing Warmly & ZoomInfo, August 26. Native workspace export downloaded as Downloads/GTM-K7B389B_workspace73 (1).json. The full export contains other vendors' configuration and stays outside this source package; only relevant tag/trigger evidence belongs here.

Dependencies inspected across every tag, trigger and variable in the workspace export: tag 60 produces hubspot-form-data and hubspot-form-success; trigger 64 uses success for Contact Us; trigger 109 uses success for MCP; variable 61 reads hs-form-guid. No other export object references hubspot-form-data or hs-formData. Existing pre-submit event is nevertheless preserved to avoid changing any uninspected site-side consumer. The success event carries no submitted field values.

The replacement hubspot-listener.js guards null/malformed data, verifies the sender against the current window or an actual attached HubSpot iframe, installs once, and emits success once per form per page. It preserves the existing pre-submit event without using it as conversion proof. Wrap in script tags when entering Custom HTML. test-listener.cjs is a local contract check; it does not prove live HubSpot callbacks or tag firing.

## Remaining implementation and verification

1. Seven-change inventory and both modified-tag comparisons are now reconciled against version 60 below. Complete preview and release QA before publication.
2. Preview real callback origin/source on both /lp/mcp-servers/ forms and the brand /demo/ form before installing the sender guard. Never fabricate callbacks on production and call that proof of conversion.
3. Inspect the actual /demo/ form ID and accepted-success behavior. Existing listener trigger 59 covers contact-us|get-a-demo, not /demo/. Trigger 112 covers only the exact trailing-slash MCP path. Extend coverage only to the verified paid destinations and appropriate form IDs.
4. Replace generic form_submit conversion fallback on paid /demo/ with accepted success. Preserve or separately audit other site paths. Trigger 111 currently excludes MCP by substring but still permits /demo/. Trigger 109 requires exact MCP path and exact form ID. Normalize trailing slash handling only after checking actual redirects.
5. Keep Ads action 7534625037; do not create a second nominally qualified action for the same raw form submission. Existing custom goal is correct. Raw success is not sales qualification.
6. Retain existing consent behavior; do not add email transmission or assume hashing eliminates consent requirements. Inspect native enhanced-conversion settings and CRM import diagnostics first.
7. Use an authorized business test identity, explicitly marked and excluded from prospect totals. HubSpot browser login is awaiting user completion of new-device verification sent to dillonmohr8777@gmail.com; connector also returned reauthentication required.
8. Prove accepted CRM submission, success callback, one intended Ads event and GA4 event, rejected-form non-conversion, both placements, consent scenarios and no unrelated-tag regression. Record the actual preview tab and marker for each check.
9. Publish only the reviewed and tested release within explicit authority; capture version/readback and rollback to the saved baseline. Completion remains unproven until live tests and CRM reconciliation pass.

## September 12 published-versus-workspace reconciliation

Native GTM workspace overview shows exactly 2 Modified, 5 Added, 0 Deleted. Both modified tags were inspected using View changes against Version 60. No GTM writes were made during this review.

| Object | Change | Verified consequence |
|---|---|---|
| Tag 60, HubSpot Event Listener | Modified: one triggering change | Version 60 fires only on Contact & Demo Pages. Workspace additionally fires on MCP Paid LP Listener Page View. HTML and consent settings are unchanged. MCP coverage in this tag is still unpublished. |
| Tag 88, GAds Conversion - Form Submit | Modified: one triggering change | Version 60 fires on Form Submit custom event. Workspace replaces that with MCP accepted-success OR legacy form_submit excluding MCP. Conversion ID, label, once-per-page option and consent settings are unchanged. |
| Tag 110, GA4 generate_lead MCP Paid LP | Added | Workspace-only GA4 event, tied to success trigger 109. |
| Trigger 109, HubSpot Success MCP Paid LP Form | Added | Workspace-only exact MCP path and form success filter. |
| Trigger 111, Legacy form_submit excluding MCP | Added | Workspace-only fallback; still allows /demo/ and needs paid-brand success isolation. |
| Trigger 112, MCP Paid LP Listener Page View | Added | Workspace-only listener coverage for MCP. |
| Tag 113, Nexla HubSpot Known Spam Guard | Added | Workspace-only client-side guard. Its existence does not establish spam rejection in production. |

The five added objects were identified in the native changes list and inspected in the previously downloaded workspace export. No unrelated vendor tag appears in the seven-change list. Nevertheless, the spam guard and success-based tracking still require accepted/rejected-form and consent tests. The live generic Form Submit trigger is weaker evidence than accepted HubSpot submission; neither configuration alone proves actual tag firing. Do not describe these seven pending changes as already protecting live paid traffic.

## Earlier planning corrections

The September 9 planning note overstates several conclusions: spam examples do not prove all clicks are spam; 27% reported enhanced-conversion coverage does not mean Google sees only 27% of all outcomes; fixed 15/30-lead bid thresholds and placeholder values 1/5/25 are not account-specific evidence. Do not import invented values, promise an 80% match rate, or accept the note's suggestion that hashing removes the approval boundary. Use actual qualified outcomes and current platform documentation.

The August 7 registry snapshot omits Nexla, but the current user explicitly approved work on Nexla customer 7917802207 and live API identity confirms Nexla. Use the established clients/nexla folder. Registry/queue repair remains separate; no speculative client record or queue update has been made.
