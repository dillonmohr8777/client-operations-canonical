---
name: client-logo
description: Pull a client's real logo from their own site, clean it into a full asset set (trimmed, background knocked out, white and ink versions, monogram split, contrast checked), and give it motion as MP4, transparent WebM, GIF and CSS. Also emits a ready brand file for the client-deck skill. Use when asked to get, find, fetch, extract, clean up, recolor or animate a client or company logo, build a brand kit, or set up a new client's brand assets.
---

# client-logo

Name a domain, get that client's real logo, cleaned properly, in every version you need,
with a motion sting on the end.

```bash
node ~/.claude/skills/client-logo/logo.mjs kit needmomentum.com --out ./brand --brand momentum-digital
```

That one command pulls, renders, animates and writes a `<brand>.brand.json` the
`client-deck` skill can load. The four stages also run on their own:

| | |
|---|---|
| `pull <domain> --out DIR` | Find and download logo candidates, with provenance |
| `render <file> --out DIR` | Trim, knock out, recolor, split, resize, contrast check |
| `animate <renderDir> --out DIR --style rise\|sweep\|stamp\|wipe\|split` | MP4, transparent WebM, GIF, CSS |
| `kit <domain> --out DIR` | All three, plus the brand file |

## Provenance is the whole point

Assets come from the client's own domain and nowhere else. Every file lands in
`provenance.json` next to the URL it came from and why that candidate scored highest. No
third-party logo APIs: they serve stale marks, pre-rebrand marks, and sometimes a
different company's mark entirely. Shipping the wrong logo to a prospect is worse than
shipping no logo.

## Most real sites will block the direct fetch

Agency and small business sites sit behind SiteGround, Cloudflare or similar, which answer
a scripted request with a challenge page. `pull` detects that and says so instead of
parsing 200 bytes of meta refresh as a homepage. Two ways through:

1. Open the site with the browser tool, save the HTML, then `pull <domain> --html page.html`.
   Discovery runs on the saved markup; downloads still go direct, which usually works
   because asset hosts are less guarded than page routes.
2. If the asset host is guarded too, fetch the image bytes inside the browser
   (`fetch(url).then(r => r.blob())`, then FileReader to a data URL), write them to disk,
   and run `render` on that file. Skip `pull` entirely.
3. If you already know the logo URL: `pull <domain> --asset <url>`.

## What "renders perfectly" means here

`render` does the work that separates a usable asset from a screenshot of one:

- **Background knockout.** If all four corners agree on one opaque color, that color is
  removed with a tolerance, so a JPEG or flattened PNG logo comes back transparent.
- **True trim.** Cropped to the ink bounding box, not to whatever padding the file had.
  A logo with baked-in whitespace sits wrong in every layout it is dropped into.
- **Color versions.** Full color, white knockout, and dark ink, each preserving the
  antialiased edges rather than hard-thresholding them.
- **Lockup split.** Finds the gap between a monogram and its wordmark by comparing the
  widest column gap against the median of the others, so it splits a real lockup and
  leaves an evenly spaced wordmark alone. Emits `mark`, `wordmark` and their color
  versions when the split is convincing, and says nothing when it is not.
- **Palette.** Ranks ink colors by frequency weighted by saturation, so the primary is the
  brand color rather than an antialiasing artifact. Reports `null` for an achromatic mark
  instead of inventing a color.
- **Contrast.** WCAG ratios against white and against dark navy, with a warning naming
  which version to use where. Stripe's mark scores 18.73:1 on white and 1.04:1 on dark,
  which is exactly the case where a knockout is not optional.
- **Sizes.** 2400, 1200, 600 and 300px wide, re-rasterized from the vector when there is
  one so nothing is upscaled.

Everything is described in `logo.json`, including the numbers above.

## Motion

Five stings, each about two seconds, each built from the client's own palette. All
tasteful: no glow, no orbs, no bounce.

- **rise** (default): the mark scales up and settles just past its size, with a
  brand-color rule drawing underneath it
- **sweep**: the mark settles, then a brand-color specular band travels across it. The
  band is masked to the mark with an `atop` blend, so it lights the logo and never the
  ground. This is the one that reads as "pop"
- **stamp**: the mark drops in from above and lands hard, then a rule snaps out from the
  centre
- **wipe**: a brand-color bar sweeps across and leaves the mark behind it
- **split**: the monogram lands, then the wordmark slides out from behind it (needs a
  lockup split)

Landings use an out-back curve that overshoots slightly and settles. The overshoot is
deliberately small: a logo that visibly bounces looks cheap.

Each writes four files:

- `logo-<style>.mp4` for decks, ads and social
- `logo-<style>-alpha.webm` with real transparency, for overlaying on video
- `logo-<style>.gif` for email and chat
- `logo-motion.html`, CSS only with the logo inlined, which honors
  `prefers-reduced-motion` and needs no video file at all

Ground defaults to a deep tint of the brand color. Pass `--light` for white.

## Chaining into client-deck

`kit` writes `<brand>.brand.json` in the shape `client-deck` expects, with the palette
derived from the real logo and `aspect` and `markAspect` measured rather than guessed.

```bash
cp brand/<id>.brand.json ~/.claude/skills/client-deck/brands/<id>.json
mkdir -p ~/.claude/skills/client-deck/assets/<id>
cp brand/logo*.png brand/mark*.png ~/.claude/skills/client-deck/assets/<id>/
```

Then set `name`, `contact` and `titleWidth` by hand. **Always check the derived palette
against the client's own brand guide before anything goes to a prospect** — colors sampled
from a compressed PNG are a good starting point, not an authority. `kit` prints this
reminder for the same reason.

## Requirements

`sharp` is installed inside this skill. `ffmpeg` must be on PATH for `animate`; `pull`,
`render` and the CSS output work without it.
