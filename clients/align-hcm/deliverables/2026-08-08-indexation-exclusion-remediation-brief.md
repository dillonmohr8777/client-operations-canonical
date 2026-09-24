# Align HCM indexation exclusion remediation brief

Work item: `wi-20260808-0001`  
Evidence date: 2026-08-08  
Scope: read-only verification and local remediation planning

## Verified outcome

The exact Google Search Console alert reports two newly detected exclusion categories for `https://www.alignhcm.com/`:

1. **Page with redirect**
2. **Alternate page**

The alert does not include the exact affected URL set. Authenticated Search Console coverage examples remain the authoritative source for counts and sample URLs.

## Public readback

Current public checks for the canonical Align site:

- `https://www.alignhcm.com/`, `robots.txt`, and `sitemap.xml` returned HTTP 200.
- Host canonicalization is healthy: apex and HTTP entry points redirect to `https://www.alignhcm.com/`.
- The sitemap lists 124 URLs. A bounded sample of 37 public probes all returned HTTP 200 after following redirects.
- Trailing-slash variants on sampled content paths return HTTP 301 to the non-trailing canonical URL.
- All 64 sitemap-listed blog articles advertise HubSpot AMP alternates through `?hs_amp=true`.
- Eight probed AMP alternates returned HTTP 200 as AMP documents and each carried a canonical link back to the normal article.
- AMP alternates are not listed as separate sitemap entries.
- One sitemap-listed GUID path redirects to the homepage. That is a cleanup candidate, not proof of a broader outage.

## Classification

| Exclusion category | Public interpretation | Likely action |
| --- | --- | --- |
| Page with redirect | Expected host, protocol, and trailing-slash redirects; one GUID sitemap path redirects to homepage | Treat host and slash redirects as expected; confirm GSC examples; remove stale sitemap entry if the GUID path remains listed |
| Alternate page | Expected HubSpot AMP alternates paired to canonical blog articles | Treat as expected while AMP remains intentional; confirm GSC examples match `?hs_amp=true` pages |

No public evidence in this episode shows a broad soft-404 pattern, robots block of indexed content, or sitemap-wide failure.

## Recommended remediation

1. Open the authorized Search Console indexing / Page indexing report and capture the exact example URLs and counts for **Page with redirect** and **Alternate page**.
2. Map each example to one of the expected classes above before changing the live site.
3. If GSC examples are only AMP alternates or host/slash redirects, no emergency content change is required. Keep AMP only if it remains an intentional HubSpot setting.
4. If GSC examples include the GUID homepage-redirect path or other stale destinations, remove or correct those sitemap entries in HubSpot after separate approval.
5. After any approved live cleanup, re-check the public URL, canonical pairing, and sitemap listing, then request validation in Search Console only under a separate approval.

## Evidence and limits

Primary artifact: `clients/align-hcm/evidence/2026-08-08-indexation-exclusion-readonly-verification.json`

- Exact opaque source: `agent-os-run:20260808-061243-99986abd/task.json`
- Public audit did not authenticate to Search Console or HubSpot.
- No email was sent, no page was edited, no validation request was submitted, and no live configuration changed.
