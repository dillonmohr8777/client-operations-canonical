# Impeccable detector exception

The 2026-08-13 manual detector rerun covered all 25 standalone HTML pages after the closing-logo rebuild. The current detector returned exit code 2 with 1,161 findings: 810 warnings and 351 advisories across the recovered page systems.

This is a narrow exception for inherited visual-system findings outside the requested logo-interaction change. The largest groups are pre-existing wide shadows, colored glows, undersized legacy labels, low-contrast legacy palette combinations, auto-moving marquees, all-caps labels, and clipped decorative containers. Reworking those 25 independent systems in this pass would replace approved site-specific identities and materially expand the requested scope.

The detector returned zero findings whose selector or snippet referenced `logo-outro`, `ink-reveal`, `logo-outro-mark`, `data-magic-ink-logo`, the 26-pixel ink blur, or the 2.3-second filter transition. The new interaction mirrors the IMMOHRTAL reference values exactly: a 1.4-second opacity fade, 2.1-second scale settle, 2.3-second blur/contrast/saturation clear, and a 12-percent intersection threshold with an 8-percent lower viewport margin.

Both old circle-canvas systems were removed from markup and executable scripts. Reduced-motion users receive the final static logo with no transition. Static QA, 25-route HTTP and logo readback, desktop and 390-by-844 mobile browser inspection, reduced-motion emulation, focus-visible inspection, and console inspection passed.
