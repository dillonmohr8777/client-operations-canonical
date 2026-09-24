#!/usr/bin/env python3
"""Build a recommendation row for every live BigOrange WordPress URL.

Joins the Sep 1 public REST/sitemap inventory, Emelia's Aug 14 Moz page map,
and the 39-URL deep matrix. Remaining URLs get a typed SEO/AEO/GEO recipe
they can reuse on client sites with that client's own keywords.
"""

from __future__ import annotations

import csv
import json
import re
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INVENTORY = ROOT / "evidence" / "live-site-inventory.json"
MOZ_MAP = ROOT / "evidence" / "emelia-moz-page-map.csv"
DEEP_RECS = ROOT / "playbook" / "per-page-recs.csv"
OUT_CSV = ROOT / "playbook" / "all-pages-ledger.csv"
OUT_JSON = ROOT / "playbook" / "all-pages-ledger.json"
OUT_MD = ROOT / "playbook" / "ALL-PAGES-LEDGER.md"
OUT_JS = ROOT / "review-ui" / "all-pages.js"
BLANK = ROOT / "playbook" / "client-blank-page-map.csv"

NO_PROMISE = "No ranking, traffic, lead, or AI-citation promises."


def norm_url(url: str | None) -> str:
    if not url:
        return ""
    url = url.strip()
    if url == "https://bigorange.marketing":
        return "https://bigorange.marketing/"
    return url


def yoast_bits(item: dict) -> tuple[str, str, str, str]:
    yoast = item.get("yoast") or {}
    robots = yoast.get("robots") or {}
    return (
        (yoast.get("title") or "").strip(),
        (yoast.get("description") or "").strip(),
        (robots.get("index") or "").strip().lower(),
        (robots.get("follow") or "").strip().lower(),
    )


def classify_cluster(url: str, title: str) -> str:
    text = f"{url} {title}".lower()
    checks = (
        ("home-builder", ("home-builder", "homebuilder", "homearama", "custom-home", "for-builders", "builder-")),
        ("msp-it", ("msp", "managed-service", "it-services", "it-compan", "channelcon", "gtia", "comptia")),
        ("storybrand", ("storybrand", "brandscript")),
        ("manufacturing", ("manufactur", "industrial")),
        ("landscaping", ("landscap", "green-industry")),
        ("local-cincinnati", ("cincinnati", "dayton", "ohio")),
        ("ai-search", ("ai-search", "ai-visibility", "chatgpt", "ai-north", "ai-for-", "/ai-")),
    )
    for cluster, tokens in checks:
        if any(token in text for token in tokens):
            return cluster
    return "other"


def classify_template(url: str, title: str, wp_type: str, in_deep: bool) -> str:
    text = f"{url} {title}".lower()
    path = url.replace("https://bigorange.marketing", "")
    if in_deep:
        return "deep-matrix-owner"
    if any(
        token in path
        for token in (
            "confirmation",
            "thanks-for",
            "thank-you",
            "subscribe",
            "exit-survey",
            "squeeze-the-day/",
        )
    ):
        return "confirmation-sink"
    if any(token in path for token in ("hiring", "freelance-writer", "front-end-developer", "position")):
        return "careers"
    if any(
        token in path
        for token in (
            "campaign",
            "7-figure",
            "top-digital-marketing-agency",
            "top-website-design-for-msps",
            "top-manufacturing-marketing-agency",
            "website-design-for-msps",
            "msp-marketing-book",
            "revenue-engine",
        )
    ):
        return "campaign-lander"
    if "case-study" in path or "case study" in text or path.endswith("-case-study/"):
        return "case-proof"
    if any(token in path for token in ("webinar", "channelcon", "it-nation", "podcast", "talk-", "-talk")):
        return "event-recap"
    if any(token in path for token in ("margee-moore", "paula-rae", "about-big-orange", "women-owned")):
        return "entity-bio"
    if wp_type == "page" and any(
        token in path
        for token in (
            "marketing-agency",
            "marketing-services",
            "book-appointment",
            "contact",
            "accessibility",
        )
    ):
        return "commercial-or-utility-page"
    if any(
        path.startswith(prefix)
        for prefix in (
            "/what-is-",
            "/what-are-",
            "/what-does-",
            "/how-to-",
            "/how-is-",
            "/how-do-",
            "/is-",
        )
    ):
        return "definition-howto"
    if any(token in path for token in ("logo", "award", "wins-", "ohio-500", "designrush")):
        return "proof-award"
    return "supporting-article"


def recipe(template: str, cluster: str, title: str) -> tuple[str, str, str, str]:
    """Return seo, aeo, geo, client_template."""
    vertical = {
        "home-builder": "builder hub /marketing-agency-for-builders/",
        "msp-it": "MSP hub /msp-it-services-marketing-agency/",
        "storybrand": "StoryBrand service page plus one editorial owner per job",
        "manufacturing": "manufacturing hub, not a second examples page",
        "landscaping": "one landscaping hub slug only",
        "local-cincinnati": "homepage router plus city-specific proof",
        "ai-search": "AI service page after H1/robots repair",
        "other": "nearest vertical hub or the homepage router",
    }[cluster]
    if template == "confirmation-sink":
        return (
            f"Keep noindex. Stay out of the sitemap. Do not attach Emelia keywords. Thank-you copy only. {NO_PROMISE}",
            "No Direct answer block. No FAQPage. One sentence confirming the form arrived.",
            "Not a citation or entity page. Do not name client results here.",
            "Client confirmation sink. Same robots rule on every account.",
        )
    if template == "careers":
        return (
            "Index only while the role is open. Close with noindex when filled. Not a service URL.",
            "One-sentence role summary. No service FAQs.",
            "State Cincinnati or remote facts only. No ranking language.",
            "Client careers page. Close or noindex when the seat fills.",
        )
    if template == "campaign-lander":
        return (
            f"Decide one job: index+follow+sitemap as a distinct offer, or noindex as a paid sink. Current nofollow-plus-missing-sitemap state isolates equity. Do not twin {vertical}. {NO_PROMISE}",
            "If indexed: one H1, labeled Direct answer for the offer, five FAQs. If a sink: no schema theater.",
            "Date the offer. No best-agency adjectives. Link to the real hub once.",
            "Client paid lander. Same binary: real page or true sink. Never index,nofollow.",
        )
    if template == "case-proof":
        return (
            f"Proof page, not a second hub. Title and H1 stay case-shaped. Reciprocal link to {vertical} with proof anchors, not agency-head terms. {NO_PROMISE}",
            f"Direct answer: what this {title.strip() or 'case'} showed. Definition of case vs service page. Five FAQs. Speakable: What does this case cover?",
            "Name the client only with permission. Date the work. Invented metrics stay out.",
            "Client case study. One proof URL per engagement. Hub keeps the commercial keywords.",
        )
    if template == "event-recap":
        return (
            f"Keep the date in the title. Not a hub. After 18 months, refresh or archive if thin. Link recap takeaways to {vertical}. {NO_PROMISE}",
            "Direct answer: what the session covered. Three to five FAQs. No evergreen HowTo unless steps are still true.",
            "Firsthand notes only. Attribute speakers. Do not upgrade an old recap into a 2026 rank claim.",
            "Client event recap. Dated, then retired or refreshed. Never a second service page.",
        )
    if template == "entity-bio":
        return (
            "About or people pages own identity, not vertical keywords. Canonical about URL. Link out to hubs.",
            "Direct answer: who BigOrange is or who this person is. Three FAQs. Speakable: Who is BigOrange Marketing?",
            "Legal/brand name, Cincinnati, verticals served. Same Organization facts as Yoast. No award inflation.",
            "Client about/people pages. Identity only. Services stay on hubs.",
        )
    if template == "commercial-or-utility-page":
        return (
            f"One commercial job. One H1. Index,follow if it is a real service; noindex if utility. Do not split {vertical}. {NO_PROMISE}",
            "Direct answer for the sold service. Definition vs adjacent offer. Five FAQs. Speakable question matches the H1 job.",
            "Entity + service area + last reviewed date. Experience callouts only from approved cases.",
            "Client service or booking page. One URL per sold offer.",
        )
    if template == "definition-howto":
        return (
            f"One question, one URL. If a sibling slug asks the same question, 301 or canonicalize. Internal link to {vertical}. {NO_PROMISE}",
            "Labeled Direct answer in the first 100 words. Definition box. Decision table when comparing options. Five visible FAQs with matching FAQPage. Speakable Q equals the H1.",
            "Attribute StoryBrand, HubSpot, or other frameworks. BOM experience in a separate labeled callout.",
            "Client what-is / how-to article. Same four blocks. Their keyword, their SME, their examples.",
        )
    if template == "proof-award":
        return (
            f"Citation page. Do not retitle as a hub. Link the award to {vertical}. {NO_PROMISE}",
            "Direct answer: what the list or award is and who issued it. Three FAQs.",
            "Issuer + year required. If the list is gone, demote or noindex. BOM is not the awarding body.",
            "Client award/list citation. Proof, not a keyword grab.",
        )
    return (
        f"One reader job. Refresh stale years in the title. Link to {vertical}. Do not attach a second commercial head term. {NO_PROMISE}",
        "Add the four blocks: Direct answer, definition or explicit not-a-definition, five FAQs, speakable Q. Table only when a comparison exists.",
        "Review date on the page. Firsthand BOM or approved client proof vs generic advice. No ranking adjectives.",
        "Client supporting article. Same block contract. Swap in that client's keyword and SME notes.",
    )


def priority_for(row: dict) -> str:
    if row.get("deep_priority"):
        return row["deep_priority"]
    if row["index_robots"] == "index" and row["follow_robots"] == "nofollow":
        return "P0" if "ai-search-optimization-services" in row["url"] else "P1"
    if row["template"] == "confirmation-sink":
        return "P3"
    if row["template"] == "campaign-lander":
        return "P1"
    if row["moz_keywords"]:
        return "P1"
    if row["template"] in {"case-proof", "definition-howto", "commercial-or-utility-page"}:
        return "P2"
    if row["cluster"] in {"home-builder", "msp-it", "storybrand", "manufacturing", "landscaping", "ai-search"}:
        return "P2"
    return "P3"


def load_moz() -> dict[str, dict]:
    by_url: dict[str, dict] = {}
    with MOZ_MAP.open(encoding="utf-8-sig", newline="") as handle:
        for rec in csv.DictReader(handle):
            url = norm_url(rec.get("url"))
            if not url:
                continue
            bucket = by_url.setdefault(
                url,
                {
                    "lane": rec.get("url_lane") or "",
                    "cluster": rec.get("url_primary_cluster") or "",
                    "keyword_count": int(rec.get("url_keyword_count") or 0),
                    "best_rank": rec.get("url_best_rank") or "",
                    "best_keyword": rec.get("url_best_rank_keyword") or "",
                    "keywords": [],
                },
            )
            keyword = (rec.get("keyword") or "").strip()
            if keyword and keyword not in bucket["keywords"]:
                bucket["keywords"].append(keyword)
    return by_url


def load_deep() -> dict[str, dict]:
    by_url = {}
    with DEEP_RECS.open(encoding="utf-8-sig", newline="") as handle:
        for rec in csv.DictReader(handle):
            by_url[norm_url(rec.get("url"))] = rec
    return by_url


def collect_urls(inventory: dict) -> list[dict]:
    sitemap = set()
    for child in inventory.get("sitemaps", {}).get("childSitemaps", []):
        for url in child.get("urls") or []:
            sitemap.add(norm_url(url))
    missing = {norm_url(url) for url in inventory.get("mismatches", {}).get("publishedRestNotInSitemap", [])}
    nofollow = {norm_url(url) for url in inventory.get("supplementalFindings", {}).get("nofollowPageUrls", [])}

    rows = []
    rest = inventory.get("wpRest") or {}
    for wp_type in ("pages", "posts"):
        for item in rest.get(wp_type) or []:
            url = norm_url(item.get("link"))
            if not url:
                continue
            title_yoast, meta, index_r, follow_r = yoast_bits(item)
            rows.append(
                {
                    "url": url,
                    "wp_id": item.get("id"),
                    "wp_type": "page" if wp_type == "pages" else "post",
                    "slug": item.get("slug") or "",
                    "status": item.get("status") or "",
                    "title": (item.get("title") or "").strip(),
                    "modified": item.get("modified") or "",
                    "yoast_title": title_yoast,
                    "yoast_description": meta,
                    "index_robots": index_r,
                    "follow_robots": follow_r,
                    "in_sitemap": url in sitemap,
                    "rest_not_in_sitemap": url in missing,
                    "listed_nofollow": url in nofollow,
                }
            )
    return rows


def health_flags(row: dict) -> str:
    flags = []
    if row["url"].rstrip("/") == "https://bigorange.marketing" and "stategic" in (row.get("yoast_description") or "").lower():
        flags.append("homepage-stategic-typo")
    if "ai-search-optimization-services" in row["url"]:
        flags.append("four-h1s")
        flags.append("index-nofollow")
    if row["index_robots"] == "index" and row["follow_robots"] == "nofollow":
        flags.append("index-nofollow")
    if row["rest_not_in_sitemap"]:
        flags.append("published-not-in-sitemap")
    if row["index_robots"] == "noindex":
        flags.append("noindex")
    if "lead" in (row.get("yoast_description") or "").lower() and "qualified" in (row.get("yoast_description") or "").lower():
        flags.append("lead-promise-meta")
    if re.search(r"\b(outrank|top ranked|best agency|get more leads)\b", (row.get("yoast_description") or "").lower()):
        flags.append("ranking-or-lead-promise-meta")
    return "|".join(dict.fromkeys(flags))


def build() -> list[dict]:
    inventory = json.loads(INVENTORY.read_text(encoding="utf-8-sig"))
    moz = load_moz()
    deep = load_deep()
    rows = []
    seen = set()
    for base in collect_urls(inventory):
        url = base["url"]
        seen.add(url)
        moz_row = moz.get(url, {})
        deep_row = deep.get(url)
        cluster = moz_row.get("cluster") or classify_cluster(url, base["title"])
        template = classify_template(url, base["title"], base["wp_type"], bool(deep_row))
        if deep_row:
            seo, aeo, geo, client_t = (
                deep_row.get("seo") or "",
                deep_row.get("aeo") or "",
                deep_row.get("geo") or "",
                deep_row.get("client_template") or "",
            )
            lane = deep_row.get("lane") or moz_row.get("lane") or ""
            priority = deep_row.get("priority") or ""
        else:
            seo, aeo, geo, client_t = recipe(template, cluster, base["title"])
            lane = moz_row.get("lane") or ("rest-of-site" if moz_row else "untracked")
            priority = ""
        record = {
            **base,
            "lane": lane,
            "cluster": cluster,
            "template": template,
            "moz_keywords": moz_row.get("keyword_count") or 0,
            "moz_best_rank": moz_row.get("best_rank") or "",
            "moz_best_keyword": moz_row.get("best_keyword") or "",
            "moz_keyword_list": "|".join(moz_row.get("keywords") or []),
            "deep_matrix": bool(deep_row),
            "deep_priority": priority,
            "seo": seo,
            "aeo": aeo,
            "geo": geo,
            "client_template": client_t,
        }
        record["health_flags"] = health_flags(record)
        record["priority"] = priority_for(record)
        rows.append(record)

    # Moz or sitemap URLs that REST somehow missed
    for url in sorted(set(moz) | set()):
        if url not in seen:
            continue
    rows.sort(key=lambda r: ({"P0": 0, "P1": 1, "P2": 2, "P3": 3}.get(r["priority"], 9), r["url"]))
    return rows


def write_outputs(rows: list[dict]) -> None:
    fields = [
        "priority",
        "url",
        "wp_id",
        "wp_type",
        "title",
        "cluster",
        "template",
        "lane",
        "moz_keywords",
        "moz_best_rank",
        "moz_best_keyword",
        "moz_keyword_list",
        "index_robots",
        "follow_robots",
        "in_sitemap",
        "health_flags",
        "deep_matrix",
        "modified",
        "yoast_title",
        "seo",
        "aeo",
        "geo",
        "client_template",
    ]
    with OUT_CSV.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        for row in rows:
            writer.writerow(row)

    slim = [{key: row[key] for key in fields} for row in rows]
    OUT_JSON.write_text(json.dumps(slim, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    OUT_JS.write_text(
        "window.BOM_ALL_PAGES = " + json.dumps(slim, ensure_ascii=False) + ";\n",
        encoding="utf-8",
    )

    with BLANK.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=[
                "client_id",
                "url",
                "reader_job",
                "owned_keywords",
                "cluster",
                "template",
                "priority",
                "seo",
                "aeo",
                "geo",
                "sme_owner",
                "publish_state",
            ],
        )
        writer.writeheader()
        writer.writerow(
            {
                "client_id": "REPLACE-WITH-REGISTRY-ID",
                "url": "https://client.example/service/",
                "reader_job": "One sentence this URL must answer",
                "owned_keywords": "exact export strings",
                "cluster": "client-vertical",
                "template": "commercial-or-utility-page",
                "priority": "P0",
                "seo": "One H1. Index,follow if real service.",
                "aeo": "Direct answer + definition + five FAQs",
                "geo": "Entity + dated proof. No ranking promises.",
                "sme_owner": "named practitioner",
                "publish_state": "local-review",
            }
        )

    counts = Counter(row["priority"] for row in rows)
    templates = Counter(row["template"] for row in rows)
    clusters = Counter(row["cluster"] for row in rows)
    health_n = sum(1 for row in rows if row["health_flags"])
    deep_n = sum(1 for row in rows if row["deep_matrix"])
    moz_n = sum(1 for row in rows if row["moz_keywords"])

    lines = [
        "# All-pages SEO / AEO / GEO ledger",
        "",
        "**Prepared:** 2026-09-01  ",
        "**Review:** Thursday, September 3, 2026  ",
        "**Client:** `bigorange-marketing`  ",
        "**Coverage:** every published WordPress page and post from the September 1 public REST inventory (**%d URLs**)."
        % len(rows),
        "",
        "The 39-URL deep matrix in `PER-PAGE-RECOMMENDATIONS.md` is the working-session set (every Moz ranking URL plus commercial zeros and builder satellites). This ledger applies the same contract to the rest of the live site so leadership can see scale, and so BigOrange can hand a client their own keyword export and get the same columns back.",
        "",
        "Ranks are the **2026-08-14** Moz snapshot only. Public titles, robots, and sitemap membership are **2026-09-01**. No ranking, traffic, lead, or AI-citation promises.",
        "",
        "Machine table: `all-pages-ledger.csv`. Interactive filter: `review-ui/index.html`. Client blank: `client-blank-page-map.csv`.",
        "",
        "## Counts",
        "",
        "| Slice | Count |",
        "| --- | ---: |",
        f"| Published URLs | {len(rows)} |",
        f"| Deep-matrix owners (full write-up) | {deep_n} |",
        f"| URLs that own an Aug 14 Moz keyword | {moz_n} |",
        f"| URLs with a health flag | {health_n} |",
        f"| P0 | {counts.get('P0', 0)} |",
        f"| P1 | {counts.get('P1', 0)} |",
        f"| P2 | {counts.get('P2', 0)} |",
        f"| P3 | {counts.get('P3', 0)} |",
        "",
        "## Templates (the productized page types)",
        "",
        "| Template | Count | What BigOrange reuses on a client site |",
        "| --- | ---: | --- |",
    ]
    labels = {
        "deep-matrix-owner": "Already has a full SEO+AEO+GEO write-up in the 39-URL matrix",
        "confirmation-sink": "Thank-you / subscribe. Stay noindex. Never attach keywords",
        "campaign-lander": "Paid or promo URL. Become a real page or a true sink. Never index,nofollow",
        "case-proof": "Named engagement. Proof anchors only. Hub keeps commercial terms",
        "event-recap": "Dated session notes. Refresh or archive. Not a hub",
        "entity-bio": "About / people. Identity, not vertical keywords",
        "commercial-or-utility-page": "Sold offer or booking. One H1. One job",
        "definition-howto": "One question, four blocks, matching FAQPage",
        "proof-award": "Issuer + year. Citation, not a second agency page",
        "supporting-article": "One reader job + the four blocks + link to the hub",
        "careers": "Index only while the role is open. Close with noindex when filled",
    }
    for name, count in templates.most_common():
        lines.append(f"| `{name}` | {count} | {labels.get(name, '')} |")

    lines += [
        "",
        "## Clusters",
        "",
        "| Cluster | URLs | How client keywords map |",
        "| --- | ---: | --- |",
    ]
    cluster_help = {
        "msp-it": "Client MSP export lands on their service hub, resources, and what-is pages",
        "storybrand": "One owner each for examples, BrandScript, checklist, cost, free",
        "home-builder": "One commercial hub. Satellites stay proof",
        "manufacturing": "Hub owns marketing for manufacturers. Examples keep the modifier",
        "landscaping": "Pick one hub slug. Do not clone two service URLs",
        "ai-search": "Fix BOM's own AI page first, then sell the method",
        "local-cincinnati": "Homepage or a true local job. Not a fifth vertical hub",
        "other": "Utility, careers, generic education. Assign a job or noindex",
    }
    for name, count in clusters.most_common():
        lines.append(f"| `{name}` | {count} | {cluster_help.get(name, '')} |")

    lines += [
        "",
        "## How every indexable URL gets SEO + AEO + GEO",
        "",
        "1. **SEO:** one reader job, one H1, honest title/meta, robots that match intent, sitemap membership only if the URL should be found, internal link to the hub, no second commercial twin.",
        "2. **AEO:** labeled Direct answer, definition (or explicit not-a-definition), decision table when a comparison exists, five visible FAQs identical to FAQPage, one speakable question.",
        "3. **GEO:** named entity, service area, last reviewed date, firsthand or approved proof separated from generic advice, frameworks attributed, no ranking or citation promises.",
        "4. **Client keywords:** replace Emelia's strings with that client's export. The template and blocks stay. The copy, SME, and proof change.",
        "",
        "## P0 and health-flagged URLs",
        "",
        "| Priority | URL | Cluster | Template | Flags | Moz |",
        "| --- | --- | --- | --- | --- | ---: |",
    ]
    for row in rows:
        if row["priority"] == "P0" or row["health_flags"]:
            path = row["url"].replace("https://bigorange.marketing", "") or "/"
            lines.append(
                f"| {row['priority']} | `{path}` | {row['cluster']} | {row['template']} | {row['health_flags'] or '—'} | {row['moz_keywords']} |"
            )

    lines += [
        "",
        "## Full URL index",
        "",
        "Open `all-pages-ledger.csv` or the review UI to filter. Compact list below.",
        "",
        "| P | Type | Cluster | Template | Moz | URL |",
        "| --- | --- | --- | --- | ---: | --- |",
    ]
    for row in rows:
        path = row["url"].replace("https://bigorange.marketing", "") or "/"
        lines.append(
            f"| {row['priority']} | {row['wp_type']} | {row['cluster']} | {row['template']} | {row['moz_keywords']} | `{path}` |"
        )
    lines += [
        "",
        "*Generated from `live-site-inventory.json` + `emelia-moz-page-map.csv` + `per-page-recs.csv`. Cookies redacted. No outcome forecasts.*",
        "",
    ]
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")
    print(f"wrote {len(rows)} rows -> {OUT_CSV}")


if __name__ == "__main__":
    write_outputs(build())
