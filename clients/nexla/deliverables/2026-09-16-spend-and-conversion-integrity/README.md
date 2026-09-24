# Nexla — spend and conversion-integrity check

**Status: DRAFT, staged. No account change was made. Read-only.**

| | |
|---|---|
| Client | nexla (canonical registry) |
| Account | Google Ads CID 7917802207, queried DIRECT per ACCOUNT-RULES.md |
| Window | 2026-09-09 to 2026-09-15, 7 completed days |
| Pulled | 2026-09-16 22:46 ET, live API v23 |
| Evidence | `evidence-nexla-verify.json` |
| Trigger | An inbound claim that "Smart Bidding is training on spam." Verified independently. |

## The claim was right about the money and wrong about the mechanism

That distinction matters, because the proposed fix follows from the mechanism.

**Confirmed:** 7 completed days, **$383.89, 91 clicks, 0.0 conversions.**

**Not confirmed:** the campaign that is spending is **not** on Smart Bidding.

```
G_US_S_NB_MCP-Agentic      ENABLED   TARGET_SPEND   $300.76   59 clicks   0.0 conv
...17 other campaigns      PAUSED/REMOVED           $0.00      0 clicks   0.0 conv
```

One campaign is live. Its strategy is **TARGET_SPEND** — Maximize Clicks. Every
campaign using `MAXIMIZE_CONVERSIONS` is **paused with zero spend**.

Maximize Clicks does not learn from conversions at all. It spends the budget on
whatever clicks it can buy. So "Smart Bidding training on spam" is not what is
happening here, and pausing for that reason would be acting on a wrong diagnosis.

**What is actually happening is simpler and arguably worse.** The account is on a
strategy whose explicit objective is volume, not quality, and it is buying 91
clicks a week that convert zero times. There is no learning loop to poison because
there is no learning loop at all.

## The conversion setup cannot support a quality claim

Eleven conversion actions are defined. Four are marked **primary for goal**, and
two of those are not leads:

```
Lead form - Submit              SUBMIT_LEAD_FORM    primary=True
HubSpot-Demo Request            SUBMIT_LEAD_FORM    primary=True
Content Download                GET_DIRECTIONS      primary=True   <-- miscategorised
YouTube follow-on views         YOUTUBE_FOLLOW_ON   primary=True   <-- not a lead
YouTube channel subscriptions   ENGAGEMENT          primary=True   <-- not a lead
```

Two defects:

1. **YouTube follow-on views and channel subscriptions are primary conversion
   goals.** A video view is being counted alongside a demo request. Any bidding
   strategy that optimises to conversions on this account would optimise toward
   video views.
2. **"Content Download" is categorised `GET_DIRECTIONS`.** That is a local-business
   category on a B2B data-integration account. It is almost certainly a
   copy-paste error, and it is marked primary.

Those two defects are latent right now because the live campaign ignores
conversions. They become live damage the moment anything switches to Smart
Bidding — which is presumably what the original diagnosis was reaching for.

## Recommended next steps, in priority order

None of this has been applied. All of it is an advertising change and gated.

1. **Decide whether `G_US_S_NB_MCP-Agentic` should be spending at all.** $383.89
   for 91 clicks and zero conversions over a full week. This is the money question
   and it does not depend on any of the below.
2. **Demote YouTube follow-on views and channel subscriptions from primary.**
   They are not leads. Do this BEFORE any move to conversion-based bidding.
3. **Fix the `GET_DIRECTIONS` category on Content Download**, or demote it.
4. **Then, and only then,** evaluate whether a conversion-based strategy is
   appropriate. Switching first would train on the defects above.
5. Re-check after a full completed week post-change. Do not judge on partial data.

## What remains uncertain

- Zero conversions over 7 days could reflect genuine zero, or broken tracking, or
  conversion lag. Not distinguishable from Ads data alone. Needs a form-submission
  test and a HubSpot cross-check.
- The "captcha-off form" and "spam submissions" in the inbound claim were **not
  verified** in this pass. No spam is visible in the Ads data because no
  conversions of any kind were recorded. That claim needs a separate source.
- The $365.95 figure in the inbound claim does not match. This pull reads $383.89
  for 2026-09-09 to 2026-09-15. Different window or different segmentation.
- Landing pages, search terms and quality score were not pulled in this pass.

## Approval required

Budget, bidding strategy, campaign status and conversion-action settings are all
gated. This check stops at the boundary.
