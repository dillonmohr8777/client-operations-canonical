# Replenish location-isolation matrix

Prepared: 2026-07-16  
Scope: Google Ads, Replenish / 7-Eleven only  
Status: local redacted correction build; no provider or page mutation authorized

## Outcome

Every Replenish campaign in the current exact-account readback now has its own location row and an explicit isolation rule for page, copy, assets, phone details, conversion handling, and campaign state. The current readback contains six Replenish rows: four enabled and two paused. Fresh Blends and Kwik Trip campaign data, store identifiers, assets, pages, budgets, and performance are excluded from this artifact.

This matrix covers the six exact Replenish rows present in `state/paid-media/daily-readback-2026-07-16.json`. It does not silently treat older communication counts or unseen account rows as current. Any additional Replenish row found in a later complete account export must receive a new isolated row before the inventory can be reused.

## Evidence legend

- **Verified:** present in the July 16 exact-account readback or canonical Replenish context.
- **Proposed:** safe local build direction supported by the Replenish blueprint, not a live setting.
- **Blocked:** exact location, page, phone, asset, or conversion detail is absent and must not be guessed.

## Current location matrix

| Observed campaign name | Current state | Canonical location identity | Isolated page | Isolated copy and assets | Phone detail | Conversion row | Local readiness |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `Replenish \| PMAX \| Boca \| Consumer Foot Traffic` | Paused, verified | Boca label verified; exact store identity and address blocked pending readback | Exact Boca final URL blocked; only a verified Boca location page may be attached | Boca-only export and asset audit required; do not reuse this row as a clone source | Omit until exact Replenish ownership, destination, and location fit are verified | `directions_click` proposed primary; `store_detail_view` and `outbound_map_click` proposed secondary; live configuration and deduplication blocked pending test | Correction-only; remain paused unless a separately approved restart is recorded |
| `Replenish \| PMAX \| Coral Springs \| Consumer Foot Traffic` | Enabled, verified | Coral Springs label verified; exact store identity and address blocked pending readback | Exact Coral Springs final URL blocked; no other city path may be attached | Coral Springs-only campaign and asset export required; current asset completeness is not assumed | Omit until exact Replenish ownership, destination, and location fit are verified | Same proposed event contract; current primary, counting, attribution, and last-recorded state require readback | Local audit ready; no live edit or state change authorized |
| `Replenish \| PMAX \| Miami 56 \| Consumer Foot Traffic` | Enabled, verified | Miami verified; the meaning of `56` is unverified and must not be presented as a store fact | Exact Miami final URL blocked; the page must identify Miami and the verified store before use | Corrected Miami copy draft exists in `miami-asset-draft-2026-07-16.json`; current cross-location material is excluded from the draft | Omitted from the draft until exact ownership, destination, and Miami fit are verified | Same proposed event contract; one mobile directions action must record exactly once before eligibility | Local draft ready for source and mobile QA; no live edit authorized |
| `Pampano Campaign` | Enabled, verified | Exact interface spelling retained; canonical location spelling and store identity are blocked pending verification | No page may be selected until the canonical location and exact store are verified | Copy and asset drafting blocked; do not silently normalize the observed name or infer another city | Omit until the canonical location and exact phone ownership are verified | Event contract cannot be bound to a location until identity is resolved | Identity readback required before any correction packet can advance |
| `Replenish \| PMAX \| Carmel Mountain 19223 \| Consumer Foot Traffic` | Enabled, verified | Carmel Mountain label verified; the meaning of `19223` and exact store identity are blocked | Exact Carmel Mountain final URL blocked; the numeric token must match the verified page before use | Carmel Mountain-only campaign and asset export required; do not place the numeric token in ad copy without source proof | Omit until exact Replenish ownership, destination, and location fit are verified | Same proposed event contract; current configuration and deduplication require readback | Local audit ready; no live edit or state change authorized |
| `Howard Camaign` | Paused, verified | Exact interface spelling retained; canonical campaign name, location spelling, and store identity are blocked | No page may be selected until the canonical location and exact store are verified | Copy and asset drafting blocked; do not infer a corrected name from the typo | Omit until the canonical location and exact phone ownership are verified | Event contract cannot be bound to a location until identity is resolved | Identity readback required; remain paused unless a separately approved restart is recorded |

## Isolation contract

1. One verified location maps to one campaign, one location-specific asset group, one final page, one location asset bundle, and one conversion row.
2. The exact campaign names above remain observation evidence. Proposed normalization is never applied to the live account without approval and readback.
3. A location page must show the same city and verified store identity in the title, primary heading, store details, directions action, metadata, and structured data. A missing exact destination blocks the build.
4. A location asset group may contain only that location's approved headlines, descriptions, images, logo, video, audience signals, search themes, sitelinks, and call assets.
5. Account-level sitelinks, domains, or phone details are excluded unless their Replenish ownership and exact location fit are verified. The safe default is omission.
6. The proposed primary event is `directions_click`. `store_detail_view` and `outbound_map_click` remain secondary. One user directions action must not increment more than one primary conversion.
7. The campaign state shown above is readback evidence, not authority to restart, pause, enable, rename, or change budget.
8. No Fresh Blends or Kwik Trip content may enter a Replenish export, page, asset, conversion, recommendation, or performance conclusion even when both routes are visible in one child account.

## Miami correction boundary

- Proposed campaign name: keep the observed campaign name until `56` is verified.
- Proposed asset-group name: `Miami`, but only after the exact Miami store identity is verified.
- Final URL: blocked until the exact Miami location path and production owner are read back.
- Phone: intentionally absent from the local draft.
- Sitelinks: labels are drafted, but destinations remain blocked until exact approved Miami or Replenish paths exist.
- Copy: only Replenish, Miami, 7-Eleven, the verified real-fruit proposition, location details, and directions intent are used. No offer, price, hours, address, store number, nutrition value, or availability claim is invented.
- Visuals: required ratios and concepts are specified, but no unverified product, store, map, address, logo, or nutrition asset is treated as approved.

## Mobile QA contract

The landing-page source and exact Miami final URL are not mapped, so rendered QA is not claimed as complete. Before any page or campaign packet can advance, test the exact page at 360 by 800 and 390 by 844, plus one intermediate width.

- Miami and the verified store identity are visible before the first primary action.
- The Get Directions action is visible, reachable by keyboard, and has a usable touch target.
- There is no horizontal overflow, clipped copy, hidden action, overlapping element, or unreadable contrast.
- No other city, unrelated domain, unrelated phone detail, or mixed-brand content appears in visible text, metadata, structured data, links, or assets.
- Every page link stays on an approved Replenish or 7-Eleven destination for the exact Miami location.
- The page retains the approved source parameters through the directions action.
- One directions action records one `directions_click`; secondary events remain distinguishable and do not inflate the primary result.
- The page and action path load in under three seconds on the representative mobile test connection.
- Back, refresh, focus order, and error states preserve a usable path without duplicate event firing.
- A rendered mobile screenshot, event debugger record, link audit, and final URL readback are retained as verification evidence.

## Rollback and approval boundary

No rollback is needed for this local build because no external system was changed. If a future live correction is explicitly approved:

1. Export the current campaign, asset group, linked assets, final URLs, phone details, conversion settings, status, budget, and change history before mutation.
2. Preserve the export and a field-level change manifest under the approved client evidence path.
3. Run validate-only first. Create or edit a paused draft before any enablement.
4. Read back the exact campaign, page, assets, links, phone state, conversion state, budget, and policy result.
5. Roll back if the wrong city, store, domain, phone, asset, event, budget, or state appears; if the page fails mobile QA; if the event is missing or duplicated; or if policy or billing state changes unexpectedly.
6. Rollback means pausing the corrected draft, restoring the prior approved values from the export, reverting an approved page deployment to its prior artifact, and re-running exact readback. Do not remove the evidence trail.

Explicit current approval remains required for provider edits, page deployment, conversion or tag changes, campaign state changes, budget or bid changes, targeting, billing, restart, or client delivery.

## Source ledger

- `state/paid-media/daily-readback-2026-07-16.json#lane=google-ads--replenish-7-eleven`
- `clients/replenish-7-eleven/paid-media/correction-packet-2026-07-16-location-assets.md`
- `clients/replenish-7-eleven/paid-media/blueprints/google_ads.json`
- `clients/replenish-7-eleven/paid-media/launch-config.json`
- `clients/replenish-7-eleven/paid-media/launch-authority.json`
- `clients/replenish-7-eleven/context/operating-context.md`
