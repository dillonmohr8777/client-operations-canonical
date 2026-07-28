# Replenish and Fresh Blends Google Ads cost audit

As of: 2026-07-28 ET
Account: Google Ads customer 627-501-4654
Scope: Replenish / 7-Eleven and Fresh Blends / Kwik Trip campaign costs only

## Finding

The account does not show a single $2,700 charge. It shows $6,106.52 in gross campaign costs accumulated across 13 Replenish and Fresh Blends campaigns from April 1 through July 28. Google applied $558.26 in credits, leaving $5,548.26 in net advertising costs. After $3,395.48 in retained payments, the displayed balance is $2,152.78.

| Brand | Campaigns | Gross campaign cost | Share |
| --- | ---: | ---: | ---: |
| Replenish / 7-Eleven | 9 | $4,005.86 | 65.6% |
| Fresh Blends / Kwik Trip | 4 | $2,100.66 | 34.4% |
| Total | 13 | $6,106.52 | 100.0% |

This explains how the balance became large. Each campaign had a $16.67 daily budget. That was a per-campaign budget, not a combined client ceiling. Thirteen simultaneous campaign budgets represent potential exposure of up to $216.71 per day.

## Monthly campaign-cost build

| Month | Replenish | Fresh Blends | Gross campaign cost |
| --- | ---: | ---: | ---: |
| April 2026 | $29.58 | $0.00 | $29.58 |
| May 2026 | $516.40 | $0.00 | $516.40 |
| June 2026 | $1,489.61 | $1,943.76 | $3,433.37 |
| July 1 through July 28 | $1,970.26 | $156.90 | $2,127.16 |

The monthly allocation differs by one cent from the all-time brand totals because Google rounds displayed campaign rows independently.

## Replenish cost review

The written approval trail establishes a $500 per-location cap for the five South Florida campaigns:

- On May 26, Mia wrote, "We budgeted $500 per each location. Please let me know when each location reaches its limit."
- On June 17, Mia wrote, "Can all ads run until they hit $500?" She separately said Pompano was paused at $434 and should not restart until she confirmed.
- The June 24 meeting recap authorized restarting Pompano with Google credit, and the June 29 report stated that Pompano was back on. Pompano's post-cap cost therefore must be reconciled against the Google credit before it is treated as client-billed overage.

| Campaign | All-time gross cost | Position against $500 cap |
| --- | ---: | ---: |
| Pampano | $957.57 | $457.57 over |
| Miami 56 | $623.52 | $123.52 over |
| Coral Springs | $579.17 | $79.17 over |
| Howard | $550.82 | $50.82 over |
| Boca | $483.21 | $16.79 below |

The positive campaign-level overages total $711.08. Across all five Florida campaigns, gross cost was $3,194.29 against $2,500 in documented per-location caps, an aggregate difference of $694.29. Of the positive overages, $457.57 is Pompano and must be reconciled against the authorized Google-credit restart. The other three above-cap campaigns account for $253.51 in gross cost beyond their individual limits.

The four San Diego campaigns were separately approved for launch, but the reviewed email and meeting evidence does not contain an exact campaign-spend ceiling:

| Campaign | All-time gross cost |
| --- | ---: |
| Torrey Del Mar | $242.91 |
| Miramar | $242.07 |
| Carmel Mountain | $237.43 |
| Solana Beach | $89.16 |
| Total | $811.57 |

Canonical item `wi-20260727-0001` records the July 26 intervention that left only Torrey Del Mar, Miramar, Carmel Mountain, and Solana Beach enabled. The July 28 live view matched that four-campaign state.

## Fresh Blends cost review

The Fresh Blends approval trail also establishes a $500 per-location limit. On July 6, the four Kwik Trip campaigns were reported as paused because they had reached their $500 limits; on July 9, Mia confirmed, "We will pause for now."

| Campaign | All-time gross cost | Position against $500 cap |
| --- | ---: | ---: |
| Kwik Trip 633 | $527.66 | $27.66 over |
| Kwik Trip 1161 | $526.65 | $26.65 over |
| Kwik Trip 1110 | $526.08 | $26.08 over |
| Kwik Trip 573 | $520.27 | $20.27 over |
| Total | $2,100.66 | $100.66 over |

All four Fresh Blends campaigns are paused. The gross campaign-level amount above the four documented limits is $100.66.

## Why the balance briefly looked close to $2,700

Google recorded four payment chargebacks on July 22 and July 23 totaling $1,942.67:

- Three reversed payments on July 22 totaling $1,442.67.
- One reversed payment on July 23 totaling $500.00.

Those reversals increased the running balance to $2,567.33. On July 28, Google applied $24.21 in invalid-click adjustments and a $390.34 promotional credit, reducing the balance to $2,152.78.

The current balance therefore reflects platform-recorded campaign costs minus credits and retained payments. It is not evidence that one person or one brand independently owes the entire amount. The account-level credits are not allocated by brand in the billing view, so the exact Replenish-versus-Fresh-Blends balance cannot be assigned from the displayed $2,152.78 alone.

## Recommended resolution path

1. Preserve the current paused or billing-suspended state; do not resume delivery.
2. Reconcile the $457.57 Pompano over-cap amount against the Google-credit-backed restart and allocate all $558.26 in account credits.
3. Treat $253.51 in other Replenish Florida over-cap cost and $100.66 in Fresh Blends over-cap cost as documented gross variances requiring explanation.
4. Confirm the exact San Diego spend authorization for its separate $811.57 ledger.
5. Do not represent the $2,152.78 account balance as a personal obligation or assign it to either brand without allocating payments and credits.
6. Prepare a Google Ads billing-support case with the campaign caps, costs, credit-backed Pompano restart, credits, retained payments, and chargebacks. Do not submit the case, release chargebacks, pay the balance, or resume delivery without exact approval.

## Safe evidence locators

- `google-ads://customer/6275014654/campaigns?date=20260401-20260728`
- `google-ads://customer/6275014654/billing/summary?asOf=2026-07-28`
- `google-ads://customer/6275014654/billing/activity?from=2026-07-22&to=2026-07-28`
- `queue/work-items.json#wi-20260727-0001`
