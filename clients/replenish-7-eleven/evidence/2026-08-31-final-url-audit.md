# Replenish / 7-Eleven final-URL audit

**Client:** `replenish-7-eleven` only. Fresh Blends excluded.  
**Audited:** 2026-08-31 17:21–17:26 ET  
**Method:** live HTTPS GET of the owner-named destination and every store path linked from it  
**Not done:** Google Ads campaign final-URL readback, campaign mutation, page edit, or email send

## Owner rule

Mia’s rule, restated from the 2026-08-31 16:49 ET reply: every Replenish 7-Eleven ad goes to the shared all-locations page with the location finder map, not multiple URLs.

Verified live destination: `https://7eleven.getreplenish.com`  
HTTP 200. Title: `7-Eleven Real Fruit Smoothies — Find a Location | Blended Fresh in 60 Seconds`.  
Location finder and map are present. The hub links nine store pages under `/locations/`.

## Hub language that still needs owner confirmation

The hub still says `Now in San Diego County · South Florida coming soon` and `South Florida coming this August`. That is the remaining website issue. The page is not broken.

## Store pages linked from the hub

| Path | Store | Availability copy | Directions / Maps |
| --- | --- | --- | --- |
| `/locations/solana-beach-via-de-la-valle` | #4344 · 660 Via De La Valle, Solana Beach, CA | Available now | Yes |
| `/locations/san-diego-miramar-rd` | #43130 · 8920 Miramar Rd, San Diego, CA | Available now | Yes |
| `/locations/san-diego-torrey-del-mar` | #34358 · 13985 Torrey Del Mar Dr, San Diego, CA | Available now | Yes |
| `/locations/san-diego-carmel-mountain` | #19223 · 9701 Carmel Mountain Rd, San Diego, CA | Available now | Yes |
| `/locations/boca-raton-palmetto-park` | #10454 · 103 W Palmetto Park Rd, Boca Raton, FL | Coming this August / coming soon | Yes |
| `/locations/miami-howard-dr` | #37587 · 8890 Howard Dr, Miami, FL | Coming this August / coming soon | Yes |
| `/locations/miami-sw-56th-st` | #30025 · 6700 SW 56th St, Miami, FL | Coming this August / coming soon | Yes |
| `/locations/coral-springs-university-dr` | #32773 · 5615 N University Dr, Coral Springs, FL | Coming this August / coming soon | Yes |
| `/locations/pompano-beach-copans-rd` | #38236 · 1440 W Copans Rd, Pompano Beach, FL | Coming this August / coming soon | Yes |

Raw readback: `clients/replenish-7-eleven/evidence/2026-08-31-location-page-readback.json`

## Old short paths

These 404 and should not be used as ad destinations:

- `/pompano`, `/pompano-beach`, `/boca`, `/boca-raton`, `/miami`, `/miami-56`, `/carmel-mountain`, `/miramar`, `/torrey-del-mar`
- `https://getreplenish.com/locations`
- `https://www.getreplenish.com/7-eleven`

## What still requires Ads readback

This audit proves the owner page and its nine child pages. It does not prove every live campaign final URL. That check needs the authorized Replenish Google Ads account. No campaign was opened or changed.

## Recommended next local step after approval

1. Send the updated Mia draft.
2. Ask Mia whether the five South Florida stores are blending now.
3. After Ads readback, list any campaign whose final URL is not exactly `https://7eleven.getreplenish.com`.
4. Keep Fresh Blends out of every Replenish recommendation.
