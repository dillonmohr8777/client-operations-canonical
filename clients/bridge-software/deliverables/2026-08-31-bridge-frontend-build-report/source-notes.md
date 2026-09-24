# Bridge frontend build report source notes

Prepared: 2026-08-31

## Product sources

- `deliverables/2026-08-01-tori-prototype-transcript-summary.md`
  - Nationwide feed and legal-state network: lines 23 and 64.
  - Pinterest or digital-newspaper feed preference and competing classic-feed option: line 44.
  - Promotion plus product introductions, vendor announcements, events, and multi-audience publishing: lines 49-50.
  - Nationwide Explore and side-by-side feed prototype requests: lines 104-105.
- `docs/phase2/phase2-product-contract.md`
  - Nationwide selector acceptance: all 50 states and D.C.; illustrative records and no-result labeling.
- `docs/phase3/03-tori-feedback-reconciliation.md`
  - Instituted frontend behaviors, Tori decisions still required, and production dependencies.

## Current implementation evidence

- Production frontend: `https://bridge-connected-signal.netlify.app`
- Community route: `https://bridge-connected-signal.netlify.app/community`
- Image provenance: `public/bridge-editorial/BRIDGE-IMAGE-PROVENANCE.json`
- Image and feed verifier: `scripts/verify-editorial-images.mjs`
- Rendered QA: `scripts/qa-editorial-build.mjs`
- Current Community source: `app/community/community-client.tsx`

## Bridge visual direction

The image system uses documentary realism, controlled grain, practical lighting,
asymmetric editorial cropping, restricted color, and anti-stock-photo composition.
Bridge retains its own Connected purple and near-black identity throughout.
