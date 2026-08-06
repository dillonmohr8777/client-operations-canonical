# Grok handoff: active website and design work

Snapshot: 2026-08-06. This is the centralized status file requested for active sites. Exact code repositories remain authoritative for implementation; Client Operations remains authoritative for client routing and approval state.

## Priority order

1. Dillon OS product/HUD and its embedded sites.
2. Client Operations queue and routing integrity.
3. Align HCM reporting, content, and customer-agent surfaces.
4. IMMOHRTAL isolated concert/artist experience.
5. Active client website/design lanes below.

## Align HCM

- Canonical client: `clients/align-hcm/` (active).
- Primary current content/dashboard repo: `dillonmohr8777/align-hcm-august-2026-content`.
- Current `main`: `6435b319742c7204d79f03a98ca9ae2d86683616`, an Aug. 6 HubSpot dashboard refresh.
- Published in-progress branch `feature-pr3` now ends at `1088341`. It contains five dashboard-refresh commits through `cc7655d` plus a safe environment-token-based refresh script that verifies portal `242825734` and writes sanitized exports.
- Other code sources: `align-hcm-lead-intelligence`, `align-hcm-public-content`, and `align-hcm-maher-brent-chatcut`.
- Brand: orange `#F05A28`, deep navy `#0B1D2D`, warm paper `#F4EFE7`, sky `#EAF6FC`, success green `#159B63`; Plus Jakarta Sans display and DM Sans body. Use the real logo, proof-led executive copy, accessible motion, and no unsupported attribution claims.
- Next: review `feature-pr3`, choose the newest dashboard/report PR, verify HubSpot portal/account and refresh timestamps, then inspect desktop/mobile and console. Conversion reporting stays pending validation unless the exact definition/window/tracking/CRM outcome is verified.

## IMMOHRTAL

- Primary current repo: `dillonmohr8777/immohrtal-kimi-redesign`, `main` at `0bfc94185b9323ed6161b1882f04d7e00b251c3c`.
- Live preview: `https://immohrtal-kimi-redesign.netlify.app`.
- Legacy/alternate repo: `dillonmohr8777/immohrtal-website`, `main` at `688d470a1da86e6443860d5c39e93a77bcbc66af`.
- Stack: React 19, Vite 6, TypeScript, Tailwind 4, Three.js/WebGL, static Netlify output.
- Non-negotiable: Pittsburgh concert/venue assets, Dillon performer likeness, personal logo/images, music, and album-length experience are IMMOHRTAL-only. Never reuse them for Bridge, BigOrange, or another client.
- Current gaps: real cleared audio, final cover/artist assets and links, final copy/contact details, and production clearance. The redesign is `noindex,nofollow`; local forms do not persist without the hosted Netlify backend.
- Next: treat the Kimi redesign as the implementation candidate, run `npm run build`, test reduced-motion/non-WebGL fallbacks and audio behavior, then decide whether the legacy repo should be archived.

## BigOrange Marketing

- Canonical client: `clients/bigorange-marketing/` (active).
- Site repo: `dillonmohr8777/bigorange-marketing-homepage`, `main` at `c80d416b49ae42a49cfb51e8c45244f6f353b302`.
- Live preview: `https://bigorange-marketing-homepage.netlify.app`.
- Current client deliverable: `clients/bigorange-marketing/deliverables/2026-08-03-custom-home-builder-authority-hub-pilot/`, updated Aug. 4 with roadmap, WordPress pillar/supporting content, presentation, and report artifacts.
- Brand: warm, plain-English, sharp, lightly playful “citrus” voice; one playful phrase per section; reader/problem first; every technical claim needs a practical consequence and source.
- Blockers: no authenticated WordPress, Semrush, analytics, CRM, or private client-data access is mapped. Start read-only and keep publishing behind current approval.
- Next: verify which homepage/showcase is the intended client-facing artifact, reconcile the 90-day pilot package, and map revocable role-specific WordPress/Semrush access before account-dependent work.

## Shadow Heating and Cooling

- Canonical client: `clients/shadow-heating-cooling/` (active).
- Site repo: private `dillonmohr8777/shadow-heating-website`, `main` at `f4f615929a5aa3f537336b838b390a0e25a68c81`.
- Stack: Next.js 15 static export, TypeScript, Tailwind, React Three Fiber/Three.js, Framer Motion; Netlify publishes `out/`.
- Direction: “Defend Your Comfort Zone,” football/playbook framing, heat/ice/gold tokens, 24/7 service clarity, and accessible fallbacks for all 3D/motion.
- Current state: code repo is clean; local canonical site output exists. Meta ads were verified paused in late July; do not treat paid-media history as current website authority.
- Next: run `npm install` and `npm run build`, verify the production URL and form routing, inspect all listed routes, keyboard/reduced-motion behavior, and correct the unattended lint configuration before relying on `npm run lint`.

## Hope Wellness Center

- Canonical client: `clients/hope-wellness-center/` (active).
- Current public-facing creative is primarily in Dillon OS PR `#222` and Claude Skills PR `#18`; Client Operations remains the route/status authority.
- Brand/clinical rule: calm, credible, supportive wellness language. Never present women's hormone replacement therapy as a cure for mental-health conditions. Confirm provider, population, states, clinical scope, labs, follow-up, and payment model before public promotion.
- Current gap: no dedicated website repository is mapped in the GitHub inventory. Treat existing video/reel artifacts as creative inputs, not a complete site.
- Next: choose the current approved brand-film asset, confirm the actual web destination and clinical review owner, then create site work only inside the canonical client route or a deliberately named code repo.

## Fagan Painting

- Canonical client: `clients/fagan-painting/` (active).
- Current material: weekly performance dashboard artifacts under `deliverables/2026-07-26-weekly-performance-dashboard/` and a contact-name correction in Dillon OS PR `#217`.
- Non-negotiable: the primary contact is James; preserve current source evidence and avoid unvalidated conversion claims.
- Current gap: no dedicated website repository is mapped. Fagan is not an active paid-media lane unless Dillon explicitly reactivates it.
- Next: verify the intended website/design deliverable before building, use the canonical client folder, and keep paid-media recommendations out of scope.

## Zen Spa at Tropicana

- Registry route: `clients/zen-spa-tropicana/`, currently **inactive**.
- Existing source work lives in Mohr Vault PRs `#7` and `#9` and historical Squarespace/listing handoffs.
- Current gap: no dedicated website repository is mapped, and public listing/ownership state has historically differed across providers.
- Non-negotiable: do not reactivate, publish, change listings, or create a new client repo until Dillon confirms the status and exact business identity/owner.
- Next: read the existing Squarespace handoff, verify current status and exact approved business identity, then either reactivate through the registry or archive the lane.

## Momentum 360 / Need Momentum

- Canonical client: `clients/momentum-360/` (active).
- Current candidates: Dillon OS PR `#256` (signal-field v2), PR `#213` (virtual tours landing page), and Client Operations PRs `#17` and `#18`.
- Direction: retain Momentum 360's established dark visual system where applicable; Need Momentum concepts are separate passes and must not silently replace an existing production site.
- Next: choose one approved homepage direction, verify the exact existing Netlify target before deployment, then close superseded draft PRs.

## Other active client folders

The registry also tracks Kimberly James Bridal, BOK Law Firm, Pro Fence & Deck, Replenish/7-Eleven, Fresh Blends/Kwik Trip, NKCDC, Omega Landscaping, VA Claims Edge, Bercos Popcorn, AMI Cleaning, Cindy May Christmas, Bar Crawl USA, Bridge Software, Onsite Concrete & Landscape, Revive Systems, and Pritzker Law Group. Do not infer that every active client has active website work. Use the queue and exact client folder to determine current scope.

## Universal design/build gate

- Resolve the exact client and use verified first-party assets.
- Preserve/create `PRODUCT.md` and `DESIGN.md` for substantive UI work.
- Reuse the existing component/tokens before adding dependencies.
- Verify build, desktop/mobile, keyboard, focus, contrast, reduced motion, overflow, asset loading, forms, and console.
- Keep previews private/noindex when the workflow requires review.
- A local build or accepted deploy request is not proof of live production; return the exact live URL and browser readback.
