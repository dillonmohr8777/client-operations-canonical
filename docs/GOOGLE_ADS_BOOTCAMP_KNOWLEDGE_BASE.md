# Google Ads Bootcamp Knowledge Base

> Distilled from: [Google Ads Bootcamp 2026 – 11-Hour Beginner to Expert Training](https://www.youtube.com/watch?v=M2wvjwu0uAs)
>
> Creator: CORTIVOX
> Video duration: 11:06:13
> Transcript: English auto-generated captions, 19,483 snippets, retrieved 2026-07-30
> Status: course-derived operating framework, requiring live account and current Google documentation verification

This file captures the course's reasoning framework for Google Ads work. It is not a promise of performance, a substitute for current platform documentation, or evidence about any live account. Account-specific claims must come from the authenticated account, the defined reporting source, and the relevant date range.

## 1. Start with the business

Understand the business before planning campaigns:

- geography, languages, currencies, and service area
- audience, demographics, motivations, and buying context
- products or services, price, margin, positioning, and differentiators
- seasonality, holidays, promotions, and discount behavior
- available landing pages and the actual customer journey
- business goal: profit, revenue, sales, leads, calls, appointments, or another defined outcome
- realistic budget, timeline, capacity, and expectations

The course's central rule is to listen, ask questions, and write the answers down. Campaign structure should follow the business, not the other way around.

## 2. Establish unit economics and expectations

Before launching, model the relationship between budget, average CPC, conversion rate, conversion value, margin, and target return.

Useful planning equations:

```text
clicks = budget / average CPC
conversions = clicks * conversion rate
CPA = budget / conversions
revenue = conversions * average order value
profit contribution = revenue * margin - ad spend
ROAS = revenue / ad spend
```

Use conservative assumptions and label them as assumptions. Keyword tools and benchmarks are directional, not guarantees. If economics do not work on paper, test lower-cost demand, improve conversion rate, improve margin, change the offer, or change the goal before increasing spend.

Do not confuse ROAS with profit. A campaign can achieve a positive ROAS and still lose money after product, fulfillment, labor, or overhead costs.

## 3. Research demand and keywords

Start with the website, product, or service. List only terms that describe what the business actually offers, then expand with Keyword Planner, search suggestions, customer language, competitor research, and search-term data.

Prioritize relevance and intent over a large keyword count. Consider:

- service or product terms
- location and “near me” intent where relevant
- problem, feature, benefit, and use-case terms
- brand and competitor terms only when strategically appropriate
- price, purchase, quote, booking, or comparison intent
- terms that describe something the business does not offer, which may become negatives

Review search volume, trends, seasonality, competition, and CPC ranges, but do not treat the displayed CPC as a guaranteed clearing price. Keep a research sheet with the term, intent, fit, location, expected value, source, decision, and notes.

## 4. Use competitor research carefully

Study competitor ads, landing pages, offers, pricing, positioning, language, extensions, and likely search themes. Use this to find gaps and standards, not to copy claims or creative blindly.

Competitor research should answer:

- what demand are they targeting?
- what promise and proof are they using?
- what landing-page experience follows the click?
- where are they stronger or weaker than the client?
- which search themes are relevant but not yet covered?

Verify that any competitor keyword or audience is legal, policy-compliant, relevant, and commercially sensible for the specific account.

## 5. Design campaign and ad-group architecture

Build structure around distinct goals, products, services, locations, audiences, or economics. Separate campaigns when a real control is needed, such as different budgets, locations, languages, schedules, conversion goals, bidding strategies, or reporting requirements.

Avoid splitting every minor variation into its own campaign. Over-segmentation fragments data, complicates management, and can make automated bidding less reliable. Avoid combining materially different intent or economics merely to make the account look simpler.

At the ad-group level, keep a coherent theme so the keyword, ad message, and landing page answer the same user need. Name campaigns and ad groups consistently, and document the intended role of each.

## 6. Choose match types and negative keywords deliberately

The course frames broad, phrase, and exact match as control choices:

- exact: narrowest intent control
- phrase: more reach while retaining a phrase theme
- broad: wider discovery and more reliance on Google signals

The course recommends tighter control for constrained early tests and broader coverage when data, conversion tracking, and budget support it. Current Google matching has evolved: phrase reaches exact and more, broad reaches phrase and exact plus additional signals. Treat the course's rule as a testing hypothesis, not a permanent platform law.

Use search-term reports to add negatives and refine intent. Apply negatives at the narrowest correct level unless a term is clearly irrelevant across the account. Check synonyms, singular or plural forms, language variants, and close-variant behavior because negative matching differs from positive matching.

## 7. Write ads that match intent

Build ads from the user's query, the business's differentiator, and the landing-page promise. Useful message elements include:

- the relevant product, service, or location
- a specific benefit or outcome
- proof, trust, experience, availability, or qualification
- a clear offer when one exists
- a direct call to action
- accurate qualifiers and policy-safe claims

Use multiple distinct headlines and descriptions with a coherent theme. Test meaningful differences in promise, proof, offer, audience, or call to action. Do not make claims the landing page cannot support.

Use assets such as sitelinks, callouts, structured snippets, images, calls, lead forms, or location information when they improve the path to the defined goal. Confirm eligibility, setup, and current platform requirements before relying on an asset.

## 8. Make the landing page carry the promise

The landing page is part of the ad, not a separate afterthought. It should:

- match the query and ad message immediately
- make the value proposition clear above the fold
- show relevant proof and differentiators
- reduce friction on mobile and desktop
- make the next action obvious
- load reliably and preserve tracking
- provide the information needed to make a decision

Prefer dedicated landing pages for materially different products, services, locations, or intent. Review the page during optimization because changes in price, availability, offer, form, speed, or messaging can change campaign performance.

## 9. Define conversion actions correctly

Decide what counts as a real business outcome before choosing bidding. Separate macro conversions from micro conversions:

- macro: purchase, qualified lead, booked appointment, qualified call, or another outcome tied to value
- micro: page view, scroll, add to cart, form start, email click, or other diagnostic action

Use primary actions for the outcomes campaigns should optimize toward and secondary actions for observation unless a deliberate custom goal changes that behavior. Current Google documentation says primary actions feed the Conversions column and bidding for the relevant standard goal; secondary actions are observation-only and appear in All conversions, with custom-goal exceptions.

Audit duplicate, low-quality, accidental, or account-default actions. Confirm counting rules, value, attribution, included goals, and campaign-level goal selection before interpreting results.

## 10. Implement and test tracking

Use a deliberate tracking map for every important action:

```text
business outcome -> event/key event -> tag or import -> Google Ads action -> goal role -> value -> report
```

Google Tag Manager, Google Analytics, Google Ads conversion tags, enhanced conversions, call tracking, form tracking, and offline conversion imports can work together, but each adds failure modes. Name tags and triggers clearly. Test in preview or debug mode, then verify the received event and Google Ads status after the expected processing delay.

Do not claim tracking works because a tag exists. Verify the user action, event payload, destination, deduplication, consent behavior, attribution, and final platform receipt.

## 11. Respect consent, privacy, and attribution limits

Consent mode, privacy requirements, enhanced conversions, offline imports, and data-driven attribution affect what can be measured and how credit is assigned. Use the account's actual consent setup, jurisdiction, implementation, and policy requirements.

Attribution is a measurement model, not proof that one campaign caused the entire outcome. Compare first-touch, last-touch, data-driven, assisted, and offline evidence where available. Avoid double counting imported and browser-side conversions.

When the account lacks enough data or the setup is uncertain, say that conversion reporting is pending validation. Do not turn modeled, delayed, or partial data into a definitive business conclusion.

## 12. Select budgets and bidding from data quality

Choose bidding based on the goal, value quality, conversion volume, budget, maturity, and control needs. The course discusses manual CPC, Maximize Clicks, Maximize Conversions, Target CPA, Maximize Conversion Value, and Target ROAS.

Practical sequence:

1. ensure the right conversions and values are being received
2. choose a strategy aligned with the business outcome
3. allow a meaningful learning period
4. avoid making several major changes at once
5. evaluate against the defined goal, not a vanity metric

Current Google guidance notes that Smart Bidding needs a learning period and that frequent budget, target, or goal changes can reset or delay learning. Current labels may differ from older course screenshots, so verify the live interface.

## 13. Optimize with a controlled cadence

Use a repeatable review loop:

- inspect spend, impressions, clicks, CTR, CPC, conversions, CPA, conversion value, and ROAS
- inspect search terms and negative opportunities
- inspect ad and asset performance
- inspect landing-page behavior and tracking health
- compare location, device, schedule, audience, and campaign segments
- identify the largest evidence-backed constraint
- make a small, attributable change
- record the hypothesis, change, date, and expected signal
- wait an appropriate period before judging the result

Avoid changing bids, budgets, goals, ads, keywords, and landing pages simultaneously unless an emergency requires it. For automated bidding, the course favors measured adjustments and warns that abrupt changes can destabilize learning.

## 14. Use Display, Video, remarketing, and audiences with intent

Display and video reach users beyond active search. They require careful audience, placement, creative, frequency, brand-safety, and conversion controls. Remarketing requires lawful consent and a sufficiently useful audience.

Use audience signals and observations to learn, not to assume every segment is equally valuable. Exclude audiences, placements, devices, or inventory only when evidence supports the exclusion and the exclusion will not remove valuable reach.

Evaluate upper-funnel campaigns with the right role in the journey. A video or display campaign may assist later conversion without being the last interaction. Use view-through, assisted, engaged-session, and downstream CRM evidence carefully.

## 15. Treat Shopping and Performance Max as input-driven systems

Shopping depends on product data quality, titles, descriptions, images, price, availability, categorization, feed health, and Merchant Center policy compliance.

Performance Max uses Google AI across inventory, bidding, audiences, creative, and attribution. Give it accurate conversion goals, values, budgets, high-quality assets, audience signals, and feed inputs. It is not a substitute for a broken offer, poor tracking, weak creative, or an unclear goal.

Current Google documentation recommends conversion or conversion-value goals and appropriate Maximize or Target strategies for Performance Max. Verify present requirements and do not generalize a course demonstration to every account.

## 16. Report, experiment, and operate safely

Create an account audit and reporting record that distinguishes:

- verified delivery facts
- verified conversion events
- modeled or delayed data
- CRM or booking outcomes
- course-derived hypotheses
- recommendations awaiting approval

Use experiments when there is enough data and a clear decision to make. Define the control, treatment, success metric, runtime, sample requirement, and stopping rule before launch. Do not change live spend, bidding, conversion goals, tracking, audiences, or ads solely because a course recommends it.

For every client or brand, keep accounts, dates, conversion definitions, currencies, and channels separate. Start read-only, verify the source of truth, and keep publishing, spend, account changes, and external delivery behind the applicable approval gate.

## Course-to-account audit checklist

Use this sequence before touching a live account:

1. identify the exact account, brand, currency, timezone, and date range
2. document business goal, offer, margin, audience, locations, and landing pages
3. audit conversion actions, primary or secondary roles, values, counting, and imports
4. verify tags, consent, calls, forms, offline events, and deduplication
5. inspect campaign structure, match types, search terms, negatives, ads, assets, and pages
6. compare delivery and conversion evidence with CRM or booking outcomes
7. identify one or two highest-impact, evidence-backed changes
8. draft the change and expected result before execution
9. obtain required approval for consequential changes
10. implement, annotate, and verify the result

## Source and freshness notes

The transcript is auto-generated and contains recognition errors. The knowledge base paraphrases the course rather than treating captions as authoritative quotations. Current platform verification used Google Ads Help pages for primary and secondary conversion actions, keyword matching and negative keywords, Performance Max, and bidding. Those pages should be rechecked before using any platform-specific setting or claim.
