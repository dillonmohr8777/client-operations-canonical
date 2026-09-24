#!/usr/bin/env python3
"""Build a consent-gated Philadelphia workshop prospect research list.

The output deliberately does not send email or create calendar attendees.
Calendar eligibility begins only after a prospect registers and explicitly
selects the one-workshop calendar invitation checkbox.
"""

from __future__ import annotations

import csv
import io
import json
import re
import unicodedata
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlencode

import dns.exception
import dns.resolver
import requests
from bs4 import BeautifulSoup
from pypdf import PdfReader


OUTPUT_DIR = Path(__file__).resolve().parent
OUTPUT_CSV = OUTPUT_DIR / "prospects.csv"
QA_JSON = OUTPUT_DIR / "qa-summary.json"
SOURCE_JSON = OUTPUT_DIR / "source-manifest.json"

PRIOR_MOMENTUM_CSV = Path(
    r"C:\Users\dillo\Documents\Codex\2026-07-11"
    r"\do-both-assist-hermes-agent-integrate"
    r"\philadelphia-25-netlify-batch"
    r"\dist-25\prospect-bundle\philadelphia-35-prospects.csv"
)

WORKSHOP_URL = "https://momentum-workshop-pilot.netlify.app/"
CAMPAIGN = "phl_owner_workshop_2026_08"
TARGET_COUNT = 250
CHECKED_AT = datetime.now(timezone.utc).replace(microsecond=0).isoformat()

SOURCES = {
    "momentum_prior_research": {
        "name": "Momentum 360 Philadelphia prospect research",
        "url": str(PRIOR_MOMENTUM_CSV),
        "published": "2026-07-11",
        "kind": "local_research",
    },
    "phdc_rebuild": {
        "name": "City of Philadelphia Rebuild Emerging Vendors",
        "url": (
            "https://phdcphila.org/wp-content/uploads/RFPs/Lawncrest/"
            "Attachment-B-Additional-Information.pdf"
        ),
        "published": "2025-05",
        "kind": "official_vendor_list",
    },
    "psaphcc": {
        "name": "Philadelphia Suburban Plumbing, Heating and Cooling Contractors",
        "url": "https://www.psaphcc.com/members/",
        "published": "live_directory",
        "kind": "trade_association_directory",
    },
    "dc21": {
        "name": "IUPAT District Council 21 Contractor Directory",
        "url": "https://www.dc21.org/contractors/",
        "published": "live_directory",
        "kind": "trade_association_directory",
    },
}

HTTP_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/138.0.0.0 Safari/537.36"
    ),
    "Accept": (
        "text/html,application/xhtml+xml,application/xml;q=0.9,"
        "image/avif,image/webp,*/*;q=0.8"
    ),
    "Accept-Language": "en-US,en;q=0.5",
    "Referer": "https://www.google.com/",
}

EMAIL_RE = re.compile(r"^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$", re.I)
EMAIL_IN_TEXT_RE = re.compile(r"[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}", re.I)
PHONE_RE = re.compile(r"(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}")
ROLE_PREFIXES = {
    "admin",
    "bids",
    "contact",
    "customerservice",
    "hello",
    "info",
    "office",
    "sales",
    "service",
    "support",
    "team",
}
BLOCKED_DOMAINS = {
    "dc21.org",
    "phdcphila.org",
    "phila.gov",
    "philaport.com",
    "pidcphila.com",
    "psaphcc.com",
}
PHILLY_METRO_ZIP_PREFIXES = {
    "PA": {"189", "190", "191", "193", "194", "195"},
    "NJ": {"080", "081", "085", "086"},
    "DE": {"197", "198"},
}
HIGH_FIT_TERMS = (
    "air conditioning",
    "carpentry",
    "cleaning",
    "concrete",
    "construction",
    "contractor",
    "demolition",
    "drywall",
    "electrical",
    "excavation",
    "floor",
    "glazing",
    "hvac",
    "landscap",
    "maintenance",
    "mechanical",
    "paint",
    "pest",
    "plumb",
    "remodel",
    "renovat",
    "roof",
    "sewer",
    "sheet metal",
    "waterproof",
    "window",
)


@dataclass
class Prospect:
    source_key: str
    business_name: str
    public_email: str
    contact_name: str = ""
    category: str = ""
    city: str = ""
    state: str = ""
    postal_code: str = ""
    phone: str = ""
    website: str = ""
    source_url: str = ""
    source_published: str = ""
    source_checked_at: str = CHECKED_AT
    email_type: str = ""
    email_domain: str = ""
    domain_mail_status: str = ""
    geo_tier: str = ""
    fit_score: int = 0
    fit_reason: str = ""
    prospect_id: str = ""
    registration_url: str = ""
    calendar_eligible: str = "no_until_registration_and_calendar_consent"
    outreach_status: str = "research_only_not_approved"


def clean(value: str | None) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def normalize_email(value: str) -> str:
    email = clean(value).lower().replace("mailto:", "")
    return email if EMAIL_RE.fullmatch(email) else ""


def normalize_business(value: str) -> str:
    text = unicodedata.normalize("NFKD", clean(value)).encode("ascii", "ignore").decode()
    text = text.lower().replace("&", " and ")
    text = re.sub(
        r"\b(?:incorporated|inc|llc|ltd|lp|corp|corporation|company|co)\b",
        " ",
        text,
    )
    return re.sub(r"[^a-z0-9]+", "", text)


def parse_location(value: str) -> tuple[str, str, str]:
    value = clean(value)
    match = re.search(
        r"(?P<city>[^,]+),?\s+(?P<state>PA|NJ|DE)\s+(?P<zip>\d{5})(?:-\d{4})?",
        value,
        re.I,
    )
    if match:
        return (
            clean(match.group("city")),
            match.group("state").upper(),
            match.group("zip"),
        )
    state_match = re.search(r"(?P<city>[^,]+),\s*(?P<state>PA|NJ|DE)\b", value, re.I)
    if state_match:
        return clean(state_match.group("city")), state_match.group("state").upper(), ""
    return "", "", ""


def infer_category(name: str, fallback: str = "") -> str:
    text = f"{name} {fallback}".lower()
    rules = [
        (("plumb", "sewer", "drain"), "Plumbing / sewer"),
        (("hvac", "heating", "cooling", "mechanical"), "HVAC / mechanical"),
        (("electric",), "Electrical"),
        (("roof",), "Roofing"),
        (("paint", "wallcover", "drywall"), "Painting / drywall"),
        (("glass", "glazing", "window"), "Glass / windows"),
        (("clean", "janitorial"), "Cleaning / maintenance"),
        (("landscap",), "Landscaping"),
        (("pest", "extermin"), "Pest control"),
        (("concrete", "masonry"), "Concrete / masonry"),
        (("construction", "contract", "builder", "renovat", "remodel"), "Construction / remodeling"),
        ((" signage", " sign ", "signs", "display"), "Signs / display"),
    ]
    for terms, label in rules:
        if any(term in text for term in terms):
            return label
    return clean(fallback) or "Local service business"


def add_source_fields(prospect: Prospect) -> Prospect:
    source = SOURCES[prospect.source_key]
    prospect.source_url = prospect.source_url or source["url"]
    prospect.source_published = source["published"]
    return prospect


def fetch_dc21(session: requests.Session) -> list[Prospect]:
    response = session.get(SOURCES["dc21"]["url"], timeout=45)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")
    prospects: list[Prospect] = []
    for row in soup.select("table tr")[1:]:
        cells = [clean(cell.get_text(" ", strip=True)) for cell in row.select("td")]
        if len(cells) < 11:
            continue
        business, trades, contact, phone, _, email, website, _, city, state, postal = cells[:11]
        email = normalize_email(email)
        state = state.upper()
        prefix = re.sub(r"\D", "", postal)[:3]
        if (
            not email
            or state not in PHILLY_METRO_ZIP_PREFIXES
            or prefix not in PHILLY_METRO_ZIP_PREFIXES[state]
        ):
            continue
        prospects.append(
            add_source_fields(
                Prospect(
                    source_key="dc21",
                    business_name=business,
                    public_email=email,
                    contact_name=contact,
                    category=infer_category(business, trades),
                    city=city,
                    state=state,
                    postal_code=re.sub(r"\D", "", postal)[:5],
                    phone=phone,
                    website=website,
                )
            )
        )
    return prospects


def fetch_psaphcc(session: requests.Session) -> list[Prospect]:
    response = session.get(SOURCES["psaphcc"]["url"], timeout=45)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")
    prospects: list[Prospect] = []
    for heading in soup.select("h3"):
        content = heading.find_next_sibling("div")
        if content is None:
            continue
        email_link = content.select_one('a[href^="mailto:"]')
        if email_link is None:
            continue
        email = normalize_email(email_link.get("href", ""))
        if not email:
            continue
        paragraphs = [clean(p.get_text(" ", strip=True)) for p in content.find_all("p", recursive=False)]
        contact = clean(content.select_one("strong").get_text(" ", strip=True)) if content.select_one("strong") else ""
        location = next(
            (p for p in paragraphs if re.search(r"\b(?:PA|NJ|DE)\s+\d{5}", p, re.I)),
            "",
        )
        city, state, postal = parse_location(location)
        phone_link = content.select_one('a[href^="tel:"]')
        phone = clean(phone_link.get_text(" ", strip=True)) if phone_link else ""
        business = clean(heading.get_text(" ", strip=True))
        prospects.append(
            add_source_fields(
                Prospect(
                    source_key="psaphcc",
                    business_name=business,
                    public_email=email,
                    contact_name=contact,
                    category=infer_category(business, "Plumbing / HVAC"),
                    city=city,
                    state=state,
                    postal_code=postal,
                    phone=phone,
                )
            )
        )
    return prospects


def fetch_phdc_rebuild(session: requests.Session) -> list[Prospect]:
    response = session.get(SOURCES["phdc_rebuild"]["url"], timeout=60)
    response.raise_for_status()
    reader = PdfReader(io.BytesIO(response.content))
    lines = (reader.pages[4].extract_text(extraction_mode="layout") or "").splitlines()
    prospects: list[Prospect] = []
    for line in lines:
        email_match = EMAIL_IN_TEXT_RE.search(line)
        if not email_match:
            continue
        email = normalize_email(email_match.group(0))
        company = clean(line[12:69])
        contact = clean(line[69:102])
        location = clean(line[102:129])
        phone = clean(line[129:151])
        if not company or not email or email.split("@", 1)[1] in BLOCKED_DOMAINS:
            continue
        city, state, postal = parse_location(location)
        if not state and "philadelphia" in location.lower():
            city, state = "Philadelphia", "PA"
        prospects.append(
            add_source_fields(
                Prospect(
                    source_key="phdc_rebuild",
                    business_name=company,
                    public_email=email,
                    contact_name=contact,
                    category=infer_category(company, "Local business service"),
                    city=city,
                    state=state,
                    postal_code=postal,
                    phone=phone if PHONE_RE.search(phone) else clean(phone),
                )
            )
        )
    return prospects


def load_prior_momentum() -> list[Prospect]:
    prospects: list[Prospect] = []
    with PRIOR_MOMENTUM_CSV.open(encoding="utf-8-sig", newline="") as handle:
        for row in csv.DictReader(handle):
            email = normalize_email(row.get("public_email", ""))
            if not email:
                continue
            city, state, postal = parse_location(row.get("mailing_address_normalized", ""))
            prospects.append(
                add_source_fields(
                    Prospect(
                        source_key="momentum_prior_research",
                        business_name=clean(row.get("business_name")),
                        public_email=email,
                        category=infer_category(
                            clean(row.get("business_name")),
                            clean(row.get("industry")),
                        ),
                        city=city or "Philadelphia",
                        state=state or "PA",
                        postal_code=postal,
                        phone=clean(row.get("phone")),
                        website=clean(row.get("current_site")),
                    )
                )
            )
    return prospects


def dns_mail_status(domain: str) -> tuple[str, str]:
    resolver = dns.resolver.Resolver(configure=True)
    resolver.timeout = 2.0
    resolver.lifetime = 3.0
    try:
        answers = resolver.resolve(domain, "MX")
        if any(str(answer.exchange).strip(".") for answer in answers):
            return domain, "mx"
    except dns.resolver.NoAnswer:
        pass
    except dns.resolver.NXDOMAIN:
        return domain, "unresolved"
    except dns.exception.Timeout:
        return domain, "unknown_timeout"
    except dns.exception.DNSException:
        pass
    try:
        resolver.resolve(domain, "A")
        return domain, "a_only"
    except dns.resolver.NXDOMAIN:
        return domain, "unresolved"
    except dns.exception.Timeout:
        return domain, "unknown_timeout"
    except dns.exception.DNSException:
        return domain, "unresolved"


def geo_tier(prospect: Prospect) -> str:
    if prospect.city.lower() == "philadelphia" or prospect.postal_code.startswith("191"):
        return "philadelphia"
    if prospect.state == "PA":
        return "pennsylvania_suburbs"
    if prospect.state in {"NJ", "DE"}:
        return "nearby_nj_de"
    return "unresolved"


def score(prospect: Prospect) -> Prospect:
    source_points = {
        "momentum_prior_research": 34,
        "phdc_rebuild": 32,
        "psaphcc": 30,
        "dc21": 28,
    }
    geo_points = {
        "philadelphia": 32,
        "pennsylvania_suburbs": 24,
        "nearby_nj_de": 16,
        "unresolved": 4,
    }
    mail_points = {"mx": 18, "a_only": 10, "unknown_timeout": 6, "unresolved": -100}
    text = f"{prospect.business_name} {prospect.category}".lower()
    high_fit = any(term in text for term in HIGH_FIT_TERMS) or bool(
        re.search(r"\bsigns?\b|\bsignage\b", text)
    )
    local_part = prospect.public_email.split("@", 1)[0].replace(".", "").replace("_", "")
    role_mailbox = local_part in ROLE_PREFIXES
    prospect.email_type = "role_mailbox" if role_mailbox else "named_or_business_mailbox"
    prospect.geo_tier = geo_tier(prospect)
    prospect.fit_score = (
        source_points[prospect.source_key]
        + geo_points[prospect.geo_tier]
        + mail_points[prospect.domain_mail_status]
        + (36 if high_fit else 5)
        + (7 if role_mailbox else 4)
        + (4 if prospect.contact_name else 0)
        + (4 if prospect.website else 0)
    )
    reasons = [
        prospect.geo_tier.replace("_", " "),
        prospect.category,
        f"public {SOURCES[prospect.source_key]['kind'].replace('_', ' ')}",
        f"{prospect.domain_mail_status} domain check",
    ]
    prospect.fit_reason = "; ".join(reasons)
    return prospect


def registration_url(prospect_id: str, source_key: str) -> str:
    query = urlencode(
        {
            "utm_source": source_key,
            "utm_medium": "permissioned_outreach",
            "utm_campaign": CAMPAIGN,
            "utm_content": prospect_id,
        }
    )
    return f"{WORKSHOP_URL}?{query}#register"


def deduplicate(records: list[Prospect]) -> list[Prospect]:
    source_priority = {
        "momentum_prior_research": 4,
        "phdc_rebuild": 3,
        "psaphcc": 2,
        "dc21": 1,
    }
    ordered = sorted(
        records,
        key=lambda p: (
            source_priority[p.source_key],
            bool(p.website),
            bool(p.contact_name),
        ),
        reverse=True,
    )
    seen_emails: set[str] = set()
    seen_businesses: set[str] = set()
    unique: list[Prospect] = []
    for prospect in ordered:
        business_key = normalize_business(prospect.business_name)
        if (
            not business_key
            or prospect.public_email in seen_emails
            or business_key in seen_businesses
        ):
            continue
        seen_emails.add(prospect.public_email)
        seen_businesses.add(business_key)
        unique.append(prospect)
    return unique


def write_outputs(all_records: list[Prospect], selected: list[Prospect]) -> None:
    fieldnames = list(asdict(selected[0]).keys())
    with OUTPUT_CSV.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(asdict(row) for row in selected)

    qa = {
        "generated_at": CHECKED_AT,
        "target_count": TARGET_COUNT,
        "selected_count": len(selected),
        "raw_count": len(all_records),
        "unique_before_dns_filter": len(deduplicate(all_records)),
        "invitations_sent": 0,
        "calendar_rule": "registration plus explicit calendar consent required",
        "email_validation": (
            "Syntax plus domain MX/A resolution only. Mailbox existence was not "
            "tested and must not be claimed."
        ),
        "selected_by_source": dict(Counter(row.source_key for row in selected)),
        "selected_by_geo_tier": dict(Counter(row.geo_tier for row in selected)),
        "selected_by_category": dict(Counter(row.category for row in selected)),
        "selected_by_domain_mail_status": dict(
            Counter(row.domain_mail_status for row in selected)
        ),
        "score": {
            "minimum": min(row.fit_score for row in selected),
            "maximum": max(row.fit_score for row in selected),
            "median": sorted(row.fit_score for row in selected)[len(selected) // 2],
        },
        "checks": {
            "exactly_250": len(selected) == TARGET_COUNT,
            "unique_emails": len({row.public_email for row in selected}) == len(selected),
            "unique_businesses": (
                len({normalize_business(row.business_name) for row in selected})
                == len(selected)
            ),
            "valid_syntax": all(EMAIL_RE.fullmatch(row.public_email) for row in selected),
            "no_unresolved_or_timed_out_domains": all(
                row.domain_mail_status not in {"unresolved", "unknown_timeout"}
                for row in selected
            ),
            "all_external_actions_gated": all(
                row.calendar_eligible
                == "no_until_registration_and_calendar_consent"
                and row.outreach_status == "research_only_not_approved"
                for row in selected
            ),
        },
    }
    QA_JSON.write_text(json.dumps(qa, indent=2) + "\n", encoding="utf-8")

    manifest = {
        "generated_at": CHECKED_AT,
        "sources": SOURCES,
        "selection": {
            "market": "Philadelphia and the immediately surrounding PA/NJ/DE metro",
            "profile": (
                "Owners and operators of local service businesses, weighted toward "
                "estimate-, appointment-, and project-driven trades."
            ),
            "count": TARGET_COUNT,
            "dedupe": "case-insensitive email plus normalized business name",
            "mail_check": "DNS MX, then A fallback; no SMTP probe",
        },
        "delivery": {
            "workshop_url": WORKSHOP_URL,
            "campaign": CAMPAIGN,
            "outreach": "not sent",
            "calendar_invitations": "not sent",
            "eligibility": (
                "Only a verified form registration with calendar_consent=on may "
                "enter the organizer-invitation workflow."
            ),
        },
    }
    SOURCE_JSON.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    session = requests.Session()
    session.headers.update(HTTP_HEADERS)
    records = (
        load_prior_momentum()
        + fetch_phdc_rebuild(session)
        + fetch_psaphcc(session)
        + fetch_dc21(session)
    )
    records = deduplicate(records)

    domains = sorted({row.public_email.split("@", 1)[1] for row in records})
    with ThreadPoolExecutor(max_workers=24) as pool:
        domain_status = dict(pool.map(dns_mail_status, domains))

    viable: list[Prospect] = []
    for prospect in records:
        prospect.email_domain = prospect.public_email.split("@", 1)[1]
        prospect.domain_mail_status = domain_status[prospect.email_domain]
        if (
            prospect.email_domain in BLOCKED_DOMAINS
            or prospect.domain_mail_status in {"unresolved", "unknown_timeout"}
        ):
            continue
        viable.append(score(prospect))

    viable.sort(
        key=lambda row: (
            row.fit_score,
            row.geo_tier == "philadelphia",
            row.business_name.lower(),
        ),
        reverse=True,
    )
    if len(viable) < TARGET_COUNT:
        raise RuntimeError(
            f"Only {len(viable)} viable unique prospects remained; need {TARGET_COUNT}."
        )

    selected = viable[:TARGET_COUNT]
    selected.sort(
        key=lambda row: (
            {"philadelphia": 0, "pennsylvania_suburbs": 1, "nearby_nj_de": 2}.get(
                row.geo_tier, 3
            ),
            row.business_name.lower(),
        )
    )
    for index, prospect in enumerate(selected, start=1):
        prospect.prospect_id = f"PHL-WORKSHOP-{index:03d}"
        prospect.registration_url = registration_url(
            prospect.prospect_id, prospect.source_key
        )

    write_outputs(records, selected)
    print(
        json.dumps(
            {
                "selected": len(selected),
                "raw_unique": len(records),
                "output": str(OUTPUT_CSV),
                "qa": str(QA_JSON),
            }
        )
    )


if __name__ == "__main__":
    main()
