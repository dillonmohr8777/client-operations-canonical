"""Momentum AI Field Notes: the one ebook PDF renderer.

Merges the two ebook pipelines. launch-delivery/build_package.py (ReportLab,
Georgia and #1e73be) and 2026-09-08-claude-design-ebooks (brand-system v2
palette, 3 MB PDFs) both read the same manuscripts in
2026-09-07-google-aistudio-batch/content/ebooks/. PDFs now come from here, on
the Momentum tokens and print kit; build_package.py calls render() for every
ebook. The Claude Design artboards stay the interactive edition.

Kept from each pipeline: the manuscript text, every [source: ...] citation,
review comments as visible notes, the publication-review gates, cover art per
book (existing Gemini stills, see art/MANIFEST.json; no new generation).

    python ebook.py <manuscript.md> <out.pdf> <book_no>
"""
from __future__ import annotations

import html
import json
import pathlib
import re
import sys

import markdown
import yaml

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from momentum_print import LOGO, data_uri, document, to_pdf  # noqa: E402

E = html.escape
ART = json.loads((HERE / "art" / "MANIFEST.json").read_text(encoding="utf-8"))
CSS = """
@page { margin: 20mm 24mm 22mm; }
@media print { html { font-size: 14.5px; } }
.cover__main { gap: var(--m-s-4); }
.cover h1 { max-width: 13ch; }
.cover__art { height: 3.6in; margin-top: var(--m-s-5); }
.cover__author { font-weight: 800; color: var(--m-on-deep); }
.stamp { display: inline-block; align-self: flex-start; background: var(--m-signal); color: var(--m-on-signal); padding: var(--m-s-1) var(--m-s-4); border-radius: var(--m-r-pill); font-size: var(--m-fs-xs); font-weight: 800; letter-spacing: var(--m-track-caps); text-transform: uppercase; }
.front { break-before: page; }
.front h2, .chap h2 { font-size: var(--m-fs-h1); max-width: 18ch; }
.gates { list-style: none; padding: 0; counter-reset: g; margin-top: var(--m-s-5); }
.gates li { counter-increment: g; display: grid; grid-template-columns: 2.5rem minmax(0, 1fr); gap: var(--m-s-3); padding: var(--m-s-3) 0; border-top: 1px solid var(--m-line); font-size: var(--m-fs-sm); break-inside: avoid; }
.gates li::before { content: counter(g, decimal-leading-zero); font-family: var(--m-font-display); color: var(--m-signal-ink); }
.contents ol { list-style: none; padding: 0; margin-top: var(--m-s-6); }
.contents li { display: grid; grid-template-columns: 3rem minmax(0, 1fr); gap: var(--m-s-3); padding: var(--m-s-3) 0; border-top: 1px solid var(--m-line); font-weight: 700; }
.contents .note { margin-top: var(--m-s-6); padding-top: var(--m-s-4); border-top: 2px solid var(--m-ink); font-size: var(--m-fs-sm); color: var(--m-muted); }
.contents .note p + p { margin-top: var(--m-s-3); }
.contents li b { font-family: var(--m-font-display); font-weight: 400; color: var(--m-signal-ink); }
.chap { break-before: page; }
.chap__head { padding-bottom: var(--m-s-5); margin-bottom: var(--m-s-6); border-bottom: 2px solid var(--m-ink); break-after: avoid; }
.chap__num { font-family: var(--m-font-display); font-size: var(--m-fs-h2); line-height: 1; color: var(--m-signal-ink); margin-bottom: var(--m-s-3); }
.chap__num.word { font-family: var(--m-font-text); font-size: var(--m-fs-xs); font-weight: 800; letter-spacing: var(--m-track-caps); text-transform: uppercase; }
.prose { max-width: none; }
.prose h3 { font-size: var(--m-fs-h3); }
.prose p.short { background: var(--m-panel); border-left: 3px solid var(--m-brand); border-radius: 0 var(--m-r-sm) var(--m-r-sm) 0; padding: var(--m-s-4) var(--m-s-5); font-size: var(--m-fs-lead); line-height: 1.5; break-inside: avoid; }
.prose blockquote { margin: var(--m-s-5) 0; padding: var(--m-s-2) 0 var(--m-s-2) var(--m-s-5); border-left: 3px solid var(--m-signal); font-size: var(--m-fs-lead); }
.prose table.grid { font-size: var(--m-fs-xs); margin: var(--m-s-5) 0; }
.prose table.grid th { font-size: .7rem; }
cite.src { font-style: normal; font-size: var(--m-fs-xs); color: var(--m-muted); white-space: normal; }
cite.src::before { content: "["; } cite.src::after { content: "]"; }
.review { margin: var(--m-s-5) 0; padding: var(--m-s-3) var(--m-s-4); border: 1.5px dashed var(--m-signal-ink); border-radius: var(--m-r-sm); font-size: var(--m-fs-sm); break-inside: avoid; }
.review .label { display: block; color: var(--m-signal-ink); margin-bottom: var(--m-s-1); }
.review pre { margin: 0; white-space: pre-wrap; font-family: var(--m-font-text); font-size: inherit; }
mark.review { display: inline; margin: 0; padding: 0 var(--m-s-1); border-width: 1px; background: none; }
.end { margin-top: var(--m-s-8); padding-top: var(--m-s-5); border-top: 2px solid var(--m-ink); display: flex; justify-content: space-between; align-items: flex-end; gap: var(--m-s-5); break-inside: avoid; }
.end .brand-logo { width: 12rem; }
.end p { color: var(--m-muted); font-size: var(--m-fs-xs); text-align: right; max-width: 22rem; }
"""


def parse(md_path: pathlib.Path):
    raw = md_path.read_text(encoding="utf-8")
    m = re.match(r"^---\n(.*?)\n---\n(.*)$", raw, re.S)
    fm, body = (yaml.safe_load(m.group(1)) or {}, m.group(2)) if m else ({}, raw)
    return fm, body


def body_html(body: str) -> list[tuple[str, str]]:
    body = body.replace(" — ", " - ").replace("—", " - ").replace("–", "-")  # the manuscripts' own dash style
    def rev(mo):
        t = mo.group(1).strip()
        if "\n" in t:
            return f'\n\n<aside class="review"><span class="label">Review note</span><pre>{E(t)}</pre></aside>\n\n'
        return f' <mark class="review">Review note: {E(t)}</mark> '
    body = re.sub(r"<!--(.*?)-->", rev, body, flags=re.S)
    body = re.sub(r"[A-Za-z]:[\\/]Users[\\/][^\\/\s]+[\\/]", "~/", body)  # no local user paths on a page
    h = markdown.markdown(body, extensions=["tables", "sane_lists"])
    h = re.sub(r"<hr\s*/?>", "", h)
    h = re.sub(r"<h1>.*?</h1>", "", h, flags=re.S)  # the cover carries the title
    h = re.sub(r"\[source: (.*?)\]", lambda x: f'<cite class="src">source: {x.group(1)}</cite>', h)
    h = h.replace("<table>", '<table class="grid">')
    h = h.replace("<p><strong>Short answer:</strong>", '<p class="short"><strong>Short answer:</strong>')
    parts = re.split(r"(?=<h2>)", h)
    chapters = []
    for part in parts:
        mh = re.match(r"<h2>(.*?)</h2>(.*)", part, re.S)
        if mh:
            chapters.append((mh.group(1), mh.group(2)))
        elif part.strip():
            chapters.append(("", part))
    return chapters


def render_html(md_path: pathlib.Path, book_no: int) -> str:
    fm, body = parse(md_path)
    title, sub = fm.get("title", md_path.stem), fm.get("subtitle", "")
    series, author = fm.get("series", "Momentum AI Field Notes"), fm.get("author", "")
    publishable = str(fm.get("publishable", "false")).lower() == "true"
    reason = str(fm.get("publishable_reason") or "")
    parts = [g.strip() for g in re.split(r"\s(?=\(\d\)\s)", reason) if g.strip()]
    intro = " ".join(g for g in parts if not re.match(r"\(\d+\)", g))
    gates = [re.sub(r"^\(\d+\)\s*", "", g) for g in parts if re.match(r"\(\d+\)", g)]
    art = ART["covers"][str(book_no)]
    chapters = body_html(body)
    toc = []
    chaps = []
    note = ""
    for heading, content in chapters:
        if not heading:
            note += content  # front matter before the first chapter sits on the contents page
            continue
        mnum = re.match(r"(?:Chapter\s+)?(\d+)[.:]\s+(.*)", heading)
        num, name = (mnum.group(1), mnum.group(2)) if mnum else ("", heading)
        toc.append((f"{int(num):02d}" if num else "", name))
        label = f'<p class="chap__num">{int(num):02d}</p>' if num else '<p class="chap__num word">Field notes</p>'
        chaps.append(f'<section class="chap"><header class="chap__head">{label}<h2>{name}</h2></header><div class="prose">{content}</div></section>')
    status = "Publishable" if publishable else "Review draft · not for publication"
    words = fm.get("word_count", "")
    cover = f"""
<header class="cover">
  <div class="cover__top">
    <img class="brand-logo" src="{LOGO}" alt="Momentum Digital" width="260">
    <div class="cover__stamp"><p class="cover__brand">{E(series)}</p><p class="kicker">Momentum AI &middot; Philadelphia</p></div>
  </div>
  <div class="cover__main">
    <span class="stamp">{E(status)}</span>
    <h1>{E(title)}</h1>
    <p class="lede">{E(sub)}</p>
    <p class="cover__author">{E(author)}</p>
    <figure class="cover__art"><img src="{data_uri(HERE / 'art' / art['file'], 'image/jpeg')}" alt=""></figure>
  </div>
</header>"""
    review = f"""
<section class="front mod first">
  <header class="chap__head"><p class="chap__num word">Before this goes public</p><h2>Publication review</h2></header>
  <p class="prose">Status: <strong>{E(str(fm.get('status', 'draft')))}</strong>. Publishable: <strong>{'yes' if publishable else 'no'}</strong>.{f' {E(str(words))} words.' if words else ''} Every number in this book carries its source in brackets.</p>
  {f'<p class="prose" style="margin-top:var(--m-s-4)">{E(intro)}</p>' if intro else ''}
  <ol class="gates">{"".join(f'<li>{E(g)}</li>' for g in gates)}</ol>
</section>
<section class="front contents">
  <header class="chap__head"><p class="chap__num word">Contents</p><h2>{E(title)}</h2></header>
  <ol>{"".join(f'<li><b>{n}</b><span>{t}</span></li>' for n, t in toc)}</ol>
  {f'<div class="prose note">{note}</div>' if note.strip() and len(re.sub("<[^>]+>", " ", note).split()) < 60 else ''}
</section>"""
    if len(re.sub("<[^>]+>", " ", note).split()) >= 60:
        review += f'''<section class="front"><header class="chap__head"><p class="chap__num word">Reader's note</p></header><div class="prose">{note}</div></section>'''
    end = f"""<div class="end"><img class="brand-logo" src="{LOGO}" alt="Momentum Digital" width="260"><p>{E(series)} &middot; {E(status)} &middot; Momentum Digital, Philadelphia</p></div>"""
    chaps[-1] = chaps[-1].replace("</div></section>", f"</div>{end}</section>") if chaps else end
    return document(E(title), cover + review + "".join(chaps), CSS, foot=f"{series} · {'Momentum AI' if publishable else 'Review draft'}")


def render(md_path: pathlib.Path, pdf_path: pathlib.Path, book_no: int) -> pathlib.Path:
    doc = render_html(pathlib.Path(md_path), book_no)
    return to_pdf(None, pathlib.Path(pdf_path), html=doc)


if __name__ == "__main__":
    if len(sys.argv) != 4:
        print(__doc__)
        raise SystemExit(2)
    print(render(pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2]), int(sys.argv[3])))
