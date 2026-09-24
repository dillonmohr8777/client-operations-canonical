#!/usr/bin/env python3
"""Render the deterministic 3.5-second Momentum 360 cinematic ending."""

from __future__ import annotations

import argparse
import math
import subprocess
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont


FPS = 24
FRAMES = 84
FONT_PATH = r"C:\Windows\Fonts\impact.ttf"


def clamp01(value: float) -> float:
    return max(0.0, min(1.0, value))


def smoothstep(value: float) -> float:
    value = clamp01(value)
    return value * value * (3.0 - 2.0 * value)


def ease_out_expo(value: float) -> float:
    value = clamp01(value)
    return 1.0 if value >= 1.0 else 1.0 - 2.0 ** (-10.0 * value)


def alpha_composite_rgb(base: np.ndarray, overlay: Image.Image) -> np.ndarray:
    rgba = np.asarray(overlay, dtype=np.float32)
    alpha = rgba[:, :, 3:4] / 255.0
    return np.clip(base * (1.0 - alpha) + rgba[:, :, :3] * alpha, 0, 255).astype(np.uint8)


def center_text(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont,
                y: int, width: int, fill: tuple[int, int, int, int]) -> tuple[int, int, int, int]:
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    x = (width - tw) // 2
    draw.text((x, y - bbox[1]), text, font=font, fill=fill)
    return x, y, x + tw, y + th


def fit_font(text: str, max_width: int, preferred_size: int) -> ImageFont.FreeTypeFont:
    size = preferred_size
    while size > 40:
        font = ImageFont.truetype(FONT_PATH, size)
        bbox = font.getbbox(text)
        if bbox[2] - bbox[0] <= max_width:
            return font
        size -= 4
    return ImageFont.truetype(FONT_PATH, size)


def scaled_layer(layer: Image.Image, scale: float, y_offset: int = 0,
                 alpha: float = 1.0) -> Image.Image:
    width, height = layer.size
    nw = max(1, int(width * scale))
    nh = max(1, int(height * scale))
    resized = layer.resize((nw, nh), Image.Resampling.LANCZOS)
    if alpha < 0.999:
        a = resized.getchannel("A").point(lambda value: int(value * alpha))
        resized.putalpha(a)
    canvas = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    canvas.alpha_composite(resized, ((width - nw) // 2, (height - nh) // 2 + y_offset))
    return canvas


class EndingRenderer:
    def __init__(self, source_frame: Path, logo_path: Path, width: int, height: int):
        self.width = width
        self.height = height
        self.scale = width / 2160.0
        self.rng = np.random.default_rng(360)
        self.source = np.asarray(
            Image.open(source_frame).convert("RGB").resize((width, height), Image.Resampling.LANCZOS),
            dtype=np.uint8,
        )
        self.logo = Image.open(logo_path).convert("RGBA")
        self.background = self._make_background()
        self._prepare_particles()
        self._prepare_type_layers()

    def _make_background(self) -> np.ndarray:
        h, w = self.height, self.width
        yy, xx = np.mgrid[0:h, 0:w]
        dx = (xx - w * 0.5) / (w * 0.62)
        dy = (yy - h * 0.49) / (h * 0.58)
        glow = np.exp(-(dx * dx + dy * dy) * 5.2)
        bg = np.zeros((h, w, 3), dtype=np.float32)
        bg[:, :, 0] = 0.7 + glow * 1.8
        bg[:, :, 1] = 1.0 + glow * 5.0
        bg[:, :, 2] = 2.0 + glow * 12.0
        vignette = np.clip(1.0 - 0.72 * (dx * dx + dy * dy), 0.12, 1.0)
        bg *= vignette[:, :, None]
        return np.clip(bg, 0, 255).astype(np.uint8)

    def _prepare_particles(self) -> None:
        step = max(2, int(round(4 * self.scale)))
        ys = np.arange(0, self.height, step, dtype=np.int32)
        xs = np.arange(0, self.width, step, dtype=np.int32)
        xx, yy = np.meshgrid(xs, ys)
        xx = xx.reshape(-1)
        yy = yy.reshape(-1)
        jitter = max(1, step // 3)
        xx = np.clip(xx + self.rng.integers(-jitter, jitter + 1, size=xx.size), 0, self.width - 1)
        yy = np.clip(yy + self.rng.integers(-jitter, jitter + 1, size=yy.size), 0, self.height - 1)
        source_color = self.source[yy, xx].astype(np.float32)
        lum = source_color.mean(axis=1)
        selector = self.rng.random(xx.size)
        electric = np.empty_like(source_color)
        blue = selector < 0.58
        violet = (selector >= 0.58) & (selector < 0.86)
        white = selector >= 0.86
        electric[blue] = np.column_stack((lum[blue] * 0.16, lum[blue] * 0.56 + 34, lum[blue] * 0.96 + 58))
        electric[violet] = np.column_stack((lum[violet] * 0.66 + 24, lum[violet] * 0.30 + 18, lum[violet] * 0.98 + 52))
        electric[white] = np.column_stack((lum[white] + 62, lum[white] + 68, lum[white] + 82))
        self.particle_colors = np.clip(source_color * 0.22 + electric * 0.78, 0, 255).astype(np.uint8)
        self.px = xx.astype(np.float32)
        self.py = yy.astype(np.float32)
        self.phase = self.rng.random(xx.size).astype(np.float32) * math.tau
        self.drift = self.rng.normal(0.0, 1.0, size=(xx.size, 2)).astype(np.float32)

    def _prepare_type_layers(self) -> None:
        w, h, s = self.width, self.height, self.scale
        self.statement_top = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        draw = ImageDraw.Draw(self.statement_top)
        top_font = fit_font("THE FUTURE", int(w * 0.88), int(315 * s))
        mid_font = fit_font("DOESN’T NEED", int(w * 0.88), int(315 * s))
        y1 = int(h * 0.37)
        y2 = int(h * 0.452)
        center_text(draw, "THE FUTURE", top_font, y1, w, (244, 248, 255, 255))
        center_text(draw, "DOESN’T NEED", mid_font, y2, w, (244, 248, 255, 255))

        self.statement_bottom = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        draw = ImageDraw.Draw(self.statement_bottom)
        bottom_font = fit_font("ANOTHER AGENCY.", int(w * 0.92), int(300 * s))
        self.statement_bottom_y = int(h * 0.545)
        center_text(draw, "ANOTHER AGENCY.", bottom_font, self.statement_bottom_y, w, (91, 195, 255, 255))

        self.momentum_layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        draw = ImageDraw.Draw(self.momentum_layer)
        small_font = fit_font("IT NEEDS", int(w * 0.68), int(190 * s))
        momentum_font = fit_font("MOMENTUM", int(w * 0.94), int(420 * s))
        center_text(draw, "IT NEEDS", small_font, int(h * 0.405), w, (238, 245, 255, 255))
        center_text(draw, "MOMENTUM", momentum_font, int(h * 0.485), w, (75, 188, 255, 255))

        self.momentum_word = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        draw = ImageDraw.Draw(self.momentum_word)
        center_text(draw, "MOMENTUM", momentum_font, int(h * 0.485), w, (75, 188, 255, 255))

        logo_max_w = int(w * 0.80)
        ratio = min(logo_max_w / self.logo.width, (h * 0.22) / self.logo.height)
        logo = self.logo.resize((int(self.logo.width * ratio), int(self.logo.height * ratio)), Image.Resampling.LANCZOS)
        self.logo_layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        self.logo_layer.alpha_composite(logo, ((w - logo.width) // 2, int(h * 0.455) - logo.height // 2))

    def _add_technical_dust(self, frame: np.ndarray, frame_index: int, strength: float = 1.0) -> np.ndarray:
        out = frame.copy()
        count = max(90, int(520 * self.scale))
        local = np.random.default_rng(9000 + frame_index)
        xs = local.integers(int(self.width * 0.08), int(self.width * 0.92), count)
        ys = local.integers(int(self.height * 0.17), int(self.height * 0.83), count)
        tones = local.choice(np.array([[17, 72, 132], [58, 34, 112], [120, 184, 236]], dtype=np.uint8), count)
        alpha = local.uniform(0.12, 0.50, count) * strength
        old = out[ys, xs].astype(np.float32)
        out[ys, xs] = np.clip(old * (1.0 - alpha[:, None]) + tones * alpha[:, None], 0, 255).astype(np.uint8)
        return out

    def _collapse_frame(self, frame_index: int) -> np.ndarray:
        if frame_index <= 1:
            return self.source.copy()
        progress = smoothstep((frame_index - 2) / 12.0)
        source_alpha = max(0.0, 1.0 - progress * 3.0)
        base = (self.source.astype(np.float32) * source_alpha).astype(np.uint8)
        if progress > 0.22:
            bg_mix = smoothstep((progress - 0.22) / 0.48)
            base = np.clip(base.astype(np.float32) * (1.0 - bg_mix) + self.background.astype(np.float32) * bg_mix, 0, 255).astype(np.uint8)

        cx, cy = self.width * 0.5, self.height * 0.505
        dx = self.px - cx
        dy = self.py - cy
        radius = np.sqrt(dx * dx + dy * dy)
        angle = np.arctan2(dy, dx)
        collapse = (1.0 - progress) ** 2.55
        rotation = progress ** 1.35 * (1.25 + radius / max(self.width, self.height) * 4.8)
        new_radius = radius * collapse
        turbulence = (1.0 - progress) * (16.0 * self.scale)
        nx = cx + new_radius * np.cos(angle + rotation) + self.drift[:, 0] * turbulence
        ny = cy + new_radius * np.sin(angle + rotation) + self.drift[:, 1] * turbulence

        particle = np.zeros_like(base)
        brightness = (0.66 + 0.34 * (1.0 - progress)) * max(0.0, 1.0 - max(0.0, progress - 0.84) * 5.6)
        for echo in range(4):
            echo_scale = 1.0 + echo * 0.010 * (1.0 - progress)
            ex = np.clip((cx + (nx - cx) * echo_scale).astype(np.int32), 0, self.width - 1)
            ey = np.clip((cy + (ny - cy) * echo_scale).astype(np.int32), 0, self.height - 1)
            color = np.clip(self.particle_colors.astype(np.float32) * brightness * (0.38 + echo * 0.16), 0, 255).astype(np.uint8)
            particle[ey, ex] = np.maximum(particle[ey, ex], color)

        particle_img = Image.fromarray(particle, "RGB")
        glow = np.asarray(particle_img.filter(ImageFilter.GaussianBlur(radius=max(1.0, 7.0 * self.scale))), dtype=np.float32)
        out = np.clip(base.astype(np.float32) + particle.astype(np.float32) + glow * 0.42, 0, 255).astype(np.uint8)
        ring = Image.new("RGBA", (self.width, self.height), (0, 0, 0, 0))
        draw = ImageDraw.Draw(ring)
        rr = int((1.0 - progress) * self.height * 0.31)
        if rr > 3:
            alpha = int(130 * (1.0 - progress))
            draw.ellipse((cx - rr, cy - rr, cx + rr, cy + rr), outline=(58, 177, 255, alpha), width=max(1, int(3 * self.scale)))
        out = alpha_composite_rgb(out, ring)
        return out

    def _statement_frame(self, frame_index: int) -> np.ndarray:
        local = frame_index - 14
        base = self._add_technical_dust(self.background, frame_index, 0.68)
        enter = smoothstep(local / 4.0)
        scale = 0.962 + 0.038 * ease_out_expo(local / 6.0)
        y_offset = int((1.0 - enter) * 42 * self.scale)
        top = scaled_layer(self.statement_top, scale, y_offset, enter)
        bottom = scaled_layer(self.statement_bottom, scale, y_offset, enter)
        base = alpha_composite_rgb(base, top)
        base = alpha_composite_rgb(base, bottom)
        marker = Image.new("RGBA", (self.width, self.height), (0, 0, 0, 0))
        draw = ImageDraw.Draw(marker)
        x = int(self.width * 0.084)
        draw.rectangle((x, int(self.height * 0.36), x + max(2, int(5 * self.scale)), int(self.height * 0.635)), fill=(40, 166, 255, int(220 * enter)))
        return alpha_composite_rgb(base, marker)

    def _surge_frame(self, frame_index: int) -> np.ndarray:
        local = frame_index - 38
        p = smoothstep(local / 10.0)
        base = self._add_technical_dust(self.background, frame_index, 0.82)
        top_alpha = 1.0 - smoothstep(max(0.0, p - 0.52) / 0.48) * 0.74
        base = alpha_composite_rgb(base, scaled_layer(self.statement_top, 1.0, 0, top_alpha))
        bottom = np.asarray(self.statement_bottom).copy()
        wipe_x = int(self.width * (0.02 + 0.96 * p))
        bottom[:, :wipe_x, 3] = 0
        base = alpha_composite_rgb(base, Image.fromarray(bottom, "RGBA"))

        surge = Image.new("RGBA", (self.width, self.height), (0, 0, 0, 0))
        draw = ImageDraw.Draw(surge)
        y = int(self.statement_bottom_y + 142 * self.scale)
        line_w = max(3, int(10 * self.scale))
        draw.line((max(0, wipe_x - int(260 * self.scale)), y, wipe_x, y), fill=(88, 178, 255, 130), width=line_w * 4)
        draw.line((max(0, wipe_x - int(180 * self.scale)), y, wipe_x, y), fill=(190, 230, 255, 255), width=line_w)
        for offset in range(1, 7):
            yy = y + int((offset - 3) * 12 * self.scale)
            length = int((48 + offset * 22) * self.scale)
            draw.line((wipe_x - length, yy, wipe_x + length // 3, yy), fill=(74, 70 + offset * 12, 218, 115), width=max(1, int(2 * self.scale)))
        glow = surge.filter(ImageFilter.GaussianBlur(radius=max(1.0, 18.0 * self.scale)))
        base = alpha_composite_rgb(base, glow)
        return alpha_composite_rgb(base, surge)

    def _momentum_frame(self, frame_index: int) -> np.ndarray:
        local = frame_index - 48
        base = self._add_technical_dust(self.background, frame_index, 0.52)
        enter = smoothstep(local / 3.0)
        scale = 1.07 - 0.07 * ease_out_expo(local / 5.0)
        layer = scaled_layer(self.momentum_layer, scale, int((1.0 - enter) * 24 * self.scale), enter)
        glow = layer.filter(ImageFilter.GaussianBlur(radius=max(1.0, 13.0 * self.scale)))
        glow.putalpha(glow.getchannel("A").point(lambda value: int(value * 0.30)))
        base = alpha_composite_rgb(base, glow)
        return alpha_composite_rgb(base, layer)

    def _logo_transform_frame(self, frame_index: int) -> np.ndarray:
        local = frame_index - 62
        p = smoothstep(local / 10.0)
        base = self._add_technical_dust(self.background, frame_index, 0.34 * (1.0 - p))
        word_scale = 1.0 - 0.13 * p
        word = scaled_layer(self.momentum_word, word_scale, int(-24 * self.scale * p), 1.0 - p)
        base = alpha_composite_rgb(base, word)
        logo = np.asarray(self.logo_layer).copy()
        reveal_x = int(self.width * p)
        logo[:, reveal_x:, 3] = 0
        logo_img = Image.fromarray(logo, "RGBA")
        base = alpha_composite_rgb(base, logo_img)
        line = Image.new("RGBA", (self.width, self.height), (0, 0, 0, 0))
        draw = ImageDraw.Draw(line)
        draw.line((max(0, reveal_x - int(150 * self.scale)), int(self.height * 0.455), reveal_x, int(self.height * 0.455)), fill=(105, 211, 255, int(240 * (1.0 - p * 0.6))), width=max(2, int(7 * self.scale)))
        return alpha_composite_rgb(base, line)

    def _logo_hold_frame(self, frame_index: int) -> np.ndarray:
        base = self.background.copy()
        logo = self.logo_layer.copy()
        if frame_index < 75:
            pulse = 0.14 * (1.0 - (frame_index - 72) / 3.0)
            glow = logo.filter(ImageFilter.GaussianBlur(radius=max(1.0, 22.0 * self.scale)))
            glow.putalpha(glow.getchannel("A").point(lambda value: int(value * pulse)))
            base = alpha_composite_rgb(base, glow)
        return alpha_composite_rgb(base, logo)

    def render_frame(self, frame_index: int) -> np.ndarray:
        if frame_index < 14:
            return self._collapse_frame(frame_index)
        if frame_index < 38:
            return self._statement_frame(frame_index)
        if frame_index < 48:
            return self._surge_frame(frame_index)
        if frame_index < 62:
            return self._momentum_frame(frame_index)
        if frame_index < 72:
            return self._logo_transform_frame(frame_index)
        return self._logo_hold_frame(frame_index)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-frame", type=Path, required=True)
    parser.add_argument("--logo", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--width", type=int, default=2160)
    parser.add_argument("--height", type=int, default=3840)
    parser.add_argument("--crf", type=int, default=12)
    args = parser.parse_args()

    args.output.parent.mkdir(parents=True, exist_ok=True)
    renderer = EndingRenderer(args.source_frame, args.logo, args.width, args.height)
    ffmpeg = [
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
        "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{args.width}x{args.height}",
        "-r", str(FPS), "-i", "-", "-an", "-c:v", "libx264", "-preset", "medium",
        "-crf", str(args.crf), "-profile:v", "high", "-level:v", "5.1",
        "-pix_fmt", "yuv420p", "-r", str(FPS), "-g", "48", "-keyint_min", "48",
        "-movflags", "+faststart", str(args.output),
    ]
    process = subprocess.Popen(ffmpeg, stdin=subprocess.PIPE)
    assert process.stdin is not None
    try:
        for frame_index in range(FRAMES):
            frame = renderer.render_frame(frame_index)
            process.stdin.write(frame.tobytes())
            if frame_index % 12 == 0:
                print(f"rendered {frame_index + 1}/{FRAMES}", flush=True)
    finally:
        process.stdin.close()
    return_code = process.wait()
    if return_code != 0:
        raise SystemExit(return_code)
    print(f"rendered {FRAMES}/{FRAMES}: {args.output}", flush=True)


if __name__ == "__main__":
    main()
