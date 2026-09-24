---
name: GT Clinic AI Search Audit
description: A premium clinical editorial report that turns search evidence into a concierge treatment plan.
colors:
  clinical-navy: "#292b6f"
  midnight-navy: "#171947"
  decision-gold: "#b29955"
  evidence-sky: "#dceef2"
  clinical-paper: "#f7f8f6"
  primary-ink: "#1c2131"
  muted-ink: "#667085"
  white: "#ffffff"
  rule: "#d9dde5"
  success: "#28715c"
  warning: "#9a5d14"
  risk: "#9e3b42"
  dark-copy: "#d8dcef"
  dark-fine: "#bbc2da"
typography:
  display:
    fontFamily: "Forum, Georgia, serif"
    fontSize: "clamp(4rem, 9vw, 7.7rem)"
    fontWeight: 400
    lineHeight: 0.86
  mobile-display:
    fontFamily: "Forum, Georgia, serif"
    fontSize: "clamp(3.2rem, 15vw, 4rem)"
    fontWeight: 400
    lineHeight: 0.92
  headline:
    fontFamily: "Forum, Georgia, serif"
    fontSize: "clamp(2.65rem, 5vw, 4.6rem)"
    fontWeight: 400
    lineHeight: 0.98
  print-headline:
    fontFamily: "Forum, Georgia, serif"
    fontSize: "2.25rem"
    fontWeight: 400
  thesis:
    fontFamily: "Forum, Georgia, serif"
    fontSize: "1.65rem"
    fontWeight: 400
  print-diagnosis:
    fontFamily: "Forum, Georgia, serif"
    fontSize: "1.75rem"
    fontWeight: 400
  print-signal:
    fontFamily: "Forum, Georgia, serif"
    fontSize: "1.8rem"
    fontWeight: 400
  print-callout:
    fontFamily: "Forum, Georgia, serif"
    fontSize: "1.35rem"
    fontWeight: 400
  print-loop:
    fontFamily: "Forum, Georgia, serif"
    fontSize: "1.15rem"
    fontWeight: 400
  body:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
  micro-label:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "0.62rem"
    fontWeight: 700
    letterSpacing: "0.1em"
rounded:
  none: "0"
  badge: "6px"
  circle: "50%"
spacing:
  xs: "8px"
  sm: "14px"
  md: "24px"
  lg: "48px"
  xl: "100px"
---

# Design System: GT Clinic AI Search Audit

## Overview

**Creative North Star: "The Concierge Treatment Plan"**

The report presents GT Clinic as a physician-led, evidence-oriented practice. Monumental editorial type carries the diagnosis while clinical navy fields, soft evidence surfaces, and rare gold decision marks keep the work premium and medically credible.

**Key Characteristics:**

- Editorial scale with restrained clinical materials
- Evidence labels that separate verified, estimated, recommended, and pending claims
- The exact live-site GT logo on the front and back covers
- Deliberate print composition with full-page chapter openings and back cover

## Colors

Clinical navy is the primary authority field. Gold is reserved for decisions, sequence, and high-value emphasis. Sky and paper create breathable evidence surfaces.

**The Rare Gold Rule.** Gold identifies decisions and sequence; it never becomes a general fill color.

## Typography

**Display Font:** Forum with Georgia fallback  
**Body Font:** Manrope with Arial fallback

Forum gives the report an elevated editorial voice. Manrope carries dense findings with clean clinical legibility.

**The Two Voice Rule.** Forum diagnoses and persuades; Manrope explains, labels, and substantiates.

## Layout

The desktop container is capped at 1180px with asymmetric editorial section heads, ruled evidence bands, and open grids. At 850px the layout collapses to one column, four-value bands become two by two, roadmaps stack, and data tables become keyboard-focusable horizontal reading regions. Print uses Letter pages, compact two-column roadmap lists, and intentional full-page front and back covers.

## Elevation & Depth

The system is flat by default. One ambient shadow lifts the paired diagnosis panel; tonal fields and hairline rules do the remaining depth work.

## Shapes

Geometry is mostly square and editorial. Small evidence badges use a restrained 6px radius; circles are reserved for roadmap markers and the logo.

## Components

### Evidence badges

Compact uppercase labels communicate evidence status with soft background tints and high-contrast copy.

### Signal bands

Four-column metric bands use Forum numerals, hairline separators, and short Manrope labels. They collapse to a two-by-two grid on mobile.

### Roadmap spine

Gold circular steps connect an exact 90 day implementation sequence. Desktop and print use two-column action lists; mobile uses one column.

### AI learning loop

Five equal midnight panels express Observe, Diagnose, Change, Validate, and Learn. Columns use `minmax(0, 1fr)` so no label can clip.

## Do's and Don'ts

### Do:

- **Do** use the exact local logo asset at `assets/gt-clinic-logo.png`.
- **Do** keep evidence status visible and claims source-bounded.
- **Do** preserve reduced-motion behavior and readable mobile table access.

### Don't:

- **Don't** introduce generic rounded card walls.
- **Don't** use gold as a broad decorative fill.
- **Don't** present estimates as owned analytics.
