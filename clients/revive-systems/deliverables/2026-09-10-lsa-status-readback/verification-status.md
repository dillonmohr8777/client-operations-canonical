# Revive Systems Local Services Ads live readback

Date: 2026-09-10
Client: `revive-systems`
Account: Google Ads customer `6486345529` (`Revive Fitness / Mike Over LSA`)
Privacy: redacted internal package
External action: client email SENT 2026-09-10 14:23 UTC to Mike Over only (Mac not copied). Message `1a08bb3798882712` in thread `1a081d3d58d765a3`.

## Conclusion

The background check wait is over in Google Ads. Live API readback shows `BACKGROUND_CHECK` **PASSED**, adjudicated `2026-07-27`. The system-generated Local Services campaign is **ENABLED**, **SERVING**, and **ELIGIBLE**. That is not the same as producing leads. Last 30 days: no impressions, no clicks, no cost, no phone calls. The Local Services lead resource returned no leads.

Two document artifacts remain **FAILED** and are the remaining Google-side document gates:

1. Insurance: `WRONG_DOCUMENT_TYPE`. Listed expiration `2026-07-30` (already past).
2. License: `WRONG_DOCUMENT_OR_ID`. Google recorded license type `MD Health Club Registration from the Department of Consumer Protection`. License number stored as `NA`.

Featured professional / employee: one `BUSINESS_OWNER` employee is **ENABLED**.

## Live gates as of 2026-09-10 morning ET

| Gate | Status | Class |
| --- | --- | --- |
| Background check | PASSED (adjudicated 2026-07-27) | Complete |
| Insurance document | FAILED (`WRONG_DOCUMENT_TYPE`) | Open document gate |
| License document | FAILED (`WRONG_DOCUMENT_OR_ID`) | Open document gate |
| Business owner employee | ENABLED | Complete |
| Campaign status | ENABLED / SERVING / ELIGIBLE | Account eligible |
| Live lead delivery | No Local Services leads returned | Not producing leads yet |

Source: direct Google Ads API `v23` search on customer `6486345529` with no `login-customer-id`. Probe request ids are in `live-readback.json`.

## Campaign facts (read-only)

- Campaign id `24066994228`, name `LocalServicesCampaign:SystemGenerated:0006575117681317`
- Channel type `LOCAL_SERVICES`
- Daily budget `$71.43`
- Service ids: nutritional_counseling, personal_trainer_other, weight_loss, yoga, aerobics, athletic_performance, circuit_training, endurance, fitness_assessment, hiit, strength_conditioning
- Ad schedule: Monday through Saturday only (no Sunday daypart)

## Migration hypothesis (Mac, Slack 2026-09-03)

Mac asked whether the LSA-to-Google-Ads migration might be holding the background check. Live state does not support that as the current blocker:

- This account already has a Local Services campaign inside Google Ads.
- Background check passed in the API on 2026-07-27, before the August 2026 home-services migration wave.
- Google's published migration note says completed verification carries over; the August wave is plumbing, HVAC, electrical, and similar home categories, not personal training.
- Remaining failures are wrong insurance file type and wrong license document.

Do not present the migration as a confirmed cause in client copy.

## Contrast with 2026-08-06 / 2026-08-28 portal notes

Earlier live portal readbacks still showed background check in progress after Evident submission complete. The Google Ads verification artifact now shows PASSED with a 2026-07-27 adjudication timestamp. Treat the 2026-09-10 API read as current for the Google Ads Local Services account. Do not claim the old LSA dashboard screenshot is still current.

## Boundaries

- No campaign, budget, document, or account mutation.
- No Slack reply to Mac.
- Client email SENT to `mjover09@gmail.com` only. Receipt: `email-delivery-receipt.json`.
