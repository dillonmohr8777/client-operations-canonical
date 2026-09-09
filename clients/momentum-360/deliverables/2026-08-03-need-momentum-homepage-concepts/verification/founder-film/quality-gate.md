# Founder film quality gate

## Source film

- Result: pass
- Duration: 14.84 seconds
- Frame: 1200 × 628
- Frame rate: 24 fps
- Source codec: H.264, yuv420p, no audio
- Representative frames: 7
- Maximum sampled frame difference: 34.81 mean RGB
- Automated contact-sheet warnings: 0

## Visual failure analysis

- Subject dominance: Mac Frederick remains left and Sean Boyle remains right; both are centered and unobstructed through the walk and crossed-arm hero beat.
- Layer separation: light-blue and black suits stay readable against the midnight world-map field.
- Silhouette stability: the sampled sequence shows no broken limbs, clipping, or sudden contour swaps.
- Texture coherence: faces, suits, floor reflections, particle field, and map treatment remain consistent across sampled frames.
- Motion coherence: the approach, arm-cross, particle transition, and logo hold progress continuously with no sampled jump above the quality threshold.
- Export truth: the browser delivery files preserve the 1200 × 628 frame at 24 fps. WebM is 1.16 MB; MP4 fallback is 3.69 MB.
- Frame aesthetics: the crossed-arm frame works as the reduced-motion poster and the supplied Need Momentum end card remains fully visible.

## Page QA

- Desktop: 1440 × 900, zero horizontal overflow.
- Mobile: 390 × 844, zero horizontal overflow.
- Reduced motion: no autoplay, particle canvas hidden, ink animation hidden, identities stable, explicit play control retained.
- Playback: visible play and pause state, accurate accessible label and pressed state, and playback stops after the film stage leaves the viewport.
- Console: no page errors; only existing Three.js deprecation warnings outside the founder section.
- Production: deploy `6a723a3186c4c9270235dda2` verified at the canonical Netlify URL; the clean logo end card hides both founder identity plates as intended.
