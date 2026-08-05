# DESIGN.md — NYC Entertainment Portfolio · Attribution Pass

Redesign of the deployed proof at
`nyc-entertainment-attribution-dashboard-20260804.netlify.app`.
Filenames are unchanged (`index.html` / `styles.css` / `app.js`) so this drops
straight onto the existing Netlify site.

## Thesis (kept from the original)

Attribution is an accountable service handoff, not a wall of KPI cards. The
midnight-desk / ivory-service-ticket world was the strongest thing about the
first build, so it was deepened rather than replaced.

## What changed and why

### 1. The encoding contract (new)

The original used brand orange for the logo, the route line, the active tab,
the stage numbers, the action indices, the ROAS figure and the section rules —
so orange meant everything and therefore nothing. Three rules now hold:

| Rule | Consequence |
|---|---|
| **One data hue.** An ordinal blue ramp carries every quantity. | Nothing else in the page competes with a data mark. |
| **Brand orange is chrome only.** It never encodes a quantity or a state. | Orange marks structure — active venue, rules, stamps, stage numerals. |
| **Status is glyph + word + ink.** Never hue alone. | Works under CVD, greyscale print and `forced-colors`. |

The ramp is `--d-strong #1c5cab` → `--d-mid #3987e5` → `--d-track #6da7ec`,
validated with the dataviz validator in `--ordinal` mode against **both** paper
surfaces the marks actually render on:

```
$ node validate_palette.js "#1c5cab,#3987e5,#6da7ec" --ordinal --mode light --surface "#fffaf0"
  [PASS] Lightness monotone · [PASS] Adjacent ΔL · [PASS] Light-end contrast 2.41:1 · [PASS] Single hue
$ node validate_palette.js "#1c5cab,#3987e5,#6da7ec" --ordinal --mode light --surface "#f6ecdb"
  [PASS] Lightness monotone · [PASS] Adjacent ΔL · [PASS] Light-end contrast 2.14:1 · [PASS] Single hue
```

Two palettes were tried and **rejected by the validator**, not by taste:

- Four status colours as adjacent stacked segments (exact / source / modeled /
  unmatched) — `#fab219` ↔ `#ec835a` scored normal-vision ΔE 13.6, below the 15
  floor. Yellow beside orange is the documented risky pair. Dropping the
  "modeled" segment removed the adjacency.
- Darkened status inks as a categorical set — chroma floor and CVD separation
  both failed. That is fine, because status here is never a colour-coded set:
  each state ships a distinct glyph (`✓` / `~` / `✕`) and the word itself.

### 2. Charts, where there were none

The original had zero visual encoding — every number was a text row, and the
one SVG (`.route-map`) was positioned behind the cards where nothing could see
it. Four figures now do real work:

- **Coverage meter** — the hero `61%` was previously an unexplained assertion.
  It is now a part-to-whole meter decomposing collected revenue into exact
  (`$4,392`) + platform source (`$908`) + unmatched (`$1,900`) = `$7,200`, so
  the number is checkable on its face. A ratio against a limit is a meter, not
  a chart.
- **The pass** — four stage nodes joined by three ribbons whose **thickness
  carries the pass-through rate**. Raw counts are deliberately *not* compared
  across stages, because the units differ (tagged visits → bookings → completed
  visits → dollars). Rates are unitless and therefore comparable; that is the
  only honest thing to encode across the handoffs.
- **Reconciliation** — two bars on one shared dollar axis: booked value in
  neutral (context) and Toast collected split matched / unmatched (the subject).
  This is the *emphasis* pattern, and it is also the only form that respects the
  page's own rule — see §4.
- **Readiness matrix** — the flat six-item list became sources × gates
  (docs / access / pull), which is the structure the copy already referred to
  as "gate 01 / 02 / 03".

Mark specs follow the house rules: 2px surface gaps rather than borders between
segments, a 4px rounded data-end applied to whichever segment actually renders
last, hairline solid rules (never dashed) on axes, legends always present, and
a table-view twin behind every figure.

### 3. Data integrity (was broken)

The deployed page shipped two copies of every figure — static HTML and the JS
model — and they had drifted badly:

| Figure | Static HTML | JS model | Now |
|---|---|---|---|
| Booked value | `$28,470` | `9000` | derived, one source |
| Toast collected | `$24,186` | `7200` | derived, one source |
| Matched | `$20,066` | `5300` | `revenue − unmatched` |
| Collected ROAS | `Modeled 8.0×` | `2.1` | `matched ÷ spend` |
| Unmatched | `$4,120` | `1900` | model input |

Anyone with JS disabled — and every reader during first paint — saw the wrong
numbers. `derive()` is now the only place a dependent number is produced:
`matched`, `exactValue`, `sourceValue`, `roas` and all three rates are computed,
never stored. The markup's initial values match the portfolio 30-day model
exactly, so the no-JS state is honest.

`roas` deserves a note: the original's hard-coded `2.1` did not equal
`revenue ÷ spend` (2.88) but did equal `matched ÷ spend` (2.12). The stricter
reading is the correct one for an attribution page — only attributed revenue
counts — so that is what is computed, and the label says so.

### 4. The rule the old layout broke

The methodology says booked value and Toast net sales are different economic
stages that must never be summed. The old "closeout equation" rendered
`Booked → Collected − Unmatched = Matched` as one continuous four-box equation,
which reads as arithmetic straight through. The arithmetic is only valid
*inside* Toast. So now the two stages are separate bars with an explicit guard
note between them, and the `+` / `=` row appears only where the arithmetic
holds: `matched + unmatched = collected`.

### 5. Layout and typography

- **Truncation fixed.** `white-space: nowrap` + ellipsis had been clipping the
  primary navigation labels — "HIGH LINE CO…", "RORY'S ROO…", "VENUE UNRE…".
  Names now wrap to two lines and are read in full.
- **"ALL" no longer collides with "PORTFOLIO"** — the index column was a fixed
  42px, too narrow for a three-letter label.
- **The `Unmatched` stamp no longer overflows its box.** Its grid track was
  narrower than the word's min-content, which also pushed the whole page 8px
  wide at two breakpoints.
- **Rails trimmed** from 250 + 348px to 226 + 302px. At 1512px the old rails ate
  40% of the screen and squeezed each pass stage to **112px**; stages now get
  157px and sub-metrics stack label-over-value to fit.
- **Microtype raised.** The old scale bottomed out at `0.58rem` (≈8.7px). The
  floor is now `0.75rem` (12px) and the base is 16px.
- **Heading outline corrected.** `<h1>` was "Venue pass" in the sidebar while
  the actual page title was an `<h2>`. There is now one `<h1>`, and it is the
  page title.
- **Numerals.** `tabular-nums` only where digits align vertically (table rows,
  axis ticks); large standalone figures use proportional figures, and the hero
  figure uses the text sans rather than the condensed display face.

### 6. Motion

Transform and opacity only; nothing animates geometry. Value changes count
between models by interpolating the whole model object, so no two figures can
disagree mid-transition. Bars and meter segments transition width via CSS.

Reveals are decoration on secondary blocks only — the two data cards are never
animated, because a dashboard's primary content must not be gated on scroll.
There is also a hard 1.6s safety net that reveals everything regardless: a
stuck IntersectionObserver (headless capture, print-to-PDF, restored scroll
position) must never leave content at `opacity: 0`. The first build of this
redesign had exactly that bug, caught in verification.

### 7. Accessibility

- `role="tablist"` with roving `tabindex` replaces six always-tabbable buttons
  carrying `aria-pressed`.
- Every figure has a table-view twin; tooltips enhance, never gate. Hover and
  keyboard focus show the same tooltip.
- Status never relies on hue: glyph + word + ink, three channels.
- `prefers-reduced-motion` opts out of counting, transitions and reveals.
- `forced-colors: active` swaps fills for system colours and keeps the shape
  channel.
- Touch targets are ≥44px on controls; chart marks are focusable hit targets.
- Contrast was measured, not assumed. Worth recording: **the original passed AA
  on every pair measured** (14 paper-surface and 5 rail pairs) — contrast was
  not one of its defects. Every new token was checked to the same bar, and two
  candidates were rejected and darkened (`--ink-3` from `#6d7889`, which scored
  4.3:1 on ivory, to `#5f6b7c` at 5.2:1).

### 8. Resilience and delivery

- Google Fonts is a hard dependency that **did** fail during development, so
  `@font-face` fallbacks with metric overrides (`size-adjust`, ascent/descent)
  keep the layout stable when the CDN is unreachable.
- `noindex, nofollow` in markup and as an `X-Robots-Tag` header — prospect demos
  never get indexed.
- Deep-linkable state: `#venue=puttery&period=7&tier=exact` survives reload and
  back/forward. Theme persists in `localStorage`.
- Print stylesheet drops chrome, forces the collapsed methodology open via
  `beforeprint`, and keeps cards from breaking across pages.

## Verification

`verification/` holds the palette validator output, the token contrast sweep and
screenshots at 390 / 820 / 1080 / 1512px in both themes. Checks run: horizontal
overflow, console errors, stuck reveals, per-stage width, and theme plane colour.

## Known limits

- A ribbon thinner than 3 SVG units is floored at 3 so a very low rate stays
  visible. The exact value is always direct-labelled and in the table view, so
  the floor never stands in for the number — but it is a floor, and it is why
  the 5.6% ribbon looks slightly thicker than 5.6% of the band.
- Per-gate readiness states in the matrix are the documented capability states
  from the original copy, expanded into the docs/access/pull structure the copy
  already implied. They are not new facts about the accounts.
- Every figure remains modeled. Nothing here is live data.
