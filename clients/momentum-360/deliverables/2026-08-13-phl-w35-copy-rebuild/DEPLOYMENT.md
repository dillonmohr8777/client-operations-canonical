# PHL Week 35 copy rebuild

- Live URL: https://phl-2026-w35.netlify.app
- Netlify site: `phl-2026-w35`
- Site ID: `3f59dbeb-7877-4413-a48a-0e082e77ee88`
- Final production deploy: `6a7e0b90d562b7b7b06e0598`
- Previous production deploy before this work: `6a7e014998c6f11a7dc470f3`
- Published: 2026-08-13

## Scope

- Recovered the exact 377-file production package because no local source copy was available.
- Rewrote all 25 prospect pages with customer-facing service, mission, process, decision, and contact copy.
- Expanded each page to 770–892 visible words in the build report.
- Replaced the old metadata descriptions and removed generator, harvest, staging, truncation, and placeholder language.
- Preserved all business names, addresses, phone numbers, official URLs, logos, image assets, no-index policy, and site-specific visual systems.
- Corrected the responsive header and removed first-paint blur/disappearing-copy behavior.
- Added six official owner/founder/partner photographs covering eight identified people at Boyle Energy, Golden Sea, IVC Wealth Advisors, and Weathers Motors. Every image has an official-page and direct-image provenance record in `FOUNDER-PHOTO-SOURCES.json`.
- Replaced the logo-sampled circle particles with the IMMOHRTAL reference magic-ink reveal on all 25 closing logos. Each mark now fades in over 1.4 seconds, settles from 1.06 scale over 2.1 seconds, and clears from a 26-pixel high-contrast desaturated blur over 2.3 seconds.
- Removed both legacy bubble systems completely: no closing-logo canvas, no fixed-dock canvas, no circle drawing code, no bloom keyframes, and no particle state classes remain in the generated pages.

## Verification

- `FINAL-QA.json`: 25 sites, 0 issues, and 406 image references checked, including founder assets and one exact magic-ink target per site.
- Live HTTP readback for deploy `6a7e0b90d562b7b7b06e0598`: hub, all 25 child routes, and all 25 logo files returned 200; all 25 pages contained the magic-ink system and none contained legacy bubble code.
- Live founder readback: all six JPEG assets returned 200 with `image/jpeg`; the four expected founder sections rendered 1, 1, 3, and 1 cards.
- Live headers: `X-Robots-Tag: noindex, nofollow, noarchive`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`.
- Live metadata descriptions: 159–212 characters, with no rejected placeholder phrases.
- Browser QA: representative desktop and 390 × 844 mobile checks passed with no page-level horizontal overflow or console warnings/errors.
- Mobile browser batch: all 25 pages passed H1, section, hero-image, link, overflow, and rejected-copy checks.
- Reduced motion: the closing mark renders immediately at full opacity with no blur, transform, or transition.
- Live interaction readback: the production mark began at `blur(26px) contrast(2.4) saturate(0.3)`, passed through a visible mid-transition ink state, and finished at full opacity with no filter or transform. Desktop and 390-by-844 mobile checks had no document overflow and no console warnings or errors.
- Hub controls: seven restaurant results and one exact `Bala Financial` search result were confirmed.

## Detector note

The current Impeccable detector returned exit code 2 for 1,161 inherited findings across the 25 recovered visual systems. A narrow scope exception is documented in `IMPECCABLE-EXCEPTION.md`; the detector found zero selectors or snippets tied to the new magic-ink component.
