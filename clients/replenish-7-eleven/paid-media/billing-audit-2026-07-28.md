# Replenish Google Ads billing audit

As of: 2026-07-28 ET
Account: Replenish Google Ads customer 627-501-4654
Scope: Read-only billing, payment-profile, access, and campaign-state review

## Finding

The account does not show a single $2,700 charge and does not identify Mia as the payer. The current Google Ads balance is $2,152.78. The Google payments profile, sole payments user, and ad-funding disclosure are all assigned to Dillon Mohr.

The balance is arithmetically consistent with cumulative advertising costs minus retained payments:

| Month | Net cost | Retained payments |
| --- | ---: | ---: |
| April 2026 | $29.50 | $10.00 |
| May 2026 | $515.98 | $369.50 |
| June 2026 | $3,292.67 | $3,015.98 |
| July 2026 through July 28 | $1,710.11 | $0.00 |
| Total | $5,548.26 | $3,395.48 |

Total net cost less retained payments equals the displayed balance of $2,152.78.

## Why the balance briefly looked close to $2,700

Google recorded four payment chargebacks on July 22 and July 23 totaling $1,942.67:

- Three reversed payments on July 22 totaling $1,442.67.
- One reversed payment on July 23 totaling $500.00.

Those reversals increased the running balance to $2,567.33. On July 28, Google applied $24.21 in invalid-click adjustments and a $390.34 promotional credit, reducing the balance to $2,152.78.

Google's chargeback explanation says the card issuer reported that the charges had been disputed. Google also reports that the account is suspended to prevent further advertising costs, and the primary payment method requires verification.

## Account ownership and access

- Payments profile payer: Dillon Mohr.
- Payments users: one, Dillon Mohr, primary contact.
- Direct Google Ads users: one, Dillon's Google account.
- Linked manager: Momentum Ads Manager, linked April 10, 2026.
- No unknown direct user or manager was visible in the live access review.
- The same child account contains both Replenish / 7-Eleven and Fresh Blends / Kwik Trip campaigns. Billing must therefore be reconciled by campaign and brand before assigning any client reimbursement obligation.

## Campaign-spend control already applied

Canonical item `wi-20260727-0001` records the July 26 lifetime-spend intervention:

- Pampano was paused at $958.69 lifetime spend.
- Miami 56 was paused at $623.52 lifetime spend.
- Coral Springs was paused at $579.17 lifetime spend.
- Only Torrey Del Mar, Miramar, Carmel Mountain, and Solana Beach remained enabled, each below $500 lifetime spend.

The live July 28 campaign view matched that four-campaign state. The billing account is presently suspended because of the chargebacks, so enabled campaign status is not evidence of current delivery.

## Recommended resolution path

1. Confirm with the cardholder or issuing bank whether the four chargebacks were intentional.
2. If the advertising charges were authorized, ask the issuer to allow or reverse the chargebacks, then complete Google's payment-method verification.
3. If the charges were not authorized or the campaign spend exceeded the approved client scope, leave the bank dispute intact and open a Google Ads support case using the exact dates, amounts, and transaction IDs available in Billing activity.
4. Before paying or assigning the balance to a client, reconcile June and July spend by campaign between Replenish / 7-Eleven and Fresh Blends / Kwik Trip.
5. Do not resume delivery until the payer, client allocation, lifetime caps, and payment method are explicitly confirmed.

## Safe evidence locators

- `google-ads://customer/6275014654/billing/summary?asOf=2026-07-28`
- `google-ads://customer/6275014654/billing/activity?from=2026-07-22&to=2026-07-28`
- `google-ads://customer/6275014654/billing/settings?asOf=2026-07-28`
- `google-ads://customer/6275014654/admin/access?asOf=2026-07-28`
- `queue/work-items.json#wi-20260727-0001`
