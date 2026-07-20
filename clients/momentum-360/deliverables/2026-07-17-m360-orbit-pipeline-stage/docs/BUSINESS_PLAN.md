# M360 Orbit Business Plan

Last updated: July 9, 2026

## Bottom line

**Recommendation:** Launch M360 Orbit as a service-enabled SaaS, not a standalone chatbot and not a cheap model wrapper.

The public app should remain a free proof-of-value experience. The paid product should sell persistent business context, specialist routing, saved work, team collaboration, HubSpot handoffs, and access to Momentum 360's human execution team.

The category story is simple:

> **M360 Orbit is the AI marketing command center for location-based businesses: 19 specialist agents, Momentum 360 playbooks, and one clear next move.**

## Evidence and confidence

| Finding | Status | Evidence |
|---|---|---|
| The canonical app is `https://momentum-360-agents.netlify.app/` | VERIFIED | Live site, Chrome history, and Momentum Slack |
| Leadership wanted a sellable app with a deep knowledge base | VERIFIED | Momentum Slack messages dated July 3-7, 2026 |
| The current page is a second iteration intended to become a page on the main site | VERIFIED | Momentum Slack, July 9, 2026 |
| The live product has 19 roles and a working AI endpoint | VERIFIED | Live product inspection and router test |
| The previous router needed improvement | RESOLVED | The old app routed local SEO to Property Video; the production replacement now routes it to ATLAS |
| Owners will pay $149/month for the proposed Core package | ASSUMPTION | Market-anchored recommendation; requires paid validation |
| Home services and real estate-adjacent businesses are the best beachhead | RECOMMENDED | Strongest overlap with Momentum's services, proof, and client base |

## 1. Market problem

Small and mid-sized location-based businesses usually have one of two bad options:

1. Buy a low-cost general AI tool, then spend time prompting, checking, and coordinating the output.
2. Send every small job to an agency or freelancer, then wait and pay for human throughput.

Orbit creates a third option: specialist software for immediate work, connected to a real agency when the job crosses into production or implementation.

## 2. Ideal customer profile

### Primary ICP

- U.S. location-based service business
- $1M-$20M annual revenue
- 5-100 employees
- $3,000+ monthly marketing activity or spend
- No complete in-house marketing department
- At least two active channels: website/search, paid media, social, email, reviews, or local listings
- A founder or marketing owner who feels the coordination burden personally

### Beachhead verticals

1. Home services: HVAC, plumbing, electrical, roofing, landscaping, cleaning.
2. Real estate and property: brokerages, property managers, developers, venues, senior living, hospitality.
3. Multi-location local businesses: restaurants, retail, health, fitness, dental, and professional services.

### Anti-ICP

- Teams seeking unsupervised autonomous execution.
- Companies with no owner for marketing work.
- Regulated deployments that require certifications and controls not yet in place.
- Buyers comparing only token cost or general-chat subscriptions.

## 3. Positioning

### Positioning statement

For location-based businesses that need more marketing output but cannot justify a full internal team, M360 Orbit is a service-enabled AI marketing command center that routes real business problems to 19 specialist agents and turns them into executable plans. Unlike general AI subscriptions or slow agency queues, Orbit combines Momentum 360 operating playbooks, persistent business context, workflow handoffs, and access to a real execution team.

### Value proposition

> M360 Orbit helps busy local-business teams decide, create, and move marketing work faster by routing each job to a specialist grounded in Momentum 360 playbooks.

### Message hierarchy

- **Headline:** Every angle. One next move.
- **Subhead:** 19 specialist agents, one command center, and a human team when it is time to execute.
- **Benefit 1:** Stop prompting a generalist; brief the right specialist.
- **Benefit 2:** Turn one live problem into work you can publish, launch, send, or assign.
- **Benefit 3:** Keep strategy and execution connected through Momentum 360.
- **Proof:** Momentum's operating history, service breadth, geographic reach, recognition, and live agency team.

## 4. Competitive position

| Alternative | Current market signal | Where it is strong | Orbit's opening |
|---|---|---|---|
| Hostinger Agents | Seven agents marketed around $7/month | Extremely low price and broad SMB reach | Deeper local-marketing specialization and agency execution |
| HighLevel AI Employee | $97/month unlimited plan for several AI functions | CRM-native automation and agency rebilling | A clearer specialist experience and Momentum service handoff |
| HubSpot Breeze Customer Agent | $0.50 per resolved conversation, with paid HubSpot tiers | Native CRM context and outcome pricing | Marketing work beyond support, with 19 visible specialties |
| Vendasta AI Workforce | Channel-partner platform with optional setup services | Large SMB platform and reseller model | Focused product, simpler buying motion, Momentum expertise |
| General AI subscriptions | Low-cost access to powerful models | Breadth and user familiarity | Routing, guardrails, business memory, integrations, accountability |
| Traditional agency | Human judgment and execution | Relationships and bespoke work | Instant first pass and lower-friction expansion into services |

The strategic rule: do not compete on “how many agents” or raw model access. Compete on the shortest credible path from a business problem to an executed next move.

## 5. Product and offer ladder

### Orbit Preview — Free

- One routed specialist plan
- No signup required
- All 19 agents visible
- Save-plan and human-handoff conversion
- Goal: demonstrate value and identify intent

### Orbit Core — $149/month

- One company workspace
- All 19 specialists
- One saved brand/business brain
- 200 specialist runs per month
- Saved plans and exports
- Email support

### Orbit Growth — $399/month

- Five seats
- 500 specialist runs per month
- Shared company memory
- HubSpot handoff workflow
- Monthly Orbit report
- Priority support

### Orbit Managed — $1,250/month + $1,500 onboarding

- Custom knowledge build
- Priority human review
- Quarterly strategy session
- Implementation/handoff credits
- Best for existing Momentum accounts and businesses that need accountability

### Enterprise / multi-location — From $2,500/month

- Multiple locations or brands
- Custom limits, SSO/access controls, and reporting
- Dedicated onboarding and success plan
- Sold only after Core and Growth usage patterns are validated

## 6. Unit economics

The backend defaults to GPT-5.5. Current official pricing is $5 per million input tokens and $30 per million output tokens.

Assumption for one specialist run:

- 1,500 input tokens × $5/M = $0.0075
- 500 output tokens × $30/M = $0.0150
- Estimated model cost = **$0.0225 per run**

| Plan | Included runs | Nominal model cost | 2.5× safety budget | Price | Gross margin before support |
|---|---:|---:|---:|---:|---:|
| Core | 200 | $4.50 | $11.25 | $149 | ~92% |
| Growth | 500 | $11.25 | $28.13 | $399 | ~93% |

These are planning assumptions, not measured production usage. Instrument actual tokens, support time, failure rate, and human-review usage before guaranteeing limits.

## 7. Revenue model

### Year-one target model

| Revenue stream | Quantity | Average monthly value | Monthly revenue |
|---|---:|---:|---:|
| Core | 40 | $149 | $5,960 |
| Growth | 20 | $399 | $7,980 |
| Managed | 10 | $1,250 | $12,500 |
| Onboarding | 4/month | $1,500 | $6,000 |
| Service handoffs | 5/month | $1,500 average | $7,500 |
| **Total target** |  |  | **$39,940/month** |

This target is directional. The fastest route is not public self-serve volume; it is converting existing relationships into Managed and Growth plans while the self-serve product matures.

## 8. Go-to-market plan

### Channel 1: Existing-client expansion

Start with clients already buying SEO, paid media, social, virtual tours, photography, or reporting.

Offer: a 30-day founding pilot with their business context loaded and one workflow tied to an existing service.

Why it wins: trust, data, and an existing execution relationship already exist.

### Channel 2: Free-plan conversion

The public page should convert in this order:

1. Ask a real question without signup.
2. Receive a specialist plan.
3. Save the plan by email.
4. Request founding access or hand the plan to a Momentum human.

Track question category, route, answer completion, email save, handoff click, and booked call.

### Channel 3: Personalized outbound

Use Orbit as the outreach artifact:

- Identify a visible business problem.
- Generate a short specialist plan for that business.
- Send one useful insight and a private link or PDF.
- Ask whether the owner wants the live command center loaded with company context.

This turns outbound from “buy our AI” into “here is useful work already done.”

### Channel 4: Weekly live “Orbit Room”

Run a 30-minute weekly webinar for one vertical:

- Five minutes: the week's market signal.
- Fifteen minutes: live audience questions routed to specialists.
- Five minutes: show one human handoff.
- Five minutes: founding-plan invitation.

This adapts the weekly-webinar idea already discussed internally and gives AI a concrete role in the event.

### Channel 5: Contractor and partner referrals

Momentum's photographer and production network already meets businesses that need ongoing marketing. Give partners a trackable Orbit Preview link and a simple referral payout for activated accounts or service handoffs.

## 9. Sales motion

### Qualification

An account is qualified when it has:

- A recurring marketing workload
- A named internal owner
- At least one measurable growth goal
- Existing systems or channels Orbit can improve
- Willingness to load business context and review outputs

### 30-minute demo

1. Discovery: identify one live problem and its cost.
2. Route it: submit the question without preselecting an agent.
3. Inspect the plan: judge relevance, not novelty.
4. Add context: show how saved company knowledge changes the output.
5. Handoff: show where HubSpot or the human team picks up.
6. Close: choose Core, Growth, or Managed based on workflow complexity.

### Founding cohort offer

- 10 accounts only
- 30-day paid pilot
- Core at $99 for the first month or Growth at $299
- One onboarding session
- Weekly feedback check-in
- Price locks for 12 months in exchange for feedback and a case-study option

Do not offer an unlimited free beta. Charging reveals whether the problem matters.

## 10. 90-day launch plan

### Days 1-14: Internal alpha

- Deploy the new Orbit page and corrected router.
- Run 100 routing tests across all 19 agents.
- Instrument route, latency, error, and conversion events.
- Create a 20-question prompt library for each beachhead vertical.
- Load three sanitized Momentum playbook packs.
- Recruit five internal and existing-client testers.

Exit gate: 90% correct routing on the test set and no material privacy leaks.

### Days 15-30: Paid founding cohort

- Sell 10 paid pilots to existing clients and warm contacts.
- Onboard each with one measurable workflow.
- Run weekly Orbit Room demos.
- Capture time-to-first-value, jobs per week, and handoff rate.
- Publish one transparent build story, not an inflated case study.

Exit gate: at least seven activated accounts and five willing to continue paying.

### Days 31-60: Productize the winners

- Build persistent business memory and saved workspaces.
- Add the two highest-demand integrations, likely HubSpot and email/export.
- Turn the best two workflows into guided “missions.”
- Publish the first measured case study.
- Add Stripe only after the package and limits are stable.

Exit gate: 60% weekly active usage and at least four completed jobs per retained account.

### Days 61-90: Vertical expansion

- Launch Home Services and Real Estate editions with tailored examples and playbooks.
- Add partner referral tracking.
- Train sales on one battlecard and one demo script.
- Raise founding prices for new accounts if retention and support margins hold.

Exit gate: 10 paying accounts, one repeatable acquisition channel, and one vertical with clear retention.

## 11. KPI dashboard

### Product

- Route accuracy: target ≥90%
- Answer completion rate: ≥95%
- Median response time: <15 seconds
- Time to first useful output: <10 minutes from account creation
- Monthly completed jobs per account: ≥4

### Funnel

- Landing page → question submitted: 8-15%
- Answer → email saved: 20-30%
- Saved plan → booked/demo request: 8-12%
- Demo → paid pilot: ≥30%
- Pilot → paid month two: ≥60%

### Business

- Gross margin before human support: >85%
- Human support per Core account: <30 minutes/month
- Expansion into Momentum services: track by service and contribution margin
- Monthly logo churn after cohort: <5%

## 12. Major risks and controls

| Risk | Control |
|---|---|
| “Branded ChatGPT” perception | Visible routing, specialist scopes, saved context, workflows, and human execution |
| Hallucinated advice or claims | Narrow prompts, explicit assumptions, source-aware playbooks, eval set, human escalation |
| Confidential client data in public preview | Clear warning, no response storage, input limits, written paid-tier data policy |
| Weak willingness to pay | Paid founding cohort before heavy platform work |
| Support-heavy Managed tier | Defined onboarding scope and explicit handoff credits |
| Model cost or model change | Environment-configured model, usage telemetry, limits, and fallback responses |
| Too many verticals | One beachhead at a time; expand only after retention evidence |

## 13. Decisions already made

- Product name: **M360 Orbit**
- Tagline: **Every angle. One next move.**
- Category: service-enabled AI marketing command center
- Public motion: free no-signup specialist plan
- Recommended first paid plan: $149/month Core
- Design direction: deep Momentum navy, signal gold, orbit blue, trajectory lines, exact corporate logo
- Roster direction: 19 clear service roles with distinctive callsigns

## Sources

- Momentum 360 public services and company footprint: https://www.momentumvirtualtours.com/
- Momentum 360 branding services: https://www.momentumvirtualtours.com/branding/
- HighLevel AI product pricing: https://help.gohighlevel.com/support/solutions/articles/155000006652
- HubSpot Breeze AI pricing: https://www.hubspot.com/products/artificial-intelligence
- Hostinger Agents launch: https://www.hostinger.com/blog/hostinger-agents-launch
- Vendasta pricing and AI Workforce: https://www.vendasta.com/pricing/
- OpenAI GPT-5.5 model and pricing: https://developers.openai.com/api/docs/models/gpt-5.5
- OpenAI Responses API: https://developers.openai.com/api/reference/resources/responses/methods/create
- Internal product evidence: Momentum Digital Agency Slack, July 3-9, 2026
