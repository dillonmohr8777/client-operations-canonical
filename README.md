# Client Operations

This is the canonical client operating system for Codex. It connects client names, aliases, domains, contacts, Slack channels, access references, communications, and deliverables without storing secrets.

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
```

One client gets one canonical folder. New work belongs there unless the match is ambiguous or the client is still marked `needs-confirmation`.
