# Bar Crawl USA Halloween Landing Page Publication Receipt

Published August 26, 2026.

## Live pages

1. https://barcrawlusa.com/atlanta-halloween-bar-crawls-2026/
2. https://barcrawlusa.com/cleveland-halloween-bar-crawls-2026/
3. https://barcrawlusa.com/cincinnati-halloween-bar-crawl-2026/
4. https://barcrawlusa.com/columbia-sc-halloween-bar-crawl-2026/
5. https://barcrawlusa.com/greenville-sc-halloween-bar-crawl-2026/
6. https://barcrawlusa.com/portland-me-halloween-bar-crawl-2026/
7. https://barcrawlusa.com/st-pete-halloween-bar-crawl-2026/
8. https://barcrawlusa.com/macon-ga-halloween-bar-crawl-2026/
9. https://barcrawlusa.com/roswell-ga-halloween-bar-crawl-2026/
10. https://barcrawlusa.com/sarasota-halloween-bar-crawl-2026/

## Publication evidence

- Exact existing WordPress page IDs 16601 through 16646 were updated and published.
- Atlanta, Cleveland, Cincinnati, Columbia, and Greenville use the approved Tacos and Tequila campaign rhythm.
- Portland, St. Pete, Macon, Roswell, and Sarasota use five distinct layouts.
- All twenty authenticated preview checks passed across desktop and mobile.
- All twenty direct live URL checks passed across desktop and mobile.
- Every live page has one H1, nine content sections, five visible FAQs, three loaded images with alt text, FAQPage schema, BreadcrumbList schema, and at least three calls to action.
- No visible dash punctuation or horizontal overflow was detected on any live page.
- AIOSEO titles and descriptions match the page packet and no page is marked noindex.
- All ten public URLs return HTTP 200, all ten REST records report `publish`, all ten contain the new `main.bcx` layout marker, and all ten appear in `page-sitemap.xml`.
- All 56 unique image and destination URLs resolved. Six destinations that timed out during the final bulk sweep were rechecked individually and returned HTTP 200.
- The final live browser console check returned no errors.

## Recovery and QA artifacts

- `production-backup-2026-08-26.json` preserves the ten prepublication draft records.
- `wordpress-preview-qa.json` contains authenticated preview results.
- `wordpress-live-qa.json` contains direct live desktop and mobile results.
- `publication-payloads.json` contains the exact draft first Elementor payloads used for the production update.

## Ticket and search integration update

Updated August 26, 2026.

- All ten live guide pages now include secure Eventbrite modal checkout controls tied to the verified event records.
- Cleveland presents separate West Park and Lakewood ticket choices. The other nine pages present the matching city event.
- Ticket clicks emit `begin_checkout` with the Eventbrite event ID, city, and canonical page location. The Eventbrite completion callback emits `ticket_order_completed`.
- The production Atlanta checkout opened the expected Eventbrite iframe for event `1984291558467`, and the live data layer recorded the matching `begin_checkout` event.
- All ten pages passed a fresh live desktop and mobile check with one H1, a visible ticket section, five FAQs, FAQ schema, canonical metadata, no `noindex`, no horizontal overflow, and no broken loaded images.
- All ten URLs are present in `page-sitemap.xml` with August 26, 2026 `lastmod` timestamps.
- Search Console accepted a fresh recrawl request for `https://barcrawlusa.com/robots.txt`. The main HTTP, HTTPS, and www robots files are fetched successfully. The report warning belongs only to the old `migrate.barcrawlusa.com` subdomain.
- Manual URL indexing requests remain unavailable because the connected Google account is not a verified owner or full user for `sc-domain:barcrawlusa.com`.
- Eventbrite login research confirmed `dillonmohr8777@gmail.com` as the existing organizer or collaborator route. Eventbrite accepted that identity and sent a fresh one time login code. Analytics configuration is pending the required human entry of that code.
- Spring Gmail and Slack records show the earlier attribution setup counted an Eventbrite form submit proxy rather than a verified completed purchase. The current repair therefore requires organizer side GA4 configuration and a real order validation before purchase reporting can be called accurate.
- Search Console access research confirms the same restricted permission state documented in March 2026. No Bar Crawl USA GoDaddy or DNS access route was found in Gmail, Slack, Access Broker, or the local credential registry, so domain verification was not started under an unverified account.

## Additional recovery and QA artifacts

- `pre-ticket-integration-backup-2026-08-26.json` preserves the ten guide records and ten source event records immediately before the ticket integration update.
- `seo-ticketing-live-qa-2026-08-26.json` contains the fresh desktop, mobile, checkout, sitemap, and Search Console evidence.
