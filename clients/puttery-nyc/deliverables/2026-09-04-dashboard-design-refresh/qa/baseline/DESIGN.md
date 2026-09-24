---
name: "Puttery NYC Attribution Pilot Control"
description: "A Puttery course-marshal workspace that makes attribution readiness, evidence gaps, and revenue truth playable and explicit."
colors:
  black: "#010000"
  black-soft: "#171515"
  ink: "#171717"
  white: "#ffffff"
  off-white: "#f5f5f2"
  line: "#d9d9d4"
  muted: "#656565"
  pink: "#e63e62"
  pink-dark: "#b52246"
  pink-pale: "#fde9ee"
  teal: "#00bfb2"
  teal-dark: "#006a63"
  teal-pale: "#def8f5"
  green: "#54bd4c"
  green-dark: "#247b27"
  orange: "#fb9637"
  yellow: "#ffe259"
  danger: "#b5283f"
typography:
  display:
    fontFamily: "Fugaz One, sans-serif"
    fontSize: "clamp(2.65rem, 5vw, 5.4rem)"
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Fugaz One, sans-serif"
    fontSize: "clamp(2rem, 3.4vw, 3.7rem)"
    fontWeight: 400
    lineHeight: 1.04
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Manrope, Segoe UI, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 800
    lineHeight: 1.28
    letterSpacing: "normal"
  body:
    fontFamily: "Manrope, Segoe UI, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  label:
    fontFamily: "Manrope, Segoe UI, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "0.08em"
rounded:
  square: "0px"
  pill: "999px"
  circle: "50%"
spacing:
  micro: "4px"
  compact: "8px"
  control: "12px"
  card: "20px"
  mobile-section: "44px"
  section: "clamp(54px, 6vw, 86px)"
components:
  action-primary:
    backgroundColor: "{colors.pink}"
    textColor: "{colors.black}"
    rounded: "{rounded.pill}"
    padding: "10px 18px"
    height: "44px"
  action-primary-hover:
    backgroundColor: "{colors.pink-dark}"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
    padding: "10px 18px"
    height: "44px"
  action-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
    padding: "10px 18px"
    height: "44px"
  rail-link:
    backgroundColor: "transparent"
    textColor: "{colors.white}"
    rounded: "{rounded.square}"
    padding: "12px 13px"
  rail-link-active:
    backgroundColor: "{colors.teal}"
    textColor: "{colors.black}"
    rounded: "{rounded.square}"
    padding: "12px 13px"
  discovery-field:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    rounded: "{rounded.square}"
    padding: "10px 12px"
    height: "46px"
  question-accordion:
    backgroundColor: "{colors.black}"
    textColor: "{colors.white}"
    rounded: "{rounded.square}"
    padding: "17px 58px 17px 20px"
    height: "70px"
  readiness-scorecard:
    backgroundColor: "{colors.white}"
    textColor: "{colors.black}"
    rounded: "{rounded.square}"
    padding: "26px"
  mobile-scorecard:
    backgroundColor: "{colors.white}"
    textColor: "{colors.black}"
    rounded: "{rounded.square}"
    padding: "13px 14px"
---

# Design System: Puttery NYC Attribution Pilot Control

## Overview

**Creative North Star: "The Course Marshal Board"**

The interface turns an uncertain attribution project into a playable operating route. Puttery's exact white wordmark anchors a black field; hot pink announces action and unresolved gates; teal marks verification and progress; crisp score lines make each source, question, and financial definition inspectable. The result feels like a modern course-marshal tee sheet translated into a working discovery dashboard, not a generic executive KPI wall.

This is an Operate surface. Brand expression stays concentrated in the official wordmark, Fugaz One headings, black-and-white contrast, Puttery accent colors, angular scorecard cuts, and decisive rules. Manrope carries the dense source and evidence language. The interface remains explicit about certainty: no live Puttery account, guest, reservation, advertising, or payment data is connected, and modeled figures never masquerade as verified performance.

**Key Characteristics:**

- Official white Puttery wordmark on black, used without alteration.
- Fugaz One for branded display hierarchy and Manrope for all operational reading.
- Black, white, and off-white fields with hot-pink action, teal verification, green readiness, orange review states, and yellow focus.
- Square analytical modules and inputs, pill-shaped actions, circular route markers, and clipped scorecard corners.
- Question-led disclosure through platform accordions, evidence notes, text statuses, and a persistent modeled-data boundary.
- A compact mobile scorecard keeps discovery readiness and the current gate in the first viewport.

## Colors

The palette is the implemented Puttery evidence set: hard black-and-white contrast, a restrained warm neutral field, and bright functional accents whose meaning stays stable across the dashboard.

### Primary

- **Puttery Black** (`black`): Primary brand field, discovery-lab canvas, table headers, reconciliation ladder, and route geometry.
- **Puttery Hot Pink** (`pink`): Primary actions, the modeled-data strip, open blockers, the final ownership section, and unresolved progress state.
- **Puttery Teal** (`teal`): Active navigation, verified-route surfaces, readiness progress, platform accordion controls, and commercial boundary.

### Secondary

- **Readiness Green** (`green`): Ready status dots and acceptance checks.
- **Review Orange** (`orange`): Needs-verification states and non-applicable answer state.
- **Focus Yellow** (`yellow`): Keyboard focus outlines and the no-script notice only.
- **Danger Crimson** (`danger`): Contract-gated or blocked platform language where darker contrast is needed.

### Tertiary

- **Deep Action Pink** (`pink-dark`): Primary-action hover, high-contrast pink text on pale fields, and outcome labels.
- **Pale Pink Field** (`pink-pale`): Portfolio-expansion callouts that need pink context without a full alert field.
- **Deep Verification Teal** (`teal-dark`): Supporting route copy on the pale teal evidence field.
- **Pale Teal Field** (`teal-pale`): Evidence-route section background.
- **Deep Readiness Green** (`green-dark`): Readable ready-state labels on light surfaces.

### Neutral

- **Soft Black** (`black-soft`): Sticky desktop section rail.
- **Operational Ink** (`ink`): Primary text and dark field-control surfaces.
- **White** (`white`): Main content panels, wordmark paths, dark-field text, and scorecards.
- **Warm Off-White** (`off-white`): Page background and alternating light sections.
- **Score Line** (`line`): Dividers, table rules, and scorecard separators.
- **Muted Copy** (`muted`): Supporting explanations and metadata on light surfaces.

### Named Rules

**The Accent Has a Job Rule.** Pink means action or an unresolved gate; teal means route, verification, or current progress; green means ready; orange means verify; yellow means keyboard focus. Do not swap these roles for variety.

**The Status Is Written Rule.** Color never carries readiness alone. Every ready, verify, gated, modeled, or blocked state retains visible text and, where implemented, a border or dot.

**The Modeled Boundary Rule.** The hot-pink disclosure remains persistent and visually distinct from every metric surface.

## Typography

**Display Font:** Fugaz One (with sans-serif fallback)  
**Body Font:** Manrope (with Segoe UI and sans-serif fallback)  
**Label Font:** Manrope

**Character:** Fugaz One supplies the unmistakable Puttery voice: bold, forward-moving, and naturally expressive without requiring decorative effects. Manrope provides calm, compact legibility for dense integration details, financial definitions, form controls, and evidence requirements.

### Hierarchy

- **Display** (400, `clamp(2.65rem, 5vw, 5.4rem)`, 0.98): The single first-view promise; mobile resolves to `clamp(2.35rem, 11vw, 3.15rem)`.
- **Headline** (400, `clamp(2rem, 3.4vw, 3.7rem)`, 1.04): Major section titles and the final next-action statement.
- **Branded Title** (400, 1.2rem-1.55rem): Platform names, accordion group names, score values, and commercial totals in Fugaz One.
- **Operational Title** (800, 1.05rem-1.25rem, 1.28-1.35): Question prompts, phase headings, decisions, and strong supporting hierarchy in Manrope.
- **Body** (400, 15px, 1.55): Default explanations and operating copy; supporting passages stay near 68-74 characters wide where the layout permits.
- **Label** (800, 0.72rem, 0.08em): Uppercase venue lines, statuses, metric captions, question metadata, and compact controls.

### Named Rules

**The Fugaz Is the Voice Rule.** Use Fugaz One for branded statements, section hierarchy, progress values, platform names, and signature numbers. Do not use it for paragraphs, form labels, evidence notes, or table copy.

**The Dense Work Stays Manrope Rule.** Operational content uses Manrope at readable line height; density comes from grids and rules, not compressed letterforms or tiny body copy.

## Layout

The desktop shell is capped at 1540px and pairs a 248px sticky section rail with a fluid content column. At 1220px the rail narrows to 218px, the hero becomes one column, six score metrics become a 3-by-2 board, and the four-phase track becomes two columns. Section padding is `clamp(54px, 6vw, 86px)` vertically with fluid horizontal padding up to 78px.

At 980px, the shell becomes a single column. The black section rail converts into a horizontally scrollable sticky navigator beneath the persistent truth strip; integration cards become one column; question answer controls move beneath their question; and revenue reconciliation stacks. At 720px, sections use 44px by 20px padding, evidence routes and all discovery controls become one column, the score metrics become a 2-column board, platform accordions retain grouped disclosure, and the financial definition table scrolls inside its labeled region.

The mobile first viewport adds a compact scorecard above the hero title. It shows discovery percentage, current gate, and a thin progress track without duplicating the full desktop scorecard's detail. The desktop scorecard remains later in story order on mobile. The document itself must never gain horizontal overflow.

### Named Rules

**The Route Survives Collapse Rule.** Responsive layout may stack the route, integrations, questions, and reconciliation, but it never removes status language, source names, gate ownership, or evidence requirements.

**The Rail Becomes a Tee Strip Rule.** Below 980px, navigation changes orientation rather than disappearing; the active teal section remains visible and keyboard reachable.

## Elevation & Depth

The system is flat by default. Black, off-white, pale accent fields, solid rules, and clipped geometry create almost all depth. One restrained neutral shadow is reserved for the white discovery scorecard and transient feedback message; it must not spread to metric cells, integration rows, question groups, or every container.

### Shadow Vocabulary

- **Neutral Score Lift** (`0 18px 55px rgba(1, 0, 0, 0.14)`): Raises the readiness scorecard above the black hero and keeps transient feedback legible above the page.

### Named Rules

**The One Neutral Shadow Rule.** Use the existing neutral score lift only where a white status surface must sit above a black field. Structural modules use borders and background contrast instead.

## Shapes

Analytical structure is square. Inputs, select controls, navigation items, integration cards, accordions, financial tables, and metric cells use a 0px radius. Primary and secondary actions use a true 999px pill because they represent deliberate actions rather than data containers. Route markers, status dots, and numbered confidence steps are true circles.

The desktop readiness scorecard is not rounded: two 20px corners are cut with a polygon clip, creating angular sports-scoreboard geometry. Directional route joints use 45-degree black squares. These clipped and pointed details are signature shapes; do not substitute soft rounded cards.

### Named Rules

**The Square Data, Pill Action Rule.** Information is rectilinear; actions are pills. Circles are reserved for sequence and status markers.

## Components

### Official Puttery Wordmark

- **Asset:** Use `assets/puttery-logo.svg`, sourced from Puttery's official site. Its white path data, 163 by 40 viewBox, and aspect ratio are authoritative.
- **Placement:** Display at 163px by 40px in the desktop black top bar and 139px wide with automatic height below 720px.
- **Treatment:** Preserve the exact white paths. Do not redraw, recolor, crop, distort, outline, add effects, or substitute a typed wordmark.
- **Evidence:** The retrieved source returned `image/svg+xml`; the preserved file SHA-256 is `F7F683B525B6E2FBE3C8EECE9965B59412A65EB6BE3A845857569F7C28AE5E64`.

### Buttons

- **Shape:** Pill silhouette (999px radius), 44px minimum height, 10px by 18px padding, 2px current-color border, and 800 Manrope text.
- **Primary:** Black text on hot pink; hover becomes white on deep pink and lifts by 2px.
- **Secondary:** White text on a transparent black field with a translucent white border; hover reverses to black on white.
- **Focus:** Every link, button, select, and input uses a 3px Focus Yellow outline with a 3px offset.
- **Motion:** Hover changes use 170ms ease-out and are removed under reduced-motion preferences.

### Section Navigation

The desktop rail uses square links with 12px by 13px padding. Inactive links are white on Soft Black; the active link becomes black on teal, including its supporting label. At 980px the same links form a sticky horizontal strip with a 150px minimum width, then 124px and centered text below 720px.

### Readiness Scorecards

The desktop scorecard is a clipped white panel with a large hot-pink Fugaz One percentage, a teal progress fill, a 2-by-2 definition grid, and the sole neutral shadow. The mobile scorecard is a separate compact presentation: a square white panel with a 7px teal left rule, two columns for Discovery and Current gate, and a 5px hot-pink progress track. Both read from the same state and remain text-complete at 0%.

### Metric Scorecard

Six modeled measures sit in one square, 2px black frame. Each cell uses black rules, Fugaz One values, muted labels, and a visible `Modeled` source line. It becomes 3 columns at 1220px and 2 columns below 720px. Never turn these cells into independent floating cards.

### Integration Rows and Status Tags

Integration content is structured as ruled rows, not cards. Platform names use Fugaz One; status tags are small square outlines with uppercase text. Ready is green, verify is orange, and gated is pink/danger. Each row names the documented route, unknowns, fallback, and discovery progress before offering a pink text link to its questions.

### Discovery Fields

Filters use square, 46px-high dark fields with a 1px gray border and 10px by 12px padding. Question answer controls use the same square language at 42px minimum height. Answer state changes the border and text together: green for yes, pink for no, and orange for not applicable.

### Question Accordions

Platform groups are native `details` accordions on the black discovery field. A closed group shows the Fugaz One platform name, resolved count, open blocker count, and teal plus sign. Opening changes the header field, adds a separating rule, and changes the sign to a minus. Every question retains its number, platform, owner, blocker or expansion label, prompt, rationale, required evidence, answer, and evidence note. On mobile, each question becomes a single-column form rather than reducing the question set.

### Modeled-Data Truth Strip

The hot-pink strip directly below the header states that the dashboard uses modeled demonstration data and that no live Puttery data is connected. It becomes sticky at 980px and remains text-complete on mobile. This disclosure is part of the product's trust model, not a dismissible notice.

## Do's and Don'ts

### Do:

- **Do** use the exact official white Puttery SVG on black and preserve its 163:40 aspect ratio.
- **Do** use Fugaz One for the brand voice and Manrope for operational reading.
- **Do** keep pink, teal, green, orange, and yellow tied to their documented jobs.
- **Do** keep analytical modules square, actions pill-shaped, and route/status markers circular.
- **Do** preserve the mobile scorecard, sticky mobile navigation, question accordions, visible focus, and reduced-motion behavior.
- **Do** keep modeled, verified, source, access, and blocked states explicit in text.
- **Do** state that public documentation confirms possible routes, not Puttery account entitlement or payload availability.

### Don't:

- **Don't** redraw, recolor, crop, distort, or type-set the Puttery wordmark.
- **Don't** replace the course-marshal operating board with a generic wall of rounded KPI cards.
- **Don't** add shadows to routine rows, cells, controls, or accordions.
- **Don't** present modeled figures or saved browser answers as live Puttery performance or verified source access.
- **Don't** add Tock booked value, Tripleseat event value, deposits, and Toast net sales into one revenue total.
- **Don't** treat Resy or Eventbrite as Puttery pilot dependencies; they are portfolio-expansion lanes.
- **Don't** imply Puttery brand approval, production integration approval, legal consent, or platform access that the evidence does not establish.
