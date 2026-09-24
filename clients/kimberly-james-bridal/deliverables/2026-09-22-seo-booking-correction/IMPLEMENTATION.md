# Kimberly James Bridal SEO and booking correction

Status: implementation ready, not published  
Verified: September 22, 2026  
Client: `kimberly-james-bridal`

## Current live evidence

| Route | HTTP | Canonical | Visible role | JSON-LD address |
| --- | ---: | --- | --- | --- |
| `/` | 200 | `https://www.kimberlyjamesbridal.com` | Main site | 15 West Highland Avenue |
| `/scheduling` | 200 | Self | Main-site appointment route linked from the homepage | 15 West Highland Avenue |
| `/schedule-today` | 200 | Self | Duplicate appointment page | 15 West Highland Avenue |
| `/bridal-appointment-request` | 200 | Self | Paid or campaign appointment route | 15 West Highland Avenue |

The visible homepage footer currently shows 8333 Germantown Avenue, Philadelphia, PA 19118, phone 267.809.5784, and appointment-only hours. The structured data conflicts with that visible information on every checked route.

## Ready changes

1. In Squarespace Business Information, replace the old West Highland Avenue address with the client-confirmed legal location, then verify the generated Organization and LocalBusiness JSON-LD on the homepage and booking routes.
2. Reconcile the structured hours to the client-confirmed appointment schedule before publication.
3. Keep `/scheduling` as the provisional main-site booking route because the live homepage currently links to it.
4. Do not redirect `/bridal-appointment-request` until its paid-media destination and conversion tracking are checked. It may remain a campaign-specific landing page even when `/scheduling` is the organic canonical path.
5. Treat `/schedule-today` as the duplicate candidate. After the client confirms the primary booking route, use one 301 redirect rather than maintaining two copies of the same appointment content.
6. Update internal appointment links, sitemap inclusion, title, H1, and structured data to match the selected route. Preserve the existing paid route until the advertising final URL and measurement path are updated together.

## Verification after publication

- The visible address, Business Information, Organization schema, LocalBusiness schema, phone, and hours agree.
- One organic appointment URL is linked from navigation and the homepage.
- The duplicate appointment URL redirects once to the approved canonical route.
- The campaign route either remains intentionally separate with its own purpose and measurement, or redirects only after paid destinations are changed.
- Canonical tags, sitemap entries, and internal links agree with the approved route.
- Desktop and mobile appointment flows reach the intended scheduler without a broken or competing call to action.

## Blocking decision

Kimberly must confirm the one primary booking destination. A confirmation request was sent in Gmail thread `1a0c6644db434a16`; latest sent message ID `1a0cafb7bb976b6d`.

No Squarespace, redirect, sitemap, tracking, advertising, or publication change was made while this decision is open.
