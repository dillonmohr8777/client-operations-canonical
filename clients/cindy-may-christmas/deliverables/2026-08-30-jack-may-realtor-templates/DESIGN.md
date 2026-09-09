---
name: May Team Realtors Cinematic Homepage
description: A broker-led Louisville real-estate experience built as rain-dark property cinema with May red, warm stone, and a particle-dissolve identity reveal.
colors:
  may-black: "#0b0709"
  raised-black: "#171012"
  wine-surface: "#261316"
  may-red: "#b61636"
  action-red: "#c71f3f"
  action-red-hover: "#d22b4a"
  deep-red: "#8d112b"
  cream: "#faf6ef"
  action-cream: "#fff9f4"
  pale-stone: "#f1d9c6"
  warm-stone: "#e8c89d"
  muted-stone: "#c7b9b5"
  translucent-line: "rgb(250 246 239 / 21%)"
typography:
  display:
    fontFamily: '"Unbounded Momentum", "Archivo Momentum", sans-serif'
    fontSize: "clamp(3.2rem, 7.2vw, 6rem)"
    fontWeight: 900
    lineHeight: 0.86
    letterSpacing: "-0.04em"
  headline:
    fontFamily: '"Unbounded Momentum", "Archivo Momentum", sans-serif'
    fontSize: "clamp(2.2rem, 4.3vw, 5rem)"
    fontWeight: 900
    lineHeight: 0.92
    letterSpacing: "-0.04em"
  title:
    fontFamily: '"Unbounded Momentum", "Archivo Momentum", sans-serif'
    fontSize: "clamp(1rem, 1.5vw, 1.35rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "normal"
  body:
    fontFamily: '"Manrope Momentum", "Archivo Momentum", sans-serif'
    fontSize: "clamp(0.92rem, 1.1vw, 1.08rem)"
    fontWeight: 400
    lineHeight: 1.62
    letterSpacing: "normal"
  label:
    fontFamily: '"Manrope Momentum", "Archivo Momentum", sans-serif'
    fontSize: "0.75rem"
    fontWeight: 850
    lineHeight: 1.2
    letterSpacing: "0.14em"
  mobile-display:
    fontFamily: '"Unbounded Momentum", "Archivo Momentum", sans-serif'
    fontSize: "clamp(2.5rem, 11vw, 3.2rem)"
    fontWeight: 900
    lineHeight: 0.96
    letterSpacing: "-0.04em"
rounded:
  square: "0"
  circle: "999px"
spacing:
  compact: "8px"
  control: "0 18px"
  card: "38px 34px"
  gutter: "clamp(20px, 4vw, 68px)"
  section: "clamp(100px, 14vw, 190px)"
components:
  button-primary:
    backgroundColor: "{colors.may-red}"
    textColor: "{colors.action-cream}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "{spacing.control}"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.action-red-hover}"
    textColor: "{colors.action-cream}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "{spacing.control}"
    height: "48px"
  button-text:
    backgroundColor: "transparent"
    textColor: "{colors.cream}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "{spacing.control}"
    height: "58px"
  service-card:
    backgroundColor: "{colors.wine-surface}"
    textColor: "{colors.cream}"
    rounded: "{rounded.square}"
    padding: "{spacing.card}"
  logo-mark:
    backgroundColor: "transparent"
    textColor: "{colors.cream}"
    width: "172px"
---

# Design System: May Team Realtors Cinematic Homepage

## Overview

**Creative North Star: "The Broker's Property Film"**

The system behaves like a rain-dark real-estate film directed by the visitor. Large, compressed Unbounded statements sit over a full-viewport concept-property sequence while May Team red, warm stone, and near-black layers keep the experience tied to the brokerage rather than to a generic luxury aesthetic.

The material language is deliberately weighty: thick square service blocks, dark translucent navigation, substantial controls, and a framed founder portrait. The transparent May Team source artwork is rendered as a warm-light mark directly against the dark stage, without a containing card or visible image background. In the opening gate, an asymmetric field of 44 independent particles condenses around the fixed mark, then scatters and blurs into the first property-film frame.

**Key Characteristics:**

- Background-free logo reveal with a broken 44-particle halo and film cross-dissolve.
- Six-chapter scroll-directed property journey.
- Near-black and wine surfaces with rare, decisive May red actions.
- Oversized Unbounded display type paired with clear Manrope body copy.
- Square, thick containers with ambient depth and restrained warm-stone linework.
- A human founder section that makes Jack May the accountable next step.

## Colors

The palette is a dark red-and-stone system: May red supplies action and state, warm stone protects identity and legibility, and near-black surfaces let the moving property film carry the atmosphere.

### Primary

- **May Red:** The binding action color for primary buttons, loader energy, active journey markers, and selected states.
- **Action Red:** A deeper crimson used for small status signals and the active scroll cue.

### Secondary

- **Pale Stone:** The light emphasis color for italic display phrases, live status, and restrained luminous detail.
- **Warm Stone:** The softer gold-beige used for indices, focus rings, contact hover, and portrait framing.

### Neutral

- **May Black:** The principal page ground and deepest cinematic surface.
- **Raised Black:** The first lifted dark surface beneath cards and overlays.
- **Wine Surface:** The red-black bridge used inside navigation, service blocks, and section transitions.
- **Cream:** The primary high-contrast text color.
- **Muted Stone:** The body-copy neutral for supporting text.
- **Translucent Line:** The standard low-contrast divider and border color on dark surfaces.

### Named Rules

**The Red Is an Action Rule.** Use May red for decisions, progress, and active state; broad reading surfaces remain black, wine, cream, or warm stone.

**The Background-Free Identity Rule.** Use the transparent May Team artwork as a warm-light mark directly on the dark film world. Never redraw, pixelate, place it on a card, or reintroduce a white image rectangle.

## Typography

**The Mobile Reading Rule.** Functional actions and film labels have a 12px floor. Mobile film headings use the mobile-display role so words remain intact, while desktop display lettering and the approved film sequence stay unchanged. Direct contact links provide 44px targets.

**Display Font:** Unbounded Momentum (with Archivo Momentum and sans-serif fallbacks)  
**Body Font:** Manrope Momentum (with Archivo Momentum and sans-serif fallbacks)

**Character:** Unbounded makes the experience architectural, bold, and deliberately oversized; Manrope keeps service copy and controls direct, legible, and contemporary. The pairing creates a clear hierarchy without requiring decorative type treatments.

### Hierarchy

- **Display** (900, fluid 3.2rem to 6rem, 0.86 line-height): Hero and major section statements. It uses a tight -0.04em track, balanced wrapping, and a layered dark shadow over the film.
- **Headline** (900, fluid 2.2rem to 5rem, 0.92 line-height): Service names and secondary structural headings.
- **Title** (700, fluid 1rem to 1.35rem): Jack May's phone and email links.
- **Body** (400, fluid 0.92rem to 1.08rem, 1.62 line-height): Narrative and explanatory copy, generally held to 48-52 characters per line.
- **Label** (850, 0.66rem, 0.14em letter-spacing): Uppercase film indices, navigation, status, and compact actions.

### Named Rules

**The Monument and Guide Rule.** Unbounded states the destination; Manrope explains the route. Do not substitute a system display face or use Manrope for the major cinematic statements.

**The Weight Before Ornament Rule.** Create impact through size, 700-900 variable weight, compact line-height, and shadowed contrast. Do not use gradient-clipped text, thin decorative scripts, or emoji as emphasis.

## Layout

The global horizontal gutter is fluid from 20px to 68px and becomes 18px below 580px. The opening reel is 600 small-viewport heights: one sticky full-screen stage sits beneath six 100svh chapter beats so vertical movement directs the film timeline. Major continuation sections use a fluid 100px-to-190px vertical rhythm.

Desktop sections use asymmetric grids: the manifesto balances a wide statement against a narrow proof column, services place a sticky heading beside stacked blocks, and the founder section pairs a framed portrait with a wider copy column. At 980px these become single-column layouts; at 580px service cards tighten, calls to action stack, and the journey navigation collapses to a narrow dot rail.

**The One Sequence Rule.** The experience moves from film to services to process to Jack May to action. Preserve that reading order even when the grid collapses.

## Elevation & Depth

Depth is ambient rather than ornamental. The full-viewport film is darkened with directional washes and a vignette; navigation and cards sit above it through translucent wine-black surfaces, low-contrast borders, blur, and broad black shadows. The loader's red bloom, warm-light mark, and scattered point glows add cinematic depth without turning the interface glossy.

### Shadow Vocabulary

- **Navigation Float** (`0 24px 70px rgb(0 0 0 / 34%)`): Keeps the fixed header legible over moving imagery.
- **Action Lift** (`0 16px 36px rgb(0 0 0 / 34%)`): Gives primary controls enough physical weight against dark surfaces.
- **Service Block** (`0 22px 60px rgb(0 0 0 / 20%)`): Separates thick service cards without making them look detached.
- **Founder Frame** (`0 40px 100px rgb(0 0 0 / 46%)`): Reserves the strongest non-loader depth for Jack May's portrait.
- **Identity Glow** (`drop-shadow(0 24px 64px rgb(0 0 0 / 76%))` plus `drop-shadow(0 0 34px rgb(182 22 54 / 28%))`): Separates the background-free mark from the particle field without creating a container.

**The Dark-First Depth Rule.** Use tonal layering, wash, and broad ambient shadow before adding borders. Borders remain low-contrast except for the founder portrait's deliberate warm-stone frame.

## Shapes

The default form is square: buttons, service cards, navigation, and portrait frames do not use corner rounding. Circles are reserved for independent particles, halo fields, active journey dots, and status lights. The loader uses a broken elliptical particle silhouette rather than complete rings. CSS-drawn arrows use straight two-pixel strokes.

**The Broken Halo Rule.** Circular geometry communicates individual energy points, progress, or live state; it is not a generic container style, and complete rings never surround the identity mark.

## Components

### Buttons

- **Shape:** Thick, square controls with no radius and a minimum height of 48px; major final actions increase to 58px.
- **Primary:** May red with action-cream text, compact uppercase Manrope labels, and 18-24px horizontal padding.
- **Hover / Focus:** The red brightens, the control rises 3px, and a broad shadow deepens. Keyboard focus uses a 3px warm-stone outline offset by 4px.
- **Text:** Transparent, cream, and underlined with a pale-stone line; it rises 2px and shifts to pale stone on interaction.

### Cards / Containers

- **Corner Style:** Square.
- **Background:** Wine-black gradients over the May-black ground.
- **Shadow Strategy:** Broad black ambient shadows; no small hard drop shadows.
- **Border:** A thick 2px translucent stone border, with May red used as the service card's directional edge.
- **Internal Padding:** 38px by 34px on desktop and 28px by 18px on small screens.

### Navigation

The fixed navigation is a square dark translucent bar with blur, the warm-light background-free mark at left, a compact broker-led status at center, and one red search action at right. The header mark is 172px wide on desktop and 132px on small screens. Below 980px the status disappears; below 800px the secondary text link disappears so logo and action remain dominant.

### Film Loader

A deterministic set of 44 red and cream particles forms a broken asymmetric ellipse around a fixed warm-light May Team mark. Particles breathe independently while a red bloom and slow ambient field hold the stage. At release, the particles scatter outward, the mark softens, and the entire gate cross-dissolves through blur into the property film. The progress track moves from red through pale stone to warm red. Reduced-motion mode suppresses the particle motion and makes the transition immediate.

**The Particle Dissolve Rule.** Keep the identity mark still while the 44-particle halo breathes, scatters, and blur-cross-dissolves into film. Never rotate the mark, use solid orbit rings, shrink the field into a circular collapse, or place the logo on a card.

### Scroll-Directed Film

A sticky full-screen video stage is controlled by six chapter beats. Current copy resolves from soft blur and low opacity to full clarity; the right-side journey rail mirrors the active chapter. Reduced-motion mode freezes the film at its opening frame and retains readable chapter content.

### May Team Transparent Mark

The transparent source artwork sits directly on the dark stage and receives one consistent warm-light filter. It has no background fill, border, plate shadow, or cropping container. The loader scales it fluidly to a 590px maximum; the fixed header uses a compact 172px desktop width and 132px mobile width.

### Founder Section

Jack May's square portrait is framed by a warm-stone-to-deep-red panel, a broad shadow, and an offset two-pixel warm-stone outline. Contact details use Unbounded title typography and lead directly to a red profile action.

## Do's and Don'ts

### Do:

- **Do** preserve the self-hosted Unbounded and Manrope roles and their strong weight contrast.
- **Do** use the transparent May Team artwork directly on the dark world with the established warm-light treatment and no containing surface.
- **Do** keep the logo fixed while the deterministic 44-particle field provides the loader's motion.
- **Do** use thick square service blocks and substantial controls to maintain the property's architectural weight.
- **Do** keep Jack May visible as a real person near the final decision point.
- **Do** preserve keyboard focus, the static poster fallback, and the reduced-motion freeze state.
- **Do** draw interface arrows and indicators with CSS or SVG geometry.

### Don't:

- **Don't** use emoji or Unicode glyphs as interface icons or decorative website content.
- **Don't** redraw, pixelate, place the May Team logo inside a white box, or add a card behind it.
- **Don't** bring back solid orbit rings, vinyl-like rotation, or a circular collapse in the loader.
- **Don't** use gradient-clipped headline text, rounded generic SaaS cards, or a system display font.
- **Don't** let red become a broad default background when it is needed to identify action and state.
- **Don't** imply that the concept-property film is an active listing.
