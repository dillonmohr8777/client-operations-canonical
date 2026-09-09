---
name: M360 Orbit Deep
description: A premium orbital marketing command center that turns one business job into one owned next move.
colors:
  ink: "#09152b"
  navy-950: "#041027"
  navy-900: "#071632"
  navy-800: "#0b2147"
  navy-700: "#143564"
  signal-blue: "#2f82ff"
  signal-blue-soft: "#72b7ff"
  signal-cyan: "#7be7ff"
  decision-gold: "#f2b63d"
  decision-gold-deep: "#a86800"
  paper: "#f4f7fb"
  white: "#ffffff"
  slate: "#53627a"
  line: "#d8e0eb"
  success: "#48d597"
  danger: "#ff7d7d"
typography:
  display:
    fontFamily: "Space Grotesk, Segoe UI, sans-serif"
    fontSize: "clamp(4.2rem, 7.1vw, 7.6rem)"
    fontWeight: 700
    lineHeight: 0.87
    letterSpacing: "-0.065em"
  body:
    fontFamily: "DM Sans, Segoe UI, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Space Grotesk, Segoe UI, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.19em"
rounded:
  control: "8px"
  sm: "10px"
  surface: "18px"
  command: "30px"
  pill: "999px"
components:
  button-primary:
    backgroundColor: "{colors.decision-gold}"
    textColor: "{colors.navy-950}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "13px 21px"
    height: "52px"
  button-primary-hover:
    backgroundColor: "#ffc954"
    textColor: "{colors.navy-950}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "13px 21px"
    height: "52px"
  button-ghost:
    backgroundColor: "rgba(255,255,255,0.035)"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "13px 21px"
    height: "52px"
  field-dark:
    backgroundColor: "{colors.navy-800}"
    textColor: "{colors.white}"
    rounded: "{rounded.sm}"
    padding: "0 14px"
    height: "50px"
  filter-chip:
    backgroundColor: "transparent"
    textColor: "#93a6c3"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "10px 15px"
---

# Design System: M360 Orbit Deep

## Overview

**Creative North Star: "The Orbital Operations Room"**

M360 Orbit Deep is a premium marketing command center: precise enough for an operator and clear enough for a local-business owner. The interface should feel like a trusted routing system rather than a generic chat product. Deep navy is the operational canvas, gold identifies decisions and actions, cyan identifies live signal and system state, and white or paper surfaces provide moments of explanatory relief.

The orbital network is the signature visual metaphor. Rings, plotted nodes, restrained glow, fine grid lines, monograms, status labels, and evidence-aware state changes make specialist coordination visible without turning the page into science-fiction decoration. Composition remains outcome-led: the visitor sees the promise, the command surface, the pipeline sequence, the specialist roster, and the human handoff in that order.

**Key Characteristics:**

- Operator-grade navy surfaces with sharply controlled gold and cyan accents.
- One primary command surface, supported by structured proof and ownership.
- Orbital geometry used to explain routing, coordination, and system state.
- Concrete language, visible evidence state, and explicit human approval boundaries.
- Restrained motion that never blocks reading, input, or keyboard use.

## Colors

The palette uses navy for authority, gold for decisions, cyan and blue for system signal, and paper neutrals for legible explanatory sections.

### Primary

- **Decision Gold:** The scarce action color for primary buttons, selected controls, key labels, and decision points. Do not use it as general decoration.
- **Deep Command Navy:** The dominant product canvas for the hero, command surface, roster, footer, and other operator-facing regions.

### Secondary

- **Signal Blue:** The active-system accent for rings, focus support, illuminated nodes, and controlled depth.
- **Signal Cyan:** The clearest keyboard-focus and live-signal color. It must remain visually distinct from gold actions.

### Neutral

- **Ink:** Default text on light surfaces.
- **Paper:** Default light-section background.
- **White:** High-contrast text on navy and clean card surfaces.
- **Slate:** Secondary copy on light surfaces.
- **Line:** Dividers and structural borders on light surfaces.

### Status

- **Success Green:** Verified live, saved, or successful states only.
- **Danger Coral:** Error and interrupted-signal states only. Never use it for emphasis unrelated to an error.

### Named Rules

**The Three-Signal Rule.** Navy establishes context, gold tells the user where to decide, and cyan tells the user what is active or live. Do not interchange those roles.

**The Scarce Gold Rule.** Gold earns attention through rarity. Reserve it for actions, ownership markers, and decision-bearing labels.

## Typography

**Display Font:** Space Grotesk, with Segoe UI and sans-serif fallbacks  
**Body Font:** DM Sans, with Segoe UI and sans-serif fallbacks

**Character:** Space Grotesk gives headings, callsigns, and controls a precise operational voice. DM Sans keeps long explanations, form copy, and answer content calm and readable.

### Hierarchy

- **Hero Display:** Bold, tightly tracked, and optically compact. The incumbent desktop hero uses the display token; mobile resolves to `clamp(2.85rem, 13vw, 3.55rem)` with a `0.92` line height.
- **Section Headline:** Space Grotesk at a responsive `clamp(2.4rem, 5vw, 4.9rem)` with a compact `0.98` line height.
- **Component Title:** Space Grotesk at approximately `1.05rem` to `1.5rem`, usually semibold or bold.
- **Body:** DM Sans at `17px` and `1.6` line height. Supporting copy can step down, but must retain contrast and comfortable measure.
- **Label:** Space Grotesk, bold, uppercase where the content is genuinely a system label, with expanded tracking. Do not apply this voice to paragraphs.

### Named Rules

**The Callsign Rule.** Uppercase and wide tracking belong to agent names, system labels, and compact controls; normal prose stays sentence case in DM Sans.

**The One Hero Exception.** The hero's `7.6rem` ceiling and `-0.065em` tracking are a deliberate incumbent optical lockup outside the generic detector floor. They are permitted only for this exact two-line hero treatment and must not become a reusable headline default.

## Layout

The core shell is capped at `1180px` with `20px` minimum side gutters. Desktop layouts use asymmetric two-column compositions so the command or visual system carries more weight than supporting copy. Major sections use generous vertical separation, while related controls remain tightly grouped inside their surface.

- **Above 1050px:** Full two-column hero and command layouts, four-column roster and plan grids where defined.
- **1050px and below:** Hero visual narrows, the command columns rebalance, the roster moves to three columns, and plans move to two.
- **820px and below:** Navigation becomes a controlled mobile menu; hero and command layouts stack; proof, difference, ROI, and FAQ layouts become one column; the roster moves to two columns.
- **560px and below:** Side gutters reduce to `12px`; the hero actions and metrics retain equal-width compact columns; form fields, cards, roster, pricing, and footer become single-column; horizontal squad filters remain scrollable rather than wrapping into a tall control wall.

Mobile must preserve the same product hierarchy: promise, command, ownership, evidence state, and handoff. Decorative signal content may simplify—the third orbit signal card is intentionally removed at the smallest breakpoint—but primary proof and specialist ownership must not disappear. No surface may create horizontal page overflow at `320px`.

**The Command-First Rule.** The command surface remains the primary interactive object at every breakpoint. Responsive changes may stack it, but never demote it behind decorative content.

**The Pipeline-Sequence Exception.** Numbered section labels and `01 / ASK`-style eyebrows are deliberate detector exceptions because the sequence communicates the job's progression through routing, system proof, roster, economics, plan, and handoff. New labels must identify a real stage; do not use them as ornamental kickers.

## Elevation & Depth

Depth is hybrid and restrained. Navy surfaces separate through tonal layering and fine borders; only the command frame, active header, featured plan, hoverable specialist cards, and a few signature orbit elements receive shadows. The canonical command shadow is `0 30px 80px rgba(4, 16, 39, .18)`. Glows indicate signal or orbital energy, not generic elevation.

### Shadow Vocabulary

- **Command Lift:** A broad, soft shadow for the primary command frame and mobile navigation.
- **Active Header:** A shallow `0 12px 32px rgba(0, 0, 0, .12)` shadow after scroll.
- **Interactive Card Lift:** Specialist cards translate upward and gain a soft `0 22px 48px rgba(0, 0, 0, .25)` shadow on hover.
- **Signal Glow:** Colored halos belong only to live dots, orbit nodes, the brand mark, and the orbit core.

**The Signal-Is-Not-Elevation Rule.** A cyan or blue halo communicates an active system object. Standard cards use tonal separation, border, or a neutral offset shadow.

**The Orbital Atmosphere Exception.** The low-opacity grid, fixed noise layer, ring halos, and localized blur are incumbent brand materials tied to the routing metaphor. They are deliberate detector exceptions, not a license for generic textured backgrounds, decorative glass cards, or blur elsewhere.

## Shapes

The system combines controlled rectangular surfaces with circular orbital geometry. Standard controls use `8px` to `10px` corners, content cards use approximately `15px` to `18px`, and the command frame alone expands to `30px`. Circles represent nodes, status, brand marks, and orbital paths. Full pills are reserved for compact filters, status tags, and the single navigation call to action.

Borders are usually one pixel and low contrast. Large cards should not stack a prominent border and a strong shadow unless the incumbent component already uses that combination for hierarchy.

**The Two-Geometry Rule.** Rectangles hold work; circles explain routing and state. Do not introduce unrelated silhouettes.

## Components

### Header and Navigation

- **Default:** Transparent over the hero with white typography.
- **Scrolled:** Deep navy at `0.91` opacity, a subtle bottom border, soft shadow, and localized backdrop blur.
- **Link states:** Default links are muted white; hover resolves to white. The compact navigation CTA uses a gold border and becomes solid gold on hover.
- **Mobile:** A `44px` menu button exposes `aria-expanded`; the menu closes on selection or Escape and restores focus to the trigger.

### Buttons

- **Shape:** Compact rounded rectangle with an `8px` radius and at least `52px` height for canonical actions.
- **Primary:** Decision Gold on Deep Command Navy text with a soft gold-tinted lift.
- **Ghost:** Translucent white on navy, or a line-colored border on light surfaces.
- **Hover:** A restrained `-2px` lift plus a clearer background or border shift.
- **Focus:** The global cyan `3px` focus-visible outline with `4px` offset must remain visible on both light and dark surfaces.
- **Disabled / Loading:** Preserve the button label, suppress repeated submission, and expose the adjacent live loading state. Disabled controls must remain recognizably unavailable without relying on opacity alone.

### Fields

- **Style:** Navy input surface, one-pixel blue-navy border, `10px` radius, and white text.
- **Focus:** Blue-soft border plus a three-pixel blue focus halo; the global focus-visible outline remains the keyboard contract.
- **Labels:** Persistent visible labels; placeholders are examples, never replacements for labels.
- **Error:** Error copy must name the interrupted action and provide a recovery control.

### Command Frame

The signature work surface uses the `30px` command radius, a fine blue border, deep navy background, and Command Lift shadow. Its top bar supplies system context; its body moves between mutually exclusive input, loading, answer, and error states without changing the page's conceptual location.

- **Loading:** A polite live region announces routing while the form is hidden and repeat submission is disabled.
- **Answer:** Primary specialist, role, squad, optional collaborators, evidence sources, and the human handoff remain visibly grouped.
- **Success:** Save status is announced through a polite live region and uses Success Green.
- **Error:** The assertive live region uses Danger Coral and includes a visible retry action.
- **Empty:** Before submission, the form and example prompts are the intentional empty state; do not invent placeholder results or metrics.

### Filter Chips

Squad filters are compact pills because they are bounded selection controls. Unselected chips use a navy border and muted blue-gray text; the selected and hover states use Decision Gold with Deep Command Navy text. Selection must be conveyed by `aria-pressed` as well as color.

### Cards and Containers

Specialist cards use a dark tonal gradient, fine blue border, `15px` corners, one monogram or callsign hierarchy, and a single action at the bottom. Plan cards use paper or navy surfaces and `18px` corners. New cards should not become generic icon-heading-copy tiles; each must expose ownership, evidence, decision, or plan structure.

### Orbital Network

The orbit stage is a signature system diagram, not a decorative illustration. Circular rings and nodes visualize specialist routing, while small signal cards reveal named outputs. Continuous orbit motion is slow and nonessential; all animation collapses under reduced-motion preferences.

### Accessibility and State Contract

- Preserve semantic headings, explicit form labels, the skip link, and keyboard-operable native controls.
- Maintain a visible `:focus-visible` treatment on every interactive element.
- Do not encode selected, live, success, or error state by color alone; pair color with text, position, `aria-pressed`, `aria-expanded`, or live-region semantics.
- Decorative grids, rings, noise, and arrows remain hidden from assistive technology.
- Respect `prefers-reduced-motion: reduce`: smooth scrolling stops, reveal content is immediately visible, and animations and transitions collapse to near-zero duration.
- Keep target sizes practical on touch screens; the menu trigger is `44px`, canonical action buttons are at least `52px`, and compact text actions must retain adequate clickable padding.

## Do's and Don'ts

### Do:

- **Do** preserve the incumbent Momentum 360 navy, gold, cyan, white, Space Grotesk, and DM Sans system.
- **Do** make primary ownership, collaborators, evidence state, approval boundaries, and one measurable next move scannable.
- **Do** use gold for decisions and cyan for system signal or keyboard focus.
- **Do** keep loading, answer, save-success, fallback, error, disabled, selected, and mobile-menu states explicit.
- **Do** simplify decorative orbit content on small screens before removing product proof or command context.
- **Do** treat the current orbital grid, subtle noise, signal blur, section sequencing, and hero lockup as narrow incumbent exceptions that require the rationale recorded above.

### Don't:

- **Don't** invent live-research claims, customer facts, performance metrics, prices, or case-study results.
- **Don't** turn gold into a general highlight color or cyan into a primary CTA color.
- **Don't** add decorative pills above hero headlines, generic glass cards, gradient text, or floating card clutter.
- **Don't** reuse the hero's oversized type or extra-tight tracking outside the exact incumbent hero lockup.
- **Don't** add ornamental section numbers or eyebrow labels where no real sequence exists.
- **Don't** extend the low-opacity noise, grid, Unicode indicator, or backdrop-blur exceptions into a general illustration or icon system. New icons should use consistent authored SVG geometry.
- **Don't** collapse keyboard focus, reduced-motion behavior, live-region announcements, or human approval gates during visual refinement.
