# BigOrange Builder Authority Content Standard

Prepared: August 28, 2026  
Applies to: HUB-01 through CONSULT-01  
State: implementation contract for local review drafts; not publication approval

## One owner per reader job

The 62-query ledger resolves to 19 owned URLs and four rejected queries. A keyword variation does not earn a new page by itself. Each URL must answer a distinct reader job, use one self-canonical, and link to the central commercial hub at `/marketing-agency-for-builders/` when the relationship is relevant.

## AEO and GEO structure

Every production draft must:

1. Answer its main question within the first 100 words.
2. Use a definition, decision table, comparison, checklist, or five-to-eight-step sequence that can stand alone when excerpted.
3. Attribute time-sensitive facts to a named source and date.
4. Separate firsthand BigOrange or SME experience from general guidance.
5. Use five visible FAQs only when they add distinct reader value.
6. Keep the FAQ wording and `FAQPage` candidate identical.
7. Identify the intended author or reviewer before release.
8. Avoid promises of rankings, traffic, leads, revenue, rich results, featured snippets, or AI-answer citations.

Google's current guidance treats AEO and GEO as part of the broader search experience. The controllable foundation remains useful original content, crawlability, indexability, clear technical structure, strong images or video, and a satisfying page for human visitors. An `llms.txt` file or special AI-only markup is not required for Google Search.

## Traditional SEO structure

Each URL requires:

- a title tag no longer than 60 characters;
- a 150-to-160-character meta description;
- one H1;
- descriptive H2s;
- a short self-canonical URL;
- natural use of the primary topic in the title, opening, and useful sections;
- reciprocal internal links based on reader need;
- approved image guidance and accurate alt text;
- an indexation and sitemap decision;
- a page owner, review date, and refresh trigger.

Keyword stuffing, copied city pages, thin query variants, unsupported comparisons, and near-duplicate service pages are blocked.

## Source and claim rules

- Interview-derived language with permission `?` remains `[JANICE REVIEW REQUIRED]` and non-public.
- The anonymized Homearama example may be paraphrased, but its visitor estimate, client identity, timeframe, and any outcome still require independent evidence and approval.
- Current platform behavior must cite current first-party documentation.
- Statistics require the original publisher, date, scope, and a direct link.
- BigOrange service, pricing, award, testimonial, client, and performance statements must match a current approved source.
- CONSULT-01 cannot become a public service page until leadership defines a distinct consulting offer, scope, sales path, and commercial terms.

## Structured data

Use one candidate graph per URL and reconcile it with existing WordPress or SEO-plugin output before installation.

- `Article` is the default editorial type.
- `FAQPage` is allowed only when all questions and answers are visible and exactly match the markup.
- `Service`, `ItemList`, `HowTo`, `VideoObject`, `Dataset`, ratings, reviews, and products are withheld unless the visible page and underlying evidence fully support them.
- Organization and breadcrumb objects should be emitted once through the site's established schema graph, not duplicated in every editor block.
- Schema is a machine-readable description, not a promise of a search feature.

## Release states

1. **Complete local review draft:** copy, metadata, sources, links, FAQs, schema candidate, image direction, and approval notes exist.
2. **Factual review approved:** named SME or owner has approved the exact statements and permission state.
3. **Leadership approved:** audience, offer, positioning, proof, CTA, imagery, ownership, and exact revision are approved.
4. **Staged and technically verified:** metadata, canonical, breadcrumbs, schema, links, sitemap behavior, analytics, CRM, accessibility, performance, forms, and rollback state pass.
5. **Publication approved:** the exact staged revision has explicit approval.
6. **Live and receipt-verified:** the public URL and rendered state have been rechecked after release.

No earlier state may be described as published or live.

## Primary implementation references

- Google Search, generative AI optimization: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- Google Search, helpful content: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Google Search, structured data policies: https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- Google Search, canonicalization: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- Google Business Profile, local ranking factors: https://support.google.com/business/answer/7091
- OpenAI crawler controls: https://developers.openai.com/api/docs/bots
- Perplexity crawler controls: https://docs.perplexity.ai/docs/resources/perplexity-crawlers
- FTC endorsement and review guidance: https://www.ftc.gov/business-guidance/advertising-marketing/endorsements-influencers-reviews
