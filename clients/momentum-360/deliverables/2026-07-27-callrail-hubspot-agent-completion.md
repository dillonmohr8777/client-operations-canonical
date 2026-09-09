# CallRail in the Momentum HubSpot agent

Verified: 2026-07-27

## Completed

- Confirmed the protected Jason/Momentum HubSpot credential resolves to portal `50612503`.
- Added the `jason-report` command to the protected HubSpot launcher.
- Added live CallRail call ingestion from HubSpot call objects.
- Detects CallRail through HubSpot source detail `CallRail` and integrating app ID `28280`.
- Resolves call-to-contact associations in batches.
- Attributes associated contacts to `Phone Calls / CallRail`.
- Reports inbound, answered, missed, after-hours, Voice Agent, contact-association, owner-coverage, and latest-activity metrics.
- Preserves the read-only CRM boundary and does not expose the HubSpot token.
- Test suite: 6 passed, 0 failed.

## Live CallRail configuration

The following settings were saved and reopened in CallRail account `671942387`:

- Momentum 360 shared call flow: the existing flow remains active from 6:00 AM through 10:00 PM Eastern, every day.
- GMB Suspension call flow: the existing flow remains active from 6:00 AM through 10:00 PM Eastern, every day.
- For both flows, CallRail's `Any other time` branch implements the requested 10:00 PM through 6:00 AM after-hours window.
- After-hours calls use an equal round robin between Sean Boyle and Jason Fallon.
- Weighted distribution and sticky previous-caller routing are off.
- Voicemail and automated-system interception is prevented.
- The approved Mia missed-call text is live for both companies, including the STOP opt-out language.
- Backup texting numbers are configured for both companies.

CallRail does not express a cross-midnight window as one schedule range. The equivalent live setup uses a 6:00 AM through 10:00 PM business-hours branch and routes `Any other time` to the after-hours round robin.

## HubSpot live verification

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\hubspot-agent\Invoke-HubSpotAgent.ps1 jason-report --from 2026-07-01 --to 2026-07-31 --format json
```

Fresh live snapshot generated at 2026-07-27 15:12:48 UTC:

- Mode: `live-read-only`
- Portal: `50612503`
- July CallRail calls through verification time: 352
- Inbound calls: 263
- Answered calls: 101
- Missed or no-answer calls: 162
- Answer rate: 38.4%
- Contact association coverage: 100%
- HubSpot owner coverage on CallRail calls: 0%
- Latest CallRail-created HubSpot call: 2026-07-27

These values are an operational snapshot, not a permanent monthly total.

## Remaining human verification

The configuration is live. The only remaining action from Sean and Jason is a controlled after-hours test after 10:00 PM Eastern:

1. Place one call to a Momentum 360 tracking number and one to the GMB Suspension number.
2. Leave each call unanswered and confirm the approved missed-call text arrives.
3. Confirm the calls reach the expected round-robin recipients without terminating at voicemail.
4. Confirm each call appears once in HubSpot with its CallRail call-to-contact association.

The production configuration is recorded in `2026-07-27-callrail-production-config.json`.
