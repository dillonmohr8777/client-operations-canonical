#!/usr/bin/env bash
# Prep the two inputs build.py expects, then render.
#
#   ./prep.sh /path/to/generated_video.mov
#
# Requires: ffmpeg, python3 with numpy, pillow, scipy.
set -euo pipefail

SRC="${1:?usage: prep.sh <source .mov>}"
HERE="$(cd "$(dirname "$0")" && pwd)"

# build.py reads the mark from ./logo.png
cp "$HERE/needmomentum-mark-blue.png" "$HERE/logo.png"

# ...and the footage from ./vf/%04d.png, already at the delivery canvas.
# 1280x720 -> width 1200 (x0.9375, so 675 tall) -> crop 628, biased 14px off the
# top so neither the heads nor the lower torsos get clipped.
rm -rf "$HERE/vf" && mkdir -p "$HERE/vf"
ffmpeg -v error -i "$SRC" -map 0:v:0 \
  -vf "scale=1200:675:flags=lanczos,crop=1200:628:0:14" \
  -fps_mode passthrough -start_number 0 "$HERE/vf/%04d.png"

python3 "$HERE/build.py" render "$HERE/master.mp4"

# Delivery encodes.
ffmpeg -v error -y -i "$HERE/master.mp4" \
  -c:v libx264 -preset slow -crf 20 -profile:v high -level 4.0 \
  -pix_fmt yuv420p -movflags +faststart -an \
  "$HERE/need-momentum-hero-1200x628.mp4"

ffmpeg -v error -y -i "$HERE/master.mp4" \
  -c:v libvpx-vp9 -crf 32 -b:v 0 -row-mt 1 -pix_fmt yuv420p -an \
  "$HERE/need-momentum-hero-1200x628.webm"

# Poster still, cropped to the exact 1200x627 request.
ffmpeg -v error -y -sseof -0.1 -i "$HERE/master.mp4" -frames:v 1 \
  -vf "crop=1200:627:0:0" "$HERE/need-momentum-endcard-1200x627.png"
