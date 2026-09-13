"""Remove the HUMAN CAPITAL MANAGEMENT tagline from the outro card.

The card's background is a soft gradient that drifts over the outro, so a static
patch does not hold and ffmpeg's delogo leaves vertical streaks. Instead each
frame is reconstructed per column: the band the tagline occupies is refilled with
a linear ramp between clean background sampled directly above and below it, then
matched grain is added back so the patch does not read as a flat rectangle.

Verified clean sample rows: the logo ends at y=471, the tagline occupies
y=526..567 across the outro, the divider rule sits near y=628, and the slogan
starts at y=693.
So y=500..517 and y=578..595 are background on every outro frame.
"""
import glob
import os
import numpy as np
from PIL import Image

BAND = (518, 575)          # rows replaced (inclusive start, exclusive end)
X0, X1 = 402, 1506         # the tagline animates from x=420..1487 in and
                           # contracts to x=472..1439; cover the widest frame
ABOVE = (500, 518)         # clean rows sampled above the band
BELOW = (575, 596)         # clean rows sampled below the band
SMOOTH = 41                # horizontal smoothing window for the edge profiles

src = sorted(glob.glob(os.path.join(os.path.dirname(__file__), 'outro-raw', 'o*.png')))
out_dir = os.path.join(os.path.dirname(__file__), 'outro-patched')
os.makedirs(out_dir, exist_ok=True)


def smooth_rows(profile, k):
    """Box-smooth a (W,3) colour profile along x, with edge padding."""
    pad = k // 2
    padded = np.pad(profile, ((pad, pad), (0, 0)), mode='edge')
    kern = np.ones(k) / k
    return np.stack([np.convolve(padded[:, c], kern, mode='valid') for c in range(3)], axis=1)


rng = np.random.default_rng(20260825)
y0, y1 = BAND
h = y1 - y0
ramp = (np.arange(h) + 0.5) / h                     # 0..1 down the band

for i, path in enumerate(src):
    im = Image.open(path).convert('RGB')
    a = np.asarray(im).astype(np.float32)

    strip = a[y0:y1, X0:X1]                         # the region being rebuilt

    # Grain level of the real background, so the patch is not glassy smooth.
    ref = a[BELOW[0]:BELOW[1], X0:X1]
    grain = float((ref - ref.mean(axis=0, keepdims=True)).std())

    top = smooth_rows(a[ABOVE[0]:ABOVE[1], X0:X1].mean(axis=0), SMOOTH)
    bot = smooth_rows(a[BELOW[0]:BELOW[1], X0:X1].mean(axis=0), SMOOTH)

    fill = top[None, :, :] * (1 - ramp)[:, None, None] + bot[None, :, :] * ramp[:, None, None]
    fill = fill + rng.normal(0.0, grain, fill.shape).astype(np.float32)

    # Feather the top and bottom few rows into the untouched background so the
    # seam cannot show if the gradient is not perfectly linear across the band.
    feather = np.ones(h, dtype=np.float32)
    f = 5
    feather[:f] = np.linspace(0.0, 1.0, f, endpoint=False)
    feather[-f:] = np.linspace(1.0, 0.0, f, endpoint=False)
    blended = strip * (1 - feather)[:, None, None] + fill * feather[:, None, None]

    a[y0:y1, X0:X1] = blended
    Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(
        os.path.join(out_dir, f'o{i:04d}.png'))

print(f'patched {len(src)} frames -> {out_dir}')
