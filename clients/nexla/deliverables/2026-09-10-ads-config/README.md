# Nexla Ads configuration — 2026-09-10

Account: `7917802207`  
Observed and applied: 2026-09-10, Google Ads REST v23, direct  
Spec: `../2026-09-09-valid-lead-criteria-and-conversion-config.md`

## What was misconfigured

Both live campaigns, Brand Exact and MCP Search, were pointed at custom goal `Website Form Submission` (`6458843017`). That goal contained only `Contacts - Contacts Lifecycle Stage becomes Lead` (`7724496703`). Brand Maximize Conversions was training on CRM Lead uploads, not HubSpot demo requests.

`HubSpot-Demo Request` (`7534625037`) was Secondary. YouTube views, YouTube subscriptions, generic Lead form Submit, and four CRM lifecycle uploads were Primary at account level.

Thirty-one paused campaigns still carried $1,440/day in armed budgets, including twelve competitor shells at $75/day and PMax MCP at $20/day.

## What changed

| Object | Before | After |
|---|---|---|
| Custom goal `6458843017` | `Website Form Submission` → CRM Lead only | `HubSpot Demo Request` → `7534625037` only |
| `HubSpot-Demo Request` | Secondary | Primary |
| CRM Lead / MQL / Opportunity / Customer | Primary | Secondary |
| 31 paused campaign budgets | $1,440/day armed | $1/day each |
| PMax MCP `24177650112` | PAUSED, $20/day | still PAUSED, $1/day |
| Brand Exact `22038365681` | ENABLED $25/day | unchanged |
| MCP Search `23705317332` | ENABLED $40.75/day Maximize Clicks | unchanged |

Live campaigns still use custom goal `6458843017`. Brand Max Conv now optimizes to HubSpot Demo Request only.

## What could not be mutated

Google rejected mutates on system actions:

- `Lead form - Submit` `899954048`
- `YouTube follow-on views` `7672793025`
- `YouTube channel subscriptions` `7672822300`
- hidden `Content Download` `931722373`

Those stay Primary at the account default. They do not sit in the live custom goal, so Brand and MCP do not bid on them.

## Still not done

- GTM `GTM-K7B389B` workspace 73 is still unpublished. Live container is version 60. The scoped `hubspot-form-success` tag is not production yet.
- Recaptcha is already live on `/demo/` and `/lp/mcp-servers/`. That is HubSpot, not Ads.
- The 3-ad-group MCP RSA rebuild stays draft until that GTM publish and one accepted business-email test fire.
- Offline MQL/SQL import is not built. HubSpot portal mapping is still outstanding.
- Keyword Planner remains 403 Explorer Access.
- No email or Slack sent.

## Serving now

- Brand Exact $25/day, Maximize Conversions, custom goal = HubSpot Demo Request
- MCP Search $40.75/day, Maximize Clicks, Search only
- Everything else paused at $1/day
