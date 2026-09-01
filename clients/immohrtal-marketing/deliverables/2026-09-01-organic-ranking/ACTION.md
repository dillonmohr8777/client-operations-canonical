# Organic ranking actions taken 2026-09-01

Dillon approved instituting the on-site ranking work. This is the IMMOHRTAL Marketing Solutions lane, not a Momentum client queue write.

## What shipped in the site source

Repository: `dillonmohr8777/dillon-os`
Branch: `cursor/immohrtal-organic-ranking-aa5f`
Base: `codex/immohrtal-marketing-solutions-20260824`
Canonical path used: `C:\Users\dillo\Documents\Codex\worktrees\immohrtal-marketing-solutions-20260824\immohrtal-marketing-site`

- Added the verified public NAP from the IMMOHRTAL email signature: 127 Muirfield Dr. Pittsburgh PA 15229, 814.873.5333, dillon@immohrtalmarketing.com.
- Published that NAP on About, Contact, the footer, llms.txt, and Organization / ProfessionalService schema.
- Added a visible Pittsburgh disambiguation: this studio is not Immohrtal Media Inc and not Immortal Marketing.
- Pointed Person schema `sameAs` at the verified portfolio `https://dillon-mohr-primary-portfolio.netlify.app/`.
- Added 301s for three dead insight slugs that 404 today.
- Regenerated the 24-route static set. `scripts/qa-seo.mjs` passed with zero errors.

## What this still cannot do by itself

- Rankings will not jump tonight. The site is eight days into Search Console.
- Google Business Profile verification still needs Dillon if a postcard, phone, or video check appears.
- No LinkedIn company `sameAs` was added because no verified IMMOHRTAL company page was found.
- Franchise outreach was not sent. Workspace Gmail is still the send gate.

## Live after merge

- Merged https://github.com/dillonmohr8777/dillon-os/pull/349 into `codex/immohrtal-marketing-solutions-20260824`.
- Vercel production deployment `Production – mohr-media-site` started at 2026-09-01T23:49:53Z for commit `e9a3ae59`.
- Live `/about/` now contains Pittsburgh, `127 Muirfield`, `814.873.5333`, and the Immohrtal Media Inc disambiguation.
- `/insights/aeo-vs-seo/` now returns 308 to `/insights/aeo-vs-geo-service-businesses/`.
- Search Console accepted a fresh sitemap submit for `https://www.immohrtalmarketing.com/sitemap.xml`.
- URL Inspection still shows homepage, About, Contact, and `/aeo-geo/` as Submitted and indexed. Those inspect results are pre-deploy crawls.
