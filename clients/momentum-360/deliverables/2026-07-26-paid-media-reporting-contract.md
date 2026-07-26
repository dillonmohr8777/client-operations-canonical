---
date: 2026-07-26
client: momentum-360
status: canonical-reporting-contract
platforms: [google-ads, meta-ads]
roster: registry/paid-media-roster.json
external_changes: none
---

# Momentum 360 paid-media reporting contract

## Outcome

Momentum 360 owes a defensible report for each of the eight canonical client/platform lanes. Every report must identify the exact client, platform, account route, reporting period, comparison period, timezone, attribution setting, source freshness, tracking limitations, business outcomes, and next actions. Google Ads and Meta Ads evidence stays separate, and Replenish / 7-Eleven never blends with Fresh Blends / Kwik Trip even though both routes can appear inside one Google Ads child account.

This contract governs future client-facing ad reports. Historical observations may be cited with their observation date, but they are never presented as current performance or as authority to change spend.

## Required deliverables

| Deliverable | Cadence | Required format | Purpose |
|---|---|---|---|
| Client executive report | Weekly for every active lane | Mobile-readable dashboard or HTML plus downloadable PDF | Explain what happened, why it matters, and what happens next |
| Platform performance appendix | Weekly | CSV or JSON export plus a summarized table in the report | Preserve campaign, ad group or ad set, ad or asset, spend, delivery, and performance evidence |
| Business-outcome reconciliation ledger | Weekly | CSV or JSON with summarized client-facing totals | Separate platform-reported events from received, deduplicated, qualified, booked, won, and revenue outcomes |
| Measurement and source-freshness ledger | Weekly | Report section plus machine-readable manifest | Record attribution windows, conversion definitions, tracking health, source timestamps, latency, and unavailable fields |
| Recommendation and action plan | Weekly | Report section | Name decisions, owners, due dates, expected impact, and whether approval is required |
| Internal optimization review | Daily on the exact roster | `state/paid-media/daily-review-<date>.json` plus evidence notes when material | Check routing, pacing, tracking, landing pages, search terms or creative fatigue, placements, and change history |
| Monthly strategy review | Monthly | Trend dashboard or deck plus PDF | Compare full-month and prior-period trends, creative or query learning, lead quality, and budget scenarios |
| Delivery draft | With each client report | Email or Slack draft only | Provide the exact proposed client message; sending requires explicit approval |

The weekly client packet is not complete unless the executive report, platform appendix, outcome ledger, freshness ledger, and recommendation section all pass QA. A platform screenshot alone is not an ad report.

## Reporting window and metadata

Every report must show:

1. Client and platform.
2. Opaque exact-account reference. Raw account identifiers remain outside client-facing artifacts.
3. Reporting period and comparison period.
4. Account timezone and currency.
5. Generated-at time and source-observed-at time.
6. Platform attribution setting, conversion window, and attribution model where applicable.
7. Data-latency note for recent conversion periods.
8. Delivery state, budget basis, and whether the reported budget is daily, lifetime, shared, or monthly capped.
9. Known tracking limitations and unavailable sources.
10. Whether any campaign, budget, targeting, creative, billing, or account setting changed during report production.

Weekly windows use the latest complete Monday-through-Sunday period and compare it with the immediately preceding equivalent period. Month-to-date and trailing-30-day views may be included as secondary context, but must not replace the exact weekly window. Recent conversion figures remain provisional until the relevant attribution and reporting latency has elapsed.

## Mandatory KPI spine

### Delivery and pacing

- Campaign delivery state and material diagnostics.
- Budget, spend, remaining budget, pacing percentage, and period-end forecast.
- Impressions and CPM.
- Clicks or link clicks, CTR or link CTR, and CPC.
- Landing-page views or sessions when available.
- Material changes during the period and who made them.

### Platform events

- Results or conversions by named action, not an unlabeled blended total.
- Cost per named action.
- Primary versus secondary actions.
- Platform-reported results separately from all-conversion or broader event columns.
- Tests, duplicates, solicitations, reactions, and non-business events excluded from verified outcome totals.

### Business outcomes

- Leads received.
- Deduplicated leads.
- Contacted leads.
- Qualified leads or qualified estimates.
- Booked appointments, estimates, or services.
- Won outcomes and attributable revenue when available.
- Lead-to-qualified, qualified-to-booked, and booked-to-won rates when denominators are valid.
- Cost per verified lead, qualified lead, booked outcome, and won outcome when defensible.

Lead and conversion-event counts in Momentum 360 dashboards, PDFs, reports, and delivery drafts display as whole integers.

### Measurement quality

- Landing-page uptime, mobile experience, form submission, and phone-path checks.
- UTM and source retention.
- Google tag, GA4, Meta Pixel, Conversions API, CRM, booking, and call-tracking continuity as applicable.
- Browser/server event deduplication.
- Conversion definition, attribution window, and reporting latency.
- CRM or business-owner disposition freshness.

If the exact conversion definition, window, dates, latency, tracking health, or downstream outcome is not defensible, the client-facing status is: **Conversion reporting is pending validation.**

## Google Ads appendix

Each Google report includes, where the campaign type supports it:

- Campaign, ad group, ad, asset group, asset, status, budget, bid strategy, and diagnostics.
- Impressions, clicks, CTR, average CPC, cost, and named conversion actions.
- Results, Conversions, and All conversions only when their definitions are explicitly reconciled.
- Search terms, keywords, match types, negative-keyword opportunities, and search-term category or theme insights.
- Performance Max asset-group and search-theme evidence.
- Device, location, day, hour, demographic, and landing-page views where available and decision-relevant.
- Search impression share, lost impression share from budget or rank, and auction insights where available.
- Change history covering the report period and any pre-period change that materially affects interpretation.
- Attribution model, conversion windows, time-to-conversion or lag context, and imported/offline conversion status.

Search-term privacy omissions and differences between search-terms and search-terms-insights reporting must be noted when totals do not reconcile.

## Meta Ads appendix

Each Meta report includes:

- Campaign, ad set, ad, objective, delivery, budget type, bid strategy, schedule, and diagnostics.
- Amount spent, impressions, reach, frequency, CPM, link clicks, link CTR, CPC, landing-page views, results, and cost per result.
- The exact result type and the ad-set attribution setting.
- Breakdown by placement, platform, device, geography, age, and gender when available, privacy-safe, and decision-relevant.
- Creative-level results, format, hook or angle, fatigue indicators, frequency, and placement concentration.
- Lead form or landing-page path, Pixel and Conversions API health, event-match quality when available, and browser/server deduplication.
- Campaign, ad set, and ad change history.
- CRM or business disposition from received lead through qualified, booked, won, and revenue outcome.

Meta platform events do not become verified business outcomes until downstream reconciliation is complete. A future-verification warning is treated as an account-continuity risk and a human handoff, not as permission to start identity verification.

## Exact client/lane matrix

| Lane | Client report outcome | Required special treatment |
|---|---|---|
| Google Ads | Kimberly James Bridal | Reconcile named Google actions to booked and qualified bridal appointments; exclude the cancelled duplicate account; keep Google separate from Meta |
| Google Ads | Replenish / 7-Eleven | Report store and location campaigns separately; reconcile direction-intent and store outcomes; never blend Fresh Blends evidence |
| Google Ads | Fresh Blends / Kwik Trip | Report only exact Fresh Blends campaigns; preserve paused state unless current approved evidence says otherwise; never blend Replenish evidence |
| Google Ads | Omega Landscaping & Concrete | Reconcile platform events to owned, contacted, qualified opportunities and won work before budget recommendations |
| Google Ads | On-Site Concrete & Landscape | Reconcile forms, calls, CRM, and imported events; verify monthly cap and remove duplicates before outcome reporting |
| Meta Ads | Fagan Painting | Verify all six campaign states; reconcile received leads to qualified estimates and booked work; review fatigue, frequency, and placements |
| Meta Ads | Shadow Heating & Cooling | Report the two exact Shadow summer campaigns inside the verified Dillon operations account; reconcile service-area fit, contacted leads, booked service, and closure |
| Meta Ads | Kimberly James Bridal | Reconcile Meta leads to booked and qualified bridal appointments; preserve draft versus active state; keep Meta separate from Google |

## Production workflow

1. Resolve the exact lane from `registry/paid-media-roster.json`.
2. Validate the exact opaque account route and live authenticated platform session.
3. Freeze the reporting period, comparison period, timezone, currency, attribution setting, and generated-at time.
4. Export campaign-level and lower-level platform evidence.
5. Collect landing-page, analytics, call, form, CRM, booking, and revenue evidence.
6. Deduplicate tests and repeated events without erasing the raw audit trail.
7. Build the platform appendix and business-outcome ledger.
8. Calculate the KPI spine only from valid denominators.
9. Perform the Google query/negative review or Meta creative/fatigue/placement review.
10. Review change history and explain material performance shifts.
11. Draft recommendations; keep spend, account, campaign, creative, targeting, and publishing changes approval-gated.
12. Render the dashboard or HTML, PDF, machine-readable appendix, internal evidence manifest, and exact delivery draft.
13. Run QA, then request approval only for the exact client delivery or consequential platform action.

## Acceptance checklist

A report passes only when:

- The client, platform, and account route are exact.
- The date range, comparison range, timezone, currency, and source timestamps are visible.
- Spend and budget figures reconcile to the selected period and budget type.
- Every reported result names its action and attribution basis.
- Platform events and verified business outcomes are separate.
- Tests and duplicates are excluded from verified outcome totals.
- Missing fields are marked pending rather than inferred.
- Search terms and negatives or creative fatigue and placements are reviewed.
- Tracking and landing-page checks are current.
- Change history is reviewed.
- Recommendations name an owner, timing, expected impact, and approval status.
- Google and Meta remain separate, and Replenish remains separate from Fresh Blends.
- The PDF, dashboard or HTML, appendix, outcome ledger, and delivery draft agree.
- No external change or delivery is implied unless it actually occurred.

## Live route verification on 2026-07-26

- Google Ads is authenticated through Dillon's approved Google identity. The primary KJB account, Replenish, Omega, and On-Site account routes are visible; the cancelled KJB duplicate remains excluded. Fresh Blends continues to use its separate client route inside the shared child-account context.
- Meta Ads is authenticated. The named Fagan account shows six campaigns, the named KJB account shows four campaigns, and the two exact Shadow summer campaigns resolve inside Dillon's operations account.
- Shadow now has a client-specific non-secret Access Broker record and opaque production account reference.
- `state/paid-media/daily-review-2026-07-26.json` reports all eight lanes ready for read-only review.
- Meta surfaced a warning that identity verification may be required in the future. No verification flow was started.
- No ad, campaign, budget, targeting, creative, billing, account, draft, or delivery state was changed.

## Primary research sources

- Google Ads Help: About the search terms report — https://support.google.com/google-ads/answer/2472708/about-the-search-terms-report
- Google Ads Help: About change history — https://support.google.com/google-ads/answer/19888
- Google Ads Help: Understand reports — https://support.google.com/google-ads/answer/12929875
- Google Ads Help: Conversion windows — https://support.google.com/google-ads/answer/3123169
- Google Ads Help: Results reporting — https://support.google.com/google-ads/answer/12007894
- Google Ads Help: Attribution models — https://support.google.com/google-ads/answer/6259715
- Google Ads Help: Attribution reports — https://support.google.com/google-ads/answer/1722023
- Meta Business Help: About the Conversions API — https://www.facebook.com/business/help/AboutConversionsAPI
- Meta lead generation guide — https://about.fb.com/ltam/wp-content/uploads/sites/14/2023/11/LeadGenerationGuide.pdf
