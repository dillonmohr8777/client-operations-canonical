# QA repair plan — character 9:16 settled-frame FAILs — 2026-09-17

**STATUS: DRAFT/STAGE ONLY. Nothing sent, posted, published, deployed, or spent.**
**No MP4 re-encoded. No film source touched. No paid generation.**

Staged for: `clients/momentum-360/deliverables/2026-09-08-claude-design-exports/original-five-completion/QA-REPAIR-PLAN-2026-09-17.md`
(written at hub root: junction writes are sandbox-denied in this session).

Scope: `original-five-completion/review/qa-character-momo.json` (+ the other five
`character-*` 9:16 previews) vs `original-five-completion/qa-render.cjs`.

## 1. What the failures are (verified from disk this run)

- `qa-character-momo.json` entry 2/2: `character-momo` 9:16, `status: FAIL`,
  `failure: "Repeated settled frame changed"`, `deterministicSettledFrame: false`,
  layout `350 x 622.21875 @ viewport 390`. The 16:9 entry PASSes.
- The FAIL entries contain NO `repeatPixelDifference` /
  `deterministicWithinPreviewRasterTolerance` fields — but the CURRENT
  `qa-render.cjs` (lines 79-84) writes those fields before asserting. Conclusion:
  the 9/8 QA run predates the tolerance logic now in the harness. The harness was
  already patched after the run; the six cases were never re-run against it.
- Root cause stands as FINISH-STATUS 4b: fractional portrait stage geometry
  (622.21875 CSS px) → sub-pixel rounding differs between Playwright
  `target.screenshot()` passes.

## 2. Step 1 — re-run with the current harness (no code change, expected fix)

```powershell
# Dillon/Grok shell (python + node + Chrome + ffmpeg on PATH; sandbox lacks python)
cd C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-09-08-claude-design-exports\original-five-completion
python -m http.server 49445  # in one window; serves BASE http://127.0.0.1:49445/
node qa-render.cjs qa character-momo   # 2 aspects only; writes review/qa-character-momo.json
node qa-render.cjs qa character        # all six character previews; writes review/qa-character.json
```

Expected: all six 9:16 cases PASS via `deterministicWithinPreviewRasterTolerance`
(`maxChannelDiff <= 1`, `changed/pixels < 0.0001`), matching the TODAY receipt's
bounded-tolerance disposition. If so, STOP — no patch needed. Record the new QA
JSONs as the accepted result.

## 3. Step 2 — only if a case still FAILs: integer-clip patch (harness only)

Do NOT touch `launch/Meet Your Team - Character Shorts.dc.html` (capture-harness
rounding issue, not a film defect). Patch ONLY the settled-frame comparison in
`qa-render.cjs` (lines 74-76); leave the `beats` screenshots byte-identical so
existing receipt hashes stay valid.

Replace:

```js
  // A repeated settled frame should be exactly identical on one machine.
  await seek(page,f,f.duration-1);const a=await target.screenshot();await seek(page,f,2);await seek(page,f,f.duration-1);const b=await target.screenshot();
  receipt.deterministicSettledFrame=hash(a)===hash(b);
```

With:

```js
  // Integer capture bounds: fractional CSS geometry (e.g. 622.21875px portrait
  // height) rounds differently between passes. Compare on whole device pixels.
  const box=await target.boundingBox();
  const clip={x:Math.round(box.x),y:Math.round(box.y),width:Math.round(box.width),height:Math.round(box.height)};
  await seek(page,f,f.duration-1);const a=await page.screenshot({clip});await seek(page,f,2);await seek(page,f,f.duration-1);const b=await page.screenshot({clip});
  receipt.deterministicSettledFrame=hash(a)===hash(b);
  receipt.settledClip={css:{x:box.x,y:box.y,width:box.width,height:box.height},clip};
```

Then re-run the Step 1 commands. If a case STILL fails, do not weaken the
harness further: write a dated QA note accepting the measured tolerance
(`repeatPixelDifference` values from the new QA JSON) instead.

## 4. Explicit non-goals

- No re-encode of any of the 26 accepted review MP4s (verified present 2026-09-17,
  plus 3 incomplete + 3 REJECTED retained in review/ and 3 source uploads = 35 total).
- No change to film HTML/JS sources.
- No change to the 16:9 path (all PASS).

## 5. Sandbox note (this run)

`python`/`ffmpeg`/`ffprobe` are not executable in this Muse sandbox and the
Playwright module path is outside the readable scope, so `qa-render.cjs` could
not be executed here. Everything above is staged for a non-sandbox shell.
