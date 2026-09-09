# Momentum AI — Higgsfield prompt pack

Paste-ready. Same pipeline that produced the Momentum 360 Future City films
(278 credits, two 4K masters) and the scroll-site walkthrough (94.5 credits).
Runs in the Higgsfield web app by hand, or through the connector once it is
authorised. Either way the steps, the prompts and the review gates are these.

**Palette words used in every prompt:** *deep navy-black field · cool blue
daylight · one warm amber-orange signal · no cyan, no yellow, no purple, no
neon.* That is the Momentum Digital token set (deep `#0e1a22`, brand
`#1e73be`, accent `#f58320`) spoken in a way a diffusion model understands.

**Technique borrowed from the 360 films:** one real environment held inside a
suspended, torn photogrammetry fragment on a clean negative field; particles
that mean something (sample a surface, trace a route, resolve a shape);
controlled dolly and one orbit; no handheld; photographic, high bitrate.

**Never in any prompt's output:** text, letters, captions, logos, watermarks,
UI, charts, readable screens, faces, hands, people, product labels, lens flare.
Type and the mark are composited afterwards from `title-cards.html`.

---

## Pipeline (per film)

| Step | Model | Credits (measured) | Gate before the next step |
|---|---|---|---|
| 1. Keyframe | GPT Image 2, 2K, aspect as listed | 8.5 | Composition reads at thumbnail size; negative space where the card will sit; nothing on the banned list |
| 2. Test leg | Seedance 2.0 Mini, 4s, start image = keyframe | 10 | Midpoint and last frame reviewed; camera obeys; no morphing |
| 3. Remaining legs | Seedance 2.0 Mini, 4s each, **start image = actual last frame of the previous leg** | 10 each | Same review per leg |
| 4. Join + overlay | local `composite.ps1` | 0 | Four QA frames per derivative, mark undeformed |

Why Mini: the 2026-08-30 receipt records a head-to-head where the 1080p
Seedance 2.0 leg was **rejected** for weakening the shot; the accepted chain
was Mini, at 3.6× less per leg. No faces anywhere in this set, so the Seedance
2.5 identity path (135 per render) is not needed.

**Reverify credit rates in the account before the first paid job.** The
numbers above are receipts from August, not a current price list.

**Preflight:** confirm Mini accepts 9:16. If not, generate 16:9 with the
subject centred and let `composite.ps1 -Derive 9x16` crop it. Do not pay for a
2.5 render to get vertical.

---

## F01 — Division opener · 16:9 master · 4 legs · 48.5 credits

**Keyframe (GPT Image 2, 16:9, 2K)**

> A Philadelphia rowhouse block at blue hour, held inside a single suspended torn photogrammetry fragment floating on a clean deep navy-black field. The fragment has fibrous torn edges, sparse point-cloud gaps and folded depth. Cool blue daylight inside the fragment; one warm amber-orange practical light in a single corner storefront window. Photographic, 35mm, high detail, commercial editorial grade. Clean negative space on the left third of the frame. No text, no signs, no logos, no people, no UI, no lens flare.

**Legs (Seedance 2.0 Mini, 4s each, chain from last frame)**

- Leg 1: *Slow dolly toward the suspended fragment as it rotates a few degrees. Nothing inside moves yet. Controlled camera, no shake.*
- Leg 2: *Inside the fragment, warm amber-orange particles sample the storefront surface and begin tracing a clean route along the block. Cool blue light steady.*
- Leg 3: *The amber route gathers into a single orbit around the corner building. The fragment holds its rotation.*
- Leg 4: *The fragment folds inward one step and settles. End on a stable frame with the left third empty. No further motion in the last second.*

**Negative (all legs):** text, letters, logos, watermarks, UI, faces, hands, people, cars moving, lens flare, neon, purple, cyan, yellow, cyberpunk, particle explosion, dirty grey void, full-frame city, camera shake.

**Overlay:** card A (`?card=0`), then card Z as outro, 2.0s hold.

---

## F02 — Lane 01 · Get found by AI · 9:16 · 3 legs · 38.5

**Keyframe (9:16, 2K)**

> A tall radio mast on a dark hillside at dusk, inside a suspended torn photogrammetry fragment on a deep navy-black field. Cool blue atmosphere. One small warm amber-orange beacon at the mast tip, unlit. Vertical composition with the mast in the lower two thirds and clean negative space in the upper third. Photographic, high detail. No text, no logos, no people.

- Leg 1: *Slow rise up the mast. Cool blue particles drift past the mast, unreceived, scattering.*
- Leg 2: *The amber beacon lights. The blue particles bend toward it and gather.*
- Leg 3: *The gathered particles resolve into a single clean signal line reaching the top of frame, then hold. Fragment steady.*

**Overlay:** card 01 (`?card=1&v=1`), outro card Z, 1.5s.

---

## F03 — Lane 02 · Prototype in a week · 9:16 · 3 legs · 38.5

**Keyframe (9:16, 2K)**

> A drafting table seen from above, a large architectural blueprint in cool blue linework, inside a suspended torn photogrammetry fragment on a deep navy-black field. One warm amber-orange desk lamp at the frame's edge. Vertical composition, the blueprint in the lower two thirds, clean negative space above. Photographic, high detail. No text, no legible drawing labels, no hands, no logos.

- Leg 1: *Slow push in. The blueprint linework lifts off the paper as thin blue particles.*
- Leg 2: *The particles extrude upward into a small clean three-dimensional building model, storey by storey.*
- Leg 3: *The model completes and the amber lamp light catches it. Hold. Fragment steady.*

**Overlay:** card 02, outro Z.

---

## F04 — Lane 03 · Content that moves · 9:16 · 3 legs · 38.5

**Keyframe (9:16, 2K)**

> A wall of matte black picture frames hung in a tidy grid inside a suspended torn photogrammetry fragment on a deep navy-black field, each frame holding a still image of cool blue abstract light. One frame near the centre holds a warm amber-orange still. Vertical composition, negative space in the upper third. Photographic, high detail. No text, no faces, no logos, no recognisable artwork.

- Leg 1: *Slow lateral dolly along the wall. The frames stay fixed.*
- Leg 2: *One by one, the stills inside the frames begin to move, blue light drifting inside each frame while the frames do not move.*
- Leg 3: *The amber frame's light swells and spills a thin amber line along the wall connecting the frames. Hold.*

**Overlay:** card 03, outro Z.

---

## F05 — Lane 04 · The attribution spine · 9:16 · 3 legs · 38.5

**Keyframe (9:16, 2K)**

> A long row of paper receipts stacked on a spike, seen close and low, inside a suspended torn photogrammetry fragment on a deep navy-black field. Cool blue side light. The spike is a thin warm amber-orange line running through the whole stack. Vertical macro composition, negative space above. Photographic, high detail. No legible text on the receipts, no logos, no hands.

- Leg 1: *Slow orbit around the spike. Blue particles arrive from the fragment's edges one at a time, each landing on the spike as a new receipt and settling into the stack in order.*
- Leg 2: *One particle arrives twice; the second copy is deflected away and dissolves. The amber spine glows steadily.*
- Leg 3: *The stack completes. The orbit slows to a stop. Hold.*

**Overlay:** card 04, outro Z.

---

## Stills S01–S08 · GPT Image 2 · 16:9 2K · 8.5 each · 68 total

Type overlays and the lockup are added locally. Each still is one line of the
pitch; the eight together are a LinkedIn carousel.

| # | On-screen line (composited) | Prompt |
|---|---|---|
| S01 | Momentum built the machine. | Wide still of the F01 rowhouse fragment at night, one amber window, deep navy-black field. |
| S02 | Now we build yours. | The same block, the fragment opened flat like a blueprint on the field, an amber route traced across it. |
| S03 | Get found by AI. | The F02 mast, beacon lit, blue signal line resolved to the top of frame. |
| S04 | Prototype in a week. | The finished F03 blueprint model under the amber lamp. |
| S05 | Content that moves. | The F04 frame wall, one amber frame, thin amber line connecting the frames. |
| S06 | The attribution spine. | The F05 receipt spike, stack complete, amber spine glowing. |
| S07 | Every offer ships with its agent. | Four small fragments floating in a row on the field, each holding one of the four scenes, evenly lit. |
| S08 | need momentum? | Empty deep navy-black field with one amber horizontal rule low in the frame, nothing else. |

Shared negative: text, letters, logos, watermarks, UI, faces, hands, people,
neon, purple, cyan, yellow, cyberpunk.

---

## Credit ledger

Record every job in `video/ledger.json` before the piece is called done:
`{id, piece, step, model, credits, prompt_sha256, output_sha256, accepted}`.

| | Credits |
|---|---|
| Keyframes 5 × 8.5 | 42.5 |
| Legs 16 × 10 | 160 |
| Stills 8 × 8.5 | 68 |
| Base | 270.5 |
| Reject allowance 35% | ~95 |
| **Planned** | **~365** |
| **Hard stop** | **450** — stop and report regardless of completion |

Available per Dillon on 2026-09-05: roughly 600–800. The remainder is the 3D
world's, not this pack's.

---

## After generation

1. Drop each film's accepted legs into `video/plates/F0N/` as `01.mp4 … 04.mp4`.
2. `./composite.ps1 -PlateDir plates/F01 -Mark assets/momentum-logo-white.png -OutDir out -Name F01-opener -Derive 9x16`
   (lane films: `-Derive 1x1`).
3. Capture the cards: open `title-cards.html?card=N&still=1` (add `&v=1` for
   vertical) at 1920×1080 / 1080×1920 and screen-record the animated entry, or
   capture stills for a static card.
4. Review the four QA frames per derivative. The mark must be undeformed in
   every one. Then the piece is accepted, not before.
