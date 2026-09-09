# Momentum AI division — Google AI Studio production batch

Rewritten 2026-09-07 against the five actual reference videos. Supersedes the
first draft entirely; that draft was built off the Remotion batch's matte
reinterpretation, not the references, and got the materials, the mascot and the
accent colour wrong.

**State:** prompts ready; image and analysis routes live-verified on Dillon's
key; Veo route under test. Spend so far ≈ $0.28 plus analysis tokens. No batch
render has been run.

---

## 0. What was verified, and how

### The five references — all watched

Copied to `refs/video/`, contact sheets in `refs/sheets/`, full Gemini
3.5 Flash analyses in `refs/analysis/`. Every claim below cites one of them.

| Ref | Dur | Res | What it is | Provenance (analysed) |
|---|---|---|---|---|
| `ailaunchfinal` | 33.5s | 1280×720 | **Launch film.** 12 shots, ~2.75s avg, hard cuts only. Origami-folded royal-blue cardstock, translucent blue glass lattice, gold beads at the joints, a yellow cable spine, a woven-mesh sphere with a gold ring. Ends on a cream studio card. | High-end 3D CGI (Cinema 4D / Octane class) + 2D motion graphics |
| `higgsfield292070…` | 29.7s | 1920×1080 | **Services film.** 8 cuts, 3.2s avg, locked orthographic camera. Flat-lay clay/paper UI cards — chart, phone, map with pins, search results, landing page — on watercolour-paper beige. | 3D motion graphics, PBR paper materials |
| `higgsfieldf628db…` | 28.7s | 1920×1080 | **Momo film.** 5 vertical slide/wipe transitions, 4.8s avg, locked. Momo + cream phone + chat bubbles + "HANDLED TODAY" checklist. | 3D stop-motion look + 2D vector UI |
| `higgsfieldfb393c…` | 8.0s | 1920×1080 | **M-disc mascot.** One 7s take, locked. Sleep → eyes pop → hop-wobble left, antenna bounce → blink back to closed-eye smile. | Full 3D render, character and set |
| `higgsfield07bc4f…` | 5.0s | 3856×2148 | **Fireworks.** One locked take. Art Museum plaza at night, symmetrical blue/white bursts, three men's portraits as blue line-art in the sky. | Live plate + composited fireworks + composited portraits |

### Three corrections to what I said before the analyses

1. **Glass is real.** The launch film uses "glossy translucent blue polymer/glass"
   with gold connection beads next to matte cardstock. The Remotion batch's
   all-matte look was a reinterpretation. Dillon's brief was right.
2. **Momo is a sphere with a flat bottom, vertical white oval eyes, and a thin
   antenna capped with a yellow bead** — satin plastic, not the matte blob in
   `H02`. The M-disc is a *second* character: flat disc, white ring, curly
   antenna, big glossy black eyes, tiny smile.
3. **The accent is yellow-gold in the launch and Momo films (`#FACD00`,
   `#F5C43C`) and burnt orange in the services film (`#D06214`).** Not one
   accent. Do not force them together.

### Model access — live-verified on this key, 2026-09-07

| Need | Model | State |
|---|---|---|
| Stills | `gemini-2.5-flash-image` | **Works.** 2 test stills generated. `generationConfig.imageConfig.aspectRatio` honoured — `16:9` returned 1344×768 |
| Stills, higher fidelity | `gemini-3.1-flash-image`, `gemini-3-pro-image` | Listed, reachable, untested |
| Video analysis | `gemini-3.5-flash` | **Works.** All five refs analysed |
| Video analysis | `gemini-2.5-flash`, `gemini-2.5-pro` | **404 — "no longer available to new users."** The model list still advertises them. Do not route to them |
| Video | `veo-3.1-lite/fast/generate-preview` | All three listed with `predictLongRunning`. Lite 4s/720p test in flight |

### Veo 3.1 features — from the docs, not assumed

- `durationSeconds`: **4, 6, 8**. 1080p and 4K require 8. Reference images require 8.
- `aspectRatio`: **16:9 and 9:16 only.** No 1:1 — carousels are crops.
- `image` (image-to-video): all variants.
- `lastFrame` (first+last interpolation): **Fast and Standard only.**
- `referenceImages` (up to 3): **Fast and Standard only.**
- Extension (+7s, ×20, 720p): Fast and Standard only.
- Native audio: all variants.

**Consequence:** anything needing a loop or a stable character is **Fast
minimum**. Lite is for plates only.

### Veo 3.1 REST request shapes — live-verified, where the docs and the API disagreed

| Field | Shape that the API accepts | Note |
|---|---|---|
| `instances[0].image` | `{ bytesBase64Encoded, mimeType }` | start frame |
| `instances[0].lastFrame` | `{ bytesBase64Encoded, mimeType }` at **instance** level | Docs describe it as a config constraint; a probe with it in the instance was accepted and rendered the M-disc loop. Keep it in the instance. |
| `instances[0].referenceImages[]` | **Unresolved.** Both `{ image: { bytesBase64Encoded, mimeType } }` and the docs' `{ image: { inlineData: { mimeType, data } } }` with `referenceType: "asset"` return 400 `INVALID_ARGUMENT` "Unsupported video generation request" **when a start `image` is also present.** Untested: reference images with no start frame. | Working assumption: reference images and a start frame are mutually exclusive on this endpoint. Plain image-to-video has held proportions in every clip so far; the one drift (limbs mid-hop) was a prompt gap, fixed by stating "no limbs ever." |

**Concurrency is per key, not per runner.** Two runners each capped at 2 and 1 still produced 429s. Run **one** runner at `-MaxConcurrent 3`.

**HARD BUDGET CAP: $25.00 total, set by Dillon 2026-09-07 after the first Google
charge.** Ledger is `budget.json` (spent ≈ $12.05 at the time of setting; 28
stills, 1 Lite test, 11 Fast clips, analysis tokens). Both runners now read it
and **refuse to start any job that would cross the cap**, debiting each job's
unit price before it starts so a crash cannot under-count. The eleven queued
clips in `batch-videos-3.json` cost $10.56 → ≈ $22.60 if all render. Nothing
beyond that queue may be added without raising the cap in `budget.json`.
Remotion renders, subagents and compositing cost nothing on Google.

**There is also a daily Veo cap on this tier.** After **12 successful Veo renders** on 2026-09-07 (1 Lite test + 11 Fast), every further request — including a single free-standing one — returned 429 `RESOURCE_EXHAUSTED` "exceeded your current quota" with no `Retry-After`. Google's rate-limit page does not publish Veo's per-tier numbers; the only source is the project's own dashboard at `aistudio.google.com/rate-limit`. Tier 2 requires $100 spent plus three days from first payment. **Eleven clips are queued in `batch-videos-3.json` and will run unchanged with `run-videos.ps1 -Manifest batch-videos-3.json -MaxConcurrent 3` once the window resets** — the runner skips the clips already on disk.
| `parameters` | `{ aspectRatio, durationSeconds, resolution }` | 8s required for 1080p and for any reference image |

A 400 on Veo is unbilled; a 429 `RESOURCE_EXHAUSTED` is the concurrency ceiling (three Fast jobs on this tier), also unbilled.

### Verified prices (`ai.google.dev/gemini-api/docs/pricing`, 2026-09-07)

Images: 2.5 Flash Image $0.039 · 3.1 Flash Image $0.067@1K · 3 Pro Image
$0.067@1K batch, $0.12@4K. Video per second: Lite $0.05/720p, $0.08/1080p ·
Fast $0.10/720p, $0.12/1080p · Standard $0.40/720p–1080p, $0.60/4K.

---

## 1. Shared creative direction

Two palettes and one set of rules. The references do not share a palette, so the
spec does not pretend they do.

### Palette L — Launch (from `ailaunchfinal`)

```
ROYAL     #0A3498   folded cardstock, the dominant field
BLUE-LIT  #1D4ED8   lit faces, glass lattice
GOLD      #FACD00   beads, cable spine, the ring, one rule under type
WHITE     #FFFFFF   white-tipped folds, white type
CREAM     #FDF9F3   the closing studio card only
```

Materials: matte cardstock with visible fold creases; translucent blue glass;
polished gold beads at every joint; woven technical mesh. Lighting:
high-contrast dramatic key, rich rim highlights, volumetric rays in the dark
shots. Camera: **moving**, always — pans, low-angle tracks, macro drifts, a
fly-through, a crane arc, a pull-back. Cuts hard, ~2.75s.

### Palette P — Paper (from the services and Momo films)

```
BEIGE     #EFECE6   watercolour-paper field (services)
CREAM     #F2EFE9   cardstock field (Momo)
CHARCOAL  #1A1510   display type
NAVY      #0B4A75   "Search. Answers." headline, wordmark
BLUE      #1255B2   Momo, phone header, chat accents
ORANGE    #D06214   one word or one element per frame (services film only)
YELLOW    #F5C43C   antenna bead, underline, one icon (Momo film only)
GREY      #D1D5DB   placeholder text bars
```

Materials: matte clay and heavy paper with soft physical edges. Lighting: soft
diffuse top-left, realistic soft-edged drop shadows. Camera: **locked
orthographic**, with one slow pan following a scrolling phone. Motion: snappy
elastic easing, high friction on settle — pop, slide, drop, no bounce that
lingers.

### Palette F — Fireworks (from `higgsfield07bc4f`)

```
NIGHT     #050811   sky
BLUE      #5D9CEC   bursts
PALE      #A0C4FF   burst highlights, portrait line-art
AMBER     #F4A261   streetlights along the plaza
WHITE     #FFFFFF   white bursts
```

### Rules for every job

- **Logos are never generated.** Composite from
  `~/.claude/skills/client-deck/assets/momentum-digital/` — byte-verified canonical.
- **All copy and UI labels are editing overlays.** Every reference does this;
  the services film even labels its UI "Illustrative UI — not client work."
  Keep that label.
- **No invented facts, stats, testimonials or people.**
- **Faces are composited from authorised portraits or absent.** Never generated.
- 24fps. 16:9 default; 9:16 where a reference is vertical.

**Universal negative prompt** (append to every job):

```
text, letters, words, numbers, logos, watermarks, UI labels, captions,
subtitles, faces, people, hands, purple, violet, magenta, neon, lens flare,
bokeh, floating particles, gradient mesh, holographic, HUD, sci-fi, duplicate
objects, extra limbs, warped geometry, flickering, morphing shapes,
inconsistent scale, clutter, handheld shake, whip pan, motion blur smear
```

---

## 2. The five production prompts

---

# PROMPT 1 — PREMIUM AI DIVISION LAUNCH
### `momentum_01_launch` · Palette L · 16:9

## A. CREATIVE BRIEF

Continuation of `ailaunchfinal`. Royal-blue origami architecture, translucent
glass lattice, gold beads at the joints, a gold cable binding the assembly. The
engineered connection is the subject. Camera always moving, cuts hard. Ends on
the cream studio card where "MOMENTUM AI" forms — and that particle-disperse
reveal is compositing, not generation.

Impression: built, not prompted. Communicates: Momentum built the machine.

This is the one workstream where the references' own provenance — high-end 3D
CGI — makes Veo a genuine candidate: abstract, textured, no text, no faces, no
character to keep consistent. That is exactly the content Veo does well.

## B. ASSET GENERATION

**`momentum_01_launch_hero`**
```
Macro photograph of an architectural assembly made from folded royal blue
cardstock, hex #0A3498, with white-tipped triangular folds, its panels joined at
every vertex by small polished gold beads, hex #FACD00. A thin gold cable runs
through the structure like a spine. Some panels are translucent blue glass,
catching a hard rim light. Dramatic single key light from upper right, deep
shadows, high contrast, faint volumetric haze. Dark background falling to
near-black. Shot on 100mm macro, f4, subject filling the right two thirds, the
left third dark and empty. 16:9.
```

**`momentum_01_launch_detail`**
```
Extreme macro on a single joint where three folded royal blue cardstock panels,
hex #0A3498, meet at a polished gold bead, hex #FACD00, with a thin gold cable
threading through it. One panel is translucent blue glass showing refraction at
its edge. Visible paper fold crease texture. Hard rim light from upper right,
very shallow depth of field, the far panels dissolving to soft blue. Upper left
empty and dark. 100mm macro, f2.8. 16:9.
```

**`momentum_01_launch_endcard`**
```
An empty warm cream studio field, hex #FDF9F3, evenly lit, with a very soft
falloff toward the corners and faint fine paper grain. Nothing else in frame.
No text, no logo. 16:9.
```

**`momentum_01_launch_module`** — reusable
```
A single folded royal blue cardstock module on plain white: a triangular pyramid
with one white-tipped apex, gold beads at its three base vertices, hex #FACD00,
and a short gold cable stub exiting one side. Matte paper with visible fold
creases. Soft even studio light, soft contact shadow. Product-catalogue
neutrality, centred. Square.
```

Reuse: `_module` once, composited into both clips' assembly beats. `_endcard`
shared with Prompt 2's close.

## C. VIDEO GENERATION

**`momentum_01_launch_clip_a`** — image: `_hero` · Veo 3.1 Fast · 8s · 1080p · 16:9
```
The folded royal blue cardstock assembly holds, then its outer panels fold
inward one after another with springy mechanical momentum, each snapping shut
and settling with a dampened overshoot, gold beads at the joints catching the
rim light as they turn. The camera performs a slow sweeping crane arc, rising
and moving left, keeping the gold cable spine in frame. Hard key light from
upper right stays fixed to the world; volumetric haze drifts slowly. Ends with
the assembly closed and compact, the gold cable taut, the left third dark.
```

**`momentum_01_launch_clip_b`** — image: `_detail` · Veo 3.1 Fast · 8s · 1080p · 16:9
```
Macro on the gold bead joint. The camera drifts slowly along the gold cable,
tracking left to right, staying in razor-thin focus on the cable while the
folded blue panels slide past soft in the background. Refraction moves across
the translucent glass panel edge as the angle changes. The move never stops or
accelerates. Ends with the cable exiting frame right and empty dark space
opening upper left.
```

Conditioning: `image` only. No `lastFrame`, no references — nothing here needs
continuity beyond the still.

## D. FINISHING PLAN

| t | Content |
|---|---|
| 0.0–4.0 | `clip_a` first half. Eyebrow "INTRODUCING · MOMENTUM DIGITAL · PHILADELPHIA" bottom-left, extra-light, white, gold rule under it. "A NEW DIVISION." steps up line by line, heavy, white |
| 4.0–8.0 | `clip_a` second half, clean |
| 8.0–12.5 | Hard cut to `clip_b`. "BUILT, NOT PROMPTED." slides in from right at 9.5, centre-left, heavy, white |
| 12.5–16.0 | Cut to `_endcard`. `momentum-mark.png` + "MOMENTUM AI" **particle-disperse in** (Remotion, blue). "The AI division of Momentum Digital" fades and slides up |
| 16.0–19.0 | Subtitle replaced by "Momentum built the machine. Now we build yours." "PHILADELPHIA. SINCE 2015. · NEEDMOMENTUM.COM" fades in bottom-centre |

Hard cuts only. Sound: deep room tone; a papery snap on every fold; a faint
metallic tick when a bead turns; one low swell into the end card. Every word is
an overlay. The wordmark is the PNG.

## E. QUALITY CONTROL

Reject: any generated text or lettering; panel count changing mid-shot; beads
duplicating or vanishing; cable breaking continuity; glass turning opaque or
plastic; purple or violet in the shadows; camera reversing direction; the
"dissolve into particles" appearing in generated footage — it is composited.

## F. COST-CONTROLLED ROUTE

**Cheapest:** stills only, animated in Remotion. Loses the fold physics and the
refraction — the two things that make the reference premium. Not recommended.
**Recommended:** both clips at **Veo 3.1 Fast, 8s, 1080p = $1.92**, stills at
2.5 Flash Image = $0.16. **Justifies Standard:** if this becomes the paid launch
hero, `clip_a` at Standard (+$2.24) — the fold-and-settle is where fidelity shows.

---

# PROMPT 2 — MARKETING SERVICES MOTION SYSTEM
### `momentum_02_services` · Palette P · 16:9

## A. CREATIVE BRIEF

From `higgsfield292070` exactly: locked orthographic camera, flat-lay clay/paper
UI cards on watercolour-paper beige, one burnt-orange word per frame, hard cuts
at ~3.2s. Cards are illustrative — chart, phone, map with pins, search results,
landing page — and the film **labels them** "Illustrative UI — not client work."
Keep the label.

Not one letter of UI is generated. The cards carry grey placeholder bars in the
reference; that is the honest way to do it and it is what the generator is asked
for.

## B. ASSET GENERATION

**`momentum_02_services_hero`**
```
Top-down flat-lay on a warm beige watercolour-paper surface, hex #EFECE6, with
fine visible grain. Three thick paper-and-clay UI cards lie on the surface with
soft-edged drop shadows: a landscape browser window card with a simple rising
line chart in navy #0B4A75 and grey placeholder text bars #D1D5DB; a phone card
standing slightly proud with a navy header block and one burnt-orange button
#D06214; a small map card in pale blue-grey with a faint road grid and one
orange pin. All matte, tactile, slightly rounded edges, no glass. Soft diffuse
light from top-left. Cards grouped centre-left, the right third empty beige.
No legible text anywhere. 16:9.
```

**`momentum_02_services_detail`**
```
Top-down flat-lay on warm beige watercolour paper, hex #EFECE6. A single thick
paper map card, pale blue-grey with a faint grid of roads and three small pins —
two navy #0B4A75, one burnt-orange #D06214 — sits centre-left with a soft
drop shadow. Beside it, a small stacked list card with three rows of grey
placeholder bars, the third row outlined in orange. Matte clay and paper, soft
top-left light, right third empty. No legible text. 16:9.
```

**`momentum_02_services_endcard`**
```
An empty warm beige watercolour-paper field, hex #EFECE6, with fine grain and
even soft light. Nothing else. No text, no logo. 16:9.
```

**`momentum_02_services_props`** — reusable sheet
```
Product sheet on plain white: five separate matte paper-and-clay UI props in a
row with even spacing — a browser window card, a phone card, a map card, a
search-results card with grey placeholder bars, and a small pill button in
burnt-orange #D06214. Each with its own soft contact shadow, soft even
top-left light, no legible text. Square.
```

Reuse: `_props` once for every card in every cut. This is what keeps eight
finished pieces looking like siblings.

## C. VIDEO GENERATION

**`momentum_02_services_clip_a`** — image: `_hero` · Veo 3.1 Lite · 6s · 720p · 16:9
```
The three flat-lay UI cards pop into place one after another — each scales up
from nothing with a snappy elastic ease and settles hard with almost no bounce,
its soft drop shadow appearing with it. Camera is a locked orthographic
top-down view, no movement. Beige watercolour paper stays still. Soft top-left
light fixed. Ends with all three cards at rest, right third empty.
```

**`momentum_02_services_clip_b`** — image: `_detail` · Veo 3.1 Lite · 6s · 720p · 16:9
```
Top-down on the map card. Three pins drop onto the map one after another, each
landing with a small squash and settle; the orange pin lands last. Then the list
card beside it slides in from the right and stops with high friction, no
overshoot. Camera locked orthographic. Soft top-left light fixed, shadows
tracking each landing. Ends still.
```

Conditioning: `image` only. Lite is sufficient — no character, no loop.

## D. FINISHING PLAN

Build once, version for four lanes.

| t | Content |
|---|---|
| 0.0–2.0 | `_endcard`. "Most local businesses **run ads.**" centre, bold charcoal, "run ads." orange, typewriter fade |
| 2.0–4.0 | Hard cut. "Great ones build **momentum.**" |
| 4.0–8.0 | Cut to `clip_a`. Lane copy slides in from right at 6.0 |
| 8.0–12.0 | Cut to `clip_b`. "We win the map." slides in right |
| 12.0–16.0 | `_endcard`. "Search. Answers. Everything after." navy, pops sequentially; SEO / AEO / GEO small caps below with thin rules |
| 16.0–18.0 | Fast downward slide to a navy field. "Not just clicks. **Momentum.**" white, orange |
| 18.0–22.0 | Cut to beige. `momentum-mark.png` arcs in on an orange trail (Remotion), "MOMENTUM" / "Philadelphia. Since 2015." / "needmomentum.com" |

Tiny label "Illustrative UI — not client work" bottom-left on every card shot.
Sound: soft paper pops on each card; a pin-tap per pin; no music under the lane
versions. 9:16 and 1:1 versions are crops of the same timeline — Veo does not
output 1:1.

## E. QUALITY CONTROL

Reject: any legible generated text on a card; card count changing; cards
overlapping wrongly; shadow direction shifting; orange appearing more than once
per frame; any camera drift; navy and blue swapped; purple.

## F. COST-CONTROLLED ROUTE

**Cheapest and recommended:** stills at 2.5 Flash Image ($0.16), all motion in
Remotion — pop, slide, pin-drop are trivial keyframes and `L01–L04` already
prove this look renders locally at zero credits. **$0.16 for eight pieces.**
**Veo adds:** organic squash on the pin landings. Two Lite clips = $0.60. Only if
the keyframed version reads stiff.

---

# PROMPT 3 — MOMO AI ASSISTANT
### `momentum_03_momo` · Palette P · 16:9

> **Gate:** mascot pieces need Mac's and Sean's written acceptance per the batch
> README. Prepare and test; do not publish.

## A. CREATIVE BRIEF

From `higgsfieldf628db`: Momo is a **blue sphere with a flat bottom**, hex
`#1255B2`, satin plastic, **two vertical white oval eyes set wide**, a **thin
blue antenna capped with a yellow bead** `#F5C43C`. Sits on cream cardstock. A
cream phone (tonally matched, not black) carries chat bubbles and a "HANDLED
TODAY" list. Transitions are vertical slides. Momo wiggles the antenna, blinks,
rotates slightly — stop-motion charm.

Communicates: every offer ships with its agent.

## B. ASSET GENERATION

**`momentum_03_momo_character`** — master, generated first
```
A mascot on plain white: a blue sphere, hex #1255B2, with a flat bottom so it
sits stably, satin plastic finish with one soft highlight upper-left. Two
vertical white oval eyes set wide apart on the upper front, no mouth, no limbs.
A thin blue antenna rises from the top, capped with a small round yellow bead,
hex #F5C43C. Soft diffuse top-left light, soft contact shadow. Front-facing,
centred, toy-like, stop-motion feel. Square.
```

**`momentum_03_momo_hero`**
```
The blue sphere mascot with flat bottom, vertical white oval eyes and a
yellow-bead antenna sits on warm cream cardstock, hex #F2EFE9, front-facing,
left of centre, with a soft drop shadow. To its right, a cream-coloured phone
matching the background tone stands upright, rounded corners, screen blank, a
thin darker header band at its top. Soft top-left light, matte and satin
surfaces, cardstock grain. 16:9.
```

**`momentum_03_momo_endcard`**
```
Warm cream cardstock field, hex #F2EFE9, fine grain. The small blue sphere
mascot with flat bottom, white oval eyes and yellow-bead antenna sits centred,
occupying roughly one third of frame height, soft drop shadow. Empty cream
above and to both sides. No text, no logo. 16:9.
```

**`momentum_03_momo_phone`** — reusable
```
A cream-coloured phone, hex #F2EFE9, on plain white, straight on, rounded
corners, a thin slightly darker header band at the top, screen otherwise blank.
Matte, soft contact shadow, no content, no text. Square.
```

Reuse: `_character` is the `referenceImages` subject for every Momo clip. That
is the only thing that holds eye spacing and antenna length across shots.

## C. VIDEO GENERATION

**`momentum_03_momo_clip_a`** — image: `_hero` · references: `_character` · Veo 3.1 Fast · 8s · 1080p
```
The blue sphere mascot sits still, then its antenna wiggles twice, the yellow
bead bobbing. Its white oval eyes blink once. It rotates about ten degrees
toward the phone on its right and back, like a stop-motion turn, and settles.
The phone stays still and blank. Camera locked, top-down-ish macro. Soft
top-left light fixed, the drop shadow shifting slightly with the turn. Ends in
the starting pose.
```

**`momentum_03_momo_clip_b`** — image: `_hero` · references: `_character` · Veo 3.1 Fast · 8s · 1080p
```
The camera holds locked as the blue sphere mascot leans very slightly toward
the phone, antenna tilting with it, and holds the lean. Its eyes stay open and
fixed on the phone. The phone screen stays blank. Soft top-left light fixed,
cream cardstock still. Ends holding the lean, both subjects in frame.
```

## D. FINISHING PLAN

| t | Content |
|---|---|
| 0.0–3.0 | `clip_a` open. Speech bubble "spend check?" pops in top-right with scale bounce |
| 3.0–9.0 | Vertical slide to the phone. Chat bubbles overlay in sequence — grey left, blue right — every 10 frames |
| 9.0–15.0 | Quick vertical slide. "HANDLED TODAY" list overlay rolls up — five rows, small coloured icons, "Momo" tag each. "Always on." then "Ads. Answers. Attribution." bottom-left, bold, with light subline |
| 15.0–19.0 | Wipe to text-only cream: "most agencies send a report" → slides up and out → "Momo just sends a message" |
| 19.0–23.0 | Slide to `clip_b`. "Meet Momo." pops up centre-bottom, bold; subline light |
| 23.0–28.0 | Slide to `_endcard` → `momentum-mark.png` + "Momentum" slides down, "say hi to Momo" with tiny Momo, "NEEDMOMENTUM.COM" |

All bubbles, lists and labels are overlays. Sound: rounded pop per bubble;
soft rubbery tick on the antenna wiggle; warm low pad.

## E. QUALITY CONTROL

Reject: eye spacing or antenna length changing between shots; a mouth or limbs;
the flat bottom rounding off; the yellow bead vanishing; a second Momo; the
phone turning black or gaining generated content; purple.

Check every frame against `_character` before assembly.

## F. COST-CONTROLLED ROUTE

**Cheapest:** stills + Remotion rig. Wiggle, blink, turn, lean are keyframes;
`H02` proves it at zero credits and a rig cannot drift. **Recommended:** the rig,
plus **one** Fast clip with references ($0.96) to see if the stop-motion
"organic" quality is worth having. **Never Lite** — no `referenceImages`.

---

# PROMPT 4 — MASCOT MICRO-ANIMATION
### `momentum_04_bumper` · Palette P · 16:9

> **Same gate as Prompt 3.**

## A. CREATIVE BRIEF

`higgsfieldfb393c` in full: one 7s locked take. The **M-disc** — flat thick blue
disc `#1F75FE`, white ring inside the rim, thin curly antenna, big glossy black
eyes, tiny smile — leans on a white cylinder on cream cardstock `#F1EDE4`. Sleeps
→ eyes pop → snappy hop-wobble left with antenna bounce → blink back to
closed-eye smile. Reusable bumper; must loop.

This is the workstream Veo's `lastFrame` exists for.

## B. ASSET GENERATION

**`momentum_04_bumper_character`** — master (test already generated:
`tests/momentum_04_bumper_character_test.png`, refine the antenna to a single
curl)
```
A mascot on plain white: a flat thick blue disc, hex #1F75FE, standing on edge
like a coin, with a clean white ring just inside its rim. From the top rises a
thin antenna that curls once, like a single lowercase letter m drawn in one
stroke. Two large glossy black oval eyes set wide, each with a small highlight,
and a tiny curved smile below. Matte blue disc with a subtle satin sheen,
glossy eyes. Soft studio light from the right, soft contact shadow. Front-
facing, centred. Square.
```

**`momentum_04_bumper_hero`** — sleeping, loop-in
```
On warm cream cardstock, hex #F1EDE4, a matte white cylinder lies on its side
centre-right. Leaning against it, the flat blue disc mascot with white ring,
single-curl antenna and a tiny smile — its eyes drawn as two closed curved
lines, asleep. Soft studio key from the right, long soft shadow to the left.
Left half empty cream. 16:9.
```

**`momentum_04_bumper_rest`** — awake, loop-out, must match `_hero` exactly
```
Identical scene to the previous image: warm cream cardstock hex #F1EDE4, matte
white cylinder on its side centre-right, the flat blue disc mascot leaning on it
in exactly the same position and scale — but its large glossy black oval eyes
are open and it has a tiny smile. Soft key from the right, same long shadow.
Left half empty. 16:9.
```

**`momentum_04_bumper_endcard`**
```
Empty warm cream cardstock field, hex #F1EDE4, soft even light, nothing in
frame. 16:9.
```

## C. VIDEO GENERATION

**`momentum_04_bumper_clip_a`** — image: `_hero` · lastFrame: `_hero` · references: `_character` · Veo 3.1 Fast · 8s · 1080p
```
The flat blue disc mascot sleeps against the white cylinder, eyes closed. Its
eyes pop open suddenly. It does one snappy hop to the left with an energetic
body wobble and head tilt, the curly antenna bouncing with secondary motion,
then settles back against the cylinder with a dampened overshoot. Finally it
blinks slowly back to a closed-eye smile, exactly as it began. Camera
completely locked. Soft key from the right fixed, shadow following the hop.
Ends in the identical sleeping pose.
```

**`momentum_04_bumper_clip_b`** — image: `_rest` · references: `_character` · Veo 3.1 Fast · 4s · 720p
```
The flat blue disc mascot rests against the white cylinder, eyes open. It blinks
once quickly, then rocks gently side to side about five degrees, antenna
swaying, and settles. Camera locked. Light and shadow fixed. Ends in the
starting pose.
```

`clip_a` uses first frame = last frame = `_hero` so the loop closes by
construction. Fast minimum — Lite has no `lastFrame`.

## D. FINISHING PLAN

**Loop bumper (7s):** `clip_a` trimmed to the exact return-to-sleep frame. Cut,
no fade. Play four times back to back; any seam fails it. Optional
`momentum-mark.png` lower right at 40%.
**Reaction bumper (3s):** `clip_b` + 6-frame dissolve to `_endcard`.
Sound: one soft rubbery thump on the hop landing. Nothing else.

## E. QUALITY CONTROL

Reject: any seam at the loop; disc thickness, ring width or eye size drifting
from `_character`; antenna becoming leaves or a second stroke; the cylinder
moving; more than one hop; camera movement; purple.

## F. COST-CONTROLLED ROUTE

**Cheapest:** Remotion rig — closes by construction, zero credits.
**Recommended:** **one Fast 8s clip with `lastFrame` ($0.96)** — the wobble and
antenna secondary motion are the charm, and they are exactly what a rig makes
stiff. Compare against the rig; ship whichever reads better.

---

# PROMPT 5 — CELEBRATORY LAUNCH VISUAL
### `momentum_05_launch` · Palette F · 16:9

## A. CREATIVE BRIEF

From `higgsfield07bc4f`: Art Museum plaza at night, locked high-angle wide,
warm amber streetlights, symmetrical blue and white bursts, accumulating smoke.
**The portraits are line-art composites of real people**, not generated — and
the analysis confirms the plate is live-action with organic pedestrian movement.

**Portraits — verified available:** ten authorised clean portraits at
`2026-09-06-dillon-headshots/clean-portraits/`. **Gate:** founder-likeness needs
Mac's and Sean's written acceptance. **Build skyline-only now; composite
portraits on acceptance. Never generate a face.**

## B. ASSET GENERATION

**`momentum_05_launch_hero`**
```
Photograph of the Philadelphia Museum of Art and its plaza at night from a high
wide angle across the parkway. Deep navy-black sky, hex #050811, filling the
upper two thirds. Warm amber streetlights, hex #F4A261, line the plaza and
roads below; the museum facade is softly lit. No fireworks. Clear sky, no haze.
Tripod-locked, 35mm, f4, long exposure. 16:9.
```

**`momentum_05_launch_burst`**
```
The Philadelphia Museum of Art plaza at night from a high wide angle, deep
navy-black sky hex #050811, warm amber streetlights below. Two symmetrical
firework bursts high above the museum — one electric blue hex #5D9CEC, one
white — with thin trails and a faint translucent smoke plume beginning to
accumulate. Plenty of dark sky between them. No other colours in the sky.
Tripod-locked, 35mm, f4, long exposure. 16:9.
```

**`momentum_05_launch_endcard`**
```
A deep navy-black field, hex #050811, with a very subtle lightening toward the
upper centre and faint fine grain. No skyline, no objects, no text. 16:9.
```

**`momentum_05_launch_plate`** — on acceptance only
```
The Philadelphia Museum of Art plaza at night from a high wide angle, deep
navy-black sky hex #050811, warm amber streetlights below, framed so the upper
two thirds are empty dark sky with no clouds, no fireworks, no detail — clean
space for compositing. Tripod-locked, 35mm, f4. 16:9.
```

## C. VIDEO GENERATION

**`momentum_05_launch_clip_a`** — image: `_hero` · Veo 3.1 Fast · 8s · 1080p
```
Locked high wide shot of the museum plaza at night. Two fireworks rise
symmetrically from behind the museum, one on each side, and burst at the same
height — one electric blue, one white — trails falling slowly and fading as a
translucent smoke plume begins to drift. A second symmetrical pair follows,
lower. Tiny pedestrians and a car move naturally on the plaza below. Camera
completely locked. Sky stays deep navy-black; only blue and white appear. Ends
with trails fading into dark sky.
```

**`momentum_05_launch_clip_b`** — image: `_burst` · Veo 3.1 Fast · 8s · 1080p
```
Locked high wide shot with fireworks already active. Three more symmetrical
pairs burst at staggered heights in electric blue and white, each opening fast
then easing into a slow gravity-bound drift as it fades, smoke accumulating
gently. Amber streetlights and the museum stay steady below. Camera locked.
Only blue and white in the sky. Ends as the last trails dissolve.
```

## D. FINISHING PLAN

| t | Content |
|---|---|
| 0.0–1.5 | `_hero` held. No type |
| 1.5–9.5 | `clip_a`. Eyebrow "MOMENTUM AI" fades in on the first burst |
| 9.5–17.5 | Cut on a burst to `clip_b`. **On acceptance:** three real portraits composited into the upper sky as blue line-art at ~60% — screen blend, edges feathered, static |
| 17.5–20.0 | 16-frame dissolve to `_endcard` |
| 20.0–24.5 | `momentum-logo-white.png` centred. Hold, fade |

Sound: distant crowd low; real firework reports slightly after each burst; sub
swell under the end card. Cut on bursts.

## E. QUALITY CONTROL

Reject: **any generated face or figure**; gold, red, green or purple bursts;
asymmetric or crowded finales; camera shake; the museum facade morphing; sky
brightening; generated text; lens flare.

## F. COST-CONTROLLED ROUTE

**Cheapest:** stills + sprite fireworks in Remotion — viable, reads flat.
**Recommended:** both clips at **Fast 8s 1080p = $1.92**. Fireworks are the
one thing sprites do badly and Veo does well. **Standard** only if this is the
paid hero: +$2.24 for `clip_b`.

---

## 3. Batch manifest

### Parallel groups

**Group A — 20 images, fully parallel, no dependencies.** Model:
`gemini-2.5-flash-image`, `imageConfig.aspectRatio` set per asset.

**Group B — 10 clips.** Each starts when *its* conditioning image lands.
Gated: WS3, WS4 (mascot acceptance); WS5 portrait beat (likeness acceptance).
Ungated: WS1, WS2, WS5 skyline-only.

**Group C — assembly** per workstream once its clips exist.

### Selected models

| Job | Model | Why |
|---|---|---|
| All stills | `gemini-2.5-flash-image` | Verified, $0.039, aspectRatio works |
| Hero stills if fidelity short | `gemini-3.1-flash-image` @1K | +$0.03 each |
| WS1, WS5 clips | Veo 3.1 **Fast**, 8s, 1080p | Abstract/no-text content; Fast is enough |
| WS2 clips | Veo 3.1 **Lite**, 6s, 720p — or Remotion | Plates only, no continuity needs |
| WS3, WS4 clips | Veo 3.1 **Fast** | `referenceImages` / `lastFrame` required; Lite lacks both |

### Estimated cost — verified prices, retries separate

| Route | Images | Video | Total |
|---|---:|---:|---:|
| **Composite-first** (20 stills; all motion Remotion) | $0.78 | $0 | **$0.78** |
| **Recommended** (20 stills; WS1 + WS5 Fast 8s 1080p; WS4 one Fast loop; WS2/3 Remotion) | $0.78 | $4.80 | **$5.58** |
| **All-Veo** (20 stills; 10 clips Fast 8s 1080p) | $0.78 | $9.60 | **$10.38** |
| **Selective premium** (recommended + WS1 `clip_a` and WS5 `clip_b` at Standard) | $0.78 | $9.28 | **$10.06** |

Retries: budget 30% — $0.25 to $3.10 depending on route.

**Group A — run 2026-09-07.** `run-images.ps1` against `batch-images.json`, 19
jobs in parallel: **17 OK**, 2 returned `IMAGE_RECITATION` — both were the plain
empty endcards, which tripped the stock-texture filter and were then generated
**locally** with PIL at exact hex plus grain (`#EFECE6`, `#F1EDE4`). Zero cost,
deterministic, and the honest route for a blank field anyway. QA against the
references: 16/17 on-language. `03_momo_hero` produced a black-screen iPhone
instead of the cream blank phone — regenerated once with hardened wording (v1
kept as `.v1-blackphone.png`). Small generator marks in the bottom corners of
`04_bumper_hero` and `05_launch_endcard`: crop or overlay, not regeneration.
Contact sheet: `stills.sheet.png`.

**Group B — run 2026-09-07, ungated set only.** `run-videos.ps1` against
`batch-videos.json`: four Veo 3.1 Fast jobs, 8s, 1080p, 16:9, in parallel.
**Three OK in 80–88s each; the fourth returned 429 `RESOURCE_EXHAUSTED`** —
a concurrency ceiling on this key's tier, not a rate blip. **Run at most three
Fast jobs concurrently.** The runner skips finished files, so a rerun retries
only the missing clip.

QA against the references:

| Clip | Verdict |
|---|---|
| `01_launch_clip_a` | **Partial.** 0–5s: a generated mechanical arm with a spring enters from upper-left and handles the polyhedron — invented, a QC reject. 5–8s: clean slow turn, usable. Cut as `…clip_a.tail3s.mp4`. Regenerate with "nothing enters frame, no tools, no arms" if the full 8s is needed (+$0.96). |
| `01_launch_clip_b` | **Good.** Gold twisted cable tracks left to right past folded blue panels, bead in focus, refraction flicker at the glass edge on the last frame. On-language with the reference's cable spine. |
| `05_launch_clip_a` | **Excellent.** Two rockets rise, burst symmetrically blue and white, smoke drifts, second pair lower, fades. Locked camera, amber plaza steady. The best clip in the batch. |
| `05_launch_clip_b` | **OK on retry**, run alone, 104s. Three Fast jobs is the safe concurrency on this tier. |

**Spent so far:** 2 test stills $0.08 · Veo Lite test $0.20 · Group A 17 stills
$0.66 · momo_hero regen $0.04 · Group B 3 Fast clips $2.88 (the 429 was not
billed) · five analyses on 3.5 Flash (token-priced, small).
≈ **$3.86 + tokens**, with the fourth clip's $0.96 pending.

**No Higgsfield comparison is claimed.** No verified per-piece Higgsfield
baseline exists in this repo. What is verified: the prior 15-piece batch
rendered in Remotion at zero credits, and the routes above are priced from
Google's page as fetched today.

### Still unresolved

- ~~Veo Lite 4s/720p image-to-video test~~ **Resolved: works.** `tests/momentum_04_bumper_clip_test.mp4` — 1280×720, 24fps, 4.0s, 344 KB, rendered in 30s, $0.20. The M-disc blinks, rocks and settles; proportions, ring width and eye size hold across the clip; the cylinder and shadow stay fixed. Image-to-video on Lite is viable for plates; the loop and reference behaviours remain Fast-only per the docs.
- Whether `referenceImages` holds the M-disc and Momo proportions well enough
  to beat a Remotion rig — decided by one Fast clip each, not assumed.
- Mascot and likeness acceptance from Mac and Sean — gates WS3, WS4 and the WS5
  portrait beat.
