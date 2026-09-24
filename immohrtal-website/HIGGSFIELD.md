# Higgsfield upgrade

Netlify site: `https://immohrtal-website.netlify.app`  
Site ID: `325a91fc-7fe9-4ad9-b845-1f1ccb47dbc6`

## What changed

The top hero preview is now a Higgsfield Earth Zoom of Dillon Mohr, not the stock woman from the preset thumbnail.

1. Import the live site images (`artist.jpg`, cover, logo, OG).
2. Import Dillon’s color portrait as the identity lock.
3. Run preset `EARTH ZOOM` (`7e8d9b59-09a9-4036-8d85-61cbfe66111e`) at 16:9.
4. Encode the result to `public/earth-zoom.mp4` (H.264, no audio, faststart).
5. Use the landing frame as `public/earth-zoom-poster.jpg` and `public/og.png`.

The story photo at the bottom of the page is unchanged.

## Local files

| File | Role |
| --- | --- |
| `public/earth-zoom.mp4` | Hero loop |
| `public/earth-zoom-poster.jpg` | Poster / reduced-motion fallback |
| `public/og.png` | Link preview of Dillon’s landing frame |
| `public/dillon-color.jpg` | Identity reference used for generation |
| `public/artist.jpg` | Original 814 studio shot |
