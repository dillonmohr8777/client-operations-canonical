# August 2026 content calendar — revision log

## 0036 (from 0035)

Adds the Peco Foods case study as a fourth static case-study post on
**Tuesday, August 25**, an open weekday. Aug 25 spaces the case studies across
the month (6, 10, 17, 25) rather than doubling them up next to Aug 10 or Aug 17.

The calendar grows from 16 to 17 pages. Peco is page 13, directly after Mon
Aug 24, and the four pages after it were renumbered 14 through 17.

Page 1 was updated to match:

* Aug 25 is promoted from an unscheduled weekday to a posting day, with the
  peach cell tint, the post title, and the `Static case study` type label.
* The slate summary now reads *sixteen posts* and *four static case studies*.

`build/build-peco-page.py` reproduces the change from 0035. The page is built by
cloning the design chrome from the GTAA page, stripping its glyphs, and redrawing
the Peco content in the calendar's own typefaces. Those were identified by
matching measured glyph advances against the original: **Plus Jakarta Sans 800**
for display headlines, **Plus Jakarta Sans 700** for letterspaced caps and grid
titles, **DM Sans 400** for body and footers, **DM Sans 500** for grid type
labels, and **DM Sans 700** for the semibold HEADLINE row. Every other page was
diffed against 0034 and is unchanged apart from the renumbered footers.

### Confirm before scheduling

* The first-comment link points at `alignhcm.com/case-studies` because the
  Peco story's own slug is not recorded anywhere in this repository. The other
  three case-study posts use a specific deep link, so Peco should too.
* Copy figures were taken from the supplied one-pager: 7,000 employees, three
  states, three unions, under six months.

### Still open after 0036

* **Maher video consolidation** and the **industries video** remain unaddressed.
  Both are blocked on source assets that are not in this repository. Cutting the
  three Maher posts and swapping the industries video in for the Aug 19 SmartCare
  post will change the slate counts on page 1 again.
* Pre-existing in 0034 and not touched here: on page 1 the closing line
  *"Nothing is scheduled or published from this document without approval."*
  collides with the footer rule. It needs a fix in the source HTML.

## 0035 (from 0034)

Case-study artwork swap. The three static case-study pages now carry the
approved published one-pagers instead of the earlier in-progress designs.

| Page | Post | Date | Artwork now in place |
|---|---|---|---|
| 4 | GTAA: 12 Priority WFM Needs in Six Months | Thu Aug 6 | `case-study-statics/gtaa-12-priority-needs.jpeg` |
| 6 | Beumer: Seven Years of HR Data, Preserved | Mon Aug 10 | `case-study-statics/beumer-seven-years-hr-history.jpeg` |
| 9 | Troon: HCM Stability at Global Scale | Mon Aug 17 | `case-study-statics/troon-one-workforce-standard.jpeg` |

Replacement was done in place against the existing image frames
(`310.5, 130.7, 538.6, 536.9` pt, 9:16), so page layout, post copy, and
pagination are unchanged. The supplied artwork is 576x1024, which matches
the frame aspect ratio exactly.

Post copy was checked against the new artwork on all three pages and the
figures agree — 1,700+ / 12 / 6 mo for GTAA, 7 yrs / 1,000 / 2 for Beumer,
30,000 / 900+ / 35+ for Troon. No copy edits were needed.

### Open items not addressed in 0035

* **Peco Foods one-pager** — `case-study-statics/peco-foods-practice-that-holds.jpeg`
  is staged here but is not placed in the calendar. The August slate carries
  exactly three static case-study posts (Aug 6, Aug 10, Aug 17), all three of
  which were already spoken for by GTAA, Beumer, and Troon. Placing Peco needs
  a slate decision: a new posting day, or a swap against an existing post.
* **Resolution** — the supplied files are 576x1024 screenshots, about 182 dpi
  inside the calendar frame. That reads cleanly on screen for review and
  approval. The full-resolution exports are still the assets to publish, and
  should replace these before anything is scheduled.
* **Maher video consolidation** and the **industries video** are tracked
  separately; neither is reflected in 0035.
