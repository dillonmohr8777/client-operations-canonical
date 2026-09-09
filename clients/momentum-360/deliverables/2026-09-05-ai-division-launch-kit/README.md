# Momentum AI: launch kit (v2, reconsidered)

2026-09-05. Internal. For the Friday 2026-09-11 conversation with Mac.

**Everything commercial in here is a proposal.** Prices, capacity,
compensation and targets are open until recorded as agreed. Nothing in this
kit implies a contract, an outbound send, or an account change. The builders
refuse to render a page that loses that marking.

Start with **`DIVISION.md`** — the architecture, the thesis, the finding Mac
asked about, and what is Dillon's call versus Mac's.

---

## What is here

| File | What | Rebuild |
|---|---|---|
| `DIVISION.md` | The division, reconsidered: four lanes, four flagships, four roadmap offers, one free opener, the 241/0 finding, price anchors, economics | — |
| `index.html` | The internal launch page | `python economics_v2.py && python build_kit.py` |
| `one-pagers.html` | Five print sheets: division summary + four flagships (Letter, one per page) | same |
| `pending-decisions.json` | **20 open decisions** for Mac, D19 (name/lockup) and D20 (credits pass-through) added | — |
| `offers.json` | Single source for every offer, lane line, anchor and objection. Edit this, not the HTML | — |
| `economics_v2.py` → `economics-v2.json` | The September 4 pack's own engine, run on the v2 offers, with known-answer asserts | — |
| `video/shots.json` | Five films + eight stills, dark-first, credit budget, 3D-world contract | — |
| `video/title-cards.html` | Six cards (open, four lanes, close), 1920×1080 or 1080×1920 with `?v=1`; the close card is the outro | `python video/build_cards.py` |
| `video/composite.ps1` | Joins plates, derives 9:16 and 1:1, overlays the verified mark after cropping, writes QA frames + receipt | — |
| `video/assets/` | The verified Momentum Digital wordmark (white + dark) with SHA-256 provenance from the Sept 4 deck | — |
| `snapshot/` | **AI Search Snapshot generator v1** — the free opener. See `snapshot/README.md` | `python snapshot/snapshot.py <url>` |
| `deck-addendum/output/` | **Eight-slide addendum** to the 26-slide deck, same `client-deck` brand system: pptx (103 native entrance effects) + PDF. Zero fit warnings; every figure read from the JSON above | `node deck-addendum/build-addendum.mjs` |
| `video/cards/` | 36 title-card assets: opaque stills, alpha stills, recorded animated entries, 16:9 and 9:16 | `node video/capture_cards.mjs` |
| `video/HIGGSFIELD-PROMPT-PACK.md`, `video/SOCIAL-PLAN.md` | Paste-ready generation pack with review gates; what posts where and when | — |

Styling is read **in place** from `../2026-09-05-momentum-design-system/tokens/`.
Nothing is copied; a copy is how drift starts.

---

## What was measured

| Surface | Pairs | AA failures | Responsive |
|---|---|---|---|
| `index.html` | 47 | **0** | no overflow at 375 / 768 / 1440 |
| `one-pagers.html` | 13 | **0** (after one fix, below) | — |
| `video/title-cards.html` | all six cards | **0** | — |
| `snapshot/runs/needmomentum.com/report.html` | 11 | **0** | — |

Things measurement caught that eyeballing would not have:

- **Economics.** My hand-computed contribution row said $1,225; the engine
  said **$1,125**. Double hours said $25; the engine said **−$75**. The
  known-answer assert in `economics_v2.py` failed, the prose was corrected, and
  the page now renders the engine's output, never typed numbers. The corrected
  finding is stronger: at double hours the recurring cohort loses money.
- **The lockup on paper.** The "AI" in the lockup used `--m-accent-on-deep`
  everywhere and landed on white in the one-pagers at **2.07:1**. It now takes
  `--m-accent-ink` on paper, `--m-accent-on-deep` on dark, `--m-accent-on-brand`
  on the footer gradient's worst stop.
- **The Snapshot over-claimed on its first run.** See `snapshot/README.md`. All
  three domains are on SiteGround, which challenges every automated identity
  from a datacenter — including the browser one — so "3 of 3 AI crawlers
  blocked" was not distinguishable from "this IP is blocked". It is now
  reported as a verified host challenge plus a *not observed* AI-crawler state,
  with a second-vantage capture script.
- **The pixel outro is not reusable.** Its preview frame carries the Momentum
  360 circular mark and a 360 tagline. The close card is the outro instead.

---

## Video: decided, budgeted, waiting on one thing

Dillon authorised Higgsfield for division collateral and social on
2026-09-05 (~600–800 credits). The earlier "prohibited" rule only ever covered
prospect spec web designs.

**The Higgsfield MCP connector is still not authorised.** `claude mcp get
higgsfield` reports an HTTP server at `https://mcp.higgsfield.ai/mcp`, user
scope, status *Needs authentication*. No generation has run. No credit spent.

To authorise: open an interactive `claude` session, run `/mcp`, pick
`higgsfield`, complete the OAuth in the browser. The Sept 4 receipt in
`Codex/Higgsfield/outputs/` shows that, once authorised, the connector writes
job receipts and downloads there itself. Then `video/shots.json → pipeline`
runs mechanically: five keyframes, one test leg per film, then the chains.

Or skip the connector entirely: `video/HIGGSFIELD-PROMPT-PACK.md` is
paste-ready for the Higgsfield web app, step by step, with the review gate
after each step. Drop accepted legs into `video/plates/F0N/`.

**Already produced without any model** — `video/cards/`: the six title cards
as opaque stills, alpha stills for over-plate labels, and recorded animated
entries, in 16:9 and 9:16 (36 files, receipt with input hashes). ffmpeg 8.1.2
is on PATH; `composite.ps1` runs locally.

| Piece | Format | Credits |
|---|---|---|
| F01 Division opener | 16:9 master, 9:16 derived, ~16s | 48.5 |
| F02–F05 Lane films | 9:16, ~12s each, 1:1 derived | 4 × 38.5 = 154 |
| S01–S08 Stills | gpt_image_2 2K, 4:5 / 1:1 crops | 68 |
| Reject allowance 35% | | ~95 |
| **Planned** | | **~365** — hard stop 450 |

All Seedance 2.0 Mini (the 2026-08-30 receipt shows the one recorded 1080p
comparison was rejected as worse, at 3.6× the cost). No founders or faces,
so no Seedance 2.5 identity renders. No 4K upscale before Friday.

**The logo never touches a video model.** Plates only; the verified mark is
composited locally, after cropping, position/opacity/scale only.

---

## The 3D world

Dillon's Codex session owns it. `video/shots.json → three_d_world_handoff` is
the contract it needs to match: the token palette (not 360's cyan/yellow), the
same measured contrast bar against the actually rendered background, the logo
as a verified 2D layer, a 16:9 master plus a 9:16 variant with a named frame
range for a title card.

---

## Still to do before Friday (plan: `~/.claude/plans/cosmic-brewing-kahn.md`)

- **Higgsfield** (the only thing that needs Dillon): authorise the connector or
  run the prompt pack by hand → keyframes → one test leg per film → chains →
  `composite.ps1` → QA frames. Then the films exist.
- Optional: a browser vantage on a second domain for the Snapshot known-answer
  test (`snapshot/capture-vantage.js`, any residential connection).
- Optional: one human-run 20-question baseline on needmomentum.com for the demo.

Done: division doc, launch page, five print sheets, 20-item register,
engine-checked economics, Snapshot generator v1 with its first real run, the
eight-slide deck addendum, 36 title-card assets, the prompt pack, the social
plan, the compositor with 9:16 / 1:1 derivation.

## Not touched

The twenty-site prospect batch and the website backend belong to other
sessions. No site-count claim appears anywhere here (D17). Nothing is sent,
posted, deployed, or shown to Mac by this kit — Dillon brings it.
