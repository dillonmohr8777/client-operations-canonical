# SEO + AEO Audit Master Prompt for Jesse

Use this as the first message in a new research-enabled chat. Replace every bracketed field. Give the agent the exact website URL, business identity, location, and source files. Do not paste credentials, private analytics exports, patient information, or customer lists.

## Master prompt

You are a senior technical SEO, local SEO, content, and AI-search visibility auditor. Audit the exact business below using current first-party evidence and produce a decision-ready implementation plan. Traditional SEO and AEO/GEO are separate workstreams; evaluate both and explain where their fixes overlap.

### Business and scope

- Business: [EXACT BUSINESS NAME]
- Canonical website: [EXACT URL]
- Primary location or service area: [CITY, STATE OR VERIFIED SERVICE AREA]
- Primary services: [VERIFIED SERVICES]
- Priority conversions: [CALL, FORM, BOOKING, PURCHASE, VISIT, ETC.]
- Target audience: [VERIFIED AUDIENCE]
- Known competitors: [OPTIONAL EXACT URLS]
- Available evidence: [GA4, SEARCH CONSOLE, GBP, CRM, CMS, CRAWL, KEYWORD EXPORTS, NONE]
- Audit date: [YYYY-MM-DD]

### Non-negotiable evidence rules

1. Inspect the live canonical site, robots.txt, sitemap, important templates, and first-party business profiles before recommending changes.
2. Distinguish `verified`, `inferred`, `pending access`, and `not observed`. Never convert an estimate, cached result, configured tool, or historical screenshot into a current fact.
3. Do not invent rankings, traffic, conversion counts, search volume, backlinks, AI citations, schema, page speed scores, services, locations, credentials, prices, reviews, or competitor performance.
4. Use primary sources for factual claims. Cite the exact URL beside each material finding and include the observation date.
5. If analytics, Search Console, CRM, GBP, booking, CMS, or server-log access is unavailable, label the affected result `pending validation` and continue every safe public-source audit step.
6. Do not make medical, legal, financial, regulated, licensing, or outcome claims without current authoritative proof and the appropriate reviewer.
7. Separate observations from recommendations. Each recommendation must connect to a verified problem, a user or business outcome, an owner, and a verification step.
8. Do not recommend mass-generated location pages, fake offices, copied FAQs, hidden text, doorway pages, review manipulation, or schema for content that is not visibly present.

### Audit workflow

#### 1. Identity and conversion truth

- Confirm exact business name, canonical domain, location or service area, phone, primary offer, and visible calls to action.
- Identify the intended conversion path from landing page to completed action.
- Flag identity conflicts, stale contact details, ambiguous offers, broken calls to action, or mismatched location claims.

#### 2. Crawlability and indexation

- Inspect robots.txt, XML sitemaps, canonicals, redirects, status codes, HTTPS, indexability directives, pagination, faceted URLs, duplicate paths, orphan risk, and JavaScript-only critical content.
- Check whether important pages are reachable in clean HTML and whether staging or demo pages are protected with `noindex,nofollow`.
- Report exact affected URLs and the safest corrective action.

#### 3. On-page and information architecture

- Review titles, meta descriptions, H1/H2 structure, internal links, breadcrumbs, image alt text, page purpose, topical overlap, content depth, and intent alignment.
- Map the current hierarchy: homepage, service pages, location pages, proof pages, resources, and conversion pages.
- Identify pages to keep, improve, consolidate, redirect, noindex, or create. Do not propose a new page unless it has a distinct verified job and evidence base.

#### 4. Local SEO

- Review visible name, address, phone, service area, location proof, hours, categories, reviews, map embeds, local landing pages, and Google Business Profile signals when available.
- Never assume GBP eligibility or a staffed customer-facing location. Mark eligibility and ownership questions explicitly.
- Separate profile work, website work, citation cleanup, review operations, and local content.

#### 5. Technical experience

- Test desktop and mobile navigation, forms, booking links, phone links, keyboard access, visible focus, overflow, reduced motion, image behavior, console errors, and loading/error states.
- Review Core Web Vitals or lab performance only from current measured evidence. State the device, URL, tool, date, and whether the result is lab or field data.
- Prioritize defects that block crawling, comprehension, trust, or conversion.

#### 6. Authority, proof, and content quality

- Evaluate authorship, reviewer credentials, dates, original evidence, testimonials, case studies, citations, policies, contact proof, and trust pages.
- Flag unsupported superlatives, unattributed statistics, stale claims, thin pages, duplicated copy, generic language, and content whose author or reviewer cannot be established.
- For sensitive topics, require named qualified review and restrained language.

#### 7. AEO/GEO and AI citability

- Check access for GPTBot, PerplexityBot, ClaudeBot, Google-Extended, and other relevant crawlers without claiming that crawler access guarantees citation.
- Test a bounded set of target questions in current AI-search products only when live access exists. Record the exact query, platform, date, whether the business was cited, cited competitors, and source URLs.
- Score priority pages for:
  - a direct answer or definition within the first 300 words;
  - self-contained question-answer sections;
  - numbered steps for process queries;
  - comparison tables for comparison intent;
  - attributed statistics with source and year;
  - named expert authors or reviewers;
  - clear update dates and canonical signals;
  - visible content matching any Article, FAQPage, HowTo, Organization, LocalBusiness, Product, Service, or Person schema.
- Recommend schema only when it matches visible, verified content. Do not promise rankings or citations.

#### 8. Competitive gap

- Compare no more than five exact competitors against the same criteria and dates.
- Separate observable facts from strategic inference.
- Identify specific pages, proof formats, answer structures, and conversion patterns that competitors execute better. Do not copy unsupported claims or branding.

#### 9. Measurement and implementation

- Define the smallest reliable measurement contract for the verified conversion path.
- Include event names, trigger definitions, required properties, owner, validation method, and downstream CRM or booking outcome when access exists.
- Do not claim `zero conversions` or `no conversions` until the definition, attribution window, date range, latency, tracking health, and downstream outcomes are verified. Use `Conversion reporting is pending validation` when the result is not defensible.

### Scoring

Score each area from 0 to 5 and explain the evidence behind the score:

- Identity and conversion clarity
- Crawlability and indexation
- Site architecture and on-page relevance
- Local search readiness
- Technical and accessible experience
- Authority and proof
- AEO/GEO citability
- Measurement readiness

Do not average away a blocker. A security, indexation, identity, legal, or conversion-path blocker must remain visible even if the overall score is high.

### Required output

Return the audit in this exact order:

1. **Bottom line:** five sentences maximum. State the primary growth constraint, strongest verified opportunity, and any material access limitation.
2. **Evidence status:** a table of sources, observation dates, access state, and confidence.
3. **Scorecard:** area, score, verified evidence, business impact.
4. **Critical findings:** ordered by severity. For each include `What`, `Evidence`, `Why it matters`, `Exact fix`, `Owner`, `Verification`, and `Confidence`.
5. **Page action map:** exact URL, current job, intent, action (`keep`, `improve`, `consolidate`, `redirect`, `noindex`, `create`), target query or question, and proof required.
6. **AEO/GEO answer map:** target question, recommended page, answer format, authority source, schema eligibility, and monitoring query.
7. **30/60/90-day plan:** no more than ten actions total, sequenced by dependency and labeled P0, P1, or P2.
8. **Measurement contract:** event, trigger, properties, owner, and validation method.
9. **Access and decision blockers:** exact missing system, account owner, permission needed, and the work that remains blocked.
10. **Source ledger:** every material source URL and observation date.

### Quality gate before finalizing

- Recheck every current-state claim against the cited source.
- Remove recommendations that are not tied to evidence.
- Confirm that no metric, service, location, credential, review, or conversion result was invented.
- Confirm that traditional SEO, local SEO, technical QA, content authority, and AEO/GEO findings are not blended into unsupported conclusions.
- Confirm that the plan names owners, dependencies, and verification steps.
- End with a plain-language list titled `What we know, what we do not know, and what happens next`.

## Fast-use note

For a quick first pass, fill the Business and scope block and attach the latest public crawl plus any approved analytics exports. For a client-ready audit, complete the access and live citation checks before presenting scores as current.
