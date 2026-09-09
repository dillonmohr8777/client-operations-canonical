# Onsite historical phone-action evidence audit

Prepared: 2026-09-08  
Scope: read-only review of historical local artifacts and Google Drive reports for Google Ads customer `103-371-5894`.  
Question: whether the record supports a claim that no calls came from Google Ads since April 2026.

## Finding

The historical record directly contradicts an absolute “no calls” claim at the platform-event level. It does **not** prove the exact number of connected, qualified, or booked calls because no call log, recording, duration, caller identity, or estimate disposition was preserved for these windows.

| Date window | Observed count | Exact definition in source | Source |
| --- | ---: | --- | --- |
| Apr 20–26 | 1 | Google reported a “Phone Call Lead” attributed to the PMax campaign via the call asset and phone-call conversion tracking. The report describes it as a direct business call, but no underlying call record is attached. | [Drive report](https://docs.google.com/document/d/145byWeGqjefNRGelKwkX8wzKl56HnXW4dzzv2rbHcOI/edit) |
| Apr 8–Jun 6 | 8 | Seven `Web Phone Calls` and one `Calls from Smart Campaign Ads`; the source treats the website events as a visitor tapping a website phone number and calling. This is a historical Google Ads conversion classification, not connected-call proof. | [Drive spreadsheet](https://docs.google.com/spreadsheets/d/1JvJZpmm4TK-KNglohd6wu8fZ2Ov7HQaT5t5kNey0Zrs/edit), `Conversion Deep Dive` rows 9–14; `Campaign Details` rows 3–4 |
| May 21–Jun 17 | 9 | Two Smart phone events plus seven PMax web-phone events. | `deliverables/2026-08-12-call-volume-recovery/live-audit-and-change-plan.md` |
| Jun 7–14 | 6 total conversions | PMax conversion total. The report does not state the action split, so it cannot be claimed as six calls. | [Drive report](https://docs.google.com/document/d/1Bw4EvC-cQaJdCx9YvbSgJKzDJD5SpHN-8QmQpdEbYJ0/edit) |
| Jun 18–Jul 15 | 35 | One Smart phone event plus 34 PMax phone events. | `deliverables/2026-08-12-call-volume-recovery/live-audit-and-change-plan.md` |
| Jul 6–12 | 6 | A preserved reporting pull labels the result as two forms and six calls; no named contact or call disposition was retained. | `paid-media/correction-packet-2026-07-16-conversion-deduplication.md`; `context/operating-context.md` |
| Aug 17–23 | 3 | Google `Web Phone Call` actions. The report explicitly leaves booked-job quality pending. | `deliverables/2026-08-24-weekly-report-2026-08-17-to-2026-08-23/source-data.json` |

## What can and cannot be said

- Defensible: Google Ads recorded phone-related actions in every historical window above except the July 16–August 12 active-Smart-only segment, where Smart showed zero calls while paused PMax carried other events.
- Defensible: The Apr 8–Jun 6 source alone shows 8 phone-related Google actions, and the May 21–Jul 15 audit shows 44 phone events across two consecutive 28-day windows.
- Not defensible: that all actions were distinct people, connected calls, service-fit prospects, qualified estimates, or booked jobs.
- Not defensible: adding overlapping windows together. Apr 8–Jun 6 overlaps May 21–Jun 6, and Jul 6–12 sits inside Jun 18–Jul 15.

## Material contradictions and limits

1. The April narrative calls a PMax conversion a direct phone call, but the June source’s `Web Phone Calls` definition includes a phone-number tap. The underlying event IDs and call records are unavailable, so the stronger April wording cannot be independently corroborated.
2. By September, the account had 14 Primary conversion actions; `Web Phone Calls` and `Phone Call Click` were marked misconfigured. This creates a duplicate-counting risk and means raw platform action totals should not be used as a lead count.
3. The internal conversion-intake sheet had no Onsite rows in the accessible `Zapier Lead Intake` range. Its source map says final URLs and lead recovery still required confirmation.
4. No CRM/call-log reconciliation was available in the local September health review. The account’s own measurement design requires a connected, service-fit call plus downstream estimate disposition before counting a qualified estimate.

## Best concise response to the claim

“The Google Ads history does show phone activity. For example, the Apr 8–Jun 6 report recorded 8 phone-related actions, and the May 21–Jul 15 account audit recorded 44 phone events. We cannot honestly call those 52 unique qualified calls because the account was counting phone clicks and overlapping conversion actions, and no call log was reconciled. But ‘no one is calling from ads’ is contradicted by the platform record.”
