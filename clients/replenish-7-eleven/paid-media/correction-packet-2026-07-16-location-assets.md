# Replenish location-isolation and asset correction packet

Prepared: 2026-07-16
Status: local redacted draft; live correction not authorized
Lane: Replenish Google Ads only; Fresh Blends and Kwik Trip Ice Box remain separate

## Decision

Do not clone, restart, or scale the current location pattern until the Miami and Boca contamination, unrelated destinations and phone details, and creative-signal gaps are corrected in a location-isolated draft and verified against current billing and delivery state.

## Verified facts

- Persistent Chrome verified the exact Replenish child-account route. The same child account also displays separately routed Fresh Blends Ice Box campaigns; sharing an account does not permit shared assets, budgets, locations, conversions, or reporting.
- The live review found Boca naming or copy inside Miami campaign material, including an incorrect asset-group name and stale city language.
- The live review found unrelated sitelinks and phone details that must not remain attached to Replenish work.
- Ad strength was incomplete, no video was present, and audience-signal coverage was missing. Search-theme coverage still requires an exact readback before correction.
- The Replenish pattern is location-level Performance Max using location-specific pages and Maximize conversions.
- Historical communication says South Florida campaigns were paused on July 14 and billing or restart remained unresolved. That history does not prove the current live state.
- The proposed primary event is `directions_click`; `store_detail_view` and `outbound_map_click` are secondary. Deduplication is required.
- The launch authority is draft-only. It allows local artifacts but no deployment, provider mutation, enablement, restart, or budget change.

## Hypotheses, not findings

- The defects may have come from cloning a Boca asset group without completing location-specific replacement.
- Unrelated sitelinks or phone details may be inherited account-level assets rather than campaign-level assets.
- Weak asset completeness and absent signals may be limiting relevance, but no performance impact is proven yet.
- A directions click may be modeled, duplicated, or unrecorded unless the current conversion configuration and destination behavior are read back.

## Required readbacks

1. Read current billing health and the exact enabled, paused, limited, and review states for every Replenish location campaign.
2. Export each campaign and asset group's name, city references, headlines, long headlines, descriptions, final URL, and location association.
3. Export every attached campaign-level and account-level sitelink, destination domain, call asset, and phone detail with its source and scope.
4. Read asset completeness, ad strength, image ratios, logo, video state, policy state, audience signals, and search themes for Miami and Boca separately.
5. Verify each final page at mobile size for city, store, directions action, phone details, unrelated links, tag state, and source retention.
6. Read the primary and secondary conversion actions, counting and attribution settings, last-recorded date, and deduplication behavior.
7. Keep Fresh Blends Ice Box rows excluded from every Replenish export, conclusion, and correction draft.
8. Read change history for cloning, asset attachment, URL, phone, location, campaign-state, and billing changes.

## Recommended local correction build

- Create a location-isolation matrix with one row per campaign: canonical location, asset-group name, approved city language, final page, conversion action, sitelinks, call asset, images, video, signals, themes, and current state.
- Rebuild Miami copy from verified Miami facts only and remove every Boca reference. Keep Boca material in the Boca row only.
- Restrict sitelinks and domains to approved Replenish or 7-Eleven destinations for the exact location.
- Use a phone detail only after ownership, destination, and location fit are verified; otherwise omit it from the draft.
- Complete the proposed asset set with 15 location-safe headlines, 5 long headlines, 5 descriptions, required image ratios, logo, and an approved video concept. Do not invent offers, store facts, or nutrition claims.
- Draft audience signals and search themes from approved store, product, and directions intent, then label them proposed until live approval.
- Preserve `directions_click` as the proposed primary event only after a mobile test proves one unique direction action records once.
- Run rendered mobile QA against the design standard before any deployment packet is eligible for review.

## Success criteria

- Miami contains no Boca or other-location text, name, page, sitelink, phone, asset, signal, or conversion association.
- Every linked destination and phone detail belongs to the exact Replenish location and approved brand path.
- Required assets are complete and policy-safe, with no cross-client material.
- One verified directions action records once and remains distinguishable from modeled direction values.
- Fresh Blends and Kwik Trip Ice Box remain absent from the Replenish packet and reporting.

## Approval-gated live actions

Explicit current approval is required before any of the following:

- replacing copy, names, sitelinks, domains, phone details, images, video, signals, themes, or conversion settings;
- changing billing, campaign state, budget, bids, targeting, or location scope;
- deploying a location page or tag change;
- restarting a paused campaign or sending a client communication.

## Evidence

- `clients/replenish-7-eleven/paid-media/blueprints/google_ads.json`
- `clients/replenish-7-eleven/paid-media/launch-config.json`
- `clients/replenish-7-eleven/paid-media/launch-authority.json`
- `clients/replenish-7-eleven/context/operating-context.md`
- `state/paid-media/daily-review-2026-07-16.json#lane=google-ads--replenish-7-eleven`
