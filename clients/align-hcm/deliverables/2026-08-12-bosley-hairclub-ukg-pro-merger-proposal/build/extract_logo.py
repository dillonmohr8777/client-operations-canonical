"""Lift the white Bosley HairClub wordmark off its navy plate.

The supplied file is a 200px JPEG: white type on a solid #1A365D square. Colour
keying would leave a navy fringe on every anti-aliased edge, so instead we solve
the compositing equation per channel. Each pixel is

    p = white * a + bg * (1 - a)

so a = (p - bg) / (255 - bg), computed on R, G and B independently and averaged.
That recovers true fractional coverage on the edges, and the recovered art is
pure white — which is what we want, since it lands on the deck's navy panels.
"""

import numpy as np
from PIL import Image, ImageFilter

SRC = "/root/.claude/uploads/ea688f45-6511-5cd8-9469-ad72ea0100c8/6c893e0e-IMG_4739.JPG"
OUT = "assets/bosley-hairclub-logo-white.png"
OUT_NAVY = "assets/bosley-hairclub-logo-navy.png"
BG = np.array([26, 54, 93], dtype=float)     # #1A365D, sampled from all 4 corners
NOISE_FLOOR = 0.06                            # kills JPEG ringing in flat areas
UPSCALE = 4

img = Image.open(SRC).convert("RGB")
p = np.array(img, dtype=float)

# per-channel coverage, averaged; channels agree closely for white-on-navy
alpha = ((p - BG) / (255.0 - BG)).mean(axis=2)
alpha = np.clip(alpha, 0.0, 1.0)

# JPEG leaves low-amplitude noise across the flat background: floor it, then
# rescale what remains so genuine soft edges keep their full range
alpha[alpha < NOISE_FLOOR] = 0.0
alpha = np.clip((alpha - NOISE_FLOOR) / (1.0 - NOISE_FLOOR), 0.0, 1.0)

# crop to the mark, keeping a small breathing margin
ys, xs = np.nonzero(alpha > 0.12)
pad = 3
y0, y1 = max(0, ys.min() - pad), min(alpha.shape[0], ys.max() + 1 + pad)
x0, x1 = max(0, xs.min() - pad), min(alpha.shape[1], xs.max() + 1 + pad)
alpha = alpha[y0:y1, x0:x1]
print(f"cropped to {x1 - x0} x {y1 - y0} (from {img.size[0]} x {img.size[1]})")

a8 = Image.fromarray((alpha * 255).round().astype(np.uint8), mode="L")

# The source is a 200px JPEG, so its edges carry blocking noise. Smooth that at
# native resolution first — sharpening it after the upscale just magnifies it.
a8 = a8.filter(ImageFilter.GaussianBlur(0.45))

w, h = a8.size
a8 = a8.resize((w * UPSCALE, h * UPSCALE), Image.LANCZOS)

# The mark is bilevel type, so push coverage toward 0/1 with a linear contrast
# ramp about the midpoint. This crisps the stems while leaving roughly a
# one-pixel soft edge, and unlike unsharp masking it cannot ring.
# 2.4 is the ceiling before the small trademark glyph starts breaking up
STEEPNESS = 2.4
a = np.array(a8, dtype=float) / 255.0
a = np.clip((a - 0.5) * STEEPNESS + 0.5, 0.0, 1.0)
a8 = Image.fromarray((a * 255).round().astype(np.uint8), mode="L")

for name, rgb in ((OUT, (255, 255, 255)), (OUT_NAVY, (26, 54, 93))):
    out = Image.new("RGBA", a8.size, rgb + (0,))
    out.putalpha(a8)
    out.save(name)
    print("wrote", name, out.size)
