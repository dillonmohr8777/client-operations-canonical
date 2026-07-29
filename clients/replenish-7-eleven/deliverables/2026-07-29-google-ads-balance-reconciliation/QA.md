# PDF QA

## Deliverable

- PDF: `Replenish-Fresh-Blends-Google-Ads-Balance-Reconciliation-2026-07-29.pdf`
- Source: `report.html`
- Structured evidence: `source-data.json`
- Format: four US Letter pages
- Freshness: live Google Ads and Gmail readback completed July 29, 2026 ET

## Verified checks

- The PDF opens and reports four pages at 612 by 792 points.
- All four rendered pages were visually inspected.
- No clipped headings, tables, footers, or page numbers remain.
- Replenish / 7-Eleven and Fresh Blends / Kwik Trip are separated in the campaign ledger.
- The report does not label the account as Dillon's account.
- The report does not claim Mia personally owes the full Google Ads balance.
- The report states that the chargeback reason is unknown and requires Mia's confirmation.
- The report distinguishes access to other Google Ads customers from evidence of shared billing.
- No card suffix, full card data, payment reference, payment-profile identity, credential, or secret is included.
- No payment, dispute reversal, campaign restart, or billing-profile change was made.

## Arithmetic validation

Nine deterministic checks passed:

1. Gross cost less credits equals net cost.
2. Net cost less retained payments equals the platform balance.
3. The four chargebacks sum to $1,942.67.
4. Brand totals sum to gross campaign cost.
5. Florida campaign rows sum to the Florida total.
6. San Diego campaign rows sum to the San Diego total.
7. Fresh Blends campaign rows sum to the Fresh Blends total.
8. The lower supported-exposure endpoint reconciles.
9. The upper supported-exposure endpoint reconciles.

## Review conclusion

The current Google Ads platform balance is $2,148.43. It is not presented as a finalized payable amount. The report presents a supported payment-exposure range of $1,356.00 to $1,812.68 and makes the final number contingent on written confirmation of the four July 22–23 disputes and Google's allocation of $558.78 in credits and adjustments.
