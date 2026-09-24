# GT Clinic: switch on GA4 key events without double counting

CLIENT.md open item 1, the highest-value action on the account. Dillon approved doing it
2026-09-24 ("do everything for GT Clinic"). **Status: ready, not executed.** Blocked only on
access: the Google Analytics connector returns `invalid_grant` (expired OAuth) and the Chrome
extension was not connected on 2026-09-24 12:10. Either route unblocks it.

Property `531064094` ("thegtclinic.com", account 165890074), stream `14302649010`,
measurement ID `G-PY8223SGRW`.

## Evidence (GA4 Data API, 2026-04-01 to 2026-09-21, from CLIENT.md)

| Event | Count | Key event today |
|---|---|---|
| `form_start` | 62 | no |
| `contact` | 37 | no |
| `laser_hair_removal_lead` | 27 | no |
| `lead_form_submit` | 26 | no |
| `wrinkle_relaxer_lead` | 6 | no |
| `form_submit` | 4 | no |
| `microneedling_lead` | 4 | no |

`keyEvents` is 0 on every channel, so every GA4 and Ads report reads blank.

## The dedupe finding

The three per-service events sum to **27 + 6 + 4 = 37, exactly the `contact` count.** That is
the signature of one submission firing two events: `contact` as the umbrella, plus one
service-specific companion. Marking both would count every lead twice.

`lead_form_submit` (26) does not fit that sum, so it is either a second form or a second tag on
the same form. That is the one question the data must answer before marking it.

## Verify first (read-only, about 10 minutes)

1. **Co-firing, day level.** Report `date` × `eventName` for the seven events. If on every day
   `contact` = laser + wrinkle + microneedling, the umbrella reading is confirmed.
2. **Same form or not.** Report `eventName` × `pagePath`. If `lead_form_submit` fires on pages
   where `contact` never does, they are different forms. If they share pages and dates one for one,
   they are two tags on one submit.
3. **Session overlap.** Exploration, segment "sessions with `contact`" vs "sessions with
   `lead_form_submit`". Overlap near 0 means distinct forms.
4. **Against reality.** Per the record, reconcile against her actual inquiry log (where form
   submissions land, which is the second ask in the 2026-09-24 access email) before quoting any
   lead number to the client.

## Then mark (Admin > Data display > Events > "Mark as key event")

| Outcome of step 2/3 | Mark as key event | Leave unmarked |
|---|---|---|
| Distinct forms | `contact`, `lead_form_submit` | per-service events, `form_start`, `form_submit` |
| Same submit, two tags | `contact` only | everything else |

Per-service events stay unmarked and are read as a breakdown of `contact`, never summed with it.
`form_start` is an intent signal, not a lead. The toggle is reversible and only affects data from
the moment it is switched on; history is not reprocessed.

## Same visit, one more fix

**Property time zone** is `Etc/UTC`; set it to `America/New_York` (Admin > Property details) so
day boundaries match her business day before the first report. Forward-only, like the above.

## Client-facing language

Until step 4 reconciles, the paid-media rule in AGENTS.md applies: say "conversion reporting is
pending validation", never a conversion count.

## Google Ads (separate, still blocked)

Importing the chosen key event as the Ads conversion needs the Ads account, which is still
unreadable: the native integration fails OAuth refresh and the Composio connection is pinned to
deactivated customer `6908592139`. Repointing that connection needs Dillon's Google re-auth.
