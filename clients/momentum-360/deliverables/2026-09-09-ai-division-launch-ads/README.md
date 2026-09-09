# Momentum AI — launch film set

Eleven pieces: five launch ads, four lane films, one proof film, and a flat
variant kept for comparison. All 1920×1080, h264, 30fps, silent.

Built 2026-09-09.

## Renders

### Launch ads — 15s each
| File | Beat 1 → 2 → 3 | Hero |
|---|---|---|
| `ad-01-machine-3d.mp4` | Momentum built the machine → Now we build yours → lockup | torus knot |
| `ad-01-machine.mp4` | same copy, no 3D — kept for comparison | — |
| `ad-02-found.mp4` | AI writes the answer now → Can it read your site? → lockup | icosahedron |
| `ad-03-five-days.mp4` | Most agencies send a deck → We send the prototype → "5" | cylinder |
| `ad-04-receipt.mp4` | "We got you 32 leads" → From who? → has a receipt | torus |
| `ad-05-hours.mp4` | An AI division whose product is one person's → HOURS → Meet Momo | Momo (card) |

### Lane films — 15s each
| File | Promise | Hero |
|---|---|---|
| `lane-01-aeo-geo.mp4` | Get found where AI writes the answer | dodecahedron |
| `lane-02-ai-design.mp4` | See the thing in five working days | cube |
| `lane-03-ai-marketing.mp4` | Content that moves, your logo never model-drawn | torus knot (3,4) |
| `lane-04-ai-automation.mp4` | Every accepted lead has a receipt | octahedron |

### Proof film — 20s
`film-match-back.mp4` — the claim (32 conversions) → the pipeline with one
lead token walking form → dedupe → matched → the ledger resolving MATCHED row
by row → "every accepted lead has a name."

**This is the asset Momentum had none of.** A repo-wide search for
case-study / testimonial / proof assets returns hits for Align HCM and
BigOrange and **nothing for momentum-360**.

## Copy provenance

All copy comes from `2026-09-07-ai-division-claude-design/POSITIONING.md`.
Nothing is invented. That document's "what we do not say" guardrails are
respected throughout: no guaranteed citations, rankings, leads or revenue; no
site-count claim; no invented testimonials. The AEO/GEO lane film carries the
"no ranking promise" caveat on screen.

The "32 leads" in `ad-04` is the real Onsite Concrete & Landscape form count
from the Sept 8 call-evidence audit, used as a rhetorical setup — not as a
client result claim.

### Privacy line in the match-back film

Naming a **client business** is fine — needmomentum.com already names Urban
Axes, Hip Hemp Cafe, Cryo Philly and a dozen case-study clients publicly.
Naming a **lead** — an individual who filled in a form — is personal data and
never goes in a public asset.

So the film shows the *mechanism* with every name masked and the line "Names
are masked here. You get them in full." The real named-lead match-back belongs
in the private client report, not on screen.

## Design system

Colour is a literal copy of `momentum-design-system/tokens.css` v1.0.0.
Foreground tokens are used only on their legal surface. `--m-brand #155E86` is
the only fill that legally takes white text (7.05:1), which is why it carries
every punch slide. **Signal orange is deliberately absent** — this set is blue
and white.

**Fonts: Archivo Black + Nunito Sans**, per the token spec. Archivo Black is a
single-weight face (400 only) — never set a numeric weight above 400 on it or
the browser synthesises a fake bold. Vendored into `assets/fonts/` so renders
never depend on a network fetch.

> **Open issue elsewhere:** `2026-09-08-momentum-brand-system-v3` uses
> Montserrat + Poppins across 190 declarations, contradicting the token file.
> This set follows the tokens; **v3 is what's out of step.**

## Structure

```
index.html                    # whichever composition is being worked on
assets/momentum.css           # tokens, surfaces, type scale, payoff, wipe
assets/hero.js                # shared Three.js hero (see below)
assets/fonts/                 # vendored Archivo Black + Nunito Sans
assets/momo.png               # Momo still, downsized to 720px
compositions/                 # 11 compositions
renders/                      # MP4 output + qa.py + qa-report.json
snapshots/                    # per-piece contact sheets used for review
build-lane-films.py           # generates the four lane films
```

## `assets/hero.js` — read before editing any 3D

Two things in it are load-bearing:

1. **All motion is a pure function of `hf-seek` time.** The `three` adapter has
   no duration inference, so the root needs `data-duration`, and any
   `requestAnimationFrame` or wall clock makes the render non-deterministic.
2. **The hero auto-fits from its own bounding sphere.** The first 3D pass
   cropped on rotation because the radius was hand-guessed. The module now
   computes `geometry.boundingSphere.radius` and clamps scale so
   `x + r·scale ≤ 4.35` (the frustum half-width at z=8.0, fov 34, 16:9). Pass
   any geometry; it cannot crop.

Lighting is shared so all eleven read as one set: key top-left, `--m-brand-lift`
rim behind-right for real specular, plus a ground bounce and a weak fill — a
near-black ground crushed the icosahedron's lower facets to solid black.

## Verification

Every piece passes: **0 lint, 0 runtime, 0 layout issues across 9 samples,
0 motion, 100% WCAG AA** (12–51 text checks each), and **0.0% purple** on the
`qa.py` hue scan (orange ≤0.02%, antialiasing on paper surfaces).

```bash
cp compositions/<name>.html index.html
npx hyperframes check
npx hyperframes snapshot --at 2,4,7,9,12,14 -o snapshots/<name>
npx hyperframes render -c compositions/<name>.html -o renders/<name>.mp4
cd renders && python qa.py
```

Three traps worth knowing:

- **`check` and `snapshot` take no `-c` flag** — only `render` does. They audit
  `index.html` only, so per-composition verification means promoting the target
  to `index.html` first.
- **A lint error silently disables the layout and contrast audits.** They then
  report `0 sample(s)` and `0/0`, which reads clean but means nothing ran.
  Always confirm lint is clean before trusting those numbers.
- **Stop the Studio preview before editing compositions.** A running
  `hyperframes preview` stamps `data-hf-id` attributes into the files as you
  write them (`npx hyperframes preview . --stop`).

## Known gaps

- **Silent.** No audio on any piece. Local MusicGen/TTS aren't installed, so a
  bed needs sourcing or supplying. Scores for the three finished Claude Design
  films live in `claude-design-exports/finishing/{A,B,M}-score.wav` if you want
  a matched treatment.
- **Not built:** the 3s branded stings and the 60s anthology cut.
- **Momo has no alpha.** All four source stills are RGB, so he sits on a card
  rather than as a cutout. A true cutout needs a background-removal pass.
- **GSAP loads from CDN without Subresource Integrity** (HyperFrames scaffold
  default). Harmless for local rendering; pin it if these are ever hosted.
