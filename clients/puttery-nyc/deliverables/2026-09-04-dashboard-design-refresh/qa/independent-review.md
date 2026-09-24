# Independent Puttery dashboard release review

Verdict: **PASS WITH NOTED RISK** for the existing static dashboard release. This does not approve production attribution, guest-data ingestion expansion, or conversion uploads.

Reviewed September 4, 2026, after the 7:03 PM ET operational evidence snapshot. Independent verifier made no source edits, deployed nothing, and sent no external communications.

## Independent observations

- Actual local preview at http://127.0.0.1:61484/ inspected through CUA at 1366 by 650 and 390 by 844. Current webhook status and the next action are visible in the opening viewport. Compact official Puttery branding, coherent outline icons, and restrained texture are materially clearer than the previous oversized hero.
- Desktop navigation scrolls in a short viewport instead of overlapping its footer. Mobile navigation remains a horizontal strip. No document-level horizontal overflow observed.
- All 69 question IDs and 10 integrations rendered. Platform/search filtering produced the expected Tock GA4 question and retained URL state. Answer status and naturally typed evidence notes survived reload. Reset restored view state. Temporary QA answer and note were restored to their previous blank/unanswered state.
- No console warning or error was captured during the independent browser pass. No ambient animations were active. Keyboard note entry, Tab movement, and native disclosure/select behavior worked.
- Modeled reporting is collapsed by default and explicitly labeled as demonstration data. Current webhook receipt and NYC filtering are dated; reporting, controlled-event confirmation, reconciliation, and Data Exports remain pending. Delivery counts are not represented as bookings or revenue.
- Final public copy was checked after the parent's last correction: Toast, Guest Profile, and Walk-in show Access review requested, while actual NYC usage and enablement remain unverified. Resy and Eventbrite remain separately labeled portfolio expansion.
- The deploy bundle contains exactly eight allowlisted files. No QA scripts, private reports, local filesystem paths, protected credential locators, tokens, or guest records were found in that bundle. Non-secret venue identifiers appear only in detailed engineering context. Noindex/noarchive headers and robots exclusion are retained; these are indexing controls, not authentication.

## Supporting maker evidence inspected

qa/inspection.json records 43 passing checks at 23:13:55 UTC, including desktop/mobile persistence, export compatibility, reset preserving answers, URL restoration, empty-filter recovery, visible focus, reduced motion, blocked-storage recovery, and zero axe violations. qa/inspect.cjs was read to confirm what those checks actually assert. These are maker test results, distinct from the independent observations above. Existing desktop/mobile screenshots in qa/ corroborate the visual state.

## Noted risks and detector exceptions

The installed v4.1.1 detector lacked HTML parser dependencies and its empty result is degraded evidence. A provisioned npx detector did parse HTML and produced 31 warning-level findings: eight low-contrast, twenty tiny-text, two cramped-padding, and one undersized-UI-text. This is not a clean detector result. The reported contrast pairs assume a white background for colors used on dark surfaces; the actual rendered surfaces and maker's zero-violation axe scans support a contextual exception for those pairs. Small secondary metadata and dense evidence labels remain a usability risk for low-vision users, although the primary status, action, question prompts, inputs, and navigation remained legible in the reviewed viewports. No detector checks were disabled.

Final resilience correction verified: the fallback Tock object in public/app.js now matches the dated status.js truth. It says Delivery received, keeps controlled-event confirmation and reconciliation pending, and never counts updates as separate bookings. This was a copy-only correction; CSS and behavior were unchanged. The maker records narrow detector exceptions in qa/detector-exceptions.md; the detector exit number was not captured and is not inferred here.

## Scores

Brand match 9/10; clarity 9/10; action clarity 9/10; factual support 8/10; accessibility 8/10; technical integrity 8/10. These are reviewer judgments, not measured performance claims.

## Verified public file hashes

The hashes below were calculated independently from public/ after the final access-request copy correction. Deploy only these files. The parent owns live readback and final release confirmation.
- _headers : cecb99788f31e1a27ab9a189bd21c68c759daca7bd15d77363abfe1927e86765
- app.js : d1344e47c9e1778719733a1ca0ee13a98837c0292f3e9aa5371e2444f4e7e7a0
- index.html : 15fefc57cd9370259221aab41b3245b448e958a2112ebef01e761921805a44e1
- robots.txt : 331ea9090db0c9f6f597bd9840fd5b171830f6e0b3ba1cb24dfa91f0c95aedc1
- status.js : 30e1d4c736d0e2d513df91af5ed5d8453666a40de150b1f04a2979f8f89a3fc3
- styles.css : 5fd2ec3ce5c9ca4302dd0ed9cabc4dba55d85df7fd14c3c0b028cf0bb60748bc
- assets\favicon.svg : 25f70f385f611bd00ced0ac0b8bfac7b79812f0736a51991ac552668fad42f05
- assets\puttery-logo.svg : f7f683b525b6e2fbe3c8eece9965b59412a65eb6be3a845857569f7c28ae5e64

