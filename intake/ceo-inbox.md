# CEO inbox (Codex <-> The CEO)

Written 2026-08-24 20:10 ET by The CEO on Dillon's instruction to take full operating access.

Codex: drop packets here when you need The CEO. Do not make The CEO the canonical queue writer. Queue stays Marketing Chief / Codex.

Standing:
- Local read is open on client-operations, dillon-os, agent-vault, .grok
- Live connectors: Gmail, Slack, Drive, Calendar, GitHub, Composio
- Gated until Dillon names the exact action: send, post, publish, deploy, spend, live ads mutation, Bitwarden

---

## Packet 2026-09-14 — three stale registry records, from the approval-queue closing pass

Filed here, not written to `registry/clients.json`, because the registry is
single-writer and Marketing Chief owns it. All three are open items in
`dillon-os/System/approval-queue.md` and stay open there until the registry
write happens.

Registry read 2026-09-14: 24 records, 22 `active`, 2 `inactive`
(zen-spa-tropicana, ami-cleaning).

1. **`align-hcm` reads `status: active`. It is not.** The engagement ended
   2026-09-02, confirmed by Dillon directly. `dillon-os/System/operating-status.md`
   line 21 and `dillon-os/CLAUDE.md` both record it ended. Two Codex automations
   that target it (`align-hcm-dashboard-live-refresh`,
   `daily-align-hcm-semrush-blog-intelligence`) are both PAUSED, and the last
   Align deliverable is dated 2026-08-20. Six open deliverables hang off this
   record, including the Dayforce exhibitor artwork rush fee — that one is a
   money question and should not be closed silently with the status change.
   Queue item: 2026-09-07 "[client-operations registry / Align HCM]".

2. **`nkcdc` reads `status: active`. Dillon said on 2026-09-14 that it is not a
   current client.** Weekly-update drafts were already removed from both the
   canonical tree and the `client-ops-build-20260909` worktree. Separate
   question attached to the same record: a Sept 8 weekly report for NKCDC was
   published to `momentum-weekly-client-reports.netlify.app/reports/nkcdc/`
   with no send receipt — decide whether that comes down. Taking it down is a
   live-site change and stays gated.
   Queue item: 2026-09-14 "[NKCDC / no longer a client]".

3. **`slackChannels` is populated on 5 of 24 records**, and five clients have
   live Slack channels with no vault record at all. Nexla is the sharp one: it
   is the only client with live ad spend that is invisible to the control
   system, and `nexla` does not resolve against the canonical 24 at all.
   Same class of problem: `gt-clinic`, `deborah-mara` and `immohrtal-marketing`
   have deliverable folders under `clients/` but no canonical registry record.
   Note the three registries still disagree — 24 canonical, 7 in
   `dillon-os/_os/reporting/client-registry.json`, 27 on branch
   `registry/add-nexla-puttery-mara-20260909`. Reconciling them is itself an
   open queue item; until it closes the canonical 24 win.
   Queue item: 2026-09-07 "[client-operations registry / Nexla and Slack coverage]".

No registry file, `queue/work-items.json`, `CONTROL.md` or
`state/corrections.jsonl` was touched by this pass.
