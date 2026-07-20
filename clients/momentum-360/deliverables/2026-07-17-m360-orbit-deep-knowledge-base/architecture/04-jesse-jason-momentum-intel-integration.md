# Jesse, Jason, and Momentum Intel integration plan

## Decision

Use the existing M360 Orbit roster of 19 agents as one shared execution layer for three connected outcomes:

1. Jesse's AI lead pipeline.
2. Jason's Momentum 360 pipeline and operating decisions.
3. Momentum Intel's verified weekly business brief and later content engine.

The current live Orbit page remains frozen. Build a second, separate version of the 19 agent page as a staged product surface that explains and operates these workflows. It is not published or connected to live actions without a later exact approval.

## Requirements incorporated from the two PDF plans

| Source plan | Required capability | Orbit implementation |
| --- | --- | --- |
| Applying AI at Momentum Digital | AI prebuilt websites | MAPS and GRID verify the prospect; PATCH, ATLAS, PRISM, HOOK, and the capture agents produce a review-only concept |
| Applying AI at Momentum Digital | AI Sales Ninjas | SCOPE assembles the verified opportunity brief; HOOK creates the call and outreach language; a human owns qualification and delivery |
| Applying AI at Momentum Digital | Personalized email and LinkedIn at scale | PRISM constrains claims and voice; HOOK and FORGE draft variants; approval and suppression gates precede any connector |
| Applying AI at Momentum Digital | Competitor ad teardown | PULSE, ATLAS, PATCH, and SCOPE compare public evidence and produce a sourced gap report |
| Applying AI at Momentum Digital | Real world touches | REVIVE, PRISM, and HOOK may prepare timing and copy, but recipient, address, claims, vendor, cost, and delivery remain human approved |
| Applying AI at Momentum Digital | Better creative, testing, SEO, and delivery speed | VERA, LENS, AERO, FRAME, WAVE, ATLAS, STUDIO, FORGE, and SCOPE operate through typed briefs and evaluation gates |
| Applying AI at Momentum Digital | Productized AI marketing services and always on agents | Reusable work objects, role contracts, evaluation scorecards, and bounded action receipts become the product layer |
| Momentum Intel investor deck | Website Health | PATCH records verified site events, severity, evidence, and recommended action |
| Momentum Intel investor deck | Competitor Intelligence | GRID resolves entities; ATLAS, MAPS, PULSE, PATCH, and SCOPE classify material competitor changes |
| Momentum Intel investor deck | Review Intelligence | ECHO extracts themes and changes with source and freshness metadata |
| Momentum Intel investor deck | SEO Signals and AI Visibility | ATLAS owns query, page, citation, and visibility evidence; SCOPE converts material changes into decisions |
| Momentum Intel investor deck | Weekly Executive Brief | SCOPE produces the grounded Monday verdict: critical change, competitor move, opportunity, and next action |
| Momentum Intel investor deck | Content Engine | PRISM supplies brand rules; FORGE, STUDIO, HOOK, PIN, LENS, FRAME, and ATLAS produce channel-ready derivatives from approved insights |

## Shared operating architecture

### 1. Data acquisition

Prefer authorized APIs for Google Search Console, GA4, Google Ads, Meta, PageSpeed, listings, reviews, and approved commercial SEO data. Use a thin browser or crawler only when no approved API exists. Every observation records source, retrieval time, client or prospect identity, permitted use, and raw evidence locator.

### 2. Verified event layer

Normalize every observation into a structured event before any model writes narrative. An event includes:

- exact entity and tenant;
- engine and specialist owner;
- source and observed time;
- previous and current value;
- materiality score;
- confidence and conflicts;
- applicable vertical playbook;
- permitted next state.

Duplicate, stale, ambiguous, cross-client, or unsupported events are blocked rather than summarized.

### 3. Specialist work objects

The orchestrator routes one bounded job at a time. Each agent receives required inputs, produces its typed artifact, cites the accepted events, runs its quality gate, and hands off only the minimum necessary fields. Agents do not share undifferentiated memory or silently reuse facts across clients.

### 4. Grounded synthesis

SCOPE may narrate only accepted material events. Every brief or opportunity report must be fact checked against the event log. If the evidence does not support a verdict, the output says what is missing instead of filling the gap.

### 5. Human and action boundary

Discovery, analysis, concepts, drafts, and scorecards are internal until an accountable human approves the exact record, recipient, claim, asset, channel, sender, time, cost, and suppression result. External connectors are isolated and return receipts. A research record is never treated as consent to contact.

## Lane A: Jesse's AI pipeline

1. **Discover:** MAPS finds candidates from the approved market and category. GRID resolves identity, duplicates, location, and canonical website.
2. **Diagnose:** PATCH, ATLAS, MAPS, ECHO, PULSE, and SCOPE identify evidence-backed service gaps.
3. **Build proof:** PATCH and HOOK lead the prebuilt site or audit concept. VERA, LENS, AERO, FRAME, WAVE, and PRISM add only approved capture and brand requirements.
4. **Prepare the Sales Ninja brief:** SCOPE summarizes the business, material gaps, offer fit, decision questions, and objections. HOOK writes a custom call path and outreach draft.
5. **Qualify:** Dillon and the named sales owner accept, reject, or request research. Private decision-maker data is not inferred.
6. **Handoff:** Only an approved record may move to the CRM or a delivery queue. Idempotency, suppression, sender, and compliance checks are mandatory.
7. **Learn:** Accepted outcomes update aggregate evaluation data without copying private client facts into another tenant.

The current seven records remain blocked until identity, contact, fit, owner, claims, imagery, approval, and suppression fields are complete.

## Lane B: Momentum Intel

1. Website Health, Competitor Intelligence, Review Intelligence, SEO Signals, and AI Visibility produce structured events.
2. The change detector deduplicates events and scores materiality.
3. Vertical playbooks classify why the event matters for the specific business.
4. SCOPE produces a weekly brief readable in under twenty seconds with four sections: critical change, competitor move, opportunity, and next action.
5. A fact check compares every sentence with the accepted event log before delivery.
6. Web, email, Slack, or text delivery is added only after the read-only brief passes its pilot.
7. Multi-location accounts receive both a portfolio rollup and location-level exceptions.

The MVP is Website Health, Competitor Intelligence, and the Weekly Executive Brief. Reviews, SEO, AI visibility, multi-location rollups, and the Content Engine follow after the core brief is trusted and acted on.

## Lane C: Jason and Momentum operations

Jason owns the commercial decisions that the agents cannot make:

- pilot market and category;
- productized entry offer;
- service capacity and margin fit;
- qualified opportunity acceptance;
- sales owner and CRM stage;
- whether a proven workflow becomes a Momentum service or Momentum Intel feature.

The same operating layer gives Jason one view of verified pipeline, client-delivery exceptions, pilot performance, and product decisions without blending client accounts.

## Second 19 agent page

Build the staged page from the existing Orbit visual system and roster. The page should contain:

1. A hero that explains the system as Momentum's verified AI operating layer.
2. Three product modes: Lead Engine, Weekly Intel, and Fulfillment plus Productization.
3. A visible workflow from source evidence to event, agent work, human approval, action, and receipt.
4. The existing 19 agent roster grouped by role, with each agent's actual input, output, and handoff.
5. Sample artifacts: opportunity brief, prebuilt site concept, competitor teardown, Monday brief, and content derivatives.
6. Trust controls: source citations, freshness, client isolation, claims checks, suppression, and no automatic outreach.
7. A pilot call to action that requests a market, category, offer, and approved data sources.

The page is first built locally or on a private staging URL. The current production Orbit page, lead form, router, functions, and Netlify deployment remain unchanged until Dillon approves the exact staged page and deployment target.

## Automation sequence

### Phase 0: now

- Lock the shared event schema and source registry.
- Map both PDF requirements to the 19 agent contracts.
- Produce the second-page information architecture and wireframe.
- Keep all connectors read-only or disabled.

### Phase 1: Jesse shadow pilot

- One market, one category, one offer, and ten to twenty public businesses.
- Run discovery, diagnosis, proof asset, Sales Ninja brief, and human review.
- No CRM write, outreach, physical mail, publication, or spend.

### Phase 2: Momentum Intel MVP

- Website Health, Competitor Intelligence, and Weekly Executive Brief.
- Pilot with a bounded group of existing Momentum clients after exact data-source approval.
- Measure whether briefs are opened and acted on, not raw signups.

### Phase 3: fulfillment and content engine

- Add reviews, SEO, AI visibility, creative production, testing, and approved content derivatives.
- Add multi-location rollups and portfolio exception handling.

### Phase 4: bounded actions

- Enable one action type at a time after shadow, read-only, evaluation, human approval, idempotency, suppression, rollback, and receipt gates pass.

## Success metrics

- At least 95 percent reproducible business identity in the accepted prospect set.
- At least 90 percent of accepted claims directly supported by source evidence.
- At least 80 percent of qualified opportunity briefs accepted without factual correction.
- Lower median time from verified record to review-ready proof asset.
- Weekly briefs opened and acted on by the intended owner.
- Zero unapproved external actions, duplicate deliveries, cross-client fact leakage, or invented claims.

## Current boundary

- No change to the existing live Orbit site.
- No live Jesse outreach or Zap.
- No Momentum Intel client delivery yet.
- No CRM write, publication, ad launch, spend, purchase, or account change.
- Hope Wellness remains excluded.

