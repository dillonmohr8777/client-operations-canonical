---
report_type: internal-experiment
client_id: momentum-360
account: Jason Fallon / Momentum 360
portal_id: "50612503"
generated: 2026-09-02
experiment_id: EXP-JASON-HUBSPOT-CHRONOS-BACKTEST-20260902
approval_ref: direct-user-approval:2026-09-02-jason-hubspot-chronos-rolling-backtest
delivery_status: not-sent
decision: retain-evidence-only
---

# Momentum 360 contacts-created: rolling-origin Chronos-2 backtest

Follows recommendation 5 of the 2026-09-01 pilot report: rolling-origin
backtests instead of one held-out window. Same frozen 44-week sanitized series
(`../2026-09-01-hubspot-chronos-forecast-pilot/inputs/hubspot-contacts-created-weekly.csv`),
horizon 4 weeks, nine origins (context 32 through 40), Chronos-2 on the pinned
local CPU runtime, routed through the dillon-os forecast router under a
rolling approval that admits only exact prefixes of the approved series.

| Method | Mean WAPE over 9 origins |
| --- | ---: |
| Chronos-2 | 25.61% |
| Persistence | 26.85% |
| Trailing four-week mean | 25.40% |

Chronos beat persistence on 5 of 9 origins. Mean p10-p90 coverage was 75.0%
against an 80% nominal band (58.3% in the single-window pilot).

Gates: walk-forward-baseline FAIL (needs two-thirds of origins), quantile-
calibration PASS (70% to 90%). Decision stays retain-evidence-only. The
trailing four-week mean remains the cheapest competitive predictor for this
series; Chronos adds calibrated bands but not accuracy yet.

Same data-quality warning as the pilot: two import-like weeks hold 73% of the
history. Contacts created are CRM activity, not leads, conversions, or revenue.
Nothing here authorizes spend, sending, publishing, CRM writes, or promotion.

Files: `backtest-receipt.json`, `backtest-summary.md`, `requests/` (nine
router-validated requests), `runs/` (nine validated Chronos-2 run artifacts).
Driver: dillon-os `_os/automation/bin/forecast-backtest.js` (PR #351).
