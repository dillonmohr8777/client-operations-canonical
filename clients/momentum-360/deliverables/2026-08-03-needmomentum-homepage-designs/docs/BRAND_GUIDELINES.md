# Brand guidelines — as extracted, not as invented

Everything here was measured from the client's own files this session. Where a
value differs from what an earlier brief claimed, the measured value wins and the
difference is noted.

## The logo

The mark is a **blue ring containing a white flowing script lowercase *m***, with
the wordmark **MOMENTUM** set in letter-spaced geometric caps.

### How it was extracted

Source: `https://www.needmomentum.com/wp-content/uploads/2018/09/needmomentum_logo_blue.png`
(800 × 172, the file the client's own site serves).

1. The mark occupies x 25–170; the wordmark begins at x 203. Measured by scanning
   for non-transparent columns, not eyeballed.
2. Mark and wordmark were cropped, upscaled with Lanczos, thresholded and
   **vector-traced with potrace** (`--alphamax 1.334 --opttolerance 0.9`),
   then re-fitted into a single lockup with the wordmark cap height set to 42% of
   the lockup height and a 20% optical gap.
3. Coordinates were reduced to one decimal place. Result: a 9 KB lockup.

### Structure — and the one thing to know about it

The mark is a **filled blue disc with the script *m* knocked out to
transparency**, inside a blue ring. That means:

- On a **light** background the *m* reads white.
- On a **dark** background the *m* reads dark — the canvas shows through.

This is how the client's own file behaves, so the vector reproduces it faithfully
rather than "fixing" it. Both builds sit on a near-black canvas and use the
`-paper` variant, where the disc is paper and the *m* is canvas — which is legible
and reads as an intentional knockout.

The separate **Momentum 360** master
(`Momentum-360-Resized-Logo-1.png`, 950 × 204) is a different, richer treatment:
a photographic blue disc with a genuinely white *m* plus a gold wordmark. It ships
as a raster (`brand/momentum-360-lockup-{320,640,950}.{avif,webp}`) and is used
wherever the 360 service is endorsed.

### The files

| File | Use |
|---|---|
| `momentum-lockup.svg` | Primary. `currentColor` — tint from CSS. |
| `momentum-lockup-paper.svg` | On the dark canvas. Used in both navs and footers. |
| `momentum-lockup-blue.svg` | On light backgrounds. |
| `momentum-lockup-gold.svg` | Design B's arrival, and the particle assembly source. |
| `momentum-lockup-duotone.svg` | Blue mark + gold wordmark, matching the 360 master. |
| `momentum-mark{,-blue,-gold,-paper}.svg` | Mark alone, for tight spaces and the 360 loop. |
| `momentum-wordmark.svg` | Wordmark alone. |
| `momentum-360-lockup-*.{avif,webp}` | The 360 service endorsement. |
| `favicon.svg` | Mark knocked out of a blue rounded square. |

### Rules

- Minimum lockup width **132px**. Below that, use the mark alone.
- Clear space on all sides: **the height of the ring stroke × 4** (≈ 8% of lockup height).
- Never re-letter the wordmark in a substitute typeface. It is a traced outline, not live text.
- Never place the `-paper` variant on a light surface, or `-blue` on the dark canvas.
- The gold wordmark variant is reserved for the arrival moment and the 360 endorsement.

## Palette — measured from the logo pixels

| Token | Hex | Where it came from |
|---|---|---|
| `--gold-500` | `#F1B31E` | Momentum 360 wordmark, dominant fill (18,576 px sampled) |
| `--blue-500` | `#2A80C2` | Need Momentum mark, solid fill (24,232 px sampled) |
| `--blue-700` | `#0054A8` | 360 logo, deep gradient stop |
| `--blue-300` | `#72BADE` | 360 logo, highlight stop |
| `--m-paper` | `#FCFCFC` | The script *m* |

> An earlier brief carried `#F0AE1E` / `#2A7EC0`. Those came from a smaller
> 176px derivative. The 800px master gives `#F1B31E` / `#2A80C2`, and that is what
> ships.

Canvas is **navy-tinted, never pure black** (`--paper-0: #050810`), per the house
rule that neither `#000` nor `#FFF` is ever used raw.

### The gold rule

Gold is a verb, blue is the architecture. Gold appears only where the visitor
**commits, confirms, or reads an essential fact**:

- primary CTAs and the submit button
- numbers and awards
- station codes and section eyebrows
- Design B's rail — the single continuous stroke

Blue carries structure: strokes, diagrams, glass tints, the globe wireframe, the
photographic grade. **Gold is never decoration.**

## Typography

| Role | Family | Notes |
|---|---|---|
| Display | **Poppins** 600/700/800 | What the wordmark is set in, and what the live WordPress site already loads. |
| Body | **DM Sans** 400/500/700 | Stays out of the way. |
| Accent | **Source Serif 4** italic 400 | The second hero line, pull quotes, one-line statements. |
| Mono | system `ui-monospace` | Station codes, HUD labels, eyebrows. Zero download cost. |

One Google Fonts request, identical in both builds, after `preconnect` to both
font origins.

> **A bug this fixes:** the existing earth site declares `--font-sans: "Poppins"`
> and `--font-serif: "Source Serif 4"` and loads **no font files at all** — no
> `@font-face`, no Google Fonts link, no preconnect. Both new builds actually
> load them.

### Hard limits (house standard)

- Display headings capped at **6rem**; tracking never tighter than **-0.04em**.
- Line-height never below **1.0**; every display heading carries
  `padding-bottom: 0.22em` so descenders cannot clip.
- Body measure **46ch** — narrow enough that over-writing is physically awkward.
- Uppercase is limited to genuine system state (station codes, HUD, eyebrows).

## Shape and elevation

- Controls **8px**, operational surfaces **14px**, cinematic frames and
  conversion portals **28px**. Pills reserved for status and compact controls.
- **One optical edge or one shadow, never both as decoration.**
- Glass = tinted fill + real `backdrop-filter` blur/saturate + a gradient rim
  drawn with `mask-composite`. An opaque `--paper-2` panel is the fallback where
  `backdrop-filter` is unavailable, so text contrast never depends on what is behind it.

## Motion

The canonical house set, unchanged:

```
--ease           cubic-bezier(.16, 1, .3, 1)     "momentum ease"
--d-snap         160ms   press feedback
--d-ui           320ms   controls and state changes
--d-lively       520ms   a single success beat
--d-gentle       720ms   large surfaces and portraits
--d-ambient     3800ms   guarded background motion only
```

Transform and opacity only. Nothing over **1.1s**. No scroll-jacking, no autoplay
carousels, no parallax on text. Every build ships a persisted **"Motion on"**
toggle, and `prefers-reduced-motion` is honoured independently of it.

## The self-check

> *"Could a competitor's logo drop onto this page unchanged? If yes, the design
> isn't theirs yet."*

Design A: no — the globe, the Philadelphia coordinate lock and the HUD vocabulary
are specific to a company whose product is being findable.

Design B: no — the rail is drawn from the swash of this logo's script *m*, and at
ST/07 it closes into the 360 mark. Neither survives a logo swap.
