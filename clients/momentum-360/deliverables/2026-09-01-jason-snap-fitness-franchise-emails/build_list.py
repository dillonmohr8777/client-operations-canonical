from __future__ import annotations

import csv
import json
import re
import socket
from collections import Counter
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent
HTML = ROOT / "gyms-locator.html"
TODAY = date.today().isoformat()
SOURCE_URL = "https://www.snapfitness.com/us/gyms"

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


def extract_gyms(html: str) -> list[dict]:
    gyms = []
    seen_ids = set()
    # Next.js flight data stores gym objects with escaped quotes.
    chunks = re.split(r'(?=\{\\"id\\":\d+,\\"name\\":\\")', html)
    if len(chunks) < 10:
        chunks = re.split(r'(?=\{"id":\d+,"name":")', html)
        escaped = False
    else:
        escaped = True
    for chunk in chunks:
        if escaped:
            match = re.match(r'\{\\"id\\":(\d+),\\"name\\":\\"(.*?)\\"', chunk)
        else:
            match = re.match(r'\{"id":(\d+),"name":"(.*?)"', chunk)
        if not match:
            continue
        gym_id = int(match.group(1))
        if gym_id in seen_ids:
            continue
        name = unescape(match.group(2))
        if escaped:
            details_match = re.search(r'\\"contactDetails\\":\{(.*?)\}', chunk)
            path_match = re.search(r'\\"urlPath\\":\\"/gyms/([a-z0-9\-]+)\\"', chunk)
        else:
            details_match = re.search(r'"contactDetails":\{(.*?)\}', chunk)
            path_match = re.search(r'"urlPath":"/gyms/([a-z0-9\-]+)"', chunk)
        if not details_match or not path_match:
            continue
        slug = path_match.group(1)
        if re.search(r"\btest\b", name, re.I) or slug.endswith("-test"):
            continue
        name = re.sub(r",\s*([A-Z]{2}),\s*\1$", r", \1", name)
        details_raw = details_match.group(1).replace(r"\"", '"') if escaped else details_match.group(1)
        details = parse_details(details_raw)
        email = (details.get("email") or "").strip().lower()
        if not email or "@" not in email:
            continue
        country = (details.get("country") or "").strip().upper()
        if country and country not in {"USA", "US", "UNITED STATES"}:
            continue
        local = email.split("@", 1)[0]
        if local in GENERIC_LOCALS:
            continue
        seen_ids.add(gym_id)
        gyms.append(
            {
                "id": gym_id,
                "name": name,
                "slug": slug,
                "email": email,
                "phone": details.get("phone", ""),
                "address": details.get("address", ""),
                "address2": details.get("address2", ""),
                "city": details.get("city", ""),
                "state": details.get("state", ""),
                "zip": details.get("zipCode", ""),
                "country": details.get("country", "USA"),
                "page_url": f"https://www.snapfitness.com/us/gyms/{slug}",
            }
        )
    return gyms


def unescape(value: str) -> str:
    return value.replace(r"\/", "/").replace(r"\"", '"')


def parse_details(raw: str) -> dict:
    # contactDetails values are simple quoted strings.
    out = {}
    for key, value in re.findall(r'"([a-zA-Z0-9]+)":"(.*?)"', raw):
        out[key] = unescape(value)
    return out


def mx_ok(domain: str, cache: dict[str, str]) -> str:
    domain = domain.lower()
    if domain in cache:
        return cache[domain]
    try:
        answers = socket.getaddrinfo(domain, None)
        # Prefer real MX via dnspython-free Windows nslookup
        import subprocess

        proc = subprocess.run(
            ["nslookup", "-type=MX", domain],
            capture_output=True,
            text=True,
            timeout=15,
        )
        text = (proc.stdout or "") + (proc.stderr or "")
        status = "mx_ok" if "mail exchanger" in text.lower() or "MX" in text else "mx_fail"
        if status == "mx_fail" and answers:
            # Some Windows nslookup wording differs.
            if re.search(r"mail exchanger|MX preference", text, re.I):
                status = "mx_ok"
        cache[domain] = status
        return status
    except Exception:
        cache[domain] = "mx_fail"
        return "mx_fail"


def main() -> None:
    html = HTML.read_text(encoding="utf-8", errors="replace")
    gyms = extract_gyms(html)
    print("parsed gyms with email", len(gyms))

    # Deduplicate by email, keep first location as primary and note extras.
    by_email: dict[str, dict] = {}
    extras: dict[str, list[str]] = {}
    for gym in gyms:
        email = gym["email"]
        if email not in by_email:
            by_email[email] = gym
            extras[email] = []
        else:
            extras[email].append(gym["name"])

    mx_cache: dict[str, str] = {}
    rows = []
    for i, (email, gym) in enumerate(sorted(by_email.items(), key=lambda item: (item[1]["state"], item[1]["city"], item[0])), start=1):
        domain = email.split("@", 1)[1]
        status = mx_ok(domain, mx_cache)
        extra = extras[email]
        notes = "First-party location email from the official Snap Fitness US gym locator."
        if extra:
            notes += " Same mailbox also listed for: " + "; ".join(extra[:8])
            if len(extra) > 8:
                notes += f"; plus {len(extra) - 8} more"
        rows.append(
            {
                "email": email,
                "firstname": "",
                "lastname": "",
                "company": f"Snap Fitness {gym['name']}",
                "phone": gym["phone"],
                "website": gym["page_url"],
                "city": gym["city"],
                "state": gym["state"],
                "jobtitle": "Franchise location",
                "lifecyclestage": "Lead",
                "hs_lead_status": "New",
                "hs_lead_source": "Franchise Outreach",
                "hubspot_owner": "Jason Fallon",
                "priority": "A",
                "industry": "Fitness",
                "franchise_brand": "Snap Fitness",
                "franchise_type": "Fitness",
                "target_service": "SEO / GBP / PPC / Web",
                "brand_domain": "snapfitness.com",
                "contact_name": "",
                "role_type": "Franchise location",
                "email_type": "location_mailbox",
                "source": "Verified 2026-09-01 first-party Snap Fitness US gym locator",
                "source_url": gym["page_url"],
                "accessed": TODAY,
                "region_priority": gym["state"],
                "mx_status": status,
                "notes": notes,
            }
        )

    mx_ok_rows = [r for r in rows if r["mx_status"] == "mx_ok"]
    (ROOT / "snap-fitness-gyms.json").write_text(json.dumps(gyms, indent=2), encoding="utf-8")
    fieldnames = [
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
    csv_path = ROOT / "snap-fitness-franchise-emails-hubspot-import.csv"
    with csv_path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(mx_ok_rows)
    full_path = ROOT / "snap-fitness-franchise-emails-all.csv"
    with full_path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)

    summary = {
        "accessed": TODAY,
        "sourceUrl": SOURCE_URL,
        "gymsWithEmail": len(gyms),
        "uniqueEmails": len(rows),
        "mxOk": len(mx_ok_rows),
        "mxFail": len(rows) - len(mx_ok_rows),
        "states": dict(Counter(r["state"] for r in mx_ok_rows).most_common()),
        "sharedMailboxes": sum(1 for extra in extras.values() if extra),
        "hubspotAlreadyPresent": 4,
        "knownHubSpotEmails": [
            "springfield@snapfitness.com",
            "lynchburgva@snapfitness.com",
            "allentownnj@snapfitness.com",
            "newnanga@snapfitness.com",
        ],
    }
    (ROOT / "summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print(json.dumps({k: summary[k] for k in ("gymsWithEmail", "uniqueEmails", "mxOk", "mxFail")}, indent=2))


if __name__ == "__main__":
    main()
