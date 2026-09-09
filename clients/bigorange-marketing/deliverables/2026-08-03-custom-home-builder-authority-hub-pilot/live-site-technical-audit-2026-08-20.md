# Live Site Technical Audit Refresh

Captured August 20, 2026 against `https://bigorange.marketing/marketing-agency-for-builders/`.

## Lighthouse lab snapshot

| Category | Mobile | Desktop |
|---|---:|---:|
| Performance | 32 | 75 |
| Accessibility | 86 | 86 |
| Best practices | 54 | 54 |
| SEO | 92 | 92 |

Mobile lab metrics:

- First Contentful Paint: 14.2 seconds
- Largest Contentful Paint: 36.1 seconds
- Total Blocking Time: 1,110 milliseconds
- Speed Index: 14.5 seconds
- Cumulative Layout Shift: 0
- Total transfer size: about 7,541 KiB

Desktop lab metrics:

- First Contentful Paint: 1.3 seconds
- Largest Contentful Paint: 2.7 seconds
- Total Blocking Time: 20 milliseconds
- Speed Index: 2.8 seconds
- Cumulative Layout Shift: 0

## Highest-priority implementation work

1. Reduce or conditionally load unused JavaScript. Lighthouse estimated about 703 KiB and 4.18 seconds of avoidable work on mobile.
2. Convert and correctly size remaining large images. Lighthouse estimated about 966 KiB of image savings.
3. Remove render-blocking requests and improve font loading. The mobile lab run estimated 5.47 seconds of render-blocking delay.
4. Reduce unused CSS and page-builder payload where safe.
5. Fix accessibility failures: prohibited ARIA attributes, insufficient color contrast, untitled iframe content, skipped heading levels, and unnamed links.
6. Resolve console errors, deprecated APIs, third-party-cookie dependencies, and Chrome Issues panel findings.
7. Retest after the authority-hub modules are assembled in staging. One run is directional lab evidence, not field data.

## Interpretation

The mobile performance issue discussed on August 12 is still a material launch blocker. The score improved from the meeting's reported 26 to 32 in this lab capture, but the page remains slow enough that the implementation cannot be called production-ready without staging remediation and a confirmation run.

Raw evidence:

- `evidence/lighthouse-mobile-2026-08-20.json`
- `evidence/lighthouse-desktop-2026-08-20.json`

