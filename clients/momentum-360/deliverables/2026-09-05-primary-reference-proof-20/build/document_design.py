"""Regenerate the design record from the final source and palette decisions."""
from pathlib import Path
import json
import build
import palettes

R=Path(__file__).resolve().parents[1]
records=json.loads((R/'sources/manifest.json').read_text())['records']
sizes={12:'provenance',13:'hub-location',14:'compact-table',15:'context-action',16:'secondary-action',17:'service-body',18:'body',20:'identity',22:'closing-script-small',24:'intro-small',26:'hub-title',28:'mobile-card',32:'service-title',34:'closing-script-large',36:'closing-small',38:'section-small',40:'intro-large',42:'hero-small',48:'section-mobile',56:'bridge-large',62:'closing-large',64:'section-large',76:'hero-large'}
front='''---
name: Primary Reference Prospect System
description: Exact business identities and dimensional illustrations within the approved primary reference.
colors:
  paper: "#ffffff"
  warm-paper: "#fffefa"
  ink: "#2c2927"
  body: "#40494e"
  photo-scrim-top: "rgba(10,15,15,.16)"
  photo-scrim-bottom: "rgba(10,15,15,.88)"
typography:
'''
for size,role in sizes.items():
 family='"bebas-neue-pro", "Bebas Neue", sans-serif' if 'title' in role or role.startswith(('hero','section','closing-')) and 'script' not in role else ('"verveine", "Caveat", cursive' if 'script' in role else '"montserrat", "Montserrat", sans-serif')
 front+=f"  {role}:\n    fontFamily: '{family}'\n    fontSize: \"{size}px\"\n    lineHeight: {1.15 if size>25 else 1.65}\n"
front+='''  bridge-heading:
    fontFamily: '"Poppins", sans-serif'
    fontSize: "56px"
    lineHeight: 1.1
rounded:
  small: "4px"
  action: "50px"
  contextual-action: "12px"
spacing:
  space-1: "8px"
  space-2: "16px"
  space-3: "24px"
  space-4: "40px"
  space-5: "64px"
  space-6: "96px"
components:
  button-primary:
    typography: "{typography.service-body}"
    rounded: "{rounded.action}"
    padding: "16px 24px"
  header:
    height: "100px"
---

# Design System: Primary Reference Prospect System

## Overview

**Creative North Star: "Each business, unmistakably itself"**

Scan of the revised twenty-page proof. The sole visual authority remains https://primary-website-build-reference.netlify.app/, subject to Dillon's latest mobile corrections. Each page has an exact transparent header logo, a unique grainy dimensional hero illustration and one opening action. Service-specific drawn symbols, three substantial illustrated chapters, an enquiry guide, a three-step planning sequence and native expandable questions complete each long editorial page. The compact closing remains intact.

**Key Characteristics:**
- Exact original transparent identity on a continuous, calm surface.
- The exact source logo remains visible and clear of MENU at every scroll position.
- The centered bouncing-logo stage and overflowing service strip are removed.
- Condensed display lettering, handwritten accents and Montserrat body copy.
- Business-specific dimensional illustrations in the approved reference language.

## Colors

Brand colors come from the reviewed identity. The generator preserves the source hue for identity fields and derives darker, measured foreground variants. Light-logo variants use a dark continuous field. Warm paper (#fffefa) and white (#ffffff) frame the identity; body ink is #2c2927 or #40494e. No logo backing plate is added.

**The Exact Identity Rule.** Source bytes and geometry remain unchanged. Logo restoration, if needed in a later batch, requires a fresh comparison with the original mark.

| Business | Source hue | Header field | Deep section |
|---|---|---|---|
'''
for r in records:
 p=palettes.derive(build.theme(r));front+=f"| {r['name']} | {r['brand_color']} | {p['header']} | {p['brand_dp']} |\n"
front+='''
## Typography

Bebas Neue supplies the condensed display voice, Montserrat carries body copy, and Caveat supplies the handwritten line. The inherited Adobe families may load first; their named Google fallbacks preserve the intended lettering. Hero titles scale from 42 to 76px, section titles from 38 to 64px, deep-section titles from 36 to 56px. Closing titles scale from 36 to 62px, with 22–34px handwriting above them. Body copy is 17–18px with 1.65–1.75 line height. Metadata is 12–14px; it never carries the main action.

**The Closing Space Rule.** Closing headings use balanced line breaks, a 14ch measure and 24px separation from supporting copy. The closing copy is limited to 48ch, with 64px above on desktop and 40px on mobile. Footer navigation uses 16px body lettering with 44px touch targets.

## Layout

The inherited content grid is 1310px with responsive gutters. The header is fixed at 100px with separate flexible logo space and an 80px menu control. The editorial hero uses two columns on desktop and places art above copy below 760px. Its height follows content. Four service descriptions use two columns on desktop and a single column on mobile, with service-specific 64px symbols on mobile. Three spacious editorial chapters restore every approved body illustration; art precedes text on mobile and alternates sides on desktop. Chapters use 96px desktop and 64px mobile section spacing from the existing scale. Mobile chapter headings cap at 48px; chapter body copy uses 17px with 1.8 line height. Footer content follows natural height without clipping. Raster logos remain within their verified source bounds; SVG marks scale without distortion.

## Elevation & Depth

The source reference uses offset, blurred shadows on the fixed header; the revised opening panel is flat. The illustrations use a 0 10px 8px soft shadow tinted from the business's deep color. Depth otherwise comes from drawn perspective and overlapping faces. Logos remain on flat full-field surfaces.

## Shapes

Native details and summary elements provide expandable questions with keyboard operation. Large drawing motion runs only while its illustration is visible; reduced motion displays the complete static state.

Primary actions retain the reference's 50px pill radius. Photo panels remain rectangular. Dimensional illustrations use the reference's outlined business objects, crisp vector paths and restrained motion. This is an explicit user-selected exception to generic guidance against picture-like SVG: the user requested hand-drawn spatial objects matching this exact reference. These drawings never substitute for an official logo. UI arrows are monochrome authored SVG with a 24-unit viewBox and 20px display size. Emoji and Unicode arrows are prohibited as interface icons, including encoded HTML entities, because phone platforms can substitute emoji artwork.

## Components

### Header

A 100px fixed header keeps the original mark visible at every scroll position. A thin line indicates reading progress. MENU controls a labelled navigation overlay. Closed navigation is inert; opening moves focus inside, Tab is contained and Escape returns focus to the trigger.

### Primary action

Brand-colored pills use the palette's measured foreground, 16px by 24px padding and at least 56px height in the identity area. All business actions lead to the verified official domain. Focus uses a visible 3px outline and 6px offset.

### Illustration and service pair

Each page includes one unique generated dimensional hero, four content-selected service symbols, three planning symbols and all three supporting business-category illustrations, alongside the four sourced service descriptions. Their palette derives from the business; their subject follows the service, without fabricated claims, reviews or results.

### Contextual action and motion

The exact logos do not animate. Service symbols settle once on entering the viewport. A contextual official-site action appears after the services enter, hides when the menu is open and disappears before the footer. The former repeating service strip and redundant details accordion are removed from prospect pages. Reduced motion disables animation and transitions; all content remains visible.


## Do's and Don'ts

### Do:
- Do preserve the exact transparent source mark and its proportions.
- Do use the twenty business-specific hero illustrations and preserve their generation provenance. Keep supporting imagery drawn rather than photographic.
- Do use smaller closing type and generous spacing on desktop and mobile.
- Do verify source hashes, prior names, domains and page slugs before building.
- Do retain the original ten-page reference for comparison.

### Don't:
- Don't fabricate marks, reviews, prices or business relationships.
- Don't put a card, plate or white rectangle behind a logo.
- Don't call enlarged raster dimensions newly recovered 4K detail.
- Don't count a rendered page, a passing source check or a draft as a published website.
'''
extra={'service-stripe':'#e8edf0','accordion-border':'#c7c8ca','accordion-rule':'rgba(0,0,0,0.125)'}
seen={'#ffffff','#fffefa','#2c2927','#40494e'}
for r in records:
 for key,value in palettes.derive(build.theme(r)).items():
  if isinstance(value,str) and value.startswith('#') and value not in seen:
   extra[r['slug']+'-'+key.replace('_','-')]=value;seen.add(value)
front=front.replace('typography:\n',''.join(f'  {k}: "{v}"\n' for k,v in extra.items())+'typography:\n',1)
(R/'DESIGN.md').write_text(front,encoding='utf-8')
surface=R/'.impeccable/surfaces';surface.mkdir(parents=True,exist_ok=True)
(surface/'prospect-homepages.md').write_text('''# Prospect homepages

Mode: Persuade.

Job: Recognize a real business, understand its actual services and choose a verified official contact route.

Authority: https://primary-website-build-reference.netlify.app/ only. Preserve its approved typography and spatial illustration language. Latest user correction removes the centered bouncing logo, header swap and moving type strip. Keep the exact logo stationary in the header. Twenty unique grainy hero images, all three original body illustrations per business, readable service and planning symbols, substantial copy and compact closing sections are mandatory.

Proof sequence: exact header identity, conceptual hero artwork, expanded sourced services, three illustrated business chapters, useful enquiry guidance, a planning sequence, accessible questions and a clear official action. The full page must exceed twice the compact predecessor at both desktop and mobile widths; the footer remains compact. No invented testimonials, prices or client relationship.

Release requires source verification, historical deduplication, desktop/mobile inspection, interaction checks, reduced-motion verification, detector review and exact existing Netlify destination verification. This document alone is not a release receipt.
''',encoding='utf-8')
print('Regenerated DESIGN.md and the surface record from the implemented proof')
