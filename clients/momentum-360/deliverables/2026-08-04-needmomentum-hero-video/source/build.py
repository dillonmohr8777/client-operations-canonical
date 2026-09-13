#!/usr/bin/env python3
"""
Need Momentum - animated web hero.

  intro : particles stream in and assemble the Need Momentum mark on a dark
          navy backdrop, hold crisp, then burst apart as the footage arrives.
  film  : source footage, cropped to 1.91:1.
  outro : dark-blue-to-black card. Particles rebuild the mark, then the mark
          sheds particles that fly out and settle into "NEED MOMENTUM".

Usage:  build.py preview 20,34,60,300,340,409
        build.py render out.mp4
"""
import math
import os
import subprocess
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy.ndimage import binary_fill_holes, gaussian_filter

# ---------------------------------------------------------------- canvas ----
W, H = 1200, 628
FPS = 24
WH = W * H

HERE = os.path.dirname(os.path.abspath(__file__))
LOGO_SRC = os.path.join(HERE, "logo.png")
VF_DIR = os.path.join(HERE, "vf")
FONT = "/mnt/skills/examples/canvas-design/canvas-fonts/Outfit-Bold.ttf"

BLUE = np.array([42, 128, 194], np.float32) / 255.0   # exact brand blue
FLY = np.array([96, 182, 246], np.float32) / 255.0    # in-flight particle glow
INK = np.array([246, 250, 255], np.float32) / 255.0   # settled text white

N_VID = len(sorted(f for f in os.listdir(VF_DIR) if f.endswith(".png")))

# ------------------------------------------------------------- timeline -----
F_VID_START = 54
F_VID_END = F_VID_START + N_VID          # exclusive
F_IN_DISS = (F_VID_START, F_VID_START + 9)
F_END_DISS = (F_VID_END - 17, F_VID_END)
F_TOTAL = F_VID_END + 151   # holds for exactly two pulse cycles, ending at rest

# intro mark
I_ASM = (0, 16)          # particle delays spread across here
I_SCAT = (50, 66)        # burst apart
I_BMP = (28, 38, 50, 55)  # bitmap opacity: up-start, up-end, down-start, down-end

# end card, anchored to the film's last frame
E_LOGO_D0 = F_VID_END - 17
E_LOGO_BMP = (F_VID_END + 23, F_VID_END + 37)
E_TEXT_D0 = F_VID_END + 17
E_TEXT_BMP = (F_VID_END + 61, F_VID_END + 75)

# the wordmark's pulse, phased to start from rest the moment it lands
PULSE_PERIOD = 38.0
PULSE_T0 = E_TEXT_BMP[1]

# ------------------------------------------------------------- helpers ------
def smoothstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def ease_out(u):
    return 1.0 - (1.0 - u) ** 3.4


def lerp(a, b, t):
    return a + (b - a) * t


def pulse(f):
    """0 at the moment the wordmark lands, then breathes 0..1."""
    return 0.5 - 0.5 * math.cos(2.0 * math.pi * (f - PULSE_T0) / PULSE_PERIOD)


class Layer:
    """A canvas-sized RGBA plate."""

    def __init__(self, rgb, a):
        self.rgb = rgb
        self.a = a


# --------------------------------------------------------- logo rebuild -----
def logo_masks(ss_h, oversample=4):
    """Rebuild the mark at ss_h px tall: blue coverage + enclosed-white coverage.

    The source PNG only carries the blue; the ring gap and the script 'm' are
    transparent. Filling the holes of the blue mask recovers them, which is
    what has to read as white on a dark card.
    """
    src = np.array(Image.open(LOGO_SRC).convert("RGBA"))
    a = src[:, :, 3].astype(np.float32) / 255.0
    ys, xs = np.nonzero(binary_fill_holes(a > 0.5))
    a = a[ys.min(): ys.max() + 1, xs.min(): xs.max() + 1]

    # upscale the soft alpha, re-threshold for crisp curves, then box-average
    # back down so the edges land antialiased instead of jagged.
    hi_h = int(ss_h * oversample)
    hi_w = int(round(a.shape[1] / a.shape[0] * hi_h))
    big = np.array(
        Image.fromarray((a * 255).astype(np.uint8)).resize((hi_w, hi_h), Image.LANCZOS)
    ).astype(np.float32) / 255.0

    blue_hi = big > 0.5
    fill_hi = binary_fill_holes(blue_hi)
    white_hi = fill_hi & ~blue_hi

    def box(m):
        h = (m.shape[0] // oversample) * oversample
        w = (m.shape[1] // oversample) * oversample
        return (
            m[:h, :w]
            .astype(np.float32)
            .reshape(h // oversample, oversample, w // oversample, oversample)
            .mean(axis=(1, 3))
        )

    return box(blue_hi), box(white_hi)


def logo_layer(height, cx, cy):
    blue_c, white_c = logo_masks(height)
    h, w = blue_c.shape
    x0, y0 = int(round(cx - w / 2)), int(round(cy - h / 2))

    rgb = np.zeros((H, W, 3), np.float32)
    al = np.zeros((H, W), np.float32)
    sl = (slice(y0, y0 + h), slice(x0, x0 + w))

    cov = blue_c + white_c
    prem = blue_c[..., None] * BLUE + white_c[..., None] * 1.0
    rgb[sl] = np.divide(prem, np.maximum(cov, 1e-6)[..., None])
    al[sl] = np.clip(cov, 0, 1)
    return Layer(rgb, al)


# ---------------------------------------------------------- text plate ------
def text_layer(text, target_w, cy, tracking=0.15, oversample=4):
    # Punctuation has to hug the letter it follows. At this much tracking a
    # uniform gap would read as "MOMENTUM ?" rather than "MOMENTUM?".
    def gaps_for(size):
        t = tracking * size
        return [
            t * (0.14 if text[i + 1] in "?!,.:;" else 1.0)
            for i in range(len(text) - 1)
        ]

    probe = ImageFont.truetype(FONT, 100)
    unit = sum(probe.getlength(c) for c in text) + sum(gaps_for(100))
    size = 100.0 * target_w / unit

    ss = int(round(size * oversample))
    font = ImageFont.truetype(FONT, ss)
    gaps = gaps_for(ss)
    total = sum(font.getlength(c) for c in text) + sum(gaps)

    pad = ss
    img = Image.new("L", (int(total) + 2 * pad, int(ss * 2.2)), 0)
    d = ImageDraw.Draw(img)
    x = float(pad)
    base = int(ss * 1.5)
    for i, c in enumerate(text):
        d.text((x, base), c, font=font, fill=255, anchor="ls")
        x += font.getlength(c) + (gaps[i] if i < len(gaps) else 0.0)

    m = np.array(img, np.float32) / 255.0
    ys, xs = np.nonzero(m > 0.004)
    m = m[ys.min(): ys.max() + 1, xs.min(): xs.max() + 1]

    o = oversample
    hh, ww = (m.shape[0] // o) * o, (m.shape[1] // o) * o
    cov = m[:hh, :ww].reshape(hh // o, o, ww // o, o).mean(axis=(1, 3))

    h, w = cov.shape
    x0, y0 = int(round(W / 2 - w / 2)), int(round(cy - h / 2))
    rgb = np.zeros((H, W, 3), np.float32)
    al = np.zeros((H, W), np.float32)
    rgb[y0: y0 + h, x0: x0 + w] = INK
    al[y0: y0 + h, x0: x0 + w] = np.clip(cov, 0, 1)
    return Layer(rgb, al)


# ------------------------------------------------------- point sampling -----
def sample(layer, n, rng):
    ys, xs = np.nonzero(layer.a > 0.03)
    p = layer.a[ys, xs].astype(np.float64)
    p /= p.sum()
    i = rng.choice(len(ys), size=n, replace=True, p=p)
    px = xs[i] + rng.random(n)
    py = ys[i] + rng.random(n)
    return (
        np.stack([px, py], 1).astype(np.float32),
        layer.rgb[ys[i], xs[i]].astype(np.float32),
    )


# ------------------------------------------------------------- splatting ----
def splat(bufs, pos, col, wgt):
    x, y = pos[:, 0], pos[:, 1]
    x0 = np.floor(x).astype(np.int32)
    y0 = np.floor(y).astype(np.int32)
    fx, fy = x - x0, y - y0

    I, T, C = [], [], []
    for dx in (0, 1):
        for dy in (0, 1):
            xi, yi = x0 + dx, y0 + dy
            ww = (fx if dx else 1 - fx) * (fy if dy else 1 - fy) * wgt
            m = (xi >= 0) & (xi < W) & (yi >= 0) & (yi < H) & (ww > 1e-4)
            I.append(yi[m] * W + xi[m])
            T.append(ww[m])
            C.append(col[m])
    idx = np.concatenate(I)
    if idx.size == 0:
        return
    t = np.concatenate(T).astype(np.float64)
    c = np.concatenate(C)
    for ch in range(3):
        bufs[ch] += np.bincount(idx, weights=t * c[:, ch], minlength=WH)


def bloom(p):
    tight = gaussian_filter(p, sigma=(1.7, 1.7, 0))
    small = p[::4, ::4]
    wide = gaussian_filter(small, sigma=(4.5, 4.5, 0))
    wide = np.repeat(np.repeat(wide, 4, 0), 4, 1)[:H, :W]
    return p + 0.55 * tight + 0.85 * wide


# ---------------------------------------------------------- particle sets ---
class Swarm:
    """Particles that fly from a start point to a target and settle."""

    def __init__(self, target, col_end, start, d0, dspread, dur0, durspread,
                 rng, col_fly=None, curl=0.26):
        n = len(target)
        self.target = target
        self.start = start
        self.col_end = col_end
        self.col_fly = np.broadcast_to(
            FLY if col_fly is None else col_fly, (n, 3)
        ).astype(np.float32).copy()
        self.col_fly *= (0.72 + 0.5 * rng.random((n, 1))).astype(np.float32)

        self.delay = (d0 + rng.random(n) * dspread).astype(np.float32)
        self.dur = (dur0 + rng.random(n) * durspread).astype(np.float32)

        d = target - start
        L = np.maximum(np.linalg.norm(d, axis=1, keepdims=True), 1e-3)
        perp = np.stack([-d[:, 1], d[:, 0]], 1) / L
        self.arc = perp * (L * curl * (rng.random((n, 1)) - 0.5)).astype(np.float32)

        self.bright = (0.62 + 0.55 * rng.random(n)).astype(np.float32)
        spark = rng.random(n) < 0.045
        self.bright[spark] *= 2.5
        self.phase = (rng.random(n) * math.tau).astype(np.float32)

    def at(self, t):
        u = np.clip((t - self.delay) / self.dur, 0.0, 1.0)
        e = ease_out(u)
        pos = self.start + (self.target - self.start) * e[:, None]
        pos = pos + self.arc * np.sin(np.pi * u)[:, None]

        # settled shimmer so the held card keeps breathing
        s = (u >= 1.0)
        if s.any():
            j = np.sin(self.phase + t * 0.19)[:, None] * 0.55
            pos[s] += j[s] * np.stack([np.ones(len(u)), np.ones(len(u))], 1)[s]

        col = lerp(self.col_fly, self.col_end, smoothstep(0.55, 1.0, u)[:, None])
        a = smoothstep(0.0, 0.14, u) * self.bright
        a = a * (1.0 + 0.5 * smoothstep(0.88, 1.0, u) * (1 - smoothstep(1.0, 1.06, u)))
        return pos, col, a


def scatter(sw, t, t0, dur, rng_dirs):
    """Blow a settled swarm outward - used for the intro's exit."""
    s = np.clip((t - t0) / dur, 0.0, 1.0)
    push = (s ** 1.55) * 720.0
    pos = sw.target + rng_dirs * push
    col = lerp(sw.col_end, FLY, min(1.0, s * 1.5))
    a = sw.bright * (1.0 - smoothstep(0.12, 0.88, s)) * (1.0 + 0.55 * s)
    return pos, col, a


# ------------------------------------------------------------ backdrops -----
def radial(cx, cy, rx, ry, power=1.6):
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    d = ((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2
    return np.exp(-d * power).astype(np.float32)


def vignette():
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    r = ((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2
    return np.clip(1.0 - 0.42 * r, 0.0, 1.0).astype(np.float32)


def arcs():
    """Faint orbital lines echoing the footage's set."""
    ss = 2
    img = Image.new("L", (W * ss, H * ss), 0)
    d = ImageDraw.Draw(img)
    for (cx, cy, rx, ry, wd, val) in [
        (600, 288, 780, 306, 2, 70),
        (600, 236, 520, 214, 2, 46),
        (600, 690, 900, 268, 3, 40),
    ]:
        d.ellipse(
            [(cx - rx) * ss, (cy - ry) * ss, (cx + rx) * ss, (cy + ry) * ss],
            outline=val, width=wd * ss,
        )
    m = np.array(img.resize((W, H), Image.BOX), np.float32) / 255.0
    return gaussian_filter(m, 1.1)


def endcard_bg():
    """Dark blue -> black, spacious, with a blue pool behind the mark."""
    base = np.zeros((H, W, 3), np.float32)
    base[:] = np.array([3, 6, 12], np.float32) / 255.0

    top = np.clip(1.0 - (np.arange(H, dtype=np.float32) / (H * 0.92)), 0, 1) ** 1.7
    base += top[:, None, None] * (np.array([8, 21, 40], np.float32) / 255.0)

    pool = radial(600, 250, 620, 400, 1.5)
    base += pool[..., None] * (np.array([9, 30, 56], np.float32) / 255.0)

    base += arcs()[..., None] * (np.array([40, 108, 172], np.float32) / 255.0) * 0.40
    base *= vignette()[..., None]

    glow = radial(600, 226, 300, 300, 1.9)  # breathes behind the logo
    return base, glow


def intro_bg():
    """Heavily blurred first film frame + a blue pool, so the cut is seamless."""
    v = np.array(Image.open(os.path.join(VF_DIR, "0000.png")).convert("RGB"), np.float32) / 255.0
    soft = gaussian_filter(v, sigma=(46, 46, 0)) * 0.85
    soft += radial(600, 314, 520, 360, 1.7)[..., None] * (
        np.array([7, 22, 42], np.float32) / 255.0
    )
    return (soft * vignette()[..., None]).astype(np.float32)


# ----------------------------------------------------------------- build ----
print("building plates ...", flush=True)
rng = np.random.default_rng(7)

L_INTRO = logo_layer(300, 600, 314)
L_LOGO = logo_layer(236, 600, 226)
L_TEXT = text_layer("NEED MOMENTUM?", 690, 442, tracking=0.155)

# halo plate the pulse rides on, normalised so the amplitude is predictable
TEXT_GLOW = gaussian_filter(L_TEXT.a, 9.0)
TEXT_GLOW = (TEXT_GLOW / max(TEXT_GLOW.max(), 1e-6)).astype(np.float32)
PULSE_COL = np.array([70, 150, 235], np.float32) / 255.0

BG_INTRO = intro_bg()
BG_END, BG_END_GLOW = endcard_bg()
VIG = vignette()

# intro swarm: implodes from a wide ring
t_i, c_i = sample(L_INTRO, 56000, rng)
ang = rng.random(len(t_i)) * math.tau
rad = 430 + rng.random(len(t_i)) * 700
s_i = np.stack([600 + np.cos(ang) * rad, 314 + np.sin(ang) * rad * 0.72], 1).astype(np.float32)
SW_INTRO = Swarm(t_i, c_i, s_i, I_ASM[0], I_ASM[1] - I_ASM[0], 16, 7, rng)
_a = rng.random(len(t_i)) * math.tau
_r = 0.55 + rng.random(len(t_i)) * 0.75
DIR_INTRO = np.stack([np.cos(_a) * _r, np.sin(_a) * _r * 0.85 - 0.14], 1).astype(np.float32)

# end-card mark: same implosion, calmer
t_l, c_l = sample(L_LOGO, 46000, rng)
ang = rng.random(len(t_l)) * math.tau
rad = 360 + rng.random(len(t_l)) * 620
s_l = np.stack([600 + np.cos(ang) * rad, 226 + np.sin(ang) * rad * 0.8], 1).astype(np.float32)
SW_LOGO = Swarm(t_l, c_l, s_l, E_LOGO_D0, 14, 22, 10, rng)

# end-card wordmark: literally shed by the mark, then settles white
t_t, c_t = sample(L_TEXT, 26000, rng)
s_t, c_seed = sample(L_LOGO, len(t_t), rng)
s_t = s_t + rng.normal(0, 4.0, s_t.shape).astype(np.float32)
order = np.argsort(t_t[:, 0])
stag = np.empty(len(t_t), np.float32)
stag[order] = np.linspace(0, 16, len(t_t), dtype=np.float32)
SW_TEXT = Swarm(t_t, c_t, s_t, E_TEXT_D0, 6, 22, 10, rng, col_fly=c_seed, curl=0.34)
SW_TEXT.delay += stag

# ambient dust for the held card
ND = 2600
DUST_P = np.stack([rng.random(ND) * W, rng.random(ND) * H], 1).astype(np.float32)
DUST_V = np.stack([rng.normal(0, 0.10, ND), -0.16 - rng.random(ND) * 0.22], 1).astype(np.float32)
DUST_C = lerp(BLUE, np.ones(3, np.float32), rng.random((ND, 1)).astype(np.float32) * 0.85)
DUST_B = (0.10 + rng.random(ND) * 0.30).astype(np.float32)
DUST_PH = (rng.random(ND) * math.tau).astype(np.float32)


def video(i):
    i = max(0, min(N_VID - 1, i))
    return np.array(
        Image.open(os.path.join(VF_DIR, "%04d.png" % i)).convert("RGB"), np.float32
    ) / 255.0


def over(dst, layer, op, gain=1.0):
    if op <= 0.001:
        return dst
    a = (layer.a * op)[..., None]
    return dst * (1 - a) + np.clip(layer.rgb * gain, 0, 1) * a


def ramp(f, a, b):
    return float(np.clip((f - a) / max(b - a, 1e-6), 0, 1))


# ------------------------------------------------------------- one frame ----
def frame(f):
    # ---- base plate
    if f < F_VID_START:
        base = BG_INTRO.copy()
    elif f < F_VID_END:
        v = video(f - F_VID_START)
        if f < F_IN_DISS[1]:
            base = lerp(BG_INTRO, v, ramp(f, *F_IN_DISS))
        elif f >= F_END_DISS[0]:
            base = lerp(v, BG_END, ramp(f, *F_END_DISS))
        else:
            base = v
    else:
        base = BG_END.copy()

    pz = pulse(f)
    on_card = ramp(f, F_END_DISS[0], F_END_DISS[1] + 6)
    if on_card > 0:
        g = 0.30 + 0.05 * pz          # the pool breathes on the wordmark's beat
        base = base + BG_END_GLOW[..., None] * (
            np.array([15, 44, 80], np.float32) / 255.0
        ) * g * on_card

    # ---- particle energy, two sub-steps for motion blur
    bufs = [np.zeros(WH), np.zeros(WH), np.zeros(WH)]
    o_ib = ramp(f, *I_BMP[:2]) * (1 - ramp(f, *I_BMP[2:]))
    o_lb = ramp(f, *E_LOGO_BMP)
    o_tb = ramp(f, *E_TEXT_BMP)

    vid_in = ramp(f, *F_IN_DISS)   # how much footage is already showing
    for sub, wsub in ((0.0, 0.5), (0.5, 0.5)):
        t = f + sub
        if t < I_SCAT[1] + 2:
            if t < I_SCAT[0]:
                p, c, a = SW_INTRO.at(t)
                a = a * (1 - 0.55 * o_ib)
            else:
                p, c, a = scatter(
                    SW_INTRO, t, I_SCAT[0], I_SCAT[1] - I_SCAT[0], DIR_INTRO
                )
                a = a * (1 - 0.66 * vid_in)   # never veil the footage
            splat(bufs, p, c, a * 0.15 * wsub)

        if t > E_LOGO_D0 - 2:
            p, c, a = SW_LOGO.at(t)
            splat(bufs, p, c, a * (1 - 0.58 * o_lb) * 0.15 * wsub)

            p, c, a = SW_TEXT.at(t)
            # settled grains twinkle with the pulse; in-flight ones are untouched
            splat(bufs, p, c, a * (1 - 0.55 * o_tb) * (1 + 0.42 * pz * o_tb)
                  * 0.16 * wsub)

            if on_card > 0:
                dp = DUST_P + DUST_V * (t - E_LOGO_D0)
                dp[:, 0] = np.mod(dp[:, 0], W)
                dp[:, 1] = np.mod(dp[:, 1], H)
                tw = 0.55 + 0.45 * np.sin(DUST_PH + t * 0.10)
                splat(bufs, dp, DUST_C, DUST_B * tw * on_card * 0.15 * wsub)

    p = np.stack([b.reshape(H, W) for b in bufs], -1).astype(np.float32)
    p = bloom(p)
    if o_tb > 0.001:
        p = p + TEXT_GLOW[..., None] * PULSE_COL * (0.10 + 0.40 * pz) * o_tb
    out = 1.0 - (1.0 - base) * (1.0 - np.clip(p, 0, 1))

    # ---- crisp plates on top so the marks read exactly
    out = over(out, L_INTRO, o_ib)
    out = over(out, L_LOGO, o_lb)
    out = over(out, L_TEXT, o_tb, gain=0.92 + 0.11 * pz)

    out *= lerp(1.0, VIG[..., None], 0.35 * on_card)
    out += np.random.default_rng(1000 + f).normal(0, 1.15 / 255, (H, W, 1)).astype(np.float32)
    return (np.clip(out, 0, 1) * 255 + 0.5).astype(np.uint8)


# ------------------------------------------------------------------ main ----
if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else "render"

    if mode == "preview":
        for s in sys.argv[2].split(","):
            i = int(s)
            Image.fromarray(frame(i)).save(os.path.join(HERE, "prev_%04d.png" % i))
            print("  preview", i, flush=True)
        sys.exit()

    out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, "master.mp4")
    print("rendering %d frames -> %s" % (F_TOTAL, out), flush=True)
    ff = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-y",
         "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", "%dx%d" % (W, H), "-r", str(FPS),
         "-i", "-",
         "-c:v", "libx264", "-preset", "slow", "-crf", "16",
         "-pix_fmt", "yuv420p", "-movflags", "+faststart", out],
        stdin=subprocess.PIPE,
    )
    for f in range(F_TOTAL):
        ff.stdin.write(frame(f).tobytes())
        if f % 25 == 0:
            print("   %d/%d" % (f, F_TOTAL), flush=True)
    ff.stdin.close()
    ff.wait()
    print("done", F_TOTAL / FPS, "s", flush=True)
