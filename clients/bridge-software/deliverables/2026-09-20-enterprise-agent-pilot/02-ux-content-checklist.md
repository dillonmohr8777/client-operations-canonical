---
artifact: bridge-ux-content-checklist
client: bridge-software
prepared: 2026-09-20
status: draft-review
scope: homepage, Community News, and Create UX/content only
implementation: not authorized; no source files changed
publish: not authorized; no live site, Netlify, GitHub, Gmail, Slack, or queue mutation
---

# Bridge Software — 3 September UX/content change checklist

This is a local review packet, not an implementation plan with permission to
ship. It translates the written 3 September note into reviewable decisions and
keeps copy that is directly supported by the source separate from exploratory
ideas. The 10:44 ET email arrived before the Meet; no spoken transcript or
dated route acceptance was found, so the email is a written brief, not proof of
what was agreed aloud.

## Source set

Primary source and local reconciliation:

- `gmail://message/1a067ba74b17e89c` — Tori's “Re: Phase 3 Follow-Up!” email, 3 September 2026, with eight homepage / Community News / Create screenshots.
- `C:\Users\dillo\Documents\Codex\projects\client-operations\clients\bridge-software\deliverables\2026-09-03-bridge-x-momentum-meet-extraction\extraction.md` — redacted extraction, especially “Pre-call written source Tori sent at 10:44 ET” and “What is still missing”.
- `C:\Users\dillo\Documents\Codex\projects\client-operations\clients\bridge-software\deliverables\2026-09-03-bridge-x-momentum-meet-extraction\sources.json` — binds `toriWrittenReview` to the Gmail locator.
- `C:\Users\dillo\Documents\Codex\projects\client-operations\clients\bridge-software\deliverables\2026-09-03-milestones-1-3-report\shots\d-home.png`, `d-community.png`, `d-create.png` and the `m-*.png` equivalents — 3 September desktop/mobile route captures.
- `C:\Users\dillo\Documents\Codex\projects\client-operations\clients\bridge-software\deliverables\2026-09-03-tori-fun-report\evidence-index.md` — provenance for the same route captures and the internal-only handling boundary.
- `C:\Users\dillo\Documents\Codex\projects\client-operations\clients\bridge-software\artifacts\2026-07-20-tori-source-package\bridge-landing.html`, `bridge-dashboard-feed.html`, and `bridge-post-designer.html` — original client concept surfaces used as intent context, not new approval.

Implementation comparison (read-only):

- `C:\Users\dillo\repos\bridge-software-frontend\app\page.tsx`
- `C:\Users\dillo\repos\bridge-software-frontend\app\community\page.tsx`
- `C:\Users\dillo\repos\bridge-software-frontend\app\community\community-client.tsx`
- `C:\Users\dillo\repos\bridge-software-frontend\app\create\page.tsx`
- `C:\Users\dillo\repos\bridge-software-frontend\lib\phase3\audiences.ts`
- `C:\Users\dillo\repos\bridge-software-frontend\app\globals.css`
- `C:\Users\dillo\repos\bridge-software-frontend\components\BoostPanel.tsx`
- Historical triage at Git commit `c683884`, `docs/tori-feedback-2026-09-03.md` (the file is not present in the current working tree). It records what that branch changed and what it deliberately did not build; it is not client acceptance.

## Read-only current-state snapshot

| Surface | Evidence observed | Review implication |
|---|---|---|
| Home | The Sept. 3 support paragraph and “Stay connected with the world. Move the industry forward.” remain in `app/page.tsx:26,61`. The three story cards use local editorial images from `app/globals.css:658-662`. | The two copy targets are already present locally. Do not re-implement or publish them from this checklist. Card imagery remains a direction/asset decision, not a source-backed replacement list. |
| Community News | Current branch has `app/community/community-client.tsx:145-149,200` with “Choose your experience”, Visual news, Aligned rows, Classic feed, and a sticky toolbar at `app/globals.css:886-891`. The current `app/community/page.tsx:8` says “See what the cannabis world is up to”, not the exact Sept. 3 proposal. The reviewed component exposes a Market select and layout/favorites controls; a dedicated text-search input was not evidenced in this pass. | Preserve the three-way comparison until Tori selects a default. Treat the headline as an open copy choice, and clarify what “freeze the search bar” refers to before changing controls. |
| Create | `app/create/page.tsx:10-11` keeps `WORLD`. `lib/phase3/audiences.ts:13-25` and `app/create/create-client.tsx:352-360` contain the requested reach choices. `components/BoostPanel.tsx` is a disabled, rate-free preview only. | The WORLD heading and “who do you want to see this?” control are locally represented. Reach authorization is still a product/backend contract, and Boost must not become checkout or a live offer without written scope and approval. |
| Photo treatment | A later branch note in `app/globals.css:903-912` removes filters to preserve natural-color photography. | Do not blindly replay a Sept. 3 “brighten” request or add a purple treatment; get a visual decision against the current natural-color state first. |

## Review checklist

### Home

| ID | Evidence-backed change | Proposed copy / direction | Acceptance criteria | Risk / unresolved | State |
|---|---|---|---|---|---|
| H-01 | Replace the original “Connect cannabis brands…” support paragraph with Tori's own positioning. | **Candidate copy (not locked):** “A space to promote yourself, have others help promote you, advertise your movement, and let people know what you're doing! A space to connect, a space to build, a space to keep in touch.” | Tori confirms the exact wording, punctuation, and whether the “something along those lines” qualifier permits editing. Keep one support paragraph, readable at 1440 px and 390 px, with no new capability claim. | The email is enthusiastic and directional, not a dated acceptance. The current source uses softened `what you are doing.` punctuation; do not silently treat either version as final. | **Local copy present; review only. No implementation / no publish.** |
| H-02 | Replace “Find the signal. Meet the people. Move the cannabis industry forward.” | **Candidate copy:** “Stay connected with the world. Move the industry forward.” | Tori confirms this is the chosen heading. Keep it as one visual-story heading, with one H2 and no stale duplicate phrase in the route. | Low copy risk; still unaccepted. | **Local copy present; review only. No implementation / no publish.** |
| H-03 | Make the three right-side stories more visual and add “sneak peaks” of the feed, search, and profile lower on Home. | No unsupported replacement copy proposed. Keep the evidence-supported labels “Community News”, “Nationwide Explore”, and “Verified identity”; choose imagery only after art direction and source/rights review. | Client selects the art direction and approved local assets; each image has a truthful alt description, keeps the existing route destination, and does not imply live data. Verify desktop/mobile crop and the time-to-primary-CTA. | No filenames, rights, or exact composition were specified. Placeholder swaps would invent a decision and could misrepresent sample content. | **Decision required. No implementation / no publish.** |
| H-04 | Explore a big-business-to-big-business way for operators to coordinate “as a unit”. | No proposed copy. Record as a product question, not a Home tagline. | Written scope owner, user roles, visibility rule, and milestone/change-order location exist before a screen or copy is added. | Tori explicitly says she is unsure what it looks like; this is not a bounded content edit. | **Out of current UX/content scope. No implementation / no publish.** |

### Community News

| ID | Evidence-backed change | Proposed copy / direction | Acceptance criteria | Risk / unresolved | State |
|---|---|---|---|---|---|
| C-01 | Change the headline from “Follow what the industry is doing now.” | **Candidate exact copy:** “Find out what the cannabis WORLD is working on now!” | Tori chooses between this Sept. 3 wording and the current branch wording “See what the cannabis world is up to”. One H1 only; confirm sentence case / capitalization and mobile wrapping before any source edit. | The Sept. 3 text was implemented in `c683884` and later changed in the current branch by a later copy pass. This is a content decision, not an automatic regression. | **Decision required. No implementation / no publish.** |
| C-02 | Brighten the Community News photography and make it eye-catching. | No new image or filter is proposed. Review the existing local editorial set against the later natural-color rule before selecting a treatment. | Tori approves the visual treatment and asset set; images remain local/rights-cleared, subject matter is accurately described, and the feed still passes contrast, reduced-motion, and 390 px checks. | The later branch explicitly removes filters; a second unmeasured brightness pass could undo the current intent. | **Visual review only. No implementation / no publish.** |
| C-03 | Test a Fiverr-style aligned grid, possibly five posts per row, while retaining the straightforward feed. | Keep three review choices: **Visual news**, **Aligned rows**, **Classic feed**. Do not select a production default in the artifact. | Tori records one default choice. Preserve all three routes until then; aligned rows are 5-up desktop, 3/2/1 at the documented breakpoints, keyboard reachable, and readable on mobile. | The 3 September report marks the default as undecided; the current implementation is a comparison surface, not acceptance. | **Comparison exists locally; default decision open. No implementation / no publish.** |
| C-04 | Keep search reachable while scrolling. | No copy change proposed until “search bar” is defined as a free-text search field or the existing market/filter toolbar. | Confirm the intended control, then verify sticky behavior does not cover the header, selected state remains visible, and keyboard/focus order works at desktop and mobile widths. | The reviewed component shows market/layout/favorites controls but no dedicated free-text search input. Do not claim this ask is fully satisfied from `position: sticky` alone. | **Clarification required. No implementation / no publish.** |
| C-05 | Consider a white / lighter Community page. | No theme copy or CSS proposal. | Tori makes an explicit theme choice; if chosen, run contrast, focus, image, reduced-motion, and mobile checks against the current dark/purple design before review. | Her wording is a question (“I wonder!”), not an instruction. A theme flip would be a brand decision. | **Decision required. No implementation / no publish.** |

### Create

| ID | Evidence-backed change | Proposed copy / direction | Acceptance criteria | Risk / unresolved | State |
|---|---|---|---|---|---|
| R-01 | Keep “WORLD” in the Create headline. | Current candidate: “Reach the right audience in the cannabis WORLD”. | Tori confirms the heading and its capitalization; one H1, no unsupported “millions” or live-reach promise, and mobile wrap remains legible. | This is a clear lexical preference, but the route still needs client accept/revise. | **Local copy present; review only. No implementation / no publish.** |
| R-02 | Show why Bridge is different through an explicit “who do you want to see this?” choice. | Existing review labels: **The world · Your state · B2B · Public users · Everyone**. Keep the source-backed labels; do not add audience semantics beyond the current hints without approval. | Product owner confirms the labels and whether “Everyone” can coexist with 21+ / verified-access rules. Server-side authorization, audience persistence, and denial states must be evidenced before calling this production behavior. | The UI control exists locally, but the backend contract and client acceptance are separate gates. | **Local control present; contract/approval open. No implementation / no publish.** |
| R-03 | Consider AI assistance for content creation. | No copy or feature proposal in this checklist. | Written scope, model/provider, privacy boundary, moderation, user-consent, cost, and human-review rules exist before a prototype or provider call. | New capability; no milestone, estimate, or approval is evidenced in the Sept. 3 source. | **Out of current UX/content scope. No implementation / no publish.** |
| R-04 | Consider promotional / boost opportunities, including a front-page boost. | The current `BoostPanel` copy is explicitly safe for review: “Boost is not sold yet and nothing here charges you… no rate has been set.” Keep it preview-only unless a written change authorizes commercial scope. | No checkout, rate, payment field, paid placement, or production offer. If the client later approves it, define inventory, eligibility, labeling, billing owner, terms, and measurement first. | Paid placement and subscriptions are outside the documented first-build boundary; activating them would be a material scope and approval change. | **Preview-only guardrail. No implementation / no publish / no spend.** |
| R-05 | Add more visual mock / photo / advertising ideas to Create. | No invented copy or asset list. Retain the existing local Create image and preview as evidence; collect a client-approved art direction before adding variants. | Approved assets have provenance/rights, truthful alt text, clear “sample/review” labeling, and no implied ad inventory or live performance. | “More visual” is direction, not a specific asset request. New generation or asset acquisition would be a separate action. | **Decision required. No implementation / no publish.** |
| R-06 | Do not turn the Groupon / Myspace / Fiverr examples into automatic post-mode scope. | No new mode copy proposed from those analogies. Treat them as discovery questions about deals, public/B2B drops, service listings, and reposting. | Written scope owner, role/permission matrix, moderation rules, milestone/change-order, and acceptance test exist before expanding Create or Community. | The analogies cross directory, social, and monetization boundaries and could create unsupported product promises. | **Scope gate. No implementation / no publish.** |

## Cross-surface acceptance gate

Before any implementation is considered, obtain a dated written accept/revise
for the three routes and record the decision source. A review pass should then
verify:

1. One H1 per route, exact approved copy, no stale competing headline, and no unsupported live/scale claim.
2. Desktop and mobile screenshots at the existing 1440 px / 390 px baselines, including focus order, contrast, alt text, and reduced-motion behavior.
3. Existing 21+ entry and review-build/noindex boundaries remain intact; sample content remains labeled as sample.
4. Audience controls, protected-detail rules, and any future paid placement remain server/approval-gated; local UI presence is not production authorization.
5. No edit to the live site, Netlify, repository branch, client account, Gmail, Slack, billing, or queue occurs from this checklist.

## Explicit state

**Drafted locally for review. No implementation performed. No publish, deploy,
send, post, reaction, spend, or client/queue mutation performed.**

