# Replenish Google Ads destination decision

**Client:** `replenish-7-eleven` only. Fresh Blends stays out.  
**Dillon 2026-08-31:** asked whether to publish all 9 ads to the location finder or only 4. Later: set the final URLs.  
**Decision recorded here:** one hub URL for every Replenish ad. Spend only the 4 San Diego campaigns until Mia confirms Florida is blending.  
**Done 2026-08-31 21:44 UTC:** every Replenish Performance Max asset-group final URL is now `https://7eleven.getreplenish.com`. Fresh Blends destinations were not touched. No campaign was enabled, paused, or restarted.

## Exact destination

`https://7eleven.getreplenish.com`

Nothing else counts as a pass. Old short paths 404. Child `/locations/` pages are store detail, not ad destinations.

## Live store copy 2026-08-31

| Region | Stores | Hub / page copy | Ads action |
| --- | ---: | --- | --- |
| San Diego County | 4 | Available now | Final URL = hub. These are the only campaigns to keep live / publish. |
| South Florida | 5 | Coming this August | Final URL = hub. Do not treat as open-store ads until Mia confirms blending. |

## Live Google Ads readback 2026-08-31 21:44 UTC

Child account `6275014654`. `login-customer-id` header set to the same child ID. Validate-only mutate passed, then all nine Replenish asset groups were updated. Immediate search readback confirmed the hub URL on every Replenish asset group.

| Campaign | Region | Campaign status | Serving status | Prior final URL | Final URL after mutate | Pass? |
| --- | --- | --- | --- | --- | --- | --- |
| Replenish \| PMAX \| Solana Beach 4344 \| Consumer Foot Traffic | San Diego | ENABLED | ENDED | `https://7-11-smoothies-san-diego-ca.netlify.app/solana-beach-4344/` | `https://7eleven.getreplenish.com` | Yes |
| Replenish \| PMAX \| Miramar 43130 \| Consumer Foot Traffic | San Diego | ENABLED | ENDED | `https://7-11-smoothies-san-diego-ca.netlify.app/san-diego-miramar-43130/` | `https://7eleven.getreplenish.com` | Yes |
| Replenish \| PMAX \| Torrey Del Mar 3458 \| Consumer Foot Traffic | San Diego | ENABLED | ENDED | `https://7-11-smoothies-san-diego-ca.netlify.app/san-diego-torrey-del-mar-3458/` | `https://7eleven.getreplenish.com` | Yes |
| Replenish \| PMAX \| Carmel Mountain 19223 \| Consumer Foot Traffic | San Diego | ENABLED | ENDED | `https://7-11-smoothies-san-diego-ca.netlify.app/san-diego-carmel-mountain-19223/` | `https://7eleven.getreplenish.com` | Yes |
| Replenish \| PMAX \| Boca \| Consumer Foot Traffic | South Florida | ENABLED | ENDED | `https://7-11-smoothies-boca.netlify.app` | `https://7eleven.getreplenish.com` | Yes |
| Replenish \| PMAX \| Coral Springs \| Consumer Foot Traffic | South Florida | ENABLED | ENDED | `https://7-11-smoothies-boca.netlify.app` | `https://7eleven.getreplenish.com` | Yes |
| Replenish \| PMAX \| Miami 56 \| Consumer Foot Traffic | South Florida | ENABLED | ENDED | `https://7-11-smoothies-miami-56.netlify.app` | `https://7eleven.getreplenish.com` | Yes |
| Pampano Campaign | South Florida | ENABLED | ENDED | `https://mia-7-eleven-smoothies-pompano.netlify.app/` | `https://7eleven.getreplenish.com` | Yes |
| Howard Camaign | South Florida | ENABLED | ENDED | `https://mia-7-eleven-smoothies-howard-review-522.netlify.app/` | `https://7eleven.getreplenish.com` | Yes |

Fresh Blends x Kwik Trip Ice Box campaigns `#633`, `#1110`, `#573`, and `#1161` remain paused and still use `https://www.kwiktrip.com/icebox`.

## Sitelinks 2026-08-31 21:49 UTC

Six leftover Florida sitelink assets on Boca, Coral Springs, and Miami 56 were pointing at unrelated Netlify pages. Those asset final URLs are now `https://7eleven.getreplenish.com`. Fresh Blends sitelinks were not touched. Link text is unchanged, including leftover labels such as `IPTV Multiroom Service`.

## Not changed

- Campaign status, budgets, and enablement
- Fresh Blends campaigns
- Conversion setup. Conversion reporting is pending validation.

All nine Replenish campaigns are `ENABLED` but `ENDED`, so changing the destination does not restart spend. Restarting San Diego delivery is a separate approval.
