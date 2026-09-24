---
name: client-deck
description: Build a branded, editable PowerPoint sales or marketing deck for a named client from pre-existing brand components. Use for client pitch decks, sales decks, capabilities decks, leadership reviews, pricing decks, or similar .pptx requests. Holds one brand system across every deck so design stays consistent. Do not use for slides that should be an HTML artifact or a web page.
---

# client-deck

Name a client, hand over the content, get a `.pptx` the sales team can edit — with that
client's type scale, color tokens, logo placement, slide patterns and native PowerPoint
animation already locked in.

The point is **continuity**: the design system lives in `brands/<client>.json` and
`lib/deck-kit.mjs`, never in the deck script. Two decks for the same client, built months
apart by different sessions, come out looking like the same company made them.

## Run it

```bash
node <deck-script>.mjs
```

`deck.save(path)` choreographs the deck on the way out: a fade transition on every slide
plus a role-aware entrance sequence. The effects are native OOXML timing nodes, so the
deck stays editable, plays offline, and needs no video.

```bash
pwsh -File ~/.claude/skills/client-deck/scripts/to-pdf.ps1   -Pptx out.pptx
pwsh -File ~/.claude/skills/client-deck/scripts/to-video.ps1 -Pptx out.pptx -Height 1080
```

```bash
pwsh -File ~/.claude/skills/client-deck/scripts/render-qa.ps1 -Pptx out.pptx -OutDir tmp/render
```

`pptxgenjs` is installed inside this skill, so a deck script anywhere on disk can import
the kit by absolute path and it resolves. `render-qa.ps1` drives desktop PowerPoint over
COM with no window, so it does not steal focus. There is no LibreOffice and no `pdftoppm`
on this host — do not reach for the pptx skill's `soffice.py` path.

## Workflow

## Motion

The kit stamps every shape with `objectName: "role:<name>"`. `scripts/choreograph.py`
reads those names and gives each role a move that suits what it *is*, rather than fading
everything uniformly because it cannot tell a rule from a headline:

| Role | Move |
|---|---|
| `panel-left/right/top/bottom` | Wipes in from the edge it bleeds off, at zero delay |
| `motif` | 900ms fade, slow and atmospheric |
| `logo` | 320ms fade |
| `kicker` `title` `display` `sub` | Rise: fade plus a small upward translate |
| `hero` `figure` | **Pop**: fade plus a scale up from 84 to 88 percent |
| `numeral` | Settles down from 106 percent over 900ms |
| `rule-h` `rule-v` | Wipes, so a hairline draws rather than appears |
| `step-num` | Pop, small |
| `foot` `static` | Never animates. Page numbers and footnotes are furniture |

Structure lands first at zero delay, so the slide is composed the instant it arrives.
Content then staggers in reading order at 55ms. Styles: `bold` (default), `subtle`
(shorter, smaller travel), `none` (transition only).

```bash
python ~/.claude/skills/client-deck/scripts/choreograph.py deck.pptx --style bold
```

It is idempotent: it strips any existing transition and timing before writing, so
re-running never doubles up. `scripts/animate-pptx.ps1` is the older COM-based fallback
for decks the kit did not build, which therefore carry no role tags.

## Workflow

1. **Load the brand.** `brands/<client>.json`. No file for this client? Copy
   `momentum-digital.json` and replace the tokens — sample the real colors out of the
   client's own logo and site rather than picking them.
2. **Write only content.** The deck script imports `lib/deck-kit.mjs` and calls layout
   functions. It should hold strings and numbers, not geometry.
3. **Every figure traces to a published source.** Keep a `SOURCES.md` beside the deck with
   one row per stat, result and price naming the page it came from. A case study with no
   hard number gets presented qualitatively — never write a plausible-sounding metric.
   Collect anything unverified into an explicit sign-off list for the client.
4. **Speaker notes carry the source.** `notes(s, body, [sources])` writes a `[Sources]`
   block so whoever presents can defend any number on screen.
5. **Build, then read the fit warnings.** The kit measures every text block and prints
   what would clip. Ship at zero warnings.
6. **Verify animation.** The save receipt reports slides and effect count. Confirm the
   file still opens in PowerPoint: hand-built timing XML is exactly the kind of thing it
   refuses. `to-video.ps1` is the fastest way to actually watch what you built.
7. **Render and actually look.** First render always has real composition problems the
   fit checker cannot see: a logo over a hero figure, a dead quadrant, a color used on the
   wrong ground.

## Two failure modes that cost the most time

- **A text box with height <= 0 makes PowerPoint refuse to open the whole file** — while
  python-pptx opens it, the XSD passes it, and `validate.py` reports "All validations
  PASSED". If PowerPoint says "could not open the file" and everything else says the file
  is fine, hunt for a negative-height shape. The kit clamps and warns instead.
- **A dark panel does not make the slide dark.** `rows`, `statRow`, `steps`, `bullets` and
  `block` each take their own `dark: true`. Miss it and you get ink-on-navy, which renders
  as an invisible line of text. If a slide is mostly one ground, make the whole slide that
  ground and pass `dark` everywhere rather than layering a panel.

## The kit

`lib/deck-kit.mjs` exports a `Deck` class. Everything is in inches.

| | |
|---|---|
| `deck.title({kicker,title,sub,foot})` | Full-bleed opener, large logo, monogram motif |
| `deck.section({num,kicker,title,sub})` | Act divider, giant ghosted numeral |
| `deck.slide({kicker,title,sub,dark,panel,motif,titleW,logoDark})` | Standard slide; sets `s._top` |
| `deck.panel(s,{side,size,fill})` | Color region bled off one slide edge |
| `deck.rows(s,items,{x,y,w,dark,bottom})` | Editorial list, hairline separated |
| `deck.stat(s,{x,y,w,value,label,sub,size,color,dark})` | One figure; returns its bottom |
| `deck.statRow(s,items,{y,size,dark,bottom})` | Row of figures on shared baselines |
| `deck.steps(s,items,{y,dark,bottom})` | Numbered process flow |
| `deck.block(s,{x,y,w,h,eyebrow,head,body,bullets,fill,dark})` | Eyebrow + head + copy |
| `deck.caseStudy(s,{client,industry,hero,stats,before,after,note})` | Whole case study |
| `deck.priceCol(s,{x,y,w,h,name,sub,price,term,features,footnote,accent,nameH,subH})` | Pricing column |
| `deck.table(s,rows,{x,y,w,colW})` | Native table, brand styled |
| `deck.hair` / `deck.vrule` / `deck.mark` / `deck.logo` / `deck.foot` | Rules, motif, logo, footnote |
| `deck.flow(s,str,{x,y,w,size})` | Auto-height text; returns the next y. **Chain this instead of hardcoding y** |
| `deck.notes(s,body,sources)` | Speaker notes with a `[Sources]` block |
| `deck.save(path, {animate, animationStyle})` | Writes the file, choreographs it, prints fit warnings |

`deck.M` margin, `deck.CW` content width, `deck.BOT` content floor, `deck.W`/`deck.H`.
Anything below `BOT` belongs to the footnote and the page number.

Pass `bottom: deck.BOT` to `rows`, `statRow`, `steps` and `bullets` so overflow is caught
at build time instead of in the render.

## The visual language

Editorial, not cards on a grid. What the kit produces:

- **Full-bleed color panels** that touch a slide edge, not floating boxes inside margins
- **A wide type scale** — 54pt display against 12.5pt body, so hierarchy does the work
- **Figures set large** against open space; the number is the hero, its label is small
- **Hairline rules** between list rows and stat columns instead of borders and fills
- **One motif**: the brand monogram, oversized at ~90% transparency, bleeding off an edge
- **A light/dark sandwich** — dark opener, dark act dividers, dark close, light content,
  with one or two fully dark content slides for rhythm

Calibrated to Dillon's brief: visual variance 9/10, information density 4/10.

## What the kit will not produce

From the pptx skill's anti-slop list and Dillon's:

- an accent line or rule under a slide title
- a decorative color bar, header stripe, **sidebar stripe down a slide edge**, or a
  single-edge border on a block
- a row of three equal cards as a default layout
- centered body copy (titles and stat values may center; paragraphs and lists never)
- AI purple, neon glow, glassmorphism, floating gradient orbs
- em dashes in visible slide copy

And it does enforce Arial everywhere, because the deck has to render identically on a
sales laptop that has never heard of the client's web font. The brand file records the
real web font in `type.webFont` for reference only.

## Text fitting

PowerPoint does the layout, so the kit estimates it. `estLines`/`estHeight` model Arial's
average advance width, with separate constants for regular, bold, caps and bold caps —
bold caps run about 15% wider than bold mixed case, and one constant for both leaves
visible gaps under every label. The estimate errs toward reserving more room.

Where siblings must align, pass an explicit height (`headH` on `block`, `nameH`/`subH` on
`priceCol`) rather than letting each one measure itself — a one-line head that estimates
as two will otherwise sit lower than the block beside it.

## Brands

- `brands/momentum-digital.json` — Momentum Digital, Philadelphia. Blue `#2A80C2` sampled
  from the logo and confirmed against the site's own Elementor globals. Logo lockups and
  the cropped circular monogram in `assets/momentum-digital/`.

Add a client by adding a brand file plus its logo, a white knockout of it, and a cropped
monogram (`markAspect` is the monogram's width/height). Nothing else changes.

## Animation boundary

Use PowerPoint's native transition and timeline APIs for deck animation. Image/video
generators such as Higgsfield may produce media assets for a specific slide, but they do
not create or preserve editable PowerPoint animation across arbitrary decks and therefore
must not be part of the universal animation step.
