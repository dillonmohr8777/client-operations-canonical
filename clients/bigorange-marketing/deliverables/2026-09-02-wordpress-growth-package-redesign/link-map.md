# BigOrange builder blogs: link map for SEO, AEO and GEO

Status: private review draft, 2026-09-02. Applies to the five WordPress drafts (post IDs 5619, 5621, 5623, 5625, 5627) and the matching PDFs.

## The rule in one line

The builder hub owns the commercial intent. Each blog owns one narrower question, links up to the hub, across to one or two siblings only where the reader would actually click, and out to a primary source wherever a number or a rule is stated.

## Where each link type belongs

| Link type | Where it sits | Why it matters for SEO / AEO / GEO |
|---|---|---|
| Parent link to the builder hub (`/marketing-agency-for-builders/`) | Once in the first 150 words (the definition paragraph), once in the close | SEO: passes relevance to the commercial owner and prevents cannibalization. GEO: states the entity relationship (this article belongs to BigOrange's builder practice). |
| Booking link (`/book-appointment/`) | Close block only, as an invitation | Keeps the article an answer, not a funnel. One CTA per article keeps the direct-answer passage clean for answer engines. |
| Sibling blog links (blog to blog) | Inline, inside the section that raises the sibling's question, one or two per article | AEO: answer engines cite pages that resolve the next question; siblings extend the topical cluster without repeating it. Never a "related posts" dump. |
| External primary sources (Census, Google Search Central, Google Business Profile help) | Immediately after the sentence that uses the fact | GEO: citations to stable, authoritative sources are what generative engines look for when deciding whether a page is a safe source to quote. Keep the exact figure and date in the sentence. |
| Case study or proof pages on bigorange.marketing | Only where a claim is BigOrange's own result, and only after the claim is approved | Proof next to the claim; never a general "see our work". |
| Category and tag links | Category `Home Builders` only; no tags until the cluster is live | Avoid thin tag archives competing for the same query. |

## Current state of each blog

| Blog | Primary query | Internal links today | External links today | Add |
|---|---|---|---|---|
| 01 · 11 Home Builder Marketing Ideas | marketing ideas for homebuilders | Hub and booking in the close | Census (definition section), Google local ranking (idea 5), Google people-first content (idea 6) | Hub link in the definition paragraph. Sibling: idea 8 (email path) to Blog 03; idea 10 (qualified next step) to Blog 02's qualified-inquiry section. |
| 02 · Home Builder Advertising | advertising for builders | Hub and booking in the close | Census (intent section) | Hub link in the definition paragraph. Sibling: "Fix the destination" to Blog 01 idea 1 (decision stories); "Define a qualified inquiry" to Blog 03 follow-up 6 (sales feedback). |
| 03 · Marketing Automation | home builder marketing automation | Hub and booking in the close | Google people-first content (follow-up 3) | Hub link in the definition paragraph. Sibling: follow-up 3 (planning resource) to Blog 01 idea 2 (planning guide); "Measure help before volume" to Blog 02's measurement ladder. |
| 04 · Choosing Marketing Solutions | home builder marketing solutions | Hub and booking in the close | Google people-first content (foundation section) | Hub link in the definition paragraph. Sibling: "Ask providers these ten questions" to Blog 05; "Build one connected 90-day test" to Blog 02's operating rules. |
| 05 · When to Hire an Agency | custom home builder marketing agency | Hub and booking in the close | Google people-first content (plan section) | Hub link in the definition paragraph. Sibling: "Use a bounded first engagement" to Blog 04's 90-day test; "Know what the builder must still own" to Blog 03 follow-up 6. |

## Hub side

Add a clearly labeled "Builder resources" section on `/marketing-agency-for-builders/` with the five articles as descriptive-anchor links (the article title, not "read more"). That is the single place the hub points down; it keeps the hub the parent and the blogs the children.

## Anchor text

- Hub: "custom home builder marketing" or "the custom home builder marketing blueprint". Never "click here".
- Siblings: the sibling's actual question, e.g. "which follow-ups are worth automating".
- External: name the source and what it says, e.g. "Google's local ranking guidance", "the July 2026 Census new-home sales release".

## Schema and metadata notes

- `BlogPosting` with `isPartOf` the hub page and `about` the builder marketing topic; `BreadcrumbList` Home > Builders > Article.
- Canonical to the proposed slug. `index, follow` set at release, not while the post is private.
- FAQ blocks stay as visible content; FAQ schema is a semantic candidate only, no rich-result promise.

## Release gate

Links are verified in the rendered WordPress preview, not in the PDF: every internal target must be a published URL at release time, every external link opens in the same tab with `rel="noopener"` and no `nofollow` on primary sources.
