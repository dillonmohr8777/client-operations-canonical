# Momentum AI Field Notes — native Claude Design edition

**Status:** built, seeded, published to the existing private artifact. Root owns the final
authenticated native interaction test and Gmail delivery.
**Date:** 2026-09-08 · **Artifact:** https://claude.ai/code/artifact/e9ce7032-81b1-4970-9aca-4d39a23eafc0
(private, contract 0.1.31, capabilities `self` + `downloads` carried forward)

## What shipped

Five review-draft ebooks as native Claude Design artboards, each with a static PDF companion,
generated from the five existing manuscripts by one shared generator.

| # | Book | PDF pages | PDF | Artboard |
|---|------|-----------|-----|----------|
| 1 | Show Up When They Ask AI | 37 | 3.1 MB | `Ebook1.dc.html` 232 KB |
| 2 | From Missed Call to Booked Job | 32 | 2.9 MB | `Ebook2.dc.html` 223 KB |
| 3 | Built, Not Prompted | 36 | 3.1 MB | `Ebook3.dc.html` 232 KB |
| 4 | The Small Business AI Operating System | 33 | 2.9 MB | `Ebook4.dc.html` 231 KB |
| 5 | Names, Not Numbers | 36 | 2.9 MB | `Ebook5.dc.html` 230 KB |

## Paths

- Generator: `build_ebook.py` (`<manuscript.md> <canvas_dir> <book_no> <fonts_dir> <brand_dir>`)
- Native canvas source: `canvas-v2/` — 16 artboards, 10 images, `canvas.json`
- Seeded payload: `momentum-ai-launch-collateral.html` (27 files, `--check` ok) — last seeded from
  Root's `canvas-v2/` rebuild carrying the cold-layout fix, and saved to the artifact URL above
- PDFs + screenshots + harness: `out/`
- Manuscripts (read-only): `../2026-09-07-google-aistudio-batch/content/ebooks/`
- Brand system v2 (read-only, unmodified): `../2026-09-08-momentum-brand-system-v2/`

## Checks that passed

Measured per book by `out/render.mjs` against the standalone build, on the current source:

- **Content complete.** Rendered word count exceeds manuscript word count in all five
  (7776→8873, 7405→8400, 8437→9261, 7502→8671, 7588→8552 — the surplus is chrome and captions).
- **Sources intact.** 81/81, 70/70, 149/149, 92/92, 60/60 source chips carried through.
- **Review notes preserved.** Book 4's 9 HTML review comments render as visible notes; 0/0 elsewhere.
  Review-draft status is visible in the ribbon on every book and every PDF page.
- **Navigation visible.** Desktop contents rail 12/12/13/12/12 tabs visible (rail height 866px);
  mobile strip 50px tall with all tabs reachable, cover top at 150px — no full screen of TOC on open.
- **No overflow** at 1200px or 390px. No broken images. Logos byte-identical to the brand-system
  originals (never redrawn). Etched SVG sprites only — no emoji or Unicode icon substitutes.
- **PDFs end on content.** No trailing blank page in any of the five.
- **Native runtime.** Every artboard uses the DCLogic contract (`extends DCLogic`, `renderVals`,
  `{{ }}` bindings). Root verified sources toggle, motion pause and diagram selection working in the
  authenticated native Play artboard.

## The navigation fix in this publish

Bare `#anchor` hrefs resolve against the artifact origin inside the srcdoc artboard and navigate the
preview away (Root, 2026-09-08). In the native variant every in-document link — contents rail, mobile
chapter strip, prev/next chapter nav, skip link, "Read the chapter" — is now a button bound to a
DCLogic scroll handler. Verified: **0 bare `href="#"` in all five artboards**, all 13–14 handler names
per book resolve to a declared target, and the standalone build keeps its 29–32 real anchors so PDF
and screenshot output are unchanged.

## Known limitations

1. **Cold-load jump accuracy — fix applied by Root, pending native confirmation.** Sections use
   `content-visibility:auto` (this is what fixed the native "preview stopped" stall — artboards went
   1,022,778 → ~230,000 chars). The first scroll handler lifted containment and corrected on the next
   animation frame, which landed short for mid-book chapters on a cold document (measured: book 1 ch-5
   ≈ 2094px below the fold; trailing sections landed correctly at 128px). Root replaced it directly in
   `build_ebook.py`: `go()` now makes every section visible, forces synchronous layout via
   `document.documentElement.offsetHeight`, then calls
   `scrollIntoView({block:'start',behavior:'instant'})` — and no longer restores the
   `content-visibility` placeholders. Root rebuilt all five artboards into `canvas-v2/`; this receipt's
   publish is seeded from that rebuild. Not yet confirmed in the authenticated native Play artboard —
   Root owns that test.
2. **Fonts.** Only Archivo Black is inlined. Nunito Sans as base64 was 760 KB per artboard and stalled
   the native preview, so body text falls back to Segoe UI / system-ui in the artboards. PDFs are
   unaffected in layout but use the fallback body face.
3. **Not done in this pass.** No Fable editing pass over the manuscript prose. Content is the existing
   review-draft text, unedited.

## Scope honoured

Owned only this directory and the existing artifact. Brand system v2 read, never written. No memories,
no new agents, no email or external delivery, no paid generation or research, no account changes, no
public sharing. Content and private review-draft status preserved throughout.
