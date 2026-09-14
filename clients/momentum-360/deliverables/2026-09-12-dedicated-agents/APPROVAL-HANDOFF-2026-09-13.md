# Momentum 360 pilot and organization approval handoff

Date: September 13, 2026  
State: LOCAL IMPLEMENTATION VERIFIED; EXTERNAL ACTIVATION PENDING

## Decision requested

Approve one narrow external step: install and validate one Momentum Workmate app in team `T066HGS7N`, then authorize exactly one synthetic Slack post and readback in `#360leads` (`C05R2B1ULF6`). This does not authorize normal dispatch, Zap edits or publication, CRM writes, client messaging, or paid model/API spend.

## What is ready

- One governed runtime with five named modes: Jason lead desk first; Sean operations; Mac revenue/reporting; Melissa Silber marketing production; Melissa Rigby delivery. All remain local shadow modes until their own acceptance evidence exists.
- Local checks were rerun from this package: replay 22, lead adapter 46, restricted receiver 51, controlled sender 13, and five-mode runtime 36. Total: 168 passing checks, with no network or outbound effects.
- Current scheduler readback: `Momentum360-Daily-Agent-Health` is `Ready`; last run September 13 at 1:08:33 PM ET, result `0`; next run September 14 at 9:00 AM ET. The latest receipt is `automation/daily-agent-health/output/momentum-daily-health-2026-09-13-130833-shadow-health.json`, state `LOCAL_SHADOW_HEALTH_PASS`, `liveDeliveryRequested: false`.
- Current status records zero business fixes, deployed Slack agents, new Slack messages, paid model runs, and external action attempts. The package contains 11 staged owner packets.

## Exact first pilot

1. Validate the draft manifest in `slack-app-manifest.draft.json` with only `app_mentions:read`, `channels:history`, and `chat:write`.
2. Store the bot and Socket Mode tokens outside the repository. Read back the installed app ID and bot user ID in team `T066HGS7N`; the team, channel, and approved human IDs are already read back, but app and bot IDs are not.
3. Review `lead-agent/run/controlled-test-message.txt` as the exact payload. It is synthetic and must not use a live lead.
4. Create a separate short-lived approval JSON with the exact message hash, real bot ID, approver, and expiry. Keep `lead-agent/run/controlled-test-approval.template.json` false and unpopulated until that human approval exists.
5. Post once, read back exact timestamp/text/bot identity, then exercise exact retry, distinct second inquiry, wrong-channel/team rejection, stop, and uncertain-send reconciliation. Record provider ID -> CRM ID -> Slack timestamp where a real inquiry is later approved.

## Separate repair gate

Zap `365085675` remains ON with its existing unpublished draft preserved. `zap-repair-review-2026-09-13.md` specifies adding `utm_source`, `utm_campaign`, and `hubspot_owner_id`, using `Unknown` fallbacks, validating the portal `50612503` contact URL, and holding missing IDs. Zap `379667050`'s future-only `Facebok` -> `facebook` correction is separate. Neither Zap was edited, tested, replayed, or published.

## Source of truth and limits

Use `STATUS.json` and `STACK-CLOSEOUT-2026-09-13.md` for the current state, plus the scheduler and dated receipt readback above. `WEEKEND-STACK-CLOSEOUT-2026-09-13.md` and the historical section of `QA.md` retain an earlier disabled-task observation; that is not the current scheduler state. No broad Slack rescan, new live-lead action, Workmate installation, message send, CRM mutation, or provider activation occurred in this package. Existing redacted/read-only provider linkage evidence is historical and does not authorize the new Workmate path.

Canonical detail remains in [MOMENTUM-ORG-PLAN.md](MOMENTUM-ORG-PLAN.md), [ACTIVATION.md](ACTIVATION.md), [lead-agent/APPROVED-TEST.md](lead-agent/APPROVED-TEST.md), [STACK-CLOSEOUT-2026-09-13.md](STACK-CLOSEOUT-2026-09-13.md), and [zap-repair-review-2026-09-13.md](zap-repair-review-2026-09-13.md).
