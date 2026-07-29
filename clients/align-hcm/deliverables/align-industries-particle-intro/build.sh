#!/usr/bin/env bash
# Build the Align HCM particle intro and join it to the industries video.
#
# Usage:  ./build.sh /path/to/alignhcmindustries_0701.mp4  [outfile.mp4]
#
# Requires node with playwright installed (npm i playwright) and ffmpeg with
# libx264. Chromium comes from the pre-installed browser rather than a download,
# see the executablePath in render.mjs.
set -euo pipefail

SRC="${1:?pass the source industries video}"
OUT="${2:-align-public-sector-with-intro.mp4}"
HERE="$(cd "$(dirname "$0")" && pwd)"
cd "$HERE"

# Where the original video's own logo intro ends. Frames 0..144 are the static
# logo hold; the dissolve into the first content page runs 145..~162. We replace
# that whole opening and pick the body up once the content page has settled.
BODY_START=5.40

# Intro geometry: 1920x1080, 30fps, 87 frames (2.9s). See the timeline in intro.html.
XFADE_DUR=0.30
XFADE_AT=2.60          # intro length minus the crossfade

echo "1/2  rendering intro frames"
node render.mjs

echo "2/2  joining intro to body"
ffmpeg -v error \
  -framerate 30 -i frames/f%04d.png \
  -ss "$BODY_START" -i "$SRC" \
  -filter_complex "[0:v]settb=AVTB,fps=30,format=yuv420p[a];\
[1:v]settb=AVTB,fps=30,format=yuv420p[b];\
[a][b]xfade=transition=fade:duration=${XFADE_DUR}:offset=${XFADE_AT}[v]" \
  -map "[v]" -c:v libx264 -preset slow -crf 22 -pix_fmt yuv420p \
  -movflags +faststart "$OUT" -y

ffprobe -v error -show_entries format=duration,size \
  -show_entries stream=width,height,nb_frames \
  -of default=noprint_wrappers=1 "$OUT"
echo "wrote $OUT"
