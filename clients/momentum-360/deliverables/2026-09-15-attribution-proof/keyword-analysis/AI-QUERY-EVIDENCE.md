# Evidence that client pages are being surfaced in AI driven search

Measured 2026-09-15 from Google Search Console, window 2026-01-13 to 2026-09-12,
across 53,392 page and query pairs on eight properties.

## What was measured

Every ranking query was classified by linguistic shape:

| Shape | Definition |
|---|---|
| persona_prompt | Begins "i am a" or "i'm a", or runs 25 words or longer |
| question | Contains a question mark |
| conversational | Opens with an interrogative or natural phrase, or runs 8 words or longer |
| keyword | Everything else, meaning ordinary typed search terms |

## The result

| Shape | Pairs | Impressions | Clicks | CTR | Avg position |
|---|---:|---:|---:|---:|---:|
| persona_prompt | 725 | 4,194 | 0 | 0.00% | 13.6 |
| question | 1,168 | 12,255 | 2 | 0.02% | 13.4 |
| conversational | 3,327 | 88,191 | 70 | 0.08% | 19.0 |
| keyword | 48,172 | 1,723,352 | 9,003 | 0.52% | 28.3 |

Two facts sit side by side here and they only reconcile one way.

1. AI shaped queries rank **better** than ordinary keywords, average position 13.4
   against 28.3.
2. They convert at **0.00 to 0.08 percent** against 0.52 percent.

Ranking higher and receiving no clicks is the signature of a machine reading the
page and answering on the searcher's behalf. A human who sees a result at
position 5 clicks it at a measurable rate. These do not.

The shapes themselves confirm the source. No person types a ninety word prompt
beginning "i am a chief human resources officer, my job seniority is at the
executive, vp, director or manager level" into a Google search box. That is a
model's own framing being issued as a search.

## Concentration by client

| Property | AI shaped pairs | AI impressions | Share of all impressions |
|---|---:|---:|---:|
| alignhcm.com | 1,721 | 15,967 | **26.9%** |
| barcrawlusa.com | 775 | 44,233 | 9.3% |
| bigorange.marketing | 2,663 | 43,624 | 3.4% |
| ami-cleaning.com | 22 | 438 | 7.0% |
| zenspatropicana.com | 27 | 346 | 3.4% |

Align HCM is the standout. More than a quarter of everything that property is
seen for in Google now arrives as an AI shaped query, and it holds top ten
positions on them.

## Examples, all at position 10 or better

| Position | Impressions | Property | Query |
|---:|---:|---|---|
| 2.1 | 155 | alignhcm.com | "i am a chief human resources officer..." (90 word persona prompt) |
| 3.1 | 528 | bigorange.marketing | is it where can i find expert help for ai driven search visibility? |
| 1.9 | 345 | barcrawlusa.com | what are some easy cocktails to prepare for halloween pregaming? |
| 4.3 | 271 | bigorange.marketing | how to find a marketing agency for msp? |
| 5.3 | 268 | alignhcm.com | what are the biggest mistakes companies make during hcm implementation? |
| 5.0 | 279 | barcrawlusa.com | what is a bar crawl? |
| 5.5 | 219 | alignhcm.com | how do i get the most from ukg? |
| 5.2 | 216 | alignhcm.com | does ukg connect with other systems? |

## What this does and does not prove

**It proves**, from the client's own Search Console property, that their pages
are ranking in the top ten for the conversational and persona framed queries that
answer engines issue, and that those appearances behave like machine reads rather
than human visits.

**It does not prove** a named citation inside a Google AI Overview, a ChatGPT
answer, a Perplexity answer or a Gemini answer. Search Console does not label
query source, so the attribution to AI rests on linguistic shape and the zero
click signature rather than on a source field. That inference is strong and it is
reproducible from the CSV, but it is an inference.

Measuring named citations needs a separate tool. The openrush
`inspect_ai_visibility` route is the one wired up for it and it currently returns
402 Insufficient credits, so that measurement is pending a refill.

## Files

- `AI-SHAPED-QUERIES.csv`, every AI shaped query with its page, position and impressions
- `ALL-PAGE-KEYWORDS.csv`, all 53,392 page and query pairs
- `PAGE-KEYWORDS.md`, readable breakdown by page and blog post
