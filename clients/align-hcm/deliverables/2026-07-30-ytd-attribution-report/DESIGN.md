---
name: Align HCM Attribution Report
description: A dense, executive-ready evidence ledger for marketing, pipeline, and measurement maturity.
colors:
  midnight-page: "#071321"
  deep-navy-surface: "#0b1b2e"
  raised-navy-surface: "#0e2138"
  warm-report-ink: "#f7f0e2"
  secondary-ink: "#9fb0c1"
  quiet-ink: "#7e91a5"
  align-orange: "#f05a28"
  evidence-teal: "#27a591"
  social-violet: "#9085e9"
  positive-green: "#4cc38a"
  caution-gold: "#f7c873"
typography:
  display:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "clamp(34px, 5.6vw, 58px)"
    fontWeight: 800
    lineHeight: 1.03
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "clamp(23px, 3.1vw, 31px)"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  body:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "15.5px"
    fontWeight: 400
    lineHeight: 1.62
rounded:
  control: "10px"
  callout: "12px"
  panel: "16px"
spacing:
  xs: "8px"
  sm: "14px"
  md: "24px"
  lg: "44px"
  section: "60px"
components:
  data-link:
    backgroundColor: "{colors.align-orange}"
    textColor: "#2a0f05"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "9px 13px"
  panel:
    backgroundColor: "{colors.deep-navy-surface}"
    textColor: "{colors.warm-report-ink}"
    rounded: "{rounded.panel}"
    padding: "24px"
  search-field:
    backgroundColor: "#071522"
    textColor: "{colors.warm-report-ink}"
    rounded: "{rounded.control}"
    padding: "10px 13px"
---

# Design System: Align HCM Attribution Report

## Overview

**Creative North Star: "The Revenue Evidence Room"**

This report is a dark, high-density executive surface built for people who need to move from a marketing claim to its CRM evidence without changing tools. Warm ink keeps long-form reading comfortable; controlled orange, teal, violet, and green distinguish the evidence type rather than decorate the page.

The system combines broad narrative panels with compact metric surfaces and one exhaustive ledger. It should feel prepared for a leadership meeting while remaining usable as an operating artifact.

**Key Characteristics:**

- Evidence and definitions sit next to every consequential number.
- Orange carries Align identity; teal carries verification and active-state meaning.
- Tables are allowed to be dense because the report also provides narrative interpretation.
- Personal contact details stay out of the client-facing surface.

## Colors

The palette is a restrained dark navy system with warm reading ink and channel-specific accents.

### Primary

- **Align Orange:** the main brand and emphasis color, used for decisive numbers, active controls, and key anchors.

### Secondary

- **Evidence Teal:** confirmed-live states, AI/search evidence, and keyboard focus.
- **Social Violet:** organic-social channel labeling.
- **Positive Green:** explicit won outcomes and validated positive states.

### Neutral

- **Midnight Page:** the full-page background.
- **Deep Navy Surface:** tables, tiles, and panels.
- **Raised Navy Surface:** callouts that need stronger separation.
- **Warm Report Ink:** primary reading and numerical text.
- **Secondary Ink / Quiet Ink:** explanation, metadata, and evidence detail.

**The Evidence Color Rule.** Accent color always carries meaning: brand emphasis, channel identity, confirmation, or caution.

## Typography

**Display Font:** Plus Jakarta Sans (with system sans fallback)  
**Body Font:** DM Sans (with system sans fallback)

**Character:** The display face is compact and assertive enough for executive numbers; the body face stays neutral and legible across long explanations and dense tables.

### Hierarchy

- **Display** (800, 34–58px, 1.03): report title only.
- **Headline** (800, 23–31px, 1.15): major analytical sections.
- **Title** (800, 15–18px): panels, callouts, and operating steps.
- **Body** (400–600, 13–17px, 1.45–1.7): narrative, evidence, and table copy; narrative measures stay near 64–76ch.
- **Label** (600–800, 10.5–13px): metrics, channel tags, and data-control labels.

**The Numbers Lead Rule.** Numerical values use strong weight and tabular alignment; their definitions remain adjacent and readable.

## Layout

The report uses a centered 1120px container with 24px desktop gutters and 16px compact-screen gutters. Sections are separated by 60px, with 14–24px internal gaps. Narrative blocks use one or two columns; evidence paths use four equal steps on desktop, two at medium widths, and one on small screens.

Dense company and source tables remain horizontally scrollable rather than collapsing into ambiguous cards. Controls stack cleanly below 760px. Print rules hide filters and reduce table type so the artifact remains exportable.

## Elevation & Depth

Depth is primarily tonal: page, surface, and raised-surface navy values. Soft, downward ambient shadows are reserved for the YTD proof area and major feature bands. Callouts use a subtle inset top highlight instead of a thick colored side stripe.

**The Quiet Depth Rule.** A surface earns elevation through information priority; most containers use one border or one shadow, not both.

## Shapes

Controls use 9–10px corners, callouts use 12px corners, and panels use 14–16px corners. Small channel labels may use a compact 6px radius. The system avoids pill-shaped containers for general content.

## Components

### Data Link

- **Shape:** compact rounded rectangle (9px).
- **Primary:** Align Orange with dark text and 9px × 13px padding.
- **Hover / Focus:** slight brightness lift; 2px teal focus outline offset by 3px.

### Search and Filter Fields

- **Style:** deep navy fill, quiet border, warm ink, 10px radius.
- **Focus:** 2px teal outline with 2px offset.
- **Responsive:** search flexes; filter remains compact until controls stack.

### Channel Tags

- **Style:** compact rectangular labels using low-opacity channel color fills and high-contrast matching text.
- **State:** informational only; filters live in the separate select control.

### Panels and Metric Tiles

- **Corner Style:** 14–16px.
- **Background:** deep navy surface with warm text.
- **Border:** one quiet hairline.
- **Internal Padding:** 18–26px depending on density.

### Company Ledger

The ledger is the signature component. It preserves company, first-seen date, channel, evidence, and deal state in one horizontal reading line. Evidence copy is intentionally smaller but remains above the contrast floor. Deal state uses words as well as color.

## Do's and Don'ts

### Do:

- **Do** distinguish native, recovered, and unresolved attribution in plain language.
- **Do** keep explicit won revenue separate from open pipeline and unpriced opportunities.
- **Do** retain horizontal table scrolling when it protects comparison fidelity.
- **Do** provide a downloadable CSV beside the interactive ledger.

### Don't:

- **Don't** expose individual contact names, emails, phone numbers, or lost-deal detail in the client-facing report.
- **Don't** turn unknown deal amounts into modeled dollars.
- **Don't** use color as the only indicator of deal or evidence state.
- **Don't** inherit the report's numbered section markers or uppercase micro-labels as a universal Align UI rule; they are artifact-specific carryovers from the supplied report.
