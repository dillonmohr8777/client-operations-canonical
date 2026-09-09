# Nexla Google Ads launch readiness and call campaign research

Date: 2026-09-02 ET  
Decision: **NO GO for activation today**  
Account: Nexla `791-780-2207`  
Prepared campaign draft: `10210296901`  
Prepared campaign: `281499136789173`

## Executive decision

Do not tell Jayashree that the campaigns are ready, and do not enable spend yet.

The paid landing page and form protections have advanced materially. The selected page is live, the expected GTM container and HubSpot form are present, reCAPTCHA is present, and Dana confirmed that reCAPTCHA V2 plus HubSpot gibberish protection are enabled. A controlled submission also caused the dedicated Google Ads and GA4 tags to fire once in GTM Preview.

Those checks are not the same as a live launch chain. Current evidence still does not prove the GTM workspace is published, the event is visible in live GA4 and Google Ads diagnostics without duplication, the Google Ads draft survived the passkey save and final review, the intended conversion is Primary and selected for campaign optimization, or the advertiser identity and assets are approved. The exact Nexla Ads account is also not registered for live mutation in the current Access Broker and paid media launch roster.

## Evidence checked

- Gmail thread `1a0219ad3ad53df0`, including Jayashree's 2026-09-02 message `1a064dc07de8154b` asking whether the campaigns are ready.
- Dana's 2026-09-02 confirmation that reCAPTCHA and gibberish controls were implemented, followed by Dillon's confirmation that reCAPTCHA V2 is active on the live Demo Request form.
- Canonical Nexla campaign, measurement, and takeover reports through 2026-08-31.
- Public fetch of `https://nexla.com/lp/mcp-servers/` on 2026-09-02: HTTP 200, expected GTM container present, expected HubSpot form GUID present, reCAPTCHA code present, and no `tel:` link present.
- Current Access Broker Nexla record: GTM access is mapped with Publish permission, but no Nexla Google Ads mutation route is registered.
- Current paid media roster and provider readiness check: Nexla is not an eligible Google Ads launch lane; Google Ads provider readiness is blocked and stale.

## Release gates that remain open

1. Publish the corrected GTM isolation only after confirming the legacy generic Ads path still serves other pages and the MCP page cannot double count.
2. Run one live end to end diagnostic and read back the event in HubSpot, GTM, GA4 DebugView, and Google Ads diagnostics.
3. Confirm the qualified lead conversion is Primary and that this campaign explicitly uses its goal. Keep lesser actions Secondary unless intentionally included in a custom goal.
4. Reopen draft `10210296901`, complete the human passkey, and verify every persisted field before publication.
5. Confirm advertiser identity and the `Nexla` business name and logo assets are eligible.
6. Inspect the current campaign and budget state before enabling anything. Pause only the exact legacy Nonbrand campaigns being replaced so the new budget is not stacked on top of existing spend.
7. Add an exact Nexla Google Ads access route, launch blueprint, and active launch authority envelope with account, budget, schedule, conversion, and requester scope.
8. Complete a final live readback of campaign state, daily budgets, URLs, geo, schedule, networks, conversion goals, ads, assets, and policy status.

## Best campaign direction

The best current fit is the existing MCP focused Search plan, not a local service style call first campaign:

- Preserve Brand Exact at `$25/day`.
- Replace only the intended legacy Nonbrand activity with one MCP Search campaign at `$40.75/day` after the release gates pass.
- Use Variant A: `https://nexla.com/lp/mcp-servers/`.
- Keep the campaign MCP only, with Phrase and Exact intent, United States presence targeting, English, Google Search only, Search Partners off, Display expansion off, and AI Max off during the proof period.
- Start with the prepared `$12` maximum CPC guardrail while qualified conversion measurement stabilizes.
- Review search terms and qualified CRM outcomes weekly before broadening match types, themes, or automated bidding.

## Call campaign research

A standalone Google call campaign is not ready and is probably the wrong primary design for Nexla.

- Google call campaigns are designed to show on call capable mobile devices. That would exclude desktop users from this acquisition path, a material coverage loss for this enterprise software campaign.
- Google requires a verified business phone number and a verification URL that displays that number. The selected Nexla paid page currently has no telephone link or displayed phone route.
- Call reporting uses a Google forwarding number and can count calls that meet a chosen duration as conversions. Call assets can be scheduled only for staffed hours.
- Google's bidding logic uses Primary actions selected in the campaign's goal. The current Nexla demo action was previously Secondary, so adding another unqualified call signal before repairing goal selection would make optimization less trustworthy.

If Nexla supplies a verified staffed sales number and call handling hours, the safer test is a campaign level call asset inside the standard MCP Search campaign. Create a separate phone call lead conversion, begin as observation only, reconcile calls to qualified CRM outcomes, and promote it to a biddable Primary action only after quality is proven. Do not copy a local service call first structure into this enterprise B2B account.

Official sources:

- Google Ads, About call campaigns: https://support.google.com/google-ads/answer/7159344
- Google Ads, About call assets: https://support.google.com/google-ads/answer/2453991
- Google Ads, Measure calls from ads: https://support.google.com/google-ads/answer/6095882
- Google Ads, Primary and secondary conversion actions: https://support.google.com/google-ads/faq/10286469
- Google Ads, Responsive Search ad best practices: https://support.google.com/google-ads/answer/6167122
- Nexla MCP Studio: https://nexla.com/mcp-studio/

## Ready to send to Jayashree after Dillon approves the wording

Hi Jayashree,

Not quite yet. The landing page and form protections are ready, and the isolated tracking test passed in GTM Preview. I still need to complete the live Google Ads and GA4 diagnostic readback, confirm the final advertiser identity and campaign save, and verify the exact Brand and MCP replacement budgets so we do not stack spend.

I am keeping the campaigns off until those checks pass. I will send the final launch confirmation as soon as the live readback is clean.

Thanks,
