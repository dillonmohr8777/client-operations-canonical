# Impeccable release exception — 2026-08-21

## Scope

This exception applies only to the final Impeccable detector result for the two hardcoded BigOrange review experiences under `wordpress/iterations/industry-signal` and `wordpress/iterations/primary-portfolio`.

## Detector result

- No `warning` findings remained after the copy and font cleanup.
- The detector returned 141 `advisory / quality` findings and exit code 2.
- The remaining findings are literal color, fluid type endpoint, and radius values across the two pre-existing art-directed stylesheet layers. They represent the established dual-surface visual system and responsive interpolation, not newly introduced component drift.

## Why the exception is narrow

Replacing every literal in the legacy base layers immediately before deployment would be a high-risk mechanical refactor with no corresponding visual benefit. The new branded icon geometry uses the documented one-rem module radius, the approved BigOrange palette, Unbounded display type, and Manrope body type. `DESIGN.md` has been refreshed to document the shorter opening sequence and dimensional citrus icon treatment.

## Release evidence

- Both pages were inspected in the real browser at 390×844, 768×1024, 1024×768, and 1440×900.
- Both pages reported zero document-level horizontal overflow at every tested width.
- All referenced images loaded with non-zero natural dimensions.
- Mobile navigation, horizontal rails, workspace tabs, FAQ disclosures, and exact-logo particle handoffs were exercised.
- Browser console inspection returned no errors.
- Both exact-logo handoffs resolved to the verified 1000×338 source asset in a dedicated bottom chamber.

This exception does not waive visual QA, accessibility behavior, content accuracy, or future token cleanup. It accepts only the detector's remaining advisory-level literal-token findings for this release.
