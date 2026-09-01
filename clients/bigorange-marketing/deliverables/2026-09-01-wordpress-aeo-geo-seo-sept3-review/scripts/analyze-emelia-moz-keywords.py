#!/usr/bin/env python3
"""Build BigOrange ranking + opportunity map from Emelia's Moz export.

Uses only rows present in the source CSV. Current ranks are the
2026-08-14 Moz snapshot. Historical rows are used only to count the
export and to list tracked terms that are absent from that snapshot.
"""

from __future__ import annotations

import csv
import json
import re
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

EVIDENCE_DATE = "2026-08-14"
ORIGINAL_FILENAME = (
    "moz_bom_-_bigorange_marketing_rankings_by_engine_variant_2022-04-01_to_2026-08-14.csv"
)
CLIENT_ID = "bigorange-marketing"
CLUSTERS = (
    "home-builder",
    "msp-it",
    "storybrand",
    "manufacturing",
    "landscaping",
    "local-cincinnati",
    "generic-agency",
    "other",
)
GENERIC_AGENCY_NORMALIZED = {
    "best in social media consulting",
    "campaign marketing",
    "converting website",
    "digital content marketing",
    "digital marketing firm brand",
    "fun marketing ideas",
    "in person event marketing",
    "managed marketing services",
    "marketing agency technology",
    "marketing ideas to drive growth",
    "masterclass marketing",
    "new website cost",
    "reasons to build a new website",
    "seo website design",
    "small business marketing",
    "tech marketing",
    "tech marketing agency",
    "technology marketing agency",
    "wordpress or hubspot website",
}
IT_MARKETING_PHRASES = (
    "it marketing",
    "it industry",
    "it company",
    "it companies",
    "it services",
    "marketing for it",
    "marketing in the it",
    "marketing an it",
    "marketing for an it",
    "marketing in it",
    "content marketing for it",
    "marketing content for it",
    "website for it",
    "it managed",
    "marketing it services",
)
FAMILY_RULES = (
    (
        "home-builder-agency",
        lambda k: (
            any(
                token in k
                for token in (
                    "home builder",
                    "homebuilder",
                    "for builders",
                    "for home builders",
                    "agency for builders",
                    "marketing agency for builders",
                    "advertising for builders",
                    "builder advertising",
                )
            )
        ),
    ),
    (
        "storybrand-website",
        lambda k: ("storybrand" in k or "story brand" in k) and "website" in k,
    ),
    (
        "storybrand-examples",
        lambda k: ("storybrand" in k or "story brand" in k) and "example" in k,
    ),
    ("storybrand-brandscript", lambda k: "brandscript" in k),
    (
        "storybrand-checklist",
        lambda k: ("storybrand" in k or "story brand" in k) and "checklist" in k,
    ),
    (
        "storybrand-certified-guide",
        lambda k: ("storybrand" in k or "story brand" in k)
        and any(token in k for token in ("certified", "guide cost", "worth it", "is storybrand free")),
    ),
    ("storybrand-framework", lambda k: "storybrand" in k and "framework" in k),
    (
        "msp-marketing-agency",
        lambda k: "msp" in k and any(token in k for token in ("agency", "compan")),
    ),
    (
        "msp-marketing-resources",
        lambda k: "msp" in k
        and any(
            token in k
            for token in (
                "resource",
                "kit",
                "tool",
                "idea",
                "advertising",
                "how to guide",
                "what is msp marketing",
            )
        ),
    ),
    (
        "msp-leads",
        lambda k: "lead" in k
        and any(token in k for token in ("msp", "managed service", "managed it", "it services")),
    ),
    ("msp-website", lambda k: "msp" in k and "website" in k),
    (
        "it-marketing",
        lambda k: any(p in k for p in IT_MARKETING_PHRASES) and "msp" not in k,
    ),
    ("inbound-msp", lambda k: "inbound" in k and "msp" in k),
    ("cincinnati-agency", lambda k: "cincinnati" in k),
    ("manufacturing-marketing", lambda k: "manufactur" in k),
    ("landscaping-marketing", lambda k: "landscap" in k),
)

ROOT = Path(__file__).resolve().parents[1]
SOURCE_CSV = Path(
    r"C:\Users\dillo\Documents\Codex\projects\client-operations\clients\bigorange-marketing\deliverables\2026-08-03-custom-home-builder-authority-hub-pilot\evidence\2026-08-17-moz-bom-rankings.csv"
)
OUT_DIR = ROOT / "evidence"
OUT_JSON = OUT_DIR / "emelia-moz-keyword-clusters.json"
OUT_CSV = OUT_DIR / "emelia-moz-page-map.csv"
OUT_MD = OUT_DIR / "emelia-moz-analysis.md"
LIVE_INVENTORY = OUT_DIR / "live-site-inventory.json"


def normalize_text(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", (value or "").lower()).strip()


def parse_int(value: str):
    text = (value or "").strip()
    if not text:
        return None
    try:
        return int(text)
    except ValueError:
        return None


def parse_change(raw: str):
    text = (raw or "").strip()
    if not text:
        return None, "unknown", False
    overflow = text.startswith(">")
    numeric = text.replace(">", "").strip()
    try:
        amount = int(numeric)
    except ValueError:
        return None, "unknown", overflow
    if amount > 0:
        return amount, "rising", overflow
    if amount < 0:
        return amount, "declining", overflow
    return 0, "stable", overflow


def bucket_for_rank(rank):
    if rank is None:
        return "tracked_unranked"
    if 1 <= rank <= 3:
        return "protect_1_3"
    if 4 <= rank <= 10:
        return "improve_4_10"
    if 11 <= rank <= 20:
        return "opportunity_11_20"
    return "outside_top_20"


def is_builder_keyword(normalized: str) -> bool:
    if "storybrand" in normalized:
        return False
    return any(
        token in normalized
        for token in (
            "home builder",
            "homebuilder",
            "for builders",
            "builder advertising",
            "advertising for builders",
            "agency for builders",
            "ad agency for home",
        )
    ) or ("builder" in normalized)


def is_msp_it_keyword(normalized: str, labels: str) -> bool:
    if "msp" in normalized or "managed service" in normalized or "managed it" in normalized:
        return True
    if "msp pillar" in (labels or "").lower():
        return True
    return any(phrase in normalized for phrase in IT_MARKETING_PHRASES)


def classify_keyword(keyword: str, labels: str):
    normalized = normalize_text(keyword)
    flags = {
        "landscaping": "landscap" in normalized,
        "manufacturing": "manufactur" in normalized,
        "home-builder": is_builder_keyword(normalized),
        "local-cincinnati": "cincinnati" in normalized,
        "msp-it": is_msp_it_keyword(normalized, labels),
        "storybrand": "storybrand" in normalized or "story brand" in normalized,
        "generic-agency": normalized in GENERIC_AGENCY_NORMALIZED,
    }
    if flags["landscaping"]:
        primary = "landscaping"
    elif flags["home-builder"]:
        primary = "home-builder"
    elif flags["manufacturing"]:
        primary = "manufacturing"
    elif flags["local-cincinnati"]:
        primary = "local-cincinnati"
    elif flags["msp-it"]:
        primary = "msp-it"
    elif flags["storybrand"]:
        primary = "storybrand"
    elif flags["generic-agency"]:
        primary = "generic-agency"
    else:
        primary = "other"
    secondary = [name for name, on in flags.items() if on and name != primary]
    return primary, secondary, normalized


def keyword_families(normalized: str):
    return [name for name, rule in FAMILY_RULES if rule(normalized)]


def lane_for_cluster(cluster: str) -> str:
    return "builder-pilot" if cluster == "home-builder" else "rest-of-site"


def lane_for_url(url: str) -> str:
    path = (url or "").lower()
    if "builder" in path or "homebuilder" in path or "home-builder" in path:
        return "builder-pilot"
    return "rest-of-site"


def prefer_keyword_row(existing: dict, candidate: dict) -> dict:
    existing_labels = existing.get("labels") or ""
    candidate_labels = candidate.get("Labels") or ""
    if candidate_labels and not existing_labels:
        existing["keyword"] = candidate["Keyword"].strip()
        existing["labels"] = candidate_labels.strip()
    existing["sourceRowCount"] += 1
    alias = candidate["Keyword"].strip()
    if alias != existing["keyword"] and alias not in existing["aliases"]:
        existing["aliases"].append(alias)
    return existing


def row_to_keyword(row: dict) -> dict:
    desktop_rank = parse_int(row.get("Google en-US Rank"))
    mobile_rank = parse_int(row.get("Google Mobile en-US Rank"))
    desktop_change_raw = (row.get("Google en-US Change (vs previous date)") or "").strip()
    mobile_change_raw = (row.get("Google Mobile en-US Change (vs previous date)") or "").strip()
    desktop_change, desktop_direction, desktop_overflow = parse_change(desktop_change_raw)
    mobile_change, mobile_direction, mobile_overflow = parse_change(mobile_change_raw)
    desktop_url = (row.get("Google en-US URL") or "").strip()
    mobile_url = (row.get("Google Mobile en-US URL") or "").strip()
    ranks = [rank for rank in (desktop_rank, mobile_rank) if rank is not None]
    best_rank = min(ranks) if ranks else None
    if best_rank is None:
        best_engine = None
    elif mobile_rank == best_rank and desktop_rank != best_rank:
        best_engine = "google-mobile-en-us"
    elif desktop_rank == best_rank:
        best_engine = "google-en-us"
    else:
        best_engine = "google-mobile-en-us"
    primary, secondary, normalized = classify_keyword(row["Keyword"], row.get("Labels") or "")
    volume_min = parse_int(row.get("Google en-US Search Volume Min"))
    volume_max = parse_int(row.get("Google en-US Search Volume Max"))
    ranking_urls = []
    for url in (desktop_url, mobile_url):
        if url and url not in ranking_urls:
            ranking_urls.append(url)
    return {
        "keyword": row["Keyword"].strip(),
        "keywordNormalized": normalized,
        "aliases": [],
        "labels": (row.get("Labels") or "").strip(),
        "cluster": primary,
        "secondaryClusters": secondary,
        "lane": lane_for_cluster(primary),
        "families": keyword_families(normalized),
        "desktop": {
            "serpDate": (row.get("Google en-US SERP Date") or "").strip(),
            "rank": desktop_rank,
            "changeRaw": desktop_change_raw,
            "change": desktop_change,
            "direction": desktop_direction,
            "overflow": desktop_overflow,
            "url": desktop_url or None,
        },
        "mobile": {
            "serpDate": (row.get("Google Mobile en-US SERP Date") or "").strip(),
            "rank": mobile_rank,
            "changeRaw": mobile_change_raw,
            "change": mobile_change,
            "direction": mobile_direction,
            "overflow": mobile_overflow,
            "url": mobile_url or None,
        },
        "bestRank": best_rank,
        "bestRankEngine": best_engine,
        "bucket": bucket_for_rank(best_rank),
        "volumeMin": volume_min,
        "volumeMax": volume_max,
        "rankingUrls": ranking_urls,
        "engineUrlSplit": bool(desktop_url and mobile_url and desktop_url != mobile_url),
        "sourceRowCount": 1,
    }


def compact_keyword(item: dict) -> dict:
    return {
        "keyword": item["keyword"],
        "aliases": item["aliases"],
        "cluster": item["cluster"],
        "secondaryClusters": item["secondaryClusters"],
        "lane": item["lane"],
        "labels": item["labels"] or None,
        "families": item["families"],
        "bestRank": item["bestRank"],
        "bestRankEngine": item["bestRankEngine"],
        "bucket": item["bucket"],
        "desktopRank": item["desktop"]["rank"],
        "desktopChange": item["desktop"]["changeRaw"] or None,
        "desktopDirection": item["desktop"]["direction"],
        "desktopUrl": item["desktop"]["url"],
        "mobileRank": item["mobile"]["rank"],
        "mobileChange": item["mobile"]["changeRaw"] or None,
        "mobileDirection": item["mobile"]["direction"],
        "mobileUrl": item["mobile"]["url"],
        "volumeMin": item["volumeMin"],
        "volumeMax": item["volumeMax"],
        "rankingUrls": item["rankingUrls"],
        "engineUrlSplit": item["engineUrlSplit"],
    }


def direction_counts(items):
    counts = Counter()
    for item in items:
        for engine in ("desktop", "mobile"):
            counts[item[engine]["direction"]] += 1
    return {
        "rising": sum(1 for item in items if "rising" in (item["desktop"]["direction"], item["mobile"]["direction"])),
        "declining": sum(1 for item in items if "declining" in (item["desktop"]["direction"], item["mobile"]["direction"])),
        "stable": sum(
            1
            for item in items
            if item["desktop"]["direction"] == "stable" or item["mobile"]["direction"] == "stable"
        ),
        "unknown": sum(
            1
            for item in items
            if item["desktop"]["direction"] == "unknown" and item["mobile"]["direction"] == "unknown"
        ),
    }


def md_escape(value) -> str:
    return str(value).replace("|", "\\|")


def md_rank(value) -> str:
    return "unranked" if value is None else str(value)


def md_change(raw: str) -> str:
    return raw if raw else "—"


def load_source_rows(path: Path):
    with path.open(encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def collapse_snapshot(rows):
    snapshot_rows = [row for row in rows if (row.get("Google en-US SERP Date") or "").strip() == EVIDENCE_DATE]
    if not snapshot_rows:
        raise SystemExit(f"No rows found with Google en-US SERP Date {EVIDENCE_DATE}")
    by_key = {}
    order = []
    for row in snapshot_rows:
        key = row["Keyword"].strip().lower()
        if key not in by_key:
            by_key[key] = row_to_keyword(row)
            order.append(key)
        else:
            prefer_keyword_row(by_key[key], row)
    return snapshot_rows, [by_key[key] for key in order]


def historical_only(rows, snapshot_keys):
    latest = {}
    for row in rows:
        key = row["Keyword"].strip().lower()
        if key in snapshot_keys:
            continue
        date = (row.get("Google en-US SERP Date") or "").strip()
        current = latest.get(key)
        if current is None or date > current["lastDesktopSerpDate"]:
            primary, secondary, normalized = classify_keyword(row["Keyword"], row.get("Labels") or "")
            latest[key] = {
                "keyword": row["Keyword"].strip(),
                "cluster": primary,
                "secondaryClusters": secondary,
                "lane": lane_for_cluster(primary),
                "lastDesktopSerpDate": date,
                "lastDesktopRank": parse_int(row.get("Google en-US Rank")),
                "lastDesktopUrl": (row.get("Google en-US URL") or "").strip() or None,
                "volumeMin": parse_int(row.get("Google en-US Search Volume Min")),
                "volumeMax": parse_int(row.get("Google en-US Search Volume Max")),
                "note": "Tracked in the Moz export window but absent from the 2026-08-14 snapshot. Not a current rank.",
            }
    return [latest[key] for key in sorted(latest)]


def build_page_map(keywords):
    pages = {}
    for item in keywords:
        assignments = []
        if item["desktop"]["url"]:
            assignments.append(("google-en-us", item["desktop"]))
        if item["mobile"]["url"]:
            assignments.append(("google-mobile-en-us", item["mobile"]))
        seen_urls = set()
        for engine, payload in assignments:
            url = payload["url"]
            if url not in pages:
                pages[url] = {
                    "url": url,
                    "lane": lane_for_url(url),
                    "owned": [],
                }
            if url in seen_urls:
                # Same URL on both engines: keep one owned row, prefer the better rank.
                existing = next(entry for entry in pages[url]["owned"] if entry["keyword"] == item["keyword"])
                existing["engines"].append(engine)
                if payload["rank"] is not None and (
                    existing["rankOnThisUrl"] is None or payload["rank"] < existing["rankOnThisUrl"]
                ):
                    existing["rankOnThisUrl"] = payload["rank"]
                    existing["changeOnThisUrl"] = payload["changeRaw"] or None
                    existing["directionOnThisUrl"] = payload["direction"]
                continue
            seen_urls.add(url)
            pages[url]["owned"].append(
                {
                    "keyword": item["keyword"],
                    "cluster": item["cluster"],
                    "secondaryClusters": item["secondaryClusters"],
                    "lane": item["lane"],
                    "labels": item["labels"] or None,
                    "bestRank": item["bestRank"],
                    "bucket": item["bucket"],
                    "rankOnThisUrl": payload["rank"],
                    "changeOnThisUrl": payload["changeRaw"] or None,
                    "directionOnThisUrl": payload["direction"],
                    "desktopRank": item["desktop"]["rank"],
                    "desktopChange": item["desktop"]["changeRaw"] or None,
                    "desktopDirection": item["desktop"]["direction"],
                    "desktopUrl": item["desktop"]["url"],
                    "mobileRank": item["mobile"]["rank"],
                    "mobileChange": item["mobile"]["changeRaw"] or None,
                    "mobileDirection": item["mobile"]["direction"],
                    "mobileUrl": item["mobile"]["url"],
                    "volumeMin": item["volumeMin"],
                    "volumeMax": item["volumeMax"],
                    "engineUrlSplit": item["engineUrlSplit"],
                    "engines": [engine],
                }
            )
    page_list = []
    for url, page in pages.items():
        owned = page["owned"]
        ranks = [entry["rankOnThisUrl"] for entry in owned if entry["rankOnThisUrl"] is not None]
        cluster_counts = Counter(entry["cluster"] for entry in owned)
        primary_cluster = cluster_counts.most_common(1)[0][0]
        page_list.append(
            {
                "url": url,
                "lane": page["lane"],
                "primaryCluster": primary_cluster,
                "clusterCounts": dict(sorted(cluster_counts.items())),
                "keywordCount": len(owned),
                "bestRank": min(ranks) if ranks else None,
                "bestRankKeyword": next(
                    (entry["keyword"] for entry in owned if entry["rankOnThisUrl"] == min(ranks)),
                    None,
                )
                if ranks
                else None,
                "volumeMinSum": sum(entry["volumeMin"] or 0 for entry in owned),
                "volumeMaxSum": sum(entry["volumeMax"] or 0 for entry in owned),
                "risingCount": sum(1 for entry in owned if entry["directionOnThisUrl"] == "rising"),
                "decliningCount": sum(1 for entry in owned if entry["directionOnThisUrl"] == "declining"),
                "stableCount": sum(1 for entry in owned if entry["directionOnThisUrl"] == "stable"),
                "unknownChangeCount": sum(1 for entry in owned if entry["directionOnThisUrl"] == "unknown"),
                "protectCount": sum(1 for entry in owned if entry["bucket"] == "protect_1_3"),
                "improveCount": sum(1 for entry in owned if entry["bucket"] == "improve_4_10"),
                "opportunityCount": sum(1 for entry in owned if entry["bucket"] == "opportunity_11_20"),
                "ownedKeywords": sorted(
                    owned,
                    key=lambda entry: (
                        entry["rankOnThisUrl"] is None,
                        entry["rankOnThisUrl"] if entry["rankOnThisUrl"] is not None else 99,
                        entry["keyword"].lower(),
                    ),
                ),
            }
        )
    page_list.sort(key=lambda page: (-page["keywordCount"], page["bestRank"] is None, page["bestRank"] or 99, page["url"]))
    return page_list


def build_cannibalization(keywords):
    families = defaultdict(list)
    for item in keywords:
        for family in item["families"]:
            families[family].append(item)
    reports = []
    for family, items in sorted(families.items()):
        ranked = [item for item in items if item["rankingUrls"]]
        urls = sorted({url for item in ranked for url in item["rankingUrls"]})
        if len(urls) < 2:
            continue
        reports.append(
            {
                "family": family,
                "keywordCount": len(items),
                "rankedKeywordCount": len(ranked),
                "urlCount": len(urls),
                "urls": urls,
                "keywords": [compact_keyword(item) for item in items],
            }
        )
    engine_splits = [compact_keyword(item) for item in keywords if item["engineUrlSplit"]]
    near_dups = defaultdict(list)
    for item in keywords:
        near_dups[item["keywordNormalized"]].append(item["keyword"])
    near_duplicate_groups = [
        {"normalized": key, "keywords": values}
        for key, values in sorted(near_dups.items())
        if len(values) > 1
    ]
    return reports, engine_splits, near_duplicate_groups


def should_own(item: dict) -> bool:
    text = item.get("keywordNormalized") or normalize_text(item.get("keyword") or "")
    if any(token in text for token in ("internship", "internships", "jobs", "career", "careers")):
        return False
    return item["cluster"] in {
        "home-builder",
        "msp-it",
        "storybrand",
        "manufacturing",
        "landscaping",
        "local-cincinnati",
    }


def high_volume_unranked(keywords, minimum_max=51):
    unranked = [item for item in keywords if item["bucket"] == "tracked_unranked"]
    notable = [item for item in unranked if (item["volumeMax"] or 0) >= minimum_max]
    notable.sort(key=lambda item: (-(item["volumeMax"] or 0), -(item["volumeMin"] or 0), item["keyword"].lower()))
    ownable = [item for item in notable if should_own(item)]
    broad = [item for item in notable if not should_own(item)]
    return notable, ownable, broad


def ranking_risks(keywords, cannibalization):
    risks = []
    engine_splits = [item for item in keywords if item.get("engineUrlSplit") and "desktop" in item]

    def add(severity, title, why, items):
        if not items:
            return
        packed = []
        for item in items:
            if "desktop" in item and "cluster" in item:
                packed.append(compact_keyword(item))
            else:
                packed.append(item)
        risks.append(
            {
                "severity": severity,
                "title": title,
                "why": why,
                "keywords": packed,
            }
        )

    protect_declining = [
        item
        for item in keywords
        if item["bucket"] == "protect_1_3"
        and "declining" in (item["desktop"]["direction"], item["mobile"]["direction"])
    ]
    add(
        "high",
        "Position 1-3 terms are already slipping",
        "Best rank is still 1-3 on the 2026-08-14 snapshot, but a Moz change column is declining.",
        protect_declining,
    )

    one_engine_drop = [
        item
        for item in keywords
        if (item["desktop"]["rank"] is None) != (item["mobile"]["rank"] is None)
        and (
            (item["desktop"]["direction"] == "declining" and item["desktop"]["rank"] is None)
            or (item["mobile"]["direction"] == "declining" and item["mobile"]["rank"] is None)
        )
    ]
    add(
        "high",
        "Ranked on one engine and dropped on the other",
        "The snapshot still has a URL on one Google engine, but the other engine is unranked with a declining change.",
        one_engine_drop,
    )

    builder_not_protect = [
        item
        for item in keywords
        if item["lane"] == "builder-pilot" and item["bucket"] in {"improve_4_10", "opportunity_11_20", "tracked_unranked"}
    ]
    add(
        "high",
        "Builder-pilot terms are not all locked in positions 1-3",
        "These tracked builder terms sit outside the protect band or are unranked, so the authority hub still has unfinished ranking work.",
        builder_not_protect,
    )

    high_vol_ownable = [
        item
        for item in keywords
        if item["bucket"] == "tracked_unranked" and should_own(item) and (item["volumeMax"] or 0) >= 101
    ]
    add(
        "high",
        "High-volume vertical terms are tracked but unranked",
        "Moz volume max is 101 or higher, the term matches a BOM vertical, and neither engine has a rank on 2026-08-14.",
        high_vol_ownable,
    )

    improve_declining = [
        item
        for item in keywords
        if item["bucket"] == "improve_4_10"
        and (
            (item["desktop"]["change"] is not None and item["desktop"]["change"] <= -2)
            or (item["mobile"]["change"] is not None and item["mobile"]["change"] <= -2)
        )
    ]
    add(
        "medium",
        "Page-two-adjacent page-one terms are losing ground",
        "Best rank is 4-10, and at least one engine declined by 2 or more positions versus the previous Moz date.",
        improve_declining,
    )

    opportunity_declining = [
        item
        for item in keywords
        if item["bucket"] == "opportunity_11_20"
        and "declining" in (item["desktop"]["direction"], item["mobile"]["direction"])
    ]
    add(
        "medium",
        "Positions 11-20 are fading instead of entering the top 10",
        "These terms are close enough to improve, but a Moz change column is already declining.",
        opportunity_declining,
    )

    if engine_splits:
        add(
            "medium",
            "Desktop and mobile rank different URLs for the same keyword",
            "Same tracked keyword, two owned URLs across engines. That is a live cannibalization signal inside this snapshot.",
            engine_splits,
        )

    if cannibalization:
        add(
            "medium",
            "Keyword families are split across multiple owned URLs",
            "Related terms in one family rank on more than one BigOrange URL.",
            [
                {
                    "family": report["family"],
                    "urlCount": report["urlCount"],
                    "urls": report["urls"],
                    "rankedKeywordCount": report["rankedKeywordCount"],
                    "keywords": [item["keyword"] for item in report["keywords"]],
                }
                for report in cannibalization
            ],
        )

    return risks


def builder_pages_without_moz_keywords(page_urls):
    if not LIVE_INVENTORY.exists():
        return []
    try:
        inventory = json.loads(LIVE_INVENTORY.read_text(encoding="utf-8-sig"))
    except (OSError, json.JSONDecodeError):
        return []
    found = []
    seen = set()

    def consider(url: str):
        if not url or url in seen:
            return
        lowered = url.lower()
        if not any(token in lowered for token in ("builder", "homebuilder", "home-builder")):
            return
        seen.add(url)
        found.append(
            {
                "url": url,
                "inMozSnapshot": url.rstrip("/") in {item.rstrip("/") for item in page_urls}
                or url in page_urls,
            }
        )

    sitemaps = inventory.get("sitemaps") or {}
    for child in sitemaps.get("childSitemaps") or []:
        for url in child.get("urls") or []:
            consider(url)
    for url in inventory.get("builderRelatedUrls") or []:
        consider(url)
    return [item for item in found if not item["inMozSnapshot"]]


def write_page_map_csv(pages):
    fieldnames = [
        "url",
        "url_lane",
        "url_primary_cluster",
        "url_keyword_count",
        "url_best_rank",
        "url_best_rank_keyword",
        "url_volume_min_sum",
        "url_volume_max_sum",
        "url_rising_count",
        "url_declining_count",
        "url_stable_count",
        "url_protect_count",
        "url_improve_count",
        "url_opportunity_count",
        "keyword",
        "keyword_cluster",
        "keyword_secondary_clusters",
        "keyword_lane",
        "labels",
        "best_rank",
        "bucket",
        "rank_on_this_url",
        "change_on_this_url",
        "direction_on_this_url",
        "desktop_rank",
        "desktop_change",
        "desktop_direction",
        "desktop_url",
        "mobile_rank",
        "mobile_change",
        "mobile_direction",
        "mobile_url",
        "volume_min",
        "volume_max",
        "engine_url_split",
        "engines_on_this_url",
        "evidence_date",
    ]
    with OUT_CSV.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        for page in pages:
            for entry in page["ownedKeywords"]:
                writer.writerow(
                    {
                        "url": page["url"],
                        "url_lane": page["lane"],
                        "url_primary_cluster": page["primaryCluster"],
                        "url_keyword_count": page["keywordCount"],
                        "url_best_rank": page["bestRank"],
                        "url_best_rank_keyword": page["bestRankKeyword"],
                        "url_volume_min_sum": page["volumeMinSum"],
                        "url_volume_max_sum": page["volumeMaxSum"],
                        "url_rising_count": page["risingCount"],
                        "url_declining_count": page["decliningCount"],
                        "url_stable_count": page["stableCount"],
                        "url_protect_count": page["protectCount"],
                        "url_improve_count": page["improveCount"],
                        "url_opportunity_count": page["opportunityCount"],
                        "keyword": entry["keyword"],
                        "keyword_cluster": entry["cluster"],
                        "keyword_secondary_clusters": "|".join(entry["secondaryClusters"]),
                        "keyword_lane": entry["lane"],
                        "labels": entry["labels"] or "",
                        "best_rank": entry["bestRank"],
                        "bucket": entry["bucket"],
                        "rank_on_this_url": entry["rankOnThisUrl"],
                        "change_on_this_url": entry["changeOnThisUrl"] or "",
                        "direction_on_this_url": entry["directionOnThisUrl"],
                        "desktop_rank": entry["desktopRank"] if entry["desktopRank"] is not None else "",
                        "desktop_change": entry["desktopChange"] or "",
                        "desktop_direction": entry["desktopDirection"],
                        "desktop_url": entry["desktopUrl"] or "",
                        "mobile_rank": entry["mobileRank"] if entry["mobileRank"] is not None else "",
                        "mobile_change": entry["mobileChange"] or "",
                        "mobile_direction": entry["mobileDirection"],
                        "mobile_url": entry["mobileUrl"] or "",
                        "volume_min": entry["volumeMin"] if entry["volumeMin"] is not None else "",
                        "volume_max": entry["volumeMax"] if entry["volumeMax"] is not None else "",
                        "engine_url_split": entry["engineUrlSplit"],
                        "engines_on_this_url": "|".join(entry["engines"]),
                        "evidence_date": EVIDENCE_DATE,
                    }
                )


def keyword_field(item, nested_engine, nested_key, flat_key, default=None):
    if nested_engine in item and isinstance(item[nested_engine], dict):
        return item[nested_engine].get(nested_key, default)
    return item.get(flat_key, default)


def keyword_table(items, columns=None):
    columns = columns or (
        ("Keyword", lambda item: item["keyword"]),
        ("Cluster", lambda item: item.get("cluster", "")),
        ("Best rank", lambda item: md_rank(item.get("bestRank"))),
        (
            "Desktop",
            lambda item: (
                f"{md_rank(keyword_field(item, 'desktop', 'rank', 'desktopRank'))} / "
                f"{md_change(keyword_field(item, 'desktop', 'changeRaw', 'desktopChange') or '')}"
            ),
        ),
        (
            "Mobile",
            lambda item: (
                f"{md_rank(keyword_field(item, 'mobile', 'rank', 'mobileRank'))} / "
                f"{md_change(keyword_field(item, 'mobile', 'changeRaw', 'mobileChange') or '')}"
            ),
        ),
        ("Vol min-max", lambda item: f"{item.get('volumeMin')}-{item.get('volumeMax')}"),
        (
            "URL",
            lambda item: (item.get("rankingUrls") or [item.get("desktopUrl") or item.get("mobileUrl") or ""])[0],
        ),
    )
    header = "| " + " | ".join(title for title, _ in columns) + " |"
    divider = "| " + " | ".join("---" for _ in columns) + " |"
    lines = [header, divider]
    for item in items:
        lines.append("| " + " | ".join(md_escape(getter(item)) for _, getter in columns) + " |")
    return "\n".join(lines)


def write_markdown(payload):
    clusters = payload["clusters"]
    pages = payload["pageMap"]
    buckets = payload["buckets"]
    lanes = payload["lanes"]
    risks = payload["rankingRisks"]
    top15 = pages[:15]
    snapshot = payload["source"]

    lines = [
        "# BigOrange Marketing — Moz ranking and opportunity map",
        "",
        f"**Evidence date:** {EVIDENCE_DATE} Moz snapshot. These are not live current ranks.",
        f"**Source:** Emelia Pitlick Gmail on 2026-08-17, subject `BOM Keywords from Moz`, original file `{ORIGINAL_FILENAME}`.",
        f"**Local CSV:** `{snapshot['localCsv']}`.",
        f"**Client route:** `{CLIENT_ID}`.",
        f"**Generated at (UTC):** {payload['generatedAtUtc']}.",
        "",
        "All keyword rows below come from the CSV. The export is a multi-year engine-variant history (2022-04-01 through 2026-08-14). This map uses only the 2026-08-14 National Google en-US / Google Mobile en-US snapshot. Case-variant duplicates on that date were collapsed; they were not invented.",
        "",
        "## Snapshot counts",
        "",
        f"- Historical export rows: {snapshot['totalHistoricalRows']}",
        f"- Snapshot rows dated {EVIDENCE_DATE}: {snapshot['snapshotRows']}",
        f"- Unique snapshot keywords after case-fold collapse: {snapshot['snapshotUniqueKeywords']}",
        f"- Case-variant duplicates collapsed: {snapshot['caseVariantDuplicatesCollapsed']}",
        f"- Unique ranking URLs in the snapshot: {snapshot['uniqueRankingUrls']}",
        f"- Tracked keywords present in the export but absent from {EVIDENCE_DATE}: {snapshot['historicalOnlyKeywordCount']}",
        "",
        "## Cluster counts",
        "",
        "| Cluster | Keywords | Ranked | Unranked | Builder-pilot | Rest of site |",
        "| --- | ---: | ---: | ---: | ---: | ---: |",
    ]
    for name in CLUSTERS:
        block = clusters[name]
        lines.append(
            f"| {name} | {block['count']} | {block['rankedCount']} | {block['unrankedCount']} | {block['builderPilotCount']} | {block['restOfSiteCount']} |"
        )
    lines.extend(
        [
            "",
            "Primary cluster is exclusive. Secondary clusters are recorded in JSON when a term hits more than one vertical (for example manufacturing + StoryBrand, or builder + Cincinnati).",
            "",
            "## Two-lane map for the Sept 3 package",
            "",
            "The Sept 3 review needs both lanes, not a builder-only report.",
            "",
            "### Lane A — Finish the builder authority hub",
            "",
            f"- Tracked builder-pilot keywords: **{lanes['builderPilot']['keywordCount']}**",
            f"- Ranked / unranked: **{lanes['builderPilot']['rankedCount']}** / **{lanes['builderPilot']['unrankedCount']}**",
            f"- Protect 1-3 / improve 4-10 / opportunity 11-20: **{lanes['builderPilot']['protectCount']}** / **{lanes['builderPilot']['improveCount']}** / **{lanes['builderPilot']['opportunityCount']}**",
            f"- Ranking URL in this snapshot: `{lanes['builderPilot']['urls'][0] if lanes['builderPilot']['urls'] else 'none'}`",
            "",
            "Moz currently concentrates every ranked builder term on `/marketing-agency-for-builders/`. Unranked builder terms in this snapshot are unfinished hub work, not proof that other builder URLs rank for untracked queries.",
            "",
            keyword_table(lanes["builderPilot"]["keywords"]),
            "",
            "### Lane B — Apply the same AEO/GEO/SEO system to pages that already rank",
            "",
            f"- Tracked rest-of-site keywords: **{lanes['restOfSite']['keywordCount']}**",
            f"- Ranked / unranked: **{lanes['restOfSite']['rankedCount']}** / **{lanes['restOfSite']['unrankedCount']}**",
            f"- Distinct ranking URLs: **{len(lanes['restOfSite']['urls'])}**",
            f"- Protect 1-3 / improve 4-10 / opportunity 11-20: **{lanes['restOfSite']['protectCount']}** / **{lanes['restOfSite']['improveCount']}** / **{lanes['restOfSite']['opportunityCount']}**",
            "",
            "These URLs already own Moz-tracked terms in MSP, StoryBrand, manufacturing, inbound, and local Cincinnati. The same answer-ready AEO/GEO/SEO system should be applied page by page instead of only publishing new builder articles.",
            "",
        ]
    )
    rest_urls = [page for page in pages if page["lane"] == "rest-of-site"]
    lines.extend(
        [
            "| URL | Keywords owned | Best rank | Rising | Declining | Clusters |",
            "| --- | ---: | ---: | ---: | ---: | --- |",
        ]
    )
    for page in rest_urls:
        cluster_label = ", ".join(f"{name} {count}" for name, count in page["clusterCounts"].items())
        lines.append(
            f"| {page['url']} | {page['keywordCount']} | {md_rank(page['bestRank'])} | {page['risingCount']} | {page['decliningCount']} | {cluster_label} |"
        )

    if payload["builderPagesInLiveInventoryWithoutMozKeywords"]:
        lines.extend(
            [
                "",
                "Live site inventory (2026-09-01 public fetch, not Moz) includes additional builder URLs that own **zero** keywords in this Moz snapshot:",
                "",
            ]
        )
        for item in payload["builderPagesInLiveInventoryWithoutMozKeywords"]:
            lines.append(f"- {item['url']}")
        lines.append("")
        lines.append(
            "That gap is a hub-architecture signal: satellite builder pages exist, but Emelia's tracked builder queries all attach to `/marketing-agency-for-builders/` on 2026-08-14."
        )

    lines.extend(
        [
            "",
            "## Top 15 URLs by keyword ownership",
            "",
            "Ownership = unique snapshot keywords whose desktop and/or mobile ranking URL is this page.",
            "",
            "| Rank | URL | Lane | Keywords | Best rank | Vol min-max sum | Rising | Declining | Protect | Improve | Opportunity |",
            "| ---: | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
        ]
    )
    for index, page in enumerate(top15, start=1):
        lines.append(
            "| "
            + " | ".join(
                [
                    str(index),
                    page["url"],
                    page["lane"],
                    str(page["keywordCount"]),
                    md_rank(page["bestRank"]),
                    f"{page['volumeMinSum']}-{page['volumeMaxSum']}",
                    str(page["risingCount"]),
                    str(page["decliningCount"]),
                    str(page["protectCount"]),
                    str(page["improveCount"]),
                    str(page["opportunityCount"]),
                ]
            )
            + " |"
        )

    lines.extend(["", "Owned keywords for those URLs are in `emelia-moz-page-map.csv` (one row per URL + keyword)."])

    bucket_titles = (
        ("protect_1_3", "Position 1-3 — protect", "Best rank across desktop and mobile is 1, 2, or 3."),
        ("improve_4_10", "Position 4-10 — improve", "Best rank is 4 through 10. These are page-one holds that should move up."),
        ("opportunity_11_20", "Position 11-20 — opportunity", "Best rank is 11 through 20. Close enough to treat as expansion targets."),
        ("tracked_unranked", "Tracked but unranked", "No desktop rank and no mobile rank on 2026-08-14. A declining `>` change means Moz last saw the term drop out."),
    )
    for key, title, blurb in bucket_titles:
        items = buckets[key]
        lines.extend(["", f"## {title}", "", f"{blurb} Count: **{len(items)}**.", ""])
        if items:
            lines.append(keyword_table(items))
        else:
            lines.append("None in this snapshot.")

    lines.extend(
        [
            "",
            "## High-volume unranked terms BigOrange should own",
            "",
            "Filter: unranked on both engines, Moz volume max 51 or higher, and primary cluster in home-builder, msp-it, storybrand, manufacturing, landscaping, or local-cincinnati. Broad generic terms are listed separately so they are not treated as equally ownable.",
            "",
            f"Vertical should-own count: **{len(payload['highVolumeUnrankedShouldOwn'])}**.",
            "",
        ]
    )
    if payload["highVolumeUnrankedShouldOwn"]:
        lines.append(keyword_table(payload["highVolumeUnrankedShouldOwn"]))
    else:
        lines.append("None matched the vertical should-own rule.")
    lines.extend(
        [
            "",
            f"High-volume unranked generic/other terms (too broad or off-vertical to treat as must-own): **{len(payload['highVolumeUnrankedBroad'])}**.",
            "",
        ]
    )
    if payload["highVolumeUnrankedBroad"]:
        lines.append(keyword_table(payload["highVolumeUnrankedBroad"]))

    lines.extend(["", "## Cannibalization", ""])
    if payload["cannibalization"]:
        lines.append(
            "A family is flagged when two or more distinct ranking URLs appear among related snapshot terms."
        )
        lines.append("")
        for report in payload["cannibalization"]:
            lines.append(f"### {report['family']}")
            lines.append("")
            lines.append(
                f"{report['rankedKeywordCount']} ranked keywords across {report['urlCount']} URLs."
            )
            lines.append("")
            for url in report["urls"]:
                lines.append(f"- {url}")
            lines.append("")
            lines.append(
                ", ".join(
                    f"{item['keyword']} ({md_rank(item['bestRank'])})"
                    for item in report["keywords"]
                )
            )
            lines.append("")
    else:
        lines.append("No multi-URL keyword families in this snapshot.")

    if payload["engineUrlSplits"]:
        lines.extend(
            [
                "### Same keyword, different desktop vs mobile URL",
                "",
                keyword_table(payload["engineUrlSplits"]),
                "",
            ]
        )

    if payload["nearDuplicateGroups"]:
        lines.extend(
            [
                "### Near-duplicate tracked strings",
                "",
                "Moz is tracking punctuation or casing variants as separate rows. After case-fold collapse, these remaining groups still normalize to the same phrase:",
                "",
            ]
        )
        for group in payload["nearDuplicateGroups"]:
            lines.append("- " + " / ".join(f"`{item}`" for item in group["keywords"]))
        lines.append("")

    lines.extend(["", "## Biggest ranking risks", ""])
    for risk in risks:
        lines.append(f"### {risk['severity'].upper()} — {risk['title']}")
        lines.append("")
        lines.append(risk["why"])
        lines.append("")
        if risk["keywords"] and "keyword" in risk["keywords"][0]:
            preview = risk["keywords"][:12]
            lines.append(keyword_table(preview))
            if len(risk["keywords"]) > 12:
                lines.append("")
                lines.append(f"{len(risk['keywords']) - 12} more in the JSON.")
        elif risk["keywords"] and "family" in risk["keywords"][0]:
            for item in risk["keywords"]:
                lines.append(
                    f"- `{item['family']}`: {item['rankedKeywordCount']} ranked terms on {item['urlCount']} URLs"
                )
        lines.append("")

    lines.extend(
        [
            "## How to use this on Sept 3",
            "",
            "1. Keep `/marketing-agency-for-builders/` as the live builder ranking asset in this snapshot. Finish the authority hub so unranked and 11-20 builder terms have a supporting article path, not a second competing service page that steals the same queries.",
            "2. Reuse the same AEO/GEO/SEO contract on the 27 rest-of-site URLs that already own Moz terms, starting with `/msp-marketing-resources/`, the StoryBrand examples page, and `/msp-it-services-marketing-agency/`.",
            "3. Protect StoryBrand and builder position-1 terms that are already declining. Do not wait for a new content calendar to hold those URLs.",
            "4. Treat high-volume unranked vertical terms (`managed services provider marketing`, `msp website`, `StoryBrand Framework`, `marketing for manufacturers`) as new or expanded page jobs, not as proof the current pages failed on untracked queries.",
            "5. Do not refresh these ranks from memory. Re-export Moz or pull a live rank source if the review needs post-August-14 evidence.",
            "",
            "## Tracked in the export window but absent from 2026-08-14",
            "",
            "These keywords appear earlier in the 2022-04-01 to 2026-08-14 file and do not have a 2026-08-14 snapshot row. Last desktop date and rank are historical only.",
            "",
        ]
    )
    hist = payload["historicalTrackedNotInSnapshot"]
    if hist:
        lines.extend(
            [
                "| Keyword | Cluster | Last desktop date | Last desktop rank | Last desktop URL | Vol min-max |",
                "| --- | --- | --- | ---: | --- | --- |",
            ]
        )
        for item in hist:
            lines.append(
                "| "
                + " | ".join(
                    [
                        md_escape(item["keyword"]),
                        item["cluster"],
                        item["lastDesktopSerpDate"] or "—",
                        md_rank(item["lastDesktopRank"]),
                        item["lastDesktopUrl"] or "",
                        f"{item['volumeMin']}-{item['volumeMax']}",
                    ]
                )
                + " |"
            )
    else:
        lines.append("None.")

    lines.extend(
        [
            "",
            "## Output files",
            "",
            f"- `{OUT_JSON}`",
            f"- `{OUT_CSV}`",
            f"- `{OUT_MD}`",
            "",
            "Script: `scripts/analyze-emelia-moz-keywords.py`.",
            "",
        ]
    )
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    rows = load_source_rows(SOURCE_CSV)
    snapshot_rows, keywords = collapse_snapshot(rows)
    snapshot_keys = {item["keyword"].lower() for item in keywords}
    if len(keywords) != len(snapshot_keys):
        raise SystemExit("Keyword collapse produced duplicate keys.")

    cluster_map = {name: [] for name in CLUSTERS}
    for item in keywords:
        if item["cluster"] not in cluster_map:
            raise SystemExit(f"Unknown cluster {item['cluster']} for {item['keyword']}")
        cluster_map[item["cluster"]].append(item)
    if sum(len(items) for items in cluster_map.values()) != len(keywords):
        raise SystemExit("Cluster assignment dropped or duplicated a keyword.")

    pages = build_page_map(keywords)
    cannibalization, engine_splits, near_dups = build_cannibalization(keywords)
    _notable, ownable, broad = high_volume_unranked(keywords)
    hist = historical_only(rows, snapshot_keys)
    buckets = {
        "protect_1_3": [item for item in keywords if item["bucket"] == "protect_1_3"],
        "improve_4_10": [item for item in keywords if item["bucket"] == "improve_4_10"],
        "opportunity_11_20": [item for item in keywords if item["bucket"] == "opportunity_11_20"],
        "tracked_unranked": [item for item in keywords if item["bucket"] == "tracked_unranked"],
    }
    for key in buckets:
        buckets[key].sort(
            key=lambda item: (
                item["bestRank"] is None,
                item["bestRank"] if item["bestRank"] is not None else 99,
                -(item["volumeMax"] or 0),
                item["keyword"].lower(),
            )
        )

    def lane_block(name):
        items = [item for item in keywords if item["lane"] == name]
        urls = []
        for item in items:
            for url in item["rankingUrls"]:
                if url not in urls:
                    urls.append(url)
        items = sorted(
            items,
            key=lambda item: (
                item["bestRank"] is None,
                item["bestRank"] if item["bestRank"] is not None else 99,
                -(item["volumeMax"] or 0),
                item["keyword"].lower(),
            ),
        )
        return {
            "keywordCount": len(items),
            "rankedCount": sum(1 for item in items if item["bestRank"] is not None),
            "unrankedCount": sum(1 for item in items if item["bestRank"] is None),
            "protectCount": sum(1 for item in items if item["bucket"] == "protect_1_3"),
            "improveCount": sum(1 for item in items if item["bucket"] == "improve_4_10"),
            "opportunityCount": sum(1 for item in items if item["bucket"] == "opportunity_11_20"),
            "urls": urls,
            "keywords": items,
        }

    lanes = {
        "builderPilot": lane_block("builder-pilot"),
        "restOfSite": lane_block("rest-of-site"),
    }
    risks = ranking_risks(keywords, cannibalization)
    ranking_urls = [page["url"] for page in pages]
    live_builder_gap = builder_pages_without_moz_keywords(ranking_urls)

    clusters_out = {}
    for name in CLUSTERS:
        items = cluster_map[name]
        clusters_out[name] = {
            "count": len(items),
            "rankedCount": sum(1 for item in items if item["bestRank"] is not None),
            "unrankedCount": sum(1 for item in items if item["bestRank"] is None),
            "builderPilotCount": sum(1 for item in items if item["lane"] == "builder-pilot"),
            "restOfSiteCount": sum(1 for item in items if item["lane"] == "rest-of-site"),
            "direction": direction_counts(items),
            "keywords": [compact_keyword(item) for item in items],
        }

    payload = {
        "schemaVersion": 1,
        "clientId": CLIENT_ID,
        "evidenceDate": EVIDENCE_DATE,
        "evidenceLabel": (
            "Moz ranking snapshot dated 2026-08-14 from Emelia Pitlick's "
            "BOM Keywords from Moz export. Do not treat these as live current ranks."
        ),
        "generatedAtUtc": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "source": {
            "localCsv": str(SOURCE_CSV),
            "originalFilename": ORIGINAL_FILENAME,
            "gmail": "Emelia Pitlick, 2026-08-17, BOM Keywords from Moz",
            "exportWindow": "2022-04-01 to 2026-08-14",
            "location": "National",
            "totalHistoricalRows": len(rows),
            "snapshotRows": len(snapshot_rows),
            "snapshotUniqueKeywords": len(keywords),
            "caseVariantDuplicatesCollapsed": len(snapshot_rows) - len(keywords),
            "uniqueRankingUrls": len(pages),
            "historicalOnlyKeywordCount": len(hist),
        },
        "clusterCounts": {name: clusters_out[name]["count"] for name in CLUSTERS},
        "clusters": clusters_out,
        "lanes": {
            "builderPilot": {
                **{k: v for k, v in lanes["builderPilot"].items() if k != "keywords"},
                "keywords": [compact_keyword(item) for item in lanes["builderPilot"]["keywords"]],
            },
            "restOfSite": {
                **{k: v for k, v in lanes["restOfSite"].items() if k != "keywords"},
                "keywords": [compact_keyword(item) for item in lanes["restOfSite"]["keywords"]],
            },
        },
        "pageMap": [
            {
                **{k: v for k, v in page.items() if k != "ownedKeywords"},
                "ownedKeywords": page["ownedKeywords"],
            }
            for page in pages
        ],
        "buckets": {key: [compact_keyword(item) for item in items] for key, items in buckets.items()},
        "highVolumeUnrankedShouldOwn": [compact_keyword(item) for item in ownable],
        "highVolumeUnrankedBroad": [compact_keyword(item) for item in broad],
        "cannibalization": cannibalization,
        "engineUrlSplits": engine_splits,
        "nearDuplicateGroups": near_dups,
        "rankingRisks": risks,
        "historicalTrackedNotInSnapshot": hist,
        "builderPagesInLiveInventoryWithoutMozKeywords": live_builder_gap,
        "top15UrlsByKeywordOwnership": [
            {
                "url": page["url"],
                "lane": page["lane"],
                "keywordCount": page["keywordCount"],
                "bestRank": page["bestRank"],
                "risingCount": page["risingCount"],
                "decliningCount": page["decliningCount"],
            }
            for page in pages[:15]
        ],
    }

    write_page_map_csv(pages)
    # Markdown writer expects full keyword objects for tables.
    md_payload = dict(payload)
    md_payload["clusters"] = clusters_out
    md_payload["lanes"] = lanes
    md_payload["buckets"] = buckets
    md_payload["highVolumeUnrankedShouldOwn"] = ownable
    md_payload["highVolumeUnrankedBroad"] = broad
    md_payload["pageMap"] = pages
    write_markdown(md_payload)

    OUT_JSON.write_text(json.dumps(payload, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")

    print(json.dumps(
        {
            "ok": True,
            "clusterCounts": payload["clusterCounts"],
            "snapshotUniqueKeywords": len(keywords),
            "uniqueRankingUrls": len(pages),
            "top15": payload["top15UrlsByKeywordOwnership"],
            "bucketCounts": {key: len(items) for key, items in buckets.items()},
            "riskTitles": [risk["title"] for risk in risks],
            "outputs": [str(OUT_JSON), str(OUT_CSV), str(OUT_MD)],
        },
        indent=2,
    ))


if __name__ == "__main__":
    main()
