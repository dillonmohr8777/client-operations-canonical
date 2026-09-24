# AI Search Snapshot — the free opener, v1

Give it one URL. It observes what can be observed from outside, tags every
finding **verified / pending / not observed**, and renders a branded report in
the Momentum design system. It never scores, ranks, estimates, or scrapes an
AI engine.

```
python snapshot.py https://example.com/
python render.py runs/example.com
```

Standard library only. One fetch per crawler identity (browser, Googlebot,
GPTBot, PerplexityBot, ClaudeBot), plus robots.txt and the sitemap.

## The honesty rule this version learned on its first run

All three Momentum-adjacent domains (needmomentum.com, faganpainting.com,
momentumvirtualtours.com) sit on SiteGround, which challenges **every**
automated identity from a datacenter address — including the plain-browser
user agent. The first build reported "3 of 3 AI crawlers cannot read the
homepage" as *verified*. That over-claimed: when the browser identity is
challenged too, AI-crawler blocking and IP-level challenge are
indistinguishable. A real GPTBot request from OpenAI's own address range may
or may not be allowlisted; we cannot see that from here.

So the generator now does this:

| Observation | State | Headline |
|---|---|---|
| Browser identity challenged too | **verified** | Host bot challenge intercepts every identity tested, including a plain browser |
| — and therefore | **not observed** | Whether real AI crawlers can read the homepage cannot be determined from this network |
| Browser reads fine, AI identities challenged | **verified** | N of 3 AI crawlers cannot read the homepage while a browser can |
| robots.txt / sitemap behind the challenge | **not observed** | …sits behind the challenge from this network |

The fix it recommends is the right one either way: confirm the host's
bot-protection allowlist and read the server logs for the AI user agents.

## The second vantage point

`capture-vantage.js` — paste into DevTools on any browser session that can
actually see the site. It copies a JSON blob (robots.txt text, sitemap counts,
page fields: title, H1s, canonical, lang, viewport, JSON-LD types, FAQ / phone
/ address signals). Save it as `runs/<host>/browser-vantage.json` and pass
`--browser-vantage`. Page-level and robots findings then come from that
session and say so in the report.

This is also how Jesse runs it on a prospect: open the site, paste, save, run.

## Runs on disk

| Domain | Vantage | Result |
|---|---|---|
| needmomentum.com | datacenter + in-app browser (challenge had cleared) | 2 verified: host challenge (high); **robots.txt names no AI crawler** (medium). Entity typing is correct (Organization + LocalBusiness). Sitemap index readable, 3 children. |
| faganpainting.com | datacenter only | Host challenge only. The in-app browser hit SiteGround's interactive "Robot Challenge Screen", which is not something this session will solve. **Known-answer test pending a second network** — expected: truncated `Disallow: /header`, no AI-crawler policy, Product entity type (Fagan analysis 2026-08-31). |
| momentumvirtualtours.com | datacenter only | Host challenge only. Vantage capture pending. |

## What it checks

1. **robots.txt** — fetchable, malformed lines, sitemap declared, each AI
   crawler allowed / disallowed / unmentioned, bare-word Disallows that look
   truncated (`/header`, not `/sitemap-pt-post-p1-`).
2. **Fetchability by identity** — status and challenge type per user agent.
3. **Homepage** — title, description, canonical, lang, viewport, noindex,
   H1 count, JSON-LD entity types (a service business typed as `Product` is
   the Fagan defect), FAQ signal, phone and address in visible text.
4. **Sitemap** — readable, URL count, index or not.
5. **Pending by design** — Search Console, what the engines actually say
   (human-run, 20 frozen questions, two named engines), analytics.

`python snapshot.py --demo` runs the self-checks (robots parsing, AI-bot
policy, HTML analysis).

## Not in v1

- The 20-question engine baseline. Human-run and recorded; never scraped.
- Crawling beyond the homepage.
- Any score.
