# Kimberly James Bridal conversion reconciliation

Date: 2026-07-21
Status: current read-only evidence; private lead fields redacted

## Conclusion

The July 20 appointment request is attributable to Google, not Meta. The evidence proves a Google-sourced request; the final boutique confirmation is not independently represented in the available ad-platform or request-sheet records.

## Google Ads

- Account: Kimberly James Bridal, customer `814-550-6229`.
- Reporting window: July 7 through July 20, 2026, Eastern Time.
- Active campaign: `Campaign #1`, Performance Max, visible campaign ID `23690389385`.
- Asset group: `Asset Group 1`, asset-group ID `6692588072`.
- Results: 23,780 impressions, 595 clicks, 2.50% CTR, $0.47 average CPC, $277.42 spend, 1.00 conversion, $277.42 cost per conversion.
- Primary conversion action: `Submit lead form`, active website conversion, counted as primary.
- Final URL: `https://www.kimberlyjamesbridal.com/bridal-appointment-request`.
- The landing page posts a first-party appointment-request form and fires Google Ads conversion label `AW-18040733346/dXojCO69t48cEKL9vppD` after the request is accepted by the form endpoint.

## First-party request evidence

- Source: Google Sheet `Kimberly James Bridal - Appointment Requests`, `Appointment Requests` worksheet.
- A July 20 request record contains the final landing-page URL, Google as referrer, Google click identifiers, and a requested appointment date of July 25.
- No private lead name, email, phone, or message is reproduced in this artifact.
- The page states that submission does not reserve the appointment until KJB confirms it. The available evidence therefore supports `appointment request`, not independently verified `confirmed booking`.

## Meta Ads

- Account: Kimberly James Bridal, account `1249689223687250`.
- Reporting window: July 7 through July 20, 2026.
- Active campaign: `Kimberly James Bridal | Traffic | Website Carousel | Philadelphia | 2026-07`.
- Result: 224 landing-page views at $0.43 per landing-page view.
- The Leads carousel campaign remained in draft, and no Meta lead was recorded in the reviewed window.
- With zero leads, Meta CPL is undefined rather than zero.

## Limits and discrepancy

- Performance Max dynamically assembles assets, so no single fixed creative can be claimed as the converting ad. The correct unit is the campaign plus asset group.
- The landing-page request carried `gad_campaignid=23695071022`, which differs from the visible active campaign ID `23690389385`. Opening the former in the selected KJB account did not resolve to a campaign detail page. This discrepancy remains flagged for future attribution hygiene.
- No ad, spend, tracking, account, or campaign setting was changed.
