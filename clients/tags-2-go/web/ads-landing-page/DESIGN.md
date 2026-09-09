---
name: Tags 2 Go
description: A high-visibility Philadelphia service counter built around immediate routing, verified identity, and direct contact.
colors:
  tags-blue: "#174ECD"
  tags-blue-deep: "#0D348F"
  signal-yellow: "#FEFE00"
  signal-yellow-deep: "#E5E500"
  charcoal: "#33373D"
  ink: "#111827"
  paper: "#FFFFFF"
  mist: "#F6F6F6"
  line: "#D9E0EC"
  blue-field-copy: "#E8EFFF"
  deep-blue-copy: "#DCE7FF"
  service-list-copy: "#EDF3FF"
  footer-copy: "#E9EDF4"
  footer-strong-copy: "#F4F6F9"
  footer-muted-copy: "#CFD5DD"
  print-ink: "#000000"
typography:
  display:
    fontFamily: "Fira Sans, Arial, sans-serif"
    fontSize: "clamp(3.25rem, 5.5vw, 5rem)"
    fontWeight: 600
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  display-mobile:
    fontFamily: "Fira Sans, Arial, sans-serif"
    fontSize: "clamp(2.85rem, 13vw, 4.15rem)"
    fontWeight: 600
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  headline-large:
    fontFamily: "Fira Sans, Arial, sans-serif"
    fontSize: "clamp(2.45rem, 4vw, 4.1rem)"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Fira Sans, Arial, sans-serif"
    fontSize: "clamp(2.4rem, 4vw, 4rem)"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.03em"
  headline-mobile:
    fontFamily: "Fira Sans, Arial, sans-serif"
    fontSize: "clamp(2.3rem, 11vw, 3.2rem)"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.03em"
  headline-compact:
    fontFamily: "Fira Sans, Arial, sans-serif"
    fontSize: "clamp(2.2rem, 4vw, 3.7rem)"
    fontWeight: 600
    lineHeight: 1.03
    letterSpacing: "-0.03em"
  router-heading:
    fontFamily: "Fira Sans, Arial, sans-serif"
    fontSize: "clamp(2rem, 3vw, 2.65rem)"
    fontWeight: 600
    lineHeight: 1.06
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Fira Sans, Arial, sans-serif"
    fontSize: "clamp(1.45rem, 2.4vw, 2rem)"
    fontWeight: 600
    lineHeight: 1.15
  router-item:
    fontFamily: "Fira Sans, Arial, sans-serif"
    fontSize: "1.18rem"
    fontWeight: 600
    lineHeight: 1.2
  body:
    fontFamily: "DM Sans, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  lead:
    fontFamily: "DM Sans, Arial, sans-serif"
    fontSize: "clamp(1.05rem, 1.45vw, 1.22rem)"
    fontWeight: 400
    lineHeight: 1.55
  status:
    fontFamily: "DM Sans, Arial, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 400
    lineHeight: 1.55
  caption:
    fontFamily: "DM Sans, Arial, sans-serif"
    fontSize: "0.94rem"
    fontWeight: 400
    lineHeight: 1.55
  footer-meta:
    fontFamily: "DM Sans, Arial, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "DM Sans, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.2
rounded:
  control: "5px"
  hover-surface: "10px"
  surface: "14px"
  circle: "50%"
spacing:
  xs: "4px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "34px"
  2xl: "48px"
  3xl: "72px"
  4xl: "96px"
components:
  button-primary:
    backgroundColor: "{colors.signal-yellow}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "15px 22px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.signal-yellow-deep}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "15px 22px"
    height: "48px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "15px 22px"
    height: "48px"
  nav-call:
    backgroundColor: "{colors.signal-yellow}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "14px 19px"
    height: "48px"
  mobile-call-bar:
    backgroundColor: "{colors.signal-yellow}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "0"
    padding: "10px 16px"
    height: "70px"
---

# Design System: Tags 2 Go

## Overview

**Creative North Star: "The Service Counter, Made Clear"**

The implemented page turns the incumbent shield, electric blue, and signal yellow identity into a decisive local service counter. A broad blue promise field leads directly into a white service router, then the page alternates quiet evidence, real service detail, and direct contact without drifting into government-site mimicry.

The system feels capable, high-visibility, and practical. Its strongest moments come from authored service lanes, asymmetrical first-viewport composition, verified business details, and a disciplined action color rather than decorative badges or repeated generic cards.

**Key Characteristics:**

- Tags Blue owns the hero and proof stages; Deep Tags Blue carries dense service detail.
- Signal Yellow is reserved for the most important action, route marker, or service cue.
- White and Mist provide quiet reading and routing surfaces between saturated fields.
- Fira Sans creates a sturdy headline voice; DM Sans keeps instructions and contact details calm.
- The verified shield logo is the only emblematic identity mark.
- Layouts favor a split service counter, horizontal service bands, and direct contact over repeated card grids.

## Colors

The palette is an exact extraction of the implemented page: two blues establish brand depth, yellow signals action, and a cool neutral ladder keeps long service information readable.

### Primary

- **Tags Blue:** the dominant hero, navigation, proof, and final-action field.
- **Deep Tags Blue:** the dense service-detail field and the strongest blue text on light surfaces.

### Secondary

- **Signal Yellow:** the primary call action, route line, service heading, and directional cue.
- **Deep Signal Yellow:** the interactive yellow state used on hover.

### Neutral

- **Reading Ink:** default body and control text on light surfaces.
- **Service Charcoal:** footer field and secondary long-form copy.
- **Paper:** page surface, blue-field text, and the foreground service router.
- **Print Ink:** the explicit black text fallback used only by the print stylesheet.
- **Service Mist:** proof rail, callouts, hover surfaces, and final-action section.
- **Service Line:** quiet separators between route lanes and light sections.
- **Blue Field Copy, Deep Blue Copy, and Service List Copy:** progressively brighter blue-tinted text values reserved for their named saturated fields.
- **Footer Copy, Footer Strong Copy, and Footer Muted Copy:** the footer's three-level light-text hierarchy.

**The Signal Rule.** Yellow always means the most important action or directional cue; it does not decorate passive containers.

**The Field Copy Rule.** On saturated blue or charcoal, use the matching field-copy token rather than generic gray or reduced opacity.

## Typography

**Display Font:** Fira Sans with Arial fallback  
**Body Font:** DM Sans with Arial fallback

**Character:** Fira Sans supplies the broad, sturdy service-business voice. DM Sans keeps service explanations, location details, navigation, and actions legible at phone scale.

### Hierarchy

- **Display and Display Mobile:** the single landing-page promise, fluid from 52 to 80 pixels on wider screens with a dedicated 45.6-to-66.4-pixel mobile override.
- **Headline Large:** the visit and evidence decision, fluid from 39.2 to 65.6 pixels.
- **Headline and Headline Mobile:** major service-section headings, fluid from 38.4 to 64 pixels with a 36.8-to-51.2-pixel mobile override.
- **Headline Compact:** the final action, fluid from 35.2 to 59.2 pixels.
- **Router Heading:** the immediate service choice, fluid from 32 to 42.4 pixels and fixed at 32 pixels on mobile.
- **Title:** service-band labels, fluid from 23.2 to 32 pixels.
- **Router Item:** 18.88-pixel Fira Sans labels inside the service-routing rows.
- **Lead:** hero support copy, fluid from 16.8 to 19.52 pixels and capped near 60 characters.
- **Body:** default 16-pixel reading text with a 1.55 line height; long copy stays within roughly 65 to 70 characters.
- **Status, Caption, and Footer Meta:** the exact 15.2, 15.04, and 14.4-pixel compact text steps used for disclosure, media context, and footer metadata.
- **Label:** 16-pixel, weight 700 action text; navigation labels use the same family at weight 600.

**The One Promise Rule.** The page gets one display-scale promise; supporting sections clarify, route, or prove it instead of competing with it.

## Layout

The desktop frame centers content inside an 1180-pixel maximum container with 24-pixel page edges. The first viewport is an asymmetrical split: the blue promise field occupies slightly more than half, while the white service router forms a foreground counter with a rounded leading edge and square outer edge. Subsequent sections use two-column proof and visit layouts, horizontal service bands, and a two-part final action rather than repeating equal cards.

The spacing rhythm clusters around 12 to 24 pixels inside controls and compact groups, 34 to 48 pixels between component groups, 72 pixels between major columns, and 92 to 100 pixels for desktop section breathing room. At 1024 pixels the hero, proof, visit, and final action collapse to one column. At 760 pixels, page gutters become 16 pixels, sections tighten to 72 pixels, service lists become single-column, and the fixed 70-pixel call bar preserves the primary action.

**The Counter Split Rule.** The first viewport must preserve a clear promise-to-router handoff; when width runs out, stack those two authored regions in that order.

## Elevation & Depth

The system uses a hybrid of strong color-field layering and one structural service shadow. The service router, documentary image, final CTA panel, and mobile menu can use the shared deep-blue shadow because they materially sit above another field. Buttons use smaller state shadows. Flat proof rails, service bands, and callouts rely on tonal separation and dividers instead.

### Shadow Vocabulary

- **Service Lift:** the shared structural shadow for foreground panels and overlays.
- **Action Rest:** a smaller shadow beneath the primary call button at rest.
- **Action Hover:** a stronger shadow paired with the two-pixel upward hover movement.
- **Mobile Dock:** an upward shadow that separates the fixed call bar from page content.

**The Structural Lift Rule.** Shadow belongs only to an overlapping panel, actionable control, menu, or fixed dock; ordinary information stays flat.

## Shapes

Controls use gently squared 5-pixel corners. Interactive route hover fields use a restrained 10-pixel radius, and major foreground surfaces use 14 pixels. The service router intentionally uses the surface radius only on its leading edge at desktop width, then becomes fully rounded when stacked. Circular geometry is reserved for the service icons. The shield silhouette belongs to the logo and is not repeated as decorative chrome.

**The Modest Radius Rule.** Controls stay compact and square-minded; only true panels receive the larger surface radius.

## Components

### Buttons

- **Primary:** Signal Yellow with Reading Ink, 48-pixel minimum height, 15-by-22-pixel padding, and the control radius.
- **Secondary:** transparent on a saturated field with a two-pixel translucent white border; it gains a faint white field on hover.
- **Hover / Focus:** interactive buttons move upward by two pixels using the service easing curve. Primary buttons also shift to Deep Signal Yellow. All controls retain the three-pixel visible focus outline with four-pixel offset.
- **Navigation Call:** a slightly tighter primary action with 14-by-19-pixel padding.

### Service Router

- **Container:** Paper on Tags Blue with a structural shadow, 44-to-46-pixel desktop padding, and an asymmetrical surface radius.
- **Route Link:** a 78-pixel minimum-height row with a circular authored icon, Fira Sans service name, blue route line, quiet divider, and a Mist hover field.
- **Mobile:** the panel becomes fully rounded with 24-pixel horizontal padding; route icons reduce from 52 to 46 pixels.

### Proof and Callouts

- **Proof Rail:** a flat Mist field with blue icons, Service Line divider, and no enclosing cards.
- **Visit Callout:** a Mist inset with surface radius, two-column icon-and-copy structure, and 24-to-26-pixel internal padding.
- **Media Caption:** Paper text on a nearly opaque Reading Ink field with the control radius.

### Service Bands

- **Structure:** horizontal rows on Deep Tags Blue, separated by translucent white rules.
- **Label:** Signal Yellow Fira Sans title at the left.
- **List:** two text columns on desktop and one on mobile, with short yellow line markers rather than checkmark badges.

### Navigation

- **Desktop:** the verified logo, centered white links, and a yellow phone action occupy a 94-pixel blue header.
- **Mobile:** a 48-pixel menu control opens a Paper panel with the structural service shadow; the fixed yellow call bar remains visible below the page.

### Final Action Panel

- **Container:** Tags Blue on Mist with surface radius, structural shadow, and 56-pixel desktop padding.
- **Actions:** stack at desktop width, move to a row at tablet width, and return to full-width stacking on phones.

## Do's and Don'ts

### Do:

- **Do** preserve the exact verified logo, business details, and blue-yellow identity.
- **Do** make independent-provider language visible before the first action.
- **Do** use the split service counter and horizontal service bands as the page's authored structural signatures.
- **Do** keep calls and contact requests within easy reach on mobile.
- **Do** use blue-tinted light copy on saturated blue and the matching footer-copy tokens on charcoal.

### Don't:

- **Don't** imitate a government website or introduce seals, flags, or agency-style badges.
- **Don't** invent prices, turnaround claims, testimonials, or licensing outcomes.
- **Don't** scatter yellow across passive decoration or use it for body text.
- **Don't** replace the service lanes with a grid of identical icon cards.
- **Don't** apply the structural shadow to ordinary information rows or callouts.
