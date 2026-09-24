"""Verify BigOrange native Gutenberg drafts before WordPress installation."""

from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path

from bs4 import BeautifulSoup, Comment

import build_native_editable as builder


ROOT = Path(__file__).resolve().parent
OUT = ROOT / "native-final"
REPORT = OUT / "verification.json"


def visible_words(raw: str) -> list[str]:
    soup = BeautifulSoup(raw, "html.parser")
    for el in soup.find_all(["style", "script", "svg", "canvas", "button", "output"]):
        el.decompose()
    for el in soup.find_all(string=lambda t: isinstance(t, Comment)):
        el.extract()
    return re.findall(r"[a-z0-9]+(?:['’][a-z0-9]+)?", soup.get_text(" ", strip=True).lower())


def retained_fraction(source: str, output: str) -> float:
    src = Counter(visible_words(source))
    dst = Counter(visible_words(output))
    if not src:
        return 1.0
    return sum(min(count, dst[word]) for word, count in src.items()) / sum(src.values())


def validate_comments(raw: str) -> list[str]:
    errors: list[str] = []
    stack: list[str] = []
    for match in re.finditer(r"<!--\s*(/?)wp:([a-z0-9-]+)(?:\s+\{.*?\})?\s*-->", raw):
        closing, kind = match.groups()
        if not closing:
            stack.append(kind)
        elif not stack or stack[-1] != kind:
            errors.append(f"block close mismatch: {kind}; stack={stack[-4:]}")
        else:
            stack.pop()
    if stack:
        errors.append(f"unclosed blocks: {stack[-8:]}")
    return errors


def validate_html_islands(raw: str) -> list[str]:
    errors: list[str] = []
    islands = re.findall(r"<!-- wp:html -->\s*(.*?)\s*<!-- /wp:html -->", raw, re.S)
    for index, island in enumerate(islands, 1):
        soup = BeautifulSoup(island, "html.parser")
        roots = [node for node in soup.children if getattr(node, "name", None)]
        for root in roots:
            if root.name == "style":
                continue
            if root.name == "script" and root.get("type") == "application/ld+json":
                continue
            errors.append(f"HTML island {index} contains visible or unsupported <{root.name}>")
    return errors


def main() -> None:
    expected = ["5546-cinematic-authority-native.blocks.html", *builder.SOURCES.keys()]
    source_by_name = {"5546-cinematic-authority-native.blocks.html": builder.PILLAR_SOURCE, **builder.SOURCES}
    result = {"status": "PASS", "rule": "visible content is native; Custom HTML is code-only", "files": {}}
    for name in expected:
        path = OUT / name
        errors: list[str] = []
        if not path.exists():
            errors.append("missing output")
            raw = ""
        else:
            raw = path.read_text(encoding="utf-8")
        errors.extend(validate_comments(raw))
        errors.extend(validate_html_islands(raw))
        h1_count = len(re.findall(r"<h1(?:\s|>)", raw, re.I))
        if h1_count != 1:
            errors.append(f"expected exactly one H1; found {h1_count}")
        for forbidden in ("<canvas", "<input", "<button", "<iframe"):
            if forbidden in raw.lower():
                errors.append(f"forbidden non-native visible element remains: {forbidden}")
        if "<!-- wp:paragraph" not in raw or "<!-- wp:heading" not in raw:
            errors.append("missing native editable prose blocks")
        source_raw = source_by_name[name].read_text(encoding="utf-8")
        retained = retained_fraction(source_raw, raw)
        if retained < 0.94:
            errors.append(f"visible text retention below floor: {retained:.3f}")
        file_status = "PASS" if not errors else "FAIL"
        if errors:
            result["status"] = "FAIL"
        result["files"][name] = {
            "status": file_status,
            "visible_text_retained": round(retained, 4),
            "custom_html_islands": raw.count("<!-- wp:html -->"),
            "native_blocks": raw.count("<!-- wp:") - raw.count("<!-- wp:html -->"),
            "errors": errors,
        }
    REPORT.write_text(json.dumps(result, indent=2), encoding="utf-8")
    print(json.dumps(result, indent=2))
    raise SystemExit(0 if result["status"] == "PASS" else 1)


if __name__ == "__main__":
    main()
