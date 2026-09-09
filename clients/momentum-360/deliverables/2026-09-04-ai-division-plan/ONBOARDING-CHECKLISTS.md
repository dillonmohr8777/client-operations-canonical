# Momentum AI division: onboarding planning checklists

Status: source-reviewed internal planning draft, September 5, 2026. Covers three proposed offers and their shared onboarding process. No commercial terms, customer commitments, access changes, publication or billing are authorized by this document. Use the applicable existing authorization for any execution.

Source: [reviewed launch proposal](PLAN.md). The underlying model draft is preserved unchanged. Codex clarified proposal status, relationship approval, included support, all-test acceptance and communication routing. The local review's five suggested issues were checked against the source and rejected as false positives.
## Source key and evidence limits

- `Offer table` = proposed offer scopes, prices, acceptance/support terms in “Three offers with finite delivery contracts.”  
- `Economics` = “Economics and capacity.”  
- `Qualification` = “Initial customer and qualification.”  
- `Motion` = “Sales motion and the next seven working days.”  
- `Ownership` = “Ownership and compensation discussion.”  
- `Day 30/60/90` = “Thirty, sixty and ninety days.”  
- `What already exists` = “What already exists,” including linked Slack evidence and `BUSINESS-EVIDENCE.md`.  

**F** = a statement in the planning proposal, not an approved commercial term or an independently verified customer fact. **A** = an operating recommendation or interpretation that still requires agreement. The proposal states prices, staffing, compensation and sales targets are proposed assumptions. No offer has been approved or sent.

---

# Shared onboarding rules

## Roles

| Checklist item | Type | Source location |
|---|---:|---|
| Mac owns strategic sponsorship, final pricing and commercial authority. | A | `Ownership` |
| Dillon owns solution design, delivery system and quality. | A | `Ownership` |
| Jesse owns agreed prospecting and sales follow-through. | A | `Ownership` |
| The existing account owner owns client communication continuity. | A | `Ownership` |
| A named operator handles exceptions and support. | A | `Ownership` |
| Have Mac and the account owner select three suitable founding buyers from the actual pipeline; verify relationship approval before each discussion. | F | `Qualification` |
| Do not use Dillon’s entire 26-client portfolio as a Momentum prospect list. | F | `Qualification` |
| The registry affiliates Bridge Software, Pritzker Law Group, Nexla and Puttery NYC with Momentum, but affiliation alone does not authorize outreach. | F | `Qualification` |
| Puttery’s access dependencies make it an engineering proof opportunity, not the simplest first rollout. | F | `Qualification` |
| Confirm who can approve scope, price, access, acceptance and change requests before the first setup starts. | A | `Motion`; `Offer table` |
| Resolve pending case-study/pricing decisions before sending offer materials externally. | F | `Motion`; `What already exists` |

## Missing-access resolution

| Checklist item | Type | Source location |
|---|---:|---|
| Treat “necessary system access is obtainable” as one of the five qualification conditions. | F | `Qualification` |
| If any qualification condition is missing, convert the gap into discovery work before committing to a start date. | F | `Qualification` |
| Onboard in an isolated workspace; run a dry-run before live changes; record rollback and exception handling. | F | `Motion` |
| For Lead Operations, require destination readback and prohibit cross-account writes. | F | `Offer table` |
| If access is delayed by the client, pause the delivery clock rather than silently extend internal deadlines. | F | `Offer table` |

## Delivery-clock rules

| Checklist item | Type | Source location |
|---|---:|---|
| A paid pilot requires collected payment; an invoice or discovery call alone does not qualify. | F | `Day 30/60/90` |
| Track proposal accepted, contract signed, deposit collected, access ready and implementation accepted as separate milestones. | F | `Day 30/60/90` |
| Client delays pause the delivery clock. | F | `Offer table` |
| Support caps do not excuse defects in the agreed acceptance criteria. | F | `Offer table` |
| Define business-hours acknowledgment before sale. Do not promise 24/7 uptime or emergency response without paid coverage. | F | `Offer table` |
| Recurring support for Lead Operations begins at accepted handoff. | F | `Offer table` |
| Setup hours are assumptions and must be measured: Lead Operations 24, Visibility 10, Campaign 5. | F | `Offer table` |
| Reserve recurring capacity at 6 hours per accepted client per month; support and review are included, not added twice. | F | `Economics` |
| Do not promise all three implementations in the first week. Sell and schedule next week; start at most one new setup per week and never exceed two active builds. | A | `Economics` |
| Delay a start whenever setup plus existing commitments exceeds capacity. | A | `Economics` |
| Advance to the next phase only after acceptance evidence, a usable operator handoff, time logs and a recurring cost estimate exist. | F | `Day 30/60/90` |
| For Lead Operations, require zero known critical routing or data-loss defects before acceptance. | F | `Day 30/60/90` |

## Handoff to existing account owner

| Checklist item | Type | Source location |
|---|---:|---|
| The existing account owner owns client communication continuity. | A | `Ownership` |
| For Lead Operations, written acceptance must come from the client decision-maker through the account owner. | F | `Offer table` |
| Record the named support owner and confirm the operator handoff. | A | `Ownership`; `Offer table` |
| Do not treat a completed demo or invoice as handoff; require collected payment and accepted implementation evidence. | F | `Day 30/60/90` |

---

# 1. Lead Operations Pilot onboarding checklist

Offer facts: proposed price is $3,500 setup / $1,500 monthly; setup assumption is 24 delivery hours; recurring budget is 6 hours/month. Source: `Offer table`; `Economics`.

## Pre-sale qualification

| Checklist item | Type | Source location |
|---|---:|---|
| Confirm the relationship owner approves the discussion. | F | `Qualification` |
| Confirm the buyer describes a repeated costly operational problem. | F | `Qualification` |
| Confirm baseline records exist for the selected intake process. | F | `Qualification` |
| Confirm necessary system access is obtainable. | F | `Qualification` |
| Confirm an employee will own adoption and exceptions. | F | `Qualification` |
| Prefer a low-sensitivity workflow such as form triage, internal response drafting or source reconciliation. | A | `Qualification` |
| Exclude healthcare or legal case records from the founding experiment. | F | `Qualification` |
| Confirm one intake source, one destination CRM or sheet, one routing workflow, duplicate protection, internal response draft, exception queue, one dashboard and operator handoff are in scope. | F | `Offer table` |
| Confirm included monthly scope: one approved improvement, up to 2 support hours and one 30-minute review within the 6-hour total budget. Unlimited new builds are excluded. | F | `Offer table` |
| Prepare a written 30-day pilot scope and renewal terms; route any external delivery through the approved account owner and recipient. Do not silently amend an existing client contract. | F | `Offer table` |

## Missing-access resolution

| Checklist item | Type | Source location |
|---|---:|---|
| Run a dry-run in an isolated workspace before live changes. | F | `Motion` |
| Record rollback and exception handling. | F | `Motion` |
| Require destination readback for accepted records. | F | `Offer table` |
| Prohibit cross-account writes. | F | `Offer table` |
| If access is unavailable or delayed, mark “access not ready” and pause the delivery clock. | F | `Offer table` |

## Delivery clock

| Checklist item | Type | Source location |
|---|---:|---|
| Clock may start only after contract signature, collected payment/deposit and access-ready evidence exist. | A | `Day 30/60/90`; `Offer table`; `Qualification` |
| Use the 24-hour setup assumption for planning only; measure actual hours. | F | `Offer table` |
| Pause the clock for client delays. | F | `Offer table` |
| Pass all 30 agreed named test cases, including duplicates, missing inputs, timeout and retry. | F | `Offer table` |
| Require complete readback for accepted records. | F | `Offer table` |
| Require zero unresolved critical defects. | F | `Offer table` |
| Require zero known critical routing or data-loss defects before acceptance. | F | `Day 30/60/90` |
| Have the operator run 5 supervised cases successfully. | F | `Offer table` |
| Obtain written acceptance by the client decision-maker through the account owner. | F | `Offer table` |
| Recurring support begins only at accepted handoff. | F | `Offer table` |
| Include support and review within the 6-hour monthly budget; do not double-count support hours. | F | `Offer table`; `Economics` |

## Handoff to existing account owner

| Checklist item | Type | Source location |
|---|---:|---|
| Confirm the named operator can handle exceptions and support. | A | `Ownership` |
| Hand off only after time logs, recurring cost estimate and acceptance evidence exist. | F | `Day 30/60/90` |

---

# 2. AI Visibility Program onboarding checklist

Offer facts: proposed price is $1,500 setup / $1,500 monthly; setup assumption is 10 delivery hours; total delivery budget is 6 hours/month. Source: `Offer table`; `Economics`.

## Pre-sale qualification

| Checklist item | Type | Source location |
|---|---:|---|
| Confirm the relationship owner approves the discussion. | F | `Qualification` |
| Confirm the buyer describes a repeated costly problem related to visibility, source quality or measurement. | F | `Qualification` |
| Confirm baseline records exist for the one domain/location to be measured. | F | `Qualification` |
| Confirm necessary access to the domain, content system or reporting channel is obtainable. | F | `Qualification` |
| Confirm an employee will own adoption and exceptions. | F | `Qualification` |
| Confirm scope is one domain/location only. | F | `Offer table` |
| Include baseline of 20 buyer questions across two selected engines. | F | `Offer table` |
| Include technical/content priorities, two useful page improvements monthly, repeated measurement and source-linked report. | F | `Offer table` |
| State that the program cannot guarantee rankings, citations, qualified leads or revenue. | F | `Offer table` |
| State that engine variation and referral evidence must be reported separately. | F | `Offer table` |
| Prepare a written 30-day pilot scope and renewal terms; route any external delivery through the approved account owner and recipient. | F | `Offer table` |

## Missing-access resolution

| Checklist item | Type | Source location |
|---|---:|---|
| If access or editorial approval is delayed, pause the delivery clock. | F | `Offer table` |

## Delivery clock

| Checklist item | Type | Source location |
|---|---:|---|
| Clock may start only after contract signature, collected payment/deposit and access-ready evidence exist. | A | `Day 30/60/90`; `Offer table`; `Qualification` |
| Use the 10-hour setup assumption for planning only; measure actual hours. | F | `Offer table` |
| Pause the clock for client delays. | F | `Offer table` |
| Ensure each reported observation includes engine, prompt, date and source. | F | `Offer table` |
| Ensure page changes pass technical and editorial QA before publication. | F | `Offer table` |
| Limit to one consolidated revision round and one 30-minute review. | F | `Offer table` |
| Keep total monthly delivery within the 6-hour budget. | F | `Offer table`; `Economics` |
| Do not report rankings or leads as guaranteed outcomes. | F | `Offer table` |

## Handoff to existing account owner

| Checklist item | Type | Source location |
|---|---:|---|
| Give the account owner the source-linked report format: engine, prompt, date, source. | F | `Offer table` |
| Hand off only after acceptance evidence, operator handoff, time logs and recurring cost estimate exist. | F | `Day 30/60/90` |

---

# 3. Campaign Production System onboarding checklist

Offer facts: proposed price is $750 setup / $1,250 monthly; setup assumption is 5 delivery hours; total delivery budget is 6 hours/month. Source: `Offer table`; `Economics`.

## Pre-sale qualification

| Checklist item | Type | Source location |
|---|---:|---|
| Confirm the relationship owner approves the discussion. | F | `Qualification` |
| Confirm the buyer has a repeated production need that fits one brand and one campaign brief. | F | `Qualification` |
| Confirm baseline brand assets exist and are approved for reuse. | F | `Qualification`; `Offer table` |
| Confirm necessary access to brand assets, brief documents and export channels is obtainable. | F | `Qualification` |
| Confirm an employee will own adoption, review and exceptions. | F | `Qualification` |
| Confirm scope is one brand, one campaign brief, four original copy/design concepts and up to eight straightforward size variants. | F | `Offer table` |
| Include one results/readiness summary. | F | `Offer table` |
| Require exact brief and dimensions, brand and claims review, editable agreed files and one consolidated revision round. | F | `Offer table` |
| State exclusions: no shoot, custom animation, paid placement, unlimited video or new website. | F | `Offer table` |
| State that creative quantity is not proof of business lift. | F | `Offer table` |
| Prepare a written 30-day pilot scope and renewal terms; route any external delivery through the approved account owner and recipient. | F | `Offer table` |

## Missing-access resolution

| Checklist item | Type | Source location |
|---|---:|---|
| If brief, dimensions or claims approval are delayed, pause the delivery clock. | F | `Offer table` |
| Do not include paid placement or custom animation without a new scoped engagement. | F | `Offer table` |

## Delivery clock

| Checklist item | Type | Source location |
|---|---:|---|
| Clock may start only after contract signature, collected payment/deposit and access-ready evidence exist. | A | `Day 30/60/90`; `Offer table`; `Qualification` |
| Use the 5-hour setup assumption for planning only; measure actual hours. | F | `Offer table` |
| Pause the clock for client delays. | F | `Offer table` |
| Produce four original copy/design concepts and no more than eight straightforward size variants unless approved in writing. | F | `Offer table` |
| Include brand and claims review before final export. | F | `Offer table` |
| Deliver editable agreed files. | F | `Offer table` |
| Limit to one consolidated revision round. | F | `Offer table` |
| Keep total monthly delivery within the 6-hour budget. | F | `Offer table`; `Economics` |

## Handoff to existing account owner

| Checklist item | Type | Source location |
|---|---:|---|
| Give the account owner the results/readiness summary and file location. | F | `Offer table` |
| Hand off only after acceptance evidence, operator handoff, time logs and recurring cost estimate exist. | F | `Day 30/60/90` |
