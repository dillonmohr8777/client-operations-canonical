# Paid Media Dashboard Run Methodology

## Canonical reporting lanes

- Google Ads: Kimberly James Bridal, Replenish / 7-Eleven, Fresh Blends / Kwik Trip, Omega Landscaping, Onsite Concrete & Landscape
- Meta Ads: Kimberly James Bridal, Fagan Painting
- Shadow Heating and Cooling: excluded

## Slack continuity researched

Prior client updates consistently place the live Netlify dashboard link directly beneath the title, then provide a short performance read, concise KPI bullets, and a clear next action. The stable client channels and dashboard links are:

- Kimberly James Bridal: `#kimberly-james-bridal` → `https://kimberly-james-bridal-2026-06-06.netlify.app`
- Omega Landscaping: `#omega-landscape` → `https://omega-landscaping-2026-06-06.netlify.app`
- Onsite Concrete & Landscape: `#onsite-construction` → `https://onsite-concrete-construction-2026-06-06.netlify.app`
- Fagan Painting: `#fagan-painting` → `https://fagan-painting-2026-07-06.netlify.app`
- Fresh Blends: `#fresh-blends`; the current standalone status report is deployed to the canonical non-suffixed Fresh Blends report site.

Slack-ready drafts are stored with each client deliverable. They were not sent.

## Standard dashboard lineage

The stable Netlify links were correct, but the first July 20-July 26 refresh replaced the repeatedly delivered interactive dashboard shell with a new static layout. That layout was rejected.

The corrected build uses the exact prior Netlify deployment lineage for the standard Momentum 360 client dashboard:

- Kimberly James Bridal source deploy: `6a5e2aec47c635e9cf13c459`
- Omega Landscaping source deploy: `6a5d399edee7080633e540dc`
- Fagan Painting source deploy: `6a5e74f1fe9d525c730016f7`
- Fresh Blends source deploy: `6a38459e8c35057867bc8f54`
- Onsite uses the identical preserved reporting bundle from the Fagan source deploy because the older Onsite immutable deploy hostname no longer resolves; the bundle contains Onsite's original report configuration and logo.

Gmail confirms the Kimberly James Bridal link was sent on July 20 with the July 13-July 19 report. Slack confirms the reporting system uses a shared dashboard template customized to each client's reporting priorities.

The correction preserves the standard shell and injects only the verified July 20-July 26 report object. Replenish remains on its separate 7-Eleven presentation design.

## Current evidence

- Google Ads was read in the authenticated account selector and campaign table using an exact custom date range of July 20 through July 26, 2026.
- Meta Ads was read in the authenticated KJB and Fagan accounts. Meta returned confirmed campaign rows through July 25; July 26 remained pending platform latency on July 26.
- Fresh Blends campaign rows were verified as paused and were kept separate from Replenish.
- Replenish keeps the previously completed 7-Eleven presentation dashboard and does not include Get Directions.
