# M360 Orbit knowledge governance

## Non-negotiable boundary

The live M360 Orbit site remains unchanged during this work. The new system is a separate, versioned knowledge and orchestration layer. The existing public site can continue to demonstrate the 19 specialists while Momentum validates the deeper operating model privately.

No knowledge result is permission to send, publish, deploy, spend, change accounts, alter a client system, or contact a prospect. Those actions require a named human approver and an exact action preview.

## Knowledge namespaces

1. **Public Orbit knowledge**: published Momentum services, public policies, public proof, and stable specialist playbooks. Safe for unauthenticated preview.
2. **Momentum operating knowledge**: approved SOPs, offer definitions, service boundaries, QA standards, internal routing, and reusable templates. Authenticated Momentum staff only.
3. **Vertical packs**: home services, real estate/property, health/wellness, legal/professional, hospitality/venues, retail/restaurants, and multi-location patterns. No client-identifying facts.
4. **Client workspaces**: contracts, intake, brand, audiences, offers, approved claims, source connectors, reporting definitions, decisions, and work history. Strictly isolated by client.
5. **Live evidence adapters**: read-only snapshots from approved sources such as HubSpot, Gmail, Slack, Drive, reporting platforms, call tracking, ad platforms, Google Business Profile, and public web research.
6. **Action layer**: drafts, approval packets, and execution adapters. Disabled by default and isolated from retrieval.

Client data must never be promoted into global Momentum or public Orbit knowledge without explicit redaction and approval.

## Source hierarchy

| Tier | Source type | Use |
| --- | --- | --- |
| A | Current first-party platform policy, government rule, client-owned system of record, signed scope | Controlling fact |
| B | Current Momentum-approved SOP, verified client intake, approved brand guide, direct stakeholder decision | Operational truth |
| C | Official product documentation, primary research, audited analytics export | Supporting fact |
| D | Reputable secondary research or benchmark with date and caveat | Directional context only |
| E | Unverified web page, model memory, inferred fact, stale screenshot | Never state as confirmed; use only to form a verification question |

When sources conflict, the agent must name the conflict and stop before a consequential recommendation. It must not blend conflicting values.

## Required metadata for each knowledge object

- `knowledge_id`
- title and specialist scope
- namespace and client ID when applicable
- source URL or opaque internal locator
- publisher or system of record
- observed or effective date
- retrieved date
- owner
- sensitivity classification
- allowed uses
- prohibited uses
- freshness window
- review date
- supersedes/superseded-by links
- verification state: confirmed, provisional, disputed, expired

## Freshness policy

- Platform policies, pricing, model availability, product limits, and ad rules: verify at use time or within 30 days.
- Active campaign, lead, CRM, call, form, and appointment facts: verify for the exact reporting window at use time.
- Business identity, service area, hours, categories, and contact facts: verify within 30 days and again before external use.
- Brand, positioning, approved claims, offers, and service scope: verify against the current approved client record.
- Evergreen production methods: annual review unless an official rule changes sooner.

Expired knowledge may remain for history but cannot ground a current factual claim.

## Retrieval contract

Every Orbit job follows this order:

1. Classify the job and select the existing Orbit specialist.
2. Resolve the business/client namespace before retrieval.
3. Retrieve only the minimum relevant passages.
4. Prefer Tier A and B evidence; label lower-tier context.
5. Check freshness, conflicts, and missing required inputs.
6. Generate the requested artifact using the specialist output contract.
7. Run factual, policy, privacy, brand, and action-boundary QA.
8. Return sources, assumptions, missing evidence, next action, owner, and success measure.
9. If external action is proposed, create an exact approval packet and stop.

## Output labels

- **Verified:** directly supported by current evidence.
- **Inference:** reasoned from cited evidence; explain the link.
- **Recommendation:** proposed action, not a fact.
- **Pending:** required source is missing or inaccessible.
- **Prohibited:** action or claim conflicts with policy, scope, safety, or approval rules.

## Privacy and access

- Least privilege and read-only access are the default.
- Do not expose credentials, tokens, cookies, private prompts, personal contact data, or raw client communications in generated outputs.
- Do not use one client's private knowledge to answer another client's job.
- Public prospect research may use public business facts, but it may not infer private emails, decision makers, consent, or contact permission.
- Retrieval logs should store knowledge IDs and redacted decision metadata, not raw secrets or unnecessary personal data.
- Client deletion and retention requirements must apply to derived indexes and caches as well as source documents.

## Human approval gates

Human approval is mandatory before:

- sending an email, Slack message, SMS, direct mail, or social message;
- publishing a page, post, ad, listing change, review response, or media asset;
- launching or changing an ad campaign, budget, bid, audience, or conversion action;
- changing HubSpot, Google, Meta, a website, Google Business Profile, listings, or account permissions;
- using unapproved claims, testimonials, customer imagery, or personal data;
- promoting a prospect into an outreach stage;
- deploying a model, connector, or knowledge update to the live Orbit product.

## Quality gates

Every answer must pass:

1. Correct specialist routing.
2. Correct client and source namespace.
3. Current-source and conflict check.
4. No invented numbers, credentials, approvals, people, or case studies.
5. Clear separation of facts, inferences, and recommendations.
6. Specific output with owner, deadline, and measurable success condition.
7. Platform-policy and legal-risk check appropriate to the specialist.
8. Privacy and cross-client leakage check.
9. External-action detection and approval stop.
10. Source list sufficient for a human reviewer to reproduce the conclusion.

## Knowledge lifecycle

1. **Propose:** add source and purpose.
2. **Review:** domain owner checks accuracy, scope, and rights.
3. **Approve:** mark allowed namespace and uses.
4. **Index:** make retrievable with version and metadata.
5. **Evaluate:** run specialist routing and answer tests.
6. **Release:** expose only to the intended environment.
7. **Monitor:** record failures, stale claims, and missing coverage.
8. **Refresh or retire:** replace expired content without deleting audit history.

One named domain owner is accountable for each specialist pack. A quarterly review is the maximum cadence; volatile platform sections require monthly or event-driven review.

