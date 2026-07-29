# Align HCM Blog Review PDFs — VIB04, VIB06–VIB09, DF01–DF05

All ten editorial handoffs rendered in the accepted Align HCM blog review-PDF
design. Created 2026-07-29.

## Deliverables

| # | Article | Keyword | Pages |
|---|---|---|---|
| 01 | HiBob Client-Side Implementation Partner vs. Vendor Services: Who Owns What? (VIB04) | HiBob client-side implementation partner | 7 |
| 02 | Best UKG Partner for Your Implementation? 12 Ways to Compare the Shortlist (VIB06) | best UKG partner | 8 |
| 03 | What Should Be Included in a UKG Implementation Partner Quote? (VIB07) | UKG implementation partner quote | 8 |
| 04 | UKG Pro Implementation Partner vs. UKG Ready: What Changes? (VIB08) | UKG Pro implementation partner | 7 |
| 05 | Best Dayforce Partner for Your Implementation: An RFP Scorecard (VIB09) | best Dayforce partner | 8 |
| 06 | Dayforce Implementation Cost: 12 Quote Drivers to Normalize (DF01) | Dayforce implementation cost | 8 |
| 07 | Dayforce Parallel Testing: A Payroll Go-Live Checklist (DF02) | Dayforce parallel testing | 10 |
| 08 | Dayforce Data Migration Checklist: Clean, Map, Reconcile (DF03) | Dayforce data migration | 10 |
| 09 | Dayforce Integration Partner Scope: 15 Questions Before You Build (DF04) | Dayforce integration partner | 10 |
| 10 | Dayforce Public Sector Implementation: An RFP Readiness Checklist (DF05) | Dayforce public sector implementation | 13 |

Handoffs 01–05 are the VIB series; 06–10 are the Dayforce implementation-readiness
series (DF01–DF05).

Each ships as two artifacts in `dist/`:

* `<name>.pdf` — A4 review PDF, the primary review artifact.
* `<name>.html` — fully self-contained single file (fonts and illustration inlined
  as data URIs). Opens anywhere with no network access.

## Design contract

**Reference (accepted):** the HiBob client-side vs. vendor services review PDF.
Every token below was measured out of that file rather than chosen, so all ten
pages are visually interchangeable with it.

* **Surface:** A4 (594.96 × 841.92 pt), `@page margin: 15mm`, cream page field,
  content flush to the margin box. Rendered by headless Chromium, matching the
  reference's own producer.
* **Logo:** the approved Align HCM logo, taken from the supplied master
  (`IMG_4143`) and cut out of its blue gradient background by colour unmixing —
  a per-pixel background model plus a two-colour (white / orange) foreground
  solve, so the alpha channel carries real antialiasing rather than a hard key.
  Placed at 130 px wide on the navy hero. It is light-on-dark artwork and is only
  used there.
  *Correction to an earlier note in this file: the mark embedded in the reference
  PDF was the genuine logo at 300 x 150, not fabricated artwork. It looked wrong
  because of its resolution.*
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
present in the reference; approximated or re-traced logo artwork.

## Readability

Type and colour were raised above the reference's own values on the client's
instruction that the copy read easily in print:

* Body 13.6 px / 1.72 (reference: 12.3 px / 1.71); direct answer 14.1 px;
  H2 20.5 px; table body 12.5 px; FAQ answers 12.8 px.
* Body text darkened to `#2D3748` and secondary text to `#5A6472`.
* Links use a dedicated `--link: #C24216` rather than the brand orange, because
  the brand orange only reaches 3.19:1 on cream — below AA for body-size text.
  Brand orange is retained for rules, bullets, and badge fills, where 3:1 applies.

Every text/background pair was checked against WCAG 2.1 AA and recorded in the
QA section below.

## Content provenance

Copy, tables, FAQs, publication notes, and sources are taken verbatim from the
boss-feedback-revision editorial handoffs. Titles, direct answers, metadata,
factual caveats, sources, and CTAs are preserved as the handoffs require.

Illustrations for articles 01–05 are the client-supplied originals, downsampled to
the 1200 × 627 production spec the handoffs call for and encoded as WebP. Alt text
is descriptive and the source caption is retained.

Articles 06, 08, 09, and 10 carry client-supplied artwork on the same terms. Each
was matched to its article by the "Recommended visual" its handoff names: a
quote-normalization comparison for DF01, a source-to-signoff conversion pipeline
for DF03, a hub-and-spoke integration map for DF04, and a weighted readiness grid
for DF05.

Article 07 (DF02, payroll parallel testing) carries **no figure**. No artwork has
been supplied for it, so its publication notes reproduce the recommended visual —
a pay-group testing flow through variance ownership, retest, and go-live signoff —
alongside an explicit statement that no artwork was supplied. Nothing was
generated to fill the gap. When artwork arrives, drop a 1200 × 627 WebP into
`assets/` as `illustration-07.webp` and add a `<figure>` block matching the
pattern in the other nine articles.

Link targets use only URLs verified against the reference PDF's own link
annotations: `/services/client-side-services`, `/services/implementation`,
`/services/integration`, `/services/data-conversion`, `/services/training`,
`/services/support`, `/contact`, `/partners/hibob`, and `hibob.com/partner/`.
No URL was invented. The UKG, Dayforce, and Government of Canada source pages, and
the Align HCM UKG, Dayforce, buyer-guide, and case-study pages, had no URL in the
handoffs, so those sources print title-only with a production note telling the
publisher to attach each URL before launch.

## Research sources

Each article carries two or three peer-reviewed or published research citations,
linked inline where they support a claim the copy already makes, and listed with
full references in a closing "Research sources" block. The set:

| Work | Used in |
|---|---|
| Umble, Haft & Umble (2003), *Eur. J. Operational Research* — ERP critical success factors | 01, 02, 04, 05, 06, 07, 08, 09 |
| Wang & Strong (1996), *J. Management Information Systems* — data-quality dimensions | 07, 08, 09 |
| Venkatesh et al. (2003), *MIS Quarterly* — UTAUT technology acceptance | 04 |
| Flyvbjerg & Budzier (2011), *Harvard Business Review* — IT cost-overrun distribution | 03, 06, 10 |
| Jadhav & Sonar (2009), *Information & Software Technology* — software package selection | 02, 03, 05 |
| Abu Madi, Ayoubi & Alzbaidi (2024), *Int. J. Public Administration* — public-sector ERP CSFs | 10 |
| Oreg, Vakola & Armenakis (2011), *J. Applied Behavioral Science* — reactions to change | 01, 10 |

No citation asserts anything beyond what the paper reports, and none replaces a
vendor-sourced claim from the handoffs.

## Build

```
python3 build.py            # all ten: standalone HTML + PDF
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
* Page counts: 9 / 9 / 10 / 8 / 9 / 10 / 11 / 12 / 12 / 15 (larger type).
* No overflow, no orphaned heading, no split FAQ card, no split table row.
* Standalone HTML verified to have zero external references.
* WCAG 2.1 AA contrast verified by computation, not by eye. Lowest passing pair
  is the numbered-list badge at 5.22:1 on peach; body text is 11.41:1 on cream.
* Every cited DOI was resolved over the network and confirmed to land on the
  named article. Publisher 403s from Taylor & Francis, SAGE, and misq.umn.edu are
  bot blocks at the destination, not broken links — the redirect targets were
  checked individually.
* Fill-in cells in the VIB06/VIB09/DF05 scorecards and the VIB07/DF01/DF02
  comparison tables are intentionally blank; they are worksheets in the source.
