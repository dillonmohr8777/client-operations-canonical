# Measurement repair status

Reconciled September 24, 2026. The seven-object GTM configuration described below is now live in Version 61 (published September 15); behavior-level verification is still in progress. The separate hardened local listener is not installed.

Historical September 12 browser read: GTM account 4701213587, container 11055555 / GTM-K7B389B, workspace 73, seven pending changes, last published version 60. This is superseded by the September 24 read-only UI check: workspace 74 has zero pending changes and Version 61, “Momentum360 Changes,” is Live Latest, published September 15 at 1:59 PM. Do not treat the old workspace-73 snapshot as current.

Dependencies inspected across every tag, trigger and variable in the workspace export: tag 60 produces hubspot-form-data and hubspot-form-success; trigger 64 uses success for Contact Us; trigger 109 uses success for MCP; variable 61 reads hs-form-guid. No other export object references hubspot-form-data or hs-formData. Existing pre-submit event is nevertheless preserved to avoid changing any uninspected site-side consumer. The success event carries no submitted field values.

The replacement hubspot-listener.js guards null/malformed data, verifies the sender against the current window or an actual attached HubSpot iframe, installs once, and emits success once per form per page. It preserves the existing pre-submit event without using it as conversion proof. Wrap in script tags when entering Custom HTML. test-listener.cjs is a local contract check; it does not prove live HubSpot callbacks or tag firing.

## Remaining verification as of September 24

1. A read-only live-page check on both MCP form placements and the `/demo/` control found an empty required-field rejection on each: zero HubSpot submissions, zero conversion requests, and no `hubspot-form-success`. Receipt: [2026-09-24-rejected-form-receipt.json](2026-09-24-rejected-form-receipt.json), checked 16:03:55 UTC. Required fields are first name, last name, job title, company, email, and phone. This validates only an empty invalid form; it does not prove accepted-form handling, server-rejected submissions, consent variants, or CRM attribution.
2. Client coordination is established: the latest message requests advance notice before testing and offers an owner-side HubSpot traffic-source/lifecycle readback afterward. The parent sent follow-up `1a0d42927ea05074` for the remaining required test values; no client identity or contact values belong in this package. This is coordination for a valid test, not a missing general approval.
3. After the client supplies the missing test-only required fields, coordinate the accepted-form test across both MCP placements and `/demo/`; inspect source/origin, exactly-once `hubspot-form-success`, GA4 `generate_lead`, the intended existing Ads conversion action `7534625037`, consent behavior, and no conversion for invalid submission. Do not synthesize callback messages or create records to make a test pass.
4. Obtain the offered HubSpot traffic-source/lifecycle readback for the accepted test and reconcile it to the expected paid destination without retaining raw record data. GA4 property identity, GTM API access, and Search Console membership remain unverified; the authenticated GTM UI readback is verified.
5. Do not alter or republish GTM absent a demonstrated defect. If accepted/rejected behavior shows a configuration defect, stage the smallest exact fix in the current workspace, review a preview, and preserve a rollback/readback before any separately authorized publication.

## Seven changes: September 12 workspace diff, confirmed live September 24

The September 12 native workspace overview showed exactly 2 Modified, 5 Added, 0 Deleted compared with Version 60. September 24 UI readback confirmed this exact set in Version 61 Live Latest. No GTM writes were made during this reconciliation.

| Object | Change | Verified consequence |
|---|---|---|
| Tag 60, HubSpot Event Listener | Modified: one triggering change | Live Version 61 additionally fires on MCP Paid LP Listener Page View. Historical comparison says HTML and consent settings were unchanged. Actual accepted callback behavior remains unverified. |
| Tag 88, GAds Conversion - Form Submit | Modified: one triggering change | Live Version 61 uses MCP accepted-success OR legacy `form_submit` excluding MCP. Historical comparison says conversion ID, label, once-per-page option and consent settings were unchanged. Firing/consent receipts remain unverified. |
| Tag 110, GA4 generate_lead MCP Paid LP | Added; live Version 61 | Tied to exact MCP success trigger 109; actual firing remains unverified. |
| Trigger 109, HubSpot Success MCP Paid LP Form | Added; live Version 61 | Exact MCP paid path and MCP form UUID `663d7e71-eb1c-4e1b-94fe-61cac6f16a90`. |
| Trigger 111, Legacy form_submit excluding MCP | Added; live Version 61 | Excludes MCP but still permits `/demo/`; rejected-empty test produced no conversion request, but accepted-fallback behavior needs coverage. |
| Trigger 112, MCP Paid LP Listener Page View | Added; live Version 61 | Listener coverage for MCP. Exact public page paths and live form UUIDs are recorded in the status receipt. |
| Tag 113, Nexla HubSpot Known Spam Guard | Added; live Version 61 | Configuration presence is confirmed; do not infer production spam rejection without valid and invalid form tests. |

The five added objects were identified in the native changes list and the previously downloaded workspace export; the exact seven are now live. The empty-form readback shows required-field rejection did not emit a HubSpot submission, conversion request, or success event at the three tested placements. Accepted-form attribution, spam rejection, consent paths, and CRM alignment remain unproven. A public GTM bundle contains implementation strings but does not expose the spam-guard tag label; generic strings are not attributed to Tag 113. The local hardened listener has no MutationObserver, interval, `preventDefault`, or synchronous form-submit manipulation and is not installed.

## Earlier planning corrections

The September 9 planning note overstates several conclusions: spam examples do not prove all clicks are spam; 27% reported enhanced-conversion coverage does not mean Google sees only 27% of all outcomes; fixed 15/30-lead bid thresholds and placeholder values 1/5/25 are not account-specific evidence. Do not import invented values, promise an 80% match rate, or accept the note's suggestion that hashing removes the approval boundary. Use actual qualified outcomes and current platform documentation.

The August 7 registry snapshot omits Nexla, but the current user explicitly approved work on Nexla customer 7917802207 and live API identity confirms Nexla. Use the established clients/nexla folder. Registry/queue repair remains separate; no speculative client record or queue update has been made.
