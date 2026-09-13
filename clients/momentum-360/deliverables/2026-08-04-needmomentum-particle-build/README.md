# Need Momentum — MOTION build

Builds **on** the Codex site at `need-momentum-signal-20260803.netlify.app`, which
is the design direction being kept. Same palette family, same self-hosted fonts
(Archivo / Manrope / Unbounded / Instrument Serif), same nine-section spine.

**Live:** https://claude.ai/code/artifact/467ae5b5-f107-4295-b7f0-f5388ce39cfe

Because the Codex build ships as a 1.17 MB compiled React bundle with no source
in this repo, this is a static rebuild of that design rather than a patch to it —
which also removes the CDN dependency the house CSP (`script-src 'self'`) forbids.

## What changed, against the review notes

| Note | What was done |
|---|---|
| "get rid of line — can only be the particles for the m" | The decorative streak is gone. One soft cobalt bloom remains as ambient depth; the only particle figure in the hero is the logo itself. The h1's triple-layer offset extrude (the ghosted "lines" on the type) is deleted. |
| "why is it so cut off??? must be optimized for mobile and desktop" | Root cause found: the old canvas set `width`/`height` attributes but never `style.width`/`style.height`, so it laid out at its **attribute** width in CSS pixels — 234 × 2 = 468px inside a 390px viewport. `sizeCanvas()` now sets both pairs and measures from the parent's box, never `window.innerWidth`. Grid/flex children get `min-width: 0`, headings get `overflow-wrap`, and the QA gate fails the build on any horizontal overflow at 320 / 390 / 768 / 1440. |
| "get rid of DIGITAL GROWTH + SPATIAL MEDIA" | Removed. The hero starts at the h1; the reclaimed hierarchy slot holds third-party proof (Google Partner · Inc. 5000 · Philly 100) instead, which outperforms a self-authored category label above the fold. |
| "make it ACTUALLY MOVE — pulsing doesn't resolve — has to resolve to a fully clear particle logo" | The hero logo now assembles from pixel-sampled particles and **ends fully crisp**. The fix is architectural: the real `<img>` is in the DOM from the first byte and the canvas is a temporary overlay that dies. The old build never resolved because it treated the canvas as the destination. |
| "make 01-03 numbers bigger" | `--t-numeral: clamp(4.5rem, 11vw, 9rem)`, tabular figures, sitting behind the card as structure rather than above the title in the flow. |
| "dont mention signal verbiage" | Every visible occurrence gone — including `<title>` and `og:*`, which surface in the tab and in SERPs. QA fails the build if the word appears in visible text. CSS class names (`.signal-*`) were invisible and are simply not used here. |
| "get rid of founder pic / goofy mac pics — solo images, bios" | Only the two solo studio portraits ship. The duo shot, the YouTube-thumbnail frame and the award snapshot are not in this build. Each founder gets three real paragraphs at `1.25rem` on white. |
| "make the bios particle all font then it resolves, doesn't loop" | The lead sentence of each bio assembles from particles and hands off to **real selectable text**. `IntersectionObserver` unobserves on first fire, so it never loops. |
| "all font must be brighter and bigger throughout" | Every size raised against the Codex value, recorded inline in `tokens.css`. Nothing renders below 16px — QA fails on any text under 15.5px. Body copy on navy is `#FCFCFC`, not the old `#a7b7cf`, which sat at ~4.1:1 and failed AA. |
| "add whiter sections with particles chilling like immohrtal, through the entire website" | One ambient field across the whole page. |
| "more white / yellow sections, more navy, no black sections" | navy → white → navy → **yellow** → near-white → navy → white → navy → **yellow**. `#020711` is no longer a ground anywhere; it survives only as text on light surfaces. QA fails on any near-black section background. |

## The ambient field

One fixed Canvas2D canvas, above the sections at low alpha, tinted per section
from a document-space registry so a single continuous field crosses boundaries
instead of reading as tiles.

- **Why on top, not behind:** opaque sections would hide it completely.
- **Why not `mix-blend-mode`:** `screen` is a mathematical no-op against near-white — the particles would vanish on half the page — and `multiply` is the exact inverse.
- **Why Canvas2D not WebGL:** the budget is 700–2200 points; WebGL's advantage starts around 50k, its shader compile costs 8–40ms on mid-range Android *during LCP*, and skipping it deletes the whole `webglcontextlost` failure class.
- **Perceptual asymmetry:** a dark dot on white needs more radius and less alpha than a bright dot on navy to read as equal weight, so each band ships its own geometry, not just its own colour.
- A 32px occupancy grid keeps particles off running text; an adaptive governor sheds points if a rolling 30-frame mean exceeds 20ms; `Save-Data`, reduced motion and the Motion toggle each disable it entirely with no grey box left behind.

## Verified

`node tools/qa.mjs` — headless Chromium at 320 / 390 / 768 / 1440. **ALL CHECKS PASSED.**
838–861 KB transferred. Every resolve mechanic confirmed to fire, reach `opacity: 1`,
and remove its canvas at every viewport.

```bash
python3 -m http.server 8903
node tools/qa.mjs http://localhost:8903
python3 tools/build-artifact.py out.html --fragment
```

## Still open

1. **Sean's bio is thin** — the verified facts are "partner" and "commercial real estate / tours". Ask for years in CRE, prior firms, education, one signature property type.
2. **The gala figure** — "raises about $100,000" is written as per-year; confirm whether it is annual or cumulative.
3. **Award years** — "No. 651 Inc. 5000" and "No. 2 Philly 100" need years or they age badly.
4. **Mac's Google tenure** — deliberately written as only "after working at Google". Do not upgrade to a title or duration without a source.
5. **Luke McCallion** is named as a partner but has no portrait or bio.
6. Per the house maker/checker rule, this build has not had an independent visual review.
