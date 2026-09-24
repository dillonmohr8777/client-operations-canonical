# Nexla — change list, verified 2026-09-24

**Status: READY TO APPLY. Approved by Dillon ("apply everything", 2026-09-24 11:08).
Blocked only on API authorization. Nothing has been applied yet.**

| | |
|---|---|
| Client | `nexla` (canonical registry) |
| Account | Google Ads CID **791-780-2207** |
| Verified | Google Ads UI, 2026-09-24 10:58–11:15 ET |
| Engine | `%LOCALAPPDATA%\Dillon\GoogleAdsProbe\nexla_engine.py` |
| Prior work | `2026-09-16-spend-and-conversion-integrity`; `nexla_fix.py` + `verify_negs.py` (2026-09-10) |

This replaces the first version of this file (10:58). Verification found five things
that version got wrong. They are listed at the bottom, because the corrections are the
most useful part.

---

## What is actually wrong with the account (verified)

**1. No campaign measures leads.** The *Submit lead form* goal holds 2 primary actions
and is used by **0 of 36 campaigns**. Its status is **Needs attention**. The account
default goals are **Engagement** and **YouTube follow-on views** (28 of 36 campaigns).
*Qualified lead* and *Converted lead* show **Misconfigured**.

**2. Smart Bidding is optimising the brand campaign toward YouTube views.**

| Campaign | Budget | Bid strategy | Cost (7d) | Conv. |
|---|---|---|---|---|
| G_US_S_NB_MCP-Agentic | $40.75/day | Maximize **clicks** | $137.89 | 0 |
| G_US_S_Brand_Exact | $25.00/day | Maximize **conversions** | $70.97 | 0 |

The 09-16 report said every Maximize Conversions campaign was paused. Brand_Exact went
live afterward on Maximize Conversions, with the account-default goals. That means
Google is bidding brand search clicks toward engagement and video views, which search
clicks can't produce.

**3. Zero conversions on 55 clicks, 36 of them brand.** The brand term `nexla` took
$46.51 (38% of search-term spend) at a 26% CTR and recorded nothing. Given point 1,
that's expected: nothing is counting leads.

**4. The MCP thesis was never actually tested.** The Sep 10 and Sep 16 sessions concluded
that thesis terms (`model context protocol` $779.67, `agentic ai` $141.14, `mcp` $154.29)
converting zero times was a *strategy* question. **It isn't one yet.** The campaigns
were never measuring lead-form conversions, so "zero" means "not measured," not "failed."
Don't abandon the MCP positioning on this data.

---

## Changes

### A. Negatives on MCP-Agentic — apply

41 negatives: 24 phrase and 17 exact. They cut the **learner/DIY modifiers**
(`how to build`, `tutorial`, `what is`, `examples`), plus developer-tool configuration
queries and typos. They keep every thesis head term and all buyer language.

**Proven, not asserted.** The engine refuses to run unless its self-test passes. The
self-test applies Google's negative-match rules to real search terms from the account:
- **30 protected queries stay reachable.** Brand, thesis terms (`mcp server`,
  `model context protocol`), buyer terms (`enterprise mcp platform`,
  `mcp platform free trial`), and enterprise data sources (`snowflake mcp`,
  `atlassian mcp`). Nexla sells connectors, so these may be buyers.
- **41 observed waste queries are blocked.**
- **The test itself was tested.** Six known mistakes were planted, and all six were
  caught, including three that were in the first version of this list.

Adds only what isn't already live. It reads the campaign's current negatives first; 22
off-thesis negatives have been live since Sep 10. Google validates every operation
server-side (`validateOnly`) before anything is written. After applying, the engine
reads back and fails if any negative is missing.

**Honest savings:** about **$29/week directly evidenced** (7 observed terms). That's
roughly a quarter of search-term spend. More comes from the long tail of 545 terms, but
I haven't quantified that. The first version claimed $60–70/week; that figure counted
thesis terms that must not be negated.

### B. Point MCP-Agentic at leads — apply

Sets the campaign's biddable goal to **Submit lead form** only. **This is safe because the
campaign bids Maximize clicks**, so the goal changes what's *reported* as a conversion
and doesn't touch bidding. Validated before writing.

### C. Brand_Exact bidding + goal — one decision, held

Its goal and its bid strategy have to change together. Switching the goal on Smart
Bidding resets learning, and pointing it at a lead goal that "Needs attention" may give it
nothing to learn from.

**Recommendation:** move Brand_Exact to **Target impression share (absolute top, ~90%)**.
That's standard brand-defense bidding, it doesn't depend on conversion data at all, and
it fits a 26%-CTR exact-match brand campaign. Then set its goal to leads for reporting.
Not auto-applied: this is a strategy change that wasn't in the list you approved.

### D. Fix lead tracking — needs GTM, next session

This is the root cause, and it lives outside Google Ads. Nexla's registry entry includes
**Google Tag Manager access** (container *Nexla Website*, 4701213587/11055555). Fixing
it means finding why *Submit lead form* shows "Needs attention", and confirming the tag
fires on the demo-request confirmation (HubSpot). GTM **read** comes with the
authorization below. GTM **publish** is separately gated and hasn't been requested.

### E. Hold

- **Don't accept** Google's "Maximize conversions" recommendation for MCP-Agentic until D is fixed.
- **Unlaunched draft** `G_US_S_NB_Enterprise-AI-Data_POC`: launch or merge after D.

---

## What the first version got wrong

1. **Wrong mechanism for conversions.** It said to set YouTube views "secondary." The
   real problem is one level up: no campaign uses the lead goal at all.
2. **Missed that Brand_Exact is on Maximize Conversions**, which is the most serious finding.
3. **Contradicted itself on thesis terms.** Its table marked `mcp server`,
   `model context protocol` and `ai mcp` as terms to cut, and its savings estimate
   counted them. The Sep 10 session had correctly protected them.
4. **Three negatives would have blocked buyers.** `free` (blocks `mcp platform free trial`),
   `marketplace`, and `atlassian mcp`, an enterprise data source Nexla connects to.
5. **Missed existing work.** 1,851 negatives already exist in the account (on paused
   campaigns), and a working engine (`nexla_fix.py`) had already been built and verified live.

## Also noted

- I tried Composio for Ads early on, before reading `ACCOUNT-RULES.md` ("Never revive
  Composio for Ads"). It returned 403 and changed nothing. It won't be used again.
- **The paid-media roster is stale.** It was generated 2026-07-30 and has no Nexla entry.
  Only Nexla's Ads CID is recorded in `clients.json`; the other nine were matched by name.
