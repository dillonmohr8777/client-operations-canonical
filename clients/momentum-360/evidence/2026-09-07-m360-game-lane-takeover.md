# M360 game lane — Cursor takeover receipt, 2026-09-07

Client: `momentum-360` (registry route active). Tree: `clients/momentum-360/work/philadelphia-service-world`
(the Philadelphia service world — Mac and Sean's walkable city; not the `grand-theft-bureaucracy` / `philly-game`
runtime, which is a different project with different characters).

Trigger: Dillon's "make m360 active again, take over", against the stalled Claude cloud session "M360 video game",
whose Monday-to-Friday plan was (1) put the tree under git, (2) name the facade shader's inline magic numbers,
(3) turn the fixed-coordinate capture script into a diff, (4) make the draw-call budget a test, then integrate,
disclose and deploy. Items 1-4 are done on a lane branch. Nothing was deployed, sent, published or merged.

## What exists now

The world tree is its own git repository (the parent `client-operations` ignores `work/`; the tree's own
`.gitignore` excludes `assets/`, `evidence/`, `deliverables/`, `artifacts/`, `node_modules/`, `dist/`, `.env*`).
It was baselined earlier today by the "Philadelphia 3D game unify" lane as `72cbee7` on `main`. This lane's work
is on `lane/m360-game-hardening`, four commits on top of that baseline, no remote:

| Commit | What |
| --- | --- |
| `f348185` | `tools/check-visual.mjs` + `tools/lib/walk-harness.mjs` + `tools/visual-baselines/` (5 PNG references + manifest). New QA knob `?traffic=0`. |
| `c111f31` | `tools/check-budget.mjs` + `tools/budgets.json` (draw calls / triangles for 5 scenes, measured + 8 calls / +10 % tris). |
| `4f10e2d` | `src/city/facade.ts`: 38 inline literals → exported `FACADE_PARAMS`, compiled to GLSL consts; `tools/check-facade-params.mjs` source guard. |
| `7b9f78a` | README: the guards, the QA knobs, and the lane/branch rules for this tree. |

## Verification (all against a hidden loopback preview of `dist/`, hardware D3D11 Chrome, Intel UHD 630)

- Visual guard, unmodified shader, three consecutive compare runs: five poses at max delta ≤ 1/255, 0.000 % drift.
- Visual guard, refactored shader vs pre-refactor references: five poses, max delta ≤ 1/255 — pixel-identical.
- Negative test: `floorHeight` 3.3 → 3.6 drifted 3.3 % (start) and 8.4 % (market-st); both FAILED as intended,
  then reverted.
- Budget guard: 5/5 scenes within budget before and after the refactor (73/77/82 desktop calls, 60/59 mobile calls).
- `npm run build` (tsc + vite) clean.
- Full `tools/check-walk.mjs` suite, run twice: 21/22 pass both times. The one failure is the mobile-start
  `≥30 fps` assertion, at 28 fps and then 27 fps on this iGPU host. To rule out a regression, the baseline build
  (`main` = `72cbee7`, no lane code) was rebuilt and measured at the same pose with the lane's budget tool: 28 fps,
  60 calls, 176k triangles — identical calls and triangles to the lane build. Host GPU load today, not this lane.
  The 21 functional checks (collision, quests, HUD, night, traffic, keyboard-only route, touch) all pass.

## Open questions from the Claude plan — status

1. What winning looks like; 2. whether Mac and Sean stay silent; 3. whether Mac and Sean approve the script before
   it ships — **human decisions, still Dillon's**; nothing here presumes them. Silent Mac/Sean behaviour is preserved
   as-is (`AGENTS.md` of the tree).
4. "Do Fable and Astra work in this repo directly, or against a branch?" — **branch**, now written into the tree's
   README: `main` is integration only, one `lane/<what>` branch per lane, read-only reviewers take no branch,
   Dillon takes every merge.

## Not done / needs Dillon

- No git remote for the world tree. Creating a GitHub repository is an account change; destination is Dillon's call.
- No off-device backup of the hand-corrected Blender sources under `assets/` (flagged by both lanes).
- No deploy. The Friday "integration, harness, disclosure, deploy" step is unstarted; standing Netlify approval
  covers only the mapped site `5949b7f5-…` and only for a completed deliverable at verified scope.
- The Claude cloud session itself was not messaged or closed.

Canonical queue not written (no work item exists for this lane; Marketing Chief owns that decision).
