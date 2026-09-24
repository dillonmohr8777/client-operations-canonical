# Momentum AI Division — Google AI Studio Video Production Pack

**Prepared:** September 7, 2026  
**Status:** Copy-ready prompt orchestration pack & production manifest  
**Brand:** Momentum Digital / Momentum 360  
**Format:** 16:9 Master Video Suites (Veo 3.1 conditioning on Imagen 4 anchors)  
**Authorization Reference:** `AQ.Ab8RN6K6JZUOKVdA0uKbePQJjLKl2-ky7byZtUJzkNDrTWwMoQ`

---

## Shared Brand & Creative Direction

### 1. Palette & Surface Physics (Dark-First)
- **Deep Void / Background:** `#0e1a22` (Navy-black field)
- **Brand Blue / Volumetric Light:** `#1e73be` (Cool daylight, structural lighting, glass edge refraction)
- **Warm Accent / Kinetic Signal:** `#f58320` / `#f9a03f` (Single amber-orange focal light: data trails, storefront windows, status indicators)
- **Paper / Highlight:** `#fbfaf7` / `#ffffff` (Typographic overlays and sharp specular edges)
- **Prohibited:** No saturated neon purple, cyan, yellow, or random rainbow bloom.

### 2. Post-Production Brand Compositing Rule
- Generative models generate plates, architectural shells, and mascot performance only.
- No model redraws, morphs, or letters the Momentum mark. The verified mark (`video/assets/momentum-logo-white.png`) is composited downstream in editing.
- Display typography: `Archivo Black` (-0.02em tracking). Body/telemetry: `Nunito Sans` (600/800) and `IBM Plex Mono`. Accent script: `Caveat` (700).

---

## 1. Premium AI Division Launch

### A. Creative Brief
- **Objective:** Position Momentum AI as an elite architectural and systems engineering capability.
- **Visual Treatment:** A suspended torn photogrammetry fragment floating on a `#0e1a22` void. Macro architectural geometry, precision glass and aluminium, cool blue ambient lighting with a warm amber storefront interior.
- **Finished Piece Message:** "Momentum built the machine. Four lanes. One architecture."

### B. Asset Generation Prompts (Image Anchors)

#### Hero Start-Frame: `momentum_01_launch_hero.png`
*Model: Imagen 4 Ultra | Aspect: 16:9, 2K*
```text
A hyper-detailed architectural macro photograph of a historic Philadelphia rowhouse and contemporary studio block at deep twilight blue hour, captured inside a single suspended torn photogrammetry paper-shell fragment floating serenely on a pure, clean deep navy-black background (#0e1a22). The fragment features fibrous torn structural edges, microscopic LiDAR point-cloud coordinate gaps along the perimeter, and folded three-dimensional spatial depth. Cool architectural blue daylight illuminates the interior geometry, contrasted by a single glowing warm amber-orange practical light (#f58320) inside a corner storefront window. High-end commercial architectural photography, 35mm lens, f/4 aperture, pristine optical clarity, razor-sharp focus on the architectural facets. Clean, generous negative space across the entire left third of the frame for post-production typography. No text, no signs, no logos, no people, no UI, no lens flares, no neon.
```

#### Detail Image: `momentum_01_launch_detail.png`
*Model: Imagen 4 Standard | Aspect: 16:9, 2K*
```text
Macro extreme close-up of precision engineered glass and brushed dark navy aluminium connection nodes interlocking with microscopic precision. A micro-etched tactile glass prism refracts a razor-thin cool blue light beam into a single pinpoint amber-orange data node. Minimalist industrial design, premium materials, shallow depth of field with buttery smooth bokeh, clean dark navy-black studio background. High-end hardware engineering aesthetic. No text, no fingerprints, no dust, no logos.
```

#### Clean End-Card: `momentum_01_launch_endcard.png`
*Model: Imagen 4 Fast | Aspect: 16:9, 2K*
```text
A minimal, cinematic studio plate featuring an empty, deep navy-black field (#0e1a22) with a very subtle, soft radial illumination of brand blue (#1e73be) in the center-right quadrant. Crisp architectural horizon line formed by a razor-thin translucent frosted glass edge resting in deep perspective at the bottom edge. Pristine negative space filling 80% of the frame, designed as a clean canvas for high-contrast white typographic overlay. 35mm aesthetic, ultra-clean digital plate, no noise, no artifacts, no text, no marks.
```

#### Reusable Facade Shard: `momentum_01_launch_element_shard.png`
*Model: Imagen 4 Fast | Aspect: 1:1, 1K*
```text
An isolated 3D photogrammetry mesh shard floating in space, showing an architectural facade fragment with wireframe point-cloud data edges and translucent glass layering, rendered against a solid pure black background for alpha matting. Clean geometric contours, cool blue lighting with warm amber rim accents. High-resolution 3D asset render.
```

### C. Video Generation Prompts (Veo 3.1)

#### Clip A (0:00 - 0:08): `momentum_01_launch_clip_a.mp4`
*Model: Veo 3.1 Standard | 1080p | 8s | Conditioning: Start frame = `momentum_01_launch_hero.png`*
```text
Cinematic, controlled slow dolly push-in toward the suspended photogrammetry architectural fragment as it gently rotates two degrees on its vertical axis. The deep navy-black void remains completely still. Inside the architectural fragment, razor-sharp warm amber-orange particles light up on the corner storefront surface and begin tracing a precise, elegant vector route along the facade's horizontal moldings. The camera maintains a perfectly smooth, stabilized tracking move with zero handheld jitter. Volumetric cool blue daylight remains steady through the glass structures. The amber trajectory reaches the corner edge and begins a smooth 90-degree orbital sweep just as the clip reaches second 8. Clean cinematic lighting, zero motion blur on stationary geometry, 24fps motion cadence, photographic 35mm film aesthetic.
```

#### Clip B (0:08 - 0:16): `momentum_01_launch_clip_b.mp4`
*Model: Veo 3.1 Standard | 1080p | 8s | Conditioning: Start frame = Final extracted frame of Clip A*
```text
Continuing from the previous position: The orbital amber signal line smoothly tightens into a single luminous closed ring around the upper cornices of the building. The suspended paper-shell fragment performs a subtle, mechanical inward fold, settling into a stable, locked perspective against the clean navy-black void. The camera movement decelerates with a smooth ease-out curve, locking into a static frame during the final 2.5 seconds. The warm amber practical light inside the storefront window glows with warm intensity while the surrounding deep void remains pure and undisturbed. Left third of the frame settles into complete negative space with zero foreground occlusions. Pristine stability, zero geometric pulsing, razor-sharp edge definition.
```

### D. Finishing Plan & Compositing Timeline
- **0.0s – 1.0s:** Cut in on Clip A. Sound design: Low sub-bass frequency drone (40Hz) paired with a tactile glass click.
- **1.0s – 4.5s:** Lower-left animated title overlay in `Nunito Sans` 800: `"MOMENTUM AI DIVISION"`.
- **4.5s – 8.0s:** Amber trace reaches corner; crystalline chime. Match-cut to Clip B at 8.0s.
- **10.5s – 13.5s:** Center-left display copy: `"Four lanes. One machine."` (`Archivo Black`, 54pt, `#fbfaf7`).
- **13.5s – 16.0s:** Final hold. Center overlay reveals verified `momentum-logo-white.png` at 64px height with `"AI"` in `Archivo Black` beside it.

### E. Quality Control Exclusions
```text
face morphing, synthetic people, extra bodies, illegible sign letters, neon purple bloom, particle explosion, camera shake, jitter, warping rooflines, dirty grey void.
```

### F. Cost Route
- **Test:** Veo 3.1 Fast (1080p) = $0.12/s × 16s = $1.92.
- **Master:** Veo 3.1 Standard (1080p) = $0.40/s × 16s = $6.40.

---

## 2. Marketing Services Motion System

### A. Creative Brief
- **Objective:** Showcase the multi-touch attribution, lead qualification, and reporting engine.
- **Visual Treatment:** Tactile, editorial SaaS motion graphics. Ceramic smartphone, stacked tactile data cards, physical spike spindle, laser attribution thread.
- **Finished Piece Message:** "Every click verified. Every lead with a receipt."

### B. Asset Generation Prompts (Image Anchors)

#### Hero Start-Frame: `momentum_02_saas_hero.png`
*Model: Imagen 4 Ultra | Aspect: 16:9, 2K*
```text
Top-down 45-degree angle editorial still of a premium ceramic-matte smartphone resting on a minimalist dark architectural slate surface. Floating crisp, semi-translucent frosted glass UI cards hover above the phone display, showing simplified tactile data blocks, geographic node routes, and clean bar metrics in white, brand blue (#1e73be), and restrained amber-orange (#f58320) indicator pills. Tactile, premium physical materials: frosted glass with realistic refraction, matte white stock cards, clean geometric shadows cast on the surface below. Pristine studio lighting with soft specular highlights along the phone bevel. Right third of the frame is open negative dark slate. No legible text, no fake placeholder gibberish, no stock logos, no human hands.
```

#### Detail Image: `momentum_02_saas_detail.png`
*Model: Imagen 4 Standard | Aspect: 16:9, 2K*
```text
Macro close-up view of a tactile physical spike spindle holding a neat vertical stack of textured matte paper receipts and verification vouchers on an obsidian desk. A single, glowing warm amber-orange attribution beam passes vertically through the center of the stack like a fiber-optic laser thread. Cool blue edge lighting highlights the fibrous edges of each paper slip. Shallow depth of field, f/2.8, cinematic macro realism. Negative space above the stack. No legible text, no barcodes, no trademarks.
```

#### Clean End-Card: `momentum_02_saas_endcard.png`
*Model: Imagen 4 Fast | Aspect: 16:9, 2K*
```text
A clean, dark editorial motion-graphics backdrop. Dark charcoal-navy canvas (#14181b) overlaid with a subtle, ultra-faint geometric attribution grid in 4% opacity brand blue. A singular, perfectly horizontal amber laser hairline spans the lower third. Uncluttered, expansive, high-contrast backdrop optimized for overlaying client KPI charts and logo badges.
```

#### Reusable Badge Element: `momentum_02_saas_element_badge.png`
*Model: Imagen 4 Fast | Aspect: 1:1, 1K*
```text
An isolated 3D glossy translucent pill badge with an internal glowing amber verification checkmark symbol, floating at a 15-degree tilt against a pure black background. Crisp edges, glass refractive highlights, ambient occlusion shadow baked below. Isolated asset for motion graphic compositing.
```

### C. Video Generation Prompts (Veo 3.1)

#### Clip A (0:00 - 0:08): `momentum_02_saas_clip_a.mp4`
*Model: Veo 3.1 Standard | 1080p | 8s | Conditioning: Start frame = `momentum_02_saas_hero.png`*
```text
Cinematic, slow lateral tracking camera move from left to right across the phone and glass cards. The floating frosted glass UI panels lift smoothly away from the smartphone surface by several millimeters. Three crisp, tactile white notification cards slide into the composition along clean linear tracks, docking into an organized vertical cascade. As each card docks, a tiny amber-orange pinpoint indicator lights up on its top-right corner. The camera pushes in slightly with buttery smooth damping. Realistic soft glass refractions interact with the dark slate table surface below. Motion is precise, tactile, and rhythmic, reminiscent of high-end Swiss product design animations. 24fps, zero jitter, zero warping of the phone geometry.
```

#### Clip B (0:08 - 0:16): `momentum_02_saas_clip_b.mp4`
*Model: Veo 3.1 Standard | 1080p | 8s | Conditioning: Start frame = `momentum_02_saas_detail.png`*
```text
Controlled orbital camera move around the vertical receipt spindle and attribution stack. A sequence of thin, glowing cool blue data packets flow along the surface of the desk and feed directly into the base of the spindle. Each packet lands and transforms into a new paper layer, settling neatly into the stack with physical weight and tactile physics. The vertical amber laser thread through the center pulses with a steady, reassuring cadence. At second 5.5, a duplicate packet approaches, is instantly deflected by a subtle pulse, and dissolves cleanly without disrupting the stack. The camera settles into a stable, heroic frontal lock for the final 2 seconds. Crisp lighting, pristine paper texture fidelity, zero mesh distortion.
```

### D. Finishing Plan & Compositing Timeline
- **0.0s – 3.0s:** Mechanical card clicks, paper rustles, UI tactile pops.
- **3.0s – 7.5s:** Vector UI overlay: `"LEAD INGESTION: 100% VERIFIED"` and `"ROAS ATTRIBUTION"`.
- **8.0s:** Straight cut to Clip B on an electronic kick drum.
- **12.0s:** Deflection event accompanied by warm chime and UI tag: `"DUPLICATE FILTERED"`.
- **14.0s – 16.0s:** Lower center title: `"Verified attribution. Zero guesswork."` (`Archivo Black`, 42pt). Master logo lockup.

### E. Quality Control Exclusions
```text
illegible AI typography, garbled fake charts, rubbery phone edges, floating hands/thumbs, erratic card spinning, random particle clouds.
```

### F. Cost Route
- **Test:** Veo 3.1 Lite (720p) = $0.05/s × 16s = $0.80.
- **Master:** Veo 3.1 Standard (1080p) = $0.40/s × 16s = $6.40.

---

## 3. Momo AI Assistant

### A. Creative Brief
- **Objective:** Introduce Momo—Momentum's proprietary AI operating assistant—as a friendly, capable autonomous co-pilot.
- **Visual Treatment:** Minimalist matte cobalt-and-ivory robot mascot with an expressive amber OLED visor eye display. Premium tactile finish.
- **Finished Piece Message:** "Meet Momo. Your business operating assistant."

### B. Asset Generation Prompts (Image Anchors)

#### Hero Start-Frame: `momentum_03_momo_hero.png`
*Model: Imagen 4 Ultra | Aspect: 16:9, 2K*
```text
A charming, high-end 3D character design of Momo, a compact AI assistant robot. Momo stands 30cm tall on a sleek walnut and frosted glass desk. Momo has a smooth, curved ivory-white ceramic torso, matte brand blue (#1e73be) limbs with magnetic sphere joints, and a curved black glass visor face displaying two soft, expressive glowing amber-orange curved eye arcs showing an attentive, curious expression. Momo is interacting with a floating frosted glass tablet, one mechanical hand gently tapping the screen edge. Studio product lighting, soft rim light, clean dark navy background with warm wooden accents. Ultra-premium Pixar-meets-Teenage-Engineering design aesthetic. Impeccable proportions, clean silhouette. No text, no logos, no distorted joints.
```

#### Detail Image: `momentum_03_momo_detail.png`
*Model: Imagen 4 Standard | Aspect: 16:9, 2K*
```text
Close-up portrait of Momo the AI robot looking slightly upward and to the right toward the camera with an endearing, intelligent head tilt. The curved black OLED visor face shows two glowing amber curved crescent eyes in a happy, smiling arc. Detailed view of the ceramic texture, micro-beveled seams, and a tiny glowing amber status ring on its shoulder plate. Beautiful soft photographic lighting, 50mm portrait lens, f/2.0, soft background bokeh in navy and dark charcoal. Pristine character render.
```

#### Clean End-Card: `momentum_03_momo_endcard.png`
*Model: Imagen 4 Fast | Aspect: 16:9, 2K*
```text
A cozy, modern desktop studio environment viewed from a low angle. Dark navy-blue wall with soft ambient warm backlight illuminating a clean desk plane. The left half has ample clear negative space for graphics; the right third shows the soft out-of-focus edge of the walnut desk where Momo stands. Warm, inviting, cinematic commercial lighting.
```

#### Master Character Identity Anchor: `momentum_03_momo_character_ref.png`
*Model: Imagen 4 Ultra | Aspect: 1:1, 2K*
```text
Full-body character model sheet turnaround anchor of Momo the AI robot, neutral standing pose, front three-quarter view, against an isolated neutral grey studio background. Exact physical specifications: matte ivory ceramic torso, brand blue (#1e73be) articulated limbs, ball-and-socket magnetic joints, black glass visor with dual amber glowing crescent eyes, height-to-width ratio 1.4:1. Consistent character identity model sheet for cross-prompt reference conditioning.
```

### C. Video Generation Prompts (Veo 3.1)

#### Clip A (0:00 - 0:08): `momentum_03_momo_clip_a.mp4`
*Model: Veo 3.1 Standard | 1080p | 8s | Conditioning: `momentum_03_momo_hero.png` + Character Ref*
```text
Cinematic eye-level shot of Momo the AI robot standing on the desk. Momo looks attentively at a hovering frosted glass notification card, tilts its head 15 degrees in curious analysis, then reaches out with its smooth blue hand and performs a crisp, confident swipe gesture to the right. The glass card glides smoothly off-screen with tactile responsiveness. Momo turns its body toward the camera, its black glass visor blinking once as its amber glowing eyes shift from crescent arcs into an alert, cheerful greeting expression. Camera pushes in smoothly from medium-close to close-up, maintaining crisp focus on Momo's face. Natural robotic weight, dampened mechanical movement, zero rubbery limb deformation. Studio lighting remains consistent, 24fps.
```

#### Clip B (0:08 - 0:16): `momentum_03_momo_clip_b.mp4`
*Model: Veo 3.1 Standard | 1080p | 8s | Conditioning: Final extracted frame of Clip A + Character Ref*
```text
Close-up continuation: Momo faces the camera directly, performs a small, delighted double-nod, and raises its right mechanical hand to deliver a distinct, charming thumbs-up gesture. As it holds the thumbs-up, its glowing amber eye display pulses once with a warm, friendly shimmer. Momo holds this confident, charming pose completely steady for the final 3 seconds, looking directly into the camera lens with subtle breathing-style idle stabilization. Camera maintains a locked static frame. Lighting is warm and flattering, highlighting the ceramic texture of Momo's head and chest. Pristine character consistency, zero morphing of facial proportions, no extra fingers, zero visual jitter.
```

### D. Finishing Plan & Compositing Timeline
- **0.0s – 1.0s:** Electronic marimba motif and subtle mechanical servo SFX.
- **2.0s – 3.5s:** Swipe gesture accompanied by crisp glass slide audio.
- **3.5s – 7.5s:** Composited speech bubble: `"Lead qualified & booked!"` (with green verification checkmark).
- **8.0s:** Cut to Clip B; thumbs-up triggers synthetic pop and counter: `"+38% Operations Efficiency"`.
- **12.5s – 16.0s:** Headline resolves: `"Meet Momo. Built for Momentum."` (`Archivo Black`, 46pt).

### E. Quality Control Exclusions
```text
fluctuating eye colors (must stay #f58320), morphing limbs, human mouth or teeth on visor, rubbery noodle arms, extra fingers (3-finger mechanical gripper only).
```

### F. Cost Route
- **Test:** Veo 3.1 Fast (1080p) = $0.12/s × 16s = $1.92.
- **Master:** Veo 3.1 Standard (1080p) = $0.40/s × 16s = $6.40.

---

## 4. Mascot Micro-Animation

### A. Creative Brief
- **Objective:** Create a tight 6-to-12 second character loop/bumper (waking, peeking, reacting) for social bumpers, section transitions, and web UI idle states.
- **Visual Treatment:** Minimalist dark navy-black floor (`#0e1a22`), dramatic vertical spotlight, macro framing, micro-expressions.
- **Finished Piece Message:** "Always active. Always watching your growth."

### B. Asset Generation Prompts (Image Anchors)

#### Hero Start-Frame: `momentum_04_micro_hero.png`
*Model: Imagen 4 Ultra | Aspect: 16:9, 2K*
```text
Macro shot of Momo the AI robot sleeping in a powered-down compact resting crouch in the center of an empty, dark navy-black stage (#0e1a22). Momo's head is gently bowed, and the black glass visor face is completely dark and unlit. A single dramatic vertical overhead spotlight with soft falloff illuminates Momo's ivory ceramic curved shoulders and folded blue arms. Minimalist theater aesthetic, high contrast, clean negative space surrounding the character on all four sides. Razor-sharp photographic detail on the matte ceramic texture. No text, no background clutter, no logos.
```

#### Detail Image: `momentum_04_micro_detail.png`
*Model: Imagen 4 Standard | Aspect: 16:9, 2K*
```text
Extreme close-up of Momo's curved black glass visor just as the glowing amber-orange curved eye arcs illuminate in a razor-thin slit of light, signaling startup. Soft internal optical glow reflecting across the polished dark visor glass. Macro depth of field, f/1.8, atmospheric cinematic lighting, dark navy-black surround.
```

#### Clean End-Card: `momentum_04_micro_endcard.png`
*Model: Imagen 4 Fast | Aspect: 16:9, 2K*
```text
Pure, solid #0e1a22 navy-black canvas with a singular, faint circular floor puddle reflection of cool blue light in the center. Completely clean, empty graphic canvas designed for infinite video loop transitions and responsive website UI framing.
```

#### Action Grid Element: `momentum_04_micro_sprite_idle.png`
*Model: Imagen 4 Standard | Aspect: 1:1, 1K*
```text
A clean 4-panel visual storyboard grid of Momo the robot performing a subtle idle breathing loop: resting pose, slight chest rise, head lift, neutral eye blink. Rendered on pure black background. Consistent character proportions, identical lighting across all four cells.
```

### C. Video Generation Prompts (Veo 3.1)

#### Clip A (0:00 - 0:06): `momentum_04_micro_clip_a.mp4`
*Model: Veo 3.1 Standard | 1080p | 6s | Conditioning: `momentum_04_micro_hero.png` + Character Ref*
```text
Locked, static camera framing. Momo rests silently in the center spotlight for the first 1.0 second. At second 1.2, a soft amber boot-up glow pulses inside its chest seam. At second 2.0, Momo's head smoothly lifts upward; simultaneously, the black glass visor illuminates with two sharp, glowing amber crescent eyes that open wide with inquisitive alertness. Momo's magnetic shoulder joints make a small, precise micro-adjustment as it raises its posture into a crisp, upright sitting position. The camera remains locked with zero drift. The motion is deliberate, snappy, and full of charming robotic personality. Perfect 24fps cadence, razor-sharp focus on the visor glass.
```

#### Clip B (0:06 - 0:12): `momentum_04_micro_clip_b.mp4`
*Model: Veo 3.1 Standard | 1080p | 6s | Conditioning: Final extracted frame of Clip A + Character Ref*
```text
Locked static macro framing. Momo stands in the spotlight, looks directly at the camera lens, blinks its amber eyes once in a friendly double-tap cadence, and tilts its head 10 degrees to the left with an eager, ready-to-work attitude. At second 3.5, Momo gives a small, crisp nod of confirmation toward the viewer, raises one hand in a subtle two-finger wave, and holds that cheerful greeting pose with micro-idle stability for the remaining 2 seconds. The ending frame matches the lighting and physical center coordinates of the opening pose, enabling a seamless looping bumper edit. Zero geometric jitter, zero facial drifting.
```

### D. Finishing Plan & Compositing Timeline
- **0.0s – 1.2s:** Silence on dark frame, rising electrical hum.
- **1.2s – 2.5s:** Boot-up chime (ascending major third) + servo click on eye illumination.
- **6.0s:** Seamless cut to Clip B.
- **8.5s – 11.0s:** Wave SFX; optional `Caveat` script overlay: `"ready when you are"` (`#f9a03f`).
- **Loop:** Seamless reset to 0:00 for web and social bumpers.

### E. Quality Control Exclusions
```text
camera drift, background drifting from pure #0e1a22, flickering light sources, deformed eye shapes, ceramic roughness variations.
```

### F. Cost Route
- **Test:** Veo 3.1 Fast (1080p) = $0.12/s × 12s = $1.44.
- **Master:** Veo 3.1 Standard (1080p) = $0.40/s × 12s = $4.80.

---

## 5. Celebratory Launch Visual

### A. Creative Brief
- **Objective:** Climax piece celebrating the launch, rooted in Philadelphia civic pride and monumental scale.
- **Visual Treatment:** Philadelphia skyline at midnight blue hour, Schuylkill river reflections, curated brand-blue and warm white-gold aerial pyrotechnics.
- **Governance & Likeness Rule:** Pure architectural skyline master. Real founders (Mac Frederick & Sean Boyle) are introduced via post-production compositing from verified provenance assets or kept off-camera.
- **Finished Piece Message:** "Philadelphia built. Future ready. Momentum AI is live."

### B. Asset Generation Prompts (Image Anchors)

#### Hero Start-Frame: `momentum_05_launch_hero.png`
*Model: Imagen 4 Ultra | Aspect: 16:9, 2K*
```text
A breathtaking, cinematic wide-angle photograph of the Philadelphia skyline at deep midnight blue hour, captured from an elevated Schuylkill River perspective. The iconic glass spires of One and Two Liberty Place and the Comcast Technology Center pierce the dark twilight sky, with subtle warm architectural window illumination. The calm river in the foreground reflects the city lights in long, velvety ribbons of light. The sky above is pristine, dark navy-blue (#0e1a22), waiting for celebration. Ultra-high resolution, 28mm architectural lens, f/8, long exposure aesthetic, razor-sharp building facades, deep blacks, zero grain. Generous negative space in the upper sky quadrant for aerial celebration. No fireworks yet, no people, no watermark, no digital distortion.
```

#### Detail Image: `momentum_05_launch_detail.png`
*Model: Imagen 4 Standard | Aspect: 16:9, 2K*
```text
Dramatic medium-wide shot of the upper glass spires of the Philadelphia skyline at night, captured at the exact split-second when an elegant, professional burst of crisp brand-blue (#1e73be) and brilliant white-gold fireworks blooms in the dark sky directly between the skyscrapers. The burst casts realistic blue and gold specular reflections across the skyscraper glass facades. Cinematic commercial photography, 50mm lens, f/4, crisp starburst particles, dark atmospheric smoke trails. No red, green, or purple fireworks; strictly brand blue and warm white-gold.
```

#### Clean End-Card: `momentum_05_launch_endcard.png`
*Model: Imagen 4 Fast | Aspect: 16:9, 2K*
```text
A dark, ethereal Philadelphia night sky background at midnight, with the soft, out-of-focus bokeh silhouettes of skyscraper tips barely visible along the bottom edge. The upper 85% of the frame is a deep navy-black sky with gentle ambient blue atmospheric haze and a few slowly settling gold embers. Perfect high-contrast, uncluttered backdrop for the final division title card.
```

#### Reusable Pyrotechnic Asset: `momentum_05_launch_firework_burst.png`
*Model: Imagen 4 Fast | Aspect: 1:1, 1K*
```text
An isolated, clean burst of high-end spherical pyrotechnic willow trails in royal brand blue and bright white embers, centered against a solid pure black background for screen/add blending mode in compositing. Long exposure particle trails, crisp points of light, zero smoke obscuration.
```

### C. Video Generation Prompts (Veo 3.1)

#### Clip A (0:00 - 0:08): `momentum_05_launch_clip_a.mp4`
*Model: Veo 3.1 Standard | 1080p | 8s | Conditioning: Start frame = `momentum_05_launch_hero.png`*
```text
Grand, cinematic aerial drone flight pushing forward and slowly rising above the Schuylkill River toward the Philadelphia skyline at midnight. The city lights reflect in the dark water below. At second 3.0, the first high-altitude pyrotechnic shell launches from behind the skyline in a thin, glowing gold tracer line, ascending into the upper atmosphere. At second 5.5, it detonates into an enormous, majestic spherical bloom of electric brand blue (#1e73be) and glittering white willow trails directly above the skyscrapers. The flash illuminates the glass facades of Liberty Place with dynamic blue rim lighting. Smooth, stabilized aerial camera motion with heavy cinematic scale. 24fps, high bitrate, zero particle compression tearing.
```

#### Clip B (0:08 - 0:16): `momentum_05_launch_clip_b.mp4`
*Model: Veo 3.1 Standard | 1080p | 8s | Conditioning: Start frame = `momentum_05_launch_detail.png`*
```text
Cinematic wide perspective of the Philadelphia skyline. The grand finale unfolds across the night sky: multiple staggered bursts of tailored brand-blue and warm champagne-white fireworks illuminate the clouds and buildings in majestic layers. The aerial blooms linger, their delicate glittering embers cascading downward in graceful gravity trails. By second 5.5, the fireworks gently fade into soft, dissipating atmospheric smoke, revealing the pristine, illuminated city skyline standing tall and serene against the deep night sky. The camera settles into a majestic, stationary hold for the final 2.5 seconds, providing an expansive, steady canvas across the upper sky. Epic cinematic lighting, photorealistic smoke physics, zero visual glitching.
```

### D. Finishing Plan & Compositing Timeline
- **0.0s – 2.5s:** Orchestral string swell and atmospheric city night ambiance.
- **3.0s – 5.5s:** Rocket launch tracer whoosh into thunderous low-end aerial detonation.
- **8.0s:** Direct cut to Clip B; brass fanfare and layered fireworks explosions.
- **10.0s – 13.0s:** Upper sky title: `"PHILADELPHIA BUILT. WORLD CLASS."` (`Archivo Black`, 50pt).
- **13.0s – 16.0s:** Smoke dissipates; final master lockup reveals: `momentum-logo-white.png` + `"AI DIVISION"` + `"Let's build something measurable."` (`Nunito Sans`, 18pt).

### E. Quality Control Exclusions
```text
cartoon fireworks, carnival rainbow colors (red, green, purple, yellow), synthetic rooftop AI humans, distorted skyscraper facades, camera vibration.
```

### F. Cost Route
- **Test:** Veo 3.1 Lite (720p) = $0.05/s × 16s = $0.80.
- **Master:** Veo 3.1 Standard (1080p) = $0.40/s × 16s = $6.40.

---

## Master Batch Manifest & Pricing Summary

| Workstream | Image Stills (Models & Cost) | Test Video (Lite/Fast) | Master Video (Veo 3.1 Std) |
|---|---|---:|---:|
| 1. AI Division Launch | Hero ($0.06), Detail ($0.04), Endcard ($0.02), Shard ($0.02) = $0.14 | $0.80 | $6.40 |
| 2. Marketing Services Motion | Hero ($0.06), Detail ($0.04), Endcard ($0.02), Badge ($0.02) = $0.14 | $0.80 | $6.40 |
| 3. Momo AI Assistant | Hero ($0.06), Detail ($0.04), Endcard ($0.02), Ref ($0.06) = $0.18 | $1.92 | $6.40 |
| 4. Mascot Micro-Animation | Hero ($0.06), Detail ($0.04), Endcard ($0.02), Sprite ($0.04) = $0.16 | $1.44 | $4.80 |
| 5. Celebratory Launch Visual | Hero ($0.06), Detail ($0.04), Endcard ($0.02), Burst ($0.02) = $0.14 | $0.80 | $6.40 |
| **Totals** | **18 Assets: $0.76** | **$5.76** | **$30.40** |

- **Complete Preflight Test Run (with 20% retry buffer):** **$7.27**
- **Complete Master Commercial Production Run (with 1 retry reserve):** **$34.32**
