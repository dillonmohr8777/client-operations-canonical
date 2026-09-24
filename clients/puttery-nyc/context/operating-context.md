# Puttery NYC operating context

- Last live verification: 2026-09-18
- Source scope: existing client artifacts plus read-only Toast and GA4 UI verification and public relay/dashboard health checks.

## Current objective

- Reconcile reservation exports, booking measurement, and reporting readiness for Puttery NYC.

## Verified platform state — 2026-09-18

- Toast access is active for `Puttery - New York City`; Toast Restaurant ID is `154035`.
- GA4 account hierarchy is `The Infinite Agency, LLC` -> `Drive Shack 062918` -> `Puttery - GA4`.
- GA4 property is `276233773`; web stream is `2658813519`; measurement ID is `G-STZ72WP326`.
- The GA4 web stream is receiving traffic and enhanced measurement is enabled.
- GA4 shows one completed Google Ads link: `Puttery`, customer `909-758-7272`, personalized advertising enabled, linked July 21, 2021.
- Direct Google Ads access for Dillon is still not established; a completed GA4 link does not grant Ads account control.
- `https://puttery-tock-relay.netlify.app/tock/status` returned HTTP 200 and the existing dashboard returned HTTP 200 on 2026-09-18.

## Campaigns and services

- Reservation attribution, platform access, booking validation, and the existing attribution dashboard.

## Boundaries

- Keep the canonical `puttery-nyc` identity and the existing dashboard/site association.
- The September 8 integration record describes reservation exports and webhook delivery. Confirm current receipts before reporting ongoing delivery.
- Reservation events are not paid bookings, attendance, consent, campaign revenue, or verified media spend.
- The GA4 property and stream cover `puttery.com`; they are not NYC-only. Do not report national traffic or purchases as NYC performance without location-level reconciliation.
- Toast access and identifiers are verified read-only. No Toast setting, menu, finance, employee, or guest-data change was made.
- Google Ads customer `909-758-7272` remains an access gate even though the GA4 product link is complete.
- This context file supplies local Studio documentation coverage. It does not establish complete campaign attribution or provider connectivity.
- Preserve the approved dashboard design and the existing publication and client-message gates.

## Sources

- `../CLIENT.md`
- `../README.md`
- `../deliverables/2026-09-08-tock-integration/README.md`
