# Momentum Nouveau local prototype

September 23, 2026. Local review artifact; not published or connected to intake delivery.

## Open and reproduce

Preview: http://127.0.0.1:4188/nouveau.html

Source project: `../2026-08-03-need-momentum-homepage-concepts`.
New surface: `src/concepts/NouveauHomepage.tsx`, `src/concepts/nouveau.css`, `src/nouveau-main.tsx`, `nouveau.html`, `vite.nouveau.config.ts`.

From that project:

```powershell
npm run dev -- --host 127.0.0.1 --port 4188 --strictPort
npm run typecheck
npx --no-install vite build --config vite.nouveau.config.ts
```

Build output: `dist/nouveau/nouveau.html`. Existing concept surfaces remain separate. No dependencies added.

## Acceptance evidence

- Existing exact Momentum logo and founder photograph; provenance in the source project's ASSET-SOURCES.md. Branches are decorative, not an official replacement logo.
- Blue/orange Art Nouveau storefront direction; PRODUCT.md and DESIGN-DIRECTION.md record the brief.
- Service selector changes detail content; SEO selection verified in the browser.
- Empty audit submission identifies six required fields plus consent. A synthetic completed submission shows “Nothing was sent or stored,” clears fields, and produced zero captured network events during submit.
- Real 390px and 320px iframe layouts fit without horizontal overflow: respectively client/scroll width 380/380 and 310/310, including scrollbar space.
- Typecheck and standalone Vite build passed; build rerun passed after final hover-animation correction.
- First visual pass corrected logo contrast, footer wrapping and narrow-viewport overflow. One detector pass identified animated padding; the padding transition and hover padding change were removed.
- Independent final review is recorded separately in FINISH-REVIEW.md when returned.

## Visual evidence

Valid native viewport captures in `review/`: desktop.png, desktop-service-detail.png, desktop-team.png, desktop-audit.png, desktop-footer.png; mobile.png, mobile-services.png, mobile-team.png, mobile-audit.png, mobile-audit-fields.png.

Mobile captures use `nouveau-review.html`, a local harness containing real 390px and320px same-origin frames. Full-page stitching and emulated-mobile screenshot output were corrupted by host scaling; files with initial/full suffixes and mobile-clip.png are not acceptance evidence. Section captures were inspected instead. No YouTube navigation or visible-tab takeover was used.

## Limits

This verifies the local homepage and demo journey. Live WordPress rendering, full service templates, production performance, email/CRM delivery, analytics and real CAPTCHA have not been accepted. Approval and deployment prerequisites remain in INTAKE-RELEASE-READINESS.md and AEGIS-PLAN.md.
