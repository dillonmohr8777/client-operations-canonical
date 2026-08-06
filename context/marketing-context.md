# Dillon Marketing Context

Last updated: 2026-07-16
Freshness: current for operating rules; portfolio economics and client strategy remain incomplete
Scope: Dillon's multi-client marketing operation and the Marketing Chief control room. This is not a substitute for a client-specific brand context.

## Bottom line

Dillon is not failing at prompting. The operating system has required him to remember and reconcile client identity, project location, prior decisions, credentials, quality expectations, approvals, and next actions across many tasks. The remedy is one authoritative state spine, exact client routing, bounded specialist work, explicit evaluation, and a correction loop that changes future behavior.

## Product overview

Status: medium-confidence synthesis from current work and client records.

**One-liner:** DM Marketing Specialist operates as a hands-on marketing partner across strategy, web, paid media, CRM, reporting, content, creative, and client communication.

**Product category:** Multi-client marketing services and fractional marketing operations.

**Product type:** Service business with client-specific scopes.

**Business model and pricing:** Not yet documented in canonical state. Do not infer retainers, margins, pricing, or profitability.

## Operating audience

This context has two audiences:

1. Dillon, who needs one command center that predicts, executes, verifies, and reconciles work.
2. Client stakeholders, whose brand, audience, offer, proof, voice, design, metrics, and approvals must remain client-specific.

The portfolio spans materially different categories. Never blend audiences, brands, results, accounts, or creative standards merely because Dillon manages them.

## Jobs to be done

- Turn inbound client communication into the actual deliverable, not just a summary.
- Keep commitments, priorities, approvals, and artifacts visible without Dillon coordinating worker tasks.
- Produce evidence-backed marketing work that survives factual, visual, voice, and live-state verification.
- Connect media and creative activity to trustworthy business outcomes.
- Reuse authorized sessions and opaque vault locators without persisting or revealing secrets.

## Core problems

Verified from the July 15 audit and current system state:

- Work was organized around dated conversations instead of stable business identity.
- Multiple partial control centers existed without one authoritative queue.
- Loose routing produced duplicates, false-routed packets, and low-value artifacts. The older Bridge incident was an unrelated newsletter packet caught by generic label matching; it did not mean the real Bridge Software client was fake.
- Voice was represented mainly as adjectives and punctuation rules rather than accepted examples and edit deltas.
- Design taste was scattered across projects rather than encoded as reusable references, anti-references, and QA criteria.
- Reporting containers often matured faster than tracking, attribution, and follow-up integrity.
- Automation state, installed definitions, and actual runtime behavior could disagree.

## Operational alternatives and why they failed

| Alternative | Failure mode |
|---|---|
| Longer universal prompts | Instructions cannot replace current client, commitment, and outcome state. |
| One immortal conversation | Transcript length is not a transactional source of truth and does not solve worker or automation reconciliation. |
| More autonomous agents | Parallel output amplifies errors when routing and acceptance gates are weak. |
| More dashboards | A visible container does not prove source freshness, KPI correctness, or decision value. |
| Standalone recurring tasks | They create task clutter and context drift when Dillon expects one control room. |

## Differentiation of the target operating model

- One logical Marketing Chief control surface backed by one shared canonical project, with authorized writer instances on DESKTOP and AHCM.
- One exact client registry and one stable client folder per client.
- One versioned work queue, one human control view, and one append-only correction ledger.
- Background sensors write redacted intake observations only. They never create user-facing tasks or mutate canonical work state.
- The Chief alone reconciles bounded worker handoffs into canonical state.
- Every consequential output is judged against outcome, evidence, voice, design, risk, and live readback.
- External messages, publishing, deployment, spend, permissions, and destructive changes remain approval-gated. A client-specific standing authority is reusable explicit approval only inside its exact requester, account, action, budget, location, schedule, and expiration limits. Missing or conflicting fields fail closed while the local deliverable continues to be built.

## Local AI routing capability

OmniRoute is an optional local Marketing Chief capability, not a replacement control plane. Use `$omniroute-gateway` when provider or model routing, quota visibility, fallback combinations, compression, an OpenAI-compatible local endpoint, or OmniRoute MCP is directly relevant. The Chief must inspect live Status and Doctor results first and verify loopback-only binding before relying on it.

The non-secret routes are `http://127.0.0.1:20128` for the dashboard and `http://127.0.0.1:20128/v1` for the API. Normal Codex and OpenAI authentication stays unchanged until a healthy provider, a scoped endpoint key, and an explicit Dillon request support a separate OmniRoute client profile. Provider connection, model or route changes, compression policy changes, MCP mutations, cloud features, tunnels, and LAN or public exposure are never inferred from installation alone.

The 2026-07-23 integration baseline verified OmniRoute `3.8.48`, HTTP 200, loopback-only port `20128`, zero Doctor failures, and a successful direct MCP stdio handshake exposing 99 tools. The packaged missing-`undici` MCP defect was repaired locally, so every reinstall or update must re-run the MCP regression check. No provider account was connected. The production dependency audit reported 6 high and 4 moderate advisories and no critical advisories, so the version remains pinned and update work requires provenance, lifecycle-script, dependency-audit, backup, liveness, loopback, and MCP-handshake review. OmniRoute status belongs in the existing Chief evidence and queue conventions; it never creates another queue, project, or control center.

The Marketing Chief Operator Studio remains the one owner-only hosted view of allowlisted canonical state. At the July 23 baseline, Sites version 10 matched source commit `b4cb9bcc14b31563bb62c82883fab5f36dc2b018`, all ten saved versions had immutable source archives, D1 was configured, and the independent hosted-plus-local backup gap was closed through `MarketingChief-SitesBridge` with 90-day retention. The active `marketing-chief-twice-daily-brief` automation runs at 9 AM and 5 PM America/New_York, verifies OmniRoute and Sites health, and sends only material deltas to the existing Marketing Chief task. It is a monitor and approved thread-delivery path, not another task, writer, queue, or grant of authority for configuration or external action.

## Switching dynamics

**Push:** repeated prompting, lost context, duplicate sessions, uncertain credentials, inconsistent work quality, and anxiety about what is actually active.

**Pull:** one place to say "continue," a truthful next action, finished reviewable work, fewer interruptions, and persistent learning.

**Habit:** opening a new task to preserve each urgent thought and adding another system when an existing system is incomplete.

**Anxiety:** fear that consolidation will lose useful history, expose client data, or make automation take actions without approval.

The design response is additive evidence preservation but substitutive authority: archives remain available, while only `client-operations` is live authority.

## Dillon's language and expectations

The recurring requests are direct:

- "Why can't I just be in one session?"
- "Why can't you know my voice more?"
- Predict the next action instead of waiting for another literal instruction.
- Build the requested outcome first and interrupt only for a real blocker.
- Treat exact current-client Gmail or Slack requests as work triggers. For paid media, predict and build the whole downstream package, including the location landing page when needed, instead of waiting for Dillon to enumerate campaign, creative, tracking, and deployment subtasks.
- Use the exact paid-media roster rather than inferring channel eligibility from old reports: Google Ads is KJB, Replenish, Omega, Onsite, and Fresh Blends for Kwik Trip Ice Box campaigns; Meta Ads is Shadow Heating and KJB. Fagan Painting is not running ads and remains excluded until Dillon explicitly reactivates it through the canonical roster. Preserve a separate client and platform blueprint for every lane.
- Treat the July 16 persistent-Chrome Google account readback as the current routing baseline: KJB, Replenish, Fresh Blends, Omega, and Onsite are all exact-account mapped; KJB Google is enabled and its cancelled duplicate is excluded; Replenish and Fresh Blends remain separate client lanes despite sharing one child account.
- Treat the July 16 persistent-Chrome Meta readback as the current routing baseline for Fagan and KJB. Fagan's primary new campaign remained in draft and another campaign remained off; KJB's website traffic and retargeting campaigns were active while its Leads carousel remained in draft. Shadow is not visible in the current Meta portfolio and stays fail-closed until an exact account route is found.
- Inspect every paid-media lane once per operating day. Rank only material delivery, pacing, tracking, lead-quality, landing-page, search-term, creative-fatigue, placement, billing, or change-history findings into the one Marketing Chief queue.
- Learn from repeated accept, modify, defer, reject, and observed performance outcomes so future same-client predictions improve without letting one anecdote become a global rule.

Use plain language. Lead with the outcome. Be candid when a step did not work. Never substitute reassuring wording for live verification.

## Brand voice

Global Dillon voice is now grounded in 1,032 sent client messages across 452 threads, not only adjectives. The recurring shape is a short `Hi` or relationship-appropriate `Hey`, the result or current state first, the minimum useful evidence, practical interpretation, and one concrete ask or checkpoint. Thanks, encouragement, and selective enthusiasm carry warmth; uncertainty, draft state, and modeled versus verified metrics are named directly.

This is an operator voice, not a universal client brand voice. Client-facing campaign copy must load the client's own audience, offer, proof, relationship, voice, and design contract first.

Detailed channel rules live in `DILLON_VOICE.md`.

## Design stance

Design quality comes from a reference-backed contract and rendered evaluation, not an adjective such as "premium." Important work uses a bounded Maker and Verifier loop and stops after three review cycles or surfaces the unresolved choice.

Detailed criteria live in `DESIGN_STANDARD.md`.

## Portfolio priority

Canonical priority lives in `state/portfolio-priorities.json`. Bridge Software is a real active client and the explicit highest-value account at rank 1. VA Claims Edge is rank 2. Bridge intake requires exact source identity so the real client cannot be confused with generic uses of the word "bridge." Zen Spa is inactive and historical-only; Revive remains `needs-confirmation` and excluded from active ranking.

`Get-NextActions.ps1` considers portfolio value only after exact client routing and lane eligibility. Priority cannot bypass due dates, evidence requirements, approvals, safety gates, or WIP limits. Revenue, margin, retention risk, scope cost, and current strategy are not yet complete, so ranks below the two explicit priorities are inferred operating judgments and must remain easy to revise.

## Proof already in the system

- The canonical registry contains 19 client records: 17 active, Zen Spa inactive and historical-only, and Revive quarantined as `needs-confirmation`.
- The queue, control view, and correction ledger are active under this project.
- Prior Align HCM work demonstrates evidence ledgers, conservative attribution, fact checking, a design system, rendered review, and PDF production.
- Prior Hope Wellness work demonstrates live audit, compliance correction, strategic prioritization, and an implementation queue.
- Paid-media work has preserved brand separation and surfaced KPI integrity problems instead of inventing inaccessible data.
- The July 16 original Gmail audit fully paginated the original 18 routes and found 2,555 globally deduplicated messages across 897 threads. A separate exact Bridge supplement covers 27 messages across 5 threads because overlap with the original corpus is possible. Together, the artifacts cover the 19 current registry routes without overstating an aggregate message count.
- The redacted Slack audit exhausted cursors across 106 visible conversations, found 1,232 Dillon-authored messages, and produced live evidence for 12 active clients. Public and private channel, DM, group-DM, and `files:write` capabilities were live-probed. No file was uploaded or shared and no Slack write was performed.

These are evidence of useful operating patterns, not proof of current portfolio profitability or campaign performance.

## Goals

1. Dillon routinely manages one logical Marketing Chief control surface, not a collection of competing worker command centers; authorized DESKTOP and AHCM instances share the same queue and rules.
2. A new request resolves the exact client and loads current context before execution.
3. Safe, local, directly implied work proceeds without another prompt.
4. The system presents at most one meaningful Dillon decision at a time.
5. Suggested-next-action acceptance improves through recorded accept, modify, defer, and reject outcomes.
6. First-pass voice acceptance and design review rounds improve through retrieved corrections and accepted examples.
7. Mixed-client incidents, secret persistence, false automation-health claims, and stale KPIs presented as current remain zero.
8. Communication-triggered launches move from exact source to reviewable landing page, campaign packet, and provider validation without Dillon manually coordinating the intermediate steps.
9. Every active paid-media lane receives one daily review, while paused lanes remain visible without being restarted and non-roster clients never enter ad optimization.

## Known unknowns

Do not pretend these are known until current business evidence is reviewed:

- Client revenue, margin, service cost, scope creep, renewal risk, and concentration risk.
- Dillon's own pipeline, pricing, capacity, and portfolio strategy.
- Current campaign ROI, creative win rates, and client satisfaction across the full portfolio.
- A complete ICP, offer, proof library, accepted/rejected edit corpus, and design contract for most individual clients.

Those gaps should become explicit client-context work, not conversational assumptions.
