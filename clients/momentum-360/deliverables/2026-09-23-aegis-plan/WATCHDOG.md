# Aegis public watch

## Run and evidence

From this directory:

```powershell
node .\watch-public.cjs --self-test
node .\watch-public.cjs --live
```

Self-test passed September23. Live runs at20:32:42Z and20:34:22Z observed a homepage host challenge. First run changed=true; second changed=false. See watchdog-output/latest.json and changes.jsonl. Direct HTTP visibility is degraded; this is not an outage finding.

The script reuses Dillon OS net/sentinel helpers, uses GET only on four fixed public URLs, follows no redirects, caps responses/time, stops on a challenge, and holds an exclusive run lock. It stores sanitized observations and stable change signatures, not raw HTML or credentials. Browser-baseline.json records separate authenticated browser evidence; this does not establish anonymous behavior.

## Schedule and controls

Existing automation daily-momentum-semrush-opportunities now runs as **Aegis Momentum website watch**, ACTIVE daily09:00 America/New_York. Configuration was read back after saving. It retains its existing target task; no duplicate trigger was created.

Pause/update this automation through Codex automation controls using that ID. Do not remove its run lock while a process is active. A stale lock fails closed and needs operator inspection. An active browser/agent run requires separate cancellation.

The heartbeat permits local fixes and isolated unpublished drafts, stays quiet for unchanged/non-actionable state, and escalates meaningful changes, failures and decisions. Published edits, outbound communications, spending, security/access changes and destructive actions require approval. No Mac messages.

These are agent instructions plus a constrained read-only script. They are not a durable tool-level approval system. DeerFlow action-bound approvals, connector permissions and migration acceptance are still planned.
