# Puttery: design, access, and the next integration work

September 4, 2026. Private implementation brief for Dillon.

## The direction

Keep going above and beyond. For this dashboard, the best extra value is a polished operating experience that helps the client see what is working, understand what the numbers mean, and finish the next connection. Strong icons and textures should support that experience.

The previous live Puttery design had a recognizable identity, but the opening oversized headline consumed the viewport, important status sat below it, and the sidebar footer collided with navigation at a short desktop height. The page also repeated discovery and implementation detail before giving the operator a concise answer. Most importantly, its claim that the Reservation Webhook was not registered was outdated.

The [refreshed dashboard is live](https://nyc-entertainment-attribution-dashboard-20260804.netlify.app/) with:

- A compact opening with current progress, the next action, and the reporting boundary immediately visible.
- One consistent SVG icon family with recognizably Puttery golf details.
- Subtle dimple and course-route textures, with readable data surfaces and the exact existing logo.
- Strong pink, teal, black, and white identity, with calmer typography where people work.
- Progressive detail: the complete discovery worksheet remains available, while modeled analytics are clearly separated from verified integration progress.
- Stable navigation, useful empty states, mobile layouts, keyboard access, and reduced motion.

This is the right place to invest in craft. Large cinematic headings and motion work differently in a marketing or property-film page than in a dashboard used to make routine decisions.

## What I reviewed across recent frontends

I inventoried the recent canonical design and website packages and reviewed the current live Puttery page against its matching source. I also inspected archived desktop captures from the Strickland Electric, Pennsylvania Dental Group, and ZBC General Contracting prospect work, and the six-scene Momentum 3D-scroll comparison sheet. That is a focused portfolio comparison, not a fresh live audit of every prospect site.

The strengths are distinct brand worlds, ambitious typography, and a willingness to use real imagery and motion. The recurring weaknesses in these captures are oversized text, header or image overlap, and effects that compete with the useful content. Some archived captures marked as QA outputs still show these problems. Automated checks need to be paired with a visual check of the actual first viewport and principal user action.

| Example reviewed | What to retain | What to improve |
| --- | --- | --- |
| Puttery, current live baseline | Exact venue identity, pink and teal accents, broad integration coverage | Put status and next action first; fix short-height navigation; separate discovery progress from connection status |
| Momentum 3D-scroll, archived six-scene comparison | Cinematic imagery and strong presentation | Keep that expression on experience and sales pages; use more stable composition for operational work |
| Strickland Electric, archived desktop capture | Distinct industrial identity | Reduce unused opening space and bring the useful action higher |
| Pennsylvania Dental Group, archived desktop capture | A recognizable editorial direction | Prevent the image from covering the headline; strengthen logo contrast and quiet the grain behind readable content |
| ZBC General Contracting, archived desktop capture | Clear architectural character | Keep the hero message clear of the sticky header and confirm the settled first viewport |

For future pushes, use a simple release question: can the intended visitor identify the business or task, read the main message, and take the primary action without an obstructed control? Then check the same at a short desktop height and on a phone. Keep expressive work; judge expression in the context where it is used.

## What is actually connected

The Tock Reservation Webhook is receiving and processing NYC events. This was verified through aggregate runtime inspection, not inferred from configuration.

| Check on September 4 | Result |
| --- | --- |
| Relay, 7:02:40 PM ET | 147 acknowledged deliveries, 0 pending |
| Receiver database, 7:03:21 PM ET | 146 deliveries: 37 inserts and 109 updates; 37 reservation states, all business 37824 |
| Conflicts and dead letters at inspection | None recorded |
| Processing | Existing scheduled Windows drain, every five minutes |
| Reconciliation | A one-record difference between cumulative relay and local counts remains unexplained |

These are dated delivery counts, not verified converted bookings or attributable revenue. They will change as traffic continues. The vendor still needs to identify the intended controlled test, and daily totals and value definitions still need reconciliation.

The actual path is Tock → Netlify relay → scheduled Windows processing → local receiver/database. The relay buffers incoming events; the downstream processing still depends on this computer. The public design preview does not become a live performance dashboard just because the receiver is active.

## The access follow-up is sent

Sent from **dillonmohr8777@gmail.com** to **Joe Pedevillano and Tom Luciano**, with Jesse, Mac, and Melissa Silber's existing onboarding addresses copied, in **Getting Started with Momentum**.

[Open the sent follow-up](https://mail.google.com/mail/#all/1a06eaacadc0cc10).

The exact Momentum signature table was recovered from an earlier sent Puttery message, preserved unchanged, and verified in the sent message. Its logo returned HTTP 200. The new body has no quoted conversation. No IMMOHRTAL branding was used.

The request covers full implementation access for the exact Puttery NYC systems, including account identifiers and the people who can grant each permission:

| System | Requested access and purpose |
| --- | --- |
| Tock | Dashboard administration, integration directory, reservation reporting, and daily exports; vendor confirmation on export availability and secure replacement of the emailed credential |
| Website, hosting, and DNS | NYC CMS access and the infrastructure owners needed to configure and test the booking and tracking path |
| GA4 and GTM | Correct property and stream with Editor access; container testing and publishing permissions |
| Google Ads | Exact account and conversion/data-connection configuration permissions |
| Meta | Correct Business Portfolio and NYC ad account, Page, Instagram, Pixel or Dataset, and Conversions API configuration |
| CRM, email, and data hosting | Destination system, administrator, integration access, permitted fields, consent, retention, suppression, and durable hosting owner |
| Toast, Tripleseat, guest profiles, walk-ins | Confirm actual NYC use and authorize the relevant reporting/API connection and location scope |
| Reconciliation | Two known NYC venue days of reservation/payment/cancellation/refund records through restricted sharing, timezone, and value definition |

This is a **sent access request**, not confirmation that the grants have arrived. The earlier Tock vendor thread already contains the export and credential-replacement requests, so the follow-up acknowledges that work rather than requesting duplicate webhook registration.

## The most useful integration improvements

**1. Remove the desktop dependency.** Move processing to an approved hosted worker with persistent storage, retry monitoring, backups, and a restore test. This is the clearest improvement tied to your dislike of relying on Windows. Establish the hosting account and operating owner, then prove that a controlled event is processed while the desktop worker is stopped.

**2. Give the dashboard a safe status feed.** A server-side adapter should publish only approved aggregate status: last successful processing time, pending work, failure state, and reconciliation status. Show freshness and stale states. Keep authenticated relay endpoints and credentials out of browser JavaScript. Until this exists, use an explicitly dated verification snapshot.

**3. Complete daily recovery and reconciliation.** Resolve the one-record discrepancy, confirm the vendor-controlled test, and obtain working Data Exports access. Join versioned reservation states, cancellations, payments, and refunds into an auditable ledger. Tock documents stable reservation identifiers, a sequence counter, checkout metadata, and separate price/payment fields. These support the architecture; actual field population still needs testing. [Tock reservation model](https://api.exploretock.com/docs/latest/reservation.html).

**4. Prove the click-to-booking path.** Configure the correct GA4 property and Tock integration, validate cross-domain behavior, and test which campaign identifiers actually survive. A documented metadata field is not proof that every Google or Meta identifier reaches the reservation. [Tock's Google Analytics integration](https://tock.zendesk.com/hc/en-us/articles/360031261191-Integrating-with-Google-Analytics).

**5. Return qualified outcomes to the ad accounts.** Google now directs offline conversion integrations toward Data Manager API. Legacy Google Ads API upload access depends on prior developer-token use; verify the existing route before implementation. Build account-level diagnostics, deduplication, and consent checks before enabling real uploads. [Google's offline-conversion API guidance](https://developers.google.com/google-ads/api/docs/conversions/upload-offline), [Data Manager offline events](https://developers.google.com/data-manager/api/devguides/events/google-ads/offline).

For Meta, validate the current Dataset/CAPI setup in the exact account and use one consistent event identity across browser and server processing. Current Meta documentation returned HTTP 429 during this review, so no account eligibility or version-specific behavior is represented as verified.

**6. Expand into useful additional outcomes.** Guest/CRM sync can help the client use permitted customer data. Walk-in reporting can explain the part of the business reservations miss. Tripleseat can add the group-event pipeline, while Toast can supply venue commerce where the accounts support it. Toast's standard API is read-only and location-configurable; Tripleseat documents OAuth 2.0 access through its API/Webhooks settings. Keep deposits, booked value, refunds, and POS revenue distinct. [Toast standard API access](https://support.toasttab.com/en/article/Standard-API-Access), [Tripleseat authentication](https://support.tripleseat.com/hc/en-us/articles/19394408627479-API-Authentication).

## How to turn the access into a working system

Use the existing onboarding conversation to confirm the access owner for each platform. Joe and Tom can identify the correct administrators; Laura is the current Tock vendor contact. Dillon owns the implementation, with Jesse already involved in the next onboarding call. Invitations should name the exact NYC assets and grant the configuration and diagnostics capabilities requested above.

The first acceptance check is small and concrete: follow one vendor-identified NYC reservation through receipt, updates, cancellation or refund where applicable, and the approved reporting destination. Then reconcile two venue days against the authoritative exports. Only after that should the dashboard present measured booking value or attribution results. Preserve the source identifiers and business definitions so additional integrations can be added without counting the same outcome twice.

Make progress visible in the dashboard through a dated, safe status feed. Record each connection's owner, last successful verification, next action, and evidence. A permission invitation, a passing test, a received event, and a reconciled business outcome are different stages of that progress.

## Evidence and delivery record

- Current Puttery source: `C:/Users/dillo/Documents/Codex/2026-08-04/we-can-help-right-research-this-2`; four public deployment files matched the source hashes before editing.
- Additive design work: `client-operations/clients/puttery-nyc/deliverables/2026-09-04-dashboard-design-refresh`.
- Private access request and verified sent receipt: `client-operations/clients/puttery-nyc/deliverables/2026-09-04-access-followup`.
- Live vendor thread: `1a049e62f063f279`, 14 available messages; onboarding thread: `1a059f51edea301e`; project requirements thread: `19fc984427a5981b`.
- Runtime inspection used counts and health only. No guest identifiers, raw payloads, or secret values appear in this brief.
- Design release: **live and verified** on the existing Netlify site. Final deployment: `6a9b524ec7e4b2d40ffadc96`.
- All eight public files matched the deployed bytes. HTTP 200, noindex/noarchive and existing security headers passed live readback. The reviewed bundle contains no private reports, guest records, or credentials.
- All 43 behavior and viewport checks passed. Independent desktop/mobile review passed with a noted readability risk; saved answers, filtering, reset, export, and all 69 question IDs were preserved. The live page was also opened and visually inspected after deployment.
- Accessibility limitation: browser axe scans found no violations, but the static design detector produced 31 warnings. Contextual contrast exceptions and small secondary metadata are documented; this is not a zero-finding accessibility audit.

[Desktop preview](/C:/Users/dillo/Documents/Codex/2026-09-04/hi/outputs/Puttery-Desktop.png) · [Mobile preview](/C:/Users/dillo/Documents/Codex/2026-09-04/hi/outputs/Puttery-Mobile.png)
