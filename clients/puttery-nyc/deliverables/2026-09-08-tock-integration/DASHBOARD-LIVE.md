# Puttery NYC dashboard release

Verified September 8, 2026. [Open the live dashboard](https://nyc-entertainment-attribution-dashboard-20260804.netlify.app/).

The dashboard now presents verified Tock reservation aggregates throughout its primary reporting board. The previous example metrics have been replaced by real source counts, service-date trends, working 7-day / 30-day / all-history filters, campaign-field availability, financial-field presence, source consistency checks, and aggregate CSV/JSON downloads. The existing approved design, hand-drawn intro, motion controls and 69 discovery questions remain.

## Dated source result

The source snapshot used for this release contains 27,656 distinct latest reservation states: 27,648 export states plus the latest webhook versions. The prior 30 complete New York service days, August 9 through September 7, contain 820 records; September 1 through September 7 contains 174. Today's and future reservations are excluded from those two windows and remain separately labeled. All-history includes them. These totals update with the live source.

Within the 30-day window, 18 records carry at least one recognized campaign field name. This does not verify useful field values, consent or attribution. There are 38 source amount-equation mismatches among 820 checks; the page publishes counts only, and does not claim revenue or verified payment outcomes.

Laura confirmed that Tock walk-ins omit `reservationId` and use `walkinId`. The normalizer accepts that identifier, and the latest complete export has zero excluded rows. Delivery acknowledgements exceed processed webhook deliveries by one in the inspected receipt. That counter difference does not establish lost reservations. No version conflicts or normalized equal-version mismatches were present.

## Other source lanes

The official NYC page's Tock route, Tripleseat inquiry form and GTM-KMZKBB3 container were observed. This proves their public presence only. The dashboard records exact remaining gates for private Toast/Tripleseat sources, GA4, Google Ads, Meta, consent, tagged-booking proof, attendance and approved financial definitions. Existing Analytics and Google Ads account selectors did not identify the exact Puttery source. No other client's account was used.

Guest identifiers, reservation identifiers, click values, attendance/lifecycle breakdowns and monetary totals are excluded from the public aggregate schema and downloads. Detailed source records remain protected.

## Verification and deployment

- Dashboard site: `3d07c320-2f5a-4d74-adad-8c6ed257b19b`; final production deploy: `6aa08e5d507822aa18d15f86`.
- Relay site: `af1733a0-9da3-4cd9-b724-f84f1739667d`; aggregate endpoint deploy: `6aa04d75e223cc3fad9bb70b`.
- `dashboard-full-release-check.json`: all eight changed public files match live hashes; aggregate GET 200 and strict schema validation pass; unauthenticated POST returns 401. Actual browser-downloaded live CSV and JSON contain matching period counts, source metadata and definitions.
- `dashboard-full-browser-check.json`: desktop/mobile page inspection, 7/30/all filters, correct chart counts, keyboard focus, reduced motion, saved-fallback labeling, 69 questions, no page overflow and no live console errors. Navigation was corrected for the longer reservation section and confirmed in production.
- `dashboard-core-check.json` and `core-check.json`: service-date/merge math, invalid-date handling, strict public privacy schema, failure preservation and source snapshot guards pass. Current receiver 14/14 and relay 18/18 suites passed.
- Independent backend review approved the corrected public schema, counts, publisher, failure guards and downloads without an open blocker.
- `dashboard-full-detector.json`: 97 findings (24 warnings, 73 advisories), zero critical. The installed launcher returned 0. Existing preservation exceptions remain explicit in `dashboard-full-detector-exceptions.md`; this is not a finding-free scan.

## Runtime and follow-up

The existing five-minute operational-status task now publishes the dashboard aggregates and legacy status from one source check and verifies both readbacks. Its latest result, the export task's result and the drain task's result were 0. Receiver and NoPopupGuard remain running. Processing still requires the configured Windows host and user session available. Hosted webhook buffering and dated/stale dashboard states remain in place when that worker is unavailable.

The completion reply and walk-in handling follow-up were sent to Laura/Resy with Tom and Joe copied and read back. The access request was already sent to Joe and Tom in the onboarding thread on September 4; no Puttery access response is present, and Jesse followed up on September 8 to schedule the reconnect. No duplicate access email was sent as part of this release; see `ACCESS-STATUS-2026-09-08.md`.

Next: verify exact analytics/ad accounts and private revenue sources, trace a controlled consented tagged booking, and approve attendance/value definitions before reporting attribution, revenue or ROAS.

For rollback, use the prior production deployment from each exact site's existing Netlify history. The status launcher can be reverted to `publish-status.mjs` if reverting the dashboard endpoint; preserve existing databases, receiver, drain and protected credentials.
