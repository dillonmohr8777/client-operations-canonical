---
name: Bar Crawl USA Route Passport
description: A bold, city-specific campaign system for persuasive event landing pages.
colors:
  midnight-navy: "#111638"
  ticket-bone: "#fff8ec"
  paper-white: "#ffffff"
  halloween-orange: "#f47c20"
  cleveland-yellow: "#f2c94c"
  cincinnati-red: "#e65a4f"
  columbia-coral: "#ef8354"
  greenville-green: "#7ed957"
  portland-blue: "#46b5d1"
  st-pete-gold: "#f7c548"
  macon-violet: "#c18cff"
  roswell-pink: "#ff6fae"
  sarasota-teal: "#2ed3b7"
typography:
  display:
    fontFamily: "Barlow Condensed, Impact, Haettenschweiler, sans-serif"
    fontWeight: 800
    lineHeight: 0.91
    letterSpacing: "-0.05em"
  body:
    fontFamily: "Aptos, Calibri, sans-serif"
    fontWeight: 400
    lineHeight: 1.7
rounded:
  square: "0"
spacing:
  compact: "12px"
  standard: "24px"
  section: "92px"
components:
  route-pass:
    backgroundColor: "{colors.midnight-navy}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.square}"
    padding: "24px"
  ticket-button:
    backgroundColor: "{colors.halloween-orange}"
    textColor: "{colors.midnight-navy}"
    rounded: "{rounded.square}"
    padding: "16px 22px"
---

# Design System: Bar Crawl USA Route Passport

## Overview

The campaign surface feels like a nightlife route passport: one unmistakable city photo, one hard-edged local color, numbered route stops, and practical field notes. It preserves the site’s navy-and-white Bar Crawl USA identity while replacing thin cloned layouts with specific, useful event pages.

## Colors

Midnight navy and ticket bone form the durable base. Every city receives one high-contrast accent tied to its page only. Accent color carries status, quick facts, route numbers, and the final call to action. It never replaces readable body text and never becomes a decorative gradient.

## Typography

Barlow Condensed or the site’s nearest condensed fallback owns headlines, labels, facts, and calls to action. Aptos carries paragraph copy, FAQs, and operational notes. Headlines are short, large, and tightly tracked; body copy stays at a comfortable reading measure.

## Layout

Desktop pages open with a split hero: decisive copy on midnight navy and one local event photo. A three-part fact strip follows. Eight numbered content modules then cover the decision, ticket value, route, photography, arrival, group planning, FAQs, and related discovery. Mobile collapses every grid to one column without changing information order.

## Elevation & Depth

The system is mostly flat. Depth comes from hard borders, photo crops, accent frames, and occasional offset shadows on high-value decision panels. Shadows must be solid and intentional, not soft floating-card decoration.

## Shapes

All panels, buttons, labels, and route cells are square. The visual language is poster-like and editorial, not a stack of rounded cards or pills.

## Components

### Split Campaign Hero

One H1, one concise answer paragraph, the primary official-event action, and a unique city photograph. No screenshot composites and no repeated hero across markets.

### Decision Strip

Date, published time, and neighborhood appear immediately below the hero. Combined-market pages use side-by-side edition panels with separate status and ticket paths.

### Route Passport

An ordered, numbered venue grid on midnight navy. Registration and after-party roles are written into the relevant stop; route order is never implied as mandatory unless the source says so.

### Proof Gallery

Two additional city-relevant media-library photographs show real Bar Crawl USA participants. Alternative text describes what is visible without keyword stuffing.

### Arrival Field Note

One bordered planning panel links to an authoritative local parking, district, or transit resource. It avoids copied operational claims that can drift.

### FAQ Ledger

Five visible questions answer dates, location, inclusions, registration, and known source caveats. Matching FAQPage schema is emitted only for visible answers.

## Do's and Don'ts

### Do:

- Use unique, relevant media-library photography on every city page.
- Keep event facts tied to current official Bar Crawl USA records.
- Preserve separate dates, routes, and ticket paths on combined-market pages.
- Use semantic headings, visible focus, descriptive links, and reduced-motion-safe behavior.
- Keep the official event page as the primary conversion path.

### Don't:

- Do not use screenshots as page imagery.
- Do not reuse one hero across all ten cities.
- Do not invent Midtown, Sarasota, Portland, or Lakewood schedule facts.
- Do not add decorative gradients, generic card stacks, or filler copy.
- Do not publish these pages until source, mobile, SEO, schema, and link review is complete.
