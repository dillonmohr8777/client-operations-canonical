# Export receipt — Momo: One Idea, Everywhere

Artifact: `One Idea Everywhere.dc.html`
Engine: `momo-paper-stage.js` + film spec `momo-idea-spec.js` (`data-film="idea"`)
Title: **One idea. Everywhere.** · 20.00s · 16:9 master + recomposed 9:16
Brand: Momentum Digital, AI Division. Proposed concept work.

## Timing contract

`stage.timingContract` reports, verified live:

```
film: idea            slug: momo-one-idea-everywhere
duration: 20          fps: 30          frames: 601
masters: ['16:9', '9:16']
```

Every card transform, camera position, look target, bloom and dim value is
`sample(track, t)` — a pure function of `t`. The paper-to-artefact texture swap
is a fixed comparison against the halfway point of each tumble, so it lands on
the same frame every time. `await stage.renderFrameAt(t)` seeks the decoder,
drains the serial queue and draws.

Verified: rendering `t = 10.00`, moving away to `t = 2.00`, and returning to
`t = 10.00` produces byte-identical pixel probes.

## Media

One live decoder. Only Momo's card carries moving video, between 2.05s and
5.90s of the film, drawn from `uploads/3-higgsfield-fb393c2f…MP4` (Momo Reveal,
8.05s) used byte-for-byte as a video texture. Its base texture is
`assets/stills/reveal-a.png`, a frame baked out of that same master, so Momo is
on the card from the first frame and attaching a source is never confused with
having a picture.

The other four surfaces — website, social post, email, paid ad — are drawn from
the Momentum palette and type, each labelled `· ILLUSTRATIVE`, with `NOT SENT`
on the email and `NO CLAIMS` on the ad. Ceramic service icons are the exact
masters. No character was regenerated and no face redrawn.

## Sound

Off until switched on. Synthesized sine partials, filtered-noise paper
landings and a few marker tones, all generated in the page. No purchased track,
no generated music, nothing licensed.

## MP4

`Record master` captures the composited frame in real time and downloads WebM:

```
ffmpeg -i momo-one-idea-everywhere-16x9.webm \
       -c:v libx264 -pix_fmt yuv420p -crf 18 -preset slow \
       momo-one-idea-everywhere-16x9.mp4
```

Real-time capture at on-screen size, not a frame-exact 1920×1080 render. For a
true master, `export/render-frames.mjs` drives `renderFrameAt(t)` from local
headless Chrome; point its `MOMO_PAGE` at this file. Free and local. Nothing was
published, uploaded or sent anywhere.

## Repairs — this batch

Root causes, not symptoms:

1. **Load-order dependency (the actual "unable to play media" / dead preview).**
   `momo-idea-spec.js` destructured `window.MomoPaper` at evaluation time, a
   global published by `momo-paper-stage.js`. As two independent script loads the
   order was not guaranteed; when the spec evaluated first it threw, no spec was
   registered, and the stage sat *booted but never ready* with a video element
   that never received a source. The spec now registers an installer and
   whichever file lands last runs it (`window.MOMO_SPEC_QUEUE`), and `boot()`
   waits up to 5s for its spec instead of throwing on the race.
2. **Mount pattern.** The raw `<momo-paper-stage>` tag plus a `<script src>` in
   `<helmet>` became `<x-import component-from-global-scope="momo-paper-stage"
   from="./momo-paper-stage.js">`, matching the other two films, so mounting
   waits for the engine instead of depending on element-upgrade order.
3. **Source detach removed.** `releaseSrc()` used to `removeAttribute('src')`
   and `load()`, which aborts a pending load and leaves the element in an
   error/empty state — a native media error with nothing catching it. This film
   has exactly one video and no second decoder to free, so the source is
   attached once and retained; outside its window the element is simply paused.
4. **Unhandled decode failure.** The video element had no `error` listener. It
   now resolves to the baked still once, never retries, and reports in plain
   words through `momo-state` (`mediaFallback`), which the page surfaces as
   status text.
5. **Inert media element.** `controls=false`, `tabIndex=-1`, `aria-hidden`,
   `disablePictureInPicture`, `disableremoteplayback` — it is a texture source,
   not a player, and no host media chrome can attach to it.
6. **Broken receipt reference.** The status message pointed at
   `export/README-one-idea.md`, which did not exist. This is that file.

## Fresh-load verification

Loaded cold, autoplaying, no console output:

- `ready: true`, spec resolved, decoder `readyState 4`, no media error.
- Beats probed at 0.40 / 4.00 / 10.00 / 14.00 / 17.90 / 19.99s — all draw.
  Momo's card reads `video` at 4.00s and `still` outside the window, as designed.
- Determinism confirmed (see above).
- 9:16 recomposes to 430×764 with `portrait: true`; all four edges sit on the
  settled paper field, nothing clipped. Returning to 16:9 restores the wide ring.

## Not claimed

No client name, no result, no metric, no deployment claim. Nothing was
published, deployed, sent or purchased.
