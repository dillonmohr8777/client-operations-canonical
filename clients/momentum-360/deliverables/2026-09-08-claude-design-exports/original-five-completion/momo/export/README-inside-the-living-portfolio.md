# Export receipt — Momo: Inside the Living Portfolio

Artifact: **`Inside the Living Portfolio.dc.html`**
Engine: `momo-gallery-stage.js` (`<momo-gallery-stage>`)
Title: **Inside the living portfolio.** · 20.00s · 16:9 master + authored 9:16
Brand: Momentum Digital, AI Division. Proposed concept work.

Preserved untouched: `Momo - Living Portfolio Film.dc.html`,
`Momo - First Assignment.dc.html`, `One Idea Everywhere.dc.html` and their
engines. This is a fourth, separate film.

## What makes it a distinct direction

The motion is **camera travel through architecture**. Nothing in the gallery
moves. Three bays are fixed geometry hung on one navy wall — white matte board,
gold hairline, a wall plaque beneath each — inside a corridor of back wall,
floor, ceiling and two side returns.

| beat | time | camera |
| --- | --- | --- |
| establish, readable on frame one | 0.00–1.20 | standing off Momo's bay at 8.0 units |
| approach | 1.20–3.40 | dolly in to a 6.2-unit standoff |
| hold | 3.40–4.60 | still |
| traverse to scene 02 | 4.60–7.80 | lateral, fixed eyeline |
| hold | 7.80–9.00 | still |
| traverse to scene 03 | 9.00–12.00 | lateral, fixed eyeline |
| hold | 12.00–13.20 | still |
| pull back to the collection | 13.20–16.40 | out to 17.9 units, all three in frame |
| datum joins the three | 13.60–16.20 | gold wall rule draws outward |
| end mark | 17.70–20.00 | held, exact Momentum logo |

No orbiting sheets, no bending planes, no paper tumbling, no book turns, no desk
routing, no halftone character work. Dolly distances are computed against each
lens (at 36° in 16:9 the visible width is 1.155 × standoff), so a bay reads
inside the architecture instead of overfilling the frame.

## Timing contract

`stage.timingContract`, verified live:

```
film: inside-the-living-portfolio
slug: momo-inside-the-living-portfolio
duration: 20    fps: 30    frames: 601    poster: 15.8
decoders: 1
masters: ['16:9', '9:16 (authored vertical walk, not a crop)']
```

The bays are fixed; camera position, look target, wall datum and dim are each
`sample(track, t)` — a pure function of `t`. `renderFrameAt(t)` is **bounded**: a
hard 3-second ceiling across at most three queue passes, so a stalled decode can
never hang an export run. Measured round trip for a seek-and-draw: 172 ms.

## Media — one live decoder

Momo's bay is the only moving image, between 1.30s and 6.40s of the film,
consuming 4.60s of `uploads/3-higgsfield-fb393c2f…MP4` (Momo Reveal, 8.05s)
from 0.90s, used byte-for-byte as a video texture.

The other two bays hang the frames already baked from the other two masters:

- Scene 01 `assets/stills/reveal-a.png` — base texture for Momo's bay
- Scene 02 `assets/stills/money-a.png` — Watches the Money
- Scene 03 `assets/stills/great.png` — Great Ones Build Momentum

Every bay shows its baked still first and swaps to video only once the decoder
reports `readyState >= 2`, so a bay is never empty. The source is attached once
and **retained** — outside its window the element is paused, never stripped of
its `src`, because stripping it aborts the pending load and is what raises a
native media error. The element is inert (`controls=false`, `tabIndex=-1`,
`aria-hidden`, `disablePictureInPicture`, `disableremoteplayback`): a texture
source, not a player. A decode failure resolves to the baked still once, never
retries, and reports in plain words through `momo-state`.

No character was regenerated, no face redrawn, no scene invented. The wordmark
on the end card is the exact master, unmodified, on a white plate.

## Copy in the film

Wall plaques (drawn into the bay textures, set in the system's meta and display
registers): SCENE 01 / Momo. / "The guide who walks the work." · SCENE 02 / The
watch. / "Attention held on what matters." · SCENE 03 / The build. / "Momentum,
put together in public." Overlay beats: INSIDE THE LIVING PORTFOLIO, the title,
THREE SCENES · ONE CONNECTED COLLECTION on a solid navy plate, and the end mark
"The whole portfolio in one walk." with PROPOSED CONCEPT.

## Sound

Off until switched on. Three synthesized sine partials (55 / 82.5 / 110 Hz)
through a 280 Hz lowpass, plus four marker tones at the walk's beats, generated
in the page. No purchased track, no generated music, nothing licensed.

## MP4

`Record master` composites the GL frame with the same `beats(t)` text and
captures in real time:

```
ffmpeg -i momo-inside-the-living-portfolio-16x9.webm \
       -c:v libx264 -pix_fmt yuv420p -crf 18 -preset slow \
       momo-inside-the-living-portfolio-16x9.mp4
```

Real-time capture at on-screen size, not a frame-exact 1920×1080 render. For a
true master, `export/render-frames.mjs` drives `renderFrameAt(t)` from local
headless Chrome; point its `MOMO_PAGE` at this file. Free and local. Nothing was
published, uploaded, sent or purchased.

## Verification — fresh load

Loaded cold. Console clean (the only entries were from a deliberate bad-URL
fault injection, below).

**First / middle / end, 16:9**
- `t = 0.00` — readable immediately: Momo's bay fills the composition inside the
  navy corridor, matte and gold hairline present, plaque below, scene 02 visible
  at the right edge. Baked still up, `readyState 4`.
- `t = 4.00` — bay texture reads `video`; the live decoder is inside its window.
- `t = 8.40` — camera at scene 02, bay texture `still`.
- `t = 15.80` — pull-back: all three bays in frame, gold datum drawn across.
- `t = 18.90` — end mark, exact logo on white plate over the dimmed gallery.
- `t = 19.99` — held.

**Determinism** — rendering `t = 8.40`, leaving to `t = 2.00` and returning
gives byte-identical pixel probes. Bounded seek confirmed at 172 ms.

**Both aspects** — 9:16 recomposes to 430×764, `portrait: true`, lens opens to
46°, layout switches to `tall`: the three bays re-hang up the wall, the datum
becomes a vertical gold rule, and the camera walks vertically. Wide datum
hidden, tall datum shown. Nothing clipped at any edge. Returning to 16:9
restores the lateral walk.

**Media error** — pointed the decoder at a missing file. `MEDIA_ELEMENT_ERROR`
code 4 was caught, `failed` latched true, the bay held its baked still, and the
page showed "This browser could not decode the Momo clip. His bay is holding the
frame baked from that same master." Restoring the real source recovered to
`readyState 4` and a live `video` texture.

**Colour** — one real bug found and fixed during the build: `THREE.Color`
already converts a hex to linear, and the surface shader was converting a second
time, crushing the navy walls to near-black. Solid surfaces now read
rgb(0,42,79) against `--navy` #072d53 = rgb(7,45,83). Texture samples still
decode manually, which is correct — a raw `ShaderMaterial` gets none of
three.js's colour-management injection.

**Legibility** — the collection line originally sat over a cream still in
portrait at roughly 1.5:1. It now sits on a solid navy plate in both aspects,
white on #072d53, in the DOM overlay and the capture path alike.

## Not claimed

No client name, no result, no metric, no deployment claim. Nothing was
published, deployed, sent or purchased, and no paid render or generation service
was called.
