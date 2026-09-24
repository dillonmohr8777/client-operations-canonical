from __future__ import annotations

import csv
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PLAN = json.loads((ROOT / "working" / "content-plan.json").read_text(encoding="utf-8"))
SOURCE_BY_ID = {
    "HUB-01": "content/pillar-page-interview-integrated.md",
    "ART-01": "content/supporting-article-01-interview-integrated.md",
    "ART-02": "content/supporting-article-02-interview-integrated.md",
    "STR-01": "content/production-drafts/STR-01-home-builder-marketing-plan.md",
    "VIS-01": "content/production-drafts/VIS-01-seo-local-ai-visibility-home-builders.md",
    "WEB-01": "content/production-drafts/WEB-01-home-builder-website-design.md",
    "AUD-01": "content/production-drafts/AUD-01-custom-home-builder-target-market-segments.md",
    "LEAD-01": "content/production-drafts/LEAD-01-home-builder-lead-generation.md",
    "LOCAL-01": "content/production-drafts/LOCAL-01-local-seo-home-builders.md",
    "NUR-01": "content/production-drafts/NUR-01-home-builder-email-marketing-crm.md",
    "AUTO-01": "content/production-drafts/AUTO-01-home-builder-marketing-automation.md",
    "SOC-01": "content/production-drafts/SOC-01-social-media-marketing-home-builders.md",
    "CNT-01": "content/production-drafts/CNT-01-home-builder-content-marketing.md",
    "GAL-01": "content/production-drafts/GAL-01-best-home-builder-websites.md",
    "TPL-01": "content/production-drafts/TPL-01-home-builder-website-templates.md",
    "SEOCHK-01": "content/production-drafts/SEOCHK-01-home-builder-website-seo-checklist.md",
    "MKTRES-01": "content/production-drafts/MKTRES-01-home-builder-market-research.md",
    "PPC-01": "content/production-drafts/PPC-01-ppc-home-builders.md",
    "CONSULT-01": "content/production-drafts/CONSULT-01-home-builder-marketing-consulting.md",
}


def frontmatter(text: str) -> tuple[dict[str, str], str]:
    match = re.match(r"^---\s*\n(.*?)\n---\s*\n", text, re.S)
    if not match:
        return {}, text
    meta = {}
    for line in match.group(1).splitlines():
        pair = re.match(r"^([A-Za-z0-9_]+):\s*(.*)$", line)
        if pair:
            meta[pair.group(1)] = pair.group(2).strip().strip('"\'')
    return meta, text[match.end():]


def json_ld_blocks(body: str) -> list[dict]:
    blocks = []
    candidates = re.findall(r"```json\s*(.*?)```", body, re.S | re.I)
    candidates += re.findall(r"<script\s+type=[\"']application/ld\+json[\"']>\s*(.*?)\s*</script>", body, re.S | re.I)
    for raw in candidates:
        try:
            parsed = json.loads(raw)
        except json.JSONDecodeError:
            continue
        if isinstance(parsed, dict) and ("@context" in parsed or "@graph" in parsed or "@type" in parsed):
            blocks.append(parsed)
    return blocks


def faq_entities(blocks: list[dict]) -> list[dict]:
    entities = []
    for block in blocks:
        candidates = block.get("@graph", []) if isinstance(block.get("@graph"), list) else [block]
        for candidate in candidates:
            if isinstance(candidate, dict) and candidate.get("@type") == "FAQPage":
                entities.extend(candidate.get("mainEntity", []))
    return entities


def normalize_visible_text(value: str) -> str:
    value = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", value)
    value = re.sub(r"[*_`]", "", value)
    return re.sub(r"\s+", " ", value).strip()


def visible_faq_pairs(body: str) -> list[tuple[str, str]]:
    section = re.search(
        r"^##\s+Frequently asked questions\s*$\n(.*?)(?=^##\s+|\Z)",
        body,
        re.I | re.M | re.S,
    )
    if not section:
        return []
    pairs = []
    for match in re.finditer(
        r"^###\s+(.+?)\s*$\n+(.+?)(?=^###\s+|\Z)",
        section.group(1),
        re.M | re.S,
    ):
        question = normalize_visible_text(match.group(1))
        answer_block = match.group(2).strip()
        answer = re.split(r"\n\s*\n", answer_block, maxsplit=1)[0]
        pairs.append((question, normalize_visible_text(answer)))
    return pairs


def schema_faq_pairs(entities: list[dict]) -> list[tuple[str, str]]:
    pairs = []
    for entity in entities:
        if not isinstance(entity, dict):
            continue
        answer = entity.get("acceptedAnswer", {})
        pairs.append((
            normalize_visible_text(str(entity.get("name", ""))),
            normalize_visible_text(str(answer.get("text", ""))) if isinstance(answer, dict) else "",
        ))
    return pairs


assets = {item["asset_id"]: item for item in PLAN["assets"]}
checks = []
errors = []
warnings = []

if len(assets) != 19:
    errors.append(f"Content plan contains {len(assets)} assets, expected 19")

for asset_id, rel in SOURCE_BY_ID.items():
    path = ROOT / rel
    if not path.exists():
        errors.append(f"{asset_id}: missing {rel}")
        continue
    text = path.read_text(encoding="utf-8")
    meta, body = frontmatter(text)
    words = re.findall(r"\b[\w’'-]+\b", re.sub(r"```.*?```", "", body, flags=re.S))
    h1 = len(re.findall(r"^#\s+", body, re.M))
    h2 = len(re.findall(r"^##\s+", body, re.M))
    title = meta.get("title_tag") or meta.get("seo_title") or ""
    description = meta.get("meta_description", "")
    links = set(re.findall(r"\]\((/[^)#?]+/?)(?:[#?][^)]*)?\)", body))
    planned = [assets[x]["slug"] for x in assets[asset_id]["internal_links"].split(", ") if x in assets]
    planned_found = sum(1 for slug in planned if slug in links)
    blocks = json_ld_blocks(body)
    if asset_id == "HUB-01":
        companion = (ROOT / "content" / "faq-set-and-schema-candidate.md").read_text(encoding="utf-8")
        blocks = json_ld_blocks(companion)
    faqs = faq_entities(blocks)
    visible_faqs = visible_faq_pairs(body)
    item_errors = []
    item_warnings = []
    if len(words) < 1000:
        item_errors.append(f"word count {len(words)} below 1000")
    if h1 != 1:
        item_errors.append(f"H1 count {h1}, expected 1")
    if h2 < 4:
        item_errors.append(f"H2 count {h2}, expected at least 4")
    if not title or len(title) > 60:
        item_errors.append(f"title tag length {len(title)}; required 1-60")
    if not description or not 150 <= len(description) <= 160:
        item_errors.append(f"meta description length {len(description)}; required 150-160")
    if asset_id not in {"HUB-01", "ART-01", "ART-02"}:
        if planned_found < min(3, len(planned)):
            item_errors.append(f"planned internal links found {planned_found}; required at least {min(3, len(planned))}")
        if len(faqs) != 5:
            item_errors.append(f"FAQ schema entities {len(faqs)}, expected 5")
        if "## Frequently Asked Questions" not in body and "## Frequently asked questions" not in body:
            item_errors.append("missing visible FAQ section")
        if "factual-and-public-use-review-required" not in text:
            item_errors.append("missing required review-state marker")
    if asset_id == "HUB-01" and len(faqs) != 8:
        item_errors.append(f"FAQ schema entities {len(faqs)}, expected 8")
    if asset_id not in {"ART-01", "ART-02"}:
        visible_pairs = visible_faqs
        schema_pairs = schema_faq_pairs(faqs)
        if visible_pairs != schema_pairs:
            item_errors.append(
                "visible FAQ and FAQPage schema do not match exactly in question order and answer text"
            )
    if asset_id == "CONSULT-01" and "leadership" not in body.lower():
        item_errors.append("consulting draft does not preserve leadership offer gate")
    if re.search(r"\bwe guarantee (?:rankings|traffic|leads|revenue|ai)", body, re.I):
        item_errors.append("contains a prohibited guarantee")
    source_links = {u for u in re.findall(r"https://[^\s)>\]]+", body) if "bigorange.marketing" not in u}
    if asset_id not in {"HUB-01", "ART-01", "ART-02"} and len(source_links) < 3:
        item_errors.append(f"external authoritative source links {len(source_links)}, expected at least 3")
    checks.append({
        "asset_id": asset_id,
        "file": rel,
        "words": len(words),
        "h1": h1,
        "h2": h2,
        "title_tag_length": len(title),
        "meta_description_length": len(description),
        "planned_internal_links_found": planned_found,
        "faq_schema_entities": len(faqs),
        "visible_faq_entities": len(visible_faqs),
        "external_source_links": len(source_links),
        "errors": item_errors,
        "warnings": item_warnings,
    })
    errors.extend(f"{asset_id}: {e}" for e in item_errors)
    warnings.extend(f"{asset_id}: {w}" for w in item_warnings)

release = ROOT / "release"
for rel in ["CONTENT-SYSTEM-INDEX.md", "publication-manifest.csv", "internal-link-map.csv"]:
    if not (release / rel).exists():
        errors.append(f"release: missing {rel}")
if (release / "wordpress-ready-html").exists() and len(list((release / "wordpress-ready-html").glob("*.html"))) != 19:
    errors.append("release: expected 19 HTML fragments")
if (release / "schema").exists() and len(list((release / "schema").glob("*.json"))) != 19:
    errors.append("release: expected 19 schema files")

link_map = release / "internal-link-map.csv"
manifest_path = release / "publication-manifest.csv"
if link_map.exists() and manifest_path.exists():
    with manifest_path.open(encoding="utf-8-sig", newline="") as stream:
        manifest_rows = {row["asset_id"]: row for row in csv.DictReader(stream)}
    with link_map.open(encoding="utf-8-sig", newline="") as stream:
        for row_number, row in enumerate(csv.DictReader(stream), start=2):
            source_id = row["source_asset_id"]
            slug = row["target_slug"]
            source_rel = SOURCE_BY_ID.get(source_id)
            manifest_row = manifest_rows.get(source_id)
            if not source_rel or not manifest_row:
                errors.append(f"release link row {row_number}: unknown source asset {source_id}")
                continue
            source_text = (ROOT / source_rel).read_text(encoding="utf-8")
            html_text = (release / manifest_row["html_fragment"]).read_text(encoding="utf-8")
            if f"]({slug})" not in source_text:
                errors.append(f"release link row {row_number}: {source_id} source lacks {slug}")
            if f'href="{slug}"' not in html_text:
                errors.append(f"release link row {row_number}: {source_id} HTML lacks {slug}")

result = {
    "checked_at": "2026-08-28",
    "status": "pass" if not errors else "fail",
    "asset_count": len(checks),
    "error_count": len(errors),
    "warning_count": len(warnings),
    "errors": errors,
    "warnings": warnings,
    "assets": checks,
}
qa_dir = release / "qa"
qa_dir.mkdir(parents=True, exist_ok=True)
(qa_dir / "content-system-qa.json").write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
lines = [
    "# Content System QA",
    "",
    f"Status: **{result['status'].upper()}**",
    f"Assets checked: {len(checks)}",
    f"Errors: {len(errors)}",
    f"Warnings: {len(warnings)}",
    "",
    "| Asset | Words | H1 | H2 | Title | Meta | Links | FAQ | Sources | Result |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |",
]
for item in checks:
    lines.append(f"| {item['asset_id']} | {item['words']} | {item['h1']} | {item['h2']} | {item['title_tag_length']} | {item['meta_description_length']} | {item['planned_internal_links_found']} | {item['faq_schema_entities']} | {item['external_source_links']} | {'PASS' if not item['errors'] else 'FAIL'} |")
if errors:
    lines.extend(["", "## Errors", ""] + [f"- {e}" for e in errors])
if warnings:
    lines.extend(["", "## Warnings", ""] + [f"- {w}" for w in warnings])
(qa_dir / "content-system-qa.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
print(json.dumps({k: result[k] for k in ["status", "asset_count", "error_count", "warning_count"]}))
sys.exit(0 if not errors else 1)
