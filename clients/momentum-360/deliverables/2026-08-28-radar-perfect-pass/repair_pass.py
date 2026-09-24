#!/usr/bin/env python3
"""Repair Prospect Radar sites: official logos, no colliding mark chips, newer text boxes.

Leaves Haoqi/hello craft routes untouched. Applies the expanded text-box language
from those newer pages to every other profile/factory page.
"""
from __future__ import annotations

import json
import re
import shutil
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from html import unescape
from pathlib import Path
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen

try:
    from PIL import Image
except ImportError:
    Image = None

ROOT = Path(__file__).resolve().parent
COHORTS = Path(r"C:\Users\dillo\Documents\Codex\work\radar-perfect-pass-20260828\cohorts.json")
SRC = Path(r"C:\Users\dillo\Documents\Codex\work\prospect-radar-premium-five-20260826\dist")
DST = Path(r"C:\Users\dillo\Documents\Codex\work\radar-perfect-pass-20260828\dist")
HAOQI = Path(r"C:\Users\dillo\Documents\Codex\work\haoqi-radar-craft-2026-08-17-motion-scale")

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
GENERATOR = "deserves a first screen that makes the next step legible without flattening the character of the work. This private concept begins with the official identity and first-party source material."

CSS_PATCH = """
/* radar-perfect-pass-20260828: newer text boxes, no colliding highlight chips, no hello canvas */
.hero h1, .closing h2, .section-head h2, .story h2, .feature h2, .spotlight h2, .contact-intro h2 {
  line-height: 1.18 !important;
}
h1 mark, h2 mark, .hero h1 mark, .closing h2 mark {
  display: inline;
  padding: 0.06em 0.16em;
  line-height: inherit;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
  background: color-mix(in srgb, var(--accent2, var(--accent, #F05A28)) 82%, transparent);
}
.profile-page .offering-card,
.profile-page .experience-grid article,
.profile-page .proof-grid article,
.profile-page .catalog-card,
.profile-page .contact-card {
  position: relative;
  isolation: isolate;
  min-height: clamp(210px, 22vw, 320px);
  padding: clamp(28px, 4.2vw, 52px) !important;
  background: color-mix(in srgb, var(--paper, #fff) 58%, #fff) !important;
  color: var(--ink, #111) !important;
  backdrop-filter: blur(16px) saturate(1.18);
  -webkit-backdrop-filter: blur(16px) saturate(1.18);
  border: 1px solid color-mix(in srgb, var(--ink, #111) 16%, transparent) !important;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.42), 0 18px 40px color-mix(in srgb, var(--deep, #111) 14%, transparent);
  overflow: hidden;
  overflow-wrap: anywhere;
}
.profile-page .offering-card::after,
.profile-page .experience-grid article::after,
.profile-page .proof-grid article::after,
.profile-page .catalog-card::after,
.profile-page .contact-card::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background:
    linear-gradient(112deg, rgba(255,255,255,.28), transparent 38%),
    linear-gradient(180deg, rgba(255,255,255,.16), transparent 35%);
}
.profile-page .offering-card :is(h3,p,span,strong),
.profile-page .experience-grid article :is(h3,p,span,strong),
.profile-page .proof-grid article :is(span,strong,blockquote),
.profile-page .catalog-card :is(h3,p,span),
.profile-page .contact-card :is(h3,p,span,a,address) {
  color: inherit !important;
}
.brand-logo {
  width: auto;
  max-width: min(220px, 58vw);
  height: 52px;
  object-fit: contain;
  background: transparent !important;
}
"""


def load_hello() -> set[str]:
    data = json.loads(COHORTS.read_text(encoding="utf-8"))
    return set(data.get("hello") or data.get("haoqi") or [])


def json_ld(html: str) -> dict:
    m = re.search(r'<script type="application/ld\+json">(\s*\{.*?\})\s*</script>', html, re.S)
    if not m:
        return {}
    try:
        return json.loads(m.group(1))
    except json.JSONDecodeError:
        return {}


def official_url(html: str, data: dict) -> str | None:
    url = data.get("url")
    if isinstance(url, str) and url.startswith("http"):
        return url
    m = re.search(r'href="(https?://[^"]+)"[^>]*>[^<]*(Official site|Visit official|official website)', html, re.I)
    if m:
        return unescape(m.group(1))
    m = re.search(r'<a class="button[^"]*" href="(https?://[^"]+)"', html)
    if m:
        href = unescape(m.group(1))
        if not href.startswith("tel:"):
            return href
    return None


def business_name(html: str, data: dict, slug: str) -> str:
    name = data.get("name")
    if isinstance(name, str) and name.strip():
        return name.strip()
    m = re.search(r'<title>([^|<]+)', html)
    if m:
        return unescape(m.group(1)).strip()
    return slug.replace("-", " ").title()


def inject_css(html: str) -> str:
    if "radar-perfect-pass-20260828" in html:
        return html
    if "</style>" in html:
        return html.replace("</style>", CSS_PATCH + "\n</style>", 1)
    return html.replace("</head>", f"<style>{CSS_PATCH}</style></head>", 1)


def unwrap_full_h1_mark(html: str) -> str:
    def repl(m: re.Match) -> str:
        inner = unescape(re.sub(r"<[^>]+>", "", m.group(1))).strip()
        return f"<h1>{inner}</h1>"

    return re.sub(r"<h1>\s*<mark>([\s\S]*?)</mark>\s*</h1>", repl, html, count=1)


def replace_generator_copy(html: str, name: str, data: dict) -> str:
    if GENERATOR not in html:
        return html
    city = ""
    addr = data.get("address") or {}
    if isinstance(addr, dict):
        city = addr.get("addressLocality") or ""
    phone = data.get("telephone") or ""
    bits = [name]
    if city:
        bits.append(f"in {city}")
    sentence = f"{' '.join(bits)}."
    if phone:
        sentence += f" Call {phone.replace('+1', '').strip()}."
    else:
        sentence += " Use the official site for hours, services, and the next step."
    return html.replace(GENERATOR, sentence)


def current_logo_path(site: Path, html: str) -> Path | None:
    m = re.search(r'(?:src|href)="(assets/logo\.[a-zA-Z0-9]+)"', html)
    if m:
        p = site / m.group(1).replace("/", "\\")
        if p.exists():
            return p
    for cand in site.glob("assets/logo*"):
        if cand.is_file():
            return cand
    return None


def logo_is_fake_or_weak(path: Path | None) -> bool:
    if path is None or not path.exists():
        return True
    size = path.stat().st_size
    if size < 2500:
        return True
    if path.suffix.lower() == ".svg" and size < 1200:
        return True
    if Image and path.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp", ".gif"}:
        try:
            with Image.open(path) as im:
                w, h = im.size
            if max(w, h) < 64:
                return True
        except Exception:
            return True
    return False


def fetch(url: str, timeout: int = 18) -> tuple[int, bytes, str, str]:
    req = Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
    with urlopen(req, timeout=timeout) as resp:
        return resp.status, resp.read(), resp.headers.get_content_type() or "", resp.geturl()


def rank_logo_urls(page_html: str, page_url: str) -> list[str]:
    urls: list[tuple[int, str]] = []
    for tag in re.findall(r"<img\b[^>]*>", page_html, re.I):
        attrs = dict(re.findall(r'([^\s=/>]+)\s*=\s*"([^"]*)"', tag, re.I))
        src = attrs.get("src") or attrs.get("data-src") or ""
        if not src or src.startswith("data:"):
            continue
        hay = " ".join([attrs.get("class", ""), attrs.get("id", ""), attrs.get("alt", ""), src]).lower()
        score = 0
        if "logo" in hay:
            score += 45
        if "brand" in hay or "header" in hay or "nav" in hay:
            score += 10
        if attrs.get("data-role", "").lower() == "logo":
            score += 100
        if any(bad in hay for bad in ("facebook", "instagram", "sprite", "pixel", "tracking", "icon-16", "favicon")):
            score -= 40
        if score >= 35:
            try:
                urls.append((score, urljoin(page_url, src)))
            except Exception:
                continue
    for prop, score in (("og:image", 20), ("twitter:image", 15)):
        m = re.search(rf'<meta[^>]+property="{prop}"[^>]+content="([^"]+)"', page_html, re.I) or re.search(
            rf'<meta[^>]+content="([^"]+)"[^>]+property="{prop}"', page_html, re.I
        )
        if m and "logo" in m.group(1).lower():
            urls.append((score + 25, urljoin(page_url, unescape(m.group(1)))))
    m = re.search(r'<link[^>]+rel="(?:icon|apple-touch-icon)"[^>]+href="([^"]+)"', page_html, re.I)
    if m and not urls:
        urls.append((15, urljoin(page_url, unescape(m.group(1)))))
    urls.sort(key=lambda x: -x[0])
    seen = set()
    out = []
    for _, u in urls:
        if u in seen:
            continue
        seen.add(u)
        out.append(u)
    return out[:6]


def maybe_transparent(path: Path) -> None:
    if Image is None or path.suffix.lower() not in {".png", ".webp"}:
        return
    try:
        with Image.open(path) as im:
            rgba = im.convert("RGBA")
            a = rgba.getchannel("A")
            if a.getextrema()[0] == 0:
                return
            w, h = rgba.size
            corners = [rgba.getpixel((x, y))[:3] for x, y in ((0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1))]
            base = corners[0]
            if any(sum(abs(c[i] - base[i]) for i in range(3)) > 18 for c in corners):
                return
            if min(base) < 210 and max(base) - min(base) > 40:
                return
            pix = rgba.load()
            for y in range(h):
                for x in range(w):
                    r, g, b, alpha = pix[x, y]
                    if sum(abs(v - base[i]) for i, v in enumerate((r, g, b))) < 22:
                        pix[x, y] = (r, g, b, 0)
            rgba.save(path)
    except Exception:
        return


def harvest_logo(site: Path, html: str, data: dict) -> tuple[str, str | None]:
    url = official_url(html, data)
    if not url:
        return "no-official-url", None
    try:
        status, body, ctype, final = fetch(url)
    except Exception as exc:
        return f"page-fetch:{exc.__class__.__name__}", None
    if status >= 400 or not body:
        return f"page-status:{status}", None
    page_html = body.decode("utf-8", "replace")
    for cand in rank_logo_urls(page_html, final):
        try:
            st, blob, img_type, _ = fetch(cand, timeout=16)
        except Exception:
            continue
        if st >= 400 or not blob or len(blob) < 2500 or len(blob) > 1_500_000:
            continue
        ext = { "image/png": ".png", "image/jpeg": ".jpg", "image/webp": ".webp", "image/svg+xml": ".svg", "image/gif": ".gif" }.get(img_type)
        if not ext:
            path_ext = Path(urlparse(cand).path).suffix.lower()
            ext = path_ext if path_ext in {".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif"} else None
        if not ext or ext == ".svg" and len(blob) < 1200:
            continue
        if ext == ".jpeg":
            ext = ".jpg"
        assets = site / "assets"
        assets.mkdir(exist_ok=True)
        dest = assets / f"logo{ext}"
        dest.write_bytes(blob)
        maybe_transparent(dest)
        if logo_is_fake_or_weak(dest):
            dest.unlink(missing_ok=True)
            continue
        return "harvested", dest.name
    return "no-usable-logo", None


def swap_in_logo(html: str, name: str, filename: str) -> str:
    img = f'<img class="brand-logo" src="assets/{filename}" alt="{name}">'
    html = re.sub(r'<span class="wordmark">[\s\S]*?</span>', img, html, count=1)
    if 'class="brand-logo"' in html and "assets/logo" in html:
        html = re.sub(r'<img class="brand-logo" src="assets/logo\.[a-zA-Z0-9]+"', f'<img class="brand-logo" src="assets/{filename}"', html, count=1)
    elif 'class="brand-logo"' not in html:
        html = re.sub(r'(<a class="brand" href="#top">)', r"\1" + img, html, count=1)
    return html


def force_wordmark(html: str, name: str) -> str:
    wm = f'<span class="wordmark">{name}</span>'
    html = re.sub(r'<img class="brand-logo"[^>]*>', wm, html, count=1)
    if "wordmark" not in html:
        html = re.sub(r'(<a class="brand" href="#top">)', r"\1" + wm, html, count=1)
    return html


def copy_haoqi_logo(slug: str, site: Path) -> str | None:
    folder = HAOQI / slug
    if not folder.exists():
        return None
    for name in ("assets/logo-transparent.png", "assets/logo.png", "assets/logo.webp", "assets/logo.svg"):
        src = folder / name
        if src.exists() and src.stat().st_size >= 2500:
            dest_dir = site / "assets"
            dest_dir.mkdir(exist_ok=True)
            dest = dest_dir / src.name
            shutil.copy2(src, dest)
            return src.name
    return None


def repair_site(site: Path, hello: set[str]) -> dict:
    slug = site.name
    html_path = site / "index.html"
    row = {"slug": slug, "skipped": False, "actions": []}
    if not html_path.exists():
        row["error"] = "missing-index"
        return row
    html = html_path.read_text(encoding="utf-8", errors="replace")
    if slug in hello or "haoqi-craft" in html or 'id="word-slot"' in html:
        row["skipped"] = True
        row["reason"] = "hello-haoqi-isolated"
        return row
    data = json_ld(html)
    name = business_name(html, data, slug)
    original = html
    html = inject_css(html)
    html = unwrap_full_h1_mark(html)
    html = replace_generator_copy(html, name, data)
    if html != original:
        row["actions"].append("visual-pass")

    logo = current_logo_path(site, html)
    needs_logo = logo_is_fake_or_weak(logo) or 'class="wordmark"' in html and "brand-logo" not in html
    if needs_logo:
        copied = copy_haoqi_logo(slug, site)
        if copied:
            html = swap_in_logo(html, name, copied)
            row["actions"].append(f"haoqi-logo:{copied}")
        else:
            status, filename = harvest_logo(site, html, data)
            if filename:
                html = swap_in_logo(html, name, filename)
                row["actions"].append(f"harvest:{filename}")
            else:
                html = force_wordmark(html, name)
                row["actions"].append(f"wordmark-fallback:{status}")
    else:
        row["actions"].append("logo-kept")
        if logo:
            maybe_transparent(logo)

    if html != original:
        html_path.write_text(html, encoding="utf-8")
        row["wrote"] = True
    else:
        row["wrote"] = False
    return row


def main() -> int:
    hello = load_hello()
    if not DST.exists():
        print("copying dist…")
        shutil.copytree(SRC, DST, dirs_exist_ok=False)
    sites = sorted(p for p in (DST / "sites").iterdir() if p.is_dir())
    rows = []
    t0 = time.time()
    # logos need network; keep a modest pool
    with ThreadPoolExecutor(max_workers=6) as pool:
        futs = {pool.submit(repair_site, site, hello): site.name for site in sites}
        for i, fut in enumerate(as_completed(futs), 1):
            try:
                row = fut.result()
            except Exception as exc:
                row = {"slug": futs[fut], "error": str(exc)}
            rows.append(row)
            if i % 20 == 0 or i == len(futs):
                print(f"{i}/{len(futs)} {row.get('slug')} {row.get('actions') or row.get('reason') or row.get('error')}")
    report = {
        "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "src": str(SRC),
        "dst": str(DST),
        "sites": len(rows),
        "skippedHello": sum(1 for r in rows if r.get("skipped")),
        "wrote": sum(1 for r in rows if r.get("wrote")),
        "harvested": sum(1 for r in rows if any(str(a).startswith("harvest:") for a in r.get("actions") or [])),
        "wordmarkFallback": sum(1 for r in rows if any(str(a).startswith("wordmark-fallback:") for a in r.get("actions") or [])),
        "elapsedSec": round(time.time() - t0, 1),
        "rows": sorted(rows, key=lambda r: r.get("slug") or ""),
    }
    out = ROOT / "REPAIR-REPORT.json"
    out.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps({k: report[k] for k in report if k != "rows"}, indent=2))
    print("wrote", out)
    return 0


if __name__ == "__main__":
    sys.exit(main())
