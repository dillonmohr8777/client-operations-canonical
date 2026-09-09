# Export receipt — Momo: Living Portfolio Film

Title: **Ideas into motion.** · 30.00s · 16:9 master, considered 9:16 composition
Brand: Momentum Digital, AI Division. Not Momentum 360.

## What is actually running

Real WebGL. `momo-film-stage.js` builds a three.js scene (r0.160, ES module from
unpkg) with **seven subdivided planes**:

| sheet | source | geometry | role |
| --- | --- | --- | --- |
| reveal | `uploads/3-higgsfield-fb393c2f…MP4` (Momo Reveal, 8.05s) | 4.60 × 2.59, 72 × 44 segments | first curl toward camera |
| money | `uploads/2-higgsfield-f628dba4…MP4` (Momo Watches the Money, 28.709s) | 4.60 × 2.59, 72 × 44 | second orbit |
| great | `uploads/1-higgsfield-292070e9…MP4` (Great Ones Build Momentum, 29.708s) | 4.60 × 2.59, 72 × 44 | third orbit |
| design / marketing / automation | drawn canvas panels | 3.15 × 1.97, 56 × 36 | AI DESIGN / AI MARKETING / AI AUTOMATION |
| aeo | drawn canvas panel | 1.72 × 3.82, 40 × 76 | AEO + GEO, the long sheet |

Per-vertex displacement runs in an original GLSL vertex shader (`SHEET_VERT`):
a parabolic curl term toward the viewer plus two travelling sine currents, with
the surface normal rebuilt from finite differences so the paper lights
correctly as it bends. The fragment shader adds a Momentum-navy shadow term, an
action-blue rim, a gold hairline edge and a midnight depth fade. A second
full-frame pass (`POST_FRAG`) applies the broad fluid ripple: amplitude falls
off toward the centre of frame, and the two-tap separation is mixed strictly
between `--blue` and `--gold`. No rainbow, no gradient mesh, no glass.

This is not CSS. There are no CSS 3D transforms anywhere in the film.

## Determinism

Every transform is a pure function of `t` — sheets, camera, ripple amplitude and
the text beats are keyframe tracks or bands sampled from `t` alone. Scrubbing to
the same `t` produces the same frame every time.

Overlay type is sized off `--momo-fw`, the live frame width the stage writes on
resize, rather than viewport units — so the 16:9 and 9:16 compositions are
designed, and the 1080p master lands the title at ~108px, the meta line and the
closing URL at ~26px, all above the 24px floor.

The one honest limit: **HTML video decoding is not a pure function of t**, and
this sandbox will not decode three 1080p H.264 elements at once — two of three
wedge at `HAVE_METADATA` and never produce a frame, however the seeks are
serialised. So the film runs **one decoder at a time**:

- The video windows never overlap (reveal 3.2–12.5s, money 13.0–18.2s,
  great 18.4–27.5s). Exactly one clip holds a `src` at any moment; the others
  are detached with `removeAttribute('src')`.
- At boot each clip is loaded in turn, parked on its own featured still, and
  that frame is kept as a canvas texture. A sheet whose window has not started
  or has already closed shows **its own freeze frame**, so the settle frame
  carries all three films with a single decoder open.
- The live clip is **rate-locked** to its window (`clipSeconds / filmSeconds`,
  e.g. 0.82× for the reveal) and drift is trimmed by nudging `playbackRate`,
  never by seeking — seeking a playing 1080p element stalls it. Attaching a src
  is not the same as having a picture: a clip has measured up to ~5s to yield
  its first frame, and drift up to ~2.4s while spinning up, settling to a few
  tenths once running. Until the decoder delivers, the live sheet keeps showing
  its freeze frame rather than going blank.
- All seeks and freeze captures run through one serial queue. A clip that is not
  live is detached, so it acquires the decoder through that queue to capture its
  still and releases it again — and while paused the render loop keeps driving
  the queue until every visible sheet has an image.

**Decode never gates the imagery.** Each video sheet's base texture is a frame
baked out of that clip's own supplied master and committed to
`assets/stills/` — `reveal-a.png` (4.21s), `money-a.png` (8.71s),
`great.png` (11.59s), all three chosen mid-clip so Momo and the work are on
screen rather than a near-empty end frame. Image decode never fails, so the
films are on the sheets from the first frame and the hero curl always shows
Momo. Live video attaches over the top during each clip's window; when it
decodes it plays, and when it does not the baked still stands in its place.
`drawSlate()` survives only as a last resort if a still file is missing, and is
unreachable in normal operation.

Video decode in the preview is genuinely unreliable — a clip can sit at
`HAVE_METADATA` for its whole window, and canvas readback of video degraded to
returning blank frames partway through this build. That is why the stills are
baked rather than captured at runtime. The offline render path has no such
constraint.

Calling the frozen sheets "video" would be a lie, so: at any instant one of the
three films is moving and the other two are stills of their own footage. That is
a decode limit of the preview environment, not a design choice — the offline
render path in `render-frames.mjs` seeks every clip per frame and has no such
constraint.

## Sound

Off by default. When switched on it is a WebAudio synthesis built in the page —
three detuned sine partials at 55 / 82.5 / 110.3 Hz through a 320 Hz lowpass,
plus five short marker tones at the scene changes. No purchased track, no
generated music, no licence, no service call.

## Getting an actual MP4 — two free paths

Both paths capture the **whole frame**, sheets and text beats. Worth stating
plainly, because the WebGL canvas by itself holds only the sheets: the title,
the meta line and the end card (logo, "Make your next move.", needmomentum.com)
are HTML overlays sitting on top of the canvas inside `[data-momo-root]`.
Capturing the canvas or the stage element alone would give you a film with no
text at all.

**1. In-browser preview master (works right now).**
Press *Record master*. Capture runs through a 2D compositing surface — the GL
frame is drawn first, then `drawCaptureFrame()` redraws the text beats from the
same `beats(t)` function the live overlays use, so the file and the preview
cannot drift apart. `MediaRecorder` records that surface at up to 60 fps and
downloads `momo-ideas-into-motion-16x9.webm`. Then:

```
ffmpeg -i momo-ideas-into-motion-16x9.webm \
       -c:v libx264 -pix_fmt yuv420p -crf 18 -preset slow \
       momo-ideas-into-motion-16x9.mp4
```

Caveat: real-time capture. If the machine drops frames, the file drops frames.
The recording is made at the on-screen frame size, so widen the preview before
recording if you want a large master.

**2. Frame-exact PNG sequence (prepared, not run here).**
`export/render-frames.mjs` drives the page's `renderFrameAt(t)` from local
headless Chrome, stepping 30 fps and waiting for every video seek. It sizes
`[data-momo-root]` to 1920 × 1080 and screenshots that element, so the HTML
text beats are in every frame. Requires `puppeteer` and a static server, both
free and local. Full commands are in the header of that file.

Not done, and deliberately: nothing was published, uploaded, emailed or sent to
any third party, and no paid render or generation service was called.

## HyperFrames

The HyperFrames guide describes a CLI/account-based render pipeline. It was not
invoked and no HyperFrames render was purchased or queued. If you want that
route, the deterministic `renderFrameAt(t)` API is the hook it would drive —
same as the Puppeteer harness.

## Source material

All three MP4 masters are used byte-for-byte from `uploads/` as video textures,
and are the sole source of the baked stills in `assets/stills/` — each still is
a frame drawn straight off its own master, not a regenerated or substitute
image. Nothing was re-encoded, re-timed at the file level, or regenerated. Momo
is only ever your footage.

`assets/poster-16x9-settle-v2.png` and `assets/poster-9x16-settle-v2.png` are the
settle frame captured from this build, for use as thumbnails or reduced-motion
stills.

Logo (`assets/momentum-logo.png`), mark, Archivo Black, Nunito Sans and the four
ceramic service icons are the exact masters copied from the Momentum design
system. The wordmark is never recoloured, redrawn or typeset — on the end card
it sits unmodified on a white plate.

## Repairs — media robustness batch

`momo-film-stage.js` keeps its genuine three-clip detach (this film is the one
that really does need to free a decoder), with two additions:

- **Unhandled decode failure.** Each of the three video elements now carries an
  `error` listener: the sheet resolves to its baked still once, that clip is
  marked failed and never re-attached, and the page reports which clip fell back
  through `momo-state` (`mediaFallback`) as status text. Previously a decode
  error left a sheet waiting on a frame that was never coming.
- **Inert media elements.** `controls=false`, `tabIndex=-1`, `aria-hidden`,
  `disablePictureInPicture`, `disableremoteplayback` on all three — texture
  sources, not players.

Fresh-load verification, cold, no console output: `ready: true`, all three
clips carry baked stills, no media error on any element. Beats probed at 1.00 /
7.80 / 28.40s all draw; at the settle every sheet holds imagery
(`reveal:freeze`, `money:still`, `great:still`) with the ground on `--night`
rgb(0,22,46).

## Not claimed

No client name, no result, no metric, no deployment claim, no invented
statistic appears in the film or in the panels. Panel copy names Momentum
service lines and nothing else.
