# Puttery NYC release checkpoint

## Intro normal-opening correction, September 13

Final deploy superseded by `6aa6e6b58dda5784ad139d9f`, verified ready/published. Root cause: index.html returned early on normal load when permanent localStorage key `putteryHanddrawnIntroSeen20260904v1` was 1. Replay passed force=true, so prior replay-only QA missed this. Removed persistent seen gating/writes from champion and fallback startup. Existing assets, choreography, 7,100 ms timing, replay and reduced-motion handling unchanged.

Live returning-session reload reproduced missing intro before fix; after fix desktop (1265x712) and mobile (390x844) reloads automatically rendered the SVG intro at elapsed 0-17 ms without replay. Desktop completed automatically and GA4 showed 20,019. Reduced-motion reload created no overlay and disabled replay; no console warnings/errors. Temporary emulation/viewport overrides reset; normal reload again started automatically. All 15 live hashes and aggregate download checks passed. `node check-intro-start.mjs` checks fresh/seen-flag startup and repeated calls with reduced motion on/off. Fresh isolated-origin browser check was unavailable (immutable Netlify URL DNS resolution failed; CDP storage API unsupported, no storage changed), so fresh state has executable startup coverage, not separate clean-profile visual proof. Monitoring remains PAUSED per Dillon; no scheduler resumed by this fix.

## Authorized live release, September 13, 2026, approximately 15:31 UTC

This section supersedes the earlier local-only state below. Explicit deployment authority was received for the existing dashboard and aggregate status publication.

- Live: https://nyc-entertainment-attribution-dashboard-20260804.netlify.app
- Existing site: `3d07c320-2f5a-4d74-adad-8c6ed257b19b`. Final deploy: `6aa6c18250d7dcb5868fdf82`, verified published and ready by Netlify getSite. Initial release `6aa6bf7e940d508ae62622f6` was superseded by the working Blob-based GA4 download fix.
- `check-live-release.mjs` now resolves this worktree, includes GA4 and intro/media assets, and uses GET only. `dashboard-full-release-check.json` passes: all 15 live files SHA-256 match local; live relay schema validates; Tock JSON and CSV downloads contain 839 selected states and definitions; actual GA4 JSON download byte-matches the published extract.
- Tock live readback: `2026-09-13T15:27:07.683Z`, 27,786 merged states. Export completed `2026-09-13T14:14:39.882Z`, six files / 27,783 states. The 30-day service-date window is Aug 14 through Sep 12, America/New_York. Historical relay acknowledgement difference of 1 remains unresolved, not concealed.
- OperationalStatus manifest no longer has `-LocalOnly`; existing five-minute aggregate publication resumed. Last scheduler result 0 at 11:27:03 ET, next 11:32:02 ET. DataExports last result 0, next 15:00 ET. Registration helper remains safe-default local-only unless `-PublishStatus` is explicitly supplied. No relay source deployment.
- GA4 property `276233773`, stream `2658813519`, measurement `G-STZ72WP326` verified in live stream UI. The older transposed measurement ID is corrected. Extract covers Aug 14 through Sep 12 in America/Chicago; retrieved `2026-09-13T15:14:08.820Z`. Exact host and anchored NYC path filters include website NYC descendants and Tock NYC descendants only. Complete events/channel/day reports publish 20,019 website page views, 24,200 Tock page views and 594 Tock purchase events. Purchase and reservation events are not additive or verified paid bookings. Users are not additive across rows. No revenue or spend is inferred.
- GA4 is a dated static extract, explicitly not an automatic feed. Repeat via the existing connector queries recorded in `ga4-report-input.json`, then `node prepare-ga4-report.mjs` and `node check-ga4-report.mjs`. Existing local OAuth scope does not establish unattended Analytics access; no scope was expanded.
- Google Ads direct and manager-routed access to linked customer `9097587272` returned USER_PERMISSION_DENIED. Manager route `7038673437` request `wUPORI_2l486T8wdGZ4KpA`; accessible-account discovery did not establish a Puttery ads account. Meta saved-profile login did not establish an authenticated business session. Puttery WordPress reached a blank login. Exact Access Broker Puttery entry has only Tock systems; no approved private Toast/Tripleseat source established. These remain unavailable, not zero.
- Original `champion-intro.js`, `media.js`, styles and asset paths have no Git diff against HEAD and their live bytes match. Existing 7,100 ms hand-drawn animation retained. Browser QA: desktop and 390x844 mobile replay renders golfer/ball; automatic transition completes; pause holds elapsed at 0 across observations and resume completes; reduced-motion replay creates no overlay. No document-width overflow. Mobile GA4 tables remain readable with existing wrapping. Temporary viewport/media overrides were reset.
- Tests pass: integration, dashboard/privacy, local-only guard, GA4 mutation/scope checks and final read-only live-release check. Earlier receiver 14/14 and relay 18/18 checks passed. Independent reviewer found no material findings; reviewer accidentally regenerated the GA4 summary but verified byte-equivalence. Reviewer stopped. Git diff check passed (CRLF warnings only).
- No GTM publication or edits, conversion imports/config changes, spend, paid booking, access changes or client messages. Six web GTM workspace additions preserved. No commit/push claimed.

## Historical stage-only checkpoint

Observed September 13, 2026 at approximately 14:21 UTC. State: locally integrated and reviewed; not published; attribution and revenue incomplete.

## Recovered refresh routes

Both scheduled commands pointed into the branch-dependent main checkout, where the scripts no longer existed. The hidden VBS wrapper correctly propagated PowerShell's missing-script exit code 64, reproduced directly. The intact implementation is in `C:/Users/dillo/Documents/Codex/worktrees/client-ops-build-20260909`, branch `registry/add-nexla-puttery-mara-20260909`, HEAD `7a1bf15cc1728724ab231dd713379f6ccf098ba8`. That registry uniquely contains active `puttery-nyc`. The old checkout's absent entry is not proof the client was removed. No registry or queue writes were made.

The shared hidden-task manifest now uses this build worktree. DataExports runs its existing read-upstream/write-local implementation. OperationalStatus now passes `-LocalOnly`: authenticated GET health, validated aggregates to protected `tock-dashboard-staged.json`, no remote POST and no overwrite of publication receipts. Registration defaults to this local-only behavior; `-PublishStatus` is an explicit future publication gate, not authorized by this checkpoint. Keep the build worktree present while these tasks depend on it.

Both actual scheduled routes returned 0. Export completed `2026-09-13T14:14:39.882Z`, HTTP 200, six files, 27,783 states, no filtered/invalid/conflicting rows. Staged dashboard checked `2026-09-13T14:17:05.664Z`: 27,785 combined states, 352 webhook states, 2,092 deliveries, 2,093 acknowledgements, no queued items/conflicts/tie mismatches. The historical one-counter difference remains unresolved and is not proof of a missing reservation. Last webhook in export reconciliation: `2026-09-13T14:12:03.301Z`.

## Source and access matrix

| Source | Current evidence and integrated scope | Boundary |
| --- | --- | --- |
| Tock exports and webhooks | Fresh protected ledger and merged aggregate snapshot; NYC 37824 / group 28086; Eastern service dates. 839 states in Aug 14 through Sep 12; 20 contain recognized campaign field names. | States are not guests, paid conversions or completed visits. No guest export downloaded; no raw payload or signed URL persisted by this refresh. |
| GA4 | Direct connector property 276233773, account 121645510, Puttery GA4, editable flag true; America/Chicago, USD. Complete 19-row path-scoped event query saved in `ga4-nyc-evidence-2026-09-13.json` and summarized in the existing dashboard source card. | Shared property: filter exact NYC website page and NYC Tock path prefix. 18,786 website page_view, 24,200 Tock page_view, 594 purchase and 592 reservation events for Aug 14 through Sep 12. Do not sum purchase/reservation or join Central event dates to Eastern service dates as a funnel. Exact stream, transaction matching and consent remain unverified. Saved extract, not scheduled GA4 ingestion. |
| GTM web | Live Chrome Puttery account 6004183424, container 47115929 / GTM-KMZKBB3, workspace 89, six existing additions untouched. | Diagnostics show additional domains and untagged pages. No preview setup, tags or publication changed. |
| GTM server | Live Chrome container 206812175 / GTM-TDT2KKP9, workspace 2, no pending changes and no tags. | Server implementation and production measurement changes require approval. |
| Google Ads | GA4 links customer 9097587272. Direct API identity request denied, request `ovvHQtzgUW3I49WHB_U1cw`; not in directly accessible customer discovery. | No verified NYC campaign map/spend source integrated. Manager-route access not exhaustively tested; do not equate a direct denial with absence of all possible access. |
| Meta | Current Chrome login flow reaches saved Dillon profile; Continue did not establish an authenticated business session. Sep 10 inventory observed pixel 1474762070796886. | Exact portfolio, account, dataset ownership and reporting remain unverified. No owner password used. |
| Website/CMS | Existing Sep 8 public NYC route evidence retained. | No fresh authenticated CMS read established; historical route observation is not CMS access. |
| Tripleseat, Toast, CRM | Historical public Tripleseat form 19291 and source plans retained. | No exact approved private venue data source/destination established. No guest/CRM upload or synthetic revenue added. |

Coverage is bounded to these supported connector checks, current Chrome surfaces and exact local artifacts, not an exhaustive credential-vault or manager-hierarchy audit.

## Implementation and checks

Changed outside the repository: `C:/Users/dillo/.codex/tools/hidden-scheduled-tasks.tsv` (only the two exact Puttery routes) and the existing `C:/Users/dillo/Documents/Codex/work/puttery-nyc-20260827/Puttery_NYC_2_5_Week_Build_Monitor.md`.

Within `2026-09-08-tock-integration`: `Refresh-TockStatus.ps1`, `publish-dashboard-status.mjs`, `Register-TockIntegrationTasks.ps1`, `prepare-dashboard-release.mjs`; new `check-local-only.mjs`, `ga4-nyc-evidence-2026-09-13.json` and this checkpoint.

Within sibling `2026-09-04-dashboard-motion-restored/public`: `dashboard-data.js` now reads the saved snapshot before the live request so stale hosted data cannot replace fresher local evidence; `source-verification.json` integrates live access and NYC GA4 findings; regenerated `status.js` and `tock-summary.json`; `index.html` labels this review build as staged, not newly published.

Passed: actual scheduler export/status return codes 0; receiver 14/14; relay 18/18; export `check.mjs`; `check-dashboard.mjs`; new `check-local-only.mjs` proves only health GET, staging receipt created, publication receipt untouched; Git diff whitespace check. Existing live-release check intentionally not run because it POSTs and asserts old hosted release/download fixtures.

Rendered in the supported browser at a loopback-only preview. Verified fresh 27,785 history / 839 selected-period counts, service-date trend, enabled aggregate downloads, updated GA4/GTM cards and explicit saved-snapshot status despite stale remote feed. Screenshot visually inspected. Mobile layout and download file readback were not repeated in this run.

Public status was read again at approximately 14:21 UTC and remains unchanged: checkedAt `2026-09-10T00:42:06.343Z`, exportCheckedAt `2026-09-09T19:01:03.239Z`. Local staging has not repaired the hosted snapshot. No commit, push, deployment, client message, spend, account grant or production measurement change occurred.

## Safe continuation and real gates

Local status task stages every five minutes. Export schedule remains 03:00 and 15:00 Eastern. Rebuild the review snapshot using `node prepare-dashboard-release.mjs --local-only` in this integration directory. Local static files are a packaged snapshot, not a live mirror of each scheduled staging run.

Next consequential gate: approve exact aggregate dashboard/status publication and hosting deployment. Separately validate one consented tagged booking, authoritative GA4 stream, NYC advertising scope, attendance/value/refund definitions and two venue days against financial source evidence before enabling conversion feedback or revenue claims. Resolve exact Meta/CMS/venue-source access through invited user accounts, never owner passwords. Deposit settlement is a separate commercial issue, not a blocker to safe local build work.
