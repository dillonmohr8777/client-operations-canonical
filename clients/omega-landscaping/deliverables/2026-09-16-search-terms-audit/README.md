# Omega Landscaping — Google Ads search terms audit

**Status: DRAFT, staged for approval. No account change was made.**
Read-only pull. Nothing in this folder has been applied, sent, or shared.

| | |
|---|---|
| Client | omega-landscaping (canonical registry) |
| Account | Google Ads CID 2853981364, queried DIRECT per ACCOUNT-RULES.md |
| Window | 2026-08-17 to 2026-09-15, 30 completed days, ending yesterday |
| Pulled | 2026-09-16 22:4x ET, live API v23 `search_term_view` |
| Evidence | `evidence-search-terms-raw.json`, 363 rows |
| Author | Claude Opus 5, orchestrator session |

## Headline

30 days of spend bought **two conversions**.

```
spend          $370.85
clicks              43
conversions        2.0
CPC             $8.62
CPA           $185.42
```

**96.0% of spend ($356.13, 41 clicks) produced zero conversions.**

## The lead-quality complaint has a measurable cause

Omega's ads are being served on searches for **named competitors**. Six such
terms took **$70.00, 18.9% of all spend**:

| term | cost | clicks | conv |
|---|---:|---:|---:|
| araco concrete | $23.61 | 3 | 0 |
| preferred concrete colorado springs | $23.34 | 3 | 0 |
| araco concrete colorado springs | $7.96 | 1 | 0 |
| mosaic outdoor living colorado springs | $7.92 | 1 | 0 |
| pikes peak landscaping | $7.17 | 1 | **1** |
| araco concrete colorado springs (Call Only) | $0.00 | 0 | 0 |

**One of Omega's two conversions came from someone searching for a competitor
by name.** That is 50% of the month's conversions. A person looking for Pikes
Peak Landscaping clicked Omega's ad and submitted the form. That lead is
recorded as a conversion and is almost certainly not an Omega prospect.

This is the mechanism behind the lead-quality complaint. It is not a volume
problem and not a form problem. Omega is paying to intercept other companies'
customers, and the conversion counter cannot tell the difference.

## The next leak is already visible and costs nothing yet

329 terms drew impressions without a single click. They cost $0, but they show
what Google currently believes Omega is. The top ones are **more competitor
brand names**:

```
srm concrete colorado springs          17 impressions
top of the peak landscaping            16
freedom landscapes colorado springs    11
sunflower landscaping colorado springs  9
abc landscaping colorado springs        8
all purpose landscaping colorado springs 8
```

These become spend the moment one of them gets a click at the current $8 CPC.

## Research and cost-shopper intent

71 terms, **$39.43, 10.6% of spend, zero conversions**. People pricing a job,
not hiring one: `concrete patio costs`, `average driveway concrete cost`,
`retaining wall ideas for sloped backyard`, `building a pavestone retaining
wall`, `how much cost for landscaping`.

## One click cost $44.52

`concrete contractors colorado springs` in **Search_Services_Call Only** took
**$44.52 for a single click** — 12% of the month's entire spend on one click,
at 5.2x the account's average CPC. The campaign produced one click and zero
conversions all month. That single term needs a bid review before anything else.

## Combined addressable waste

**$109.43, 29.5% of 30-day spend**, on terms that are either a competitor's name
or a cost-shopper query. Neither is a plausible Omega customer.

## Recommended next steps, in priority order

Every item below is a recommendation. None has been applied.

1. **Review the $44.52 single click** in Search_Services_Call Only. Highest
   dollar-per-event in the account.
2. **Add the six brand-shaped terms as exact-match negatives.** Expected effect
   is a hypothesis, not a guarantee: recovers up to $70/month and removes one of
   two recorded conversions. Conversion count will go DOWN and lead quality
   should go UP. Set that expectation with the client before applying.
3. **Add the six impression-only competitor names as negatives now**, before
   they take a click.
4. **Add a cost/price/ideas/DIY negative set** for the research bucket.
5. **Re-examine what counts as a conversion.** With 2 conversions in 30 days,
   one of them competitor-sourced, no performance claim to the client is
   currently defensible.

## What remains uncertain

- Competitor identification is by name pattern and needs human confirmation.
  `araco`, `preferred concrete`, `mosaic outdoor living`, `pikes peak`,
  `srm concrete`, `top of the peak`, `freedom landscapes`, `sunflower
  landscaping`, `abc landscaping`, `all purpose landscaping` are read as local
  businesses. Confirm before adding negatives.
- 2 conversions is a very low-volume sample. Directional, not statistical.
- Conversion lag may add late conversions to this window.
- Conversion-action definitions were not audited in this pass. The open
  question of whether a recorded conversion equals a real accepted lead is
  unresolved and tracked separately.
- No call-tracking data. The brief records `phone call lead` as primary on 9 of
  9 campaigns with no call tracking installed, so call outcomes are invisible.

## Approval required before any of this takes effect

Adding negatives is an advertising change and is gated. This audit stops at the
boundary.
