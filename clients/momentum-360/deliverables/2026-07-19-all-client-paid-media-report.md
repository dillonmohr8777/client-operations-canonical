---
date: 2026-07-19
client: momentum-360
status: evidence-bounded-current-report
platforms: [google-ads, meta-ads]
source_dashboard: https://momentum-account-manager-dashboard.netlify.app/
external_changes: none
---

# Momentum 360 — All-Client Paid Media Report

## Executive readout

This report uses the newest verified Momentum AM V2 reporting contract and the canonical paid-media roster. It keeps Google Ads and Meta Ads separate, puts verified leads/outcomes ahead of platform volume, labels source freshness, excludes test/duplicate/unverified conversions, and preserves missing values as **pending** rather than zero.

- Authorized paid-media scope: **8 client/platform lanes across 7 clients**.
- Google Ads lanes: KJB, Replenish, Fresh Blends/Kwik Trip, Omega, Onsite.
- Meta Ads lanes: Fagan, Shadow Heating, KJB.
- Live Google Ads inventory is connected, but all 13 child-account GAQL reads failed on 2026-07-19 because the connector cannot set the required manager `login-customer-id` header; one inventory account is deactivated.
- Meta Ads API reporting is not connected. The latest exact-account browser evidence is dated 2026-07-16.
- Therefore, campaign figures below are the **latest verified observations**, not implied real-time values and not authority for spend changes.

## Latest Momentum dashboard state

Source: [Momentum Client Reporting](https://momentum-account-manager-dashboard.netlify.app/) — V2 deploy `6a5a2c7e908b6188729e5122`.

| Dashboard report | Window | Verified leads | Calls | Appointments | Organic evidence | Source status |
|---|---:|---:|---:|---:|---|---|
| Kimberly James Bridal | Jul 1–15 | **28** verified form/Meta contacts | Pending, not zero | Pending; 5 test/routing rows excluded | 54 clicks / 4,624 impressions / 1.17% CTR | 3 of 6 sources connected; Google Ads permission and Meta OAuth pending |
| Fresh Blends | Jul 1–31 shell | Pending | Pending | Pending | Pending | Source setup only; no metrics inferred |

The live dashboard currently contains only these two report shells. The canonical roster below is the authoritative all-client paid-media scope.

## Google Ads

| Client | Latest verified platform state | Latest verified figures | Outcome/measurement status | Chief recommendation |
|---|---|---|---|---|
| **Kimberly James Bridal** | Primary account verified; cancelled duplicate excluded. Performance Max campaign observed enabled. | Jul 16 observation: **$20/day**, **54,814 impressions**, **$585.42 spend**, **0 platform conversions** over the observed 30-day window. | Dashboard has 28 verified form/Meta contacts, but Google conversions, calls, and booked bridal appointments are unresolved. | Do not raise budget. Repair Google appointment conversion tracking and reconcile every source to booked/qualified appointments first. |
| **Replenish / 7-Eleven** | Exact child mapping verified. Replenish must remain separate from Fresh Blends even where one child account displays both. | Paid delivery/spend require a fresh manager-header readback. Supporting GA4: Jul 18 **265 sessions / 244 active users / 0 reported conversions**; Jul 19 partial **115 / 107 / 0**. | A verified Miami 56 direction action exists, but GA4 reports zero conversions. | At the KPI sync, define the conversion contract, reconcile the Miami 56 direction event, and verify each store campaign before any account change. |
| **Fresh Blends / Kwik Trip Ice Box** | Campaigns `#1110`, `#1161`, `#573`, and `#633` were observed paused. | No current paid metrics available; dashboard shell remains source setup. | Fresh Blends is separate from Replenish. No current conversion outcome is verified. | Keep paused unless a fresh exact-account readback plus explicit authorization proves otherwise. Do not mix Replenish evidence. |
| **Omega Landscaping & Concrete** | Colorado Springs Performance Max observed enabled; seven Search campaigns observed paused. | Jul 16 observation: **$50/day** and **13 platform conversions**. | The 13 platform conversions are not yet reconciled to qualified opportunities. | Hold budget recommendations. Reconcile source, lead owner, contact, qualification, and disposition; then review search intent and negatives. |
| **On-Site Concrete & Landscape** | Smart campaign observed active. | Jul 16 observation: **$4.39/day**, **$133 monthly maximum**, **2 web conversions**. | Conversion setup was incomplete; calls/forms/CRM/imported events may duplicate or misclassify outcomes. | Complete conversion setup and lead-quality reconciliation before optimization. Preserve the monthly cap pending evidence. |

## Meta Ads

| Client | Latest verified platform state | Latest verified figures | Outcome/measurement status | Chief recommendation |
|---|---|---|---|---|
| **Fagan Painting** | Exact account verified with six campaigns; primary new campaign observed in draft and another campaign off. | Current spend, frequency, CTR, CPL, and placement metrics are pending live readback. | Two website-lead dispositions and response ownership remain unverified; platform counts are not business outcomes. | Resolve lead ownership/disposition first. Then review creative fatigue, frequency, placements, and attribution—no scaling recommendation yet. |
| **Shadow Heating & Cooling** | Exact Meta account is not visible in the current authorized portfolio and remains unmapped. | Pending; no figure is safe to report. | Lead quality and service-area fit are unverified. | Map and verify the exact account before any optimization, report, or spend recommendation. |
| **Kimberly James Bridal** | Exact account verified with four campaigns. Website Carousel Traffic and Website Retargeting observed active; Leads carousel observed draft. | Native campaign spend/result metrics pending Meta OAuth. Dashboard lead sheet shows **28 verified contacts** through Jul 15, but it cannot establish Meta spend or calls. | Booked/qualified appointment reconciliation remains incomplete. | Keep Meta and Google evidence separate. Reconcile leads to bridal appointments and verify pixel/form/CRM continuity before creative or budget recommendations. |

## Clients intentionally excluded from paid-media metrics

The following active operating lanes are not in the canonical paid-media roster and therefore receive no fabricated ad report: Align HCM, Bar Crawl USA, Capsule & Tonic, Everyday Life Insurance, Hope Wellness Center, Pro Fence & Deck, VA Claims Edge, Bridge Software, Revive Systems, BigOrange, and other non-rostered client/project lanes. Their SEO, analytics, product, or operational evidence belongs in separate reports.

## Cross-client priorities

1. **Measurement before spend:** KJB Google, Omega, Onsite, Replenish, Fagan, and KJB Meta all have unresolved source-to-qualified-outcome gaps.
2. **Exact account access:** Fix the Google manager-header route and restore a current Meta read path; do not use account inventory as proof of performance.
3. **Client separation:** Never combine Replenish/7-Eleven with Fresh Blends/Kwik Trip, even inside one Google child account.
4. **Paused means paused:** Fresh Blends Ice Box campaigns remain paused until current readback and explicit authorization say otherwise.
5. **No inferred zeros:** Missing calls, appointments, spend, conversions, Meta metrics, and Shadow data remain pending.

## Source ledger

- Live Momentum V2 API read: `https://momentum-account-manager-dashboard.netlify.app/api/dashboard`
- Dashboard source-of-truth: `clients/momentum-360/deliverables/2026-07-16-melissa-dashboard-source-of-truth.md`
- Canonical roster: `registry/paid-media-roster.json`
- Daily manifest: `state/paid-media/daily-review-2026-07-19.json`
- Provider readiness: `state/ad-provider-readiness.json`
- Current operator findings: `C:/Users/dillo/repos/dillon-os/Daily-Briefs/operator-2026-07-19.md`

No campaign, budget, targeting, creative, account, or Netlify usage setting was changed while producing this report.
