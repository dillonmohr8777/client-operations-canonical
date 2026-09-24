# Omega tracking readiness

Verified September 5,2026 UTC. Read-only static HTTP GET and local source inspection; no JavaScript execution, form submissions, calls or conversion tests. No edits/deployment. Partial readiness only.

## Served evidence, not merely local code

- https://omega-landscaping-landing-page.netlify.app/script.js returned HTTP200. It fires `form_submit` and direct Google Ads conversion `AW-16794883273/QzZeCKWOnvMbEMmptsg-` inside the browser form `submit` handler, BEFORE server acceptance. Failed/rejected submissions can therefore produce conversion attempts.
- https://omega-landscaping-landing-page.netlify.app/thank-you/ returned HTTP200. Its inline script fires the same conversion when `omega_form_conversion_fired` is absent from sessionStorage; there is no visible verified server receipt/token prerequisite. A direct visit in a fresh session can therefore trigger the conversion if that JavaScript runs. This audit fetched HTML only and did not run it.
- The shared sessionStorage flag reduces same-tab duplicates but is not a transaction/lead id. It resets with new sessions and may suppress a second genuine inquiry in the same session. No transaction_id observed in inspected handlers.
- `.tracked-phone` CLICK emits `phone_call`; this is a phone click, not connected-call or qualified-call evidence.
- Event helper sends both a dataLayer custom event and a gtag event. Duplicate measurement is a conditional risk if GTM also forwards the custom event to the same destination; actual container rules were not available in this static review.
- https://www.omegalandscapingandconcrete.com/ returned HTTP200 with Wix form markup and GTM-TRPJ69M7 consent-aware bootstrap. Container presence does not verify conversion triggers, accepted lead delivery or qualification. Do not transfer the Netlify defect finding to Wix without tracing its actual handlers/container.

## Local match and next gate

Canonical August1 landing-page script contains the same submit-time direct conversion and phone-click behavior. RELEASE.md reports August5 Netlify publish and expressly says no real submission test was performed. Thus earlier release verification does not establish accepted-lead tracking.

Root is separately resolving active ad final URLs. This pass does not establish whether active Search currently sends visitors to Netlify or Wix.

Recommended repair design, not applied: count an accepted server receipt once using a durable unique transaction key; distinguish phone_click from connected/service-qualified calls; keep micro-events secondary; require downstream receipt and deduplication before conversion-bidding certification. Direct thank-you navigation must not count as a lead. Confirm live ad destination and exact conversion-action mapping before implementing.
