# Align HCM Competitor Press Watchdog

This is a private, read-only competitive-intelligence monitor connected to the Align HCM terminal HubSpot agent. It checks official competitor and platform domains, records what is new, ranks strategic relevance, and produces a concise report with evidence links, likely next-move hypotheses, and proof-gated Align HCM press-release concepts.

It does not write to HubSpot, publish website content, send messages, or create press releases automatically.

## Initial watchlist

Direct competitors and adjacent implementation consultancies:

- HRchitect
- PayTech
- PredictiveHR
- OnActuate
- Silver Cloud
- DCH Advisors
- ClearPath HCM
- Phase 3

Platform ecosystems:

- UKG
- Dayforce
- HiBob

The list is deliberately editable in `watchlist.json`. Each source is restricted to the organization's official domain. RSS dates are treated as publication dates. Bing web RSS dates are labeled as search-index dates and require on-page verification before public use.

## HubSpot agent commands

Run these from the existing Align HCM agent folder:

```powershell
.\Invoke-AlignHubSpotAgent.ps1 press-watch
.\Invoke-AlignHubSpotAgent.ps1 press-watch-status
.\Invoke-AlignHubSpotAgent.ps1 press-watch-latest
.\Invoke-AlignHubSpotAgent.ps1 press-watch-config
```

The commands do not require a HubSpot token because the monitoring pass is external, read-only OSINT. The wrapper remains the single terminal entry point.

## Schedule

Install or refresh the daily current-user task:

```powershell
.\Invoke-AlignHubSpotAgent.ps1 press-watch-install
```

The default schedule is 6:35 AM America/New_York time when this Windows user is logged in. It runs hidden, starts when available if the scheduled time was missed, and will not start a second overlapping run.

## Outputs

- `reports/latest.md`: current executive brief
- `reports/latest.json`: structured current evidence and recommendations
- `reports/YYYY-MM-DD-HHMMSS.*`: immutable run history
- `runtime/state.json`: deduplication and status state
- `runtime/logs/`: scheduled-run logs

The first run creates a 120-day baseline. Later runs report only newly discovered URLs and titles.

## Evidence rules

- Source titles, links, descriptions, and feed dates are confirmed observations.
- Search-index dates are discovery signals, not publication-date proof.
- Strategic implications are inferences.
- Predicted competitive moves are hypotheses with confidence labels.
- Press-release headlines are concepts only and include the proof required before they can be approved or published.
