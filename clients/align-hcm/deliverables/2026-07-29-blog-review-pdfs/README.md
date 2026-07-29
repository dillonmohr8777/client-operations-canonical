# Align HCM Blog Review PDFs — VIB04, VIB06, VIB07, VIB08, VIB09

Five editorial-handoff articles rendered in the accepted Align HCM blog review-PDF
design. Created 2026-07-29.

## Deliverables

| # | Article | Keyword | Pages |
|---|---|---|---|
| 01 | HiBob Client-Side Implementation Partner vs. Vendor Services: Who Owns What? (VIB04) | HiBob client-side implementation partner | 7 |
| 02 | Best UKG Partner for Your Implementation? 12 Ways to Compare the Shortlist (VIB06) | best UKG partner | 8 |
| 03 | What Should Be Included in a UKG Implementation Partner Quote? (VIB07) | UKG implementation partner quote | 8 |
| 04 | UKG Pro Implementation Partner vs. UKG Ready: What Changes? (VIB08) | UKG Pro implementation partner | 7 |
| 05 | Best Dayforce Partner for Your Implementation: An RFP Scorecard (VIB09) | best Dayforce partner | 8 |

Each ships as two artifacts in `dist/`:

* `<name>.pdf` — A4 review PDF, the primary review artifact.
* `<name>.html` — fully self-contained single file (fonts and illustration inlined
  as data URIs). Opens anywhere with no network access.

## Design contract

**Reference (accepted):** the HiBob client-side vs. vendor services review PDF.
Every token below was measured out of that file rather than chosen, so the five
pages are visually interchangeable with it.

* **Surface:** A4 (594.96 × 841.92 pt), `@page margin: 15mm`, cream page field,
  content flush to the margin box. Rendered by headless Chromium, matching the
  reference's own producer.
* **Wordmark, not a logo:** the reference PDF's embedded logo artwork is a
  fabricated Align HCM mark, so it has been removed and no logo file is bundled
  with this package. The hero instead carries the typographic `alignHCM` wordmark
  the Align HCM editorial masters use in their own page headers — "align" in
  white, "HCM" in amber `#F7931D`, Plus Jakarta Sans ExtraBold at 19 px.
  **To drop in the approved logo:** put the file in `assets/`, then in each
  `src/*.html` replace `<div class="hero__wordmark">align<b>HCM</b></div>` with
  `<img class="hero__mark" src="../assets/<file>" alt="Align HCM">`. The
  `.hero__mark` rule already sizes it to the hero's 80 px slot.
* **Type:** Plus Jakarta Sans (display, labels, table headers), DM Sans (body),
  JetBrains Mono (slugs, URLs, inline code). Latin and latin-ext woff2 subsets are
  vendored in `assets/fonts/`.
* **Type scale** (calibrated by round-tripping candidate renders through
  `pdftotext -bbox` and matching glyph-run widths against the reference to within
  ±1%): body 12.3 px/1.713; H1 29 px/1.172 at −0.013em; H2 19 px at −0.012em;
  table header 10 px at +0.074em; table body 11.3 px; eyebrow 10 px at +0.213em.
* **Colour:** navy `#0A1628`, table-header gradient `#0F1D32 → #182A44`,
  orange `#FF6B2B → #F15B29`, cream `#FBF9F6`, peach `#FAEBE4`, teal `#2BB5A0`,
  body `#4A5568`, ink `#2D3748`, muted `#89909C`.
* **Components:** navy hero with corner glow / editorial-brief card /
  direct-answer callout / ruled H2 / numbered H3 / orange-dot and peach-badge
  lists / navy-header zebra tables / captioned figure / FAQ cards / navy
  conversion CTA / dashed publication-notes and sources blocks.

**Anti-references:** generic AI gradients and glass cards; any decoration not
present in the reference; invented or approximated logo artwork.

## Content provenance

Copy, tables, FAQs, publication notes, and sources are taken verbatim from the
boss-feedback-revision editorial handoffs. Titles, direct answers, metadata,
factual caveats, sources, and CTAs are preserved as the handoffs require.

Illustrations are the original 1200 × 627 Align HCM illustrations carried in each
handoff, extracted and converted to WebP (~210 KB each). Alt text is descriptive
and the source caption is retained.

Link targets use only URLs verified against the reference PDF's own link
annotations: `/services/client-side-services`, `/services/implementation`,
`/services/integration`, `/services/data-conversion`, `/services/training`,
`/services/support`, `/contact`, `/partners/hibob`, and `hibob.com/partner/`.
No URL was invented. The UKG and Dayforce source pages, and the Align HCM UKG,
Dayforce, buyer-guide, and case-study pages, had no URL in the handoffs, so those
sources print title-only with a production note telling the publisher to attach
each URL before launch.

## Build

```
python3 build.py            # all five: standalone HTML + PDF
python3 build.py 02         # one page
python3 build.py --no-pdf   # HTML only
```

`build.py` inlines `@import`, `url()`, and `src=` references from `src/` into
`dist/`, then prints each standalone file to PDF with Chromium. Editing `src/` or
`assets/review.css` and re-running is the whole loop.

## QA record

* Both the reference and each output were rendered to PNG and compared page by
  page at overview scale; glyph-run widths were compared numerically via
  `pdftotext -bbox`.
* Page counts: 7 / 8 / 8 / 7 / 8.
* No overflow, no orphaned heading, no split FAQ card, no split table row.
* Standalone HTML verified to have zero external references.
* Fill-in cells in the VIB06/VIB09 scorecards and the VIB07 side-by-side table are
  intentionally blank; they are worksheets in the source.
