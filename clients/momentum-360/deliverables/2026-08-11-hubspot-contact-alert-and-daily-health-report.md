# Momentum 360 Customer Agent contact, alert, and daily health configuration

Date: 2026-08-11

HubSpot portal: `50612503`

Status: Alert workflow live and action-verified; CRM contact creation and field updates verified; daily report task installed and delivery-verified; CallRail core-event fallback configured; one handoff-specific guideline revision remains unpublished because HubSpot's publisher is returning an internal backend error.

## Live production configuration

- Customer Agent: `Customer Agent, Momentum 360 Assistant`
- Website chatflow: `Momentum 360 Website Assistant`, ID `96377499`
- Channel email capture: `At the start of the conversation`
- CRM data permissions:
  - First Name: view and edit enabled
  - Last Name: view and edit enabled
  - Phone Number: view and edit enabled
- Published main guidelines require email, first name, last name, and phone collection at conversation start, permit an explicit refusal without invented data, and require values to be saved to the matching contact properties.
- Async human handoff creates a Help Desk ticket, assigns Sean Boyle, keeps the chat open, and does not restrict assignment to users marked Available.
- Jason Fallon does not have the Service seat required for ticket ownership, so Sean remains the ticket owner while Jason receives independent workflow notifications.

## Guaranteed conversation alert workflow

- Workflow: `Momentum 360 - Customer Agent - Immediate Alerts`
- Workflow ID: `1865051017`
- State: ON
- Enrollment: every future conversation whose Chatflow is `Momentum 360 Website Assistant`
- Actions:
  1. Internal email notification to Sean Boyle and Jason Fallon
  2. Immediate high-priority task `Follow up: new Momentum 360 website chat`, assigned to Sean Boyle and associated with the conversation's contact
  3. HubSpot in-app notification to Sean Boyle and Jason Fallon
- Re-enrollment is off so one conversation produces one alert set.

## Live action verification

- Fresh public website conversation: `11074220129`
- Enrollment started: 2026-08-11 11:32 AM EDT
- HubSpot workflow log readback:
  - trigger criteria met: Success
  - internal email sent: Success
  - task created and assigned to Sean: Success
  - task ID: `114638043544`
  - in-app notification sent: Success
  - workflow completed: Success
- Jason confirmed the email opened the HubSpot conversation at 11:38 AM EDT in Slack group DM `C0B2N20A0SW`.
- Sean confirmed receipt at 11:41 AM EDT in the same group DM.

## Contact-record verification

The HubSpot Customer Agent tester was run as an Unknown visitor with reserved synthetic QA data. It performed the required intake in this order:

1. Email
2. First name
3. Last name
4. Phone number
5. Service question

HubSpot showed CRM tool activity after the field answers. The Contacts table was then opened directly and showed one newly created record:

- Contact record ID: `241308874310`
- Name fields: populated
- Email field: populated
- Phone field: populated
- Create time: 2026-08-11 11:48 AM EDT

This verifies the contact creation and property-update path, not only the chat prompts. No contact-owner rule was added because the existing owner-routing decision is still unapproved; follow-up ownership is enforced through Sean's conversation task and Help Desk ticket.

## Handoff-guideline publication exception

A stricter handoff-specific rule was drafted to collect missing First Name, Last Name, and Phone Number before non-urgent or cannot-answer handoffs while preserving HubSpot's required immediate transfer for explicit human requests, urgent support, credit pauses, and system errors.

HubSpot preflight initially identified a contradiction between immediate system transfers and an older every-handoff intake rule. The main and handoff drafts were aligned to the same exception model. The final handoff preflight returned `No issues detected`, but the publish request still returned a generic server-side error:

- `There was a problem validating your instructions.`
- `Something went wrong while publishing your instructions. Please try again.`

The aligned drafts are autosaved but are not represented as published. The already published contact-first main guideline remains live. The conversation-level alert workflow is independent of handoff behavior and therefore still guarantees Sean and Jason receive email and in-app alerts plus Sean's task for every new website conversation.

A final live retry at 12:23 PM EDT opened the HubSpot publish preflight, but its result table remained blank and the final Publish control stayed disabled after repeated waits. No draft content was lost. This reinforces that the remaining exception is isolated to HubSpot's instruction-publishing service rather than the active contact-write permissions, chatflow, handoff process, or alert workflow.

Network-level isolation then captured the failing HubSpot RPC. `bulkPromoteDraftGuidelines` returned HTTP 400 with `INTERNAL_ERROR` and the message `An unexpected error occurred while generating goal determination subguideline`. Publishing each general draft individually failed the same way, including drafts restored to the exact current published text, so the failure is not caused by the new handoff wording. Correlation IDs retained for HubSpot support are:

- `019ff1bb-d5e5-7359-97c7-7276c8e9f8f5`
- `019ff1bd-139e-7eba-8a40-c8b780e3d6bf`
- `019ff1bd-68c8-78c0-9766-1c03ed53a89a`

The three general drafts were restored to their exact live published content to avoid any behavioral conflict while the vendor defect remains open. Production alerting, contact writes, chatflow behavior, and the published contact-first guideline remain live. The separate stricter handoff draft remains autosaved but unpublished.

## CallRail account and reporting repair

The correct production boundary is `Momentum Digital LLC`, account ID `671942387`. The approved Google sign-in for `dillonmohr8777@gmail.com` authenticated successfully but opened the unrelated QC Kinetix account `906396198`; the run stopped without reading or changing that account. Direct navigation to account `671942387` was rejected, confirming that this Google identity currently lacks Momentum account access.

The daily prompt now fails closed on any account other than `671942387` and uses the existing CallRail-connected Slack `#calls` event mirror as a bounded fallback when the direct UI is unavailable. A full read-only diagnostic completed with `CALLRAIL_DIAGNOSTIC_CONFIRMED` for the exact August 10, 2026 1:00:01 PM through August 11, 2026 1:00:01 PM ET window. The mirror showed:

- 16 total completed call events
- 13 inbound events and 3 outbound events
- 11 answered or connected events, 2 unanswered events, 3 abandoned events, and 0 voicemail events
- 0 events during the configured 10:00 PM through 6:00 AM after-hours window

The mirror intentionally does not claim Sean-versus-Jason routing, Mia autoresponse delivery, or CallRail alert configuration. Those fields require direct UI or API proof. A covering-date protected HubSpot report generated at 12:44 PM EDT independently showed 23 CallRail-ingested calls, 20 inbound calls, 11 answered calls, 9 missed calls, 55% answer rate, 0 after-hours calls, 100% contact association, and 0% owner coverage. These HubSpot figures use calendar-date grain and are therefore kept separate from the exact 24-hour mirror window.

Durable direct CallRail collection still requires one human/account action: invite the authorized identity into Momentum account `671942387`, or unlock/use the exact existing Momentum CallRail item through the approved Bitwarden workflow. No CallRail API key was created or exposed.

### Stakeholder follow-up

A verified implementation and blocker update was sent to Sean and Jason in the exact group DM at 1:06 PM EDT and read back successfully. It included the live HubSpot behavior, daily reporting schedule, exact CallRail fallback diagnostic, account mismatch, HubSpot publisher exception, and the remaining after-hours test.

- Slack timestamp: `1786467986.914519`
- Message: <https://momentum3d.slack.com/archives/C0B2N20A0SW/p1786467986914519>

## Daily reporting automation

- New task: `Momentum360-Daily-Agent-Health`
- Schedule: daily at 9:00 AM America/New_York
- Destination: Slack group DM `C0B2N20A0SW`
- Mentions: Sean Boyle and Jason Fallon
- Content:
  - agent/channel/contact-capture status
  - prior-24-hour conversations, contact updates, handoffs, tickets, tasks, and alert-action results
  - issues resolved, debugging performed, and configuration changes since the prior report
  - CallRail prior-24-hour call, after-hours, Mia SMS, and HubSpot-ingestion health
  - exceptions, pending decisions, and next action
- Duplicate control: one visible `M360-DAILY-YYYY-MM-DD` report ID
- Delivery proof: runner succeeds only after Slack readback contains `DELIVERY_CONFIRMED`
- Resilience: one in-run retry, one verified degraded-notice fallback, and three Windows retries at 15-minute intervals
- Hidden execution: `Run-HiddenScheduledTask.vbs` through the canonical TSV manifest
- Superseded task: `Momentum360-Daily-CallRail-Summary` disabled after its 2026-08-11 run returned result `1`

### First scheduled-run verification

- Manual start of the installed scheduled task: 2026-08-11 12:12:26 PM EDT
- Windows task result: `0` (success)
- Task state after run: `Ready`
- Next run: 2026-08-12 9:00 AM EDT
- Slack message timestamp: `1786465182.124779`
- Slack message: <https://momentum3d.slack.com/archives/C0B2N20A0SW/p1786465182124779>
- Report ID and both recipient mentions were read back from the exact destination before the runner wrote `DELIVERY_CONFIRMED`.

The first native runner attempt exposed a PowerShell integration defect: Codex emits a normal informational line on stderr, and `$ErrorActionPreference = 'Stop'` treated it as terminating before the CLI finished. The runner now relaxes native stderr handling only around the Codex process, restores strict error handling immediately afterward, and continues to require the process exit code plus verified Slack readback. Log writes were also normalized to one encoding to prevent mixed UTF-8/UTF-16 output.

The first delivered report was explicitly labeled degraded for exact live CallRail browser metrics because that browser surface was not available to the background run. It did not substitute zeros. The protected HubSpot date-grain report did verify 22 CallRail-ingested calls, 22 associated contacts (100% association coverage), and zero assigned owners (0% owner coverage), while clearly distinguishing those figures from the exact prior-24-hour CallRail window. The prompt now directs a safe authenticated Chrome fallback and, when direct account access is unavailable, the bounded Slack-mirror plus HubSpot cross-check described above. Direct routing and SMS-delivery proof remains subject to restoring access to account `671942387`.

## Rollback

1. Turn off workflow `1865051017` to stop the all-conversation email, task, and in-app alerts.
2. Restore channel email capture to its prior handoff-time setting if required.
3. Remove First Name, Last Name, and Phone Number edit permission from the Customer Agent if CRM writes must be stopped.
4. Restore the prior published main guidelines from HubSpot's published view.
5. Re-enable `Assign to available users only` only if unassigned tickets while Sean is Away are acceptable.
6. Disable `Momentum360-Daily-Agent-Health` and re-enable `Momentum360-Daily-CallRail-Summary` to restore the prior `#calls`-only automation.
