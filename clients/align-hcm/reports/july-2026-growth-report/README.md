# Align HCM — July 2026 Growth & Attribution Report

Next.js 15 (App Router) + React 19 + Framer Motion, exported as static files.
Deployed at `align-hcm-july-2026-growth-report.netlify.app`.

```bash
npm install
npm run dev        # localhost:3000
npm run build      # static export into out/
npm run typecheck
```

`netlify.toml` in this directory carries the build config — the repo root is not
the site root, so `base` points here and `publish` at `out/`.

## Stack, and why

| Choice | Reason |
|---|---|
| **Next.js 15, `output: 'export'`** | Static files, so the deploy model is unchanged from the previous hand-written version — no server, no runtime. |
| **Framer Motion (`motion` v12)** | The animation layer. Chosen over hand-rolled CSS because the pop system needs variant staggering, spring-damped pointer tilt, count-up numerals, and `AnimatePresence` for the lightbox. |
| **Tailwind 4** | Same stack as `immohrtal-site`, so the two codebases read alike. Design tokens plus the motion, print and reduced-motion layers live in `app/globals.css`. |
| **`next/font/google`** | DM Sans + Plus Jakarta Sans are downloaded at build time and self-hosted in the export, so the page makes **zero** external requests at runtime. |

Note: `immohrtal-site` is itself Vite + React 19 + Tailwind 4, not Next.js. Next
is used here because that was the ask; what is ported from Immohrtal is the
*motion vocabulary*, not the build tool.

## The motion system

`components/motion-primitives.tsx` ports Immohrtal's vocabulary into Framer
Motion. Immohrtal's "pop" is a card arriving as an object — it rises, un-tilts
out of a 9° `rotateX`, and scales up from `0.94` over ~0.85s on
`cubic-bezier(0.17, 0.4, 0.02, 0.99)`. Everything here is built on that one idea.

| Primitive | What it does | Immohrtal ancestor |
|---|---|---|
| `Pop` | The 3D pop-in, or a gentler `rise` for prose | `.reveal-pop` / `.reveal` |
| `PopGroup` / `PopChild` | Staggered arrival, so a grid lands instead of appearing | `.reveal-late` / `.reveal-later` |
| `TiltCard` | Spring-damped pointer tilt plus a cursor-tracked `.sheen` | `TiltBox.tsx` |
| `Magnetic` | Buttons that lean toward the cursor | — |
| `CountUp` | Numerals that count up on entry | — |
| `GrowBar` | Tier and pace bars that grow into place | — |
| `PopWords` | Headline landing word by word out of a mask | — |
| chrome numerals | `.chrome-orange` / `-navy` / `-light` gradient-clipped text | `--chrome` / `--chrome-light` |

Three deliberate departures from a naive implementation:

1. **The in-view trigger is scroll-position driven, not `IntersectionObserver`** —
   so not motion's own `whileInView`. IO callbacks are async and coalesced, so a
   fast flick, a jump-link or a programmatic scroll can outrun them and leave a
   panel stranded at `opacity: 0`. This was observed, not hypothesised: with
   `whileInView`, 58 of 68 animated blocks stayed invisible after a fast
   programmatic scroll. `useLatchedInView` re-checks live geometry and latches
   once true, so nothing can stay hidden.
2. **Every wrapper sets `min-width: 0`.** Grid and flex items default to
   `min-width: auto`, meaning their minimum size is the min-content of their
   subtree. One 730px screenshot inside a `1fr` track was enough to push the
   page 351px wider than a 390px viewport. Grid templates use `minmax(0, 1fr)`
   for the same reason.
3. **`PopWords` puts the inter-word gap in a text node between the masks.** An
   inline-block with `overflow: hidden` collapses its own trailing whitespace,
   which welds the headline into one word and takes copy-paste and screen
   readers with it.

### Three independent guarantees that an animation never hides content

Motion renders its `initial` state into the static HTML, so the export ships
with `opacity: 0` on animated blocks. That is only safe with fallbacks:

1. A `<noscript>` style block — JS disabled entirely. Pure CSS, zero flash.
2. A failsafe timer in `app/layout.tsx`, disarmed by `HydrationBeacon`. If
   hydration never happens, `.no-js` is applied and everything is forced visible.
3. `@media (prefers-reduced-motion: reduce)` in CSS forces `opacity: 1` and
   `transform: none`, so reduced-motion correctness does not depend on the
   `useReducedMotion()` hook's first value.

Anything animated by a plain `motion.*` rather than via a primitive must carry
`data-pop`, or these nets miss it — that is how the eyebrow, hero paragraph and
CTA row initially vanished in the JS-disabled render.

## Content changes carried over from the previous rebuild

**Removed the duplicated sections.** The original told the same story more than
once. Section count went from 12 to 6.

| Removed | Why |
|---|---|
| `#rank-one` "Fifteen number-one rankings" | Duplicate of `#top-rankings` — both introduced the same 15 queries |
| `#ai-query-ledger` | Duplicate of `#ai-overviews` — the 11 AI Overview queries were listed twice, then illustrated with the same screenshots again |
| `#signals` "Four proof sources" | Restated the hero and ribbon numbers with no new information |
| `#authority` | One flat stat (Authority Score 25, unchanged) |
| `#blogs` | Folded into `#keywords` as a sub-stat row |
| `#content-performance` | Page-views table — cut, not a leadership metric |
| Marquee metric ribbon | Duplicated every stat in the DOM to fake the scroll loop |

**Fixed the blurry screenshots.** The original CSS pushed 1265px captures into
~600px two-column grid cells with `object-fit: cover`, which both downscaled the
text to 0.47× and cropped the bottom off every image. Now:

- `public/assets/aio/` holds crops of the AI Overview answer block only, so the
  answer text is the content instead of 60% dead whitespace.
- `public/assets/serp/` holds the full search result, de-scrollbarred, for the
  lightbox.
- Nothing uses `object-fit: cover`. No capture is cropped by CSS.
- On phones the card pans horizontally at 1:1 rather than shrinking the text.
- Any capture opens in a lightbox with a Fit / Full-size toggle at native 1182px.

**Order:** leads and attribution first, then ranking keywords, then AI Overviews
as the closing proof layer.

## Screenshot provenance and audit

`public/assets/original/` holds the 18 untouched July 31 captures (1265x712, JPEG data
with `.png` extensions as delivered). Everything in `public/assets/aio/` and
`public/assets/serp/` is derived from these by cropping — no upscaling from a smaller
original, and no resampling that invents detail. The one scaling operation is a
1.6x Lanczos enlargement of the already-cropped answer block for the `aio/`
variants, so that desktop renders above native instead of below it.

Each original was reviewed before being used as evidence. What they actually
show:

| Capture | AI Overview | Align HCM visible | Used as |
|---|---|---|---|
| `rank-one-01-align-hcm` | none | **yes** — #1 + knowledge panel | featured brand capture |
| `rank-one-02-align-human-capital-management` | none | **yes** — #1 + knowledge panel | rank list |
| `rank-one-13-ukg-pro-implementation-partner` | yes | **yes** — named in the answer text | AI Overview hero |
| `google-ai-overview-2` (= `rank-one-10`) | yes | **yes** — source pill in the answer | AI Overview, featured |
| `google-ai-overview-1` | yes | yes — #1 organic below the answer | AI Overview grid |
| `google-ai-overview-3` | yes | yes — #1 organic below the answer | AI Overview grid |
| `rank-one-03-common-challenges-in-hcm-implementation` | yes | no | AI Overview grid |
| `rank-one-05-data-conversion-migration` | yes | no | AI Overview grid |
| `rank-one-09-implementing-workday` | yes | no | AI Overview grid |
| `rank-one-14-ukg-pro-vs-ukg-ready` | yes | no | AI Overview grid |
| `rank-one-15-ukg-ready-vs-ukg-pro` | yes | no | rank list (near-identical to 14) |
| `rank-one-12-paylocity-payroll-cost` | yes | no | rank list |
| `rank-one-07-hcm-services-m-a` | partial (mid-render) | no | AI Overview grid, labeled as partial |
| `rank-one-06-data-conversion-strategy` | partial | yes | **unused** — `google-ai-overview-3` is the same query, fully rendered |
| `rank-one-08-hr-data-integration-services` | partial | yes | **unused** — `google-ai-overview-1` is the same query, fully rendered |
| `rank-one-04-common-challenges-with-hcm-implementation` | **no — "Searching…" skeleton** | no | **unused**, labeled "no clean capture" |
| `rank-one-11-paylocity-implementation-checklist` | **no — empty container** | no | **unused**, labeled "no clean capture" |

Two corrections to how the previous version presented these, both carried into
the copy:

1. The old page stamped a large green `#1` on all 15 rank captures, implying each
   screenshot proved a #1 position. Most do not — 9 of the 15 show a competitor
   or vendor page in the visible first result. The #1 claim belongs to the
   Semrush export; the captures are a separate live check. Both are now stated
   separately, with the honest count (6 of 15 show Align in the visible result
   area).
2. The old AI Overview gallery relabeled rank-one screenshots as "AI Overview"
   evidence, including `rank-one-04`, which caught Google mid-load and shows no
   AI Overview at all. Only genuinely rendered AI Overviews are shown now, and
   the one mid-render capture is badged as such.

Nine captures cover 10 of the 11 tracked AI Overview queries — two captures each
serve a matched query pair (`ukg pro vs ukg ready` / `ukg ready vs ukg pro`, and
the two `common challenges … hcm implementation` variants). The eleventh,
`paylocity implementation checklist`, returned an empty AI Overview container, so
no capture is shown for it.

Google was unreachable from the build environment, so nothing could be
re-captured; every screenshot here is one of the original July 31 files.

## Verified behaviour

Checked with Playwright against the built static export at 320 / 390 / 820 /
1400px:

- **No horizontal page overflow at any width.** The AI Overview cards pan
  internally instead (9 panning cards at ≤800px).
- **AI Overview answer text renders at 1.0×–1.64× of Google's own pixels** at
  every breakpoint — 1.0× at 320/390px, 1.06× at 820px, 1.1–1.64× at 1400px.
- **All 68 animated blocks resolve to `opacity: 1`.**
- No broken images, no console errors, no page errors.
- **Zero external network requests** — fonts are self-hosted in the export.
- Lightbox: opens, focuses close, locks background scroll, Fit/Full-size reaches
  native 1182px with panning on mobile, prev/next and arrow keys traverse all 13
  captures, Escape closes and restores scroll and focus.
- Reduced motion: no count-up, no tilt (`transform: none`), nothing hidden.
- JS disabled: header, headline, hero copy, CTAs, every stat and all 15 queries
  render — 7.5k characters of body text, 11 images.
- Headline `innerText` reads "Organic is now sourcing deals." — the split-word
  animation does not break selection or screen readers.
- Tap targets ≥ 38px tall. Body text meets WCAG AA (4.5:1) on both backgrounds.
- Print stylesheet drops chrome-gradient text back to solid ink.

## Data shown

Sourced from the July Semrush export, HubSpot (deterministic source capture live
since July 17) and LinkedIn analytics.

- 436 tracked keyword positions, 362 distinct queries, 58 ranking URLs
- Position tiers: 24 / 39 / 76 / 209 / 436 (Top 3 / 5 / 10 / 25 / 100)
- Blog tiers: 17 / 24 / 44 / 118 / 211 across 180 distinct queries
- 15 distinct queries at position #1
- 11 distinct AI Overview queries, de-duplicated from 14 export rows
- Semrush Authority Score 25, unchanged
- Traffic +51.2% year to date
- Leads: 6 native (4 organic + 2 AI) corrected to 9 (6 organic + 3 AI)
- 2 Google-origin and 1 ChatGPT-origin lead recovered from Direct; the ChatGPT
  record is the first identified AI-sourced deal
- Organic contact-to-deal 25% (5/20) vs Direct 5.6% (7/124) = 4.5x
- $54K verified organic win — the only verified currency figure in the report
- LinkedIn 216K annualized pace (110K Maher + 106K Align HCM), ~+70%

`$54K` is the only currency figure. No pipeline or forecast value is implied
anywhere. The page carries `noindex, nofollow` and contains no PII.
