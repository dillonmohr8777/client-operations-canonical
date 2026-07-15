# Client Operations Rules

- Resolve every client through `registry/clients.json` before creating or updating client-specific work.
- Use the global `client_router` specialist for names, aliases, contacts, domains, or Slack channels that need routing.
- Put client-specific work in `clients/<client-id>/`. Do not create another dated client home when a canonical folder exists.
- Keep clients, brands, channels, accounts, reports, and metrics separate. Cross-client summaries must preserve client-level source attribution.
- Communication history supplies context but does not authorize sending, publishing, spend, or live-system changes.
- Store only non-secret access references. Resolve credentials through Access Broker or Bitwarden; never put passwords, tokens, cookies, one-time codes, or recovery material in this repository.
- Treat `needs-confirmation` records and ambiguous aliases as blockers to writing client state.
- Prefer one owner, one next action, and one current status per client outcome.
