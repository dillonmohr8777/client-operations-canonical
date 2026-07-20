# AHCM contributor workspace

This private repository is the transport, backup, and contribution surface for Dillon's Canonical Client Operations project.

## Roles

- **Sole authoritative execution machine:** `DESKTOP-4AHKEC4`
- **Writable canonical path:** `C:\Users\dillo\Documents\Codex\projects\client-operations`
- **Canonical writer:** Marketing Chief on the authoritative machine
- **AHCM-3LCQVF4:** authorized contributor workspace

AHCM may:

- read and use the complete private repository and Align submodule
- research and create client-specific artifacts
- edit non-canonical code, documentation, tests, designs, and deliverables
- run local tests and verification
- push proposed work to branches named `ahcm/<topic>`
- open pull requests for review and merge on the authoritative desktop

AHCM must not:

- run the Marketing Chief or another canonical queue writer
- directly edit `queue/work-items.json` or `CONTROL.md`
- edit canonical intake or append-only state ledgers
- accept worker handoffs into canonical state
- push directly to `main`
- send, publish, deploy, spend, change accounts, or mutate live campaigns without exact current approval
- treat an unmerged AHCM branch as canonical state

## Clone on AHCM

```powershell
cd C:\Users\dillo\Documents\Codex\projects
git clone --recurse-submodules https://github.com/dillonmohr8777/client-operations-canonical.git client-operations-contributor
cd client-operations-contributor
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\Install-AhcmContributorGuard.ps1
```

## Start contribution work

```powershell
git fetch origin
git checkout main
git pull --ff-only origin main
git checkout -b ahcm/<short-topic>
```

Make and verify the change, then:

```powershell
git add <specific-files>
git commit -m "type: concise description"
git push -u origin HEAD
gh pr create --base main --title "type: concise description" --body "Summary, evidence, tests, and safety boundaries"
```

The local guard rejects pushes to branches outside `ahcm/*` and rejects AHCM commits that touch protected canonical state.

## Protected canonical state

AHCM branches may not modify:

- `queue/work-items.json`
- `CONTROL.md`
- `intake/`
- `state/intake-sync.json`
- `state/handoff-receipts.jsonl`
- `state/queue-mutations.jsonl`
- `state/corrections.jsonl`
- `state/prediction-outcomes.jsonl`

If AHCM research implies a queue change, include the proposed change and evidence in the pull-request description. The Marketing Chief on DESKTOP performs the canonical mutation after review.

## Update an existing AHCM clone

```powershell
git fetch origin
git checkout main
git pull --ff-only origin main
git submodule update --init --recursive
```

Do not hard-reset a branch containing unsubmitted AHCM work.

## Deliberate authority migration

Changing the authoritative machine requires:

1. Dillon explicitly naming the new authoritative machine.
2. Auditing cron jobs, gateways, scheduled tasks, and client automations on both computers.
3. Preserving or migrating needed jobs before stopping the old writer.
4. Verifying the final queue revision and repository commit on both machines.
5. Updating this boundary in a reviewed commit.
