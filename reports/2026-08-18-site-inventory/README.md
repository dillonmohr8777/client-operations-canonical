# Rebuilt-site inventory and radar diagnosis — 2026-08-18

Three questions were asked: how many sites have we actually built, why did the
radar find nothing today, and what is missing from the dashboard. They turned
out to be the same question.

## What we have built

**238 site pages. 236 distinct businesses.** Two businesses were built twice by
two different lanes — Johnny's Pizza (w33 and next15) and THR Insurance (w33 and
next15). That duplication is a symptom of the radar problem below, not a
coincidence.

| | |
|---|---:|
| Site pages built | 238 |
| Distinct businesses | 236 |
| Cleared to show on a call | 100 |
| **Not** cleared to show | 138 |
| With a verified public email | 69 |
| Phone / contact-form only | 169 |

The working belief was ~270–275 and that they were "basically all QA ready."
Neither holds against the source data:

- **238, not 275.** Every build I can evidence is here. Anything built after
  2026-08-11 lives only in gitignored `automation/*/runs/` receipts on the build
  machine and on Netlify — neither reachable from this session. If the real
  number is nearer 275, this file is short by that difference, and exporting the
  Netlify site list will close it.
- **100 of 238 are cleared to show**, not all of them. That is the call sheet's
  own 2026-08-16 QA verdict, not a new judgement.

The URL that prompted this — `haoqi-radar-craft.netlify.app/benjamin-lovell-shoes/`
— is a **newer deploy of an existing site**, not the radar dashboard. Benjamin
Lovell Shoes is row 102, batch `phl-2026-w33`, and the call sheet still points at
the `momentum-prospect-radar-next20-2026-08-11` host. So at least some sites have
been redeployed to a host the sheet does not know about.

## What is actually wrong with the 138

They are not 138 broken sites. They are four different problems, and only one is
a defect in a finished page:

| Count | Problem | What it really is |
|---:|---|---|
| 69 | Never design-reviewed | **Not a defect.** Built, looks finished, just never went through the QA pass the original 100 had. A review backlog. |
| 47 | Placeholder concept | Held at `qa_ready=hold` because no verified first-party source or address was found at build time. All 47 share one unfinished hero. Working as designed — they were never meant to be shown. Supply the source and rebuild, or drop them. |
| 20 | Renders black without `?forcegl` | **A real production bug.** A prospect opening the bare URL sees a black page. The WebGL fallback needs fixing in the builder. |
| 1 | No photography | Dutton Road Veterinary Clinic. |
| 1 | Hero art is generated | Always Dental Care — the hero is not a real photograph of the business. |

The 20 `?forcegl` pages are the ones worth fixing first: they are finished,
designed pages that are simply broken for anyone who opens the plain link.

## Why the radar found nothing today

The 2026-08-18 sweep reported `Found 0 new today, re-audited 0` and produced a
brief byte-identical to 2026-08-17 apart from the date. **The sweep was not
broken.** It ran, returned `status: ok`, and had nothing to do. Four causes:

1. **It did not know what it had built.** `philly-100-completed.json` froze on
   2026-08-05, so the 138 later builds were invisible, and the exclusion it did
   carry only applied at discovery — rows already in the registry kept
   `verdict: rebuild` forever. **104 already-built businesses were still live
   rebuild targets, and 9 of the 15 top suggestions in that morning's brief were
   businesses whose new homepage was already live.** This is also why two
   businesses got built twice.

2. **Discovery queried the same cells every morning.** The planner took the top
   3 verticals by deficit and nothing else; deficits move slowly, so the same
   groups hit the same areas daily and Overpass returned the same businesses —
   `144 raw → 0 new`. On 2026-08-18 only `home-services` and `industrial` had a
   positive deficit at all, so six of the eight vertical groups were never
   queried anywhere.

3. **The recheck schedule was a cliff, not a schedule.** 700 rows were seeded and
   graded on one morning, so every `polish` row took the same flat 90 days and
   landed on the same date: 333 due on 2026-11-04, 214 on 11-05, and *nothing*
   due between 08-18 and 08-20.

4. **An idle sweep did nothing** while 568 rows carried a provisional Tier 0
   grade — markup only, never rendered — including 144 with a `rebuild` verdict
   that has never been checked against a rendered page.

### Fixed in dillon-os PR #319

| | before | after |
|---|---:|---:|
| Already-built businesses live as rebuild targets | 104 | 0 |
| Top-15 suggestions already built | 9 | 0 |
| `queued_build` | 181 | 82 |
| Rebuild queue | 188 | 88 |
| Rows the sweep would grade today | 0 | 250 |
| Worst single-day recheck cohort | 333 | 27 |

`lib/radar.js` has always docked 40 priority points for `lifecycle === 'built'`.
Nothing ever set that lifecycle, so the de-rank was unreachable code. The new
`lib/built-sites.js` supplies the missing input.

## What else the dashboard needed

- **A "Rebuilt by us" tab (104).** The shipped portfolio was completely absent
  from the page that is supposed to show the state of the pipeline.
- **An "Unrendered" tab (478).** "Needs render" only counted `verdict: verify`,
  so it read **0** while 568 rows had never been rendered. That number was
  misleading, not empty.
- **Built rows hidden from the working queues**, so the queue you work from is
  the work that is left.
- **Per-row build provenance** — which concept we built, its batch, and whether
  it is cleared to show. The 47 placeholders and the 20 `?forcegl` pages are now
  called out on the row rather than left for someone to find mid-screenshare.

## Files here

| File | What it is |
|---|---|
| `built-sites.json` | All 238, every field, **including verified phone and email** (this repo is private). |
| `built-sites.csv` | The same as a flat table. |
| `Momentum360-Outreach-Workbook.xlsx` | Six-tab workbook: START HERE, CALL LIST, EMAIL LIST, FIX QUEUE, MASTER, BATCHES. Drop it into Drive to get it as one multi-tab Google Sheet. |

The stripped copy in dillon-os
(`_os/automation/fixtures/prospects/momentum-built-sites.json`) carries a
`has_public_email` flag only — no phone, email or address — because it feeds the
published dashboard.

### Live in Drive

[Momentum 360 — Outreach Workbook 2026-08-18](https://drive.google.com/drive/folders/1udVXudaELnUAodM-VJbrML40FUb9E7z1)
— START HERE, CALL LIST (100), EMAIL LIST (69), FIX QUEUE (138), BATCHES.
CALL LIST + FIX QUEUE together are all 238 rows.

The original sheet, *Momentum 360 - 238 Call-Ready Businesses - 2026-08-13*, was
left untouched — Jesse is calling from it, and the Drive connector available here
can only create files, not edit cells in an existing one.

## Caveats

- Every page is a private noindex concept. Call-ready is not client-approved
  production design.
- The call sheet's "Phone Source" column is a *phone verification* source — an
  NPI lookup, a dental directory, a state site — and frequently is **not** the
  business's own domain. Domains here were resolved against the radar registry
  instead. 14 businesses have no site of their own at all; their only located
  source was a directory listing.
- 111 of the 238 appear in the radar registry. The other 127 — mostly the
  original 100 — came from the completed-100 sheet and were never discovered by
  the radar, so they carry no site score.
