# NeedMomentum website hero video

Prepared August 4, 2026 from the supplied 1280x720 founders walk-up clip. The
9-second source now opens and closes on the blue Need Momentum mark, with a
particle build on both ends and a dark blue/black end card carrying the phrase.

## What was added

- **Open (0.00-2.75s).** Blue particles stream in from off-frame and converge
  into the Need Momentum mark over a dark navy field, hold crisp for about half
  a second, then burst apart as the footage dissolves in.
- **Film (2.25-11.29s).** The supplied clip, ungraded. It cross-dissolves with
  the open across its first 9 frames — the last of the burst particles trail
  over it, dimmed as the footage comes up — and is then completely clear of
  overlays until the end-card dissolve begins at 10.58s.
- **End card (11.29-17.58s).** The footage dissolves into a dark-blue-to-black
  card. Particles rebuild the mark, then the mark sheds particles that fly out
  and settle left-to-right into **NEED MOMENTUM?**. The finished card holds for
  about 3.2 seconds while the wordmark pulses.

Every particle is sampled from the mark itself and carries the mark's own
colors, so the blue disc, the white ring gap, and the white script `m` all
resolve out of the same point cloud. The wordmark's particles are emitted from
inside the mark and turn white as they land.

## The pulse

Once the wordmark lands it breathes on a 38-frame (1.58s) cycle, phased to
start from rest at the exact frame it finishes forming. Three things move
together on that one beat, so it reads as a single pulse rather than competing
rhythms:

- a blue halo behind the type, rising and falling
- the type's own brightness, over a narrow 0.92-1.03 range
- the settled grains sitting on the letters, twinkling up to 42% brighter

The blue pool behind the mark breathes on the same beat at low amplitude. The
hold runs exactly two cycles and ends at rest, so the last frame is a clean
loop point back to the black open.

## Package contents

| File | What it is |
|------|------------|
| `need-momentum-hero-1200x628.mp4` | Primary web deliverable. H.264 High, yuv420p, 24fps, faststart, no audio. 4.6 MB. |
| `need-momentum-hero-1200x628.webm` | VP9 alternate for modern browsers. 1.4 MB. |
| `need-momentum-endcard-1200x627.png` | End card still at exactly 1200x627, lossless. Grabbed at a pulse peak (frame 365), the strongest frame of the card. |
| `need-momentum-endcard-1200x627.jpg` | Same still as JPEG, 77 KB, for the `poster` attribute or an OG image. |
| `source/build.py` | The renderer. Rebuilds the mark, lays out the type, runs the particle simulation, and pipes frames to ffmpeg. |
| `source/prep.sh` | Extracts the cropped frames and drives `build.py` end to end. |
| `source/needmomentum-mark-blue.png` | The mark the whole piece is derived from. |

## Note on 1200x627

The stills are exactly **1200x627**. The video files are **1200x628**.

Cropping a still to an odd height needs `format=rgb24` ahead of the crop in the
ffmpeg chain, for the same chroma reason — crop on a yuv420p stream rounds 627
down to 626 without warning.

H.264 and VP9 in 4:2:0 cannot store an odd frame height — chroma is subsampled
2x vertically, so the height has to be even. Asking ffmpeg for 627 silently
yields 626 and quietly drops a row. Rounding up to 628 instead keeps the full
frame and lands 1px from the request, which is invisible at any display size.
If the page hard-codes 627, the browser scales it by 0.16% and nothing shifts.

628 is also the standard 1.91:1 social/OG height, which is likely what the 627
figure was reaching for.

## Framing

The source is 16:9 (1.778) and the delivery canvas is 1.914, so the frame is
scaled to 1200 wide (675 tall) and cropped to 628. The crop takes 14px off the
top and 33px off the bottom — both bands are empty set, clear of the founders'
heads and below their hands.

## Type

`NEED MOMENTUM?` is set in **Outfit Bold**, uppercase, 0.155em tracking, 690px
wide and centered. Geometric and wide, so it sits with the round mark rather
than fighting it. Outfit is SIL Open Font License, so it is safe to ship.

The gap before the `?` is tightened to 14% of the tracking value. At 0.155em a
uniform gap pushes the mark away from the `M` and the line reads as
`MOMENTUM ?`; punctuation has to hug the letter it follows. `text_layer()`
applies the reduced gap to any of `?!,.:;`, so changing the phrase keeps the
behavior.

## Embedding

```html
<video
  src="need-momentum-hero-1200x628.mp4"
  poster="need-momentum-endcard-1200x627.jpg"
  width="1200" height="628"
  autoplay muted loop playsinline
  style="width:100%;height:auto;display:block">
</video>
```

Use `<source>` elements with the WebM first if you want the smaller file to win
where it is supported. The clip carries no audio track, so `muted` costs
nothing and keeps autoplay allowed on iOS and Chrome.

## Regenerating

```bash
cd source && ./prep.sh /path/to/generated_video.mov
```

Needs ffmpeg plus python3 with numpy, pillow, and scipy. Timing lives in the
constants at the top of `build.py`: `F_VID_START` sets how long the open runs,
`I_SCAT` the burst, `E_TEXT_D0` when the wordmark starts writing, `PULSE_PERIOD`
the pulse rate, and `F_TOTAL` the final hold. Keep `F_TOTAL` a whole number of
`PULSE_PERIOD` steps past `PULSE_T0` if the card should still end at rest.

The phrase itself is the `text_layer(...)` call next to `L_TEXT`; the width
argument is the rendered pixel width, and the type size is solved to hit it.

## Verified

- Output is 422 frames, 17.583s, 1200x628, 24fps, yuv420p.
- `moov` precedes `mdat` in the MP4, so it streams without a full download.
- The rebuilt mark was measured against the source along its midline; every
  blue and white band matches the original proportions within 0.5%.
- All 217 source frames are present and cropped only, none dropped or
  retimed. The first 9 dissolve in from the open and the last 17 dissolve into
  the end card; the 191 between them are untouched footage.
