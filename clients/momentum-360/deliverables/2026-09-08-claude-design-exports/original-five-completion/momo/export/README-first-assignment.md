# Export receipt — Momo: First Assignment

Artifact: **`Momo - First Assignment.dc.html`** (engine: `momo-assignment-stage.js`)
Title: **One brief. A connected next step.** · 24.00s · 16:9 master + recomposed 9:16
Brand: Momentum Digital, AI Division. Not Momentum 360.
Status: **proposed concept work.**

## Story beats, as implemented

| t | beat |
| --- | --- |
| 0.0–2.0 | the brief flies in from off-desk, flutters, lands and flattens |
| 2.0–6.0 | Momo's card slides in and holds; text beat "One brief. / Sort the job." |
| 6.0–16.0 | four task cards deal out one at a time (6.4 / 8.8 / 11.2 / 13.6), each landing and holding still to be read; the connection thread draws at 15.4 |
| 16.0–20.0 | the four lift, converge and tuck; the campaign sheet rises and settles |
| 20.0–24.0 | exact Momentum wordmark on a white plate, "One brief. A connected next step." |

## What is actually running

Real WebGL — three.js r0.160 as an ES module. Nine subdivided planes lie on a
64×64 paper desk, rotated flat in world space (`rotation.order = 'YXZ'`,
`rx = -π/2 + tilt`, `ry` = spin on the desk) so the camera can move around them.

Per-vertex displacement is an original GLSL shader: a lifted leading edge
(`uCurl · y² · 2.6`) plus two slow cross-sheet flex terms, with the normal
rebuilt from finite differences so paper catches light as it drops and flattens.
Both displacement terms are deliberately **one-sided (≥ 0)** — an early build let
cards displace *below* their own plane, and the opaque desk clipped visible bites
out of the paper.

The fragment shader decodes sRGB textures to linear by hand (a raw
`ShaderMaterial` gets none of three.js's colour management), lights in linear
from an above-left key matching the ceramic artwork's own studio light, and the
post pass encodes back to sRGB. Texture alpha is folded into the cut mask
*before* the discard, so the partly transparent connection sheet neither paints
black nor writes depth over the cards behind it.

Post is quiet on purpose — encode, a restrained corner falloff, and a brief
blue/gold bloom on identity beats only. The desk itself is a flat `--field`
colour with no pattern, texture or gradient. This film's motion is paper and
camera, not screen warp.

## Determinism and the export contract

`stage.timingContract` returns it at runtime:

- duration 24.00s, 30fps, **721 frames**
- every card transform, camera position, look target, bloom and dim value is
  `sample(track, t)` — a pure function of t
- `await stage.renderFrameAt(t)` seeks the decoder, drains the serial seek queue
  (up to 3 passes) and then draws
- masters: `16:9` and `9:16`

The one non-deterministic input is HTML video decode, and it is contained: the
video surface falls back to its baked still whenever the decoder has no frame.

## One live decoder

Only Momo's card carries moving video, and only between 2.05s and 6.90s
(consuming 4.6s of the Momo Reveal master from 0.55s, rate-locked at 0.95×).
Outside that window the clip is detached with `removeAttribute('src')`.

The card's **base** texture is `assets/stills/reveal-a.png`, a frame baked out of
that same supplied master, so Momo is on the card from the first frame and
attaching a source is never confused with having a picture. Drift is trimmed by
nudging `playbackRate`, never by seeking — seeking a playing 1080p element
stalls it.

## 9:16 is recomposed, not cropped

The vertical master has its **own authored track set** (`TRACKS_P`). The four
task cards form a single column rather than a squeezed 2×2 (the first build
squeezed the grid and the cards collided), the connection sheet is redrawn as a
vertical spine (`drawWeb(true)`) stretched into place and stitched *over* the
paper, the campaign sheet drops to 0.65 scale, and the brief and Momo park at
the head of the desk side by side. Camera fov opens 36° → 46°.

## Source material and artwork

- Momo footage: `uploads/3-higgsfield-fb393c2f…MP4` (Momo Reveal, 8.05s), used
  byte-for-byte as a video texture. `assets/stills/reveal-a.png` is a frame from
  that same file. No character was regenerated and no face redrawn.
- Ceramic service icons: `icon-search`, `icon-build`, `icon-audience`,
  `icon-operations` — exact masters from the Momentum design system. They are
  supplied on **white**, so an early midnight plate simply sat behind an opaque
  image; they are now contained in the pale 14px-radius surface the system
  already uses, with a hairline. Artwork itself untouched, never recoloured.
- Wordmark: `assets/momentum-logo.png`, exact master, unmodified on a white
  plate — in both the live overlay and the composited capture.
- Type: Archivo Black for display, Nunito Sans for everything else. Card type is
  sized so the smallest copy clears 24px at 1920 master scale.

## Sound

Off by default. When enabled: three detuned sine partials (55 / 82.5 / 110 Hz)
through a 300 Hz lowpass, plus short band-passed noise bursts for paper
landings and five marker tones. All synthesized in the page. No purchased track,
no generated music, no licence, no service call.

## Getting a file out

*Record master* captures a composited 2D surface — the WebGL frame with the same
text beats drawn over it from `beats(t)`, the single source the DOM overlays also
read, so the file cannot drift from the preview. Then:

```
ffmpeg -i momo-first-assignment-16x9.webm \
       -c:v libx264 -pix_fmt yuv420p -crf 18 -preset slow \
       momo-first-assignment-16x9.mp4
```

Two honest limits: it is a real-time capture (dropped frames on the machine
become dropped frames in the file), and it records at on-screen size × device
pixel ratio, not a true 1920×1080. For a genuine 1080p master, drive
`renderFrameAt(t)` from local headless Chrome — `export/render-frames.mjs` in
this project does exactly that for the portfolio film and needs only its page
path and duration changed.

Nothing was published, uploaded, deployed or sent to any third party, and no
paid render, generation service or subscription was used.

## Repairs — media robustness batch

Applied to `momo-assignment-stage.js` at the root cause:

1. **Source detach removed.** `releaseSrc()` used to `removeAttribute('src')`
   and `load()`, which aborts a pending load and leaves the element in an
   error/empty state — a native media error with nothing catching it. This film
   has one video and no second decoder to free, so the source is attached once
   and retained; outside its window the element is simply paused.
2. **Unhandled decode failure.** The video element had no `error` listener. It
   now resolves to the baked still once, never retries, and reports through
   `momo-state` (`mediaFallback`), which the page surfaces as status text.
3. **Inert media element.** `controls=false`, `tabIndex=-1`, `aria-hidden`,
   `disablePictureInPicture`, `disableremoteplayback` — a texture source, not a
   player; no host media chrome can attach to it.

Fresh-load verification, cold, no console output: `ready: true`, decoder
`readyState 4`, no media error, `frames: 721` at 24.00s / 30fps. Beats probed at
1.00 / 4.00 / 12.00 / 18.00 / 22.00 / 23.99s all draw; Momo's card reads `video`
at 4.00s and `still` outside the window. Rendering `t = 12.00`, leaving to
`t = 3.00` and returning gives byte-identical probes. 9:16 recomposes to
430×764 with `portrait: true`, nothing clipped.

## Not claimed

The brief card is labelled SAMPLE BRIEF · ILLUSTRATIVE; the campaign sheet
FOR HUMAN REVIEW · PROPOSED CONCEPT; the end card PROPOSED CONCEPT. No client
name, no result, no metric, no deployment claim and no invented statistic
appears anywhere in the film.

## QA performed

Beats rendered and inspected via `renderFrameAt`: 1.62 (brief lands), 3.90
(Momo), 12.70 and 15.90 (four cards + thread), 19.60 / 19.90 (assembly), 21.60
(end card) — in 16:9; plus 15.90 and 21.60 in 9:16. Console clean.

Defects found and fixed in this pass: cards clipped by the desk plane
(one-sided displacement); desk edge entering frame (plane 20 → 64); connection
sheet rendering as an opaque black cross (texture alpha ignored); ceramic icons
losing their containment on white; task-card copy below the 24px floor at frame
scale; pale meta text unreadable on the pale desk at the assembly beat (now
navy); campaign row name/description columns colliding; four framing cuts
(brief, Momo, the tucked row); 9:16 grid collision (recomposed as a column);
overlay set collected before React finished streaming (retry until complete).

`assets/qa/` holds the frames captured during this pass.
