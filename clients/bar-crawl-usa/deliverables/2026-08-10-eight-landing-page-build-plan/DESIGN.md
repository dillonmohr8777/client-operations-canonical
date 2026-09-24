---
name: Bar Crawl USA August Build Plan
description: A client planning system that turns eight canonical pages into one visible fall runway.
colors:
  night: "#061225"
  night-layer: "#0a1c36"
  route-blue: "#35a8ff"
  route-blue-deep: "#173f73"
  decision-gold: "#f0bd64"
  decision-gold-soft: "#ffe0a6"
  blueprint-paper: "#f7f4ee"
  white: "#f8fbff"
  mist: "#b9c7da"
  route-line: "#284666"
  ink-on-paper: "#101d30"
  light-folio: "#52687d"
  light-gold: "#82510f"
typography:
  display:
    fontFamily: "SpaceGrotesk, Arial, Helvetica, sans-serif"
    fontSize: "34pt"
    fontWeight: 700
    lineHeight: 0.96
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "SpaceGrotesk, Arial, Helvetica, sans-serif"
    fontSize: "20pt"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-0.03em"
  title:
    fontFamily: "SpaceGrotesk, Arial, Helvetica, sans-serif"
    fontSize: "11.3pt"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.012em"
  body:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "9.6pt"
    fontWeight: 400
    lineHeight: 1.42
  label:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "7pt"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.07em"
rounded:
  sm: "9px"
  md: "13px"
  lg: "15px"
  pill: "999px"
spacing:
  xs: "7px"
  sm: "10px"
  md: "14px"
  lg: "20px"
  xl: "31px"
components:
  decision-chip:
    backgroundColor: "transparent"
    textColor: "{colors.decision-gold-soft}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "8px 12px"
  page-map:
    backgroundColor: "{colors.night-layer}"
    textColor: "{colors.white}"
    rounded: "{rounded.lg}"
    padding: "0"
  approval-callout:
    backgroundColor: "{colors.blueprint-paper}"
    textColor: "{colors.ink-on-paper}"
    rounded: "{rounded.md}"
    padding: "11px 13px"
  checkpoint:
    backgroundColor: "{colors.night-layer}"
    textColor: "{colors.decision-gold}"
    rounded: "{rounded.pill}"
    size: "32px"
---

# Design System: Bar Crawl USA August Build Plan

## Overview

**Creative North Star: "The Lit Route Map"**

The system treats the plan as a route from call decision to indexed page to fall activation. Dark pages feel like a controlled event-night environment, while cream blueprint pages create a brighter working surface for the eight implementation briefs. Electric blue marks motion and navigation; warm gold marks decisions, checkpoints, and approval.

It is an evolution of the prior Momentum 360 client plan, not a new Bar Crawl USA identity. The bundled Space Grotesk face and navy, blue, and gold palette are inherited deliberately; stronger composition, alternating materials, and circular route markers supply the added polish.

**Key Characteristics:**

- Alternating night decision pages and cream blueprint pages
- Visible route checkpoints that make an eight-page plan feel continuous
- Gold reserved for decisions and blue reserved for movement
- Dense but readable client information with a firm source-of-truth hierarchy

## Colors

The palette moves between a deep event-night field and a warm planning sheet, with blue and gold carrying distinct semantic jobs.

### Primary

- **Route Blue:** Signals movement, linked steps, and the active half of the title.
- **Route Blue Deep:** Grounds map headers and nested planning structures.

### Secondary

- **Decision Gold:** Marks approvals, page counts, priorities, and active checkpoints.
- **Decision Gold Soft:** Supports small emphasis on dark fields without competing with the primary title.

### Neutral

- **Night:** Owns all dark page backgrounds.
- **Night Layer:** Separates rows and planning panels without shadows.
- **Blueprint Paper:** Owns the implementation sheets and light callouts.
- **White and Mist:** Supply primary and secondary text on dark fields.
- **Ink on Paper and Light Folio:** Supply accessible text on the light sheets.
- **Route Line:** Creates quiet separators, rails, and page progress.

**The Two Jobs Rule.** Blue means movement or structure. Gold means decision or priority. Do not swap those roles for decoration.

## Typography

**Display Font:** Space Grotesk with Arial and Helvetica fallbacks
**Body Font:** Arial with Helvetica fallback

**Character:** Space Grotesk carries the assertive client-plan voice and matches the inherited reference. Arial keeps dense operational detail neutral and highly legible.

### Hierarchy

- **Display** (700, 34pt, 0.96): Cover thesis only, with a maximum two-line composition.
- **Headline** (700, 20pt, 1.02): Section decisions and blueprint opening statements.
- **Title** (700, 11.3pt, 1.15): Page names, owners, and structured subheads.
- **Body** (400, 9.6pt, 1.42): Client-facing explanation with a maximum measure of 72 characters.
- **Label** (700, 7pt, 0.07em): Compact metadata, wave labels, and folio information.

**The Reference Voice Rule.** Space Grotesk is a pinned-reference exception, not a default choice for unrelated Momentum 360 work.

## Layout

Print composition is fixed to US Letter at 8.5 by 11 inches with 0.45 to 0.5 inch working margins. Dark pages prioritize one thesis and one operating decision; light pages use a 1.35 inch checkpoint rail beside the blueprint content. Two-column material becomes one column below 900 pixels. All grid tracks that carry text use flexible minimums so the mobile view remains at the viewport width.

Spacing follows a 7, 10, 14, 20, and 31 pixel rhythm. Tight labels stay close to their subject; major changes receive at least 20 pixels. Footers remain quiet and consistent across all eight pages.

**The One Route Rule.** Every page advances the same story. Progress dots, checkpoint numbers, and build waves may change state, but they never become separate navigation systems.

## Elevation & Depth

The system is flat and layered. It uses tonal shifts, borders, radial light, and large cropped circles instead of shadows. Dark panels lift through a slightly lighter navy; cream callouts lift through material contrast. No component uses a floating shadow.

**The Tonal Depth Rule.** Separate surfaces with color and one-pixel rules before considering elevation. Shadows do not belong in this document system.

## Shapes

Large sheets remain square to the page. Working panels use softly curved 13 to 15 pixel corners. Compact metadata and decision chips may use a pill radius. Circular checkpoints are the signature geometry, echoed by the cropped route circle at the bottom right of each page.

## Components

### Decision Chip

A transparent, gold-outlined pill used once near the cover lockup to state the artifact's status. It uses compact uppercase label type and 8 by 12 pixel padding.

### Page Map

A deep navy list with a blue header, gold numbers, and one-pixel route separators. It is used only for the recommended eight-page set.

### Approval Callout

A cream panel on dark pages for recommendation boundaries, backlog status, or required inputs. Its material change signals that the content needs human confirmation.

### Blueprint Brief

A two-part light-page pattern: circular checkpoint rail on the left and a content body on the right. Each brief includes page name, canonical URL, purpose, build requirements, search and conversion requirements, and a horizontal visitor pathway.

### Route Folio

The footer combines document context, eight progress markers, and an exact page fraction. Only the current marker stretches and turns gold.

## Do's and Don'ts

### Do:

- **Do** use gold only for decisions, priorities, and the active route state.
- **Do** keep every named URL readable in print and selectable in the PDF.
- **Do** alternate dark decision pages with light working pages when the content changes from strategy to execution detail.
- **Do** preserve the source boundary between confirmed facts and recommendations awaiting approval.

### Don't:

- **Don't** create generic same-size cards as the document's primary structure.
- **Don't** add duplicate page URLs or present recommendations as decisions already made on the call.
- **Don't** introduce shadows, decorative gradients, or extra accent colors.
- **Don't** reuse Space Grotesk as an automatic font choice outside this pinned reference system.
