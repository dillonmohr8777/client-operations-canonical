# Need Momentum — AI Launch Films · build receipt

Private concept work, September 2026. Two original launch-film compositions for the Momentum Digital AI division, built on the bound Momentum Design System (exact logo master, Archivo Black / Nunito Sans, midnight–navy–blue–gold, 14px surfaces, `cubic-bezier(.85,0,.15,1)` motion).

## What is actually built and running

| File | What it is |
| --- | --- |
| `Film A — Your Next Chapter.dc.html` | 26 s film. **Real WebGL** book (three.js r0.184, loaded as an ES module at runtime): 5 sheets, each a front face + back face + edge solid with **real sheet thickness (12 mm scale)**, per-vertex page bend recomputed every frame, cast shadows and inter-page occlusion from a shadow-mapped key light. Drag horizontally or press ← / → to turn pages by hand; the 26 s camera + page-turn pass runs with no interaction. |
| `Film B — Meet Your Next Team.dc.html` | 25 s film. Choreographed **halftone cursor trail** on a 2D canvas: the path is resolved into a 10 px dot grid, and dot coverage drives a repeating radial-gradient mask that dissolves each agent plate in. Interactive pointer/touch reveal **and** a deterministic autoplay path. Revealed labels finish at full opacity — never left mid-dissolve. |
| `export/momentum-film-a-hyperframes.html` | Single-file HyperFrames composition, 1920×1080, 24 s, 7 scenes. |
| `export/momentum-film-b-hyperframes.html` | Single-file HyperFrames composition, 1920×1080, 21.6 s, 7 scenes. |

Both films: 16:9 primary with a 9:16 mobile framing that re-lays the composition (not a crop), replay / pause / scrub / duration (20-26-34 s and 18-25-32 s), sound **muted until opted in**, and a static readable alternative that is selected automatically under `prefers-reduced-motion`.

## Truthful notes on technique

- **Film A is WebGL, and says so.** If `three.module.js` or a WebGL context fails to load, the page does **not** substitute a CSS-perspective book and call it 3D: it says WebGL is unavailable in that runtime and shows the static readable version instead. That fallback path is in the code, not just in this note.
- **The two export compositions are CSS + GSAP rebuilds, not the WebGL book.** Their page turn is a CSS 3D `rotateY` leaf under `perspective`, and Film B's halftone is a CSS dot mask animated by GSAP. Same script, same copy, same palette and type — different renderer. Nothing in them is described as WebGL.
- **Timelines are pure functions of time.** Neither film uses `Date.now()`, wall-clock accumulation or unseeded randomness for choreography, so scrubbing, video export and frame capture land on the same image every time. Both stages implement the host seek contract (`data-om-exportable-video-with-duration-secs` + `data-om-seek-to-time-frame`).
- **Sound is synthesized in-browser** (WebAudio filtered noise: paper turn in A, brush in B) from a seeded PRNG. No external, licensed or paid audio generation. Off by default.

## HyperFrames status — what I did and did not do

Consulted the connected HyperFrames tool and its official Claude Design → Send to HyperFrames guide, and authored both compositions to that contract:

- one live root `data-composition-id="main"` with numeric `data-width` / `data-height` / `data-duration`;
- every scene carries numeric `data-start` + `data-duration` and the scenes tile end-to-end with no gaps;
- a **paused** GSAP timeline built synchronously and registered as `window.__timelines["main"]`;
- non-anchor scenes toggled with `autoAlpha`, one contiguous shader chain per file (`s6 → s7`: `cinematic-zoom` in A, `sdf-iris` in B, 0.5 s, `scenes.length === transitions.length + 1`);
- **Archivo Black and Nunito Sans inlined as base64 `@font-face`**, exact logo and mark inlined as base64 PNG, ceramic artwork inlined as base64 JPEG (620–760 px, quality 0.84). No relative paths, no placeholder assets, no expiring URLs. Runtime + GSAP + shader-transitions come from the pinned jsdelivr CDN, as the guide requires.

Verified locally: both files load, the runtime pre-samples the shader transition, `window.__timelines.main` exists, and scrubbing the timeline renders the cover, spreads and end card with the correct fonts and artwork.

**Not done, deliberately:** no import into HeyGen, no cloud render, no account, no purchase, nothing published or mailed. Import and enhance turns are free on their side; **render is the paid step** and was left to you. To proceed: open either `export/…-hyperframes.html` and use Send to HyperFrames.

## Test pass and fixes

Batch-tested both films: full timeline (seeks across every beat to the end card), hand-drag / arrow-key and pointer-reveal interactive modes, 9:16 mobile framing, static readable version, and console. Fixed in that pass:

- The static readable boards built their cards from a template loop, so during streaming the browser requested the literal `{{ s.art }}` / `{{ a.art }}` path and logged two failed image loads. Both boards are now literal markup — no holes in `src`, no console errors, and they paint immediately.
- Film B's halftone trail could drop ink on top of a caption it had just revealed. Label boxes are now measured and kept clear of trail dots once their plate is revealed, so revealed labels stay fully readable in interactive mode as well as in the automated pass.
- Scrub input switched from a controlled `value` to `defaultValue`, and the duration / frame selects are re-asserted from state each frame, so the controls always show the live setting.

Console is clean on both files after the fixes; the WebGL book, the six-agent reveal, both end cards and the exact logo all render as intended.

## Content honesty

- The four workflows (Get found / Follow through / Make it yours / Keep the work connected) and the six roles (SEO, AI search, Lead response, Content, Operations, Reporting) are labelled **proposed agent packaging for review** on the page, inside the film frame, and on the end cards. Nothing is described as built, deployed or available.
- No invented metrics, no client names, no results claims, no testimonials, no new logo or mascot. Momo and the ceramic icons are the existing Momentum masters, used unmodified and uncoloured; the wordmark is the exact `momentum-logo.png` master.
- Reference study: the Codrops write-up on the Studio375 anniversary comic (book navigation + mouse trail) and yanliu.design's material craft informed **technique only** — dimensional sheets with visible thickness, drag-to-turn, a two-pass halftone trail, tactile dot dissolves. No artwork, layout or composition was copied from either.
