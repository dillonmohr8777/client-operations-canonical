# AI in Slack — Polished Cut

Polished edit of `2026-07-23-mac-ai-in-slack-5-minute-walkthrough.mp4`.
The original stays untouched; this is a new derived export.

| | Source | Polished |
|---|---|---|
| Duration | 4:36.96 | **4:20.54** |
| Loudness | −19.6 LUFS | **−14.4 LUFS** |
| Audio | 22.05 kHz mono, 88 kbps | **48 kHz stereo, 192 kbps AAC** |
| Slide changes | hard cuts | **0.35 s dissolves** |
| Captions | none | **60 cues — soft track + sidecar SRT** |
| Chapters | none | **8 embedded + text list** |
| Video | 1920×1080 / 30 fps H.264 | same, CRF 18 High/4.1, faststart |
| Size | 5.9 MB | 15.0 MB |

## What changed and why

**Audio was the biggest problem.** The source sits at −19.6 LUFS, roughly 5 dB
under the −14 LUFS web/YouTube norm, so it plays noticeably quiet next to
anything else. It's now two-pass `loudnorm`ed to −14.4 LUFS / −1.5 dBTP with a
70 Hz high-pass, light broadband de-hiss, a small 3 kHz presence lift, and a
safety limiter. Mono 22.05 kHz was upsampled to 48 kHz stereo for delivery —
that doesn't add detail the source never had, but it stops players from
resampling and matches normal delivery specs.

**Dead air trimmed: 16.4 s.** The narration is machine-generated, and its
pauses cluster at exactly ~1.03 s (sentence) and ~0.51 s (clause). Gaps are now
capped at 0.62 s. Trims only ever happen *inside* a slide — any gap straddling a
slide change was skipped, so narration can never drift onto the wrong slide.
40 keep-intervals, verified per slide.

**Captions were transcribed, not guessed.** The delivered narration turned out
to differ from the shooting script in `2026-07-23-...walkthrough.md` (extra
sentences in several sections), so captions come from local ASR of the actual
audio, then hand-corrected against a second larger-model pass and the script —
fixing `Slackbot AI`, `Control, Shift, O`, `MFA codes`, "the source messages
remain the final record", and similar. Cue breaks prefer comma boundaries so
lines don't split mid-phrase.

Captions ship as a **soft** subtitle track plus `captions.srt`, deliberately not
burned in — the slides carry content down to the footer, and a burned-in caption
band would cover it. If you need burned-in for Slack or LinkedIn playback, say
so and I'll render that variant.

**Slide dissolves.** 0.35 s crossfades at the 7 boundaries, each ending exactly
as the incoming slide's narration begins. Verified as a true blend: the
mid-transition frame is within 0.33 (mean abs, 8-bit luma) of a perfect 50/50
mix of the two slides, which differ from each other by 5.53.

**Progress bar.** 6 px, brand purple `#8A5AF7` matching the deck's left stripe,
over a 10% white track. Verified to track: 3.9 / 25.0 / 49.9 / 74.9 / 99.1 % at
t = 10 / 65 / 130 / 195 / 258 s.

## What I deliberately did not do

- **No visual "restoration."** The source video is only 75 kbps, which looks
  alarming, but the slides are perfectly static — a 48-frame temporal average is
  bit-identical (mean |Δ| = 0.0000) to a single frame. There is no per-frame
  noise to remove and no detail to recover, so re-encoding is the honest ceiling.
  Rebuilding from one still per slide keeps text crisp at constant quality.
- **No new branding or motion graphics.** The deck already has a consistent
  visual system; adding cards would fight it.

## Chapters

```
0:00  AI is already in Slack
0:33  1 · Prioritize the day
1:07  2 · Catch up fast
1:40  3 · Create a first draft
2:14  4 · Prepare a focused meeting
2:44  5 · Make it reusable
3:19  6 · Guardrails
3:52  Start today — three habits
```

## Verification

Full decode clean, no errors. Streams: 1920×1080 @ 30 fps, 48 kHz stereo,
`mov_text` subtitles, 8 chapters. Slide/chapter alignment confirmed by reading
each slide's own `NN/08` footer at every chapter start — 01/08 through 08/08 in
order.

## Reproducing

`build.py` regenerates the export from the untouched source in one pass:

```bash
python3 build.py     # ~2.5 min; needs ffmpeg
```

Tunables at the top: `SILENCE_CAP` (0.62 s), `XFADE` (0.35 s), `ACCENT`.
Caption text lives in the `CAPTIONS` table — edit there, not in the SRT, so a
rebuild doesn't lose corrections.
