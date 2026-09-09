# Need Momentum — AI Launch Films · build receipt

Private concept work, September 2026. Two original launch-film compositions for the Momentum Digital AI division, built on the bound Momentum Design System (exact logo master, Archivo Black / Nunito Sans, midnight–navy–blue–gold, 14px surfaces, `cubic-bezier(.85,0,.15,1)` motion).

## What is actually built and running

| File | What it is |
| --- | --- |
| `Film A — Your Next Chapter.dc.html` | 26 s film. **Real WebGL** book (three.js r0.184, loaded as an ES module at runtime): 5 sheets, each a front face + back face + edge solid with **real sheet thickness (12 mm scale)**, per-vertex page bend recomputed every frame, cast shadows and inter-page occlusion from a shadow-mapped key light. Drag horizontally or press ← / → to turn pages by hand; the 26 s camera + page-turn pass runs with no interaction. |
| `Film B — Meet Your Next Team.dc.html` | 25 s film. Choreographed **halftone cursor trail** on a 2D canvas: the path is resolved into a 10 px dot grid, and dot coverage drives a repeating radial-gradient mask that dissolves each agent plate in. Interactive pointer/touch reveal **and** a deterministic autoplay path. Revealed labels finish at full opacity — never left mid-dissolve. |
| `The Next Chapter Series.dc.html` | **Approved direction 3 of 5.** Four separately selectable and exportable 12 s episodes — Search, Design, Marketing, Automation — on the *same* WebGL book engine as Film A (identical sheet thickness, per-vertex bend, shadow-mapped key light, five-sheet block). Per episode: 0–2 s the book slides in and the cover settles, 2–8 s one turn reveals a single service spread (taped scrapbook plate with the original ceramic scene, torn edge, stitched rules), 8–12 s the sheet closes back and the exact logo holds with one next step. Routes `#search` `#design` `#marketing` `#automation`; ← / → and 1–4 change episode, space plays and pauses. |
| `Momo's First Assignment.dc.html` | **Approved direction 1 of 5.** 20 s desk film, **2.5D layered paper on a single 2D canvas** — deliberately not the book engine: no WebGL, no sheets, no page turns, no cover. A brief drops onto a midnight desk and settles; Momo enters and leans in; a reading highlight travels the page; ink underline, three margin carets and a gold FOR REVIEW stamp land; five paper station cards peel off the brief on a 0.15 s stagger, each clipped down with a blue thread back to the source; the board aligns, then the exact logo holds with one next step. Copy-stand camera (pan + push only), drag to shuttle, tap or ← → to step beats, space to play/pause. |
| `Meet Your Team - Character Shorts.dc.html` | **Six 10 s character shorts** on a lit character stage. Each ceramic master is masked by a **halftone dot grid whose dots grow outward from the stage focus**, so the character *develops* like a print instead of fading in; the plate's inner edges are feathered into the stage, a single crane-up is the only camera move, a gold dot ring closes the beat, and the exact logo holds on "Meet the rest of the team." Roles are the collection's own names (`artwork.json`) — no new characters, names or faces. Routes `#momo` `#search` `#response` `#build` `#operations` `#audience`; ← → and 1–6 change short, space plays/pauses, pointer movement develops the plate by hand. |
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

## The Next Chapter series — build and test pass

Built in this project from `Film A`; the book film and the team film are untouched. Each episode is a pure function of its own 12 s clock, so the export hook (`data-om-exportable-video-with-duration-secs="12"` + `data-om-seek-to-time-frame`) lands on the same frame every time, per episode. Duration 10 / 12 / 16 s, 16:9 primary and a deliberately recomposed 9:16 (portrait re-frames onto the single page that carries the words, straightens the book, scales the overlay type and moves the end card onto a solid navy panel in the lower third — not a crop of the wide framing), pause / replay / scrub, opt-in synthesized paper turn, and a static readable board of all four episodes selected automatically under `prefers-reduced-motion`.

Tested all four episodes at open / mid / end, both frames, keyboard and console in one batch. Fixed:

- The art page's beat line was set at a fixed x with no wrap, so longer lines ("Look like the crew that shows up.") ran off the page edge. It now wraps inside the page and the concept stamp sits under it.
- The 9:16 camera was authored too close: the page clipped at the frame edges and the book read as a steep diagonal. Portrait now has its own four camera presets, the book's yaw is reduced to a third, and the end card sits on a solid navy panel with the book lifted clear of it — so the logo and next step keep full contrast.

No console output on load or across any episode after the fixes. No new project, no paid generation, no purchase, no subscription, no mail, no publish, no deployment, and nothing in M360 was touched.

## Direction inventory — what each build is, and how they stay distinct

| Direction | File | Renderer + technique | Camera + rhythm |
| --- | --- | --- | --- |
| Film A · Your Next Chapter | `Film A - Your Next Chapter.dc.html` | three.js WebGL; 5 sheets with real thickness, per-vertex bend, shadow-mapped key light; canvas-painted page textures | Orbiting perspective camera around a book; slow 0.8 s identity eases; drag/arrow page turns |
| Film B · Meet Your Next Team | `Film B - Meet Your Next Team.dc.html` | 2D canvas halftone dot-grid trail driving a radial-gradient reveal mask | Static editorial frame; cursor-led rhythm; pointer reveal + deterministic autoplay path |
| The Next Chapter Series (book direction, complete — unchanged) | `The Next Chapter Series.dc.html` | Same WebGL book engine as Film A, one turning sheet per episode | Same orbiting book camera, cut to four 12 s episodes |
| **Momo's First Assignment (this build)** | `Momo's First Assignment.dc.html` | **2D canvas, 2.5D layered paper**: cast shadows scaled to lift, paper tilt on landing, ink drawn by stroke progress, pressed stamp, gold clips, bezier threads, ceramic plate feathered into the desk with a single-pass mask | **Copy-stand camera: pan and push only, never orbit.** Staccato rhythm — 1.0 s card flights with a back-ease settle on a 0.15 s stagger (the design system's finite-study cadence), against the book films' slow eases |

How this one stays visually distinct: no book, cover, spine, sheet stack or page turn appears anywhere in it; the renderer is 2D canvas rather than WebGL; the ground is a lit desk plane rather than a void with a floating object; depth is paper-on-paper occlusion and shadow rather than perspective geometry; and the character is a real ceramic master composited into the desk, not a texture printed on a page.

Sources actually inspected for it: the 15 ceramic masters in `assets/artwork/` and the two exact logo masters (this project), the bound design system's tokens plus its motion card (0.8 s / 0.2 s / 3.6 s at `cubic-bezier(.85,0,.15,1)`, 0.15 s assembly stagger) and `assets/artwork.json` role names, and the four HeyGen reference clips' stills in the design system (`assets/footage/`, `assets/reference/`) whose *start-dark-and-reveal, end-on-the-mark-over-letterspaced-caps* pattern the closing beat follows. The Codrops interactive-comic write-up and ten.375.studio informed Film A's book navigation and Film B's mouse trail — technique only, and neither is reused here; yanliu.design's material craft informed the tactile paper behaviour (weight, tilt, clipped edges), never her artwork or layouts. **Source mapping, corrected:** `launch-films-source` and `momo-film-source` are local *export folder names*, not missing inputs — nothing in this project depends on them and none was recreated here. The original Momo sources live in the existing Claude project `e5e6d97f-e2a8-4651-aecc-6c2aea241351`, which is being repaired separately; this project builds only from the vendored masters listed above.

## Momo's First Assignment — beat map and test pass

0.0–2.6 the brief lands · 2.6–5.6 Momo reads it · 5.6–8.2 marked, not published (ink, carets, stamp at 7.2 s) · 8.2–15.4 routed through five stations (cards at 8.5 / 9.8 / 11.1 / 12.4 / 13.6 s) · 15.4–17.8 one coordinated board · 17.8–20.0 exact logo and "Let's run your first brief through it." Everything is a pure function of `t`, so the export hook (`data-om-exportable-video-with-duration-secs="20"` + `data-om-seek-to-time-frame`) is frame-identical on every pass. Duration 16 / 20 / 26 s, 16:9 plus an authored 9:16 (portrait uses its own layout table: brief centred over Momo at the bottom, and the five cards become a stacked column of wide icon-left cards — not a crop), pause / replay / scrub, opt-in synthesized paper, ink and stamp sounds, and a static readable board under `prefers-reduced-motion`.

Tested first / middle / end in both compositions, keyboard, tap-step, drag-shuttle and the seek hook in one batch. Fixed:

- `state(t)` shadowed React's `this.state`, so every frame threw and the canvas stayed black. The timeline function is now `shot(t)`.
- The ceramic plate was invisible: the feather mask used two `destination-in` fills, and the first erased everything outside its own band. The mask is now assembled on its own canvas and applied in one draw — Momo composites into the midnight desk with no seam.
- The brief's headline was set as two wraps and collided with the three problem lines; it is one wrap at a smaller display size now.
- Station-card titles overflowed (the wide portrait card had no wrap at all); titles now auto-fit and the long ones wrap inside the card.
- The card image tiles were filled midnight, but the ceramic service icons are painted on their own white ground — so each tile read as a white block. Tiles are paper with a hairline in both the film and the static board.
- Rail and brief drop start at 0.15 s so the first exported frame is not an empty plate.

A review pass then caught three off-palette hex values, now swapped to bound tokens: the caption sub-line `#8fa8bd` → `#d5e4f1` (the system's dim reversed copy), the card image tiles `#f7fafc` → `#f0f5f9` (reading field, in both the canvas painter and the static board), and the brief's ruled lines `#e4ecf2` → `#d5e0e9` at 65% alpha (the system's only hairline). No timeline, layout or plate change.

One caveat, stated plainly: the preview's console buffer kept replaying the pre-fix `this.state` errors across reloads, so I verified the fix by rendering — every beat in both frames now paints correctly, which the failing code could not do.

## Character Shorts — build and test pass

Six 10 s passes, each a pure function of its own clock: 0–1.8 halftone development · 1.8–3.2 name plate · 3.2–7.1 role and proposed-role line, ceramic badge at 4.6 · 7.1–8.1 gold dot ring · 8.5–10.0 exact logo hold. Export hook `data-om-exportable-video-with-duration-secs="10"` + `data-om-seek-to-time-frame`, duration 8 / 10 / 14 s, 16:9 (type column left, character right) and an authored 9:16 (type above, stage low), pause / replay / scrub, opt-in synthesized dot and paper sound, and a static readable board of all six under `prefers-reduced-motion`. Distinct from the other directions: no book engine, no sheets or page turns, no desk or paper-card choreography — a single character on a lit stage, revealed by halftone.

Fixed in the one repair batch: the character plate showed its own image rectangle against the stage (an edge-feather mask is now applied as a full-canvas `destination-in` after the halftone mask, with the plate bled off the right and bottom); the ceramic badge read as a white square because the icon's own white ground covered its disc (the icon is now clipped into the disc with a hairline ring); and the badge overlapped the type column in 16:9 (moved above the plate in landscape, below it in portrait).

Momo's First Assignment was re-verified on a fresh load after the palette swap: console clean, first / middle / end correct in both compositions, scrub, Home-replay, keyboard stepping and static mode all behaving. No further changes were made to it.

## Content honesty

- Momo's First Assignment stamps the brief **FOR REVIEW**, captions the marking beat "Marked, not published", and labels all five stations **proposed step**. The brief's three lines are generic operator problems, not a client's numbers. Momo is the existing `hero-mascot` master, composited unmodified — no new face, no redraw, and his chest emblem is never used as a logo.
- The series episodes (Be there when they ask / Make it recognizably yours / Give the idea somewhere to go / Keep the work connected) are stamped **proposed service story · for review** on the page itself and in the closing colophon. The four workflows (Get found / Follow through / Make it yours / Keep the work connected) and the six roles (SEO, AI search, Lead response, Content, Operations, Reporting) are labelled **proposed agent packaging for review** on the page, inside the film frame, and on the end cards. Nothing is described as built, deployed or available.
- No invented metrics, no client names, no results claims, no testimonials, no new logo or mascot. Momo and the ceramic icons are the existing Momentum masters, used unmodified and uncoloured; the wordmark is the exact `momentum-logo.png` master.
- Reference study: the Codrops write-up on the Studio375 anniversary comic (book navigation + mouse trail) and yanliu.design's material craft informed **technique only** — dimensional sheets with visible thickness, drag-to-turn, a two-pass halftone trail, tactile dot dissolves. No artwork, layout or composition was copied from either.
