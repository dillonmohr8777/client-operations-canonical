---
name: Momentum 360 Forecast Evidence
description: A proof-led executive evidence system that makes forecast promotion conditional on verified baseline and calibration results.
colors:
  canvas: "#020617"
  night: "#041027"
  navy: "#071632"
  panel-strong: "#143564"
  orbit-blue: "#2f82ff"
  orbit-blue-soft: "#84baff"
  ribbon-orbit: "#10366e"
  ribbon-deep: "#091d40"
  signal-gold: "#f2b63d"
  signal-gold-soft: "#ffdc91"
  signal-gold-halo: "#fff0c4"
  paper: "#f4f7fb"
  print-white: "#ffffff"
  ink: "#09152b"
  text: "#f7faff"
  muted: "#aebed3"
  muted-bright: "#cad7e7"
  ribbon-caption: "#b9cce5"
  chart-axis: "#52769f"
  chart-point-halo: "#cfe4ff"
  print-footer: "#91a8c4"
  rule: "#28456d"
  rule-strong: "#37608f"
typography:
  scale:
    chart-axis-title: "11px"
    chart-label: "12px"
    micro-label: "0.7rem"
    caption: "0.75rem"
    table: "0.76rem"
    chart-note: "0.77rem"
    label: "0.78rem"
    action: "0.82rem"
    tab: "0.84rem"
    boundary: "0.85rem"
    supporting-title: "0.96rem"
    body: "1rem"
    summary: "1.12rem"
    object-count: "1.16rem"
    compact-title: "1.25rem"
    title: "1.28rem"
    headline: "1.75rem"
    metric: "2rem"
    mobile-display-min: "2.45rem"
    mobile-display-max: "4.2rem"
    display-min: "2.65rem"
    display-max: "5.7rem"
    print-chart-label: "14px"
    print-chart-flag: "15px"
    print-page-heading: "32px"
    print-verdict: "45.33px"
  display:
    fontFamily: '"Space Grotesk", "Avenir Next", "Segoe UI Variable Display", "Segoe UI", sans-serif'
    fontSize: "clamp(2.65rem, 5.3vw, 5.7rem)"
    fontWeight: 680
    lineHeight: 0.95
    letterSpacing: "-0.038em"
  headline:
    fontFamily: '"Space Grotesk", "Avenir Next", "Segoe UI Variable Display", "Segoe UI", sans-serif'
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.025em"
  title:
    fontFamily: '"Space Grotesk", "Avenir Next", "Segoe UI Variable Display", "Segoe UI", sans-serif'
    fontSize: "1.28rem"
    fontWeight: 700
    lineHeight: 1.18
    letterSpacing: "-0.018em"
  metric:
    fontFamily: '"Space Grotesk", "Avenir Next", "Segoe UI Variable Display", "Segoe UI", sans-serif'
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.025em"
  body:
    fontFamily: '"DM Sans", "Segoe UI Variable Text", "Segoe UI", Arial, sans-serif'
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  label:
    fontFamily: '"Space Grotesk", "Avenir Next", "Segoe UI Variable Display", "Segoe UI", sans-serif'
    fontSize: "0.78rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "0.075em"
rounded:
  micro-line: "2px"
  meter: "6px"
  compact: "8px"
  print-compact: "9px"
  control: "10px"
  surface-small: "12px"
  surface: "14px"
  full: "999px"
spacing:
  hairline-gap: "4px"
  compact: "8px"
  control: "12px"
  surface: "18px"
  surface-large: "22px"
  section: "48px"
components:
  primary-action:
    backgroundColor: "{colors.orbit-blue-soft}"
    textColor: "{colors.navy}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "9px 14px"
    height: "42px"
  secondary-action:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.muted-bright}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "9px 14px"
    height: "42px"
  decision-badge:
    backgroundColor: "rgba(242, 182, 61, 0.09)"
    textColor: "{colors.signal-gold-soft}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "5px 11px"
    height: "30px"
  evidence-surface:
    backgroundColor: "rgba(7, 22, 50, 0.82)"
    textColor: "{colors.text}"
    rounded: "{rounded.surface}"
    padding: "22px"
  paper-readout:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.surface-small}"
    padding: "18px 20px"
  evidence-ribbon:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.text}"
    rounded: "{rounded.surface}"
    padding: "20px 22px"
  tab-active:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
    typography: "{typography.label}"
    padding: "10px 17px"
    height: "46px"
---

# Design System: Momentum 360 Forecast Evidence

## Overview

**Creative North Star: "Proof Before Prediction"**

This is a restrained executive evidence system, not a forecast spectacle. Near-black Momentum navy fields make verified figures, uncertainty, and decision boundaries feel deliberate; bright color is reserved for meaning rather than decoration. The shipped world extends the circular Momentum 360 mark with crisp rules, compact evidence controls, exact tabular figures, and candid status language.

The system is dense enough for comparison but never visually frantic. It alternates dark analytical fields with rare paper surfaces that translate technical evidence into an executive read. Charts, rails, tables, and print pages share the same palette and type grammar so the web dashboard and portable brief remain one evidence package without inheriting each other's page composition.

**Key Characteristics:**

- Near-black navy canvases with tonal blue layering rather than generic card grids.
- Orbit Blue for interaction, chart continuity, and governed paths.
- Signal Gold for decisions, warnings, abstention, and baseline outcomes.
- Self-hosted Space Grotesk display type paired with self-hosted DM Sans body type.
- Restrained rounded geometry, exact rules, tabular numerals, and paper reading relief.
- Complete keyboard, visible-focus, reduced-motion, responsive, and print behavior.

## Colors

The palette begins with three close navy depths, then uses blue and gold as semantically distinct signals against cool white text and paper relief.

### Primary

- **Orbit Blue** (`{colors.orbit-blue}`): Analytical series, selected navigation rules, progress tracks, and the connective path through evidence.
- **Soft Orbit Blue** (`{colors.orbit-blue-soft}`): Primary actions, accessible links, secondary chart lines, and fine outlines that must remain legible on navy.

### Secondary

- **Signal Gold** (`{colors.signal-gold}`): Decision markers, warnings, baseline reference lines, focus outlines, and terminal evidence states.
- **Soft Signal Gold** (`{colors.signal-gold-soft}`): High-contrast decision copy, highlighted headline clauses, and compact outcome labels.

### Neutral

- **Midnight Canvas, Night Field, and Momentum Navy** (`{colors.canvas}`, `{colors.night}`, `{colors.navy}`): The dark environmental stack, moving from page background to component field without flattening everything into one black.
- **Strong Panel Navy, Ribbon Orbit, and Ribbon Deep** (`{colors.panel-strong}`, `{colors.ribbon-orbit}`, `{colors.ribbon-deep}`): Repeated translucent decision fields and the shared evidence-ribbon gradient used on screen and in the brief.
- **Evidence White and Cool Paper** (`{colors.text}`, `{colors.paper}`): Evidence White carries primary copy and actual-series data; Cool Paper creates rare high-contrast executive reading surfaces.
- **Print White and Print Footer** (`{colors.print-white}`, `{colors.print-footer}`): The print canvas and repeated four-page folio treatment.
- **Paper Ink** (`{colors.ink}`): All copy placed on Cool Paper.
- **Muted Evidence and Bright Muted Evidence** (`{colors.muted}`, `{colors.muted-bright}`): Secondary labels and explanatory copy, respectively.
- **Chart Axis, Chart Point Halo, and Signal Gold Halo** (`{colors.chart-axis}`, `{colors.chart-point-halo}`, `{colors.signal-gold-halo}`): Repeated vector-chart structure and point-edge contrast across web and print.
- **Ribbon Caption** (`{colors.ribbon-caption}`): Qualifying evidence copy within the continuous metric ribbon.
- **Evidence Rule and Strong Evidence Rule** (`{colors.rule}`, `{colors.rule-strong}`): Dividers, table rows, rails, outlines, and stronger container boundaries.

### Named Rules

**The Two-Signal Rule.** Orbit Blue means analytical continuity or interaction; Signal Gold means a decision, warning, baseline, or threshold. Do not swap their roles for variety.

**The Paper Relief Rule.** Cool Paper is reserved for executive interpretation, coverage readouts, and boundary summaries. It is relief from the navy field, not an alternate page theme.

## Typography

**Display Font:** Space Grotesk, self-hosted variable font, with Avenir Next and Segoe UI display fallbacks.

**Body Font:** DM Sans, self-hosted variable font, with Segoe UI text and Arial fallbacks.

**Character:** Space Grotesk supplies a compact, technical confidence without becoming mechanical; DM Sans keeps caveats, annotations, and dense evidence readable. The pairing makes the verdict unmistakable while preserving calm explanatory prose.

### Hierarchy

- **Display** (680, `clamp(2.65rem, 5.3vw, 5.7rem)`, 0.95): One dominant verdict or page conclusion, balanced and tightly tracked. On narrow screens it shifts to `clamp(2.45rem, 13vw, 4.2rem)`.
- **Headline** (700, 1.75rem, 1.08): Major evidence sections and brief-page conclusions.
- **Title** (700, 1.28rem, 1.18): Chart, panel, and interpretation headings.
- **Metric** (700, 2rem, 1): Decisive numeric evidence with tabular lining figures.
- **Body** (400, 1rem, 1.55): Explanations and limitations, generally capped at 72 characters per line.
- **Label** (700, 0.78rem, 0.075em): Compact decisions and controls; uppercase is used only for status, section identity, and gate language.

The normative scale also records the shipped component and print steps. Web reading text bottoms out at 0.75rem; the 0.7rem step is restricted to tiny brand/status labels and numbered rail nodes, while 11–12px roles belong to vector-chart axes. Print-only chart and headline steps are recorded in pixels (14px, 15px, 32px, and 45.33px) because the shipped CSS uses detector-stable pixel equivalents.

### Named Rules

**The Verdict-Then-Method Rule.** Space Grotesk leads with the decision and the numbers; DM Sans explains what the evidence does and does not establish.

**The Exact-Figure Rule.** Quantitative evidence uses tabular lining figures. Labels may compress, but values must remain easy to compare across a rail, table, or gate.

## Layout

The web system uses a centered container capped at 1440px with 24px side gutters. At 900px and below the container shifts to 16px gutters and multi-column evidence structures collapse; at 700px and below actions may share the row, evidence metrics stack, and the four evidence tabs become a stable 2 × 2 grid instead of a horizontally clipped strip. At 1180px, wide compositions are allowed to reflow before they become cramped.

Spacing follows a compact 4/8/12px control rhythm, 18/22px surface padding, and larger 42–58px section separation. Repeated quantitative facts are joined into rails, ribbons, tables, or ruled grids; they are not scattered as unrelated floating cards. Wide charts remain legible on mobile through a clearly labeled horizontal inspection region while the page root itself stays within the viewport.

The print system is fixed to US Letter (8.5 × 11in), uses exact color printing, removes browser margins and surface shadows, preserves vector charts, and enforces explicit page breaks. Repeated print-component padding uses pixel equivalents while physical page geometry remains in inches; typography retains the same family, color, rule, and evidence hierarchy.

### Named Rules

**The Continuous Evidence Rule.** Related facts share one ruled structure so the reader can compare them as a set.

**The Reflow, Then Inspect Rule.** Collapse the page hierarchy before 900px; keep dense chart evidence inspectable inside an announced scroll region rather than shrinking it into illegibility.

## Elevation & Depth

Depth is mostly tonal and structural: navy layers, paper contrast, one-pixel rules, and translucent evidence fields do most of the work. The final evidence anchor is a compact `0 10px 14px rgba(0, 0, 0, 0.32)` shadow; no bordered evidence surface exceeds a 14px blur. The verified logo plaque, tooltip, ribbon, and sticky brief toolbar use their own tightly bounded depth roles. Colored glows were removed from the primary action and review state. Printed pages remove shadows entirely.

### Named Rules

**The Anchored-Depth Rule.** Use shadow only when a surface must sit above the evidence field or remain spatially anchored. Ordinary sections and tables use rules and tonal layering.

## Shapes

The form language is gently rounded but restrained. Compact controls use 8–10px corners, secondary surfaces use 12px, and primary evidence panels use 14px. Fully rounded geometry (999px) is reserved for compact state badges, freshness chips, and small safety labels. The verified circular mark and numbered rail nodes remain circles; charts and tables rely on lines rather than enclosing every datum.

Borders are usually one-pixel Evidence Rule or Strong Evidence Rule strokes. The system clips the evidence ribbon and fixed print pages, but lets chart strokes, focus outlines, and coverage targets remain visible where they carry meaning.

## Components

### Buttons

- **Shape:** Compact rounded controls (10px) with a minimum 42px height and 9px × 14px padding.
- **Primary:** Soft Orbit Blue with Momentum Navy text and no colored glow; hover lightens the fill without changing meaning.
- **Secondary:** Translucent navy with a Strong Evidence Rule outline; hover moves the outline to Soft Orbit Blue and the text to Evidence White.
- **Focus:** Every actionable element receives a 3px Signal Gold outline with a 4px offset through the global `:focus-visible` rule.

### Chips and Status

- **Decision badge:** A gold-tinted field, gold outline, Soft Signal Gold text, full radius, uppercase display label, and 30px minimum height.
- **Freshness and verified chips:** Tonal blue or green-tinted compact labels; they report state and do not behave like buttons.

### Cards / Containers

- **Evidence surface:** Translucent Momentum Navy, Strong Evidence Rule boundary, 14px corners, and the anchored evidence shadow only when it is the primary analytical object.
- **Paper readout:** Cool Paper with Paper Ink, 12–14px corners, and no shadow. Use for plain-language interpretation or boundary summaries.
- **Warning surface:** A low-opacity Signal Gold field with a gold rule and prominent Soft Signal Gold measure.

### Evidence Ribbon

The signature ribbon is one continuous deep-blue field divided by one-pixel rules. Each cell uses a compact label, a 2rem tabular metric, and a short qualifier. It changes from four columns to two at tablet widths and one at mobile widths without splitting into detached cards.

### Charts and Tables

Actuals are Evidence White, Chronos is Orbit Blue, persistence is a dashed Signal Gold line, and the uncertainty band is a translucent blue field. Chart series controls expose pressed state; focused data points receive a gold halo and accessible label. Tables use right-aligned tabular numerals, left-aligned row labels, uppercase column labels, and ruled rows; baseline wins receive a compact gold label.

### Evidence Rail

Numbered circular nodes sit on a Strong Evidence Rule line, with Soft Orbit Blue boundaries and a Signal Gold terminal state. The rail becomes vertical at 900px so the sequence remains readable without horizontal compression.

### Navigation

The evidence tabs use Space Grotesk labels, a 46px minimum height, muted default text, and an Orbit Blue active underline. Arrow keys, Home, and End move selection. Below 700px the four tabs become a bordered 2 × 2 navigation grid; selection still relies on text contrast and the active rule rather than color alone.

### Print Pages

Print pages preserve the navy world, circular mark, vector charts, ruled evidence grids, Signal Gold decisions, and Cool Paper readouts. Toolbars and no-script overlays are excluded from print, colors are forced to exact output, and shadows are removed so each Letter page remains a durable executive record.

## Do's and Don'ts

### Do:

- **Do** lead with the decision state, then let charts, tables, and rails expose the proof behind it.
- **Do** keep Orbit Blue and Signal Gold semantically separate under the Two-Signal Rule.
- **Do** use Cool Paper sparingly for plain-language interpretation and verified boundaries.
- **Do** preserve whole-number evidence, tabular figures, complete labels, and visible caveats.
- **Do** maintain the 3px Signal Gold focus outline, keyboard tab behavior, announced chart scrolling, and complete reduced-motion state.
- **Do** preserve the exact Letter print canvas, vector evidence, forced colors, and shadow-free output.

### Don't:

- **Don't** turn every metric or paragraph into a separate rounded card; use continuous ruled structures for related evidence.
- **Don't** use Signal Gold as a generic decorative accent or Orbit Blue as a decision-warning substitute.
- **Don't** fill large page regions with Cool Paper or invert the system into a light dashboard.
- **Don't** use pill geometry for ordinary containers, headings, or decorative labels.
- **Don't** introduce motion beyond short state feedback, and never require motion to reveal evidence.
- **Don't** make surface-specific first-viewport or four-page composition a global template; those decisions remain in the surface briefs.
