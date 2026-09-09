# NYC Entertainment Portfolio · Attribution Pass — redesign

Full design rebuild of the deployed proof at
`https://nyc-entertainment-attribution-dashboard-20260804.netlify.app/`.

**Drop-in replacement.** Filenames match the live deploy (`index.html`,
`styles.css`, `app.js`), so this replaces the site's contents directly with no
path changes.

| File | What it is |
|---|---|
| `index.html` | Markup. No-JS state matches the portfolio 30-day model exactly. |
| `styles.css` | Design system. Tokens first, encoding contract in the header comment. |
| `app.js` | Model + render. `derive()` is the only place a dependent number is produced. |
| `netlify.toml` | Publishes the folder, sets `X-Robots-Tag: noindex, nofollow`. |
| `DESIGN.md` | What changed, why, and what the validator rejected. Read this first. |
| `verification/` | Screenshots, palette validation, contrast sweep, invariant checks. |

## Run it

```bash
npx http-server -p 8080 .    # then open http://127.0.0.1:8080
```

No build step, no dependencies.

## The headline changes

1. **An encoding contract.** One ordinal blue ramp carries every quantity;
   brand orange is chrome only and never encodes data; status is always
   glyph + word + ink, never hue alone. The old build used orange for the logo,
   route line, active tab, stage numbers, action indices and the ROAS figure at
   once, so it signalled nothing.
2. **Charts, where there were none.** A coverage meter that makes the `61%`
   checkable on its face, a four-stage pass whose ribbon thickness carries the
   pass-through rate, a two-bar reconciliation on one dollar axis, and a
   readiness matrix of sources × gates. Every one has a table-view twin.
3. **Data integrity.** The live page shows `$28,470` booked in HTML against
   `$9,000` in its model, and `8.0×` ROAS against the 2.1× the model implies —
   two copies of every figure that had drifted. Now derived from one source.
4. **The page's own rule, honoured.** Booked value and Toast net sales are
   different economic stages, so they are no longer rendered as one continuous
   equation. The `+` / `=` row appears only where the arithmetic is valid.
5. **Layout defects fixed.** Venue names were being clipped mid-word
   ("HIGH LINE CO…"), `ALL` collided with `PORTFOLIO`, the `Unmatched` stamp
   overflowed its box and pushed the page 8px wide, and the rails squeezed each
   pass stage to 112px on a 1512px screen.
6. **Themes, motion, a11y.** A real daylight/midnight toggle that beats the OS
   setting both ways, deep-linkable state, keyboard shortcuts, `tablist`
   semantics with roving tabindex, reduced-motion and forced-colors support.

## Verification

Everything in `verification/` is reproducible from this folder.

- `viewport-theme-checks.txt` — 4 widths × 2 themes: no horizontal overflow, no
  console errors, no content stranded at `opacity: 0`. All 8 clean.
- `model-invariants.txt` — 6 venues × 2 periods: `matched + unmatched =
  collected`, legend total = collected, meter segments = 100%. All 12 hold,
  including the zero-valued blocked venue.
- `palette-validation.txt` — the shipped ramp passing all four ordinal checks on
  both paper surfaces, plus the two candidate palettes the validator rejected.
- `token-contrast.txt` — WCAG sweep of every token pair. Note it records that
  **the original passed AA on every pair measured**; contrast was not one of its
  defects, and the new tokens are held to the same bar.
- `00-before-desktop.png` vs `after-*.png` — before/after at each width.

## Caveats

Every figure is modeled. Nothing here is live data, and the readiness states are
the documented capability states from the original copy — not new facts about the
accounts. See "Known limits" in `DESIGN.md`.
