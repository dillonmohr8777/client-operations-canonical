# Momentum workflow audit and Jev pilot
September 20, 2026. **Audit and measured pilot complete; portfolio rollout staged for review. No ad changes, messages, publication or new scheduled service.**

## Decision
Use Jev for bounded classification and review routing. Keep exact client routing, arithmetic, known exclusions, source freshness, approval matching and deduplication in code. Use frontier reasoning for conflicting evidence and consequential recommendations. This run does not validate the post's 30× claim or seven-workflow production readiness.

The highest-value improvement is a **decision-to-result check**: compare the latest client decision with live configuration, then require a business-outcome receipt before calling the work complete. This found an enabled Onsite PMax campaign, a corroborated Capsule lead-sheet mismatch, duplicate-negative risk, and reporting definitions that need reconciliation.

## Verified priorities
1. **Onsite PMax pause mismatch.** Live Google Ads customer 1033715894 shows campaign 22454241769, Leads-Performance Max-1, Enabled at $5/day. September 13–19: $2.98, 10 clicks, 185 impressions and one platform conversion. Both Search campaigns are paused. This supersedes the earlier local note that Search was enabled. The September 16 [call recap requests a Google Ads pause](https://momentum3d.slack.com/archives/C087GM7SEJF/p1789575902280849). Seven-day spend does not establish how much occurred after that request. Exact proposed change: pause only this PMax campaign after checking for a later authorized exception; verify zero enabled campaigns and retain change-history receipt. **Staged, not applied.**
2. **Capsule & Tonic conversion-to-sheet mismatch.** [Beth's report](https://momentum3d.slack.com/archives/C04MB3ZQ7FT/p1789397143587249) identifies three September 2 and two September 13 forms missing from the sheet. Direct read of [Sheet1](https://docs.google.com/spreadsheets/d/1OQyM63x91aZ6n4oEUagyx7gJNELyb6ThvGhwPv0GyfE/edit) returned 21 submission timestamps total; the four September entries are September 14, 15, 17 and 19. No September 2 or 13 row exists in the read range A2:A1022. This confirms the dated sheet mismatch, not five lost customers. Reconcile conversion-action definition, duplicate/test events, form storage, client email receipts and sheet destination. Name, email, message and phone columns were not read.
3. **Reporting quality before automated optimization.** [Rocco's September 20 report](https://momentum3d.slack.com/archives/C0B3T401W77/p1789910287661309) presents $72.82 spend, 1,061 impressions, two leads, average CPA $11.14 and average CPM $61.52. Account-level ratios from the displayed totals are $36.41 per lead and $68.63 CPM. Those can differ from unweighted row averages; the report does not establish a common definition/window. Its recommendations also cite different CPC/CPM values and seven-day comparisons. Label metrics by entity, objective, window, attribution and aggregation before acting. Tri State reports recommending reallocations from lead ads toward low-cost traffic ads require particular scrutiny: cheap clicks do not establish qualified leads.
4. **Omega: avoid duplicate changes and connect leads to outcomes.** The current browser report marks “araco concrete” and “preferred concrete colorado springs” Excluded. Across the historical 200-row pilot, 20 rows already have EXCLUDED status. Keep them out of a new negative batch. The exact “araco concrete colorado springs” variant is a review candidate with historical $7.96 and status NONE; recheck its current status and approved competitor strategy before using the staged exact-match negative. CRM/appointment outcomes and the site-versus-instant-form choice remain the more important measurement question.
5. **Nexla: accepted demo receipt before bid expansion.** The September 18 Slack update says optimization is complete. The local September 20 Google-access closeout reports GTM version 61 published, superseding the old version-60/unpublished blocker; this audit did not independently reopen GTM. Require one accepted demo tied to CRM and measurement. Do not infer success from published configuration, or failure from zero Ads conversions alone. Generic MCP research can be relevant.
6. **Approval state and client identity.** Pritzker's [September 17 exchange](https://momentum3d.slack.com/archives/C0BQV7N570T/p1789664752317729) shows first-three approval discussed but not marked in Notion. September 18 includes specific copy edits and positive relationship updates, so the old “stalled relationship” narrative is stale. Tags 2 Go and Shadow have archived Slack channels while the registry still says active; archive alone is not cancellation. Advanced Longevity and Look Alive need distinct proposed routes; GT Clinic and Puttery must not inherit their identities or access.
7. **Reuse the system already built.** The existing September 12 dedicated-agent package has lead match-back logic, contracts and an internal FAQ assistant. The September 15 Momentum Answers thread contains a source-linked Monday-update answer and a reviewed draft reply; it is not merely an unverified installation. A delayed availability claim was explicitly corrected in the thread. Reuse that package; no second Slack bot or scheduler was created.

## Measured Jev experiment
The same 200 real historical rows were classified by both models: 100 Omega and 100 Nexla, sorted by cost. Source window August 16–September 14, pulled September 15. Nexla's source is capped at 500 rows, so this is not complete search-term coverage or a random accuracy sample. Only scrubbed search text and minimal business context went to the models; no raw Slack history or customer records.

| Measure | Jev | Luna |
| --- | ---: | ---: |
| Valid final labels | 200/200 | 200/200 |
| Median latency | 248 ms | 780 ms |
| Sum of request times | 53.726 s | 177.236 s |
| Gateway-reported billed cost | $0.000000 | $0.0079304 |

Median ratio: **3.15×**, not 30× in this experiment. Label agreement: **156/200 (78%)**; 44 disagreements. Agreement is not accuracy, and Jev's selected-label probability is not calibrated correctness. No independent human-labeled gold set was supplied.

The initial Luna control used too small an output allowance: 94 of 129 attempted labels were incomplete. It was stopped, preserved, and rerun at 512 output tokens with reasoning disabled. Final comparisons exclude that flawed configuration; total trial cost includes its $0.0067202. **Total recorded billed cost: $0.0146506.** Jev reporting zero for this run does not establish permanent free pricing.

The review file has **20 already-excluded rows, 65 retain candidates and 115 review-required rows**, with apply=false throughout. Twenty excluded rows are part of the 200, not additional rows. A 0.90 review threshold is an uncalibrated operational choice, not a claim of 90% accuracy. Known brand terms such as “nexla” should be retained using a deterministic brand rule even when Jev's confidence is low.

### Concrete review examples
| Term | Evidence and disposition |
| --- | --- |
| araco concrete colorado springs | Omega: historical $7.96; NONE; both models competitor. Stage exact negative [araco concrete colorado springs] only after fresh status and competitor-policy review. |
| preferred concrete colorado springs | Already EXCLUDED; Jev buyer / Luna competitor. No duplicate action. |
| gazebo builders near me | Historical $15.26; both models review. Confirm service coverage, then decide. |
| create ai agent for free | Nexla: Jev irrelevant / Luna buyer. Enterprise fit and offer need review; no blanket “free” negative. |
| nexla inc | Jev review / Luna buyer. Own-brand query should be retained by known-brand rule. |
| model context protocol / mcp server | Relevant product research may lead to enterprise demand; intent alone is insufficient for exclusion. |

## Portfolio action coverage
This reconciles all **28 canonical registry routes**, including two explicit non-Momentum exclusions (Align and BigOrange), plus seven proposed routes/opportunities found in current Slack. Suggested owners are accountability recommendations, not notifications or assignments. “Reported” means Slack testimony; “live” is reserved for the direct account/sheet reads above. A row is a review packet, not a claim that its underlying client work has been delivered.

| Client / route | Priority | Current evidence state | Next concrete action |
| --- | --- | --- | --- |
| Momentum 360 / Digital | P1 | Partial attribution / operational proof | Reconcile source event → CRM record → owner → next action; reuse existing lead-agent match-back work |
| Kimberly James Bridal | P1 | Google paused; Meta test reported | Match five reported Sep 8–14 Meta leads to contacts, booked appointments and sales outcomes; resolve address/hours schema |
| BOK Law Firm | P2 | No current Slack evidence | Reuse existing September blog drafts and standing BOK workflow; verify current editorial approval and actual sent/published receipt |
| Fagan Painting | P1 | Form replacement reported; live QA challenged | Verify replaced estimates form after cache correction; read-only browser hit SiteGround challenge |
| Pro Fence & Deck | P1 | Performance concern; improvement reported | Measure current mobile speed and inquiry path before further animation work |
| Replenish / 7-Eleven | P1 | Shared account; reported ended campaigns | Resolve current client plan and campaign expiration; inspect only Replenish campaigns in 6275014654 |
| Fresh Blends / Kwik Trip | P2 | Pause until October reported | Keep Fresh campaign partition separate; prepare October readiness without restarting |
| NKCDC | P2 | Paused phase | Retain hold; confirm next paid phase before creating new deliverables |
| Zen Spa / Tropicana | HOLD | Inactive registry | Keep inactive and separate from other wellness clients |
| Hope Wellness Center | P1 | Site/video completion reported; acceptance unverified | Reconcile Sep 4 completed-video note and Sep 14 missing-material recap; collect exact delivered files and client acceptance |
| Omega Landscaping | P1 | Google serving; lead outcomes incomplete | Use 100-row review, skip 20 already-excluded rows across trial; verify unexcluded exact competitor candidates and CRM outcomes |
| Shadow Heating & Cooling | HOLD | Channel archived; paid-media off record | Reconcile active registry flag with archive/off state before any reactivation |
| VA Claims Edge | P1 | Walkthrough rescheduling; acceptance pending | Prepare acceptance walkthrough and verify recording, email delivery/DNS evidence; requested next Friday is Sep 25 |
| Bercos Popcorn | P2 | Follow-up reported; phase status unclear | Reconcile latest direct-client phase approval before resuming Phase 2 |
| AMI Cleaning | HOLD | Inactive registry | Preserve inactive state |
| Cindy May / Mrs. Christmas | P2 | Registry route; no recent Slack match | Recover latest direct-client checkpoint before seasonal production |
| Bar Crawl USA | P1 | September commercial approval unresolved | Reuse existing 10-new-page and 15-optimization proposals; reconcile which package is approved before more production |
| Bridge Software | P2 | Milestones reported complete; acceptance check needed | Verify latest working backend/demo against already completed milestones |
| Onsite Concrete & Landscape | P0 | LIVE mismatch: PMax enabled after pause request | Review pause of PMax 22454241769 in customer 1033715894; both Search campaigns already paused |
| Revive Systems / Fitness | P2 | Reactivation and business content requested | Match former-member reactivation brief to approved audience and business-led content; verify LSA migration state |
| BigOrange Marketing | SEPARATE | Separate client/employer relationship | Preserve separate project/access and ownership; do not enroll in Momentum by inference |
| Pritzker Law Group | P1 | Relationship improving; approval-state mismatch | Reconcile first-three verbal approval with Notion; apply Sep 18 wording edits and calendar coordination |
| Tags 2 Go | HOLD | Archived channel but active registry flag | Resolve lifecycle status and historical Ads restriction before any paid-media work |
| Nexla | P1 | Search optimization reported; accepted conversion proof missing | Reuse updated GTM version-61 note, verify one accepted demo reaches CRM and Ads before bid expansion; retain plausible MCP intent |
| Puttery NYC | P1 | Deposit/access incomplete in latest discussion | Reconcile deposit and allowed account access; keep Look Alive as separate brand |
| Deborah Mara | P1 | Staging SEO fixes reported; inquiry delivery incomplete | Reuse noindex/title/H1 fixes; complete inquiry form and SMTP plan, brokerage/IDX requirements and exact analytics mapping |
| GT Clinic | P1 | Onboarding underway | Map WordPress, GA4/GSC and booking ownership; validate consultation→Boulevard route and clinical copy approval |
| Advanced Longevity Medicine | P1 | New channel; missing canonical registry route | Prepare separate onboarding record, first-payment evidence and Monday/Tuesday huddle brief |
| Capsule & Tonic | P0 | LIVE sheet mismatch corroborates Slack concern | Match Sep 2 and Sep 13 reported form conversions against Ads action definition, form storage, email and sheet; four later entries exist |
| Everyday Life Insurance | P2 | Traffic interpretation and backlink proposal | Separate affiliate pause from channel loss; verify sitemap errors and traffic-quality hypotheses before backlink purchase |
| Look Alive | P1 | Separate accessible account; mixed in Puttery discussion | Create proposed exact route for Ads 8637149345 and Tock/Toast/CMS ownership; do not inherit Puttery blockers |
| Green Slate Masonry | P2 | Prospect/client status unverified | Resolve signed/paid status before enrolling client workflows |
| Comcast partnership | P2 | Proposal / expected PO, not confirmed revenue | Package tiers around accepted deliverables, owner capacity and measured unit cost; reconcile final scope/PO |
| Tri State Window & Siding | P1 | Rocco reports; ownership needs reconciliation | Separate lead and traffic campaign objectives; do not shift to cheap clicks on an automated suggestion alone |
| Align HCM | SEPARATE | Explicit separate portal/client | Exclude from Momentum scope and keep portal 242825734 isolated |

## Seven workflow lanes
| Lane from the post | State here | Required input and acceptance before client use |
| --- | --- | --- |
| Search-term sorting | Live bounded trial completed | Fresh campaign-partitioned report, approved business rubric, duplicate exclusion check and reviewed change list. |
| Ad tagging | Rubric-ready; not benchmarked | Approved creative/copy snapshot; evaluate objective, offer and format tags against labeled examples. |
| Longevity patterns | Not benchmarked | Creative history plus spend/outcomes; age alone is not proof of success. |
| Brief scoring | Ready for local review packets; not benchmarked | Exact brief, agreed deliverables, assets, audience, approver and due date; identify missing fields without fabricating them. |
| Creative fatigue | Not benchmarked | Comparable entity/objective/windows and adequate observations; normalize CPM/CPC/CPA definitions first. |
| Ad/landing-page alignment | Not benchmarked | Current ad and actual rendered destination; compare offer, service area, CTA and claims; human review for regulated content. |
| Lead scoring | Not activated | Approved non-sensitive business-fit rubric and validated CRM outcomes; no automated medical, legal or insurance eligibility decisions. |

No evidence supports calling all seven lanes production-ready. Existing workflows remain the execution layer. WORKFLOW.md documents the proposed handoff and release gates.

## Scope and access receipts
- **371 known channels screened:** September 12's previously enumerated 368-channel directory plus three new current membership channels. Current membership inventory returned 46. Sixty-eight channel histories were paginated until the connector said no more messages for the requested window; 303 other archived channels were searched in 16 OR-channel batches, including bots, with no indexed matches after August 20.
- History requests began August 21 00:00 UTC; archive search uses after:2026-08-20. The 68 histories contain **4,410 timestamp occurrences**, not a deduplicated unique-message count. Selected high-value threads and targeted searches supplement them.
- This is not an all-time archive or every thread/attachment read. The older full directory was reused; newly created unjoined channels after September 12 and inaccessible private channels may be absent. Deleted messages, DMs/group DMs and attachment bodies are outside this audit.
- Google Ads browser access worked for Omega and Onsite. API routes were tried: YAML refresh invalid_grant, ADC refresh expired/revoked, active gcloud token lacked Ads scope. Windsor requested reauthentication. None of these failures means all Google access is missing; the Sheets connector worked.
- Omega's CSV download was blocked by Chrome. The full model trial used the existing dated exports, while current browser reads were used only for the explicitly stated live checks. No security setting was weakened.
- Fagan's live estimates-page visit reached a SiteGround security challenge. The reported cache/form correction is not yet independently proven; no CAPTCHA was solved or form submitted.
- No claimed revenue recovery, ROI, qualified-lead count or production time saving. No communications sent, ads modified, tags published, billing changed or background automation installed.

## Files and reproducibility
- portfolio-actions.json / portfolio-actions.csv: 35 review packets with source, owner recommendation and acceptance evidence.
- search-term-review.csv: every input, both labels, confidence, source hash and conservative disposition.
- evidence/benchmark-summary.json and benchmark-results.jsonl: measured final receipts.
- evidence/benchmark-initial-token-limit.jsonl: preserved flawed control attempts, included in total cost.
- evidence/slack-coverage.json: every channel and coverage mode.
- evidence/onsite-live-readback.json and capsule-sheet-readback.json: current readback records.
- benchmark.mjs: uses the existing installed AI SDK; default dry run. --live performs billable model calls.
- summarize.py and validate.py: local report generation and checks.

Next external decision: review the exact Onsite PMax pause and the business definition/destination of Capsule form conversions. Other client packets can proceed through their existing owner workflows.
## Onsite change-history follow-up
Direct live readback on September 20: the September 13–19 Google Ads change-history view contains one row, September 16 at 09:27:12 account Pacific time, labeled Web client (manual), for Leads-Performance Max-1. Expanded detail says **Status changed from paused to active**. This is 12:27:12 Eastern, two minutes ten seconds after the 12:25:02 Eastern Slack pause recap. Google attributes it to the signed-in account; the audit cannot establish which person or automation drove that browser session or whether the change was intentional. This is a decision conflict requiring resolution, not evidence of misconduct. No later change appears in that displayed date window; September 20 is outside the selected window.
