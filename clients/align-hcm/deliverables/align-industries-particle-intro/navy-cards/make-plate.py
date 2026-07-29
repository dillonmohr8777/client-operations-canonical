"""Generate the navy background plate for the intro and closing cards.

Fully procedural, no dependency on the source video. The plate mirrors the
gradient character of the deck's own cream plate so the two ends read as the same
design system rather than a generic dark slate:

| Sample       | cream plate | navy plate mirrors it with |
|--------------|-------------|----------------------------|
| top left     | `#DCD7D4`   | deepest navy               |
| top right    | `#FBF6F3`   | cool blue bloom            |
| centre       | `#F6F0EB`   | mid navy, light vignette   |
| bottom right | `#EDCEBB`   | warm orange blush          |

Writes assets/plate.png at 1920x1080.
"""
import os
import numpy as np
from PIL import Image

W, H = 1920, 1080
NAVY_DEEP = np.array([9.0, 20.0, 38.0])     # #091426
NAVY_MID = np.array([20.0, 42.0, 84.0])     # #142A54
ORANGE = np.array([231.0, 104.0, 45.0])     # #E7682D, the video's own orange


def navy_plate():
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    u, v = xx / (W - 1), yy / (H - 1)

    lift = np.clip(0.30 + 0.55 * u + 0.30 * v - 0.22 * (1 - u) * (1 - v), 0, 1)
    base = NAVY_DEEP[None, None, :] + (NAVY_MID - NAVY_DEEP)[None, None, :] * lift[..., None]

    d_cool = np.hypot((u - 0.80) * 1.10, (v - 0.16) * 1.65)
    cool = np.clip(1 - d_cool / 0.85, 0, 1) ** 2.0
    base += np.array([26.0, 52.0, 104.0])[None, None, :] * cool[..., None] * 0.55

    d_warm = np.hypot((u - 0.90) * 1.00, (v - 0.92) * 1.50)
    warm = np.clip(1 - d_warm / 0.95, 0, 1) ** 2.2
    base += ORANGE[None, None, :] * warm[..., None] * 0.30

    d_c = np.hypot((u - 0.5) * 1.05, (v - 0.5) * 1.35)
    base *= (1 - 0.20 * np.clip(d_c / 1.05, 0, 1) ** 2)[..., None]

    # the deck's plate is textured, not glassy
    rng = np.random.default_rng(20260825)
    base += rng.normal(0.0, 2.0, base.shape)
    return Image.fromarray(np.clip(base, 0, 255).astype(np.uint8), 'RGB')


if __name__ == '__main__':
    here = os.path.dirname(os.path.abspath(__file__))
    out = os.path.join(here, 'assets', 'plate.png')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    navy_plate().save(out)
    print(f'wrote {out}')
