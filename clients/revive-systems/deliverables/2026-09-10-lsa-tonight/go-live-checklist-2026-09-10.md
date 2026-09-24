# Revive Systems LSA go-live checklist — 2026-09-10 (ET)

**Account:** Revive Fitness / Mike Over LSA · CID `648-634-5529`  
**LSA profile name:** Revive Systems Health Coaching and Personal Training · Chambersburg  
**Source:** live UI read-only capture `/workspace/ads-reports/revive-lsa/live-blockers-2026-09-10.*`  
**Mutations:** none

## Live blockers (tonight)

| Item | Live status | Notes |
|------|-------------|-------|
| Background check | **In progress** | Verification Portal card says Continue; Google text says Evident ID/driver’s license for owners. |
| Featured professionals | **In progress** | Blocks serving until complete. |
| Billing / GBP / bidding / headshot | Complete | OK |
| Insurance document check | **Not shown** | No insurance failure card, wrong-type, or expired-date text in live Verification Portal. |
| License document check | **Not shown** | No MD health-club rejection text in live Verification Portal. |
| Policy Manager | **Violation** | Local Services Ads Requirements – Minimum Provider Requirements · Ad in violation: **Personal Trainer** · Action: Complete verification |
| Serving | **Not appearing** | Banner: “Your ad won't appear on Google until you complete the next steps.” Profile: “Your ad will be on once all checks are passed.” |
| Leads | **0** | Previous 7 days: 0 leads. Expected credit $0.00. |

## Discrepancy vs Dillon email (Sep 10 ~10:23 AM ET)

Morning email to Mike said: background check **passed**, campaign **eligible**, insurance **wrong type + expired**, license **rejected as MD health club registration**.  
Tonight’s live portal shows: background check **in progress**, ad **not appearing**, **no** insurance/license failure cards. Treat live UI as current truth until re-verified.

## Mike upload / action path (draft only — do not email Mike unless Dillon names send)

### A) Background check (what the live UI actually exposes)
1. Google Ads → account selector → **Revive Fitness / Mike Over LSA 648-634-5529**
2. Open Local Services Ads (not the empty Google Ads “0 campaigns” overview)
3. **Policy Manager** → **Complete verification** → **Business Verification** → **Background check**
4. Expand **How to get started** → finish on **Evident** (owners upload driver’s license or ID)
5. Evident support if stuck: https://www.evidentid.com/support/google/
6. Do **not** click Continue / upload from this agent session unless Dillon orders a mutate

### B) Insurance / license re-upload
- **Not available in live UI tonight.** No card, button, or accepted doc-type list for insurance or professional license.
- If Google still needs those files, they must surface under Business Verification after bg check advances, or via Google LSA support. Do not invent a click path that is not on screen.

### C) Policy / serving unlock
1. Clear Minimum Provider Requirements for **Personal Trainer** by completing verification (Policy Manager → Complete verification)
2. Finish **Featured professionals** (still In progress)
3. Confirm Leads banner no longer says “Finish requirements”
4. Confirm lead count moves off zero after serving resumes

## Escalation contacts (live UI)
- Evident: https://www.evidentid.com/support/google/
- Google LSA email support: https://support.google.com/google-ads/contact/local_services_google_reactive_support?hl=en
- Phone: +1 844-263-9884 · 9:00 AM – 9:00 PM EDT Mon–Fri
- Policy: https://support.google.com/adspolicy/answer/6245891?hl=en#507

## Go-live gate (all must be true)
- [ ] Background check shows Passed (not In progress)
- [ ] Featured professionals Complete
- [ ] Policy Manager clear of Minimum Provider Requirements for Personal Trainer
- [ ] Leads banner no longer “Finish requirements”
- [ ] Profile says ad is on / serving
- [ ] First real LSA lead appears (or impressions/calls if lead UI lags)
- [ ] If insurance/license cards reappear: upload current COI + correct license type Google names (not MD health club registration unless that is what they request)

## Do not
- Email Mike unless Dillon names send
- Unpause / mutate without an explicit order
- Tell Mike insurance is required until a live insurance card or Google support answer says so
