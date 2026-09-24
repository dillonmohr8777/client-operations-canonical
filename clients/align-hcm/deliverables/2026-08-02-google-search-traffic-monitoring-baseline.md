# Align HCM Google Search traffic monitoring baseline

**Work item:** `wi-20260802-0001`  
**Prepared:** 2026-08-02  
**Mode:** local, read only, redacted  
**Canonical website:** `https://www.alignhcm.com/`

## Current verified baseline

The freshest authorized aggregate evidence in the canonical client folder is the HubSpot YTD attribution snapshot generated on 2026-07-30 and reporting through 2026-07-30 Eastern.

For the January 1 through July 30, 2026 contact cohort, HubSpot records:

- **25 contacts** with native or deterministic Organic Search evidence.
- **15 companies** represented by those Organic Search contacts.
- **1 associated closed-won deal worth $54,000** in the Organic Search cohort.
- **1 associated open deal worth $15,000** in the Organic Search cohort.

These are CRM attribution outcomes. They are not Google Search traffic totals and must not be presented as Search Console clicks, impressions, click-through rate, query rankings, or GA4 organic sessions.

A public read-only check on 2026-08-02 returned HTTP 200 for:

- `https://www.alignhcm.com/`
- `https://www.alignhcm.com/robots.txt`
- `https://www.alignhcm.com/sitemap.xml`

This confirms current public availability of the main site, robots file, and sitemap at the time of the check. It does not establish search demand, indexing volume, rankings, or traffic.

## Source coverage and freshness

| Source | Evidence window | What it verifies | Current limitation |
|---|---|---|---|
| `clients/align-hcm/deliverables/2026-07-30-ytd-attribution-report/ytd-company-attribution.json` | 2026-01-01 through 2026-07-30 | Aggregate HubSpot Organic Search contacts, companies, and associated deal outcomes | CRM attribution only; no Search Console or GA4 traffic metrics |
| `clients/align-hcm/attribution/2026-07-18-weekend-attribution-knowledge-session.md` | Refreshed 2026-07-18 | Authorized HubSpot refresh and measurement-gap status | States that GA4 and Search Console are not part of the refresh path and the session-level traffic endpoint is unavailable |
| `clients/align-hcm/github/align-hcm-lead-intelligence/reports/latest-hubspot-kpi-report.md` | Generated 2026-07-15 | Aggregate CRM, forms, content inventory, and site-health baseline | HubSpot traffic requests returned 403; organic impressions, clicks, position, and queries require Search Console |
| Public HTTP readback | 2026-08-02 | Main site, robots, and sitemap returned HTTP 200 | Availability only; not an analytics source |
| `agent-os-run:20260802-011238-f19758b7/task.json` | Observed 2026-08-02 | Exact-routed request to monitor Google Search traffic | The source request does not supply a reporting period or authorize account changes |

## Metrics available now

### Verified

- HubSpot Organic Search cohort contacts and represented companies through 2026-07-30.
- Associated closed-won and open-deal outcomes for that cohort through the same snapshot.
- Current public availability of the homepage, robots file, and sitemap.

### Unavailable or pending validation

- Google Search Console clicks, impressions, click-through rate, average position, query mix, page mix, country, device, and indexing coverage.
- GA4 organic sessions, users, engaged sessions, landing pages, and conversion events.
- A fresh HubSpot session-level organic traffic report; the documented endpoint returned 403 in the latest recorded attempt.
- A defensible week-over-week or month-over-month search-traffic trend. The available CRM snapshots do not provide comparable Search Console or GA4 periods.

No unavailable value is estimated or backfilled from CRM contacts.

## Monitoring contract

When the exact authorized read-only Search Console and GA4 routes are available, each monitoring run should record:

1. **Property and period:** exact property, timezone, start and end dates, comparison period, and retrieval timestamp.
2. **Search Console:** clicks, impressions, CTR, average position, top queries, top pages, country and device splits, indexing exceptions, and material period-over-period changes.
3. **GA4 organic traffic:** sessions, users, engaged sessions, engagement rate, organic landing pages, and validated conversion events.
4. **HubSpot outcomes:** Organic Search contacts, qualified leads, associated opportunities, open pipeline, won outcomes, and source-field completeness.
5. **Reconciliation:** keep Search Console demand, GA4 onsite behavior, and HubSpot CRM outcomes separate; join only through verified dates, landing pages, and approved aggregate keys.
6. **Data quality:** record latency, missing scopes, duplicate events, attribution windows, and any period mismatch before interpreting changes.

## Safe next step

Map or confirm the exact authorized read-only Search Console and GA4 properties for `alignhcm.com`, then capture the first comparable 28-day baseline and previous-period comparison. Creating connections, changing permissions, configuring events, or modifying the website remains approval-gated.

## Safety attestation

- No Google, HubSpot, analytics, Search Console, website, or account setting was changed.
- No message was sent and no artifact was published or deployed.
- No raw communication, secret, direct identifier, or lead-level record is included.
