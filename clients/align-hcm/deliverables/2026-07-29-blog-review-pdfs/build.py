#!/usr/bin/env python3
"""Build the Align HCM blog review PDFs.

For each page in src/:
  * dist/<name>.html  standalone HTML with every asset inlined as a data URI
  * dist/<name>.pdf   A4 review PDF rendered by headless Chromium

Usage: python3 build.py [--no-pdf] [name ...]
"""

from __future__ import annotations

import base64
import mimetypes
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"
DIST = ROOT / "dist"
ASSETS = ROOT / "assets"

CHROME_CANDIDATES = [
    "/opt/pw-browsers/chromium",
    "chromium",
    "chromium-browser",
    "google-chrome",
]


def find_chrome() -> str | None:
    for c in CHROME_CANDIDATES:
        if Path(c).exists() or shutil.which(c):
            return c
    return None


def data_uri(path: Path) -> str:
    mime = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
    if path.suffix == ".woff2":
        mime = "font/woff2"
    return f"data:{mime};base64," + base64.b64encode(path.read_bytes()).decode()


def inline_css(css_path: Path) -> str:
    """Resolve @import and url() references relative to the stylesheet."""
    css = css_path.read_text(encoding="utf-8")

    def sub_import(m: re.Match[str]) -> str:
        target = css_path.parent / m.group(1)
        return inline_css(target) if target.exists() else ""

    css = re.sub(r'@import\s+url\(["\']?([^"\')]+)["\']?\);', sub_import, css)

    def sub_url(m: re.Match[str]) -> str:
        ref = m.group(1).strip("'\"")
        if ref.startswith(("data:", "http:", "https:")):
            return m.group(0)
        target = (css_path.parent / ref).resolve()
        return f"url({data_uri(target)})" if target.exists() else m.group(0)

    return re.sub(r"url\(([^)]+)\)", sub_url, css)


def build_standalone(src: Path) -> Path:
    html = src.read_text(encoding="utf-8")

    def sub_link(m: re.Match[str]) -> str:
        href = m.group(1)
        target = (src.parent / href).resolve()
        if not target.exists():
            return m.group(0)
        return "<style>\n" + inline_css(target) + "\n</style>"

    html = re.sub(
        r'<link\s+rel="stylesheet"\s+href="([^"]+)"\s*/?>', sub_link, html
    )

    def sub_img(m: re.Match[str]) -> str:
        ref = m.group(1)
        if ref.startswith(("data:", "http:", "https:")):
            return m.group(0)
        target = (src.parent / ref).resolve()
        return m.group(0).replace(ref, data_uri(target)) if target.exists() else m.group(0)

    html = re.sub(r'src="([^"]+)"', sub_img, html)

    DIST.mkdir(exist_ok=True)
    out = DIST / f"{src.stem}.html"
    out.write_text(html, encoding="utf-8")
    return out


def render_pdf(standalone: Path) -> Path | None:
    chrome = find_chrome()
    if not chrome:
        print("  ! no Chromium found; skipping PDF", file=sys.stderr)
        return None
    out = DIST / f"{standalone.stem}.pdf"
    with tempfile.TemporaryDirectory() as profile:
        subprocess.run(
            [
                chrome,
                "--headless",
                "--disable-gpu",
                "--no-sandbox",
                f"--user-data-dir={profile}",
                "--no-pdf-header-footer",
                "--virtual-time-budget=20000",
                f"--print-to-pdf={out}",
                standalone.as_uri(),
            ],
            check=True,
            capture_output=True,
        )
    return out


def main() -> int:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    want_pdf = "--no-pdf" not in sys.argv

    pages = sorted(SRC.glob("*.html"))
    if args:
        pages = [p for p in pages if any(a in p.name for a in args)]
    if not pages:
        print("no matching pages in src/", file=sys.stderr)
        return 1

    for src in pages:
        print(f"* {src.name}")
        standalone = build_standalone(src)
        print(f"  -> {standalone.relative_to(ROOT)}  ({standalone.stat().st_size // 1024} KB)")
        if want_pdf:
            pdf = render_pdf(standalone)
            if pdf:
                print(f"  -> {pdf.relative_to(ROOT)}  ({pdf.stat().st_size // 1024} KB)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
