from __future__ import annotations

import argparse
import csv
import json
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parent
CAMPAIGN_PATH = ROOT / "campaign.json"
SENT_PATH = ROOT / "sent.jsonl"
SUPPRESSED_PATH = ROOT / "suppressed.jsonl"
STATE_PATH = ROOT / "state.json"
BATCH_DIR = ROOT / "batches"


def load_json(path: Path, default):
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding="utf-8"))


def load_jsonl(path: Path) -> list[dict]:
    if not path.exists():
        return []
    rows = []
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line:
            rows.append(json.loads(line))
    return rows


def emails_from_log(rows: list[dict]) -> set[str]:
    return {str(row.get("email", "")).strip().lower() for row in rows if row.get("email")}


def render(template: str, values: dict[str, str]) -> str:
    out = template
    for key, value in values.items():
        out = out.replace("{{" + key + "}}", value)
    return out


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--date", default="")
    args = parser.parse_args()

    campaign = load_json(CAMPAIGN_PATH, {})
    limit = args.limit or int(campaign.get("dailyLimit") or 50)
    tz = ZoneInfo(str(campaign.get("timezone") or "America/New_York"))
    day = args.date or datetime.now(tz).date().isoformat()

    csv_path = (ROOT / campaign["sourceCsv"]).resolve()
    html_template = (ROOT / "template.html").read_text(encoding="utf-8")
    text_template = (ROOT / "template.txt").read_text(encoding="utf-8")
    signature = Path(campaign["signaturePath"]).read_text(encoding="utf-8")

    sent = emails_from_log(load_jsonl(SENT_PATH))
    suppressed = emails_from_log(load_jsonl(SUPPRESSED_PATH))
    skip = sent | suppressed

    selected = []
    with csv_path.open(encoding="utf-8", newline="") as handle:
        for row in csv.DictReader(handle):
            email = (row.get("email") or "").strip().lower()
            if not email or email in skip:
                continue
            city = (row.get("city") or "").strip() or "your city"
            selected.append(
                {
                    "email": email,
                    "company": (row.get("company") or "").strip(),
                    "city": city,
                    "state": (row.get("state") or "").strip(),
                    "website": (row.get("website") or "").strip(),
                    "source_url": (row.get("source_url") or "").strip(),
                    "subject": f"Quick note for The UPS Store in {city}",
                    "html": render(html_template, {"city": city, "signature": signature}),
                    "text": render(text_template, {"city": city}),
                }
            )
            if len(selected) >= limit:
                break

    BATCH_DIR.mkdir(parents=True, exist_ok=True)
    batch_path = BATCH_DIR / f"{day}.json"
    payload = {
        "campaignId": campaign.get("campaignId"),
        "date": day,
        "fromMailbox": campaign.get("fromMailbox"),
        "fromName": campaign.get("fromName"),
        "count": len(selected),
        "remainingAfter": max(0, 5801 - len(sent) - len(selected)),
        "messages": selected,
    }
    batch_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    state = {
        "campaignId": campaign.get("campaignId"),
        "status": "complete" if not selected and not (5801 - len(sent)) else "active",
        "timezone": campaign.get("timezone"),
        "dailyLimit": limit,
        "fromMailbox": campaign.get("fromMailbox"),
        "lastBatchDate": day,
        "lastBatchCount": len(selected),
        "lastBatchPath": str(batch_path.relative_to(ROOT)).replace("\\", "/"),
        "sentCount": len(sent),
        "suppressedCount": len(suppressed),
        "remaining": max(0, 5801 - len(sent) - len(suppressed) - len(selected)),
        "updatedAt": datetime.now(tz).isoformat(),
    }
    STATE_PATH.write_text(json.dumps(state, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(state, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
