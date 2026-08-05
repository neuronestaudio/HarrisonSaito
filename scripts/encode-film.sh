#!/usr/bin/env bash
# Encodes the Harrison film for the web.
#
# Two different jobs, two different sources:
#
#   the hero bed   a silent, looping parallax plate for the top of /about.
#                  Cut from harrison-clean-16x9.mp4, which carries no burned-in
#                  captions — text baked into a background plate would fight the
#                  headline sitting over it.
#
#   the full film  the narrated piece, click-to-play with sound. Cut from
#                  STYLE-F, which has the captions, and TRIMMED AT 160.4s.
#                  Measured with signalstats: picture ends at 158.85s, the frame
#                  is pure black 158.9-160.4, and the "Strong people. Sharp
#                  minds. Soft hearts." end card fades in at 160.5. Cutting at
#                  160.4 lands on black with no card, which is what was asked
#                  for, and keeps ~1.5s of black as a natural fade-out.
#
# Run: bash scripts/encode-film.sh
set -euo pipefail

SRC_DIR="/c/Users/dlint/Videos/harrison-return-to-self/renders"
CLEAN="$SRC_DIR/harrison-clean-16x9.mp4"
FULL="$SRC_DIR/harrison-FULL-STYLE-F-slow-serif.mp4"
OUT="/c/Users/dlint/HarrisonSaito/public/video"
IMG="/c/Users/dlint/HarrisonSaito/public/img"

mkdir -p "$OUT"

TRIM=160.4          # end card starts fading in at 160.5
BED_IN=1.2          # skip the very first beat so the loop opens on him settled
BED_LEN=17
# Derived, written out rather than computed: Git Bash has no `bc`, and these
# only change when the two constants above do.
BED_FADE_OUT=16.2   # BED_LEN - 0.8
AUD_FADE_OUT=159.0  # TRIM - 1.4

echo "=== hero bed (silent, looping) ==="

# 1080p. Two-pass would buy little here at these durations; CRF with a slow
# preset is the better quality-per-byte trade and is deterministic.
ffmpeg -v error -stats -ss $BED_IN -i "$CLEAN" -t $BED_LEN \
  -an \
  -vf "scale=1920:-2,fade=t=in:st=0:d=0.6,fade=t=out:st=$BED_FADE_OUT:d=0.8" \
  -c:v libx264 -profile:v high -crf 24 -preset slow -pix_fmt yuv420p \
  -movflags +faststart "$OUT/about-bed.mp4" -y

ffmpeg -v error -stats -ss $BED_IN -i "$CLEAN" -t $BED_LEN \
  -an \
  -vf "scale=1280:-2,fade=t=in:st=0:d=0.6,fade=t=out:st=$BED_FADE_OUT:d=0.8" \
  -c:v libvpx-vp9 -crf 34 -b:v 0 -deadline good -cpu-used 2 -row-mt 1 \
  "$OUT/about-bed.webm" -y

ffmpeg -v error -stats -ss $BED_IN -i "$CLEAN" -t $BED_LEN \
  -an \
  -vf "scale=854:-2,fade=t=in:st=0:d=0.6,fade=t=out:st=$BED_FADE_OUT:d=0.8" \
  -c:v libx264 -profile:v main -crf 27 -preset slow -pix_fmt yuv420p \
  -movflags +faststart "$OUT/about-bed-mobile.mp4" -y

echo "=== poster ==="
ffmpeg -v error -ss 4.5 -i "$CLEAN" -frames:v 1 "$OUT/../img/_bedposter.png" -y
for w in 768 1280 1920; do
  ffmpeg -v error -i "$OUT/../img/_bedposter.png" -vf "scale=$w:-2" \
    -c:v libwebp -quality 80 "$IMG/about-bed-$w.webp" -y
done
ffmpeg -v error -i "$OUT/../img/_bedposter.png" -vf "scale=1920:-2" \
  -c:v libwebp -quality 82 "$IMG/about-bed.webp" -y
rm -f "$OUT/../img/_bedposter.png"

echo "=== full film (with sound, end card removed) ==="

ffmpeg -v error -stats -i "$FULL" -t $TRIM \
  -vf "scale=1920:-2" \
  -c:v libx264 -profile:v high -crf 25 -preset slow -pix_fmt yuv420p \
  -c:a aac -b:a 160k -ac 2 \
  -af "afade=t=out:st=$AUD_FADE_OUT:d=1.4" \
  -movflags +faststart "$OUT/about-film-1080.mp4" -y

ffmpeg -v error -stats -i "$FULL" -t $TRIM \
  -vf "scale=1280:-2" \
  -c:v libx264 -profile:v high -crf 26 -preset slow -pix_fmt yuv420p \
  -c:a aac -b:a 128k -ac 2 \
  -af "afade=t=out:st=$AUD_FADE_OUT:d=1.4" \
  -movflags +faststart "$OUT/about-film-720.mp4" -y

echo
echo "=== results ==="
ls -la "$OUT" | awk '{printf "  %-28s %8.2f MB\n", $9, $5/1048576}' | grep -v '^\s*$'
