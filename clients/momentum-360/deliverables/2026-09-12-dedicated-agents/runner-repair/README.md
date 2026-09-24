# Momentum360-Daily-Agent-Health runner repair

Status: local shadow repair applied September 13, 2026. The missing runner files were restored from the source commit after exporting and disabling `Momentum360-Daily-Agent-Health`. No live Slack sender, scheduled task run, Codex worker, or health report delivery was run.

## Root cause

The Windows scheduled task `Momentum360-Daily-Agent-Health` still exists and is `Ready`, but its real command is loaded through:

`C:\Users\dillo\.codex\tools\Run-HiddenScheduledTask.vbs`

The manifest entry resolves to:

`C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -NoLogo -NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File "C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\automation\daily-agent-health\Run-MomentumDailyAgentHealth.ps1"`

That `Run-MomentumDailyAgentHealth.ps1` file is missing from the live automation directory. The current directory only has `output\` and `repair-evidence-2026-08-14.md`.

This explains the scheduler result `0xFFFD0000`: PowerShell exits before the runner can create a new dated log or final receipt. The local output folder stops at `momentum-daily-health-2026-09-01-090001-*`, which is consistent with the missing runner/support files.

## Evidence

- `Get-ScheduledTaskInfo -TaskName Momentum360-Daily-Agent-Health`: last run `2026-09-12 09:00:02`, result `4294770688` / `0xfffd0000`, next run `2026-09-13 09:00:00`.
- `hidden-scheduled-tasks.tsv`: task key points to `...\daily-agent-health\Run-MomentumDailyAgentHealth.ps1`.
- `Test-Path ...\Run-MomentumDailyAgentHealth.ps1`: false.
- `git log --all -- clients/momentum-360/automation/daily-agent-health`: commit `da33d74bebba5fd90b3b8a037e7d0f6ac4dcdaa1` added the missing runner and support files on `2026-09-01`.
- Current `HEAD` tree contains only final receipts and `repair-evidence-2026-08-14.md` for that automation directory, not the runner, prompt, tests, preflight, cache guard, config, or delivery ledger.

## Proposed Patch

Restore the exact committed automation files from `da33d74bebba5fd90b3b8a037e7d0f6ac4dcdaa1`:

- `clients/momentum-360/automation/daily-agent-health/Install-MomentumDailyAgentHealthTask.ps1`
- `clients/momentum-360/automation/daily-agent-health/PROMPT.md`
- `clients/momentum-360/automation/daily-agent-health/README.md`
- `clients/momentum-360/automation/daily-agent-health/Repair-MomentumCodexModelCache.ps1`
- `clients/momentum-360/automation/daily-agent-health/Run-MomentumDailyAgentHealth.ps1`
- `clients/momentum-360/automation/daily-agent-health/Test-MomentumDailyAgentHealth.ps1`
- `clients/momentum-360/automation/daily-agent-health/Test-MomentumDailyAgentHealthPreflight.ps1`
- `clients/momentum-360/automation/daily-agent-health/expected-configuration.json`
- `clients/momentum-360/automation/daily-agent-health/state/delivery-ledger.json`

Use [Restore-MomentumDailyAgentHealthRunner.ps1](./Restore-MomentumDailyAgentHealthRunner.ps1) to inspect or apply the restore. Its default mode is dry-run only.

The apply path is intentionally fail-closed:

- It refuses to apply while scheduled task `Momentum360-Daily-Agent-Health` exists in any state other than `Disabled`.
- It refuses to overwrite any existing target file, including `state/delivery-ledger.json`.
- It writes support files first and `Run-MomentumDailyAgentHealth.ps1` last, so a partial restore cannot expose a runner before dependencies exist.
- If a write fails, it removes only files it created in that attempt, and only when those paths are inside the automation root.

## Validation

Dry-run validation:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File clients/momentum-360/deliverables/2026-09-12-dedicated-agents/runner-repair/Restore-MomentumDailyAgentHealthRunner.ps1
```

Expected behavior: it prints the source commit, confirms each source blob exists, confirms the live runner is currently missing, and does not write files.

The dry-run also reports `applyAllowed` and `blockers`. On the current machine, applying should be blocked until the scheduled task is disabled by the operator.

## Activation

Only after approval to repair the live runtime:

```powershell
Disable-ScheduledTask -TaskName Momentum360-Daily-Agent-Health
powershell.exe -NoProfile -ExecutionPolicy Bypass -File clients/momentum-360/deliverables/2026-09-12-dedicated-agents/runner-repair/Restore-MomentumDailyAgentHealthRunner.ps1 -Apply
powershell.exe -NoProfile -ExecutionPolicy Bypass -File clients/momentum-360/automation/daily-agent-health/Run-MomentumDailyAgentHealth.ps1 -DryRun -NoRetry
```

The disable step is manual and deliberate; the helper will not change scheduler state. The restore command restores missing files only. The dry-run command exercises the restored runner in `-DryRun` mode, which writes a local log and does not invoke the Slack/Codex sender path.

Before reactivation, review ledger continuity, current preflight behavior, and the recovered prompt/sender scope. The recovered source predates the current failure and may need current access review before it should send again.

## September 13 recovery history

- Scheduler export saved at `scheduler-export-before-repair-2026-09-13.xml`.
- `Momentum360-Daily-Agent-Health` is disabled. Its latest failing run remains September 13, 2026 09:00:01 with result `0xfffd0000`.
- The restore helper applied cleanly with the task disabled and wrote the runner last.
- `Test-MomentumDailyAgentHealth.ps1` passed.
- `Test-MomentumDailyAgentHealthPreflight.ps1 -SkipLiveChecks` returned `DEGRADED`, as expected while the task is disabled and live Conversations checks are skipped.
- `Run-MomentumDailyAgentHealth.ps1 -DryRun -NoRetry` wrote `..\..\automation\daily-agent-health\output\momentum-daily-health-2026-09-13-124724.log` and exited before Slack or Codex delivery.
- Restored `state/delivery-ledger.json` contains 19 historical recorded deliveries, latest `M360-DAILY-2026-09-01`. They were not freshly verified against Slack.

## Final scheduler acceptance, September 13 at 13:08 ET

The recovered runner was changed to default to deterministic local shadow health. It exits before ledger synchronization, cache repair, live preflight, model work, or any sender. The historical external branch requires explicit `-LiveDelivery` and was not run.

Independent checks passed, including a missing-configuration fault test and verification that the hidden launcher manifest has exactly one matching runner command without the live flag. The exact existing 9 AM Windows task was then enabled and manually triggered through Task Scheduler. It completed at 13:08 ET with process result 0 and `LOCAL_SHADOW_HEALTH_PASS`, confirmed by `../../automation/daily-agent-health/output/momentum-daily-health-2026-09-13-130833-shadow-health.json`. Task state is Ready; next run is September 14 at 9 AM Eastern.

This proves local scheduler execution and its receipt. Full provider health and external Slack delivery remain unverified. Do not rerun the restore helper over the repaired files.
