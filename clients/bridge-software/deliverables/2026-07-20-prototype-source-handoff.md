# Bridge prototype source handoff

Date: 2026-07-20
Client: `bridge-software`
Status: local build and review handoff only
External action: forbidden without explicit approval

## Instruction carried forward

Build from the current Bridge source evidence and Dillon's existing Slack commitments. Do not send, post, publish, deploy, invite users, or modify a client account.

## Current source package

The source package is stored under:

`clients/bridge-software/artifacts/2026-07-20-tori-source-package/`

It contains:

- Public landing and signup prototype
- Dashboard and feed prototype
- AI post designer prototype
- Directory and profiles prototype
- Rendered PNG previews of all four prototypes
- Bridge branding guide
- Business verification requirements
- Legal and compliance platform strategy
- Plain-text PDF extractions for local indexing
- A structured HTML extraction and the local extraction utility

The earlier Dillon execution plan is preserved at:

`clients/bridge-software/deliverables/2026-07-10-bridge-dillon-execution-plan.html`

## Source provenance

- Gmail source locator: `gmail://message/19f7c210da77b678`
- Slack synthesis: `state/client-history-research/slack-client-history-2026-07-16.json#client=bridge-software`
- Client operating context: `clients/bridge-software/context/operating-context.md`

No raw email body or Slack message body is copied into this handoff.

## Slack-aligned delivery contract

The current Slack-derived commitments are:

1. Produce multiple design directions for review rather than shipping raw AI output.
2. Confirm MVP scope, user roles, and priority journeys before visual polish.
3. Validate low-fidelity flows, screen inventory, and wireframe direction first.
4. Refine an approved direction into responsive reusable components.
5. Use Next.js, React, and TypeScript unless backend integration supports a better choice.
6. Keep explicit acceptance criteria at each handoff.
7. Stay involved through implementation support, role testing, critical-path QA, and launch readiness.

## Cross-reference: what exists

| Surface | Current prototype coverage |
| --- | --- |
| Public acquisition | Age gate, positioning, plans, availability, sign-in, personal/business signup |
| Feed | Follow, repost, save, share, public/B2B profile modes, messaging, post creation |
| Directory | Search, business profile, public/B2B views, connection, messaging, location discovery |
| Content tools | AI-assisted promotional post generation, regeneration, saving, download, feed publish action |

## What remains to design and build

### P0 product flows

- Distinct onboarding, permissions, and dashboards for brands, retailers, dispensaries, consumers, administrators, and any approved sales-representative role.
- Daily survey and voting experience, including question lifecycle, eligibility, vote integrity, result aggregation, and business insight access.
- Business verification journey: entity data, EIN evidence, license evidence, applicant authority, email and phone confirmation, review states, re-verification, suspension, appeals, and audit history.
- Reviewer and administrator console for verification, moderation, duplicate ownership, disputes, status changes, and jurisdiction configuration.
- Authenticated application shell and persistent backend integration for profiles, feed, connections, messaging, surveys, verification, and documents.
- Jurisdiction rules engine and feature flags for age, location, license, advertising, medical/adult-use, warnings, and platform-specific restrictions.

### P1 product flows

- Moderation, reporting, impersonation, copyright, content-policy, and enforcement workflows.
- Paid-tier entitlements, billing states, maximum-tier survey analytics, exports, and privacy thresholds.
- Real location discovery, state availability, geofencing, retailer/dispensary inventory relationships, and launch-market configuration.
- Responsive design system, production component library, loading/error/empty states, accessibility, and mobile layouts.
- Privacy, terms, cannabis advertising, consent, data export, and account deletion surfaces.

## Immediate build sequence

1. Create the role and permission matrix.
2. Map the priority journey for each approved MVP role.
3. Build low-fidelity flows for onboarding, verification, daily voting, paid survey insights, and administration.
4. Produce a screen inventory and acceptance criteria.
5. Prepare multiple coherent visual directions using the supplied branding as evidence, not as an assumed final brand system.
6. After review, consolidate the approved direction into responsive production components.

## Known source discrepancy

The source note references a separate North Star document, but the received attachment set contains four HTML prototypes, one branding image, and two PDFs. No separately named North Star file was present. Treat the product principles in the legal strategy and the supplied prototypes as provisional direction until the missing source is located or the client confirms otherwise.

## Repository pointers

- Current private canonical handoff repository: `dillonmohr8777/client-operations-canonical`
- Existing public discovery prototype: `dillonmohr8777/bridge-discovery-prototype`
- Existing public Kimi design exploration: `dillonmohr8777/bridge-discovery-prototype-kimi-design`

The public repositories are references only. Do not publish new client source material there without a separate explicit approval.
