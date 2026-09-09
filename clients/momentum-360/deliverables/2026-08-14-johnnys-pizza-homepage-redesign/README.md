# Johnny's Pizza homepage redesign

Status: deployed and live-verified  
Live route: https://phl-2026-w33b.netlify.app/sites/johnny-s-pizza/  
Netlify site: `phl-2026-w33b` (`c6011774-3937-4634-9e5c-bada2bf977eb`)  
Production deploy: `6a7ff173ae9891189e60fbc3`  
Rollback deploy recorded before publication: `6a7ff04cc5eb6ac425225821`

## Direction

The redesign uses the creative world **The Stainless Pass / Candle Room**: a working pizza pass by day and a candlelit BYOB table by night. Archivo Black replaces the old restaurant serif treatment. Butter ticket paper, espresso black, lacquered tomato, real brushed steel, square editorial seams, authored image crops, and one circular service selector make the page feel specific to Johnny's rather than templated.

## Source of truth

Canonical source:

`C:\Users\dillo\Documents\Codex\projects\dillon-os\02_Campaigns\AI Site Builder Outreach Engine\batches\radar-next15-20260809-230919\sites\johnny-s-pizza`

Key files:

- `index.html`: shipped static homepage.
- `PRODUCT.md`: verified product and factual boundaries.
- `DIRECTION-CONTRACT.md`: selected visual thesis and surface contract.
- `DESIGN.md`: normative implemented design system.
- `.impeccable/design.json`: schema-2 design sidecar and component specimens.
- `assets/PROVENANCE.json`: asset-source and disclosure record.

## Verification

- Atomic Netlify deploy preserved the exact non-target manifest for all 330 non-Johnny files.
- All 329 publicly reachable non-target files matched the previous production responses byte-for-byte in the draft gate.
- All 25 Johnny route files matched their local SHA-1 source hashes.
- Global `_headers` SHA-1 remained `71318049c19e0444afa000b8381598033e79dc14`.
- Live response retains `X-Robots-Tag: noindex, nofollow` and the page retains its `noindex,nofollow` meta directive.
- Desktop 1440×1000, mobile 390×844, and narrow 320×720 each returned 200 with zero Axe violations, runtime errors, failed requests, broken images, or horizontal overflow.
- Reduced motion, skip navigation, visible focus, mobile-menu inert state, selector keyboard support, and explicit accessible selector names were verified.

Deployment evidence:

- `deployment/draft-receipt.json`
- `deployment/draft-verification.json`
- `deployment/production-receipt.json`
- `deployment/production-verification.json`
- `evidence/netlify-production/inspection.json`
- `qa/accessibility-report.md`
- `qa/finish-review-disposition.md`

## Disclosure boundary

This remains a private noindex prospect concept. The food, interior, exterior, and town imagery is clearly labeled as concept imagery and is not represented as verified first-party photography. Business facts were checked against Johnny's official website; current menu, hours, and availability should still be reconfirmed before any public production launch.
