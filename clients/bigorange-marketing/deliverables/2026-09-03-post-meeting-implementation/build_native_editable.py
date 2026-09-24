"""Build fully editable Gutenberg versions of the current BigOrange drafts.

Visible page content is serialized as native core blocks.  The only Custom HTML
blocks retained are code-only scoped CSS and JSON-LD.  This keeps the approved
visual direction while allowing editors to change headings, copy, lists, links,
images, quotes, tables, FAQs, and calls to action without touching HTML.
"""

from __future__ import annotations

import html
import json
import re
from pathlib import Path

from bs4 import BeautifulSoup, Comment, NavigableString, Tag


ROOT = Path(__file__).resolve().parent
CLIENT = ROOT.parents[1]
OUT = ROOT / "native-final"
PREVIEW = OUT / "previews"

SOURCES = {
    "5585-orange-press-native.blocks.html": CLIENT / "deliverables/2026-08-23-bigorange-homepage-trio/orange-press/wordpress-draft.html",
    "5550-website-must-haves-native.blocks.html": CLIENT / "deliverables/2026-08-03-custom-home-builder-authority-hub-pilot/wordpress/branded-articles/supporting-article-01-branded.html",
    "5552-builder-blog-articles-native.blocks.html": CLIENT / "deliverables/2026-08-03-custom-home-builder-authority-hub-pilot/wordpress/branded-articles/supporting-article-02-branded.html",
    "5619-home-builder-marketing-ideas-native.blocks.html": CLIENT / "deliverables/2026-09-02-five-blog-growth-package/wordpress/BLOG-01-home-builder-marketing-ideas.html",
    "5621-home-builder-advertising-native.blocks.html": CLIENT / "deliverables/2026-09-02-five-blog-growth-package/wordpress/BLOG-02-home-builder-advertising.html",
    "5623-home-builder-marketing-automation-native.blocks.html": CLIENT / "deliverables/2026-09-02-five-blog-growth-package/wordpress/BLOG-03-home-builder-marketing-automation-follow-up.html",
    "5625-home-builder-marketing-solutions-native.blocks.html": CLIENT / "deliverables/2026-09-02-five-blog-growth-package/wordpress/BLOG-04-choose-home-builder-marketing-solutions.html",
    "5627-hire-builder-marketing-agency-native.blocks.html": CLIENT / "deliverables/2026-09-02-five-blog-growth-package/wordpress/BLOG-05-when-hire-custom-home-builder-marketing-agency.html",
}

PILLAR_SOURCE = CLIENT / "deliverables/2026-08-03-custom-home-builder-authority-hub-pilot/wordpress/native-editor-page.html"
LOGO = "https://bigorange.marketing/wp-content/smush-webp/2023/09/BOM-logo-white.png.webp"

DROP_CLASSES = {
    "brick-build__masonry",
    "brick-build__inspection",
    "menu-toggle",
    "swim-controls",
    "system-controls",
}

BLOCK_CONTAINERS = {"article", "aside", "div", "footer", "header", "main", "nav", "section"}
ALLOWED_GROUP_TAGS = {"article", "aside", "div", "footer", "header", "main", "section"}


def attrs_for(el: Tag, *, tag_name: str | None = None) -> dict:
    attrs: dict = {}
    classes = [c for c in el.get("class", []) if c]
    if classes:
        attrs["className"] = " ".join(classes)
    if el.get("id"):
        attrs["anchor"] = el["id"]
    if tag_name and tag_name != "div":
        attrs["tagName"] = tag_name
    return attrs


def comment(kind: str, attrs: dict | None = None, closing: bool = False) -> str:
    if closing:
        return f"<!-- /wp:{kind} -->"
    suffix = " " + json.dumps(attrs, separators=(",", ":"), ensure_ascii=False) if attrs else ""
    return f"<!-- wp:{kind}{suffix} -->"


def code_island(markup: str) -> str:
    return f"<!-- wp:html -->\n{markup.strip()}\n<!-- /wp:html -->"


def clean_inline(node: Tag | NavigableString) -> str:
    if isinstance(node, NavigableString):
        return html.escape(str(node), quote=False)
    if not isinstance(node, Tag):
        return ""
    if node.name in {"script", "style", "canvas", "input", "button", "output", "svg"}:
        return ""
    allowed = {"a", "abbr", "b", "br", "cite", "code", "em", "i", "mark", "small", "span", "strong", "sub", "sup", "time"}
    if node.name not in allowed:
        return "".join(clean_inline(c) for c in node.children)
    attrs = []
    if node.name == "a" and node.get("href"):
        attrs.append(("href", node["href"]))
    if node.get("class"):
        attrs.append(("class", " ".join(node.get("class", []))))
    if node.get("id"):
        attrs.append(("id", node["id"]))
    attr_text = "".join(f' {k}="{html.escape(str(v), quote=True)}"' for k, v in attrs)
    if node.name == "br":
        return "<br>"
    inner = "".join(clean_inline(c) for c in node.children)
    return f"<{node.name}{attr_text}>{inner}</{node.name}>"


def inner_inline(el: Tag) -> str:
    return "".join(clean_inline(c) for c in el.children).strip()


def classes(el: Tag) -> list[str]:
    return [str(c) for c in el.get("class", [])]


def class_attr(names: list[str]) -> str:
    return f' class="{html.escape(" ".join(names), quote=True)}"' if names else ""


def anchor_attr(el: Tag) -> str:
    return f' id="{html.escape(str(el["id"]), quote=True)}"' if el.get("id") else ""


def image_block(el: Tag, inherited_classes: list[str] | None = None, caption: str = "") -> str:
    inherited_classes = inherited_classes or []
    src = el.get("src", "")
    if not src:
        return ""
    alt = el.get("alt", "")
    img_classes = classes(el)
    block_classes = list(dict.fromkeys(inherited_classes))
    attrs: dict = {"sizeSlug": "full", "linkDestination": "none"}
    if block_classes:
        attrs["className"] = " ".join(block_classes)
    width = el.get("width")
    height = el.get("height")
    if src.rstrip("/").endswith("bigorange-logo-orange.png"):
        width = width or "1000"
        height = height or "338"
    size_attrs = ""
    if width:
        size_attrs += f' width="{html.escape(str(width), quote=True)}"'
    if height:
        size_attrs += f' height="{html.escape(str(height), quote=True)}"'
    img_cls = f' class="{html.escape(" ".join(img_classes), quote=True)}"' if img_classes else ""
    fig_cls = ["wp-block-image", "size-full", *block_classes]
    cap = f'<figcaption class="wp-element-caption">{caption}</figcaption>' if caption else ""
    markup = (
        f'<figure class="{html.escape(" ".join(fig_cls), quote=True)}">'
        f'<img src="{html.escape(src, quote=True)}" alt="{html.escape(alt, quote=True)}"{size_attrs}{img_cls}/>{cap}</figure>'
    )
    return f"{comment('image', attrs)}\n{markup}\n{comment('image', closing=True)}"


def list_item_block(li: Tag) -> str:
    inner = inner_inline(li)
    nested = "\n".join(block_for(c) for c in li.children if isinstance(c, Tag) and c.name in {"ul", "ol"})
    content = inner + (("\n" + nested) if nested else "")
    return f"{comment('list-item')}\n<li>{content}</li>\n{comment('list-item', closing=True)}"


def group_block(el: Tag) -> str:
    tag_name = el.name if el.name in ALLOWED_GROUP_TAGS else "div"
    attrs = attrs_for(el, tag_name=tag_name)
    attrs["layout"] = {"type": "constrained"}
    wrapper_classes = ["wp-block-group", *classes(el)]
    body = "\n\n".join(x for x in (block_for(c) for c in el.children if isinstance(c, Tag)) if x)
    if not body:
        text = " ".join(el.stripped_strings)
        if not text:
            return ""
        p = BeautifulSoup(f"<p>{html.escape(text)}</p>", "html.parser").p
        body = block_for(p)
    opening = f"<{tag_name}{anchor_attr(el)}{class_attr(wrapper_classes)}>"
    closing = f"</{tag_name}>"
    return f"{comment('group', attrs)}\n{opening}\n{body}\n{closing}\n{comment('group', closing=True)}"


def details_block(el: Tag) -> str:
    summary = el.find("summary", recursive=False)
    summary_text = inner_inline(summary) if summary else "Details"
    attrs = attrs_for(el)
    body = "\n\n".join(
        x for x in (block_for(c) for c in el.children if isinstance(c, Tag) and c.name != "summary") if x
    )
    cls = ["wp-block-details", *classes(el)]
    return (
        f"{comment('details', attrs)}\n<details{anchor_attr(el)}{class_attr(cls)}>"
        f"<summary>{summary_text}</summary>\n{body}\n</details>\n{comment('details', closing=True)}"
    )


def quote_block(el: Tag) -> str:
    attrs = attrs_for(el)
    parts = []
    for child in el.children:
        if isinstance(child, Tag) and child.name == "cite":
            parts.append(f"<cite>{inner_inline(child)}</cite>")
        elif isinstance(child, Tag) and child.name == "p":
            parts.append(f"<p>{inner_inline(child)}</p>")
        elif isinstance(child, NavigableString) and str(child).strip():
            parts.append(f"<p>{html.escape(str(child).strip())}</p>")
    cls = ["wp-block-quote", *classes(el)]
    return f"{comment('quote', attrs)}\n<blockquote{class_attr(cls)}>{''.join(parts)}</blockquote>\n{comment('quote', closing=True)}"


def button_block(el: Tag) -> str:
    href = el.get("href", "#")
    attrs = attrs_for(el)
    cls = ["wp-block-button", *classes(el)]
    markup = (
        f'<div{class_attr(cls)}><a class="wp-block-button__link wp-element-button" '
        f'href="{html.escape(href, quote=True)}">{inner_inline(el)}</a></div>'
    )
    return f"{comment('button', attrs)}\n{markup}\n{comment('button', closing=True)}"


def block_for(el: Tag) -> str:
    if not isinstance(el, Tag):
        return ""
    if el.get("aria-hidden") == "true":
        return ""
    cls = set(classes(el))
    if cls & DROP_CLASSES:
        return ""
    name = el.name.lower()
    if name in {"script", "style", "canvas", "input", "button", "output", "svg", "noscript"}:
        return ""
    if name in {"h1", "h2", "h3", "h4", "h5", "h6"}:
        level = int(name[1])
        attrs = attrs_for(el)
        if level != 2:
            attrs["level"] = level
        html_cls = ["wp-block-heading", *classes(el)]
        markup = f"<{name}{anchor_attr(el)}{class_attr(html_cls)}>{inner_inline(el)}</{name}>"
        return f"{comment('heading', attrs)}\n{markup}\n{comment('heading', closing=True)}"
    if name == "p":
        attrs = attrs_for(el)
        markup = f"<p{anchor_attr(el)}{class_attr(classes(el))}>{inner_inline(el)}</p>"
        return f"{comment('paragraph', attrs)}\n{markup}\n{comment('paragraph', closing=True)}"
    if name in {"ul", "ol"}:
        attrs = attrs_for(el)
        if name == "ol":
            attrs["ordered"] = True
        items = "\n".join(list_item_block(li) for li in el.find_all("li", recursive=False))
        markup = f"<{name}{anchor_attr(el)}{class_attr(['wp-block-list', *classes(el)])}>\n{items}\n</{name}>"
        return f"{comment('list', attrs)}\n{markup}\n{comment('list', closing=True)}"
    if name == "blockquote":
        return quote_block(el)
    if name == "details":
        return details_block(el)
    if name == "hr":
        attrs = attrs_for(el)
        return f"{comment('separator', attrs)}\n<hr class=\"wp-block-separator has-alpha-channel-opacity\"/>\n{comment('separator', closing=True)}"
    if name == "table":
        attrs = attrs_for(el)
        markup = re.sub(r"\s+", " ", str(el)).strip()
        return f"{comment('table', attrs)}\n<figure class=\"wp-block-table\">{markup}</figure>\n{comment('table', closing=True)}"
    if name == "figure":
        img = el.find("img", recursive=False) or el.find("img")
        if img:
            caption_el = el.find("figcaption", recursive=False)
            caption = inner_inline(caption_el) if caption_el else ""
            return image_block(img, classes(el), caption)
    if name in {"img", "picture"}:
        img = el if name == "img" else el.find("img")
        return image_block(img, classes(el)) if img else ""
    if name == "a" and (cls & {"book", "button", "button-primary", "cta", "bom-article-button"}):
        return f"{comment('buttons')}\n<div class=\"wp-block-buttons\">\n{button_block(el)}\n</div>\n{comment('buttons', closing=True)}"
    if name == "a":
        href = html.escape(el.get("href", "#"), quote=True)
        link = f'<a href="{href}">{inner_inline(el)}</a>'
        attrs = attrs_for(el)
        markup = f"<p{anchor_attr(el)}{class_attr(classes(el))}>{link}</p>"
        return f"{comment('paragraph', attrs)}\n{markup}\n{comment('paragraph', closing=True)}"
    if name in {"dl"}:
        rows = []
        for div in el.find_all("div", recursive=False):
            dt = div.find("dt")
            dd = div.find("dd")
            if dt or dd:
                rows.append(f"<li><strong>{inner_inline(dt) if dt else ''}</strong> {inner_inline(dd) if dd else ''}</li>")
        if rows:
            fake = BeautifulSoup("<ul>" + "".join(rows) + "</ul>", "html.parser").ul
            fake["class"] = classes(el)
            if el.get("id"):
                fake["id"] = el["id"]
            return block_for(fake)
    if name in {"dt", "dd", "figcaption", "caption", "summary", "span", "strong", "small", "cite"}:
        text = inner_inline(el)
        if not text:
            return ""
        fake = BeautifulSoup(f"<p>{text}</p>", "html.parser").p
        fake["class"] = classes(el)
        return block_for(fake)
    if name in BLOCK_CONTAINERS:
        return group_block(el)
    children = "\n\n".join(x for x in (block_for(c) for c in el.children if isinstance(c, Tag)) if x)
    if children:
        return children
    text = " ".join(el.stripped_strings)
    if text:
        fake = BeautifulSoup(f"<p>{html.escape(text)}</p>", "html.parser").p
        return block_for(fake)
    return ""


def prune(soup: BeautifulSoup) -> None:
    for c in soup.find_all(string=lambda text: isinstance(text, Comment)):
        c.extract()
    for node in soup.select("button, output, canvas, svg, input, .brick-build__masonry, .brick-build__inspection"):
        node.decompose()
    for node in soup.find_all(attrs={"aria-hidden": "true"}):
        node.decompose()
    for track in soup.select(".signal-track"):
        sets = track.select(":scope > .signal-set")
        for duplicate in sets[1:]:
            duplicate.decompose()


def add_live_theme_overrides(styles: list[str], root_id: str) -> list[str]:
    """Keep converted articles full-width and legible inside the live Beaver template."""
    if not (root_id.startswith("bom-article-") or re.fullmatch(r"blog-0[1-5]", root_id)):
        return styles
    selector = f"#{root_id}"
    overrides = f"""
/* Live BigOrange single-post template integration. */
body:has({selector}) .fl-row-content:has({selector}),
body:has({selector}) .fl-col-group:has({selector}),
body:has({selector}) .fl-col:has({selector}),
body:has({selector}) .fl-col-content:has({selector}),
body:has({selector}) .fl-module:has({selector}),
body:has({selector}) .fl-module-content:has({selector}) {{
  width: 100% !important;
  max-width: none !important;
}}
body:has({selector}) .fl-row-content-wrap:has({selector}),
body:has({selector}) .fl-col-content:has({selector}),
body:has({selector}) .fl-module-content:has({selector}) {{
  margin: 0 !important;
  padding: 0 !important;
}}
body:has({selector}) .fl-col-group:has({selector}) > .fl-col:not(:has({selector})) {{
  display: none !important;
}}
{selector} .bom-article-hero h1,
{selector} .hero h1 {{
  color: #ffffff !important;
}}
""".strip()
    if not styles:
        return [f'<style id="{root_id}-live-theme-overrides">\n{overrides}\n</style>']
    updated = list(styles)
    updated[0] = re.sub(r"</style>\s*$", f"\n{overrides}\n</style>", updated[0], count=1)
    return updated


def native_from_html(path: Path, *, orange_press: bool = False) -> tuple[str, dict]:
    raw = path.read_text(encoding="utf-8")
    raw = re.sub(r"^\s*<!--\s*wp:html\s*-->", "", raw)
    raw = re.sub(r"<!--\s*/wp:html\s*-->\s*$", "", raw).strip()
    soup = BeautifulSoup(raw, "html.parser")
    styles = [str(s) for s in soup.find_all("style")]
    schemas = [str(s) for s in soup.find_all("script", attrs={"type": "application/ld+json"})]
    for s in soup.find_all(["style", "script"]):
        s.decompose()
    prune(soup)
    roots = [n for n in soup.children if isinstance(n, Tag)]
    root_id = next((str(root.get("id")) for root in roots if root.get("id")), "")
    styles = add_live_theme_overrides(styles, root_id)
    blocks = [code_island(s) for s in styles]
    if orange_press:
        blocks.append(code_island("""<style id=\"orange-press-native-overrides\">
#orange-press-wp-20260824 .system-grid,
#orange-press-wp-20260824 .swim-track { transform:none!important; display:grid!important; grid-template-columns:repeat(2,minmax(0,1fr))!important; gap:1px!important; }
#orange-press-wp-20260824 .system-grid article,
#orange-press-wp-20260824 .swim-card { opacity:1!important; visibility:visible!important; transform:none!important; position:relative!important; inset:auto!important; width:auto!important; min-width:0!important; }
#orange-press-wp-20260824 .swim-viewport { overflow:visible!important; }
#orange-press-wp-20260824 .logo-stage .particle-mark img { opacity:1!important; visibility:visible!important; position:relative!important; }
@media (max-width:760px){#orange-press-wp-20260824 .system-grid,#orange-press-wp-20260824 .swim-track{grid-template-columns:1fr!important}}
</style>"""))
    blocks.extend(block_for(root) for root in roots)
    blocks.extend(code_island(s) for s in schemas)
    out = "\n\n".join(b for b in blocks if b.strip()) + "\n"
    stats = {
        "source": str(path),
        "bytes": len(out.encode("utf-8")),
        "custom_html": out.count("<!-- wp:html -->"),
        "groups": out.count("<!-- wp:group"),
        "headings": out.count("<!-- wp:heading"),
        "paragraphs": out.count("<!-- wp:paragraph"),
        "images": out.count("<!-- wp:image"),
        "details": out.count("<!-- wp:details"),
        "buttons": out.count("<!-- wp:button"),
    }
    return out, stats


def build_pillar() -> tuple[str, dict]:
    raw = PILLAR_SOURCE.read_text(encoding="utf-8")
    pattern = re.compile(
        r'<!-- wp:html -->\s*<div class="bom-particle-logo-stage".*?<!-- /wp:html -->',
        re.S,
    )
    replacement = f'''<!-- wp:image {{"sizeSlug":"full","linkDestination":"none","className":"bom-particle-logo-stage"}} -->
<figure class="wp-block-image size-full bom-particle-logo-stage"><img src="{LOGO}" alt="BigOrange Marketing, a content and inbound marketing agency"/></figure>
<!-- /wp:image -->'''
    out, count = pattern.subn(replacement, raw)
    if count != 1:
        raise RuntimeError(f"Expected one particle-logo HTML island in 5546, found {count}")
    # Remove now-unused particle rules but keep the code-only CSS island that owns
    # theme reset, responsive behavior, focus, and reduced-motion treatment.
    out = re.sub(r"(?m)^.*bom-particle-logo-mark canvas.*\n", "", out)
    out = re.sub(r"(?m)^.*is-particle-ready.*\n", "", out)
    out = re.sub(r"(?m)^.*is-locked.*\n", "", out)
    out = re.sub(r"(?m)^.*is-resolved canvas.*\n", "", out)
    out = re.sub(r"(?m)^.*is-resolved img.*\n", "", out)
    stats = {
        "source": str(PILLAR_SOURCE),
        "bytes": len(out.encode("utf-8")),
        "custom_html": out.count("<!-- wp:html -->"),
        "groups": out.count("<!-- wp:group"),
        "headings": out.count("<!-- wp:heading"),
        "paragraphs": out.count("<!-- wp:paragraph"),
        "images": out.count("<!-- wp:image"),
        "details": out.count("<!-- wp:details"),
        "buttons": out.count("<!-- wp:button"),
    }
    return out, stats


def main() -> None:
    OUT.mkdir(exist_ok=True)
    PREVIEW.mkdir(exist_ok=True)
    manifest = {"principle": "visible content native; Custom HTML code-only", "files": {}}
    pillar, stats = build_pillar()
    name = "5546-cinematic-authority-native.blocks.html"
    (OUT / name).write_text(pillar, encoding="utf-8")
    (PREVIEW / name).write_text(preview_document(pillar, name), encoding="utf-8")
    manifest["files"][name] = stats
    for name, source in SOURCES.items():
        if not source.exists():
            raise FileNotFoundError(source)
        text, stats = native_from_html(source, orange_press=name.startswith("5585-"))
        (OUT / name).write_text(text, encoding="utf-8")
        (PREVIEW / name).write_text(preview_document(text, name), encoding="utf-8")
        manifest["files"][name] = stats
    (OUT / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(json.dumps(manifest, indent=2))


def preview_document(blocks: str, title: str) -> str:
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{html.escape(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&family=Raleway:wght@600;700;800;900&display=swap" rel="stylesheet">
<style>html,body{{margin:0;min-width:0}}body{{background:#f6f2ea;color:#111}}.wp-block-group{{box-sizing:border-box}}.wp-block-buttons{{display:flex;flex-wrap:wrap;gap:.75rem}}.wp-block-button__link{{display:inline-block}}figure{{margin:0}}img{{max-width:100%;height:auto}}</style>
</head><body class="page-id-5546"><main>{blocks}</main></body></html>'''


if __name__ == "__main__":
    main()
