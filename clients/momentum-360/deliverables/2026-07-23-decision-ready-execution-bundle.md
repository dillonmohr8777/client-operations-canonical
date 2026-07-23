# Momentum 360 decision-ready execution bundle

Date: 2026-07-23  
Status: Ready for owner decisions  
Scope: Caller auto-response, AI Tech News pilot, and Google Places prerequisites  
Boundary: Local review artifact only. No message, workflow, CRM write, credential change, outreach, deployment, or account change was performed.

## Executive decision board

| Workstream | Verified current state | Decision needed now | Recommended choice | Owner |
|---|---|---|---|---|
| Caller auto-response | HubSpot receives CallRail and Voice Assist activity, but the automatic caller response is not proven live | Approve the exact trigger, response copy, suppression behavior, route, test, and rollback | Approve a narrow missed-call pilot on one verified Momentum tracking number, after compliance and account owners confirm the fields below | Dillon plus Momentum operations and compliance owner |
| AI Tech News pilot | Three separate live prototypes passed desktop and mobile QA | Confirm business facts and approve the first three businesses for prototype outreach | Keep Bicycle Therapy, Head House Books, and Maleek Jackson Fitness as the first review set; require fact approval before any contact | Melissa and Mac for facts and prospect approval; Dillon for final technical sign-off |
| Google Places | Provider is inactive in the Reporting OS and was attached to the wrong workstream | Decide whether to activate Maps sourcing in the AI prospect pipeline | Do not add a Maps key to Reporting OS; configure a separate, least-privilege provider only for the prospect pipeline | Dillon plus the authorized Google Cloud owner |

## 1. Caller auto-response decision

### Proposed narrow pilot

- Trigger: a completed inbound call classified as missed or unanswered on one explicitly approved Momentum tracking number.
- Exclusions: answered calls, outbound calls, repeat events for the same call, known opt-outs, wrong numbers, complaints, do-not-contact records, test failures, and any record without the approved channel basis.
- Timing: immediately after the final missed-call event is available, subject to the approved quiet-hours rule.
- Frequency: one automatic response per unique caller in the approved suppression window.
- Route: create or update the verified HubSpot contact association, record the CallRail call identifier, assign the follow-up owner, and create an internal review task when the response fails or the caller replies with a non-routine request.
- Pilot population: internal test contacts first, then a capped production pilot only after the required approvals are recorded.

### Draft response copy for approval

> Hi, this is Momentum 360. We saw that we missed your call. How can our team help? Reply STOP to opt out.

This is draft copy. The brand, compliance, and account owners must confirm identity language, purpose, opt-out handling, quiet hours, consent basis, and recordkeeping before activation.

### Required owner decisions

| Field | Required answer |
|---|---|
| Approved CallRail account | Exact account and authorized administrator |
| Eligible tracking number | One pilot number, then any later expansion |
| Event definition | Missed, unanswered, abandoned, or another explicit CallRail disposition |
| HubSpot destination | Exact portal, contact property mapping, activity type, workflow folder, and owner |
| Approved copy | Final text including identity and opt-out language |
| Quiet hours | Time zone and permitted operating window |
| Suppression window | Recommended starting point: one automatic response per caller per 24 hours |
| Reply ownership | Named person or team, service-level expectation, and escalation route |
| Compliance owner | Named reviewer for channel basis, opt-out, DNC, state requirements, and records |
| Pilot cap | Maximum internal tests and maximum production recipients |

### Opt-out and exception behavior

- Treat STOP, cancel, unsubscribe, do not contact, wrong person, complaint, legal threat, and reasonable equivalents as immediate suppression events.
- Do not send another automated response after suppression.
- Record the suppression in the approved system of record and route exceptions to the named human owner.
- Do not reactivate a suppressed number through this workflow.
- De-duplicate by the immutable call identifier and the approved caller suppression key.
- Route delivery failures, mapping failures, or ambiguous records to a manual review queue.

### Routing checklist

- [ ] Confirm the exact CallRail account, tracking company, and pilot number.
- [ ] Confirm the exact Momentum HubSpot portal and permitted objects.
- [ ] Keep the HubSpot Leads object deactivated unless it is separately approved.
- [ ] Map call identifier, number, disposition, time, source, campaign, and recording locator only where authorized.
- [ ] Define contact match and duplicate behavior.
- [ ] Define owner assignment and after-hours escalation.
- [ ] Confirm suppression storage and reply monitoring.
- [ ] Confirm audit fields for workflow version, event time, outcome, and error.
- [ ] Confirm no customer data is written to an unapproved system.

### Test plan

1. Create approved internal test contacts with documented test numbers.
2. Exercise answered, missed, duplicate, suppressed, after-hours, malformed, and provider-failure cases.
3. Verify that only the eligible missed-call case produces one response.
4. Verify the exact response copy and identity.
5. Verify STOP and equivalent revocation suppress future automation.
6. Verify HubSpot association, owner, activity, and audit fields.
7. Verify duplicate CallRail events cannot produce duplicate responses.
8. Verify failure events create an internal review item and do not retry without limits.
9. Record screenshots or exported redacted logs for each expected outcome.
10. Obtain final owner approval before a capped production pilot.

### Rollback plan

1. Disable the new workflow at its single activation point.
2. Confirm no queued automatic responses remain.
3. Preserve redacted audit evidence and the exact workflow version.
4. Revert only the fields introduced by the pilot; do not delete source call or contact history.
5. Return all affected records to manual follow-up.
6. Document the reason, impact, and decision required before reactivation.

## 2. AI Tech News first-three prospect decisions

### Verified pilot set

| Prospect | Prototype | QA state | Fact approval needed |
|---|---|---|---|
| Bicycle Therapy | https://philly-kimi-3-pilots.netlify.app/sites/bicycle-therapy/ | Desktop and mobile QA passed | Business name, hours, contact details, offer, copy, and imagery |
| Head House Books | https://philly-kimi-3-pilots.netlify.app/sites/head-house-books/ | Desktop and mobile QA passed | Business name, hours, contact details, offer, copy, and imagery |
| Maleek Jackson Fitness | https://philly-kimi-3-pilots.netlify.app/sites/maleek-jackson-fitness/ | Desktop and mobile QA passed | Business name, hours, contact details, offer, copy, and imagery |

### Go or hold decisions

- Melissa and Mac: confirm each fact against Google Maps and a first-party source.
- Melissa: approve or replace client-specific copy and imagery.
- Dillon: approve final responsive behavior, forms, analytics, and destination.
- Melissa and Mac: approve these three as the first outreach set and name the outreach owner.
- Hold any prospect with an unverified material fact.
- Keep each prototype as its own link; use the hub only as the review index.

### Definition of ready for outreach

- Every material business fact is sourced and approved.
- The prospect list and outreach owner are explicit.
- Form submissions and analytics route to the approved destination.
- Copy and imagery are approved for prototype presentation.
- The final live version is rechecked on desktop and mobile.
- The exact outreach message receives delivery approval.

## 3. Google Places prerequisites

### Correct architecture

Google Places belongs in the AI prospect-site pipeline, not in the multi-client Reporting OS. The Reporting OS should continue to report the provider as inactive until the incorrectly combined feature is removed or clearly isolated.

### Activation prerequisites

- An authorized Google Cloud project owned by the correct Momentum account.
- Billing and quota controls approved by the account owner.
- Only the required Places APIs enabled.
- A restricted credential stored in an approved secret manager or protected host environment.
- Application and API restrictions appropriate to the server-side or browser-side design.
- A separate prospect-pipeline environment variable and runtime, not the Reporting OS credential surface.
- Logging that excludes secrets and unnecessary personal data.
- Caching, retention, attribution, and terms-of-service behavior reviewed for the intended use.
- A spend alert, request cap, failure mode, and kill switch.
- A read-only smoke test against a small approved query set before production use.

### Acceptance test

- The prospect pipeline reports provider health without exposing the credential.
- An approved location query returns a bounded result set.
- Duplicate businesses are normalized and flagged.
- Required attribution is displayed or preserved.
- Failed, over-quota, and denied requests fail closed.
- No Maps credential is present in source control, client artifacts, browser output, or logs.

## Owner review response

Record one response for each line:

1. Caller pilot: approve the narrow pilot, revise it, or hold it.
2. Caller copy: approve the draft or provide replacement copy.
3. Caller accounts: identify the exact CallRail account, tracking number, HubSpot mapping, reply owner, and compliance owner.
4. AI Tech News: approve or hold each of the three businesses.
5. AI Tech News routing: identify the form and analytics destination plus the outreach owner.
6. Google Places: approve separate prospect-pipeline activation and identify the authorized Google Cloud owner, or keep it deferred.

## Evidence

- `clients/momentum-360/deliverables/2026-07-17-callrail-hubspot-auto-response-open-loop.md`
- `clients/momentum-360/deliverables/2026-07-17-communication-open-loops-review.md`
- `clients/momentum-360/deliverables/2026-07-16-reporting-os-and-maps-status.md`
- `clients/momentum-360/deliverables/2026-07-21-ai-tech-news-follow-up.md`
- `clients/momentum-360/deliverables/2026-07-19-july-20-ai-review-decision-packet.md`
