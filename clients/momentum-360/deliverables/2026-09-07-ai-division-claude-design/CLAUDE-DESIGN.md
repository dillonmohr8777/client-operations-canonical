# Claude Design — what to build, in order

You are flushing the Momentum AI division in Claude Design. Use this file as the session brief. Attach `POSITIONING.md`. Keep Prompt 00 pinned.

Build local, reversible artifacts only. Do not send, post, deploy, or change an account. Label every price PROPOSED.

## Why Claude Design and not another deck

Mac asked for four things that a slide cannot do:

1. A free branded audit people can type a URL into. August 12, #ai-tech-news.
2. A grader that scores website / SEO-AEO / social. August 4, #ai-tech-news.
3. Interactive proof that the four site lanes are real products, not menu labels. July 27–August 3, #momentumsites.
4. A Friday object he can click, not a PDF he has to imagine.

Claude Design is the right surface because the Snapshot, the grader, the offer explorer, and the decision board are products. The ebook and one-pagers are the leave-behinds.

## Build order for Friday

Do these eight first. Stop when they exist. Everything else is the post-Friday flush.

| # | Artifact | Why it exists | Mac source |
|---|---|---|---|
| 00 | System lock | Stops Claude Design from inventing a new brand | D19, design tokens |
| 01 | Command Center | Friday walkthrough. One URL. Eight views. | Sep 4 Friday ask |
| 02 | Positioning brief | One designed page. Statement, ICP, value map, pitches. | This pack |
| 03 | Snapshot Studio | URL in, branded 3–5 page audit out. The opener that produced quotes. | Aug 12 audit ask |
| 04 | Four-lane studio | Click a lane, see flagship, exclusions, agent, proposed price. | Jul 27 / Aug 3 menu |
| 05 | Mac's Machine | List → Grader → Outreach → Sale, with the proposed 40/40/20 marked PROPOSED. | Aug 4 operating system |
| 06 | Economics lab | Mix the three recurring offers. Show contribution. Double-hours goes negative. | Sep 4/5 economics |
| 07 | Decision board | The 20 open items as cards Mac can mark yes / change / later. | pending-decisions.json |
| 08 | AEO ebook, chapter 1 | Interactive, not a PDF wall. The content engine for lane 01. | Aug 5 goal 1 and 5 |

Seed HTML for 01–08 already lives in `interactive/index.html`. Rebuild it in Claude Design so each surface can stand alone and look finished.

## The conversion flush — interactive ebooks first

The hub is for Mac. The books are for buyers. Full catalog: `COLLATERAL.md`. Seeds already in `interactive/`.

| # | Artifact | Seed | Job |
|---|---|---|---|
| 10 | Book 01 · How AI changed marketing | `interactive/ebook-ai-marketing.html` | Public magnet. Teach the category. End on Snapshot. |
| 11 | Book 02 · Get found by AI | `interactive/ebook-get-found.html` | Snapshot companion. AEO without ranking promises. |
| 12 | Readiness diagnostic | `interactive/diagnostic.html` | Six factual questions. No grade. Points at one lane. |
| 13 | Book 03 · Prototype in a week | — | Spec-build explainer with a scrubbable five-day timeline. |
| 14 | Book 04 · Content that moves | — | Motion, rights ledger, logo rule. Brief builder. |
| 15 | Book 05 · Every lead has a receipt | — | Lead-ops walkthrough. No "more leads" claim. |
| 16 | Lunch-and-learn | — | Six spoken beats. Same story as book 01. |
| 17 | What to ask any agency about AI | — | Eight-question leave-behind. |
| 18 | ChatGPT Ads in plain English | — | Mac, August 5. |
| 19 | Slow-follow-up calculator | — | Their numbers only. |
| 20 | DIY vs division | — | Kills "can't I just subscribe." |
| 21 | Fagan pattern walkthrough | — | Crawlers + Product entity. No revenue claim. |
| 22 | Jesse sell sheet + objection explorer | — | Internal until D11. |

## Prompt 00 — pin this

```
You are designing Momentum AI, a division of Momentum Digital in Philadelphia.

Brand lock:
- Parent brand is Momentum Digital. Pages, deck, and pricing live on needmomentum.com.
- Lockup is the existing Momentum Digital wordmark plus the word AI. No new logo.
- Dark-first. Deep field #0e1a22. Brand blue #1e73be. Accent field #f58320. Accent text #96490b. Paper #fbfaf7. Surface #eceae4. Ink #14181b.
- Never use cyan, signal yellow, purple, neon, glassmorphism, or generic AI gradients.
- Type: Archivo Black for display, Nunito Sans for body, Caveat for one script line only, IBM Plex Mono for figures and receipts.
- Contrast must pass WCAG AA. Never put white text on the orange field. Never put orange body text on brand blue.
- Motion is small and purposeful. Respect prefers-reduced-motion.

Voice:
- Warm, direct, measured. Lead with the outcome.
- No guaranteed rankings, citations, leads, or revenue.
- Every price, hour, split, and target is labeled PROPOSED.
- No invented case studies, testimonials, site counts, or metrics.

Product truth:
- Four lanes Mac already put on the site: AEO/GEO, AI Design, AI Marketing, AI Automation.
- One launch flagship per lane. One roadmap offer per lane. One free opener: the AI Search Snapshot.
- Thesis: every offer ships with its agent. Delivery hours per client is an acceptance metric.
- Line: Momentum built the machine. Now we build yours.

Do not send, post, deploy, or change any account. Design local review artifacts only.
```

## Prompt 01 — Command Center

```
Build a single-page Momentum AI Command Center for an internal Friday 1v1.

Eight views, left rail navigation, deep field, no fake dashboard charts:
1. Positioning
2. Four lanes
3. Mac's machine
4. Snapshot studio
5. Economics
6. Friday decisions
7. Video library
8. AEO ebook

Hero script line: need momentum?
Hero display: Four lanes. One machine.
Subhead: Internal studio for the September 11 conversation. Every price is proposed.

Each view should feel like a finished product surface, not a slide. Keyboard accessible. Works at 375 and 1440. Mark the page INTERNAL / PROPOSED in a persistent top bar.
```

## Prompt 02 — Positioning brief

```
Design a one-page positioning brief as a designed artifact, not a document.

Include:
- Positioning statement
- Target ICP definition (primary, secondary, not-first)
- Five-value map as five numbered blocks
- Three elevator pitches (short, medium, long) behind a segmented control
- Proof we can say Friday, sourced, no invention
- What we do not say

Use the exact copy from the attached POSITIONING.md. Do not rewrite claims. Print-friendly at Letter width with a dark-first screen version.
```

## Prompt 03 — Snapshot Studio (build this next)

```
Build the AI Search Snapshot as an interactive studio.

User pastes a URL. The page does not live-crawl in this artifact. It walks a deterministic demo using three already-run examples: needmomentum.com, momentumvirtualtours.com, and faganpainting.com.

Show:
- Host challenge vs AI-crawler state, never collapsed into one score
- Entity / schema finding
- H1, NAP, FAQ, sitemap, canonical
- Twenty buyer questions as a frozen list, baseline marked human-run
- Three evidenced observations and one suggested next step
- Momentum branded cover, deep field, lockup, date, PROPOSED / DEMO

Never invent a grade out of 100. Never scrape an engine. Never promise a citation.
This is the free opener Mac asked for on August 12. Cap implied production at 15 minutes once the real generator exists.
```

## Prompt 04 — Four-lane studio

```
Build an interactive four-lane explorer.

Lanes, in Mac's order:
01 AEO / GEO — Get found by AI — flagship AI Search Readiness sprint — PROPOSED $1,500 + $750/mo
02 AI Design — Prototype in a week — flagship Spec build — PROPOSED $3,500 fixed
03 AI Marketing — Content that moves — flagship Motion content system — PROPOSED $1,500 + $1,250/mo
04 AI Automation — The attribution spine — flagship Lead Operations agent — PROPOSED $3,500 + $1,500/mo

Each lane shows: line, outcome, included, excluded, agent, hours target, acceptance, honesty clause, roadmap offer.
A segmented control switches lanes. One primary CTA: "Run the Snapshot" — it does not submit anything.
```

## Prompt 05 — Mac's Machine

```
Visualize Mac Frederick's August 4 operating system as an interactive machine.

Four stages, left to right, then stack on mobile:
1. List — database of businesses: name, website, email, social
2. Grader — website / SEO-AEO / social, three honest observations, no fake 100-point score
3. Outreach — email + DM + voicemail only after a Snapshot exists and a relationship owner approves. Cold email is paused. 241 sends, 0 verified human replies.
4. Sale — Jesse schedules, proposal + contract. Dillon diagnoses. Mac owns commercial yes.

Under the machine, show the August 4 revenue split as PROPOSED, not agreed:
40% Dillon (AI, Dev, Backend: List + Grader)
40% Jesse (Selling: Outreach + Sale)
20% Momentum (Brand, Admin, Billing, Legal)

Friday still has to write compensation down. Do not present 40/40/20 as policy.
```

## Prompt 06 — Economics lab

```
Build an interactive economics lab from these assumed numbers only. Do not invent a P&L.

Assumptions: $75 loaded labor/hour, 10% sales allowance, $500 fixed, tools $75 AEO / $100 Motion / $150 Lead Ops, full collection. Not profit.

Recurring flagships:
- AEO $750/mo at 4h
- Motion $1,250/mo at 6h
- Lead Ops $1,500/mo at 6h

Controls: count of clients on each offer, 1x vs 2x hours toggle, optional one Spec build ($3,500 / 24h) in the month.

Known-answer rows you must reproduce:
- One of each recurring: revenue $3,500, hours 16, contribution $1,125
- Same at double hours: revenue $3,500, hours 32, contribution -$75
- Plus one Spec build: +$3,500 once, +24h, +$1,250 once before fixed cost

If the UI disagrees with those rows, the UI is wrong. Show the formula. Label everything PROPOSED.
```

## Prompt 07 — Decision board

```
Build a Friday decision board with 20 cards, D01–D20, from the pending register.

Each card: id, topic, question, proposed answer, owner, what it blocks, state OPEN.
Three actions per card: Yes as proposed / Change / Later. Local state only. No network.

Pin the six Mac must leave the room with:
D01 charter, D02 protected hours, D03 compensation, D09 account nomination, D10 outbound/reporting, D19 name/lockup.

Show a running tally of resolved vs open. Export is a printed Letter sheet, not a send.
```

## Prompt 08 — AEO ebook teaser (in the hub)

Keep a short chapter in the Command Center. The real book is Prompt 11.

## Prompt 10 — Book 01, the public magnet

```
Rebuild this as a finished interactive ebook, not a PDF and not a slide deck.

Title: How AI changed marketing for local businesses
Subtitle: A Momentum AI field guide for service owners
Seed: attach interactive/ebook-ai-marketing.html and COLLATERAL.md

Chapters, in this order:
1. The reader changed
2. Four places AI shows up
3. What you can do this week
4. What you should not DIY
5. How to read an AI answer about your business
6. Pick your problem
7. The Snapshot

Rules:
- One idea per chapter. 400–700 words designed, not a wall.
- One interactive per chapter (myth/fact, four-place map, DIY checklist, problem picker).
- Industry switcher with three skins only: trades, hospitality, professional services.
- CTA is always "run the Snapshot" or "book 20 minutes." The button does not submit.
- No ranking, citation, lead, or revenue promises.
- No 100-point score. No invented case studies.
- Momentum Digital tokens. Dark-first cover, paper chapters are allowed if contrast holds.
- Progress rail. Keyboard next/back. Works at 375 and 1440.
- Mark INTERNAL DRAFT / PROPOSED on this version.

Voice from POSITIONING.md. Philadelphia service businesses. Warm, direct, measured.
```

## Prompt 11 — Book 02, Get found by AI

```
Rebuild interactive/ebook-get-found.html as the Snapshot companion ebook.

Title: Get found by AI
Subtitle: A field guide for Philadelphia service businesses

Chapters:
1. If they cannot fetch you, you do not exist
2. Be the thing you are
3. Answer the questions buyers already ask
4. Measure three numbers, not one
5. What a 90-day readiness sprint actually does

Interactives:
- Crawler allow-list checklist (GPTBot, PerplexityBot, ClaudeBot, Google-Extended)
- Entity type picker (LocalBusiness / ProfessionalService vs Product)
- Buyer-question architect: type a question, see entity, visible answer, FAQ pair, source URL
- Measurement triad: mention / referral / outcome as three separate counters the reader cannot add together

Fagan pattern may be used as a pattern: crawlers blocked, painting company typed as Product. No revenue or ranking claim.

CTA: run the Snapshot on your URL. No live crawl in this artifact.
```

## Prompt 12 — Readiness diagnostic

```
Rebuild interactive/diagnostic.html.

Six factual questions. Each is yes / not sure / no.
1. Can you name the person who answers new leads?
2. Do you know whether GPTBot is allowed in robots.txt?
3. Is the business typed as what it actually is in Search Console?
4. Do you have a CRM or sheet every lead is supposed to land in?
5. Can you point to the last time a lead sat more than a day?
6. Do you have a verified logo and usable photos on hand?

Output is not a score. It is one sentence: run a Snapshot, talk Lead Ops, or gather assets for a spec build.
Zero network. No email capture in this draft.
```

## Prompt 13 — Book 03, Prototype in a week

```
Interactive ebook. Title: Prototype in a week.

Teach what a spec build is: one working homepage, dashboard, or 15-second film in five working days from verified logo, real photos, first-party facts.

Interactive: a five-day timeline the reader can scrub. Day 0 assets in. Day 5 they are looking at the thing. Clock starts when assets arrive, not at signature.

Honesty: a prototype is a prototype. Not a launched site, not a live feed, not a results claim.
CTA: "If you already know the thing you want to see, this is the lane."
```

## Prompt 14 — Book 04, Content that moves

```
Interactive ebook. Title: Content that moves.

Teach the motion system: monthly film + stills, rights ledger, logo never model-drawn, credits at cost.

Interactive: brief builder. Audience, offer, placement (IG / YT Shorts / site). Output a one-paragraph brief the reader can copy. No generate button that calls a model.

Honesty: missing rights is a hold. No founder likeness. No other client's palette.
```

## Prompt 15 — Book 05, Every lead has a receipt

```
Interactive ebook. Title: Every lead has a receipt.

Teach lead-ops: one intake, one destination, dedupe, exception queue, reply draft, thirty named cases.

Interactive: step a labeled example lead through valid intake, duplicate, missing field, exception. Show the receipt each time.

Honesty: this improves handling. It does not promise more leads.
```

## Prompt 16 — Lunch-and-learn + leave-behind

```
Two sibling artifacts, same story as book 01.

A. 20-minute lunch-and-learn. Six beats on one screen. Speaker notes in a toggle. Jesse or Mac can run it. No autoplay video.

B. What to ask any agency about AI. Eight questions on one Letter-friendly page:
1. What will you measure, and what will you not promise?
2. Which crawlers can fetch our site today?
3. Who owns the accounts and the work if this ends?
4. What does the operator do after handoff?
5. Where does a lead go when the system is unsure?
6. Is the logo ever drawn by a model?
7. What is setup vs monthly, in hours not adjectives?
8. Can I see one acceptance test before we start?

Trust piece. Works even if they do not hire Momentum.
```

## Visual anti-references

Do not make: a purple-glow "AI dashboard", a 100-point magic grade, a robot mascot, a new logo, a cyan Momentum 360 film look, a stock skyline, a testimonial carousel, a fake revenue chart, or a public marketing site pretending to be live.
