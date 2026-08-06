# Marketing Chief Buzz integration

Buzz Desktop is Dillon's daily command and private conversation plane around Marketing Chief. It does not replace the canonical queue, client registry, approval gates, or Watchtower scheduler. The private Sites dashboard is an optional status and approval fallback, not a required second inbox.

## Installed shape

- One owner identity in the official Buzz Desktop app and eight durable protected agent identities covering all ten operating functions.
- Every private key and owner attestation is isolated in its own Windows Credential Manager entry. The desktop remains the real inbox. The preferred runtime is the official `buzz-acp` harness; when Microsoft Defender quarantines that unsigned Windows sidecar, the hidden Codex worker provides agent-signed replies without weakening Defender.
- A narrow Nostr presence keeper holds one authenticated socket per protected agent, publishes Buzz's kind `20001` online heartbeat every 30 seconds, reconnects automatically, and never launches an agent subprocess. Buzz therefore shows the full roster online while the safe Codex worker handles actual messages.
- Private management, routing, research, creative, web, paid-media, CRM, access, verification, and Watchtower channels.
- Codex and Claude ACP adapters, with an automatic Codex fallback whenever the local Claude subscription session is unavailable or expired.
- Fifteen declared bindings covering the canonical repository, private Studio, Watchtower, ACP, OmniRoute and Ollama, installed operator clients, MCP, protected access, the dedicated minimized Chrome CDP route, Gmail, Slack and Cursor, HubSpot, paid media, GitHub, Sites, and Netlify.
- Narrow role-specific skill packs, with Web and Product as the default production deputy for build work.
- One coordinator plus a maximum of three concurrent internal workers.
- Dashboard-originated direct messages are queued in owner-only D1, delivered by the local bridge, and resolved with a Buzz event reference.
- Agent replies and raw client communications remain in Buzz; the hosted dashboard stores only the owner-authored outbound instruction and safe delivery metadata.

## Safety boundary

Never place credentials, tokens, cookies, one-time codes, recovery material, direct personal contact details, or raw private client communications in Buzz. External delivery, spend, publishing, account changes, and destructive actions keep their existing approval gates.

## `/loop` operator workflow

`/loop` is Dillon's shorthand for automatic Buzz delegation, not a native Buzz
slash command. Dillon stays in one Codex conversation. Codex selects the
smallest relevant role set, messages those protected identities through Buzz,
coordinates their replies, and returns one reconciled result. Web and Product
is the default production deputy for website, application, UI, dashboard, and
product work; Independent Verifier joins material completion checks.

A relay delivery receipt is not enough. The bridge must see a reply signed by
the expected agent identity, and bidirectional health checks use two sequential
turns in the same DM to prove session continuity. Delegation remains capped at
the established three concurrent workers.

Use the production conversation wrapper rather than rebuilding relay calls:

```powershell
.\Invoke-MarketingChiefBuzzLoop.ps1 `
  -AgentIds web-product,independent-verifier `
  -Instruction 'Inspect the scoped build, return evidence, and do not publish.'
```

The wrapper accepts one to three provisioned roles, rejects secret-shaped
instructions, opens the existing protected DM, sends through standard input,
waits on a bounded relay window, verifies the reply signer, blocks a
secret-shaped reply, and persists no transcript.

Agent replies are posted as top-level DM messages so the mobile client shows
them directly in the conversation instead of hiding them behind a thread.

## Files

- `team.manifest.json` is the declarative roster and channel topology.
- `stack.bindings.json` is the complete non-secret capability map. It routes work while preserving each system's read-only, exact-account, protected, or approval-gated mode.
- `references/ai-tech-news-site-factory.md` binds Momentum 360's AI Tech News program to the merged `dillon-os` pull request 226 weekly 25-site factory and its maker/checker quality gate.
- `skills.assignments.json` assigns a bounded skill pack and default stack bindings to every role without assuming Codex skill discovery transfers to Claude.
- `Adopt-MarketingChiefBuzzDesktopIdentity.ps1` aligns the bridge with Buzz Desktop's protected owner identity without printing or writing the private key.
- `Reset-MarketingChiefBuzzDesktopIdentity.ps1` rotates a fresh desktop onboarding identity to the already-protected Marketing Chief owner identity without exposing either value.
- `prompts/` contains role instructions and shared team rules.
- `references/buzz-product-flow-patterns.md` converts the studied Tonbi walkthrough into reusable onboarding, identity, roster, inbox, and capability-grant templates for Web and Product.
- `Install-MarketingChiefBuzzTeam.ps1` provisions protected identities, owner attestations, private channels, and exact memberships idempotently.
- `Set-MarketingChiefBuzzNativeConcurrency.ps1` remains available for native-agent diagnostics but is not the production runtime path on this Windows build.
- `Invoke-MarketingChiefBuzzSupervisor.ps1` starts or verifies the eight hidden ACP runtimes without opening helper windows.
- `Invoke-MarketingChiefBuzzCodexWorker.ps1` is the safe Windows fallback when the official unsigned `buzz-acp.exe` sidecar is quarantined. It polls protected owner DMs, invokes Codex with each role's full stack policy, and posts the result under the expected agent identity without persisting message bodies.
- `Install-MarketingChiefBuzzCodexWorkerAutomation.ps1` registers the fallback through the required console-free scheduled-task wrapper.
- `Start-MarketingChiefBuzzPresenceKeeper.ps1` starts or repairs eight hidden, presence-only Nostr sessions without exposing credentials or spawning model runtimes.
- `Install-MarketingChiefBuzzPresenceAutomation.ps1` checks the presence keepers every minute through the required console-free scheduled-task wrapper.
- `tools/buzz-presence-daemon.mjs` implements only NIP-42 authentication, kind `20001` online heartbeats, bounded reconnects, and safe status output.
- `tools/buzz-dm-query.mjs` gives the local worker an authenticated, exact-channel WebSocket history path when the desktop CLI's HTTP history query stalls; its output stays in process memory and is never logged.
- `Invoke-MarketingChiefBuzzLoop.ps1` is the bounded `/loop` send, wait, signer-verification, and reply handoff path used by Codex.
- `Sync-MarketingChiefBuzzBridge.ps1` moves owner-authored dashboard instructions into Buzz and writes only safe status metadata back.
- `Test-MarketingChiefBuzzIntegration.ps1` validates identities, topology, adapters, relay visibility, and fail-closed message rules.

## Current activation path

Run `Install-MarketingChiefBuzzTeam.ps1 -RequireRelay`. The installer creates or reuses one protected Credential Manager entry per identity, computes a separate protected owner attestation for every agent, and stores only public topology in `runtime/team-state.json`. If hosted-community authentication is unavailable, it exits safely with `awaiting_auth` and does not invent channel state.

After provisioning, run `Install-MarketingChiefBuzzAutomation.ps1`, then `Invoke-MarketingChiefBuzzSupervisor.ps1 -Restart`. If the official unsigned Windows `buzz-acp.exe` is quarantined, do not add a broad Defender exclusion. Run `Install-MarketingChiefBuzzCodexWorkerAutomation.ps1` and `Install-MarketingChiefBuzzPresenceAutomation.ps1` instead. The console-free fallback keeps Buzz Desktop as the real inbox, routes owner messages into full-access Codex turns, posts agent-signed replies, and stores only safe event IDs and status summaries. The separate presence task keeps all eight roster entries live and self-heals missing sessions once per minute.

Buzz Mobile 0.4.x has a known upstream display gap: missing agents initialize
as offline and the app does not fetch the relay's current presence snapshot.
Relay and Desktop verification therefore must not be presented as proof that
an older iOS build refreshed its dots. Upstream PR `block/buzz#3155` adds the
missing authenticated snapshot fetch; until it ships in the App Store build,
mobile status is confirmed only from the actual phone UI.

The production bridge path is deliberate. The official desktop's current Windows secret-store blob retained only one identity during restart testing, which made a multi-agent native roster non-durable. Separating the agent credentials preserves the official desktop experience while keeping all eight identities restart-safe.

Three specialist roles prefer Claude, but runtime health wins over preference. The supervisor checks the non-secret Claude authentication status at startup and uses Codex for those roles when Claude is logged out. A later authenticated restart automatically restores the preferred Claude harness.
