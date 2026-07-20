# Onsite conversion and deduplication correction packet

Prepared: 2026-07-16
Status: local redacted draft; live correction not authorized
Lane: Google Ads only

## Decision

Do not scale the active campaign while conversion setup is incomplete. First establish one canonical lead record per prospect interaction and distinguish contact activity from a qualified estimate.

## Verified facts

- Persistent Chrome verified the exact Onsite Google Ads route and an active Smart campaign.
- The live read showed an observed $4.39 daily budget, $133 monthly maximum, two web conversions, and incomplete conversion setup.
- The two observed web conversions have not been verified as qualified estimates.
- A separate July 6 through July 12 communication record reported eight contact actions, consisting of two forms and six calls, on $52.66 spend. Those historical contact actions are not verified qualified estimates or booked work.
- The blueprint defines `qualified_estimate` as primary; `contact_form`, `phone_call`, and `estimate_start` are secondary. Deduplication is required.
- A phone click is not a connected call, and a connected call is not automatically qualified.
- The launch authority is draft-only. It allows local artifacts but no deployment, provider mutation, enablement, pausing, or budget change.

## Hypotheses, not findings

- Google may be optimizing toward raw web contact actions rather than qualified estimates.
- A single interaction may be represented by more than one form, call, analytics, or imported conversion.
- The incomplete setup may reflect a missing primary action, unverified tag, missing call definition, or unfinished offline outcome import.
- The current two web conversions may be genuine, test, duplicate, or unqualified events.

## Required readbacks

1. Read every current conversion action and its primary status, source, category, count setting, attribution model, recording health, and last-recorded date.
2. Read the Smart campaign's selected goals, final destination, phone path, and available search-intent evidence.
3. Verify what Google labels as each of the two web conversions and obtain a privacy-safe event or click reference.
4. Reconcile the two live-observed conversions and the separate eight historical contact actions to unique form records, connected calls, qualified estimates, and booked jobs.
5. For calls, read the trigger definition, minimum duration, forwarding or call-tracking evidence, and whether the result is merely a click.
6. For forms, verify success-state firing, refresh behavior, repeated submission behavior, test filtering, and source-field retention.
7. Identify any CRM or offline-import process and its unique transaction or lead key.
8. Read recent conversion, campaign, URL, call-asset, and tag change history.

## Recommended local correction build

- Define the canonical funnel as `contact -> canonical lead -> connected -> qualified estimate -> booked work`.
- Use one stable privacy-safe lead key across form, call, CRM, analytics, and any imported conversion. Never deduplicate only by timestamp.
- Keep `contact_form`, `phone_call`, and `estimate_start` secondary; promote only verified `qualified_estimate` outcomes to the proposed primary optimization event.
- Create a reconciliation table with event key, channel, campaign, service, market, contact type, connected status, qualification, estimate status, booking status, duplicate-of, and exclusion reason.
- Apply the UTM pattern `onsite_google_{service}_{market}_{campaign_type}` and preserve click/source identifiers through the estimate path.
- Build a local QA checklist for one form, one qualified call, a repeat submission, a test submission, a page refresh, and an unqualified call.

## Success criteria

- Each real prospect interaction produces one canonical lead record.
- A verified qualified estimate records exactly once as the primary outcome.
- Phone clicks, unconnected calls, test records, repeated forms, and duplicates do not count as qualified estimates.
- The live platform count reconciles to disposition and booked-work records for the same window.

## Approval-gated live actions

Explicit current approval is required before any of the following:

- changing conversion definitions, primary status, counting, attribution, goals, bidding, budget, targeting, or campaign type;
- installing or changing tags, call tracking, form logic, CRM workflows, or offline imports;
- deploying a landing-page or phone-path change;
- contacting the client or any lead.

## Evidence

- `clients/onsite-concrete-landscape/paid-media/blueprints/google_ads.json`
- `clients/onsite-concrete-landscape/paid-media/launch-config.json`
- `clients/onsite-concrete-landscape/paid-media/launch-authority.json`
- `clients/onsite-concrete-landscape/context/operating-context.md`
- `state/client-history-research/gmail-onsite-concrete-landscape-history-2026-07-16.json#client=onsite-concrete-landscape`
- `state/paid-media/daily-review-2026-07-16.json#lane=google-ads--onsite-concrete-landscape`
