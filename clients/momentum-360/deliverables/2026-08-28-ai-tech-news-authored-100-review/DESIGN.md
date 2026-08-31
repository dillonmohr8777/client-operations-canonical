---
name: Momentum 360 Best 25 Private Review
description: A site-first review deck for twenty five call-ready prospect concepts on one private URL.
colors:
  paper: "#f3f0e8"
  ink: "#11120f"
  muted: "#66685f"
  line: "#c8c5ba"
  signal-lime: "#b9ff66"
  row-hover: "#e7e3d7"
  qa-green: "#d9f6b5"
  focus-green: "#477c00"
  mail-hold: "#f3d98b"
  preview-white: "#ffffff"
  ink-muted: "#c7c8c0"
  control-line: "#777a70"
  stage-line: "#3a3b36"
typography:
  display:
    fontFamily: 'Georgia, "Times New Roman", serif'
    fontSize: "2rem"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "-0.035em"
  headline:
    fontFamily: 'Georgia, "Times New Roman", serif'
    fontSize: "1.55rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.03em"
  title:
    fontFamily: 'Georgia, "Times New Roman", serif'
    fontSize: "clamp(1.2rem, 2vw, 1.85rem)"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  body:
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "normal"
  label:
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "0.64rem"
    fontWeight: 800
    lineHeight: 1.45
    letterSpacing: "0.05em"
rounded:
  square: "0"
spacing:
  micro: "8px"
  compact: "12px"
  row: "18px"
  cluster: "24px"
components:
  deck-bar:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.square}"
    padding: "0 clamp(14px, 2vw, 28px)"
    height: "72px"
  filmstrip-chip:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "0"
    height: "48px"
    width: "48px"
  filmstrip-chip-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.signal-lime}"
    rounded: "{rounded.square}"
    padding: "0"
    height: "48px"
    width: "48px"
  search-field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.square}"
    padding: "10px 0"
    width: "100%"
  search-clear:
    backgroundColor: "{colors.row-hover}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "6px 9px"
    height: "32px"
  jump-select:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "7px 30px 7px 9px"
    height: "38px"
    width: "100%"
  cohort-tab:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "8px 6px"
    height: "40px"
  cohort-tab-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.square}"
    padding: "8px 6px"
    height: "40px"
  stage-action:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.square}"
    padding: "8px 12px"
    height: "44px"
  stage-action-primary:
    backgroundColor: "{colors.signal-lime}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "8px 12px"
    height: "44px"
  status-ready:
    backgroundColor: "{colors.qa-green}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "5px 7px"
  status-hold:
    backgroundColor: "{colors.mail-hold}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "5px 7px"
  status-scope:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "5px 7px"
---

# Design System: Momentum 360 Best 25 Private Review

## Overview

**Creative North Star: "The Editorial Review Ledger"**

This is a private inspection deck, not a campaign page and not a scrolling directory. The live concept occupies the working viewport. A compact ink command bar names the current prospect. A paper filmstrip keeps all twenty five ranks in reach through horizontal motion only. Search, jump, and cohort filters wait in a Find drawer until they are needed.

The world remains warm, flat, and decisive. Georgia supplies editorial orientation; the sans-serif layer carries ranking, state, contact, and navigation. Paper and ink define the chrome, fine rules divide the workspace, and lime, green, and amber appear only as signals.

**Key Characteristics:**

- Site-first topology: command bar, live stage, horizontal filmstrip. The page does not scroll vertically.
- Editorial Georgia titles paired with a dense sans-serif operating layer.
- Explicit search clearing, a native prospect jump, and counted cohort tabs inside Find.
- Numbered square filmstrip chips instead of a tall prospect directory.
- Square controls, flat surfaces, and tonal or planar state changes rather than elevation.
- Rare lime action signals, quiet green readiness states, and explicit amber mail hold.
- The same topology on desktop and phone. Find is a paper dialog, not a second scrolling page.

## Colors

The palette is a warm neutral ledger with narrow green, lime, and amber state channels.

### Primary

- **Signal Lime** (`#b9ff66`): identifies Momentum 360 context, current rank, loading state, keyboard focus on dark controls, and the primary full-demo action.

### Secondary

- **QA Green** (`#d9f6b5`): marks call-ready states without overpowering business identity.
- **Focus Green** (`#477c00`): makes search and light-surface control focus visible.
- **Mail Hold Amber** (`#f3d98b`): keeps the no-mail boundary explicit in the review status cluster.

### Neutral

- **Warm Paper** (`#f3f0e8`): filmstrip, Find drawer, and light control surface.
- **Ledger Ink** (`#11120f`): command bar, selected chips, and primary text.
- **Muted Olive Gray** (`#66685f`): counts, metadata, and placeholders.
- **Warm Divider** (`#c8c5ba`): filmstrip and Find rules.
- **Tonal Row Hover** (`#e7e3d7`): hover and keyboard-focus field on light controls.
- **Ink Muted** (`#c7c8c0`): notes and selected-row metadata.
- **Control Line** (`#777a70`): outlines and separators for dark-stage controls.
- **Stage Line** (`#3a3b36`): quiet horizontal rules inside the preview stage.
- **Preview White** (`#ffffff`): the neutral iframe canvas behind each concept.

### Named Rules

**The Signal Only Rule.** Lime is a locator and primary action color, not a large surface fill.

**The State Separation Rule.** Green means review-ready, amber means mail hold, and ink means scope; do not merge these states into one generic badge color.

## Typography

**Display Font:** Georgia (with Times New Roman and serif fallbacks)
**Body Font:** Inter (with the incumbent UI and system fallback stack)
**Label Font:** the body stack in heavy uppercase

**Character:** Georgia names the current business. The sans-serif stack stays compact and neutral for repeated controls and evidence. Inter is declared first but is not loaded by the shipped page, so the rendered sans face depends on the local system.

### Hierarchy

- **Display** (400, `2rem`, inherited 1.45): reserved for editorial orientation if a long title is needed; the live deck uses Title for the current business.
- **Headline** (400, `1.55rem`, 1): the Find drawer title.
- **Title** (400, `clamp(1.2rem, 2vw, 1.85rem)`, 1.05): the active business in the command bar.
- **Body** (400, `16px`, 1.45): the base operating layer for search, controls, notes, and empty states.
- **Label** (800, `0.64rem`, `0.05em`, uppercase): compact status chips and the rank locator.

### Named Rules

**The Two-Speed Type Rule.** Georgia establishes the current subject; sans-serif carries action, evidence, filtering, and state.

**The Short Serif Rule.** Keep serif text to short orientation phrases and business titles; dense metadata and control copy remain sans-serif.

## Layout

The surface is a four-row viewport grid: a `72px` command bar, a `3px` sequence progress rule, a flexible live stage, and a paper filmstrip bar. The document and body do not scroll. Only the iframe and the filmstrip may scroll, and the filmstrip scrolls horizontally.

The command bar holds the current rank and business on the left and Previous, Next, Find, and Open full demo on the right. Desktop also exposes a Desktop/Phone preview switch. The filmstrip bar holds readiness status, twenty five ranked chips, the current note, and first-party contact links.

At `1120px`, the note and contacts wrap beneath the filmstrip. At `840px`, the command bar stacks, the preview switch hides, the iframe goes edge to edge, and the note/contact cluster yields so the site keeps the height. At `480px`, action labels stay visible while padding tightens.

Search, jump, and cohort filters are not sticky page chrome. They open inside a paper Find dialog.

**The Artifact First Rule.** The live concept is the primary element at every supported width. Chrome names the site and moves to the next one; it does not become a second page of rows.

**The Horizontal Sequence Rule.** Rank travel is Previous, Next, and a horizontally scrolling filmstrip. The reviewer never scrolls the review shell vertically to reach another site.

**The Synchronized Selection Rule.** Every navigation path resolves to one active prospect: selected chip, jump value, URL hash, stage content, progress width, and previous/next sequence update together.

**The Persistent Boundary Rule.** Compact layouts may hide the long note, but they do not hide Mail Hold.

## Elevation & Depth

The system uses no box shadows. Paper-versus-ink fields, one- and two-pixel rules, the darker preview well, and full-surface state fills establish depth. Filmstrip hover lifts the chip `2px` rather than raising a card.

### Named Rules

**The Flat Ledger Rule.** Separate levels with field contrast and rules; do not add floating panels or ambient shadows.

**The Planar State Rule.** Filmstrip hover and focus may shift the chip `2px` vertically, but padding stays fixed and the chip does not grow.

## Shapes

The form language is square and typeset. Search, cohort tabs, filmstrip chips, status chips, stage actions, viewport controls, iframe shell, and the Find dialog use straight edges and ruled boundaries rather than rounded containers.

**The Square Control Rule.** Interactive and status components do not introduce rounded or pill silhouettes.

## Components

The components form one inspection instrument: name the site, show the site, move to the next site.

### Command Bar

- **Structure:** rank locator and Georgia business title at left; preview size, Previous, Next, Find, and Open full demo at right.
- **Field:** Ledger Ink with Warm Paper text, Signal Lime rank, and a quiet dark bottom rule.
- **Responsive state:** stacks below `840px`; action controls stay `44px` minimum.

### Sequence Progress

- **Structure:** a `3px` Signal Lime fill whose width equals current rank divided by 25.
- **Field:** sits between the command bar and the live stage.

### Filmstrip Chip

- **Structure:** a `48px` square button labeled with the two-digit rank. The accessible name includes the business.
- **Default:** Warm Paper field, Ledger Ink rule and numerals.
- **Hover / Focus:** Tonal Row Hover plus `translateY(-2px)` over `280ms`.
- **Current:** Ledger Ink fill with Signal Lime numerals.
- **Filtered out:** `0.38` opacity when Find has an active cohort or query.

### Find Drawer

- **Structure:** a native `dialog` on Warm Paper with search, explicit Clear, the native twenty-five-prospect jump, counted cohort tabs, a result count, and a compact matching list.
- **Behavior:** `/` opens Find and focuses search. Escape or Close returns to the live stage. Choosing a jump target or list row loads that production demo and closes the drawer.
- **Focus:** a two-pixel Focus Green outline on light controls.

### Stage Actions

- **Shape:** square `44px` minimum-height controls with `8px 12px` padding.
- **Default:** transparent on Ledger Ink with Control Line borders.
- **Primary:** Open full demo uses Signal Lime fill and Ledger Ink text.
- **Hover / Focus:** a two-pixel Signal Lime outline with a two-pixel offset.
- **Disabled:** reduced to `0.38` opacity with a not-allowed cursor.

### Review Status

- **Ready:** QA Green with Ledger Ink text.
- **Mail Hold:** Mail Hold Amber with Ledger Ink text.
- **Scope:** Ledger Ink fill with Warm Paper text.
- **Responsive state:** Ready and Mail Hold remain visible at `480px` and below.

### Live Preview Stage

- **Field:** a darker preview well around a Preview White iframe canvas.
- **Desktop / Phone:** desktop fills the field; phone view caps the frame shell at `390px`.
- **Mobile:** the stage stays in document flow. There is no list-first overlay.
- **Loading:** a Signal Lime uppercase message on Ledger Ink fades away over `250ms`.

## Do's and Don'ts

### Do:

- **Do** keep the operating surface warm, flat, square, and high contrast.
- **Do** preserve the serif-orientation and sans-serif-operation split.
- **Do** load rank 1, or the hashed prospect, into the live stage on first paint.
- **Do** keep search clearing explicit, the native jump populated with all twenty five ranked prospects, and cohort counts visible inside Find.
- **Do** keep the active chip, jump select, URL hash, stage, progress, and previous/next sequence synchronized.
- **Do** keep filmstrip padding stable while hover and focus change background and translate the chip `2px`.
- **Do** keep the compact Mail Hold status visible at `480px` and below.
- **Do** honor reduced-motion settings by collapsing animations and transitions to `0.01ms`.

### Don't:

- **Don't** make the reviewer scroll a vertical prospect directory to see the live site.
- **Don't** restore the mobile list-then-overlay pattern.
- **Don't** replace the native jump select with a bespoke menu or let a control display a stale selection.
- **Don't** hide Mail Hold to make mobile fit.
- **Don't** convert the filmstrip into a card grid or add floating panels and shadows.
- **Don't** turn tabs, actions, search, or status markers into pills or rounded controls.
- **Don't** spread Signal Lime across large surfaces or collapse ready and hold into one state.
- **Don't** use the private-review shell to standardize the individual concepts' business-specific visual worlds.
