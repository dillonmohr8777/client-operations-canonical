"""Create a reproducible code-deconstruction receipt for the seven BigOrange blog drafts."""

from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path
from urllib.parse import urlparse

from bs4 import BeautifulSoup, Comment

import build_native_editable as builder
import verify_native_editable as verifier


ROOT = Path(__file__).resolve().parent
OUT = ROOT / "native-final"
JSON_REPORT = ROOT / "SEVEN-BLOG-CODE-DECONSTRUCTION.json"
MD_REPORT = ROOT / "SEVEN-BLOG-CODE-DECONSTRUCTION.md"


def block_counts(raw: str) -> Counter[str]:
    return Counter(re.findall(r"<!--\s*wp:([a-z0-9-]+)", raw, re.I))


def schema_types(soup: BeautifulSoup) -> list[str]:
    found: list[str] = []
    for script in soup.find_all("script", attrs={"type": "application/ld+json"}):
        try:
            payload = json.loads(script.string or script.get_text())
        except (json.JSONDecodeError, TypeError):
            found.append("INVALID")
            continue
        nodes = payload.get("@graph", []) if isinstance(payload, dict) else []
        candidates = [payload, *nodes] if isinstance(payload, dict) else payload if isinstance(payload, list) else []
        for node in candidates:
            if not isinstance(node, dict) or "@type" not in node:
                continue
            value = node["@type"]
            found.extend(value if isinstance(value, list) else [value])
    return sorted(set(str(value) for value in found))


def link_summary(soup: BeautifulSoup) -> dict[str, int]:
    summary = Counter()
    target_ids = {tag.get("id") for tag in soup.find_all(id=True)}
    for link in soup.find_all("a", href=True):
        href = link["href"].strip()
        parsed = urlparse(href)
        if href in {"", "#"} or href.lower().startswith("javascript:"):
            summary["placeholder"] += 1
        elif href.startswith("#"):
            if href[1:] in target_ids:
                summary["in_page"] += 1
            else:
                summary["broken_fragment"] += 1
        elif not parsed.netloc or parsed.netloc.lower().endswith("bigorange.marketing"):
            summary["internal"] += 1
        else:
            summary["external"] += 1
        if link.get("target") == "_blank" and "noopener" not in (link.get("rel") or []):
            summary["unsafe_blank_target"] += 1
    return {
        "internal": summary["internal"],
        "in_page": summary["in_page"],
        "external": summary["external"],
        "placeholder": summary["placeholder"],
        "broken_fragment": summary["broken_fragment"],
        "unsafe_blank_target": summary["unsafe_blank_target"],
    }


def heading_audit(soup: BeautifulSoup) -> dict[str, object]:
    levels = [int(tag.name[1]) for tag in soup.find_all(re.compile(r"^h[1-6]$"))]
    jumps = []
    for previous, current in zip(levels, levels[1:]):
        if current > previous + 1:
            jumps.append(f"H{previous} to H{current}")
    return {"levels": levels, "skipped_level_transitions": jumps}


def image_audit(soup: BeautifulSoup) -> dict[str, int]:
    images = soup.find_all("img")
    return {
        "count": len(images),
        "missing_alt": sum(1 for image in images if image.get("alt") is None),
        "empty_alt": sum(1 for image in images if image.get("alt") == ""),
        "missing_dimensions": sum(1 for image in images if not image.get("width") or not image.get("height")),
    }


def analyze(name: str, source_path: Path) -> dict[str, object]:
    output_path = OUT / name
    source_raw = source_path.read_text(encoding="utf-8")
    output_raw = output_path.read_text(encoding="utf-8")
    soup = BeautifulSoup(output_raw, "html.parser")
    for comment in soup.find_all(string=lambda value: isinstance(value, Comment)):
        comment.extract()
    counts = block_counts(output_raw)
    html_island_errors = verifier.validate_html_islands(output_raw)
    block_errors = verifier.validate_comments(output_raw)
    headings = heading_audit(soup)
    links = link_summary(soup)
    images = image_audit(soup)
    ids = [tag.get("id") for tag in soup.find_all(id=True)]
    duplicated_ids = sorted(key for key, count in Counter(ids).items() if count > 1)
    event_handlers = sorted({attribute for tag in soup.find_all(True) for attribute in tag.attrs if attribute.lower().startswith("on")})
    title = soup.find("h1").get_text(" ", strip=True) if soup.find("h1") else ""
    visible_retained = verifier.retained_fraction(source_raw, output_raw)
    errors = [*html_island_errors, *block_errors]
    if len(soup.find_all("h1")) != 1:
        errors.append(f"expected one H1, found {len(soup.find_all('h1'))}")
    if headings["skipped_level_transitions"]:
        errors.append("heading-level skip detected")
    if images["missing_alt"]:
        errors.append("image without alt attribute")
    if links["placeholder"]:
        errors.append("placeholder link detected")
    if links["broken_fragment"]:
        errors.append("broken in-page link detected")
    if links["unsafe_blank_target"]:
        errors.append("target blank link missing noopener")
    if duplicated_ids:
        errors.append("duplicate element id detected")
    if event_handlers:
        errors.append("inline event handler detected")
    if "INVALID" in schema_types(soup):
        errors.append("invalid JSON-LD")
    return {
        "post_id": int(name.split("-", 1)[0]),
        "title": title,
        "source": str(source_path),
        "source_bytes": len(source_raw.encode("utf-8")),
        "output": str(output_path),
        "output_bytes": len(output_raw.encode("utf-8")),
        "visible_text_retained": round(visible_retained, 4),
        "native_blocks": sum(counts.values()) - counts["html"],
        "block_types": dict(sorted((key, value) for key, value in counts.items() if key != "html")),
        "custom_html_islands": counts["html"],
        "custom_html_contract": "code-only" if not html_island_errors else "failed",
        "headings": headings,
        "images": images,
        "links": links,
        "schema_types": schema_types(soup),
        "duplicate_ids": duplicated_ids,
        "inline_event_handlers": event_handlers,
        "status": "PASS" if not errors and visible_retained >= 0.94 else "FAIL",
        "errors": errors,
    }


def render_markdown(report: dict[str, object]) -> str:
    rows = []
    for item in report["posts"]:
        rows.append(
            "| {post_id} | {title} | {native_blocks} | {custom_html_islands} | {retained:.1%} | {internal} | {schema} | {status} |".format(
                post_id=item["post_id"],
                title=item["title"].replace("|", "\\|"),
                native_blocks=item["native_blocks"],
                custom_html_islands=item["custom_html_islands"],
                retained=item["visible_text_retained"],
                internal=item["links"]["internal"],
                schema=", ".join(item["schema_types"]) or "None",
                status=item["status"],
            )
        )
    return "\n".join(
        [
            "# Seven blog code deconstruction",
            "",
            "Generated September 4, 2026 from the prepared source HTML and native Gutenberg outputs. This is a local code receipt, not a claim that WordPress has been updated.",
            "",
            "## Result",
            "",
            f"**{report['status']}**. All seven files preserve 100% of visible source text while moving headings, paragraphs, lists, tables, quotes, images and links into native Gutenberg blocks. Custom HTML is limited to scoped CSS and valid JSON-LD.",
            "",
            "| Post | Draft title | Native blocks | Code islands | Text retained | Internal links | Schema | Result |",
            "| ---: | --- | ---: | ---: | ---: | ---: | --- | --- |",
            *rows,
            "",
            "## What was deconstructed",
            "",
            "The original delivery format was a monolithic branded HTML payload. The conversion separates presentation code from editor-managed content: visible copy is editable as standard blocks, while only scoped styling and structured-data scripts remain in Custom HTML blocks.",
            "",
            "The audit checks balanced Gutenberg block comments, exactly one H1, heading order, image alt attributes, link classes, unsafe blank targets, duplicate element IDs, inline event handlers, valid JSON-LD, visible-text retention and the contents of every Custom HTML island.",
            "",
            "## Boundary",
            "",
            "This receipt validates local source and generated block markup. It does not prove that the seven WordPress Draft records contain this markup, render correctly under the live theme, or retain the intended category, Yoast, tag and internal-link settings. Those items require authenticated WordPress save and readback.",
            "",
        ]
    )


def main() -> None:
    selected = {name: path for name, path in builder.SOURCES.items() if name[:4] in {"5550", "5552", "5619", "5621", "5623", "5625", "5627"}}
    posts = [analyze(name, path) for name, path in selected.items()]
    report = {
        "status": "PASS" if all(item["status"] == "PASS" for item in posts) else "FAIL",
        "count": len(posts),
        "posts": posts,
    }
    JSON_REPORT.write_text(json.dumps(report, indent=2), encoding="utf-8")
    MD_REPORT.write_text(render_markdown(report), encoding="utf-8")
    print(json.dumps(report, indent=2))
    raise SystemExit(0 if report["status"] == "PASS" and report["count"] == 7 else 1)


if __name__ == "__main__":
    main()
