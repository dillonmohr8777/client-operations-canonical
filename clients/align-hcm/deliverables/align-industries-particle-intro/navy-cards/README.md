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

## Not final

The logo in both mockups is placed at its native 660px rather than the 1043px
footprint the video uses, because upscaling the current capture 1.58x looks soft.
These are for approving the design direction. When the vector or a 2000px+ export
arrives, the logo layer scales up and the cards are re-rendered, then the intro's
particle system is re-pointed at the reversed mark so the particles assemble in
white and orange instead of navy and orange.

Two smaller adjustments to make at that point: the intro lockup wants to sit a
little larger and more optically centred, and the outro divider is slightly tight
under the mark.
