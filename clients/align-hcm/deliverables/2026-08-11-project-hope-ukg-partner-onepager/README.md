# Project HOPE: UKG Partner One-Pager (design upgrade)

Date: 2026-08-11
Client: `align-hcm`

Redesign of the "Your Deal Is Stalled" partner offer sheet for UKG sellers. Same
offer, same approved copy, rebuilt as a single Letter page with a real type
system, reworked boxes, both logos as true vectors, and Ben Harrison's contact
block promoted to the focal point of the page.

Two iterations ship. Pick one.

| | `project-hope-onepager-A-contact-band.pdf` | `project-hope-onepager-B-contact-panel.pdf` |
|---|---|---|
| Contact block | Full-width hero band across the bottom | Tall panel in the bottom right |
| Name size | 26 pt | 28 pt |
| Referral steps | Three across, above the band | Stacked vertically beside the panel |
| Logos in contact block | Align | Align and UKG |
| Reads as | A letterhead-style footer signature | A business card built into the page |

Both are one page at 8.5 x 11 in with identical copy and identical type sizes
everywhere except the name. A is the safer, more formal layout. B gives the
contact block the most visual weight and puts both logos next to it.

## Specs

- 8.5 x 11 in (612 x 792 pt), exactly one page. A is 249 KB, B is 278 KB
- Typeface: Plus Jakarta Sans (400/500/600/700/800), embedded
- Palette from `dillon-os/02_FullTimeJob/AlignHCM/brand-guidelines.md`:
  navy `#0A1628`, orange `#E8832A`, hot orange `#F05A28`, surface `#F6F8FB`
- Body copy 8.1 to 8.6 pt, up from roughly 7 pt on the original sheet

## The contact block

This is the focus of the document, so it carries the most design weight:

- Raised card on the navy band: navy gradient, a 3.6 pt orange left edge, an
  inset top highlight, and a soft drop shadow so it reads as lifted off the page
- A warm orange glow behind the card, which is what gives it depth on a dark
  background where a plain shadow would disappear
- "Ben Harrison" at 26 pt in A and 28 pt in B, with a soft text shadow. That is
  more than double the 12 pt it was on the previous version
- Phone number at 14 pt in brand orange, email at 10 to 11 pt in white, each
  behind a rounded orange icon chip
- Role, company, and the "REFER A STALLED DEAL" label all kept
- The whole band is 112 pt tall in A against 55 pt before, so the block is
  exactly double its old size

## Logos

Both marks are real vectors, traced from source artwork and reversed to white
for the navy header. Neither is a font imitation.

**Align HCM.** The original sheet pasted a JPEG logo inside a white box with a
dark green stroke. Both are gone. The artwork was split into its gray and orange
layers and retraced, so the wordmark now knocks out to white with the slash and
dots in brand orange. The orange was normalized to the documented `#E8832A`; the
source JPEG had drifted to about `#E9983D`. Ships as `align-logo-reversed.svg`
for dark backgrounds and `align-logo-dark.svg` for light ones.

**UKG.** This is the current mark from the October 2025 rebrand, traced from the
supplied artwork to `ukg-logo.svg`. Its own dark teal is `#205050`, sampled from
that file. The SVG is filled with `currentColor`, so a single file serves every
placement: white in the header lockup and in B's contact panel, or set `color`
to `#205050` on a light background. It appears beside the Align logo with a
hairline divider and an orange "PARTNER" label.

Still worth confirming before this goes out: that Align's UKG partner agreement
covers using the UKG mark on partner-authored collateral.

## Rebuilding

```
cd src
python3 build.py              # both iterations, PDF + preview each
python3 build.py a            # just one
python3 build.py --measure    # band heights in pt, for fit work
```

Needs Python with `pillow`, and Chromium at the path in `build.py`.
`template-a.html` and `template-b.html` hold the markup and CSS and share every
value except the bottom row. `build.py` inlines the fonts and both logos as SVG
symbols, so the output is self-contained with no external requests.

The `--measure` pass reports every band's height against the 792 pt page. Use it
when changing copy: if `slack` goes negative the layout no longer fits on one
page. Both iterations currently sit at about 44 pt of slack, which is spent as
roughly 15 pt of air between sections.
