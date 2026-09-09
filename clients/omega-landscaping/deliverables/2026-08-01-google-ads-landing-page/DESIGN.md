---
name: Omega Landscaping & Concrete
description: A Colorado grade-line system that joins rugged site intelligence with direct, local action.
colors:
  night: "#050815"
  blue: "#010080"
  cream: "#f6f2d1"
  paper: "#fffdf0"
  red: "#df3131"
  red-deep: "#c92424"
  ink: "#11121a"
  muted: "#5c5d66"
  cream-line: "rgba(246, 242, 209, .24)"
typography:
  display:
    fontFamily: "Anton, Arial Narrow, sans-serif"
    fontSize: "clamp(4.5rem, 9vw, 8.8rem)"
    fontWeight: 400
    lineHeight: 0.88
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Anton, Arial Narrow, sans-serif"
    fontSize: "clamp(3.4rem, 7vw, 6rem)"
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Public Sans, sans-serif"
    fontSize: "clamp(2rem, 3vw, 3.4rem)"
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Public Sans, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Public Sans, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "0.08em"
rounded:
  square: "0"
  circle: "50%"
spacing:
  compact: "0.75rem"
  control-y: "0.8rem"
  control-x: "1.25rem"
  field-gap: "1rem"
  content-gap: "3rem"
  section-y: "clamp(5rem, 9vw, 9rem)"
  section-x-wide: "clamp(20px, 6vw, 100px)"
  section-x-reading: "clamp(20px, 7vw, 120px)"
components:
  button-primary:
    backgroundColor: "{colors.red}"
    textColor: "#ffffff"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "0.8rem 1.25rem"
    height: "50px"
  button-primary-hover:
    backgroundColor: "{colors.red-deep}"
    textColor: "#ffffff"
  button-secondary:
    backgroundColor: "{colors.blue}"
    textColor: "#ffffff"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "0.8rem 1.25rem"
    height: "50px"
  service-selector-active:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.cream}"
    typography: "{typography.display}"
    rounded: "{rounded.square}"
    padding: "2rem"
    height: "160px"
  input:
    backgroundColor: "#ffffff"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.square}"
    padding: "0.86rem 0.9rem"
---

# Design System: Omega Landscaping & Concrete

## Overview

**Creative North Star: "The Colorado Grade Line"**

This system follows the ground itself: midnight terrain, cream plan paper, royal-blue contour fields, and one red survey mark. It feels capable and site-aware rather than decorative, using open bands, ruled choices, and clipped photographic windows to connect landscape and concrete as one coordinated exterior scope.

Scale and contrast do the heavy work. Condensed display type makes decisive terrain-scale statements, while Public Sans carries practical detail. Verified project photography remains visible and materially grounded; contour lines, survey points, and process runways provide the recurring connective gesture.

**Key Characteristics:**
- Monumental condensed display type against dark terrain fields.
- Cream plan-paper surfaces separated by precise blue or ink rules.
- Royal blue carries structure; red marks decisions and action.
- Clipped real-work imagery crossed by contour and grade-line geometry.
- Square controls, open section bands, and explicit mobile action paths.

## Colors

The palette behaves like a night survey laid over warm construction paper: deep navy supplies atmosphere, royal blue organizes the site, and red remains a concentrated action marker.

### Primary
- **Survey Royal Blue** (`#010080`): Structural fields, selected service states, site diagrams, and coordinated-process stages.
- **Decision Red** (`#df3131`): Primary actions, focus visibility, grade points, and the one emphasized headline beat.
- **Deep Decision Red** (`#c92424`): The primary-action hover state.

### Neutral
- **Terrain Night** (`#050815`): Hero, proof-gallery, and footer fields.
- **Plan Cream** (`#f6f2d1`): Warm high-contrast text, proof bands, and service surfaces.
- **Paper White** (`#fffdf0`): Main reading field and form surface.
- **Site Ink** (`#11121a`): Primary text, rules, and unselected controls.
- **Field Note Gray** (`#5c5d66`): Supporting copy and form notes.
- **Cream Rule** (`rgba(246, 242, 209, .24)`): Fine separators on dark fields.

**The Survey Mark Rule.** Red identifies action or a single point of emphasis; it does not become a broad decorative wash outside the estimate stage.

## Typography

**Display Font:** Anton (with Arial Narrow and sans-serif fallbacks)  
**Body Font:** Public Sans (with sans-serif fallback)

**Character:** Anton brings the compressed force of site signage and plan labels. Public Sans keeps service detail, forms, and local proof plainspoken and easy to scan.

### Hierarchy
- **Display** (400, `clamp(4.5rem, 9vw, 8.8rem)`, 0.88): Hero statements only, set in uppercase and broken into deliberate lines.
- **Headline** (400, `clamp(3.4rem, 7vw, 6rem)`, 0.95): Major section claims and conversion-stage headings.
- **Title** (700, `clamp(2rem, 3vw, 3.4rem)`, 1.04): Service-panel arguments with a compact line length.
- **Body** (400, `1rem`, 1.55): Explanations, service evidence, and form content; key reading blocks stay near 48 to 62 characters.
- **Label** (800, `0.78rem`, `0.08em`, uppercase): Location, contact, captions, and form labels.

**The Terrain Scale Rule.** Anton is reserved for decisive spatial hierarchy; paragraphs and interface detail stay in Public Sans.

## Layout

The desktop system uses wide split fields: copy and terrain imagery in the hero, a two-way service selector, alternating copy-and-image panels, and three-part process tracks. Section padding uses a tall fluid rhythm (`clamp(5rem, 9vw, 9rem)`) with wide or reading gutters (`clamp(20px, 6vw, 100px)` and `clamp(20px, 7vw, 120px)`). Content gaps generally resolve to 3rem.

At 1050px, secondary navigation and proof-collage density reduce. At 760px, splits become a single column, the service selector stacks, project proof becomes two large image fields, the horizontal runway becomes vertical, and a 66px safe-area-aware contact bar keeps call and estimate actions reachable.

**The Follow-the-Grade Rule.** Every layout shift must preserve the visual path from site condition to service choice, real work, process, and estimate action.

## Elevation & Depth

The system is primarily tonal and graphic, with shadows reserved for photographic cutouts, lifted action states, the light form on its red field, and the mobile action bar. Flat ruled surfaces remain flat.

### Shadow Vocabulary
- **Terrain Lift** (`0 22px 64px rgba(0,0,0,.42)`): The clipped hero project window.
- **Control Lift** (`0 10px 24px rgba(3, 5, 15, .24)`): Hover feedback for actionable buttons.
- **Form Lift** (`0 20px 50px rgba(91, 9, 9, .24)`): The estimate form against the red conversion field.
- **Mobile Shelf** (`0 -8px 28px rgba(0,0,0,.2)`): The persistent mobile contact bar.

**The Flat Plan Rule.** Rules and color changes establish most hierarchy; shadows appear only where an object must visibly sit above its field.

## Shapes

Controls, cards, inputs, and section bands use square corners (`0`). Image windows use asymmetric clipped polygons that feel cut from a site plan. Circles (`50%`) are reserved for survey points and process markers, never used as a general card language.

## Components

### Buttons
- **Shape:** Square, compact, and load-bearing (`0` radius; 50px minimum height).
- **Primary:** Decision red with white text and `0.8rem 1.25rem` padding.
- **Hover / Focus:** A 2px lift with Control Lift shadow; keyboard focus uses the visible red 3px outline with 4px offset.
- **Secondary:** Survey Royal Blue with white text for service-specific actions.

### Service Selector
- **Style:** Two ruled, equal-width choices with oversized Anton labels; the selected choice becomes Survey Royal Blue on Plan Cream.
- **Responsive behavior:** The pair stacks at 760px while retaining a clear selected state and full keyboard tab behavior.

### Cards / Containers
- **Corner Style:** Square section bands and asymmetric clipped image windows.
- **Background:** Plan Cream for service evidence; Terrain Night for project proof.
- **Shadow Strategy:** Flat by default; only the hero image window lifts.
- **Border:** Thin ink or translucent blue rules organize facts and lists.
- **Internal Padding:** Fluid content padding from `clamp(2.2rem, 5vw, 5rem)`.

### Inputs / Fields
- **Style:** White fields with a restrained warm-gray stroke, square corners, and `0.86rem 0.9rem` padding.
- **Focus:** Survey Royal Blue border plus a translucent 3px blue outline.
- **Error / Disabled:** No custom visual state is established; preserve native semantics until one is implemented.

### Navigation
- **Style:** Cream text over Terrain Night, a centered desktop link row, an explicit estimate action, and a compact mobile header. The mobile bottom bar separates call and estimate into two equal actions.

### Grade-Line Journey

Contour paths, a red survey point, the ruled process runway, and the service-area diagram repeat one continuous site-reading idea. Motion draws these paths only when reduced motion is not requested.

## Do's and Don'ts

### Do:
- **Do** use verified project imagery as primary proof and keep crops large enough to read the relationship between grade, structure, and finish.
- **Do** preserve strong cream-on-night contrast, square controls, and red as the focused action marker.
- **Do** translate the horizontal grade-line journey into a vertical, equally legible sequence on mobile.
- **Do** keep reduced-motion users in the complete final visual state.

### Don't:
- **Don't** replace the open bands and ruled service choice with a generic rounded-card grid.
- **Don't** spread red across multiple competing decorative elements in the same field.
- **Don't** round buttons, inputs, or proof containers into soft product-UI shapes.
- **Don't** use stock imagery or decorative landscape photos in place of verified Omega project work.
