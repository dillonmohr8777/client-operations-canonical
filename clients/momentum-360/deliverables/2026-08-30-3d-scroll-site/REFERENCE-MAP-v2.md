# Momentum 360 v2 reference map

## Direction contract

- **Mode:** Experience
- **North star:** a controlled property-walkthrough film, not a property-card gallery.
- **Assigned Impeccable direction:** grounded candidate 5, “camera negative / shot ledger” — each shot is a punched film frame with its own spatial grammar, while the visitor scrubs one vertical reel.
- **Seed key:** `fbb954d0` (direction) and `b8c0bfac` (surface). The reference-locked sequence wins over catalog challengers.
- **Material language:** near-black film gate, deep midnight navy, cobalt blue-hour exterior, warm window practicals, marble whites, and a single signal-yellow route marker. Heavy condensed sans copy behaves like a lower-third card; the property owns the frame.

## Reference authority

The supplied local assets are read-only authority for choreography and composition:

- `_reference/tiktok-reference.mp4` — original motion reference.
- `_reference/intro-0-20s.jpg` — dense opening contact sheet.
- `_reference/dense-00-05s.jpg` through `_reference/dense-15-20s.jpg` — time-window contact sheets.
- `https://www.tiktok.com/t/ZP8vvTtAw/` — source link supplied by the user.

The opening twenty seconds resolve into six canonical visual beats. The active v3 visual master is a clean 20.208-second Higgsfield-generated walkthrough built from five last-frame-locked motion legs. The supplied source remains choreography and composition authority only; no source UI, creator captions, portrait, watermark, address, or property claim appears in the active film.

## Six-shot translation map

| Shot | Reference read | Source window | Scroll threshold | Web role |
| --- | --- | --- | --- | --- |
| 01 · Aerial arrival | Chateau estate, court, lit backyard, high oblique descent | `0.05-3.20s` | `0.0000-0.1667` | Opening hero; makes the property legible before copy appears. |
| 02 · Rear pool | Rear elevation, pool terrace, and approach to the open doors | `3.20-7.20s` | `0.1667-0.3333` | Establishes the estate as a place and carries the camera inside. |
| 03 · Marble living / kitchen | Bright living and kitchen with pale stone and a long sightline | `7.20-10.30s` | `0.3333-0.5000` | First interior threshold; light and material contrast. |
| 04 · Dark game room | Dark cinema/game room, screen, pool table, saturated red artwork | `10.30-14.50s` | `0.5000-0.6667` | Midpoint contrast; proves the sequence has range. |
| 05 · Foyer / red art / stairs | Bright foyer, red art, curved staircase, and open front doors | `14.50-18.50s` | `0.6667-0.8333` | Vertical reveal and spatial transition into the finale. |
| 06 · Front exterior hero | Front chateau facade, warm windows, blue-hour sky | `18.50-20.18s` | `0.8333-1.0000` | Final proof and CTA frame; primary action sits in lower-left. |

## Motion grammar

- The active master is encoded at 1280x720, 24fps, 20.208 seconds with H.264, GOP 8, no audio, and fast-start metadata. The mobile sibling retains 1280x720 with GOP 4 for cheaper frame seeking.
- Scroll progress follows the explicit six-range editorial timeline above. Within each range the generated film is scrubbed continuously; the last frame of each generated leg was the start image for the next leg, preserving the forward journey across seams.
- The stage remains pinned for the film section, then releases into a short CTA footer. No decorative orbit or rapid spin is added.
- Reduced motion holds the poster/first film frame and exposes `reducedMotion: true` in the diagnostic object while keeping the route keyboard reachable.

## Asset provenance

- **Active generated / verified:** `site-v2/assets/media/momentum-higgsfield-walkthrough.mp4`, its GOP-4 mobile sibling, and `poster.jpg`, produced through the authenticated Higgsfield Ultra workspace from the supplied reference, verified Momentum logo, and project design system. The exact logo remains a separate unmodified web asset and was not redrawn into the film.
- **Retained inactive reference edit:** `site-v2/assets/media/momentum-reference-opening.mp4` remains local provenance evidence and rollback media but is no longer loaded by the page.
- **Reused local / verified:** exact Momentum 360 logo copied from the existing approved `site/assets/brand/momentum-360-logo.png` into `site-v2/assets/brand/` without mutation; Space Grotesk and Anton font files copied from the local repository into `site-v2/assets/fonts/`.
- **Cloud-ready, inactive:** `blender-v2/build_v2.py` retains named depth-card collections, camera paths, Eevee/AgX settings, and a Cycles migration seam. Blender was not available on this host, so no Blender-rendered frame is presented as active evidence.
- **Discarded experiment:** `production-v2/generate_depth_assets.mjs` and its SVG layer renders were rejected in review for flat illustration quality. They remain only as traceable experiment evidence and are not referenced by the active page.

## Honest boundary

The property is a clearly labeled AI-generated concept demonstration, not a client listing or claimed real property. The supplied TikTok is used only as motion and composition authority. `blender-v2/build_v2.py` remains a cloud-ready structural fallback rather than claimed render evidence.
