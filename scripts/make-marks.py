# -*- coding: utf-8 -*-
"""
Turn the affiliation logos into footer marks.

They arrive as black line art on white — one of them a screenshot, complete
with JPEG ringing and an off-white ground. A background *remover* is the wrong
tool for line art: it hunts for a subject and leaves a halo. Luminance is
already the alpha channel here, so invert it, stretch it to kill the ringing,
and paint the result cream. One asset, no halo, and CSS opacity can then set
how loud it is.
"""
import io, os, sys
from PIL import Image, ImageOps, ImageFilter

SRC = "public/img"
OUT = "public/img"
CREAM = (237, 228, 214)

def build(src, name, black_at=64, white_at=232, pad=0.06, height=200):
    im = Image.open(os.path.join(SRC, src))
    if im.mode in ("RGBA", "LA", "P"):
        im = im.convert("RGBA")
        flat = Image.new("RGB", im.size, (255, 255, 255))
        flat.paste(im, mask=im.split()[-1])
        im = flat
    else:
        im = im.convert("RGB")

    g = ImageOps.grayscale(im)
    # alpha = how dark the pixel is, with the ends clipped so paper reads as
    # nothing and ink reads as solid — this is what removes the screenshot's
    # grey ground and its ringing in one pass.
    lut = [0 if v >= white_at else 255 if v <= black_at else
           int(round(255 * (white_at - v) / float(white_at - black_at)))
           for v in range(256)]
    a = g.point(lut)
    a = a.filter(ImageFilter.MedianFilter(3))          # speckle from the screenshot

    bbox = a.getbbox()
    if bbox:
        a = a.crop(bbox)

    w, h = a.size
    m = int(round(max(w, h) * pad))
    canvas = Image.new("L", (w + 2 * m, h + 2 * m), 0)
    canvas.paste(a, (m, m))
    a = canvas

    scale = height / float(a.size[1])
    a = a.resize((max(1, int(round(a.size[0] * scale))), height), Image.LANCZOS)

    out = Image.new("RGBA", a.size, CREAM + (0,))
    out.putalpha(a)
    out.save(os.path.join(OUT, name + ".png"))
    out.save(os.path.join(OUT, name + ".webp"), "WEBP", quality=92, method=6)
    print("%-22s %s  png %d B  webp %d B" % (
        name, out.size, os.path.getsize(os.path.join(OUT, name + ".png")),
        os.path.getsize(os.path.join(OUT, name + ".webp"))))

# The originals are not kept in the repo — they were one-off drops, and the
# built marks are the artefacts that matter. Restore them beside this script to
# re-run. The Shinbukan mark is the crest alone rather than the full roundel:
# at 38px the lettering around that ring turns to mush, and the label beside it
# already carries the name.
#   build("Screenshot 2026-09-06 194938.png", "mark-shinbukan-roundel", black_at=90, white_at=205)
build("Shin logo a.png",                     "mark-shinbukan")
build("Koyasan Seizanji Temple - logo.png",  "mark-seizanji")
