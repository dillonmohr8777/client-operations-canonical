# Bar Crawl USA — Weekly Update, 2026-09-14

**DRAFT ONLY.** File created, nothing sent, nothing posted, nothing deployed.

## Recipients

- **To:** `info@barcrawlusa.com` (Andy Zirger)
  Source: `registry/clients.json` → `clients[].id == "bar-crawl-usa"` → `contacts[0].email`.
  Name match: `clients/bar-crawl-usa/deliverables/2026-09-09-andy-access-replies/README.md`
  identifies this address as Andy Zirger, the client contact actively
  replying in-thread.
- **CC:** `mac@needmomentum.com`, `sean@needmomentum.com`, `melissarobinn@gmail.com`
  Source: same file, which documents the live (unsent) Gmail draft in this
  client's own thread as "To: Andy, Mac. Cc: mac@needmomentum.com, sean@,
  melissarobinn@." This matches the standing internal-team CC pattern
  independently confirmed by `clients/nexla/deliverables/2026-09-08-weekly-report-2026-09-01-to-2026-09-08/email-delivery-receipt.json`
  (`status: sent_verified`). Of all six clients in this batch, Bar Crawl USA
  has the strongest direct evidence for this CC list — it comes from this
  client's own thread, not just by analogy.
  Note: the source README also lists "Mac" in the To line for that specific
  access-related reply; this draft keeps Mac in CC only, since the registry's
  sole verified client contact is `info@barcrawlusa.com` and Mac
  (`mac@needmomentum.com`) is internal Momentum staff, not a Bar Crawl USA
  contact.

## Subject

Bar Crawl USA — Weekly Update, Sep 7–13

## Evidence per claim

| Claim | Evidence path |
| --- | --- |
| GSC 2,356 clicks / 68,203 impressions, Aug 10–Sep 7, +160.3% vs prior 28 days | Brief-provided, pulled 2026-09-10. Closest on-disk precedent: `clients/bar-crawl-usa/deliverables/2026-09-09-andy-access-replies/verification.json` → `searchPerformance` (same window, pulled one day earlier, 2026-09-09 ~17:10 UTC: 2,292 clicks / 65,966 impressions). The brief's exact figures are a later snapshot of the same rolling GSC window, not on disk verbatim in this worktree. |
| All 10 Halloween guides submitted/indexed, verdict PASS, last crawled Aug 28, sitemaps 0 errors | `clients/bar-crawl-usa/deliverables/2026-09-09-andy-access-replies/verification.json` → `halloweenIndex` (10/10 PASS entries) and `sitemaps` (`errors: "0"`). Exact match. |
| Birmingham AL (Oct 24) live on Eventbrite, no 2026 guide page | Same file → `eventbriteHalloweenSnapshot.uncoveredLiveEvent`. Exact match. |
| Legacy /event/ pages (Gainesville GA, Asheville, Fort Worth, Knoxville): 1,565 impressions / 20 clicks, no live 2026 event | Same file → `searchPerformance.legacyCitiesNoLiveEvent` (1,565 / 20) and `eventbriteHalloweenSnapshot.legacyEventPagesWithoutLiveEvent` (city list). Exact match. |

## Do not send

**DO NOT SEND.** This is a draft for review only. No email client, Slack
client, or send tool was invoked to produce this file.

## Other flags

- **Semrush attribution correction, applied silently:** the brief states the
  already-sent September 10 email wrongly credited Semrush for the +160%
  figure, and that Semrush was never actually read. This draft attributes
  the number to Google Search Console only and does not mention Semrush
  anywhere — the error is not repeated.
- No conversion-to-named-lead match-back language, and no claim that
  anything was posted to Slack.
