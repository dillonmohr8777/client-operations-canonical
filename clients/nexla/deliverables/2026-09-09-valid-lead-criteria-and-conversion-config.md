# Nexla — valid lead criteria, conversion configuration, and the machine-learning fix

Date: 2026-09-09
Owner: Dillon Mohr, Account Manager
Status: Ads-side applied 2026-09-10 (custom goal + Primary flags + paused-budget disarm). GTM workspace 73 still holds 7 unpublished changes. See `2026-09-10-ads-config/`.

## The finding that matters most

**The account is currently training Google's bidding model to buy spam.**

Not "attracting some junk" — actively teaching the algorithm that junk is the goal.
The mechanism, from evidence already in this folder:

1. The 2026-08-31 spam review found 11 HubSpot submissions across 8/28–8/30. Almost all
   show junk signals: repeated fake identities, keyboard-mash text, the placeholder phone
   `1-201-555-0123`, recurring low-confidence domains.
2. **Seven of those 11 carried a GCLID** with `utm_source=adwords`, `utm_medium=ppc`,
   campaign `G_US_PMAX_NB_MCP-Agentic`. A GCLID means Google can tie that submission back
   to the exact click and the exact auction.
3. The GTM container fires the Google Ads conversion from a **generic `form_submit`
   event**, not from the real `hubspot-form-success` event.
4. `captchaEnabled: false` on the form.

Chain it together: a bot fills the form, the generic `form_submit` fires, Google records a
conversion against that GCLID, and Smart Bidding concludes that clicks which look like that
one convert. It then bids up toward more of exactly that traffic. Every spam submission
makes the next day's targeting worse. This is a compounding loss, and more budget
accelerates it.

**Nothing else in this document matters until that loop is cut.** That is the honest answer
to why the account is not producing leads.

## 1. Primary conversion — exactly one

| Field | Value |
|---|---|
| **Primary conversion action** | `HubSpot — Demo Request (Qualified)` |
| Fires from | `hubspot-form-success` custom event, from `onFormSubmitted` |
| Scoped to | HubSpot form `663d7e71-eb1c-4e1b-94fe-61cac6f16a90` |
| Landing page | `https://nexla.com/lp/mcp-servers/` (Variant A, chosen 2026-08-25 because it exposes a form in the hero and again near the page bottom) |
| Google Ads | conversion ID `10857703077`, label `lf1HCMiSo_4ZEKXNrbko`, count **once per click** |
| GA4 | `generate_lead`, property `G-31E5ZZR019`, same scoped success trigger |
| Campaign goal membership | Must be the **only** Primary action in the MCP Search campaign's goal set |

Everything else — page views, scroll, video, newsletter, generic `form_submit` — is
**Secondary, observation only, excluded from bidding**. The existing `HubSpot-Demo Request`
action is currently Secondary with no recent tag data; it gets superseded by the action
above rather than repaired.

A single primary action is not a simplification. Smart Bidding blends every Primary action
in the goal set, so a second one silently dilutes the signal.

## 2. Valid lead criteria

This is the definition the client has been waiting on since the 8/31 report. A submission
counts as a **valid lead** only if all of the following hold.

**Must have all four:**

1. **Business email domain.** Not free, not disposable. The form's free/disposable block
   list is already enabled, and it already rejects `gmail.com` — that is why the 9/5 test
   submission was refused.
2. **Coherent identity.** First and last name are plausible human text. Not keyboard mash,
   not repeated characters, not a single letter.
3. **Real company.** Company name resolves to an actual organisation, and the email domain
   is consistent with it.
4. **Real phone, or no phone.** A supplied phone must not be `1-201-555-0123` or another
   555 placeholder range. A blank optional phone is fine and is **not** a disqualifier.

**Automatic disqualification, any one of these:**

- Matches a known-spam pattern from the 8/31 sample
- Competitor domain on the existing manual block list
- Momentum's own measurement tests, which must carry a marked test identifier such as
  `NEXLA-20260905-01` and must never be counted as a prospect
- Duplicate of an existing submission from the same email within 30 days
- Gibberish in the free-text fields

**Explicitly NOT a disqualifier, and this one matters:**

> **The presence of a GCLID is not a spam signal.** It only identifies paid traffic.
> Filtering or blocking on GCLID would suppress exactly the legitimate ad leads the campaign
> exists to produce, while leaving the actual spam untouched. The 8/31 review flagged this
> and it still stands. Do not let anyone "fix" spam by excluding paid traffic.

**Grading beyond valid.** Valid is the floor, not the goal. Three tiers, mapped to HubSpot
lifecycle so they can be fed back to Google:

| Tier | Definition | Google Ads treatment |
|---|---|---|
| **Valid lead** | Passes all four tests above | Counted, value 1 |
| **Qualified (MQL)** | Valid, plus a real use case for a data layer, MCP, or AI agent pipeline | Offline import, higher value |
| **Sales-accepted (SQL)** | Sales accepted it and booked a meeting | Offline import, highest value |

## 3. The real fix — offline conversion import

Online form fills alone cannot tell Google which leads were any good. At this volume, that
is the whole game.

**Import HubSpot lifecycle outcomes back into Google Ads against the stored GCLID.** Smart
Bidding then optimises toward leads sales actually accepted, rather than toward whatever
filled in a form.

Requirements:

1. GCLID captured on the form and written to a HubSpot property on every submission.
2. A scheduled export of GCLID, conversion name, conversion time, and value.
3. Two offline conversion actions in Google Ads: `Nexla — MQL` and `Nexla — SQL`.
4. Upload on a schedule, inside Google's 90-day click-to-conversion window.

**Proposed values.** Placeholders until Jayashree or Dana confirm real economics. They must
end up as ratios that reflect actual pipeline value, not invented numbers:

| Action | Value | Meaning |
|---|---|---|
| Valid lead | 1 | a human with a real business address |
| MQL | 5 | a plausible Nexla use case |
| SQL | 25 | sales accepted, meeting booked |

Once 15 or more SQLs exist in a 30-day window, switch bidding to **Maximise conversion value
with a tROAS**. Before that, tCPA on the MQL action.

## 4. Enhanced conversions

Coverage is **27%**. That is the difference between Google seeing a quarter of the outcomes
and seeing nearly all of them. Enhanced conversions for leads sends a hashed email with the
conversion so Google can match clicks it would otherwise lose.

Fix: send the hashed email address with the `hubspot-form-success` event through the existing
Google Ads tag. Target 80% or better. This is the cheapest accuracy gain available and it
does not need client sign-off — it is a tagging change, and what is transmitted is hashed.

## 5. Bidding, staged to the volume that actually exists

At $65.75 a day and a $3.54 CPC the account buys roughly **18 clicks a day, about 550 a
month**. At a realistic B2B landing-page conversion rate of 2–5%, that is **11–27 valid leads
a month** — at or below the threshold where Smart Bidding learns reliably.

The consequence: **do not hand this account to tCPA on day one.** It will not have the volume
to learn, and while the spam loop is open it will learn the wrong thing twice as fast.

| Phase | Trigger | Bidding | Why |
|---|---|---|---|
| **1. Clean** | now | Manual CPC or Maximise clicks, tight match types | Buy clean traffic and collect honest data. No smart bidding on a poisoned signal. |
| **2. Learn** | 15+ valid leads in 30 days | Maximise conversions, no tCPA cap | Let it find the shape before constraining cost |
| **3. Control** | 30+ valid leads in 30 days | tCPA on the MQL action | Enough volume to hold a target |
| **4. Value** | 15+ SQLs in 30 days | Maximise conversion value, tROAS | Optimises to pipeline, not form fills |

Brand Exact stays protected and separate at $25/day. Brand and nonbrand must never share a
campaign — Brand's 21.06% CTR would mask nonbrand's true performance and hand the algorithm
a misleading blend.

## 6. Search-term hygiene

The PMax nonbrand campaign `G_US_PMAX_NB_MCP-Agentic` is the source of every GCLID-bearing
spam submission in the sample. PMax on broad B2B nonbrand with no clean conversion signal is
a spam magnet: maximum surface area, minimum control.

The 9/3 move to a **Search-only, US, 07:00–19:00 Central weekday** MCP campaign is the right
call and this plan assumes it holds. Add:

- Weekly search-term review, negatives added at campaign level
- Standing negative list: `jobs`, `salary`, `career`, `tutorial`, `free`, `download`,
  `github`, `open source`, `course`, `certification`, `intern`, `resume`
- Phrase and exact match only on nonbrand until Phase 3
- Keep **Enterprise Data Layer** paused until a matching landing page exists. Sending that
  intent to an MCP Studio form is a guaranteed bounce, and the 8/25 readiness review already
  said so.

## 7. Publication checklist — GTM workspace 73

Seven changes are staged and reviewed. Live version is 60.

- [ ] Harden the HubSpot listener for null/origin handling and duplicate success events *(flagged in the 9/5 receipt, still open)*
- [ ] Confirm the legacy `form_submit` exclusion covers the MCP landing page
- [ ] Confirm the Google Ads tag fires once per page, on `hubspot-form-success` only
- [ ] Confirm GA4 `generate_lead` shares the same scoped trigger
- [ ] Add hashed email to the Google Ads tag for enhanced conversions
- [ ] Preview the full accepted-submission and tag-firing sequence end to end
- [ ] Verify campaign goal membership points at the exact conversion action
- [ ] Publish, then re-verify against live version 61

**The blocker, and its fix.** The 9/5 review could not complete an accepted test submission:
the form rejects `gmail.com`, so no conversion has ever been proven end to end. An authorised
business test mailbox is needed. **`dmohrmedia@agentmail.to` is already in use on this machine
and is not a free-mail domain** — propose it to Dana as the sanctioned test identity, marked
with a test token so §2 excludes it from lead counts.

The staged spam guard is browser-side only. It does not replace reCAPTCHA on the form, which
remains a HubSpot-side change Dana has to apply, along with account-wide gibberish detection
if the subscription supports it.

## What is not claimed here

No conversion has been proven firing end to end. No qualified lead has been validated. No GTM
change has been published and no HubSpot setting has been altered. The connected HubSpot app
still requires reauthentication and is not mapped to Nexla portal `3222786`, so section 3
cannot be built until that access lands or Dana applies it.

Every figure above is read from evidence in this folder rather than estimated: $742.72 August
spend, 210 clicks, $3.54 CPC, 21.06% Brand Exact CTR, 27% enhanced-conversion coverage, 11
submissions, 7 carrying a GCLID, 7 unpublished GTM changes, live version 60.
