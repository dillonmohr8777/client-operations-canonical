#!/usr/bin/env python3
"""
Flatten this build into one self-contained file for publishing as an Artifact.

The Artifact CSP blocks every external host, so everything is inlined: the two
stylesheets, the script, all four woff2 faces, and every image as a data: URI.
`<picture>`/`srcset` collapse to a single `<img src>` so each image is embedded
once rather than at every responsive width.

Usage:  python3 tools/build-artifact.py out.html [--fragment]

--fragment emits body-only content (Artifacts supply their own doctype/head/body
wrapper, so a full document would nest).
"""

from __future__ import annotations

import base64
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MIME = {
    ".avif": "image/avif",
    ".webp": "image/webp",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".woff2": "font/woff2",
}

# One representative width per responsive image.
PICK = {"founder-mac-frederick": 720, "founder-sean-boyle": 720}


def b64(p: Path) -> str:
    return base64.b64encode(p.read_bytes()).decode()


def uri(rel: str) -> str | None:
    rel = rel.split("?")[0].lstrip("./")
    p = ROOT / rel
    if not p.exists():
        stem = re.sub(r"-\d+$", "", Path(rel).stem)
        want = PICK.get(stem)
        if want:
            for ext in (".avif", ".webp", ".png", ".jpg"):
                c = (ROOT / rel).parent / f"{stem}-{want}{ext}"
                if c.exists():
                    p = c
                    break
    if not p.exists():
        return None
    ext = p.suffix.lower()
    if ext == ".svg":
        svg = p.read_text()
        return "data:image/svg+xml;utf8," + svg.replace("#", "%23").replace('"', "'")
    return f"data:{MIME.get(ext, 'application/octet-stream')};base64,{b64(p)}"


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__)
        return 2
    out = Path(sys.argv[1])
    fragment = "--fragment" in sys.argv

    html = (ROOT / "index.html").read_text()
    css = (ROOT / "tokens.css").read_text() + "\n" + (ROOT / "styles.css").read_text()
    js = (ROOT / "script.js").read_text()

    # fonts referenced from tokens.css by relative url()
    missing: list[str] = []

    def css_url(m: re.Match) -> str:
        ref = m.group(1).strip("\"'")
        u = uri(ref)
        if not u:
            missing.append(ref)
            return m.group(0)
        return f"url({u})"

    css = re.sub(r"url\((['\"]?[^)]+?['\"]?)\)", css_url, css)

    # collapse <picture> and strip responsive attrs
    html = re.sub(
        r"<picture>(.*?)</picture>",
        lambda m: (re.search(r"<img\b[^>]*>", m.group(1), re.S) or [""])[0]
        if re.search(r"<img\b[^>]*>", m.group(1), re.S)
        else "",
        html,
        flags=re.S,
    )
    html = re.sub(r'\s+srcset="[^"]*"', "", html)
    html = re.sub(r'\s+sizes="[^"]*"', "", html)

    def swap(m: re.Match) -> str:
        attr, ref = m.group(1), m.group(2)
        u = uri(ref)
        if not u:
            missing.append(ref)
            return m.group(0)
        return f'{attr}="{u}"'

    html = re.sub(r'(src|href)="(assets/[^"]+)"', swap, html)

    html = re.sub(
        r'<link rel="stylesheet" href="tokens\.css" />\s*<link rel="stylesheet" href="styles\.css" />',
        f"<style>\n{css}\n</style>",
        html,
        count=1,
    )
    html = html.replace('<script src="script.js"></script>', f"<script>\n{js}\n</script>")

    if fragment:
        style = re.search(r"<style>.*?</style>", html, re.S).group(0)
        ld = re.search(r'<script type="application/ld\+json">.*?</script>', html, re.S)
        body = re.search(r"<body>(.*)</body>", html, re.S).group(1)
        html = style + ("\n" + ld.group(0) if ld else "") + "\n" + body.strip()
        for pat in (r"<!doctype", r"<html\b", r"<head\b", r"<body\b"):
            assert not re.search(pat, html, re.I), f"leftover {pat} in fragment"

    out.write_text(html)
    left = len(re.findall(r'(?:src|href)="(?!data:|#|https?://|tel:|mailto:)', html))
    print(f"-> {out}  {len(html)/1024:.0f} KB   unresolved refs: {left}")
    if missing:
        print("MISSING:", *dict.fromkeys(missing), sep="\n  ")
    return 0


if __name__ == "__main__":
    sys.exit(main())
