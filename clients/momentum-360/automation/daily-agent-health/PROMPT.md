# Momentum 360 daily AI and lead-response health report

This is a recurring delivery authorized by Dillon Mohr on August 11, 2026 for the Sean/Jason ops DM, and on September 1, 2026 for a concise `#360marketing` copy after Sean asked to put the report there, shorter. Collect the same live evidence. Write two short messages. The reports exist so Jason Fallon, Sean Boyle, and the marketing channel do not have to ask for HubSpot agent, alerting, contact-record, or CallRail status.

## Exact destinations

Daily report ID: `M360-DAILY-{{RUN_DATE_ET}}`. Delivery time: 9:00 AM America/New_York. Do not post the daily report to `#calls`.

### Ops DM (Sean and Jason)

- Slack conversation ID: `C0B2N20A0SW`
- Mentions: Sean Boyle `<@UAK3WSY15>` and Jason Fallon `<@U05MUGHN031>`
- At most 12 short lines. One clause per bullet. Do not repeat the same blocker in Status, Exceptions, and Next.

### Team channel (`#360marketing`)

- Slack conversation ID: `C06CL0R09A4`
- Mention Sean only: `<@UAK3WSY15>`
- At most 10 short lines. Team-facing numbers and status only.
- Do not include portal IDs, workflow IDs, private-app scopes, HTTP codes, Windows result codes, token or session diagnostic strings, account numbers, DPAPI, or scheduled-task internals.

Before collection, read `C0B2N20A0SW` and `C06CL0R09A4` for today's exact report ID. Use search only as a secondary check. If a destination already has the report ID, do not send another message there. Still send the missing destination. Read each existing or new message back.

Keep collection bounded. Do not recursively scan the workspace, browser profiles, or plugin caches. Read only the exact live surfaces and canonical paths named in this prompt, plus the latest matching runtime log and Momentum evidence needed for the reporting window.
Read `expected-configuration.json` as the last verified desired-state contract. It is a drift target, not current proof. Compare live state to it whenever direct HubSpot or CallRail access is available, and never present its `evidenceAsOf` values as verified today.

## Deterministic preflight

The runner completed a redacted, account-guarded preflight before starting this report:

`{{PREFLIGHT_JSON}}`

Treat this object as current machine evidence, not as permission to weaken a gate. Use it to name exact failures in the ops DM, once, in plain language. If `hubspot-conversations-read` reports `HUBSPOT_CONVERSATIONS_SCOPE`, the ops DM may say HubSpot conversations access is missing (`conversations.read`, HTTP 403). Do not collapse that into a generic HubSpot outage. If direct CallRail access remains blocked, keep account `671942387` as the only accepted collection boundary and do not treat Slack-mirror telemetry as direct-account settings proof. The `#360marketing` copy must not name those IDs or codes.

If `hubspot-browser-session` reports `HUBSPOT_BROWSER_SESSION`, the ops DM may say the HubSpot login needs restore, separately from the conversations-access gap. A valid CRM token, an expired browser session, and a missing Conversations scope are three different conditions. The team channel should only say HubSpot login or conversations access still needs restore.

Codex may print a separate notice that the installed skill catalog exceeds its prompt-description budget. That notice is not invalid `SKILL.md` metadata, not a collection failure, and not a reason to mark the client report degraded. Use the `codex-skill-metadata` preflight check and the runner's explicit startup-defect marker as the authority for startup health.

## Source checks

Use current live evidence. Never substitute an older report for a current check.

### HubSpot customer agent

1. Use only Momentum 360 HubSpot portal `50612503`. Never use Align HCM portal `242825734`.
2. Validate the authorized Momentum session before relying on it. Prefer the authenticated in-app browser. If browser access is unavailable, use the protected Jason/Momentum read-only launcher where it covers the requested field and mark UI-only fields unavailable.
3. Run the protected `jason-conversations-probe`. A valid portal token without `conversations.read` is a specific scope defect, not a general portal outage. The official HubSpot Conversations GET endpoints require `conversations.read`.
4. Inspect `Customer Agent, Momentum 360 Assistant`, website chatflow `Momentum 360 Website Assistant` (`96377499`), and alert workflow `Momentum 360 - Customer Agent - Immediate Alerts` (`1865051017`).
5. Verify and report:
   - customer agent and website channel status;
   - whether email capture is at conversation start;
   - whether First Name, Last Name, and Phone Number have view/edit permission;
   - current published-guideline time and any unpublished changes or validation failures;
   - Help Desk handoff ticket creation, owner, and availability-only setting;
   - prior-24-hour conversations, newly created or updated contact records, handoffs, tickets, and follow-up tasks when the live UI exposes defensible counts;
   - prior-24-hour workflow enrollments and success/failure for internal email, task creation, and in-app notification actions.
6. Read the latest 48 hours of the exact Slack group DM and recent canonical Momentum evidence to identify issues reported, debugging performed, configurations changed, resolutions verified, and promises or approvals still open. A Slack claim is evidence to verify, not proof by itself.
7. Never include a visitor's name, email address, phone number, message text, or other lead-level identifier in the report.

### CallRail and HubSpot ingestion

1. Use the existing authorized session for CallRail account `Momentum Digital LLC`, account ID `671942387`. Prefer the authenticated in-app browser. If that surface is unavailable, validate the non-secret Access Broker route and use the existing authorized persistent Chrome session in the background. Fail closed on any account other than `671942387`; in particular, never use the separate QC Kinetix account. Never open Edge, disturb a foreground YouTube or YouTube TV tab, expose credentials, or continue past MFA, CAPTCHA, passkey, recovery, or new-consent gates. Close/reset temporary task tabs after collection while preserving authentication.
2. Treat all timestamps as America/New_York and calculate the exact prior 24-hour window ending at the run time.
3. If the direct CallRail UI is unavailable, read every page of the exact Slack `#calls` mirror (`CSEDG476U`) for that 24-hour window. This is the existing CallRail-connected event feed, not a human summary. For its `Phone Call Completed` events:
   - use the Slack event timestamp as the observed completion time;
   - treat `Source Name = Outbound` separately and exclude it from inbound totals;
   - classify a numeric duration as answered, `(unanswered)` as unanswered, `(abandoned)` as abandoned, and `(voicemail)` as voicemail;
   - exclude human messages and non-call bot messages from call totals;
   - never copy caller names, numbers, destinations, recordings, or message content into the report.
4. Use the Slack mirror only for fields it directly proves. It can prove core call-event counts and exact-window after-hours event counts. It cannot by itself prove a routing recipient, CallRail alert configuration, SMS direction, or SMS delivery success. Withhold those narrower fields unless the direct CallRail UI or API proves them.
5. Include only Momentum account activity. Do not use or combine records from the separate QC Kinetix account.
6. Verify and report:
   - total, connected, unanswered, abandoned, and voicemail calls;
   - inbound and outbound counts separately;
   - calls during 10:00 PM through 6:00 AM;
   - after-hours routed to Sean, routed to Jason, and unresolved;
   - verified Mia missed-call autoresponses and failed SMS;
   - material tracking, routing, or SMS alerts.
7. Run the protected read-only HubSpot report for the covering dates:

   `C:\Users\dillo\Documents\Codex\2026-07-12\hubspot-agent-set-jasonhubspottoken-ps1-hubspot\hubspot-agent\Invoke-HubSpotAgent.ps1 jason-report --from YYYY-MM-DD --to YYYY-MM-DD --format json`

8. Report CallRail ingestion count, contact-association coverage, and owner coverage. Explain briefly when HubSpot's date grain differs from the exact CallRail 24-hour window.
9. If the direct UI is unavailable but the Slack mirror and HubSpot report are both current, do not mark all CallRail data unavailable. In the ops DM, one short clause is enough: calls from the Slack mirror, direct CallRail unavailable. Withhold routing, SMS-delivery, or alert fields the mirror cannot prove. Omit that diagnostic sentence from `#360marketing` unless it changes the call numbers.

### Automation health

Check Windows scheduled task `Momentum360-Daily-Agent-Health`, its most recent result, and the latest runner log. Mention a material runner failure or retry only in the ops DM, and only if it changed today's result. Do not include Windows result codes, command-line secrets, or private log content in either Slack message.

## Slack message contract

Write for a busy reader. Collect thoroughly. Do not paste the diagnostic dump.

Ops DM shape, at most 12 lines:

```
<@UAK3WSY15> <@U05MUGHN031> Morning AI and lead-response update — [time] ET
Report ID: M360-DAILY-{{RUN_DATE_ET}}

Status: Live or Degraded. One sentence on CRM, alerts, capture, and handoff.

Last 24 hours: N contacts, N tickets, N tasks. Omit unverified fields.

Calls: N inbound, N answered, N unanswered, N abandoned. Overnight: N. HubSpot: N associated, N owner-assigned.

Next: one concrete repair or monitor action.
```

`#360marketing` shape, at most 10 lines:

```
<@UAK3WSY15> Morning AI and lead-response update
Report ID: M360-DAILY-{{RUN_DATE_ET}}

Status: Live or Degraded. One plain sentence.

Last 24 hours
• N new contacts
• N tickets
• N tasks

Calls
• N inbound, N answered, N unanswered, N abandoned
• Overnight count
• HubSpot association and owner-assignment counts

Next: one plain-language restore or monitor action.
```

Do not include Windows result codes, DPAPI, mutex or attempt counts, or "withheld, not reported as zero" boilerplate. If a field is unavailable, omit it or say "unverified" once. Skip `Resolved / configured` unless something actually changed. Put a current failure in Status or Next, not both.

Use whole integers for lead, contact, ticket, task, and event counts. Do not make conversion claims unless the exact definition, dates, attribution, latency, tracking, and CRM evidence are validated. When they are not, use `Conversion reporting is pending validation` if conversion status must be mentioned.

## Failure behavior

- The daily notification itself is mandatory. If one source is unavailable, still send the two short `DEGRADED` copies with every verified number and name the unavailable source once. Never fill an unavailable field with zero.
- Do not describe a known authorization defect as an unexplained outage. Report the exact guarded preflight category and the minimum corrective action, without exposing credentials.
- If the direct CallRail UI, Slack event mirror, and HubSpot ingestion are all unavailable or contradictory, say `CallRail live data unavailable; metrics withheld` and include the verified HubSpot/configuration evidence that remains defensible.
- If HubSpot is unavailable, say `HubSpot live data unavailable; metrics withheld` and include the verified CallRail and automation sections.
- Never invent research, metrics, successful delivery, contact creation, or alert receipt.
- Do not change HubSpot, CallRail, Slack, routing, SMS, ownership, or workflow settings during this reporting run.

After sending, read both Slack conversations again. Verify today's report ID in each destination that should have it, both ops-DM mentions, and the Sean mention in `#360marketing`. Close or finalize task browser tabs while preserving authentication. Your final response must contain `DELIVERY_CONFIRMED`, `CHANNEL_DELIVERY_CONFIRMED`, `M360-DAILY-{{RUN_DATE_ET}}`, and both Slack timestamps or links. If a destination already had today's report, still print that destination's marker with the existing link. Do not print a confirmation marker for a destination that was not verified.
