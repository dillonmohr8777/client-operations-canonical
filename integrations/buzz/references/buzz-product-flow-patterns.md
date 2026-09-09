# Buzz Product-Flow Patterns

Source studied: [Tonbi's Buzz setup guide](https://x.com/tonbistudio/status/2080518147480904008)  
Video length: 5:44  
Reviewed: 2026-07-29

This is a reusable product-flow reference for the Web and Product agent. It is
not permission to copy Buzz's visual identity, illustrations, palette, or
screens pixel-for-pixel.

## What the source actually demonstrates

Tonbi's video is a guided product walkthrough, not a collection of visual
templates. The reusable value is its sequence:

1. Accept a workspace invitation.
2. Create a durable identity.
3. Complete a minimal profile.
4. Enter a room-based workspace.
5. Discover agents in a dedicated roster.
6. Start or join an agent conversation.
7. Grant compute explicitly when the workflow needs it.

Representative frames reviewed:

- 0:50: focused invitation card on a calm branded field.
- 1:08: single-action Buzz entry screen.
- 1:58: minimal profile builder.
- 3:00: agent and automation roster cards.
- 4:02: room conversation with agent-authored messages.
- 5:04: explicit compute-sharing configuration.

## Reusable interface templates

### 1. Workspace invitation

Use for joining a client portal, private workspace, shared agent room, or
collaboration environment.

- One dominant card, one primary action, one sentence explaining the outcome.
- Show the inviter, destination, and access scope before acceptance.
- Keep legal and security detail available but visually subordinate.
- States: valid, expired, already joined, wrong account, offline, and revoked.
- Motion: a short card entrance and a restrained success transition only.
- Accessibility: focus lands on the heading; the primary action names the
  destination; errors are announced and remain visible.

### 2. Identity and profile setup

Use when authorship, account ownership, or agent identity matters.

- Separate identity creation from cosmetic profile completion.
- Explain what is permanent, recoverable, private, and public.
- Keep the first pass to avatar, display name, and one optional descriptor.
- Never expose secret keys after creation; provide a safe recovery workflow.
- States: generating, created, safely stored, recovery needed, and conflict.

### 3. Agent roster

Use for teams that need to understand who or what can act.

- A uniform card shows avatar, role, harness/provider, owner, presence, and
  permission summary.
- The add-agent action is a visually distinct empty tile, not a hidden menu.
- Separate automations from conversational agents.
- Support filters for function, client scope, availability, and risk level.
- States: online, busy, awaiting approval, offline, degraded, and disabled.
- Never use color as the only status signal.

### 4. Inbox and thread workspace

Use as the daily operating surface.

- Left rail: rooms and direct messages.
- Center: ranked inbox or conversation list.
- Main thread: messages, artifacts, approvals, and execution status.
- Optional context panel: sources, task state, ownership, and dependencies.
- Preserve visible authorship for people and agents.
- Make mentions and handoffs explicit; do not hide routing behind magic.
- Provide compact progress events rather than streaming internal reasoning.
- Mobile collapses rails into drawers while preserving the active thread.

### 5. Capability and compute grant

Use whenever an agent needs tools, compute, accounts, files, or external
delivery authority.

- Grant a named capability, to a named identity, for a bounded scope.
- Explain what data can be accessed and what actions become possible.
- Default to the narrowest duration and permission set.
- Show a review step before consequential activation.
- States: unavailable, pending human gate, active, expiring, revoked, and
  provider error.
- Revocation and audit history must remain easy to find.

### 6. First-run activation checklist

Use to turn a technically configured workspace into a usable product.

- Identity created.
- Profile completed.
- First room joined.
- First agent found.
- First message answered.
- First capability granted only if needed.
- Persistent status confirms that the workspace will survive restart.

## Product rules for our stack

- Buzz Desktop is the daily front door for conversations and agent handoffs.
- The Marketing Chief is the lead agent; Web and Product is the default
  production deputy for websites, portals, dashboards, and product interfaces.
- The web dashboard is a status, approval, and recovery surface—not a second
  agent inbox.
- Client, account, and delivery boundaries must remain visible in every
  actionable view.
- Agent identity, presence, ownership, and permission state are product
  primitives, not settings-page trivia.
- Prefer progressive disclosure: conversation first, controls when needed,
  advanced orchestration last.

## Implementation handoff contract

For any new UI that uses one of these templates, Web and Product must:

1. Inspect the real project, incumbent design system, and product context.
2. Select the template by user task rather than copying the whole Buzz shell.
3. Produce the normal, loading, empty, error, offline, permission-denied, and
   success states.
4. Define keyboard, focus, reduced-motion, responsive, and screen-reader
   behavior before calling the surface complete.
5. Keep motion functional and brief; never reproduce Tonbi's recording or
   Buzz's copyrighted visual assets as a substitute for original design.
6. Verify the real rendered surface and run proportional accessibility and
   regression checks.

