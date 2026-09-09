---
name: "Momentum 360 Spatial Cinema"
description: "Scroll-directed architectural film carried by heavyweight geometric type, midnight framing, and scarce signal color."
colors:
  midnight-ink: "#040712"
  raised-ink: "#081126"
  momentum-navy: "#0b1c3f"
  momentum-blue: "#2f74ff"
  electric-cyan: "#8ff3ff"
  strong-cyan: "#47dff1"
  signal-yellow: "#ffd348"
  luminous-white: "#f7f9ff"
  misted-blue: "#b6c2d7"
  hairline: "rgb(247 249 255 / 20%)"
typography:
  display:
    fontFamily: "Unbounded Momentum, Archivo Momentum, sans-serif"
    fontSize: "clamp(3.2rem, 7.2vw, 6rem)"
    fontWeight: 900
    lineHeight: 0.86
    letterSpacing: "-0.04em"
    fontVariation: "wght 900"
  headline:
    fontFamily: "Unbounded Momentum, Archivo Momentum, sans-serif"
    fontSize: "clamp(2.2rem, 4.3vw, 5rem)"
    fontWeight: 900
    lineHeight: 0.92
    letterSpacing: "-0.04em"
    fontVariation: "wght 900"
  title:
    fontFamily: "Unbounded Momentum, Archivo Momentum, sans-serif"
    fontSize: "clamp(2rem, 3.2vw, 4rem)"
    fontWeight: 900
    lineHeight: 0.94
    letterSpacing: "-0.04em"
    fontVariation: "wght 900"
  body:
    fontFamily: "Manrope Momentum, Archivo Momentum, sans-serif"
    fontSize: "clamp(0.92rem, 1.1vw, 1.08rem)"
    fontWeight: 400
    lineHeight: 1.62
  label:
    fontFamily: "Manrope Momentum, Archivo Momentum, sans-serif"
    fontSize: "0.67rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "0.08em"
rounded:
  square: "0"
  circle: "50%"
spacing:
  page-gutter: "clamp(20px, 4vw, 68px)"
  page-gutter-compact: "18px"
  section-block: "clamp(100px, 14vw, 190px)"
  cluster: "16px"
components:
  button-primary:
    backgroundColor: "{colors.signal-yellow}"
    textColor: "{colors.midnight-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "0 24px"
    height: "58px"
  button-header:
    backgroundColor: "{colors.signal-yellow}"
    textColor: "{colors.midnight-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "0 18px"
    height: "48px"
  button-text:
    backgroundColor: "transparent"
    textColor: "{colors.luminous-white}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "0 18px"
    height: "58px"
  journey-marker:
    backgroundColor: "{colors.midnight-ink}"
    rounded: "{rounded.circle}"
    size: "9px"
  journey-marker-active:
    backgroundColor: "{colors.signal-yellow}"
    rounded: "{rounded.circle}"
    size: "9px"
  founder-signature:
    backgroundColor: "{colors.signal-yellow}"
    textColor: "{colors.midnight-ink}"
    typography: "{typography.title}"
    rounded: "{rounded.square}"
    padding: "18px"
---

# Design System: Momentum 360 Spatial Cinema

## Overview

**Creative North Star: "Directed Spatial Signal"**

Momentum 360's shipped world behaves like a film-control surface wrapped around architectural media. The opening uses a full-bleed property film and restrained instrumentation; the continuation expands into large blue fields, dense service panels, a structured process, and founder portraits without abandoning the same midnight frame.

The voice is emphatic rather than editorial-delicate. Unbounded turns every major statement into a physical object, while Manrope keeps description, navigation, labels, and actions precise. Blue and cyan establish the spatial atmosphere, signal yellow identifies decisions, and thick borders give the lower-page modules enough weight to stand beside the moving film.

**Key Characteristics:**

- Full-viewport property film controlled by scroll position.
- Heavy Unbounded display statements with tight leading and stacked shadow.
- Manrope support copy and compact uppercase interface labels.
- Midnight framing, saturated Momentum blue, electric cyan, and scarce signal yellow.
- Square controls and bordered content modules, with circles reserved for motion and progress.
- A dark founder section that keeps portraits inside the same cinematic brand world.

## Colors

The palette uses cool architectural depth as the ground, then reserves yellow as the single warm command signal.

### Primary

- **Signal Yellow** (`{colors.signal-yellow}`): Primary actions, focus rings, scene indices, process numbers, loader progress, and the active journey state.

### Secondary

- **Momentum Blue** (`{colors.momentum-blue}`): Brand-led fields, capability accents, gradients, and large atmospheric transitions.
- **Electric Cyan** (`{colors.electric-cyan}`): Emphasized words, fine lines, active status, and cool interactive feedback.
- **Strong Cyan** (`{colors.strong-cyan}`): The higher-energy cyan used for the second founder card's structural accent and selected luminous detail.

### Neutral

- **Midnight Ink** (`{colors.midnight-ink}`): Page ground, film framing, and dark text on yellow actions.
- **Raised Ink** (`{colors.raised-ink}`): Slightly lifted dark surfaces and the cool layer inside glass gradients.
- **Momentum Navy** (`{colors.momentum-navy}`): Intermediate dark-blue depth between the page ground and saturated blue sections.
- **Luminous White** (`{colors.luminous-white}`): Display type, navigation, and high-priority interface text.
- **Misted Blue** (`{colors.misted-blue}`): Supporting paragraphs and low-priority informational copy.
- **Hairline White** (`{colors.hairline}`): Low-contrast dividers, card boundaries, and frame edges.

### Named Rules

**The Scarce Signal Rule.** Yellow marks an action, focus target, sequence number, or active state. Its scarcity gives it authority.

**The Cool Field Rule.** Large atmospheric surfaces stay inside the midnight-to-blue range; cyan remains an illuminated edge or phrase, not a competing page ground.

## Typography

**Display Font:** Unbounded Momentum (with Archivo Momentum and sans-serif fallbacks)  
**Body Font:** Manrope Momentum (with Archivo Momentum and sans-serif fallbacks)

**Character:** Unbounded is wide, engineered, and unapologetically heavy. Its compact line-height makes stacked headlines feel like a built mass. Manrope supplies the quieter counterweight: readable body copy, small operational labels, and dense conversion controls.

### Hierarchy

- **Display** (`{typography.display}`): Full-viewport scene statements and major section propositions, with balanced wrapping, tight leading, and a multi-layer dark shadow over film.
- **Headline** (`{typography.headline}`): Capability names and large secondary statements.
- **Title** (`{typography.title}`): Founder names and major card-level titles.
- **Body** (`{typography.body}`): Scene support copy, founder biographies, and explanatory text; measures generally stay between 48ch and 62ch.
- **Label** (`{typography.label}`): Navigation, calls to action, scene metadata, role lines, status text, and sequence markers.

### Named Rules

**The Geometric Voice Rule.** Every dominant statement uses Unbounded at the heaviest shipped weight; Manrope carries everything explanatory or operational.

**The Tight Stack Rule.** Display lines sit between 0.84 and 0.94 line-height with negative tracking. Do not loosen them into conventional marketing headings.

**The Quiet Support Rule.** Body copy stays smaller, cooler, and narrower than the display statement so the architecture and headline retain priority.

## Layout

The opening is a 600svh scroll reel: a 100svh sticky video stage sits beneath six viewport-deep story beats. Scene copy anchors to the lower-left inside the responsive page gutter, while a fixed six-step journey rail occupies the right edge. The header floats above the film as a three-column glass instrument on desktop.

After the reel, sections alternate between expressive wide compositions and more structured systems. The manifesto uses a 1.45/0.55 split, capabilities use a sticky heading beside a 0.78/1.22 service grid, process uses four equal columns, and founders use two equal profile cards. The recurring section block rhythm is `clamp(100px, 14vw, 190px)` with `clamp(20px, 4vw, 68px)` side gutters.

At 980px, split layouts and founders collapse to one column while process becomes two columns. At 800px, the journey rail contracts to unlabeled dots and film copy gains right clearance. At 580px, the gutter resolves to 18px, display text scales by viewport width, actions stack, process becomes one column, and each founder card stacks image above biography.

**The One Viewport, One Beat Rule.** Each film chapter receives one dominant visual moment and one focused statement before the next scene takes over.

**The Dense Continuation Rule.** Once the film ends, information density can rise, but every section must retain the same display voice, cool palette, and decisive geometry.

## Elevation & Depth

Depth is a hybrid of filmic scrims, ambient shadow, tonal gradients, and controlled glass. The video is darkened with directional and radial washes so text can sit directly on the image. Lower-page panels use thicker two-pixel borders and deep shadows instead of soft floating-card decoration.

### Shadow Vocabulary

- **Glass Header** (`0 24px 70px rgb(0 0 0 / 34%)`): Separates fixed navigation from moving film.
- **Action Rest** (`0 14px 34px rgb(0 0 0 / 26%)`): Grounds solid yellow controls.
- **Action Hover** (`0 20px 46px rgb(0 0 0 / 34%)`): Supports the three-pixel interaction lift.
- **Display Stack** (`0 3px 0 rgb(2 7 21 / 72%), 0 12px 0 rgb(2 7 21 / 28%), 0 28px 60px rgb(0 0 0 / 72%)`): Makes heavyweight display type read as dimensional over film.
- **Body Legibility** (`0 8px 28px rgb(0 0 0 / 88%)`): Protects small scene copy over detailed imagery.
- **Capability Depth** (`0 22px 60px rgb(0 0 0 / 20%)`): Gives thick service panels structural separation.
- **Founder Depth** (`0 34px 90px rgb(0 0 0 / 34%)`): Anchors portrait cards inside the darker leadership field.

### Named Rules

**The Image-Anchored Depth Rule.** Scrims and text shadow clarify moving media; panel shadows distinguish substantial content modules. Neither is used as arbitrary ornament.

**The Thick-Panel Rule.** Capabilities and founder profiles use two-pixel boundaries and deep tonal fills so they read as authored blocks, not translucent placeholders.

## Shapes

The system is square by default. Headers, actions, capability panels, founder cards, process cells, and signature panels use hard corners. Circular geometry is reserved for orbiting loader rings, small status indicators, journey markers, and the large halo fields behind manifesto and release sections.

**The Instrument Geometry Rule.** Use hard-edged rectangles for decisions and content; use circles only to communicate position, status, orbit, or spatial field.

## Components

### Buttons

- **Shape:** Hard square corners with centered inline content and a CSS-drawn diagonal arrow.
- **Primary:** Signal-yellow field, midnight text, 58px minimum height, and 24px horizontal padding.
- **Header:** Signal-yellow field, 48px minimum height, and 18px horizontal padding; it compresses to 40px with 10px padding on narrow screens.
- **Hover / Focus:** Hover brightens to pale yellow, lifts 3px, and deepens the shadow over 180ms. Keyboard focus uses a 3px yellow outline with 4px offset.
- **Text:** Transparent fill with a cyan-tinted underline and the same 58px minimum height; hover changes the text to cyan and lifts 2px.

### Capability Panels

Each capability is a thick, square-edged link with a sequence number, an oversized Unbounded title, concise Manrope copy, and a CSS-drawn arrow. Panels use a dark-blue gradient, two-pixel translucent white border, and at least 220px height. Hover increases horizontal padding, cools the field toward blue and cyan, and moves the arrow diagonally.

### Founder Profiles

Founder cards split portrait and biography at a 0.8/1.2 ratio on desktop, then stack below 580px. The image fills its half and gains a subtle 1.035 scale on hover. A two-pixel frame and seven-pixel bottom stripe provide the strongest structural accents in the system; the first is blue and the second strong cyan.

### Navigation

The fixed header is a square dark-glass bar with the exact Momentum 360 mark, a centered live-status readout, a restrained capability link, and one solid yellow action. Backdrop blur is 22px and the bar enters with a short downward-to-rest reveal after the film gate.

### Journey Progress

Six 9px circular markers sit on a one-pixel vertical rail. The active marker fills yellow, glows, and scales to 1.35. Desktop exposes scene number and name; smaller viewports reduce the control to visual dots while retaining accessible labels.

### Chapter Overlay

Inactive film copy sits at 18% opacity, 3px blur, and a 34px downward offset. The current chapter resolves to full opacity, zero blur, and zero offset through 480-520ms transitions. Each statement keeps one cyan emphasized phrase and one short supporting paragraph.

### Branded Film Gate

The loader places the exact Momentum mark over three independently rotating circular orbits, a blue-cyan flare, and a thin blue-to-cyan-to-yellow progress track. Its final state collapses through a circular clip and rotates the mark inward; reduced motion shortens all animation to a single near-instant iteration.

## Do's and Don'ts

### Do:

- **Do** use Unbounded Momentum at weight 900 for dominant statements and card titles.
- **Do** use Manrope Momentum for body copy, labels, navigation, and actions.
- **Do** keep film and portraits full-bleed inside their assigned frames, with directional washes or tonal panels protecting nearby copy.
- **Do** reserve signal yellow for decisions, focus, numbering, active state, and the founder signature panel.
- **Do** keep service and founder modules thick, square, and visibly bordered.
- **Do** preserve the reduced-motion path and CSS-drawn interface arrows.

### Don't:

- **Don't** reintroduce the earlier Cormorant serif voice; the shipped identity is geometric Unbounded with Manrope support.
- **Don't** round buttons, navigation, capability panels, or founder cards.
- **Don't** spread yellow across large atmospheric sections or supporting paragraphs.
- **Don't** place small text over busy film without the established wash and legibility shadow.
- **Don't** replace the exact logo with a text approximation or add pictographic glyphs where the system uses drawn geometry.
- **Don't** detach the founder section into a white biography module; it belongs to the same dark cinematic field.
