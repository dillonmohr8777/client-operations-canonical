# Onsite Google Ads call-volume recovery

Prepared: 2026-08-12  
Status: live audit complete; account changes not applied  
Scope: Google Ads account `103-371-5894` only  

## Google Ads history reviewed

The exact Onsite account was checked across three continuous 28-day windows reaching from May 21 through August 12, 2026. The first window overlaps June 1 through June 17 and is included to establish the early-June pattern.

| Google Ads window | Spend | Clicks | Impressions | Google-reported conversions | What the conversion column contained |
| --- | ---: | ---: | ---: | ---: | --- |
| May 21 to June 17 | $200.71 | 672 | 20,808 | 19.00 | 10 form events and 9 phone events across Smart and Performance Max |
| June 18 to July 15 | $249.08 | 1,057 | 35,399 | 46.01 | 11.01 form events and 35 phone events across Smart and Performance Max |
| July 16 to August 12 | $127.29 | 653 | 20,891 | 21.99 | All 21.99 events came from the now-paused Performance Max campaign; the active Smart campaign reported zero conversions |

Google therefore reported 87 conversion events across these overlapping history windows, but they cannot be presented as 87 estimate leads. The account has 14 enabled conversion actions, including duplicate Primary actions for forms, calls, contacts, and click-to-call behavior. Several are inactive or have no recent activity, and Enhanced Conversions is not recording. Platform event totals have not been reconciled to named callers, accepted form receipts, or booked estimates.

## Timeline and material findings

- From May 21 through June 17, the Smart campaign spent $104.94 for 555 clicks and reported 2 phone events. Performance Max spent $95.77 for 117 clicks and reported 17 events: 10 web-form events and 7 web-phone events.
- From June 18 through July 15, the Smart campaign spent $131.21 for 789 clicks and reported 2 events: 1 form and 1 phone. Performance Max spent $117.87 for 268 clicks and reported 44.01 events: 10.01 forms and 34 phone events.
- A separately preserved July 6 to July 12 pull showed 2 reported forms and 6 reported calls on $52.66 in spend. Those were never reconciled to qualified estimate requests.
- The July 20 to July 26 source pull showed 344 clicks, $60.36 in spend, and 6 platform events, again without named-contact validation.
- Google Ads delivery stopped during August 3 to August 9 while the account was reconfigured and under review. Approval cleared on August 10 and delivery resumed.
- From July 16 through August 12, the active Smart campaign spent $68.20 for 504 clicks and reported zero calls and zero conversions. The paused Performance Max campaign spent $59.09 for 149 clicks and carried all 21.99 reported events in the account.

The active Smart campaign currently:

- optimizes for clicks rather than qualified estimate calls;
- sends traffic to the general website rather than the dedicated paid-search landing page;
- uses broad themes spanning landscaping, concrete work, restoration, driveways, sidewalks, pavers, and cement landscaping;
- has only two negative themes, `napa cement yard` and `athens concrete`;
- targets Davis, Dixon, Fairfield, Napa, Suisun City, Vacaville, Winters, and Solano County and can also deliver through location-interest signals;
- has incomplete conversion setup and reported zero calls in the current review window.

The dedicated paid-search landing page is live at `https://onsite-gads-landing-page.netlify.app`, but the active Smart campaign is not using it. Its current local tracking records a phone event on a phone-button click and a form event at submit time, before a successful downstream receipt. Those events must remain secondary until connected-call and accepted-form evidence exists.

## Exact recovery change set

No budget increase is proposed.

1. Keep the existing Performance Max campaign paused.
2. Replace the click-optimized Smart campaign with a tightly controlled Search campaign built paused first, using Phrase and Exact high-intent service-plus-location terms.
3. Use the existing $4.39 daily ceiling until qualified estimate data supports a different decision.
4. Route paid traffic to the dedicated Onsite landing page and preserve `gclid`, `wbraid`, `gbraid`, and UTM values.
5. Use only accepted form receipts and connected service-fit calls as lead candidates. Keep phone clicks, form starts, test submissions, duplicates, directions, and other micro-actions secondary.
6. Reduce campaign Primary goals to the verified estimate path and remove duplicate form, phone, contact, and click actions from bidding optimization.
7. Add negative coverage for employment, training, DIY, research, supplier and material-yard, competitor, free, cheap, and other clearly irrelevant intent after search-term review.
8. Split concrete and landscaping intent so each can be measured, written, and routed separately.
9. Use physical-presence targeting for the approved service area in the Search rebuild.
10. Verify call assets, business-hour coverage, connected-call duration, landing-page form receipt, Enhanced Conversions, and downstream lead disposition before enabling.

## Required approval before live changes

The canonical Onsite launch authority remains draft-only and does not currently permit Google Ads mutation. Exact approval is required for conversion-goal edits, keyword and negative changes, campaign creation or replacement, targeting changes, and the landing-destination change. The proposed boundary is: no spend increase, no Performance Max reactivation, build the replacement paused first, validate tracking, then enable only after live readback.
