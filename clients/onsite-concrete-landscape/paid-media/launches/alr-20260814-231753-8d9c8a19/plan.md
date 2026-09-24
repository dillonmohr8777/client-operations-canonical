# Onsite concrete Search launch plan

Prepared: 2026-08-14  
Status: ready for local build; not ready for account creation or launch  
Google Ads account: `103-371-5894`  
Launch request: `alr-20260814-231753-8d9c8a19`  
Budget: `$15` average daily budget

## Decision

Launch one tightly controlled Google Search campaign for concrete estimate intent in Vacaville. Use a responsive search ad with a call asset. Do not launch a legacy call-only ad, Performance Max, Smart, Display, Search Partners, or a combined concrete-and-landscaping campaign.

Landscaping remains a separate later test. At `$15/day`, splitting service families would fragment traffic, negatives, copy, landing-page relevance, and conversion learning.

## Why the current setup is underperforming

Live readback on 2026-08-14 found:

- The only enabled campaign is the Smart campaign `Onsite Concrete & Landscape`, using Maximize Clicks at `$4.39/day`.
- In the last 30 days, the Smart campaign produced 22,561 impressions, 589 clicks, `$84.81` spend, and one Google-reported `Web Phone Calls` event. This event is not verified as a qualified estimate.
- The paused Performance Max campaign produced 24.98 platform events, but those were browser-side form and phone events rather than reconciled qualified estimates.
- Lead goals for form, phone, and contact actions all show `Needs attention`.
- Enhanced Conversions is inactive with no recent data.
- Account tracking status shows one inactive action, four unverified actions, eight with no recent conversions, and only one recording action.
- The account has no standard negative keywords.
- The lead funnel contains no verified qualified-lead or converted-lead stage.

The existing Search draft is also not launch-ready:

- It mixes concrete and landscaping in one ad group.
- It points to the general services page instead of the paid-search landing page.
- It has no call asset, business name, logo, images, sitelinks, or callouts.
- It uses Maximize Clicks with an `$8` CPC cap.
- Google selected an `$81.57/day` recommended budget, not Dillon's `$15/day` cap.
- Its live forecast is 171 weekly clicks at `$3.34` average CPC and `$570.99` weekly spend. At `$105/week`, the same CPC would imply about 31 clicks per week; that is directional, not a guarantee.

## Recommended campaign

| Setting | Plan |
| --- | --- |
| Campaign | `Onsite | Search | Concrete | Vacaville | 2026-08-14` |
| Objective | Qualified concrete estimate calls and accepted estimate requests |
| Campaign type | Search with responsive search ad and call asset |
| Budget | `$15/day` average; Google may spend up to `$30` on an individual day and normally caps the month at `$456` |
| Network | Google Search only; Search Partners and Display off |
| Geography | Vacaville, California only for the first test |
| Location option | Presence: people in or regularly in the targeted location |
| Language | English |
| Schedule | Campaign and call asset only during verified staffed call hours |
| Landing page | `https://onsite-gads-landing-page.netlify.app/` with campaign UTMs and Google click identifiers preserved |
| Bidding | Maximize Conversions without target CPA, but only after the qualified-call goal passes a real test |
| Primary goal | Qualified phone-call lead; later import verified `qualified_estimate` outcomes |
| Secondary goals | Accepted form receipt, phone click, form start, directions, and other diagnostics |
| PMax | Keep paused |
| Smart campaign | Leave unchanged until the replacement passes QA; then pause it at replacement enablement |

Google removed creation of new call-only ads in February 2026. The supported replacement is a Search campaign with responsive search ads and call assets: https://support.google.com/google-ads/answer/16619010?hl=en

Google budget limits: https://support.google.com/google-ads/answer/6385083/about-average-daily-budgets

## Call-quality setup

1. Add the verified business phone as a call asset.
2. Turn on call reporting and schedule the asset only when someone can answer.
3. Prefer Google's AI-qualified call-lead conversion if Onsite approves recording and the operational consent requirements are met.
4. If recording is not approved, treat connected-call duration as a diagnostic and import the downstream disposition `qualified_estimate` after a real service-fit estimate conversation.
5. Exclude spam, misdials, vendors, jobs, wrong-company calls, out-of-area inquiries, duplicates, and tests.
6. Never count a phone-button click, dial attempt, or unconnected call as a qualified estimate.

References:

- Call reporting: https://support.google.com/google-ads/answer/2454052?hl=en
- AI-qualified call leads: https://support.google.com/google-ads/answer/16913326?hl=en
- Imported call conversions: https://support.google.com/google-ads/answer/6100664?hl=en

## Ad group structure:

- AG1 `Concrete | Estimate | Vacaville`: high-intent concrete contractor, driveway, patio, stamped-concrete, and near-me terms in Phrase and Exact match -> RSA1

Landscaping is intentionally excluded from this campaign and ad group.

## Target keywords

- `"concrete contractor vacaville"`
- `[concrete contractor vacaville]`
- `"concrete contractor near me"`
- `[concrete contractor near me]`
- `"concrete driveway contractor"`
- `[concrete driveway contractor]`
- `"concrete patio contractor"`
- `[concrete patio contractor]`
- `"stamped concrete contractor"`
- `[stamped concrete contractor]`
- `"concrete company near me"`
- `[concrete company near me]`

## Negative keywords:

Campaign-level:

- jobs
- careers
- salary
- hiring
- training
- classes
- DIY
- how to
- concrete bags
- concrete mix
- ready mix delivery
- concrete supplier
- concrete materials
- equipment rental
- concrete pump
- concrete pumping
- wholesale
- calculator
- PDF
- tutorial

Ad-group level:

- landscaping
- lawn care
- tree service
- pool service
- asphalt
- demolition only

Review search terms daily during week one. Add only unmistakably irrelevant terms; do not block ambiguous local trade language without evidence.

## Sitelinks

- Concrete Services | See concrete project options | Match your project to the work | `https://onsite-gads-landing-page.netlify.app/#services`
- Recent Project Work | Review real project imagery | See Onsite's coordinated work | `https://onsite-gads-landing-page.netlify.app/#work`
- How The Process Works | From consultation to scope | Know the next project step | `https://onsite-gads-landing-page.netlify.app/#sequence`
- Request An Estimate | Start a project conversation | Call or send project details | `https://onsite-gads-landing-page.netlify.app/#consultation`

## Callouts

- Licensed & Insured
- Serving Vacaville
- Since 2004
- One Local Team
- No Subcontractors
- Free Consultation

## Structured snippet

`Services: Driveways, Patios, Stamped Concrete, Walkways, Foundations, Flatwork`

## RSA1 — Concrete | Estimate | Vacaville

Final URL: `https://onsite-gads-landing-page.netlify.app/?utm_source=google&utm_medium=cpc&utm_campaign=onsite_google_concrete_vacaville_search&utm_content=concrete_rsa_1`  
Path1: `concrete`  
Path2: `estimate`

Headlines (15, each at most 30 characters):

1. Vacaville Concrete Team (23 chars)
2. Concrete Contractor Near You (28 chars)
3. Driveways Patios & More (23 chars)
4. Stamped Concrete Contractor (27 chars)
5. Licensed & Insured (18 chars)
6. Request A Free Consultation (27 chars)
7. Serving Vacaville (17 chars)
8. Concrete Built To Last (22 chars)
9. Local Concrete Since 2004 (25 chars)
10. One Team No Subcontractors (26 chars)
11. Start Your Concrete Project (27 chars)
12. Driveway Concrete Contractor (28 chars)
13. Patio & Walkway Concrete (24 chars)
14. Quality Concrete Craft (22 chars)
15. Call Onsite Today (17 chars)

Descriptions (4, each at most 90 characters):

1. Request a free consultation for concrete driveways, patios, walkways and flatwork. (82 chars)
2. Serving Vacaville since 2004 with licensed and insured concrete craftsmanship. (78 chars)
3. One local team handles the site from a clear scope through finished concrete work. (82 chars)
4. Call Onsite to discuss your concrete project and request an estimate. (69 chars)

Pinning: none.

## GitHub research shortlist

1. `google/skills`: best source for official Google Ads account diagnostics and Data Manager event ingestion. Adopt its evidence-first diagnostics and current offline conversion ingestion path. https://github.com/google/skills/tree/main/skills/ads
2. `nowork-studio/toprank`: best local-service lead-generation playbook. Adopt qualified-lead scoring, Phrase/Exact protection, and careful search-term triage. Do not connect its third-party mutation route without a separate security review. https://github.com/nowork-studio/toprank
3. `logly/mureo`: strongest search-term-cleanup and tracking-health guardrails. Adopt preview, approval, and change-log concepts. Do not install its broad mutating stack for this account. https://github.com/logly/mureo
4. `coreyhaines31/marketingskills`: strongest general ads strategy reference. Adopt the intent ladder, Presence geo, PMax-last rule, and offline-quality loop; recalibrate its B2B examples for this local service client. https://github.com/coreyhaines31/marketingskills
5. `googleads/google-ads-api-developer-assistant`: useful official conversion troubleshooting and GAQL validation, but engineering-heavy rather than a launch playbook. https://github.com/googleads/google-ads-api-developer-assistant

No credible dedicated landscaping or concrete Agent Skill was strong enough to install. The best relevant material is the local-service playbook in topRank plus Google's official diagnostics and conversion-ingestion skills.

## Launch gates

- Confirm staffed call hours.
- Confirm whether Onsite approves call recording and has the required caller and employee notice/consent process.
- Repair the primary conversion goal and verify one real call path plus one accepted form receipt.
- Add the call asset, business name, logo, approved project images, sitelinks, callouts, and structured snippet.
- Replace the draft's generic services URL with the paid-search landing page.
- Replace the draft's mixed keyword set with the concrete-only list above.
- Set the custom average daily budget to exactly `$15`.
- Keep Search Partners, Display, AI Max, and broad match off.
- Create paused first, read back every setting, and enable only after the exact preview is approved.

## First 14 days

- Days 1 to 3: confirm delivery, query relevance, call connection, and tracking; review search terms daily.
- Days 4 to 7: add evidence-backed negatives and promote relevant queries into Exact match.
- Days 8 to 14: compare spend, connected calls, qualified calls, accepted forms, booked estimates, and cost per qualified call.
- Do not optimize against raw clicks, phone clicks, or unreconciled platform conversion totals.
- Do not raise budget until at least three comparable qualified outcomes establish a direction.

## Current workflow verdict

The request is schema-valid and `ready_for_local_build`. It is not ready for paused account creation or enablement because the standing authority is draft-only, provider mutation readiness is stale/incomplete, total budget and schedule are unset, and tracking has not passed the qualified-call QA gate.
