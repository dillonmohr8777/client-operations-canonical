# Replenish Google Ads final-URL readback request

**Client:** `replenish-7-eleven` only. Fresh Blends stays out.  
**Authority:** read-only account inspection. No campaign edit, pause, enable, or spend change.  
**Needed because:** Mia’s 2026-08-31 rule is one hub URL for every Replenish 7-Eleven ad. The live page audit proves the hub. It does not prove campaign final URLs.

## Exact destination to compare against

`https://7eleven.getreplenish.com`

Nothing else counts as a pass. Old short paths 404. Child `/locations/` pages are store detail, not ad destinations.

## Campaigns last observed on 2026-07-16

From `state/paid-media/daily-readback-2026-07-16.json`. Names and states only. No final URLs were stored.

| Observed name | Last observed state | Final URL 2026-08-31 | Pass? |
| --- | --- | --- | --- |
| Replenish \| PMAX \| Boca \| Consumer Foot Traffic | paused |  |  |
| Replenish \| PMAX \| Coral Springs \| Consumer Foot Traffic | enabled |  |  |
| Replenish \| PMAX \| Miami 56 \| Consumer Foot Traffic | enabled |  |  |
| Pampano Campaign | enabled |  |  |
| Replenish \| PMAX \| Carmel Mountain 19223 \| Consumer Foot Traffic | enabled |  |  |
| Howard Camaign | paused |  |  |

Also list any newer Replenish campaign that exists now and was not in that July 16 table. Ruben reported nine South Florida and San Diego PMax campaigns on 2026-08-27.

## How to fill this without mutating Ads

1. Open the exact Replenish Google Ads child account on DESKTOP or AHCM.
2. For each campaign, copy the current final URL / asset-group URL.
3. Write it in the table.
4. Mark Pass only when the URL is exactly `https://7eleven.getreplenish.com`.
5. Leave Conversion reporting as pending validation if the conversion definition is not confirmed.

Do not change the URL from this packet. A mismatch is a finding, not a live edit.
