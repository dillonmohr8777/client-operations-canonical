# Onsite tracking readiness

Verified September5,2026 UTC. Read-only static HTTP GET and local source inspection; no JavaScript execution, form submissions, calls or conversion tests. No edits/deployment. Partial readiness only.

## Served evidence

- https://onsite-gads-landing-page.netlify.app/script.js returned HTTP200. The form `submit` listener pushes `contact_form` before accepted server receipt. This is submission-attempt telemetry, not proof of a delivered lead.
- The same served script emits `phone_call` on `.tracked-phone` CLICK. It does not observe connection, duration or service qualification.
- Event helper pushes only if window.dataLayer is already an array. No inline GTM/gtag/dataLayer initialization was found in the fetched landing-page HTML (HTTP200). Therefore an installed functioning measurement destination cannot be certified from this page/source; absence here is not a complete runtime inventory.
- Netlify-processed POST form markup exists. That proves form markup, not delivery or qualification. The visible submit handler disables its button but has no durable event/lead transaction key or accepted-receipt check.
- https://onsiteconcretelandscape.com/ returned HTTP202 without usable tracking/form evidence in this bounded fetch. Main-site tracking remains unverified; no attempt to bypass the response.

## Local evidence and next gate

Canonical August1 source contains the same submit-attempt and phone-click behavior. RELEASE.md records HTTP/markup/visual QA, not accepted lead receipt or qualified-estimate reconciliation.

Parent's fresh Ads-grid readback identifies sole enabled RSA destination as https://onsiteconcretelandscape.com/services/, NOT Netlify. Independent static fetch of that exact URL returned HTTP202,179bytes,no title or usable tracking/CTA signals. Its active tracking path remains unverified. Netlify findings above are alternate-release hazards, not evidence of an active-campaign defect. A normal rendered-page inspection is the next read-only step.

Recommended repair design, not applied: distinguish form_attempt from accepted contact receipt and phone_click from connected call; map one durable unique qualified-estimate outcome, verify receipt/deduplication and exclude tests before conversion bidding. Do not promote these browser events to qualified calls/estimates by renaming alone.

Parent reports separately removing the broad negative `free` (15to14); this verifier did not inspect that provider change and makes no independent readback claim for it.
