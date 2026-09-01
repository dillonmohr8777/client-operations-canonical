# Daily high-pay job search operating plan

Date: 2026-09-01
Mailbox: `dillonmohr8777@gmail.com`
Portfolio: https://dillon-mohr-primary-portfolio.netlify.app/
Resume: Growth Marketing Leadership, AI Marketing Director title
Resume link used in notes: https://drive.google.com/file/d/1Ct9IwsOE36DsI3Ire_YKw1O5Pr_mzss9/view
Signature: exact AI Marketing Director HTML (Momentum 360, never IMMOHRTAL)
Working copy: `C:\Users\dillo\Documents\Codex\projects\job-search-2026\outreach\daily-50\`

This is the human-readable plan. Live scoring stays in `job-search-2026`. This folder is the reviewable operating contract.

## Honest update

The 1 Sep hunt is not starting from zero.

- Harvested 2,631 remote marketing and design postings, cleaned to 862, ranked a top 600.
- Scanned 11,336 Greenhouse jobs across 176 boards and 317 Ashby US-remote marketing roles.
- Sent 20 notes today from `dillonmohr8777@gmail.com` using the AI Marketing Director signature. One bounce (`work@super.com`). Two auto-replies told us to use the careers site (Pomelo, Built).
- Gmail confirmation receipts prove ATS submissions landed at Addepar, Ethos Life, Maven Clinic (Director Marketing Operations and VP of Member Growth), Lumimeds, ConnectWise, Boulevard, Pendo, Apollo.io, Hypori, Motive, Motivity, Ondo Finance, Avo, Arkestro, Wizard, Viral Nation, and Casechek.
- A later Remotive, Jobicy, Arbeitnow, RemoteOK, Himalayas, and We Work Remotely recrawl with unused-inbox rules found **zero** new unused published apply inboxes. LaunchDarkly `careers@` was the only leftover and was already emailed.

The machine can find hundreds of live roles. It cannot honestly manufacture 50 unused apply inboxes a day.

## How many are really really good

From the current top 600, scored against the growth / demand / SEO / AEO / lifecycle resume:

| Tier | Count | Meaning |
|---|---|---|
| A | 66 | Director, Head, VP, or Senior Director in growth, demand, SEO/AEO, lifecycle, or marketing leadership. These are the ones that actually fit and pay. |
| B | 116 | Senior manager / manager growth, demand, SEO, paid, ops. Apply these after the A list. |
| C | 21 | Weaker title match. Keep only if the posting is unusually strong. |
| Skip | 397 | Design-only, engineering, junior, intern, contract, or non-US onsite. |

There are not thousands of A-tier fits in the current harvest. There are **66**. That is the truthful number.

Highest-pay live A-tier examples: Later VP Growth $276k-$318k, Calendly Senior Director Growth $231k-$316k, Drata Senior Director Demand $180k-$276k, Addepar Head of Demand $189k-$236k, Cruva Head of Growth $180k-$220k, Oscilar Brand Marketing Director $188k-$250k, Hatch Growth Marketing Director $192k-$300k, Tremendous VP Marketing $300k-$400k, Bettercloud VP Marketing $300k, Amplitude Head of Product Marketing $285k-$476k.

Most of those are apply-first ATS forms, not email.

## Daily operating system

Target: **50 outbound actions a day**, not 50 junk emails.

1. Morning harvest
   - Re-run Greenhouse, Ashby, Lever, Remotive, Jobicy, Arbeitnow, We Work Remotely, RemoteOK, Himalayas, and the AEO job board.
   - Score with local Qwen (`qwen3.5:9b`, escalate hard calls to `qwen3.5:27b-q4_K_M`). Do not use `llama3.2:3b` for fit.
   - Refresh `scorecard.json` and `A-TIER.md`.

2. Inbox pass
   - Keep only published apply inboxes: `careers@`, `jobs@`, `recruiting@`, `talent@`, `hiring@`.
   - Reject accommodations, accessibility, privacy, authenticity, `noreply`, `talent-ops`, and `ta-operations`.
   - Cloudflare `hr@` is accommodations. Power Digital `recruiting@` on We Work Remotely is an authenticity warning.
   - Zapier `recruiting@` from a generic careers-page scrape is not a specific live role. Do not send it.
   - MX-check. Skip any address already in Sent.
   - Never guess `first.last@`.
   - Never email Organix, Big Orange / BOM, Align HCM, or Momentum 360.

3. Send window
   - From `dillonmohr8777@gmail.com` only.
   - Use the exact AI Marketing Director signature.
   - Link the growth leadership resume by default. Use the SEO / AEO variant only for search roles. Use the web variant only for website and digital experience roles.
   - Link the primary portfolio Work section in every note.
   - Cap at 50 sends a day. If unused apply inboxes are under 50, send every unused valid one, then switch the remainder of the day to ATS applications.

4. ATS window
   - Easy Greenhouse first. Ashby is currently flagging headless submits as spam (Cruva, Gray Swan, Bettercloud). Pause bulk Ashby until those can be finished in a normal browser.
   - Remaining high-pay A-tier still worth finishing: Later VP Growth, Calendly Senior Director Growth, Spring Health Senior Director Growth, Asana Head of SEO and AEO, Houzz Director SEO and AEO, OpenRouter Director Growth, Hatch Growth Marketing Director, Oscilar Brand Marketing Director, Tapcart Demand Gen Director, Amplitude Head of Product Marketing, Highwire SVP Integrated Marketing, Ping Identity VP Product and Solution Marketing.
   - Skip Drata if the form still requires Tue/Wed/Thu commute to the 2nd Street office. That is not a remote-first fit.
   - Stop at MFA, account creation, CAPTCHA, or Workday sign-in.

5. Evening digest
   - Update `APPLICATION_LOG.md` and the daily send log from Gmail receipts, not from Playwright guesses.
   - One short status: sent, applied, remaining A-tier, one blocker.

## Indeed

The official path already exists in `dillon-os`:

```
node _os/automation/bin/indeed-fetch.js --what "director growth marketing" --where "United States" --dry-run
```

Live check on 2026-09-01: no `INDEED_ACCESS_TOKEN`, no `INDEED_CLIENT_ID`, no `INDEED_CLIENT_SECRET`. The dry-run query is ready. A live fetch will fail closed.

Indeed HTML scraping is not allowed.

To bring Indeed into the full fold: approve an Indeed Partner app, store the client id and secret in Access Broker / Bitwarden, and leave raw values out of the repo. After that, the existing qualifier can ingest Indeed the same way it already ingests Greenhouse and Ashby.

Until that entitlement exists, Indeed remains a discovery hint only. It is not a second scraper.

## Local models

Hermes could not be used as a Codex stand-in. Its live session is on a Grok billing wall.

Installed Ollama models that matter for this work:

| Model | Use |
|---|---|
| `qwen3.5:9b` | Daily scoring and first-pass note drafts. This is the local-ai-worker quality route. |
| `qwen3.5:27b-q4_K_M` | Harder fit calls and tighter note rewrites. |
| `qwen3-coder:30b` / `qwen2.5-coder:7b` | Hunt scripts and ATS helpers. |
| `deepseek-r1:8b` | Second-pass review when Qwen is unsure. |
| `llama3.2:3b` | Fast route only. Too weak to pick target titles. Do not trust it for fit. |
| `gpt-oss:20b`, `gemma4:26b`, `nemotron-3-nano:4b` | Spare capacity if Qwen is busy. |

The Chinese local stack is the Qwen family plus DeepSeek. Use those to sprawl the harvest. Keep Gmail sends and final fit calls on a verified list, not on a 3B model.

## What this run did not do

- Did not send another 50 emails. Unused published apply inboxes for unused companies are exhausted after today's sends and the June through August history.
- Did not scrape Indeed.
- Did not guess personal addresses.
- Did not use the IMMOHRTAL signature.
- Did not blast Zapier, Nextech, Airtable, Iterable, or League leftover addresses. Those fail the published-apply, fit, or location tests.

## One decision

Approve an Indeed Partner app and store the non-secret locator in Access Broker. That is the only way Indeed joins the daily harvest for real.
