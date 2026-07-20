# Omega qualified-lead reconciliation correction packet

Prepared: 2026-07-16
Status: local redacted draft; live correction not authorized
Lane: Google Ads only

## Decision

Do not scale from the 13 platform conversions. Reconcile each platform action to a unique, service-fit, qualified opportunity first, then use the verified gap to determine tracking or intent corrections.

## Verified facts

- Persistent Chrome verified the exact Omega Google Ads route.
- `Omega Landscaping & Concrete | Colorado Springs | PMax` was enabled at an observed $50 per day with 13 conversions. Seven Search campaigns were paused.
- The July 16 live window showed $1,491.65 spend and an observed platform CPA of $114.74 for those 13 conversions. These are platform observations, not qualified-lead economics or spend authority.
- A separate July 6 through July 12 communication record showed three tracked actions, one call and two forms, on $328.70 spend. Do not blend that historical week with the live platform window.
- Earlier feedback identified irrelevant supplier or wrong-company calls as a lead-quality risk.
- The blueprint defines `qualified_lead` as primary; `form_submit`, `phone_call`, and `estimate_start` are secondary. Deduplication is required.
- Landscaping and concrete intent must remain separately inspectable.
- The launch authority is draft-only. It allows local artifacts but no deployment, provider mutation, enablement, restart, or budget change.

## Hypotheses, not findings

- Some platform conversions may be raw calls, forms, test records, duplicates, supplier inquiries, or wrong-company contacts rather than qualified opportunities.
- One lead may be counted in multiple actions or imported without a stable unique key.
- Performance Max intent may mix landscaping, concrete, supplier, employment, and unrelated business searches.
- Qualified outcomes may exist downstream but lack preserved campaign or click identifiers.

## Required readbacks

1. Export the 13 conversion rows by action name, source, category, campaign, date, primary status, count setting, attribution model, and privacy-safe click or event reference.
2. Reconcile the exact same date window to unique form records, connected calls, CRM or lead records, qualification, estimate, booking, won or lost state, and disqualification reason.
3. Separate landscaping, concrete, supplier, vendor, employment, wrong-company, spam, and unknown intent.
4. Verify whether each phone action is a click, connected call, duration-qualified call, or imported disposition.
5. Verify deduplication keys and whether a form, call, analytics event, and offline import can represent one prospect more than once.
6. Read Performance Max search categories or themes, landing destinations, audience signals, and available search-term evidence.
7. Read current conversion goals and campaign bidding inputs; keep the seven Search campaigns paused.
8. Read change history for conversions, goals, themes, assets, URLs, negatives, bidding, budgets, and campaign states.

## Recommended local correction build

- Create a 13-row reconciliation ledger with privacy-safe event key, campaign, service, source action, canonical lead key, connected status, qualification, estimate status, booked status, revenue status if authorized, duplicate-of, and exclusion reason.
- Use the classification result to calculate unique leads, qualified leads, qualified rate, booked estimates, and qualified cost per lead. Do not infer any value where disposition is missing.
- Keep `form_submit`, `phone_call`, and `estimate_start` secondary; propose `qualified_lead` as primary only when its downstream source and import key are verified.
- Build negative-keyword and search-theme candidates only from verified irrelevant calls and current search evidence, not generic landscaping assumptions.
- Separate landscaping and concrete in reconciliation, landing-page routing, creative, and future Search architecture.
- Apply the UTM pattern `omega_google_{service}_{market}_{campaign_type}` and preserve click/source identifiers through the estimate outcome.

## Success criteria

- All 13 platform conversions have one explained disposition or a clearly named missing source.
- Unique and qualified counts cannot be inflated by forms, calls, imports, tests, or duplicate events.
- Qualified cost per lead uses verified qualified outcomes from the same window.
- Intent corrections trace to real irrelevant inquiries or live search evidence.
- The seven paused Search campaigns remain unchanged.

## Approval-gated live actions

Explicit current approval is required before any of the following:

- changing conversion actions, primary status, counting, attribution, goals, offline imports, tags, or CRM mappings;
- adding negatives, themes, audience signals, ads, or landing-page changes;
- changing campaign state, bids, budget, targeting, or service area;
- contacting the client or a lead.

## Evidence

- `clients/omega-landscaping/paid-media/blueprints/google_ads.json`
- `clients/omega-landscaping/paid-media/launch-config.json`
- `clients/omega-landscaping/paid-media/launch-authority.json`
- `clients/omega-landscaping/context/operating-context.md`
- `state/paid-media/daily-review-2026-07-16.json#lane=google-ads--omega-landscaping`
