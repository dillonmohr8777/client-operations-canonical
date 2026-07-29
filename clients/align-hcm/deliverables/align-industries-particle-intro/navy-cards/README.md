# Navy intro and outro cards

Reworks the two ends of the industries video onto brand navy so the reversed Align
logo reads as supplied. The light body of the video is not touched, so the ends
become a branded sting rather than a change of look throughout.

`make-plate.py` generates the plate. It is fully procedural with no dependency on
the source video, and reproduces the exact plate used in the delivered cut.

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

| Element | Source | Treatment |
|---|---|---|
| Align mark | `assets/logo.png` | reversed lockup, same placement as the intro |
| `HUMAN CAPITAL MANAGEMENT` | `assets/tagline.png` | reversed, same placement as the intro |
| `ALIGNHCM.COM` | lifted from frame y906..928 | kept orange, it reads on navy |
| top rule | drawn | orange over deep navy |

`ALIGNHCM.COM` is the only element still lifted from the video's own frame, which
is why `assets/url_orange.png` is committed.

## Built and running

`./build-navy.sh <source.mp4>` produces the finished 1920x1080, 30fps, 64.6s cut
(1,938 frames). Three segments joined in a single encode:

| Segment | Frames | Source |
|---|---|---|
| navy particle intro | 147 (4.9s) | `intro.html` |
| light body, untouched | 1,638 (54.6s) | original frames 162..1799 |
| navy closing card | 174 (5.8s) | `outro.html` |

Joins are crossfades: 0.30s from the intro into the body at 4.60s, hidden under
the intro's white flash, and 0.40s from the body into the closing card at 58.80s,
so the SmartCare page dissolves to navy. The closing card is 174 frames precisely
so it occupies the same span the original's own outro did.

### Intro on navy

Same particle system as the cream version, re-pointed at the reversed mark, so the
particles now carry white and orange instead of navy and orange. 3,134 particles.
The crystallisation bloom was changed from warm cream to cool blue, which reads on
a dark ground. The closing white flash is unchanged and still works, because it
now flashes from navy through white into the cream body, which makes the handoff
punchier than it was on cream.

The lockup holds for roughly 2.2s before the burst. The extra time went into the
hold rather than the assemble, so the mark is readable without the entrance
feeling slow.

### Closing card

Resolves to the **same lockup the intro ends on**: identical asset, identical
position (`490,290` for the mark, `482,730` for the tagline), identical scale, so
the mark does not shift between the two ends. `ALIGNHCM.COM` carries the close
beneath it.

Staggered build rather than a static plate: the mark fades up with a whisper of
scale, then the tagline and the URL rise in sequence, finishing at 1.45s and
holding. A slow field of 220 drifting dust motes keeps the five-second hold from
looking like a freeze frame.

The earlier sign-off lines, `Align moves at your speed.` and `Which is always
right now.`, were removed, and the divider rule went with them since it existed
only to separate them from the tagline.

## Still pending the vector

The logo is placed at 940px wide, a 1.42x upscale of the capture, with an unsharp
pass on the RGB channels only so the alpha edges do not pick up halos. It holds up
in motion but it is not as crisp as the mark the original video drew at 1043px.
When a vector or a 2000px+ export arrives, replace `assets/logo.png` and
`assets/tagline.png` and re-run; nothing else needs to change.

`assets/plate.png` is generated, not committed, and so are the frame
directories. Everything else needed to rebuild is here.
