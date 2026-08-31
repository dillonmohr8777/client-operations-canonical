# Replenish Google Ads destination decision

**Client:** `replenish-7-eleven` only. Fresh Blends stays out.  
**Dillon 2026-08-31:** asked whether to publish all 9 ads to the location finder or only 4.  
**Decision recorded here:** one hub URL for every ad. Spend only the 4 San Diego campaigns until Mia confirms Florida is blending.  
**Not done:** no campaign edit, pause, enable, or spend change. Launch authority is still `draft` with `enableCampaigns: false`. Composio Google Ads can see customer `6275014654` in the accessible list but child-account GAQL returns `USER_PERMISSION_DENIED` without a manager `login-customer-id` header.

## Exact destination

`https://7eleven.getreplenish.com`

Nothing else counts as a pass. Old short paths 404. Child `/locations/` pages are store detail, not ad destinations.

## Live store copy 2026-08-31

| Region | Stores | Hub / page copy | Ads action |
| --- | ---: | --- | --- |
| San Diego County | 4 | Available now | Final URL = hub. These are the only campaigns to keep live / publish. |
| South Florida | 5 | Coming this August | Final URL = hub if a campaign already exists. Do not treat as open-store ads until Mia confirms blending. |

## Campaigns last observed on 2026-07-16

Names and states only. No final URLs were stored. Ruben later reported nine South Florida and San Diego PMax campaigns.

| Observed name | Last observed state | Region | Keep live? | Final URL 2026-08-31 | Pass? |
| --- | --- | --- | --- | --- | --- |
| Replenish \| PMAX \| Carmel Mountain 19223 \| Consumer Foot Traffic | enabled | San Diego | Yes, if still SD |  |  |
| Replenish \| PMAX \| Boca \| Consumer Foot Traffic | paused | South Florida | No, until Mia confirms |  |  |
| Replenish \| PMAX \| Coral Springs \| Consumer Foot Traffic | enabled | South Florida | No, until Mia confirms |  |  |
| Replenish \| PMAX \| Miami 56 \| Consumer Foot Traffic | enabled | South Florida | No, until Mia confirms |  |  |
| Pampano Campaign | enabled | South Florida | No, until Mia confirms |  |  |
| Howard Camaign | paused | South Florida | No, until Mia confirms |  |  |

Also list any newer San Diego campaigns (Solana Beach, Miramar, Torrey Del Mar) that exist now.

## How Ruben fills this on DESKTOP / AHCM

1. Open the exact Replenish Google Ads child account.
2. Set or confirm every Replenish campaign / asset-group final URL as `https://7eleven.getreplenish.com`.
3. Leave Conversion reporting as pending validation if the conversion definition is not confirmed.
4. Do not enable or unpause a Florida campaign from this packet.
