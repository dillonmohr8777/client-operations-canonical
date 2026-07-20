# M360 Orbit: from 19-agent demo to Momentum pipeline OS

## The answer

Yes, Momentum 360 should leverage the existing 19-agent site. Keep the current production page frozen and build a second, separately staged version that turns Jesse's AI pipeline, Jason's operating decisions, and Momentum Intel into one understandable product surface.

The right move is to keep the live Orbit site as the clear sales and demonstration surface, add a separate private operating layer that gives the same 19 specialists deep knowledge, client isolation, evidence retrieval, quality gates, handoffs, and approval-controlled actions, and express that layer through a second reviewable page before any production deployment.

## What the live site is today

M360 Orbit already has the correct product frame:

- 19 named specialists;
- four understandable squads;
- a working routing experience;
- a consistent Momentum-owned interface;
- a live URL that returns HTTP 200;
- nine passing baseline tests.

Its current backend routes a question to one specialist and gives that specialist a short three-step playbook. It does not yet retrieve deep knowledge or client evidence. It does not track work, approvals, outcomes, or cross-agent handoffs.

## What this package adds

The private layer adds six things without changing the site:

1. A deep operating contract for every existing specialist.
2. Separate public, Momentum, vertical, client, live-evidence, and action namespaces.
3. A single orchestrator that routes jobs and coordinates bounded specialist handoffs.
4. Evidence freshness, source tiers, conflict handling, and client isolation.
5. Typed work artifacts, quality gates, human review, and exact approval packets.
6. Outcome records and evals so the system improves from accepted work rather than from unchecked model memory.
7. A staged second-page specification that unifies Jesse's Lead Engine, Momentum Intel's Weekly Brief, and Momentum fulfillment and productization.

## How it builds pipeline

The recommended first pilot starts with Melissa's actual Google Maps request:

1. MAPS discovers public businesses from an authorized Maps or Places route.
2. GRID normalizes the business identity and catches conflicts or duplicates.
3. PATCH, ATLAS, MAPS, PRISM, and SCOPE produce an evidence-backed opportunity brief.
4. HOOK and the appropriate capture specialist create a review-only concept.
5. A human decides whether the business is rejected, needs research, or is qualified for a draft.
6. No CRM write or outreach occurs until a later exact approval.

That same operating layer supports current client delivery through reporting, local visibility, content, capture, demand, reputation, and website-conversion lanes.

## How GPT-5.6 changes the implementation

The 19 specialists do not need 19 continuously running premium model instances. They remain stable expert roles while model capacity is assigned by task:

- code or a low-cost tier for extraction, normalization, and deterministic checks;
- a balanced tier for routine grounded specialist work;
- the flagship tier for disputed evidence, cross-channel diagnosis, and complex synthesis;
- parallel subjobs only for bounded work that benefits from independent research.

Business identity, client separation, approvals, and audit state stay in Momentum-controlled code. They are not delegated to model judgment.

## Recommended rollout

1. Finish and evaluate the knowledge package locally.
2. Build the second 19-agent page locally or on a private staging URL without changing the existing production page.
3. Build a private shadow orchestrator with synthetic or sanitized cases.
4. Pilot one market, one category, one offer, and ten to twenty public businesses.
5. Measure identity accuracy, evidence acceptance, research time, and concept quality.
6. Add the Momentum Intel MVP: Website Health, Competitor Intelligence, and the grounded Weekly Executive Brief.
7. Add one read-only client lane.
8. Enable one approval-gated action type only after the shadow and read-only gates pass.

## Boundaries

- The existing live M360 Orbit site remains unchanged.
- The second page may be built only as a local or private staging version until exact deployment approval.
- No message in this package is sent.
- No prospect is contacted.
- No CRM record, page, ad, budget, account, or client system is changed.
- No client knowledge is reused across clients.
- Hope Wellness is excluded.

## Current review artifacts

- Deep knowledge governance and evaluation contract.
- Specialist chapters for all four Orbit squads.
- Momentum pipeline architecture and work-object contracts.
- July 17 AI review decision sheet.
- Review-only Slack and Gmail drafts.
- Deterministic package verifier.
