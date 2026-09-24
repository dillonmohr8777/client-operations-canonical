"""Build an Erie + Pittsburgh official-site candidate list from OpenStreetMap.

Source is OSM website tags, not Google Maps and not the Philadelphia radar.
Emails are not invented. Phone is kept only when OSM already published it.
"""

from __future__ import annotations

import json
import re
import time
import urllib.parse
import urllib.request
from collections import Counter
from datetime import date, datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent
TODAY = date.today().isoformat()
OVERPASS = "https://overpass-api.de/api/interpreter"
UA = "IMMOHRTAL-research/1.0 (local candidate list; official websites only)"

MARKETS = {
    "pittsburgh": {
        "label": "Pittsburgh",
        "bbox": (40.28, -80.32, 40.58, -79.70),
    },
    "erie": {
        "label": "Erie",
        "bbox": (41.85, -80.52, 42.27, -79.61),
    },
}

NATIONAL_DOMAIN_PARTS = {
    "mcdonalds",
    "starbucks",
    "walmart",
    "target",
    "amazon",
    "costco",
    "lowes",
    "homedepot",
    "cvs",
    "walgreens",
    "riteaid",
    "dollar-general",
    "dollargeneral",
    "familydollar",
    "dunkin",
    "pizzahut",
    "dominos",
    "papajohns",
    "subway.com",
    "kfc.com",
    "tacobell",
    "chipotle",
    "panerabread",
    "wendys",
    "burgerking",
    "apple.com",
    "google.com",
    "facebook.com",
    "instagram.com",
    "yelp.com",
    "tripadvisor",
    "opentable",
    "doordash",
    "ubereats",
    "grubhub",
    "squarespace.com",
    "wixsite.com",
    "linktr.ee",
    "bit.ly",
    "goo.gl",
}

PRIORITY_PREFIXES = (
    "amenity:restaurant",
    "amenity:cafe",
    "amenity:bar",
    "amenity:pub",
    "amenity:dentist",
    "amenity:clinic",
    "amenity:doctors",
    "amenity:veterinary",
    "shop:beauty",
    "shop:hairdresser",
    "shop:car_repair",
    "shop:bakery",
    "shop:florist",
    "shop:hardware",
    "shop:doityourself",
    "shop:paint",
    "shop:furniture",
    "office:lawyer",
    "office:estate_agent",
    "office:tax_advisor",
    "office:accountant",
    "office:therapist",
    "craft:",
)

DROP_PREFIXES = (
    "amenity:place_of_worship",
    "amenity:school",
    "amenity:university",
    "amenity:college",
    "amenity:fire_station",
    "amenity:bank",
    "amenity:hospital",
    "amenity:parking",
    "amenity:fuel",
    "amenity:fast_food",
    "shop:supermarket",
)

SOCIAL_HOSTS = {
    "facebook.com",
    "www.facebook.com",
    "m.facebook.com",
    "instagram.com",
    "www.instagram.com",
    "twitter.com",
    "x.com",
    "linkedin.com",
    "www.linkedin.com",
    "youtube.com",
    "youtu.be",
    "tiktok.com",
}


def overpass_query(south: float, west: float, north: float, east: float) -> str:
    box = f"({south},{west},{north},{east})"
    return f"""
[out:json][timeout:90];
(
  nwr["website"]["amenity"]{box};
  nwr["website"]["shop"]{box};
  nwr["website"]["office"]{box};
  nwr["website"]["craft"]{box};
  nwr["website"]["healthcare"]{box};
  nwr["tourism"~"hotel|guest_house|museum|attraction"]["website"]{box};
);
out tags;
""".strip()


def fetch_overpass(query: str) -> dict:
    data = urllib.parse.urlencode({"data": query}).encode("utf-8")
    req = urllib.request.Request(
        OVERPASS,
        data=data,
        headers={"User-Agent": UA, "Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        return json.loads(resp.read().decode("utf-8"))


def clean_url(raw: str | None) -> str | None:
    if not raw:
        return None
    value = raw.strip()
    if not value or " " in value:
        return None
    if not re.match(r"^https?://", value, re.I):
        value = "https://" + value
    parsed = urlparse(value)
    host = (parsed.hostname or "").lower()
    if not host or host in SOCIAL_HOSTS:
        return None
    if any(part in host for part in NATIONAL_DOMAIN_PARTS):
        return None
    return f"{parsed.scheme}://{host}{parsed.path.rstrip('/')}"


def domain_key(url: str) -> str:
    host = urlparse(url).hostname or url
    host = host.lower()
    if host.startswith("www."):
        host = host[4:]
    return host


def category_of(tags: dict) -> str:
    for key in ("amenity", "shop", "office", "craft", "healthcare", "tourism"):
        if tags.get(key):
            return f"{key}:{tags[key]}"
    return "unknown"


def city_of(tags: dict, fallback: str) -> str:
    city = (tags.get("addr:city") or "").strip()
    return city or fallback


def record_from(element: dict, market_label: str) -> dict | None:
    tags = element.get("tags") or {}
    name = (tags.get("name") or "").strip()
    website = clean_url(tags.get("website") or tags.get("contact:website"))
    if not name or not website:
        return None
    phone = (tags.get("phone") or tags.get("contact:phone") or "").strip() or None
    return {
        "business": name,
        "market": market_label,
        "city": city_of(tags, market_label),
        "state": "PA",
        "officialUrl": website,
        "domain": domain_key(website),
        "category": category_of(tags),
        "phone": phone,
        "email": None,
        "emailStatus": "not_collected",
        "source": "openstreetmap-website-tag",
        "osmType": element.get("type"),
        "osmId": element.get("id"),
        "accessed": TODAY,
        "draftStatus": "unbuilt",
        "mailStatus": "unsent",
    }


def build_market(market_id: str) -> list[dict]:
    meta = MARKETS[market_id]
    south, west, north, east = meta["bbox"]
    payload = fetch_overpass(overpass_query(south, west, north, east))
    rows = []
    for element in payload.get("elements", []):
        rec = record_from(element, meta["label"])
        if rec:
            rows.append(rec)
    return rows


def main() -> None:
    started = datetime.now(timezone.utc).isoformat()
    collected: list[dict] = []
    errors: list[str] = []
    for market_id in MARKETS:
        try:
            collected.extend(build_market(market_id))
            time.sleep(8)
        except Exception as exc:  # noqa: BLE001
            errors.append(f"{market_id}: {exc}")

    deduped: dict[str, dict] = {}
    for row in collected:
        key = row["domain"]
        if key not in deduped:
            deduped[key] = row

    rows = sorted(deduped.values(), key=lambda r: (r["market"], r["business"].lower()))
    priority = [
        row
        for row in rows
        if row["category"].startswith(PRIORITY_PREFIXES)
        and not row["category"].startswith(DROP_PREFIXES)
    ]
    summary = {
        "generatedAtUtc": started,
        "source": OVERPASS,
        "rule": "OSM website tags only. No Google Maps scrape. No Philadelphia radar. No invented emails.",
        "totalUniqueOfficialSites": len(rows),
        "priorityOwnerOperated": len(priority),
        "priorityByMarket": dict(Counter(r["market"] for r in priority)),
        "byMarket": dict(Counter(r["market"] for r in rows)),
        "byCategory": dict(Counter(r["category"] for r in rows).most_common(25)),
        "errors": errors,
        "sends": 0,
    }
    (ROOT / "candidates.json").write_text(json.dumps(rows, indent=2) + "\n", encoding="utf-8")
    (ROOT / "priority-candidates.json").write_text(json.dumps(priority, indent=2) + "\n", encoding="utf-8")
    (ROOT / "summary.json").write_text(json.dumps(summary, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
