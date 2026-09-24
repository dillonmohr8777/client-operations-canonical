---
name: Momentum Nouveau Review Prototype
description: Local review record for Momentum blue and orange with Art Nouveau linework.
colors:
  brand-blue: "#155e86"
  brand-blue-deep: "#0f4b6a"
  action-orange: "#e27113"
  action-orange-hover: "#ef8a30"
  ink: "#14181b"
  cream: "#f5f2e8"
  paper: "#fcfaf4"
  muted-text: "#40565e"
  line: "rgba(20, 24, 27, .22)"
  error-border: "#9a361d"
  error-text: "#762714"
typography:
  display:
    fontFamily: "'Archivo Variable', sans-serif"
    fontSize: "clamp(2.9rem, 6vw, 5.75rem)"
    fontWeight: 760
    lineHeight: 1.02
    letterSpacing: "-.035em"
  body:
    fontFamily: "'Manrope Variable', sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.65
rounded:
  square: "0px"
  marker: "50%"
components:
  button-primary:
    backgroundColor: "{colors.action-orange}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "0 21px"
    height: "54px"
  button-primary-hover:
    backgroundColor: "{colors.action-orange-hover}"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "12px 13px"
    height: "49px"
  service-option-active:
    backgroundColor: "{colors.brand-blue}"
    textColor: "{colors.paper}"
    rounded: "{rounded.square}"
    padding: "14px 17px"
---

# Design System: Momentum Nouveau Review Prototype

## Overview

**Creative North Star: "The Signwritten Storefront"**

This local review surface carries the confirmed Momentum blue and orange identity into a storefront frame, with precise botanical branches and arches as Art Nouveau detail. The broad blue field, off-white reading surfaces, exact Need Momentum wordmark, and real founder photograph keep the ornament attached to the existing brand.

The stylesheet and component source are the authority for this record. This describes a local review prototype only; it is not a user-approved final design or a published site. The first-viewport arrangement is specific to this homepage, while the color, type, botanical linework, and square service/form surfaces describe the implemented visual language.

**Source provenance:** `C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-08-03-need-momentum-homepage-concepts\src\concepts\nouveau.css`, `NouveauHomepage.tsx`, and `ASSET-SOURCES.md`; rendered evidence: `C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-09-23-aegis-plan\review\desktop.png` and `mobile.png`. The local CSS is the token authority for this surface; the shared token file is not applied here.

**Not canonized:** The FAQ disclosure uses plus/minus glyphs as icons; the craft floor bans glyph icons, so this is a carried defect rather than a pattern for future screens.

**Key Characteristics:**
- Saturated Momentum blue and orange, balanced by cream, paper, and dark ink.
- Archivo Variable headlines with Manrope Variable body text.
- Botanical SVG linework frames the real founder photo and links service choices to their detail.
- Square controls and panels keep the geometry direct; the portrait arch carries the main curve.

## Colors

Blue owns the large brand surfaces; orange marks actions and active botanical details; warm light neutrals keep long-form content readable.

### Primary
- **Momentum Blue** (#155e86): Storefront, team section, selected service option, branchwork, and focus-adjacent brand details.
- **Deep Momentum Blue** (#0f4b6a): Portrait backing, service headings, and links on light surfaces.

### Secondary
- **Signal Orange** (#e27113): Primary actions, active branchwork, small state markers, and the visible keyboard focus outline.
- **Action Orange Hover** (#ef8a30): Interactive orange action hover state.

### Neutral
- **Warm Cream** (#f5f2e8): Page and service-section ground.
- **Soft Paper** (#fcfaf4): Reading panels, wordmark mats, and form surfaces.
- **Dark Ink** (#14181b): Main text and footer ground.
- **Muted Blue-Gray** (#40565e): Supporting text on light surfaces.
- **Ink Hairline** (rgba(20, 24, 27, .22)): Decorative separators between service choices and FAQ rows.
- **Error Brick** (#9a361d border; #762714 text): Invalid field borders, error summary, and field feedback.

### Named Rules
**The Storefront Color Rule.** Let blue carry the large brand fields; reserve orange for action, focus, and active-state signals.

## Typography

**Display Font:** Archivo Variable (sans-serif fallback)
**Body Font:** Manrope Variable (sans-serif fallback)

**Character:** Compact, heavy display lines provide a signwritten headline voice without introducing a script face. Manrope carries navigation, paragraphs, labels, and controls with a quieter reading texture.

### Hierarchy
- **Display** (weight 760, clamp(2.9rem, 6vw, 5.75rem), line-height 1.02, tracking -.035em): Main heading; secondary headings use the same family and weight at a smaller responsive scale.
- **Body** (weight 400, 16px, line-height 1.65): Default page copy; section descriptions cap at roughly 64ch and the hero lead at 58ch.
- **Action / label** (Manrope, generally .76–.87rem, weights 650–800): Navigation, CTA labels, form labels, and compact context.

### Named Rules
**The Two-Family Rule.** Use Archivo Variable for headings and Manrope Variable for reading text and interface labels.

## Layout

The desktop surface combines a framed storefront hero, a three-part service selector/detail area, full-width people and FAQ sections, and a two-column audit panel. The storefront is capped at 1480px; service and audit content use widths up to 1260px, with reading measures mostly between 58ch and 70ch. Section spacing is fluid, using viewport-based `clamp()` values rather than a fixed global spacing scale.

At 980px, navigation moves below the brand row and the audit becomes one column. At 680px, the hero, service choices, audit fields, and footer stack; service choices become a two-column grid and form controls fill the available width. At 360px, the storefront gutters and navigation type tighten. Reduced-motion preferences disable smooth scrolling and collapse transition and animation duration to .01ms.

## Elevation & Depth

The storefront and founder portrait use soft, tinted shadows for separation; the remaining cards and panels rely on color fields, borders, and linework. Shadows are atmospheric and limited to the two framed hero surfaces.

### Shadow Vocabulary
- **Storefront lift** (`0 20px 54px rgba(15, 75, 106, .14)`): Soft separation beneath the blue frame.
- **Portrait depth** (`0 18px 38px rgba(9, 49, 71, .28)`): Grounds the founder photo inside the botanical frame.

### Named Rules
**The Framed Depth Rule.** Keep shadows on the two large hero frames; service, FAQ, and form surfaces stay flat.

## Shapes

Most buttons, service panels, and form fields are square-cornered with visible strokes or strong color blocks. The founder image is clipped into a tall arch with softened lower corners; small service and preview markers are circular. Botanical stems use fine rounded joins so the illustration reads as drawn linework.

## Components

### Buttons
- **Character:** Square, high-contrast actions with short feedback.
- **Primary:** Orange fill, dark ink text, bold Manrope label, 54px minimum height, and 21px horizontal padding (15px on narrow screens).
- **Hover / Focus:** Hover shifts to the lighter orange and lifts 2px; keyboard focus uses a 3px orange outline with a 4px offset.
- **Header CTA:** Same orange action treatment at 48px minimum height with compact 17px horizontal padding.

### Navigation
- **Style:** Paper-colored, bold Manrope links within the blue storefront; underline appears on hover. At 680px and below, links spread across a full-width row.

### Service Selector and Detail
- **Style:** Text-led selector rows with ink hairline separators; the active row becomes a blue block with paper text and an orange circular marker.
- **Detail:** Square paper panel with a fine blue border, deep-blue heading, muted paragraph, and orange list markers. Botanical branchwork sits between selector and detail and changes its active twig with the selected service.

### Inputs / Fields
- **Style:** Square paper fields with a 1px muted stroke, 12px by 13px padding, and a 49px minimum input height; textareas start at 98px and can resize vertically.
- **Focus:** Shared 3px orange outline with 4px offset; caret is orange.
- **Error:** Brick border, inline message, and an error summary; invalid submissions focus the first invalid control.

### Audit Form States
- **Style:** Two-column field grid on wide layouts; one column on mobile. The completion and error summaries use paper panels with a 1px state border.
- **Behavior:** The six-field demo clears entries on completion and states that nothing is sent or stored.

## Do's and Don'ts

### Do:
- **Do** use the exact Need Momentum wordmark and keep the current blue/orange identity visible.
- **Do** use botanical branching as decorative linework; it is not a new official tree logo.
- **Do** keep the founder photography source-located and preserve the verified identity mapping.
- **Do** retain the visible orange keyboard focus outline and reduced-motion behavior.
- **Do** label local preview and completion states clearly when using this prototype's audit form.

### Don't:
- **Don't** redraw or trace the official wordmark.
- **Don't** present this local review prototype as an approved final design or published site.
- **Don't** turn the homepage's hero composition into a required layout for every future screen.
- **Don't** imply the local audit demo sends or stores visitor details.
