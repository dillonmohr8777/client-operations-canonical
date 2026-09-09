# Netlify deployment

Status: live, isolated Momentum 360 review deployment.

- Account: `dillonmohr8777@gmail.com` / `dillonmohr8777`
- Site name: `momentum-360-scroll-story-20260830-212`
- Site ID: `114b367f-9bf8-43ff-aa8d-9b264524a5ba`
- Production deploy ID: `6a94b31126f95bb234e9647e`
- Live URL: `https://momentum-360-scroll-story-20260830-212.netlify.app/`
- Unique deploy URL: `https://6a94b31126f95bb234e9647e--momentum-360-scroll-story-20260830-212.netlify.app/`
- Source directory: `site-v2`
- Deployment mode: production deploy with no build step
- Search state: `noindex,nofollow,noarchive`

## Live verification

- HTTPS response and full page load: passed with status 200.
- Desktop viewport at 1280 by 720: no console errors and no horizontal overflow.
- Mobile viewport at 390 by 844 with reduced motion: no horizontal overflow; media remains at frame zero as intended.
- Live Blob-backed scroll seeks passed at the canonical progress positions: `0.05`, `5.20328`, `10.3`, `16.50328`, and `20.18` seconds.
- Active media: Higgsfield-generated 1280 by 720 H.264 walkthrough, 20.208 seconds, with a GOP-4 mobile sibling and generated poster.
- Exact changed-target Impeccable detector result: zero findings for `site-v2/index.html` and `site-v2/script.js`.
- Contact, audit, and virtual-tour links each passed real pointer-click interception with the exact expected destination URL.
- The existing mapped review site was updated in place; no other Momentum or Need Momentum Netlify site was changed.
