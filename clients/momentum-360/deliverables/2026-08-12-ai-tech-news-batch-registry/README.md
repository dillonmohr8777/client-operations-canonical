# AI Tech News site batch registry

Date: 2026-08-12 ET  
Client: `momentum-360`  
Program: AI Tech News / AI Site Builder Outreach Engine  
Status: organized and live checked; outreach remains on hold

## Current truth

The recent work produced **283 route artifacts**, but that is not 283 separate
prospects. After grouping replacements and duplicates by business slug, the
inventory contains **245 unique businesses**.

Of those businesses:

- **109 are currently QA ready** across the curated historical set, Week 33,
  and the ready portion of Week 34;
- **136 are held or removed from the current ready pool**;
- **0 are mail ready**.

The machine-readable source of truth for this reconciliation is
`batch-registry.json`. The row-level working database is `site-inventory.csv`.

## Batch map

| Surface | Raw sites | Unique impact | QA state | Outreach state | Role |
| --- | ---: | ---: | --- | --- | --- |
| Historical lineage through build 233 | 233 | 208 unique businesses | 73 curated ready, 160 held or removed | hold | Archive and source lineage |
| `phl-2026-w33` | 25 | 16 net new, 9 prior-business replacements | 25 ready | hold | Current review batch |
| `phl-2026-w34` | 25 | 21 net new, 4 prior-business replacements | 14 ready, 11 held | hold | Current next review batch |
| Reconciled inventory | 283 artifacts | 245 unique businesses | 109 ready, 136 held | 0 ready | Canonical working list |

## Live review surfaces

- Historical hub: https://momentum-prospect-radar-next20-2026-08-11.netlify.app
- Week 33 hub: https://phl-2026-w33.netlify.app
- Week 34 hub: https://phl-2026-w34.netlify.app

All three roots returned HTTP 200 and retained `noindex` during the current
readback. The historical hub still displays 233 cards while the current curated
manifest contains 73 ready routes. The 73 current manifest routes themselves
passed the live route, map, directions, and `noindex` checks, but the card-list
drift means the 233-card hub is an archive index, not the ready-for-outreach
list.

## Pull request map

- PR 278 is the Week 33 precursor build and is superseded for review by PR 281.
- PR 279 is the separate Week 33 Netlify batch-deploy workflow.
- PR 281 is the authoritative Week 33 revision: 25 of 25 QA ready.
- PR 282 is the merged audit engine. It is infrastructure, not another batch.
- PR 283 is Week 34: 14 of 25 QA ready and 11 held.

This map prevents the same Week 33 sites from being counted once for the build,
again for the deployment workflow, and again for the QA revision.

## Operating rule

Use one row per business from `site-inventory.csv`. A later verified batch may
supersede an earlier version of the same slug, but the row retains its occurrence
count and source batches. QA readiness and outreach approval remain separate.

The next safe sequence is:

1. Review the 109 QA-ready businesses from the inventory rather than the raw
   hub count.
2. Select the first approved 25 prospects and verify their business, contact,
   website, SEO and AEO, and social evidence.
3. Confirm the grade threshold, sequence copy, channel ownership, Jesse handoff,
   and proposal and contract route.
4. Change `mail_ready` only for the exact approved rows. No automatic outreach
   begins from this registry.

## Regeneration

Run `Build-SiteBatchRegistry.ps1` after fetching the current `dillon-os` refs for
PR 281 and PR 283. It reads the current curated and held manifests, reconciles
business slugs, checks the three hub roots, and rewrites the JSON and CSV as
BOM-free UTF-8.
