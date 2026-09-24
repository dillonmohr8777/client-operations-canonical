# Deborah Mara — ChatGPT Ads conversion plan

Date: 2026-09-09
Owner: Dillon Mohr
Status: build spec. No account created, no spend committed, no ads submitted.

## Why this channel actually fits her

ChatGPT Ads rewards one specific kind of business: **something people research before they
buy.** Choosing a real estate agent is close to the purest example. Nobody picks an agent on
impulse, and the research now happens in a chat window as often as a search box.

The channel is also still uncrowded in most categories and carries no minimum spend, so a
single-agent budget can compete. That window closes as more advertisers arrive.

## How the platform actually works — and what it changes

ChatGPT Ads opened as a US pilot on 2026-02-09 for Free and Go tier users, then to self-serve
US advertisers on 2026-05-05. When someone sends a prompt, the ads system reads the
conversation context, runs a brand-safety check, and uses a relevance model to pick the best
matching ad.

The three facts that should drive everything we build:

1. **There are no keywords and no demographic targeting.** You target by country and by
   *context hints* — plain-language descriptions of the conversations where your service
   belongs. This is a completely different craft from Google Ads keyword work.
2. **Relevance counts as much as bid.** Outbidding a weak-relevance competitor is not the
   lever. Writing better context hints and a better-matched landing page is.
3. **The landing page must answer, not pitch.** The documented best practice is to send
   clicks to a **research-stage page that answers the underlying question first**. Hard-sell
   pages underperform, and ads that are aggressive, misleading or visually jarring get
   rejected outright. The platform favours information density and helpfulness.

Formats available: the standard **chat card** (headline, description, image, direct URL), a
product feed card, and **sidebar** placements for persistent visibility. Pricing began as CPM,
with **CPC bidding added in May 2026**. Early advertisers report **CPCs around $2.50–$8.00** —
above Google Search but comparable to LinkedIn.

## The strategic point — one asset serves four channels

Deb's staging site currently has **no lead form, no tappable phone, no email link and 449
words** (see `2026-09-09-staging-site-audit.md`). That is a blocker for every paid channel.

The fix ChatGPT Ads demands — **answer-first research pages with a low-friction capture** —
is the same asset that fixes Google Search quality score, gives Meta a credible destination,
and finally gives her owned site something to rank for. That is the reason the site exists at
all: `soldbymara.com` is RE/MAX-owned with no publishing access.

**Build the pages once. Point ChatGPT, Google, Meta and organic at them.** That is the spine
of this plan, and it means the ChatGPT work is not a side experiment — it is what forces the
site fix that everything else has been waiting on.

## Phase 1 — the four answer-first pages

Each page answers a real question completely before mentioning Deb. Target 900–1,400 words,
one `H1`, a genuine answer, then a soft capture.

| Page | The question it answers | Why it earns the click |
|---|---|---|
| **Central NJ market reality** | "Is now a good time to sell in Monmouth / Ocean / Mercer county?" | Highest-intent seller research question there is |
| **What's my home actually worth** | "How do I find out what my house is worth without a Zillow guess?" | Direct valuation intent, the classic seller entry point |
| **Active adult communities in central NJ** | "What are the best 55+ communities in central New Jersey?" | Her demonstrated niche — the Venue at Longview history is real proof |
| **Choosing an agent in NJ** | "How do I pick a real estate agent, and what should I ask?" | Comparison intent, where "best" and "compare" language surfaces ads |

**Capture on every page, in this order of friction:**

1. Tappable phone `tel:917.747.5055` — fixes the audit's biggest conversion leak
2. A two-field form: name + email or phone. Nothing more.
3. A genuine resource offer as the lead magnet — a seller timeline or a 55+ community
   comparison sheet, matched to the page

Her credibility numbers belong above the fold on all four: **$145M+ closed since 2013, 13
years with RE/MAX, 32 transactions in 2025, 100+ five-star reviews.** These are the strongest
assets in the account and they are currently buried on a homepage.

## Phase 2 — context hints

This replaces keyword research. Write the conversations, not the terms. Purchase-intent
language — "best", "buy", "compare", "price" — raises the odds an ad is shown, so favour hints
that describe those conversations.

**Ad group: Selling**
- People asking whether to sell their central New Jersey home now or wait until spring
- Homeowners comparing what their house is worth against an online estimate
- People asking what it costs to sell a house in New Jersey and what commission is typical
- Homeowners in Monmouth, Ocean or Mercer county preparing to list

**Ad group: 55+ / downsizing**
- People comparing active adult and 55+ communities in central New Jersey
- Empty nesters asking whether to downsize and what it involves
- People researching the best age-restricted communities near the Jersey Shore

**Ad group: Choosing an agent**
- People asking how to choose a real estate agent and what questions to ask
- Buyers or sellers comparing agents in central New Jersey
- People asking what a good agent should do for them

**Ad group: Buying**
- People researching the best towns to live in central New Jersey for families
- Buyers comparing Monmouth versus Ocean county
- First-time buyers asking how the New Jersey buying process works

## Phase 3 — chat card creative

Information-dense, helpful, never pushy. The platform rejects hard-sell.

**Selling**
> **Thinking of selling in central NJ?**
> A local RE/MAX agent with $145M+ closed since 2013 breaks down what central New Jersey
> sellers are actually seeing right now — pricing, timing and what to expect.

**55+**
> **Comparing 55+ communities in central NJ?**
> An honest side-by-side of the active adult communities in Monmouth, Ocean and Mercer —
> what each is like to live in, and what homes actually sell for.

**Choosing an agent**
> **How to choose a NJ real estate agent**
> The questions worth asking before you sign anything, from an agent with 13 years and 100+
> five-star reviews. No pitch, just the checklist.

**Buying**
> **Where to live in central New Jersey**
> A town-by-town look at Monmouth, Ocean and Mercer — commutes, schools, what your budget
> actually buys.

Imagery: her own listing photography or genuine local photos. **Not the Paris Seine stock
photo currently on the staging site** — a Paris river shot on a New Jersey realtor's ad is
exactly the "visually jarring or misleading" category that gets rejected.

## Phase 4 — measurement

The channel's weakness is attribution. Handle it deliberately from day one:

- A distinct UTM on every ChatGPT ad: `utm_source=chatgpt&utm_medium=cpc&utm_campaign=<ad group>`
- Dedicated landing paths so ChatGPT traffic is separable even when UTMs are stripped
- GA4 `generate_lead` on every form submit, with the source page recorded
- A required "How did you hear about us?" field on the form — self-report is imperfect but it
  is the only ground truth this channel offers
- Track **cost per genuine conversation**, not cost per click. At $2.50–$8.00 CPC, a plan
  built on click volume will look like a failure; a plan built on qualified seller
  conversations may well not.

## Budget and pacing

Start at **$20–30/day, single country target (US)**, one ad group live for 14 days before
adding a second. With CPCs at $2.50–$8.00 that buys roughly 3–12 clicks a day — enough to
read relevance, not enough to waste money learning the platform.

The documented optimisation order is **improve relevance before raising the bid**. So: fix
context hints and page match first, and only then increase spend.

Do not run all four ad groups at once. Sequence: Selling → 55+ → Choosing an agent → Buying.
Selling first because it is the highest-value transaction and her strongest proof.

## Fair Housing — non-negotiable

US real estate advertising falls under the Fair Housing Act. Copy must never suggest a
preference or steer based on race, colour, religion, sex, familial status, national origin or
disability, and must not describe who a neighbourhood is "right for" in those terms.

ChatGPT Ads' lack of demographic targeting is genuinely helpful here — it removes a whole
class of targeting risk. But **the 55+ / active adult angle needs care**: age-restricted
housing is a lawful exception under the Housing for Older Persons Act, so advertising *actual*
55+ communities is fine. Do not extend that language to non-age-restricted listings, and do
not describe general neighbourhoods by family status. Every ad in the 55+ group must reference
genuinely age-restricted communities.

Deb's broker at RE/MAX Homeland REALTORS should see the ad copy before launch. Brokerage
advertising rules and licence-disclosure requirements apply to paid ads, and this is a
brokerage's liability as much as hers.

## Dependencies before anything launches

1. **Site access.** Nothing here can be built until we can edit the site. Cleanest route:
   Beth or Muhammad adds `dillonmohr8777@gmail.com` as a WordPress administrator. The
   credentials posted in `#deborah-mara` on 2026-07-30 were deliberately not used.
2. **The four pages built and live**, with capture working and tested on mobile.
3. **The staging site's SEO basics fixed** — the title is currently `Home - WordPress Blog`,
   which is also the `og:title`, so every social share preview says "WordPress Blog".
4. **An OpenAI Ads Manager account** created under Deb's or the brokerage's business identity.
5. **Signed six-month quote confirmed**, which was still not present as of 2026-08-28.
6. **Broker sign-off** on ad copy and Fair Housing review.

## Sources

- [ChatGPT Ads in 2026: The Complete Guide for Marketers — Segwise](https://segwise.ai/blog/chatgpt-ads-2026-guide)
- [ChatGPT Advertising Best Practices 2026 — LYFE Marketing](https://www.lyfemarketing.com/blog/chatgpt-advertising-best-practices/)
- [ChatGPT Ads Best Practices Guide & B2B Playbook — Just Global](https://justglobal.com/chatgpt-ads-best-practices-guide-b2b-playbook/)
- [Inside ChatGPT Ads: Formats, Targeting and Costs Explained — Commit Agency](https://commitagency.com/insights/inside-chatgpt-ads-formats-targeting-and-costs-explained/)
- [Optimizing ChatGPT Ads: The 2026 Playbook — Whitebox](https://thewhitebox.io/blog/optimizing-chatgpt-ads-the-2026-playbook)
- [ChatGPT Is an Advertising Platform Now — Entrepreneur](https://www.entrepreneur.com/business-news/tech/chatgpt-just-became-an-advertising-platform-what-that-means-for-your-business)
- [How to advertise on ChatGPT — StackAdapt](https://www.stackadapt.com/resources/blog/how-to-advertise-on-chatgpt)

Platform mechanics above are as reported by these sources in 2026 and should be re-verified
against OpenAI's own advertiser documentation at account setup, since the auction and formats
are still changing.
