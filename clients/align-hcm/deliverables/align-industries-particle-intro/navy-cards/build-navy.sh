#!/usr/bin/env bash
# Build the navy-card version of the industries video: particle intro on navy,
# the light body untouched, and a navy closing card.
#
# Usage:  ./build-navy.sh /path/to/alignhcmindustries_0701.mp4  [outfile.mp4]
#
# Requires node with playwright (npm i playwright), ffmpeg with libx264, and
# python3 with pillow and numpy. Chromium comes from the pre-installed browser.
set -euo pipefail

SRC="${1:?pass the source industries video}"
OUT="${2:-align-public-sector-navy.mp4}"
HERE="$(cd "$(dirname "$0")" && pwd)"
cd "$HERE"

# Frame numbers are against the 1974-frame original.
BODY_IN=162           # t=5.40s, first settled content page after the original's logo open
BODY_OUT=1800         # t=60.00s, where the original's own closing card starts

XF1_DUR=0.30; XF1_AT=4.60     # intro (147f / 4.9s) into the body, under the flash
XF2_DUR=0.40; XF2_AT=58.80    # body into the navy closing card

echo "1/3  navy plate"
python3 make-plate.py

echo "2/3  rendering cards"
node render.mjs
node render-outro.mjs

echo "3/3  assembling"
ffmpeg -v error \
  -framerate 30 -i frames/f%04d.png \
  -i "$SRC" \
  -framerate 30 -i frames-outro/f%04d.png \
  -filter_complex "\
[0:v]fps=30,setsar=1,format=yuv420p,settb=AVTB[intro];\
[1:v]trim=start_frame=${BODY_IN}:end_frame=${BODY_OUT},setpts=PTS-STARTPTS,fps=30,setsar=1,format=yuv420p,settb=AVTB[body];\
[2:v]fps=30,setsar=1,format=yuv420p,settb=AVTB[tail];\
[intro][body]xfade=transition=fade:duration=${XF1_DUR}:offset=${XF1_AT}[ab];\
[ab]settb=AVTB[abx];\
[abx][tail]xfade=transition=fade:duration=${XF2_DUR}:offset=${XF2_AT}[v]" \
  -map "[v]" -c:v libx264 -preset slow -crf 22 -pix_fmt yuv420p \
  -movflags +faststart "$OUT" -y

ffprobe -v error -show_entries format=duration,size \
  -show_entries stream=width,height,nb_frames \
  -of default=noprint_wrappers=1 "$OUT"
echo "wrote $OUT"
