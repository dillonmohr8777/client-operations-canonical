# FILM MANIFEST — Momentum AI launch films

Campaign: **Intelligence made visible.** Five separate films, five materially different shot structures, one shared player. Private concept work for review — September 2026.

## Files

| # | File | Structure | Renderer / technique | Authored | Export clock | Aspects | Close line |
| --- | --- | --- | --- | --- | --- | --- | --- |
| AI 01 | `AI 01 - Atomic Assembly.dc.html` | atom → chain reaction → three structures → one system | three.js; 3 000 per-particle-sized points on a decided plan, contour-tracing gold band, orbital rings | 18 s | 540 frames @ 30 fps | 16:9 + authored 9:16 | One idea. A chain reaction. |
| AI 02 | `AI 02 - Clear the Noise.dc.html` | dense field → tide passes through → one signal → mark | three.js; 460 instanced marks driven by the ribbon's own displacement field; per-frame rebuilt signal tube; lens bend | 18 s | 540 frames @ 30 fps | 16:9 + authored 9:16 | Make room for Momentum. |
| AI 03 | `AI 03 - The Hours Return.dc.html` | dial macro → six pathways coordinate → mechanism opens → mark | three.js; instanced bevelled ticks, beads on rings, six tubes rebuilt from control points, causal handoffs | 18 s | 540 frames @ 30 fps | 16:9 + authored 9:16 | Your day has bigger plans. |
| AI 04 | `AI 04 - Break the Frame.dc.html` | WHAT IF → contract + stepped break → prism aperture → type returns → mark | three.js; slice-stack dimensional letterforms, glyph-sampled fragment cubes, prism cone ring, fly-through | 18 s | 540 frames @ 30 fps | 16:9 + authored 9:16 | Give your impossible some Momentum. |
| AI 05 | `AI 05 - System Awake.dc.html` | dormant object → contour pulse + articulation → ribbon escapes → mark | three.js; asymmetric machined assembly, contour-sampled pulse tube, causal shell hinges, escaping ribbon | 18 s | 540 frames @ 30 fps | 16:9 + authored 9:16 | This is what next feels like. |

Shared: `film-kit.js` (alpha-safe renderer, deterministic clock, player, preview-background layer, in-scene end card, sound synthesis). `QA-alpha-check.html` (alpha + timing harness).

## Beat map (identical spine, different action)

| Beat | Window | AI 01 | AI 02 | AI 03 | AI 04 | AI 05 |
| --- | --- | --- | --- | --- | --- | --- |
| 01 | 0–3 s | lit atom, one impulse at 2.35 s | dense readable field | dial in extreme close-up | enormous WHAT IF, cropped | dormant object, floating |
| 02 | 3–7/9 s | chain reaction through the particles | tide sweeps and carries the noise | pathways coordinate, handoff per bead | contracts to phrase, edges break | pulse traces contour, shells open |
| 03 | 7/9–14 s | three structures, then one system | one signal, lens bend, resolve | mechanism opens, last glide | prism aperture, fly-through, return | ribbon escapes, sketches, settles |
| 04 | 14–18 s | exact logo + launch line | exact logo + launch line | exact logo + launch line | exact logo + launch line | exact logo + launch line |

## Render hook (per film)

Every film exposes a deterministic surface on its own window:

```js
window.__momentumFilm.ai01 = {
  fps: 30,
  authoredSeconds: 18,
  frames: 540,
  aspects: ['16:9', '9:16'],
  renderFrameAt(n),      // renders authored frame n exactly; returns {frame, seconds}
  seekSeconds(sec),      // same, addressed in seconds
  setAspect('16:9'|'9:16'),
  capturePNG(),          // data:image/png of the RGBA object layer
  alphaObjectLayer: true
}
```

`renderFrameAt(n)` is a pure function of `n` — no accumulated state, no wall clock, no random values at playback (all noise is index-hashed). Frame *n* is byte-identical on every pass, in either aspect. The DOM also honours `data-om-seek-to-time-frame` and carries `data-om-exportable-video-with-duration-secs`.

### Alpha PNG frame sequence

```js
const f = window.__momentumFilm.ai01;
f.setAspect('16:9');
for (let n = 0; n < f.frames; n++) {
  f.renderFrameAt(n);
  const png = f.capturePNG();   // RGBA, transparent everywhere the film is empty
  // write png to ai01/16x9/frame_0000.png … frame_0539.png
}
```

540 frames per aspect per film; 1 080 per film across both aspects; 5 400 frames for the set.

**The exact logo and the launch line are inside this same layer.** They are textured planes in the WebGL scene (the logo from the untouched master PNG, the type drawn on transparent canvases), so one RGBA pass carries object *and* brand finish. There is no separate DOM burn-in and no second compositing step needed for the ad frame. The only DOM-side visual is the preview background, which sits *behind* the canvas and is never captured.

## Produced vs pending — stated honestly

**Produced in this project (real, runnable files):**
- Five film pages that render live in a WebGL browser, each with its own scene.
- The shared runtime, the QA harness, this manifest, `REFERENCES.md`.
- A working per-frame RGBA capture path, callable now from the console or a driver script.

**Not produced, and not claimed:**
- **No rendered PNG sequences are written to disk in this project.** The path above is implemented and callable; nobody has run 5 400 captures here.
- **No MP4, no ProRes, no transparent master file exists.** An HTML preview is not a rendered video. When a review MP4 is encoded it must be labelled opaque — an MP4 in these settings is not a transparent master; the RGBA PNG sequence is.
- No upload, publish, deploy, purchase, subscription or external send was performed.

## Constraints held

Original geometry, particles and type throughout — no raster background rectangles anywhere, so there is nothing to hide behind. No invented metric, client result, dashboard number or deployed-product promise. No Momo, mascot, ceramic character, book, page turn or desk. Exact logo master only. Existing films (`Film A`, `Film B`, `The Next Chapter Series`, `Meet Your Team - Character Shorts`, and the paused `Flagship - Built Not Prompted`) are untouched.
