# Project HOPE: Dayforce Partner One-Pager (design upgrade)

Date: 2026-08-11
Client: `align-hcm`
Deliverable: `project-hope-onepager.pdf`

Redesign of the "Your Deal Is Stalled" partner offer sheet for Dayforce sellers.
Same offer, same approved copy, rebuilt as one tall page with a real type system,
reworked boxes, and the Align logo as a true vector.

## Logos

Both marks are real vectors, traced from supplied artwork and reversed to white
for the navy bands. Neither is a font imitation.

**Dayforce.** Traced from the supplied artwork to `dayforce-logo.svg`, one path
per letter with the background dropped, so nothing sits behind the wordmark on
the navy header. Dayforce blue is `#346FE7`, sampled from that file. The paths are
filled with `currentColor`, so one file serves every placement: white in the
header lockup here, or set `color` to `#346FE7` on a light background. It sits
beside the Align logo with a hairline divider and an orange "PARTNER" label, sized
to 94 pt wide so its wordmark reads at about the same optical weight as Align's.

**Align HCM.** The original sheet pasted a JPEG logo inside a white box with a
dark green stroke. Both are gone. The artwork was split into its gray and orange
layers and retraced, so the wordmark knocks out to white with the slash and dots
in brand orange. The orange was normalized to the documented `#E8832A`; the source
JPEG had drifted to about `#E9983D`. Ships as `align-logo-reversed.svg` for dark
backgrounds and `align-logo-dark.svg` for light ones.

`build.py` still supports swapping the partner mark: replace `dayforce-logo.svg`
and rebuild. If the file is missing it falls back to a plain text designation
rather than drawing an imitation of the wordmark.

Also worth confirming before this goes out: that Align's Dayforce partner
agreement covers using the Dayforce mark on partner-authored collateral.

## Specs

- 8.5 x 14 in (612 x 1008 pt), one page, 191 KB. This is US Legal, not Letter.
  The sheet was Letter before. It grew 3 in taller so the content could get
  bigger type and real spacing without anything being cut
- Typeface: Plus Jakarta Sans (400/500/600/700/800), embedded
- Palette from `dillon-os/02_FullTimeJob/AlignHCM/brand-guidelines.md`:
  navy `#0A1628`, orange `#E8832A`, hot orange `#F05A28`, surface `#F6F8FB`
- Body copy 9.4 to 9.7 pt, up from roughly 7 pt on the original sheet
- Frame is even all the way down: 22 pt under the header, about 26 pt between
  sections, 24 pt above the contact band

## Contact band

Flat navy, matching the header. No card, no gradient, no glow, no drop shadow.
An earlier draft had all of those and read as fussy against the rest of the page.

Ben Harrison's name is 18 pt, the largest thing in the band and the focal point
of the lower page, with role and company beneath it and the "REFER A STALLED
DEAL" label above. Email is 11.6 pt in white and the phone number 13.6 pt in
brand orange, right-aligned opposite the Align logo. Everything from the original
contact block is kept.

## Other changes

- Five Reasons: bordered cards on a light surface with an orange gradient cap,
  the index in a corner badge, and titles padded to a common two-line height so
  every card's body copy starts on the same baseline
- HOPE stages: navy header holding the stage name, duration, and client time in
  orange, a white body, and a dashed-off "Solves" footer that aligns across all
  four cards regardless of body length
- The offer: one navy panel split into Prospect and You columns with tag chips
  and drawn check bullets, replacing the flat text block
- Referral steps: orange rule blocks, lighter than the boxed sections above so
  the page does not read as four identical grids

## Rebuilding

```
cd src
python3 build.py              # PDF + preview
python3 build.py --measure    # band heights in pt, for fit work
```

Needs Python with `pillow`, and Chromium at the path in `build.py`.
`template-tall.html` holds the markup and CSS. `build.py` inlines the fonts and
the logo as SVG symbols, so the output is self-contained with no external
requests.

The `--measure` pass reports every band's height against the 1008 pt page. Use it
when changing copy: if `slack` goes negative the layout no longer fits on one
page. It currently sits at about 79 pt of slack, spent as the gaps between
sections.

The header is width-critical. The headline, the orange subhead, and the kicker
are all close to the full measure of the copy column, so growing the logo or the
partner slot squeezes them. If the headline ever collides with the lockup, shrink
`.cobrand .align-logo` or the kicker font size until it clears. The kicker uses
`text-wrap:balance` rather than `nowrap`, so it wraps to two lines instead of
overlapping if it outgrows its box.

To go back to Letter, set `PAGE_IN` in `build.py` and the three 14 in values in
`template-tall.html` to 11, then run `--measure` and trim until `slack` is
positive again. Expect to give up roughly 1 pt of body copy size.
