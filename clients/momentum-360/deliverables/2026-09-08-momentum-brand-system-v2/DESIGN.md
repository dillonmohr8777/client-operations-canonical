---
name: Momentum Digital and AI division v2.1 archival draft
description: Momentum fieldnotes; archival extension extracted from the implemented review board
colors:
  archive-paper: "#f5ecd5"
  archive-sheet: "#faf3e1"
  archive-ink: "#39372e"
  archive-patina: "#a18b66"
  archive-line: "#b8a887"
  archive-surface: "#e9dfc8"
  archive-muted: "#645b48"
  archive-shadow-low: "rgb(57 55 46 / 10%)"
  archive-shadow-paper: "rgb(57 55 46 / 12%)"
  archive-press: "rgb(57 55 46 / 8%)"
  archive-gutter: "rgb(161 139 102 / 8%)"
  archive-tape: "rgb(203 180 125 / 35%)"
  archive-tape-edge: "rgb(161 139 102 / 25%)"
  paper: "#fbfaf7"
  surface: "#eceae4"
  ink: "#14181b"
  muted: "#565f64"
  blue: "#1e73be"
  orange: "#f58320"
  deep: "#0e1a22"
  on-deep: "#f2f6f8"
  orange-ink: "#96490b"
typography:
  archive-display:
    fontFamily: "Archivo Black, sans-serif"
    fontSize: "clamp(2.6rem, 6vw, 5.7rem)"
    fontWeight: 400
  archive-heading:
    fontFamily: "Archivo Black, sans-serif"
    fontSize: "clamp(2.1rem, 3.8vw, 3.4rem)"
  archive-chapter:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(2.5rem, 4.5vw, 4rem)"
    fontWeight: 600
    lineHeight: 1.03
  archive-specimen:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "2.4rem"
  archive-quote:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "1.8rem"
  archive-caption:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "1.5rem"
  archive-cover-note:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "1.45rem"
  archive-strip:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "1.3rem"
  compact-body:
    fontFamily: "Nunito Sans, sans-serif"
    fontSize: "1rem"
  display:
    fontFamily: "Archivo Black, sans-serif"
    fontSize: "clamp(2.6rem, 6.3vw, 6rem)"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Nunito Sans, sans-serif"
    fontSize: "1.125rem"
    lineHeight: 1.6
  label:
    fontFamily: "Nunito Sans, sans-serif"
    fontSize: "0.875rem"
rounded:
  archive-tab: "2px"
  archive-control: "3px"
  control: "12px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "40px"
  xl: "80px"
components:
  button-primary:
    backgroundColor: "{colors.orange}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "13px 21px"
  service:
    backgroundColor: "{colors.blue}"
    textColor: "#ffffff"
    rounded: "{rounded.control}"
    padding: "40px"
---
# Momentum design system v2

## Overview
**Momentum fieldnotes.** This is a scan-mode record of the implemented local board, not approved Momentum policy. Dillon explicitly requested an archival scrapbook extension and supplied two natural-history plates. Their ivory fiber, light patina, fine hatching and inset frames now inform the whole board: page grounds, ebook spreads, icon specimens, captions, components and motion. The implementation is proposed for review; the reference direction is user-supplied. The v1 tokens and source logos remain untouched.

## Colors
The active archival wrapper intentionally overrides the base paper with archive-sheet, surface with archive-surface, ink with archive-ink and muted with archive-muted. The original base tokens remain available for compatibility. User-approved reference choice authorizes this material expansion; it does not imply approval of every implementation detail. Tape and patina are decorative only, never text colors.

Blue and orange are retained from existing source tokens. Paper, surface, ink, muted and deep also reuse that source vocabulary. Use white on blue; ink on orange. Orange-ink is the dark text variant. Never white body text on orange. Deep supports high-contrast cover and video typography. Avoid introducing new gradients or arbitrary accent colors per asset.

## Typography
The extension adds self-hosted Cormorant Garamond Italic for specimen captions, quotes and ebook chapter titles. Archivo Black retains the brand display voice; Nunito Sans retains all body and control copy. The archival type ramp above records the actual implemented sizes. Moving type uses whole-line staggered reveals triggered by replay; body text never moves. Do not replace or redraw the wordmark with any typeface.

Archivo Black is the retained display face, self-hosted, weight 400. Nunito Sans is the self-hosted reading/control face. Display is capped at 96px, tracking -0.03em. Body is 18px with 1.6 line height and maximum 68ch measure. Caveat and IBM Plex Mono exist in prior work; this focused draft does not use them or remove them from canonical policy. Chapter numerals convey actual reading sequence. Do not use decorative section counters or uppercase labels above headlines.

## Layout
1440px maximum content width, desktop 48px side gutters, mobile 20px. The paired editorial spread and other two-column layouts stack below 850px. A 40px desktop page inset becomes 26px on mobile. Use broad editorial fields and rules rather than repetitive same-size cards. Maintain a visible hierarchy between display, section heading, body and captions.

## Elevation & Depth
Archival paper uses a shallow pressed inset and a restrained layered-paper offset. The 5px/6px hard offset on sb-layer is a specific physical paper-stack exception, not a generic card shadow. sb-frame is an intentionally double-ruled inset plate from the supplied references. The authored sparse SVG fiber overlay is a paper material; no turbulent noise filter or arbitrary decorative grid is used.

Mostly flat color fields and fine structural rules. The ebook paper uses one soft ambient shadow (0 18px 48px, deep at 12%); no glow or glass. Do not add a shadow under already-bordered cards.

## Shapes
Active archival controls use 3px corners, chapter tabs 2px, physical paper frames square corners. The original 12px base remains available only outside the archival wrapper. Etched icon variants add subordinate hatch pedestals at 44px; clean 24/32px variants preserve silhouette readability. No invented portraits or historical-looking logos.

12px control and service-card radius. Icons share a 32px viewBox, 1.6px round stroke, no fill. Circular nodes are process geometry, not decorative picture substitutes. Preserve every logo aspect ratio and byte-exact source.

## Components
Extension: 12 agent role icons and 16 marketing icons, plus clean and etched sprites, bring the total to 38 semantic SVG sources. Existing 10 filenames and IDs stay unchanged. agents/marketing symbols remain separately namespaced by sprite. Agent roles: research, writer, designer, analyst, planner, builder, reviewer, coordinator, support, automator, memory and handoff. Marketing: search, paid ads, email, social, content, video, landing page, funnel, CRM, campaign, audience, conversion, reporting, calendar, experiment and brand.

Import scrapbook.css after tokens.css and add scrapbook to the body. Reuse sb-paper, sb-layer, sb-frame, sb-tab, sb-label, sb-tape, sb-cutout-caption, sb-index and sb-source. Source annotations must remain literal evidence, not fake archival authority. Reference JPGs are unedited user attachments for private design review; they are not claimed as Momentum original artwork or licensed public assets. The exact Momentum logos remain untouched on calm light grounds.

Use the orange/ink button for a clear action; the outlined variant for secondary actions. Both have hover, active context and keyboard focus treatment. Navigation uses real section links. Chapter buttons update reading content with aria-pressed and polite announcement. Native inputs include required validation and confirmation feedback; the demo transmits nothing. Ten standalone SVG assets plus a reusable sprite cover discover, route, automate, qualify, connect, measure, publish, compose, guard and handoff.

The one sustained motion is a workflow trace. Pause control stops animation globally. Icons respond once to hover/focus; title reveal is user-triggered. CSS prefers-reduced-motion disables every animation and smooth scrolling. No logo movement. Print mode is static and preserves color/reading hierarchy.

Logo usage: full lockup on a calm light field, at least half a mark-height clear space; compact mark only where context establishes identity. No new white/recolored variants are manufactured. The draft's Digital assets must never stand in for a Momentum 360 logo.

## Do's and Don'ts
Do preserve exact brand assets and readable text contrast. Do tie motion to a real sequence or deliberate interaction. Do keep long reading on paper. Do preserve brand separation. Do label sample copy as illustrative.

Do not treat this draft as approved policy. Do not distort or animate logos, use emoji icons, substitute a 360 identity, add unsupported outcome claims, or promise animation inside a static PDF.
