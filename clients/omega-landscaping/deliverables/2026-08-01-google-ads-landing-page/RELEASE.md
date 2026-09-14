# Release record

## Production destination

- URL: https://omega-landscaping-landing-page.netlify.app
- Existing Netlify site ID: `9a636751-6274-4f1e-b285-be335f551fb6`
- Production deploy ID: `6a73502378b0c13dc7582496`
- Published: 2026-08-05

## Verification

- Production page returned HTTP 200 with the new title and Omega content signature.
- Production WebP project imagery returned HTTP 200 as `image/webp`.
- Netlify-processed POST form markup is present on the live page.
- Local JavaScript syntax validation passed.
- Local reference audit found no missing assets, duplicate IDs, horizontal overflow, or project PNG references.
- One consolidated `estimate_start` push site remains; UTM and Google click identifiers populate hidden fields.
- Landscaping and concrete panels remain readable without JavaScript; enhanced tab behavior applies when JavaScript runs.
- Independent Impeccable finish verdict: PASS after the release fix batch.
- Google Ads measurement foundation is now present on the landing page with the verified `AW-16794883273` Google tag and `GTM-TRPJ69M7` container.
- The estimate form posts to the noindex `/thank-you/` route, and the current live form conversion action is wired to the verified `AW-16794883273/QzZeCKWOnvMbEMmptsg-` event.
- Live browser readback confirmed the production URL, form action, tag scripts, and Google Ads page-view requests. A real form submission was not performed during QA to avoid creating a test lead.

## Model route

Kimi K3 with High thinking was selected and received the bounded two-page design brief, but Kimi required a login before it would run the generation. The delivered page was completed from canonical client facts, verified assets, official public-site facts, and the user-pinned design lessons without substituting another external model.

## 2026-09-14 - conversion tracking correction

- Deploy ID: `6aa845a6c3319f697d18df73`
- Site: `9a636751-6274-4f1e-b285-be335f551fb6` / omega-landscaping-landing-page.netlify.app
- Source commit: `34c456c`

**What was wrong.** The Google Ads conversion fired inside the form's `submit`
handler, i.e. on click, before Netlify accepted the POST and before
`netlify-honeypot="bot-field"` filtered bots. Every bot the honeypot caught,
every validation failure and every abandoned submission was reported to Google
as a conversion. Smart Bidding optimised against that number.

**What changed.** The submit handler now only sets a one-shot
`omega_submit_pending` marker. `/thank-you/` consumes that marker and fires the
conversion, and Netlify serves that page only on a genuine acceptance. A direct
visit, bookmark, shared link or refresh no longer counts. Private-mode fallback
requires a same-origin referrer.

**Expect reported conversions to fall.** The previous number counted things that
were never leads. The new number is the first one that can be reconciled against
real leads.

**Verified live after deploy:** `script.js` HTTP 200, premature fire absent from
the submit handler, `omega_submit_pending` present in both files, `/thank-you/`
HTTP 200, index/CSS/logo all HTTP 200.

`conversion-gate.test.js` covers all six paths plus a regression guard that fails
if the premature fire is reintroduced. Run it before any future deploy of this
page. Internal docs, QA screenshots and the test file are deliberately excluded
from the published bundle.
