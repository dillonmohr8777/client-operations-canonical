# Mac and Sean — founder intro films for Momentum AI

Priority piece. Same pipeline that made the two Future City founder films on
2026-08-31 (two 4K masters, 278 credits, identities held), re-aimed at the AI
division in the Momentum Digital palette.

**Faces are in scope here**, so this is the one place the plan uses
**Seedance 2.5 `omni_reference`** (identity from supplied portraits + motion
from a supplied founder film), not Mini. Everything else in the kit stays
Mini.

---

## The three films

| ID | Film | Length | Aspect | Who |
|---|---|---|---|---|
| **M01** | Mac — *"I started at Google. Momentum built the machine."* | 15s | 9:16 master, 16:9 reframed | Mac alone |
| **S01** | Sean — *"Now we build yours."* | 15s | 9:16 master, 16:9 reframed | Sean alone |
| **MS01** | Both — *Four lanes. One machine.* The division opener with the founders in it, replacing F01's empty-block version | 15s | 9:16 master, 16:9 reframed | Mac frame-left, Sean frame-right |

Build order: **M01, then S01, then MS01 only if credits allow.** Each film is
accepted or rejected before the next is submitted.

### The visual idea, shared by all three

The founder stands inside the same suspended photogrammetry fragment the lane
films use, on the deep navy-black field. The fragment holds a real Philadelphia
setting (the 1635 Market Street block reads as home). Cool blue daylight inside,
one warm amber-orange signal. Around the founder, particles do one meaningful
thing per film:

- **M01** — a blue signal line arrives from off-frame and resolves into a clean
  orbit around Mac (the machine, already built). He turns to camera, holds.
- **S01** — the fragment folds open and a small building model extrudes beside
  Sean, storey by storey (we build yours). He gestures once toward it, holds.
- **MS01** — both walk toward camera; four amber points light in sequence
  around them (the four lanes) and gather into one orbit; they settle and cross
  their arms in the rhythm of the approved founder film. Hold, faces clear.

Final 2.0 seconds of every film: founders still, faces clear, clean negative
space in the upper third for the composited card and the **Momentum AI**
lockup. No generated text or logo, ever.

---

## Identity lock (the language that held on Aug 31)

Prepend to every prompt, verbatim:

> Preserve the supplied founder as one distinct real person for the entire
> shot. Face, hair, facial proportions, apparent age, skin texture and body
> proportions must match the supplied canonical portrait exactly. Do not
> average, beautify, age, de-age, swap or redesign the face. Normal human
> weight and joint speed, stable hands, no lip dialogue, no dancing.

Negative, every render:

> face morphing, face swap, a second person resembling the founder, duplicated
> body, rubber hands, extra fingers, warped teeth, eye colour change, uncanny
> smile, float-walking, synchronized avatar walk, full-frame synthetic city,
> cyberpunk neon, purple or cyan light, dirty grey void, particle explosion,
> illegible text, invented logos, watermarks, captions, UI, product labels,
> camera motion that hides the face at the end.

For MS01 add: *Mac Frederick always frame-left, Sean Boyle always frame-right.
Never morph one founder into the other. Do not add a third founder look-alike.*

---

## References (video/founders/references/, hashes in PROVENANCE.json)

| File | Role | Status |
|---|---|---|
| `mac-frederick-founder-bio-v1.png` (1122×1402) | Mac identity | Canonical per the Jul 21 PRODUCT.md |
| `sean-boyle-founder-bio-v1.png` (1122×1402) | Sean identity | Canonical |
| `mac-sean-instagram-editorial-source.jpg` (399×501) | Orientation and clothing only: Mac left, light blue; Sean right, black | Low-res; not an identity source |
| `need-momentum-founders-film.mp4` (1200×628, 14.9s) | Motion reference | **Confirmed from frames 0.5s / 8s / 12s:** Mac frame-left in the light blue suit, Sean frame-right in black, walk to camera, stop, cross arms, resolve to the NEED MOMENTUM? card. This is the approved founder walk/cross-arms film. |

**Wardrobe decision: suits, as in the founder film** — Mac light blue suit,
white shirt, no tie; Sean black suit, white shirt, no tie. The portraits are the
*face* source only; the motion reference wears suits, the Aug 31 films wore
suits, and giving the model two wardrobes makes it average them. Say the suit in
every prompt.

Excluded: `Momentum Questions 60s talking long 720p.mp4` is a watermarked
HeyGen stock avatar, not a founder. Never a reference.

---

## Prompts

### M01 — Mac

**Keyframe (GPT Image 2, 9:16, 2K, reference: Mac portrait)**

> [identity lock] Mac Frederick stands three-quarter to camera inside a
> single suspended torn photogrammetry fragment on a clean deep navy-black
> field. Inside the fragment: a Philadelphia office block at blue hour, 1635
> Market Street scale, cool blue daylight, one warm amber-orange window. He
> wears the light blue suit and white open-collar shirt from the founder film. Photographic, 35mm,
> commercial editorial grade, high facial detail. Clean negative space in the
> upper third. No text, no logos, no other people.

**Motion (Seedance 2.5, omni_reference: portrait + founders film, 15s, 1080p, audio off)**

> [identity lock] Slow dolly in as the fragment rotates a few degrees. A thin
> blue signal line enters from frame-left, passes behind Mac, and resolves
> into a single clean orbit around him. He turns his head to camera, gives a
> small assured nod, and holds. The amber window stays lit. Final two seconds:
> stable, face clear and still, upper third empty. 35mm, controlled camera, no
> shake.

### S01 — Sean

**Keyframe (reference: Sean portrait)**

> [identity lock] Sean Boyle stands three-quarter to camera inside a single
> suspended torn photogrammetry fragment on a deep navy-black field. Inside:
> the same Philadelphia block, blue hour, one amber window. He wears the black
> suit and white open-collar shirt from the founder film. Beside him, a small clean architectural
> blueprint lies flat on a low surface in cool blue linework. Photographic,
> 35mm, high facial detail. Upper third empty. No text, no logos, no other
> people.

**Motion (omni_reference: portrait + founders film)**

> [identity lock] Slow push in. The blueprint lifts off the surface as thin
> blue particles and extrudes into a small three-dimensional building model
> beside Sean, storey by storey, in five beats. He looks at it, makes one
> compact open-hand gesture toward it, then turns to camera and holds. Final
> two seconds stable, face clear, upper third empty. Controlled camera.

### MS01 — both

**Keyframe (references: both portraits + editorial pair for placement)**

> [identity lock, both founders; Mac frame-left, Sean frame-right] Mac
> Frederick and Sean Boyle stand side by side inside one suspended torn
> photogrammetry fragment on a deep navy-black field, the Philadelphia block
> behind them at blue hour. Cool blue daylight, one amber window. Mac in the
> light blue suit, Sean in the black suit, white open-collar shirts, as in the
> founder film. Photographic, 35mm, high facial detail on both. Upper
> third empty. No text, no logos, no other people.

**Motion (omni_reference: both portraits + founders film)**

> [identity lock, both] The fragment unfolds to reveal Mac and Sean walking
> naturally toward camera, Mac slightly more kinetic, Sean grounded. Four warm
> amber-orange points light in sequence around them, left to right, and gather
> into one orbit. They stop, settle, and cross their arms in the same grounded
> rhythm as the supplied founder film, not in sync with each other. Final two
> seconds: both faces clear and still, upper third empty. 35mm, controlled
> camera.

---

## Credits (measured Aug 31; reverify in the account first)

| Step | Each | M01 + S01 | + MS01 |
|---|---|---|---|
| Keyframe, GPT Image 2 | 8.5 | 17 | 25.5 |
| Seedance 2.5, 15s 1080p, omni_reference | 135 | 270 | 405 |
| 4K upscale, Bytedance Pro (aigc) | 4 | 8 | 12 |
| **First-take total** | | **295** | **442.5** |
| One reroll each | 135 | +270 | +405 |

Against ~600–800 available: **M01 and S01 fit with one reroll each (565).
MS01 does not fit alongside them without a top-up**, and the five Mini lane
films (~365 planned) do not fit at all in the same balance. Sequence: founder
intros first, lane films after a top-up, or lane films at Mini only if the
founder takes land first time.

Hard rule: report after every render. Stop at 600 on this pack regardless.

---

## Gates

1. Keyframe reviewed at full size: is it *him*? If not, do not spend 135 on motion.
2. Motion master reviewed at 0s / 5s / 10s / 15s contact sheet: identity held at all four, no morph, hands clean, face clear at the end.
3. Only an accepted master goes to 4K.
4. Composite locally: card + lockup from `title-cards.html`, `composite.ps1`, four QA frames per derivative.
5. Mac sees his own film before it goes anywhere. Same for Sean. D12/D19 in the register.

---

## What Dillon can do that nothing else replaces

Ten to twenty seconds of **real phone video** of each founder, this week, in
good light: walk toward camera, stop, cross arms, look at the lens; then one
slow head turn. That becomes a second motion reference in `omni_reference`. The founder film already
covers walk / stop / cross arms; fresh footage would add the head turn and the
gesture beats M01 and S01 ask for, and real skin under real light is the
single biggest quality lever an identity film has. Optional, not blocking.
