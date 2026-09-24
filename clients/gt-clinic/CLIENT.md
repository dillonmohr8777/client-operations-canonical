# GT Aesthetic & Functional Medicine

Canonical client id: `gt-clinic`
Portfolio owner: Momentum 360
Verified Slack route: `#gt-clinic` (`C0C0RR57B25`)
Public site: `https://thegtclinic.com/`
Record last reconciled: 2026-09-22

## Identity

- Legal / trading name: GT Aesthetic & Functional Medicine, also called GT Clinic.
- Owner and medical director: Ghazala Farooqui, MD. Exact spelling matters in client-facing work.
- Kickoff contact: `gtfarooqui@yahoo.com`.
- Practice: physician-led regenerative, aesthetic and functional medicine. Marlton, NJ, with location pages for Cherry Hill, Moorestown and Voorhees.
- Vertical: medical aesthetics and functional medicine. Claims are regulated. No patient, treatment, symptom or protected health information belongs in any artifact under this folder.

## Commercial

- Accepted 17hats quote `brgoeLawllWB` / quote 7776543. Issued 2026-08-21, displays `Accepted: Sep 9th, 2026`.
- **$900.00 monthly**, Google Local Marketing Package.
- Six-month initial term, then month-to-month. Client may cancel at any time with 30 days paid notice.
- Signature panel: Ghazala Farooqui signed 2026-09-09; Jesse signed 2026-09-03.
- Optional one-time $600 website redesign (`j3KpzzxjDjeO`) is **excluded** from scope.
- Google Ads commercial terms are settled, not open: Google bills the client card directly, Momentum holds management access only, and the account, campaigns, conversion tracking, audiences, data and assets remain GT Clinic property. A monthly media budget is client-set and must arrive in writing, separate from the retainer.
- Payment method for the Momentum retainer was supplied 2026-09-21 (mac, `#gt-clinic`). mac is deliberately holding auto-billing for a few days so the first charge does not land immediately after signature.

### Two unresolved commercial conflicts

1. **Retainer number.** The accepted quote says $900/month. Dillon's 2026-08-26 email described $900 service plus a separate ~$1,000 starting media budget, and a $1,000–$1,200 discussion has been referenced. Every artifact produced so far uses $900. Confirm which is active before the first report or invoice conversation.
2. **Renewal language.** The client-specific quote says no auto-renewal and no charge outside the retainer and agreed ad spend without written approval. A separate generic `$0` Terms & Conditions line still says the contract auto-renews unless notice is given, and refers to client billing for contracted software. Resolve in the contract record. Do not interpret or expand these terms.

## Service lines

**Physician-stated marketing priority, from the 2026-09-21 intake form:** laser hair removal, hair rejuvenation, melasma and hyperpigmentation, microneedling. She drew no distinction between best-selling and what to market. Functional medicine consultation (gut health, autoimmune, diabetes, sleep) is a genuine second line. This is the client's call and it is now on the record.

Matched to Momentum's service list:

- **SEO — Local**: Google Business Profile optimisation, weekly GBP posting and updating, citations / profiles / listings, NAP consistency, review growth.
- **SEO — Technical and on-page**: ongoing on-page and technical SEO, LocalBusiness / Physician / FAQPage schema, internal linking.
- **Content**: two physician-reviewed website pages per month. Medically reviewed FAQ answers where clinic-approved.
- **AI Marketing**: AEO / GEO structure, AI visibility tracking included in reporting.
- **PPC — Google**: campaign management and conversion tracking. Client-billed. A client-run account has been live since 05/2026 and Momentum has delegated access, but the account is unreachable from this environment and has never been inspected. No Momentum-managed spend is authorised. Note PRP cannot be advertised here — see open item 8.
- **Reporting**: separate website ranking and Google Maps ranking reporting, plus AI visibility.

Out of scope: website redesign, social, paid social, virtual tours, drone and HD photography, fractional CMO.

## Channels and access

| Item | State | Evidence |
|---|---|---|
| Slack `#gt-clinic` | Live, channel `C0C0RR57B25`, 6 members | Verified route |
| Google Business Profile | **Owner access granted.** Receipt filed | Client wrote "Already added Dillon" on the dated Access & Logins form. `intake/2026-09-16-access-and-logins-form.md` |
| Google Analytics | **Access granted and verified live 2026-09-22.** Property `531064094`, account `165890074` "GTAesthetics", web stream `14302649010`, measurement ID `G-PY8223SGRW`, created 2026-04-03 | Read directly via GA4 Admin + Data API |
| Google Ads | **Access granted by delegation; account unreachable from this environment** | Same form, "Already Added Dillon". Client states in intake she has run her own Google ad since 05/2026; GA4 confirms Paid Search traffic from May. Customer ID still unread — see blocker below. No spend authorised |
| SiteGround hosting | Credentials supplied by the client 2026-09-16 | Access & Logins form. **Not yet mapped to an agent-safe reference.** Account sits under a personal `gmail.com` address, not the `yahoo.com` kickoff contact |
| WordPress admin | Login URL and credentials supplied 2026-09-16 | Same form. **Not yet mapped to an agent-safe reference** |
| Google Search Console | **No property exists.** Never requested, never created | Confirmed 2026-09-22 against the full site list on both connected GSC accounts — `thegtclinic.com` is absent |
| Domain / DNS registrar | **Never requested.** Not on the access form at all | Genuinely outstanding |
| Facebook Ads Manager / social | Left blank; form offered to defer to onboarding | Not provided |
| Boulevard (booking) | Not observed in the public path | Consultation actions currently hit the site contact form |

Do not read, print, copy or store credentials from email, Slack or forms. Route hosting and WordPress through Bitwarden or an exact access-broker reference only. The exported form record deliberately carries locations, not values.

## Blocking technical condition

SiteGround returned HTTP 202 with `SG-Captcha: challenge` to all 14 direct page, sitemap, `robots.txt` and WordPress API requests on 2026-09-12, and still did so on 2026-09-18. **No source-level inspection of thegtclinic.com has ever succeeded from outside.**

Consequence: every P0 in the technical audit is *frozen, not assessed*. The correct phrasing in any client-facing document is that findings are unverified pending host access. Host access is what unfreezes the entire technical workstream.

When host access is mapped, inspect the anti-bot policy and prefer a narrow allowlist or path exclusion. Do not disable protection sitewide without Dillon's explicit approval at the action point.

## Tracking baseline — as of 2026-09-21

**Superseded 2026-09-22 by a live GA4 read.** Measurement exists and is collecting; it was never switched on.

- **GA4 is live and has ~6 months of data.** Property `531064094`, stream created 2026-04-03. 2,185 sessions 2026-04-01 → 2026-09-21: Direct 839, Organic Search 684, Paid Search 340, Organic Social 231, Referral 39, Unassigned 18, AI Assistant 17, Cross-network 12, Paid Social 5.
- **Lead events are firing and none is marked as a key event.** `form_start` 62, `contact` 37, `laser_hair_removal_lead` 27, `lead_form_submit` 26, `wrinkle_relaxer_lead` 6, `form_submit` 4, `microneedling_lead` 4 — with `keyEvents` at 0 across every channel. Service-level tracking for two of her four priority services already exists. Nothing was ever flagged as a conversion, which is why every report reads blank. The per-service events and `lead_form_submit` do not sum cleanly, so deduplication is required before any of them becomes the official conversion.
- **Do not describe this as the marketing failing to convert.** It is a configuration gap. Client-facing language is "conversion reporting is pending validation", per the paid-media rule in `AGENTS.md`.
- Paid Search by month: May 147, June 65, July 45, August 43, September 40 (partial). Delivery fell ~70% from launch and has been flat since.
- **AI Assistant: 17 sessions.** A real measurable baseline for the AI-visibility commitment.
- GA4 property time zone is `Etc/UTC`, not `America/New_York`. Every day boundary is offset. Fix before the first report.
- Search Console has no property at all, so no query, impression or position data exists.
- No CRM or call tracking. Form-submission destination still unknown — the last genuinely missing piece of match-back.

**Not yet instrumented:** conversion definition, form-submission routing, call tracking, Boulevard booking events, GBP action tracking, Ads conversion import.

**Can conversions be matched back to named leads? No — not today, and nothing currently in place would make it possible.** This is the question Momentum has been asked repeatedly across the roster and has most often failed to answer. Fixing it here is far cheaper now than in month four. The prerequisite is a known destination for contact-form submissions plus a conversion definition agreed with Ghazala.

**Ghazala asked this question herself, in writing, on the intake form, before any work started:** how will you track leads from Google Ads, organic search, Google Business Profile, phone calls and website forms so we can determine which channels are generating booked patients. It is now a stated client expectation, not an internal ambition. Note that her funnel ends in a screening call and a non-refundable $100 booking fee for medical consultations — a form fill is not a booked patient here, and any conversion definition has to survive that step.

Dated third-party benchmarks from the 2026-08-21 audit, all labelled as lab or third-party snapshots needing a same-definition rerun after access: 19 Semrush estimated ranking keywords, 2 tracked AI mentions, local Lighthouse mobile score 29, Ahrefs Domain Rating 0.6.

## Commitments made during the sale

- No additional fees, software or costs without written approval (mac, 2026-09-02).
- Google Ads billed directly to the client card; GT retains ownership of account and data.
- Cancellation at any time with 30 days notice; at least three months preferred.
- Improvement magnitude explicitly **cannot** be guaranteed. Do not let any report imply otherwise.
- Citation list is shared after creation, not as an upfront fixed list.
- AI visibility can be included in reporting.
- Separate Google, Maps and AI measurement was specifically requested by Ghazala on 2026-09-02.

## Relationship note

Dillon ran the intro call; the client came across as friendly and happy on the phone and he considers the relationship good to go. mac has separately flagged that she may be tough to work with. Both readings can be true at once and the practical implication is the same: keep written commitments narrow, confirm decisions in writing, and avoid re-asking for anything already supplied. Re-asking is the specific failure mode that damages trust here — it already came close to happening with Google Business Profile.

## Owners

| Area | Owner |
|---|---|
| Relationship, scope, approvals | Jesse DiLaura |
| Delivery: site, SEO, Ads, reporting | Dillon |
| Billing, forms, onboarding admin | mac |
| Unresolved | The role split has been flagged as needing an explicit decision. One named owner per kickoff decision is still missing. |

## Open items

Items 1, 3 and 8 closed 2026-09-21 by exporting both 17hats forms into `intake/`.
Items 4, 5, 6, 7 closed 2026-09-22 by the live GA4 read and the policy check — see
`deliverables/2026-09-22-intake-answers/`. Renumbered below.

1. **Switch on the key events in GA4 and deduplicate them.** Highest-value action on this account. Lead events have been collecting since April and none is flagged as a conversion, so both GA4 and Ads report nothing. This is a configuration change, not a build, and it is what makes every other measurement promise possible. Validate the dedupe against her actual inquiry log before quoting any number.
2. **Map the already-supplied SiteGround / WordPress credentials through Bitwarden or the access broker.** Still the single highest-value unblock, and now clearly an internal task — the client supplied everything on 2026-09-16 and has been waiting since. This is what unfreezes the whole technical workstream.
3. **Rewrite the access request email before it goes anywhere.** As drafted 2026-09-18 it asks for SiteGround, WordPress and Analytics, all of which the client had already supplied two days earlier. Sending it as written is the re-ask failure mode this record warns about. What is genuinely missing is **Search Console owner access** and **domain / DNS registrar access** — neither has ever been requested.
4. **Repair the Google Ads connection, then read the account.** Blocked 2026-09-22, not for lack of client access. The native Google Ads MCP fails OAuth refresh (`invalid_grant`); the Composio `googleads` connection is pinned to customer `6908592139`, which Google reports deactivated (`CUSTOMER_NOT_ENABLED`), and that dead ID poisons all 17 otherwise-accessible accounts with `USER_PERMISSION_DENIED`. Repointing it at a live manager account is an approval-gated config change and was deliberately not attempted. Campaign structure, spend, search terms and the customer ID remain unread.
5. **Create the Google Search Console property.** No property exists for the domain. This is a real client-facing ask and belongs in the narrowed access email alongside domain/DNS.
6. **Fix the GA4 property time zone** from `Etc/UTC` to `America/New_York` before the first report.
7. **Confirm where contact-form submissions land.** The last missing piece of named-lead match-back, and a five-minute answer from whoever built the site.
8. **PRP is effectively unadvertisable on Google Ads** — the policy check is done (`deliverables/2026-09-22-intake-answers/`). Two of her ten keywords and one of her four priority services are affected, and paid landing pages must stay clear of PRP content. Confirm with Google directly before treating it as final. Botox is usable if the treatment rather than the brand is advertised.
9. **Geo: recommend a 10-mile radius on Marlton,** which covers eight of her nine zips. The only open question for her is whether 08002 is in or out. Confirm boundaries against Google's geo targets at build time.
10. Confirm the active retainer figure ($900 vs $1,000–$1,200).
11. Resolve the contract renewal-language conflict in the contract record.
12. Confirm the Google Business Profile hours are correct — the practice runs roughly three days a week and one is by appointment only.
13. Decide whether Book Appointment keeps pointing at the contact form or moves to an approved Boulevard path.
14. Name one owner per kickoff decision (Dillon / Jesse split).
15. Check whether SEO media assets ever arrived at `momentumlocalseo@gmail.com` before asking her for them again.

## Client source records

- `intake/2026-09-21-intake-form.md` — the Momentum Digital Marketing Intake Questionnaire, verbatim. Ghazala's own statement of business, differentiators, competitors, target audiences, priority services, keywords, geography, hours, lead qualification, brand guardrails, and five questions she asked and has not had answered. **Read this before planning anything.**
- `intake/2026-09-16-access-and-logins-form.md` — the Access & Logins questionnaire as an access map. Locations only, no credential values.

## Delivery artifacts

- `deliverables/2026-09-10-plan/` — kickoff and 90-day growth plan, canonical client-facing strategy PDF (`GT-Clinic-90-Day-Growth-Strategy-2026-09-12.pdf`, 8pp, SHA-256 `E7440FBD…36580`), internal website keyword audit, QA and evidence notes, corrected access request.
- `deliverables/2026-09-18-access-request-email/` — staged access request email. **Draft, unsent, and superseded — do not send as written.** It asks for SiteGround, WordPress and Analytics, all supplied by the client on 2026-09-16. Narrow it to Search Console and domain/DNS before it goes anywhere near her.
- Handoff readiness and the exact proposed `#gt-clinic` Slack text: `deliverables/2026-09-10-plan/HANDOFF-READY-2026-09-13.md`. Still awaiting Dillon's approval of the exact text.

No client email, Slack message, site publication, Ads mutation or spend is authorised by this file.
