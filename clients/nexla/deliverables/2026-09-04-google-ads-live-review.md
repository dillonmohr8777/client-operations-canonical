# Nexla Google Ads live review

Read-only review on September 4, 2026 Eastern. Customer 791-780-2207, observed Google Ads UI ocid 862908857. Account timezone America/Chicago (Central). This current platform evidence supersedes the September 2 no-go memo only for facts verified here; it does not retrospectively certify all launch gates.

## Confirmed current configuration

Full 36-of-36 campaign inventory read. Exactly two campaigns are enabled:

| Campaign | ID | Budget | State | Bidding |
|---|---|---:|---|---|
| G_US_S_NB_MCP-Agentic | 23705317332 | $40.75/day | Eligible (Learning) | Maximize Clicks, verified $12 maximum CPC |
| G_US_S_Brand_Exact | 22038365681 | $25/day | Eligible | Maximize Conversions |

The other 34 campaigns are paused, including MCP Performance Max. Combined enabled average daily budget is $65.75. No settings were changed. Daily average budgets are not hard per-day spending caps.

## Complete reporting period: August 28–September 3

| Campaign group | Impressions | Clicks | Cost |
|---|---:|---:|---:|
| Active MCP Search | 1,722 | 71 | $195.36 |
| Active Brand Exact | 84 | 19 | $19.57 |
| Currently paused MCP PMax | 13,329 | 84 | $85.04 |
| Currently paused ETL Pipeline | 357 | 1 | $11.43 |
| Currently paused Governance | 1 | 0 | $0 |
| Account total | 15,493 | 175 | $311.40 |

Do not attribute the entire account total to the two currently active campaigns. Current-day September 4 was an explicitly incomplete snapshot: MCP 1,103 impressions, 15 clicks, $60.85; Brand five impressions and $0 spend. This confirms delivery, not a completed day or a statistically meaningful improvement.

The same caution applies inside MCP Search: its 71 historical clicks include ad groups now paused. The first 10 of 18 ad-group rows showed MCP-Server (195300844695) enabled/eligible, while Agentic-Data Products, Integration, Platform, Layer, Pipeline, Access, MCP-Context, MCP-Connector and Dynamic-LPs were paused. MCP-Server's own selected-window activity was three clicks, 553 impressions and $5.49. The remaining eight group rows were not exhausted. Do not claim the whole campaign's seven-day results describe the current narrowed structure.

## The important conversion finding

Both active campaigns explicitly use `Website Form Submission (custom)`. Expanded goal membership is `Contacts - Contacts Lifecycle Stage becomes Lead`, not `HubSpot-Demo Request`.

For MCP, the UI describes this goal as reporting-only under its current Maximize Clicks strategy. For Brand, Maximize Conversions uses the custom goal for bidding and reporting. Do not infer that default YouTube goals control these two campaigns, and do not blindly promote the demo action to Primary.

All eight enabled conversion actions were read:

- HubSpot-Demo Request: Active, Secondary, One, 30-day click window, not account-default; three All conversions in the selected period.
- Lifecycle Customer, Lead, Marketing Qualified Lead and Opportunity imports: Primary, One, 90-day click windows, not account-default; all marked Needs attention. Lead showed one All conversion; the custom-goal popover separately said Recording conversions. Preserve that diagnostic discrepancy for investigation.
- Google-hosted Lead form - Submit: Primary, One, one-day click window, not account-default; No recent conversions status.
- YouTube channel subscriptions: Primary, One, 30 days, account-default; No recent conversions status.
- YouTube follow-on views: Primary, Every, 30 days, account-default; No recent conversions status.

The account showed one attributed conversion in the campaign total and four All conversions across actions (three demo actions plus one lifecycle-lead import). Those are not four unique leads and are not verified qualified opportunities. Conversion reporting is pending validation.

## Priority next actions

Active MCP-Server ad readback: four ads total, three legacy variants paused, one enabled and Eligible/Good RSA titled `Nexla MCP Studio | Build Secure MCP Servers | Enterprise MCP Platform`. Verified destination https://nexla.com/lp/mcp-servers/. The active ad's selected seven-day history has no delivery because this is an early post-launch configuration; do not assign paused-variant history to it or infer future outcomes. No form submission was performed.

1. Trace the lifecycle-lead import to its source, receipt, latency and qualification rules; explain Needs attention despite a recording indicator.
2. Reconcile same-window HubSpot demo submissions, unique CRM leads, qualification and duplicate identities. Verify the MCP-specific live tag path without conflating GTM Preview with a production event receipt.
3. Confirm whether the intended acquisition outcome is an accepted demo or a qualified opportunity, then propose a deliberate goal migration if the current custom goal is wrong. Do not apply an unreviewed primary-label or bidding change.
4. Keep the learning-state MCP campaign separate from the mature Brand campaign and the now-paused historical spend. Review query relevance and landing-page fit before widening match types, AI Max or PMax.

Remaining coverage: no CRM/item-level outcomes, end-to-end form test, full search-term/negative audit, geography/network/ad-schedule readback or prior-period comparison completed here. This is not a comprehensive audit completion claim. No Nexla campaign, budget, tracking, goal, account or communication change.

## Sources

- https://ads.google.com/aw/campaigns?ocid=862908857
- https://ads.google.com/aw/conversions?ocid=862908857
- https://ads.google.com/aw/campaigns?campaignId=23705317332&ocid=862908857
- https://ads.google.com/aw/campaigns?campaignId=22038365681&ocid=862908857

Account IDs and sources were verified against the authorized account selector and canonical registry. User confirmed Nexla is in current scope; the narrower weekly automation was not expanded or treated as the portfolio roster.
