# Launch-kit video FINISH STATUS — 2026-09-17 (Muse)

**STATUS: DRAFT/STAGE ONLY. Nothing sent, posted, published, deployed, or spent.**
**No Mac contact. No paid Higgsfield. This file is local-only.**

Scope: `clients/momentum-360/deliverables/2026-09-05-ai-division-launch-kit/video/`
plus the Momo film lane at `clients/momentum-360/deliverables/2026-09-08-claude-design-exports/`.
Shell was unavailable this run (Windows sandbox setup failure), so every claim
below comes from direct file reads; hashes and renders were NOT re-verified.
Commands that need a shell are staged as cards, not executed.

## 1. Founder intro films (M01 / S01 / MS01) — NOT BUILT

| Piece | Expected output | State |
|---|---|---|
| M01 Mac 15s 9:16 | `video/out/M01*.mp4` + QA frames + receipt | MISSING — `video/out/` does not exist |
| S01 Sean 15s 9:16 | `video/out/S01*.mp4` + QA frames + receipt | MISSING |
| MS01 both 15s 9:16 | `video/out/MS01*.mp4` + QA frames + receipt | MISSING |
| `video/ledger.json` (per-job credit record) | required by DISPATCH-PROMPT | MISSING |
| `video/RUN-REPORT.md` (Claude run report) | required by DISPATCH-PROMPT | MISSING |
| `video/plates/` (Higgsfield plates for describe) | input to `composite.ps1` | MISSING (dir absent) |

Claude's 2026-09-16 dispatched run (`DISPATCH-PROMPT.md` at kit root) left no
outputs in the kit: no MP4s, no plates, no ledger, no run report. Nothing was
spent from this side — there is simply nothing to composite yet.

## 2. Title-card / composite pipeline — INTACT, runnable as-is

| Item | State |
|---|---|
| `video/cards/`: 24 PNG (6 cards x 2 aspects x opaque+alpha) | PRESENT, all 24 |
| `video/cards/`: 12 WebM animated entries | PRESENT, all 12 |
| `video/cards/receipt.json` (input hashes, 36 outputs) | PRESENT (2026-09-05) |
| `video/title-cards.html` (6-card stage) | PRESENT |
| `video/build_cards.py` (rebuilds stage from tokens + `offers.json`) | PRESENT, coherent; deps `offers.json` + `../2026-09-05-momentum-design-system/tokens/momentum.tokens.css` both PRESENT |
| `video/capture_cards.mjs` (re-captures `cards/` via Playwright) | PRESENT, coherent; needs Playwright + `python -m http.server` |
| `video/composite.ps1` (concat plates, derive 9:16/1:1, overlay verified mark, QA frames + receipt) | PRESENT, coherent; needs `ffmpeg`/`ffprobe` on PATH + plates |
| `video/assets/momentum-logo-white.png` + `PROVENANCE.json` | PRESENT |
| `video/shots.json` (F01–F05 + S01–S08 plan, ~365 credits, hard stop 450) | PRESENT |
| `video/HIGGSFIELD-PROMPT-PACK.md`, `video/SOCIAL-PLAN.md` | PRESENT (not re-read this run) |

Founder references — all 4 PRESENT and hash-recorded in
`video/founders/references/PROVENANCE.json` (hashes not re-verified, no shell):

- `mac-frederick-founder-bio-v1.png`, `sean-boyle-founder-bio-v1.png`
- `mac-sean-instagram-editorial-source.jpg` (orientation/clothing only)
- `need-momentum-founders-film.mp4` (motion reference)
- `video/founders/frames/`: 5 confirmation PNGs PRESENT
  (`founders-film-0.5/4/8/12.png`, `talking-5s.png`)

## 3. Exact next commands (run with a working shell)

### 3a. Re-verify pipeline health first (free, local)

```powershell
cd C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-09-05-ai-division-launch-kit
python video/build_cards.py          # self-check + provenance hash assert, rewrites title-cards.html
node video/capture_cards.mjs         # re-captures cards/ (36 files + receipt.json)
Get-Command ffmpeg, ffprobe          # composite.ps1 prerequisites
```

### 3b. Founder films — PAID JOB CARD (STOP: needs Dillon's exact credit budget)

Per `video/FOUNDER-INTROS.md` (Aug-31 measured rates — reverify live first).
Build order M01, then S01, then MS01 only if credits allow. Keyframe reviewed
at full size before any 135-credit motion spend; 0/5/10/15s contact sheet per
motion master; 4K upscale only an accepted master; report running total after
every render; hard stop at 600 on this pack.

| Step | Model / action | Credits |
|---|---|---|
| M01 keyframe (Mac portrait ref, 9:16 2K) | GPT Image 2 | 8.5 |
| M01 motion (Seedance 2.5 `omni_reference`, 15s 1080p) | portrait + founders film | 135 |
| M01 4K upscale (accepted master only) | Bytedance Pro (aigc) | 4 |
| S01 keyframe + motion + upscale | same pattern, Sean refs | 147.5 |
| MS01 keyframe + motion + upscale (only if balance allows) | both portraits + pair + film | 147.5 |
| One reroll each (likely) | 135 per motion reroll | +135/+270/+405 |

First-take M01+S01 = 295; +MS01 = 442.5. M01+S01 with one reroll each = 565.
The five Mini lane films (~365) do NOT fit in the same balance — sequence
founders first, lane films after a top-up. Gates D18 (spend authority) and
D12/D19 (likeness/brand) still read `open` in `pending-decisions.json`.

### 3c. Composite a finished master (free, local, once plates exist)

```powershell
cd ...\2026-09-05-ai-division-launch-kit\video
.\composite.ps1 -PlateDir .\plates\M01 -Mark .\assets\momentum-logo-white.png -OutDir .\out -Name M01-mac -Derive 9x16,1x1
```

Delivers `out/M01-mac*.mp4` + `.qa/` frames + `.receipt.json`. Same pattern
for S01/MS01 and lane films F01–F05.

## 4. Momo film lane — COMPLETE FOR LOCAL REVIEW (no action needed to watch)

Root: `clients/momentum-360/deliverables/2026-09-08-claude-design-exports/`

| Batch | Receipt | MP4s on disk |
|---|---|---|
| Original five (Momo's First Assignment, One Idea Everywhere, Next Chapter Series x4 eps, Character Shorts x6, Inside the Living Portfolio) | `TODAY-CLAUDE-DESIGN-COMPLETION-RECEIPT.md` — COMPLETE, 26/26 | 26/26 review MP4s PRESENT (+6 retained rejected/interrupted attempts, correctly excluded) |
| Five new AI films (AI 01 Atomic Assembly, AI 02 Clear the Noise, AI 03 The Hours Return, AI 04 Break the Frame, AI 05 System Awake) | `FIVE-NEW-AI-FILMS-COMPLETION-RECEIPT.md` — COMPLETE, 10/10 | 10/10 PRESENT in `five-new-ai-films/opaque-review-mp4/` |
| AI04 repair replacements | `AI04-REPAIR-COMPLETION-RECEIPT.md` — COMPLETE | 2/2 PRESENT in `ai04-repair-completion/opaque-review-mp4/` (supersede the AI04 pair above) |
| Overall | `ALL-TODAY-CLAUDE-DESIGN-STATUS.md` (2026-09-09) — both batches complete | 3 preserved `finishing/` 1080p films unchanged |

"Outside-receipt batches" disposition: AI 01–05 are outside the *TODAY*
receipt by that receipt's own scope line, but each is covered by the
FIVE-NEW receipt plus the AI04 repair receipt. **No batch is orphaned; no
un-receipted batch remains.**

### 4a. FAIL QA — character 9:16 settled-frame (6 cases, 1 is Momo)

Raw `original-five-completion/review/qa-all.json` + `qa-character-momo.json`:

- FAIL `character-momo` 9:16 — `deterministicSettledFrame: false`,
  "Repeated settled frame changed" (16:9 PASS).
- Same FAIL on the other five character 9:16 previews
  (search, response, build, operations, audience). All six 16:9 PASS.
- The TODAY receipt dispositions all six under a bounded raster tolerance
  (<=1 8-bit level on <0.01% of pixels at fractional CSS edges; raw diffs
  retained in `qa.json` + repeat PNGs). All six 9:16 review MP4s exist and
  were ffprobe-verified. Local-review status is not blocked.

### 4b. Local repair checklist (no paid gen, no new Claude usage)

1. Re-run `original-five-completion/qa-render.cjs` with a working shell;
   confirm the same six 9:16 cases FAIL and nothing else changed.
2. Diff each repeat-PNG pair; confirm deltas are still within the receipt's
   stated tolerance (1 level, <0.01% pixels, edge-only).
3. Likely root cause: fractional portrait layout
   (`layout.height 622.21875` at 390 viewport in the Momo 9:16 case) —
   sub-pixel rounding differs between passes. Fix options, smallest first:
   a. pin integer stage/viewport geometry in the portrait capture path;
   b. round the capture clip to whole device pixels before compare;
   c. only if (a)/(b) fail: record the tolerance as accepted in a new
      dated QA note rather than weakening `qa-render.cjs` globally.
4. Do NOT touch `launch/Meet Your Team - Character Shorts.dc.html` source
   for this — it is a capture-harness rounding issue, not a film defect.
5. Re-encode nothing: the 26 accepted review MP4s are unaffected.

## 5. Blockers / Dillon decisions (launch-kit side)

1. Founder-film credit budget (see 3b job card) + D18/D12/D19 answers.
2. 10–20s of real phone video per founder (walk/stop/cross-arms/head-turn)
   — optional, biggest identity-quality lever, per FOUNDER-INTROS.md.
3. Reschedule the missed 2026-09-11 gate meeting (all 20 decisions open;
   `DRAFT-message-to-mac-LOCAL-ONLY.md` stays local — NOT sent).
