from html.parser import HTMLParser
from pathlib import Path
import html
import json
import re

class VisibleTextParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.skip = 0
        self.lines = []
        self.current_tag = None
        self.tag_text = []
        self.headings = []
        self.controls = []
        self.title = []

    def handle_starttag(self, tag, attrs):
        tag = tag.lower()
        if tag in {"script", "style", "svg", "noscript"}:
            self.skip += 1
        if not self.skip:
            self.current_tag = tag
            self.tag_text = []

    def handle_endtag(self, tag):
        tag = tag.lower()
        if tag in {"script", "style", "svg", "noscript"} and self.skip:
            self.skip -= 1
            return
        if self.skip:
            return
        text = " ".join("".join(self.tag_text).split())
        if text:
            if tag in {"h1", "h2", "h3"}:
                self.headings.append(text)
            elif tag in {"button", "a", "label"}:
                self.controls.append(text)
            elif tag == "title":
                self.title.append(text)
        if tag in {"p", "div", "li", "h1", "h2", "h3", "h4", "button", "a", "label", "span"} and text:
            self.lines.append(text)
        self.current_tag = None
        self.tag_text = []

    def handle_data(self, data):
        if self.skip:
            return
        clean = " ".join(html.unescape(data).split())
        if clean:
            self.tag_text.append(clean + " ")

root = Path(r"C:/Users/dillo/AppData/Local/hermes/cache/bridge-review")
result = {}
for path in sorted(root.glob("*.html")):
    parser = VisibleTextParser()
    parser.feed(path.read_text(encoding="utf-8", errors="replace"))
    dedup = []
    seen = set()
    for line in parser.lines:
        line = re.sub(r"\s+", " ", line).strip()
        if line and line not in seen:
            seen.add(line)
            dedup.append(line)
    result[path.name] = {
        "title": parser.title,
        "headings": parser.headings,
        "controls": parser.controls,
        "visible_text": dedup,
    }
print(json.dumps(result, indent=2, ensure_ascii=False))
