#!/usr/bin/env python3
"""
Asset pipeline for the needmomentum.com homepage designs.

Fetches the owned photography that only exists on the live WordPress sites,
copies the owned photography that already lives in this repo, then encodes
every raster to AVIF + WebP at the widths each slot actually needs.

design-a/, design-b/ and review/ all reference ../shared/assets/ directly, so
the two builds are byte-identical on imagery and the comparison is fair.

Usage:  python3 tools/build-assets.py [--skip-download]

Notes
-----
* needmomentum.com and momentumvirtualtours.com sit behind SiteGround's
  sgcaptcha layer, which answers HTTP 202 with a JS challenge to plain
  clients. A browser UA plus a same-origin referer gets real bytes; anything
  that still returns 202 is reported as SKIPPED rather than written, so a
  challenge page never lands on disk pretending to be a photo.
* AVIF is Baseline (Chrome 85 / Firefox 93 / Safari 16.4), so AVIF + WebP with
  no JPEG fallback is safe.
"""

from __future__ import annotations

import argparse
import io
import subprocess
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SHARED = ROOT / "shared" / "assets"
PILOT = (
    ROOT.parent / "2026-07-21-sean-webinar-pilot" / "assets"
)

UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/140.0 Safari/537.36"
)

AVIF_Q = 52
WEBP_Q = 82

# --------------------------------------------------------------------------
# what to build: (destination base, source, widths)
# source is either a Path (already in the repo) or a URL string.
# --------------------------------------------------------------------------

LOCAL: list[tuple[str, Path, list[int]]] = [
    ("img/founders-duo-studio", PILOT / "mac-sean-momentum-glass-hero.png", [480, 720, 1003]),
    ("img/founder-mac-frederick", PILOT / "mac-frederick-founder-bio-v1.png", [480, 720, 1122]),
    ("img/founder-sean-boyle", PILOT / "sean-boyle-founder-bio-v1.png", [480, 720, 1122]),
    ("img/press-modern-luxury-spread", PILOT / "mac-sean-instagram-editorial-source.jpg", [399]),
    ("badge/inc-5000", PILOT / "badges" / "inc-5000.png", [180, 363]),
    ("badge/philly-100", PILOT / "badges" / "philly-100.png", [180, 360]),
    ("badge/rankwatch-2024", PILOT / "badges" / "rankwatch-2024.png", [160, 320]),
    ("badge/best-of-pennsylvania", PILOT / "badges" / "best-of-pennsylvania.webp", [89]),
]

NM = "https://www.needmomentum.com/wp-content/uploads"
MVT = "https://www.momentumvirtualtours.com/wp-content/uploads"
YT = "https://i.ytimg.com/vi"

REMOTE: list[tuple[str, str, list[int]]] = [
    ("img/founders-lobby-conversation", f"{NM}/2024/09/6NyjXkeJ99w-HD.jpg", [640, 960, 1280]),
    ("img/founders-inc5000-plaque", f"{NM}/2026/07/momentum-digital-inc-5000-regionals-award-ai-seo.webp", [400, 595]),
    ("img/philadelphia-momentum", f"{NM}/2025/08/Philadelphia-Momentum-Digital.jpg", [360, 720]),
    ("case/la-moving-google-ads", f"{MVT}/2026/06/Los-Angels-Moving-Company-G-Ads-Case-Study-.png", [640, 960, 1280]),
    ("case/vista-river-hospice-seo", f"{MVT}/2026/06/Vista-River-Hospice-SEO-AEO-Case-Study.png", [640, 960, 1280]),
    ("case/samuels-garage-door-seo", f"{MVT}/2026/06/Samuels-Garage-Door-SEO-AEO-Case-Study.png", [640, 960, 1280]),
    ("case/elite-doors-map-pack", f"{MVT}/2026/06/Local-Map-Pack-SEO-Case-Study-Elite-Doors-.png", [640, 960, 1280]),
    ("case/ram-group-lsa", f"{MVT}/2026/06/Ram-Group-LSA-Case-Study.png", [640, 960, 1280]),
    ("video/poster-TbmZvAmPP6I", f"{YT}/TbmZvAmPP6I/maxresdefault.jpg", [640, 1280]),
    ("video/poster-26H8QfU_qMg", f"{YT}/26H8QfU_qMg/maxresdefault.jpg", [640, 1280]),
    ("video/poster-BAMHdvzwwAg", f"{YT}/BAMHdvzwwAg/maxresdefault.jpg", [640, 1280]),
    ("video/poster-K41kmhSetmE", f"{YT}/K41kmhSetmE/maxresdefault.jpg", [640, 1280]),
]

# Square 1:1 centre crop for anything that reads as a portrait chip.
SQUARE = {"badge/inc-5000", "badge/philly-100", "badge/best-of-pennsylvania"}


def fetch(url: str) -> bytes | None:
    """Return real image bytes, or None when the captcha layer intercepts."""
    referer = "https://www.needmomentum.com/"
    if "momentumvirtualtours" in url:
        referer = "https://www.momentumvirtualtours.com/"
    for attempt in range(4):
        try:
            out = subprocess.run(
                [
                    "curl", "-sSL", "--max-time", "45",
                    "-A", UA, "-e", referer,
                    "-H", "Accept: image/avif,image/webp,image/*,*/*",
                    "-w", "%{http_code}", "-o", "-", url,
                ],
                capture_output=True, timeout=60,
            )
        except subprocess.TimeoutExpired:
            continue
        body = out.stdout
        if len(body) < 4:
            continue
        code = body[-3:].decode("ascii", "ignore")
        body = body[:-3]
        if code == "200" and len(body) > 2000:
            try:
                Image.open(io.BytesIO(body)).verify()
                return body
            except Exception:
                pass
        if attempt < 3:
            import time
            time.sleep(2 * (attempt + 1))
    return None


def encode(base: str, im: Image.Image, widths: list[int]) -> list[str]:
    """Write AVIF + WebP at each width; return the report lines."""
    dest = SHARED / base
    dest.parent.mkdir(parents=True, exist_ok=True)
    im = im.convert("RGBA" if im.mode in ("RGBA", "LA", "P") else "RGB")
    if im.mode == "RGBA":
        # Flatten onto the darkest canvas token so AVIF/WebP alpha edges
        # never fringe white against the near-black page.
        flat = Image.new("RGB", im.size, (3, 3, 3))
        flat.paste(im, mask=im.split()[-1])
        im = flat

    if base in SQUARE:
        side = min(im.size)
        left = (im.width - side) // 2
        top = (im.height - side) // 2
        im = im.crop((left, top, left + side, top + side))

    lines = []
    for w in widths:
        if w > im.width:
            lines.append(f"  ! {base}-{w}: source is only {im.width}px wide — not upscaled")
            continue
        h = round(im.height * w / im.width)
        r = im.resize((w, h), Image.LANCZOS)
        for ext, kwargs in (
            ("avif", dict(quality=AVIF_Q, speed=4)),
            ("webp", dict(quality=WEBP_Q, method=6)),
        ):
            p = dest.parent / f"{dest.name}-{w}.{ext}"
            try:
                r.save(p, **kwargs)
                lines.append(f"  + {p.relative_to(SHARED)}  {p.stat().st_size // 1024} KB  {w}x{h}")
            except Exception as exc:  # pragma: no cover
                lines.append(f"  ! {p.name}: {exc}")
    return lines


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--skip-download", action="store_true")
    args = ap.parse_args()

    report: list[str] = []
    skipped: list[str] = []

    report.append("LOCAL (already owned, in-repo)")
    for base, src, widths in LOCAL:
        if not src.exists():
            skipped.append(f"{base}: missing source {src}")
            continue
        report.append(f"{base}  <-  {src.name}")
        report += encode(base, Image.open(src), widths)

    if not args.skip_download:
        report.append("")
        report.append("REMOTE (owned, fetched from the live sites)")
        cache = ROOT / "tools" / ".cache"
        cache.mkdir(exist_ok=True)
        for base, url, widths in REMOTE:
            cached = cache / (base.replace("/", "_") + Path(url).suffix)
            if cached.exists() and cached.stat().st_size > 2000:
                data = cached.read_bytes()
            else:
                data = fetch(url)
                if data:
                    cached.write_bytes(data)
            if not data:
                skipped.append(f"{base}: blocked or unavailable -> {url}")
                continue
            report.append(f"{base}  <-  {url.rsplit('/', 1)[-1]}")
            report += encode(base, Image.open(io.BytesIO(data)), widths)

    # Both builds and the review hub reference ../shared/assets/ directly, so
    # there is nothing to fan out — one asset tree, one deploy, no duplication.
    report.append("\nboth builds read ../shared/assets/ directly — nothing duplicated")

    print("\n".join(report))
    if skipped:
        print("\nSKIPPED (nothing written — do not ship a captcha page as a photo):")
        for s in skipped:
            print(f"  - {s}")
    total = sum(p.stat().st_size for p in SHARED.rglob("*") if p.is_file())
    print(f"\nshared/assets total: {total / 1024:.0f} KB across "
          f"{sum(1 for p in SHARED.rglob('*') if p.is_file())} files")
    return 0


if __name__ == "__main__":
    sys.exit(main())
