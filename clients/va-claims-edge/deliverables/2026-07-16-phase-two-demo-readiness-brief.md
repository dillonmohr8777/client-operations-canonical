# VA Claims Edge: Phase 2 demo-readiness brief

Date: 2026-07-16

Work item: `wi-20260716-0002`

Status: Local review brief. No client approval, message, invitation, upload, deployment, or account change is implied.

## Decision needed now

Reconcile the completed review prototype with the remaining Phase 2 gates: wireframe approval, sign-up, a demonstrable backend slice, the data model and terminology, the reusable design system, and secure tool access. Phase 3 automation should not be treated as ready until those decisions are recorded.

## Evidence-state distinction

### Sent or received evidence

- Dillon-authored, sent Slack evidence supports that the clickable end-user wireframe was complete, the team was ahead of schedule, and sign-up was the next addition.
- The Gmail audit confirms that received project-recap and access-response material contributes to the overall Phase 2 and secure-access state. Because Gmail provenance is client-record scoped, it does not safely attribute every synthesized fact to a particular received message.
- The review portal is evidenced as a prototype for review, not a production system.

### Internal draft only

- A consolidated progress message dated 2026-07-13 was still a draft. It must not be treated as delivered, acknowledged, approved, or as a client commitment.
- The backend-demo target and other Gmail-synthesized commitments remain planning evidence until an exact-source re-read separates received material from the internal draft.
- Gmail findings are synthesized at the client-record level. Any statement that depends on a specific message must be rechecked against the exact source before external use.

## Readiness by workstream

| Workstream | Verified state | Remaining gate |
| --- | --- | --- |
| End-user wireframe | Clickable review wireframe complete; prototype covers booking, claim progress, secure files, and messaging in one experience | Client approval or specific revisions are not recorded as final |
| Sign-up | Identified as the next addition | Completion and review are not verified |
| Backend demo | Phase 2 underway; a basic demo was targeted for the July 25 preparation window | No evidence in the reviewed artifacts that the demo is complete or accepted |
| Data model | Secure login and data architecture are in scope | Intake workflow, status terminology, tables, relationships, and acceptance criteria remain open |
| Design system | Approved flows and reusable components are intended to become the development source of truth | The system is not verified as locked; agreement is needed before Phase 3 automation |
| Review environment | Netlify review prototype is evidenced and reviewable | Production implementation and deployment state are not established |
| Tool access | Vercel, Supabase, GitHub, Resend, Anthropic, Netlify, and related implementation tooling are mentioned | Actual account grants are not comprehensively verified; the secure Anthropic organization invitation remains open |

## Owners and dependencies

| Role | Evidence-supported responsibility | Dependency or gate |
| --- | --- | --- |
| Client product owner | Product decisions, software ownership, and acceptance of the experience | Approve wireframe direction, terminology, data behavior, and demo outcomes |
| Project coordinator | Milestone coordination and decision follow-through | Needs a single ordered review list and named owners |
| Web and backend developer | Backend demo, authentication, data implementation, and production planning | Needs approved flows, tables, statuses, component rules, and secure tool access |
| Agency UX, prototype, and communication lead | Wireframes, prototype framing, approval questions, handoff support, visual QA, and role testing | Needs client approval and developer feedback before the design system is locked |
| Commercial and contract stakeholder | Commercial oversight and ownership assurance | Needs confirmed milestone state and a reviewable acceptance record |

Dependency sequence: wireframe approval -> sign-up review -> backend demo and authentication path -> data-model and terminology decisions -> design-system lock -> secure implementation access -> production planning -> Phase 3 automation.

## Human-only and approval gates

- Client approval of the wireframe direction, sign-up behavior, workflow terminology, tables, and demo acceptance remains a business decision.
- The Anthropic route should use a direct Developer-role organization invitation, not shared credentials, forwarded magic links, or copied secrets.
- Sending that invitation, granting access in any other tool, consenting to authentication, or changing an account is an external account action and was not performed.
- Production deployment, publication, or client delivery is outside this local brief and was not performed.

## Explicit unknowns

- Whether the client has approved the current wireframe without revisions.
- Whether sign-up has been added, tested, and reviewed.
- Whether a backend demo now exists, what it demonstrates, and whether the July 25 preparation target remains current.
- The final intake workflow, status vocabulary, table structure, relationships, authorization rules, and demo acceptance criteria.
- Whether the reusable design system has been accepted and frozen for implementation.
- Which production repositories, services, or environments currently exist and who has verified access to each.
- Whether the secure Anthropic organization invitation has been sent and accepted.
- Whether newer evidence supersedes the last reviewed Gmail and Slack state.

## Prioritized review sequence

1. Approve or revise the current end-user wireframe against the intended claims journey.
2. Review the sign-up entry point, identity requirements, and handoff into the portal.
3. Demonstrate the smallest complete backend slice: authentication, one representative data path, status behavior, and a visible portal result.
4. Decide the intake workflow, status terminology, core tables, relationships, permissions, and ownership rules.
5. Lock the reusable design system and component handoff only after the approved flow and data behavior agree.
6. Record the owner and acceptance criterion for each remaining Phase 2 item.
7. Separately authorize any required organization invitations or account grants through the secure provider workflow.
8. Enter production planning and Phase 3 automation only after the prior gates are verified.

## Evidence references

- `queue/work-items.json#wi-20260716-0002`
- `clients/va-claims-edge/context/operating-context.md`
- `state/client-history-research/gmail-client-history-2026-07-16.json#client=va-claims-edge`

  SHA-256: `10563E82E1CD6B97FD1B31BC5D55107F98DEE0C3196168039F356C245F1F04FF`
- `state/client-history-research/slack-client-history-2026-07-16.json#client=va-claims-edge`

  SHA-256: `B240EC42F6F7C3CBE588C83622B5CBD16B40163E8D2A7D48E8DA6430E55ACF3C`

Evidence is redacted and client-record scoped. Re-read the exact authorized source before treating a synthesized fact as a message-specific claim or current client approval.
