"""Build hometown Erie HTML messages from published-email rows."""

from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from html import escape
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent
LIST = ROOT.parent / "list"
MAX_SEND = 200


def host_label(url: str | None) -> str:
    if not url:
        return ""
    host = (urlparse(url).hostname or "").lower()
    if host.startswith("www."):
        host = host[4:]
    return host


def clean_text(value: str) -> str:
    text = re.sub(r"\s+", " ", value or "").strip()
    text = text.replace("\u2014", " ").replace("\u2013", " ").replace("-", " ")
    text = text.replace("*", "")
    return text


def category_lane(row: dict) -> str:
    cat = (row.get("category") or "").lower()
    name = (row.get("business") or "").lower()
    blob = f"{cat} {name}"
    if any(token in blob for token in ("restaurant", "cafe", "bar", "pub", "pizza", "grill", "tavern", "diner", "bakery", "brew", "donut", "chocolate", "coffee", "wine", "bean")):
        return "food"
    if any(token in blob for token in ("dentist", "ortho", "chiro", "vet", "clinic", "rehab", "health", "med", "massage")):
        return "care"
    if any(token in blob for token in ("plumb", "hvac", "roof", "electric", "insulat", "auto", "repair", "construct", "landscap", "clean", "remodel", "mechan")):
        return "trade"
    if any(token in blob for token in ("camp", "hotel", "motel", "tour", "park", "charter", "golf", "inn")):
        return "visit"
    return "shop"


def hook_for(row: dict) -> str:
    name = clean_text(row["business"])
    city = clean_text(row.get("city") or "Erie")
    reason = clean_text(row.get("localPlaceReason") or "")
    lane = category_lane(row)
    if city.lower() != "erie":
        place = city
    else:
        place = "Erie"
    if lane == "food":
        return f"{name} should be the first table people think of in {place}. Right now the internet still makes them work for it."
    if lane == "care":
        return f"When someone in {place} needs {name}, they should get you in one look. Not a scavenger hunt."
    if lane == "trade":
        return f"If a {place} phone is about to call a trade, {name} should already be the obvious answer."
    if lane == "visit":
        return f"{name} should own the {place} search before a visitor ever opens a second tab."
    article = "an" if place[:1].lower() in "aeiou" else "a"
    if reason and "should be easier" in reason.lower():
        return f"{name} is {article} {place} name that should already own the search. It does not yet."
    return f"{name} should be easier to find in {place} than it is tonight."


def offer_for(row: dict) -> str:
    lane = category_lane(row)
    if lane == "food":
        return "Give me 15 minutes and I will show you how we rebuild the first screen so a hungry person and an AI search both get the simple version: what you cook, who it is for, and why to come in. Then we add tours, film, and the rest."
    if lane == "care":
        return "Give me 15 minutes and I will show you how we rebuild the first screen so a family and an AI search both get the simple version: what you do, who you help, and why to call first. Then we add tours, film, and the rest."
    if lane == "trade":
        return "Give me 15 minutes and I will show you how we rebuild the first screen so a homeowner and an AI search both get the simple version: what you fix, where you work, and why to call you first. Then we add tours, film, and the rest."
    if lane == "visit":
        return "Give me 15 minutes and I will show you how we rebuild the first screen so a visitor and an AI search both get the simple version: what the stay feels like, where you sit, and why to book you first. Then we add tours, film, and the rest."
    return "Give me 15 minutes and I will show you how we rebuild the first screen so a visitor and an AI search both get the simple version: what you do, who it is for, and why to call you first. Then we add tours, film, and the rest."


def subject_for(row: dict) -> str:
    name = clean_text(row["business"])
    city = clean_text(row.get("city") or "Erie")
    if city.lower() == "erie":
        return f"{name} should own the Erie search"
    return f"{name} should own the {city} search"


def story_block() -> str:
    return (
        "Grew up in Erie with this. Marketing started at McDowell, then Mercyhurst. "
        "Eight years in engineering and marketing after that, and I put the whole mix into the AI work I run at Momentum. "
        "Now I want that working for shops here, not sitting in a deck."
    )


def proof_links_html() -> str:
    links = [
        ("Need Momentum", "https://www.needmomentum.com/"),
        ("Need Momentum services", "https://www.needmomentum.com/services/"),
        ("AI Overviews and tours", "https://www.needmomentum.com/ai-overviews/"),
        ("Virtual tours", "https://www.needmomentum.com/virtual-tours/"),
        ("Momentum 360", "https://www.momentumvirtualtours.com/"),
        ("A scroll driven film we just finished", "https://momentum-360-scroll-story-20260830-212.netlify.app"),
    ]
    parts = []
    for index, (label, url) in enumerate(links):
        bottom = "16px" if index == len(links) - 1 else "8px"
        parts.append(
            f'<p style="margin:0 0 {bottom};"><a href="{url}" style="color:#075ca8;font-weight:700;text-decoration:none;">{label}</a></p>'
        )
    return "\n  ".join(parts)


def signature_html() -> str:
    return """<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-top:20px;font-family:Arial,Helvetica,sans-serif;color:#14314f;">
    <tr>
      <td style="padding:0 14px 0 0;vertical-align:middle;">
        <a href="https://www.needmomentum.com/" style="text-decoration:none;">
          <img src="https://momentum-workshop-pilot.netlify.app/assets/momentum-360-logo.png" width="72" height="72" alt="Momentum 360" style="display:block;width:72px;height:72px;border:0;border-radius:50%;">
        </a>
      </td>
      <td style="padding:0 0 0 14px;vertical-align:middle;border-left:3px solid #e6a23c;">
        <div style="font-size:17px;line-height:21px;font-weight:700;color:#075ca8;">Dillon Mohr</div>
        <div style="margin-top:2px;font-size:13px;line-height:18px;font-weight:700;color:#d4a017;">AI Marketing Director <span style="color:#075ca8;">|</span> Account Manager</div>
        <div style="margin-top:5px;font-size:13px;line-height:18px;">
          <a href="tel:+18148735333" style="color:#d4a017;text-decoration:none;font-weight:700;">814.873.5333</a>
        </div>
        <div style="margin-top:2px;font-size:13px;line-height:18px;">
          <a href="https://www.needmomentum.com/" style="color:#075ca8;text-decoration:none;font-weight:700;">needmomentum.com</a>
        </div>
        <div style="margin-top:4px;font-size:12px;line-height:17px;color:#8a94a0;">Momentum 360 · Philadelphia</div>
      </td>
    </tr>
  </table>"""


def html_message(row: dict) -> str:
    hook = escape(hook_for(row))
    observation = escape(clean_text(row.get("liveSiteObservation") or f"I opened the live {row['business']} site this week."))
    offer = escape(offer_for(row))
    story = escape(story_block())
    url = row.get("officialUrl") or ""
    site = escape(host_label(url) or url)
    site_block = ""
    if url:
        site_block = (
            f'<p style="margin:0 0 16px;">Your current site is here: '
            f'<a href="{escape(url)}" style="color:#075ca8;font-weight:700;text-decoration:none;">{site}</a></p>'
        )
    return f"""<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#203346;max-width:620px;">
  <p style="margin:0 0 16px;">Hey,</p>
  <p style="margin:0 0 16px;">{hook}</p>
  <p style="margin:0 0 16px;">{observation}</p>
  <p style="margin:0 0 16px;">{story}</p>
  <p style="margin:0 0 16px;">{offer}</p>
  {site_block}
  <p style="margin:0 0 16px;">These are live:</p>
  {proof_links_html()}
  <p style="margin:0 0 16px;">Reply and I will walk you through the 15 minute version. Just me on this note. Nobody else from the company is copied.</p>
  <p style="margin:0;">Thanks,</p>
  {signature_html()}
  <div style="margin-top:22px;padding-top:12px;border-top:1px solid #dce5ec;font-size:11px;line-height:16px;color:#728294;">
    <p style="margin:0 0 5px;">Momentum Digital, 1635 Market St. #1601, Philadelphia, PA 19103.</p>
    <p style="margin:0;">If this is not useful, reply stop and I will remove you.</p>
  </div>
</div>
"""


def text_message(row: dict) -> str:
    name = clean_text(row["business"])
    observation = clean_text(row.get("liveSiteObservation") or f"I opened the live {name} site this week.")
    url = row.get("officialUrl") or ""
    lines = [
        "Hey,",
        "",
        hook_for(row),
        "",
        observation,
        "",
        story_block(),
        "",
        offer_for(row),
        "",
    ]
    if url:
        lines.extend([f"Your current site is here: {url}", ""])
    lines.extend(
        [
            "These are live:",
            "Need Momentum: https://www.needmomentum.com/",
            "Need Momentum services: https://www.needmomentum.com/services/",
            "AI Overviews and tours: https://www.needmomentum.com/ai-overviews/",
            "Virtual tours: https://www.needmomentum.com/virtual-tours/",
            "Momentum 360: https://www.momentumvirtualtours.com/",
            "A scroll driven film we just finished: https://momentum-360-scroll-story-20260830-212.netlify.app",
            "",
            "Reply and I will walk you through the 15 minute version. Just me on this note. Nobody else from the company is copied.",
            "",
            "Thanks,",
            "Dillon Mohr",
            "AI Marketing Director | Account Manager",
            "814.873.5333",
            "needmomentum.com",
            "Momentum 360 · Philadelphia",
        ]
    )
    return "\n".join(lines)


def load_rows() -> list[dict]:
    wave2 = LIST / "erie-wave2-sendable.json"
    if wave2.exists():
        return json.loads(wave2.read_text(encoding="utf-8"))
    return json.loads((LIST / "erie-sendable.json").read_text(encoding="utf-8"))


def main() -> None:
    rows = load_rows()
    unique: list[dict] = []
    seen_email: set[str] = set()
    seen_domain: set[str] = set()
    for row in rows:
        email = (row.get("email") or "").lower()
        domain = (row.get("domain") or "").lower()
        if not email or email in seen_email:
            continue
        if domain and domain in seen_domain:
            continue
        seen_email.add(email)
        if domain:
            seen_domain.add(domain)
        unique.append(row)
        if len(unique) >= MAX_SEND:
            break
    messages = []
    for row in unique:
        messages.append(
            {
                "business": row["business"],
                "city": row.get("city") or "Erie",
                "email": row["email"],
                "officialUrl": row.get("officialUrl"),
                "domain": row.get("domain"),
                "emailSource": row.get("emailSource"),
                "subject": subject_for(row),
                "text": text_message(row),
                "html": html_message(row),
                "status": "ready",
            }
        )
    payload = {
        "builtAtUtc": datetime.now(timezone.utc).isoformat(),
        "fromMailbox": "dillonmohr8777@gmail.com",
        "cc": [],
        "count": len(messages),
        "rule": "Human Erie hometown notes. Published emails only. Exact six proof links. Exact Philadelphia signature. No Sean or Mac CC.",
        "messages": messages,
    }
    (ROOT / "erie-wave2-messages.json").write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"count": len(messages), "emails": [m["email"] for m in messages[:12]]}, indent=2))


if __name__ == "__main__":
    main()
