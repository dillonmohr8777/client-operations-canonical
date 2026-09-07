# Claude Code handoff — Momentum AI flush

Drop this file into Claude Code. This pack is prompts, facts, and wireframe seeds. Nothing here was built in Claude Design. You will do that.

Internal. Proposed. No send, post, deploy, or account change.

**Model:** Sonnet 5 for almost everything. One Opus 5 pass on Book 01 or the Snapshot. See `MODELS.md`.

**Working folder:** `clients/momentum-360/deliverables/2026-09-07-ai-division-claude-design/`

**Deadline in the room:** Friday 2026-09-11, 11:00–11:30 ET, Dillon Mohr Monthly 1v1 with Mac Frederick.

---

## 1. What you are making

Client-facing conversion system first, Friday object second.

1. Interactive ebook 01 — How AI changed marketing for local businesses (public magnet)
2. Interactive ebook 02 — Get found by AI (Snapshot companion)
3. Readiness diagnostic — six facts, no score
4. Snapshot studio — branded audit walkthrough, no live crawl
5. Books 03–05, lunch-and-learn, leave-behind, only after 1–4 exist

The Command Center in `interactive/index.html` is for Mac on Friday. Do not polish it before the books.

Wireframes already on disk (rebuild these, do not start from a blank vibe):

- `interactive/ebook-ai-marketing.html`
- `interactive/ebook-get-found.html`
- `interactive/diagnostic.html`
- `interactive/index.html`

Export finished artifacts to `interactive/exports/`.

---

## 2. Attach list (and only this)

Every Claude Code turn:

- this file
- `POSITIONING.md`
- `COLLATERAL.md`
- one seed HTML for the artifact you are building

Do not attach the Sep 4 plan, the Sep 5 launch kit, `offers.json`, or the 20-item register unless the current artifact needs a price or a decision card. Those files remain source of truth. Dumping them every turn wastes Claude tokens.

Prior source, if you must open one:

- `../2026-09-05-ai-division-launch-kit/offers.json`
- `../2026-09-05-ai-division-launch-kit/pending-decisions.json`
- `../2026-09-05-ai-division-launch-kit/DIVISION.md`

---

## 3. System lock — pin this

```
You are designing Momentum AI, a division of Momentum Digital in Philadelphia, inside Claude Code / Claude Design.

This session rebuilds local review artifacts. It does not send, post, deploy, or change any account.

Brand lock:
- Parent brand is Momentum Digital. Pages, deck, and pricing live on needmomentum.com.
- Lockup is the existing Momentum Digital wordmark plus the word AI. No new logo. Decision D19.
- Dark-first. Deep #0e1a22. Brand blue #1e73be. Accent field #f58320. Accent text #96490b. Paper #fbfaf7. Surface #eceae4. Ink #14181b.
- Never use cyan, signal yellow, purple, neon, glassmorphism, or generic AI gradients.
- Type: Archivo Black display, Nunito Sans body, Caveat for one script line, IBM Plex Mono for figures.
- WCAG AA. Never white text on orange. Never orange body text on brand blue.
- Motion is small. Honor prefers-reduced-motion.

Voice:
- Warm, direct, measured. Lead with the outcome.
- No guaranteed rankings, citations, leads, or revenue.
- Every price, hour, split, and target is labeled PROPOSED.
- No invented case studies, testimonials, site counts, or metrics.

Product truth:
- Four lanes Mac already put on the site: AEO/GEO, AI Design, AI Marketing, AI Automation.
- One launch flagship and one agent per lane. One free opener: the AI Search Snapshot.
- Thesis: every offer ships with its agent. Hours per client is an acceptance metric.
- Line: Momentum built the machine. Now we build yours.

Interactive ebook means: chaptered, clickable, one control per chapter, one CTA. Not a PDF wall. Not a slide deck.

Rebuild the named seed. Do not invent a second brand.
```

---

## 4. Facts you may use

- Momentum Digital, Philadelphia. Mac Frederick, founder/CEO. Dillon Mohr, AI Marketing Director.
- Mac named the four lanes July 27–August 3, 2026, in #momentumsites.
- Mac asked for a free branded SEO/AI/Marketing audit August 12, 2026.
- Mac drew List → Grader → Outreach → Sale and a 40/40/20 split August 4, 2026. Split is PROPOSED, not agreed.
- Mac told Dillon September 4 to focus on the AI division. Friday talk is Sep 11.
- 241 cold emails Sep 2–3, zero verified human replies. Two August 23 hand-built audits reached quote (GT Clinic, Tuxedo Den). Neither signed.
- Fagan Painting: AEO/GEO add-on proposed $500/mo for 90 days. Crawlers could not fetch. Search Console typed a painting company as a Product. AEO work moved to Phil Sep 4.
- Deborah Mara: one signed $500/mo ChatGPT Ads lane inside a broader package. Not division MRR.
- Puttery NYC reporting build recovered in the $2,500–$3,500 range.
- Economics known answers, $75 labor / 10% sales / $500 fixed: one of each recurring flagship = $1,125 contribution. Double hours = −$75.
- Proposed flagships: AEO $1,500+$750/mo. Spec $3,500. Motion $1,500+$1,250/mo + credits at cost. Lead Ops $3,500+$1,500/mo.
- Higgsfield has a large recent library. Five named films are specified. Logo never touches a model. Do not generate a new batch in this session.

---

## 5. Run order — one prompt per turn

Paste the system lock once. Then send only the block for the current artifact.

### Turn A — Book 01 (Opus 5 once, or Sonnet 5 if you are already tight)

```
Rebuild interactive/ebook-ai-marketing.html into a finished interactive ebook.

Title: How AI changed marketing for local businesses
Subtitle: A Momentum AI field guide for service owners

Chapters: cover, The reader changed, Four places AI shows up, What you can do this week, What you should not DIY, How to read an AI answer, Pick your problem, The Snapshot.

Keep the industry switcher (trades / hospitality / professional services only). Keep myth/fact, checklist, and problem picker. Make it feel like a Momentum piece, not a wireframe. One CTA: Snapshot or 20 minutes. No submit. No score. No invented proof.

Write the finished HTML to interactive/exports/ebook-ai-marketing.html.
```

### Turn B — Book 02 (Sonnet 5)

```
Rebuild interactive/ebook-get-found.html the same way.

Title: Get found by AI
Companion to the Snapshot. Chapters: Fetch, Entity, Questions, Three numbers, The sprint.
Keep the crawler checklist, entity picker, buyer-question architect, and the mention / referral / outcome triad that cannot be added together.
Fagan is a pattern: crawlers blocked, typed as Product. No revenue claim.

Write interactive/exports/ebook-get-found.html.
```

### Turn C — Diagnostic (Sonnet 5)

```
Rebuild interactive/diagnostic.html.
Six factual questions. Yes / not sure / no. Output is one next conversation, never a grade.
Write interactive/exports/diagnostic.html.
```

### Turn D — Snapshot studio (Sonnet 5, Opus 5 only if the book pass was weak)

```
Build the AI Search Snapshot studio as a standalone artifact.

Demo only, three already-run domains: needmomentum.com, momentumvirtualtours.com, faganpainting.com.
Show host challenge vs crawler state as separate facts. Three observations. One next step.
No 100-point score. No live crawl. No engine scrape.

Write interactive/exports/snapshot.html.
```

### Turn E — Books 03–05 (Sonnet 5, one book per turn)

Use the prompts already in `CLAUDE-DESIGN.md` (Prompts 13–15). Same lock. Same export folder.

### Turn F — Lunch-and-learn + leave-behind (Sonnet 5)

Use `CLAUDE-DESIGN.md` Prompt 16.

### Turn G — Friday Command Center (Sonnet 5, last)

```
Rebuild interactive/index.html as the Friday walkthrough for Mac.
Eight views: positioning, four lanes, Mac's machine, Snapshot, economics, decisions, videos, ebook teaser.
Link out to the finished exports, do not restyle the books inside the hub.
Mark INTERNAL / PROPOSED. Known economics answers must still read $1,125 and −$75.
Write interactive/exports/index.html.
```

---

## 6. What not to do

- Do not start a new deck. The 26-slide and the eight-slide addendum exist.
- Do not write a second press release.
- Do not treat 40/40/20 as policy.
- Do not quote site counts.
- Do not schedule social or send email.
- Do not spend Higgsfield credits from this session.
- Do not attach this whole folder on every turn.

When Mac is in the room: open the Command Center, run the Snapshot demo on needmomentum.com, mark D01, D02, D03, D09, D10, D19. The books are what you show when he asks what clients will see.
