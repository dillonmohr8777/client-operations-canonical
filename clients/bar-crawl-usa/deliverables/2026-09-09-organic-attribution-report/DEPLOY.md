# Deployment

Live: **https://bar-crawl-usa-organic-attribution-2026.netlify.app**
Netlify project `bar-crawl-usa-organic-attribution-2026`, id `e74c7c8e-ae83-4a8d-a84b-0e231895cea0`.

## Why this is its own site

`momentum-weekly-client-reports` has **no local source and no linked git repo**. A
Netlify deploy replaces the entire published file set, so deploying a single report
into it would delete all twelve client reports, the shared `report.css`, `report.js`,
the fonts and every client logo, breaking links clients already hold.

Standalone sites are also the existing pattern for one-off reports in this account:
`bar-crawl-usa-may-1-30-2026-report`, `align-hcm-july-2026-growth-report`,
`nyc-entertainment-attribution-dashboard-20260804`.

## Redeploy

```
cd clients/bar-crawl-usa/deliverables/2026-09-09-organic-attribution-report
rm -rf _site && mkdir _site
cp index.html report.css report.js fonts.css _site/
cp -r fonts assets _site/
cp bar-crawl-usa-organic-attribution-apr-to-sep-2026.pdf _site/
printf '/*\n  X-Robots-Tag: noindex, nofollow, noarchive\n' > _site/_headers
netlify deploy --dir=_site --site=e74c7c8e-ae83-4a8d-a84b-0e231895cea0 --prod --no-build
```

**Always pass `--site` explicitly.** This working directory is linked to
`bridge-signal-redesign`, so a bare `netlify deploy` would publish to the wrong project.

`gsc-worked-pages.json` is internal evidence and is deliberately excluded from the
deploy payload. The site is served `noindex, nofollow, noarchive` via `_headers` and
the page meta, matching the weekly reports.

## Verified on deploy, 2026-09-09

All seven asset paths returned HTTP 200, and both the Bar Crawl and Replenish weekly
reports still returned 200 afterwards, confirming the weekly site was untouched.
