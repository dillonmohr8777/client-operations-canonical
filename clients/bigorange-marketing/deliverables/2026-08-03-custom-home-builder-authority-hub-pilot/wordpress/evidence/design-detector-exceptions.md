# BigOrange design-detector review

## Verdict

The detector returned exit code 2 with 42 non-error findings: 22 warnings and 20 advisories. The page has zero detector errors. The remaining findings are accepted only for the narrow reasons below and were checked against the rendered WordPress drafts at desktop and mobile widths.

## Accepted findings

- `cramped-padding`: false positives on full-bleed section shells. Visible copy sits inside `.wrap`, Gutenberg inner groups, or media-text content with 24 to 130 pixels of inset. Desktop and 390 pixel screenshots show no text touching a boundary.
- `low-contrast`: static-parser false positives caused by Cover overlays, inherited Gutenberg group colors, and nested dark fields. Browser-computed styles show white copy on dark fields, white CTA copy on Deep Orange or Builder Ink, and the orange text link on Builder Ink. No rendered white-on-white or black-on-ink text was found.
- `design-system-font-size`: the larger endpoints are a page-specific cinematic display treatment for the user-requested full-experience variant. Raleway, Open Sans, weights, color tokens, and the documented `-0.04em` tracking remain inside the BigOrange system. These sizes are not promoted as new global tokens.
- `design-system-color`: the remaining values are translucent photographic overlays and neutral elevation alphas, not new brand colors. Solid surfaces use the documented BigOrange palette.
- `cream-palette`: `#f6f2ea` is the documented BigOrange Drawing Paper token, not a generic beige substitution.
- `overused-font`: Open Sans is the verified incumbent BigOrange body face and DESIGN.md explicitly requires retaining it.
- `marquee`: the narrow signal ribbon is the requested left-to-right motion element, contains no unique information, is `aria-hidden`, and stops effectively under `prefers-reduced-motion`.
- `flat-type-hierarchy`: the detector compresses fluid computed sizes into a misleading sample. Rendered hierarchy uses a large Raleway display, distinct section headlines, titles, body copy, labels, and captions.

## Rendered checks

- WordPress draft 5546: Draft, six builder images, no horizontal overflow, no console errors.
- WordPress draft 5572: Draft, swipe rail works, exact-logo particle canvas renders, no horizontal overflow, no console errors.
- Desktop viewport: 1280 by 720.
- Mobile viewport: 390 by 844.
- All image elements have alternatives; decorative motion is hidden from assistive technology.
- Keyboard focus styles and reduced-motion fallbacks are present.
