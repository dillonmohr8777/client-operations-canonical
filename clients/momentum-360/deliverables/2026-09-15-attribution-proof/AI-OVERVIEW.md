# The AI search claim, what it supports and what it does not

## What Dillon wants to be able to say

"We have helped a multitude of clients rank, including in Google AI Overviews."

## What is substantiated today

**Substantiated.** Client pages rank in the top ten for the conversational,
question form and persona framed queries that answer engines issue, and those
appearances behave like machine reads rather than human visits.

Measured across 53,392 page and keyword pairs on 8 properties, window
2026-01-13 to 2026-09-12:

| Query shape | Pairs | Impressions | Clicks | CTR | Avg position |
|---|---:|---:|---:|---:|---:|
| Persona prompt | 725 | 4,194 | 0 | 0.00% | 13.6 |
| Question | 1,168 | 12,255 | 2 | 0.02% | 13.4 |
| Conversational | 3,327 | 88,191 | 70 | 0.08% | 19.0 |
| Ordinary keyword | 48,172 | 1,723,352 | 9,003 | 0.52% | 28.3 |

Two facts, one reconciliation. AI shaped queries rank **better** than ordinary
keywords, 13.4 against 28.3. They convert at **0.00 to 0.08 percent** against
0.52. A person who sees a result at position five clicks it at a measurable
rate. These do not.

Verbatim ranking queries, all at position 10 or better:

- position 2.1, "i am a chief human resources officer. my job seniority is at
  the executive, vp, director or manager level..." (90 words)
- position 5.3, "what are the biggest mistakes companies make during hcm implementation?"
- position 5.2, "does ukg connect with other systems?"
- position 3.1, "is it where can i find expert help for ai driven search visibility?"
- position 1.9, "what are some easy cocktails to prepare for halloween pregaming?"

No person types a ninety word professional persona into a search box.

Concentration: Align HCM draws **29.1%** of all its search impressions from AI
shaped queries in its 24 day window. Bar Crawl USA 9.3%, BigOrange 3.4%.

## What is NOT substantiated

**Not substantiated.** A named citation inside a Google AI Overview, a ChatGPT
answer, a Perplexity answer or a Gemini answer.

Search Console does not expose a query source field. The attribution above rests
on linguistic shape plus the zero click signature. That inference is strong and
reproducible from `keyword-analysis/AI-SHAPED-QUERIES.csv`, but it is an
inference, not a labelled measurement.

## The honest sentence to use

> "Our clients rank in the top ten for the conversational queries AI assistants
> issue. We can show you the queries and the positions from their own Search
> Console. What we do not yet measure is whether a specific assistant named them
> in its answer, and we will not claim that until we do."

That is stronger than an unsupportable citation claim, because it survives the
follow up question. Claiming citations we cannot evidence is the one move that
loses a technical buyer permanently.

## What would close the gap

The openrush `inspect_ai_visibility` route measures named citations in Google AI
Overviews. It currently returns **402 Insufficient credits** on every call.
`discover_ai_citations` on the same server is the companion route. Both are
blocked pending a refill at openrush.com.

Note the coverage limit even once funded: that route covers Google AI Overview
only. It does not cover ChatGPT, Claude, Gemini, Perplexity or Copilot. Citation
measurement in those requires a different tool.

`inspect_serp` still works and reports whether an `ai_overview` feature is
present on a given query. Confirmed working 2026-09-15 on the query "fintech
founder peer advisory network new york". That is a real and useful fact, and it
is weaker than a citation count: it says Google is generating an AI answer for
the query, not that the client is in it.
