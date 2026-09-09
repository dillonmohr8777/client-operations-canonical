---
name: "Need Momentum Homepage Concepts"
description: "A connected signal atlas expressed as an orbital growth map and a kinetic signal field."
colors:
  midnight-ink: "#020711"
  deep-navy: "#071632"
  momentum-blue: "#2f82ff"
  electric-blue: "#4ca6ff"
  signal-yellow: "#ffc72c"
  horizon-cyan: "#7be7ff"
  paper-white: "#f7faff"
  muted-blue-gray: "#a7b7cf"
  cloud-surface: "#f2f6fb"
  mist-surface: "#e9f0f8"
typography:
  display:
    fontFamily: "Archivo Variable, sans-serif"
    fontSize: "clamp(3.3rem, 7.3vw, 6rem)"
    fontWeight: 700
    lineHeight: 0.94
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Archivo Variable, sans-serif"
    fontSize: "clamp(2.45rem, 5.4vw, 5.4rem)"
    fontWeight: 700
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Archivo Variable, sans-serif"
    fontSize: "clamp(1.35rem, 2.1vw, 2rem)"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Manrope Variable, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.62
    letterSpacing: "normal"
  control:
    fontFamily: "Manrope Variable, sans-serif"
    fontSize: "0.88rem"
    fontWeight: 820
    lineHeight: 1
    letterSpacing: "normal"
  label:
    fontFamily: "Manrope Variable, sans-serif"
    fontSize: "0.7rem"
    fontWeight: 780
    lineHeight: 1.2
    letterSpacing: "0.14em"
  map-phrase:
    fontFamily: "Instrument Serif, serif"
    fontSize: "1em"
    fontWeight: 400
    lineHeight: 0.94
    letterSpacing: "-0.025em"
rounded:
  square: "0px"
  image-mask: "14px"
  circle: "50%"
spacing:
  micro: "4px"
  xs: "8px"
  sm: "10px"
  md: "12px"
  lg: "18px"
  xl: "22px"
  2xl: "28px"
  3xl: "34px"
  cluster: "70px"
  section: "150px"
components:
  button-yellow:
    backgroundColor: "{colors.signal-yellow}"
    textColor: "{colors.midnight-ink}"
    typography: "{typography.control}"
    rounded: "{rounded.square}"
    padding: "0 21px"
  button-yellow-hover:
    backgroundColor: "#ffd34f"
    textColor: "{colors.midnight-ink}"
    typography: "{typography.control}"
    rounded: "{rounded.square}"
    padding: "0 21px"
  button-blue:
    backgroundColor: "{colors.momentum-blue}"
    textColor: "{colors.paper-white}"
    typography: "{typography.control}"
    rounded: "{rounded.square}"
    padding: "0 21px"
  button-dark:
    backgroundColor: "{colors.midnight-ink}"
    textColor: "{colors.paper-white}"
    typography: "{typography.control}"
    rounded: "{rounded.square}"
    padding: "0 22px"
  text-link:
    backgroundColor: "transparent"
    textColor: "{colors.paper-white}"
    typography: "{typography.control}"
    rounded: "{rounded.square}"
    padding: "14px 2px"
  header-map:
    backgroundColor: "rgba(2, 7, 17, 0.58)"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.square}"
    padding: "10px 12px 10px 16px"
  header-signal:
    backgroundColor: "rgba(2, 7, 17, 0.42)"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.square}"
    padding: "10px 12px 10px 16px"
  service-card-map:
    backgroundColor: "{colors.deep-navy}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.square}"
    padding: "30px"
  service-card-signal:
    backgroundColor: "#0a1e42"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.square}"
    padding: "34px"
  service-card-signal-active:
    backgroundColor: "#0d2858"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.square}"
    padding: "34px"
  founder-caption:
    backgroundColor: "rgba(7, 22, 50, 0.72)"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.square}"
    padding: "19px 20px"
---

# Design System: Need Momentum Homepage Concepts

## Overview

**Creative North Star: "The Connected Signal Atlas."**

Need Momentum is a live instrument for seeing how search, media, place, and action connect. The system combines cartographic precision with visible energy: midnight fields create concentration, blue and cyan establish direction, and signal yellow marks the decisive next move.

Its two expressions must stay distinct inside that shared world. **Orbital Growth Map** is spatial, measured, and celestial, using Earth, orbits, plotted routes, and glass instruments. **Kinetic Signal Field** is immediate, electrical, and cinematic, using particle currents, swipe chapters, image transitions, and energy condensation. Both feel ambitious and technical without becoming dashboards or generic sci-fi decoration.

**Key Characteristics:**

- High-contrast signal colors moving across midnight and clean light fields.
- Square, instrument-grade interfaces balanced by true circular orbital devices.
- Exact transparent brand artwork and real, source-verified company imagery.
- Motion that explains connection, direction, assembly, or transition.
- Dense spectacle at hero scale with restrained, readable content surfaces below.

## Colors

The palette behaves like a night-navigation system: dark fields hold focus, blue and cyan carry information, yellow commits attention, and cool whites reset the page for explanation.

### Primary

- **Momentum Blue** (`colors.momentum-blue`): Drives mapped routes, active service states, links, icons, and the agency's core signal.
- **Signal Yellow** (`colors.signal-yellow`): Marks primary audit actions, active points, captions, selection, and the strongest conversion moments.

### Secondary

- **Electric Blue** (`colors.electric-blue`): Adds luminous range to gradients, WebGL light, and energized depth.
- **Horizon Cyan** (`colors.horizon-cyan`): Defines focus detail, instrument lines, reticles, and high-contrast technical accents.

### Neutral

- **Midnight Ink** (`colors.midnight-ink`): Anchors heroes, proof stages, footers, and dark action buttons.
- **Deep Navy** (`colors.deep-navy`): Supports cards, captions, map fields, and secondary dark surfaces.
- **Paper White** (`colors.paper-white`): Carries primary text on dark fields and the clearest explanatory backgrounds.
- **Muted Blue-Gray** (`colors.muted-blue-gray`): Carries subdued metadata, footer copy, and secondary labels.
- **Cloud Surface** (`colors.cloud-surface`): Separates light editorial sections without warming the palette.
- **Mist Surface** (`colors.mist-surface`): Creates a slightly denser cool layer behind recognition and spatial-media content.

### Named Rules

**The Signal Hierarchy Rule.** Yellow is reserved for primary action, live status, and decisive emphasis; blue carries the system; cyan annotates it.

**The Dark Field Rule.** Use midnight for immersive scenes and proof, then move to cool light surfaces when comprehension should outrank spectacle.

## Typography

**Map Display Font:** Archivo Variable (with sans-serif fallback)  
**Signal Display Font:** Unbounded Variable (with sans-serif fallback)  
**Body Font:** Manrope Variable (with sans-serif fallback)  
**Narrow Exception:** Instrument Serif Italic (with serif fallback) only for the Map phrase

**Character:** Archivo gives the Map compressed cartographic confidence. Unbounded gives Signal its thick, dimensional, particle-compatible voice. Manrope keeps long-form reading clear and contemporary. The single serif phrase acts as inherited cartographic poetry, not a second editorial voice.

### Hierarchy

- **Display** (`typography.display`): Hero statements only; short, tightly balanced, and allowed to dominate the viewport.
- **Headline** (`typography.headline`): Major section turns and manifesto statements.
- **Title** (`typography.title`): Service routes, principles, and compact narrative blocks.
- **Body** (`typography.body`): Explanatory copy, generally constrained to roughly 40–68 characters per line.
- **Control** (`typography.control`): Confident action labels and underlined directional links.
- **Label** (`typography.label`): Uppercase bearings, status, metadata, and instrument annotations.
- **Map Phrase** (`typography.map-phrase`): The words “on the Map.” in the Orbital Growth Map hero and nowhere else.

### Named Rules

**The Serif Quarantine Rule.** Instrument Serif Italic is approved only for the Map phrase “on the Map.”; all other display language remains Archivo on Map and Unbounded on Signal.

**The Compression Rule.** Large Archivo and Unbounded type stay tightly tracked and tightly led, while Manrope body copy retains generous line height for long-scroll readability.

## Layout

The shared desktop frame uses a 1420px maximum for heroes, headers, manifesto lines, and service rails; editorial headings narrow to 1120px; showcase grids use 1260–1320px. Standard page gutters are 22px per side, and major section breathing room clusters around the 140–170px range.

Orbital Growth Map composes copy against a right-weighted Earth and glass targeting instrument, then shifts into plotted diagrams, a 12-column atlas, staggered spatial-media frames, and a three-column founder stage. Kinetic Signal Field keeps the hero copy left while the GPU particle current occupies the right, auto-advances the draggable service rail every 4.2 seconds, uses a sticky proof sequence, resolves additional particle identities in the Momentum 360 and footer stages, and gives the founders a full-bleed cinematic chapter followed by a compact profile deck.

At 1080px, two-column spatial features stack and the founder stage becomes two columns. At 800px, navigation becomes a disclosed menu, service grids and decision paths become single-column, hero actions stack, swipeable imagery replaces automatic drift, and heavy compositions simplify without dropping content. The 430px adjustment tightens brand, cards, captions, and imagery; the layout remains usable from 320px.

## Elevation & Depth

Depth is a hybrid of tonal layering, selective shadows, luminous gradients, and real motion. Flat editorial sections and square cards establish structure; shadows appear on active controls, photographic frames, glass instruments, and floating captions. Glass is never an empty decorative card: it must sit over imagery, WebGL, moving light, or a real visual transition.

### Shadow Vocabulary

- **Header Atmosphere:** A broad low-opacity black shadow separates the Map header from its moving hero.
- **Signal Lift:** Yellow and blue actions gain colored ambient shadows as they lift on hover.
- **Instrument Depth:** Circular lenses pair an outer black shadow with a restrained blue inset glow.
- **Media Stack:** Proof and gallery frames use offset dark shadows to read as physical layers.
- **Founder Float:** Founder captions use a compact black shadow while remaining visually attached to the portrait.

### Named Rules

**The Earned Glass Rule.** Blur and translucency are permitted only when the surface overlays imagery, WebGL, moving light, or an active visual instrument.

**The Flat Foundation Rule.** Content structure comes from color fields, spacing, and borders; shadow is an event or a physical-layer cue, not default decoration.

## Shapes

The default form language is square and engineered. Buttons, headers, navigation panels, service cards, captions, and decision panels use hard corners. A 14px image mask is reserved for the disappearing proof sequence. Perfect circles belong to orbital lenses, status points, play controls, and diagram bodies where the geometry has literal meaning.

**The Circle Has a Job Rule.** Use a circle only for orbit, location, playback, status, or signal behavior; never round a rectangular control merely to make it friendlier.

## Components

Components feel direct, instrument-grade, and responsive to motion without softening the visual language.

### Buttons

- **Shape:** Square-edged, with a 56px minimum control height for the shared hero button and a 60px minimum for the final dark audit action.
- **Primary:** Signal Yellow on Midnight Ink with 21px horizontal padding, a compact heavy label, and an arrow icon.
- **Secondary:** Momentum Blue on Paper White, using the same square geometry and weight.
- **Dark:** Midnight Ink on Paper White for the final yellow conversion portal.
- **Hover / Focus:** Lift 3–5px with a stronger ambient shadow; preserve the global 3px Signal Yellow focus outline with 4px offset.
- **Text Link:** Transparent, underlined with a low-contrast white rule, and paired with a directional arrow.

### Cards / Containers

- **Orbital Route Card:** Deep Navy, 30px internal padding, thin cool-white dividers, a cyan bearing, a yellow category label, and a 7px hover lift.
- **Kinetic Signal Card:** Inactive cards use the quieter blue field at reduced opacity and slight scale; the active card uses the stronger blue field at full opacity and full scale.
- **Founder Caption:** Dark translucent navy over a real portrait, cyan border, attached shadow, name in Archivo, identity detail in Manrope, and a yellow live-signal point.

### Navigation

- **Map Header:** Dark glass with a complete cyan border and ambient shadow.
- **Signal Header:** Deep liquid glass with a restrained blue outline, dimensional shadow, and compact conversion action.
- **Desktop Links:** Centered Manrope links reveal a yellow underline from left to right.
- **Mobile Menu:** A 46px square disclosure control opens a full-width dark glass panel below the header.
- **Logo:** Use the exact transparent `/assets/brand/need-momentum-logo.png` artwork in navigation. In the Signal hero, sample that artwork only as particle target geometry: never layer the flat logo in front of the particles. Use `/assets/brand/momentum-360-logo.png` only for the spatial-media particle formation.

### Founder Identity Module

The identity mapping is immutable: Mac Frederick is blond and appears on the left; Sean Boyle is dark-haired and appears on the right. Signal opens the founder chapter with the supplied 1200 × 628 film at full bleed. A single sampled particle veil assembles and disperses into the film; position-locked identity plates map each founder to the correct person and clear for the Need Momentum end card. Smaller solo portraits and two sourced biography paragraphs remain directly beneath the film. The combined award photograph is not part of the Signal founder section. Map may retain its existing team photograph, but portrait order, captions, and alt text must always preserve Mac blond/left and Sean dark-haired/right.

### Signature Motion Systems

- **Orbital Growth Map:** Slow Earth rotation, orbit drawing, map-line movement, glass refraction, and measured global-to-local transitions.
- **Kinetic Signal Field:** A 10-second particle cycle stays free, begins resolving near 4.7 seconds, forms only the circular M near 5.9 seconds, holds, disperses, and loops. The headline pulses continuously in dimensional space. A persistent particle spine connects the full page; the service rail auto-swipes every 4.2 seconds while preserving drag, scroll-snap, arrows, and keyboard control.
- **Founder Film:** The full-bleed film begins only when its own stage enters view. A 1.58-second sampled particle-to-picture reveal runs once, the film pauses offscreen or when the page is hidden, and a visible play/pause control gives the visitor authority over the loop.
- **Momentum 360 Formation:** Sample the official yellow, white, and blue Momentum 360 lockup into its own particle target inside the spatial-media chamber. No Need Momentum wordmark may substitute for it.
- **Particle Footer:** The Need Momentum wordmark condenses from particles inside three integrated atomic orbit paths. Do not add a detached circular badge or flat wordmark overlay.
- **Reduced Motion:** Resolve particle logos into stable particle-built marks, freeze orbital travel, show the founder poster without autoplay or the particle veil, and preserve navigation, focus, and control feedback.

## Do's and Don'ts

### Do:

- **Do** preserve Orbital Growth Map and Kinetic Signal Field as visibly distinct expressions of the same connected system.
- **Do** use the exact transparent Need Momentum logo without a backing plate, recolor, crop, or reconstruction.
- **Do** keep the hero M particle-built only, with no foreground logo image or decorative glass bubbles.
- **Do** use the official Momentum 360 lockup as the particle source for the spatial-media chamber.
- **Do** preserve Mac blond/left and Sean dark-haired/right in every image, caption, order, and alt description.
- **Do** use the supplied founder film at full bleed, preserve position-locked identities, and keep smaller solo founder profiles with two readable sourced paragraphs beneath it.
- **Do** use real, source-verified founder and company imagery at documentary scale.
- **Do** let motion explain connection, direction, sequence, or transformation, then provide a stable reduced-motion state.
- **Do** keep essential copy, navigation, and calls to action outside canvas rendering.

### Don't:

- **Don't** merge the Orbital Growth Map into the Kinetic Signal Field or flatten both concepts into one generic tech aesthetic.
- **Don't** use Instrument Serif outside the single Map phrase “on the Map.”
- **Don't** place glass on an empty decorative card or use blur without active visual material behind it.
- **Don't** place a flat logo over a particle-built logo or attach a separate floating logo badge to the footer.
- **Don't** round rectangular controls or cards unless a documented image mask requires it.
- **Don't** synthesize founder identity, swap founder positions, or reverse the blond and dark-haired mapping.
- **Don't** use the combined founder award photograph in the Signal founder section or loop biography text after it resolves.
- **Don't** invent customer logos, metrics, testimonials, pricing, or conversion results.
