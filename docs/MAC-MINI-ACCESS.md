# Mac Mini client operations access

This repository is publicly readable. Dillon confirmed on 2026-09-25 that it should stay public. Keep credentials, private runtime files, and new raw client evidence out of Git.

## Canonical route

- Start with [`AGENTS.md`](../AGENTS.md), [`CONTROL.md`](../CONTROL.md), and [`registry/clients.json`](../registry/clients.json). Resolve the exact client ID before opening `clients/<client-id>/` or creating a client artifact.
- `queue/work-items.json` is the canonical machine state. `CONTROL.md` is its projection. Preserve the single logical writer, revision checks, append-only ledgers, and exact client routing. Do not create another client queue in Dillon OS or a cloud workspace.
- On the Mac, this checkout is `~/code/client-operations-canonical`. Its path is a local convenience, not a cloud mount. Cloud workers must attach this repository and verify the files are present.
- The operating vault is [`dillon-os`](https://github.com/dillonmohr8777/dillon-os), shared skills are [`claude-skills-repo`](https://github.com/dillonmohr8777/claude-skills-repo), MomoBot source is [`deer-flow`](https://github.com/dillonmohr8777/deer-flow), and the original migration kit plus full Mac access map are in the private [`mac-mini-handoff`](https://github.com/dillonmohr8777/mac-mini-handoff) repo. Attach only the repos needed for the work.

Provider secrets belong in the Mac Keychain or the cloud environment's secret settings, never here. `registry/local-models.json` and `registry/cursor-local-models.json` are preparation rosters; they do not prove model entitlement or installed weights. The configured MomoBot menu includes Muse Spark 1.3; the separate private `jev-router` needs its own repository scope and `AI_GATEWAY_API_KEY` secret.
