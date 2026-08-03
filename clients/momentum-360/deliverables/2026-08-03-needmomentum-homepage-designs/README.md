# needmomentum.com homepage — two design directions

Two complete, long-form homepage builds for **Momentum**, made to answer Jenny
McClain Miller's feedback on the Momentum 360 redesign. Both make Momentum the
agency brand and Momentum 360 a service. Both keep the brand blue and gold. Both
cut the copy roughly in half.

| | Design A | Design B |
|---|---|---|
| Name | **Puts You On the Map** | **The Gold Line** |
| Relationship to the existing work | The earth/globe design, kept intact and rebranded | A new direction |
| Signature | Animated SVG wireframe globe with pointer parallax and a Philadelphia coordinate lock | One gold stroke, drawn by scroll, that every station hangs off |
| Motion | Globe parallax, scroll dissolve, 3D tilt, scan line, count-ups | Particle logo assembly, particle KPI pops, horizontal swipe deck, liquid glass with pointer sheen, scroll-driven mask wipes, photo grade on attention |
| Sections | 13 `<section>` in `<main>` | 16 stations (ST/01 – ST/16) |
| Risk | Lower — recognisably the design already in play | Higher ambition, more novel mechanics |

**Start here:** `review/index.html` — the comparison hub with the feedback
scorecard, the SEO answer, and the pre-launch blockers.

## What Jenny asked for, and where it lands

| Feedback | Answer |
|---|---|
| *"more cutting edge direction — I need movement and visuals"* | Design A adds scroll dissolve, tilt and parallax to the existing world. Design B is built around motion: particle assembly, a swipe deck, mask wipes, a scroll-drawn rail. |
| *"Way too text and copy heavy"* | Hard copy contract: every section is visual-first and capped at 55 words of body copy. Measured by `tools/qa.mjs`. |
| *"take the needmomentum.com address and curate as the main brand/agency page"* | The Momentum lockup is the brand throughout both builds. 360 appears only as a service. |
| *"virtualtours address … sounds limiting"* | Seven services are peers. No single service owns the front door. |
| *"SEO on virtual… not disrupting it"* | This homepage changes no URLs and fires no redirects, so it carries zero migration risk. Full plan in `docs/SEO-CONSOLIDATION.md`. |
| Dillon: *"move 360 to a service"* | Done — and 360 keeps a dedicated moment with its Philly 100 and Inc. 5000 awards, so the equity is not thrown away. |

## Layout

```
shared/
  tokens.css              brand, type, motion and shape tokens — byte-identical in both builds
  assets/
    brand/                the logo, vector-traced from the client's own file
    img/  badge/  case/  video/
design-a/                 "Puts You On the Map"   index.html · styles.css · script.js
design-b/                 "The Gold Line"         index.html · styles.css · script.js
review/                   the comparison hub Jenny receives
netlify.toml              one site, three paths; / redirects to /review/
_headers                  strict CSP — no CDN scripts anywhere
tools/
  build-assets.py         fetches + encodes every image, then syncs into both builds
  qa.mjs                  headless-Chromium QA: a11y, broken images, weight, screenshots
qa/                       QA screenshots, desktop + mobile, per design
docs/
  BRAND_GUIDELINES.md     the extracted logo, the measured palette, usage rules
  ACCESSIBILITY_AUDIT.md  what was checked and what passed
  SEO-CONSOLIDATION.md    the answer to Jenny's SEO question, with the redirect table
  RELEASE_REPORT.md       what shipped, measured weights, and the open blockers
```

## The logo

The mark and wordmark were **vector-traced from the client's own logo file**
(`needmomentum.com/wp-content/uploads/2018/09/needmomentum_logo_blue.png`,
800×172) rather than redrawn. The result is `shared/assets/brand/momentum-lockup.svg`
— a ~9 KB scalable lockup that tints from CSS via `currentColor`, plus blue,
gold, paper and duotone variants and a favicon.

Colours are **measured from the logo pixels**, not chosen:

| Token | Hex | Source |
|---|---|---|
| `--gold-500` | `#F1B31E` | Momentum 360 wordmark, dominant fill |
| `--blue-500` | `#2A80C2` | Need Momentum mark, solid fill |
| `--blue-700` | `#0054A8` | 360 logo deep gradient stop |
| `--blue-300` | `#72BADE` | 360 logo highlight stop |

## Running it

```bash
# rebuild every image from source into shared/assets/
python3 tools/build-assets.py                # add --skip-download to use the cache

# serve the whole deliverable and QA all three pages
python3 -m http.server 8899
node tools/qa.mjs http://localhost:8899      # exits non-zero on a hard failure
```

## Deploying

**One Netlify site serves all three.** Point it at this directory
(`publish = "."`) and you get:

| Path | What |
|---|---|
| `/` | 302 to `/review/` |
| `/review/` | the comparison hub — send Jenny this link |
| `/design-a/` | Puts You On the Map |
| `/design-b/` | The Gold Line |

All three designs reference `../shared/assets/` and `../shared/tokens.css`
directly, so there is exactly one copy of every image and one token file — the
two builds are guaranteed byte-identical on imagery, and the repo carries no
duplicated binaries. Everything is `noindex`; these are concepts, not the live
site.

No CDN scripts: the house `_headers` set `script-src 'self'`, so all motion is
hand-rolled. Google Fonts is the only third-party origin, and the YouTube embeds
are click-to-play facades that load nothing until activated.

## Known blockers before anything goes live

See `docs/RELEASE_REPORT.md` for the full list. The load-bearing ones:

1. **Three brand names are live simultaneously** — needmomentum.com is currently
   branded "Momentum Digital", the wordmark reads "MOMENTUM", the tours brand is
   "Momentum 360". These builds standardise on **Momentum**; that call needs
   confirming.
2. **Two phone numbers, so probably two Google Business Profiles.** Highest risk
   to local rankings, and it needs GBP access to resolve.
3. **Address conflict** — 1635 vs 1633 Market Street. NAP inconsistency hurts
   local SEO.
4. **No owned 360 panorama exists** in any repo or on either live site.
5. Two award badges are too small to ship (89px); Google Partner renders as a
   text credential in the interim.
6. Client logos (Berkshire Hathaway, Penn State, Wells Fargo) are held out
   pending written permission.

Per the house maker/checker rule, the build identity cannot sign off its own
visual review — an independent pass is still required before launch.
