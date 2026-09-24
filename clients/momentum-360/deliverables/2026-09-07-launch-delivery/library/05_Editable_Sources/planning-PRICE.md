# House stack vs Gemini 3.8 Flash

Read 2026-09-07. API list is USD per 1 million tokens. Seats are monthly prepaid. Recheck live pages before a spend decision.

**Short answer:** Gemini 3.8 Flash intro list is **2.7× cheaper than Sonnet 5**, **6.7× cheaper than Opus 5**, and **13× cheaper than Fable 5 and GPT-6 Astra** on both input and output. It is **not** the cheapest thing in the house. GPT-5.6 Luna and Cursor Composer 2.5 undercut it.

Benches for the same set live in [BENCH.md](BENCH.md). Headline: BenchLM **#6 at 78.4**, ties Opus on DeepSWE, dies on Terminal-Bench 4.0 (**19.1** vs Opus **52** / Astra **58**). Luna max is close on TB 2.1, not on the composite. Composer has no Sep 2026 frontier card.

---

## The one number

Gemini 3.8 Flash (`gemini-3.8-flash`) intro through **2026-12-31**:

| | Input | Output | Cache read |
|---|---|---|---|
| **Google list** | **$0.75** | **$3.75** | $0.075 |
| Cursor Other Models | $0.75 | $3.50 | $0.075 |

Standard list from **2027-01-01**: **$1.50 / $7.50**. Thinking tokens bill as output. Google says 3.8 "works harder" and often emits ~30% more output tokens than a same-task peer, so real savings vs Sonnet land nearer **2.0×**, not 2.7×, on long agent turns.

---

## API list: how many times more than 3.8 intro

| Model | Input | Output | vs 3.8 input | vs 3.8 output | Notes |
|---|---|---|---|---|---|
| **Gemini 3.8 Flash** | **$0.75** | **$3.75** | 1.0× | 1.0× | Intro through Dec 31 |
| GPT-5.6 Luna | $0.20 | $1.20 | **0.27× (Luna cheaper)** | **0.32×** | Codex cheap tier. Official OpenAI list. |
| Composer 2.5 | $0.50 | $2.50 | **0.67× (Composer cheaper)** | **0.67×** | Cursor first-party pool |
| Haiku 4.5 | $1 | $5 | 1.3× | 1.3× | Claude grunt |
| **Sonnet 5** | **$2** | **$10** | **2.7×** | **2.7×** | Permanent $2/$10 as of Aug 10 |
| Grok 4.6 | $2 | $6 | 2.7× | 1.6× | Doubles at ≥200k prompt |
| GPT-5.6 Terra | $2 | $12 | 2.7× | 3.2× | Codex mid |
| Sonnet 4.6 | $3 | $15 | 4.0× | 4.0× | Friday fallback |
| GPT-5.6 Sol (promo) | $4 | $20 | 5.3× | 5.3× | Promo at least through Nov 21 |
| Grok 4.6 Fast | $4 | $12 | 5.3× | 3.2× | This cloud run's family |
| **Opus 5** | **$5** | **$25** | **6.7×** | **6.7×** | Fast mode 2× price |
| **Fable 5 / 5.1** | **$10** | **$50** | **13×** | **13×** | Same list |
| **GPT-6 Astra** | **$10** | **$50** | **13×** | **13×** | Whole request → $20/$75 if input >272k. Fast 2×. |

Percent cheaper on list (1 − 3.8 / other), intro rate, ignoring the 30% token bump:

- vs **Sonnet 5**: **62% cheaper**
- vs **Opus 5**: **85% cheaper**
- vs **Fable 5 / Astra**: **92% cheaper**
- vs **Grok 4.6** output: **38% cheaper** (input still 62%)
- vs **Sol promo**: **81% cheaper**

After Jan 1, 3.8 at $1.50 / $7.50 is still **25% cheaper than Sonnet 5** and **70% cheaper than Opus 5**.

---

## Same work, cash on the meter

Blend used below: **15M input / 6M output**, no cache, standard (not Fast), short context. That is a heavy Codex-style week, not an invoice.

| Model | Week list | vs Gemini $33.75 | With 3.8's +30% output ($40.50) |
|---|---|---|---|
| Luna | $10 | Gemini costs **3.3× more** | — |
| Composer 2.5 | $23 | Gemini costs **1.5× more** | — |
| **Gemini 3.8 Flash** | **$34** | — | $41 |
| Grok 4.6 | $66 | **2.0×** | 1.6× |
| **Sonnet 5** | **$90** | **2.7×** | 2.2× |
| Terra | $102 | 3.0× | 2.5× |
| Grok 4.6 Fast | $132 | 3.9× | 3.3× |
| Sol promo | $180 | 5.3× | 4.4× |
| **Opus 5** | **$225** | **6.7×** | 5.6× |
| **Fable / Astra** | **$450** | **13×** | 11× |
| Astra Fast | $900 | 27× | 22× |
| Astra >272k | $750 | 22× | 19× |

Two Astra weeks at that blend: **~$900 list vs ~$68–$81 Gemini**. That is the weekend-overflow math. It is **not** cash returned if those weeks were included Codex banks or compensation resets.

One Design-flush turn (20k in / 8k out, no cache):

| Model | Turn |
|---|---|
| Luna | $0.014 |
| Composer 2.5 | $0.030 |
| Gemini 3.8 | $0.045 ($0.054 at +30% out) |
| Grok 4.6 | $0.088 |
| Sonnet 5 | $0.120 |
| Opus 5 | $0.300 |
| Fable / Astra | $0.600 |

---

## Seats are a different meter

API ratios do not refund a prepaid seat. Moving overflow to Gemini only saves money when the alternative is **credits, a weekly reset, on-demand Cursor Other Models, or a new Ultra/Max/Pro upgrade**.

| Seat | Monthly | What it buys | Where Gemini sits |
|---|---|---|---|
| Claude Pro | $20 ($17 annual) | Claude Code + Design. Fable is usage-credits only. | Not inside this seat |
| Claude Max 5x / 20x | $100 / $200 | 5× or 20× Pro per 5-hour session. Same models. | Not inside this seat |
| ChatGPT Plus | $20 | Codex + GPT-5.6 family. Shared 5-hour + weekly bank. | Not inside this seat |
| ChatGPT Pro 5x / 20x | $100 / $200 | 5× or 20× Plus Codex. Astra burns this bank fast. | Not inside this seat |
| Cursor Pro / Pro+ / Ultra | $20 / $60 / $200 | **Cursor Models** (Grok 4.6, 4.5, Composer 2.5) + **Other Models** included **$20 / $70 / $400** | 3.8 in Cursor is **Other Models** at $0.75 / $3.50 |
| Google AI Pro / Ultra 5x / 20x | $20 / $100 / $200 | Consumer Gemini + Flow / Antigravity headroom. Not an API refund. | CLI Google-login for individuals is a separate, flaky rail. API key is the clean cheap path. |

Cursor docs: Pro / Pro+ / Ultra include two pools. Grok and Composer draw the generous first-party pool. Claude, Gemini, and OpenAI draw Other Models at API list. This cloud run (`cursor-grok-4.6-xhigh-fast`) is first-party **Fast** ($4 / $12), not Gemini.

Do **not** switch a Cursor Grok session to Gemini 3.8 to "save money." That moves work from the included Cursor Models pool onto the small Other Models dollar cap.

---

## What this means for Mac week

1. **Coding overflow after Codex dies:** Gemini 3.8 Flash API at $0.75 / $3.75. That is the 13× Astra hedge.
2. **Mac / Snapshot / GDPval writing:** stay on Claude Code Sonnet 5. Saving ~$0.075 a Design turn is not worth the knowledge-work gap (GDPval 1545 vs Sonnet 1618 / Opus 1861).
3. **Hard agent closer (TB 4.0-class):** Astra if the bank is there, else Opus 5. Not Gemini (official TB 4.0 19.1 vs Opus 51.8).
4. **Inside Cursor:** keep Grok 4.6 / Composer 2.5. Composer is cheaper than 3.8 on list and sits in the included pool.
5. **Do not buy** Claude Max, ChatGPT Pro, Cursor Ultra, or Google Ultra this week to chase 3.8. Buy a Gemini API key only if Google-login 429s.

Sources: [Google Gemini 3.8 Flash](https://ai.google.dev/gemini-api/docs/latest-model), [Google Agent Platform pricing](https://cloud.google.com/gemini-enterprise-agent-platform/generative-ai/pricing), [Anthropic pricing](https://www.anthropic.com/pricing), [OpenAI API pricing](https://developers.openai.com/api/docs/pricing), [xAI pricing](https://docs.x.ai/developers/pricing), [Cursor models and pricing](https://cursor.com/docs/models-and-pricing.md), [Cursor plan help](https://cursor.com/help/account-and-billing/pricing.md).
