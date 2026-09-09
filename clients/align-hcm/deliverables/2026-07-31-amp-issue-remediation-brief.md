# Align HCM AMP issue remediation brief

Work item: `wi-20260731-0001`  
Evidence date: 2026-07-31  
Scope: read-only verification and local remediation planning

## Verified outcome

The exact Google Search Console alert reports one **non-critical** AMP recommendation: **Image size smaller than recommended size**. This is not a critical AMP validity failure and the alert says it does not currently prevent the affected page or feature from appearing in Google.

Current public readback confirms that AMP is still active on Align HCM's HubSpot blog:

- `https://www.alignhcm.com/`, `robots.txt`, and `sitemap.xml` returned HTTP 200.
- The sitemap contains 123 URLs, and all 123 returned HTTP 200 in the bounded normal-page check.
- 63 sitemap-listed blog pages advertise HubSpot AMP alternatives using `?hs_amp=true`.
- Before the host rate-limited the bounded audit, 30 AMP alternatives returned HTTP 200 and each had an AMP HTML marker, the AMP runtime, and a canonical link back to the normal article.
- The homepage does not advertise an AMP alternative.

The exact affected article is still unknown because the alert does not include an example URL. The authenticated Search Console AMP report is the authoritative source for that URL.

## Recommended remediation

1. Open the authorized Search Console property and capture the exact example URL for the non-critical issue.
2. In the exact HubSpot article, inspect the featured image and the image referenced by Article structured data.
3. Replace the source image with an appropriately cropped image at least 1200 pixels wide while preserving brand quality and page performance.
4. Recheck the normal article, its `?hs_amp=true` alternative, canonical pairing, image rendering, and structured-data output.
5. Request validation in Search Console only after the live HubSpot change is separately approved and verified.

This is routine maintenance rather than an emergency. Do not disable AMP across the blog from this one recommendation without a separate impact review.

## Evidence and limits

Primary artifact: `clients/align-hcm/evidence/2026-07-31-amp-issue-readonly-verification.json`

- The public audit did not authenticate to Search Console or HubSpot.
- The final 33 AMP-variant requests received HTTP 429 after the bounded probe; that is recorded as probe throttling, not as a site outage.
- No email was sent, no page or image was edited, no validation request was submitted, and no live configuration changed.
