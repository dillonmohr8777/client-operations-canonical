@AGENTS.md

# Client Operations — the canonical client system

**This is the source of truth for who is a client.** Momentum Digital / Momentum 360, Philadelphia.

`registry\clients.json` (26 routes) defines client identity: id, displayName, folder, aliases,
emailDomains, slackChannels, status. When the vault (`C:\Users\dillo\repos\dillon-os`) and this
registry disagree about who is a client or what they are called, **this registry wins.**

## Read first

`CONTROL.md` — the Marketing Chief control surface and the pinned work queue. Then `README.md`
for the writer rules: the Marketing Chief is the only writer to canonical state during the pilot;
focused workers return bounded handoff JSON and never update the queue themselves.

## Six other copies exist. This is the real one.

`repos\client-operations-canonical` is **stale** despite its name — missing `nexla`, `puttery-nyc`,
and `immohrtal-marketing`. There are also four `projects\client-operations-*` forks
(`-ami-aug-d9e7`, `-ami-pdfs-d9e7`, `-codex-conn-9aaa`, `-wt-organic-ranking`) and a
`Claude\worktrees\repo-analysis-1bien2\` worktree. All archaeology. See
[MACHINE-INDEX.md](../../../../MACHINE-INDEX.md) §4.

## Known defects — do not paper over these

1. **`slackChannels` is populated on only 6 of 26 routes.** `nkcdc`, `bridge-software`,
   `revive-systems`, `pritzker-law-group`, `tags-2-go`, `puttery-nyc`. The other 20 are empty.
   **Every reconciliation that joins on Slack channel silently fails for those 20.** This is the
   root cause of the recurring "client has a channel but no record" confusion — not name drift.
2. **Where names do drift, `aliases` is missing the channel form.** `omega-landscaping` lists
   "Omega Landscaping" and "Omega" but not `omega-landscape` (the actual channel).
   `onsite-concrete-landscape` lists "Onsite Concrete" but not `onsite-construction`.
3. **Two clients have no route and no vault folder anywhere:** **Green Slate Masonry** and
   **Deborah Mara**. Use the `momentum-client-intake` skill to create them properly — vault record,
   registry entry, and Slack link in one pass — rather than adding a bare folder.
4. **Two vault clients have no route here:** Capsule & Tonic, Everyday Life Insurance. The vault's
   own `01_Clients\Client Index.md` already flags them under "Reconciliation required" and says
   explicitly: do not promote, demote, delete, merge, or include them in portfolio totals by
   inference. Honour that.

Fixing 1 and 2 means editing canonical client data. Do it deliberately and tell Dillon; do not
bulk-rewrite the registry as a side effect of another task.

## Hard boundaries

- No secrets in this repo. It connects names, aliases, domains, contacts, channels, and access
  *references* — never credentials.
- External delivery (sending, posting, publishing, spend, account changes) stays approval-gated.
- `state/corrections.jsonl` is append-only. Do not rewrite it.
- This directory is **chronically occupied** — five sessions logged against it. A Claude Code
  session takes an exclusive lock on its working directory, so a second session here is refused.
  Work through a git worktree instead of in this folder.

## Related

- Vault: `C:\Users\dillo\repos\dillon-os` — `01_Clients\` overlays, decisions, brain.
  Note the vault is currently on branch `cursor/immohrtal-standing-canary-3c2e` with 406
  uncommitted files, so it is not showing main.
- Generated read-only projection: `..\agent-vault` — never edit generated files there.
- Skills: `momentum-client-context` (load a client record before building),
  `momentum-client-intake` (create a complete record), `momentum-client-report` (reporting).
