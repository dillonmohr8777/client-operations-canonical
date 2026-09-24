# Higgsfield Prompt Pack

## Recommended pipeline

1. Build two clean start/end keyframes outside the video model using the exact Mac, Sean, and Momentum 360 assets.
2. Generate the 15-second 9:16 identity/motion master with Seedance 2.5 in `omni_reference` mode at 1080p and high bitrate.
3. Use the approved founder walk/cross-arms film and the supplied 11-second scan-shell film as motion/style references.
4. Keep model audio off for the identity master. Add an original beat-synced music and sound-design track in post.
5. Composite the exact logo and end line after generation.
6. Review contact sheets and motion, then upscale the accepted master to 4K using Bytedance Video Upscale Pro (`aigc`) or Topaz 2160p.

Current Higgsfield preflight on 2026-08-31: Ultra plan, 2,195.86 credits. A single 15-second Seedance 2.5 1080p render currently estimates at 135 credits. Recheck account and cost immediately before submitting a paid job.

## Film A — Philadelphia in Motion

### Model prompt

Create a cinematic 15-second vertical brand film for Momentum 360. Preserve the two supplied founders as two distinct real people for the entire shot: Mac Frederick always on frame-left in the light-blue suit, Sean Boyle always on frame-right in the black suit. Their faces, hair, facial proportions, apparent age, skin texture, and body proportions must match the supplied canonical portraits and approved founder film exactly. Do not average, beautify, age, de-age, swap, or redesign either face.

The entire world exists inside one floating torn photogrammetry paper-shell suspended against a clean deep-midnight negative field. The shell contains a believable Philadelphia street environment with real urban scale and coherent architecture. It has fibrous torn edges, LiDAR point gaps, folded spatial depth, translucent scan planes, and sparse cyan-blue and gold capture markers. Never expand the generated environment to fill the full frame.

Open on the small shell waking with cyan points and one gold orbit. The shell unfolds to reveal Mac and Sean walking naturally toward camera. Mac glances toward a storefront and makes a compact open-left-hand invitation gesture. Sean maintains a deliberate forward stride, gives a subtle nod, and completes one realistic handshake with a local business owner. Mac then frames the property with a small two-hand gesture. A cyan capture line maps the storefront and becomes a clean 360-degree orbit. The orbit reconstructs a contemporary Momentum 360 studio facade inside the shell. Mac and Sean settle in front of it and cross their arms in the same grounded rhythm as the approved founder film. End with their faces clear and still, leaving clean negative space for an exact logo and tagline to be composited later.

Camera: 35mm documentary-cinematic lens, controlled parallax, compact dolly-through-fold move, then one smooth spatial orbit; no handheld shake. Lighting: believable daylight inside the shell with restrained cyan edge light and sparse gold nodes; faces remain naturally lit. Motion: normal human weight and joint speed, stable hands, no lip dialogue, no dancing. Quality: photographic, high local facial detail, coherent architecture, high bitrate, no smear.

### Negative constraints

No face morphing, face swap, extra people resembling either founder, duplicated bodies, rubber hands, extra fingers, warped teeth, blue eyes changing color, uncanny smile, synchronized avatar walk, float-walking, full-frame city, cyberpunk neon, dirty gray background, random particle explosion, illegible text, invented logos, watermarks, captions, UI boxes, cursor graphics, product labels as focal points, fake Philadelphia landmark collage, or camera motion that hides the founders at the end.

## Film B — The Corner Store Scan

### Model prompt

Create a cinematic 15-second vertical Momentum 360 service film that preserves the two supplied founders as distinct real people. Mac Frederick remains frame-left and Sean Boyle frame-right whenever they share a shot. Match their canonical portraits and approved founder film exactly, including facial age, proportions, hair, skin detail, and clothing identity. Do not average or redesign them.

The entire corner-store environment exists inside one suspended torn photogrammetry paper-shell against a clean deep-midnight negative field. Keep the store, founders, and owner inside the shell throughout. The shell has believable torn capture edges, point-cloud gaps, depth folds, scan planes, and restrained cyan-blue and gold tracking marks. Sean walks through an aisle and completes one realistic handshake with the owner. Mac is near the counter, turns toward the lens, then makes one deliberate open-hand reach toward camera that triggers the spatial scan. A compact 360-degree orbit separates shelves, coolers, ceiling lines, and counter geometry into clean point-cloud layers. The store folds inward like a captured digital twin while both founders remain stable and human. End with both facing camera and a clean area for exact Momentum 360 logo and tagline to be composited afterward.

Camera: 28–35mm lens, controlled 360 orbit, strong foreground-to-background parallax, no shake. Lighting: practical store light made cinematic but believable, restrained cyan/gold signal reflections, natural faces. Motion: one action per founder per shot, real weight, clean hands, no lip dialogue. Visual tone: ambitious commercial craft, not a novelty AI filter.

### Negative constraints

No face drift, identity blend, third founder, rubber fingers, morphing bodies, floating products, illegible brand labels as focal points, dirty gray void, full-frame store background, random glitch storm, neon cyberpunk palette, generated typography, invented Momentum logo, watermarks, captions, or unstable end frame.

## Post-production lockup

- Exact asset: `momentum-360-logo.png`
- Wordmark line: `MAKE EVERY SPACE MOVE.`
- Hold: minimum 1.5 seconds
- Background: `#041027`
- Signal colors: `#2f82ff`, `#7be7ff`, sparse `#f2b63d`
- Add typography and mark in post only.

