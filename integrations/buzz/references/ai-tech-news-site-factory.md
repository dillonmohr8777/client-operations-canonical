# AI Tech News 25-Site Factory

## Canonical route

- Client: `momentum-360`
- Program: `AI Tech News` / `AI Site Builder Outreach Engine`
- Cadence: one batch of 25 prospect sites per week
- Source repository: `https://github.com/dillonmohr8777/dillon-os`
- Merged implementation: `https://github.com/dillonmohr8777/dillon-os/pull/226`
- Canonical merge commit: `a2d99ad7385bfb800564ea8ad9ec9b065f7dd38f`
- Verified local checkout: `C:\Users\dillo\Documents\Codex\2026-07-29\monitor-this-session-on-cursor-i\work\pr226-site-factory`

The verified local checkout and `origin/main` have the same Git tree,
`67ce979db5c3a6a83ccb5ce707469489a96598f2`. Refresh the remote and verify a
clean worktree before production use.

## Operating source

Read these files before running or changing the factory:

1. `AGENTS.md`
2. `.claude/skills/site-batch/SKILL.md`
3. `.claude/skills/site-factory/SKILL.md`
4. `philly-sites/DESIGN-SYSTEM.md`
5. `02_Campaigns/AI Site Builder Outreach Engine/Batch Runbook.md`
6. `02_Campaigns/AI Site Builder Outreach Engine/Pipeline Spec.md`
7. `_templates/site-factory/README.md`

The implementation lives in `_templates/site-factory/`. The weekly runner is
`build-batch.js`; the individual builder is `build-site.js`; `harvest.js`
collects reference evidence; `qa.js` performs static and Playwright visual QA.

## Agent contract

- Marketing Chief owns client routing, canonical queue state, and approval
  state.
- Evidence and Research verifies prospect identity and business facts.
- Content and Creative converts verified harvest evidence into bounded briefs.
- Web and Product owns harvesting, brief implementation, batch generation,
  responsive QA, accessibility, performance, and the review hub.
- Independent Verifier must be a different identity from the maker and must
  review the hashed walkthrough plus desktop and mobile evidence.
- Watchtower reports stalled batches, failed gates, stale evidence, and runtime
  failures.

The orchestrator may process at most three independent worker turns in
parallel. Handoffs must include `workflow_id`, `step_id`, `task`,
`constraints`, `upstream_artifacts`, `budget_tokens`, and `timeout_seconds`.
Retries are bounded and all quality and delivery gates fail closed.

## Non-negotiable gates

- Production batch size is exactly 25. `--allow-partial` is test-only.
- Every prospect demo remains `noindex`.
- Facts must come from the verified harvest or an attributed first-party
  source. Unverifiable fields stay empty.
- Full QA requires static checks plus Playwright desktop, tablet, and mobile
  evidence. Static-only is not a pass.
- Duplicate imagery is blocked across the batch.
- A hashed walkthrough and a different independent checker are required.
- Generated `mail_ready` always remains `hold`.
- Deployment, prospect outreach, mail activation, spend, and live account
  changes retain their exact approval gates.

## Current activation gaps

The site factory and its quality gate are implemented and tested. Production
activation still requires:

- the approved weekly market and one or two verticals;
- the exact prospect source and Google Maps/Places account route;
- the shared prospect database destination;
- an exact mapped hosting target with available capacity;
- the form, analytics, and booking destinations;
- the approved outreach owner, mail vendor, sender/compliance configuration,
  and exact delivery approval.

These gaps do not block local research, harvesting, brief creation, site
generation, QA, or preparation of a private review package.
