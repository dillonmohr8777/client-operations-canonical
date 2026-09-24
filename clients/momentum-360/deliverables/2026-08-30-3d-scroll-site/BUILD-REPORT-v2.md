# Momentum 360 v2 build report

**Status:** partial — footage-backed review package is verified; local Blender render remains unavailable.

**Objective:** reproduce the supplied opening property walkthrough as a scroll-driven, responsive Momentum 360 private concept without touching the live site.

## Active implementation

The active visual master is the supplied `_reference/tiktok-reference.mp4`, trimmed to its opening 20 seconds and cropped to a 16:9 720x404 H.264 MP4 at `site-v2/assets/media/momentum-reference-opening.mp4`. `site-v2/script.js` fetches that local asset once, attaches a Blob URL, waits for metadata, and maps vertical reel progress to `video.currentTime`. This removes dependence on HTTP byte-range support in loopback preview servers. The poster remains available while the Blob loads; fetch failure restores the native source and leaves the poster/error state available.

Editorial chapter labels map one canonical ordered timeline to the six requested reads. Each range occupies one sixth of the reel; source windows are scrubbed continuously within that range and jump at deliberate spatial-cut boundaries:

1. `arrival`, scroll `0.0000–0.1667`, source `0.00–1.00s`
2. `pool`, scroll `0.1667–0.3333`, source `7.80–9.50s`
3. `marble`, scroll `0.3333–0.5000`, source `6.00–7.60s`
4. `game`, scroll `0.5000–0.6667`, source `1.35–1.85s`
5. `foyer`, scroll `0.6667–0.8333`, source `2.35–2.90s`
6. `momentum`, scroll `0.8333–1.0000`, source `18.40–19.96s`

The stage uses a lower-left navy panel and opaque right-edge rail mask to remove source caption/avatar UI while keeping the central property footage visible. Chapter-specific masks activate from `activeShotId=foyer` and `activeShotId=momentum` to cover the remaining centered `Châteaux...` and lower-center `Experience The Estate` source captions. The prior SVG depth-card experiment is retained only as discarded evidence and is not referenced by the active page.

## Changed files

- `site-v2/index.html` — static entry point, robots directive, exact Momentum links, video/poster markup, six chapter copy blocks, CTA release section.
- `site-v2/styles.css` — Experience-mode film-gate palette, bold local typography, pinned stage, responsive compositions, source-UI masks, reduced-motion rules.
- `site-v2/script.js` — Blob transport, deterministic seeking, scroll state, `window.__M360_V2_STATE__`, reduced-motion fallback, unload cleanup.
- `site-v2/assets/media/momentum-reference-opening.mp4` and `poster.jpg` — local crop/encode and poster.
- `site-v2/assets/brand/momentum-360-logo.png`, `site-v2/assets/fonts/*` — copied local identity/font assets.
- `production-v2/render_video_preview.mjs` — six 8-frame motion sample renderer.
- `production-v2/browser_qa.mjs` — static HTTP, desktop/mobile, CTA, overflow, console, and reduced-motion checks.
- `production-v2/preview_seek_check.mjs` — exact loopback Blob-seek verification.
- `production-v2/make_qa.py` — reference-vs-v2 and motion contact-sheet generator.
- `production-v2/video-renders/**`, `production-v2/reference-crops/**` — generated review evidence.
- `qa-v2/site-smoke.json`, `preview-seek-check.json`, `reference-vs-v2-contact-sheet.jpg`, `motion-contact-sheet.jpg`, `motion-difference.json`, and desktop/mobile screenshots.
- `REFERENCE-MAP-v2.md` and `.impeccable/surfaces/site-v2-index-html.md` — updated to document the footage-backed route and rejected SVG experiment.
- `blender-v2/build_v2.py` — cloud-ready named 2.5D structure retained; no local Blender render claimed.

## Verification evidence

- `node --check site-v2\script.js` → exit 0 (`script-check:ok`).
- `node --check production-v2\render_video_preview.mjs` → exit 0.
- `node production-v2\render_video_preview.mjs` → rendered `01-aerial`, `02-rear-pool`, `03-marble-living`, `04-dark-game`, `05-foyer-stairs`, and `06-front-hero`, eight frames each; `preview:complete`.
- The renderer scrolls to each canonical threshold, then asserts the active beat id/label and observed `video.currentTime` before saving every frame. `production-v2/video-renders/timeline-assertions.json` records all 48 assertions.
- `ffprobe` → `codec_name=h264`, `width=720`, `height=404`, `avg_frame_rate=30/1`, `duration=20.000000`.
- `node production-v2\browser_qa.mjs` → all required HTTP assets 200; desktop/mobile `overflow=false`; CTA present; zero console/page errors; reduced motion reports `currentTime=0` and `transport=blob`. The same run now performs safe in-page click interception for contact, audit, and tours and records the activated target URLs in `qa-v2/site-smoke.json`.
- `qa-v2/site-smoke.json` records exact hrefs and click targets: audit `https://www.needmomentum.com/free-website-seo-audit/`, tours `https://www.momentumvirtualtours.com/services/custom-360-virtual-tours/`, contact `https://www.momentumvirtualtours.com/contact/`.
- `qa-v2/preview-seek-check.json` records the canonical scroll mapping at deliberate chapter cuts: 0% = `0s` (arrival), 25% = `8.651394s` (pool), 50% = `1.35s` (game cut), 75% = `2.625451s` (foyer), and 100% = `19.96s` (front hero). Each sixth of the scroll interpolates inside its own source window, so the visible chapter and active label stay aligned even when source time jumps spatially.
- `python production-v2\make_qa.py` → generated both required contact sheets and `motion-difference.json`; all six frame pairs have non-zero deltas (changed fraction `0.3451–0.6004`, exact current min/max from `qa-v2/motion-difference.json`).
- `python -m py_compile blender-v2\build_v2.py` → passed.
- `node C:\Users\dillo\.agents\skills\impeccable\scripts\detect.mjs --json site-v2/index.html site-v2/styles.css site-v2/script.js` → exit 1 with warnings/advisories only (overused/local font and documented-system ramp/color notices); no blocking error finding was emitted. The local Space Grotesk/Anton choice is intentional for the requested bold film typography and is documented as a narrow exception.

## Blender boundary

No `blender.exe` is installed on this host. Official winget download attempts returned HTTP 403, and the available `blender-mcp.exe` requires an external Blender host. The cloud-ready scene source remains under `blender-v2/`, but this report does not claim Blender-rendered evidence. The active footage route was chosen after review rejected the synthetic SVG/vector visuals for flatness.

## Scope and delivery boundary

All work is isolated to the v2-owned paths. No existing `site/` files, live deployment, external account, publication, email, or client system was changed.
