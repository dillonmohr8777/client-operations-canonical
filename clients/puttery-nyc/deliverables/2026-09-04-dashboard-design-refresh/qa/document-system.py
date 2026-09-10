from pathlib import Path
import re,json
root=Path(__file__).resolve().parents[1]
css=(root/'styles.css').read_text()
tokens=dict(re.findall(r'--([\w-]+):([^;\n}]+)',css.split(':root{',1)[1].split('}',1)[0]))
colors={k:v for k,v in tokens.items() if v.startswith('#')}
lines=['---','name: "Puttery NYC Attribution Pilot Control"','description: "The course marshal board, refined for daily operation."','colors:']
lines += [f'  {k}: "{v}"' for k,v in colors.items()]
lines += ['typography:']
for role,font,size,weight,lh in [('display','Fugaz One, sans-serif',tokens['display'],400,1.15),('headline','Manrope, Segoe UI, sans-serif',tokens['section'],800,1.2),('title','Manrope, Segoe UI, sans-serif',tokens['title'],800,1.35),('body','Manrope, Segoe UI, sans-serif',tokens['base'],400,1.6),('label','Manrope, Segoe UI, sans-serif',tokens['xs'],700,1.5),('small','Manrope, Segoe UI, sans-serif',tokens['sm'],400,1.6),('metadata','Manrope, Segoe UI, sans-serif','.6875rem',500,1.5),('micro','Manrope, Segoe UI, sans-serif','.625rem',700,1.5)]:
 lines += [f'  {role}:',f'    fontFamily: "{font}"',f'    fontSize: "{size}"',f'    fontWeight: {weight}',f'    lineHeight: {lh}']
lines += ['rounded:','  surface: "12px"','  control: "8px"','  circle: "50%"','spacing:']
lines += [f'  {k}: "{v}"' for k,v in tokens.items() if re.match(r's\d+$',k)]
lines += ['components:','  action-primary:','    backgroundColor: "{colors.pink}"','    textColor: "{colors.black}"','    rounded: "{rounded.control}"','    padding: "10px 16px"','    height: "44px"','  action-secondary:','    backgroundColor: "transparent"','    textColor: "{colors.white}"','    rounded: "{rounded.control}"','    padding: "10px 16px"','    height: "44px"','  active-nav:','    backgroundColor: "{colors.teal}"','    textColor: "{colors.black}"','    rounded: "{rounded.control}"','    padding: "11px 12px"','  input:','    backgroundColor: "{colors.black}"','    textColor: "{colors.white}"','    rounded: "{rounded.control}"','    padding: "10px 12px"','    height: "44px"','  action-panel:','    backgroundColor: "{colors.teal-pale}"','    textColor: "{colors.ink}"','    rounded: "{rounded.surface}"','    padding: "20px"','---','']
body='''# Design System: Puttery NYC Attribution Pilot Control

## Overview

**Creative North Star: "The Course Marshal Board"**

This scan documents the implemented September 4 refinement of the existing Puttery dashboard. It retains the exact wordmark, black field, pink actions, teal progress, and Fugaz One voice while bringing the current operating work into a compact hierarchy. The design is direct, precise, and recognizably Puttery.

**Key Characteristics:**

- Exact white Puttery wordmark on black.
- Compact Fugaz One title; Manrope for operational reading.
- Stable status semantics, spacious source rows, and native disclosures.
- One outlined SVG icon family and quiet golf-dimple geometry.
- No ambient animation or delayed content reveal.

## Colors

### Primary

Black anchors the application shell and focused worksheet. Hot pink identifies primary actions. Teal identifies the active route and verified progress.

### Secondary

Pale teal supports the next action, with deep teal for readable copy. Pale pink and deep pink identify held reporting. Yellow supports pending source states and keyboard focus on dark surfaces.

### Neutral

White and warm off-white separate content areas without requiring a card for each fact. Score lines provide boundaries. Muted text remains contrast-tested against its actual surface; dark supporting text uses the lighter dark-muted token.

**The Written Status Rule.** Readiness is always named in text, never conveyed by color alone.

## Typography

**Display Font:** Fugaz One, sans-serif.

**Body Font:** Manrope, Segoe UI, sans-serif.

Only the main title uses the branded display face. Section titles, evidence, forms, statuses, and figures use Manrope. Figures use tabular numerals. Labels at 10–12px are metadata, while actionable copy is 14–15px. Heading tracking stays at -0.025em. Paragraphs are capped near 74 characters.

## Layout

The desktop shell uses a 228px sidebar and a fluid content column within a 1720px maximum. The compact overview pairs a purpose statement with a 300px worksheet summary. Current status leads into the next action before source readiness and expandable evidence. Source lanes are full-width disclosure rows; they do not form a grid of competing cards.

At 1220px the sidebar narrows to 208px. At 980px it becomes a sticky horizontal strip and the long page uses one main column. At 720px the worksheet becomes one compact progress link, allowing current status and its action to appear earlier. At 430px header controls span their own row. The sidebar uses its own scrolling at short heights and never positions its footer over navigation.

Spacing uses the extracted 4/8/12/16/20/24/32/40/48px scale. Sections use 40px desktop vertical padding and 32px mobile; the mobile overview uses 24px. Related details sit close; topic boundaries receive a larger interval.

## Elevation & Depth

Tonal fields and rules create depth. A single soft, offset shadow is reserved for transient feedback. The black overview includes a quiet dot field inspired by a golf ball surface, implemented as precise repeating circle geometry. It has no motion and no illustration or generated image claim.

## Shapes

Surface corners use 12px. Controls use 8px. Circular route markers represent an ordered evidence path. Native disclosure chevrons, drawn geometrically, indicate expandable detail. All functional icons share a 24-unit viewbox, 1.7-unit stroke, round caps, and round joins.

## Components

### Buttons

Primary actions use pink with dark text and a darker pink/white hover. Secondary controls use a clear outline. Every button has a minimum 44px height and visible keyboard focus. Motion is limited to short state transitions.

### Navigation

The active section uses a teal fill with dark text and `aria-current`. Desktop labels include a short description. Mobile retains the icon and concise label in a horizontally scrollable strip.

### Inputs

Dark fields use a clear outline, light text, and 44px minimum height. Answer state is labeled in a select and reflected by the field border. Storage failure leaves the active answers intact and instructs the user to export.

### Disclosures

Integration rows, launch evidence, and modeled reporting use native details/summary. Technical detail and illustrative figures are available without dominating the operating view. A collapsed integration keeps its name and status visible.

### Action panel

The next action sits in a pale teal field immediately after current status. Its supporting explanation distinguishes engineering evidence from attribution. This panel uses no shadow.

## Do's and Don'ts

### Do:

- Do preserve the exact logo, current venue identity, and written status language.
- Do keep actual engineering evidence separate from modeled performance.
- Do make the next action and current state visible before lengthy discovery detail.
- Do use the same icon stroke, spacing scale, and native disclosure behavior throughout.

### Don't:

- Don't turn webhook delivery updates into booking or revenue counts.
- Don't animate the wordmark, delay text, or add ambient effects to operational work.
- Don't display raw guest data, secrets, or local runtime endpoints.
- Don't replace saved question IDs or the existing browser storage key.
'''
(root/'DESIGN.md').write_text('\n'.join(lines)+body,encoding='utf-8')
print('DESIGN.md generated from implemented CSS tokens and component inspection.')
