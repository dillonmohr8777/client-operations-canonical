# AMI Cleaning: Ten-Blog Organic Search Package

Status: publish-ready drafts; not yet published. WordPress REST still returns zero posts as of 2026-08-30.

Prepared: 2026-08-28; refreshed 2026-08-30

Canonical client: `ami-cleaning`

## Current verification

- Ten articles completed and counted: 542–632 words each, one H1, multiple H2 sections, three visible FAQ answers, contextual AMI links and authoritative external citations.
- Ten unique editorial images generated, visually reviewed and optimized to 68–143 KB WebP files.
- Alt text, captions and AI attribution are recorded in every article and in `content-manifest.csv`.
- Monthly report completed: `AMI-August-2026-Monthly-Optimization-Report.md`.
- August hours workbook completed and live-verified at 70.5 hours × $20 = $1,410: https://docs.google.com/spreadsheets/d/1E49C9YqEFWNHyCZ3CW5HFWXZsiHTQGORMLxK-8AhP6E/edit
- August commission workbook updated and live-verified: https://docs.google.com/spreadsheets/d/1upQYyOhaMjgR__8XAYJ0NAoA_pEO6C1Lgb3jt_X2e9s/edit
- WordPress publication is still blocked. Gmail history has one AMI host login: Corinne's 2026-05-01 `BLUEHOST LOGIN` thread. That is Bluehost user `AMICLEAN` at `https://www.bluehost.com/my-account/login`, not WordPress `wp-login`. The 2026-08-28 attempt used that Bluehost password on `ami-cleaning.com/wp-login.php`; WordPress rejected it and Bluehost warned of remaining attempts. Do not retry that password on WordPress. Last week's DNS work used Bluehost. Dillon also used Sign in with Google to `bluehost.com` on 2026-07-23. After a live Bluehost session, open WordPress from the hosting panel and publish these ten posts together.

## Package contents

- Ten original blog drafts in `posts/`
- Ten unique feature images in `images/`
- `content-manifest.csv` with titles, slugs, keywords, image alt text, attribution, and internal-link targets
- `sources.md` with the primary-source citation set used across the series
- `qa-report.md` with ADA/WCAG, SEO, GEO, factual, and publishing checks

## Publishing notes

These are drafts for AMI's WordPress site. No post has been uploaded or published. Each article includes:

- one H1 and sequential H2/H3 headings
- a concise answer block in the first 200 words
- a scannable checklist, steps, or comparison table
- descriptive link text and accessible image treatment
- a short FAQ designed for human readers and machine extraction
- an Article and FAQ structured-data implementation plan that first checks the active SEO plugin to prevent duplicate schema
- SEO title, meta description, canonical URL, target query, and suggested excerpt
- one unique feature-image filename, alt text, caption, and attribution

## Accessibility implementation

- Use the supplied alt text for the informational feature image.
- Place the visible caption directly beneath the image.
- Keep the attribution in the media-library credit field and, if the theme exposes credits, in the visible caption.
- Do not use the image as a CSS background if it conveys the article topic.
- Preserve heading order and descriptive link labels.
- Ensure body text and links meet WCAG 2.2 AA contrast requirements in the live theme.
- Do not open links in a new tab unless WordPress also provides an accessible warning.

## Recommended release sequence

Publish one or two posts per week, beginning with the commercial-cleaning checklist and office-cleaning-frequency articles. Add each URL to the XML sitemap, request indexing in Search Console, and link to the article from the related service or industry page only after the live URL exists.
