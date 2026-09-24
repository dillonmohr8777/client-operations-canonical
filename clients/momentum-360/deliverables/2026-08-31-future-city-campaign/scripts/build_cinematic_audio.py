#!/usr/bin/env python3
"""Preserve the original PCM prefix and synthesize the cinematic 3.5s ending."""

from __future__ import annotations

import argparse
import subprocess
import wave
from pathlib import Path

import numpy as np


RATE = 48000
PREFIX_SAMPLES = 303 * 2000
ENDING_SAMPLES = 84 * 2000


def read_pcm24(path: Path) -> np.ndarray:
    raw = subprocess.check_output([
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-i", str(path),
        "-f", "f32le", "-acodec", "pcm_f32le", "-ar", str(RATE), "-ac", "2", "-",
    ])
    return np.frombuffer(raw, dtype="<f4").reshape(-1, 2).astype(np.float64)


def write_pcm24(path: Path, audio: np.ndarray) -> None:
    values = np.clip(audio, -0.999999, 0.999999)
    values = np.round(values * 8388607.0).astype(np.int32).reshape(-1)
    unsigned = values & 0xFFFFFF
    packed = np.empty((values.size, 3), dtype=np.uint8)
    packed[:, 0] = unsigned & 0xFF
    packed[:, 1] = (unsigned >> 8) & 0xFF
    packed[:, 2] = (unsigned >> 16) & 0xFF
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "wb") as wav:
        wav.setnchannels(2)
        wav.setsampwidth(3)
        wav.setframerate(RATE)
        wav.writeframes(packed.tobytes())


def envelope(length: int, attack: int, decay: float) -> np.ndarray:
    env = np.exp(-np.arange(length) / (RATE * decay))
    env[:attack] *= np.linspace(0.0, 1.0, attack, endpoint=False)
    return env


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    source = read_pcm24(args.source)
    if source.shape[0] < PREFIX_SAMPLES:
        raise ValueError("Source audio is shorter than the preserved prefix")
    prefix = source[:PREFIX_SAMPLES].copy()
    n = ENDING_SAMPLES
    t = np.arange(n, dtype=np.float64) / RATE
    rng = np.random.default_rng(360)
    tail = np.zeros((n, 2), dtype=np.float64)

    # Inward collapse: accelerating filtered noise and descending electric tone.
    collapse_len = int(0.60 * RATE)
    collapse_t = np.arange(collapse_len) / RATE
    noise = rng.normal(0.0, 1.0, collapse_len)
    kernel = np.ones(53) / 53.0
    smooth = np.convolve(noise, kernel, mode="same")
    collapse_env = np.sin(np.pi * np.clip(collapse_t / 0.60, 0, 1)) ** 1.3
    tone = np.sin(2 * np.pi * (205 * collapse_t - 92 * collapse_t ** 2))
    collapse = (smooth * 0.25 + tone * 0.06) * collapse_env
    pan = np.linspace(-0.65, 0.65, collapse_len)
    tail[:collapse_len, 0] += collapse * (0.78 - 0.24 * pan)
    tail[:collapse_len, 1] += collapse * (0.78 + 0.24 * pan)

    # Horizontal erase surge at 1.6 seconds.
    surge_start = int(1.60 * RATE)
    surge_len = int(0.40 * RATE)
    surge_t = np.arange(surge_len) / RATE
    surge_noise = rng.normal(0.0, 1.0, surge_len)
    high = surge_noise - np.convolve(surge_noise, np.ones(31) / 31.0, mode="same")
    surge_env = np.sin(np.pi * np.clip(surge_t / 0.40, 0, 1)) ** 1.7
    surge = high * surge_env * 0.075
    tail[surge_start:surge_start + surge_len, 0] += surge * np.linspace(1.0, 0.30, surge_len)
    tail[surge_start:surge_start + surge_len, 1] += surge * np.linspace(0.30, 1.0, surge_len)

    # One heavy impact exactly when MOMENTUM lands at 2.0 seconds.
    hit_start = int(2.0 * RATE)
    hit_len = n - hit_start
    hit_t = np.arange(hit_len) / RATE
    sub = (
        np.sin(2 * np.pi * 42.0 * hit_t) * 0.33
        + np.sin(2 * np.pi * 31.0 * hit_t) * 0.17
        + np.sin(2 * np.pi * 18.0 * hit_t) * 0.08
    ) * envelope(hit_len, 220, 0.72)
    transient = rng.normal(0.0, 1.0, hit_len)
    transient = transient - np.convolve(transient, np.ones(19) / 19.0, mode="same")
    transient *= envelope(hit_len, 16, 0.075) * 0.20
    metallic = np.sin(2 * np.pi * 118.0 * hit_t) * envelope(hit_len, 120, 0.32) * 0.045
    impact = sub + transient + metallic
    tail[hit_start:, 0] += impact
    tail[hit_start:, 1] += impact * 0.985

    # Low-frequency room tail under the exact-logo hold.
    room_start = int(2.62 * RATE)
    room_t = np.arange(n - room_start) / RATE
    room = np.sin(2 * np.pi * 28.0 * room_t) * np.exp(-room_t / 1.2) * 0.055
    tail[room_start:, 0] += room
    tail[room_start:, 1] += room

    # Soft limiter with headroom; the original prefix stays untouched.
    peak = np.max(np.abs(tail))
    if peak > 0.82:
        tail *= 0.82 / peak
    audio = np.vstack((prefix, tail))
    write_pcm24(args.output, audio)
    print(f"wrote {audio.shape[0]} samples ({audio.shape[0] / RATE:.6f}s): {args.output}")


if __name__ == "__main__":
    main()
