# Johnny's Pizza homepage accessibility report

Audit date: August 15, 2026  
Target standard: WCAG 2.2 Level A and AA  
Artifact: `sites/johnny-s-pizza/index.html`

## Outcome

No automated WCAG A or AA violations were found at the three tested viewports. The page also passed the bounded keyboard, focus, reduced-motion, overflow, image-loading, and runtime checks described below. This report is implementation evidence, not a legal accessibility certification.

| View | Size | Axe passes | Axe violations | Console or page errors | Failed requests | Broken images | Horizontal overflow |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Desktop | 1440 × 1000 | 39 | 0 | 0 | 0 | 0 | 0 px |
| Mobile | 390 × 844 | 39 | 0 | 0 | 0 | 0 | 0 px |
| Narrow | 320 × 720 | 39 | 0 | 0 | 0 | 0 | 0 px |

## Manual and interaction checks

- One H1 and a sequential H1/H2/H3 outline are present.
- Header, named navigation regions, main content, and footer landmarks are present.
- The skip link is the first tested focus target and becomes visibly positioned on focus.
- Sixteen sequential focus stops were sampled at each viewport; every sampled link and button had a visible 4px focus outline.
- The service selector uses native buttons, exposes spaced accessible names, updates `aria-pressed`, and supports click plus Arrow, Home, and End keys.
- The mobile navigation exposes `aria-expanded`, closes on Escape, and is inert while visually closed.
- Interactive controls meet the WCAG 2.2 24px target-size floor; primary touch targets are generally 44px or taller.
- `prefers-reduced-motion: reduce` changes smooth scrolling to `auto` and reduces transition and animation durations to 0.01ms.
- All nine images load and have descriptive alt text. Concept imagery is identified as unverified concept imagery rather than first-party photography.
- The 320px layout has no document-level overflow or clipped selector labels.

## Contrast evidence

The static scanner could not determine contrast where real raster ticket-paper or brushed-steel textures are used. Axe therefore returned one incomplete contrast group, not a violation. The implemented foreground and solid fallback pairs were checked directly:

| Pair | Ratio | WCAG AA normal text |
| --- | ---: | --- |
| Espresso black on butter ticket | 15.21:1 | Pass |
| Espresso black on brushed steel | 6.88:1 | Pass |
| Butter bright on espresso black | 16.77:1 | Pass |
| Butter bright on lacquered tomato | 5.58:1 | Pass |
| Candle amber on espresso black | 8.95:1 | Pass |

## Evidence

- `evidence/netlify-production/inspection.json`
- `evidence/netlify-production/desktop-viewport.png`
- `evidence/netlify-production/mobile-viewport.png`
- `evidence/netlify-production/narrow-full.png`
