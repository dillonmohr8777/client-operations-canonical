# Daily paid-media review workflow audit

Date: 2026-07-16
Scope: deterministic local workflow only; no provider calls and no canonical queue, control, or correction writes
Privacy: redacted; contains no secrets, direct identifiers, or raw communications

## Verified state

- The daily manifest is current and deterministic for 2026-07-16.
- It contains eight exact lanes: five Google Ads and three Meta Ads.
- Seven lanes are ready for read-only review. Shadow Heating and Cooling on Meta is blocked fail-closed because the exact opaque account reference is missing.
- The generator does not call providers, mutate the canonical queue, or perform external actions.
- The focused test suite passes 124 assertions and preserves the queue hash.

## Evidence contract for every reviewed lane

Each ready lane needs timestamped, redacted, exact-account evidence for:

1. Session and account: authenticated identity, exact account, exact client, platform, and read-only authorization.
2. Delivery and pacing: current campaign state, spend, budget, configured guardrail comparison, and expected-state comparison.
3. Conversion tracking and deduplication: primary and secondary actions, event health, attribution settings, downstream reconciliation, and duplicate-event evidence.
4. Landing-page health: exact destination, response status, mobile usability, form or call path, message match, and tracking continuity.
5. Channel evidence: Google search terms or categories, match behavior, negatives, and campaign-type limits; or Meta creative age, frequency, reach, CTR or result-rate trend, and placement delivery.
6. Change history: exact actor, timestamp, object, and before/after state for material changes.
7. Budget recommendation: current outcome quality, pacing, marginal efficiency, learning state, ceilings, and explicit uncertainty. This is recommendation evidence only.
8. Freshness: observed-at timestamp from the exact platform account and timestamped downstream lead-quality evidence when required.

## Lane-specific evidence additions

| Lane | Required additions |
|---|---|
| KJB Google | Prove the primary account and excluded cancelled duplicate; enabled PMax and budget readback; zero-conversion diagnosis; appointment-event, test-event exclusion, and appointment-page evidence. |
| Replenish Google | Preserve each location and budget separately; current delivery and billing; directions conversion; search themes, audience signals, asset strength, policy state, page/tag health; no Fresh Blends evidence mixed in. |
| Fresh Blends Google | Exact Kwik Trip store campaign names and status for each Ice Box campaign; store-level budget and directions intent; search themes, audience signals, asset/policy state, page/tag health; no Replenish evidence mixed in. |
| Omega Google | Enabled PMax and seven paused Search campaigns separately; qualified disposition for reported conversions; wrong-company or supplier-call evidence; search terms, negatives, PMax themes/signals, page health, and change history. |
| Onsite Google | Active Smart campaign, daily pacing, and monthly cap; conversion-setup completion; connected-call and form quality; form/call/CRM/import deduplication; available search-intent evidence and page/phone-path health. |
| Fagan Meta | All six campaign states with draft and off states preserved; received, owned, contacted, qualified, and closed lead disposition; deduplication; creative age/frequency and placements; landing variant, change history, and follow-up ownership. |
| Shadow Meta | Not reviewable yet. First obtain an exact opaque account reference and verify the account route. Then collect delivery, pacing, qualified/contacted/closed outcomes, creative fatigue, placement quality, page or lead-form health, billing, and change history. |
| KJB Meta | All four campaign states; active traffic and retargeting continuity; Leads carousel remains draft; pixel/form/CRM/appointment continuity; qualified and booked appointment outcomes; creative fatigue, placements, landing completion, billing, and change history. |

## Material-finding representation

A material candidate is allowed only from current exact-account and downstream outcome evidence, at medium, high, or critical severity. It must contain:

`candidateId`, `manifestId`, `reviewKey`, `clientId`, `platform`, `findingClass`, `severity`, `summary`, `observedAt`, `evidenceRefs`, `freshness`, `confidence`, `recommendedActionClass`, `externalMutationRequested`, `approvalGate`, `privacy`, `containsSecrets`, `containsDirectIdentifiers`, `containsRawCommunications`, and `queueMutationAttempted`.

Privacy defaults are redacted with all contains flags false and `queueMutationAttempted` false. Allowed classes are account/session mismatch, unexpected delivery state, material pacing anomaly, tracking/dedup failure, landing-page failure, material channel waste/fatigue, unexplained change, material budget recommendation, and stale/missing readback. Routine variance and historical metrics alone never become candidates.

## Safe post-readback handling

Do not edit `daily-review-2026-07-16.json`: the deterministic generator will treat any filled-in observation as drift. The current project has no schema, path, or writer for the workflow's promised timestamped readback sidecar. Until that recorder exists, preserve browser findings in a bounded redacted worker handoff and let only the Marketing Chief deduplicate and materialize a source-backed candidate. The safe manifest check is:

```powershell
& .\scripts\Get-DailyPaidMediaReview.ps1 -Date 2026-07-16 -Check
```

This validates local eligibility only; it neither records browser evidence nor authorizes a provider or queue mutation.

## Verification

- `tests/Test-DailyPaidMediaReview.ps1`: passed, 124 assertions.
- `scripts/Get-DailyPaidMediaReview.ps1 -Date 2026-07-16 -Check`: current, 8 lanes, 7 ready, 1 blocked.
- Roster, workflow, manifest, seven launch configs, and eight blueprints parsed as valid JSON.
- Canonical queue SHA-256 was unchanged across verification.
