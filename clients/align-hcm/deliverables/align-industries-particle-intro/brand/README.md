# Align logo assets, extracted and corrected

Cut from a supplied capture (`FullSizeRender.jpeg`, 879x368) with the dark
background removed. Both colour treatments are here because the video needs both.

| File | Use |
|---|---|
| `align-logo-reversed.png` | mark only, white wordmark, for dark grounds |
| `align-tagline-reversed.png` | HUMAN CAPITAL MANAGEMENT, for dark grounds |
| `align-lockup-full-reversed.png` | mark plus tagline, one asset, for dark grounds |
| `align-logo-navy.png` | mark only, navy wordmark, for light grounds |
| `align-tagline-navy.png` | tagline, for light grounds |
| `align-lockup-full-navy.png` | mark plus tagline, one asset, for light grounds |

## The supplied logo is the reversed version of the mark already in the video

Geometry is identical: same wordmark, same two slashes, same three dots, same
proportions. The only difference is colour polarity. The supplied file is white
where the video's is navy, which makes it the knockout treatment for dark
backgrounds. See `qa-geometry-vs-video-logo.png`, both marks on neutral grey.

The consequence, in `qa-contrast-cream-vs-navy.png`: dropped transparent onto the
video's actual cream plate the wordmark disappears and only the orange survives.
On navy it reads correctly. So adopting the supplied logo is a decision about the
card backgrounds, not about the logo file. Recolouring it navy for the cream cards
would produce no visible change at all, because the geometry already matches.

The agreed direction is navy intro and outro cards, light body untouched.

## Orange was colour corrected

The capture read the accents at **#EE974C**, noticeably lighter than the brand
orange the video uses, **#E7682D**. That is a capture exposure shift rather than a
brand change, so the orange was pulled back per channel to match the video, with
shading preserved. Navy reference from the video's own mark is **#15306B**.

## Resolution is the open blocker

The cutout lockup is 660x253. The video draws its logo across 1043x404, so using
these at full footprint needs a 1.58x upscale, which reads softer than the mark
currently in the video. A vector (SVG, AI, EPS) or a PNG at 2000px or wider will
render sharp at 1080p, and the swap is on hold until one arrives.

Everything else is ready: these transparent assets, the navy plate, and both card
compositions. Only the logo layer needs re-exporting at the higher resolution.
