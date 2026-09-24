# Orange Press animation quality gate

Contact sheets:

- `orange-press-system-contact-sheet.png`
- `orange-press-note-contact-sheet.png`
- `orange-press-atomic-logo-contact-sheet.png`

- Subject dominance: pass. Each authored moment has one clear subject: the centered orange system card, the active orange press note, or the closing BigOrange mark.
- Layer separation: pass. Rail movement, card lift, note reveal, staggered type, particle canvas, and exact static logo remain independently controllable layers.
- Silhouette stability: pass. A deterministic four-pixel sampling grid comes directly from the established `bigorange-logo-particle-8777.png` mask, preserving the icon, wordmark, and tagline.
- Texture coherence: pass. System cards stay crisp during the swipe, press notes remain opaque during unfold and lift, and every closing-logo element is a uniform pixel-aligned orange square. There is no full-image crossfade.
- Motion coherence: pass. Both rails move in centered one-card steps within two seconds of entering view. Hover raises the active text box and its label, headline, and body arrive in a restrained stagger. Three elliptical paths establish a crisp atom before the square logo particles collapse inward, settle, and hold.
- Export truth: pass. Production ships native scroll rails, mouse-drag and touch-swipe handling, keyboard controls, the signal marquee, the canvas renderer, exact-logo fallback, and reduced-motion states.
- Frame aesthetics: pass. The sampled rail frames preserve readable text and stable card geometry; the note sequence progresses from closed to fully legible without a translucent or clipped frame; the logo sequence ends on the sharp approved mark.

Accepted with no animation blocker. The four-viewport interaction audit confirms automatic movement only when motion is allowed, no automatic movement under reduced motion, distinct hover states, one active card, safe note bounds, touch swipe, mouse drag, button and keyboard navigation, and zero heading or document overflow from 320px through 1440px. There is no simultaneous canvas and raster exposure during the logo handoff.
