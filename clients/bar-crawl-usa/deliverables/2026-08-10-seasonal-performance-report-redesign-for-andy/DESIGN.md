---
name: Bar Crawl USA Seasonal Performance Field Book
description: A portrait executive field book that turns GA4 and Semrush evidence into an after-hours producer dossier for Andy Zirger.
colors:
  near-black-ink: "#111317"
  bone-paper: "#f3eee4"
  paper-white: "#fffdf8"
  deep-ultraviolet: "#30207d"
  operations-cobalt: "#244fce"
  status-coral: "#b83a2f"
  status-coral-light: "#ff9e8f"
  quiet-ink: "#5c5a58"
  paper-mist: "#d8d0c4"
  data-blue-wash: "#dce4ff"
  preview-canvas: "#d7d3cb"
  table-rule: "#aaa49a"
  bar-track: "#d4cec4"
  dark-divider: "#77747b"
typography:
  display:
    fontFamily: "Barlow Condensed, Arial, sans-serif"
    fontSize: "49pt"
    fontWeight: 800
    lineHeight: 0.84
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Barlow Condensed, Arial, sans-serif"
    fontSize: "29pt"
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
    fontSize: "9.2pt"
    fontWeight: 400
    lineHeight: 1.42
  label:
    fontFamily: "Barlow Condensed, Arial, sans-serif"
    fontSize: "8pt"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0.08em"
rounded:
  square: "0"
  partner-asset: "8px"
spacing:
  compact: "0.12in"
  standard: "0.22in"
  section: "0.25in"
  frame: "0.5in"
components:
  status-stamp:
    backgroundColor: "transparent"
    textColor: "{colors.status-coral}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "9px 13px"
  metric-band-lead:
    backgroundColor: "{colors.deep-ultraviolet}"
    textColor: "{colors.paper-white}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "0.17in 0.12in"
  season-box:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.near-black-ink}"
    rounded: "{rounded.square}"
    padding: "0.23in 0.2in 0.18in"
  decision-field:
    backgroundColor: "{colors.near-black-ink}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.square}"
    padding: "0.25in 0.22in"
  folio:
    backgroundColor: "transparent"
    textColor: "{colors.quiet-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "0"
---

# Design System: Bar Crawl USA Seasonal Performance Field Book

## Overview

**Creative North Star: "The After-Hours Producer Dossier"**

The seasonal report feels like a premium event producer's field book opened after venue close: bone call sheets, near-black ledgers, ultraviolet evidence fields, cobalt operational cues, and coral decision marks. It is assertive, compact, and built for an executive reader who needs the business meaning first and the exact evidence immediately behind it.

The eight-sheet portrait book is one continuous proof sequence. A cropped seasonal count establishes scale, ruled metrics and tables carry the GA4 and Semrush evidence, and the final dark decision field converts the findings into five ordered approvals. Strong rules, condensed uppercase type, and hard field changes replace generic analytics cards.

**Key Characteristics:**

- Barlow Condensed at 500 and 800 for authority, labels, folios, and numeric evidence
- Arial for explanatory copy and source-bound interpretation
- Bone paper, near-black ink, deep ultraviolet, cobalt, and contrast-safe coral roles
- Strict bands, one-pixel rules, tabular values, cropped numbers, and flat print surfaces
- Eight US Letter portrait sheets that collapse without losing metrics below 850px

## Colors

Bone and near-black establish the print material; ultraviolet and cobalt organize evidence; coral marks status and decisions.

### Primary

- **Deep Ultraviolet**: Owns the cover monument, lead metrics, ranking proof, and the strongest evidence fields.
- **Operations Cobalt**: Marks secondary workstreams, light analytic emphasis, and paper-surface bars.

### Secondary

- **Status Coral**: Carries the Andy attribution, stamps, and decision signals on bone or white.
- **Status Coral Light**: Carries high-attention values and action labels on near-black or ultraviolet.

### Neutral

- **Near-Black Ink**: Primary text, table headers, evidence panels, and the closing decision sheet.
- **Bone Paper**: Dominant printable surface across the report.
- **Paper White**: High-contrast inset surface and text on dark fields.
- **Quiet Ink**: Supporting copy on paper.
- **Paper Mist**: Reserved supporting paper tone from the implemented token set.
- **Preview Canvas**: Screen-only surround that separates physical sheets.
- **Table Rule, Bar Track, and Dark Divider**: Quiet structural lines and data tracks.
- **Data Blue Wash**: Sparse emphasis for standout table cells and secondary dark-field text.

**The Coral Contrast Rule.** Use dark coral only on bone or white; use light coral on near-black or ultraviolet.

**The Field Discipline Rule.** Ultraviolet and cobalt create bounded evidence fields. Coral marks status and decisions. None becomes a decorative gradient.

## Typography

**Display Font:** Barlow Condensed with Arial fallback  
**Body Font:** Arial with Helvetica fallback  
**Label and Numeric Font:** Barlow Condensed with Arial fallback

**Character:** Barlow Condensed compresses large seasonal counts, narrow tables, and uppercase instructions without losing authority. Arial keeps explanatory copy calm and legible beside the more forceful evidence typography.

### Hierarchy

- **Season Monument** (800, 126pt, 0.72 line height): The cropped cover count only.
- **Display** (800, 49pt to 58pt, 0.84 line height): Cover title and dominant sheet statements.
- **Headline** (800, 29pt, 0.9 line height): The seven evidence and decision section openings.
- **Title** (800, 14pt to 25pt, 1 line height): Channels, rankings, gaps, and action names.
- **Body** (400, 8.3pt to 10.5pt, 1.42 line height): Source context, interpretation, and constraints.
- **Numeric Evidence** (500 or 800, 8.7pt to 78pt): Tables, metric bands, ranks, and hero values with tabular numerals where values compare.
- **Label** (500 or 800, 7.5pt to 10.5pt, uppercase): Brand bars, folios, stamps, dates, and compact metadata.

**The Condensed Authority Rule.** Use Barlow Condensed for hierarchy, status, structured evidence, and numeric emphasis; use Arial for explanatory prose.

**The Tabular Evidence Rule.** Comparable analytics values use tabular numerals and right alignment until the mobile transformation.

## Layout

The report is fixed to eight US Letter portrait sheets at 8.5 by 11 inches. The standard inner frame is 0.5 inches horizontally, with approximately 0.46 inches above content and 0.58 inches below it. The cover uses a 2.72-inch ultraviolet count field beside the executive title and snapshot. Interior sheets alternate full-width metric bands and tables with purpose-built channel stacks, seasonal boxes, baseline splits, rank fields, domain comparisons, and the final action list.

At screen widths below 850px, sheets become full-width, auto-height reading surfaces. Multi-column evidence fields collapse to one column, metric bands become two columns, tables retain all values, and action timing moves beneath the action. Print remains exactly Letter portrait with no preview shadow.

**The Eight-Sheet Rule.** The proof sequence stays eight sheets: cover, current GA4, prior season, landing pages, Semrush baseline, Halloween rankings, Ugly Sweater gap, and approvals.

**The Evidence Retention Rule.** Responsive adaptation may reorganize evidence but never hide a metric, ranking, source window, or action.

## Elevation & Depth

Print surfaces are flat. Depth comes from hard field changes, rules, inset coral or cobalt top bands, and cropped scale. The only ambient shadow separates physical sheets on screen; print removes it.

**The Flat Print Rule.** If a shadow survives print, it is outside the system.

## Shapes

The form language is square, ruled, and ledger-like. Tables, metric bands, evidence fields, seasonal boxes, and actions use zero radius. The verified Momentum 360 partner asset retains its 8px corner treatment. The status stamp rotates three degrees, providing the only intentional irregularity.

**The One Irregular Mark Rule.** Rotation belongs to the status stamp only; evidence alignment and field geometry remain exact.

## Components

### Seasonal Cover Monument

A cropped 237K value in light coral on ultraviolet establishes prior-season scale before explanation. It is a structural field, not a watermark.

### Brand Bar and Folio

Thin ruled navigation repeats client identity, partner mark, reporting context, and exact sheet fraction without competing with the evidence.

### Status Stamp

A two-pixel dark-coral outline, uppercase condensed label, square corners, and three-degree rotation mark source readiness on the cover.

### Metric Band

A four-column ruled strip opens the main evidence sheets. The lead cell uses ultraviolet on paper and reverses to white on dark fields; 26pt condensed values sit above compact uppercase labels.

### Analytics Table

Near-black headers, tabular right-aligned values, exact labels, quiet rules, alternating cobalt wash, and sparse blue-win cells keep GA4 and Semrush evidence scannable.

### Insight and Seasonal Fields

Near-black insight strips pair a light-coral conclusion with compact body interpretation. White seasonal boxes use inset coral or cobalt bands to separate Halloween and Ugly Sweater demand without rounded cards.

### Ranking and Gap Fields

Ultraviolet rank blocks pair oversized coral-light positions with written meaning. The Ugly Sweater comparison sets a white coral-inset gap panel beside a near-black domain snapshot.

### Decision Action Row

Each ruled row pairs an uppercase light-coral timing cue, a named approval with explanation, and a right-aligned outcome. The mobile layout keeps the same order in one column.

## Do's and Don'ts

### Do:

- **Do** preserve the bone, near-black, ultraviolet, cobalt, and surface-specific coral roles.
- **Do** keep Barlow Condensed at 500 and 800 for hierarchy and evidence, with Arial for interpretation.
- **Do** preserve the eight-sheet portrait proof sequence and every source window, metric, ranking, and action.
- **Do** use written meaning alongside color, exact tabular values, and explicit GA4 versus Semrush boundaries.
- **Do** let bands, rules, field changes, and cropped numerals create hierarchy.

### Don't:

- **Don't** turn the report into a generic dashboard, rounded card stack, or pill system.
- **Don't** use decorative gradients, print shadows, soft floating layers, or ornamental motion.
- **Don't** use dark coral on dark fields or light coral as body copy on paper.
- **Don't** substitute another display face for the supplied Barlow Condensed files.
- **Don't** collapse detailed evidence into summaries that hide exact values or source periods.
