# Momentum 360 daily health repair evidence

Report under repair: `M360-DAILY-2026-08-14`

Status: local runner and startup defects repaired; live verification remains correctly degraded at two external access gates.

## Repaired and verified

- The scheduled Codex CLI was upgraded from `0.145.0` to `0.147.0`, matching the desktop runtime that writes the shared model cache.
- A per-run cache compatibility repair normalizes the model cache immediately before every primary or fallback attempt. Cache-write failures are treated as retryable startup defects; the earlier read lock was removed after live testing proved it blocked Codex's own cache write.
- Invalid active `SKILL.md` metadata was repaired. The prior alias stubs and cache are recoverable from `C:\Users\dillo\.codex\skill-metadata-backups\20260814-m360-daily-repair`.
- The runner now disables the unrelated unauthenticated Composio path and memory generation for its ephemeral sessions.
- Exact cache, invalid-skill-metadata, or Composio startup defects invalidate the attempt and trigger retry instead of being silently tolerated.
- A deterministic preflight checks the exact Momentum HubSpot portal, exact CallRail account, scheduled task, prompt encoding, skill metadata, model cache, protected HubSpot token, and Conversations scope before collection.
- The report prompt receives the redacted preflight result and must name precise degradation categories instead of describing the whole UI or API as unavailable.
- The desired HubSpot and CallRail state is recorded in `expected-configuration.json` and explicitly requires fresh verification.
- The runner uses Eastern time for the report ID, UTF-8 for prompt and logs, two in-process attempts plus the scheduled task's three 15-minute retries, exact report-ID deduplication, and a verified delivery marker before success.
- Multiline prompts are sent through standard input rather than a Windows command-line argument. A durable local delivery ledger is backfilled from verified final receipts and blocks same-day reruns before any Slack action; Slack channel read is the primary fallback dedupe check.

Static tests, live preflight, and a no-delivery dry run passed on 2026-08-14. A real ephemeral Codex startup returned exit code 0 with zero model-cache defects, zero invalid skill-metadata defects, zero Composio errors, and zero memory-writer failures.

Codex still emits a separate notice that the installed skill catalog exceeds its prompt-description budget. That notice is not a malformed-metadata failure, does not block the runner, and was not hidden by deleting or globally disabling Dillon's installed skills.

## Live runner audit incident and correction

The 10:11 ET audit exposed that the multiline prompt was being split into command-line arguments. The primary attempt failed at the word `CallRail`; the fallback then relied on Slack search, missed the already-delivered 9:08 ET report, and sent an unintended second degraded notice at Slack timestamp `1786716737.552399`. The original `1786712909.189399` message remains the canonical report. No deletion or correction message was sent without separate approval.

The runner now streams prompts through standard input, no longer locks the shared cache against Codex writes, backfills a durable delivery ledger from verified final receipts, exits before Codex or Slack on a same-date receipt, and requires channel-history read before search in the fallback. A same-day rerun returned `ALREADY_DELIVERED` without calling Slack, and an isolated stdin startup test returned exit code 0 with no argument-split, cache, invalid-skill-metadata, or Composio defect.

## Current external gates

### HubSpot portal 50612503

- The protected Momentum private token is valid for portal `50612503`.
- Conversations channels and threads both return HTTP 403 because the app lacks `conversations.read`.
- The correct Jason HubSpot browser route reaches the Google password gate. The persistent Chrome and in-app sessions are expired, browser autofill did not supply a credential, and the Bitwarden bridge remains locked. No password, passkey, MFA, or recovery gate was bypassed.
- After the authorized sign-in is restored, add `conversations.read`, re-run the protected probe, and verify the Customer Agent fields, capture timing, permissions, guideline publication, Help Desk owner and availability, exact conversations, handoffs, tickets, and workflow `1865051017` outcomes.

### CallRail account 671942387

- Access Broker resolves only Momentum Digital LLC account `671942387`; QC Kinetix account `906396198` remains explicitly excluded.
- Dillon explicitly approved the Google consent presented by CallRail. After consent, both in-app Browser and persistent Chrome route exact account `671942387` to `settings/not-found`; Gmail contains only the older QC Kinetix invitation and no Momentum Digital invitation. This is current evidence of missing exact-account membership, not merely an expired login.
- After the exact Momentum Digital account is restored, verify Sean and Jason routing, Mia autoresponse and failed-SMS fields, then run the controlled after-hours proof.

Until those gates are cleared, the daily report must remain `DEGRADED` and withhold fields that require those direct surfaces. Slack-mirror or HubSpot fallback telemetry may support core counts but may not be presented as routing, ownership, Mia, or exact-conversation proof.

## Rollback

- Skill metadata originals and the pre-repair cache are retained in `C:\Users\dillo\.codex\skill-metadata-backups\20260814-m360-daily-repair`.
- The runner changes are confined to this automation directory. The scheduled task still points to the same hidden launcher and retains its three retry triggers.
