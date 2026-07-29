#!/usr/bin/env bash
# Build the Align HCM particle intro, strip the tagline from the outro card, and
# assemble the finished industries / public sector video in a single encode.
#
# Usage:  ./build.sh /path/to/alignhcmindustries_0701.mp4  [outfile.mp4]
#
# Requires node with playwright installed (npm i playwright), ffmpeg with
# libx264, and python3 with pillow and numpy. Chromium comes from the
# pre-installed browser rather than a download, see executablePath in render.mjs.
set -euo pipefail

SRC="${1:?pass the source industries video}"
OUT="${2:-align-public-sector-with-intro.mp4}"
HERE="$(cd "$(dirname "$0")" && pwd)"
cd "$HERE"

# --- source geometry, all frame numbers are against the 1974-frame original ----
#
# The original opened with its own static Align logo: frames 0..144 hold the
# logo, then 145..~162 dissolve into the first content page. The intro replaces
# that whole opening, so the body starts once the content page has settled.
BODY_IN=162          # t = 5.40s
#
# The outro card fades its tagline in at frame 1823 and holds to the end. Frames
# from here on get the tagline reconstruction.
TAIL_IN=1820         # t = 60.67s

# --- intro geometry -----------------------------------------------------------
XFADE_DUR=0.30
XFADE_AT=2.60        # intro length (2.9s) minus the crossfade

echo "1/4  rendering intro frames"
node render.mjs

echo "2/4  extracting outro frames from ${TAIL_IN}"
rm -rf outro-raw outro-patched && mkdir -p outro-raw
ffmpeg -v error -i "$SRC" -vf "select='gte(n\,${TAIL_IN})'" -vsync 0 \
  -start_number 0 outro-raw/o%04d.png -y

echo "3/4  removing the outro tagline"
python3 remove-outro-tagline.py

echo "4/4  assembling"
ffmpeg -v error \
  -framerate 30 -i frames/f%04d.png \
  -i "$SRC" \
  -framerate 30 -i outro-patched/o%04d.png \
  -filter_complex "\
[0:v]fps=30,setsar=1,format=yuv420p,settb=AVTB[intro];\
[1:v]trim=start_frame=${BODY_IN}:end_frame=${TAIL_IN},setpts=PTS-STARTPTS,fps=30,setsar=1,format=yuv420p,settb=AVTB[body];\
[2:v]fps=30,setsar=1,format=yuv420p,settb=AVTB[tail];\
[body][tail]concat=n=2:v=1:a=0,settb=AVTB[full];\
[intro][full]xfade=transition=fade:duration=${XFADE_DUR}:offset=${XFADE_AT}[v]" \
  -map "[v]" -c:v libx264 -preset slow -crf 22 -pix_fmt yuv420p \
  -movflags +faststart "$OUT" -y

ffprobe -v error -show_entries format=duration,size \
  -show_entries stream=width,height,nb_frames \
  -of default=noprint_wrappers=1 "$OUT"
echo "wrote $OUT"
