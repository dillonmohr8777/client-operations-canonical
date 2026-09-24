# Onsite Concrete & Landscape — plan from the 2026-09-16 call

**Call:** Onsite x Momentum, 2026-09-16 12:00 PM EST
**On it:** Dillon Mohr, Sean (needmomentum.com), Gracie, Nikki (onsiteclp@gmail.com)
**Source:** Fireflies recap `01M20J3SEX771QX9576T3WW4S6`, overview section
**Account evidence:** Google Ads CID 103-371-5894, pulled live 2026-09-16
**Status:** draft for Dillon. Nothing sent, nothing changed on the client's behalf beyond the one enable noted in section 2.

---

## 1. The headline is not the ads, it is the pivot

Nikki is moving the business toward **window blinds**. Concrete landscaping in
Solano County is saturated and unlicensed contractors are undercutting on price.
Everything below is arranged around that, because a plan that optimises concrete
spend while the owner exits concrete is the wrong plan.

Dillon's action item from the call: **audit the blinds market and what the ads
need**. That is section 5.

---

## 2. A correction the call did not have

The call concluded that Google Ads drives traffic but converts poorly. That is
true of the campaign that was running, and false of the account.

| Month | Campaign | Spend | Clicks | Conversions |
| --- | --- | ---: | ---: | ---: |
| June | Leads-Performance Max-1 | $119.72 | 203 | **35** |
| June | Onsite Concrete & Landscape (Smart) | $116.97 | 608 | 2 |
| July | Leads-Performance Max-1 | $121.88 | 297 | **44** |
| July | Onsite Concrete & Landscape (Smart) | $125.19 | 1,056 | 0 |
| Aug | Leads-Performance Max-1 | $0 | 0 | 0 |
| Aug | Onsite Concrete & Landscape (Smart) | $88.07 | 538 | 4 |
| Sep to 16th | all | $6.40 | 2 | 0 |

Performance Max produced **79 conversions across June and July** for about $241,
roughly **$3.05 per contact**. Broken down: 54 Web Phone Calls, 25 Web Contact
Forms. Both are tracked CONTACT actions and `all_conversions` matches
`conversions` exactly, so these are real, not modelled.

The Smart campaign produced 2 contacts on the same money over the same window.

PMax then went silent in August and nobody diagnosed it. So "the ads bring
traffic but not leads" describes the Smart campaign only. The account's actual
lead engine had been switched off.

**Changed today:** `Leads-Performance Max-1` re-enabled at Dillon's explicit
approval, 2026-09-16 ~12:23 ET. Verified through the API as `ENABLED` and
`SERVING` at $5.00/day. It came back `primary_status: LIMITED`, reason
`HAS_ASSET_GROUPS_DISAPPROVED`.

---

## 3. What is broken on the account right now

1. **Asset group `Concrete + Landscape Services` is NOT_ELIGIBLE, disapproved.**
   Every one of its 31 individual assets reads APPROVED and REVIEWED. The
   disapproval is therefore at group level, which usually points at the landing
   page or destination rather than creative. Needs the reason read out of the
   Ads UI, which names it under the asset group.
2. **No backup payment method on the account.** With one card and no fallback, a
   single decline stops delivery. This is a live candidate for why August went
   dark, and it will do it again.
3. **Creative is phone screenshots.** The four landscape images in that asset
   group are named `Screenshot 2026-04-22 190145_1.png` and similar. For a
   business selling craftsmanship, that is a real conversion drag.
4. **Two campaigns are built and have never served one impression.**
   `Onsite | Search | Concrete | Vacaville | 2026-09-10` has a full RSA, negative
   keywords, tight geo, and a purpose-built landing page at
   `onsite-gads-landing-page.netlify.app`. It was created paused on 9/10 and
   never switched on. Budget sits ready at $15.00/day.

---

## 4. Concrete lane, hold not grow

Keep it earning while the pivot is explored. Do not invest new build time here.

- Leave PMax on. It is the only proven lead source, and one month of clean data
  now tells us whether June and July repeat.
- Fix the asset group disapproval. Without it the campaign runs on one asset
  group instead of two.
- Do **not** enable the 9/10 Search campaign yet. Its $15/day is triple PMax's
  budget and it targets concrete, which is the lane being exited. Revisit once
  the blinds direction is decided.
- SEO continues as is. Vacaville is ranking, Fairfield and Davis are climbing on
  concrete landscaping and pavers. That compounding is worth keeping regardless
  of the pivot, and it costs no media spend.

---

## 5. Blinds audit, Dillon's action item

The deliverable Nikki is waiting on. Five questions, answered with evidence:

1. **Is the market actually better?** Search volume and competition for blinds
   terms in Vacaville, Fairfield, Davis, Dixon, Napa, Suisun City, against the
   concrete baseline. The claim to test is that blinds is less saturated, not
   that it is bigger.
2. **What does entry cost?** Estimated CPC and realistic monthly budget to be
   visible. Concrete is running at $0.16 average CPC on Smart. Blinds will not
   be that cheap; the number needs to be real before anyone commits.
3. **Who is already there?** Named local competitors, whether they run ads, and
   whether the category is dominated by franchises such as Budget Blinds. A
   franchise-dominated category changes the strategy completely.
4. **Licensing and positioning.** Nikki's 20+ years and commercial work is the
   differentiator named on the call. Confirm what licensing blinds requires in
   California and whether the existing license carries over.
5. **What does it need to launch?** New landing page, new creative, separate
   campaign, and whether it runs under the Onsite brand or a new one.

Deliver as a short written audit with the numbers attached, not a verbal answer.

---

## 6. The channel questions raised on the call

**Meta ads for lead collection.** Reasonable. Meta lead forms suit home services
and would address the "traffic but no leads" complaint directly. Cost and setup
need scoping before it is promised.

**ChatGPT ads.** Raised as a budget shift. Flag honestly: this is a young
placement and there is no Onsite baseline for it. Treat it as a test with a
capped budget, not a reallocation away from a channel that just proved $3.05
contacts. Do not move PMax money into it before PMax has a clean month.

**Landing page and ad copy.** Sean's team. The Netlify page already exists and
is strong. The gap is conversion instrumentation, not design.

---

## 7. What needs Dillon

| # | Item | Owner | Blocking |
| --- | --- | --- | --- |
| 1 | Read the asset group disapproval reason in the Ads UI and fix it | Dillon | PMax running at half strength |
| 2 | Add a backup payment method | Dillon or Nikki | Repeat of the August blackout |
| 3 | Produce the blinds audit | Dillon | Nikki's decision, promised on the call |
| 4 | Decide whether the 9/10 Search campaign launches or waits | Dillon | $15/day sitting idle |
| 5 | Replace the screenshot creative | Sean's team | Conversion rate |

---

## Evidence notes

- Conversion figures segmented by `conversion_action_name`, Google Ads API,
  `campaign` resource, June 1 to July 31.
- Asset group status from the `asset_group` and `asset_group_asset` resources,
  read only.
- Campaign enable performed through the Ads UI because the Access Broker entry
  for this client lists `googleads.campaign.enable` as prohibited and the Ads MCP
  exposes no write tool. Dillon approved the action explicitly in session.
- Call content is the Fireflies **overview** only. The full transcript sits
  behind a Fireflies login that was not used. Anything in section 1 and 6 should
  be checked against the complete notes before it goes to Nikki.
