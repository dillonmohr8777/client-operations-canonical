# Accessibility audit

Both builds, desktop (1440×900) and mobile (iPhone 13), checked in headless
Chromium via `tools/qa.mjs`. Contrast computed from sRGB relative luminance, not
estimated.

## Contrast — every text/surface pair in use

| Pair | Ratio | AA body (4.5:1) | AA large (3:1) |
|---|---:|---|---|
| paper `#FCFCFC` on canvas `#050810` | 19.52:1 | PASS | PASS |
| paper on `--paper-1` `#0a1220` | 18.27:1 | PASS | PASS |
| paper on `--paper-2` `#0f1b2e` | 16.83:1 | PASS | PASS |
| gold `#F1B31E` on canvas | 10.69:1 | PASS | PASS |
| gold on `--paper-1` | 10.00:1 | PASS | PASS |
| gold on `--paper-2` | 9.21:1 | PASS | PASS |
| `--blue-300` `#72BADE` on canvas | 9.34:1 | PASS | PASS |
| `--blue-300` on `--paper-2` | 8.05:1 | PASS | PASS |
| `--ink-2` (72% paper) on canvas | 10.21:1 | PASS | PASS |
| `--ink-3` (52% paper) on canvas | 5.88:1 | PASS | PASS |
| ink `#050505` on gold — the CTA | 10.88:1 | PASS | PASS |
| `--blue-500` `#2A80C2` on canvas | 4.73:1 | PASS | PASS |

`--blue-500` is the tightest pair at 4.73:1. It is used for **strokes, wireframe
and UI edges only**, never for body text, so it is never load-bearing for reading.
Glass surfaces are backed by a tinted fill and fall back to opaque `--paper-2`
where `backdrop-filter` is unsupported, so no text ever depends on what happens to
be behind the panel.

## Structural checks — automated, both designs, both viewports

| Check | Design A | Design B | Review hub |
|---|---|---|---|
| Exactly one `<h1>` | PASS | PASS | PASS |
| Skip link is the first focusable element | PASS | PASS | PASS |
| No heading level skipped | PASS | PASS | PASS |
| Every non-decorative image has alt text | PASS | PASS | PASS |
| No broken images | PASS | PASS | PASS |
| Every `<img>` has `width`/`height` (CLS protection) | PASS — 0 missing | PASS — 0 missing | PASS |
| No `outline: none` / `outline: 0` anywhere | PASS | PASS | PASS |
| No horizontal overflow on `<body>` | PASS | PASS | PASS |
| No console errors (excluding sandbox-blocked fonts) | PASS | PASS | PASS |

## Keyboard

- **Skip link** first in the body, becomes visible on focus, jumps to `#main`.
- **`:focus-visible`** is a 2px gold outline with 3px offset, applied globally. `outline: none` is never used — the house standard forbids it and the QA harness fails the build if it appears in any stylesheet.
- **Mobile menu** is a real focus trap: Tab cycles within the panel, `Escape` closes and returns focus to the trigger, and `body` scroll is locked while it is open.
- **Design B's swipe deck** is keyboard-operable three ways: the track is `tabindex="0"` with `ArrowLeft`/`ArrowRight` handlers, there are visible prev/next buttons at 44×44px, and every card's link is reachable by Tab in document order. The deck is **native overflow scrolling** — the page never steals the wheel, so nothing is scroll-jacked.
- **FAQ** uses native `<details>`/`<summary>`, so it is keyboard- and screen-reader-native with no custom ARIA.
- **Video** is a `<button>` facade that swaps in the iframe on activation, so keyboard users reach it in normal tab order.

## Touch targets

Every control is at least **44px** tall: `.btn` has `min-height: 44px`, the menu
button and deck buttons are 44×44, `<summary>` carries `min-height: 44px`, and
form inputs are `min-height: 44px`.

## Motion

- A persisted **"Motion on / Motion off"** toggle ships in both navs, carrying `aria-pressed`, stored in `localStorage`, and degrading gracefully when storage is unavailable.
- `prefers-reduced-motion: reduce` is honoured **independently** of the toggle: it kills all animation and transition durations, removes reveal transforms, and suppresses the particle canvases entirely so the real text and the real logo render plainly.
- Design A's boot overlay **never renders at all** under reduced motion.
- Every scroll-driven effect sits inside `@supports (animation-timeline: view())` and `@media (prefers-reduced-motion: no-preference)`. Engines without scroll timelines — Firefox stable as of August 2026 — simply show all content, which is the correct failure mode.
- Stroke-drawn art (Design B's 360 ring, the ST/04 wires) resolves to its **finished** state when motion is off. Killing the animation alone would have left it undrawn and invisible; that was found in review and fixed.

## Works without JavaScript

Both pages are readable, navigable and submittable with JS disabled:

- Reveal states are applied only under `[data-js]`, which the script sets. No JS ⇒ nothing is hidden.
- Design B's rail falls back to a static full-height stroke.
- Design A's globe renders as static SVG; the parallax planes read `--px`/`--py`, which stay `0`.
- The particle canvases are additive — the real logo `<img>` and the real numbers are in the DOM and simply stay visible.
- The contact form is a plain `POST` to Netlify with a honeypot; no JS is required to submit it.

## Semantics

`<header>` / `<main id="main">` / `<section>` / `<figure>`+`<figcaption>` /
`<address>` / `<footer>`, with `aria-labelledby` on every titled section,
`aria-label` on landmark sections without a visible heading, `aria-hidden="true"`
on decorative flourishes (the rail, the globe SVG, the station nodes), and
`ProfessionalService` JSON-LD in both heads.

## Not covered here

- **Screen reader testing with a real AT** (NVDA/JAWS/VoiceOver) has not been performed. The automated checks cover structure, not experience.
- **Colour-blindness simulation** has not been run. The palette does not rely on hue alone for meaning — gold always co-occurs with position, weight or a label — but this should be confirmed visually.
- Per the house maker/checker rule, **the identity that built this cannot sign off its own visual review.** An independent pass is still required.
