"""Collect published Erie mailboxes and page facts for hometown outreach.

Emails are taken only from OSM contact tags or the official website.
No addresses are guessed. Pittsburgh is ignored.
"""

from __future__ import annotations

import json
import re
import ssl
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import Counter
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse

ROOT = Path(__file__).resolve().parent
PACKAGE = ROOT.parent
TODAY = datetime.now(timezone.utc).date().isoformat()
OVERPASS = "https://overpass-api.de/api/interpreter"
UA = "MomentumErieResearch/1.0 (official-site contact collection; no form submit)"
ERIE_BBOX = (41.85, -80.52, 42.27, -79.61)
CTX = ssl.create_default_context()

PA_ERIE_CITIES = {
    "erie",
    "north east",
    "corry",
    "albion",
    "waterford",
    "edinboro",
    "harborcreek",
    "union city",
    "fairview",
    "lake city",
    "east springfield",
    "girard",
    "mckean",
    "cranesville",
    "wesleyville",
    "millcreek",
    "lawrence park",
    "platea",
    "wattsburg",
    "elgin",
}

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
    "amenity:library",
    "amenity:police",
    "amenity:townhall",
    "amenity:post_office",
    "amenity:social_facility",
    "office:government",
    "office:ngo",
    "shop:supermarket",
)

CHAIN_PARTS = {
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
    "buffalowildwings",
    "cheddars",
    "crackerbarrel",
    "applebees",
    "olivegarden",
    "redlobster",
    "outback",
    "ihop",
    "dennys",
    "fiveguys",
    "chick-fil-a",
    "chickfila",
    "jimmyjohns",
    "ahn.org",
    "upmc.com",
    "upmc.edu",
    "marriott",
    "hilton.com",
    "hamptoninn",
    "holidayinn",
    "ihg.com",
    "choicehotels",
    "wyndham",
    "bestwestern",
    "super8",
    "motel6",
    "enterprise.com",
    "hertz.com",
    "verizon",
    "xfinity",
    "comcast",
    "statefarm",
    "geico",
    "progressive.com",
    "allstate",
    "walgreens",
    "locations.",
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
}

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

BAD_EMAIL_PARTS = (
    "noreply",
    "no-reply",
    "donotreply",
    "sentry.io",
    "wixpress.com",
    "schema.org",
    "example.com",
    "email.com",
    "domain.com",
    "yourdomain",
    "wordpress.com",
    "cloudflare",
    "akamai",
    "google.com",
    "gstatic.com",
    "w3.org",
    "png",
    "jpg",
    "jpeg",
    "webp",
    "svg",
    "gif",
)

EMAIL_RE = re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,24}\b", re.I)
PLACE_HINTS = (
    "sassafras",
    "state street",
    "peach street",
    "west ridge",
    "bayfront",
    "presque isle",
    "peninsula",
    "12th",
    "26th",
    "38th",
    "parade",
    "french street",
    "holland",
    "liberty",
    "buffalo road",
    "sterrettania",
    "pittsburgh avenue",
    "peach st",
    "state st",
    "north east",
    "harborcreek",
    "millcreek",
    "edinboro",
    "waterford",
    "corry",
    "fairview",
    "girard",
    "lake city",
    "union city",
    "albion",
)


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self._skip = False
        self.title = ""
        self._in_title = False
        self.h1 = ""
        self._in_h1 = False
        self.meta = ""
        self.mailtos: list[str] = []
        self.texts: list[str] = []
        self.links: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        ad = {k: (v or "") for k, v in attrs}
        if tag in {"script", "style", "noscript"}:
            self._skip = True
        if tag == "title":
            self._in_title = True
        if tag == "h1" and not self.h1:
            self._in_h1 = True
        if tag == "meta" and ad.get("name", "").lower() == "description":
            self.meta = ad.get("content", "").strip()
        if tag == "a":
            href = ad.get("href", "").strip()
            if href:
                self.links.append(href)
                if href.lower().startswith("mailto:"):
                    self.mailtos.append(href.split("?", 1)[0][7:])

    def handle_endtag(self, tag: str) -> None:
        if tag in {"script", "style", "noscript"}:
            self._skip = False
        if tag == "title":
            self._in_title = False
        if tag == "h1":
            self._in_h1 = False

    def handle_data(self, data: str) -> None:
        if self._skip:
            return
        text = re.sub(r"\s+", " ", data).strip()
        if not text:
            return
        if self._in_title and not self.title:
            self.title = text
        if self._in_h1 and not self.h1:
            self.h1 = text
        if len(self.texts) < 40 and len(text) > 24:
            self.texts.append(text)


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
    if any(part in host for part in CHAIN_PARTS):
        return None
    return f"{parsed.scheme}://{host}{parsed.path.rstrip('/')}"


def domain_key(url: str) -> str:
    host = (urlparse(url).hostname or url).lower()
    if host.startswith("www."):
        host = host[4:]
    return host


def registrable(host: str) -> str:
    parts = [p for p in host.lower().split(".") if p]
    if len(parts) >= 2:
        return ".".join(parts[-2:])
    return host.lower()


def good_email(addr: str, site_domain: str | None = None) -> str | None:
    value = urllib.parse.unquote(addr or "").strip().strip(".,;<>\"' ")
    value = value.split("?", 1)[0].lower()
    if not EMAIL_RE.fullmatch(value):
        return None
    if any(part in value for part in BAD_EMAIL_PARTS):
        return None
    local, _, host = value.partition("@")
    if not local or len(local) > 40:
        return None
    if host.endswith((".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".css", ".js")):
        return None
    if site_domain:
        site_reg = registrable(site_domain)
        host_reg = registrable(host)
        if host_reg != site_reg and host_reg not in {
            "gmail.com",
            "yahoo.com",
            "aol.com",
            "hotmail.com",
            "outlook.com",
            "icloud.com",
        }:
            # Allow a different business domain only when the page published it.
            # Still reject obvious vendors.
            if host_reg in {"godaddy.com", "wix.com", "squarespace.com", "shopify.com"}:
                return None
    return value


def overpass_query() -> str:
    south, west, north, east = ERIE_BBOX
    box = f"({south},{west},{north},{east})"
    return f"""
[out:json][timeout:180];
(
  nwr["website"]{box};
  nwr["contact:website"]{box};
  nwr["email"]{box};
  nwr["contact:email"]{box};
);
out tags;
""".strip()


def fetch_overpass() -> dict:
    data = urllib.parse.urlencode({"data": overpass_query()}).encode("utf-8")
    req = urllib.request.Request(
        OVERPASS,
        data=data,
        headers={"User-Agent": UA, "Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=200) as resp:
        return json.loads(resp.read().decode("utf-8"))


def category_of(tags: dict) -> str:
    for key in ("amenity", "shop", "office", "craft", "healthcare", "tourism", "leisure"):
        if tags.get(key):
            return f"{key}:{tags[key]}"
    return "unknown"


def city_of(tags: dict) -> str:
    return (tags.get("addr:city") or "").strip() or "Erie"


def keep_city(city: str) -> bool:
    value = (city or "").strip().lower()
    if not value:
        return True
    if value in PA_ERIE_CITIES:
        return True
    return "erie" in value


def record_from(element: dict) -> dict | None:
    tags = element.get("tags") or {}
    name = (tags.get("name") or "").strip()
    website = clean_url(tags.get("website") or tags.get("contact:website"))
    osm_email = good_email(tags.get("email") or tags.get("contact:email") or "")
    if not name:
        return None
    if not website and not osm_email:
        return None
    if website and any(part in domain_key(website) for part in CHAIN_PARTS):
        return None
    cat = category_of(tags)
    if cat.startswith(DROP_PREFIXES):
        return None
    city = city_of(tags)
    if not keep_city(city):
        return None
    domain = domain_key(website) if website else (osm_email.split("@", 1)[1] if osm_email else name.lower())
    rec = {
        "business": name,
        "market": "Erie",
        "city": city,
        "state": "PA",
        "officialUrl": website,
        "domain": domain,
        "category": cat,
        "phone": (tags.get("phone") or tags.get("contact:phone") or "").strip() or None,
        "email": osm_email,
        "emailStatus": "osm_published" if osm_email else "not_collected",
        "emailSource": "osm-contact-tag" if osm_email else None,
        "source": "openstreetmap-website-or-email-tag",
        "osmType": element.get("type"),
        "osmId": element.get("id"),
        "accessed": TODAY,
        "draftStatus": "unbuilt",
        "mailStatus": "unsent",
    }
    return rec


def fetch_page(url: str) -> tuple[int | None, str]:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (compatible; MomentumErieResearch/1.0)",
            "Accept": "text/html,application/xhtml+xml",
        },
        method="GET",
    )
    try:
        with urllib.request.urlopen(req, timeout=12, context=CTX) as resp:
            raw = resp.read(400_000)
            ctype = (resp.headers.get("Content-Type") or "").lower()
            if "html" not in ctype and not raw[:80].lstrip().lower().startswith((b"<!doctype", b"<html")):
                return resp.status, ""
            return resp.status, raw.decode("utf-8", errors="replace")
    except Exception:
        return None, ""


def contact_urls(base: str, links: list[str]) -> list[str]:
    found = [
        urljoin(base, "/contact"),
        urljoin(base, "/contact-us"),
        urljoin(base, "/contactus"),
        urljoin(base, "/about"),
        urljoin(base, "/about-us"),
        urljoin(base, "/pages/contact"),
    ]
    for href in links:
        low = href.lower()
        if any(token in low for token in ("contact", "about", "connect")):
            found.append(urljoin(base, href))
    out: list[str] = []
    seen: set[str] = set()
    for url in found:
        key = url.rstrip("/").lower()
        if key in seen:
            continue
        seen.add(key)
        out.append(url)
    return out[:6]


def extract_emails(text: str, site_domain: str) -> list[str]:
    found: list[str] = []
    seen: set[str] = set()
    for match in EMAIL_RE.findall(text or ""):
        addr = good_email(match, site_domain)
        if addr and addr not in seen:
            seen.add(addr)
            found.append(addr)
    return found


def rank_email(addr: str, site_domain: str) -> tuple[int, str]:
    host = addr.split("@", 1)[1]
    same = int(registrable(host) == registrable(site_domain))
    local = addr.split("@", 1)[0]
    preferred = int(local in {"info", "hello", "contact", "office", "admin", "owner", "sales"})
    return (-same, -preferred, addr)


def place_reason(business: str, city: str, blob: str) -> str:
    low = (blob or "").lower()
    for hint in PLACE_HINTS:
        if hint in low:
            return f"{hint} is one of the Erie places people here actually mean, and {business} is on it"
    if city and city.lower() != "erie":
        return f"{city} is still Erie to me, and {business} should be easier to find online"
    return f"{business} is an Erie name that should be easier to find online"


def observation(title: str, h1: str, meta: str, business: str) -> str:
    lead = h1 or title or meta
    lead = re.sub(r"\s+", " ", lead or "").strip()
    if lead and business.lower() not in lead.lower():
        return f"The live site leads with {lead}."
    if lead:
        return f"The live site already has the {business} story: {lead}."
    return f"I opened the live {business} site this week."


def inspect_site(row: dict) -> dict:
    url = row.get("officialUrl")
    out = dict(row)
    out["pageTitle"] = None
    out["pageH1"] = None
    out["pageMeta"] = None
    out["localPlaceReason"] = place_reason(row["business"], row.get("city") or "Erie", "")
    out["liveSiteObservation"] = f"I opened the live {row['business']} site this week."
    out["aiGap"] = (
        "What a visitor or an AI tool still has to assemble is the simple Erie version: "
        "what you do, who it is for, and why to call you first."
    )
    if not url:
        return out
    status, html = fetch_page(url)
    out["homeStatus"] = status
    if not html:
        out["fetchStatus"] = "home_failed"
        return out
    parser = PageParser()
    try:
        parser.feed(html)
    except Exception:
        pass
    blob = " ".join([parser.title, parser.h1, parser.meta, *parser.texts[:12], url])
    emails = extract_emails(html, row["domain"])
    emails.extend(good_email(m, row["domain"]) or "" for m in parser.mailtos)
    emails = [e for e in emails if e]
    extra_pages = []
    if not emails:
        extra_pages = contact_urls(url, parser.links)
        for extra in extra_pages:
            time.sleep(0.15)
            _, extra_html = fetch_page(extra)
            if not extra_html:
                continue
            emails.extend(extract_emails(extra_html, row["domain"]))
            extra_parser = PageParser()
            try:
                extra_parser.feed(extra_html)
            except Exception:
                extra_parser = None
            if extra_parser:
                emails.extend(good_email(m, row["domain"]) or "" for m in extra_parser.mailtos)
                blob += " " + " ".join([extra_parser.title, extra_parser.h1, *extra_parser.texts[:8]])
            if emails:
                break
    emails = sorted({e for e in emails if e}, key=lambda a: rank_email(a, row["domain"]))
    if emails and not out.get("email"):
        out["email"] = emails[0]
        out["emailStatus"] = "official_site_published"
        out["emailSource"] = "official-website"
    elif out.get("email") and out.get("emailStatus") == "osm_published":
        pass
    else:
        out["emailStatus"] = "none_published"
    out["candidateEmails"] = emails[:5]
    out["pageTitle"] = parser.title or None
    out["pageH1"] = parser.h1 or None
    out["pageMeta"] = parser.meta or None
    out["localPlaceReason"] = place_reason(row["business"], row.get("city") or "Erie", blob)
    out["liveSiteObservation"] = observation(parser.title, parser.h1, parser.meta, row["business"])
    out["fetchStatus"] = "ok"
    out["contactPagesTried"] = extra_pages
    return out


def load_seed() -> list[dict]:
    existing = json.loads((ROOT / "candidates.json").read_text(encoding="utf-8"))
    rows = [r for r in existing if r.get("market") == "Erie"]
    extras = [
        {
            "business": "Bay House Oyster Bar and Pier 6",
            "market": "Erie",
            "city": "Erie",
            "state": "PA",
            "officialUrl": "https://www.bayhousepier6.com",
            "domain": "bayhousepier6.com",
            "category": "amenity:restaurant",
            "phone": "+18144137440",
            "email": None,
            "emailStatus": "not_collected",
            "source": "first-party-site-inspection",
            "accessed": TODAY,
            "draftStatus": "previewed",
            "mailStatus": "unsent",
        }
    ]
    return extras + rows


def merge(rows: list[dict]) -> list[dict]:
    by_key: dict[str, dict] = {}
    for row in rows:
        url = row.get("officialUrl") or ""
        key = domain_key(url) if url else f"email:{(row.get('email') or row['business']).lower()}"
        current = by_key.get(key)
        if not current:
            by_key[key] = row
            continue
        if row.get("email") and not current.get("email"):
            current["email"] = row["email"]
            current["emailStatus"] = row.get("emailStatus")
            current["emailSource"] = row.get("emailSource")
        if not current.get("officialUrl") and row.get("officialUrl"):
            current["officialUrl"] = row["officialUrl"]
            current["domain"] = row.get("domain")
    return sorted(by_key.values(), key=lambda r: r["business"].lower())


def main() -> None:
    started = datetime.now(timezone.utc).isoformat()
    seed = load_seed()
    expanded: list[dict] = []
    overpass_error = None
    try:
        payload = fetch_overpass()
        for element in payload.get("elements", []):
            rec = record_from(element)
            if rec:
                expanded.append(rec)
    except Exception as exc:  # noqa: BLE001
        overpass_error = str(exc)

    merged = merge(expanded + seed)
    state_path = ROOT / "erie-collection-state.json"
    inspected: list[dict] = []
    total = len(merged)
    with ThreadPoolExecutor(max_workers=8) as pool:
        futures = {pool.submit(inspect_site, row): row for row in merged}
        for index, future in enumerate(as_completed(futures), start=1):
            row = futures[future]
            try:
                result = future.result()
            except Exception as exc:  # noqa: BLE001
                result = dict(row)
                result["fetchStatus"] = f"error:{exc}"
                result["emailStatus"] = row.get("emailStatus") or "none_published"
            inspected.append(result)
            print(f"{index}/{total} {result.get('domain') or result['business']} {result.get('emailStatus')}", flush=True)
            if index % 20 == 0:
                state_path.write_text(json.dumps(inspected, indent=2) + "\n", encoding="utf-8")

    sendable = [r for r in inspected if r.get("email") and r.get("emailStatus") in {"osm_published", "official_site_published"}]
    sendable = sendable[:180]
    summary = {
        "generatedAtUtc": started,
        "finishedAtUtc": datetime.now(timezone.utc).isoformat(),
        "overpassError": overpass_error,
        "expandedRows": len(expanded),
        "mergedRows": len(merged),
        "inspected": len(inspected),
        "sendable": len(sendable),
        "emailStatus": dict(Counter(r.get("emailStatus") for r in inspected)),
        "rule": "Published official-site or OSM contact emails only. No guessed mailboxes. Erie only.",
        "sends": 0,
    }
    (ROOT / "erie-inspected.json").write_text(json.dumps(inspected, indent=2) + "\n", encoding="utf-8")
    (ROOT / "erie-sendable.json").write_text(json.dumps(sendable, indent=2) + "\n", encoding="utf-8")
    (ROOT / "erie-collection-summary.json").write_text(json.dumps(summary, indent=2) + "\n", encoding="utf-8")
    state_path.write_text(json.dumps(inspected, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
