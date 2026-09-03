"""Harvest Erie County published mailboxes for wave 2.

Primary source: Erie Regional Chamber member directory, with Cloudflare
email-protection decoded. Official sites are then fetched only for the
live headline used in the note. No guessed info@ addresses. Wave 1
mailboxes are suppressed.
"""

from __future__ import annotations

import html as html_lib
import http.cookiejar
import json
import re
import ssl
import sys
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))
from collect_erie_sendable import (  # noqa: E402
    CHAIN_PARTS,
    SOCIAL_HOSTS,
    domain_key,
    good_email,
    inspect_site,
    observation,
    place_reason,
)

TODAY = datetime.now(timezone.utc).date().isoformat()
CTX = ssl.create_default_context()
UA = "Mozilla/5.0 (compatible; MomentumErieResearch/1.2)"
ROW_RE = re.compile(
    r'<h5>(?:<a href="(?P<url>https?://[^"]+)"[^>]*>)?\s*(?P<name>[^<]+?)\s*(?:</a>)?<br></h5>\s*'
    r"<p>(?P<addr>.*?)</p>.*?"
    r'href="/cdn-cgi/l/email-protection#(?P<cf>[0-9a-f]+)"',
    re.I | re.S,
)

ERIE_COUNTY_CITIES = {
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
    "fairview township",
    "harborcreek township",
    "millcreek township",
    "mckean township",
    "greene township",
    "venango",
    "west springfield",
}

ERIE_ZIPS = {
    "16407",
    "16410",
    "16411",
    "16412",
    "16415",
    "16417",
    "16421",
    "16423",
    "16426",
    "16427",
    "16428",
    "16430",
    "16438",
    "16441",
    "16442",
    "16443",
    "16444",
    "16475",
    "16501",
    "16502",
    "16503",
    "16504",
    "16505",
    "16506",
    "16507",
    "16508",
    "16509",
    "16510",
    "16511",
    "16512",
    "16514",
    "16515",
    "16522",
    "16530",
    "16531",
    "16534",
    "16538",
    "16541",
    "16544",
    "16546",
    "16550",
    "16553",
    "16563",
    "16565",
}

DROP_NAME_PARTS = (
    "church",
    "parish",
    "synagogue",
    "mosque",
    "school district",
    "elementary school",
    "high school",
    "middle school",
    "university",
    "college",
    "hospital",
    "upmc",
    "city of erie",
    "county of erie",
    "police department",
    "fire department",
    "library",
    "post office",
    "credit union",
)

NATIONAL_NAME_PARTS = (
    "aetna",
    "aflac",
    "geico",
    "state farm",
    "nationwide insurance",
    "allstate",
    "progressive insurance",
    "walmart",
    "target",
    "mcdonald",
    "starbucks",
    "lowes",
    "home depot",
    "cvs ",
    "walgreens",
    "ups store",
    "fedex",
    "verizon",
    "at&t",
    "comcast",
    "xfinity",
    "wellsfargo",
    "pnc bank",
    "bank of america",
    "huntington bank",
    "keybank",
    "northwest bank",
    "eriebank",
    "marquette savings",
    "community bank",
    "first national bank",
    "fnb ",
    "widget financial",
    "anytime fitness",
    "snap fitness",
    "planet fitness",
    "buffalo wild wings",
    "applebee",
    "olive garden",
    "red lobster",
    "outback",
    "ihop",
    "denny",
    "five guys",
    "chipotle",
    "panera",
    "subway",
    "dunkin",
    "holiday inn",
    "hampton inn",
    "marriott",
    "hilton",
    "best western",
    "super 8",
    "motel 6",
    "country inn",
    "fairfield inn",
    "courtyard",
    "residence inn",
    "ashley homestore",
    "macy",
    "burlington",
    "dsw",
    "pilot travel",
    "questdiagnostics",
    "associated clinical",
)

DROP_EMAILS = {
    "steve.r.odom@questdiagnostics.com",
    "rewards@crosbysstores.com",
    "info@erieairport.org",
    "info@porterie.org",
    "impallari@gmail.com",
    "hello@rfuenzalida.com",
    "info@route1a.com",
    "thebrandphotography@outlook.com",
    "info@euma-erie.org",
    "greenscenethrift@gmail.com",
    "info@eriehumanesociety.org",
    "info@alcanoncluberie.com",
    "gemcityoutdoorsmenclub@gmail.com",
    "socialmedia@mtsd.org",
    "joe@gmail.com",
    "hi@mystore.com",
    "vigliottap@aetna.com",
    "owen0054@gmail.com",
}

DROP_EMAIL_PREFIXES = (
    "webmaster@",
    "rewards@",
    "noreply@",
    "no-reply@",
    "donotreply@",
    "privacy@",
    "legal@",
    "careers@",
    "jobs@",
)


def decode_cf(hex_str: str) -> str:
    raw = bytes.fromhex(hex_str)
    key = raw[0]
    return html_lib.unescape("".join(chr(b ^ key) for b in raw[1:]))


def load_sent() -> set[str]:
    sent: set[str] = set()
    paths = [
        ROOT.parent / "sends" / "erie-send-log.jsonl",
        ROOT.parent / "sends" / "erie-messages.json",
        ROOT / "erie-final-summary.json",
        ROOT.parent / "sends" / "erie-sent-summary.json",
    ]
    for path in paths:
        if not path.exists():
            continue
        raw = path.read_text(encoding="utf-8")
        if path.suffix == ".jsonl":
            payloads = [json.loads(line) for line in raw.splitlines() if line.strip()]
        else:
            payloads = [json.loads(raw)]
        for payload in payloads:
            if not isinstance(payload, dict):
                continue
            for email in payload.get("emails") or []:
                sent.add(str(email).strip().lower())
            email = (payload.get("email") or "").strip().lower()
            if email:
                sent.add(email)
            for row in payload.get("messages") or []:
                email = (row.get("email") or "").strip().lower()
                if email:
                    sent.add(email)
    return sent


def email_ok(addr: str) -> bool:
    value = (addr or "").strip().lower()
    if not value or value in DROP_EMAILS:
        return False
    if any(value.startswith(prefix) for prefix in DROP_EMAIL_PREFIXES):
        return False
    if value.endswith((".gov", ".edu", ".pa.us")):
        return False
    return good_email(value) is not None


def name_ok(name: str) -> bool:
    low = (name or "").lower()
    if not low or len(low) < 3:
        return False
    if any(part in low for part in DROP_NAME_PARTS):
        return False
    if any(part in low for part in NATIONAL_NAME_PARTS):
        return False
    return True


def domain_ok(domain: str | None) -> bool:
    host = (domain or "").lower()
    if not host:
        return True
    if host.endswith((".gov", ".edu", ".pa.us")):
        return False
    if any(part in host for part in CHAIN_PARTS):
        return False
    if host in SOCIAL_HOSTS:
        return False
    return True


def address_in_erie_county(addr: str) -> tuple[bool, str]:
    text = re.sub(r"<br\s*/?>", ", ", addr or "", flags=re.I)
    text = re.sub(r"\s+", " ", html_lib.unescape(re.sub(r"<[^>]+>", " ", text))).strip()
    low = text.lower()
    zips = re.findall(r"\b16[45]\d{2}\b", text)
    city = "Erie"
    for token in ERIE_COUNTY_CITIES:
        if re.search(rf"\b{re.escape(token)}\b", low):
            city = token.title()
            if token == "north east":
                city = "North East"
            elif token == "union city":
                city = "Union City"
            elif token == "lake city":
                city = "Lake City"
            return True, city
    if any(z in ERIE_ZIPS for z in zips) and ", pa" in low:
        return True, "Erie"
    return False, city


def chamber_opener():
    cj = http.cookiejar.CookieJar()
    opener = urllib.request.build_opener(
        urllib.request.HTTPCookieProcessor(cj),
        urllib.request.HTTPSHandler(context=CTX),
    )
    opener.addheaders = [("User-Agent", UA)]
    data = urllib.parse.urlencode({"formAction": "setMax", "maxItems": "200"}).encode()
    opener.open("https://eriepa.com/directory.php", data=data, timeout=40)
    return opener


def harvest_chamber() -> list[dict]:
    opener = chamber_opener()
    rows: list[dict] = []
    seen_email: set[str] = set()
    for page in (1, 2, 3):
        html = opener.open(f"https://eriepa.com/directory.php?p={page}", timeout=40).read().decode("utf-8", "replace")
        found = 0
        for match in ROW_RE.finditer(html):
            name = re.sub(r"\s+", " ", match.group("name")).strip()
            url = (match.group("url") or "").strip() or None
            addr = match.group("addr") or ""
            try:
                email = decode_cf(match.group("cf")).strip().lower()
            except Exception:
                continue
            in_county, city = address_in_erie_county(addr)
            if not in_county or not name_ok(name) or not email_ok(email):
                continue
            if email in seen_email:
                continue
            domain = domain_key(url) if url else email.split("@", 1)[1]
            if not domain_ok(domain):
                continue
            seen_email.add(email)
            found += 1
            rows.append(
                {
                    "business": name[:90],
                    "market": "Erie",
                    "city": city,
                    "state": "PA",
                    "officialUrl": url.split("?")[0].rstrip("/") if url else None,
                    "domain": domain,
                    "category": "chamber-member",
                    "phone": None,
                    "email": email,
                    "emailStatus": "chamber_published",
                    "emailSource": "erie-regional-chamber",
                    "source": "eriepa-directory",
                    "addressText": re.sub(r"\s+", " ", html_lib.unescape(re.sub(r"<[^>]+>", " ", addr))).strip(),
                    "accessed": TODAY,
                    "draftStatus": "unbuilt",
                    "mailStatus": "unsent",
                }
            )
        print(f"chamber page {page}: kept {found}", flush=True)
    return rows


def inspect_for_copy(rows: list[dict]) -> list[dict]:
    need = [r for r in rows if r.get("officialUrl")]
    keep = [r for r in rows if not r.get("officialUrl")]
    print(f"inspecting {len(need)} official sites for headlines", flush=True)
    with ThreadPoolExecutor(max_workers=8) as pool:
        futures = {pool.submit(inspect_site, row): row for row in need}
        for index, future in enumerate(as_completed(futures), start=1):
            row = futures[future]
            try:
                result = future.result()
            except Exception as exc:  # noqa: BLE001
                result = dict(row)
                result["fetchStatus"] = f"error:{exc}"
            # Chamber email wins. Site fetch is only for the live headline.
            result["email"] = row["email"]
            result["emailStatus"] = "chamber_published"
            result["emailSource"] = "erie-regional-chamber"
            keep.append(result)
            print(f"{index}/{len(need)} {result.get('domain') or result['business']}", flush=True)
    return keep


def finalize(rows: list[dict], sent: set[str]) -> list[dict]:
    kept: list[dict] = []
    seen_email: set[str] = set()
    seen_domain: set[str] = set()
    for row in rows:
        email = (row.get("email") or "").strip().lower()
        domain = (row.get("domain") or "").lower()
        if not email_ok(email) or email in sent or email in seen_email:
            continue
        if not name_ok(row.get("business") or ""):
            continue
        if not domain_ok(domain):
            continue
        if domain and domain in seen_domain:
            continue
        if not row.get("localPlaceReason"):
            row["localPlaceReason"] = place_reason(row["business"], row.get("city") or "Erie", row.get("addressText") or "")
        if not row.get("liveSiteObservation"):
            row["liveSiteObservation"] = observation(
                row.get("pageTitle") or "",
                row.get("pageH1") or "",
                row.get("pageMeta") or "",
                row["business"],
            )
        seen_email.add(email)
        if domain:
            seen_domain.add(domain)
        kept.append(row)
    kept.sort(key=lambda r: r["business"].lower())
    return kept[:200]


def main() -> None:
    sent = load_sent()
    print(f"already sent: {len(sent)}", flush=True)
    chamber = harvest_chamber()
    print(f"chamber kept: {len(chamber)}", flush=True)
    inspected = inspect_for_copy(chamber)
    sendable = finalize(inspected, sent)
    summary = {
        "generatedAtUtc": datetime.now(timezone.utc).isoformat(),
        "alreadySent": len(sent),
        "chamberKept": len(chamber),
        "sendable": len(sendable),
        "rule": "Wave 2. Chamber published mailboxes plus official-site headlines. No remmail of wave 1. Erie County only.",
        "emails": [r["email"] for r in sendable],
        "businesses": [r["business"] for r in sendable],
        "cities": sorted({r.get("city") or "Erie" for r in sendable}),
    }
    (ROOT / "erie-wave2-inspected.json").write_text(json.dumps(inspected, indent=2) + "\n", encoding="utf-8")
    (ROOT / "erie-wave2-sendable.json").write_text(json.dumps(sendable, indent=2) + "\n", encoding="utf-8")
    (ROOT / "erie-wave2-summary.json").write_text(json.dumps(summary, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({k: summary[k] for k in ("alreadySent", "chamberKept", "sendable", "cities")}, indent=2))


if __name__ == "__main__":
    main()
