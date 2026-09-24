# Gemini 3.8 Flash vs the house stack

Read 2026-09-07. Every cell is tagged to a vendor card or BenchLM. Do not mix Terminal-Bench 2.0 / 2.1 / 3.0 / 4.0, OSWorld-Verified / OSWorld 2.0, or GDPval Elo across snapshots as one ranking.

**Short answer:** On the independent composite, 3.8 sits **#6 at 78.4**, one point under Sol and a few under Opus / Fable / Astra. On Google’s own coding table it **ties Opus on DeepSWE and leads Terminal-Bench 2.1**. On the hard agent set it **falls off a cliff** (Terminal-Bench 4.0 **19.1** vs Opus **52** / Astra **58**). Knowledge work and GUI use stay with Claude and Grok. **Luna max is the surprise cheap peer on the July OpenAI card, not a 3.8 beater.** **Composer 2.5 has no Sep 2026 frontier card.**

---

## Independent composite (BenchLM overall, 2026-09-04)

| Rank | Model | Score | Evidence |
|---|---|---|---|
| 1 | Fable 5.1 | 83.0 | Supported |
| 2 | GPT-6 Astra | 81.1 | Estimated |
| 3 | Fable 5 | 80.9 | Supported |
| 4 | Opus 5 | 80.7 | Supported |
| 5 | GPT-5.6 Sol | 79.6 | Supported |
| **6** | **Gemini 3.8 Flash** | **78.4** | **Supported** |
| 13 | GPT-5.6 Terra | 71.4 | Estimated |
| 15 | Sonnet 5 | 70.8 | Supported |
| 18 | Grok 4.6 | 70.2 | Supported |
| 37 | **GPT-5.6 Luna** | **65.5** | Estimated |
| 46 | Sonnet 4.6 | 64.2 | Supported |
| 112 | Haiku 4.5 | 52.7 | Supported |
| — | **Composer 2.5** | **unranked** | Coverage too thin |

Grok 4.6 Fast is the same model at a higher Cursor rate. It has no separate bench row.

3.8 is in the Sol / Opus cluster on this blend. Luna max is **13 points behind**. Composer is not in the race because Cursor never published a full 2026-09 card.

---

## Same-table coding (use these first)

### Google Sep 2 card (3.8 vs Opus 5 vs Sol)

Google: Gemini self-run; others from public leaderboards / vendor cards. Terra and Sonnet 5, when present, are max thinking.

| Bench | **3.8 Flash** | 3.7 Flash | Opus 5 | Sol |
|---|---|---|---|---|
| DeepSWE v1.1 | **73.7** | 65.3 | **74.0** | 72.7 |
| Terminal-Bench 2.1 | **89.4** | 85.8 | 89.1 | 88.8 |
| Terminal-Bench 4.0 | **19.1** | 11.2 | **51.8** | 37.3 |
| OSWorld 2.0 (partial) | 59.0 | 50.6 | **75.4** | 62.6 |
| HLE-Verified | **54.9** | 53.6 | 54.4 | 54.5 |
| GDPval-AA v2 Elo | 1545 | 1482 | **1824** | 1710 |
| Vals Finance Agent v2 | **61.4** | 59.0 | 58.6 | 53.8 |
| Harvey Legal Agent | **10.0** | 8.8 | 6.7 | 2.5 |

3.8 **ties the $25 Opus** on long-horizon SWE and **wins TB 2.1**. It **loses TB 4.0 by 33 points** and **GDPval by ~280 Elo**.

### OpenAI Astra Sep 3 card (adds Fable and 3.8)

| Bench | **3.8** | Sol | Opus 5 | Fable 5 | Fable 5.1 | **Astra** |
|---|---|---|---|---|---|---|
| Terminal-Bench 4.0 | **19.1** | 37.3 | 52.3 | 42.0 | 55.8 | **57.9** |
| DeepSWE v1.1 | **73.8** | 72.7 | 73.7 | 69.9 | 67.4 | **74.1** |
| FrontierCode 1.1 Main | 43.6 | 47.5 | 53.4 | **53.5** | 50.9 | 53.3 |
| FrontierCode 1.1 Ext | 56.3 | 60.6 | 63.6 | **64.9** | 63.6 | 64.5 |
| AA Coding Agent Index v1.4 | 61.2 | 65.1 | **68.1** | 67.2 | — | 67.0 |
| AA Intelligence v4.1.1 | 58.7 | 60.9 | 63.1 | 62.1 | **65.7** | 61.2 |
| GPQA Diamond | **95.3** | 94.6 | 93.7 | 92.6 | 93.7 | **96.0** |
| HLE w/ tools | — | — | 63.6 | 63.8 | **65.0** | 57.2 |
| HealthBench Prof. | 52.1 | 60.5 | 56.4 | 60.9 | 58.1 | **63.4** |

DeepSWE is a three-way tie at the top (Astra 74.1 / 3.8 73.8 / Opus 73.7). TB 4.0 is not. Do not use 3.8 as the hard-agent closer.

---

## Luna max and the rest of GPT-5.6 (OpenAI Jul 9, max reasoning)

OpenAI’s launch table is **Sol / Terra / Luna at max**. It does **not** include Gemini 3.8. Cross-card only against the Sep Google/OpenAI 3.8 rows.

| Bench | **Luna max** | Terra max | Sol max | Sol Ultra | **3.8 (Sep)** |
|---|---|---|---|---|---|
| Terminal-Bench 2.1 | **84.7** | 87.4 | 88.8 | **91.9** | **89.4** |
| DeepSWE v1.1 | 67.2 | 69.6 | 72.7 | — | **73.7** |
| SWE-bench Pro | 62.7 | 63.4 | 64.6 | — | — |
| AA Coding Agent Index v1.1 | 74.6 | 77.4 | **80** | — | *do not vs v1.4* |
| AA Intelligence v4.1 | 51.2 | 55 | 58.9 | — | 58.7 (v4.1.1 Sep) |
| GDPval-AA v2 Elo | **1591.8** | 1593 | 1747.8 | — | 1545 (Google/AA Sep) |
| OSWorld 2.0 | 45.6 | 50.2 | 62.6 | — | 59.0 |
| BrowseComp | 83.3 | 87.5 | 90.4 | 92.2 | — |
| Agents’ Last Exam | 50.3 | 50.4 | 52.7 | — | — |
| GPQA Diamond | 92.3 | 92.9 | 94.6 | — | 95.3 |
| FrontierMath T4 v2 | 58.5 | 68.3 | 83.0 | — | — |
| ARC-AGI-3 | 0.18 | 0.8 | 7.78 | — | — |
| AutomationBench | 14.9 | 15.2 | 18.1 | — | — |
| BenchLM overall | 65.5 | 71.4 | 79.6 | — | **78.4** |

**Luna max vs 3.8, said plainly:**

- Terminal-Bench 2.1: Luna **84.7** vs 3.8 **89.4**. Close. Luna is the cheap Codex overflow that can still finish CLI work.
- DeepSWE: Luna **67.2** vs 3.8 **73.7**. 3.8 wins long-horizon SWE.
- GDPval (cross-snapshot): Luna **1592** vs 3.8 **1545**. Luna is at least not behind on knowledge work. Neither is Sonnet/Opus/Grok.
- OSWorld 2.0: Luna **45.6** vs 3.8 **59**. 3.8 is the better cheap computer-use model. Still far from Opus **70–75**.
- Composite: Luna **65.5** vs 3.8 **78.4**. Luna is cheaper. It is not the same model class.
- AA later lists Luna max Intelligence Index at **52**. Effort is the whole story: Luna **26.6 with reasoning off → 51.2 at max**. Default Luna is not Luna max.

---

## Composer 2.5 (Cursor May 18, 2026)

Cursor’s own post published **three** numbers, against **Opus 4.7 and GPT-5.5**, not against 3.8 / Sonnet 5 / Luna.

| Bench | Composer 2.5 | Note |
|---|---|---|
| SWE-bench Multilingual | **79.8** | Official. Sonnet 5 later posted 78.3 on the same named bench. |
| Terminal-Bench **2.0** | **69.3** | Official. **Not** TB 2.1. 3.8’s 89.4 is a different suite. |
| CursorBench **v3.1** | **63.2** | Official, first-party, display-only. Sonnet 5 card is 61.2 on an older CursorBench row. Grok 4.6 is **69.9 on v3.2**. |

Third-party aggregators also list Composer TB 2.1 **73**, SWE-Pro **54**, CursorBench 3.2 **56.1**, DeepSWE 1.0 **18**. Those are **not** on the Cursor launch post. Do not treat them as a Sep 2026 card.

Composer is a **Cursor-pool daily** at $0.50 / $2.50. It is not a published peer of 3.8 on TB 4.0, DeepSWE v1.1, GDPval, or HLE. Inside Cursor, Grok 4.6 is the stronger first-party row.

---

## Claude family (Anthropic cards, max / xhigh, 2026-09-07)

From [MODELS.md](MODELS.md). Different harness than Google’s Sep table.

| Bench | Haiku 4.5 | Sonnet 4.6 | **Sonnet 5** | **Opus 5** | Fable 5 |
|---|---|---|---|---|---|
| SWE-bench Verified | **73.3** | — | 85.2 | **96.0** | 95 |
| SWE-bench Pro | — | 58.1 | 63.2 | **79.2** | **80** |
| Terminal-Bench 2.1 | ~41 | 67.0 | **80.4** | (dropped) | **84.3*** |
| OSWorld-Verified | — | 78.5 | **81.2** | — | — |
| OSWorld 2.0 | — | — | — | **70.6** | 66.1 |
| HLE w/ tools | — | 46.8 | 57.4 | **64.7** | 63.9 |
| GDPval-AA v2 Elo | — | 1381 | **1618** | **1861** | 1747 |
| CursorBench | — | 49 | **61.2** | near Fable | ceiling |
| FrontierCode v1 | — | 15.1 | **38.8** | — | — |

\*Fable TB 2.1: **20.9% of trials refused and finished on Opus 4.8**. Product score, not raw model.

Google’s TB 2.1 **89.4** and Anthropic’s Sonnet 5 **80.4** are **not** one experiment. Use Google’s table to compare 3.8 to Opus/Sol. Use Anthropic’s card to compare Claude to Claude.

Haiku is not in 3.8’s class. SWE-Verified 73.3 is a saturated, contested bench. TB ~41 vs 3.8’s 89 is the real cheap-tier gap.

---

## Grok 4.6 High (xAI card, 2026-08-12)

| Bench | Grok 4.6 High | 3.8 (Sep) | Notes |
|---|---|---|---|
| GDPval-AA v2 | **1753** | 1545 | Grok wins knowledge work |
| CursorBench v3.2 | **69.9** | — | Best in-editor row in this house after Fable |
| DeepSWE v1.1 | 65.9 | **73.7** | 3.8 wins long-horizon SWE |
| Terminal-Bench **3.0** | 26.0 | — | Do not vs TB 2.1 89.4 |
| FrontierCode 1.1 Ext | **61.3** | 56.3 | Grok |
| AA Intelligence | **61** | 58.7 | Tie-ish with Sol |
| BenchLM overall | 70.2 | **78.4** | 3.8 higher composite |

Grok is the **Cursor daily** for writing and in-editor work. 3.8 is the **cheaper SWE / TB 2.1 overflow**. Neither replaces Opus/Astra on TB 4.0.

---

## What 3.8 actually wins and loses

**Wins or ties (cheap):**

- DeepSWE v1.1 ≈ Opus 5 / Astra
- Terminal-Bench 2.1 ≥ Opus 5 / Sol
- Vals Finance and Harvey Legal on Google’s table
- GPQA 95.3 (near Astra 96)
- HLE-Verified 54.9 ≈ Sol / Opus on that verified set
- BenchLM #6, ahead of Terra, Sonnet 5, Grok, Luna, Haiku, Composer

**Loses badly (do not route here):**

- Terminal-Bench 4.0: **19.1** vs Sol 37 / Opus 52 / Fable 5.1 56 / Astra 58
- GDPval-AA: **1545** vs Luna 1592 / Sonnet 5 1618 / Sol 1710–1748 / Grok 1753 / Opus 1824–1861
- OSWorld 2.0: **59** vs Sol 63 / Opus 70–75 / Astra 73
- FrontierCode 1.1: **43.6 / 56.3** vs Opus / Fable / Astra mid-50s / mid-60s
- AA Coding Agent Index v1.4: **61.2** vs Opus **68.1**

**Not comparable, so do not claim:**

- Composer TB 2.0 69.3 vs 3.8 TB 2.1 89.4
- Grok TB 3.0 26 vs anyone on TB 2.1
- Luna AA Coding v1.1 74.6 vs 3.8 AA Coding v1.4 61.2
- Anthropic OSWorld-Verified 81.2 vs Google OSWorld 2.0 59.0

---

## Routing from the benches (Mac week)

| Job | Winner in this set | Why |
|---|---|---|
| Codex-dead **coding overflow** | **3.8 Flash** | DeepSWE / TB 2.1 at $0.75 / $3.75. Luna max is close on TB 2.1 and cheaper if Codex still has Luna. |
| **Hard agent / TB 4.0** | Astra, else Opus 5 | 3.8 19 vs 52–58. Luna and Composer are not in this row. |
| **Mac / Snapshot / claims** | Sonnet 5, one Opus 5 pass | GDPval. 3.8 1545 loses to Sonnet 1618 and Opus 1861. |
| **Inside Cursor** | Grok 4.6, Composer for cheap edits | Included pool. Composer is not a published 3.8 peer. Do not burn Other Models on 3.8 to “bench-chase.” |
| **Grunt / captions** | Haiku or Luna default | Not 3.8. Not Sonnet. |

Sources: [Google 3.8 Flash launch](https://blog.google/innovation-and-ai/models-and-research/gemini-models/3-8-flash-and-3-8-flash-cyber/), [Google evals methodology](https://deepmind.google/models/evals-methodology/gemini-3-8-flash/), [OpenAI GPT-5.6](https://openai.com/index/gpt-5-6/), [OpenAI GPT-6 Astra](https://openai.com/index/gpt-6-astra/), [xAI Grok 4.6](https://x.ai/news/grok-4-6), [Cursor Composer 2.5](https://cursor.com/blog/composer-2-5), [Anthropic Sonnet 5 / Opus 5 / Fable 5 / Haiku 4.5 cards](MODELS.md), [BenchLM overall 2026-09-04](https://benchlm.ai/best/overall), [Artificial Analysis Luna max](https://artificialanalysis.ai/models/releases/gpt-5-6-luna).
