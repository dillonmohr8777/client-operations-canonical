# Project HOPE: UKG Partner One-Pager (design upgrade)

Date: 2026-08-11
Client: `align-hcm`
Deliverable: `project-hope-ukg-partner-onepager.pdf`

Redesign of the "Your Deal Is Stalled" partner offer sheet for UKG sellers. Same
offer, same approved copy, rebuilt as a single Letter page with a real type
system, reworked boxes, and a cleaned-up logo.

## Specs

- 8.5 x 11 in (612 x 792 pt), exactly one page, 192 KB
- Typeface: Plus Jakarta Sans (400/500/600/700/800), embedded in the PDF
- Palette from `dillon-os/02_FullTimeJob/AlignHCM/brand-guidelines.md`:
  navy `#0A1628`, orange `#E8832A`, hot orange `#F05A28`, surface `#F6F8FB`
- Full-bleed navy header and footer bands, 30 pt side margins on the body

## What changed

Logo
- The old sheet pasted a JPEG logo inside a white box with a dark green stroke
  sitting on the navy header. Both the box and the stroke are gone.
- The logo was extracted from the source artwork, separated into its gray and
  orange layers, and retraced as vector paths (`src/align-logo-*.svg`). It now
  scales cleanly and knocks out onto navy: wordmark reversed to white, slash and
  dots in brand orange.
- The wordmark orange was normalized to the documented brand orange `#E8832A`.
  The source JPEG had drifted to roughly `#E9983D`.
- Two variants ship: `align-logo-reversed.svg` for dark backgrounds and
  `align-logo-dark.svg` for light ones.

Type
- Body copy moved from roughly 7 pt to 8.5 to 8.9 pt. Section headings, card
  titles, and the contact block all went up with it.
- Headline is 28 pt with the orange second line at 16.2 pt, both set to stay on
  one line.

Boxes
- Five Reasons: bordered cards on a light surface with an orange gradient cap,
  the index moved to a corner badge, and titles padded to a common two-line
  height so every card's body copy starts on the same baseline.
- HOPE stages: navy header holding the stage name, duration, and client time in
  orange, a white body, and a dashed-off "Solves" footer. Footers align across
  all four cards regardless of body length.
- The offer: one navy panel split into Prospect and You columns with tag chips
  and drawn check bullets, replacing the flat text block.
- Referral steps: orange rule blocks, lighter than the boxed sections above so
  the page does not read as four identical grids.
- Contact: full-bleed navy footer band with the logo, name, role, and details.

Spacing
- The old sheet left about a fifth of the page empty at the bottom. Content now
  fills the full 11 in: 14 pt above the body, 14 pt between sections, 16 pt
  below, with the header and footer trimmed to pay for it.

## The UKG logo is a stand-in

The UKG mark in the header is **"UKG" set in Plus Jakarta Sans ExtraBold, not the
official logo.** It needs to be swapped before this goes to UKG sellers.

UKG relaunched its brand on 2025-10-01 with a new logotype by FUNDAMENTALco, so
the current mark is the post-October-2025 one, not the older wordmark. This
session could not fetch it: outbound egress is restricted to a short allowlist,
and every source was refused by the proxy, including `ukg.com`, UKG's own partner
brand portal at `cdp.content.ukg.com`, `brandfetch.com`, and Wikimedia. Only
UKG Light Teal `#30CEBB` could be confirmed, and the dark teal could not.

To swap it in, drop the official file beside `src/build.py` as `ukg-logo.svg`
(or `.png`/`.jpg`/`.webp`) and rebuild. `build.py` picks it up automatically and
replaces the stand-in. The slot is sized at 62 pt wide with a 26 pt max height,
next to a hairline divider and the orange "PARTNER" label. Pull the asset from
the UKG partner brand portal so the version and the usage rules match.

Also worth confirming before this ships: that Align's UKG partner agreement
covers putting the UKG mark on partner-authored collateral.

## Rebuilding

```
cd src && python3 build.py            # writes hope-onepager.{html,pdf} + preview
python3 build.py --measure            # dumps section heights in pt, for fit work
```

Needs Python with `pillow`, and Chromium at the path in `build.py`. `template.html`
holds the markup and CSS. `build.py` inlines the fonts and logo, then prints to
PDF, so the output is self-contained with no external requests.

The `--measure` pass reports every band's height against the 792 pt page. Use it
when changing copy: if `slack` goes negative the layout no longer fits on one
page.
