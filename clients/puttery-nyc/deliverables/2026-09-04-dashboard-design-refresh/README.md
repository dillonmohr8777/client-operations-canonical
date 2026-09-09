# Puttery NYC dashboard refresh

The local build refines the exact deployed Pilot Control source. Four baseline files were SHA-256 equal to the public deployment before editing. The original source and unrelated user work were preserved.

## Open and deploy

- Review: `http://127.0.0.1:61484/`
- Public-only deploy directory: `public/`
- Public manifest: `qa/public-manifest.json`
- Existing mapped site: `https://nyc-entertainment-attribution-dashboard-20260804.netlify.app/`

Only the parent coordinator deploys. The public directory contains exactly index.html, app.js, status.js, styles.css, _headers, robots.txt, assets/puttery-logo.svg, and assets/favicon.svg. Do not deploy this package root, which includes QA and source documentation.

To reopen a hidden loopback preview:

```powershell
. C:\Users\dillo\.codex\terminal-bootstrap.ps1
& C:\Users\dillo\.codex\tools\Start-CodexLocalPreview.ps1 -Path C:\Users\dillo\Documents\Codex\projects\client-operations\clients\puttery-nyc\deliverables\2026-09-04-dashboard-design-refresh -Json
```

## What changed

- Compact Puttery title and exact logo, with one consistent SVG icon family and a subtle golf-dimple surface.
- Current webhook state and next action take priority. Account IDs and existing test evidence sit in an expandable checkpoint list.
- Source readiness shows venue scope, receiving webhook, pending exports, and pending attribution.
- Ten integrations use native disclosure rows. Toast, Guest Profile, and Walk-in reflect the expanded access request while keeping NYC enablement unverified.
- Mobile worksheet progress is a single link; the current operating state appears much earlier.
- Modeled analytics are hidden behind an explicit disclosure. All 69 question IDs, the existing local-storage key, and JSON export shape remain intact.
- Filter state survives reload through URL parameters. Reset preserves answers. Unavailable browser storage gives an honest export recovery message.

No library, framework, live account connection, guest payload, or third-party image-generation dependency was added. No new claim of current advertising or attributed revenue was introduced.

## Verification

The maker's bounded desktop/mobile confirmation recorded **43 of 43 checks passing** in `qa/inspection.json`, including zero browser axe violations, persistence/export, reset, filtering, empty-state recovery, URL restoration, reduced motion, console errors, short-height navigation, and document overflow. Screenshots live under `qa/`. A final copy-only access/fallback update passed JavaScript syntax and public-manifest checks afterward. Independent QA follows in `qa/independent-review.md`.

The Impeccable installed detector was degraded; the npx parser returned 31 advisory warnings and no critical findings. See `qa/detector-exceptions.md` for the exact categories, rationale, and limits. Do not summarize this as a clean detector pass.

## Durable design record

`PRODUCT.md` captures product truth. `DESIGN.md` was generated from implemented CSS tokens and inspected components; `.impeccable/design.json` was generated from it and the CSS by `qa/generate-sidecar.mjs`. The surface brief is mapped at `.impeccable/surfaces/index-html.md`.

Reusable lesson for parent reconciliation: when similarly named dashboard folders exist, compare the candidate HTML, JS, status, and CSS with the exact current public deployment before refining. Here the August 4 source was current while the more recent-looking August 27 folder was obsolete. Evidence: `qa/baseline/` and the verified file comparison in the task receipt.
