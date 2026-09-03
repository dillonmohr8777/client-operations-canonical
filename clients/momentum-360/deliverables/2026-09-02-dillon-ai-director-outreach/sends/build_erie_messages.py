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
MAX_SEND = 150


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


def subject_for(row: dict) -> str:
    name = clean_text(row["business"])
    city = clean_text(row.get("city") or "Erie")
    if city.lower() == "erie":
        return f"A note from Erie on {name}"
    return f"A note from Erie on {name} in {city}"


def html_message(row: dict) -> str:
    name = escape(clean_text(row["business"]))
    reason = escape(clean_text(row.get("localPlaceReason") or f"{row['business']} is an Erie name that should be easier to find online"))
    observation = escape(clean_text(row.get("liveSiteObservation") or f"I opened the live {row['business']} site this week."))
    gap = escape(
        clean_text(
            row.get("aiGap")
            or "What a visitor or an AI tool still has to assemble is the simple Erie version: what you do, who it is for, and why to call you first."
        )
    )
    url = row.get("officialUrl") or ""
    site = escape(host_label(url) or url)
    site_block = ""
    if url:
        site_block = (
            f'<p style="margin:0 0 16px;">Your current site is here: '
            f'<a href="{escape(url)}" style="color:#075ca8;font-weight:700;text-decoration:none;">{site}</a></p>'
        )
    return f"""<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#203346;max-width:620px;">
  <p style="margin:0 0 16px;">Hi there,</p>
  <p style="margin:0 0 16px;">I am Dillon Mohr. I grew up in Erie, and I am the AI Marketing Director at Momentum. I looked at {name} this week because {reason}.</p>
  <p style="margin:0 0 16px;">{observation}</p>
  <p style="margin:0 0 16px;">{gap} That is the first thing I would fix, then wrap it in tours, film, and the rest of the front of house stack we already run.</p>
  {site_block}
  <p style="margin:0 0 16px;">If you want to see the company and the work, these are live:</p>
  <p style="margin:0 0 8px;"><a href="https://www.needmomentum.com/" style="color:#075ca8;font-weight:700;text-decoration:none;">Need Momentum</a></p>
  <p style="margin:0 0 8px;"><a href="https://www.needmomentum.com/services/" style="color:#075ca8;font-weight:700;text-decoration:none;">Need Momentum services</a></p>
  <p style="margin:0 0 8px;"><a href="https://www.needmomentum.com/ai-overviews/" style="color:#075ca8;font-weight:700;text-decoration:none;">AI Overviews and tours</a></p>
  <p style="margin:0 0 8px;"><a href="https://www.needmomentum.com/virtual-tours/" style="color:#075ca8;font-weight:700;text-decoration:none;">Virtual tours</a></p>
  <p style="margin:0 0 8px;"><a href="https://www.momentumvirtualtours.com/" style="color:#075ca8;font-weight:700;text-decoration:none;">Momentum 360</a></p>
  <p style="margin:0 0 8px;"><a href="https://www.momentumvirtualtours.com/services/" style="color:#075ca8;font-weight:700;text-decoration:none;">Tours, photo, video, web, ads, and SEO</a></p>
  <p style="margin:0 0 8px;"><a href="https://need-momentum-signal-20260803.netlify.app" style="color:#075ca8;font-weight:700;text-decoration:none;">The moving Need Momentum homepage</a></p>
  <p style="margin:0 0 16px;"><a href="https://momentum-360-scroll-story-20260830-212.netlify.app" style="color:#075ca8;font-weight:700;text-decoration:none;">A scroll driven film we just finished</a></p>
  <p style="margin:0 0 16px;">If you want the free public audit on the current site, it is here: <a href="https://www.needmomentum.com/free-website-seo-audit/" style="color:#075ca8;font-weight:700;text-decoration:none;">needmomentum.com/free-website-seo-audit</a></p>
  <p style="margin:0 0 16px;">I sent this from my email. Nobody else from the company is copied. If the 15 minute version would help, reply and I will walk you through it.</p>
  <p style="margin:0;">Thanks,</p>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-top:20px;font-family:Arial,Helvetica,sans-serif;color:#14314f;">
    <tr>
      <td style="padding:0 14px 0 0;vertical-align:middle;">
        <a href="https://www.needmomentum.com/" style="text-decoration:none;">
          <img src="https://momentum-workshop-pilot.netlify.app/assets/momentum-360-logo.png" width="72" height="72" alt="Momentum 360" style="display:block;width:72px;height:72px;border:0;border-radius:50%;">
        </a>
      </td>
      <td style="padding:0 0 0 14px;vertical-align:middle;border-left:3px solid #f2b84b;">
        <div style="font-size:17px;line-height:21px;font-weight:700;color:#075ca8;">Dillon Mohr</div>
        <div style="margin-top:2px;font-size:13px;line-height:18px;font-weight:700;color:#14314f;">AI Marketing Director <span style="color:#f2b84b;">|</span> Account Manager</div>
        <div style="margin-top:5px;font-size:13px;line-height:18px;color:#526679;">
          <a href="tel:+18148735333" style="color:#526679;text-decoration:none;">814.873.5333</a>
          <span style="color:#f2b84b;"> | </span>
          <a href="https://www.needmomentum.com/" style="color:#075ca8;text-decoration:none;font-weight:700;">needmomentum.com</a>
        </div>
        <div style="font-size:12px;line-height:17px;color:#728294;">Momentum 360 · Erie, Pennsylvania</div>
      </td>
    </tr>
  </table>
  <div style="margin-top:22px;padding-top:12px;border-top:1px solid #dce5ec;font-size:11px;line-height:16px;color:#728294;">
    <p style="margin:0 0 5px;">Dillon Mohr is sending this note himself. He is from Erie. Momentum Digital, 1635 Market St. #1601, Philadelphia, PA 19103.</p>
    <p style="margin:0;">If this is not useful, reply stop and I will remove you.</p>
  </div>
</div>
"""


def text_message(row: dict) -> str:
    name = clean_text(row["business"])
    reason = clean_text(row.get("localPlaceReason") or f"{name} is an Erie name that should be easier to find online")
    observation = clean_text(row.get("liveSiteObservation") or f"I opened the live {name} site this week.")
    gap = clean_text(
        row.get("aiGap")
        or "What a visitor or an AI tool still has to assemble is the simple Erie version: what you do, who it is for, and why to call you first."
    )
    url = row.get("officialUrl") or ""
    lines = [
        "Hi there,",
        "",
        f"I am Dillon Mohr. I grew up in Erie, and I am the AI Marketing Director at Momentum. I looked at {name} this week because {reason}.",
        "",
        observation,
        "",
        f"{gap} That is the first thing I would fix, then wrap it in tours, film, and the rest of the front of house stack we already run.",
        "",
    ]
    if url:
        lines.extend([f"Your current site is here: {url}", ""])
    lines.extend(
        [
            "Need Momentum: https://www.needmomentum.com/",
            "Need Momentum services: https://www.needmomentum.com/services/",
            "AI Overviews and tours: https://www.needmomentum.com/ai-overviews/",
            "Virtual tours: https://www.needmomentum.com/virtual-tours/",
            "Momentum 360: https://www.momentumvirtualtours.com/",
            "Tours, photo, video, web, ads, and SEO: https://www.momentumvirtualtours.com/services/",
            "The moving Need Momentum homepage: https://need-momentum-signal-20260803.netlify.app",
            "A scroll driven film we just finished: https://momentum-360-scroll-story-20260830-212.netlify.app",
            "Free public audit: https://www.needmomentum.com/free-website-seo-audit/",
            "",
            "I sent this from my email. Nobody else from the company is copied. If the 15 minute version would help, reply and I will walk you through it.",
            "",
            "Thanks,",
            "Dillon Mohr",
            "AI Marketing Director | Account Manager",
            "814.873.5333 | needmomentum.com",
            "Momentum 360 · Erie, Pennsylvania",
        ]
    )
    return "\n".join(lines)


def main() -> None:
    rows = json.loads((LIST / "erie-sendable.json").read_text(encoding="utf-8"))
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
        "rule": "Erie hometown notes. Published emails only. No Pittsburgh. No Sean or Mac CC.",
        "messages": messages,
    }
    (ROOT / "erie-messages.json").write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"count": len(messages), "emails": [m["email"] for m in messages[:10]]}, indent=2))


if __name__ == "__main__":
    main()
