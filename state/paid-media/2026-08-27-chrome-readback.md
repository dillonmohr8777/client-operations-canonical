# Google Ads Chrome readback — 2026-08-27

Read-only live session in Zen Chrome (Chrome-for-testing, loopback CDP `127.0.0.1:9222` only). Operator Google Ads login was already in that profile. Account picker opened as the signed-in operator. No Composio Google Ads API calls this pass. No pause, enable, budget, bid, recommendation apply, draft resume, or invite accept.

Window on every child overview: **Jul 30 – Aug 26, 2026**. Eastern display unless noted. Payment-method last-4 digits, CDP query tokens, and cookies are omitted.

Manager account visible in the picker: Dillon Mohr Hermes Agent `703-867-3437`. Cancelled KJB duplicate `721-491-4099` was not opened.

## Why API looked blocked

Composio `googleads` is not the login. Persistent Chrome already had the MCC session. The API path is a separate developer-token / `login-customer-id` / quota problem (`CUSTOMER_NOT_ENABLED` on a deactivated default customer, then `RESOURCE_EXHAUSTED` 429). Roster execution surface remains `persistent_chrome`.

## Kimberly James Bridal `814-550-6229`

- Title confirmed: Overview - Kimberly James Bridal.
- Account: cost `$468.99`, clicks `133`, CTR `5.56%`, impressions `2.39K`, avg CPC `$3.53`, conversions `0.00`.
- Live campaign: `KJB | Search | Local Bridal | Philadelphia` — Eligible (Limited), poor ad strength.
- `Campaign #1` — Paused (`-$470.11` / `-100%` vs prior window).
- Optimization score `63.6%`. Last-7-day spend `$48.72` vs peer benchmark about `$183`.
- Conversion tracking: tag inactive `1`, unverified `1`, no recent conversions `2`, recording conversions `0`. Lead funnel: `133` interactions, `0` raw leads.
- Billing balance `$426.80`. Next automatic payment Sep 1, 2026.
- Recommendation visible: add callouts. Not applied.

## Omega Landscaping `285-398-1364`

- Title confirmed: Overview - Omega Landscaping. Time zone on campaigns footer: Mountain.
- Account: cost `$1.29K`, conversions `3.00`, impressions `3.74K`, avg CPC `$7.32`. Lead funnel: `176` interactions, `3.00` raw leads.
- Overview campaign widget (4 of `Campaigns (9)`):
  - `Search | High Intent | Colorado Springs | 2026-07-30` — Paused, `$1,287.49`, `176` clicks, `4.73%` CTR (all window spend).
  - `Omega Landscaping & Concrete | Colorado Springs | PMax` — Paused, `$0.00` (`-$1,435.53` / `-100%` vs prior window).
  - `Search_Concrete Services_Call Only` — Eligible, `$0.00`.
  - `Search_Services_Call Only` — Paused, `$0.00`.
- Draft left untouched: `Omega Landscaping & Concrete - Performance Max` (last modified Jun 5, 2026).
- Optimization score `83.1%`. Conversion tracking: tag inactive `2`, unverified `1`, no recent `5`, recording `1`.
- Billing balance `$314.85`. Next automatic payment Sep 1, 2026.
- Recommendation visible: Maximize conversions `+10.5%`. Not applied.

## Onsite Concrete & Landscape `103-371-5894`

- Title confirmed: Overview - Onsite Concrete & Landscape. Time zone footer: Pacific.
- Account: cost `$93.78`, clicks `572`, conversions `4.00`, avg CPC `$0.16`. Lead funnel: `572` interactions, `4.00` raw leads.
- `Onsite Concrete & Landscape` — Paused, `$93.78`, `572` clicks, `4.07%` CTR (window spend).
- `Leads-Performance Max-1` — Paused, `$0.00`; diagnostics: 1 of 2 asset groups disapproved (`-$121.66` / `-100%`).
- `Search | High Intent | Solano County | 2026-07-30` — Eligible (Learning), `$0.00` / `0` impressions this window.
- Draft left untouched: `OnSite - PMax - Concrete + Landscape - Solano` (last modified Apr 23, 2026).
- Conversion tracking: tag inactive `0`, unverified `4`, no recent `9`, recording `1`.
- Billing balance `$82.19`. Next automatic payment Sep 1, 2026.
- Recommendation visible: fix disapproved sitelinks. Not applied.

## Replenish `627-501-4654` (shared child with Fresh Blends)

- Title confirmed: Overview - Replenish. Time zone footer: Eastern.
- No Accept / invitation control was visible. Invite was not clicked.
- Account: cost `$1.45K`, clicks `1.23K`, impressions `95.6K`, avg CPC `$1.18`. Optimization score `93.6%`.
- Selector showed `Campaigns (13)` with status filter All. Ice Box / Kwik Trip / Fresh Blends campaign names were **not** in the overview spend, diagnostics, or optimization widgets this readback. Do not blend brands. Do not unpause Ice Box.
- Named Replenish campaigns in the widgets (Eligible unless noted):
  - `Replenish | PMAX | Carmel Mountain 19223 | Consumer Foot Traffic` — `$283.44`, `204` clicks, `1.18%` CTR
  - `Replenish | PMAX | Torrey Del Mar 3458 | Consumer Foot Traffic` — `$209.95`, `259` clicks, `1.25%` CTR
  - `Howard Camaign` — Eligible (Learning), `$184.97`, `117` clicks, `0.69%` CTR
  - `Pampano Campaign` — `$180.26`, `367` clicks, `4.33%` CTR
  - `Replenish | PMAX | Miami 56 | Consumer Foot Traffic` — `$180.23`, `59` clicks, `0.55%` CTR
  - Also listed without this-page cost rows: Boca, Coral Springs (Learning), Solana Beach `4344`, Miramar `43130`
- Conversion tracking: tag inactive `0`, unverified `0`, no recent `2`, recording `1`.
- Billing balance `$303.40`. Next automatic payment Sep 1, 2026.
- Draft left untouched: `Replenish | Search | Near Me Local Intent` (last modified Apr 14, 2026).

## Not mutated

- No Google Ads API / Composio googleads tools.
- No pause, enable, budget, bid strategy change, recommendation apply, draft resume, or user-invite accept.
- Canonical queue `queue/work-items.json` not written. `CONTROL.md` not regenerated.
- Fagan remains Meta-only on the paid-media roster. Shadow remains Meta-only.

## Next gated actions (need an exact Dillon ask)

- KJB conversion tagging (recording conversions is `0`).
- Omega: High Intent is paused while Call Only Concrete is Eligible at `$0`.
- Onsite: live Search High Intent is learning at `$0` impressions; paused campaigns still hold the window spend.
- Fresh Blends Ice Box: confirm paused store campaigns inside this same child before any restart talk.
