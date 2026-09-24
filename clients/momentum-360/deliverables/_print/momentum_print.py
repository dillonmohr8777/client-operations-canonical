"""Momentum print kit: one design grammar for every Momentum PDF.

The grammar is the radar audit report's (dillon-os PR #419): paper cover band
with the exact logo, a deep field, numbered sections with an ink rule, a
finding rail, panel callouts and a full-bleed closing page.

- Tokens are read from the Momentum design system at render time, never copied:
  MOMENTUM_TOKENS_CSS, else ~/Documents/Codex/momentum-design-system/tokens.css.
- Archivo Black and Nunito Sans (latin subsets, SIL OFL) are embedded, so a
  render needs no network.
- need-momentum-logo.png is byte-identical to the approved asset
  (sha256 f210334f30f6e639...). Never redraw it.
- PDFs print with browser headers and footers off, so no timestamp or local
  file path reaches a page.

    python momentum_print.py page.html out.pdf    # re-export any HTML to PDF
"""
from __future__ import annotations

import base64
import os
import pathlib
import re
import sys

HERE = pathlib.Path(__file__).resolve().parent


def tokens_css() -> str:
    p = pathlib.Path(os.environ.get("MOMENTUM_TOKENS_CSS")
                     or pathlib.Path.home() / "Documents" / "Codex" / "momentum-design-system" / "tokens.css")
    try:
        css = p.read_text(encoding="utf-8")
    except OSError:
        raise SystemExit(f"Momentum design tokens not found at {p}; set MOMENTUM_TOKENS_CSS")
    return re.sub(r"/\*.*?\*/", "", css, flags=re.S)  # internal notes stay out of customer files


def data_uri(path: pathlib.Path, mime: str) -> str:
    return f"data:{mime};base64,{base64.b64encode(pathlib.Path(path).read_bytes()).decode()}"


LOGO = data_uri(HERE / "need-momentum-logo.png", "image/png")
FONT_CSS = (
    f'@font-face{{font-family:"Archivo Black";font-weight:400;font-display:block;'
    f'src:url({data_uri(HERE / "fonts" / "archivo-black-latin.woff2", "font/woff2")}) format("woff2")}}'
    f'@font-face{{font-family:"Nunito Sans";font-weight:200 1000;font-display:block;'
    f'src:url({data_uri(HERE / "fonts" / "nunito-sans-latin-var.woff2", "font/woff2")}) format("woff2")}}'
)

BASE_CSS = """
@page { size: Letter; margin: 17mm 18mm 20mm; background: var(--m-paper);
  @bottom-left { content: var(--foot-left, "Momentum Digital"); font-family: var(--m-font-text); font-size: var(--m-fs-xs); font-weight: 700; letter-spacing: .04em; color: var(--m-muted); vertical-align: top; padding-top: 7mm; }
  @bottom-right { content: "Page " counter(page) " of " counter(pages); font-family: var(--m-font-text); font-size: var(--m-fs-xs); font-weight: 700; color: var(--m-muted); vertical-align: top; padding-top: 7mm; } }
@page bleed { margin: 0; @bottom-left { content: none; } @bottom-right { content: none; } }
*, *::before, *::after { box-sizing: border-box; }
html { background: var(--m-paper); color: var(--m-ink); font-family: var(--m-font-text); -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { margin: 0; font-size: var(--m-fs-body); line-height: var(--m-lh-body); }
h1, h2, h3 { font-family: var(--m-font-display); font-weight: var(--m-weight-display); line-height: var(--m-lh-head); letter-spacing: var(--m-track-display); margin: 0; text-wrap: balance; }
p, ul, ol, figure { margin: 0; }
p { orphans: 3; widows: 3; }
a { color: var(--m-brand); overflow-wrap: anywhere; }
code, pre { font-family: var(--m-font-mono); font-size: .9em; }
img { max-width: 100%; }
.brand-logo { display: block; height: auto; width: 17rem; max-width: 100%; }
.eyebrow, .kicker, .mod__aside, .tag, .label { font-size: var(--m-fs-xs); font-weight: 800; letter-spacing: var(--m-track-caps); text-transform: uppercase; }
main { max-width: 62rem; margin: 0 auto; padding-bottom: var(--m-s-8); }
.cover__top { display: flex; justify-content: space-between; align-items: flex-end; gap: var(--m-s-5); padding: var(--m-s-7) var(--m-gutter) var(--m-s-6); }
.cover__stamp { text-align: right; }
.cover__brand { font-weight: 800; color: var(--m-brand); font-size: var(--m-fs-sm); }
.kicker { color: var(--m-muted); margin-top: var(--m-s-1); }
.cover__main { background: var(--m-deep); color: var(--m-on-deep); padding: var(--m-s-8) var(--m-gutter); display: flex; flex-direction: column; gap: var(--m-s-5); }
.cover__main .eyebrow, .deep .eyebrow { color: var(--m-signal); }
.cover h1 { font-size: var(--m-fs-display); line-height: var(--m-lh-display); overflow-wrap: anywhere; max-width: 16ch; }
.cover h1.is-long { font-size: var(--m-fs-h1); line-height: var(--m-lh-head); max-width: 22ch; }
.lede { color: var(--m-on-deep-muted); font-size: var(--m-fs-lead); overflow-wrap: anywhere; max-width: 40rem; }
.cover__foot { margin-top: var(--m-s-7); display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.5fr); gap: var(--m-s-6); align-items: end; }
.cover__art { margin: 0; border-radius: var(--m-r-md); overflow: hidden; box-shadow: var(--m-block-sm) var(--m-block-tint); }
.cover__art img { display: block; width: 100%; height: 100%; object-fit: cover; }
.ids { color: var(--m-on-deep-muted); font-size: var(--m-fs-xs); overflow-wrap: anywhere; padding-top: var(--m-s-4); border-top: 1px solid var(--m-deep-raised); }
.stats { display: flex; flex-wrap: wrap; gap: var(--m-s-6); }
.stats b { display: block; font-family: var(--m-font-display); font-weight: 400; font-size: var(--m-fs-h1); line-height: 1; }
.stats span { color: var(--m-on-deep-muted); }
.toc ol { list-style: none; padding: 0; margin-top: var(--m-s-3); }
.toc li { display: flex; gap: var(--m-s-3); padding: var(--m-s-2) 0; border-top: 1px solid var(--m-deep-raised); font-weight: 700; font-size: var(--m-fs-sm); }
.toc b { color: var(--m-signal); font-weight: 800; min-width: 1.75rem; font-variant-numeric: tabular-nums; }
.mod { padding: var(--m-s-8) var(--m-gutter) 0; }
.mod__head { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: baseline; gap: var(--m-s-4); padding-bottom: var(--m-s-4); margin-bottom: var(--m-s-5); border-bottom: 2px solid var(--m-ink); }
.mod__num { font-family: var(--m-font-display); font-size: var(--m-fs-h3); line-height: 1; color: var(--m-signal-ink); }
.mod__head h2 { font-size: var(--m-fs-h2); }
.mod__aside { color: var(--m-muted); white-space: nowrap; }
.prose { max-width: var(--m-measure); }
.prose p + p, .prose p + ul, .prose ul + p, .prose p + ol, .prose ol + p { margin-top: var(--m-s-4); }
.prose h3 { font-size: var(--m-fs-h3); margin: var(--m-s-7) 0 var(--m-s-3); break-after: avoid; }
.prose ul, .prose ol { padding-left: 1.2rem; }
.prose li + li { margin-top: var(--m-s-2); }
.lead { font-size: var(--m-fs-lead); line-height: 1.5; }
.find { display: grid; grid-template-columns: 8.5rem minmax(0, 1fr); gap: var(--m-s-6); padding: var(--m-s-5) 0; border-top: 1px solid var(--m-line); }
.mod__head + .find { border-top: 0; padding-top: 0; }
.find__meta { color: var(--m-muted); font-size: var(--m-fs-xs); line-height: 1.55; margin-top: var(--m-s-2); }
.claim { font-size: var(--m-fs-lead); font-weight: 800; line-height: 1.35; overflow-wrap: anywhere; }
.tag { display: inline-flex; align-items: center; gap: var(--m-s-2); color: var(--m-ink); }
.dot { width: .625rem; height: .625rem; border-radius: var(--m-r-pill); flex: none; }
.dot--signal { background: var(--m-signal); } .dot--brand { background: var(--m-brand); }
.dot--quiet { background: var(--m-line-strong); } .dot--ring { box-shadow: inset 0 0 0 2px var(--m-line-strong); }
.callout { margin-top: var(--m-s-4); padding: var(--m-s-3) var(--m-s-4); background: var(--m-panel); border-left: 3px solid var(--m-brand); border-radius: 0 var(--m-r-sm) var(--m-r-sm) 0; overflow-wrap: anywhere; }
.callout .label { display: block; color: var(--m-brand); margin-bottom: var(--m-s-1); }
.callout--quiet { border-left-color: var(--m-line-strong); color: var(--m-muted); }
.evidence { margin-top: var(--m-s-3); padding: var(--m-s-3) var(--m-s-4); background: var(--m-panel); border-radius: var(--m-r-sm); font-size: var(--m-fs-xs); line-height: 1.45; white-space: pre-wrap; word-break: break-all; }
.panel { background: var(--m-panel); border-radius: var(--m-r-md); padding: var(--m-s-5) var(--m-s-6); }
.deep { background: var(--m-deep); color: var(--m-on-deep); border-radius: var(--m-r-md); padding: var(--m-s-6); }
.deep .muted { color: var(--m-on-deep-muted); }
.muted { color: var(--m-muted); }
.steps { list-style: none; padding: 0; }
.steps li { display: grid; grid-template-columns: 3rem minmax(0, 1fr); gap: var(--m-s-3); align-items: baseline; padding: var(--m-s-3) 0; border-top: 1px solid var(--m-line); }
.steps li:first-child { border-top: 0; }
.steps__n { font-family: var(--m-font-display); font-size: var(--m-fs-h3); line-height: 1; color: var(--m-signal-ink); }
table.grid { width: 100%; border-collapse: collapse; font-size: var(--m-fs-sm); }
table.grid th { text-align: left; font-size: var(--m-fs-xs); font-weight: 800; letter-spacing: var(--m-track-caps); text-transform: uppercase; color: var(--m-muted); padding: var(--m-s-2) var(--m-s-3) var(--m-s-2) 0; border-bottom: 2px solid var(--m-ink); }
table.grid td { padding: var(--m-s-3) var(--m-s-3) var(--m-s-3) 0; border-bottom: 1px solid var(--m-line); vertical-align: top; overflow-wrap: anywhere; }
table.grid tr { break-inside: avoid; }
.cta { display: inline-block; background: var(--m-signal); color: var(--m-on-signal); font-weight: 800; font-size: var(--m-fs-lead); text-decoration: none; padding: var(--m-s-4) var(--m-s-6); border-radius: var(--m-r-pill); box-shadow: var(--m-block-sm) var(--m-block-tint); }
.closing { padding: 0; margin-top: var(--m-s-9); break-before: page; }
.closing__main { background: var(--m-deep); color: var(--m-on-deep); padding: var(--m-s-8) var(--m-gutter); }
.closing__main h2 { font-size: var(--m-fs-h1); margin-top: var(--m-s-4); max-width: 20ch; }
.closing__main .lead { margin-top: var(--m-s-5); max-width: 38rem; }
.closing__cta { display: flex; flex-wrap: wrap; align-items: center; gap: var(--m-s-6); margin-top: var(--m-s-7); }
.contact { color: var(--m-on-deep-muted); font-size: var(--m-fs-sm); }
.contact a { color: var(--m-brand-lift); font-weight: 700; }
.sign { display: flex; justify-content: space-between; align-items: flex-end; gap: var(--m-s-6); margin: 0 var(--m-gutter); padding: var(--m-s-5) 0 var(--m-s-6); border-top: 2px solid var(--m-ink); }
.sign .brand-logo { width: 12rem; flex: none; }
.sign .note { max-width: 25rem; color: var(--m-muted); font-size: var(--m-fs-xs); text-align: right; }
.keep, .find, .panel, .steps li, .callout, figure { break-inside: avoid; }
@media (max-width: 640px) {
  .cover__top, .sign { flex-direction: column; align-items: flex-start; }
  .cover__stamp, .sign .note { text-align: left; }
  .cover__foot, .find, .split { grid-template-columns: minmax(0, 1fr); }
  .mod__head { grid-template-columns: auto minmax(0, 1fr); }
  .mod__aside { grid-column: 2; white-space: normal; }
}
@media print {
  html { font-size: 14px; }
  main { max-width: none; padding: 0; }
  .cover { page: bleed; min-height: 11in; display: flex; flex-direction: column; }
  .cover__top { padding: 0.6in 0.7in 0.45in; }
  .cover__main { flex: 1; padding: 0.7in; }
  .cover__foot { margin-top: auto; }
  .mod { padding: 0; margin-top: var(--m-s-8); }
  .cover + .mod, .mod.first { margin-top: 0; }
  .closing { page: bleed; min-height: 11in; margin: 0; display: flex; flex-direction: column; }
  .closing__main { padding: 0.9in 0.7in 0.7in; }
  .closing__body { flex: 1; padding: 0.55in 0.7in 0.3in; }
  .sign { margin: 0 0.7in; padding-bottom: 0.6in; }
}
"""


def document(title: str, body: str, css: str = "", foot: str = "Momentum Digital") -> str:
    """A complete, self-contained HTML document on the Momentum grammar."""
    esc = foot.replace("\\", "").replace('"', "").replace("<", "")
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>{title}</title>
<style>{tokens_css()}{FONT_CSS}{BASE_CSS}:root{{--foot-left:"{esc}"}}{css}</style>
</head>
<body>
<main>{body}</main>
</body></html>"""


def to_pdf(src: str | pathlib.Path, pdf: pathlib.Path, *, html: str | None = None, margin: str | None = None) -> pathlib.Path:
    """Print HTML to PDF with browser headers and footers off.

    Pass html= for a generated document, or src= a file path to re-export an
    existing page (relative assets resolve against its folder). margin applies
    only to pages that set no @page margin of their own.
    """
    from playwright.sync_api import sync_playwright
    pdf = pathlib.Path(pdf)
    with sync_playwright() as p:
        b = p.chromium.launch()
        page = b.new_page()
        if html is not None:
            page.set_content(html, wait_until="load")
        else:
            page.goto(pathlib.Path(src).resolve().as_uri(), wait_until="networkidle")
        page.emulate_media(media="print")
        page.evaluate("document.fonts.ready")
        opts = dict(path=str(pdf), print_background=True, prefer_css_page_size=True,
                    display_header_footer=False, format="Letter")
        if margin:
            opts["margin"] = {k: margin for k in ("top", "right", "bottom", "left")}
        page.pdf(**opts)
        b.close()
    return pdf


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(__doc__)
        raise SystemExit(2)
    print(to_pdf(sys.argv[1], pathlib.Path(sys.argv[2]), margin=sys.argv[3] if len(sys.argv) > 3 else None))
