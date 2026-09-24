# Muse capability plan — 2026-09-17

**STATUS: DRAFT. Nothing sent, posted, published, deployed, or spent. NO Bridge Software work in this plan.**

Identity: Muse Spark Contributor (`muse-spark-1.3-contributor`) on DESKTOP-4AHKEC4.
Basis: `state/STACK-AND-ASK-MUSE-2026-09-17.md` + all Explicit-read paths below. Queue claims treated as claims until path-verified.

Explicit reads — disposition:
- `state/STACK-AND-ASK-MUSE-2026-09-17.md` — read (this brief).
- `state/unsent-deliverables-inventory-2026-09-16.md` — read. Claim-level harvest, NOT line-by-line verified. Used as suspect list only.
- `System/overdue-client-overviews-2026-09-16.md` (vault) — read. Claim-level; shell was down for its author too, no git mtimes.
- `state/slack-deliverable-audit-2026-07-16.md` — read. Stale (~2 months); usable as baseline, not current state.
- `clients/momentum-360/evidence/2026-09-07-m360-game-lane-takeover.md` — read. Philly world-tree receipt.
- `CONTROL.md` — read (queue rev 434 projection, commitment queue + Waiting-on-Dillon sections).
- `queue/work-items.json` — verified `revision: 434` (line 3); bridge-software items present in file but EXCLUDED from this plan. Full per-item re-read not done; statuses below come from CONTROL.md projection + the two claim-level inventories.
- `clients/momentum-360/work/philadelphia-service-world/` — tree verified present via file search: `src/city/`, `src/game/`, `src/map/`, `tools/` (check-walk, check-facade-params, bake_city, founder_collateral_render, record-portrait-provenance), `dist/`, `assets/founder-collateral/`, `assets/launch-reset-20260906/hyperframes/`, `evidence/`. Full built-vs-missing inventory NOT yet done — proposed below.
- `state/agent-sessions-inventory-2026-09-01-to-2026-09-18.md` — NOT PRESENT in `state/` (searched; only the brief references the name). Treated as missing; mirror at `/workspace/ops/muse-brief-2026-09-17/` not checked (outside readable scope this run). Plan does not depend on it.

### MUSE_CAPABILITY_PLAN_START
## 1) What I can do alone on this PC today
- Read-only sweep: `read_file` + `search` over `queue/work-items.json`, `CONTROL.md`, `registry/clients.json`, client folders, `state/` inventories. Cross-reference promised deliverables vs files on disk (path or gap per item).
- Draft local files only: Markdown review packets, status tables, checklists under `state/` (e.g. this file) or client `deliverables/` staging paths. No sends, no queue/CONTROL/ledger mutations (Marketing Chief is the only canonical writer).
- Philly tree read-only inventory: open `src/`, `tools/`, `evidence/`, `assets/` files; compare against the 2026-09-07 takeover receipt; record built-vs-missing in a local table.
- Redacted summaries with safe locators only. No raw message bodies, no credentials, no PII beyond what is already canonical.
- Sandbox reality this run: PowerShell execution failed with `setup_required` (`sandbox_users_ready=false`) — same condition the 2026-09-16 harvest reported. So: NO shell commands, no `npm run build`, no git checks from me. File writes attempted via the file tool; if the write fails, Dillon/Grok harvests this stdout. I reason on stdout with clear markers either way.

## 2) What I need from Grok / Claude / Codex / Dillon
- Grok (CEO connectors): live Slack/Email reads I cannot do. Need redacted digests with exact channel + timestamp locators for: Bar Crawl pause thread (Andy Zirger 2026-08-04), Fagan 2-lead dispositions, NKCDC + VA-claims stakeholder replies (if any since 2026-07-16 audit), BigOrange interview response. I plan from digests; I never touch sessions.
- Claude: outputs of scheduled tasks (`C:\Users\dillo\.claude\scheduled-tasks\` — am-report, slack-intake) as read-only context. I will not twin or duplicate those automations.
- Codex / Marketing Chief: all canonical mutations (new work items, promotions, CONTROL.md regen, ledger appends), plus verdicts on any handoff I stage. My drafts arrive as files + stdout; the Chief decides.
- Dillon (human-only decisions, one at a time): (a) Bar Crawl pause-reply wording + recipient approval; (b) Replenish→Mia exact PDF attachment + recipient approval (`wi-20260728-0001`); (c) Hope return-to-window yes/no (`wi-20260715-0001` stays deferred until explicit); (d) BigOrange staging/invoice/payment-timing approvals (`wi-20260718-0001`); (e) Philly world-tree remote destination + Blender-source backup destination (account changes — Dillon's call per takeover receipt).

## 3) Proposed execution order (no Bridge) — top 10
Draft-only; each ends in a local file, never an external action.
1. Bar Crawl pause reply DRAFT (overdue 64d, churn risk; overdue-overview #1). Source: Grok digest of Zirger 2026-08-04 thread. Output: `state/` draft reply + approval preview. No send.
2. Fagan 2-lead disposition verification sheet (`wi-20260715-0002` blocked P0 + slack-audit open #1). Read-only check plan against approved mailbox/CRM/Zapier record; record outcome per exact canonical record. No prospect contact.
3. Replenish→Mia approval packet (`wi-20260728-0001` needs-approval P0). Stage exact PDF path + exact recipient + chargeback/credit/budget-ceiling checklist. No send until Dillon approves attachment + recipient.
4. Hope package staged for return-to-window review (`wi-20260715-0001` deferred P0). Confirm on disk: `clients/hope-wellness-center/deliverables/2026-07-15-hope-wellness-deeper-analysis.pdf`, `...-implementation-queue.csv`, reel `C:\Users\dillo\Downloads\hope-wellness-60s-brand-reel-v2.mp4`. No delivery, no release of P0 queue.
5. BigOrange gate checklist (`wi-20260718-0001` blocked, due 2026-08-10). Assemble Janice SME review, Moz/Semrush validation, staging access, invoice timing — each verified-or-open. No publish, no invoice action.
6. Tags 2 Go access-mapping prep (`wi-20260807-0001` blocked). Local redacted baseline shell only; no rebuild before access mapping (per overdue triage).
7. Align HubSpot Customer Agent verification evidence assembly (`wi-20260723-0005` verification). Local acceptance checklist from existing evidence; no live-agent change, no production touch.
8. Momentum caller auto-response test readiness (`wi-20260718-0003` verification). Pre-stage controlled-call script + evidence template only; no calls placed (after-22:00 controlled procedure + approvals required).
9. NKCDC / VA-claims stakeholder-review watchlist (slack-audit opens #3–4; both delivered, awaiting review). Tracking table only — no resend, no revision without feedback.
10. Done-but-unaccepted review staging: Revive 5-blog pack (`wi-20260717-0006` + manifest `clients/revive-systems/deliverables/2026-07-16-aeo-geo-seo-blog-cluster/01-completion-manifest.md`), KJB measurement packet (`wi-20260716-0005`), Align August production QA (`wi-20260723-0004`). Local review manifests for Dillon accept/revise; nothing delivered.

## 4) Philly 3D + assets — current evidence + next 3 local steps
Current evidence (from 2026-09-07 receipt + live tree search this run):
- Tree `clients/momentum-360/work/philadelphia-service-world/` exists with `src/`, `tools/`, `dist/`, `assets/`, `evidence/`. Separate world from the `grand-theft-bureaucracy`/`philly-game` runtime — do not conflate.
- Lane `lane/m360-game-hardening`: 4 commits over baseline `72cbee7` (visual guard + `?traffic=0` knob; budget guard + `tools/budgets.json`; `FACADE_PARAMS` refactor + source guard; README lane rules). No remote. Nothing deployed/sent/merged.
- QA per receipt: visual guard pixel-identical (≤1/255), negative test fails-as-intended, budget 5/5 within, `npm run build` clean, walk suite 21/22 (mobile-start fps 27–28 on Intel UHD 630 iGPU; baseline identical — host GPU load, not a regression).
- Open per receipt: no GitHub remote (account change), no off-device backup of hand-corrected Blender sources under `assets/`, no deploy (Friday integration step unstarted; standing Netlify approval covers only mapped site `5949b7f5-…`), Claude cloud session not messaged/closed. No queue work item exists for the lane.
- Asset packs visible but un inventoried: `assets/founder-collateral/` (Remotion sources), `assets/launch-reset-20260906/hyperframes/` (16×9 + 9×16 sets + references), `evidence/` subtrees (claude-street-look, deepseek-night, founder-collateral, frozen-release, immersive-city, sean-likeness).
Next 3 local steps (read-only, no build — sandbox down):
1. Verify receipt vs disk: open tree `README`, `tools/check-walk.mjs`, `tools/check-budget.mjs` (if present), `tools/budgets.json`, `tools/visual-baselines/` manifest, `src/city/facade.ts` (`FACADE_PARAMS`) and record match/mismatch per commit claim.
2. Asset built-vs-missing table: walk `assets/` (Blender sources, founder-collateral, hyperframes sets) + `evidence/` logs; per pack record present / partial / absent + path.
3. Stage (not run) the local build/verify command card for Grok harvest: `npm run build`, walk/budget/visual guard invocations, and the two Dillon decisions gating anything further (remote destination, Blender backup destination).

## 5) Slack deliverables sweep method
- Baseline: `state/slack-deliverable-audit-2026-07-16.md` (48 channels, newest-100 each, 17 threads expanded). Treat as stale baseline — statuses valid as of 2026-07-16 only.
- Delta pass (mine, local): for each audit-open item (360ops logistics, design-social-email reels, hope templates/LSA/prep-email, gmbs callback, outbound collab, fagan dispositions, nkcdc/va-claims stakeholder reviews, revive routing), search `queue/work-items.json` for exact `source.locator`/`evidence.refs` equality and check the referenced client-folder artifact path on disk. One row per promise: promised / proven-delivered + path / still-open + gap.
- Freshness (Grok): request redacted per-channel digests with channel + timestamp locators for the ~10 channels with opens; never raw bodies. I reconcile digests into the table; I do not post, reply, or mark anything complete.
- Exclusions: bridge-software-development channel skipped entirely (out of scope). revive-systems rows stay routing-blocked (`needs-confirmation`) regardless of Slack content.

## 6) Email unfinished sweep method
- Mine (local): search queue + client folders for Gmail-evidence references and `*draft*`, `*reply-draft*`, `*readiness*`, `*handoff*` artifacts; list each with draft path + owning work item + gate (waiting Dillon approval vs waiting stakeholder vs blocked on access). Candidates from the unsent inventory (claim-level): Hope package, Replenish→Mia PDF, Revive blogs/response draft, Align August package, KJB measurement packet, VA-claims meeting-readiness packet (`wi-20260820-0001`).
- Freshness (Grok/Claude): unanswered-client/internal mail since 2026-09-16 via redacted digest (sender reference + date + subject-line-level topic + locator); I match digests to exact-routed work items before proposing any draft.
- Rule: drafts are staged, never sent. Any item whose next step is external delivery gets the approval-gated class and a preview (exact recipient + exact attachment), not a send.

## 7) Risks / sandbox / approval gates
- Sandbox: `sandbox_users_ready=false` observed this run (PowerShell `setup_required`; same as 2026-09-16). Impact: no shell, no builds, no tests, no git checks from Muse. Mitigation: verify-then-plan from `read_file`/`search` only; stage shell cards for Grok; mark every figure path-verified vs claim-level.
- Staleness: unsent inventory + overdue overviews are self-declared claim-level (no line-by-line verification); slack audit is 2 months old; CONTROL.md projection is 2026-09-01 (rev 434). Nothing here is asserted as current live state.
- Approval gates (no exceptions): external delivery, publishing, deployment, spend, account changes (incl. GitHub remote for Philly tree), destructive actions, and human-auth steps require Dillon's exact approval (recipient + content + scope). Queue/CONTROL/ledger writes are Marketing Chief only.
- Routing: `needs-confirmation` clients (revive-systems) stay quarantined; Replenish is `status: paused` (not actionable); Fagan paid-media excluded unless Dillon reactivates via roster change. Bridge excluded everywhere.
- Secrets: redacted summaries + locators only; Access Broker/Bitwarden references by locator, raw values never in files or stdout.

## 8) Exact commands or files I will touch first
Files to open (read-only, in order):
1. `queue/work-items.json` — per-item reads for the top-10 IDs above (status, evidence.refs, nextAction).
2. `registry/clients.json` — resolve every client route before drafting (active vs needs-confirmation vs paused).
3. `clients/momentum-360/work/philadelphia-service-world/README` + `tools/budgets.json` + `tools/visual-baselines/` manifest + `src/city/facade.ts` — Philly step 1.
4. `clients/hope-wellness-center/deliverables/` + `clients/revive-systems/deliverables/2026-07-16-aeo-geo-seo-blog-cluster/01-completion-manifest.md` — Hope/Revive staging.
5. `clients/replenish-7-eleven/` evidence for `wi-20260728-0001` PDF path confirmation.
Shell cards staged for Grok/harvest (NOT run by me — sandbox down):
- `git -C clients/momentum-360/work/philadelphia-service-world status --short --branch` (remote/state check)
- `npm run build` in the Philly tree (verify-only)
- `Test-SecondBrain.ps1` equivalent vault-health check before relying on overdue triage as current
First writes (draft only): this plan file; then `state/slack-deliverable-delta-2026-09-17.md` (sweep table), `state/email-unfinished-sweep-2026-09-17.md`, `state/philly-asset-inventory-2026-09-17.md`.
### MUSE_CAPABILITY_PLAN_END
