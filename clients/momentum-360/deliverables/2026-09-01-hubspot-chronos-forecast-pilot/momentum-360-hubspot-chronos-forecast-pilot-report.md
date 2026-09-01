---
report_type: internal-experiment
client_id: momentum-360
account: Jason Fallon / Momentum 360
portal_id: "50612503"
generated: 2026-09-01
verification_status: partial
delivery_status: not-sent
experiment_id: EXP-JASON-HUBSPOT-CHRONOS-20260901
decision: retain-evidence-only
---

# Momentum 360 HubSpot + Chronos Forecast Pilot

## Outcome

The full path worked: the Jason Fallon HubSpot specialist read the correct
portal, produced a sanitized regular time series, the Dillon OS router allowed
only the exact approved experiment, Chronos-2 generated a point forecast plus
nine quantile bands, and the scorer compared it with simple baselines.

The model did **not** earn promotion. On the first 12-week held-out window,
Chronos-2 was slightly worse than persistence and its uncertainty interval was
under-calibrated. The correct system response is to retain the forecast as
research evidence and improve the target data before any automation or
decision use.

## What was integrated

1. **Provider-neutral forecast routing in Dillon OS.** Numeric futures are
   separated from LLM writing and decision language. The router enforces model,
   license, data, cadence, leakage, context, use, and output contracts.
2. **Production-legal local model lane.** Chronos-2 runs from the pinned local
   CPU runtime with Apache-2.0 weights. TimesFM-3 remains research-only and
   received no Momentum 360 data.
3. **Exact client/account routing.** `Jason Fallon` resolves to active client
   `momentum-360`, portal `50612503`, through the Jason-only protected service
   key. The Align HCM portal and native connector were excluded.
4. **Read-only HubSpot evidence extraction.** The specialist verified the live
   portal and inspected aggregate CRM/reporting coverage without exposing
   secrets, contact identifiers, or raw communications.
5. **Fingerprint-bound client experiment gate.** The one approved aggregate
   vector is bound to Momentum 360, Chronos-2, the exact target, request,
   source locators, horizon, approval reference, and input fingerprint.
   Changing the client, portal locator, model, values, horizon, or approval
   reference blocks the run.
6. **Held-out model scoring.** The pilot records MAE, RMSE, WAPE, sMAPE,
   p10-p90 coverage, interval width, persistence, and trailing-four-week-mean
   baselines. The scorer first invokes the router and run validator, then
   asserts the exact approved experiment and source identity before scoring.
7. **Fail-closed interpretation.** The output cannot authorize spend, send,
   publishing, a conversion claim, CRM mutation, or scheduled automation.

## Live HubSpot evidence

The protected token was verified against Jason Fallon / Momentum 360 portal
`50612503`. No browser login was required.

| Accessible object | Current aggregate count |
| --- | ---: |
| Contacts | 14,897 |
| Companies | 6,885 |
| Deals | 1,675 |
| Calls | 3,457 |
| Meetings | 260 |
| Tasks | 2,960 |
| Owners | 9 |
| Forms | 17 |
| Deal pipelines | 5 |

Contacts, companies, deals, owners, pipelines, forms, calls, meetings, tasks,
schemas, and workflows passed the read-only probes. Conversations returned
`403 MISSING_SCOPES` and was excluded.

The existing deterministic channel mapping covers only 22.19% of contacts.
Qualified-lead, conversion, revenue, channel, spend, lifecycle-flow, email,
reply, web-traffic, and conversation forecasts are therefore not defensible
from this evidence window. Conversion reporting is pending validation.

## Selected series

The pilot selected weekly **HubSpot contacts created**, defined as the count of
non-archived contact records grouped by immutable `createdate` in UTC. This is
CRM creation activity—not verified leads, qualified leads, conversions, deals,
or revenue.

- Complete weekly steps: 44
- Context: first 32 weeks
- Held-out evaluation: following 12 weeks, 2026-06-08 through 2026-08-24
- Invalid or missing `createdate`: 0
- Missing weeks on the regular grid: 0
- Partial first and current weeks: excluded

### Material data-quality warning

Two weeks contain 10,895 of the 14,846 records in the complete window:

| Week | Contacts created |
| --- | ---: |
| 2025-11-17 | 5,177 |
| 2026-02-02 | 5,718 |

That is 73.39% of the history concentrated into two weeks. Until HubSpot
history or operational records explain these as organic acquisition, they
should be treated as likely imports, migrations, or backfills. The raw target
also has survivor bias because archived contacts are absent.

## Forecast test

- Model: `amazon/chronos-2`
- Runtime: Python 3.12.13, `chronos-forecasting==2.3.1`,
  `torch==2.6.0+cpu`
- Model execution: completed locally
- Context: 32 weekly values
- Horizon: 12 held-out weekly values
- Covariates: none; no historical helper or known-future series cleared the
  evidence gate
- Output: point forecast and p10, p20, p30, p40, p50, p60, p70, p80, p90

| Method | MAE | RMSE | WAPE | sMAPE |
| --- | ---: | ---: | ---: | ---: |
| Chronos-2 | 29.91 | 35.66 | 25.75% | 24.94% |
| Persistence, 140/week | 29.17 | 35.11 | 25.11% | 24.40% |
| Trailing four-week mean, 152.5/week | 37.58 | 44.55 | 32.35% | 29.91% |

Chronos beat the trailing-four-week mean but did not beat persistence. Its
nominal p10-p90 interval covered 58.33% of the held-out observations, well
below the nominal 80% band. The mean interval width was 311.22 contacts, and
the p50 estimate was above the actual value in 9 of 12 weeks.

## What the theory proved

The architecture is useful even though this first model result did not pass.
It prevented the LLM from guessing a trend, preserved a quantile distribution,
exposed data concentration, forced a baseline comparison, and abstained from
promotion when the specialist failed to beat the simplest benchmark.

It did **not** prove that Chronos is ready for Momentum 360 planning, that CRM
contacts equal demand, or that any forecast should change a budget, workflow,
campaign, or client report.

## Recommended next experiment

1. Determine whether the 2025-11-17 and 2026-02-02 spikes were imports,
   migrations, or backfills using HubSpot import/audit history.
2. Define an approved organic-contact target that excludes test, spam,
   duplicate, and imported records without rewriting raw evidence.
3. Capture immutable historical source and lifecycle transitions before using
   channel or qualified-lead series.
4. Add known-future covariates only from approved facts such as scheduled
   webinars, promotions, or fixed budget calendars.
5. Run rolling-origin backtests, not just one held-out window, and require the
   model to beat persistence plus a suitable seasonal baseline.
6. Recalibrate quantile bands and require observed p10-p90 coverage near the
   intended 80% before any promotion proposal.

## Verification and privacy

- CRM writes: none
- Workflow, owner, list, form, report, property, or setting changes: none
- Browser login: not used
- Secrets in artifacts: none
- Contact-level identifiers or raw communications in artifacts: none
- Account-routing identifiers: Jason Fallon, Momentum 360, portal `50612503`,
  and local artifact paths are intentionally present
- Scheduled automation: none
- External delivery: none
- Production promotion: no

Supporting artifacts in this package:

- `inputs/hubspot-contacts-created-weekly.csv`
- `inputs/hubspot-forecast-evidence-manifest.json`
- `forecast-request.json`
- `forecast-run.json`
- `scoring-receipt.json`
- `integration-manifest.json`
- `score-forecast.mjs`
