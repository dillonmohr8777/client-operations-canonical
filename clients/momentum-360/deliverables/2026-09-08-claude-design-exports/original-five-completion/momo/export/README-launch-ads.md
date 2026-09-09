# Export receipt — Momentum AI division launch ads

Four ads, one campaign, one register. Proposed concept work.

| # | Artifact | Motion language | Hero line |
| --- | --- | --- | --- |
| 01 | `Momentum AI Launch - Ask About.dc.html` | subtractive — the category's claims stamp in and are struck through | Give your competition something to ask AI about. |
| 02 | `Momentum AI Launch - Ambition Sold Separately.dc.html` | additive — a spec sheet ticks itself off until one line gets no tick | Everyone has access to AI. Not everyone has a plan. |
| 03 | `Momentum AI Launch - Your Ideas Called.dc.html` | accumulating time — a log stacks up with a climbing counter, then clears | Your ideas called. They're tired of waiting. |
| 04 | `Momentum AI Launch - Ask Anyone.dc.html` | a blinking wait — three seconds of dead air before an answer that isn't you | Be the name it says. |

Engines: `momo-ad-stage.js` (the element, and ad 01's own film) and
`momo-ad-specs.js` (ads 02–04). Each ad is 20.00s, 16:9 plus an authored 9:16.

Preserved untouched: the four mechanism films
(`Momo - Living Portfolio Film`, `Momo - First Assignment`,
`One Idea Everywhere`, `Inside the Living Portfolio`) and their engines.

## The strategy

Don Draper doesn't sell the projector. So these ads are not about AI — the
category's own language is the thing being pushed against, and the product
barely appears. The launch's Lucky Strike move: every agency is shouting *AI*,
so Momentum changes the ground and talks about *being chosen* instead.

Fear is implied, not named — the brief's call. Nobody is told they will be left
behind. The ads concede the obvious (everyone has the same tools) and then say
the only thing left that distinguishes anyone.

Copy lines 01 and 03 are the client's own, used as directed: the bite lands as
the hero beat, "Someday just lost its excuse." lands on an end mark.

## Why canvas 2D, not WebGL

These are typographic films. Drawing in canvas 2D means **the drawn frame is
the captured frame** — no shader between what you see and what records, and no
separate compositing path that can drift from the preview (the mechanism films
each maintain one). Type also stays razor sharp at any size.

## Determinism

Every beat opacity, strike extent, tick extent, typed-character count, caret
phase and type position is a pure function of `t`. Verified on all four: render
a beat, leave, return — byte-identical ink measurements.

`stage.timingContract` on each reports 20.00s, 30 fps, **601 frames**, its own
slug, poster time and motion description. `renderFrameAt(t)` is bounded by a
hard 2.5-second ceiling across at most three seek passes, so a stalled decode
cannot hang an export run.

## Media — one live decoder each

Momo appears **once, late, as relief**, in every ad — warmth after cold type,
never the emotional lead. Each ad plays a short window of
`uploads/3-higgsfield-fb393c2f…MP4` (Momo Reveal, 8.05s) used byte-for-byte,
and draws `assets/stills/reveal-a.png` — a frame baked from that same master —
until the decoder reports a delivered frame. He is drawn contained on midnight
so the full ceramic form and the chest emblem survive; never cropped to fill.

The source attaches once and is **retained**, paused outside its window.
Stripping `src` and calling `load()` aborts the pending load and leaves the
element in an error state, which is what raises a native media error — the bug
fixed across this project earlier. A decode failure falls back to the still
once, never retries, and reports in plain words in the page status.

Elements are inert: `controls=false`, `tabIndex=-1`, `aria-hidden`,
`disablePictureInPicture`, `disableremoteplayback`. Texture sources, not players.

No character was regenerated and no face redrawn. Wordmarks are the exact
master on a white plate at 14px radius.

## Design system adherence

- Gold only in its shipped roles: primary action, the selected-state tick, the
  rule under ad 02's final row, focus, and the terminal period. Never a
  headline colour.
- Strikes and carets are **action blue** — the system's line-art colour.
- Struck claims and log-entry titles are secondary ink where the dimness is
  the point and the type is headline scale, so the 3:1 allowance applies: ad
  01's claims at 104 units and ad 04's "Somebody else" at 68 units.
- **All body- and meta-scale copy on the midnight field is `--pale` #D5E4F1**
  (13.89:1), never secondary ink #52677C, which measures only 3.08:1 there.
  Verification caught four labels breaking this — ad 02's row values, ad 03's
  counter and timing notes, ad 04's `THE ANSWER IT GAVE` — and the worst was
  ad 03's `ILLUSTRATIVE` counter: the line carrying the no-real-backlog caveat
  was the least legible thing in the film. All four are now `--pale`. The
  honesty disclosure is held to the highest legibility in the piece, not the
  lowest.
- Reversed copy is `#D5E4F1` throughout, except hero lines and stamps, which
  are paper on midnight.
- Two faces only: Archivo Black 900 for display at −0.025em, Nunito for
  everything else. Uppercase confined to the 12px-register letterspaced meta
  line.
- Solid colour fields, no gradients in the films themselves. Hairlines carry
  all structure. No drop shadows.
- One curve, `cubic-bezier(.85,0,.15,1)`: every hero line arrives once on the
  0.8s clip-path reveal, then holds still.
- No emoji, no exclamation marks, no invented statistics.

## Verification

All four loaded cold and probed by measuring ink coverage across the whole
frame rather than sampling points — point probes were landing between glyphs
and reading as empty.

**01 Ask About** — t1.6 claims in muted, no strike yet; t3.5 and t5.2 claims
plus blue strikes accumulating; t8.4 the concession alone at 0.28% coverage;
t12.0 hero at 12,317 white px. Hero measure slack raised from 2% to 7.7% by
dropping display from 132 to 124 units — 2% is inside font-load variance.

**02 Ambition Sold Separately** — t2.5 two rows with gold ticks; t5.0 all five;
t7.5 the untickable row (gold jumps to 1,274 px: the rule plus its value);
t11.6 hero at 10,031 white px; t15.2 Momo at 27% coverage; t18.5 end mark.

**03 Your Ideas Called** — counter climbs 1 → 5 across t1.5–t5.2 with blue
carets present; log clears by t6.5; t11.0 hero at 8,624 white px; t14.8 Momo;
t18.5 end mark.

**04 Ask Anyone** — typed count 15 → 36 → 40 across t2.0–t5.0; caret gold and
`waiting: true` at t5.0 during the dead air; answer drawn by t8.0; t13.0 hero;
t16.2 Momo; t19.0 end mark.

**Portrait** — all six portrait hero and stamp blocks measured against the
9:16 measure at 430×764: slack 26.9% to 54.3%, nothing clipped. Portrait is
authored, not cropped — ad 02 moves row values under their labels, ad 03 moves
timing notes below titles, ad 04 wraps the question to its own narrower
measure, and every hero line has its own portrait line breaks.

**Load order** — `momo-ad-specs.js` and `momo-ad-stage.js` are independent
script loads. The specs register an installer on `window.MOMO_AD_QUEUE` and
whichever file lands last runs it; `boot()` additionally waits up to 5s for a
named spec. This is the same fix applied to the paper stage earlier, where a
load-order race left a stage booted but never ready.

**On-screen receipt copy** — ads 03 and 04 were generated from ad 02's page by
string substitution, and two notices were missed: both still described "row
opacity, tick extent" and "a soft burst per tick", mechanics belonging to ad 02
alone. Neither film has rows or ticks. Corrected against the live `beats()` and
`cueScore()` source: ad 03 now states entry opacity, slide-in offset and
counter value, with a burst per log entry and two marker tones; ad 04 states
typed-character count, caret blink phase and answer/hero opacity, with one
burst when typing completes and three marker tones. Both files were then
grepped for any remaining ad-02 vocabulary — clean.

Worth stating plainly, because the receipts exist to prevent exactly this: a
notice describing a different ad's mechanism is worse than no notice. Substituted
copy must be checked line by line against the code it claims to describe, not
just at the substitution points.

## Sound

Off by default in all four. Two synthesized sine partials through a 260 Hz
lowpass, a short band-passed noise burst per strike or tick, and three or four
marker tones. Generated in the page. No purchased track, no generated music,
nothing licensed.

## Getting files out

`Record master` captures the canvas in real time and downloads WebM named for
the ad's slug. Then:

```
ffmpeg -i momentum-ai-ask-about-16x9.webm \
       -c:v libx264 -pix_fmt yuv420p -crf 18 -preset slow \
       momentum-ai-ask-about-16x9.mp4
```

Real-time capture at on-screen size, not a frame-exact 1920×1080 render. For
true masters, `export/render-frames.mjs` drives `renderFrameAt(t)` from local
headless Chrome; point `MOMO_PAGE` at each ad and set `MOMO_FPS=30`, duration
20s. Free and local.

## Not claimed

The struck claims in ad 01 and the ticked items in ad 02 are generic category
language, not quotations from any named competitor. Ad 03's shelved ideas are
generic examples stamped ILLUSTRATIVE on screen, not a real client backlog. Ad
04's returned answer is the phrase "Somebody else" — no real competitor is
named and no engine output is quoted or simulated as real.

No client name, no result, no metric, no launch date, no deployment claim.
Nothing was published, deployed, sent or purchased, and no paid render or
generation service was called.
