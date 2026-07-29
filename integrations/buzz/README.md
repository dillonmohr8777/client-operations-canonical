# Marketing Chief Buzz integration

Buzz is the private conversation plane around Marketing Chief. It does not replace the canonical queue, client registry, approval gates, Sites dashboard, or Watchtower scheduler.

## Installed shape

- One owner identity and ten separate agent identities.
- Separate Windows Credential Manager records for every Nostr private key.
- Private management, routing, research, creative, web, paid-media, CRM, access, verification, and Watchtower channels.
- Codex and Claude subscription-backed ACP harnesses.
- Fifteen declared bindings covering the canonical repository, private Studio, Watchtower, ACP, OmniRoute and Ollama, installed operator clients, MCP, protected access, authenticated Chrome, Gmail, Slack and Cursor, HubSpot, paid media, GitHub, Sites, and Netlify.
- One coordinator plus a maximum of three concurrent internal workers.
- Dashboard-originated direct messages are queued in owner-only D1, delivered by the local bridge, and resolved with a Buzz event reference.
- Agent replies and raw client communications remain in Buzz; the hosted dashboard stores only the owner-authored outbound instruction and safe delivery metadata.

## Safety boundary

Never place credentials, tokens, cookies, one-time codes, recovery material, direct personal contact details, or raw private client communications in Buzz. External delivery, spend, publishing, account changes, and destructive actions keep their existing approval gates.

## Files

- `team.manifest.json` is the declarative roster and channel topology.
- `stack.bindings.json` is the complete non-secret capability map. It routes work while preserving each system's read-only, exact-account, protected, or approval-gated mode.
- `Adopt-MarketingChiefBuzzDesktopIdentity.ps1` aligns the bridge with Buzz Desktop's protected owner identity without printing or writing the private key.
- `Reset-MarketingChiefBuzzDesktopIdentity.ps1` rotates a fresh desktop onboarding identity to the already-protected Marketing Chief owner identity without exposing either value.
- `prompts/` contains role instructions and shared team rules.
- `Install-MarketingChiefBuzzTeam.ps1` provisions identities, profiles, private channels, and memberships idempotently.
- `Invoke-MarketingChiefBuzzSupervisor.ps1` keeps the ACP harnesses alive without opening a visible console or app window.
- `Sync-MarketingChiefBuzzBridge.ps1` moves owner-authored dashboard instructions into Buzz and writes only safe status metadata back.
- `Test-MarketingChiefBuzzIntegration.ps1` validates identities, topology, adapters, relay visibility, and fail-closed message rules.

## Current activation path

Run `Install-MarketingChiefBuzzTeam.ps1` first. It always creates or reuses all eleven private identities and stores only their public metadata in `runtime/team-state.json`. If BuilderLab authentication is not available, it exits safely with `awaiting_auth` and does not invent channel state.

After the owner identity is bound to a hosted Buzz community, run the installer again with that community's HTTPS relay origin, then run `Install-MarketingChiefBuzzAutomation.ps1`. The console-free scheduled bridge keeps the ACP harnesses alive, delivers dashboard instructions, and writes only safe event IDs and status summaries back to the private Studio.
