# Navy intro and outro cards

Design mockups for reworking the two ends of the industries video onto brand navy
so the reversed Align logo reads as supplied. The light body of the video is not
touched, so the ends become a branded sting rather than a change of look
throughout.

`make_navy_cards.py` generates `navy-plate.png`, `card-intro-navy.png`, and
`card-outro-navy.png`.

## The plate mirrors the deck's own gradient

The cream plate the video uses is not flat. It runs cool grey in the top left,
brightest through the centre right, and warm blush in the bottom right:

| Sample | Cream plate |
|---|---|
| top left | `#DCD7D4` |
| top right | `#FBF6F3` |
| centre | `#F6F0EB` |
| bottom right | `#EDCEBB` |

The navy plate reproduces that structure in brand colours: deepest navy in the top
left, a cool blue bloom upper right where the cream plate is brightest, and a warm
orange blush lower right where the cream plate goes peach, plus a light vignette
so the centre carries the mark. Matched fine grain is added because the deck's
plate is textured, not glassy. The intent is that the ends read as the same design
system as the body rather than a generic dark slate.

## Outro card composition

The card's own elements are lifted from the video's frame and recoloured only
where a dark ground requires it:

| Element | Source in frame | Treatment |
|---|---|---|
| Align mark | y144..471 | replaced with the reversed logo |
| divider rule | y628..632 | kept orange, reads fine on navy |
| `Align moves at your speed.` | y693..763 | navy to warm white, it would vanish otherwise |
| `Which is always right now.` | y786..858 | kept orange |
| `ALIGNHCM.COM` | y906..928 | kept orange |
| top rule | y0..6 | orange over deep navy |

`HUMAN CAPITAL MANAGEMENT` stays off the outro, per the earlier decision, and
appears only in the intro.

## Built and running

`./build-navy.sh <source.mp4>` produces the finished 1920x1080, 30fps, 62.7s cut
(1,881 frames). Three segments joined in a single encode:

| Segment | Frames | Source |
|---|---|---|
| navy particle intro | 87 (2.9s) | `intro.html` |
| light body, untouched | 1,638 (54.6s) | original frames 162..1799 |
| navy closing card | 174 (5.8s) | `outro.html` |

Joins are crossfades: 0.30s from the intro into the body at 2.60s, hidden under
the intro's white flash, and 0.40s from the body into the closing card at 56.90s,
so the SmartCare page dissolves to navy. The closing card is 174 frames precisely
so the total runtime matches the original's own outro length.

### Intro on navy

Same particle system as the cream version, re-pointed at the reversed mark, so the
particles now carry white and orange instead of navy and orange. 3,134 particles.
The crystallisation bloom was changed from warm cream to cool blue, which reads on
a dark ground. The closing white flash is unchanged and still works, because it
now flashes from navy through white into the cream body, which makes the handoff
punchier than it was on cream.

### Closing card

Staggered build rather than a static plate: the mark fades up with a whisper of
scale, the divider draws outward from the centre, then the two sign-off lines and
the URL rise in sequence, finishing at 1.64s and holding. A slow field of 220
drifting dust motes keeps the five-second hold from looking like a freeze frame.

## Still pending the vector

The logo is placed at 940px wide, a 1.42x upscale of the capture, with an unsharp
pass on the RGB channels only so the alpha edges do not pick up halos. It holds up
in motion but it is not as crisp as the mark the original video drew at 1043px.
When a vector or a 2000px+ export arrives, replace `assets/logo.png` and
`assets/tagline.png` and re-run; nothing else needs to change.

One open layout note: the outro divider sits fairly tight under the mark.
