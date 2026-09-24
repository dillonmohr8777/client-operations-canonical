# Notes on schema-realestateagent.json

Prepared 2026-09-15. Corrected the same day after reading her live site directly.

## The correction that matters

An earlier version of this file, written from the local client pack alone, had
three facts wrong. All three were fixed by reading `soldbymara.com` itself.

| Was | Actually |
|---|---|
| Serves Monmouth, Ocean, Mercer | Serves Monmouth, Ocean, **Middlesex**, Mercer, **Burlington**. Five counties, and she is a member of five MLS boards |
| Office address unknown, omitted | RE/MAX Homeland REALTORS, 83 South Street Ste 302, Freehold NJ 07728. Printed in her own site footer |
| One phone number | Two on her own site. Direct `917.747.5055` and office `732.462.2222` |

The lesson is worth keeping: the client pack was a summary of a summary. Her
live site is first party and it disagreed with the pack on the single most
important local SEO field there is, the service area.

## Every value in the file is sourced

| Field | Source |
|---|---|
| `name`, `jobTitle` | Her live site bio, "I'm a REALTOR Associate with RE/MAX Homeland REALTORS" |
| `telephone` | Direct line `917.747.5055`. On her live site, her staging homepage, and her own email signature. Three independent places |
| `address`, `parentOrganization.telephone` | Footer and contact block of `soldbymara.com`, read 2026-09-15 |
| `areaServed` | Her live site bio, verbatim county list |
| `email` | The address she actually emails from, confirmed across 2026-09-10 to 2026-09-15 |

## Still deliberately left out

**`aggregateRating`.** This one is now genuinely available and it was not
before. Her live site displays real Google reviews with dates, the most recent
9/13/26, two days ago. That satisfies the "visible on the page" requirement on
`soldbymara.com`. It is still out of this file for one reason: this file is
written for the WordPress build, and that site displays no reviews at all.
Adding a rating there would mark up something a visitor cannot see. If review
markup is wanted on the live site, that is a separate block on a separate host,
and the count and average must come from the actual Google Business Profile
rather than from "100+" in the client pack.

**`(551) 888-3140`.** On her Homes.com profile and nowhere else. It now
contradicts not one but two numbers on her own property. It stays out until she
says which line she wants ringing.

**License number.** Still not in any source I can see. Worth one question.

## Where it goes

The `url` currently points at `www.soldbymara.com` because that is her live
entity. If this block is pasted on the WordPress staging build instead, change
`url` to the staging host first. Two hosts claiming the same `url` is worse
than no markup, and staging is carrying a deliberate noindex.
