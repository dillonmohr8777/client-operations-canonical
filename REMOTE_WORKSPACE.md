# DESKTOP and AHCM writer workspaces

This private repository is the shared transport, backup, and coordination surface for Dillon's Canonical Client Operations project.

## Authorized writers

- **DESKTOP-4AHKEC4:** authorized execution machine and canonical-state writer host
- **AHCM-3LCQVF4:** authorized execution machine and canonical-state writer host
- **Logical canonical writer:** the Marketing Chief role, which may have authorized instances on both machines

Neither machine must stop its gateway, scheduler, cron jobs, or Marketing Chief instance merely to allow the other machine to write. This is a coordinated multi-writer setup, not an authority migration.

Both machines may:

- read and use the complete private repository and Align submodule
- run the Marketing Chief and supported canonical mutation scripts
- reconcile validated worker handoffs into canonical state
- research, create artifacts, test, and verify work
- commit and push canonical updates to `main` after synchronizing
- use topic branches and pull requests for non-canonical or review-heavy work

Both machines must:

- resolve the exact active client before changing client state
- preserve approval gates for sends, publishing, deployment, spend, destructive actions, and account changes
- use supported scripts rather than editing generated or append-only state manually
- reject stale queue revisions
- keep `queue/work-items.json`, `CONTROL.md`, and canonical ledgers consistent
- avoid force-pushing or overwriting another writer's work

## Enable AHCM as a writer

After pulling this policy on AHCM, remove the obsolete contributor-only pre-push hook and configure fast-forward-only pulls:

```powershell
cd C:\Users\dillo\Documents\Codex\projects\client-operations-contributor
git fetch origin
git pull --ff-only origin main
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\Enable-AhcmWriter.ps1
```

The script removes only the legacy AHCM contributor guard. It leaves unrelated custom hooks untouched.

## Canonical write protocol

A filesystem lock or Windows mutex coordinates processes only on one machine. Cross-machine coordination therefore uses Git fast-forward history plus optimistic queue revisions.

Before every canonical mutation:

```powershell
git fetch origin
git checkout main
git pull --ff-only origin main
```

Then:

1. Read the current `queue/work-items.json` revision.
2. Run the supported mutation or handoff script with that expected revision.
3. Regenerate and validate `CONTROL.md` and any required canonical projections.
4. Stage only the intended canonical files.
5. Commit with the queue revision or work-item identity in the message when useful.
6. Push normally to `origin/main`.

Example finish:

```powershell
git add queue/work-items.json CONTROL.md state/<required-ledger>.jsonl
git commit -m "type: reconcile canonical work item"
git push origin main
```

If pull cannot fast-forward, the expected revision is stale, or push is rejected:

- do not force-push
- do not overwrite the remote files
- preserve the local attempted mutation or backup
- fetch and reconcile the newer `origin/main`
- rerun the supported mutation against the new queue revision
- regenerate projections and push normally

Two machines may do local research and artifact work concurrently. Canonical commits are serialized by successful fast-forward pushes.

## Topic branches

For non-canonical or review-heavy work, either machine may use a topic branch:

```powershell
git fetch origin
git checkout main
git pull --ff-only origin main
git checkout -b <machine-or-topic>/<short-topic>
```

Then commit, push, and open a pull request. An unmerged branch is not canonical state.

## Existing clone update

```powershell
git fetch origin
git checkout main
git pull --ff-only origin main
git submodule update --init --recursive
```

Do not hard-reset a branch containing unsubmitted work.

## Shutdown or migration

Stopping a writer is not required for normal co-writer operation. If Dillon explicitly requests a machine shutdown, retirement, or authority migration:

1. Audit its cron jobs, gateways, scheduled tasks, and client automations.
2. Preserve or migrate anything still needed.
3. Push and verify its final intended canonical commit.
4. Confirm the remaining writer has the same queue revision and repository commit.
5. Only then stop the requested services.
