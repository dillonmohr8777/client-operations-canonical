"""Convert bespoke BigOrange article HTML into native Gutenberg blocks.

The article's identity lives in a scoped <style> block plus CSS grid and
input-driven accordions, none of which survive naive block conversion. So:

  - <style>/<script>, the article shell, hero and index nav stay verbatim in wp:html
  - prose inside the article body (h1-h4, p, ul/ol, table, blockquote) becomes
    native editable blocks with original classes kept, so scoped CSS still matches
  - anything interactive or grid-driven stays a wp:html island

Paula can edit the words; the design does not move.
"""
from __future__ import annotations
import re, sys, json
from pathlib import Path
from bs4 import BeautifulSoup, NavigableString, Tag

PROSE = {"h1", "h2", "h3", "h4", "h5", "h6", "p", "ul", "ol", "table", "blockquote"}
BLOCKED = {"input", "script", "style", "form", "nav", "iframe", "video", "canvas"}
GRID_HINT = re.compile(r"hero|grid|card|cols?|columns|accordion|toggle|tabs|marquee", re.I)


def classes(el):
    return " ".join(el.get("class") or [])


def is_safe_prose(el):
    if el.name not in PROSE:
        return False
    if el.find(lambda t: isinstance(t, Tag) and t.name in BLOCKED):
        return False
    if GRID_HINT.search(classes(el)):
        return False
    for d in el.find_all(True):
        if GRID_HINT.search(classes(d)):
            return False
    return True


def block_for(el):
    attrs = {}
    cls = classes(el)
    if cls:
        attrs["className"] = cls
    n = el.name
    if n[0] == "h" and len(n) == 2 and n[1].isdigit():
        lvl = int(n[1])
        if lvl != 2:
            attrs["level"] = lvl
        kind = "heading"
    elif n == "p":
        kind = "paragraph"
    elif n in ("ul", "ol"):
        kind = "list"
        if n == "ol":
            attrs["ordered"] = True
    elif n == "table":
        kind = "table"
    else:
        kind = "quote"
    j = (" " + json.dumps(attrs, separators=(",", ":"))) if attrs else ""
    return "<!-- wp:" + kind + j + " -->\n" + str(el) + "\n<!-- /wp:" + kind + " -->"


def html_island(chunk):
    chunk = chunk.strip()
    return "" if not chunk else "<!-- wp:html -->\n" + chunk + "\n<!-- /wp:html -->"


def convert(path):
    raw = path.read_text(encoding="utf-8")
    body = re.sub(r"^\s*<!--\s*wp:html\s*-->", "", raw)
    body = re.sub(r"<!--\s*/wp:html\s*-->\s*$", "", body).strip()
    soup = BeautifulSoup(body, "html.parser")

    root = soup.select_one(".bom-article-body") or soup.find("article") or soup
    stats = {"blocks": 0, "islands": 0, "by_kind": {}}
    blocks = {}

    for child in list(root.children):
        if not isinstance(child, Tag) or not is_safe_prose(child):
            continue
        token = "@@BOMBLOCK" + str(len(blocks)) + "@@"
        blocks[token] = block_for(child)
        stats["blocks"] += 1
        stats["by_kind"][child.name] = stats["by_kind"].get(child.name, 0) + 1
        child.replace_with(NavigableString(token))

    out = []
    for part in re.split(r"(@@BOMBLOCK\d+@@)", str(soup)):
        if part in blocks:
            out.append(blocks[part])
        else:
            isl = html_island(part)
            if isl:
                out.append(isl)
                stats["islands"] += 1
    return "\n\n".join(out) + "\n", stats


def demo():
    """Self-check: prose converts, interactive/grid content does not."""
    import tempfile
    sample = (
        '<!-- wp:html --><style>.x{}</style><article id="a" class="bom-branded-article">'
        '<header class="bom-article-hero"><h1>Title</h1></header>'
        '<div class="bom-article-body">'
        '<p class="lead">Plain prose.</p>'
        '<h2 id="s1">A heading</h2>'
        '<ul><li>one</li><li>two</li></ul>'
        '<div class="bom-accordion"><input type="checkbox"><p>hidden</p></div>'
        '</div></article><!-- /wp:html -->'
    )
    f = Path(tempfile.gettempdir()) / "_bomtest.html"
    f.write_text(sample, encoding="utf-8")
    txt, st = convert(f)
    assert st["blocks"] == 3, st
    assert st["by_kind"] == {"p": 1, "h2": 1, "ul": 1}, st["by_kind"]
    assert "<!-- wp:paragraph" in txt and "<!-- wp:heading" in txt and "<!-- wp:list" in txt
    assert "<style>" in txt and "bom-article-hero" in txt          # design preserved
    assert 'type="checkbox"' in txt                                # accordion untouched
    assert "@@BOMBLOCK" not in txt                                 # no leaked tokens
    f.unlink()
    print("demo: OK - 3 blocks, design shell and accordion preserved")


if __name__ == "__main__":
    if sys.argv[1:2] == ["--demo"]:
        demo(); raise SystemExit
    srcs = [Path(p) for p in sys.argv[1:-1]]
    outdir = Path(sys.argv[-1]); outdir.mkdir(parents=True, exist_ok=True)
    tb = ti = 0
    for s in srcs:
        if not s.exists():
            print("MISSING " + str(s)); continue
        txt, st = convert(s)
        (outdir / (s.stem + ".blocks.html")).write_text(txt, encoding="utf-8")
        tb += st["blocks"]; ti += st["islands"]
        kinds = ", ".join(k + "x" + str(v) for k, v in sorted(st["by_kind"].items()))
        print(f"{s.name:50s} -> {st['blocks']:3d} blocks, {st['islands']:2d} islands  [{kinds}]")
    print(f"\nTOTAL: {tb} editable blocks, {ti} html islands")
