# Onsite: LSA off, Vacaville concrete Search created paused

Account: `1033715894`  
Observed: 2026-09-10, Google Ads REST v23, direct, no manager header  
Authority used: Dillon's live "Turn off" for the LSA, plus the 2026-08-14 task-scoped approval for the $15 concrete Vacaville Search package (`alr-20260814-231753-8d9c8a19`)  
Standing launch-authority.json remains draft (`approvedBy: null`, `enableCampaigns: false`)

## What was wrong

The live $80/day object was not an Onsite Search budget. It was a system-generated Local Services campaign:

- `LocalServicesCampaign:SystemGenerated:0006401c1fc27d91`
- Campaign `23068725075`
- Budget `14982151864` at $80/day
- ENABLED / ELIGIBLE
- Last 30 days and the 90-day pull: $0 / 0 impressions / 0 clicks

Onsite's real historical budget was the Smart campaign at about $4.39/day with a $133 monthly cap, then the Aug 14 approved Search package at $15/day. LSA was never the plan. The Aug 14 plan said do not launch LSA, PMax, Smart, Display, Search Partners, or mixed concrete-plus-landscaping.

The leftover Search campaign `Search | High Intent | Solano County | 2026-07-30` (`24183437726`) was still ENABLED at $7/day. It mixed landscaping keywords, landed on `https://onsiteconcretelandscape.com/services/`, and was rank-starved. Last 30 days: 8 impressions, 2 clicks, $6.40.

## What changed in the account

| Campaign | ID | Before | After |
|---|---|---|---|
| Local Services system | `23068725075` | ENABLED, $80/day | PAUSED, budget disarmed to $1/day |
| Search High Intent Solano | `24183437726` | ENABLED, $7/day | PAUSED, budget left at $7/day |
| Smart `Onsite Concrete & Landscape` | `22233329038` | PAUSED, $7/day | unchanged, still PAUSED |
| PMax `Leads-Performance Max-1` | `22454241769` | PAUSED, $5/day | unchanged, still PAUSED |
| **Onsite \| Search \| Concrete \| Vacaville \| 2026-09-10** | `24243107659` | did not exist | **created PAUSED at $15/day** |

Nothing is serving. Enablement of the new Search campaign is a separate Dillon decision.

## The new campaign (live readback)

- Name: `Onsite | Search | Concrete | Vacaville | 2026-09-10`
- Campaign: `24243107659`
- Budget: `15867354918`, $15/day, not shared
- Status: PAUSED
- Network: Google Search only. Search Partners off. Display off.
- Geo: Vacaville, California city (`geoTargetConstants/1014361`), Presence only
- Language: English
- Bidding: Maximize Clicks (`TARGET_SPEND`) with an $8 CPC ceiling. Maximize Conversions stays off until Primary conversion soup is cleaned.
- Ad group: `Concrete | Estimate | Vacaville` (`200131561636`)
- Keywords: 6 concrete terms x Phrase + Exact. No Broad. No landscaping terms.
- Campaign negatives: jobs, careers, salary, hiring, training, classes, DIY, how to, concrete bags, concrete mix, ready mix delivery, concrete supplier, concrete materials, equipment rental, concrete pump, concrete pumping, wholesale, calculator, PDF, tutorial
- Ad-group negatives: landscaping, lawn care, tree service, pool service, asphalt, demolition only
- RSA `824274491756` lands on `https://onsite-gads-landing-page.netlify.app/` with the approved UTM set
- Call asset reused: `201657064075`, published business number already on the landing page
- EU political advertising: declared does not contain

Landscaping stays a later separate test. It is not in this campaign.

## What was not changed

- Conversion actions. Fourteen enabled actions are still Primary, including directions, map clicks, phone clicks, and overlapping form events. That is why homepage reporting looks like 95 conversions. Do not bid Maximize Conversions against that soup.
- Smart and PMax remain paused. They were not revived.
- No SMS to Nicky. The Sep 8 draft is still unsent.
- No Slack, no email, no queue write, no launch-authority promotion.

## Enable gate

Say enable only if you want `24243107659` to spend. Expected live spend after enable: up to about $15/day average, Google may spend up to about $30 on a single day, monthly normally caps near $456.

Do not enable while the leftover Solano Search or LSA is also on. Those two are paused now.

Rollback: pause `24243107659`. The LSA budget stays at $1 unless someone raises it again.
