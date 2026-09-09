---
name: Onsite Concrete & Landscape
description: A datum-line system that turns coordinated site work into crisp, visible sequence.
colors:
  red: "#e02b20"
  red-deep: "#be2017"
  orange-focus: "#ff4d00"
  black: "#0b0b0c"
  white: "#ffffff"
  paper: "#f3f3f0"
  steel: "#b8babd"
  steel-dark: "#55585d"
typography:
  display:
    fontFamily: "Bungee, sans-serif"
    fontSize: "clamp(4rem, 8vw, 8rem)"
    fontWeight: 400
    lineHeight: 0.83
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Bungee, sans-serif"
    fontSize: "clamp(3.2rem, 6.5vw, 6.2rem)"
    fontWeight: 400
    lineHeight: 0.92
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Encode Sans Condensed, sans-serif"
    fontSize: "clamp(2rem, 3.5vw, 3.6rem)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "normal"
  body:
    fontFamily: "Barlow, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Encode Sans Condensed, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "0.05em"
rounded:
  square: "0"
  circle: "50%"
spacing:
  compact: "0.75rem"
  control-y: "0.8rem"
  control-x: "1.2rem"
  field-gap: "1rem"
  content-gap: "3rem"
  section-y: "clamp(5rem, 9vw, 9rem)"
  section-x-wide: "clamp(20px, 6vw, 100px)"
  section-x-reading: "clamp(20px, 7vw, 120px)"
components:
  button-primary:
    backgroundColor: "{colors.red}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "0.8rem 1.2rem"
    height: "52px"
  button-primary-hover:
    backgroundColor: "{colors.red-deep}"
    textColor: "{colors.white}"
  button-header:
    backgroundColor: "{colors.black}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "0.78rem 1rem"
  service-selector-active:
    backgroundColor: "{colors.black}"
    textColor: "{colors.white}"
    typography: "{typography.display}"
    rounded: "{rounded.square}"
    padding: "1.6rem 2rem"
    height: "130px"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.black}"
    typography: "{typography.body}"
    rounded: "{rounded.square}"
    padding: "0.88rem 0.9rem"
---

# Design System: Onsite Concrete & Landscape

## Overview

**Creative North Star: "The Onsite Datum"**

This system reads like an active site plan moving toward a finished property: a white plan field, black structural blocks, metallic gray rules, and one continuous Onsite red datum. Cropped real-work photography, stamped labels, vertical indexes, and measuring marks make coordination visible without borrowing the interchangeable dark contractor template.

The voice is precise, direct, and physical. Monumental Bungee headlines establish the site, Encode Sans Condensed handles labels and workmanlike instruction, and Barlow keeps explanation readable. The red datum line is the reusable signature connecting service choice, evidence, sequence, location, and consultation.

**Key Characteristics:**
- White and light-gray plan fields cut by black structural stages.
- Onsite red used as a continuous datum, index, caption, and action signal.
- Bungee display statements paired with condensed operational labels.
- Cropped verified work imagery annotated with stamped site markers.
- Square components, metallic rules, and a measurable mobile action path.

## Colors

The palette is architectural and controlled: white and paper provide the drawing surface, black establishes structure, steel defines measurement, and red carries the active line.

### Primary
- **Onsite Datum Red** (`#e02b20`): Primary actions, active indexes, captions, local field, and the continuous site line.
- **Deep Datum Red** (`#be2017`): The primary-action hover state.

### Secondary
- **Focus Orange** (`#ff4d00`): Keyboard focus visibility only.

### Neutral
- **Structural Black** (`#0b0b0c`): Major proof stages, selected service states, header action, and primary text.
- **Plan White** (`#ffffff`): Header, navigation, controls, and clean reading fields.
- **Drawing Paper** (`#f3f3f0`): Hero, service panel, sequence, and form surfaces.
- **Metal Rule** (`#b8babd`): Dividers, borders, and measured structure.
- **Steel Note** (`#55585d`): Supporting copy and form notes.

**The One Datum Rule.** Red should read as one continuous system of action and sequence, not as unrelated decorative accents.

## Typography

**Display Font:** Bungee (with sans-serif fallback)  
**Body Font:** Barlow (with sans-serif fallback)  
**Label Font:** Encode Sans Condensed (with sans-serif fallback)

**Character:** Bungee provides monumental, constructed headline shapes. Encode Sans Condensed brings the vocabulary of stamped job-site labels, while Barlow keeps explanatory text open and practical.

### Hierarchy
- **Display** (400, `clamp(4rem, 8vw, 8rem)`, 0.83): The hero's three-part statement, deliberately offset to meet the datum line.
- **Headline** (400, `clamp(3.2rem, 6.5vw, 6.2rem)`, 0.92): Section-scale claims and the consultation stage.
- **Title** (700, `clamp(2rem, 3.5vw, 3.6rem)`, 1): Service arguments in condensed uppercase.
- **Body** (400, `1rem`, 1.55): Project context, service explanations, and form content; reading blocks stay near 48 to 56 characters.
- **Label** (800, `0.78rem`, `0.05em`, uppercase): Navigation, work tags, service indexes, fields, and quick actions.

**The Three-Voice Rule.** Bungee announces, Encode Sans Condensed directs, and Barlow explains; do not exchange those jobs casually.

## Layout

Desktop composition uses assertive splits and tracks: hero copy against a clipped project window, a binary service selector, indexed service panels, a staggered three-image proof strip, and a three-station site sequence. Section padding uses a tall fluid rhythm (`clamp(5rem, 9vw, 9rem)`) with wide or reading gutters (`clamp(20px, 6vw, 100px)` and `clamp(20px, 7vw, 120px)`).

At 1050px, navigation compresses and service indexes narrow. At 760px, splits stack, the selector becomes vertical, service panels retain the red index rail, the proof strip becomes full-width image fields, the datum sequence turns vertical, and a 66px safe-area-aware sticky bar keeps call and consultation actions visible.

**The Site Sequence Rule.** Responsive layouts may rotate or stack the datum, but they must preserve the order from service fit to project proof to consultation.

## Elevation & Depth

Most hierarchy comes from stark tonal fields, rules, image cropping, and deliberate overlap. Shadows lift only the hero project cutout, active controls, the consultation form, and the mobile action shelf; the oversized Vacaville code uses a restrained red text shadow to separate it from the local field.

### Shadow Vocabulary
- **Project Lift** (`0 24px 55px rgba(0,0,0,.22)`): The clipped hero image window.
- **Control Lift** (`0 12px 28px rgba(0,0,0,.2)`): Hover feedback for primary buttons.
- **Form Lift** (`0 22px 55px rgba(0,0,0,.3)`): The consultation form against Structural Black.
- **Local Code Depth** (`0 18px 34px rgba(102,10,7,.24)`): The oversized location code on the red field.
- **Mobile Shelf** (`0 -10px 30px rgba(0,0,0,.22)`): The sticky mobile action bar.

**The Structural Depth Rule.** Use a shadow only where a surface physically lifts from the plan; rules and color fields establish ordinary hierarchy.

## Shapes

The form language is square and cut (`0` radius): buttons, fields, selectors, image captions, service rails, and stations read as site artifacts. Hero imagery uses a clipped asymmetric perimeter. Circles (`50%`) are reserved for the datum endpoint and the large construction guide in the hero background.

## Components

### Buttons
- **Shape:** Square, compact, and directive (`0` radius; 52px minimum height).
- **Primary:** Onsite Datum Red with white condensed uppercase text and `0.8rem 1.2rem` padding.
- **Hover / Focus:** A 2px lift with Control Lift shadow; keyboard focus uses a 3px Focus Orange outline with 4px offset.
- **Header:** Structural Black on Plan White for the desktop consultation action.

### Service Selector
- **Style:** Two ruled choices with Bungee labels and condensed supporting text; the selected choice reverses to Structural Black on Plan White.
- **State:** A 4px red datum slides beneath the desktop choice and down the mobile edge.

### Cards / Containers
- **Corner Style:** Square surfaces with occasional clipped image perimeters.
- **Background:** Drawing Paper for service and sequence content; Structural Black for proof and consultation.
- **Shadow Strategy:** Flat by default; only explicitly lifted surfaces use the shadow vocabulary.
- **Border:** Metal Rule or Structural Black lines separate lists, facts, and measured controls.
- **Internal Padding:** Fluid content padding from `clamp(2rem, 5vw, 5rem)`.

### Inputs / Fields
- **Style:** Plan White fields, Metal Rule stroke, square corners, and `0.88rem 0.9rem` padding.
- **Focus:** Datum Red border plus a translucent 3px red outline.
- **Error / Disabled:** No custom visual state is established; preserve native semantics until one is implemented.

### Navigation
- **Style:** A white structural header with the verified wordmark, condensed uppercase links, a direct phone path, and a black consultation action. Mobile removes secondary links and hands persistent contact to the sticky bottom bar.

### Datum-Line Sequence

The hero datum, selector indicator, work-floor rule, red service rail, and consultation sequence line behave as one continuous site-reading device. Motion draws the line only when reduced motion is not requested.

## Do's and Don'ts

### Do:
- **Do** use verified work photography with assertive crops and clear project captions.
- **Do** keep red connected to action, indexing, location, and sequence.
- **Do** preserve the vertical service rail and vertical datum sequence on mobile.
- **Do** keep reduced-motion users in the complete final visual state.

### Don't:
- **Don't** replace the site-plan composition with a dark trade template or an equal rounded-card grid.
- **Don't** use Bungee for paragraphs, form content, or small utility text.
- **Don't** soften square controls and construction markers with generalized corner rounding.
- **Don't** use stock imagery or decorative placeholders in place of verified Onsite project work.
