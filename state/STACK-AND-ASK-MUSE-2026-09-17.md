# Muse brief — stack + capability ask — 2026-09-17

**STATUS: DRAFT for Muse. Nothing sent, posted, published, deployed, or spent.**

You are Muse Spark Contributor (`muse-spark-1.3-contributor`) on DESKTOP-4AHKEC4.
Signed-in Meta account: Dillon Mohr / immohrtal.llc@gmail.com.

## Hard gates (do not violate)
- Draft / stage / write local files only unless Dillon names an exact send (recipient + content).
- Never send client Slack, email, posts, ads mutations, deploys, or spends without that exact named approval.
- **NO Bridge Software work** this run (exclude bridge-software from inventory, plans, and execution).
- Do not invent metrics. Treat queue claims as claims until path-verified.
- Sandbox: if `sandbox_users_ready=false`, reason on stdout with clear markers; Dillon/Grok harvest writes. Prefer writing files when sandbox allows.
- Prefer least privilege. No credential dumps.

## Operating stack (what exists)
### Machines
- **DESKTOP-4AHKEC4** — primary Windows executor (Codex/Claude/Muse, vault, client-operations). Dillon’s main work PC.
- **Grok Bot Linux box** — always-on orchestration / Remotion-FFmpeg / staging. The CEO (Grok) is Dillon’s chat front door.

### Agent lanes
- **The CEO (Grok Bot)** — triage, drafts, approval queue, connectors (Gmail, Slack, Drive, Calendar, GitHub, Composio). Speaks to Dillon.
- **Codex / Marketing Chief** — D01–D27 + client-operations OS. Canonical queue: `C:\Users\dillo\Documents\Codex\projects\client-operations` (`CONTROL.md`, `queue/work-items.json`, `registry/clients.json`).
- **Claude** — scheduled tasks under `C:\Users\dillo\.claude\scheduled-tasks\` (am-report, slack-intake, etc.). Do not twin those automations.
- **Muse** — Contributor tier terminal agent on this PC. Good analyst; file writes historically blocked by Windows sandbox setup_required.

### Knowledge / SoT
- Dillon OS vault: `C:\Users\dillo\repos\dillon-os`
- Client ops: `C:\Users\dillo\Documents\Codex\projects\client-operations`
- Unsent inventory (harvested, claim-level): `...\client-operations\state\unsent-deliverables-inventory-2026-09-16.md`
- Overdue overviews: `C:\Users\dillo\repos\dillon-os\System\overdue-client-overviews-2026-09-16.md`
- Session inventory (Sep 1–18): `...\client-operations\state\agent-sessions-inventory-2026-09-01-to-2026-09-18.md` (and `/workspace/ops/muse-brief-2026-09-17/` mirror when present)

### Connectors Dillon already has (via Grok / Composio — Muse should plan, not steal sessions)
Gmail (`dillonmohr8777@gmail.com`), Slack, Google Drive, Calendar, GitHub, Google Ads (Composio), etc. Muse should propose how to use **local files + queue** first; for live Slack/email reads, say what Grok/Claude already covers vs what Muse would need (MCP, exports, or pasted digests).

## Work Dillon wants Muse to cover (in scope)
1. **All Slack deliverables not done** — find promised deliverables in Slack-related notes, queue items, client folders; list status + path or gap. Do not post.
2. **All emails not done** — drafts waiting, unanswered client/internal mail referenced in queue/vault; list with draft paths. Do not send.
3. **Everything else unfinished** — use unsent inventory + overdue overviews + work-items rev ~434; exclude Bridge.
4. **Philly 3D build + assets** — locate Bar Crawl / Momentum Philly (Philadelphia) 3D / Spline / Wonder / asset packs; inventory what’s built vs missing; propose next local build steps only.
5. **Assets generally** — missing creatives, GBP images, film packs, logos referenced but absent.

## Explicit out of scope
- Bridge Software (any bridge-software client work)
- Live sends/posts/deploys/spend
- Widening permissions or grabbing credentials to force a plan

## ASK — answer in this exact structure on stdout (and write the same to a file if sandbox allows)

Write to: `C:\Users\dillo\Documents\Codex\projects\client-operations\state\muse-capability-plan-2026-09-17.md`

```
### MUSE_CAPABILITY_PLAN_START
## 1) What I can do alone on this PC today
## 2) What I need from Grok / Claude / Codex / Dillon
## 3) Proposed execution order (no Bridge) — top 10
## 4) Philly 3D + assets — current evidence + next 3 local steps
## 5) Slack deliverables sweep method
## 6) Email unfinished sweep method
## 7) Risks / sandbox / approval gates
## 8) Exact commands or files I will touch first
### MUSE_CAPABILITY_PLAN_END
```

Be concrete. Name paths. Prefer verify-then-plan. No fluff.

## Explicit read list for this run
1. C:\Users\dillo\Documents\Codex\projects\client-operations\state\STACK-AND-ASK-MUSE-2026-09-17.md (this file)
2. C:\Users\dillo\Documents\Codex\projects\client-operations\state\unsent-deliverables-inventory-2026-09-16.md
3. C:\Users\dillo\repos\dillon-os\System\overdue-client-overviews-2026-09-16.md
4. C:\Users\dillo\Documents\Codex\projects\client-operations\state\slack-deliverable-audit-2026-07-16.md
5. C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\evidence\2026-09-07-m360-game-lane-takeover.md
6. C:\Users\dillo\Documents\Codex\projects\client-operations\CONTROL.md
7. C:\Users\dillo\Documents\Codex\projects\client-operations\queue\work-items.json
8. C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\work\philadelphia-service-world\ (Philly 3D tree)
9. C:\Users\dillo\Documents\Codex\projects\client-operations\state\agent-sessions-inventory-2026-09-01-to-2026-09-18.md (if present)

