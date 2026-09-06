# -*- coding: utf-8 -*-
"""
Re-typeset the title card at the end of the Return to Self intro film.

The card dissolves in over the last 86 frames (324..409) with its words baked
into the same layer, so the text cannot be swapped on one frame — it has to be
erased and redrawn on every frame of the dissolve at the dissolve's own
opacity. Three things make that exact rather than approximate:

  * Erasing is inpainting, not painting. The old glyphs are thin strokes on a
    near-flat card; filling them from their own surroundings on each frame
    reproduces whatever mix of room and card that frame had, with no model of
    the dissolve needed and no frozen patch to give the game away.

  * The dissolve's opacity per frame is *measured*, from the region above the
    text — the median of (frame - room) / (card - room) over pixels where the
    two differ enough to be well-conditioned. The new words fade in on exactly
    the curve the old ones did.

  * The words are set in the site's own display face at the original's cap
    height and baselines, centred on the original's axis. Both lines are
    re-set, not just the one that changed, so the card is one typeface rather
    than two.

Frames 0..323 are untouched (324 is a keyframe, which is why the cut is there).
"""
import glob
import io
import os
import subprocess
import sys

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

FRAMES = "scratch/frames"           # 0001.png .. 0410.png (frame n -> n+1)
FONT = "scratch/fonts/cormorant-garamond-600.ttf"
OUT = "scratch/rts-hero-retitled.mp4"

D = 323                             # last untouched frame
LAST = 409
CENTRE_X = 631
LINES = [                           # text, baseline, cap height
    ("Return to Self", 292, 60),
    ("The Programme", 391, 60),
]
INK = (72, 56, 41)                  # a shade under the original's (83,66,49): the
                                    # anti-aliasing and the encode both lighten it,
                                    # and the median lands on the original's colour
BANDS = ((225, 300), (326, 416))    # rows that may contain old glyphs, padded
BAND_COLS = (290, 975)

def frame_path(n):
    return os.path.join(FRAMES, "%04d.png" % (n + 1))

def load(n):
    return np.asarray(Image.open(frame_path(n)).convert("RGB"), dtype=np.float32)

# ---- the old glyph mask, from the finished card ---------------------------------
card = load(LAST)
L = card.mean(axis=2)
card_level = float(np.median(L))
mask = np.zeros(L.shape, dtype=np.uint8)
for y0, y1 in BANDS:
    band = L[y0:y1 + 1, BAND_COLS[0]:BAND_COLS[1]]
    mask[y0:y1 + 1, BAND_COLS[0]:BAND_COLS[1]] = (band < card_level - 45).astype(np.uint8)
mask = cv2.dilate(mask, np.ones((5, 5), np.uint8))          # take the anti-aliased fringe too
print("old glyph mask: %d px" % int(mask.sum()))

# ---- the new text, as a soft coverage layer ----------------------------------------
probe = ImageFont.truetype(FONT, 100)
pim = Image.new("L", (300, 200), 0)
ImageDraw.Draw(pim).text((20, 20), "H", font=probe, fill=255)
rows = np.where(np.asarray(pim).max(axis=1) > 128)[0]
cap_ratio = (rows.max() - rows.min() + 1) / 100.0

text = Image.new("L", (card.shape[1], card.shape[0]), 0)
for words, baseline, cap in LINES:
    size = int(round(cap / cap_ratio))
    font = ImageFont.truetype(FONT, size)
    # Centre the *ink*, not the advance box: a face's side bearings put the
    # visible letters off the anchor by a few pixels, and two lines centred by
    # advance width sit visibly off each other's axis.
    line = Image.new("L", text.size, 0)
    ImageDraw.Draw(line).text((CENTRE_X, baseline), words, font=font, fill=255, anchor="ms")
    cols = np.where(np.asarray(line).max(axis=0) > 8)[0]
    shift = CENTRE_X - int(round((cols.min() + cols.max()) / 2.0))
    line = line.transform(line.size, Image.AFFINE, (1, 0, -shift, 0, 1, 0))
    text.paste(line, (0, 0), line)
    cols = np.where(np.asarray(line).max(axis=0) > 8)[0]
    print("set %-16r at %dpx: ink x %d..%d (w=%d, centre %d), shifted %+d" % (
        words, size, cols.min(), cols.max(), cols.max() - cols.min() + 1, (cols.min() + cols.max()) // 2, shift))
text = text.filter(ImageFilter.GaussianBlur(0.55))          # video softness, not print crispness
T = np.asarray(text, dtype=np.float32)[..., None] / 255.0
ink = np.array(INK, dtype=np.float32)[None, None, :]

# ---- per-frame dissolve opacity, measured ----------------------------------------------
# Every well-conditioned pixel in the frame votes, not just a strip above the
# text: the room keeps moving under the dissolve, and a small region's median
# wanders with it. Then the curve is forced monotone (a dissolve only goes one
# way) and lightly smoothed, so the words fade in on one clean ramp.
room = load(D)
den = (card - room).mean(axis=2)
good = np.abs(den) > 40
good[BANDS[0][0]:BANDS[1][1] + 1, BAND_COLS[0]:BAND_COLS[1]] = False   # never vote on the text itself

def alpha_of(fr):
    num = (fr - room).mean(axis=2)
    a = np.median(num[good] / den[good])
    return float(min(1.0, max(0.0, a)))

frames = list(range(D + 1, LAST + 1))
raw = [alpha_of(load(n)) for n in frames]
mono = np.maximum.accumulate(np.array(raw))
alphas = np.convolve(np.pad(mono, 1, mode="edge"), np.ones(3) / 3, mode="valid")
alphas[-1] = 1.0
print("dissolve alpha raw :", " ".join("%.2f" % a for a in raw[::6]))
print("dissolve alpha used:", " ".join("%.2f" % a for a in alphas[::6]), "... %.2f" % alphas[-1])

# ---- rebuild the dissolve ------------------------------------------------------------------
for n, a in zip(frames, alphas):
    fr = load(n)
    bgr = cv2.cvtColor(np.clip(fr, 0, 255).astype(np.uint8), cv2.COLOR_RGB2BGR)
    clean = cv2.inpaint(bgr, mask, 3, cv2.INPAINT_TELEA)
    clean = cv2.cvtColor(clean, cv2.COLOR_BGR2RGB).astype(np.float32)
    k = T * a
    out = clean * (1 - k) + ink * k
    Image.fromarray(np.clip(out + 0.5, 0, 255).astype(np.uint8)).save(frame_path(n))

# ---- encode ------------------------------------------------------------------------------------------
# Frame 324 is a keyframe (GOP 12), so the head is stream-copied bit-for-bit and
# only the tail is encoded, to the same GOP, profile and level so the two
# halves concatenate as one stream. The full re-encode is the fallback.
SRC = "public/video/rts-hero.mp4"
HEAD = "scratch/rts-head.mp4"
TAIL = "scratch/rts-tail.mp4"
X264 = ["-c:v", "libx264", "-preset", "slow", "-crf", "17",
        "-g", "12", "-keyint_min", "12", "-sc_threshold", "0", "-bf", "2",
        "-profile:v", "high", "-level", "3.1", "-pix_fmt", "yuv420p", "-r", "24"]
# Cut by packet count, not by time: with B-frames a timestamp cut on a stream
# copy takes the next keyframe and its neighbour along for the ride, which is
# two duplicated frames at the join — a stutter exactly where it must not be.
# The GOPs are closed, so the first D+1 packets are frames 0..D and no other.
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", SRC, "-frames:v", str(D + 1),
                "-c", "copy", "-an", "-avoid_negative_ts", "make_zero", HEAD], check=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", "24", "-start_number", str(D + 2),
                "-i", os.path.join(FRAMES, "%04d.png")] + X264 + [TAIL], check=True)
with io.open("scratch/concat.txt", "w", encoding="utf-8") as f:
    f.write("file 'rts-head.mp4'\nfile 'rts-tail.mp4'\n")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", "scratch/concat.txt",
                "-c", "copy", "-movflags", "+faststart", OUT], check=True)
print("head+tail concat ->", OUT, os.path.getsize(OUT), "bytes")

subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", "24", "-i", os.path.join(FRAMES, "%04d.png")]
               + X264 + ["-movflags", "+faststart", OUT.replace(".mp4", "-full.mp4")], check=True)
print("full re-encode fallback ->", OUT.replace(".mp4", "-full.mp4"), os.path.getsize(OUT.replace(".mp4", "-full.mp4")), "bytes")
