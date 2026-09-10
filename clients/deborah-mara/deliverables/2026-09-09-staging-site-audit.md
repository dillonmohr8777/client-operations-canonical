# Deborah Mara — staging site audit

Date: 2026-09-09
Site: `https://deborah.azldigital.com/`
Requested by: Beth Kann, 2026-09-09, `#deborah-mara`
Method: live fetch plus in-browser DOM inspection of the rendered page. Every number
below was read off the live page, not estimated.

## Verdict

**The site cannot run a lead campaign in its current state.** It has no form, no
tappable phone number and no email link, so there is no way for a paid click to
become a lead. Everything else on this list is secondary to that.

Three findings are also actively damaging while the site sits live and indexable.

## Blocking — fix before any ad spend

| # | Finding | Evidence | Why it blocks |
|---|---|---|---|
| 1 | **No lead capture of any kind** | `document.forms.length` = 0, total form inputs = 0 | Meta lead campaigns, Google Search and a ChatGPT Ads test all need a destination that converts. Right now every paid click dead-ends. |
| 2 | **Phone is plain text, not a link** | zero `a[href^=tel]` on the page | The primary CTA reads "CALL 917.747.5055" but a mobile visitor cannot tap it. On a realtor site this is the single biggest conversion leak. |
| 3 | **No email link** | zero `a[href^=mailto]` | Same problem, second channel. |
| 4 | **19 of 32 links are dead** | 19 anchors resolve to `#` or empty, out of 32 total | Includes a top-nav item. A visitor clicking the nav gets nothing. |

## Severe — fix this week

| # | Finding | Evidence | Impact |
|---|---|---|---|
| 5 | **Page title is `Home - WordPress Blog`** | `document.title` | This is the WordPress default. It is what Google shows in results and what appears in the browser tab. |
| 6 | **`og:title` is also `Home - WordPress Blog`** | `meta[property=og:title]` | Every Facebook, Instagram and LinkedIn share preview says "WordPress Blog". Directly undermines the Meta campaign before it starts. |
| 7 | **No meta description** | `meta[name=description]` absent | Google writes its own snippet, usually badly. |
| 8 | **The site is open to indexing right now** | `meta[name=robots]` = `index, follow`; `robots.txt` `Disallow:` (nothing); sitemap published at `/sitemap_index.xml` | An unfinished staging site titled "WordPress Blog" is eligible to be indexed today, competing with her real presence. Yoast is installed, so this is a settings fix, not a build. |
| 9 | **No `<h1>` anywhere** | headings start at `H2` | Both an SEO signal loss and a screen-reader failure. The visual headline "Your Real Estate Goals Deserve a Proven Strategy." is marked up as `H2`. |
| 10 | **Placeholder listings are published** | `H3: Featured Listing Address` ×2, `H3: Recently Sold` | Reads as abandoned to any visitor who scrolls. |
| 11 | **Hero imagery is a stock photo of Paris** | `seine-in-paris-in-the-evening-2026-03-19-10-40-30-utc.webp`, used 3× | A Seine-at-dusk photo on a Central New Jersey realtor's site. This is the most visible credibility problem on the page. |
| 12 | **Every image has empty `alt`** | all sampled `<img alt="">` | Accessibility failure and lost image SEO. |

## Moderate

- **449 words on the whole page.** Too thin to rank for anything, and the reason the "publish her awards, credibility, blogs, resource guides" rationale for owning the site is not yet being served.
- **The nav is anchors only** (`#about`, `#buysell`, `#listings`, `#areas`, `#talk`). It is a one-page site presenting itself as multi-page. That is a legitimate choice, but it caps SEO: there are no separate URLs to rank for "sell", "buy", or the individual towns.
- **No town or county pages** despite Monmouth, Ocean and Mercer being the stated service area. Local SEO for a realtor lives on those pages.

## What is genuinely good and should be kept

The credibility material is strong and is already on the page — it just is not working
hard enough:

- **$145M+ closed since 2013**, **13 years with RE/MAX**, **32 transactions in 2025**, **100+ five-star reviews**
- RE/MAX and RealTrends recognition imagery
- A clear buyer/seller split ("SELL WITH DEB" / "BUY WITH DEB") that is the right structure for paid traffic

Those four numbers are the strongest ad copy assets in this account. They belong in
the ad headlines, not only halfway down a homepage.

## Fix order

1. Add a lead form and make the phone and email tappable. Nothing else matters until this is done.
2. Set the title, meta description and `og:title`. Yoast is already installed.
3. Decide indexing: either `noindex` the staging site until launch, or finish 1–2 and launch it properly.
4. Replace the Paris photo with Deb's own listing or local photography.
5. Replace placeholder listings with the `homes.com` feed, or remove the section until the feed lands.
6. Promote the headline to `H1`, add image `alt` text, fix the 19 dead links.
7. Then build town pages and start the content programme.

## Confirmed from this audit

Deb's public contact details, read off her own site: **917.747.5055**,
**marasurrealestate@gmail.com**, RE/MAX Homeland REALTORS, serving Monmouth, Ocean
and Mercer counties. Registry contact updated from this source.

## Not done here

No change was made to the site. Muhammad owns the build; this is a findings list for
him and Beth. Hosting credentials for this account were posted in plaintext in
`#deborah-mara` on 2026-07-30 and were deliberately not used, not copied and not
stored — they should be rotated regardless.
