# Nexla MCP Studio paid-search readiness

Status: `validation_pending_human_gate`, unpublished, no spend change

## Decision

- Use Variant A: `https://nexla.com/lp/mcp-servers/`.
- Keep the new campaign MCP-only. Dana's supplied pages do not establish a matching Enterprise Data Layer destination.
- Preserve the existing Brand campaign at $25/day.
- After validation, replace the enabled legacy nonbrand campaigns with one tightly controlled MCP campaign at $40.75/day. This yields approximately $2,000 per average 30.4-day month across Brand and the replacement Nonbrand campaign.

## Live account findings

- Google Ads account: `791-780-2207`.
- Draft: `10210296901`; campaign: `281499136789173`.
- Seven campaigns are enabled with a combined nominal budget of $95/day.
- Current draft bidding is Maximize Clicks with a $12 maximum CPC guardrail.
- Current account measurement shows no conversion action recording conversions. `HubSpot-Demo Request` is Secondary, has no recent tag data, and enhanced-conversion coverage is 27%.
- Google Ads identifies the verified advertiser as `SAKET SAURABH`; the draft business name is `Nexla`, which matches the destination domain but still requires Google approval.
- GTM access was accepted on 2026-08-26. The authenticated account has Publish access to account `4701213587`, container `11055555`, public ID `GTM-K7B389B`.

## Landing-page findings

- Variant A has a full HubSpot form in the desktop hero, a second form near the page bottom, and the first mobile form at approximately 808 px.
- Variants B, C, and D place their only mobile form at approximately 5,495 px, 5,336 px, and 5,835 px respectively.
- The general MCP Studio page has no embedded lead form and is not the preferred paid-search destination.
- All tested pages preserve GCLID and UTM values in hidden HubSpot fields.
- The floating Nexie chat widget materially obscures paid-page content on desktop and mobile. Suppress or auto-collapse it on the paid landing pages.

## Measurement repair required

- Form ID: `663d7e71-eb1c-4e1b-94fe-61cac6f16a90`.
- Google Ads conversion ID: `AW-10857703077`; label: `lf1HCMiSo_4ZEKXNrbko`.
- Fire the Google Ads lead conversion only on `hubspot-form-success` for the form ID above, not on generic `form_submit`.
- Send a successful GA4 lead/demo event for the `/lp/` paths. The existing Demo Submission rule is limited to `/demo/` paths.
- Validate one real successful test submission in HubSpot, GTM preview, GA4 DebugView, and Google Ads diagnostics before launch.

## Prepared draft specification

- Final URL: `https://nexla.com/lp/mcp-servers/`
- Display path: `mcp/servers`
- Final URL suffix: `utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_adgroup={adgroupid}&utm_term={keyword}&utm_content={creative}`
- Ten phrase/exact MCP keywords only; unrelated data product, ETL, and generic AI-data terms removed.
- Fifteen MCP-focused headlines and four descriptions; outdated 600-system claim replaced with the current 1000-plus claim.
- Business name: `Nexla`.
- Proposed daily budget after validation: `$40.75`.

## Human gate

Google required `Confirm with a passkey` while saving. The action was canceled safely. No campaign was launched, paused, or budget-increased. Reopen the draft, complete the passkey, confirm the prepared fields persisted, then fix and validate measurement before publishing.

## 2026-08-26 GTM access and staging update

- Dana Palko explicitly authorized Momentum to complete the GTM event mapping and sent access to `dillonmohr8777@gmail.com`.
- The invitation was accepted. The authenticated account has Publish access to Nexla account `4701213587`, container `11055555`, public ID `GTM-K7B389B`.
- The live container already has a HubSpot listener, data-layer variable `dlv - hs-form-guid`, Google Ads conversion ID `10857703077`, conversion label `lf1HCMiSo_4ZEKXNrbko`, and GA4 event infrastructure.
- A new unpublished custom-event trigger named `Momentum - HubSpot Success - MCP Paid LP Form` is staged for event `hubspot-form-success` and exact form GUID `663d7e71-eb1c-4e1b-94fe-61cac6f16a90`.
- The legacy generic `Form Submit` trigger was removed from `GAds Conversion - Form Submit` in the unpublished workspace. Dana then confirmed that Nexla reuses this HubSpot form on other pages and landing pages. The current staged state must not be published because removing the shared generic path could disrupt measurement used by other campaigns.
- A new unpublished GA4 event tag named `Momentum - GA4 - generate_lead - MCP Paid LP` is staged with event name `generate_lead`. Its current trigger uses the shared form GUID and still requires the MCP page-path condition before testing or publication.
- Correct isolation plan: restore the legacy generic Ads trigger for existing campaigns, exclude the MCP landing-page path from that legacy tag, and route the MCP page through dedicated Ads and GA4 tags requiring both the exact form GUID and `/lp/mcp-servers/` page path. This preserves other campaigns and prevents duplicate MCP counting.
- GTM Preview connected successfully to `https://nexla.com/lp/mcp-servers/` and confirmed the container loads. A successful form submission still must be validated at action time in HubSpot, GTM Preview, GA4 DebugView, and Google Ads diagnostics before publication.
- Page-load negative control passed in GTM Preview: `GAds Conversion - Form Submit` and `Momentum - GA4 - generate_lead - MCP Paid LP` both appeared under Tags Not Fired while the required page-load and consent tags fired normally. This proves the staged conversion tags do not fire merely from visiting the landing page.
- Dana confirmed Nexie is suppressed for now. The paid landing page remains the selected Variant A destination.

## Communication readback

- The client follow-up in Gmail thread `1a0219ad3ad53df0` was sent at 2026-08-26 14:21 EDT.
- Dana replied at 14:47 EDT to confirm that the same form is used on other pages. Dillon answered at 15:01 EDT, message `1a03f731af7f107c`, confirming that the legacy path will be preserved, MCP will be constrained by exact form and page path, and the workspace remains unpublished.
- No 2026-08-26 Nexla Slack result was found in the authorized public/private/DM search.
- This readback confirms delivery state only; it is not evidence that the client approved publication, campaign launch, or a test CRM submission.

Status remains unpublished with no spend change. The two remaining gates are a clearly labeled live test submission and the Google Ads passkey required to reopen and save the campaign draft after measurement validation.
