#!/usr/bin/env python3
"""
Produce a fully self-contained single-file version of a build, for publishing as
an Artifact.

The Artifact CSP blocks every external host — no font CDN, no remote images, no
CDN scripts, no iframes. So this inlines:

  * tokens.css + styles.css  ->  one <style>
  * script.js                ->  one <script>
  * every <img>              ->  a data: URI (SVG inlined as text, rasters base64)
  * the Google Fonts <link>  ->  @font-face blocks with base64 woff2

`<picture>`/`<source>`/`srcset` are collapsed to a single `<img src>` so each
image is embedded exactly once rather than at every responsive width.

YouTube facades become links that open in a new tab, since iframes are blocked.

Usage:  python3 tools/build-artifact.py design-a  out.html
"""

from __future__ import annotations

import base64
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FONTS = Path("/tmp/claude-0/-home-user/e2358e9b-4271-55da-9035-9c21b332ecdb/scratchpad/fonts")

# One representative width per image. These are the widths the layout actually
# renders at; embedding every srcset step would triple the file for no gain.
WIDTH = {
    "founders-duo-studio": 720,
    "founder-mac-frederick": 480,
    "founder-sean-boyle": 480,
    "founders-lobby-conversation": 960,
    "founders-inc5000-plaque": 595,
    "philadelphia-momentum": 360,
    "press-modern-luxury-spread": 399,
    "momentum-360-lockup": 320,
    "inc-5000": 363,
    "philly-100": 360,
    "rankwatch-2024": 320,
    "best-of-pennsylvania": 89,
    "la-moving-google-ads": 640,
    "vista-river-hospice-seo": 640,
    "samuels-garage-door-seo": 640,
    "elite-doors-map-pack": 640,
    "ram-group-lsa": 640,
    "poster-TbmZvAmPP6I": 640,
    "poster-26H8QfU_qMg": 640,
    "poster-BAMHdvzwwAg": 640,
    "poster-K41kmhSetmE": 640,
}

MIME = {".avif": "image/avif", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg"}


def font_faces() -> str:
    """@font-face blocks with the woff2 payload inlined."""
    import json

    faces = json.load(open(FONTS / "resolved.json"))
    # DM Sans ships as one variable file covering 400-700, so emit a single
    # face with a weight range instead of three identical payloads.
    done: set[str] = set()
    css = []
    for fam, wt, style, fn in faces:
        key = f"{fam}|{style}"
        if key in done:
            continue
        done.add(key)
        b64 = base64.b64encode((FONTS / fn).read_bytes()).decode()
        weight = "400 700" if fam == "DM Sans" else ("700 800" if fam == "Poppins" else wt)
        css.append(
            f"@font-face{{font-family:'{fam}';font-style:{style};font-weight:{weight};"
            f"font-display:swap;src:url(data:font/woff2;base64,{b64}) format('woff2')}}"
        )
    return "\n".join(css)


def data_uri(rel: str) -> str | None:
    """Resolve an asset reference to a data: URI, picking one width."""
    rel = rel.split("?")[0]
    name = Path(rel).name

    if name.endswith(".svg"):
        p = ROOT / "shared" / "assets" / "brand" / name
        if not p.exists():
            return None
        svg = p.read_text()
        # utf8 data URI keeps SVG readable and smaller than base64
        return "data:image/svg+xml;utf8," + svg.replace("#", "%23").replace('"', "'")

    stem = re.sub(r"-\d+$", "", Path(name).stem)
    want = WIDTH.get(stem)
    base_dir = (ROOT / "shared" / "assets" / Path(rel).parent.name)
    for ext in (".avif", ".webp", ".png", ".jpg"):
        cand = base_dir / (f"{stem}-{want}{ext}" if want else f"{stem}{ext}")
        if cand.exists():
            b64 = base64.b64encode(cand.read_bytes()).decode()
            return f"data:{MIME[ext]};base64,{b64}"
    return None


def build(slug: str) -> str:
    src = ROOT / slug / "index.html"
    html = src.read_text()

    # --- collapse <picture> to a single <img> -------------------------------
    def collapse(m: re.Match) -> str:
        inner = m.group(1)
        img = re.search(r"<img\b[^>]*>", inner, re.S)
        return img.group(0) if img else ""

    html = re.sub(r"<picture>(.*?)</picture>", collapse, html, flags=re.S)
    html = re.sub(r'\s+srcset="[^"]*"', "", html, flags=re.S)
    html = re.sub(r"\s+sizes=\"[^\"]*\"", "", html, flags=re.S)

    # --- inline every remaining image reference ------------------------------
    missing: list[str] = []

    def swap(m: re.Match) -> str:
        attr, ref = m.group(1), m.group(2)
        uri = data_uri(ref)
        if not uri:
            missing.append(ref)
            return m.group(0)
        return f'{attr}="{uri}"'

    html = re.sub(r'(src|href)="((?:\.\./)?shared/assets/[^"]+)"', swap, html)

    # --- fonts: drop the CDN link, inline the faces --------------------------
    html = re.sub(r'\s*<link rel="preconnect"[^>]*>', "", html)
    html = re.sub(r'\s*<link\s+rel="stylesheet"\s+href="https://fonts\.googleapis[^>]*>', "", html, flags=re.S)
    html = re.sub(r'\s*<link rel="preload"[^>]*>', "", html)

    # --- inline CSS ----------------------------------------------------------
    tokens = (ROOT / "shared" / "tokens.css").read_text()
    skin_path = ROOT / slug / "styles.css"
    skin = skin_path.read_text() if skin_path.exists() else ""
    inline_style = re.search(r"<style>(.*?)</style>", html, re.S)
    extra = inline_style.group(1) if inline_style else ""
    if inline_style:
        html = html.replace(inline_style.group(0), "")

    # These pages deliberately commit to one dark visual world, so the palette
    # is pinned rather than following the viewer's theme. Stated, not omitted.
    pin = (
        ":root,:root[data-theme='dark'],:root[data-theme='light']{color-scheme:dark}"
        "@media (prefers-color-scheme: light){:root{color-scheme:dark}}"
    )
    css = "\n".join([font_faces(), tokens, skin, extra, pin])
    html = re.sub(
        r'<link rel="stylesheet" href="(?:\.\./shared/)?tokens\.css" />\s*'
        r'(?:<link rel="stylesheet" href="styles\.css" />)?',
        f"<style>\n{css}\n</style>",
        html,
        count=1,
    )

    # --- inline JS -----------------------------------------------------------
    js_path = ROOT / slug / "script.js"
    if js_path.exists():
        html = html.replace(
            '<script src="script.js"></script>',
            f"<script>\n{js_path.read_text()}\n</script>",
        )

    # --- YouTube: iframes are blocked, so the facade becomes a real link -----
    def facade_to_link(m: re.Match) -> str:
        block = m.group(0)
        vid = re.search(r'data-yt="([^"]+)"', block)
        if not vid:
            return block
        url = f"https://www.youtube.com/watch?v={vid.group(1)}"
        block = block.replace("<button", f'<a href="{url}" target="_blank" rel="noopener"', 1)
        block = block.replace("</button>", "</a>")
        block = re.sub(r'\s+type="button"', "", block)
        return block

    html = re.sub(r'<button class="facade".*?</button>', facade_to_link, html, flags=re.S)
    # The facades are now <a> elements, so narrow the selector to buttons. This
    # keeps the script syntactically intact (a naive edit here silently breaks
    # paren balance and kills every mechanic on the page) while letting the link
    # navigate natively, since iframes are blocked anyway.
    html = html.replace(
        'document.querySelectorAll(".facade").forEach',
        'document.querySelectorAll("button.facade").forEach',
    )

    if missing:
        print(f"  ! {len(missing)} unresolved asset(s):", file=sys.stderr)
        for r in dict.fromkeys(missing):
            print(f"    {r}", file=sys.stderr)

    return html


def main() -> int:
    if len(sys.argv) < 3:
        print(__doc__)
        return 2
    slug, out = sys.argv[1], Path(sys.argv[2])
    html = build(slug)
    out.write_text(html)
    left = len(re.findall(r'(?:src|href)="(?!data:|#|https?://|tel:|mailto:)', html))
    print(f"{slug} -> {out}  {len(html)/1024:.0f} KB   remaining relative refs: {left}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
