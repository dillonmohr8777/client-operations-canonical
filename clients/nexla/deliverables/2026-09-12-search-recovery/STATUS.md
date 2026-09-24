# Nexla recovery checkpoint

Goal remains open. The September 24 reconciliation below supersedes the September 12 waiting status; the earlier scope and receipts remain historical.

## Work completed through September 12

- Reused authenticated GTM session, verified Nexla container/workspace and seven unpublished changes; downloaded native workspace export for dependency review.
- Reconciled the complete seven-change list and both modified tags against published version 60 through native View changes; they were pending publication at the September 12 checkpoint. Listener modification adds MCP firing coverage; Ads tag modification replaces generic Form Submit with MCP success plus the excluding-MCP fallback. Five remaining objects are additions. September 24 readback confirms the seven changes in live Version 61; details are below and in measurement-repair.md.
- HubSpot connector returned reauthentication required; browser Google sign-in reached new-device email verification. User asked to complete it; no codes retrieved or entered by the agent.
- Applied exactly three approved campaign-level negative keywords, all EXACT: mcp; mcp server github example; mintlify mcp. Customer 7917802207, campaign 23705317332. HTTP 200 apply response plus fresh readback verified all three. That operation changed no budgets or ads.
- Before/after enabled budgets are Brand 25000000 micros and MCP 40750000 micros, total $65.75/day. Validation receipt 20260913T002006304510Z-negatives.json; live receipt and exact remove operations for rollback 20260913T002220111075Z-negatives.json.
- Independent GPT-5.5 xhigh review of the negative patch and validation receipt found no material issues. Reviewer stopped after completion. Local exact-payload/deduplication check passed.
- Saved tested local HubSpot listener hardening, dependency findings and remaining measurement repair sequence. Not installed in GTM or published. Local null/message-sender/duplicate checks passed; paid-destination end-to-end proof remains absent. Newer client messages confirm a September 10 test on /lp/demo/ reached HubSpot and Slack, but do not prove paid MCP attribution. See access-and-test-reconciliation.md.
- Created governance RSA customers/7917802207/adGroupAds/195300844695~824454041950 as PAUSED. Google validate-only and live mutation returned HTTP 200; fresh readback verified its exact copy/status, prior ads unchanged, and combined $65.75/day budget unchanged. Live receipt 20260913T002947723277Z-stage-ad.json includes before/after and rollback remove operation. Independent GPT-5.5 xhigh review found no material issues before application. This is platform staging, not a launched experiment.
- Native Analytics and Search Console pickers returned no Nexla-named property for the current identity. Numeric GA4 property and memberships remain unresolved. CMS /wp-admin/ redirected to /not_found. Google Ads API works; these other API integrations are not verified.
- Prepared one page challenger, a timed 40-second video concept, and reusable client production workflow. These remain drafts, not live tests or finished video.

## Next execution

1. Await the client's response to the exact required test fields in follow-up `1a0d42927ea05074` within the existing Gmail thread. Client-side advance-notice and owner HubSpot traffic-source/lifecycle coordination are documented; do not retain test values here.
2. Empty required-field rejection is verified on both MCP placements and `/demo/`; next verify a valid accepted submission, callback source/origin, exactly-once events, consent and deduplication. The separate local hardened listener is not installed.
3. Establish exact GA4 property ID, GTM API and Search Console access through existing grants where available; any expanded sensitive access requires its own consent. GTM browser access was refreshed September 24; GTM API access remains unverified.
4. The selected Search ad is staged PAUSED in Google Ads. Stage the landing-page challenger through the established CMS route or owner, then validate and launch the reviewed experiment within applicable publication authority. Preserve control and budget. No live experiment is running from this work.
5. Measure qualified outcomes after adequate observation and conversion lag. No before/after performance improvement is claimed from immediate negative readback.

Historical September 12 waiting status, superseded by September 24 evidence. Client coordination and an offer for owner-side HubSpot traffic-source/lifecycle readback are current. Version 61 confirms all seven changes are live. Empty required-field rejection is verified only within the tested scope; accepted-form behavior, consent, event firing and Ads/GA4 attribution remain unverified. This continuation made no live change or valid form submission.

Canonical route caveat: the August 7 registry snapshot lacks Nexla. Exact current user approval, existing clients/nexla identity and live Ads/GTM readbacks establish this work's client. No speculative registry or canonical queue mutation performed. Earlier working outputs were copied into this established client deliverable folder; use this package for continuation.

## September 24, 2026 — reconciliation receipt
- Gmail thread `1a0c666f014a48b5`: Jayashree messages `1a0caf9710a097ee` and `1a0cb613f9157905` affirm the bounded test; Dana messages `1a0cb5bfc4b9bb7a` and `1a0d3ea03e46cc83` request advance notice and offer CRM traffic-source readback. Follow-up `1a0d42927ea05074` is SENT with Gmail readback; it requests remaining required test fields. No client values are stored here.
- Targeted Slack searches after Sep 22 found no newer Nexla test receipt; latest matching `#nexla` report says conversion reporting is pending validation.
- Read-only GTM UI receipt `2026-09-24-live-version61-readback.json` (16:04:51Z): account `4701213587`, container `11055555` / `GTM-K7B389B`, workspace `74` zero pending; Version `61`, “Momentum 360 Changes,” Live Latest, published Sep 15 at 1:59 PM. It confirms the two modified tags and five added objects listed in `measurement-repair.md`; trigger `109` targets exact MCP path/form ID, while fallback `111` still allows `/demo/`.
- Public `/lp/mcp-servers/` and `/demo/` both returned HTTP 200 with live form UUID `663d7e71-eb1c-4e1b-94fe-61cac6f16a90`; public GTM JS contains the success/GA4 strings, but bundle presence alone does not prove firing.
- Live rejection receipt `2026-09-24-rejected-form-receipt.json` (16:03:55Z): both MCP placements plus `/demo/` rejected empty required fields; zero HubSpot submissions, zero conversion requests, and no `hubspot-form-success`. Scope excludes accepted tests, non-empty server rejections, and consent variants.
- Local listener contract test passed; local hardened script shows no observer loop or synchronous form manipulation, and remains separate/uninstalled. Public bundle does not expose Tag 113 source, so no spam-guard cause is inferred.
- Next: after the client supplies remaining test-only required fields, validate accepted-form callbacks, consent, exactly-once Ads/GA4 events and owner-side CRM traffic-source/lifecycle readback. No live valid submission, GTM installation/publication or campaign change was made here.
