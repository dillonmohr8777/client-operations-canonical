# Muse finish brief — Momo assets + Philly 3D (Mac & Sean) — 2026-09-17

**STATUS: DRAFT/STAGE ONLY. Nothing sent, posted, published, deployed, or spent.**

## Goal
Finish what Claude left open for Momentum creative + put Mac Frederick and Sean Boyle (as 3D avatars) into the living world, with Momo character/film assets completed where local work remains.

## Hard gates
- NEVER email/Slack/DM Mac Frederick (or Sean). No client contact.
- No Netlify --prod. No public publish. Draft Netlify only if Dillon later names it.
- No new paid Higgsfield / Seedance / inference spend unless Dillon already named an exact credit budget in chat. If a paid job is required, STOP and write the exact job card + estimated credits into the run report.
- No Bridge Software work.
- Prefer lane branch `lane/muse-momo-philly-finish` off current HEAD in the Philly tree; do not merge to main.
- If Windows sandbox blocks shell (`setup_required`), do all file reads/writes via Muse file tools; print shell command cards for Grok/Dillon.

## Two workstreams

### A) Claude assets from yesterday (2026-09-16) — AI Division launch kit
Root: `clients\momentum-360\deliverables\2026-09-05-ai-division-launch-kit\`
Read first: `DECISION-BRIEF-2026-09-16.md`, `pending-decisions.json`, `README.md`, `video/FOUNDER-INTROS.md`, `video/DISPATCH` sibling `DISPATCH-PROMPT.md`, `video/founders/references/PROVENANCE.json`, `DRAFT-message-to-mac-LOCAL-ONLY.md` (keep local only).

Finish locally without paid gen:
1. Inventory `video/` — what founder MP4s exist in `video/out/` vs missing M01/S01/MS01.
2. Verify title cards / composite pipeline still runnable (`video/cards/`, `composite.ps1`).
3. Write `video/FINISH-STATUS-2026-09-17.md` with built vs missing + exact next commands.
4. Momo film lane (separate folder): `deliverables\2026-09-08-claude-design-exports\` — note original-five COMPLETE for local review; flag remaining outside-receipt batches (Atomic Assembly / Clear the Noise / Hours Return / Break the Frame / System Awake) and any FAIL QA (character-momo 9x16 settled-frame). Produce a local repair checklist only.

### B) Philly 3D world — Mac & Sean inside the world (and Momo where applicable)
Root: `clients\momentum-360\work\philadelphia-service-world\`
Public baseline: https://momentum-philadelphia-world.netlify.app/
Read: `README.md`, `AGENTS.md`, `evidence\2026-09-07` takeover receipt (parent), `evidence\avatar-life\`, `tools\assemble_avatar_life.py`, `public\data\characters.json` / `realism-characters.json`.

Finish locally:
1. Asset inventory table: Mac/Sean GLBs, clips (Idle/Walk/Greet/Present), materials, evidence receipts — present/partial/absent.
2. Verify current branch state; create `lane/muse-momo-philly-finish` if needed.
3. Advance avatar-life integration toward a local preview: assemble/check scripts that do NOT require new paid generations; reuse existing Higgsfield assets per README ("no new paid generations").
4. If Momo has a 3D/character place in this world or only in film shorts, document which — do not invent a Momo mesh.
5. Run or stage: `npm run build`, `node tools/check-founders.mjs`, `node tools/check-walk.mjs` (or command cards if sandbox down).
6. Write `evidence\muse-finish-2026-09-17\RUN-REPORT.md` with paths, diffs, blockers, and Dillon decisions (remote, Blender backup, deploy, Higgsfield spend).

## Output markers (stdout + files)
### MUSE_MOMO_PHILLY_START
... status ...
### MUSE_MOMO_PHILLY_END

Primary write targets:
- `clients\momentum-360\deliverables\2026-09-05-ai-division-launch-kit\video\FINISH-STATUS-2026-09-17.md`
- `clients\momentum-360\work\philadelphia-service-world\evidence\muse-finish-2026-09-17\RUN-REPORT.md`
- `clients\momentum-360\work\philadelphia-service-world\evidence\muse-finish-2026-09-17\ASSET-INVENTORY.md`
