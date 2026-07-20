# Remote workspace boundary

This private repository is the transport and backup for Dillon's Canonical Client Operations project.

## Authority

- **Sole authoritative machine:** `DESKTOP-4AHKEC4`
- **Sole writable canonical path:** `C:\Users\dillo\Documents\Codex\projects\client-operations`
- **Canonical writer:** Marketing Chief on the authoritative machine
- **AHCM-3LCQVF4 role:** read-only context mirror unless Dillon explicitly performs a machine-role migration

A clone does not become a second queue. On AHCM or any other secondary machine, do not:

- run the Marketing Chief
- edit `queue/work-items.json`
- regenerate or directly edit `CONTROL.md`
- accept worker handoffs
- run Gmail/Slack intake as a queue writer
- send, publish, deploy, spend, change accounts, or mutate live campaigns from this mirror
- treat a local change as canonical state

## Safe AHCM clone

Run from a terminal on `AHCM-3LCQVF4`:

```powershell
cd C:\Users\dillo\Documents\Codex\projects
git clone https://github.com/dillonmohr8777/client-operations-canonical.git client-operations-reference
cd client-operations-reference
git remote set-url --push origin DISABLED
```

Create `.git\hooks\pre-push` with this content to fail closed:

```sh
#!/bin/sh
echo "Push blocked: AHCM is a read-only Canonical Queue mirror."
exit 1
```

Then tell Codex on AHCM:

> Use this repository only as read-only agency context. `DESKTOP-4AHKEC4` remains the sole canonical writer and execution machine. Do not mutate the queue or run the Marketing Chief here. If work is needed, return a bounded proposed handoff for execution on the authoritative desktop.

## Updating the mirror

```powershell
git fetch origin
git reset --hard origin/main
```

This intentionally discards secondary-machine edits. Do not run it in the authoritative desktop repository.

## Deliberate migration

Changing the authoritative machine requires all of the following:

1. Dillon explicitly names the new authoritative machine.
2. Cron jobs, gateway processes, scheduled tasks, and client-specific automations are audited on both machines.
3. The old writer is stopped only after needed automations are preserved or migrated.
4. The final queue revision and repository commit are verified on both sides.
5. The machine-boundary documentation is updated in the same reviewed commit.
