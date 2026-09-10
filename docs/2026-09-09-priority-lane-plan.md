# Priority client lane — the plan

Date: 2026-09-09
Owner: Dillon Mohr, AI Marketing Director
Scope: Nexla, Puttery NYC, Deborah Mara. **Omega Landscaping is deliberately excluded** —
it is being built in a separate active session and must not be touched from here.

## The goal

**Produce named, verifiable leads and conversions for the three priority clients within 30
days — and be able to prove which real humans they were.**

Not impressions, not clicks, not platform-reported conversions. Named people, traced back to
the campaign that produced them. That standard is the point: it is what has been promised to
clients repeatedly and not yet delivered.

## The thesis

Across all three accounts the same failure repeats, in three different costumes:

> **Everything is built except the thing that measures whether it worked.**

- **Nexla** has campaigns live and spending, and a conversion signal so contaminated it is
  actively training Google to buy spam.
- **Puttery** has a complete data pipeline, a live dashboard and 27,650 reservation states —
  and `approvedValueDefinition: null`, so no booking can be assigned a value.
- **Deborah** is about to get three ad channels pointed at a site with **zero forms**, so no
  ad click can become a lead at all.

None of these are build problems. All three are measurement problems. That is why the work
looks finished and the leads do not arrive.

**The sequencing rule that follows:** in each account, fix the measurement layer *before*
adding spend or surface area. Spending more on a broken signal does not produce more leads,
it produces a faster-learning model optimising toward the wrong outcome.

---

## Prong 1 — Nexla: cut the poisoned feedback loop

**Priority: highest.** Live spend, a visionary product, and the account is currently getting
worse every day it runs.

The mechanism, verified: a generic `form_submit` fires the Google Ads conversion instead of
the scoped `hubspot-form-success` event; the form has `captchaEnabled: false`; and **7 of 11
recent submissions were spam carrying a GCLID**. Google therefore records spam as conversions
and bids toward more of it.

Sequence:

1. **Publish the corrected conversion tracking.** GTM workspace 73, 7 staged changes, live
   version 60. Harden the listener first.
2. **Prove one accepted submission end to end.** Blocked today because the form rejects
   `gmail.com` — propose `dmohrmedia@agentmail.to` to Dana as the sanctioned test identity.
3. **Ship the valid-lead definition** the client has been waiting on since 8/31. Written:
   `clients/nexla/deliverables/2026-09-09-valid-lead-criteria-and-conversion-config.md`.
4. **Fix enhanced conversions** — currently 27% coverage. Hashed email on the success event.
5. **Then, and only then, rebuild the search campaign.** Three ad groups, 45 validated
   headlines, phrase and exact only:
   `clients/nexla/deliverables/2026-09-09-search-campaign-build/`.
6. **Offline conversion import** from HubSpot lifecycle, so bidding optimises toward
   sales-accepted leads rather than form fills. This is the step that makes the machine
   learning work for a low-volume B2B account.

**Blocked on:** HubSpot portal `3222786` access or Dana applying reCAPTCHA and gibberish
detection; a business test mailbox.

## Prong 2 — Puttery NYC: finish the measurement definition

**Priority: high.** Long-term client. The build is done and verified; keep going regardless of
the signature, which is Dillon's explicit call.

Already true and committed: Tock webhook receiving, data exports verified at HTTP 200, 13/13
receiver tests passing, credential rotated by the owner 2026-09-08, dashboard live with
27,650 reservation states.

What is missing is two null fields in `account-binding.json`:

- `approvedValueDefinition: null` — no agreed booking value, so no revenue or ROAS claim can
  ever be made
- `consentOwner: null`, `consentTreatmentStatus: pending` — no named owner for privacy and
  opt-out rules

Next: draft the booking-value, refund and consent rules so they are ready the moment a
decision-maker signs off, then the controlled consented tagged-booking trace that proves a
paid click can be traced to a real reservation. **Do not claim attribution or ROAS until the
value definition exists** — the dashboard is already correctly refusing to.

**Blocked on:** Joe or Tom naming a consent owner and approving a booking-value definition.
Not blocked on the contract for build purposes.

## Prong 3 — Deborah Mara: build the destination before the traffic

**Priority: high, and the fastest to move.** Beth asked for the audit this morning and it is
delivered.

The audit found the site has no form, no tappable phone, no email link, 19 of 32 links dead,
no `H1`, a Paris stock photo, and a page title of `Home - WordPress Blog` that is also the
`og:title` on every social share.

The recon then found the fix is far cheaper than it looks: **WPForms, Elementor Pro, Yoast and
Akismet are all already installed**, and the title bug is one untouched field in Settings →
General.

The strategic move is that **one build serves four channels**. ChatGPT Ads' documented best
practice — an answer-first, research-stage landing page — is the same asset that gives Google
Search a quality destination, gives Meta a credible one, and finally gives her owned site
something to rank for. Four pages:

1. Central NJ market reality (seller timing)
2. What's my home actually worth (valuation intent)
3. Active adult communities in central NJ (her proven niche)
4. Choosing an agent in NJ (comparison intent)

Then ChatGPT Ads on context hints, sequenced Selling → 55+ → Choosing an agent → Buying, at
$20–30/day. Full plan:
`clients/deborah-mara/deliverables/2026-09-09-chatgpt-ads-conversion-plan.md`.

**Fair Housing applies to every ad.** The 55+ angle is lawful only for genuinely
age-restricted communities, and the broker at RE/MAX Homeland REALTORS should review copy
before launch.

**Blocked on:** WordPress admin access. Application passwords are enabled, so the clean route
is Beth or Muhammad adding `dillonmohr8777@gmail.com` as an administrator — one click, fully
attributable, revocable. The credentials posted in Slack on 2026-07-30 were deliberately not
used and should be rotated.

---

## What is blocked on other people

Everything below is one message away, and all of it gates real revenue:

| Ask | Of whom | Unblocks |
|---|---|---|
| WordPress admin for `dillonmohr8777@gmail.com` | Beth or Muhammad | The entire Deborah lane |
| A business test mailbox for form testing | Dana (Nexla) | Proving Nexla conversion tracking works at all |
| reCAPTCHA + gibberish detection on the demo form | Dana (Nexla) | Stops the spam at source |
| HubSpot portal `3222786` access | Dana (Nexla) | Offline conversion import, lead grading |
| A named consent owner + approved booking value | Joe or Tom (Puttery) | Any attribution or revenue claim |

## The standard everything is held to

No claim ships without evidence on disk. Distinguish complete, drafted, blocked, degraded and
live-verified. A blocked result reported honestly beats a green one that cannot be defended —
which is exactly why Nexla's spam loop was findable at all: the 8/31 review recorded what it
actually saw rather than reporting success.
