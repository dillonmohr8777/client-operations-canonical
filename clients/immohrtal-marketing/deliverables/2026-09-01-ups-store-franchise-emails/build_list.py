from __future__ import annotations

import csv
import json
import re
import socket
import subprocess
import time
import urllib.request
from collections import Counter
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CACHE = ROOT / "_cache"
SITEMAP_DIR = CACHE / "sitemaps"
TODAY = date.today().isoformat()
SOURCE = "https://locations.theupsstore.com/"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
GENERIC_LOCALS = {
    "info",
    "support",
    "help",
    "noreply",
    "no-reply",
    "donotreply",
    "webmaster",
    "privacy",
    "legal",
    "careers",
    "jobs",
    "press",
    "media",
    "franchise",
    "franchising",
    "corporate",
    "hq",
}
US_STATES = {
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID",
    "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO",
    "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA",
    "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
}
FIELDNAMES = [
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


def fetch(url: str, dest: Path | None = None, retries: int = 3) -> str:
    last_error = None
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "text/html,application/xml"})
            with urllib.request.urlopen(req, timeout=25) as resp:
                body = resp.read()
            text = body.decode("utf-8", errors="replace")
            if dest:
                dest.parent.mkdir(parents=True, exist_ok=True)
                dest.write_bytes(body)
            return text
        except Exception as exc:
            last_error = exc
            time.sleep(1.5 * (attempt + 1))
    raise RuntimeError(f"fetch failed {url}: {last_error}")


def store_urls() -> list[str]:
    SITEMAP_DIR.mkdir(parents=True, exist_ok=True)
    index = fetch("https://locations.theupsstore.com/sitemap.xml", SITEMAP_DIR / "index.xml")
    maps = re.findall(r"<loc>(https://locations\.theupsstore\.com/sitemap\d+\.xml)</loc>", index)
    found: set[str] = set()
    for sitemap_url in maps:
        name = sitemap_url.rsplit("/", 1)[-1]
        path = SITEMAP_DIR / name
        text = path.read_text(encoding="utf-8", errors="replace") if path.exists() else fetch(sitemap_url, path)
        for url in re.findall(r"<loc>(.*?)</loc>", text):
            match = re.fullmatch(
                r"https://locations\.theupsstore\.com/([a-z]{2})/([a-z0-9-]+)/([a-z0-9-]+)",
                url,
            )
            if not match or match.group(1) == "es":
                continue
            found.add(url)
    return sorted(found)


def first_group(pattern: str, text: str) -> str:
    match = re.search(pattern, text, re.I)
    return (match.group(1) if match else "").strip()


def extract_record(url: str, html: str) -> dict | None:
    email = first_group(r"(store\d+@theupsstore\.com)", html).lower()
    if not email:
        email = first_group(r'"email"\s*:\s*"([^"]+@theupsstore\.com)"', html).lower()
    if not email or "@" not in email:
        return None
    country = first_group(r'"addressCountry"\s*:\s*"([A-Za-z]{2,})"', html)
    if not country:
        country = first_group(r'"addressCountry"\s*:\s*\{[^}]*?"name"\s*:\s*"([^"]+)"', html)
    return {
        "url": url,
        "email": email,
        "phone": first_group(r'"telephone"\s*:\s*"([^"]+)"', html),
        "city": first_group(r'"addressLocality"\s*:\s*"([^"]+)"', html),
        "state": first_group(r'"addressRegion"\s*:\s*"([^"]+)"', html).upper(),
        "street": first_group(r'"streetAddress"\s*:\s*"([^"]+)"', html),
        "country": country.upper(),
    }


def harvest_one(url: str) -> dict | None:
    html = fetch(url)
    return extract_record(url, html)


def mx_status(domain: str, cache: dict[str, str]) -> str:
    domain = domain.lower()
    if domain in cache:
        return cache[domain]
    try:
        proc = subprocess.run(
            ["nslookup", "-type=MX", domain],
            capture_output=True,
            text=True,
            timeout=15,
        )
        text = (proc.stdout or "") + (proc.stderr or "")
        status = "mx_ok" if re.search(r"mail exchanger|MX preference", text, re.I) else "mx_fail"
        if status == "mx_fail":
            socket.getaddrinfo(domain, None)
            if re.search(r"MX", text):
                status = "mx_ok"
        cache[domain] = status
        return status
    except Exception:
        cache[domain] = "mx_fail"
        return "mx_fail"


def main() -> None:
    CACHE.mkdir(parents=True, exist_ok=True)
    jsonl_path = CACHE / "locations.jsonl"
    existing: dict[str, dict] = {}
    if jsonl_path.exists():
        for line in jsonl_path.read_text(encoding="utf-8").splitlines():
            if not line.strip():
                continue
            rec = json.loads(line)
            existing[rec["url"]] = rec
    urls = store_urls()
    pending = [url for url in urls if url not in existing]
    print("store urls", len(urls), "cached", len(existing), "pending", len(pending), flush=True)
    with jsonl_path.open("a", encoding="utf-8") as handle:
        with ThreadPoolExecutor(max_workers=12) as pool:
            futures = {pool.submit(harvest_one, url): url for url in pending}
            done = 0
            for future in as_completed(futures):
                url = futures[future]
                done += 1
                try:
                    rec = future.result()
                except Exception as exc:
                    rec = {"url": url, "error": str(exc)}
                if rec:
                    existing[url] = rec
                    handle.write(json.dumps(rec, ensure_ascii=True) + "\n")
                    handle.flush()
                if done % 50 == 0 or done == len(pending):
                    print("harvested", done, "/", len(pending), flush=True)

    usable = []
    for rec in existing.values():
        email = (rec.get("email") or "").strip().lower()
        if not email or "@" not in email or rec.get("error"):
            continue
        local, domain = email.split("@", 1)
        if local in GENERIC_LOCALS:
            continue
        country = (rec.get("country") or "").upper()
        state = (rec.get("state") or "").upper()
        if country and country not in {"US", "USA", "UNITED STATES"}:
            continue
        if state and state not in US_STATES:
            continue
        usable.append(rec)

    by_email: dict[str, dict] = {}
    extras: dict[str, list[str]] = {}
    for rec in usable:
        email = rec["email"]
        label = f"{rec.get('city') or ''} {rec.get('state') or ''}".strip()
        if email not in by_email:
            by_email[email] = rec
            extras[email] = []
        else:
            extras[email].append(label)

    mx_cache: dict[str, str] = {}
    rows = []
    for email, rec in sorted(by_email.items(), key=lambda item: (item[1].get("state") or "", item[1].get("city") or "", item[0])):
        domain = email.split("@", 1)[1]
        city = rec.get("city") or ""
        state = (rec.get("state") or "").upper()
        street = rec.get("street") or ""
        company = f"The UPS Store {city}, {state}".strip().strip(",")
        notes = "First-party location email from the official UPS Store locator."
        extra = extras[email]
        if extra:
            notes += " Same mailbox also listed for: " + "; ".join(x for x in extra[:8] if x)
        rows.append(
            {
                "email": email,
                "firstname": "",
                "lastname": "",
                "company": company,
                "phone": rec.get("phone") or "",
                "website": rec.get("url") or "",
                "city": city,
                "state": state,
                "jobtitle": "Franchise location",
                "lifecyclestage": "Lead",
                "hs_lead_status": "New",
                "hs_lead_source": "Franchise Outreach",
                "hubspot_owner": "Dillon Mohr",
                "priority": "A",
                "industry": "Shipping and postal",
                "franchise_brand": "The UPS Store",
                "franchise_type": "Shipping / print / mailbox",
                "target_service": "Website / SEO / GBP / HubSpot",
                "brand_domain": "theupsstore.com",
                "contact_name": "",
                "role_type": "Franchise location",
                "email_type": "location_mailbox",
                "source": "Verified 2026-09-01 first-party UPS Store locator",
                "source_url": rec.get("url") or "",
                "accessed": TODAY,
                "region_priority": state,
                "mx_status": mx_status(domain, mx_cache),
                "notes": notes,
            }
        )

    mx_ok_rows = [row for row in rows if row["mx_status"] == "mx_ok"]
    csv_path = ROOT / "ups-store-franchise-emails-hubspot-import.csv"
    with csv_path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=FIELDNAMES, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(mx_ok_rows)

    summary = {
        "accessed": TODAY,
        "sector": "Older shipping, print, and mailbox franchises",
        "whyThisSector": "The UPS Store franchisees are typically older owner-operators with a storefront, print counter, and mailbox business. Local sites and Google profiles are often weak, which matches IMMOHRTAL website, search, and HubSpot work. This is not fitness and was not taken from the Momentum prospect radar.",
        "sourceUrl": SOURCE,
        "storePages": len(urls),
        "recordsWithEmail": len(usable),
        "uniqueEmails": len(rows),
        "mxOk": len(mx_ok_rows),
        "mxFail": len(rows) - len(mx_ok_rows),
        "states": dict(Counter(row["state"] for row in mx_ok_rows).most_common()),
        "sharedMailboxes": sum(1 for extra in extras.values() if extra),
        "hubspotImported": False,
        "outreachSent": False,
        "clientRoute": "immohrtal-marketing",
        "clientNote": "IMMOHRTAL Marketing Solutions is Dillon's agency, not a registry client. Work is kept out of Momentum 360.",
    }
    (ROOT / "summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print(json.dumps({k: summary[k] for k in ("storePages", "recordsWithEmail", "uniqueEmails", "mxOk", "mxFail")}, indent=2))


if __name__ == "__main__":
    main()
