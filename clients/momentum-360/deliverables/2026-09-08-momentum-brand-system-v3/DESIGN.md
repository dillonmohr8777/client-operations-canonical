---
name: Momentum Digital AI Field Notes v3
description: Blue and gold ceramic illustration with bold editorial type and calm white reading pages.
colors:
  navy: "#072d53"
  night: "#03172e"
  blue: "#1766ab"
  gold: "#efb928"
  paper: "#fff"
  pale: "#f0f5f9"
  ink: "#102d49"
  muted: "#52677c"
  line: "#d5e0e9"
typography:
  display:
    fontFamily: "Archivo,sans-serif"
    fontWeight: 900
    lineHeight: 1.07
    letterSpacing: "-.025em"
  headline:
    fontFamily: "Archivo,sans-serif"
    fontSize: "clamp(2.1rem,3vw,3rem)"
    fontWeight: 900
    lineHeight: 1.07
    letterSpacing: "-.025em"
  title:
    fontFamily: "Nunito,sans-serif"
    fontSize: "1.6rem"
    fontWeight: 900
    lineHeight: 1.07
    letterSpacing: "-.025em"
  body:
    fontFamily: "Nunito,sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.7
  reading:
    fontFamily: "Nunito,sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.85
  label:
    fontFamily: "Nunito,sans-serif"
    fontSize: "14px"
    fontWeight: 900
  note:
    fontFamily: "Nunito,sans-serif"
    fontSize: "13px"
rounded:
  control: "8px"
  surface: "14px"
spacing:
  compact: "8px"
  control: "12px"
  detail: "20px"
  inset: "24px"
  panel: "28px"
  grid: "32px"
  section: "60px"
components:
  button-primary:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.night}"
    rounded: "{rounded.control}"
    padding: "12px 22px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "12px 22px"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "12px"
  tab:
    backgroundColor: "{colors.pale}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "12px 20px"
  tab-selected:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    padding: "12px 20px"
  reading-tool:
    backgroundColor: "{colors.pale}"
    rounded: "{rounded.surface}"
    padding: "34px"
---

# Design System: Momentum Digital AI Field Notes v3

## Overview

**Creative North Star: "Momentum's illustrated field notes"**

The implemented world follows the user-pinned AI Search Playbook: blue and gold, bold sans headlines, and white reading pages. Ceramic Momo scenes make abstract business subjects approachable; blue engraved studies supply quieter editorial intervals. This records the completed local review artifact, not an independently approved global brand policy.

The identity belongs to Momentum Digital. Exact source wordmark and mark files remain separate from illustrative artwork. Momo wears a rendered Momentum m on his chest under the explicit user correction; that rendering is not a master logo. Earlier archival directions in PRODUCT.md are superseded by its explicit v3 replacement brief.

**Key Characteristics:**
- Midnight identity and image fields with white editorial pages.
- Heavy Archivo Black display type paired with readable Nunito Sans.
- Blue ceramic scenes, gold details, and blue engraved editorial studies.
- Finite, replayable service motion with pause and reduced-motion support.

Evidence: style.css, exercises.css, index.html, brand.html, app.js, exercises.js, PRODUCT.md and .impeccable/surfaces/library.md. Visual authority: references/playbook-1.png and references/playbook-4.png. Finish evidence: evidence/fix-book-desktop.png, evidence/fix-workbench-mobile.png, evidence/root-brand-hero.png and evidence/fix-service-during.png. The source values below describe reusable patterns; they are not a new visual redesign.

## Colors

The palette moves from saturated blue identity fields to white reading space, with warm gold identifying action and emphasis.

### Primary
- **Momentum navy** (`navy`): featured guide panels, quotations and selected controls.
- **Midnight** (`night`): identity entrance, cover and image backgrounds.
- **Action blue** (`blue`): chapter links, input carets and semantic line art.

### Secondary
- **Gold** (`gold`): primary actions, progress, focus outlines and selected-control detail.

### Neutral
- **Paper** (`paper`): page and form surfaces; reversed text on dark fields.
- **Reading field** (`pale`): tools, search, source notes and supporting panels.
- **Reading ink** (`ink`): body and control text.
- **Secondary ink** (`muted`): notes, descriptions and navigation at rest.
- **Divider** (`line`): thin panel boundaries and table rules.

**The Gold Leads Rule.** Gold marks a useful action, state or detail; it does not replace readable ink for body copy on white.

## Typography

**Display Font:** Archivo Black, registered locally as `Archivo`, with sans-serif fallback.
**Body Font:** Nunito Sans, registered locally as `Nunito`, with sans-serif fallback.

The display face is dense and decisive; the body face is open and rounded. The ramp is role-based and fluid rather than a fixed mathematical ratio. The local font aliases in the frontmatter intentionally match the actual font-face registrations.

### Hierarchy
- **Display:** heavy, tightly tracked, balanced headings. Book cover titles use `clamp(2.7rem,4.5vw,4.7rem)`; this is a cover role, not the universal heading size.
- **Headline:** fluid chapter headings, with a maximum measure of 24ch.
- **Title:** strong Nunito subheads divide long chapters without competing with Archivo headings.
- **Body / Reading:** general copy uses the body role; chapter paragraphs use the more generous reading role. Mobile chapters use 17px with 1.8 leading.
- **Label / Note:** controls use strong Nunito; secondary explanatory text is smaller and muted.

**The Still Reading Rule.** Display titles may enter once; chapter paragraphs remain still during reading.

## Layout

The shared container is capped at 1344px, with 96px total desktop outer space, 48px at the 1000px breakpoint, and 36px at 720px. The recurring rhythm uses compact control gaps, moderate panel insets and wide section separation, as recorded in the spacing tokens.

Desktop reading pairs a 270px sticky contents column with the flexible reader using a 60px gap. The reader is capped at 880px and has minimum width zero; lists cap their measure at 70ch. At 1000px, the sidebar becomes 220px and the gap 30px. At 720px, the contents become a toggled in-flow panel and covers, gallery and exercise forms become one column. Tables retain local horizontal scrolling rather than expanding the viewport.

The library uses a two-column grid and a larger opening guide. Supporting brand galleries use three columns. These are documented surface patterns, not mandatory layouts for every future page. The sticky header is 78px on desktop and 66px on mobile. Print hides navigation and tools and gives chapters page breaks; print is a static reading output.

## Elevation & Depth

Interface depth comes from dark-to-light fields, borders and image composition. Ceramic highlights and shadows belong to the raster artwork. Interface panels do not use ambient drop shadows. Selected tabs and diagram steps carry an inset gold bottom rule (`inset 0 -3px 0 var(--gold)`), a state marker rather than card elevation.

**The Material Separation Rule.** Keep ceramic depth in the artwork and reading surfaces visually flat.

## Shapes

Controls use modest rounded corners; larger image and tool surfaces use the broader surface radius. Thin divider lines structure cards, chapters and tables. Images repeat a 3:2 frame, with square service imagery. Cover and gallery containment preserve the complete illustration, including the Momo chest emblem; imagery must retain its original proportions.

## Components

### Buttons
Gold primary buttons use dark text, strong body type and a compact rectangular form. Secondary actions are transparent with a divider border and reading ink. Primary hover lightens to `#ffcf54` and lifts by 2px over 0.2 seconds. The shared source applies this hover background to secondary actions too. Keyboard focus on buttons and links is a 3px gold outline with 5px offset. Disabled buttons show reduced opacity and a not-allowed cursor.

### Inputs / Fields
Exercise inputs, selects and textareas use white surfaces, thin divider borders, the control radius and 16px Nunito with 1.5 leading. Search fields use the pale surface and a leading inline SVG. Labels sit above fields. Browser-native required validation and explicit textual status messages communicate missing inputs and storage failures. The stylesheet gives custom gold focus to inputs; selects and textareas retain native focus behavior.

### Navigation
The midnight header carries the exact logo, plain text links and an outlined pill-shaped motion toggle. The centered identity entrance yields to a smaller header identity after leaving the viewport. Contents links receive pale fill and stronger weight when active; the final stylesheet removes the earlier left border. On mobile, the contents toggle exposes the same navigation in the document flow.

### Tabs and step selectors
Pale rounded buttons become navy with white text when selected, using `aria-pressed` and an inset gold state rule. Categories replace the gallery contents. Step selectors replace explanatory text. These are controls, not decorative chips.

### Cards / Containers
Library cards use editorial image-and-copy pairs separated by a lower rule. The first card is a dark featured composition. Gallery figures and reader tools use the pale surface and broader radius. Hover image enlargement is slight and finite; it does not move reading text. Source disclosures and search results stay visually subordinate to the chapter hierarchy.

### Illustrations and service motion
The collection contains six Momo scenes, six ceramic service illustrations and three blue engraved studies. The two exact logo masters are preserved separately. Every raster's provenance belongs in the existing asset manifests.

Six inline SVG studies express search, response, build, operations, audience and proof. Replay triggers a finite 3.6-second sequence; assembly layers are staggered. The response illustration also rocks gently. Identity and title transitions use 0.8 seconds with the recorded custom easing. Global pause removes animation and transition; reduced-motion preferences also disable smooth scrolling.

### Reading exercises
Five book-specific tools reuse the same labelled form, action row, output and status pattern: visibility log, lead-intake test report, creative release review, workflow brief and lead reconciliation. They retain user-entered work locally and offer downloads. Empty, saved and unavailable-storage states are textual. Local evidence entry is visually and verbally distinct from a completed external integration or published result.

## Do's and Don'ts

### Do:
- **Do** retain exact source logo files and their proportions.
- **Do** select a Momo or service illustration that matches the subject and preserves the visible chest emblem.
- **Do** keep reading copy on calm surfaces with generous leading.
- **Do** provide replay, pause and reduced-motion behavior for the existing motion family.
- **Do** keep source notes and local exercise status close to the material they explain.

### Don't:
- **Don't** promote the rendered Momo chest insignia into an official master logo.
- **Don't** blend Momentum Digital identity with a separate Momentum 360 identity.
- **Don't** replace the user-pinned blue/gold world with the superseded archival direction.
- **Don't** present decorative illustrations as evidence of client results.
- **Don't** imply that a local exercise performs external calls, publishes an asset or verifies CRM records.

Book metadata follows the title and summary as supporting information; it is not a pre-title eyebrow. One-off ornamental and demonstration values are excluded from the portable scale.
