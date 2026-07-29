"""Mock up the navy intro and outro cards for the industries video.

The deck's cream plate has a specific gradient character: cool grey in the top
left, brightest through the centre right, and a warm blush in the bottom right.
The navy plate mirrors that structure in brand colours so the two ends read as
the same design system rather than a bolted-on sting.

The outro card's own elements are cut from the video's frame and recoloured for a
dark ground: the navy slogan line becomes warm white, the orange line and the
divider and URL stay orange because orange already reads on navy.
"""
import numpy as np
from PIL import Image, ImageFilter

W, H = 1920, 1080
NAVY_DEEP = np.array([9.0, 20.0, 38.0])     # #091426
NAVY_MID = np.array([20.0, 42.0, 84.0])     # #142A54
ORANGE = np.array([231.0, 104.0, 45.0])     # #E7682D
WARM_WHITE = np.array([247.0, 243.0, 238.0])

SRC = 'outro/full63.png'


def navy_plate():
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    u, v = xx / (W - 1), yy / (H - 1)

    # Base: deepest top-left, lifting toward centre-right, mirroring the cream plate.
    lift = np.clip(0.30 + 0.55 * u + 0.30 * v - 0.22 * (1 - u) * (1 - v), 0, 1)
    base = NAVY_DEEP[None, None, :] + (NAVY_MID - NAVY_DEEP)[None, None, :] * lift[..., None]

    # Cool blue bloom upper right, the counterpart of the cream plate's bright corner.
    d_cool = np.hypot((u - 0.80) * 1.10, (v - 0.16) * 1.65)
    cool = np.clip(1 - d_cool / 0.85, 0, 1) ** 2.0
    base += np.array([26.0, 52.0, 104.0])[None, None, :] * cool[..., None] * 0.55

    # Warm blush lower right, matching where the cream plate goes peach.
    d_warm = np.hypot((u - 0.90) * 1.00, (v - 0.92) * 1.50)
    warm = np.clip(1 - d_warm / 0.95, 0, 1) ** 2.2
    base += ORANGE[None, None, :] * warm[..., None] * 0.30

    # Faint vignette so the centre carries the mark.
    d_c = np.hypot((u - 0.5) * 1.05, (v - 0.5) * 1.35)
    base *= (1 - 0.20 * np.clip(d_c / 1.05, 0, 1) ** 2)[..., None]

    rng = np.random.default_rng(20260825)
    base += rng.normal(0.0, 2.0, base.shape)
    return Image.fromarray(np.clip(base, 0, 255).astype(np.uint8), 'RGB')


def cut(src, box, pad=6, lo=42.0, hi=120.0):
    """Lift an element off the cream plate, returning RGBA with clean edges."""
    a = np.asarray(Image.open(src).convert('RGB')).astype(float)
    x0, y0, x1, y1 = box
    crop = a[y0 - pad:y1 + pad, x0 - pad:x1 + pad]
    b = 5
    border = np.concatenate([crop[:b].reshape(-1, 3), crop[-b:].reshape(-1, 3),
                             crop[:, :b].reshape(-1, 3), crop[:, -b:].reshape(-1, 3)])
    bg = np.median(border, axis=0)
    alpha = np.clip((np.abs(crop - bg).sum(2) - lo) / (hi - lo), 0, 1)
    out = np.zeros(crop.shape[:2] + (4,), np.uint8)
    out[..., :3] = np.clip(crop, 0, 255).astype(np.uint8)
    out[..., 3] = (alpha * 255).astype(np.uint8)
    return Image.fromarray(out, 'RGBA')


def recolour(img, target):
    """Repaint an element to a flat target colour, keeping its coverage/alpha."""
    a = np.asarray(img).astype(float)
    out = np.zeros_like(a, dtype=np.uint8)
    out[..., :3] = np.clip(target, 0, 255).astype(np.uint8)
    out[..., 3] = a[..., 3].astype(np.uint8)
    return Image.fromarray(out, 'RGBA')


def paste_centred(canvas, img, cx, top):
    canvas.paste(img, (int(round(cx - img.width / 2)), int(top)), img)


def glow(canvas, cx, cy, radius, colour, strength):
    """Soft bloom behind the mark so it sits in the plate rather than on it."""
    layer = Image.new('RGB', canvas.size, (0, 0, 0))
    arr = np.zeros((canvas.height, canvas.width, 3), np.float32)
    yy, xx = np.mgrid[0:canvas.height, 0:canvas.width].astype(np.float32)
    d = np.hypot(xx - cx, (yy - cy) * 1.25) / radius
    f = np.clip(1 - d, 0, 1) ** 2.0 * strength
    arr += np.array(colour, np.float32)[None, None, :] * f[..., None]
    layer = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), 'RGB')
    layer = layer.filter(ImageFilter.GaussianBlur(40))
    base = np.asarray(canvas).astype(np.float32) + np.asarray(layer).astype(np.float32)
    return Image.fromarray(np.clip(base, 0, 255).astype(np.uint8), 'RGB')


# ---------------------------------------------------------------- elements

slogan1 = cut(SRC, (535, 693, 1370, 763))          # navy italic serif
slogan2 = cut(SRC, (548, 786, 1369, 858))          # orange italic serif
url = cut(SRC, (782, 906, 1127, 928))              # ALIGNHCM.COM
divider = cut(SRC, (930, 628, 995, 632), pad=3)    # thin orange rule

slogan1_light = recolour(slogan1, WARM_WHITE)      # must invert for a dark ground
slogan2_orange = recolour(slogan2, ORANGE)
url_orange = recolour(url, ORANGE)
divider_orange = recolour(divider, ORANGE)

logo = Image.open('newlogo/align-logo-reversed.png')
tag = Image.open('newlogo/align-tagline-reversed.png')

# ---------------------------------------------------------------- cards

def intro_card():
    c = navy_plate()
    c = glow(c, 960, 430, 620, (46, 74, 128), 0.55)
    s = 660 / logo.width                            # native size, awaiting the vector
    L = logo.resize((660, round(logo.height * s)), Image.LANCZOS)
    T = tag.resize((round(tag.width * s * 0.72), round(tag.height * s * 0.72)), Image.LANCZOS)
    paste_centred(c, L, 960, 380)
    paste_centred(c, T, 960, 380 + L.height + 42)
    return c


def outro_card():
    c = navy_plate()
    c = glow(c, 960, 300, 560, (46, 74, 128), 0.45)
    s = 660 / logo.width
    L = logo.resize((660, round(logo.height * s)), Image.LANCZOS)
    paste_centred(c, L, 960, 190)
    paste_centred(c, divider_orange, 960, 470)
    paste_centred(c, slogan1_light, 960, 560)
    paste_centred(c, slogan2_orange, 960, 650)
    paste_centred(c, url_orange, 960, 780)
    # top rule, orange over deep navy
    d = Image.new('RGBA', (W, 5), tuple(int(v) for v in ORANGE) + (255,))
    c.paste(d, (0, 0), d)
    return c


if __name__ == '__main__':
    navy_plate().save('newlogo/navy_plate.png')
    intro_card().save('newlogo/card_intro_navy.png')
    outro_card().save('newlogo/card_outro_navy.png')
    print('wrote navy_plate.png, card_intro_navy.png, card_outro_navy.png')
