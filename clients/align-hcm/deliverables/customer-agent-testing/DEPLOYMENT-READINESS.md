# Align HCM Customer Agent deployment readiness

Checked: 2026-07-28  
Portal: `242825734`  
Account: `dillon.mohr@alignhcm.com`  
External deployment: **held**

## Verdict

The canonical package is locally staged and structurally valid, but it is **not
ready for live deployment yet**. No channel was connected, no guidelines were
published, and the agent was not activated.

Dillon authorized private configuration and testing on July 28, 2026. This
does not release the earlier live-deployment hold: no channel activation,
traffic coverage, or public exposure is authorized yet.

The remaining work is an authenticated HubSpot acceptance pass, not a Netlify,
Vercel, or conventional application deployment.

## Repository research

- Refreshed the machine project index before searching.
- Scanned 178 local repositories and Codex workspaces.
- Inspected the complete trees of all 32 repositories visible to the
  authenticated `dillonmohr8777` GitHub account.
- Found the only Align-specific Customer Agent configuration in
  `dillonmohr8777/client-operations-canonical`, under
  `clients/align-hcm/deliverables/`.
- Found one separate Momentum 360 Customer Agent package in
  `dillonmohr8777/alignhcm-ai-marketing-skills`. It is a useful structural
  reference only. Its portal, brand, content, handoff, and public behavior are
  Momentum-specific and must not be copied into Align.
- Other matches were HubSpot reporting agents, dashboards, content projects,
  duplicated worktrees, portal guards, or unrelated Customer Agent references.
  None contained a second Align Customer Agent implementation.

## Verified package state

- Configuration contract: **15 passed, 0 failed**.
- Acceptance inventory: **26 unique tests** generated successfully.
- Public knowledge preflight: **26 of 26 URLs returned HTTP 200** on
  2026-07-28 without redirecting away from their requested Align URL.
- Current sitemap: the same 11 approved case-study child pages remain present.
- Live response capture: **0 of 26 captured**. The guardrail suite correctly
  fails closed on all 26 missing responses.
- Live connector identity: portal `242825734`,
  `dillon.mohr@alignhcm.com`.
- HubSpot documentation mapping is captured in `deployment-package.json` for
  Identity, Knowledge, Guidelines, Human handoff, Test, and Channels.
- Deployment remains disabled in the manifest.

## Current live blocker

Both the in-app browser and the existing persistent Chrome session redirected
the Align portal to HubSpot login with `401 Unauthorized`. The sanitized
Bitwarden bridge reports `state=locked` with a credential present. This is a
human authentication gate; no password, passkey, MFA, cookie, or vault content
was inspected or exposed.

## Gates that must pass before deployment

1. Authenticate to the Align HubSpot portal and re-confirm portal `242825734`.
2. Verify Customer Agent Editor permission and an assigned eligible seat.
3. Inspect the existing agent, brand assignment, on/off state, and any current
   channel deployment before changing anything.
4. Apply the staged Identity and split the canonical configuration across
   Tone, Response style, Scripted responses, and Guardrails.
5. Add only the 26 approved public URLs; keep private sources, CRM records,
   contact submissions, drafts, recruiting pages, archives, sandbox domains,
   and unreviewed blogs excluded.
6. Verify every source sync, refresh time, exclusion, and citation setting.
7. Configure and verify the exact human handoff destination, availability
   behavior, and visitor messages.
8. Verify the existing live-chat channel, tracking code, working hours,
   fallback assignments, HubSpot Credits, and proposed conversation coverage.
9. Run all 26 prompts in **Test Align HCM Customer Agent > Live Chat**, capture
   only the replies, and review Testing Insights and source citations.
10. Reach 26 deterministic passes and 26 manual-review passes.
11. Obtain Dillon's explicit go-live approval for the exact reviewed channel
    configuration.
12. Only then deploy from **Deploy > Channels**.

## Hold conditions

- Do not publish draft guidelines.
- Do not connect a channel, workflow, bot, form, email, calling, WhatsApp, or
  Facebook destination.
- Do not enable CRM read/write permissions or actions for the initial release.
- Do not enable HubSpot credit usage.
- Do not add the unverified `A Kill Switch Is Not a Workforce` source.
- Do not use the public website as proof that HubSpot has synced or cited a
  source.

## Ready signal

The package can be called **ready to deploy** only when
`Test-DeploymentReadiness.ps1 -Mode Live` passes and the exact final live-chat
deployment preview has Dillon's approval. Until then, the correct status is
`package-ready-live-validation-blocked`.
