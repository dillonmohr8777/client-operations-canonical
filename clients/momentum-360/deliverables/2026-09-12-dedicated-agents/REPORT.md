# Momentum dedicated-agent investigation

Historical investigation/replay record. For the final September 13 implementation, 168 local checks, restored local schedule, and remaining external gates, see [STACK-CLOSEOUT-2026-09-13.md](STACK-CLOSEOUT-2026-09-13.md) and [STATUS.json](STATUS.json). Earlier disabled-runner and prototype test counts below describe their observation time.
September 12, 2026. State: research and offline pilot staged; no new Slack employee agents deployed.

The strongest opportunity is to give each person an agent that owns a small set of outcomes and returns finished evidence. The recurring problems in the reviewed Slack evidence are lost context between systems, missing ownership, incomplete briefs, review bottlenecks, and automation that appears installed but is not functioning.

## What the search actually covered

The live connector listed 43 membership channels. Full channel discovery, paginated to the end, returned 368 channels: 57 unarchived and 311 archived. Every discovered channel received a 2026 search. Fifty-eight returned matches. Five public channels found early were 360leads, 360newprojects, 360boilerroom, 360photographers, and 360brokerage; the expanded directory added public web-development, SEO, production, and existing AskRocco channels.

The channel survey retrieved 3,664 results. Combined with targeted first-half-of-year searches and January 1 coverage, the counted corpus contains 3,945 distinct indexed messages. Additional profile searches and selected full thread reads were reviewed separately. Results include current messages through September 12. These are retrieval counts, not counts of independently verified business problems.

This is a complete search of the discoverable channel directory, not a complete reading of every message. Forty-four channel queries retain older result pages. The survey excludes DMs and group DMs, and excludes bots by default; selected bot threads were then read in full. Files, voice clips, and video contents were not transcribed or independently inspected. Zero indexed results do not establish that a channel never had relevant work. Unknown private channels remain unknown. See [coverage.json](coverage.json) for exact per-channel dates, counts and continuation cursors.

Both Melissa Silber and Melissa Rigby are real Slack users. The requested Melissa remains ambiguous, so their responsibilities stay separate. Jason Fallon is one person, the VP of Sales profile; J-son Dave Ramo is a different production teammate.

## Findings that change the plan

### 1. Lead identity and source context break between automations

On September 10, Jason asks what campaign a lead came from. Nick explains that an automation creates a HubSpot contact, then another automation pushes all HubSpot contacts into Slack, creating a second notification. The parent notification lacks campaign context. This directly supports the duplicate-notification mechanism as described by the team; current Zap configuration still needs read-only verification before a provider change. [Full thread](https://momentum3d.slack.com/archives/C05R2B1ULF6/p1789058361970009).

This pattern predates September. On March 25, Mac reports that website forms no longer appear connected to 17hats, and on March 31 Jason reports Meta leads not syncing to HubSpot. These are historical incidents, not proof those exact faults remain open. [Mac, March 25](https://momentum3d.slack.com/archives/C1CFQBC79/p1774470069000759), [Jason, March 31](https://momentum3d.slack.com/archives/C08PB4N3L6L/p1774968325915129).

The first useful sales agent should reconcile source, campaign, inquiry identity, CRM record, accountable owner and next action. It should not merely summarize notifications. Jason describes task alerts and an after-hours AI bot as future plans on September 10; neither message proves working deployment. [Task alerts](https://momentum3d.slack.com/archives/C05R2B1ULF6/p1789062122049379), [After-hours plan](https://momentum3d.slack.com/archives/C05R2B1ULF6/p1789062143533599).

### 2. The existing AI assistant already demonstrates the failure we must avoid

The newly discovered AskRocco channel contains an August 19 creative request with 63 replies. Melissa repeatedly supplies answers and asks for the creatives. The assistant repeatedly requests forms and restates already answered questions. It eventually posts links for two creative concepts in two sizes, despite an earlier request for three options. Those links were not visually evaluated in this investigation. A later thread also returns asset links, so the supported finding is excessive interaction and inconsistent requirement retention, not inability to generate anything. [Full 63-reply thread](https://momentum3d.slack.com/archives/C0B3T401W77/p1787166794634639).

On September 3, Mac asks Melissa whether the tool is helpful. AskRocco replies as though Mac asked whether tagging Melissa was useful. That is direct evidence of a context/trigger failure. Internal implementation cause is unverified. [September 3 thread](https://momentum3d.slack.com/archives/C0B3T401W77/p1788444824755659).

Our acceptance criteria: accept plain-text answers; retain known fields; ask only material missing questions; honor requested artifact count; invoke the correct tool; verify outputs; and do not answer human-to-human messages unless invited. These are agent behavior requirements, not capabilities proved by the offline replay.

### 3. The current daily agent has stopped before execution

The Windows task Momentum360-Daily-Agent-Health exists and is Ready. Its latest observed run is September 12 at 09:00:02 with result 0xFFFD0000. The hidden-task manifest points to Run-MomentumDailyAgentHealth.ps1, but that file is missing. Local final receipts stop on September 1.

A source commit contains the runner and eight support files. Recovery is staged in [runner-repair](runner-repair/README.md), with no restoration to the enabled sender path. Source recovery does not prove that current HubSpot/CallRail access, model settings, deduplication ledger, or Slack delivery will pass. A ready scheduler is insufficient; health must depend on a successful recent run and the intended receipt.

## Dedicated responsibilities

| Human owner | Agent responsibility | Concrete first output | Success condition |
| --- | --- | --- | --- |
| Sean Boyle | Operations and decisions | Decision packets for Apollo capacity, production brief gaps and scope changes | Each decision has the exact missing input, options, responsible person and deadline; fewer repeat status chases |
| Mac Frederick | Revenue and reporting | Per-client report evidence checks plus milestone/payment readiness | Metrics reconcile to correct accounts and periods; project-ready and paid are separate states |
| Melissa Silber | Marketing delivery | Editorial/outreach dependency map, lead-system map and creative briefs carried through production | A request produces its artifact or one precise blocker without repeated interrogation |
| Melissa Rigby, pending focus confirmation | Client delivery and specialist support | Review agenda, milestone acceptance checklist and scoped technical escalation | Build completion, internal review, client acceptance and delivery are independently evidenced |
| Jason Fallon | Sales follow-through | One lead record with campaign context, accountable owner and next action | Duplicate notifications do not create duplicate work; missing attribution is explicit; follow-up has a verified receipt |
| Shared verifier | Quiet review service for all five | Evidence, scope, freshness and completion check | Cannot mark a task complete based only on another agent saying so |

Sean's immediate examples include Apollo import credits awaiting a quantity decision and production work awaiting video duration and budget. [Apollo, September 11](https://momentum3d.slack.com/archives/C0B6UUBMW9M/p1789151088602009), [Production, September 11](https://momentum3d.slack.com/archives/C0245CEKF16/p1789152985631049).

Mac's examples include a requested weekly Meta/GHL update, report feedback asking for real GA4/GSC metrics, and a Puttery deposit attempt reported unsuccessful. Those are requests and reported events; current platform/billing state was not independently rechecked. [Reporting](https://momentum3d.slack.com/archives/C09CU4AM8HJ/p1789059904745759), [Missing traffic metrics](https://momentum3d.slack.com/archives/C0AEGE1V5KR/p1785881587417859), [Deposit](https://momentum3d.slack.com/archives/C0BT1P1PGJF/p1789073287527119).

Melissa Silber's latest requests span press-release outreach follow-up, website edits and missing account-manager surveys. Earlier in September she could not locate some Google Ads automations and asked whether GHL follow-up owners had synchronized. [Outreach](https://momentum3d.slack.com/archives/C0B6UUBMW9M/p1789133368107859), [Website dependencies](https://momentum3d.slack.com/archives/C1CFQBC79/p1788453649274459), [Automation map](https://momentum3d.slack.com/archives/C09CU4AM8HJ/p1788298451873669).

Melissa Rigby's delivery evidence includes completed milestones requiring client review and prior Framer specialist requests. She also explicitly asks how the team can use AI safely without everyone granting unstructured access. This makes simple permissions and predictable behavior part of adoption. [Milestones](https://momentum3d.slack.com/archives/C0BGWRK03B2/p1788445311858119), [Framer](https://momentum3d.slack.com/archives/C8NF1N3NH/p1780069514327299), [AI access concern](https://momentum3d.slack.com/archives/C066HKJ2E/p1782334916798589).

These are work constraints evidenced in organizational Slack. They do not establish the people's private-life priorities. Personal scheduling or other personal support would need the person's chosen scope and authorized sources.

## How the agents should cooperate

One coordinator owns each outcome and the existing canonical queue. Agents exchange small work packets with source locators, current facts, a deliverable, dependencies and acceptance criteria. They do not replay the entire Slack history to each other.

For the lead issue: Jason's agent identifies an incomplete lead packet; Melissa's agent checks campaign/source mapping; a systems worker prepares the exact automation patch; the verifier checks a controlled replay; Sean receives only the remaining business decision. The provider mutation is held for the authorized owner. A lead's client information must never be copied into unrelated client channels.

A bot reply is not a new human request. Ignore agent-originated chatter unless it carries an explicit work-item handoff. Use stable event identities, bounded handoffs, cancellation propagation and a worker cap. On task completion, stop workers. These constraints prevent endless agent conversations and wasted tokens.

Start with one Slack app and named operating modes. This is lower overhead than five independently addressable bot users. Distinct bot accounts can be added when the team actually needs separate mentions, identities or permission boundaries. Display-name overrides alone are not independent identities.

## Current platforms and access

Slack has first-class agent session methods, visible working states and a stop event. Those are a user interface around execution, not a durable worker runtime. [Slack agent sessions](https://docs.slack.dev/ai/agent-sessions/).

Slack Real-time Search can expand useful public-channel discovery under appropriate app/user scopes without joining every public channel. Private-channel search is limited by the consenting user's access and required scopes. A new bot does not inherit Dillon's connector access. The present 368-channel result is proof of this connector's discovery, not proof a future app will see the same set. Request exact missing memberships or consent from the appropriate channel/workspace owner; no permissions were changed here. [Slack Real-time Search](https://docs.slack.dev/apis/web-api/real-time-search-api/).

OpenAI currently documents a managed Agents API for persistent execution, alongside Agents SDK and Responses API options. It can be considered for durable sessions and recovery after the local pilot passes. Account availability, credentials, executor compatibility and billing remain untested here. Another active recovery task owns the existing local Agents API checks, so this investigation did not duplicate them. [Agents API](https://developers.openai.com/api/docs/guides/agents-api/overview), [Self-hosted execution](https://developers.openai.com/api/docs/guides/agents-api/environments/self-hosted).

Grok Bot is a verified xAI product with persistent AI teammates. The useful reference is named workers with continuity, tools and finished outputs. Its product experience and the xAI model API are different integration choices. This investigation did not establish that Grok Bot is installed into Momentum Slack or that its product can be replicated simply by calling the xAI API. [Grok Bot](https://x.ai/bot), [Enterprise description](https://x.ai/news/grok-bot-for-enterprise).

## Cost and acceptance

Use deterministic code for schema checks, routing, deduplication checks and readiness checks. Use Luna medium for bounded extraction or drafting and GPT-5.5 xhigh for difficult implementation or reconciliation, subject to actual model availability on the selected runtime. These local model routing names are not a guarantee of API availability.

Three workers is a starting concurrency ceiling, not a target. Fetch context once, reuse small source-backed packets, retrieve changed threads, and stop workers when their artifact is ready. Do not poll a model to ask whether anything changed when a timestamp or file check can answer.

Measure cost per independently accepted outcome: total model/tool cost including retries, failed jobs and review divided by accepted outcomes. Also track human clarification turns, stale reminders, duplicate work, completion-without-proof errors and median time from request to accepted artifact. No dollar savings, production throughput or ROI were measured in this investigation. The local replay calls no model API and incurs no API model charges.

## What is staged

- [Evidence cards](evidence-cards.json): eleven source-backed work packets, with no raw Slack message archive.
- [Agent contracts](agent-contracts.json): proposed responsibilities and boundaries.
- [Offline pilot](PILOT.md): runnable replay and its precise limits.
- [Replay results](replay-results.json): draft packets; not execution receipts.
- [Runner recovery](runner-repair/README.md): source restoration diagnosis and safe review procedure.
- [Coverage](coverage.json): exact search scope and remaining history pages.
- [Lead repair specification](lead-repair-spec.md): proposed data and duplicate-handling behavior before touching providers.

Recommended activation sequence: review one named owner and channel set; validate actual connector/app scopes; run a private, read-only shadow pilot; test source duplication, resolved-thread suppression, cancellation and restart; then approve exact internal posting destinations and actions. Only after receipt-backed reliability should write actions expand.

No app installation, invitation, OAuth expansion, client message, call, payment, model API spend, deployment, or publication was performed. No unresolved bottleneck is labelled fixed by this report.

## Implementation continuation
See END-TO-END.md for the local pilot and activation package. Current read-only Zapier inspection confirms source379667050 v3ON and companion365085675 v2ON; the companion published template literally leaves Source blank. The two targeted CRM records already have owner/campaign and different existing task states. The local adapter passed46 checks plus independent Luna review and repeat demo yielded2 inquiry rows with retry counts1 each. These are local drafts, not live repairs or deployed agents. Full findings and limits: zapier-live-verification.md, lead-review-preview.md, lead-agent/README.md, ACTIVATION.md.

