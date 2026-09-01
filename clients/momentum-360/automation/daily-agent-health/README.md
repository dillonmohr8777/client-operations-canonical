# Momentum 360 daily agent health automation

This automation sends one combined HubSpot Customer Agent, contact-record, alerting, debugging, and CallRail update every morning at 9:00 AM America/New_York. The ops DM to Jason Fallon and Sean Boyle stays short. A second, shorter copy goes to `#360marketing`.

## Delivery

- Slack group DM: `C0B2N20A0SW`
- Mentions: Sean `UAK3WSY15`, Jason `U05MUGHN031`
- Team channel: `#360marketing` `C06CL0R09A4`, mention Sean only
- Task: `Momentum360-Daily-Agent-Health`
- Report marker: `M360-DAILY-YYYY-MM-DD`

The exact report marker prevents duplicate daily posts in each destination. The runner requires `DELIVERY_CONFIRMED` and `CHANNEL_DELIVERY_CONFIRMED` before it considers delivery successful. A source outage produces two short degraded notices instead of guessed metrics or silence. The team copy has no portal IDs, workflow IDs, HTTP codes, or session diagnostic strings.

The installed task completed its first verified delivery on 2026-08-11 at Slack timestamp `1786465182.124779`; Windows reported result `0`. Exact CallRail browser metrics were unavailable during that run, so the report correctly labeled the source degraded and withheld those metrics while still delivering verified HubSpot and ingestion evidence.

The collector now has a bounded fail-closed fallback for that browser condition. It reads the complete prior-24-hour window from the existing CallRail-connected Slack event mirror in `#calls` and cross-checks the protected HubSpot ingestion report. The mirror can prove call-event counts and after-hours timestamps; it cannot prove a routing recipient, alert configuration, or SMS-delivery success, so those narrower fields remain withheld unless the direct CallRail UI or API is available.

Before every report, `Test-MomentumDailyAgentHealthPreflight.ps1` validates the exact HubSpot and CallRail account guards, the protected Momentum token, the `conversations.read` capability, the hidden scheduled-task contract, prompt encoding, Codex skill metadata, and model-cache readability. Its redacted JSON is injected into the report prompt so a missing HubSpot scope is named precisely instead of being reported as a generic UI outage.

`expected-configuration.json` preserves the last live-verified desired state without claiming it is current. `Repair-MomentumCodexModelCache.ps1` normalizes the shared cache to the scheduled runner's installed CLI schema immediately before execution. The runner retries exact cache-write/schema defects, disables memory generation for its ephemeral sessions, and disables the unauthenticated legacy Composio MCP path that otherwise produces unrelated startup errors.

Multiline prompts are streamed through standard input. `state/delivery-ledger.json` is backfilled from verified final receipts and stops a same-date rerun before Slack is called. Slack channel history is read before search as a second idempotency layer.

A read-only end-to-end diagnostic completed successfully on 2026-08-11 in 5 minutes 59 seconds. It fully paginated the mirror, excluded QC Kinetix, passed the protected HubSpot portal guard for `50612503`, withheld unsupported routing and SMS claims, and returned `CALLRAIL_DIAGNOSTIC_CONFIRMED` without posting externally.

Direct CallRail access is currently blocked at the account boundary: Google sign-in as `dillonmohr8777@gmail.com` opens the separate QC Kinetix account, while Momentum reporting requires `Momentum Digital LLC` account `671942387`. The automation must never use the QC Kinetix account. Durable direct collection requires either an invitation for the authorized identity to account `671942387` or the exact existing Momentum credential through the approved vault workflow.

## Commands

Dry run with no external delivery:

```powershell
.\Run-MomentumDailyAgentHealth.ps1 -DryRun
```

Validate the automation contract without sending:

```powershell
.\Test-MomentumDailyAgentHealth.ps1
.\Test-MomentumDailyAgentHealthPreflight.ps1
```

Install or repair the scheduled task:

```powershell
.\Install-MomentumDailyAgentHealthTask.ps1
```

Run the installed task now:

```powershell
Start-ScheduledTask -TaskName 'Momentum360-Daily-Agent-Health'
```

Runtime logs are written under `output`. The scheduled task launches console-free through `C:\Users\dillo\.codex\tools\Run-HiddenScheduledTask.vbs` and its TSV manifest. Windows retries a failed runner up to three times at 15-minute intervals; the runner also retries the full report once before attempting a verified degraded notice.

## Rollback

1. Disable `Momentum360-Daily-Agent-Health`.
2. Re-enable `Momentum360-Daily-CallRail-Summary` if the former `#calls`-only report is desired.
3. Restore the retired task's original manifest entry; do not bypass the hidden VBS launcher.
