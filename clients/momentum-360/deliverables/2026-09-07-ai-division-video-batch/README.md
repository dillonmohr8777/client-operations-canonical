# Momentum AI division — video batch, 2026-09-07

Rendered locally with Remotion, zero Higgsfield credits spent. Source lives at
`philadelphia-service-world/assets/founder-collateral/remotion/src/paper/`,
a self-contained composition set (own `registerRoot` entry, never imports the
shared `theme/fonts.ts` that fetches Google Fonts at module scope, so it
renders offline).

## What's here

| File | What |
|---|---|
| `S01-intro-sting-16x9.mp4` | 3.5s. Mark resolves in, "Momentum AI", gone. |
| `S02-outro-sting-16x9.mp4` | 4.5s. Shared close card every other piece ends on. |
| `L01–L04-9x16.mp4` | 12s each. One film per lane: AEO/GEO, AI Design, AI Marketing, AI Automation. |
| `C-L01–L04-1x1.mp4` | 6s loop each. Carousel stills, one lane line + prop + mark. |
| `H01-hero-16x9.mp4` | Full division hero: positioning line, all four lanes in turn, close. |
| `H01-cut-16x9.mp4` | Same composition, shorter cutdown (positioning + close only) for feed placements. |
| `H03-scrapbook-9x16.mp4` | 19.8s. Tactical scrapbook assembly: real SVG turbulence torn cards, grain, Polaroid frames, ink bleed. |
| `H04-diagnostic-9x16.mp4` | 18.3s. Readiness diagnostic film: 6 facts, no scores, prescribing the AI Search Snapshot opener. |
| `M01-machine-9x16.mp4` | 4.0s. Social Short: "Built the machine. Now we build yours." (Dark navy theme, exact Momentum logo). |
| `M02-aeo-9x16.mp4` | 4.0s. Social Short: Lane 01 · AEO/GEO "Can AI systems read your site?" (Paper theme). |
| `M03-prototype-9x16.mp4` | 4.0s. Social Short: Lane 02 · AI Design "Working prototype in five days." (Paper theme). |
| `M04-motion-9x16.mp4` | 4.0s. Social Short: Lane 03 · AI Marketing "Still frames that refuse to stay still." (Navy theme). |
| `M05-spine-9x16.mp4` | 4.0s. Social Short: Lane 04 · AI Automation "Every lead, with a receipt." (Paper theme). |
| `M06-facts-9x16.mp4` | 4.0s. Social Short: Readiness Diagnostic "Six facts. Not a score." (Paper theme, signal orange badge). |
| `qa.py` / `qa-report.json` / `qa/*.sheet.png` | Contact sheets + a forbidden-hue scan (purple/violet, and orange beyond a small-accent area) on every piece. |

11 of the planned 12 pieces from the design spec. Not built: **H02, the "Meet
Momo" mascot piece** — mascot and founder-likeness pieces need Mac's and
Sean's written acceptance first, which doesn't exist yet, so it wasn't worth
building speculatively. The optional credit-gated live-action hero (the
fireworks-over-the-Art-Museum reference style) also wasn't built — it needs a
real generator and a separate go-ahead on spend.

## The one open design decision

**This batch departs from the launch-reset film DESIGN.md**, which bans
orange/yellow accents in films. The palette here is warm paper + the blue
family (`#2A7FC2`/`#155E86`/`#3897CC`) + exactly one signal-orange word or
accent per film (`#E27113`, always large-text-or-larger, never a fill, never
on navy) — matching the "paper-clay" reference style Dillon uploaded rather
than the existing launch-reset system. The QA scan confirms the restraint:
orange sampled at 0.0% of frame area on every piece (a small dot and a thin
eyebrow line, never a wash).

This is a genuine fork, not an oversight. To render the whole batch back onto
the DESIGN.md-compliant palette instead, change one constant:
`src/paper/theme.ts` → set `SIGNAL` to `BLUE_LIFT` and re-run the renders
below. Left as the paper/orange version because it's what the reference clips
actually looked like; Dillon's call which one ships.

## Provenance

Every wordmark is the composited PNG, never generated or drawn by a model.
Byte-verified: `public/paper-brand/momentum-logo*.png` are SHA-256-identical
to the canonical source at `~/.claude/skills/client-deck/assets/momentum-digital/`.

## Re-rendering

```bash
cd philadelphia-service-world/assets/founder-collateral/remotion
node node_modules/@remotion/cli/remotion-cli.js render src/paper/index.tsx <composition-id> out.mp4 \
  --concurrency=1 --gl=swangle --crf=18 --codec=h264 --x264-preset=medium \
  --image-format=jpeg --jpeg-quality=95
```

Composition ids: `S01-intro`, `S02-outro`, `L01-9x16` … `L04-9x16`,
`C-L01-1x1` … `C-L04-1x1`, `H01-hero-16x9`, `H01-cut-16x9`.
