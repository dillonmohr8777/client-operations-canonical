# NeedMomentum website automation inventory

**Observed:** 2026-09-23 (America/New_York), read-only. **Scope:** NeedMomentum.com / Momentum Digital only; Momentum Virtual Tours remains a separate client surface. No scheduler, browser, Claude job, message, send, publish, spend, credential, or security change was made.

## Current state

The current `$CODEX_HOME` automation files are configuration, not execution receipts. The old Momentum `automation-audit.json` (observed 2026-09-13) also labels its rows `configuration_only`; its ACTIVE claims are stale because the current TOMLs below now say `PAUSED`. Use the current TOML and fresh run artifact together before changing anything.

| Existing ID | Current configured state | Exact purpose / reuse decision | Receipt state |
|---|---|---|---|
| `daily-momentum-semrush-opportunities` | `PAUSED`, heartbeat daily 09:00 ET until 2026-10-03, target thread `01a07eee-6261-7543-9f35-d3704d4475da` | Best existing scheduler ID to update into the single NeedMomentum watchdog coordinator. Its prompt already scopes Need Momentum read-only SEO research, dated artifacts, no publishing/sending, and no canonical queue mutation. Extend the prompt to call deterministic uptime/forms/SEO/AEO/performance/security probes and produce draft/stage bundles. Do not create a second scheduler. | No current run artifact in its automation directory; configured only. A historical owner receipt exists in the September 13 closeout, but it does not prove current execution. |
| `momentum-hubspot-day-pulse` | `PAUSED`, cron every 15 minutes, 07:00–19:45 ET, Luna low | Keep paused. It is a Momentum 360 HubSpot portal `50612503` read-only CRM pulse, not NeedMomentum WordPress health. Reusing it for website checks would mix account boundaries. | No current run artifact; configured only. |
| `momentum-hubspot-night-pulse` | `PAUSED`, cron hourly 20:00–06:00 ET, Luna low | Keep paused for the same portal/account boundary. | No current run artifact; configured only. |
| `weekly-client-marketing-reports` | `PAUSED`, heartbeat Mondays 10:00 ET, target thread `019fec0c-e044-7122-a575-0e62783ff0cf`, failed-runs-only | Keep separate. It is the existing draft-only client-report/dashboard workflow and explicitly warns against running beside `weekly-netlify-report-rebuild`. Do not make it a site watchdog or create a duplicate weekly report. | No fresh receipt found; configured only. |
| `weekly-netlify-report-rebuild` | `PAUSED`, cron Mondays 09:00 ET | Keep paused. Its prompt authorizes a production Netlify deploy and git push, outside the current draft/stage-only permission. | No fresh receipt found; configured only. |
| `momentum-radar-daily-12` | `PAUSED`, cron `0 5 * * *` | Keep separate. It is the prospect-site preview builder with a hard mail hold; it is not the NeedMomentum production watchdog. | No fresh receipt found; configured only. |
| `momentum-workshop-calendar-intake` | `PAUSED`, cron every 5 minutes, Terra medium | Keep paused. It can save guests and send organizer invitations; this is an external-send workflow, not website operations. | No fresh receipt found; configured only. |
| `daily-communications-brain` | `PAUSED`, cron daily 07:00 ET | Keep separate; generic communications intake, not a site health runner. The September 13 historical audit marked it ACTIVE, which is stale against the current TOML. | No current run artifact found. |
| `commitment-follow-through` | `ACTIVE`, heartbeat daily 09:00 and 17:00 ET, target thread `01a09653-e598-7251-9602-ec966f5f585e` | Keep separate. It scans owner commitments and has no NeedMomentum website source contract. | Historical successful scan evidence exists, but it is not a website receipt. |

### Actual Windows/runtime evidence

- `Momentum360-Daily-Agent-Health` is the only fresh Momentum scheduler readback: Windows task was `Ready`, last run `2026-09-23T09:00:01-04:00`, result `0`, next run `2026-09-24T09:00:00-04:00`. The fresh artifact is `projects/client-operations/clients/momentum-360/automation/daily-agent-health/output/momentum-daily-health-2026-09-23-090001-shadow-health.json`.
- That artifact says `LOCAL_SHADOW_HEALTH_PASS`, `liveDeliveryRequested=false`, `senderReachability=blocked-by-default-local-shadow`, task action omits `-LiveDelivery`, and there are 19 historical recorded Slack deliveries through `M360-DAILY-2026-09-01`. It proves the local shadow check and scheduler exit, not current provider health, WordPress state, Slack delivery, or a client outcome.
- `MOMENTUM-ORG-PLAN.md`, `STATUS.json`, and `STACK-CLOSEOUT-2026-09-13.md` agree that local Workmate/org checks passed, external activation/provider access remains separately gated, and no second organization-wide task system should be created.
- Current authenticated WordPress readback (the companion `BACKEND-BASELINE.md`) reports the active `Needmomentum Weekly Report` plugin v1.0.0 (oBz Services), automatic Monday 09:00 site-time reporting enabled, last label September 21 09:00, next September 28 09:00, and 13 update events. GA4 and WhatConverts are configured. This is plugin configuration/history; it is not a delivery receipt. Reuse and reconcile its native report/readback; do not create another weekly email/report scheduler.

## Reusable local probes and their limits

| Existing surface | What it really proves today | Use in the watchdog |
|---|---|---|
| `repos/dillon-os/_os/automation/bin/site-health.js` + `lib/sentinel.js` | Deterministic HTTP GET mode, fixture/static checks, and an optional form endpoint check. The registered `site-health-sentinel` command is `node .../site-health.js --dry-run`. | Extend `12_Brain/registry/properties.json` with NeedMomentum only after the exact approved public URLs/form endpoints are bound. Use live GETs only; never submit a real lead. |
| `repos/dillon-os/12_Brain/registry/properties.json` | Current properties are Ironic Ineptocracy, Mohr Media, IMMOHRTAL, and two fixtures. NeedMomentum is absent. | This is the missing property binding; without it, no claim of NeedMomentum uptime/form coverage is valid. |
| `Daily-Briefs/site-health-report.md` | Fresh 2026-09-23 report is a dry-run: one fixture passes, the broken-form fixture fails, and three live sites are explicitly skipped. | Treat as harness evidence only. It is not NeedMomentum evidence. `12_Brain/state/site-health.json` is currently missing despite historical `runs.jsonl` rows claiming that artifact. |
| `repos/dillon-os/_os/automation/bin/aeo-trust-gate.js` + `lib/aeo-trust.js` | Static per-preview checks for title/meta/canonical/H1/direct answer/FAQ/JSON-LD/images/contact/robots-AI access/internal links/placeholders. Latest state/report is the 2026-07-30 healthy fixture. | Run against a captured NeedMomentum page or approved staged bundle. A pass is necessary but does not prove visual QA, forms, publication, or production state. |
| `repos/dillon-os/_os/automation/lib/site-audit.js` + `site-grader.js` | Tier 0 GET and optional Tier 1 browser audit fields for HTTPS/redirects, HTTP status, response/load time, bytes/requests, mixed content, contact/forms, metadata/schema, images, mobile overflow, and performance score. | Use read-only measurements for performance/security/SEO drift; label Tier 0 scores provisional and never infer Core Web Vitals from them. |
| `repos/dillon-os/_os/automation/bin/cadence-watchdog.js` | Checks pushed cadence ledgers and stale repository state; it does not probe WordPress or a public site. | Use only as scheduler/receipt meta-health if needed; do not call it website health. |
| `repos/dillon-os/_os/automation/bin/connector-health.js` | Reads an MCP agent-written connector-health snapshot and fails closed when provider evidence is absent/stale/unread. It never contacts a provider. | Gate any analytics/report readback; configured credentials or plugin settings never clear this gate. |

## Smallest safe architecture

1. Update **only** `daily-momentum-semrush-opportunities` when the main agent is ready. Keep its existing target thread, lease/dedupe, client route, and draft-only boundary. The coordinator runs deterministic probes first, then writes one redacted dated receipt and one staged-fix bundle; unchanged runs stay quiet.
2. Backend lane: bind the exact public homepage, approved service/contact pages, robots/sitemap, and known form endpoint(s) to the existing site-health property. Check HTTP/TLS/redirects, page availability, form markup/endpoint presence, and report-plugin run history. No POST, WordPress mutation, plugin update, WAF change, or credential use.
3. SEO/AEO lane: run `site-audit`/`site-grader` on the GET snapshot and `aeo-trust-gate` on the same captured/staged HTML. Draft only concrete copy/meta/schema/internal-link/robots changes with source URL, observed timestamp, before hash, proposed after hash, and validation result.
4. Email/report lane: consume the existing Needmomentum Weekly Report plugin's dated native run/readback and stage corrections or email copy locally. Do not duplicate its Monday report or use `weekly-client-marketing-reports` as a second NeedMomentum sender. No Gmail send or Slack post.
5. Performance/security lane: record response/load/bytes/request measurements, HTTPS/mixed-content and available header checks, WordPress maintenance signals, and the known Site Health findings. Keep WordPress update, cache, firewall/WAF, DNS, SMTP, and access changes in approval queue; Aegis/DeerFlow remains the coordinator/receipt layer, not an implicit CMS permission.
6. Store source-linked local artifacts in the existing Momentum deliverables/run-output paths and surface a staged item through the canonical `client-operations/queue/work-items.json` writer. Do not invent a parallel queue. Every terminal receipt must distinguish `observed`, `drafted`, `staged`, `blocked`, and `published`; `published` requires an independent live readback and approval.

## Required gates before scheduler activation

- Fresh exact NeedMomentum URL/form binding and a safe read-only request plan.
- Native weekly-report run receipt reconciled to the plugin's configured schedule; configuration alone is insufficient.
- Before staging mutations or live release, verify staging isolation, backup/restore, release owner and rollback. These are not blockers to a public GET-only monitor. No auto-updates or production writes.
- Independent receipt verification for every staged artifact, with no raw credentials, lead PII, or visitor identifiers in the queue/report.
- Preserve current permission boundary: scheduled monitoring and local draft/stage fixes may run automatically; sends, publishing, spending, security/access changes, destructive changes, and client/Mac messaging remain approval-gated.

**Recommendation:** reuse `daily-momentum-semrush-opportunities` as the one coordinator and reuse the deterministic dillon-os probes above. Keep all other existing IDs in their current states; especially do not activate `weekly-netlify-report-rebuild`, `momentum-workshop-calendar-intake`, or any live-delivery branch. No new automation is justified by the inventory.

