---
name: Bar Crawl USA Event Production Dossier
description: A premium after-hours call-sheet system for the October production plan and worked-page analytics book.
colors:
  near-black-ink: "#111317"
  bone-paper: "#f3eee4"
  paper-white: "#fffdf8"
  deep-ultraviolet: "#30207d"
  operations-cobalt: "#244fce"
  status-coral: "#b83a2f"
  status-coral-light: "#ff9e8f"
  paper-mist: "#d8d0c4"
  quiet-ink: "#5c5a58"
  analytics-quiet: "#605d58"
  ledger-line: "#2a2927"
  data-blue-wash: "#dce4ff"
  preview-canvas: "#d7d3cb"
typography:
  display:
    fontFamily: "Barlow Condensed, Arial, sans-serif"
    fontSize: "42pt"
    fontWeight: 800
    lineHeight: 0.89
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Barlow Condensed, Arial, sans-serif"
    fontSize: "28pt"
    fontWeight: 800
    lineHeight: 0.9
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Barlow Condensed, Arial, sans-serif"
    fontSize: "17pt"
    fontWeight: 800
    lineHeight: 1
  body:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "9.3pt"
    fontWeight: 400
    lineHeight: 1.42
  label:
    fontFamily: "Barlow Condensed, Arial, sans-serif"
    fontSize: "8pt"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0.1em"
rounded:
  square: "0"
  asset: "8px"
spacing:
  compact: "0.1in"
  standard: "0.18in"
  section: "0.25in"
  frame: "0.48in"
components:
  status-stamp:
    backgroundColor: "transparent"
    textColor: "{colors.status-coral}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "9px 13px"
  ledger-band:
    backgroundColor: "{colors.near-black-ink}"
    textColor: "{colors.paper-white}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "7px"
  call-sheet-panel:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.near-black-ink}"
    rounded: "{rounded.square}"
    padding: "0.32in 0.25in 0.22in"
  ultraviolet-field:
    backgroundColor: "{colors.deep-ultraviolet}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.square}"
    padding: "0.42in"
  folio:
    backgroundColor: "transparent"
    textColor: "{colors.quiet-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "0"
---

# Design System: Bar Crawl USA Event Production Dossier

## Overview

**Creative North Star: "The After-Hours Producer Dossier"**

The system feels like a premium event producer's book opened after venue close: bone call sheets, near-black ledger bands, ultraviolet fields, cobalt operational cues, and coral status marks. It is decisive, compact, and built for review under pressure. Strong rules, cropped numerals, and condensed uppercase type replace decorative card scaffolds.

The portrait production plan and landscape analytics book are one visual family with different reading jobs. The plan turns 10 production pages into an eight-page sequence of scope, market briefs, build standards, ownership, and decisions. The analytics book turns 24 worked-page rows into a five-page evidence ledger with exact values, bounded interpretation, and tabular alignment.

**Key Characteristics:**

- Barlow Condensed at 500 and 800 for authority, labels, folios, and numeric evidence
- Arial for dense explanatory copy and long-form operational detail
- Bone paper, near-black ink, deep ultraviolet, cobalt, and contrast-safe coral roles
- Strict ledger bands, one-pixel rules, status stamps, and flat print surfaces
- Portrait eight-page planning and landscape five-page analytics compositions

## Colors

The palette uses bone and near-black as the material base, ultraviolet and cobalt as production fields, and two coral values selected for their surface contrast.

### Primary

- **Deep Ultraviolet** (#30207d): Owns large data fields, decisive headings, and high-attention production definitions.
- **Operations Cobalt** (#244fce): Separates secondary workstreams, alternating inset bands, and analytic emphasis.

### Secondary

- **Status Coral** (#b83a2f): Carries stamps, dates, holds, and decision signals on bone or white surfaces.
- **Status Coral Light** (#ff9e8f): Carries the same status role on near-black or ultraviolet fields.

### Neutral

- **Near-Black Ink** (#111317): Primary text, ledger bands, cover monuments, and dark decision pages.
- **Bone Paper** (#f3eee4): The dominant printable call-sheet surface.
- **Paper White** (#fffdf8): Inner briefs and high-contrast text on dark fields.
- **Paper Mist** (#d8d0c4): Quiet dividers and supporting paper tones.
- **Quiet Ink** (#5c5a58): Secondary copy in the portrait plan.
- **Analytics Quiet** (#605d58): Secondary copy in the denser landscape book.
- **Ledger Line** (#2a2927): Strict structural rules in the portrait plan.
- **Data Blue Wash** (#dce4ff): Sparse emphasis behind standout analytic cells.
- **Preview Canvas** (#d7d3cb): Screen-only surround that distinguishes each physical sheet.

**The Coral Contrast Rule.** Use dark coral only on bone or white; use light coral on near-black or ultraviolet.

**The Field Discipline Rule.** Ultraviolet and cobalt create bounded work fields. Coral marks status. None of the three becomes a decorative gradient.

## Typography

**Display Font:** Barlow Condensed with Arial fallback  
**Body Font:** Arial with Helvetica fallback  
**Label and Numeric Font:** Barlow Condensed with Arial fallback

**Character:** The pairing is assertive and operational. Barlow Condensed compresses large counts, narrow ledgers, and uppercase instructions without losing authority; Arial carries explanation without competing with the production hierarchy.

### Hierarchy

- **Monument** (800, 118pt to 310pt, 0.72 to 0.76 line height): Cropped cover counts and closing scope locks only.
- **Display** (800, 42pt to 62pt, 0.82 to 0.89 line height): Cover titles and one dominant statement per sheet.
- **Headline** (800, 25pt to 28pt, 0.9 line height): Section openings and decisive page titles.
- **Title** (800, 15pt to 23pt, 1 line height): Markets, callouts, actions, and structured subheads.
- **Body** (400, 8.7pt to 10.8pt, 1.38 to 1.45 line height): Operational explanation, evidence notes, and constraints.
- **Ledger** (500 or 800, 6.8pt to 9pt, 1 to 1.1 line height): Paths, table values, metrics, and dense structured labels with tabular numerals.
- **Label** (500 or 800, 7.5pt to 13pt, 0.03em to 0.12em letter spacing): Folios, stamps, source bars, dates, and compact metadata in uppercase.

**The Condensed Authority Rule.** Use Barlow Condensed for hierarchy, status, structured evidence, and numeric emphasis; use Arial for explanatory prose.

**The Tabular Evidence Rule.** All comparable analytics values use tabular numerals and right alignment until the mobile row transformation.

## Layout

The production plan is fixed to US Letter portrait at 8.5 by 11 inches and spans eight pages. Its working frame is approximately 0.48 to 0.52 inches. Covers use an asymmetric split with a cropped scope numeral; inner pages use strict roster, split-brief, specification, timeline, and action grids.

The analytics book is fixed to US Letter landscape at 11 by 8.5 inches and spans five pages. Its working frame is approximately 0.42 to 0.48 inches. The cover divides source context from a broad ultraviolet count field. Inner sheets prioritize full-width ledgers, followed by compact interpretation and decision fields.

The portrait sequence must continue to state 10 production pages. The landscape ledger must continue to contain 24 worked-page rows. On screens below 850px, the portrait grids collapse to one column. Below 1100px, the landscape ledger becomes labeled vertical records without hiding any values.

**The Orientation Rule.** The production plan stays portrait and the analytics book stays landscape because their reading jobs are different.

**The Exact Scope Rule.** Never let composition, pagination, or responsive adaptation obscure the 10 production pages or the 24 worked-page rows.

## Elevation & Depth

Print surfaces are flat. Depth comes from field changes, hard rules, inset color bands, and cropped scale. The only shadow is the screen-preview sheet separation (0 18px 46px rgba(17, 19, 23, 0.18)); it disappears in print and must never be repurposed as card styling.

**The Flat Print Rule.** If a shadow survives print, it is outside the system.

## Shapes

The form language is square, ruled, and ledger-like. Panels, tables, bands, stamps, and callouts use zero radius. Verified logo assets may retain their small 7px to 8px corner treatment. Status stamps rotate three to four degrees, giving the only deliberate irregularity to an otherwise exact call-sheet grid.

**The One Irregular Mark Rule.** Rotation belongs to status stamps only; layout, borders, and data alignment remain exact.

## Components

### Cover Monument

A cropped near-black or paper numeral establishes scope before explanatory detail. It uses Barlow Condensed at extreme scale and remains a structural field, not a decorative watermark.

### Status Stamp

A two-pixel coral outline, uppercase condensed label, square corners, and slight rotation mark scope, source, or media status. The written label always carries the meaning.

### Ledger Band

Near-black bands organize source labels, table headers, and section boundaries. Text is uppercase, compressed, and aligned to the grid.

### Market Roster Row

A ruled four-column row gives equal weight to number, market, date, and page role. It uses no container fill or rounded wrapper.

### Call-Sheet Panel

White inner panels sit on bone paper with a coral or cobalt inset top band. City briefs use strict internal rules, a compact path line, repeated event editions, and a written closing status.

### Metric Strip

Large condensed values align with compact uppercase labels inside a ruled dark or ultraviolet field. Coral light is reserved for the value when the field is dark.

### Analytics Ledger

The ledger uses a fixed table layout, near-black headers, tabular right-aligned values, exact paths, subtle alternating cobalt wash, and sparse highlighted cells. Mobile rows become labeled vertical records.

### Folio

Every sheet closes with left context, a flexible one-pixel rule, and an exact page fraction. The folio is structural navigation for print, not ornament.

## Do's and Don'ts

### Do:

- **Do** preserve the bone paper, near-black ink, ultraviolet, cobalt, and surface-specific coral roles.
- **Do** keep Barlow Condensed at 500 and 800 for hierarchy and structured evidence, with Arial for explanatory copy.
- **Do** preserve the portrait eight-page plan, landscape five-page analytics book, 10 production pages, and 24 worked-page rows.
- **Do** use written status, exact paths, explicit source windows, and tabular alignment.
- **Do** let bands, rules, field changes, and cropped numerals create hierarchy.

### Don't:

- **Don't** revive the Lit Route Map metaphor or Space Grotesk typography.
- **Don't** use rounded card stacks, pills, generic dashboard tiles, or decorative gradients.
- **Don't** use dark coral on dark fields or light coral as body copy on paper.
- **Don't** add print shadows, soft floating layers, or ornamental motion.
- **Don't** collapse dense evidence into summaries that hide exact rows or values.
