# Netlify v2 production repair

- Client: `pritzker-law-group`
- Work item: `wi-20260725-0003`
- Approval: Dillon's existing explicit approval to publish the stronger Pritzker sponsor landing-page iteration
- Netlify site: `pritzker-love-philadelphia-podcast`
- Site ID: `0b6c2ba3-6036-46d2-91a4-1dcb4b6f6b9b`
- Production deploy: `6a644b4c97faf3dec980f100`
- Production URL: `https://pritzker-love-philadelphia-podcast.netlify.app`

## Reason

Live readback on July 25 showed that the production alias was healthy but serving the older sponsor treatment. The reviewed local v2 contained the stronger Pritzker sponsor identity and premium-sponsor rail already approved for production.

## Verification

- Re-deployed the reviewed v2 directory to the existing dedicated production site.
- Production `index.html`, `styles.css`, and `script.js` match the reviewed local files byte-for-byte.
- The Pritzker logo, Rachael Pritzker portrait, and Love Philadelphia podcast artwork match the reviewed local assets byte-for-byte.
- No new site, domain, form, analytics, tracking, or third-party integration was created.
