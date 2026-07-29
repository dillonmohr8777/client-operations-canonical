# Align HCM particle intro — industries / public sector video

A 2.9 second branded open for `alignhcmindustries_0701.mp4`. Particles streak in
and converge into the Align lockup, the mark snaps crisp and the tagline rises,
then the lockup bursts back into particles and a flash reveals the video's first
content page.

The build also strips the `HUMAN CAPITAL MANAGEMENT` tagline from the closing
card. See [Outro tagline removal](#outro-tagline-removal).

**Output:** 1920x1080, 30fps, 63.0s total (1,890 frames), H.264 at ~3.07 Mbps.
The source video runs at 2.67 Mbps, so the encode is not the limiting factor.

## It replaces the original open, it does not stack on top of it

The source video already opened with a static Align logo: frames 0 to 144 hold
the logo, then frames 145 to about 162 dissolve into the first content page.
Prepending another logo animation would have shown the mark twice, so the intro
takes over that whole opening. The body is picked up at **t = 5.40s**, once the
content page has settled, and the two are joined with a 0.30s crossfade under
the flash. The join is invisible because the flash is still lit when the page
arrives.

Nothing after t = 5.40s of the original is altered. The full timeline was checked
end to end: every section, the customer logo cluster, the SmartCare panel, and
the closing lockup are intact.

## The logo is the video's own artwork

Rather than sourcing a logo file, the mark and tagline were cut out of the
video's own frame at t = 3.5s, and the background is the video's empty frame 0
(gradient, top rule, and footer strip included). So the intro is guaranteed to
match the deck it introduces, down to the background gradient. Recompositing the
cutouts back onto the plate reproduces the original frame pixel-clean.

* `assets/logo.png` — Align lockup, RGBA cutout, 1043x404
* `assets/tagline.png` — HUMAN CAPITAL MANAGEMENT, RGBA cutout, 855x48
* `assets/bgplate.png` — the video's empty frame 0, 1920x1080

Particle targets are sampled from the opaque pixels of `logo.png` on a 6px grid,
which yields 4,042 particles carrying their own source colour. The navy wordmark
and the orange chevrons and dots therefore assemble in their true brand colours.

## Timeline

| Beat | Time | What happens |
|---|---|---|
| Assemble | 0.15 – 1.35s | Particles converge from off frame on curved paths, staggered arrival, motion streaks |
| Crystallise | 1.15 – 1.48s | Particle field cross-fades into the crisp lockup, warm bloom behind the mark |
| Tagline | 1.45 – 1.72s | Tagline rises and fades up |
| Hold | 1.72 – 1.95s | Full lockup |
| Disperse | 1.95 – 2.62s | Particles re-emerge and burst outward with drag, drift, and turbulence |
| Flash | 2.48 – 2.90s | Radial bloom peaks at 2.68s, still lit at the handoff so the page resolves out of it |

Timings live in the `T` object at the top of `intro.html`.

## Outro tagline removal

The closing card carried `HUMAN CAPITAL MANAGEMENT` under the mark, which now
also appears in the intro, so it was removed from the outro. What stays: the
logo, the thin divider rule, `Align moves at your speed. / Which is always right
now.`, and `ALIGNHCM.COM`.

The tagline fades in at frame 1823 and holds to the end of the video, and it
animates: it enters spanning x=420..1487 and contracts to x=472..1439, so the
patch has to cover the widest frame, not the settled one.

Two approaches were tried and rejected before the current one:

* A static background patch lifted from a frame just before the tagline appears.
  The card's gradient drifts through the outro (mean delta of 8.4 over an
  always-empty control band), so a fixed patch drifts out of match.
* `ffmpeg delogo`. It removes the glyphs but leaves visible vertical streaks
  where the letters were, because the box is wide and short.

`remove-outro-tagline.py` instead rebuilds the band per frame, per column: rows
518..575 are refilled with a linear ramp between clean background sampled at
y=500..517 above and y=575..595 below, the edge profiles are box-smoothed across
x to reject grain, matched grain is added back so the patch is not glassy, and
the top and bottom five rows are feathered into untouched pixels so no seam can
show. Sample rows are safe on every outro frame: the logo ends at y=471, the
tagline spans y=526..567, the divider sits near y=628, and the slogan starts at
y=693.

Verified on the finished file: 0 to 4 stray pixels in the tagline band across the
outro, which is grain rather than letterforms, against ~15,270 px of slogan and
377 px of divider rule still present. See `qa-outro-tagline-removal.png`.

## Rebuilding

```sh
npm i playwright
./build.sh /path/to/alignhcmindustries_0701.mp4
```

Rendering is deterministic. Particle randomness comes from a seeded mulberry32
PRNG fixed at init, and frames are driven by an explicit `window.drawFrame(n)`
counter rather than wall-clock time or `requestAnimationFrame`, so any frame
re-renders identically. `node render.mjs 32,60,80` renders just those frames when
iterating on the look.

The renderer serves the page over a throwaway local HTTP server because reading
image pixels from a `file://` origin taints the canvas and blocks `getImageData`.

## In this folder

* `intro.html` — the animation, timeline, and particle system
* `render.mjs` — frame renderer, drives Chromium and writes `frames/f%04d.png`
* `remove-outro-tagline.py` — per-frame rebuild of the outro tagline band
* `build.sh` — the whole pipeline: render, outro patch, single-encode assembly
* `intro-preview.mp4` — the 2.9s intro on its own, compressed for review
* `qa-intro-beats.png` — the intro's key frames
* `qa-join-transition.png` — the handoff sampled every 0.1s from 2.40s to 3.70s
* `qa-outro-tagline-removal.png` — outro card before and after, including the
  fade-in frames where the tagline is at its widest

The 24 MB finished master is not committed. This repository keeps video artifacts
under about 6 MB and has no LFS configured, so the master was delivered directly
and is reproducible from `build.sh` plus the source video.

## Notes

* The intro stays in the video's light cream palette so it does not break the
  deck's look. A dark navy variant with a white wordmark would read as a more
  dramatic sting and is a small change in `intro.html`, but it needs sign-off
  because it means recolouring the mark for a dark background.
* `HUMAN CAPITAL MANAGEMENT` still appears in the intro at 1.45s. It was removed
  from the outro only, so the descriptor now reads once per video instead of
  twice. Drop `T.tagIn` / `T.tagOut` from `intro.html` if it should go from both.
* The divider rule on the closing card was kept. With the tagline gone it sits on
  its own between the mark and the sign-off, which reads as an ornament and lets
  the card breathe, but it is inside the same band and trivial to remove too.
* The source video has no audio track, so the intro is silent and no audio
  handling was needed. If a stinger is ever added, the flash at 2.68s is the hit.
