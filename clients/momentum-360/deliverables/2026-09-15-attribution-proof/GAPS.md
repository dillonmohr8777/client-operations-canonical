# Gaps, what we could not evidence and why

## Search Console properties returning nothing

| Property | Permission | Result | Verdict |
|---|---|---|---|
| `sc-domain:momentumvirtualtours.com` | siteUnverifiedUser | empty | **Verification broken.** Our own property. Fix first. |
| `https://revive-systems.com/` | siteUnverifiedUser | empty | Unverified, no data accessible |
| `sc-domain:revive-systems.com` | siteUnverifiedUser | empty | Duplicate property, also unverified |

Momentum 360's own property being unverified is the most fixable gap on this
list and the least defensible one. Third party data shows the domain ranks for
500 keywords with 36 in the top 3, so the traffic exists and we cannot see it.

## Properties in Search Console that are not registry clients

| Property | Note |
|---|---|
| `https://ironicineptocracy.com/` | Not in `registry/clients.json`. 155 days history, 19 clicks total. Resolve or remove. |
| `sc-domain:immohrtalmarketing.com` | Not in `registry/clients.json`. 19 days history. Looks like a Dillon property rather than a client. |

Neither belongs in client facing evidence until identified.

## Clients with no ranking data pulled

The marketing platform hit its **monthly keyword quota for brand 1789** after 14
calls on 2026-09-15. These were never pulled. They are absent, not zero.

bercospopcorn.com, ami-cleaning.com, cindymaychristmas.com, revive-systems.com,
bigorange.marketing, nexla.com, highlinecomedy.com, soldbymara.com,
faganpainting.com, onsiteconcretelandscape.com, tags2go.pro

Closes when the quota resets monthly, or by raising it on the Abency panel.

## Clients with no confirmable domain

| Client | Why |
|---|---|
| pro-fence-deck | CLIENT.md records the website as unverified |
| bridge-software | Prototype product, no public domain |

Nothing was guessed. Pulling a stranger's rankings and filing it as client
evidence would be worse than a blank row.

## Genuine zeros

| Domain | Status |
|---|---|
| shadow-heating.com | Site live, HTTP 200, zero ranking keywords returned |
| blissfulac.com | Live but redirects to www.blissfulauraevents.com, so the index credits that domain instead. Re-pull against the destination. |

## Lanes never run

The Slack, Gmail and local estate sweeps were dispatched and all four agents
terminated on an API session rate limit at 19:10 ET on 2026-09-15 before
producing output. No Slack permalinks, no Gmail thread ids and no deliverable
trail were collected.

The measured search evidence in `EVIDENCE.md` stands on its own and does not
depend on them, but the narrative layer of what we did and when is missing.
Rerun those three lanes to attach story to the numbers.

## Measurement blocked

| What | Blocker |
|---|---|
| Named AI Overview citations | openrush returns 402 Insufficient credits on `inspect_ai_visibility` and `discover_ai_citations` |
| Any openrush domain or keyword route | Same 402. Only `inspect_serp` still responded. |
| Google Ads mutations | No developer token accessible |

## Standing data hygiene issue found

The marketing platform MCP for brand 1789 defaults to **Spain and Spanish**.
Every US domain silently returns zero rows unless `location_code: 2840` and
`language_code: "en"` are passed explicitly. Worth fixing at the brand config so
nobody concludes a client ranks for nothing.
