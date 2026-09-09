# Daily high-pay job search operating plan

Date: 2026-09-01
Mailbox: `dillonmohr8777@gmail.com`
Portfolio: https://dillon-mohr-primary-portfolio.netlify.app/
Resume (default): Dillon Mohr Growth Marketing Leadership, AI Marketing Director title
Working copy: `C:\Users\dillo\Documents\Codex\projects\job-search-2026\outreach\daily-50\`

This is the human-readable plan. The live scorecard and A-tier table live with the harvest in `job-search-2026`.

## Status

The 1 Sep hunt already ran. Twenty notes went out today from the personal Gmail using the AI Marketing Director signature. ATS applications were submitted where the form confirmed receipt. Email volume stalled because the best roles almost never publish a hiring inbox.

A fresh Remotive and Jobicy recrawl with stricter inbox rules found one unused `careers@` address. It belongs to LaunchDarkly, which was already emailed. Cloudflare `hr@` is accommodations. Power Digital `recruiting@` on We Work Remotely is an authenticity warning.

## Counts that are actually good

From the current top 600:

- **66 A-tier** Director / Head / VP / Senior Director growth, demand, SEO/AEO, lifecycle, or marketing leadership
- **116 B-tier** senior manager and manager roles in the same lanes
- **21 C-tier** weaker title matches
- 397 skipped as design-only, engineering, junior, contract, or non-US onsite

There are not thousands of A-tier fits in the current harvest. There are 66.

Highest-pay live A-tier examples: Later VP Growth $276k-$318k, Calendly Senior Director Growth $231k-$316k, Drata Senior Director Demand $180k-$276k, Addepar Head of Demand $189k-$236k, Cruva Head of Growth $180k-$220k, Oscilar Brand Marketing Director $188k-$250k, Hatch Growth Marketing Director $192k-$300k.

Most of those are apply-first ATS forms, not email.

## Daily cadence

50 outbound actions a day:

1. Local Qwen harvest and score
2. Strict published-inbox pass, no first.last guesses, no accommodations
3. Send unused valid hiring inboxes from `dillonmohr8777@gmail.com` with the exact AI Marketing Director signature, primary portfolio, and growth leadership resume
4. Fill the rest of the 50 with A-tier ATS applications
5. Evening log

Never email Organix, Big Orange / BOM, Align HCM, or Momentum 360.

## Indeed

Official Partner GraphQL pipeline already exists in `dillon-os`. Live check: no access token and no client credentials. HTML scraping stays off.

The one decision: approve an Indeed Partner app and store the locator in Access Broker so Indeed can join the daily harvest.

## Local models

Use `qwen3.5:9b` and `qwen3.5:27b` for scoring and drafts. Use the Qwen coder models for hunt scripts. Do not use `llama3.2:3b` for fit. Hermes is on a Grok billing wall and is not the local-model path.
