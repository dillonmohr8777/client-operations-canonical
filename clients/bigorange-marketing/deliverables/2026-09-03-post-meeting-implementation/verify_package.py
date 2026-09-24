"""Verify the release-safe BigOrange post-meeting review package.

This package has three content classes:

* current_target: a unique existing or candidate target URL, still approval-gated;
* held_alternate: ART-02, intentionally excluded because post 5552 owns its URL;
* proposed_subpillar: a local Gutenberg proposal with a unique provisional slug.

The verifier checks local structure and archive integrity. It deliberately does not
claim that a WordPress target is live, appropriate, rendered, indexed, or approved.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
import zipfile
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit

from bs4 import BeautifulSoup


ROOT = Path(__file__).resolve().parent
SITE = "https://bigorange.marketing"
CURRENT_DIR = ROOT / "blocks-final"
HELD_DIR = ROOT / "held-alternates"
PROPOSED_DIR = ROOT / "proposed-subpillars"
EXISTING_PRIVATE_DRAFT_FILES = (
    ROOT / "wordpress-blocks" / "5550-must-include-upgraded.blocks.html",
    ROOT / "wordpress-blocks" / "5552-five-articles-upgraded.blocks.html",
)
CANONICAL_5552 = EXISTING_PRIVATE_DRAFT_FILES[1]
EXPECTED_CURRENT_AUTHORITY = 18
EXPECTED_CURRENT_TOTAL = 20
EXPECTED_HELD = 1
EXPECTED_PROPOSED = 3
EXPECTED_NO_FAQ = {
    "ART-01-home-builder-website-not-generating-leads.upgraded.blocks.html"
}
EXPECTED_5552_TARGET = f"{SITE}/custom-home-builder-blog-articles/"
EXPECTED_HELD_NAME = "ART-02-custom-home-builder-blog-articles.upgraded.blocks.html"
EXPECTED_PROPOSED_TARGETS = {
    "/proposed-builder-website-conversion-guide/",
    "/proposed-builder-search-visibility-guide/",
    "/proposed-builder-lead-path-guide/",
}
ARCHIVE_ROOT = "BigOrange-Sept3-Canonical-Review-Package"
ARCHIVE_PATH = ROOT / "BigOrange-Sept3-Canonical-Review-Package.zip"
MANIFEST_PATH = ROOT / "CANONICAL-PACKAGE-MANIFEST.json"
RECEIPT_PATH = ROOT / "ARCHIVE-VERIFICATION-RECEIPT.json"
REVIEW_DOCS = (
    ROOT / "STATUS.md",
    ROOT / "BIGORANGE-LAST-WEEK-RECONCILIATION-2026-09-04.md",
    ROOT / "MEETING-COMMITMENTS-AND-BUILD-PLAN.md",
    ROOT / "EDITOR-FINDING-AND-HOURS-ESTIMATE.md",
    ROOT / "SUB-PILLAR-MAP-PROPOSAL.md",
    ROOT / "AI-CONTENT-RANKING-RESEARCH.md",
    ROOT / "BigOrange-AI-Content-Ranking-Research-2026-09-03.html",
    ROOT / "BigOrange-AI-Content-Ranking-Research-2026-09-03.pdf",
    ROOT / "CLIENT-SITE-DEFECT-LIST.md",
    ROOT / "BigOrange-Site-Defect-List-2026-09-03.html",
    ROOT / "BigOrange-Site-Defect-List-2026-09-03.pdf",
    ROOT / "DRAFT-EMAIL-margee-sept3-followup.md",
    ROOT / "DRAFT-EMAIL-margee-sept3-followup.html",
    ROOT / "DRAFT-EMAIL-bigorange-followup-2026-09-04.html",
    ROOT / "BigOrange-Page-Speed-Follow-Up-2026-09-04.html",
    ROOT / "BigOrange-Page-Speed-Follow-Up-2026-09-04.pdf",
    ROOT / "ATTACHMENT-MANIFEST.md",
    ROOT / "WORDPRESS-DRAFT-AUTHORITY-CROSSWALK.md",
)
PLANNED_ATTACHMENTS = (
    ROOT / "BigOrange-Site-Defect-List-2026-09-03.pdf",
    ROOT / "BigOrange-AI-Content-Ranking-Research-2026-09-03.pdf",
    ROOT / "BigOrange-Page-Speed-Follow-Up-2026-09-04.pdf",
)
KNOWN_WORDPRESS_DRAFTS = (
    {
        "id": 5546,
        "label": "Concept direction: Cinematic Authority",
        "status": "Draft",
        "preview": f"{SITE}/?page_id=5546&preview=true",
        "editor": f"{SITE}/wp-admin/post.php?post=5546&action=edit",
        "exactTitleRequired": False,
    },
    {
        "id": 5585,
        "label": "Concept direction: Orange Press",
        "status": "Draft",
        "preview": f"{SITE}/?page_id=5585&preview=true",
        "editor": f"{SITE}/wp-admin/post.php?post=5585&action=edit",
        "exactTitleRequired": False,
    },
    {
        "id": 5550,
        "label": "Post 5550",
        "status": "Draft",
        "preview": f"{SITE}/?p=5550&preview=true",
        "editor": f"{SITE}/wp-admin/post.php?post=5550&action=edit",
        "exactTitleRequired": False,
    },
    {
        "id": 5552,
        "label": "Post 5552",
        "status": "Draft",
        "preview": f"{SITE}/?p=5552&preview=true",
        "editor": f"{SITE}/wp-admin/post.php?post=5552&action=edit",
        "exactTitleRequired": False,
    },
    {
        "id": 5619,
        "label": "11 Home Builder Marketing Ideas",
        "status": "Draft",
        "preview": f"{SITE}/?p=5619&preview=true",
        "editor": f"{SITE}/wp-admin/post.php?post=5619&action=edit",
        "exactTitleRequired": True,
    },
    {
        "id": 5621,
        "label": "Home Builder Advertising",
        "status": "Draft",
        "preview": f"{SITE}/?p=5621&preview=true",
        "editor": f"{SITE}/wp-admin/post.php?post=5621&action=edit",
        "exactTitleRequired": True,
    },
    {
        "id": 5623,
        "label": "Home Builder Marketing Automation",
        "status": "Draft",
        "preview": f"{SITE}/?p=5623&preview=true",
        "editor": f"{SITE}/wp-admin/post.php?post=5623&action=edit",
        "exactTitleRequired": True,
    },
    {
        "id": 5625,
        "label": "How to Choose Home Builder Marketing Solutions",
        "status": "Draft",
        "preview": f"{SITE}/?p=5625&preview=true",
        "editor": f"{SITE}/wp-admin/post.php?post=5625&action=edit",
        "exactTitleRequired": True,
    },
    {
        "id": 5627,
        "label": "When Should a Custom Home Builder Hire a Marketing Agency",
        "status": "Draft",
        "preview": f"{SITE}/?p=5627&preview=true",
        "editor": f"{SITE}/wp-admin/post.php?post=5627&action=edit",
        "exactTitleRequired": True,
    },
)
DRAFT_ROUTE_DOCUMENTS = (
    ROOT / "STATUS.md",
    ROOT / "EDITOR-FINDING-AND-HOURS-ESTIMATE.md",
    ROOT / "DRAFT-EMAIL-margee-sept3-followup.md",
    ROOT / "DRAFT-EMAIL-margee-sept3-followup.html",
)
NEW_DRAFT_FACT_DOCUMENTS = (
    ROOT / "STATUS.md",
    ROOT / "EDITOR-FINDING-AND-HOURS-ESTIMATE.md",
    ROOT / "MEETING-COMMITMENTS-AND-BUILD-PLAN.md",
    ROOT / "SUB-PILLAR-MAP-PROPOSAL.md",
    ROOT / "DRAFT-EMAIL-margee-sept3-followup.md",
    ROOT / "DRAFT-EMAIL-margee-sept3-followup.html",
)
APPROVAL_CHOICE_DOCUMENTS = (
    ROOT / "WORDPRESS-DRAFT-AUTHORITY-CROSSWALK.md",
    ROOT / "STATUS.md",
    ROOT / "EDITOR-FINDING-AND-HOURS-ESTIMATE.md",
    ROOT / "MEETING-COMMITMENTS-AND-BUILD-PLAN.md",
    ROOT / "SUB-PILLAR-MAP-PROPOSAL.md",
    ROOT / "DRAFT-EMAIL-margee-sept3-followup.md",
    ROOT / "DRAFT-EMAIL-margee-sept3-followup.html",
)
CROSSWALK_DETAIL_DOCUMENTS = (
    ROOT / "WORDPRESS-DRAFT-AUTHORITY-CROSSWALK.md",
    ROOT / "DRAFT-EMAIL-margee-sept3-followup.md",
    ROOT / "DRAFT-EMAIL-margee-sept3-followup.html",
)
SCOPE_CROSSWALK = {
    "relationship": "Partial overlap plus supplementation, not a validated replacement set",
    "pathBDoesNotFulfillContractedNineFileMap": True,
    "contractedAuthorityFiles": [
        "WEB-01", "TPL-01", "GAL-01", "LOCAL-01", "SEOCHK-01",
        "VIS-01", "LEAD-01", "PPC-01", "AUTO-01",
    ],
    "existingArticleDrafts": [5550, 5552, 5619, 5621, 5623, 5625, 5627],
    "confirmedExactOverlaps": [
        {"authorityFile": "AUTO-01", "wordpressDraftId": 5623},
    ],
    "possibleThematicOverlaps": [
        {"authorityFile": "WEB-01", "wordpressDraftId": 5550},
        {"authorityFile": "PPC-01", "wordpressDraftId": 5621},
    ],
    "mappedFilesWithoutClearExistingDraft": [
        "TPL-01", "GAL-01", "LOCAL-01", "SEOCHK-01", "VIS-01", "LEAD-01",
    ],
    "existingDraftsWithoutClearMappedPlacement": [5552, 5619, 5625, 5627],
    "approvalPaths": {
        "pathA": "Contracted nine-file map into approved existing or new private Draft slots",
        "pathB": "Seven existing article Drafts plus three approved subpillars",
    },
    "estimateBoundary": (
        "The 9-to-14-hour estimate applies to Path B only. Path A is not yet "
        "estimable until BigOrange approves the complete existing-versus-new Draft slot map."
    ),
}
DEAD_EXTERNAL_REFERENCES = {
    "https://www.ftc.gov/business-guidance/blog/2023/02/keep-your-ai-claims-check",
    "https://knowledge.hubspot.com/privacy-and-consent/set-up-email-subscription-types",
    "https://www.ftc.gov/business-guidance/resources/final-rule-banning-fake-reviews-testimonials",
}
REPLACEMENT_EXTERNAL_REFERENCES = {
    "https://www.ftc.gov/business-guidance/resources/advertising-faqs-guide-small-business",
    "https://knowledge.hubspot.com/marketing-email/set-up-email-subscription-types",
    "https://www.ftc.gov/business-guidance/resources/consumer-reviews-testimonials-rule-questions-answers",
}
UNSUPPORTED_RELEASE_CLAIMS = {
    "all 21 articles now finished and editable": "old all-files completion claim",
    "there is no ai bonus and no ai penalty": "absolute tool-level ranking claim",
    "google does not detect and demote ai": "unsupported mechanism claim",
    "google has said the same thing consistently since 2022": "unsupported continuity claim",
    "passed delimiter, heading, structured-data, visible faq-parity and internal-link checks":
        "old link-readiness claim",
    "fully native to their workflow": "beaver-builder parity overclaim",
    "controlled experiment": "SE Ranking cohort was not a causal controlled experiment",
    "strongest available, but narrow": "SE Ranking strength is overstated",
    "no primary source, no study, and no credible practitioner supports it":
        "unbounded evidence claim",
    "other five article drafts do not yet exist": "contradicted WordPress draft-existence claim",
    "posts do not yet exist": "contradicted WordPress draft-existence claim",
    "creation and mapping of the other five": "contradicted WordPress draft-existence claim",
    "approve creation of the other five": "contradicted WordPress draft-existence claim",
    "approves their creation": "contradicted WordPress draft-existence claim",
    "after the five additional drafts are created and mapped":
        "contradicted WordPress draft-existence premise",
    "mapping of five additional wordpress draft ids and urls":
        "contradicted WordPress draft-route gate",
    "are the intended implementation batch":
        "unapproved assumption that the seven-Draft batch was already selected",
    "contracted wordpress posts 5550 and 5552":
        "existing private Drafts mislabeled as contracted map items",
    "contracted current target":
        "existing private Draft mislabeled as a contracted map item",
}
SUSPICIOUS_DESCRIPTION_TAILS = {
    "a", "an", "and", "are", "as", "at", "but", "by", "for", "from", "in",
    "is", "of", "on", "or", "that", "the", "to", "which", "with", "without",
}


def rel(path: Path) -> str:
    return str(path.relative_to(ROOT)).replace("\\", "/")


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha256_file(path: Path) -> str:
    return sha256_bytes(path.read_bytes())


def normalize_text(value: str) -> str:
    text = BeautifulSoup(value or "", "html.parser").get_text(" ", strip=True)
    return re.sub(r"\s+", " ", text).strip().casefold()


def normalize_url(value: str) -> str:
    parts = urlsplit(value.strip())
    path = re.sub(r"/+", "/", parts.path or "/")
    if not path.endswith("/"):
        path += "/"
    return urlunsplit((parts.scheme.lower(), parts.netloc.lower(), path, "", ""))


def full_site_url(path: str) -> str:
    return normalize_url(SITE + "/" + path.lstrip("/"))


def walk_json(value):
    yield value
    if isinstance(value, dict):
        for child in value.values():
            yield from walk_json(child)
    elif isinstance(value, list):
        for child in value:
            yield from walk_json(child)


def typed_nodes(value, wanted: str):
    for node in walk_json(value):
        if not isinstance(node, dict):
            continue
        node_type = node.get("@type")
        if node_type == wanted or (isinstance(node_type, list) and wanted in node_type):
            yield node


def parse_payloads(soup: BeautifulSoup, failures: list[str]):
    payloads = []
    for script in soup.find_all("script", attrs={"type": "application/ld+json"}):
        try:
            payloads.append(json.loads(script.get_text()))
        except json.JSONDecodeError as exc:
            failures.append(f"invalid JSON-LD: {exc}")
    return payloads


def article_target(payloads) -> str | None:
    articles = [node for payload in payloads for node in typed_nodes(payload, "Article")]
    if len(articles) != 1:
        return None
    article = articles[0]
    main = article.get("mainEntityOfPage")
    if isinstance(main, dict):
        main = main.get("@id")
    candidate = main or article.get("url") or article.get("@id")
    if not isinstance(candidate, str):
        return None
    candidate = candidate.split("#", 1)[0]
    return normalize_url(candidate)


def base_inspection(path: Path) -> tuple[dict, BeautifulSoup, list]:
    failures: list[str] = []
    raw = path.read_text(encoding="utf-8")
    open_blocks = len(re.findall(r"<!--\s+wp:", raw))
    close_blocks = len(re.findall(r"<!--\s+/wp:", raw))
    if open_blocks != close_blocks:
        failures.append(f"block delimiters differ: {open_blocks} != {close_blocks}")
    if "@@BOMBLOCK" in raw:
        failures.append("conversion token leaked into output")
    soup = BeautifulSoup(raw, "html.parser")
    h1_count = len(soup.find_all("h1"))
    if h1_count != 1:
        failures.append(f"expected one H1, found {h1_count}")
    hrefs = [str(tag.get("href")) for tag in soup.find_all("a", href=True)]
    internal = sorted({href for href in hrefs if href.startswith("/") and not href.startswith("//")})
    malformed = sorted({href for href in hrefs if href.startswith("//") or href.strip() == ""})
    if malformed:
        failures.append("malformed internal-link syntax: " + ", ".join(malformed))
    return ({
        "sourcePath": rel(path),
        "bytes": path.stat().st_size,
        "sha256": sha256_file(path),
        "blocks": open_blocks,
        "h1": h1_count,
        "declaredInternalLinks": len(internal),
        "declaredInternalTargets": internal,
        "failures": failures,
    }, soup, failures)


def inspect_current(path: Path) -> dict:
    row, soup, failures = base_inspection(path)
    payloads = parse_payloads(soup, failures)
    articles = [node for payload in payloads for node in typed_nodes(payload, "Article")]
    faq_pages = [node for payload in payloads for node in typed_nodes(payload, "FAQPage")]
    if len(articles) != 1:
        failures.append(f"expected one Article schema node, found {len(articles)}")
    description = articles[0].get("description") if len(articles) == 1 else None
    if not isinstance(description, str) or not description.strip():
        failures.append("Article description is missing")
        description = ""
    else:
        description = re.sub(r"\s+", " ", description).strip()
        if len(description) > 300:
            failures.append(f"Article description exceeds 300 characters: {len(description)}")
        if not re.search(r"[.!?][\"'”’)]?$", description):
            failures.append("Article description does not end at a sentence boundary")
        if description.endswith((",", ";", ":", "-", "–", "—")):
            failures.append("Article description ends with dangling punctuation")
        tail_words = re.findall(r"[A-Za-z]+", description.casefold())
        if tail_words and tail_words[-1] in SUSPICIOUS_DESCRIPTION_TAILS:
            failures.append(f"Article description ends with suspicious tail word: {tail_words[-1]}")
    target = article_target(payloads)
    if not target:
        failures.append("Article schema does not expose a resolvable target URL")

    require_faq = path.name not in EXPECTED_NO_FAQ
    if require_faq and not faq_pages:
        failures.append("missing required FAQPage schema")
    if not require_faq and faq_pages:
        failures.append("unexpected FAQPage schema")

    visible_soup = BeautifulSoup(str(soup), "html.parser")
    for script in visible_soup.find_all("script"):
        script.extract()
    visible = normalize_text(visible_soup.get_text(" ", strip=True))
    if description and normalize_text(description) not in visible:
        failures.append("Article description is not an exact visible sentence sequence")
    for page in faq_pages:
        for entity in page.get("mainEntity", []):
            question = normalize_text(entity.get("name", ""))
            answer = normalize_text((entity.get("acceptedAnswer") or {}).get("text", ""))
            if question and question not in visible:
                failures.append(f"FAQ question not visible: {question[:80]}")
            if answer and answer not in visible:
                failures.append(f"FAQ answer not visible: {answer[:80]}")
    if row["declaredInternalLinks"] == 0:
        failures.append("no declared root-relative internal links")

    row.update({
        "classification": "current_target",
        "targetUrl": target,
        "jsonLdScripts": len(payloads),
        "articleSchemaNodes": len(articles),
        "articleDescription": description,
        "articleDescriptionChars": len(description),
        "faqPages": len(faq_pages),
        "archivePath": f"{ARCHIVE_ROOT}/wordpress-content/current-targets/{rel(path)}",
    })
    return row


def inspect_held(path: Path) -> dict:
    row, soup, failures = base_inspection(path)
    raw = path.read_text(encoding="utf-8")
    if "BIGORANGE CONTENT STATE: HOLD" not in raw[:600]:
        failures.append("missing explicit HOLD marker")
    payloads = parse_payloads(soup, failures)
    target = article_target(payloads)
    if not target:
        failures.append("held alternate does not expose its conflicting target URL")
    row.update({
        "classification": "held_alternate",
        "targetUrl": None,
        "conflictingTargetUrl": target,
        "jsonLdScripts": len(payloads),
        "faqPages": sum(1 for payload in payloads for _ in typed_nodes(payload, "FAQPage")),
        "archivePath": f"{ARCHIVE_ROOT}/wordpress-content/held-alternates/{path.name}",
    })
    return row


def inspect_proposed(path: Path) -> dict:
    row, soup, failures = base_inspection(path)
    raw = path.read_text(encoding="utf-8")
    if "BIGORANGE CONTENT STATE: PROPOSED" not in raw[:600]:
        failures.append("missing explicit PROPOSED marker")
    article = soup.find(attrs={"data-content-state": "proposed"})
    provisional = article.get("data-provisional-target") if article else None
    if not isinstance(provisional, str) or not provisional.startswith("/"):
        failures.append("missing root-relative provisional target")
        provisional = None
    payload_failures: list[str] = []
    payloads = parse_payloads(soup, payload_failures)
    if payloads:
        failures.append("proposed sub-pillar must not carry JSON-LD before URL approval")
    if row["declaredInternalLinks"] < 4:
        failures.append("proposed sub-pillar must declare three child links and the pillar link")
    row.update({
        "classification": "proposed_subpillar",
        "targetUrl": full_site_url(provisional) if provisional else None,
        "provisionalPath": provisional,
        "jsonLdScripts": len(payloads),
        "archivePath": f"{ARCHIVE_ROOT}/wordpress-content/proposed-subpillars/{path.name}",
    })
    return row


def find_duplicates(rows: list[dict], key: str) -> dict[str, list[str]]:
    targets: dict[str, list[str]] = defaultdict(list)
    for row in rows:
        value = row.get(key)
        if value:
            targets[value].append(row["sourcePath"])
    return {target: paths for target, paths in targets.items() if len(paths) > 1}


def document_rows(package_failures: list[str]) -> list[dict]:
    rows = []
    for path in REVIEW_DOCS:
        if not path.is_file():
            package_failures.append(f"missing review document: {rel(path)}")
            continue
        rows.append({
            "sourcePath": rel(path),
            "archivePath": f"{ARCHIVE_ROOT}/review-docs/{path.name}",
            "bytes": path.stat().st_size,
            "sha256": sha256_file(path),
        })
    return rows


def inspect_language(package_failures: list[str]) -> None:
    if SCOPE_CROSSWALK.get("pathBDoesNotFulfillContractedNineFileMap") is not True:
        package_failures.append("machine-readable Path B contracted-map boundary is not true")

    language_paths = list(REVIEW_DOCS)
    language_paths.extend(path for path in (MANIFEST_PATH, RECEIPT_PATH) if path.is_file())
    for path in language_paths:
        if not path.is_file() or path.suffix.lower() == ".pdf":
            continue
        lowered = path.read_text(encoding="utf-8").casefold()
        for phrase, reason in UNSUPPORTED_RELEASE_CLAIMS.items():
            if phrase in lowered:
                package_failures.append(f"unsupported release claim in {rel(path)}: {reason}")
    required_gates = {
        ROOT / "STATUS.md": "article json-ld candidates are partial",
        ROOT / "DRAFT-EMAIL-margee-sept3-followup.md": "article schema remains partial",
        ROOT / "DRAFT-EMAIL-margee-sept3-followup.html": "article schema remains partial",
    }
    for path, phrase in required_gates.items():
        if path.is_file() and phrase not in path.read_text(encoding="utf-8").casefold():
            package_failures.append(f"partial Article-schema publication gate missing from {rel(path)}")
    attachment_text_paths = (
        ROOT / "DRAFT-EMAIL-bigorange-followup-2026-09-04.html",
        ROOT / "ATTACHMENT-MANIFEST.md",
    )
    for path in attachment_text_paths:
        if not path.is_file():
            continue
        text = path.read_text(encoding="utf-8")
        for attachment in PLANNED_ATTACHMENTS:
            if attachment.name not in text:
                package_failures.append(f"planned attachment filename missing from {rel(path)}: {attachment.name}")

    for path in DRAFT_ROUTE_DOCUMENTS:
        if not path.is_file():
            continue
        raw = path.read_text(encoding="utf-8")
        soup = BeautifulSoup(raw, "html.parser") if path.suffix.lower() == ".html" else None
        visible = soup.get_text(" ", strip=True) if soup else raw
        visible = re.sub(r"\s+", " ", visible)
        route_text = raw
        if soup:
            route_text += "\n" + "\n".join(
                str(link.get("href")) for link in soup.find_all("a", href=True)
            )
        for draft in KNOWN_WORDPRESS_DRAFTS:
            marker = f"ID {draft['id']}. WordPress status: {draft['status']}."
            if marker.casefold() not in visible.casefold():
                package_failures.append(
                    f"WordPress Draft ID/status marker missing from {rel(path)}: {draft['id']}"
                )
            for route_kind in ("preview", "editor"):
                route = str(draft[route_kind])
                if route not in route_text:
                    package_failures.append(
                        f"WordPress Draft {route_kind} route missing or changed in {rel(path)}: "
                        f"{draft['id']}"
                    )

    for path in NEW_DRAFT_FACT_DOCUMENTS:
        if not path.is_file():
            continue
        normalized = re.sub(r"\s+", " ", path.read_text(encoding="utf-8"))
        for draft in KNOWN_WORDPRESS_DRAFTS:
            if not draft["exactTitleRequired"]:
                continue
            if str(draft["id"]) not in normalized or str(draft["label"]) not in normalized:
                package_failures.append(
                    f"confirmed WordPress Draft ID/title missing from {rel(path)}: {draft['id']}"
                )

    choice_markers = (
        "partial overlap plus supplementation, not a validated replacement set",
        "path a: contracted nine-file map",
        "path b: seven-existing-draft batch",
    )
    for path in APPROVAL_CHOICE_DOCUMENTS:
        if not path.is_file():
            continue
        raw = path.read_text(encoding="utf-8")
        soup = BeautifulSoup(raw, "html.parser") if path.suffix.lower() == ".html" else None
        text = soup.get_text(" ", strip=True) if soup else raw
        normalized = re.sub(r"\s+", " ", text).casefold()
        for marker in choice_markers:
            if marker not in normalized:
                package_failures.append(f"scope crosswalk marker missing from {rel(path)}: {marker}")
        if not (("9 to 14" in normalized or "9-to-14" in normalized)
                and "path b only" in normalized):
            package_failures.append(f"Path B-only estimate boundary missing from {rel(path)}")
        if "path a is not yet estimable" not in normalized:
            package_failures.append(f"Path A unresolved-estimate boundary missing from {rel(path)}")
        if "path b does not fulfill the contracted nine-file map" not in normalized:
            package_failures.append(f"Path B contracted-map consequence missing from {rel(path)}")

    waiver_markers = (
        "for clarity, “that work” in the next sentence refers only to the explicitly bounded 9-to-14-hour path b block above",
        "i am honoring the offer i made on the call to waive that work",
        "path a remains unestimated and is not included in this waiver",
    )
    for path in (
        ROOT / "DRAFT-EMAIL-margee-sept3-followup.md",
        ROOT / "DRAFT-EMAIL-margee-sept3-followup.html",
    ):
        if not path.is_file():
            continue
        raw = path.read_text(encoding="utf-8")
        soup = BeautifulSoup(raw, "html.parser") if path.suffix.lower() == ".html" else None
        text = soup.get_text(" ", strip=True) if soup else raw
        normalized = re.sub(r"\s+", " ", text).casefold()
        for marker in waiver_markers:
            if marker not in normalized:
                package_failures.append(f"Path B-only waiver marker missing from {rel(path)}: {marker}")

    generated_crosswalk_checks = (
        (MANIFEST_PATH, ("targetValidation", "scopeCrosswalk")),
        (RECEIPT_PATH, ("scopeCrosswalk",)),
    )
    for path, keys in generated_crosswalk_checks:
        if not path.is_file():
            continue
        try:
            value = json.loads(path.read_text(encoding="utf-8"))
            for key in keys:
                value = value[key]
        except (json.JSONDecodeError, KeyError, TypeError) as exc:
            package_failures.append(f"generated crosswalk record unreadable in {rel(path)}: {exc}")
            continue
        if value.get("pathBDoesNotFulfillContractedNineFileMap") is not True:
            package_failures.append(
                f"machine-readable Path B contracted-map boundary missing from {rel(path)}"
            )

    for path in CROSSWALK_DETAIL_DOCUMENTS:
        if not path.is_file():
            continue
        normalized = re.sub(r"\s+", " ", path.read_text(encoding="utf-8")).casefold()
        for code in SCOPE_CROSSWALK["contractedAuthorityFiles"]:
            if code.casefold() not in normalized:
                package_failures.append(f"contracted authority code missing from {rel(path)}: {code}")
        for draft_id in SCOPE_CROSSWALK["existingArticleDrafts"]:
            if str(draft_id) not in normalized:
                package_failures.append(f"existing Draft ID missing from crosswalk in {rel(path)}: {draft_id}")


def inspect_references(package_failures: list[str]) -> None:
    html_paths = sorted((ROOT / "upgraded").glob("*.html"))
    html_paths += sorted(CURRENT_DIR.glob("*.html"))
    html_paths += sorted(HELD_DIR.glob("*.html"))
    html_paths += sorted((ROOT / "wordpress-blocks").glob("*.html"))
    combined = "\n".join(path.read_text(encoding="utf-8") for path in html_paths)
    for url in DEAD_EXTERNAL_REFERENCES:
        if url in combined:
            package_failures.append(f"dead external reference remains in derived HTML: {url}")
    for url in REPLACEMENT_EXTERNAL_REFERENCES:
        if url not in combined:
            package_failures.append(f"required first-party replacement is absent: {url}")


def make_manifest(result: dict) -> dict:
    return {
        "schemaVersion": 2,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "sourceValidationStatus": result["sourceValidationStatus"],
        "scopeBoundary": "Local review only. No WordPress write, email delivery, queue mutation, or publication is authorized.",
        "approvalBoundary": "BigOrange must select Path A or Path B before an implementation batch is authorized.",
        "schemaBoundary": "Article JSON-LD is a partial candidate. Author, dates, image, final URL, visible-content parity, plugin ownership, and rendered validation remain publication gates.",
        "counts": result["counts"],
        "targetValidation": result["targetValidation"],
        "archive": {
            "path": ARCHIVE_PATH.name,
            "root": ARCHIVE_ROOT,
            "validationRequiredAfterBuild": True,
            "expectedEntries": len(result["files"]) + len(result["documents"]) + 1,
            "manifestArchivePath": f"{ARCHIVE_ROOT}/review-docs/{MANIFEST_PATH.name}",
        },
        "excludedLocalArtifacts": [
            "wordpress-blocks/[A-Z]*-*.blocks.html (superseded conversions)",
            "upgraded/*.html (derivation intermediates)",
            "evidence/* (raw meeting evidence; never placed in client ZIP)",
            "*.py and __pycache__/* (local build and verification tooling)",
        ],
        "files": [{key: value for key, value in row.items() if key != "failures"}
                  for row in result["files"]],
        "documents": result["documents"],
        "externalReferenceReplacements": sorted(REPLACEMENT_EXTERNAL_REFERENCES),
        "plannedAttachments": [path.name for path in PLANNED_ATTACHMENTS],
    }


def validate_archive(result: dict, archive: Path) -> dict:
    failures: list[str] = []
    if not archive.is_file():
        return {"status": "FAIL", "path": rel(archive), "failures": ["archive is missing"]}

    expected: dict[str, Path] = {}
    for row in result["files"] + result["documents"]:
        expected[row["archivePath"]] = ROOT / row["sourcePath"]
    expected[f"{ARCHIVE_ROOT}/review-docs/{MANIFEST_PATH.name}"] = MANIFEST_PATH

    with zipfile.ZipFile(archive) as zf:
        actual = {name for name in zf.namelist() if not name.endswith("/")}
        expected_names = set(expected)
        missing = sorted(expected_names - actual)
        extra = sorted(actual - expected_names)
        if missing:
            failures.append("missing archive entries: " + ", ".join(missing))
        if extra:
            failures.append("unexpected archive entries: " + ", ".join(extra))
        for name, source in expected.items():
            if name not in actual or not source.is_file():
                continue
            archived_hash = sha256_bytes(zf.read(name))
            source_hash = sha256_file(source)
            if archived_hash != source_hash:
                failures.append(f"archive hash mismatch: {name}")

    return {
        "status": "PASS" if not failures else "FAIL",
        "path": rel(archive),
        "bytes": archive.stat().st_size,
        "sha256": sha256_file(archive),
        "entries": len(expected),
        "failures": failures,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--json", action="store_true", help="emit machine-readable output")
    parser.add_argument("--write-manifest", action="store_true", help="write the source manifest after a source PASS")
    parser.add_argument("--archive", action="store_true", help="validate the rebuilt review ZIP")
    parser.add_argument("--write-receipt", action="store_true", help="write an archive verification receipt after a full PASS")
    args = parser.parse_args()

    package_failures: list[str] = []
    current_authority = sorted(CURRENT_DIR.glob("*.html"))
    held_paths = sorted(HELD_DIR.glob("*.html"))
    proposed_paths = sorted(PROPOSED_DIR.glob("*.html"))

    if len(current_authority) != EXPECTED_CURRENT_AUTHORITY:
        package_failures.append(
            f"expected {EXPECTED_CURRENT_AUTHORITY} current authority files, found {len(current_authority)}"
        )
    missing_existing_private_drafts = [
        rel(path) for path in EXISTING_PRIVATE_DRAFT_FILES if not path.is_file()
    ]
    if missing_existing_private_drafts:
        package_failures.append(
            "missing existing private Draft source files: "
            + ", ".join(missing_existing_private_drafts)
        )
    if len(held_paths) != EXPECTED_HELD or (held_paths and held_paths[0].name != EXPECTED_HELD_NAME):
        package_failures.append("held alternate set is not the exact ART-02 file")
    if len(proposed_paths) != EXPECTED_PROPOSED:
        package_failures.append(f"expected {EXPECTED_PROPOSED} proposed sub-pillars, found {len(proposed_paths)}")

    current = [
        inspect_current(path)
        for path in current_authority
        + [p for p in EXISTING_PRIVATE_DRAFT_FILES if p.is_file()]
    ]
    held = [inspect_held(path) for path in held_paths]
    proposed = [inspect_proposed(path) for path in proposed_paths]
    files = current + held + proposed

    if len(current) != EXPECTED_CURRENT_TOTAL:
        package_failures.append(f"expected {EXPECTED_CURRENT_TOTAL} current targets, found {len(current)}")
    current_duplicates = find_duplicates(current, "targetUrl")
    if current_duplicates:
        package_failures.append("duplicate current target URLs: " + json.dumps(current_duplicates, sort_keys=True))

    canonical_row = next((row for row in current if row["sourcePath"] == rel(CANONICAL_5552)), None)
    if not canonical_row or canonical_row.get("targetUrl") != EXPECTED_5552_TARGET:
        package_failures.append("WordPress post 5552 is not the canonical custom-home-builder-blog-articles target")

    held_conflicts: dict[str, list[str]] = defaultdict(list)
    current_by_target = {row.get("targetUrl"): row["sourcePath"] for row in current if row.get("targetUrl")}
    for row in held:
        conflict = row.get("conflictingTargetUrl")
        if conflict in current_by_target:
            held_conflicts[conflict].extend([current_by_target[conflict], row["sourcePath"]])
        else:
            package_failures.append(f"held alternate does not conflict with a current target: {row['sourcePath']}")
    if set(held_conflicts) != {EXPECTED_5552_TARGET}:
        package_failures.append("expected the sole held conflict to be post 5552's target")

    proposed_paths_found = {row.get("provisionalPath") for row in proposed if row.get("provisionalPath")}
    if proposed_paths_found != EXPECTED_PROPOSED_TARGETS:
        package_failures.append("proposed sub-pillar slugs do not match the explicit provisional set")
    current_targets = set(current_by_target)
    proposed_targets = {row.get("targetUrl") for row in proposed if row.get("targetUrl")}
    if current_targets & proposed_targets:
        package_failures.append("a proposed sub-pillar target collides with a current target")

    failed_files = [row["sourcePath"] for row in files if row["failures"]]
    inspect_references(package_failures)
    inspect_language(package_failures)
    documents = document_rows(package_failures)
    source_status = "PASS" if not package_failures and not failed_files else "FAIL"

    result = {
        "sourceValidationStatus": source_status,
        "counts": {
            "currentTargets": len(current),
            "heldAlternates": len(held),
            "proposedSubpillars": len(proposed),
            "classifiedContentFiles": len(files),
            "currentTargetBlocks": sum(row["blocks"] for row in current),
            "heldBlocks": sum(row["blocks"] for row in held),
            "proposedBlocks": sum(row["blocks"] for row in proposed),
            "currentTargetsWithFaqSchema": sum(1 for row in current if row.get("faqPages")),
            "reviewDocuments": len(documents),
        },
        "targetValidation": {
            "canonical5552": EXPECTED_5552_TARGET,
            "duplicateCurrentTargets": current_duplicates,
            "heldTargetConflicts": dict(held_conflicts),
            "provisionalTargets": sorted(proposed_targets),
            "wordpressDrafts": [dict(draft) for draft in KNOWN_WORDPRESS_DRAFTS],
            "scopeCrosswalk": SCOPE_CROSSWALK,
        },
        "packageFailures": package_failures,
        "failedFiles": failed_files,
        "files": files,
        "documents": documents,
    }

    if args.write_manifest:
        if source_status != "PASS":
            package_failures.append("manifest not written because source validation failed")
        else:
            MANIFEST_PATH.write_text(json.dumps(make_manifest(result), indent=2) + "\n", encoding="utf-8")

    archive_result = {"status": "NOT_RUN"}
    if args.archive:
        if not MANIFEST_PATH.is_file():
            archive_result = {"status": "FAIL", "failures": ["manifest is missing"]}
        else:
            archive_result = validate_archive(result, ARCHIVE_PATH)
    result["archiveValidation"] = archive_result
    result["status"] = "PASS" if source_status == "PASS" and archive_result["status"] in {"PASS", "NOT_RUN"} else "FAIL"

    if args.write_receipt:
        if not args.archive or result["status"] != "PASS":
            package_failures.append("receipt not written because full archive validation did not pass")
            result["status"] = "FAIL"
        else:
            receipt = {
                "schemaVersion": 1,
                "verifiedAt": datetime.now(timezone.utc).isoformat(),
                "status": "PASS",
                "sourceManifest": MANIFEST_PATH.name,
                "archive": archive_result,
                "attachments": [
                    {
                        "filename": path.name,
                        "bytes": path.stat().st_size,
                        "sha256": sha256_file(path),
                    }
                    for path in PLANNED_ATTACHMENTS
                ],
                "recordedWordPressDrafts": [dict(draft) for draft in KNOWN_WORDPRESS_DRAFTS],
                "scopeCrosswalk": SCOPE_CROSSWALK,
                "counts": result["counts"],
                "unresolvedGates": [
                    "Dillon approval before email delivery",
                    "Margee approval of concept 5546, sub-pillar titles, and final URLs",
                    "BigOrange selection of Path A, the contracted nine-file map, or Path B, the seven-existing-Draft batch",
                    "A distinct reader job and URL before ART-02 can leave HOLD",
                    "Page-specific artwork, expertise, offer, threshold, and editorial approvals",
                    "Explicit authorization for a private-draft write batch",
                    "Paula review and publication",
                ],
            }
            RECEIPT_PATH.write_text(json.dumps(receipt, indent=2) + "\n", encoding="utf-8")

    if args.json:
        print(json.dumps(result, indent=2))
    else:
        counts = result["counts"]
        print(
            f"{result['status']}: {counts['currentTargets']} current, "
            f"{counts['heldAlternates']} held, {counts['proposedSubpillars']} proposed, "
            f"{counts['currentTargetBlocks']} current-target blocks; "
            f"archive {archive_result['status']}"
        )
        for failure in package_failures:
            print("PACKAGE: " + failure)
        for row in files:
            for failure in row["failures"]:
                print(f"{row['sourcePath']}: {failure}")
        for failure in archive_result.get("failures", []):
            print("ARCHIVE: " + failure)
    return 0 if result["status"] == "PASS" else 1


if __name__ == "__main__":
    sys.exit(main())
