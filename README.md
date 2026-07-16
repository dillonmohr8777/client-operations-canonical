# Client Operations

This is the canonical client operating system for Codex. It connects client names, aliases, domains, contacts, Slack channels, access references, communications, and deliverables without storing secrets.

## Marketing Chief control surface

Phase 1 is running as a manual pilot. Open `CONTROL.md` first. Dillon should use that single surface for priorities, approvals, risks, reviewable artifacts, and system health.

- `queue/work-items.json`: canonical, versioned work state
- `CONTROL.md`: human-readable projection of the queue
- `state/corrections.jsonl`: append-only, redacted learning ledger

The Marketing Chief is the only writer to canonical state during the pilot. Focused workers may research, build, or verify, but they return bounded handoff JSON and never update the queue themselves. No schedule or background bridge may execute canonical work until routing and verification have passed the pilot.

## Structure

- `registry/clients.json`: canonical client and alias index
- `clients/<client-id>/`: stable home for each client
- `scripts/Resolve-Client.ps1`: resolve a name, alias, domain, or contact
- `scripts/Test-ClientRegistry.ps1`: validate IDs, folders, and safe schema
- `.codex/environments/environment.toml`: safe setup and routing actions

The current registry is based on a live communication scan covering 463 Gmail message records observed between June 2 and July 15, 2026, existing verified HubSpot routes, and Slack-draft evidence. Gmail pagination back to April 16 is still in progress. Complete Slack channel and DM enumeration is blocked until the Slack connector receives channel, private-channel, group-DM, and DM read scopes.

## Routing policy

When a client or alias is named, resolve it first:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\Resolve-Client.ps1 -Name "KJB"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\Resolve-Client.ps1 -List
```

One client gets one canonical folder. New work belongs there unless the match is ambiguous or the client is not active. `Resolve-Client.ps1` rejects a blank resolution request, requires `-List` for inventory mode, returns only the minimal routing fields, and returns `blocked-inactive-client` with exit code `3` for a unique `needs-confirmation` match. Callers must require `status: resolved`, not merely exit code `0`, before client work begins.
