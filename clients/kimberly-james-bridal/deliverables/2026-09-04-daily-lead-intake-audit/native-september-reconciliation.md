# KJB native September lead reconciliation

Bounded read-only follow-up, September 4, 2026 approximately 11:36–11:40 PM Eastern. No campaign, budget, form, account or draft changes; no messages sent.

## Verified native UI evidence

- Exact account: KJB Meta Ads **1249689223687250**, business **2069084743213180**.
- Campaign: **52525678824764**, Kimberly James Bridal | Leads | Qualified Form | Philadelphia | 2026-07.
- Ad set: **52525678825164**, Philadelphia +25mi | Women 22+ | Higher Intent Form.
- Both the Ads Manager reporting date picker and native lead-download date picker explicitly display **Dates are shown in Eastern Time**. This resolves the UI reporting timezone; the settings-page IANA identifier was not inspected or changed.
- Native path: ad-set Results > Download > Download leads > Manual download. Selected **September 1–3, 2026**; UI returned **2 leads found**. The ad-object selector attributes those 2 to the exact July Qualified Form campaign; the June campaign was unchecked and showed 0 leads for that filter.
- Review screen confirmed **You'll download 2 leads**, the exact July campaign, selected ad set, and ad KJB | 4-Image | Qualified Bridal Appointment. All targeted locations. The review screen rendered **September 1, 2026 – September 4, 2026**, whereas the filter explicitly displayed September 1–3. An exclusive upper endpoint is plausible but not verified from record timestamps; preserve this difference.
- One CSV export was requested. The UI reported **Multi ad object leads.zip downloaded**. The browser tool did not return a file path. A bounded local search did not locate the new ZIP. No second export was requested.

## What remains unverified

Native row-level lead IDs and submission timestamps were not exposed in the review UI, and the exported ZIP contents were not available for inspection in this pass. Therefore **2 is a native download-preview count, not a verified unique-record count**. Download toast alone is not proof of a saved, inspected private artifact. No new contact details were read, copied into reports or stored outside the existing private folder.

The older four screenshot records were already delivered; displayed submission dates are August 28, August 30, August 31 and September 2, timezone unknown. Only one is nominally within September 1–3. Do not compare all four to the 2 platform-attributed form leads or infer a missing lead. Native preview count 2 and earlier attributed-event count 2 are consistent numerically, but equality does not establish identity, attribution-time alignment, qualification or booking.

Next exact checkpoint, if separately continued: recover the single already-requested native export artifact through the browser's supported download surface, place it only in the gitignored private directory, and inspect IDs, created timestamps and duplicate/matching counts without disclosing contact details. This is a download-artifact handoff gap, **not an authentication, Meta-permission or filesystem-sandbox failure**.

Source: https://adsmanager.facebook.com/adsmanager/manage/adsets?act=1249689223687250&business_id=2069084743213180&selected_campaign_ids=52525678824764&selected_adset_ids=52525678825164 . The existing unpublished draft remained Review and publish (1); no settings were edited. Temporary browser tab closed. Master owns any further retrieval and self-email.
