#!/usr/bin/env python3
"""Build a HubSpot-ready franchisee email list from Jason's Top 100 brands.

Rules (same as the Momentum 360 franchise playbook):
- Public first-party pages or unauthenticated brand locator dumps only.
- Never guess or pattern-derive an email.
- Keep source URL + access date on every row.
- Do not send outreach, create HubSpot records, or calendar-invite anyone.
"""

from __future__ import annotations

import csv
import hashlib
import json
import re
import time
from collections import Counter
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import urljoin, urlparse

import dns.exception
import dns.resolver
import openpyxl
import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
SOURCE_XLSX = ROOT / "source" / "HubSpot_Service_Franchise_Top_100.xlsx"
SOURCE_DIR = ROOT / "source"
OUTPUT_DIR = ROOT / "output"
SEAN_EXPANSION = (
    Path(r"C:\Users\dillo\Documents\Codex\projects\client-operations")
    / "clients/momentum-360/deliverables/2026-08-28-sean-franchise-email-expansion/final/new-franchise-emails.csv"
)
CACHE_DIR = ROOT / "harvest" / "cache"
ACCESSED = date.today().isoformat()
TIMEOUT = 20
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (compatible; Momentum360FranchiseResearch/1.0; "
        "+https://needmomentum.com)"
    )
}

EMAIL_RE = re.compile(
    r"\b[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}\b",
    re.IGNORECASE,
)
CONSUMER_DOMAINS = {
    "gmail.com",
    "yahoo.com",
    "hotmail.com",
    "outlook.com",
    "aol.com",
    "icloud.com",
    "msn.com",
    "live.com",
    "me.com",
    "comcast.net",
    "verizon.net",
    "att.net",
    "sbcglobal.net",
}
SKIP_LOCALS = {
    "noreply",
    "no-reply",
    "donotreply",
    "do-not-reply",
    "privacy",
    "webmaster",
    "hostmaster",
    "postmaster",
    "mailer-daemon",
    "wordpress",
    "wix",
    "example",
    "test",
    "spam",
}
SKIP_DOMAINS = {
    "example.com",
    "email.com",
    "sentry.io",
    "wixpress.com",
    "squarespace.com",
    "godaddy.com",
    "schema.org",
    "yourdomain.com",
    "domain.com",
    "emailprotection.outlook.com",
}
NEIGHBORLY_BRANDS = {
    "Neighborly",
    "Mr. Rooter Plumbing",
    "Mr. Electric",
    "Aire Serv",
    "Mr. Handyman",
    "Precision Garage Door Service",
    "One Hour Heating & Air Conditioning",
    "Benjamin Franklin Plumbing",
    "Mister Sparky",
    "Molly Maid",
    "Rainbow Restoration",
    "Glass Doctor",
    "The Grounds Guys",
}
KNOWN_JS_SHELLS = {
    "Five Star Painting",
    "SERVPRO",
    "Visiting Angels",
    "Senior Helpers",
    "Lawn Doctor",
    "Kitchen Tune-Up",
    "Budget Blinds",
    "Mosquito Joe",
    "Merry Maids",
    "Two Men and a Truck",
    "Amada Senior Care",
    "Pella Windows & Doors",
    "Renewal by Andersen",
    "PODS",
    "The Davey Tree Expert Company",
    "Interim HealthCare",
}


def clean(value: Any) -> str:
    if value is None:
        return ""
    return re.sub(r"\s+", " ", str(value)).strip()


def normalize_email(value: str) -> str:
    email = clean(value).strip(".,;:()[]<>\"'").lower()
    email = email.replace("%20", "").replace("&nbsp;", "")
    return email


def email_ok(email: str) -> bool:
    if not email or "@" not in email or email.count("@") != 1:
        return False
    local, domain = email.split("@", 1)
    if local in SKIP_LOCALS or domain in SKIP_DOMAINS:
        return False
    if any(token in local for token in ("noreply", "no-reply", "donotreply")):
        return False
    if domain.endswith(".png") or domain.endswith(".jpg") or domain.endswith(".svg"):
        return False
    if domain.endswith(".gov") or domain.endswith(".edu"):
        return False
    return bool(EMAIL_RE.fullmatch(email))


def email_type(email: str) -> str:
    domain = email.split("@", 1)[1]
    if domain in CONSUMER_DOMAINS:
        return "published_personal_mailbox"
    local = email.split("@", 1)[0]
    if re.match(r"^[a-z]+[._][a-z]+$", local):
        return "named_mailbox"
    return "location_mailbox"


def session() -> requests.Session:
    sess = requests.Session()
    sess.headers.update(HEADERS)
    adapter = requests.adapters.HTTPAdapter(max_retries=1, pool_maxsize=16)
    sess.mount("https://", adapter)
    sess.mount("http://", adapter)
    return sess


SESS = session()


def cache_path(url: str, suffix: str) -> Path:
    digest = hashlib.sha1(url.encode("utf-8")).hexdigest()
    return CACHE_DIR / f"{digest}{suffix}"


def fetch(url: str, *, accept: str | None = None, as_json: bool = False) -> Any:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    suffix = ".json" if as_json else ".html"
    path = cache_path(url, suffix)
    if path.exists() and path.stat().st_size > 0:
        raw = path.read_bytes()
        if as_json:
            return json.loads(raw.decode("utf-8", errors="replace"))
        return raw.decode("utf-8", errors="replace")
    headers = dict(HEADERS)
    if accept:
        headers["Accept"] = accept
    try:
        resp = SESS.get(url, headers=headers, timeout=TIMEOUT, allow_redirects=True)
    except requests.RequestException as exc:
        return {"_error": str(exc), "_url": url, "_status": 0} if as_json else ""
    if resp.status_code >= 400:
        return (
            {"_error": f"http_{resp.status_code}", "_url": url, "_status": resp.status_code}
            if as_json
            else ""
        )
    path.write_bytes(resp.content)
    if as_json:
        try:
            return resp.json()
        except ValueError:
            return {"_error": "invalid_json", "_url": url, "_status": resp.status_code}
    return resp.text


def load_brands() -> list[dict[str, str]]:
    wb = openpyxl.load_workbook(SOURCE_XLSX, data_only=True)
    ws = wb.active
    rows = list(ws.iter_rows(values_only=True))
    header = [clean(v) for v in rows[0]]
    brands = []
    for raw in rows[1:]:
        rec = {header[i]: clean(raw[i]) if i < len(raw) else "" for i in range(len(header))}
        if rec.get("Company Name"):
            brands.append(rec)
    return brands


def write_brand_index(brands: list[dict[str, str]]) -> None:
    SOURCE_DIR.mkdir(parents=True, exist_ok=True)
    path = SOURCE_DIR / "brand-index.csv"
    fields = [
        "Company Name",
        "CONTACT IN HUBSPOT",
        "Company domain name",
        "Industry",
        "Franchise Type",
        "Estimated Locations",
        "Lead Status",
        "Lifecycle Stage",
        "Lead Source",
        "Priority",
        "Owner",
        "Target Service",
        "harvest_lane",
    ]
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        for brand in brands:
            row = dict(brand)
            name = brand["Company Name"]
            if name in NEIGHBORLY_BRANDS:
                row["harvest_lane"] = "skip_neighborly_js_locator"
            elif name in KNOWN_JS_SHELLS:
                row["harvest_lane"] = "skip_known_js_shell"
            else:
                row["harvest_lane"] = "probe"
            writer.writerow(row)


def walk_json_emails(payload: Any, source_url: str, brand: dict[str, str], mechanism: str) -> list[dict[str, str]]:
    found: list[dict[str, str]] = []

    def consider(obj: dict[str, Any]) -> None:
        blob = json.dumps(obj, ensure_ascii=False)
        emails = {normalize_email(m) for m in EMAIL_RE.findall(blob)}
        emails = {e for e in emails if email_ok(e)}
        if not emails:
            return
        name = (
            obj.get("name")
            or obj.get("outlet")
            or obj.get("title")
            or obj.get("officeName")
            or obj.get("locationName")
            or obj.get("franchiseName")
            or ""
        )
        city = obj.get("city") or obj.get("locality") or obj.get("town") or ""
        state = obj.get("state") or obj.get("region") or obj.get("province") or ""
        phone = obj.get("phone") or obj.get("telephone") or obj.get("phoneNumber") or ""
        website = (
            obj.get("website")
            or obj.get("url")
            or obj.get("permalink")
            or obj.get("site")
            or ""
        )
        contact_name = (
            obj.get("owner")
            or obj.get("ownerName")
            or obj.get("contactName")
            or obj.get("manager")
            or ""
        )
        if isinstance(state, dict):
            state = state.get("abbreviation") or state.get("name") or ""
        if isinstance(city, dict):
            city = city.get("name") or ""
        for email in sorted(emails):
            found.append(
                make_row(
                    brand,
                    business_name=clean(name) or f"{brand['Company Name']} location",
                    contact_name=clean(contact_name),
                    email=email,
                    city=clean(city),
                    state=clean(state),
                    phone=clean(phone),
                    website=clean(website) or f"https://{brand['Company domain name']}",
                    source=mechanism,
                    source_url=source_url,
                    role_type="Franchise office",
                )
            )

    def walk(node: Any) -> None:
        if isinstance(node, dict):
            keys = {str(k).lower() for k in node.keys()}
            if any("email" in k for k in keys) or any(
                isinstance(v, str) and "@" in v for v in node.values() if not isinstance(v, (dict, list))
            ):
                consider(node)
            for value in node.values():
                walk(value)
        elif isinstance(node, list):
            for item in node:
                walk(item)

    walk(payload)
    return found


def make_row(
    brand: dict[str, str],
    *,
    business_name: str,
    contact_name: str,
    email: str,
    city: str,
    state: str,
    phone: str,
    website: str,
    source: str,
    source_url: str,
    role_type: str,
) -> dict[str, str]:
    first, last = split_name(contact_name)
    return {
        "email": email,
        "firstname": first,
        "lastname": last,
        "company": business_name,
        "phone": phone,
        "website": website,
        "city": city,
        "state": normalize_state(state),
        "jobtitle": role_type,
        "lifecyclestage": brand.get("Lifecycle Stage") or "lead",
        "hs_lead_status": brand.get("Lead Status") or "NEW",
        "hs_lead_source": brand.get("Lead Source") or "Franchise Outreach",
        "hubspot_owner": brand.get("Owner") or "Jason Fallon",
        "priority": brand.get("Priority") or "",
        "industry": brand.get("Industry") or "",
        "franchise_brand": brand["Company Name"],
        "franchise_type": brand.get("Franchise Type") or "",
        "target_service": brand.get("Target Service") or "",
        "brand_domain": brand.get("Company domain name") or "",
        "contact_name": contact_name,
        "role_type": role_type,
        "email_type": email_type(email),
        "source": source,
        "source_url": source_url,
        "accessed": ACCESSED,
        "region_priority": region_priority(normalize_state(state)),
        "notes": (
            "Public first-party franchisee/office mailbox. Not sent. "
            "No calendar invite. Ready for Jason HubSpot list upload."
        ),
    }


def split_name(value: str) -> tuple[str, str]:
    value = clean(value)
    if not value or value.lower() in {"team", "office", "owner", "local office"}:
        return "", ""
    if ";" in value:
        value = value.split(";", 1)[0]
    parts = value.replace(",", " ").split()
    if len(parts) == 1:
        return parts[0], ""
    return parts[0], " ".join(parts[1:])


def normalize_state(value: str) -> str:
    value = clean(value)
    aliases = {
        "pennsylvania": "PA",
        "new jersey": "NJ",
        "delaware": "DE",
        "new york": "NY",
        "maryland": "MD",
        "ohio": "OH",
        "virginia": "VA",
        "west virginia": "WV",
        "florida": "FL",
        "texas": "TX",
        "california": "CA",
        "ontario": "ON",
        "quebec": "QC",
        "british columbia": "BC",
    }
    if len(value) == 2:
        return value.upper()
    return aliases.get(value.lower(), value)


def region_priority(state: str) -> str:
    if state in {"PA", "NJ", "DE"}:
        return "PA_NJ_DE"
    if state in {"ON", "QC", "BC", "AB", "MB", "SK", "NS", "NB", "NL", "PE", "YT", "NT", "NU"}:
        return "CANADA_HOLD"
    if re.search(r"canada|ontario|quebec", state, re.I):
        return "CANADA_HOLD"
    return "US_OTHER"


def harvest_prior_verified(brand: dict[str, str]) -> list[dict[str, str]]:
    if not SEAN_EXPANSION.exists():
        return []
    rows: list[dict[str, str]] = []
    with SEAN_EXPANSION.open(encoding="utf-8", newline="") as handle:
        for rec in csv.DictReader(handle):
            if clean(rec.get("Franchise Brand")) != brand["Company Name"]:
                continue
            email = normalize_email(rec.get("Email") or "")
            if not email_ok(email):
                continue
            rows.append(
                make_row(
                    brand,
                    business_name=clean(rec.get("Business Name")),
                    contact_name=clean(rec.get("Contact Name")),
                    email=email,
                    city=clean(rec.get("City")),
                    state=clean(rec.get("State")),
                    phone=clean(rec.get("Phone")),
                    website=clean(rec.get("Website")) or f"https://{brand['Company domain name']}",
                    source="Verified 2026-08-28 first-party franchisee harvest",
                    source_url=clean(rec.get("Source URL")) or clean(rec.get("Website")),
                    role_type=clean(rec.get("Role Type")) or "Franchise office",
                )
            )
    return rows


def harvest_certapro(brand: dict[str, str]) -> list[dict[str, str]]:
    url = "https://certapro.com/wp-json/certapro-location-profiles/v1/profiles"
    payload = fetch(url, accept="application/json", as_json=True)
    if not isinstance(payload, (list, dict)) or (isinstance(payload, dict) and payload.get("_error")):
        return []
    return walk_json_emails(payload, url, brand, "CertaPro location-profiles dump")


def harvest_comfort_keepers(brand: dict[str, str]) -> list[dict[str, str]]:
    url = "https://ckficms-api.ckweb.org/api/states?filter[include]=offices"
    payload = fetch(url, accept="application/json", as_json=True)
    if not isinstance(payload, (list, dict)) or (isinstance(payload, dict) and payload.get("_error")):
        return []
    return walk_json_emails(payload, url, brand, "Comfort Keepers offices API")


def harvest_packouts_if_present(brand: dict[str, str]) -> list[dict[str, str]]:
    url = "https://www.1800packouts.com/locations/"
    html = fetch(url)
    return emails_from_html(html, url, brand, "1-800-PACKOUTS locations HTML")


def emails_from_html(
    html: str,
    url: str,
    brand: dict[str, str],
    mechanism: str,
    *,
    business_name: str = "",
    city: str = "",
    state: str = "",
    phone: str = "",
) -> list[dict[str, str]]:
    if not html:
        return []
    soup = BeautifulSoup(html, "html.parser")
    text = soup.get_text(" ", strip=True)
    mailto = [
        normalize_email(a.get("href", "").split(":", 1)[-1])
        for a in soup.select("a[href^=mailto]")
    ]
    printed = [normalize_email(m) for m in EMAIL_RE.findall(text)]
    json_ld_emails: list[str] = []
    for script in soup.select('script[type="application/ld+json"]'):
        try:
            data = json.loads(script.string or "")
        except (TypeError, ValueError):
            continue
        json_ld_emails.extend(
            normalize_email(m) for m in EMAIL_RE.findall(json.dumps(data))
        )
    emails = {e for e in mailto + printed + json_ld_emails if email_ok(e)}
    name = business_name or page_name(soup, brand["Company Name"])
    loc_city, loc_state, loc_phone = page_geo(soup)
    rows = []
    for email in sorted(emails):
        rows.append(
            make_row(
                brand,
                business_name=name,
                contact_name=page_contact_name(soup),
                email=email,
                city=city or loc_city,
                state=state or loc_state,
                phone=phone or loc_phone,
                website=url,
                source=mechanism,
                source_url=url,
                role_type="Franchise office",
            )
        )
    return rows


def page_name(soup: BeautifulSoup, fallback: str) -> str:
    title = clean(soup.title.string if soup.title else "")
    h1 = clean(soup.find("h1").get_text(" ", strip=True) if soup.find("h1") else "")
    return h1 or title.split("|")[0].strip() or fallback


def page_contact_name(soup: BeautifulSoup) -> str:
    for selector in [".owner", ".team-member", ".franchisee", "[class*=owner]"]:
        node = soup.select_one(selector)
        if node:
            text = clean(node.get_text(" ", strip=True))
            if 2 <= len(text.split()) <= 6:
                return text
    return ""


def page_geo(soup: BeautifulSoup) -> tuple[str, str, str]:
    text = soup.get_text(" ", strip=True)
    phone_match = re.search(r"\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}", text)
    state_match = re.search(r"\b([A-Z]{2})\b", text)
    city = ""
    address = soup.select_one("[class*=city], .locality, [itemprop=addressLocality]")
    if address:
        city = clean(address.get_text(" ", strip=True))
    return city, state_match.group(1) if state_match else "", phone_match.group(0) if phone_match else ""


def discover_wp_json(domain: str) -> tuple[str, Any]:
    url = f"https://{domain}/wp-json/"
    payload = fetch(url, accept="application/json", as_json=True)
    return url, payload


def promising_routes(index_payload: Any) -> list[str]:
    routes: list[str] = []
    if not isinstance(index_payload, dict):
        return routes
    namespaces = index_payload.get("routes") or {}
    if not isinstance(namespaces, dict):
        return routes
    keywords = ("location", "profile", "franchise", "office", "store", "locator", "dealer")
    for route, meta in namespaces.items():
        route_l = str(route).lower()
        if not any(k in route_l for k in keywords):
            continue
        methods = []
        if isinstance(meta, dict):
            methods = [m.upper() for m in meta.get("methods", [])]
        if methods and "GET" not in methods:
            continue
        if "<" in route or "(" in route:
            continue
        routes.append(route)
    return routes[:12]


def harvest_wp_json_routes(brand: dict[str, str]) -> list[dict[str, str]]:
    domain = brand["Company domain name"]
    index_url, index_payload = discover_wp_json(domain)
    if not isinstance(index_payload, dict) or index_payload.get("_error"):
        return []
    rows: list[dict[str, str]] = []
    for route in promising_routes(index_payload):
        url = urljoin(f"https://{domain}", route)
        payload = fetch(url, accept="application/json", as_json=True)
        if isinstance(payload, dict) and payload.get("_error"):
            continue
        got = walk_json_emails(payload, url, brand, f"wp-json {route}")
        if got:
            rows.extend(got)
            break
    return rows


def sitemap_urls(domain: str) -> list[str]:
    candidates = [
        f"https://{domain}/sitemap.xml",
        f"https://{domain}/sitemap_index.xml",
        f"https://www.{domain}/sitemap.xml",
        f"https://{domain}/location-sitemap.xml",
        f"https://{domain}/locations-sitemap.xml",
        f"https://{domain}/page-sitemap.xml",
    ]
    found: list[str] = []
    seen: set[str] = set()
    for url in candidates:
        xml = fetch(url)
        if not xml or "<url>" not in xml and "<sitemap>" not in xml:
            continue
        locs = re.findall(r"<loc>\s*([^<]+)\s*</loc>", xml, flags=re.I)
        child_sitemaps = [u.strip() for u in locs if "sitemap" in u.lower()]
        for child in child_sitemaps[:8]:
            if "image" in child or "video" in child:
                continue
            child_xml = fetch(child)
            locs.extend(re.findall(r"<loc>\s*([^<]+)\s*</loc>", child_xml or "", flags=re.I))
        for loc in locs:
            loc = loc.strip()
            if loc.endswith(".xml"):
                continue
            if loc not in seen:
                seen.add(loc)
                found.append(loc)
        if found:
            break
    return found


def locationish(url: str) -> bool:
    path = urlparse(url).path.lower()
    blocked = (
        "/blog",
        "/news",
        "/resource",
        "/resources",
        "/wp-content",
        "/category",
        "/tag",
        "/author",
        "/privacy",
        "/terms",
        "/career",
        "/job",
        "/franchise-opportunit",
        "/own-a",
    )
    if any(k in path for k in blocked):
        return False
    keys = (
        "/location",
        "/locations/",
        "/offices",
        "/office/",
        "/find-a",
        "/find-us",
        "/local/",
        "/territory",
        "/stores/",
        "/store/",
        "/branches",
        "/meet-the",
        "/our-team",
        "/owners",
        "/contact-us",
        "/contact/",
    )
    return any(k in path for k in keys)


def harvest_sitemap_pages(brand: dict[str, str], *, sample_first: int = 4, cap: int = 40) -> list[dict[str, str]]:
    domain = brand["Company domain name"]
    urls = [u for u in sitemap_urls(domain) if locationish(u)]
    if not urls:
        return []
    # Prefer contact/about/team pages over generic location indexes.
    urls.sort(
        key=lambda u: (
            0 if any(x in u.lower() for x in ("contact", "about", "team", "owner", "meet")) else 1,
            len(u),
        )
    )
    sample = urls[:sample_first]
    sample_rows: list[dict[str, str]] = []
    for url in sample:
        html = fetch(url)
        sample_rows.extend(emails_from_html(html, url, brand, "sitemap location/contact page"))
        time.sleep(0.15)
    unique_sample = {r["email"] for r in sample_rows}
    if not unique_sample:
        return []
    # One mailbox on every sampled page is almost always a corporate/sitewide address.
    if len(unique_sample) == 1 and len(sample_rows) >= 3:
        row = dict(sample_rows[0])
        row["role_type"] = "Corporate or sitewide mailbox"
        row["email_type"] = "corporate_sitewide"
        row["notes"] = (
            "Printed on multiple location pages; treated as one corporate/sitewide mailbox, not a franchisee list."
        )
        return [row]
    rows = list(sample_rows)
    if len(urls) > sample_first:
        for url in urls[sample_first:cap]:
            html = fetch(url)
            rows.extend(emails_from_html(html, url, brand, "sitemap location/contact page"))
            time.sleep(0.12)
    return rows


def harvest_static_known(brand: dict[str, str]) -> list[dict[str, str]]:
    domain = brand["Company domain name"]
    name = brand["Company Name"]
    rows: list[dict[str, str]] = []
    if name == "Mosquito Squad":
        rows.extend(harvest_mosquito_squad(brand))
    if name == "Mighty Dog Roofing":
        url = "https://www.mightydogroofing.com/locations/"
        html = fetch(url)
        index_rows = emails_from_html(html, url, brand, "Mighty Dog locations page")
        unique = {r["email"] for r in index_rows}
        if len(unique) <= 1:
            rows.extend(index_rows[:1])
        else:
            rows.extend(index_rows)
            for contact in extract_links(html, url, ("contact", "location"))[:40]:
                rows.extend(
                    emails_from_html(
                        fetch(contact), contact, brand, "Mighty Dog location contact page"
                    )
                )
                time.sleep(0.12)
    if name == "PuroClean":
        rows.extend(harvest_brand_sitemap_or_locations(brand, extra=["https://www.puroclean.com/locations/"]))
    if name == "HomeWell Care Services":
        rows.extend(
            harvest_brand_sitemap_or_locations(
                brand,
                extra=[
                    "https://www.homewellcares.com/locations/",
                    "https://homewellcares.com/locations/",
                ],
            )
        )
    if name == "ComForCare":
        rows.extend(harvest_brand_sitemap_or_locations(brand, extra=[f"https://{domain}/locations/"]))
    if name in {"Fresh Coat Painters", "Ace Handyman Services", "House Doctors"}:
        rows.extend(harvest_brand_sitemap_or_locations(brand))
    if name == "1-800 WATER DAMAGE":
        rows.extend(
            harvest_brand_sitemap_or_locations(
                brand, extra=["https://www.1800waterdamage.com/locations/"]
            )
        )
    if name == "Blue Kangaroo Packoutz":
        payload = fetch(
            "https://www.bluekangaroopackoutz.com/wp-json/belfor/v1/locations",
            accept="application/json",
            as_json=True,
        )
        rows.extend(
            walk_json_emails(
                payload,
                "https://www.bluekangaroopackoutz.com/wp-json/belfor/v1/locations",
                brand,
                "Blue Kangaroo belfor locations dump",
            )
        )
    return rows


def extract_links(html: str, base: str, keys: tuple[str, ...]) -> list[str]:
    if not html:
        return []
    soup = BeautifulSoup(html, "html.parser")
    out: list[str] = []
    seen: set[str] = set()
    for a in soup.select("a[href]"):
        href = urljoin(base, a.get("href", ""))
        if not href.startswith("http"):
            continue
        if any(k in href.lower() for k in keys) and href not in seen:
            seen.add(href)
            out.append(href)
    return out


def harvest_brand_sitemap_or_locations(brand: dict[str, str], extra: list[str] | None = None) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    for url in extra or []:
        html = fetch(url)
        rows.extend(emails_from_html(html, url, brand, "brand locations page"))
        for contact in extract_links(html, url, ("contact", "about", "team", "location"))[:40]:
            rows.extend(emails_from_html(fetch(contact), contact, brand, "brand location subpage"))
            time.sleep(0.12)
    rows.extend(harvest_sitemap_pages(brand))
    return rows


def harvest_mosquito_squad(brand: dict[str, str]) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    sitemap_pages = sitemap_urls("mosquitosquad.com") or sitemap_urls("www.mosquitosquad.com")
    territory = [
        u
        for u in sitemap_pages
        if urlparse(u).path.strip("/").count("/") >= 0
        and not any(x in u.lower() for x in ("blog", "wp-content", "category", "tag", "privacy"))
    ]
    # Prefer contact-us URLs; synthesize them from territory homes.
    targets: list[str] = []
    seen: set[str] = set()
    for url in territory:
        path = urlparse(url).path.rstrip("/")
        if not path or path == "":
            continue
        if "contact" in path:
            candidate = url
        else:
            candidate = url.rstrip("/") + "/contact-us/"
        if candidate not in seen:
            seen.add(candidate)
            targets.append(candidate)
    if not targets:
        html = fetch("https://www.mosquitosquad.com/locations/")
        targets = extract_links(html, "https://www.mosquitosquad.com/locations/", ("/",))[:200]
        targets = [t.rstrip("/") + "/contact-us/" for t in targets]
    for url in targets[:180]:
        html = fetch(url)
        got = emails_from_html(html, url, brand, "Mosquito Squad contact-us page")
        rows.extend(got)
        time.sleep(0.12)
    return rows


def dns_mail_status(domain: str) -> str:
    resolver = dns.resolver.Resolver(configure=True)
    resolver.timeout = 2.0
    resolver.lifetime = 3.0
    try:
        answers = resolver.resolve(domain, "MX")
        if any(str(answer.exchange).strip(".") for answer in answers):
            return "mx_ok"
    except dns.resolver.NoAnswer:
        pass
    except dns.resolver.NXDOMAIN:
        return "unresolved"
    except dns.exception.Timeout:
        return "unknown_timeout"
    except dns.exception.DNSException:
        pass
    try:
        resolver.resolve(domain, "A")
        return "a_only"
    except Exception:
        return "unresolved"


def mx_map(emails: list[str]) -> dict[str, str]:
    domains = sorted({e.split("@", 1)[1] for e in emails})
    out: dict[str, str] = {}
    with ThreadPoolExecutor(max_workers=8) as pool:
        future_map = {pool.submit(dns_mail_status, domain): domain for domain in domains}
        for future in as_completed(future_map):
            domain = future_map[future]
            try:
                out[domain] = future.result()
            except Exception:
                out[domain] = "unknown_timeout"
    return out


def dedupe(rows: list[dict[str, str]]) -> list[dict[str, str]]:
    best: dict[str, dict[str, str]] = {}
    rank = {"PA_NJ_DE": 0, "US_OTHER": 1, "CANADA_HOLD": 2}

    def score(row: dict[str, str]) -> tuple:
        return (
            rank.get(row.get("region_priority") or "US_OTHER", 9),
            0 if row.get("email_type") == "named_mailbox" else 1,
            0 if row.get("contact_name") else 1,
            row.get("email") or "",
        )

    for row in rows:
        email = row["email"]
        current = best.get(email)
        if current is None or score(row) < score(current):
            best[email] = row
    return sorted(best.values(), key=score)


def harvest_brand(brand: dict[str, str]) -> tuple[str, list[dict[str, str]], str]:
    name = brand["Company Name"]
    rows: list[dict[str, str]] = harvest_prior_verified(brand)
    note = "probed"
    if name == "CertaPro Painters":
        rows.extend(harvest_certapro(brand))
        note = "certapro_profiles_dump"
    elif name == "Comfort Keepers":
        rows.extend(harvest_comfort_keepers(brand))
        note = "comfort_keepers_offices_api"
    elif name in NEIGHBORLY_BRANDS:
        note = "skipped_neighborly_js_locator"
    elif name in KNOWN_JS_SHELLS:
        extra = harvest_wp_json_routes(brand)
        rows.extend(extra)
        note = "js_shell_plus_prior" if rows else "js_shell_wpjson_only"
    else:
        rows.extend(harvest_static_known(brand))
        if not rows:
            rows.extend(harvest_wp_json_routes(brand))
        if not rows:
            rows.extend(harvest_sitemap_pages(brand))
        note = "adapter_or_probe"
    return name, rows, note


def write_csv(path: Path, rows: list[dict[str, str]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fields = [
        "email",
        "firstname",
        "lastname",
        "company",
        "phone",
        "website",
        "city",
        "state",
        "jobtitle",
        "lifecyclestage",
        "hs_lead_status",
        "hs_lead_source",
        "hubspot_owner",
        "priority",
        "industry",
        "franchise_brand",
        "franchise_type",
        "target_service",
        "brand_domain",
        "contact_name",
        "role_type",
        "email_type",
        "source",
        "source_url",
        "accessed",
        "region_priority",
        "mx_status",
        "notes",
    ]
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        for row in rows:
            writer.writerow(row)


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    brands = load_brands()
    write_brand_index(brands)
    receipts: list[dict[str, Any]] = []
    all_rows: list[dict[str, str]] = []

    # Sequential by brand keeps locator sites from being hammered.
    for brand in brands:
        started = time.time()
        try:
            name, rows, note = harvest_brand(brand)
        except Exception as exc:
            name = brand["Company Name"]
            rows = []
            note = f"error:{type(exc).__name__}"
            print(f"{name}: ERROR {exc}", flush=True)
        elapsed = round(time.time() - started, 2)
        unique = len({r["email"] for r in rows})
        receipts.append(
            {
                "brand": name,
                "domain": brand["Company domain name"],
                "priority": brand.get("Priority"),
                "note": note,
                "rows": len(rows),
                "unique_emails": unique,
                "seconds": elapsed,
            }
        )
        all_rows.extend(rows)
        print(f"{name}: {unique} unique / {len(rows)} rows ({note}, {elapsed}s)", flush=True)

    deduped = dedupe(all_rows)
    status_by_domain = mx_map([r["email"] for r in deduped]) if deduped else {}
    for row in deduped:
        row["mx_status"] = status_by_domain.get(row["email"].split("@", 1)[1], "unresolved")

    sendable = [
        r
        for r in deduped
        if r["mx_status"] == "mx_ok"
        and r["region_priority"] != "CANADA_HOLD"
        and r.get("email_type") != "corporate_sitewide"
    ]
    corporate = [r for r in deduped if r.get("email_type") == "corporate_sitewide" and r["mx_status"] == "mx_ok"]
    canada = [r for r in deduped if r["region_priority"] == "CANADA_HOLD"]
    rejected_mx = [r for r in deduped if r["mx_status"] != "mx_ok"]

    write_csv(OUTPUT_DIR / "franchisee-emails-hubspot-import.csv", sendable)
    write_csv(OUTPUT_DIR / "corporate-sitewide-hold.csv", corporate)
    write_csv(OUTPUT_DIR / "franchisee-emails-canada-hold.csv", canada)
    write_csv(OUTPUT_DIR / "franchisee-emails-mx-rejected.csv", rejected_mx)

    brand_counts = Counter(r["franchise_brand"] for r in sendable)
    region_counts = Counter(r["region_priority"] for r in sendable)
    type_counts = Counter(r["email_type"] for r in sendable)
    qa = {
        "generatedAt": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
        "sourceWorkbook": str(SOURCE_XLSX.name),
        "brandCount": len(brands),
        "rawRows": len(all_rows),
        "uniqueEmails": len(deduped),
        "hubspotImportRows": len(sendable),
        "corporateHold": len(corporate),
        "canadaHold": len(canada),
        "mxRejected": len(rejected_mx),
        "namedMailbox": type_counts.get("named_mailbox", 0),
        "paNjDe": region_counts.get("PA_NJ_DE", 0),
        "byBrand": dict(brand_counts.most_common()),
        "byEmailType": dict(type_counts),
        "byRegion": dict(region_counts),
        "receipts": receipts,
        "rules": {
            "guessedEmails": False,
            "outreachSent": False,
            "hubspotMutated": False,
            "calendarInvites": False,
        },
    }
    (OUTPUT_DIR / "qa-summary.json").write_text(json.dumps(qa, indent=2), encoding="utf-8")
    print(
        f"DONE import={len(sendable)} unique={len(deduped)} canada={len(canada)} mx_reject={len(rejected_mx)}",
        flush=True,
    )


if __name__ == "__main__":
    main()
