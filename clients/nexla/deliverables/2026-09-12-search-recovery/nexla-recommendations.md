# Nexla Search audit and draft correction plan

Prepared September 12, 2026. Read-only account audit; all recommendations and copy are drafts. No account, access, spend or publishing changes made.

## Verified account evidence

Direct Google Ads REST v23 requests returned HTTP 200 for Nexla customer 7917802207, USD, America/Chicago. Reporting period August 13 through September 11 inclusive; September 12 excluded as incomplete. Conversion metrics are attributed to interactions in this period and can mature later.

| Campaign | Current status | Daily budget | Period spend | Clicks | Ads conversions | All conversions |
|---|---|---:|---:|---:|---:|---:|
| G_US_S_Brand_Exact | Enabled, Search, Maximize Conversions | $25.00 | $280.98 | 112 | 0 | 0 |
| G_US_S_NB_MCP-Agentic | Enabled, Search, Maximize Clicks | $40.75 | $684.08 | 169 | 0 | 0 |
| G_US_S_NB_ETL-Pipeline | Paused | $1.00 | $31.38 | 2 | 0 | 0 |
| G_US_PMAX_NB_MCP-Agentic | Paused | $1.00 | $84.38 | 82 | 1 | 4 |

The two enabled campaigns spent $965.05 using unrounded API amounts, on 281 clicks. Individually rounded amounts sum to $965.06. The paused PMax campaign's one primary conversion is a CRM lifecycle transition to Lead; its other three all-conversion events are HubSpot-Demo Request. These are events, not four verified people or customers. Do not revive PMax based on these numbers.

Both enabled Search campaigns use custom goal 6458843017, containing only HubSpot-Demo Request action 7534625037. Account-level YouTube Primary flags do not establish Search bidding contamination. CRM Lead, MQL, Opportunity and Customer actions exist but are currently Secondary; no MQL, Opportunity or Customer events appeared in the period's campaign conversion breakdown.

Current enabled MCP positive keywords are Phrase and Exact. Broad positives visible in the active ad group are paused. Do not prescribe a broad-to-phrase cleanup as if it has not happened.

September 11 reported search terms still include mintlify mcp ($5.46), mcp market ($5.35), nutanix mcp server ($5.26), mcp server for claude ($5.21), mcp ($5.19), and mcp server github example ($5.17). These six disclosed rows represent $31.64 of $58.14 campaign spend that day; search-term reporting does not expose every query. Intent classification is judgment, not proof each click was worthless.

Evidence files in this folder contain queries, HTTP status, field masks and response request IDs. Primary references: campaigns.txt, conversions.txt, actions.txt, goals.txt, custom-goals.txt, campaign-goals.txt, ads.txt, keywords.txt, recent-terms.txt, negatives.txt, changes.txt and daily.txt.

## Recommended order

1. **Prove the measurement path.** Goal assumed: qualified enterprise demo requests that become sales opportunities. Reconcile accepted HubSpot submissions with click IDs/UTMs, demo events, spam flags, qualification and opportunities. Verify one approved controlled submission reaches HubSpot, fires the intended success event once, and is attributed correctly. Check both forms on the MCP page and the separate brand /demo/ destination. Check consent behavior, cross-domain/cookie continuity, click-ID capture, duplicate events, form errors and CRM import diagnostics. A rendered form or enabled action is not this proof. Conversion reporting is pending validation; zero reported Search events does not prove zero real leads.
2. **Reduce irrelevant intent first.** Draft exact negatives [mcp], [mcp server github example], [mintlify mcp]. Review [mcp market] with the sales team. Review Nutanix and Claude terms for legitimate integration use cases before excluding them. Do not blanket-exclude every third-party platform, developer term, or the word free. Compare recent campaign and shared negatives before upload; this draft checks campaign negatives, not every shared list.
3. **Concentrate the existing MCP budget.** Keep one campaign while volume is this small. Prioritize enterprise MCP platform, enterprise MCP server, secure MCP server and MCP data integration. Separate governance and cross-system access messages only where query demand supports it. Audit generic phrase keywords against the terms they actually matched before pausing individual keywords. No increase from the current combined $65.75/day budget until measurement and lead quality are established.
4. **Match the promise to the buying problem.** Current MCP ad already has 15 relevant headlines and points to the correct MCP page. Test a distinct buying objection rather than adding more interchangeable headlines: secure agent access across enterprise systems, or avoiding a separate MCP server for every application. Keep an existing control. Match one landing-page hero and supporting proof to the selected angle.
5. **Improve the demo decision.** Live page has multiple form fields, a use-case textarea, enterprise capabilities and a buried MCP Studio early-access qualification. Test clearer demo expectations near the CTA, a real product walkthrough, approved customer evidence, and moving nonessential qualification fields later. Preserve fields sales actually needs; do not optimize to low-quality submissions. Keep early-access status explicit.
6. **Evaluate after comparable exposure and conversion lag.** Compare query quality, accepted demos, qualified demos and opportunities by campaign. Diagnose ad CTR separately from page conversion and lead quality. Choose target cost per qualified lead from Nexla's real economics and sales acceptance rate. Do not invent a universal CPA target or switch to a tight tCPA without dependable signal. Review Brand Maximize Conversions once tracking history and longer-range outcomes are reconciled.

## Research to finish before scaling

- CRM: company fit, job role, business use case, spam, duplicate people, accepted meeting, opportunity, pipeline, time to qualify and sales feedback. Existing account actions are not proof imports work end to end.
- Search: matched keyword, query, network, location and device; mature pre/post-change cohorts; conversion lag; actual search demand and auction competition. Today's audit is a targeted triage, not a completed 90-day account audit.
- Competition: compare Workato Enterprise MCP and Boomi AI Gateway against Nexla on offer, architecture, governance, proof and CTA. Their current pages overlap with secure/governed positioning, so those adjectives alone are not differentiated. Verify competitive claims before using them.
- Page: mobile usability, load behavior, form errors, consent and approved conversion testing. The page was read in the browser; no form was submitted and no performance benchmark was run.

## Draft responsive Search ads

Two alternatives are in search-ad-drafts.csv. Test one against the current control, not both simultaneously at this volume. Each contains six headlines and two descriptions; validated against Google's 30/90 character limits. These are hypotheses, not proven winning ads. Final URL: https://nexla.com/lp/mcp-servers/ . Claims are grounded in that page; product availability and substantiation still need Nexla confirmation before publication.

## Google access map

| Capability | Evidence / state | Next useful step |
|---|---|---|
| Ads reporting | Live Nexla reads verified this turn through existing direct OAuth probe | Reuse ads_probe.py; omit manager header; retain date windows and exact customer IDs |
| Other client Ads | September 10 stored exports cover Omega, Onsite, KJB and shared Replenish/Fresh Blends account; not refreshed here | Verify exact account on the next scoped audit; shared account requires campaign-level brand separation |
| GA4 Data/Admin APIs | No live authenticated Nexla API read established here; prior local audit found no demonstrated client | Identify Nexla property and existing grant; use analytics.readonly for session/landing-page/event reconciliation |
| GTM API | Not established | Identify the exact container and existing grant; tagmanager.readonly supports tag/trigger/version inspection |
| Search Console | Not established | Identify verified Nexla property; webmasters.readonly supports organic query research, separate from paid search reporting |
| CRM conversion feedback | Ads lifecycle actions exist; accepted-lead-to-import chain unverified | Prefer verified native HubSpot connection; inspect diagnostics and reconcile records before another integration |
| Data Manager API | Not established | If native imports are inadequate, assess current enhanced-conversions-for-leads ingestion path and permissions |

Do not confuse Ads OAuth with access to every Google product. The existing adwords scope is not a read-only OAuth scope; this audit is read-only because it uses search requests. Broader scopes/access have not been granted. The prior setup note records OAuth Testing mode and possible seven-day refresh-token expiry; production consent state was not checked live, so unattended reliability remains unverified. Reuse the existing client, reports and scheduler; no second automation stack is needed.

New grants, publishing or spending remain review steps under the user's draft/stage boundary. No credentials are included in these artifacts.

## Applying the X workflow to clients

The linked post describes researching ads, scripting scenes, generating character/environment references and video, adding music and orchestrating exports. We can adapt that production method. The post does not establish those ads' conversion performance, nor does its 4K/60fps claim establish that this workspace can reproduce its exact pipeline.

Use competitor ads as creative hypotheses, not proof of winners. Begin with a client-specific pain, credible support and CTA. For Nexla, first draft a 30-45 second real-product-led explanation of secure access across enterprise systems. Hook: Your AI agent works in a demo. Can it safely reach your business data? Show fragmented systems, the actual Nexla workflow and a scoped demo invitation. Use authentic product footage and approved claims. Longer explainers can follow once the message earns attention and qualified intent. Production, music licensing, model spend and publication are separate from this research plan.

Sources: https://x.com/exm7777/status/2097713112250253528 ; https://nexla.com/lp/mcp-servers/ ; https://www.workato.com/agentic/mcp ; https://boomi.com/platform/ai-gateway/ ; https://support.google.com/google-ads/answer/7684791 ; https://developers.google.com/identity/protocols/oauth2/scopes ; https://developers.google.com/tag-platform/tag-manager/api/v2/authorization ; https://developers.google.com/google-ads/api/docs/conversions/categories .
