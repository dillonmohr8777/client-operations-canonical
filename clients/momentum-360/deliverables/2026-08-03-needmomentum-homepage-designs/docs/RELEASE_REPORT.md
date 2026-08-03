# Release report

Two homepage builds for needmomentum.com, plus a review hub. Concepts for
internal review — all three are `noindex`.

## Measured, not claimed

`node tools/qa.mjs` against a local static server, headless Chromium, desktop
1440×900 and iPhone 13. **ALL CHECKS PASSED.**

| | Design A desktop | Design A mobile | Design B desktop | Design B mobile | Review |
|---|---:|---:|---:|---:|---:|
| Transferred (first load) | 214 KB | 219 KB | 199 KB | 457 KB | 37 KB |
| `<section>` in `<main>` | 13 | 13 | 16 | 16 | 4 |
| Prose words | 235 | 235 | 239 | 239 | 129 |
| Exactly one `<h1>` | yes | yes | yes | yes | yes |
| Images missing `width`/`height` | 0 | 0 | 0 | 0 | 0 |
| Broken images | 0 | 0 | 0 | 0 | 0 |
| Console errors | 0 | 0 | 0 | 0 | 0 |

Source weights:

| File | Design A | Design B |
|---|---:|---:|
| `index.html` | 35.6 KB | 31.1 KB |
| `styles.css` | 26.5 KB | 30.3 KB |
| `script.js` | 10.4 KB | 14.3 KB |
| `tokens.css` (shared, identical) | 8.0 KB | 8.0 KB |

`shared/assets/` totals ~3.2 MB across 105 files, but that is the **whole
responsive set** — AVIF + WebP at two or three widths each. A single visit
transfers ~200–460 KB because the browser picks one variant per slot and
everything below the fold is `loading="lazy"`.

Both designs and the review hub reference `../shared/assets/` directly, so that
3.2 MB exists **once** in the repo rather than three times, and the two builds
are structurally guaranteed to be showing the same imagery. The whole deliverable
is 7.4 MB including QA evidence.

Design B mobile is heavier (457 KB) because iPhone 13 reports DPR 3 and selects
the widest variants. Acceptable, and it is the honest number.

### Against the house budget

The house `frontend-build` budget is **27–37 KB of HTML** and *"one small inline
IntersectionObserver for scroll reveals — that's the entire JS budget."* That
budget belongs to the **single-file Philly-25 profile template**, not to a
multi-file agency homepage.

Stated plainly rather than silently violated:

- **HTML is inside the documented range** (35.6 KB and 31.1 KB).
- **JS is over the factory budget** — 10.4 KB and 14.3 KB against "one observer". The trade buys the particle assembly, the swipe deck, the parallax globe, the focus trap and the motion toggle. There is still **zero third-party JavaScript** and no framework.
- **Total assets are under** the 2 MB per-page figure from `epic-design/references/performance.md` on every measured load.
- No Core Web Vitals gate exists in the house standards. If one is wanted, it is a **new** gate, and Lighthouse has not been run here.

## What was built

### Design A — "Puts You On the Map"
The existing earth/globe design, kept intact and rebranded. Inline SVG wireframe
globe with three mouse-parallax depth planes, a rotating cage, gold location
markers with a Philadelphia HQ pulse, a hover-triggered scan line and a live
coordinate HUD. Terminal boot overlay. 13 sections. Momentum 360 keeps a heritage
section carrying the Philly 100 and Inc. 5000 awards.

### Design B — "The Gold Line"
New direction. A gold hairline enters at the logo, is drawn by scroll down the
left rail, and terminates in the submit button. 16 stations (ST/01–ST/16).
Signature mechanics:

1. **Particle assembly** — the logo is drawn to an offscreen canvas, its opaque pixels sampled on a DPR-scaled grid, and each sample flies in from a random orbit on a quart-out ease. Reused for the KPI numbers on scroll. Point budget reduced on narrow screens; skipped entirely under reduced motion.
2. **The swipe deck** — seven services on a native `scroll-snap` track with `overscroll-behavior-inline: contain`, prev/next buttons, arrow keys and a progress bar. Native scrolling, so nothing is hijacked.
3. **Liquid glass** — tinted fill + `backdrop-filter: blur(18px) saturate(1.4)` + a specular rim via `mask-composite` + a pointer-tracked gold sheen in `plus-lighter`. Opaque fallback where `backdrop-filter` is missing.
4. **Disappearing on scroll** — scroll-driven opacity/translate/blur dissolve on exit, plus a `mask-image` wipe on the ST/02 statement.
5. **Photo grade on attention** — every photograph is desaturated at rest and goes full colour on hover, focus, or being centred in the viewport (so touch users get it too).
6. At **ST/07** the rail closes into a circle, and that circle is the Momentum 360 mark.

### The logo
Vector-traced from the client's own file rather than redrawn. See
`docs/BRAND_GUIDELINES.md` for the method and the measured palette.

## Found and fixed during review

| Issue | Resolution |
|---|---|
| Design B's `<h1>` at `--t-hero` (6rem) wrapped to five lines at 1440px and pushed the primary CTA below the fold | Capped the arrival heading at `clamp(2.5rem, 4.3vw, 4.25rem)` and widened the copy column. CTA now ends at y=864 in a 900px viewport. |
| Sticky header covered section headings on anchor jumps | `scroll-margin-top: 5.5rem` on all anchor targets in both builds. Verified: heading top clears the header bottom on both. |
| Stroke-drawn art (the 360 ring, the ST/04 wires) vanished with motion off — killing the animation left the dash offset at "undrawn" | Resolve `stroke-dashoffset: 0` under both `[data-motion="off"]` and `prefers-reduced-motion`. |
| Full-page screenshots showed later sections blank | **Not a bug** — scroll-driven animations correctly hold their pre-entry state off-viewport. Confirmed by probing computed styles in view: all headings `opacity: 1`, 48/48 reveals fired. The QA harness now captures an in-motion fold shot plus a motion-off full-page shot so evidence is honest. |

## Findings worth acting on regardless of which design wins

Discovered while researching, all verified this session:

1. **needmomentum.com is already live** — WordPress/Elementor, ~85+ indexable URLs, and it already owns `/virtual-tours/` and `/momentum-360/`.
2. **Both domains are on the same server** (`35.212.102.180`), so consolidation needs no DNS change or new host.
3. **`needmomentum.com/about-us-new-draft/` is indexed** and competing with `/about-us/`. A draft page has leaked into Google.
4. **The live homepage `H1` is "Grow Your Business"** — no brand, no service keyword.
5. **The `og:image` is 171×76**, which renders as a broken social card.
6. **The existing earth site loads no font files** despite declaring Poppins and Source Serif 4.
7. **There is no `/virtual-tour-locations/philadelphia/` page** on the tours domain, despite Philadelphia being the home market. The geo cluster's sitemap is 8 months stale.

## Blockers before anything goes live

1. **Three brand names are in play simultaneously.** The live site is branded *Momentum Digital*, the wordmark reads *MOMENTUM*, the tours brand is *Momentum 360*. These builds standardise on **Momentum** with 360 as a service. **This call needs confirming** — it is the one decision the whole direction rests on.
2. **Two phone numbers** (215-876-2954 and 215-607-6482) imply **two Google Business Profiles**. Highest risk to local pack rankings; needs GBP owner access.
3. **Address conflict** — the site says 1635 Market Street, the Modern Luxury spread prints 1633. NAP inconsistency damages local SEO.
4. **No owned 360 panorama exists** in any repo or on either live site. Both builds argue the tour service with instrumentation instead of a tour still. Three equirectangular frames from the Matterport account would materially strengthen both.
5. **Two award badges are unusable at source resolution** — Best of Pennsylvania at 89×89, Google Partner at 89×50. Re-source at ≥400px. Google Partner currently renders as a text credential chip instead of a broken image.
6. **Client logos held out** — Berkshire Hathaway, Penn State and Wells Fargo do not appear anywhere until written permission is on file.
7. **Contact details need verifying against the live site.** The address and phone were read partly from a magazine scan.

## Not done

- **Lighthouse has not been run.** No CWV numbers are claimed.
- **No real screen-reader pass** (NVDA/JAWS/VoiceOver). Automated structure checks only.
- **Only Chromium was tested.** The Firefox path is handled by `@supports` guards and a JS fallback and is reasoned about, not observed. Safari is untested.
- **The forms are wired for Netlify but not connected.** They POST to `/thanks`, which does not exist yet.
- **Per the house maker/checker rule, this build has not been independently reviewed.** The identity that made it cannot sign off its own visual review. That gate is still open.
