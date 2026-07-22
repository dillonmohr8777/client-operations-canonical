# VA Claims Phase 2 unblock packet

Verified: 2026-07-22

## Ready now

- The Phase 2 UI handoff package remains present under `deliverables/2026-07-17-phase-two-ui-handoff/`.
- `verify-package.ps1` passes all 45 assertions across 14 required files.
- Login, global design tokens, application shell, dashboard states, assets, integration map, developer checklist, and Obaid handoff draft are present.
- The package preserves the Supabase authentication boundary and labels review data as sample.

## Current access evidence

- GitHub fetch for `vaclaims-dev/vace-platform` returns 404 to the currently authenticated account. For a private repository this is consistent with missing access.
- The connected Vercel account returns zero teams, so no VA Claims project or deployment can be discovered or modified from this desktop.

## Exact unblock sequence

1. Add GitHub user `dillonmohr8777` to `vaclaims-dev/vace-platform` with branch creation and pull-request permissions.
2. Connect the Vercel team that owns the VA Claims Phase 2 application to Codex on this desktop, or perform deployment from Obaid's authorized environment.
3. Fetch the current default branch and inspect its `AGENTS.md`, package manifest, Supabase client export, middleware, login redirect, and Vercel project metadata.
4. Create a review branch; do not commit to the default branch.
5. Apply the handoff in the documented order and preserve framework directives and protected-route behavior.
6. Run the real repository's build, type check, lint, authentication success/failure, protected redirect, sign-out, mobile, keyboard, reduced-motion, and dashboard-state checks.
7. Deploy a review preview only, inspect its logs, and provide the clean diff and preview to Obaid.

## Completion rule

Do not mark the canonical item done from the standalone 45-assertion package check. Completion requires repository integration, real-project tests, and a review deployment or an accepted clean diff in the authorized repository.
