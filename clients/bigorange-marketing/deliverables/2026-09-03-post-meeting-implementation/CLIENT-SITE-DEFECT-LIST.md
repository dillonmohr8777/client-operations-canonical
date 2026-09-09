# BigOrange website defect list

Prepared September 3, 2026 for client review. No site changes were made.

## Evidence dates and limits

- Public WordPress crawl: September 1, 2026, 370 published URLs.
- Builder-hub mobile performance observation: August 20, 2026.
- Moz ranking export: August 14, 2026. Rankings are contextual only and are not used
  to prove that a technical issue is fixed or current.
- Every item should be rechecked in WordPress or against the public URL immediately
  before remediation because this is a dated audit snapshot.

## Priority issues

| Priority | Finding at snapshot | Recommended next action | Proof required to close |
| --- | --- | --- | --- |
| P0 | `/ai-search-optimization-services/` had four H1 elements and `index, nofollow`. | Choose one H1. Decide whether the page is an indexable service page or a noindex utility page, then set robots directives consistently. | Fresh rendered heading outline, robots meta and response-header check. |
| P0 | The homepage used `Stategic` in metadata, Open Graph and Organization schema. | Correct the spelling everywhere the same field is reused. | Fresh source and structured-data readback. |
| P0 | `/marketing-agency-for-builders/` recorded approximately 36 seconds mobile LCP on August 20. | Profile the hero, media, fonts, scripts and server response before replacing the existing hub. | Fresh mobile performance run after the approved repair. |
| P1 | 21 published pages were absent from the page sitemap. | Classify each URL. Include strategic indexable pages; keep confirmation or campaign sinks intentionally noindex. | Fresh sitemap diff against the published URL inventory. |
| P1 | 15 published pages carried `nofollow`. | Review intent page by page. Keep `nofollow` only where it is deliberate and documented. | Fresh robots inventory with an owner and reason for each exception. |
| P1 | 8 of 50 homepage images lacked alt text. | Add useful alternatives to meaningful images and empty alt attributes to decorative images. | Fresh accessibility scan plus manual image-purpose review. |

## Release boundary

This list is a remediation brief, not authorization to edit WordPress. It does not
claim that an item remains broken today, that a change has been implemented, or that
any ranking or conversion outcome will result. BigOrange selects the owners and
approves the changes; fresh verification closes each item.
