# Claude models for Mac week

Routing note for Claude Code / Claude Design. Recheck the picker before a long session. Every score below is from Anthropic's own system cards or launch pages, read 2026-09-07. Do not mix rows from different cards as if they were one experiment.

**Short answer:** You do not need Opus or Fable for Mac. You do not need Sonnet 5 just to walk into Friday. Use **Sonnet 5** for the Design flush if the picker has it. Fall back to **Sonnet 4.6** if it does not. One **Opus 5** pass on Book 01 or the Snapshot is optional, not required.

---

## Use this

| Job | Model | Why |
|---|---|---|
| **Daily flush** (ebooks, Snapshot studio, Command Center, decision board) | **Claude Sonnet 5** | Best intelligence per dollar for long HTML and Design loops. List is **$2 in / $10 out**, made permanent on 2026-08-10. 1M context. Finishes multi-step work that 4.6 stops halfway. |
| **Friday only, picker has no Sonnet 5** | **Claude Sonnet 4.6** | Computer-use gap is small. Enough for Command Center + Snapshot + Decision Board. |
| **One quality bar** | **Claude Opus 5** | Highest generally available Claude. **$5 / $25**. Use once, copy the system, go back to Sonnet. |
| **Mechanical only** | **Claude Haiku 4.5** | **$1 / $5**. Checklists, captions, file rename. Do not let it design. |

## Do not use this week

| Model | Why not |
|---|---|
| **Claude Fable 5** | **$10 / $50**. Near-Opus ceiling at 2x Opus price. About 21% of its Terminal-Bench trials hit a safety refusal and finish on Opus 4.8. Waste for ebook iteration. |
| **Claude Mythos 5** | Restricted / not a Design daily driver. |
| **Opus on every turn** | Design sessions are output-heavy. Opus all day burns the budget after the first good pass. |
| **Max / xhigh effort by default** | Time-to-first-token can run to minutes. Use high effort for a book or Snapshot. Escalate only when Sonnet is stuck. |

---

## Do we need Sonnet 5 for Mac?

**Friday object (Command Center + Snapshot + Decision Board): no.** Sonnet 4.6 already sits at 78.5% on OSWorld-Verified. Sonnet 5 is 81.2%. That is not a Friday-or-bust gap.

**The rest of the week (interactive ebooks, diagnostic, Snapshot studio, leave-behinds): yes, if it is in the picker.** The gap that matters for this flush is not "can it click a browser." It is follow-through and knowledge work:

| What the flush actually needs | Sonnet 4.6 | Sonnet 5 | Why it matters |
|---|---|---|---|
| Finish a long Design loop (FrontierCode v1) | 15.1% | **38.8%** | 4.6 stalls. 5 keeps going. That is the ebook problem. |
| Real coding / HTML in Cursor (CursorBench) | 49% | **61.2%** | Closest public bench to "rebuild this page in Claude Code." |
| Terminal / tool follow-through (Terminal-Bench 2.1) | 67.0% | **80.4%** | Same story: fewer half-done artifacts. |
| Knowledge work (GDPval-AA v2 Elo) | 1381 | **1618** | Positioning, economics, AEO copy, Mac-safe claims. |
| Hard facts with tools (HLE w/ tools) | 46.8% | **57.4%** | Fewer invented stats in the books. |
| Computer / GUI use (OSWorld-Verified) | 78.5% | **81.2%** | Almost tied. Not why you upgrade. |
| Price per 1M tokens (in / out) | $3 / $15 | **$2 / $10** | Sonnet 5 is now cheaper than 4.6. |

You do **not** put Mac on Opus 5 or Fable 5. Those exist for hard agentic coding and long-horizon research. Friday is a walkthrough, not a SWE-bench run.

If Claude Code only shows Sonnet 4.6, stay there. Do not "make up" for it by switching to Opus all day.

---

## Price card (API list, per million tokens)

Confirmed from Anthropic launch pages and the 2026-08-10 Sonnet 5 changelog. Consumer Pro/Max seats include Claude Code and Claude Design; Fable on Pro is usage-credits only.

| Model | Input | Output | Context | Notes |
|---|---|---|---|---|
| Haiku 4.5 | $1 | $5 | 200k | Fast grunt. |
| **Sonnet 5** | **$2** | **$10** | 1M | Intro $2/$10 was made **permanent** Aug 10, 2026. The old "jumps to $3/$15 on Sep 1" plan is dead. |
| Sonnet 4.6 | $3 | $15 | 1M | Still the fallback daily driver. |
| **Opus 5** | **$5** | **$25** | 1M | Same list as Opus 4.8. Fast mode is 2x price, ~2.5x speed. |
| Opus 4.8 | $5 | $25 | 1M | Previous Opus. Do not pick it over Opus 5. |
| Fable 5 | $10 | $50 | 1M | Skip. |

Claude 5-generation tokenizers count about **1.0–1.35x more tokens** than 4.6 for the same text. Cache the handoff. One artifact per turn. Point at the seed HTML. Do not paste the kit every turn.

House-stack ratios (Gemini 3.8 Flash intro $0.75 / $3.75 vs this card) live in [PRICE.md](PRICE.md): **2.7× vs Sonnet 5, 6.7× vs Opus 5, 13× vs Fable 5 and Astra**. Luna and Composer 2.5 are cheaper than 3.8. Seats do not refund.

---

## Official benches that matter for this job

Scores are Anthropic-reported, usually **max or xhigh effort**, often a **mean of 5 trials**. A default Claude Code turn will not automatically reprint the headline number.

### The Design / knowledge set (use these)

| Benchmark | What it measures | Haiku 4.5 | Sonnet 4.6 | **Sonnet 5** | Opus 4.8 | **Opus 5** | Fable 5 |
|---|---|---|---|---|---|---|---|
| **GDPval-AA v2** (Elo) | Knowledge work: docs, analysis, professional writing | — | 1381 | **1618** | 1593 | **1861** | 1747 |
| **OSWorld-Verified** | Computer / GUI use | — | **78.5** | **81.2** | — | — | — |
| **OSWorld 2.0** | Newer computer-use set (do not mix with Verified) | — | — | — | 55.7 | **70.6** | 66.1 |
| **CursorBench** | Real Cursor agent tasks | — | 49 | **61.2** | 63.8 | near Fable at max | ceiling |
| **AutomationBench** | End-to-end business workflows | — | 5.3 | 13.5 | 17.0 | **26.0** | 17.4 |
| **BrowseComp** | Hard web research | — | 76.2 | **84.7** (86.6 multi) | 84.3 | **90.8** | 87.4 |
| **HLE, no tools** | Expert exam, no tools | — | 34.6 | **43.2** | 49.8 | **56.3** | 56.5 |
| **HLE, with tools** | Expert exam + tools | — | 46.8 | **57.4** | 57.9 | **64.7** | 63.9 |
| **AA-Briefcase** | Professional packet work | — | — | — | 1346 | **1720** | 1574 |

Sonnet 5 **edges Opus 4.8** on GDPval-AA v2 (1618 vs 1593 in the Sonnet card's June 6, 2026 snapshot). That is the "flagship is not always better at writing" fact. Opus 5 later posted 1861 on a later snapshot. Do not stack those Elo numbers as one ranking.

### The coding set (for context, not Friday)

| Benchmark | What it measures | Haiku 4.5 | Sonnet 4.6 | **Sonnet 5** | Opus 4.8 | **Opus 5** | Fable 5 |
|---|---|---|---|---|---|---|---|
| **SWE-bench Verified** | 500 human-checked GitHub issues | **73.3** | — | **85.2** | 88.6 | **96.0** | **95** |
| **SWE-bench Pro** | Harder, less leaked, multi-file | — | **58.1** | **63.2** | **69.2** | **79.2** | **80** |
| **SWE-bench Multilingual** | 300 problems, 9 languages | — | — | 78.3 | 84.4 | **89.5** | 86.6 |
| **SWE-bench Multimodal** | Issues + screenshots / mockups | — | — | 28.1 | 38.4 | **59.4** | 54.1 |
| **Terminal-Bench 2.1** | CLI / terminal agents | ~41 | **67.0** | **80.4** | **82.7** | (dropped from Opus 5 card) | **84.3** |
| **FrontierCode v1** | Production-quality PR tasks | — | 15.1 | **38.8** | — | — | — |
| **FrontierCode 1.1** | Later Cognition set | — | — | — | 46.5 | **53.4** | 53.5 |
| **Frontier-Bench v0.1** | New Terminal-Bench-team eval | — | — | — | 18.7–21.1 | **43.3** | 33.7–33.8 |
| **ARC-AGI-3** | Novel problems, anti-memorization | — | — | — | 1.5 | **30.2** | — |
| **USAMO 2026** | Proof math | — | 55.0 | 79.5 | 96.7 | — | — |

Em dashes mean that card did not publish the number. Not a zero.

### How to read the coding benches without getting played

1. **SWE-bench Verified is saturated and contested.** OpenAI stopped recommending it in Feb 2026 after finding a large share of failed tasks had broken tests. Treat 85 vs 96 as "both can code," not a Mac-week reason to buy Opus.
2. **SWE-bench Pro was also dinged.** OpenAI's Jul 2026 audit estimated about 30% of the public split is broken. Small gaps (63.2 vs 69.2) are inside the noise.
3. **Frontier-Bench is the newer coding story.** Opus 5 at 43.3 vs Opus 4.8 at ~19 is a real jump. Still not a Design-flush reason to live on Opus.
4. **Fable's 84.3 Terminal-Bench is a product score.** 20.9% of those trials refused and finished on Opus 4.8. Mythos 5 is the raw model (88%). Do not quote Mythos numbers as Fable.
5. **Do not mix OSWorld-Verified with OSWorld 2.0.** Different sets. Sonnet 5's 81.2 and Opus 5's 70.6 are not a ranking.
6. **Do not mix GDPval Elo across cards.** Same model can move hundreds of Elo between snapshots.

---

## Why each model exists (in one line)

| Model | Anthropic's job for it | Our job for it this week |
|---|---|---|
| **Haiku 4.5** | Fast, cheap, Sonnet-4-era coding at $1/$5 | Captions and checklists |
| **Sonnet 4.6** | Previous daily agent / computer-use workhorse | Friday fallback |
| **Sonnet 5** | "Most agentic Sonnet." Near old-Opus on tools, coding, knowledge work, at Sonnet price | **Default** |
| **Opus 4.8** | Previous flagship | Skip. Opus 5 replaced it at the same price |
| **Opus 5** | Daily Max default. Near-Fable at half Fable's price. SOTA on Frontier-Bench and GDPval | **One pass** |
| **Fable 5** | Longest-horizon / widest band, with heavy cyber safeguards | Skip |
| **Mythos 5** | Restricted sibling without the classifiers | Not available for this |

---

## Token rules that beat picking a fancier model

1. Attach `CLAUDE-CODE-HANDOFF.md` plus one seed file. Not the whole Sep 4/5 kit.
2. Prompt-cache the handoff. Same system lock every turn.
3. One artifact per turn. Book 01, then Book 02, then the diagnostic.
4. High effort for a book or Snapshot. Not max. Not on every polish pass.
5. If Sonnet 5 is stuck on structure or a claim, one Opus 5 turn. Then copy the system back to Sonnet.

---

## Sources

- [Claude Sonnet 5 System Card](https://www-cdn.anthropic.com/480e0bb54327b9622282e9c39a83a4f490ed377e/Claude%20Sonnet%205%20System%20Card.pdf) — Table 8.1.A and §8.2–8.5. Sonnet 5 vs 4.6 on SWE-Pro, Terminal-Bench 2.1, OSWorld-Verified, HLE, GDPval-AA v2, FrontierCode, CursorBench, BrowseComp.
- [Introducing Claude Sonnet 5](https://www.anthropic.com/news/claude-sonnet-5) — $2/$10 made permanent 2026-08-10. Tokenizer 1.0–1.35x. Sonnet 4.6 HLE restated to 34.6 / 46.8 and OSWorld-Verified to 78.5 after methodology fixes.
- [Claude Opus 5 System Card](https://www-cdn.anthropic.com/b514064af1408018e64b1ad24e7d5e75850b4ffd/Claude%20Opus%205%20System%20Card.pdf) — Table 8.1.A and §8.2. Opus 5 / 4.8 / Fable 5 on SWE-Pro, Frontier-Bench, OSWorld 2.0, HLE, GDPval-AA v2, AutomationBench, ARC-AGI-3. Opus 5 SWE-Verified 96.0% in prose.
- [Introducing Claude Opus 5](https://www.anthropic.com/news/claude-opus-5) — $5/$25. Fast mode 2x price. Near-Fable at half the price.
- [Claude Fable 5 & Mythos 5 System Card](https://www-cdn.anthropic.com/57a52ea7d8f0e54e8a542e908266086df425cdf5/Claude%20Fable%205%20%26%20Claude%20Mythos%205%20System%20Card.pdf) — Fable SWE-Verified 95, SWE-Pro 80 (Mythos is 95.5 / 80.3). Terminal-Bench 2.1 Fable 84.3 with 20.9% Opus 4.8 fallback.
- [Introducing Claude Haiku 4.5](https://www.anthropic.com/news/claude-haiku-4-5) — SWE-Verified 73.3%, $1/$5.
- [Claude pricing](https://www.anthropic.com/pricing) — Pro includes Claude Code and Claude Design. Fable on Pro is usage credits.

This machine's OmniRoute "best combo" is irrelevant to Claude Design. Stay in Claude Code on Sonnet 5.
