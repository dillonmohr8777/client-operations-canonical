# Momentum AI — division launch spot, 30s · edit decision list

Drafted 2026-09-07 against the clips on disk and in the queue. One spot, TV-grade,
16:9, 24fps, 1920×1080. Scrapbook opens it; the machine takes over; the mark closes
it. Nothing generated carries a letterform — every word is an overlay.

**Type, matched to the Bridge redesign:** Montserrat 800 for display, Poppins 500
for sublines, **Caveat** for handwritten scrapbook annotations. Inter never appears
on screen.

**Palette rule:** the first 8s live in Palette P (cream, sepia, one blue). From 8s
the launch palette (royal blue, gold, dark) takes over. The close returns to cream.
The two worlds meet exactly once, on the fold.

## Timeline

| t | Shot | Source | Overlay | Sound |
|---|---|---|---|---|
| 0.0–1.2 | Empty cream. | `stills/momentum_04_bumper_endcard.png` | — | room tone |
| 1.2–5.0 | **Scrapbook assembles** — torn sheets land, tape presses, corners snap, brad drops, blue triangle rocks to rest. | `clips/momentum_x8_scrapbook_opener_clip.mp4` (0–3.8s) | Caveat, handwritten, upper-left in the clean third: *"we built a machine."* — writes on letter by letter from 2.4s | paper flops, tape press, one brass tick |
| 5.0–8.0 | **The bird lifts off** the engraving and exits upper-right. | `clips/momentum_x7_bird_liftoff.mp4` (1.5–4.5s) | Caveat, small, near the ghost outline: *"now we build yours."* | wingbeats, paper stillness |
| 8.0–10.5 | **Match cut on the blue triangle** — the fold wave runs the row. Cream ground, launch object. | `clips/momentum_x3_the_fold_clip.mp4` (0–2.5s) | — | paper snaps in rhythm, six of them |
| 10.5–13.5 | **Hard cut to dark.** Polyhedron opens into its net and closes. | `clips/momentum_01_launch_clip_a_v2.mp4` (1.0–4.0s) | Montserrat 800, white, bottom-left: **A NEW DIVISION.** steps up line by line. Eyebrow above in Poppins caps: INTRODUCING · MOMENTUM DIGITAL · PHILADELPHIA, gold rule | low sub hit on the cut; mechanical fold snaps |
| 13.5–16.0 | Gold cable macro tracks right. | `clips/momentum_01_launch_clip_b.mp4` (2.0–4.5s) | — | metallic hum |
| 16.0–18.5 | **Services flat-lay** — cards pop in. | `clips/momentum_02_services_clip_a.mp4` (0–2.5s) | Montserrat, charcoal, right third: *We run the ads.* Tiny label bottom-left: *Illustrative UI — not client work.* | three paper pops |
| 18.5–20.5 | Map pins drop, list slides. | `clips/momentum_02_services_clip_b.mp4` (0–2.0s) | *We win the map.* | pin taps |
| 20.5–22.5 | **Momo turns to the phone.** | `clips/momentum_03_momo_clip_a.mp4` (1.0–3.0s) | Speech bubble overlay, Caveat: *spend check?* | rubbery antenna tick, one rounded pop |
| 22.5–24.5 | **Paper city** — push toward the roof, the M-disc hops. | `clips/momentum_x2_paper_city_clip.mp4` (2.0–4.0s) | — | soft thump |
| 24.5–27.0 | **Fireworks** over the museum, symmetrical blue and white. | `clips/momentum_05_launch_clip_b.mp4` (1.0–3.5s) | Montserrat 800, white, centre: **BUILT, NOT PROMPTED.** | two real reports, delayed after the flash |
| 27.0–30.0 | **Particles converge into the mark**, wordmark beneath. | `composites/momentum_logo_particles_v1.mp4` (5.0–8.0s) | Poppins, small, under wordmark: *The AI division of Momentum Digital* · bottom: *PHILADELPHIA. SINCE 2015. · NEEDMOMENTUM.COM* | swell, then silence on the last frame |

Cuts are hard throughout except one 12-frame dissolve into the final composite.
Total 30.0s.

## Alternates already on disk

- Momo clips b and c (lean; wake-and-hop) — swap into 20.5 if `clip_a` reads stiff.
- `momentum_x1_momo_machine_clip` — Momo meets the polyhedron; a 2s insert between
  22.5 and 24.5 if the spot wants the mascot and the machine in one frame.
- `momentum_04_bumper_clip_a` (limbs) / `_v2` (no limbs) — the loop bumper for
  social, not the spot.
- `momentum_x5_particles_disperse` — a reverse close for the 15s cutdown.
- `momentum_x6_particles_cream_converge` — the mark reveal on cream, if the close
  should stay in the paper world instead of going dark.

## Cutdowns

- **15s:** 1.2–5.0 opener → 10.5–13.5 polyhedron → 24.5–27.0 fireworks → 27.0–30.0 mark.
- **6s bumper:** 5.0–8.0 bird → 27.0–30.0 mark.
- **9:16 stories:** re-crop centre-out; the opener and paper city need a vertical
  re-render (Veo takes 9:16), the rest crop cleanly.

## Assembly

Remotion, in the existing `founder-collateral/remotion` project — same
composition set that rendered the 15-piece batch at zero credits. Fonts must be
shipped in `public/`, never fetched at module scope. The clips are `<Video>`
sources; every overlay is a component; the mark and wordmark are the canonical
PNGs. `qa.py` runs the forbidden-hue scan on the render before it ships.

Nothing in this EDL is rendered yet. It is the plan the assembly follows.
