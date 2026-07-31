# Align HCM — July 2026 Growth &amp; Attribution Report

Static site source for the president-level July 2026 growth report.
Deployed at `align-hcm-july-2026-growth-report.netlify.app`.

Three files, no build step, no dependencies: `index.html`, `styles.css`, `app.js`.
Deploy by publishing this directory as-is.

## What changed in the redesign

**Removed duplicated sections.** The previous version told the same story more
than once:

| Removed | Why |
|---|---|
| `#rank-one` "Fifteen number-one rankings" | Duplicate of `#top-rankings`; both introduced the same 15 queries. Merged into one `#number-one` section. |
| `#ai-query-ledger` | Duplicate of `#ai-overviews`; the 11 AI Overview queries were listed twice, then illustrated with the same screenshots again. Merged. |
| `#signals` "Four proof sources" | Restated the hero and ribbon numbers with no new information. |
| `#authority` dark section | One flat stat (Authority Score 25, unchanged). Folded into the keyword section and methodology. |
| `#blogs` standalone section | Folded into `#keywords` as a sub-stat row. |
| `#content-performance` page-views table | Cut — page views are not a leadership metric. |
| Marquee metric ribbon | Every metric was duplicated in the DOM to fake the scroll loop. Replaced with a static four-up stat grid. |

**Fixed the blurry screenshots.** The old CSS rendered 1265px-wide captures into
~600px two-column grid cells with `object-fit: cover`, which both downscaled the
text to ~0.47x and cropped the bottom off every image. Now:

- `assets/aio/` holds crops of the AI Overview answer block only, so the answer
  text is the content instead of 60% dead whitespace.
- `assets/serp/` holds the full search result, de-scrollbarred, for the lightbox.
- Nothing uses `object-fit: cover`. Captures are never cropped by CSS.
- Answer text renders at **1.0x–1.6x of Google's own pixels at every breakpoint**
  (verified 320px / 390px / 820px / 1400px). On phones the card pans
  horizontally rather than shrinking the text; the page itself never scrolls
  sideways.
- Any capture opens in a lightbox with a Fit / Full-size toggle that renders at
  native 1182px with panning.

**Trimmed and reordered.** Leads and attribution now lead the report, then
ranking keywords, then AI Overviews as the closing proof layer. Section count is
down from 12 to 6.

## Screenshot provenance and audit

`assets/original/` holds the 18 untouched July 31 captures (1265x712, JPEG data
with `.png` extensions as delivered). Everything in `assets/aio/` and
`assets/serp/` is derived from these by cropping — no upscaling from a smaller
original, and no resampling that invents detail. The one scaling operation is a
1.6x Lanczos enlargement of the already-cropped answer block for the `aio/`
variants, so that desktop renders above native instead of below it.

Each original was reviewed before being used as evidence. What they actually
show:

| Capture | AI Overview | Align HCM visible | Used as |
|---|---|---|---|
| `rank-one-01-align-hcm` | none | **yes** — #1 + knowledge panel | featured brand capture |
| `rank-one-02-align-human-capital-management` | none | **yes** — #1 + knowledge panel | rank list |
| `rank-one-13-ukg-pro-implementation-partner` | yes | **yes** — named in the answer text | AI Overview hero |
| `google-ai-overview-2` (= `rank-one-10`) | yes | **yes** — source pill in the answer | AI Overview, featured |
| `google-ai-overview-1` | yes | yes — #1 organic below the answer | AI Overview grid |
| `google-ai-overview-3` | yes | yes — #1 organic below the answer | AI Overview grid |
| `rank-one-03-common-challenges-in-hcm-implementation` | yes | no | AI Overview grid |
| `rank-one-05-data-conversion-migration` | yes | no | AI Overview grid |
| `rank-one-09-implementing-workday` | yes | no | AI Overview grid |
| `rank-one-14-ukg-pro-vs-ukg-ready` | yes | no | AI Overview grid |
| `rank-one-15-ukg-ready-vs-ukg-pro` | yes | no | rank list (near-identical to 14) |
| `rank-one-12-paylocity-payroll-cost` | yes | no | rank list |
| `rank-one-07-hcm-services-m-a` | partial (mid-render) | no | AI Overview grid, labeled as partial |
| `rank-one-06-data-conversion-strategy` | partial | yes | **unused** — `google-ai-overview-3` is the same query, fully rendered |
| `rank-one-08-hr-data-integration-services` | partial | yes | **unused** — `google-ai-overview-1` is the same query, fully rendered |
| `rank-one-04-common-challenges-with-hcm-implementation` | **no — "Searching…" skeleton** | no | **unused**, labeled "no clean capture" |
| `rank-one-11-paylocity-implementation-checklist` | **no — empty container** | no | **unused**, labeled "no clean capture" |

Two corrections to how the previous version presented these, both carried into
the copy:

1. The old page stamped a large green `#1` on all 15 rank captures, implying each
   screenshot proved a #1 position. Most do not — 9 of the 15 show a competitor
   or vendor page in the visible first result. The #1 claim belongs to the
   Semrush export; the captures are a separate live check. Both are now stated
   separately, with the honest count (6 of 15 show Align in the visible result
   area).
2. The old AI Overview gallery relabeled rank-one screenshots as "AI Overview"
   evidence, including `rank-one-04`, which caught Google mid-load and shows no
   AI Overview at all. Only genuinely rendered AI Overviews are shown now, and
   the one mid-render capture is badged as such.

Nine captures cover 10 of the 11 tracked AI Overview queries — two captures each
serve a matched query pair (`ukg pro vs ukg ready` / `ukg ready vs ukg pro`, and
the two `common challenges … hcm implementation` variants). The eleventh,
`paylocity implementation checklist`, returned an empty AI Overview container, so
no capture is shown for it.

Google was unreachable from the build environment, so nothing could be
re-captured; every screenshot here is one of the original July 31 files.

## Verified behaviour

Checked with Playwright at 320 / 390 / 820 / 1400px:

- No horizontal page overflow at any width.
- No broken images, no console or page errors.
- All `.reveal` elements resolve to `opacity: 1`. The reveal is scroll-position
  driven, not `IntersectionObserver` — a fast flick or jump-link could outrun
  observer callbacks and leave a panel stuck invisible, which is unacceptable
  when the content is the deliverable. There is also an 8s failsafe, and the
  whole effect is skipped under `prefers-reduced-motion`.
- Lightbox: opens, focuses close, locks background scroll, Fit/Full-size toggle
  reaches native 1182px with panning on mobile, prev/next and arrow keys move
  between all 13 captures, Escape closes and restores scroll and focus.
- Tap targets are at least 38px tall.
- Body text meets WCAG AA (4.5:1) on both the white and warm backgrounds.
- Fully readable with JavaScript disabled; print stylesheet included.

## Data shown

Sourced from the July Semrush export, HubSpot (deterministic source capture live
since July 17) and LinkedIn analytics.

- 436 tracked keyword positions, 362 distinct queries, 58 ranking URLs
- Position tiers: 24 / 39 / 76 / 209 / 436 (Top 3 / 5 / 10 / 25 / 100)
- Blog tiers: 17 / 24 / 44 / 118 / 211 across 180 distinct queries
- 15 distinct queries at position #1
- 11 distinct AI Overview queries, de-duplicated from 14 export rows
- Semrush Authority Score 25, unchanged
- Traffic +51.2% year to date
- Leads: 6 native (4 organic + 2 AI) corrected to 9 (6 organic + 3 AI)
- 2 Google-origin and 1 ChatGPT-origin lead recovered from Direct; the ChatGPT
  record is the first identified AI-sourced deal
- Organic contact-to-deal 25% (5/20) vs Direct 5.6% (7/124) = 4.5x
- $54K verified organic win — the only verified currency figure in the report
- LinkedIn 216K annualized pace (110K Maher + 106K Align HCM), ~+70%

`$54K` is the only currency figure. No pipeline or forecast value is implied
anywhere. The page carries `noindex, nofollow` and contains no PII.
