# GT Clinic — answers to the five intake questions

Client: `gt-clinic` (GT Aesthetic & Functional Medicine), Ghazala Farooqui MD, Marlton NJ
Source of the questions: `intake/2026-09-21-intake-form.md`, "Any questions for us?"
Prepared: 2026-09-22
**Status: draft. Not sent. No client contact, publication, campaign change or spend is authorised by this file.**

Everything below is grounded in account data read on 2026-09-22 or in current Google policy, not in
assumption. Where something is unverified it says so.

---

## What was verified before answering

| Item | Value | How |
|---|---|---|
| GA4 property | `properties/531064094` ("thegtclinic.com", account "GTAesthetics", 165890074) | GA4 Admin API, 2026-09-22 |
| GA4 web stream | `14302649010`, measurement ID `G-PY8223SGRW`, created 2026-04-03 | GA4 Admin API |
| GA4 reporting window read | 2026-04-01 → 2026-09-21 | GA4 Data API |
| Google Ads account | **Not reachable this session.** See "Known blockers" | Two separate API routes, both failed |
| Google Search Console | **No `thegtclinic.com` property exists** on either connected account | GSC `listSites`, 2026-09-22 |

Recording the GA4 property ID closes a gap that had been open since 2026-09-16: access was granted, but
nobody had written down which property it was, so nobody could pull a number.

### Traffic baseline, 2026-04-01 → 2026-09-21

2,185 sessions total.

| Channel | Sessions | Active users |
|---|---|---|
| Direct | 839 | 612 |
| Organic Search | 684 | 315 |
| Paid Search | 340 | 312 |
| Organic Social | 231 | 198 |
| Referral | 39 | 26 |
| Unassigned | 18 | 17 |
| AI Assistant | 17 | 9 |
| Cross-network | 12 | 12 |
| Paid Social | 5 | 5 |

Paid Search by month: **May 147, June 65, July 45, August 43, September 40** (September partial, through
the 21st). Delivery fell roughly 70% from the launch month and has been flat since. That is consistent
with her own description — "only a couple of inquiries and not many are converting."

The 17 **AI Assistant** sessions matter more than their size suggests: it is a real, already-measurable
baseline for the AI-visibility work she asked about in question 4.

### The finding that changes everything

**Lead events are firing on the site. None of them are marked as key events in GA4.**

Event counts over the same window:

| Event | Count |
|---|---|
| `form_start` | 62 |
| `contact` | 37 |
| `laser_hair_removal_lead` | 27 |
| `lead_form_submit` | 26 |
| `wrinkle_relaxer_lead` | 6 |
| `form_submit` | 4 |
| `microneedling_lead` | 4 |

`keyEvents` across every channel: **0**.

Someone already instrumented service-level lead tracking, including per-service events for two of her
four priority services. The events collect correctly. But because none is flagged as a key event, GA4
reports no conversions, Google Ads has nothing to import, and every report anyone runs shows a blank
where the results should be.

So the honest position is not that the marketing is not converting. It is that **conversion reporting is
pending validation** — the measurement was never switched on. The practice may well have been generating
leads it could not see for five months. That has to be verified against her actual inquiry log before
anyone claims a number in either direction.

One caution before anybody quotes these figures: the per-service events and `lead_form_submit` do not sum
cleanly, so some are likely firing together on the same submission. Deduplication is required work before
a single one of these becomes the official conversion.

---

## The five answers

### 1. How will you determine which services should receive the highest SEO and Google Ads priority?

Three inputs, in this order.

**Your stated priority comes first.** You named laser hair removal, hair rejuvenation, melasma and
hyperpigmentation, and microneedling. That is the starting list and we are not going to quietly
substitute our own.

**Then what the data already says.** Two of your four are already instrumented — `laser_hair_removal_lead`
(27) and `microneedling_lead` (4). Once the key events are switched on and deduplicated, we will know
within weeks which service actually produces inquiries per session, not just which produces traffic. That
number, not opinion, decides where budget concentrates.

**Then what is legally advertisable.** This is the part that reorders the list, and it is covered in
question 5's companion note below. Short version: hair rejuvenation, as you practise it, is PRP-based, and
PRP cannot be advertised on Google Ads. That does not demote it as a service — it moves it from paid
acquisition to SEO, content and AI visibility, where there is no such restriction.

Working split, for your approval rather than as a decision already made:

- **Paid Search:** laser hair removal, microneedling, melasma / hyperpigmentation. All three are
  advertisable, all three match your stated priorities, and one already has tracking.
- **SEO, content and AI visibility:** PRP hair restoration and regenerative medicine, plus functional
  medicine. These are where your genuine differentiation lives and where the advertising restrictions do
  not reach.

### 2. How will you track leads from Google Ads, organic search, Google Business Profile, phone calls and website forms, so we can determine which channels are generating booked patients?

This is the most important question you asked, and it is the one we can make real progress on immediately
because most of the work turns out to be already done.

**Step 1 — switch on what exists.** Mark the lead events as key events in GA4 and deduplicate the
overlapping ones so a single submission counts once. This is a configuration change, not a build.

**Step 2 — two conversion definitions, not one.** Your funnel does not have a single shape, so a single
conversion metric would misreport it:

- **Aesthetic enquiries** convert at *qualified enquiry* — form submitted or call answered, screened, and
  matched to a service you actually offer.
- **Medical / functional consultations** convert at *paid booking* — the non-refundable $100 booking fee.
  That fee is a genuine commitment signal and it is a far better measure of a real patient than a form
  fill. It also gives us a clean, unambiguous event to optimise toward.

Reporting both separately means an aesthetic lead is never quietly counted as equivalent to a booked
medical consult.

**Step 3 — close the channels that are currently invisible.**

- *Phone calls.* Nothing is tracked today. Call tracking with a dynamic number on the website, and a
  separate number on the Google Business Profile, so a call can be attributed to a channel. Your main
  line stays exactly as it is.
- *Google Business Profile.* Its own action metrics — calls, direction requests, website clicks — reported
  separately, as you asked on 2026-09-02.
- *Organic vs paid.* Already separated in GA4 once step 1 is done.
- *Forms.* We still need to confirm where submissions actually land — which inbox or system receives them.
  That is the one genuinely missing piece and it is a five-minute answer from whoever set up the site.

**Step 4 — the match-back.** Monthly, we reconcile the conversions the platforms report against the
inquiries you actually received and the appointments actually booked. You get named-lead level
reconciliation, not just a platform total. This is the part most agencies skip; it is the reason the
booking-fee event above matters so much.

**Step 5 — feed it back.** Once bookings are measurable, qualified bookings (not clicks) become the
optimisation target in Google Ads.

We are not going to report a conversion figure to you until steps 1 and 2 are done and validated. A number
produced before then would be wrong.

### 3. Will you provide local keyword ranking reports for Marlton and surrounding target areas?

Yes, and separately for the three surfaces you asked to see separately on 2026-09-02:

- **Website rankings** for your target keywords across Marlton and the surrounding towns.
- **Google Maps / local pack rankings**, reported by geography, since local rank varies by where the
  searcher is standing. Marlton is the centre; the surrounding towns are measured on their own.
- **AI visibility**, covered in question 4.

One gap to flag honestly: **there is no Google Search Console property for thegtclinic.com.** It was not on
the access form and has never been set up. Search Console is the only first-party source of what people
actually search before they reach you — impressions, queries, average position. Until it exists we are
working from third-party rank estimates, which are directionally useful but not your real data. Setting it
up is quick and it is on our list to request.

### 4. How will you improve our visibility in AI-generated search results?

You already have a measurable starting point: 17 sessions from the AI Assistant channel between April and
September. Small, but it means AI tools are already sending people to you and we can track whether that
number grows.

The work itself:

- **Structured content and schema** — Physician, MedicalBusiness, MedicalProcedure and FAQPage markup, so
  an AI system can state unambiguously who you are, that you are board certified in Internal, Pulmonary
  and Sleep Medicine and fellowship trained in Integrative Medicine, and that every procedure is performed
  by a physician.
- **Clear, quotable answers.** AI systems cite passages that directly answer a question. Your explanation
  of why multiple treatments are needed, and why you take a conservative approach with darker skin tones,
  is exactly the kind of substantive content they surface — and it is content your competitors mostly do
  not have.
- **Local authority and consistency** — consistent NAP, citations, and a complete Google Business Profile,
  because AI answers about local practices lean heavily on those signals.
- **Reporting** — tracked AI mentions, reported monthly alongside the other two surfaces.

Your physician credentials and regenerative-first positioning are a genuine advantage here. Generic med
spas have nothing comparable to cite.

### 5. After the first 60–90 days, how will you use to determine whether the strategy is working, and what should be adjusted?

Against a baseline we can now actually state, because it is measured rather than assumed: 2,185 sessions
across roughly six months, the channel mix in the table above, paid search at ~40–45 sessions a month and
declining, and conversion reporting pending validation.

At 30 days we expect: key events live and deduplicated, call tracking in place, Search Console live, and
the first month where a conversion number means something.

At 60 days: enough qualified-enquiry volume by service to see which of the three advertisable services
actually converts, and the first match-back reconciliation against your own inquiry log.

At 90 days: a decision point. Budget concentrates on whatever is producing booked patients at a defensible
cost, and anything that is producing traffic without bookings gets changed or stopped.

What we would act on before 90 days rather than waiting: a service producing enquiries that do not qualify
(targeting or messaging problem), a tracked call volume that does not match what your front desk actually
experiences (measurement problem), or a policy disapproval (fix immediately).

What we will not do is claim an improvement we cannot evidence. As agreed at signing, we cannot guarantee
the magnitude of improvement, and no report from us will imply otherwise.

---

## Companion note: BOTOX and PRP on Google Ads

You asked directly whether these are banned terms. Checked against current Google policy on 2026-09-22.

**PRP — effectively cannot be advertised on Google Ads.** Google's policy on speculative and experimental
medical treatment restricts cell and gene therapies and "similar forms of regenerative medicine", and
names platelet-rich plasma explicitly. There is a narrow United States exception for FDA licensed or
approved cell or gene therapies, available to the entity that holds the relevant FDA licence or approval
for that product. A practice administering autologous PRP does not hold such a licence, so the exception
almost certainly does not apply. This should be confirmed with Google directly before it is treated as
final, but plan on the restriction holding.

**What this means practically.** "PRP Hair Restoration Marlton NJ" and "PRP Therapy Marlton NJ" — two of
your ten keywords — should not go into a Google Ads campaign. PRP content on a landing page that a
campaign points at can also trigger disapproval of the whole ad, so the paid landing pages need to be kept
clear of it. None of this restricts your website, your SEO, your Google Business Profile, or AI visibility.
PRP and regenerative medicine remain central to who you are; they move to the organic side of the plan.

**BOTOX — usable, with care.** Botox is a prescription drug brand name and falls under Google's restricted
drug terms. Clinics administering it are in scope. In practice the durable approach is to advertise the
*treatment* rather than the *brand* — which is why the existing tracking on your site already uses
`wrinkle_relaxer_lead` rather than a brand name. Someone made that choice correctly before we arrived.
Expect "limited by policy" behaviour if the brand name appears in ad text, keywords, or on the destination
page.

Neither of these is a reason to change what you offer. They change where each service is marketed.

Sources: [Speculative and experimental medical treatment, cell therapies, and gene therapies](https://support.google.com/adspolicy/answer/15596627?hl=en) · [Healthcare and medicines](https://support.google.com/adspolicy/answer/176031?hl=en) · [Restricted drug terms](https://support.google.com/adspolicy/answer/15595717?hl=en) · [Prescription drugs](https://support.google.com/adspolicy/answer/2430794?hl=en)

---

## Companion note: the geography

Your intake gave two targeting instructions that appear to conflict — a 10-mile radius from Marlton, and
a list of nine zip codes. They conflict less than they look.

Marlton is 08053. Mount Laurel (08054), Medford (08055), Voorhees (08043), Moorestown (08057) and the
eastern and central parts of Cherry Hill (08003, 08034) all sit inside roughly ten miles. The one genuine
edge case is **08002**, north-west Cherry Hill, which is around the ten-mile boundary or just past it.

So the recommendation is a 10-mile radius centred on Marlton, which satisfies your stated intent —
high-intent patients close to the practice, not broad low-intent reach — and captures eight of your nine
zips. The single question worth asking you is whether 08002 should be included deliberately or allowed to
fall outside. Exact boundaries should be confirmed against Google's own geo targets when the campaign is
built rather than taken from this note.

Your hours — Tuesday by appointment, Wednesday 10–5, Thursday 10:30–7 — also need to be right on the
Google Business Profile before local work begins, and they shape ad scheduling and call handling, since
most enquiries will arrive when the practice is closed.

---

## Known blockers

1. **Google Ads is not reachable from this environment.** Two independent routes were tried on 2026-09-22.
   The native Google Ads integration fails OAuth refresh (`invalid_grant`). The Composio `googleads`
   connection is pinned to customer `6908592139`, which Google reports as deactivated
   (`CUSTOMER_NOT_ENABLED`); that dead identifier appears to be applied to every request, so all 17
   otherwise-accessible customer accounts return `USER_PERMISSION_DENIED`. **Fix is a connection
   configuration change — repoint it at a live manager account — which is approval-gated and was not
   attempted.** Until then: campaign structure, spend, search terms and the Ads customer ID remain
   unread. This is the one remaining item from priority 1 that could not be completed.
2. **No Google Search Console property exists** for thegtclinic.com. Confirmed against the full site list
   on both connected accounts.
3. **Form submission destination is still unknown.** The last genuinely missing piece of the match-back.
4. **GA4 property time zone is `Etc/UTC`,** not `America/New_York`. Day boundaries in every report are
   offset for a New Jersey practice. Worth correcting before the first report, and it is an admin change,
   not a rebuild.
5. Hosting and WordPress credentials, supplied by the client on 2026-09-16, are still unmapped to
   Bitwarden or the access broker.

## Before any of this reaches the client

- Dillon approves the exact content.
- The two conversion definitions are confirmed with Ghazala, since they are her business rules, not ours.
- Nothing here is sent, posted or published on the strength of this file.
