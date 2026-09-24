# Nexla — MCP search campaign build

Date: 2026-09-09
Status: **draft, not published.** No campaign, ad group, keyword or asset was created in
account `791-780-2207`.

Assets: `rsa-assets.json`. Validate with `node check-rsa.mjs` before any upload — it fails
on over-limit text, duplicate headlines within an ad group, and thin RSAs. Currently passing:
3 ad groups, 15 headlines and 4 descriptions each, all within limits.

Copy is written from the live landing page `https://nexla.com/lp/mcp-servers/`, read
2026-09-09. Headline "MCP, Built to Scale" and the "one MCP server per application doesn't
scale" problem statement are Nexla's own words, not invented positioning.

## Structure, and why it is deliberately small

**Three ad groups. Not twelve.**

The account buys roughly 18 clicks a day, about 550 a month. Split across twelve tightly
themed ad groups, that is 45 clicks each per month — far below what Google needs to learn
anything per ad group, and RSA asset testing would never reach significance. The instinct to
build a granular SKAG account is exactly wrong at this volume.

Consolidation is what serves the machine learning here:

| Ad group | Intent it captures | Why separate |
|---|---|---|
| **MCP Infrastructure — Scale** | "we have MCP sprawl and it is breaking" | The core pain the landing page leads with |
| **MCP Governance — Security** | "can we let agents touch our data safely" | Different buyer — security, compliance, platform leadership — and different proof points |
| **MCP Studio — Build** | "I want to build an MCP server" | Practitioner intent, earlier in the funnel, needs its own message |

Those three want genuinely different ads. Any finer split starves the data.

## How this feeds Google's machine learning

Smart Bidding and RSA optimisation both need three things. This build supplies all three:

1. **A clean conversion signal.** Handled in the companion doc
   `../2026-09-09-valid-lead-criteria-and-conversion-config.md`. Until the generic
   `form_submit` conversion is replaced by scoped `hubspot-form-success`, every asset test
   in this campaign is being scored against contaminated data. **Publish that first.**
2. **Asset variety.** 15 headlines and 4 descriptions per group, spanning pain, proof,
   capability and compliance angles, plus 4 sitelinks, 8 callouts and 7 structured snippets
   shared across the campaign. Google needs genuinely different assets to test, not fifteen
   rephrasings of one idea.
3. **Room to combine.** Only 3 headlines are pinned per group — position 1 for the two
   controlled brand and pain statements, position 3 for the CTA. Everything else rotates
   freely. Pinning all fifteen produces a static ad and forfeits the optimisation entirely.

## Match types

Phrase and exact only, no broad match, until the account reaches Phase 3 in the bidding
ladder. Broad match delegates targeting to a model that is currently learning from spam
conversions. Broad match plus a poisoned signal is how an account burns a month of budget.

Revisit broad match only after: the scoped conversion is live, offline conversion import is
running, and 30+ valid leads exist in a 30-day window.

## Ad copy notes

- **Compliance is a headline, not a footnote.** SOC 2 Type II, ISO, HIPAA, GDPR and the
  Gartner Cool Vendor badge are the strongest differentiators on the page for an enterprise
  buyer who has to pass a security review. They appear in every ad group.
- **"1,000+ systems, one endpoint"** is the single clearest quantified claim available. It
  carries across all three groups.
- **Framework names** — LangChain, LangGraph, Claude, ChatGPT — earn their place in the
  Studio group. Practitioners search for compatibility.
- **No invented statistics.** The page publishes no customer names and no performance
  numbers, so none appear in the ads. Every claim traces to the live page.

## Landing page

All ads point at `https://nexla.com/lp/mcp-servers/` — Variant A, selected in the 2026-08-25
readiness review because it exposes a form in the hero and again near the page bottom.
Variants B–D defer the only form far down the mobile page.

**Enterprise Data Layer stays out of this campaign.** The supplied pages cover MCP Studio
only. Routing enterprise-data-layer intent to an MCP form is a guaranteed bounce, and the
8/25 review already called it. That theme resumes when a matching page exists.

## Before anything goes live

1. Publish the corrected conversion tracking (GTM workspace 73, 7 staged changes)
2. Prove one accepted form submission end to end with an authorised business test mailbox
3. Confirm the campaign goal set contains exactly one Primary conversion action
4. Run `node check-rsa.mjs`
5. Build in a draft, review the draft against this document, then publish
6. Keep Brand Exact untouched at $25/day, separate from all of the above
