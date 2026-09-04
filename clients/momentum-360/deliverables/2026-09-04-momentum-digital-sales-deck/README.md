# Momentum Digital sales deck — 2026-09-04

**Deliverable:** `output/Momentum-Digital-Sales-Deck.pptx` — 26 slides, fully editable,
Arial throughout so it renders identically on any sales laptop.

Origin: Mac Frederick asked Dillon in #ai-tech-news whether AI could build a better deck.
His brief: the current deck is old and outdated, needs updating and refreshing, more
services, case studies and pricing, plus AEO and AI marketing.

## Build and QA

```bash
node build-deck.mjs
```

```bash
pwsh -File "$HOME/.claude/skills/client-deck/scripts/render-qa.ps1" -Pptx ./output/Momentum-Digital-Sales-Deck.pptx -OutDir ./tmp/render
```

The build prints a fit warning for anything that would clip; it currently prints none.
The renderer drives desktop PowerPoint headlessly (no window, no focus steal) and writes
one PNG per slide to `tmp/render/`, plus `tmp/contact-sheet.png`.

All layout lives in the `client-deck` skill (`~/.claude/skills/client-deck/`).
`build-deck.mjs` holds only content. Changing the brand system changes every Momentum
deck at once.

## The old deck could not be retrieved

`https://shareai.it/momentum-marketing-deck.pdf` is unreachable because **the domain
`shareai.it` has no DNS record at all** — `Resolve-DnsName` returns NXDOMAIN for both
`shareai.it` and `www.shareai.it` from this host, while needmomentum.com and
momentumvirtualtours.com resolve fine from the same machine. This is a dead domain, not a
network fault. The deck was therefore rebuilt from the live site rather than edited.

If Mac has the PDF locally, worth a second pass to check nothing important was dropped.

## Sourcing rule

Every statistic, result and price on a slide traces to a row in `SOURCES.md`, which names
the exact needmomentum.com page it came from. Speaker notes on each slide repeat the
sources in a `[Sources]` block so whoever is presenting can defend any number live.

Three case studies were **deliberately excluded or trimmed** because their published
figures contradict themselves — see the "Deliberately excluded" section of `SOURCES.md`.
Nothing was invented to fill those gaps.

## Deck structure

| # | Slide | |
|---|---|---|
| 1 | Marketing that makes the phone ring | Opener |
| 2 | A Philadelphia agency built for small business | Who we are |
| 3 | Recognized by the platforms we run on | Credentials |
| 4 | Section 01 — What we do | |
| 5 | Seven lines, one growth system | Service map |
| 6 | SEO | + MicroTech and Everyday Life proof |
| 7 | Paid media | + four cost-per-lead figures |
| 8 | Social media | + Grand Entry Doors Pinterest |
| 9 | Design and web | + Nenner Law |
| 10 | Content, video and virtual tours | + Momentum 360 division |
| 11 | AI marketing and automation | + The Kind Insurance automation |
| 12 | **Answer engine optimization** | **New. Needs sign-off** |
| 13 | Twenty industries | |
| 14 | Section 02 — Proof | |
| 15 | A year of client outcomes, in eight numbers | |
| 16–20 | UnderX · Detroit Dispensing · The Kind Insurance · Bedford · Drip IV | Full case studies |
| 21 | Nine more clients, nine more numbers | |
| 22 | Section 03 — Working together | |
| 23 | How an engagement runs | + published guarantee |
| 24 | Three ways to start | Core pricing |
| 25 | Add on and single service pricing | |
| 26 | Start with the free audit | Close |

## Needs Mac's sign-off before this goes to a prospect

1. **AEO scope and price (slide 12).** Momentum has no published AEO page. The scope on
   that slide is drafted, not sourced. The only figure on it — AI visibility 35 — comes
   from the Detroit Dispensing Solutions case study. **No price is quoted.** Mac needs to
   set both scope and price.
2. **The guarantee language (slide 23 and the pricing slides).** "We guarantee to grow
   your business online or your money back" is quoted verbatim from
   needmomentum.com/marketing-prices/, as are the per-package guarantees (guaranteed
   growth on Kickstart, first page of Google on the twelve month package, rank increase on
   GBP management). Confirm these are still current and still what Momentum wants in front
   of prospects in writing.
3. **Pricing currency.** All figures are the published ones. Confirm the $999 / $2,999 /
   $10,000 tiers and the $1,000 and $3,000 monthly minimums are current.
4. **Client names.** Every case study client is named publicly on needmomentum.com
   already, so no new disclosure is being made — but confirm none has since asked to be
   removed.
5. **Fractional CMO** appears on the service map. It was in the brief but has no dedicated
   page on the site. Confirm it is a live offer.
6. **Three site data problems worth fixing on needmomentum.com** (found while sourcing):
   - The "3 Months Organic Stats — 7.9K / 167K / 4.7% / 130+" block appears verbatim on
     the Sweetlife, LaserSkin, Tristate and IV-therapy case study pages. It is Sweetlife's
     data pasted into a shared template.
   - Sweetlife's impressions counter is set to 1.64K while the prose says 167K.
   - Prototype:IT's counters disagree with their own suffixes ("10854" with a "k" suffix,
     "17.5k Search Position Improvement").
   None of these were used in the deck.

## Not included, and why

- **No client logos.** Momentum publishes client names but not a permissioned logo wall.
- **No team photos or office imagery.** None available at usable resolution behind the
  site's bot protection.
- **No testimonial quotes.** The Google reviews on the site render through a third-party
  widget; attributing them in a sales deck should be Mac's call.

Any of the three would strengthen the deck. They are additions, not gaps in the argument.
