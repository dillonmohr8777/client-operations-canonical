# Omega Landscaping & Concrete — Google Search research

**Prepared:** 2026-09-04  
**Status:** `research-complete / account-action-pending`  
**Scope:** read-only research. No browser, Google Ads, site, CRM, queue, or budget mutation was attempted.

## Truth basis

- **Verified local evidence:** Customer `285-398-1364`, America/Denver, was observed on 2026-09-04 for 2026-08-28 through 2026-09-03 with 5 impressions, 0 clicks, and $0 spend. Qualified leads, connected calls, booked estimates, and conversion results were unavailable; use **“Conversion reporting is pending validation.”** Several conversion actions were Primary while marked `Needs attention` or `Inactive`. Source: `clients/omega-landscaping/deliverables/2026-09-04-google-ads-health-review/source-data.json`.
- **Unresolved current-state conflict:** the current task describes a $50/day Search campaign, while the local September source identifies the visible enabled `Search_Concrete Services_Call Only` campaign at $20/day; the older $50/day baseline belongs to a July Performance Max observation. The live-inspection owner must reconcile campaign name, type, budget, and date before any recommendation is executed.
- **Account rule:** landscaping and concrete intent remain separately inspectable; a qualified lead is the proposed primary outcome. Raw form submits, calls, and estimate starts are diagnostic events until reconciled.

## Top five diagnoses and actions, ordered by impact

### 1. Find the serving constraint before changing budget, ads, or keywords

**Diagnosis — verified/inference:** Five impressions and no spend show minimal observed delivery, but do not identify the cause. Google lists account or billing issues, dates, inactive or disapproved entities, low bids or restrictive targets, low budget, narrow targeting, low search volume, negative-keyword conflicts, and schedule limits among common causes. A daily budget is an average ceiling, not promised spend.

**Evidence needed:** exact enabled campaign and budget; campaign/ad-group/ad/asset/keyword eligibility and policy states; Diagnostics; bid strategy, targets, caps and status; change history; ad schedule; language/network; Presence-only location setting and radius; keyword statuses and forecast; Search Lost IS (rank/budget), Search impression share, and the budget report.

**Action after readback:** correct only the evidenced blocker. Do not default to raising budget. Google can spend up to 2× an average daily budget on a day and up to 30.4× in a month, but it cannot spend when the campaign is not entering or winning eligible auctions.

Sources: [Fix low-traffic Search campaigns](https://support.google.com/google-ads/answer/9208915?hl=en), [average daily budgets](https://support.google.com/google-ads/answer/6385083?hl=en), [Presence location targeting](https://support.google.com/google-ads/answer/9376662?hl=en).

### 2. Stop bidding toward an ambiguous bundle of lead actions

**Diagnosis — verified:** Current evidence shows form, calls-from-ads, calls-from-website, and GA4 Contact Us actions marked Primary, while Omega Qualified Lead and Omega Won Contract uploads are Primary but Inactive. Primary status alone does not prove an action affects bidding: its standard goal must also be selected by the campaign; a secondary action inside a custom goal can still be used for bidding.

**Evidence needed:** campaign goal membership and custom goals; each action’s source, status, trigger, category, attribution window, value, count setting and recent diagnostics; whether calls represent clicks, connected calls, duration-qualified calls, or imported dispositions; whether the form fires only after a confirmed receipt.

**Action after validation:** use one business outcome for bidding. Keep raw clicks and early-stage events observational unless independently qualified. Google recommends `One` counting for leads and `Every` for sales; troubleshoot `Unverified`, `Tag inactive`, and `Needs attention` actions with Tag Assistant.

Sources: [primary and secondary actions](https://support.google.com/google-ads/answer/11461796?hl=en), [conversion goals and bidding](https://support.google.com/google-ads/answer/10995103?hl=en), [conversion counting](https://support.google.com/google-ads/answer/3438531?hl=en_us_us), [Tag Assistant diagnostics](https://support.google.com/google-ads/answer/10989978?hl=en).

### 3. Make qualified opportunities and won work the outcome feedback loop

**Diagnosis — verified/pending:** The local ledger contract exists, but item-level form, call, estimate, and won-work outcomes are not bound. Creating upload actions did not establish an import loop.

**Evidence needed:** successful form receipts; connected-call records and dispositions; privacy-safe canonical lead and opportunity keys; service intent; estimate and won/lost state; GCLID when available; consent; import timestamps/status; transaction or order ID deduplication; same-window cost.

**Action after implementation approval:** use enhanced conversions for leads through Google Ads Data Manager to import deduplicated `Qualified lead` and, when defensible, `Converted lead` outcomes. Preserve landscaping versus concrete. Keep platform actions, unique leads, qualified opportunities, estimates, and won work separate.

Sources: [enhanced conversions for leads](https://support.google.com/google-ads/answer/15713840?hl=en), [configure enhanced conversions for leads](https://support.google.com/google-ads/answer/11021502?hl=en), [Data Manager](https://support.google.com/google-ads/answer/15707550?hl=en), [measure calls from ads](https://support.google.com/google-ads/answer/6095882?hl=en).

### 4. Choose bidding from signal quality and the live constraint, not folklore thresholds

**Diagnosis — official/current:** Installed guidance uses 15–30, 30, or 50 monthly conversions as decision gates. Google currently says some strategies have campaign-specific historical-data recommendations; it also says Target CPA can start with no conversion history, while recommending at least 30 conversions in the evaluation period for a reliable assessment. A too-low target can suppress traffic. These are not one universal eligibility threshold.

**Evidence needed:** current strategy and target; bid-strategy status; search demand and auction eligibility; lag-adjusted 30-day qualified outcomes; budget constraint; Google’s live recommendation/simulator.

**Action after measurement repair:** select the strategy that matches the real goal. Maximize Clicks is a traffic strategy, not a qualified-lead solution. Maximize Conversions or Target CPA should receive only trusted primary outcomes. Avoid changing goals, bids, and budgets together.

Sources: [Google Ads bidding FAQ](https://support.google.com/google-ads/faq/10286469?hl=en), [Smart Bidding guide](https://support.google.com/google-ads/answer/11095984?hl=en), [changing Smart Bidding goals](https://support.google.com/google-ads/answer/14571185?hl=en_us_us).

### 5. Tighten query and local intent only after real search evidence exists

**Diagnosis — pending:** With $0 spend and five impressions, there is no defensible current waste estimate or negative-keyword list. Generic exclusions could remove scarce qualified demand.

**Evidence needed:** significant search terms and search-term insights over a sufficient window; matched keyword/match type; campaign and service; click/cost; geographic report; connected-call/form disposition; landing-page route. Review supplier, vendor, employment, wrong-company, DIY, out-of-area, and unsupported-service terms separately.

**Action after data accrues:** route concrete and landscaping queries to matching ads/pages, add exact or narrowly scoped negatives only from verified irrelevance, and verify Presence-only targeting. Google notes that some low-volume queries are omitted from the search-terms report, so the report is useful but not a complete query ledger.

Sources: [search-terms report](https://support.google.com/google-ads/answer/2472708?hl=en), [search-terms definition](https://support.google.com/google-ads/answer/2684537?hl=en), [advanced location options](https://support.google.com/google-ads/answer/1722038?hl=en).

## Installed optimizer assessment

- **Native Google tools are the best next tools:** Diagnostics, eligibility/status columns, Tag Assistant, Search impression share, change history, search terms, call reporting, and Data Manager directly address the known blockers.
- **Google Ads Audit / Optmyzr audit:** useful as a structured checklist after current exports or a verified Optmyzr connection exist. Its scoring and wasted-spend estimates cannot establish the cause of near-no delivery or lead quality from the current evidence. Auto-remediation is outside authority.
- **PPC Waste Finder:** not applicable now. Its default `$20 spend + no reported conversion` filter is configurable local workflow logic, not a Google requirement; current observed spend provides no qualifying search-term evidence.
- **Audience Segmentation:** lower priority for this Search diagnosis. It becomes useful after customer and outcome data exist; `Targeting` can restrict reach, while `Observation` can collect segment reporting without narrowing keyword reach.
- **Paid Ads Google Search playbook:** useful for intent structure, negative-keyword discipline, and offline outcomes. Treat its 15–30/30/50 conversion cutoffs and sequencing rules as heuristics, not platform prerequisites.

**Decision:** no optimizer installation is warranted. Restore truthful delivery and outcome evidence with native tools first; then use installed audit tooling to organize the next review. No tool can promise improved qualified conversions from the current sample.
