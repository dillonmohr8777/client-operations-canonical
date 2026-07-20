# Verified client analytics used in the BigOrange showcase

Captured or rechecked: 2026-07-16

Public presentation rule: publish aggregate, sanitized results only. Do not expose contact identities, emails, contact IDs, raw submissions, credentials, private account links, or person-level pipeline records.

## BigOrange brand verification

- Current live header logo: `https://bigorange.marketing/wp-content/uploads/2023/09/BOM-logo-white.png`
- Current orange logo asset: `https://bigorange.marketing/wp-content/uploads/2025/05/BOM-logo-orange.png`
- Current live hero video: `https://bigorange.marketing/wp-content/uploads/2023/09/BigOrange-Video-Background-on-Website.mp4`
- Official Instagram account: `https://www.instagram.com/bigorange.marketing/`
- Current team brand-photo post used in the showcase: `https://www.instagram.com/p/DafpnPGki9n/` (published 2026-07-07)
- Current team Reel cover used in the showcase: `https://www.instagram.com/reel/Da0P5wUiqTs/` (published 2026-07-15)
- Current heading family: Raleway
- Current page family: Open Sans. The showcase uses Manrope as a higher-quality adjacent body family while retaining Raleway headings.
- Frequent current brand colors: `#ff7700`, `#f68326`, `#333333`, `#0d0d0d`, and white.

## Align HCM

Source date: 2026-07-15

Sources:

- Sanitized HubSpot YTD lead intelligence report
- Sanitized qualified lead channel attribution review
- Fresh public sitemap and mobile Lighthouse run on 2026-07-16

Public aggregate facts:

- 22 qualified buyer leads in the audited YTD form population
- 13 followed up and 9 without logged follow up
- 59% buyer follow up coverage
- 9 qualified leads captured from organic search
- 5 organic leads with associated deals
- $54,000 aggregate organic closed won revenue in the reviewed cohort
- 1 verified ChatGPT referral among qualified leads
- 118 URLs in the live sitemap
- Fresh mobile Lighthouse: Performance 47, Accessibility 92, Best Practices 69, SEO 100, LCP 17.3 seconds

Boundary: These are aggregate results. Person-level records and pipeline details remain private.

## Shadow Heating and Cooling

Source date: 2026-07-13 for paid media; 2026-07-16 for public technical checks

Sources:

- Verified seven-day Meta results from the sent client performance update
- Live Shadow reporting dashboard
- Live production website, sitemap, tag inspection, Netlify project readback, Netlify form API, and fresh mobile Lighthouse

Public aggregate facts:

- 4 Meta leads
- $14.40 cost per lead
- $57.60 spend
- 1,693 reach
- 3,177 impressions
- 1.88 average frequency
- 14 URLs in the live sitemap
- No GA4, GTM, Meta Pixel, Plausible, Clarity, or comparable analytics tag detected on the live homepage
- No Netlify Analytics instance is attached to the production site, so historical visitor and pageview totals are unavailable
- 2 named Netlify forms are registered (`contact` and `service-request`)
- 0 retained Netlify form submissions were returned by the site-level API on 2026-07-16
- Fresh mobile Lighthouse: Performance 38, Accessibility 96, Best Practices 100, SEO 100, LCP 10.0 seconds

Boundary: Lead identities, individual follow-up status, submission contents, and account links remain private. The public showcase labels unavailable website traffic as a measurement gap rather than estimating it.

## AMI Commercial Cleaning

Source windows: Search Console 2026-07-02 through 2026-07-10; GA4 2026-07-03 through 2026-07-12; public technical checks 2026-07-16

Sources:

- `AMI-website-analytics-growth-report.pdf`, sent 2026-07-13
- Live production website, sitemap, analytics tag inspection, and fresh mobile Lighthouse

Public aggregate facts:

- 54 Search Console clicks
- 1,833 Search Console impressions
- 2.95% search CTR
- 45.8 weighted average position
- 12 GA4 active users
- 12 GA4 sessions
- 14 GA4 page views
- 3 organic users
- 1 `form_start`, 1 `form_submit`, and 1 `generate_lead` event
- 0 key events because `generate_lead` was not yet mapped as a key event
- 22 URLs in the current live sitemap
- Branded query reached position 1
- `commercial cleaning services` produced 65 impressions at average position 14.35
- Fresh mobile Lighthouse: Performance 40, Accessibility 93, Best Practices 73, SEO 100, LCP 5.2 seconds

Immediate measurement action: mark `generate_lead` as a GA4 key event, verify the success state, and test the stored lead plus CRM handoff as one complete path.

## Lighthouse interpretation

The three Lighthouse results are single-run mobile lab tests captured together on 2026-07-16. They are useful as a shared technical baseline, but they are not field Core Web Vitals and should not be presented as stable traffic analytics.
