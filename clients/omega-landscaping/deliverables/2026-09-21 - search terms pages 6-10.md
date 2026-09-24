# Omega Landscaping — search terms, pages 6-10

**Status: findings only. No negative was applied. No campaign was changed.**

| | |
|---|---|
| Client | omega-landscaping (canonical registry) |
| Account | Google Ads CID 2853981364 (285-398-1364), queried DIRECT per ACCOUNT-RULES.md |
| Run date | 2026-09-21 (weekly cadence, second invocation of the day; pages 1-5 ran 06:55 EDT) |
| Pages this run | **6-10**, ranks 101-200 of 363 terms, sorted by cost desc, impressions desc, term |
| **Next run resumes at** | **page 11 (ranks 201-220)** |
| Window | 2026-08-17 to 2026-09-15, 30 completed days |
| Evidence | `2026-09-16-search-terms-audit/evidence-search-terms-raw.json`, 363 rows |

## Data provenance - read this first

**The live pull failed again this run.** `omega_terms_full.py` was re-run at 09:24 EDT and aborted on the same `RefreshError: invalid_grant` as the 06:55 run; the refresh token in `google-ads.yaml` is still rejected. Re-consent via `authorize.py` needs a human in a browser and is already in `System/approval-queue.md` (2026-09-21, "OAuth refresh token is dead"). Every number below is read row-by-row from the **on-disk evidence pulled 2026-09-16**, window 2026-08-17 to 2026-09-15. Nothing here describes the last 6 days because no local data covers them.

## What these pages are

Pages 1-5 (ranks 1-100) held **100% of account spend**. Ranks 101-200 are all **$0.00, 0 clicks, 2-3 impressions each**, 210 impressions in total. They matter for one reason: they show what Google currently matches Omega to, and any of them becomes spend the moment one takes a click at this account's $8.62 average CPC. There is nothing to flag under "spend and zero conversions" on these pages; the findings are entirely about **which names and intents are being matched at all**.

## Classification rollup, ranks 101-200

| classification | terms | impressions |
|---|---:|---:|
| competitor brand | 34 | 73 |
| supplier / materials brand | 1 | 3 |
| generic (cost / DIY / ideas) | 34 | 70 |
| on-intent | 29 | 60 |
| out-of-area | 2 | 4 |

Named businesses (competitor plus supplier) are **35 of the 100 terms** on these pages. Cost / DIY / ideas shoppers are **34**, of which 29 contain "cost", "how much" or "expensive"; a phrase-match negative on those three words would have suppressed all 29. 3 terms are Denver or Boulder-the-city, outside the Colorado Springs service area.

`out-of-area` is a fifth class added this run; pages 1-5 had no Denver/Boulder terms so it did not arise there.

## Every term reviewed this run

### Page 6 — ranks 101–120

| # | search term | campaign | impr | clicks | cost | conv | classification | note |
|---:|---|---|---:|---:|---:|---:|---|---|
| 101 | lmi colorado | High Intent | 3 | 0 | $0.00 | 0 | competitor brand | LMI Landscapes, confirm |
| 102 | pergolas colorado springs | High Intent | 3 | 0 | $0.00 | 0 | on-intent |  |
| 103 | retaining wall cost | High Intent | 3 | 0 | $0.00 | 0 | generic (cost / DIY / ideas) |  |
| 104 | retaining wall cost per foot | High Intent | 3 | 0 | $0.00 | 0 | generic (cost / DIY / ideas) |  |
| 105 | rocky top landscaping colorado springs | High Intent | 3 | 0 | $0.00 | 0 | competitor brand |  |
| 106 | rusin concrete construction colorado springs co | High Intent | 3 | 0 | $0.00 | 0 | competitor brand |  |
| 107 | sprinklers inc and landscaping | High Intent | 3 | 0 | $0.00 | 0 | competitor brand |  |
| 108 | the concrete company colorado springs | High Intent | 3 | 0 | $0.00 | 0 | competitor brand | name pattern, confirm |
| 109 | transit mix colorado springs | High Intent | 3 | 0 | $0.00 | 0 | supplier / materials brand | ready-mix supplier, second variant after page 4 |
| 110 | water wise landscape design | High Intent | 3 | 0 | $0.00 | 0 | on-intent |  |
| 111 | average cost for concrete patio | High Intent | 2 | 0 | $0.00 | 0 | generic (cost / DIY / ideas) |  |
| 112 | backyard contractor | High Intent | 2 | 0 | $0.00 | 0 | on-intent |  |
| 113 | backyard landscape design plans | High Intent | 2 | 0 | $0.00 | 0 | on-intent |  |
| 114 | bella giardino landscape and garden design | High Intent | 2 | 0 | $0.00 | 0 | competitor brand |  |
| 115 | bluegreen landscape architecture | High Intent | 2 | 0 | $0.00 | 0 | competitor brand |  |
| 116 | boulder co landscape design | High Intent | 2 | 0 | $0.00 | 0 | out-of-area |  |
| 117 | boulder retaining wall | High Intent | 2 | 0 | $0.00 | 0 | on-intent | rock, not the city |
| 118 | boulder retaining walls | High Intent | 2 | 0 | $0.00 | 0 | on-intent | rock, not the city |
| 119 | boulders landscape design | High Intent | 2 | 0 | $0.00 | 0 | on-intent | rock, not the city |
| 120 | building a retaining wall on a slope | High Intent | 2 | 0 | $0.00 | 0 | generic (cost / DIY / ideas) |  |

Page 6 subtotal: **$0.00**, 0 clicks, 0 conversions, 50 impressions.

### Page 7 — ranks 121–140

| # | search term | campaign | impr | clicks | cost | conv | classification | note |
|---:|---|---|---:|---:|---:|---:|---|---|
| 121 | building a rock retaining wall | High Intent | 2 | 0 | $0.00 | 0 | generic (cost / DIY / ideas) |  |
| 122 | c and c landscape | High Intent | 2 | 0 | $0.00 | 0 | competitor brand |  |
| 123 | cement driveway cost | High Intent | 2 | 0 | $0.00 | 0 | generic (cost / DIY / ideas) |  |
| 124 | chaney landscaping | High Intent | 2 | 0 | $0.00 | 0 | competitor brand |  |
| 125 | colorado landscaping | High Intent | 2 | 0 | $0.00 | 0 | on-intent |  |
| 126 | colorado scapes landscaping | High Intent | 2 | 0 | $0.00 | 0 | competitor brand |  |
| 127 | colorado springs backyard landscaping | High Intent | 2 | 0 | $0.00 | 0 | on-intent |  |
| 128 | commercial concrete colorado springs | Call Only | 2 | 0 | $0.00 | 0 | on-intent |  |
| 129 | concrete backyard cost | High Intent | 2 | 0 | $0.00 | 0 | generic (cost / DIY / ideas) |  |
| 130 | concrete contractors near me | Concrete Call Only | 2 | 0 | $0.00 | 0 | on-intent |  |
| 131 | concrete countertops colorado springs | High Intent | 2 | 0 | $0.00 | 0 | generic (cost / DIY / ideas) | off-service (countertops) |
| 132 | concrete edging colorado springs | High Intent | 2 | 0 | $0.00 | 0 | on-intent |  |
| 133 | concrete repair colorado springs | High Intent | 2 | 0 | $0.00 | 0 | on-intent |  |
| 134 | cost for landscaping backyard | High Intent | 2 | 0 | $0.00 | 0 | generic (cost / DIY / ideas) |  |
| 135 | cost of a pergola installed | High Intent | 2 | 0 | $0.00 | 0 | generic (cost / DIY / ideas) |  |
| 136 | cost of a retaining wall | High Intent | 2 | 0 | $0.00 | 0 | generic (cost / DIY / ideas) |  |
| 137 | cost of cement patio per square foot | High Intent | 2 | 0 | $0.00 | 0 | generic (cost / DIY / ideas) |  |
| 138 | cost of retaining wall | High Intent | 2 | 0 | $0.00 | 0 | generic (cost / DIY / ideas) |  |
| 139 | cost of retaining wall per square foot | High Intent | 2 | 0 | $0.00 | 0 | generic (cost / DIY / ideas) |  |
| 140 | cost to enclose a patio | High Intent | 2 | 0 | $0.00 | 0 | generic (cost / DIY / ideas) |  |

Page 7 subtotal: **$0.00**, 0 clicks, 0 conversions, 40 impressions.

### Page 8 — ranks 141–160

| # | search term | campaign | impr | clicks | cost | conv | classification | note |
|---:|---|---|---:|---:|---:|---:|---|---|
| 141 | cost to replace a concrete driveway | High Intent | 2 | 0 | $0.00 | 0 | generic (cost / DIY / ideas) |  |
| 142 | cost to replace driveway with concrete | High Intent | 2 | 0 | $0.00 | 0 | generic (cost / DIY / ideas) |  |
| 143 | cost to xeriscape front yard | High Intent | 2 | 0 | $0.00 | 0 | generic (cost / DIY / ideas) |  |
| 144 | costs for landscaping | High Intent | 2 | 0 | $0.00 | 0 | generic (cost / DIY / ideas) |  |
| 145 | cruz landscaping | High Intent | 2 | 0 | $0.00 | 0 | competitor brand |  |
| 146 | custom scapes landscaping | High Intent | 2 | 0 | $0.00 | 0 | competitor brand |  |
| 147 | deangels concrete | High Intent | 2 | 0 | $0.00 | 0 | competitor brand |  |
| 148 | deep roots landscaping | High Intent | 2 | 0 | $0.00 | 0 | competitor brand |  |
| 149 | denver landscape architecture | High Intent | 2 | 0 | $0.00 | 0 | out-of-area |  |
| 150 | denver patio masters reviews | High Intent | 2 | 0 | $0.00 | 0 | competitor brand | also out-of-area (Denver) |
| 151 | desert scape landscaping | High Intent | 2 | 0 | $0.00 | 0 | competitor brand |  |
| 152 | design build landscape | High Intent | 2 | 0 | $0.00 | 0 | on-intent |  |
| 153 | driveway king colorado springs | High Intent | 2 | 0 | $0.00 | 0 | competitor brand |  |
| 154 | driveway landscaping | High Intent | 2 | 0 | $0.00 | 0 | on-intent |  |
| 155 | elite concrete colorado springs | High Intent | 2 | 0 | $0.00 | 0 | competitor brand |  |
| 156 | entrance landscape design plan | High Intent | 2 | 0 | $0.00 | 0 | on-intent |  |
| 157 | evergreen ecoscape and design | High Intent | 2 | 0 | $0.00 | 0 | competitor brand |  |
| 158 | everscape landscaping | High Intent | 2 | 0 | $0.00 | 0 | competitor brand |  |
| 159 | f&b landscaping colorado springs | High Intent | 2 | 0 | $0.00 | 0 | competitor brand |  |
| 160 | fisk landscaping colorado springs | High Intent | 2 | 0 | $0.00 | 0 | competitor brand |  |

Page 8 subtotal: **$0.00**, 0 clicks, 0 conversions, 40 impressions.

### Page 9 — ranks 161–180

| # | search term | campaign | impr | clicks | cost | conv | classification | note |
|---:|---|---|---:|---:|---:|---:|---|---|
| 161 | flat and fancy concrete | High Intent | 2 | 0 | $0.00 | 0 | competitor brand | shorter form of rank 95 |
| 162 | fred moses landscaping | High Intent | 2 | 0 | $0.00 | 0 | competitor brand |  |
| 163 | front yard landscaping colorado | High Intent | 2 | 0 | $0.00 | 0 | on-intent |  |
| 164 | front yard landscaping with artificial turf | High Intent | 2 | 0 | $0.00 | 0 | on-intent |  |
| 165 | grade line landscaping | High Intent | 2 | 0 | $0.00 | 0 | competitor brand |  |
| 166 | grandezza landscaping | High Intent | 2 | 0 | $0.00 | 0 | competitor brand |  |
| 167 | green horizon landscaping | High Intent | 2 | 0 | $0.00 | 0 | competitor brand |  |
| 168 | greenscapes landscaping | High Intent | 2 | 0 | $0.00 | 0 | competitor brand |  |
| 169 | hardscape design | High Intent | 2 | 0 | $0.00 | 0 | on-intent |  |
| 170 | hardscaping | High Intent | 2 | 0 | $0.00 | 0 | on-intent |  |
| 171 | hiner outdoor living photos | High Intent | 2 | 0 | $0.00 | 0 | competitor brand |  |
| 172 | homestake landscaping | High Intent | 2 | 0 | $0.00 | 0 | competitor brand |  |
| 173 | how expensive is landscaping | High Intent | 2 | 0 | $0.00 | 0 | generic (cost / DIY / ideas) |  |
| 174 | how much does a landscape designer cost | High Intent | 2 | 0 | $0.00 | 0 | generic (cost / DIY / ideas) |  |
| 175 | how much does it cost to cement a driveway | High Intent | 2 | 0 | $0.00 | 0 | generic (cost / DIY / ideas) |  |
| 176 | how much does it cost to get a landscape design | High Intent | 2 | 0 | $0.00 | 0 | generic (cost / DIY / ideas) |  |
| 177 | how much does it cost to get a new concrete driveway | High Intent | 2 | 0 | $0.00 | 0 | generic (cost / DIY / ideas) |  |
| 178 | how much does it cost to have pavers installed | High Intent | 2 | 0 | $0.00 | 0 | generic (cost / DIY / ideas) |  |
| 179 | how much does it cost to landscape a yard | High Intent | 2 | 0 | $0.00 | 0 | generic (cost / DIY / ideas) |  |
| 180 | how much does landscaping cost | High Intent | 2 | 0 | $0.00 | 0 | generic (cost / DIY / ideas) |  |

Page 9 subtotal: **$0.00**, 0 clicks, 0 conversions, 40 impressions.

### Page 10 — ranks 181–200

| # | search term | campaign | impr | clicks | cost | conv | classification | note |
|---:|---|---|---:|---:|---:|---:|---|---|
| 181 | how much is new concrete driveway | High Intent | 2 | 0 | $0.00 | 0 | generic (cost / DIY / ideas) |  |
| 182 | how much is stamped concrete | High Intent | 2 | 0 | $0.00 | 0 | generic (cost / DIY / ideas) |  |
| 183 | how much landscaping cost | High Intent | 2 | 0 | $0.00 | 0 | generic (cost / DIY / ideas) |  |
| 184 | how much should concrete driveway cost | High Intent | 2 | 0 | $0.00 | 0 | generic (cost / DIY / ideas) |  |
| 185 | ideal concrete colorado springs | High Intent | 2 | 0 | $0.00 | 0 | competitor brand |  |
| 186 | is stamped concrete expensive | High Intent | 2 | 0 | $0.00 | 0 | generic (cost / DIY / ideas) |  |
| 187 | jtb landscaping colorado springs | High Intent | 2 | 0 | $0.00 | 0 | competitor brand | shorter form of rank 98 |
| 188 | kjt landscaping | High Intent | 2 | 0 | $0.00 | 0 | competitor brand |  |
| 189 | landcare landscaping | High Intent | 2 | 0 | $0.00 | 0 | competitor brand |  |
| 190 | landscape architect colorado springs | High Intent | 2 | 0 | $0.00 | 0 | on-intent |  |
| 191 | landscape companies in colorado springs | High Intent | 2 | 0 | $0.00 | 0 | on-intent |  |
| 192 | landscape design build services | High Intent | 2 | 0 | $0.00 | 0 | on-intent |  |
| 193 | landscape design ideas colorado springs | High Intent | 2 | 0 | $0.00 | 0 | generic (cost / DIY / ideas) |  |
| 194 | landscape designer colorado springs | High Intent | 2 | 0 | $0.00 | 0 | on-intent |  |
| 195 | landscape retention wall | High Intent | 2 | 0 | $0.00 | 0 | on-intent |  |
| 196 | landscape stairs on slope | High Intent | 2 | 0 | $0.00 | 0 | on-intent |  |
| 197 | landscaper | High Intent | 2 | 0 | $0.00 | 0 | on-intent |  |
| 198 | landscapers contractor | High Intent | 2 | 0 | $0.00 | 0 | on-intent |  |
| 199 | landscaping a hill to prevent erosion | High Intent | 2 | 0 | $0.00 | 0 | generic (cost / DIY / ideas) |  |
| 200 | landscaping colorado | High Intent | 2 | 0 | $0.00 | 0 | on-intent |  |

Page 10 subtotal: **$0.00**, 0 clicks, 0 conversions, 40 impressions.

## Flags

- **Spend with zero conversions:** none on these pages; every row is $0.00.
- **Another business's name:** 35 terms. Competitor brands: `lmi colorado`, `rocky top landscaping colorado springs`, `rusin concrete construction colorado springs co`, `sprinklers inc and landscaping`, `the concrete company colorado springs`, `bella giardino landscape and garden design`, `bluegreen landscape architecture`, `c and c landscape`, `chaney landscaping`, `colorado scapes landscaping`, `cruz landscaping`, `custom scapes landscaping`, `deangels concrete`, `deep roots landscaping`, `denver patio masters reviews`, `desert scape landscaping`, `driveway king colorado springs`, `elite concrete colorado springs`, `evergreen ecoscape and design`, `everscape landscaping`, `f&b landscaping colorado springs`, `fisk landscaping colorado springs`, `flat and fancy concrete`, `fred moses landscaping`, `grade line landscaping`, `grandezza landscaping`, `green horizon landscaping`, `greenscapes landscaping`, `hiner outdoor living photos`, `homestake landscaping`, `ideal concrete colorado springs`, `jtb landscaping colorado springs`, `kjt landscaping`, `landcare landscaping`. Supplier: `transit mix colorado springs` (ready-mix concrete, second variant after page 4).
- **Duplicates of names already on pages 1-5:** `flat and fancy concrete` (rank 95 variant), `jtb landscaping colorado springs` (rank 98 variant), `transit mix colorado springs` (page-4 variant). Google matches these brands on several spellings, so an exact-match negative on one spelling will not hold; phrase-match on the brand stem is what actually blocks them.
- **Out-of-area:** `boulder co landscape design`, `denver landscape architecture`, `denver patio masters reviews`. Three "boulder" terms are rock retaining walls, not the city, and stay on-intent.
- **Off-service:** `concrete countertops colorado springs` (also matched at rank 99 on page 5). Omega does flatwork and landscaping, not countertops.

## Proposed negatives (NOT applied)

Appended to `System/approval-queue.md` under 2026-09-21. In priority order:

1. **Phrase-match `cost`, `how much`, `expensive`**: covers 29 of the generic terms on these pages and, from pages 1-5, seven terms that took $54.85 for zero conversions. Trade-off: also blocks a real buyer who types "how much does a patio cost" before calling. With 0 conversions from that cluster across 363 terms, that trade is worth taking.
2. **Phrase-match `denver`, `boulder co`**: keeps the city of Boulder out without touching rock retaining walls.
3. **Phrase-match the competitor stems** listed above, not exact terms; each brand already appears in 2-3 spellings.
4. **Phrase-match `countertops`.**

## Classification caveat

Competitor and supplier identity is read from name pattern, not a verified local-business registry. `the concrete company`, `lmi colorado`, `c and c landscape`, `deep roots`, `desert scape` and similar could be generic phrases that happen to look like names; `design build landscape` was left on-intent for that reason. **Confirm each before any negative is applied.**

## Gate

Negatives were **not** applied. `paid-media/launch-authority.json` remains `status: draft`, `approvedBy: null`, so every campaign change is gated. Next run resumes at **page 11 (ranks 201-220)**; ranks 201-363 carry 196 impressions in total, all 1-2 per term, so one more pass of five pages will likely close the list.
