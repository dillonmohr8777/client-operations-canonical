"""Produce orange copies of the house icon set.

The icons lifted from the SmartCare deck are white line art on transparent
alpha, drawn to sit on a navy disc. Recolouring keeps the coverage mask exactly
as drawn and only swaps the fill, so stroke weights and the optical sizing of
the originals are preserved — redrawing them would not match.
"""

import glob
import os
from PIL import Image

ORANGE = (0xE9, 0x77, 0x22)
SRC_DIR = "assets"
OUT_DIR = "assets/icons-orange"

os.makedirs(OUT_DIR, exist_ok=True)
count = 0
for path in sorted(glob.glob(os.path.join(SRC_DIR, "icon-*.png"))):
    src = Image.open(path).convert("RGBA")
    out = Image.new("RGBA", src.size, ORANGE + (0,))
    out.putalpha(src.getchannel("A"))
    out.save(os.path.join(OUT_DIR, os.path.basename(path)))
    count += 1

print(f"wrote {count} orange icons to {OUT_DIR}")
