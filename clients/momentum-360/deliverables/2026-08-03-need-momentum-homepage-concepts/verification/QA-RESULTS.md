# QA results

## Automated

- `npm test`: 3 of 3 tests passed.
- `npm run typecheck`: passed.
- `npm run build`: both static concepts built successfully.
- Dependency audit: 0 vulnerabilities.
- Direction contracts: both built HTML files retain their unique seed keys and exact finish directive.

## Responsive browser pass

Validated at 1440×1000 and true 390×844 Chromium device metrics.

- No horizontal overflow at either viewport for either concept.
- Mobile navigation opens and closes on both concepts.
- Signal primary audit CTA occupies y=678–734 at 390×844 and is fully above the fold.
- Reduced-motion media query was verified at 390×844.
- Both pages expose ten canonical free-audit links and one live WebGL canvas.
- Transparent logo treatment verified by computed background `rgba(0, 0, 0, 0)`.
- Mac/Sean founder labels and alt text were verified against the identity lock.

## Motion gate

- Map hero four-frame contact sheet: zero warnings; coherent continuous orbital change.
- Signal hero four-frame contact sheet: zero warnings; stronger but stable kinetic change.
- Signal proof four-state contact sheet: zero warnings; four readable real-photo transition states.

## Independent finish review

- Orbital Growth Map: PASS.
- Kinetic Signal Field: PASS.
- Remaining P0/P1 issues: none.

## Known non-blocking note

React Three Fiber currently emits Three.js's upstream `THREE.Clock` deprecation warning in local development. Both live production sites were checked separately and rendered with zero console errors.

## Kinetic Signal Field v2 — August 3 follow-up

### Automated and responsive

- `npm run typecheck`: passed.
- `npm test`: 3 of 3 tests passed.
- `npm run build:signal`: passed.
- `npx impeccable detect`: completed; the reviewer noted only broad shared-stylesheet token/radius advisories after the service progress animation was moved from width to a compositor transform.
- True Chromium viewports: 1440×1000, 390×844, and 390×844 with reduced motion.
- Horizontal overflow: 0px at desktop and mobile.
- Signal page exposes one semantic H1, three WebGL canvases, five exact-logo image uses, and no `Concept preview` text.
- The source logo is 800×172 RGBA with transparent corners and 109,948 fully transparent pixels.

### Motion and interaction

- Hero particle field begins resolving around 4.7 seconds, reaches the exact Momentum mark around 5.9 seconds, holds, disperses after 7.5 seconds, and loops on a 10-second cycle.
- The fixed ambient particle spine remains present from hero through footer.
- The service rail auto-advanced from 1 / 6 to 2 / 6 in the in-app browser, and the manual Next control also advanced from 1 / 6 to 2 / 6.
- Service cards support drag/swipe, scroll snap, auto progression, large hover tilt, pointer-position light, and keyboard focus.
- Primary CTA hover produced a non-identity 3D transform; all button controls retain visible 3px focus outlines.
- Mobile navigation opens correctly, every button has an accessible name, every image has alt text, and every link has discernible text.

### Fidelity ledger

| Comparison point | Concept evidence | Render evidence | Result |
|---|---|---|---|
| First viewport | Sculptural two-line headline, dark field, exact mark, glass header, physical yellow CTA | `signal-v2-1440x1000-hero.png` | Matched with a code-native Unbounded display face, layered chromatic depth, and live particles. |
| Logo morph | Exact circular Momentum mark assembled by the signal field | `signal-v2-hero-motion-contact-sheet.png` | Matched with a sampled exact-logo point cloud plus exact PNG resolve layer. |
| Service rail | Central deep-glass card, adjacent chapters, physical arrows, progress rail | `signal-v2-1440x1000-services.png` | Matched; production adds drag, auto-swipe, scroll snap, pause-on-interaction, and pointer tilt. |
| Spatial media | Exact wordmark in a dimensional orbit chamber beside real media | In-app browser spatial-media capture | Matched with the exact transparent logo, rotating depth rings, live media hover, and a tactile CTA. |
| Founder identity | Blond Mac, dark-haired Sean, glass frames and background depth | `signal-v2-390x844-founders.png` and desktop founder capture | Matched using the current workshop Mac portrait and verified Sean portrait; identities are not synthesized. |
| Footer resolve | Exact wordmark condenses from particles with a 3D circular mark object | In-app browser footer resolve capture | Matched with the same 10-second condensation system and exact-logo orbit object. |
| Responsive behavior | Desktop spectacle with intentional mobile continuation | `signal-v2-390x844-hero.png` | Matched; no clipped headline or horizontal overflow remains. |

### Copy and deviations

- Above-the-fold copy diff: no additions, removals, renames, or reorderings. The hero statement, headline, body, two CTAs, navigation, and four ticker labels remain exact.
- Intentional deviation: the generated concepts depict denser ribbon-like particle trails. Production uses a performant GPU point shader plus optical CSS layers so real text, controls, the exact logo, and responsive behavior remain code-native.
- Intentional deviation: the generated system comp's Sean rendering was not used. Production retains the real, verified Sean image.

### Independent v2 finish review

- Result: PASS.
- P0/P1 issues: none.
- Bounded polish fix: changed service progress animation from `width` to `transform: scaleX()`.
- Agency signoff judgment: a high-end interactive agency would sign off on this staging/review concept.

### Particle-only production correction

- Production deploy: `6a70e430aa0359f11eb97b99` at <https://need-momentum-signal-20260803.netlify.app>.
- Hero foreground exact-logo overlay: 0 elements. Hero glass bubbles: 0 elements. The GPU particle-built M remains intact and resolves on its original loop.
- The official Momentum 360 lockup is sampled from `public/assets/brand/momentum-360-logo.png` into a dedicated particle canvas in the spatial-media chamber.
- Footer flat-wordmark overlay: 0 elements. Detached circular logo badge: 0 elements. The particle wordmark is surrounded by three integrated atomic orbit rings.
- Production canvas count: 4. Desktop 1440x1000 and mobile 390x844 both returned HTTP 200 with 0px horizontal overflow and zero console errors.
- Typecheck passed, 3 of 3 tests passed, and the Signal production build completed successfully.

### Sol Max responsive and founder refinement

- Production deploy: `6a70ee66c2b859516dd88fa6` at <https://need-momentum-signal-20260803.netlify.app>.
- Hero particle target contains only the circular M; the stray wordmark stroke, flat overlay, glass bubbles, and eyebrow copy are absent.
- The hero headline has a continuously changing 3D transform; reduced motion freezes it.
- Visible `signal` / `signals` copy matches: 0. The title is `Need Momentum — Make It Move.`
- Manifesto client width equals scroll width at 1440px and 390px. Whole-page horizontal overflow is 0px at both viewports.
- Official Momentum 360 and footer wordmarks resolve into legible particle typography at desktop and mobile sizes.
- Decision numerals compute to 60.48px desktop and 53.6px mobile.
- Signal founder team-photo count: 0. Solo profile count: 2. Biography paragraph count: 4. The particle text resolves once and retains its resolved class after leaving and re-entering the viewport.
- Live production returned HTTP 200 at desktop and mobile with zero console errors. Typecheck, 3 of 3 tests, build:signal, and `npx impeccable detect` passed.
