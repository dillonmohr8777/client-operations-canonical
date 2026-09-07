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

## After Friday — the full flush

| # | Artifact | Job |
|---|---|---|
| 09 | ICP qualifier | Five-axis scorer. Zero in relationship, access, or adoption blocks a build. |
| 10 | AEO ebook chapters 2–5 | Buyer questions, schema, crawlers, monthly measurement. |
| 11 | AI Design ebook | How a spec build works in five days. |
| 12 | AI Marketing ebook | Motion system, rights ledger, logo rule. |
| 13 | AI Automation ebook | Lead-ops acceptance cases as an interactive demo. |
| 14 | Four public lane pages | needmomentum.com copy and layout, not published from here. |
| 15 | ChatGPT Ads page | Mac, August 5. Separate line. $500/month already sold once. |
| 16 | Homepage add-on sections | AI Marketing, Industries, Experience. Mac, August 6. |
| 17 | Print one-pagers | Division plus four flagships. Letter. Already drafted in the Sep 5 kit. |
| 18 | Deck addendum restyle | Eight slides already built. Restyle only if D11 is still open. |
| 19 | Video library | Map existing Higgsfield clips to funnel stage. Overlay lockup locally. |
| 20 | Social kit | Title cards + 9:16 cuts + caption sheet. Do not schedule. |
| 21 | Jesse sell sheet | One page: Snapshot → discovery → one flagship. Split still PROPOSED. |
| 22 | Operator runbook | Exception queue, support hours, rollback. Internal. |

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

## Prompt 08 — AEO ebook chapter 1

```
Design chapter 1 of an interactive ebook titled
"Get found by AI: a field guide for Philadelphia service businesses."

Not a PDF wall. A designed chapter with:
- Cover
- 6 short sections
- One interactive: paste a buyer question, see how an answer engine would need the page structured (entity, FAQ, visible answer, source page). Use invented-looking placeholders only as labeled examples, never as Momentum results.
- End with a Snapshot CTA

Facts only:
- AI Overviews and answer engines read sources. If crawlers cannot fetch the page, the business cannot appear.
- Measurement is observed mention, verified referral, and validated outcomes — three separate numbers.
- No ranking guarantee.

Tone matches POSITIONING.md. Momentum Digital tokens. Chapter 1 only.
```

## Prompt 09 — ICP qualifier

```
Build a five-axis qualifier. Axes: relationship approval, repeated problem, evidence, access, adoption owner. Score 0–2 each.
A zero on relationship, access, or adoption shows BLOCKED BUILD.
8–10 = prepare a scoped proposal.
5–7 = paid discovery.
Below 5 = defer.
This is an internal rule, not a sales predictor. No submit button that leaves the page.
```

## Visual anti-references

Do not make: a purple-glow "AI dashboard", a 100-point magic grade, a robot mascot, a new logo, a cyan Momentum 360 film look, a stock skyline, a testimonial carousel, a fake revenue chart, or a public marketing site pretending to be live.
