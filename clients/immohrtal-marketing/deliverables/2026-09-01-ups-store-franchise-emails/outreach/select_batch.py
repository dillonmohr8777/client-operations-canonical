from __future__ import annotations

import argparse
import csv
import json
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parent
CAMPAIGN_PATH = ROOT / "campaign.json"
WARMUP_PATH = ROOT / "warmup.json"
SENT_PATH = ROOT / "sent.jsonl"
SUPPRESSED_PATH = ROOT / "suppressed.jsonl"
STATE_PATH = ROOT / "state.json"
BATCH_DIR = ROOT / "batches"
LIST_SIZE = 5801


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


def warmup_limit(warmup: dict, day: str, requested: int) -> int:
    if not warmup.get("enabled"):
        return requested
    start = str(warmup.get("warmupStartDate") or day)
    tz_day = datetime.fromisoformat(day).date()
    start_day = datetime.fromisoformat(start).date()
    offset = (tz_day - start_day).days + 1
    if offset < 1:
        return 0
    for window in warmup.get("calendar") or []:
        if int(window["fromDay"]) <= offset <= int(window["toDay"]):
            return min(requested, int(window["maxSends"]))
    return min(requested, 10)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--date", default="")
    parser.add_argument("--ignore-warmup", action="store_true")
    args = parser.parse_args()

    campaign = load_json(CAMPAIGN_PATH, {})
    warmup = load_json(WARMUP_PATH, {})
    requested = args.limit or int(campaign.get("dailyLimit") or 50)
    tz = ZoneInfo(str(campaign.get("timezone") or "America/New_York"))
    day = args.date or datetime.now(tz).date().isoformat()
    limit = requested if args.ignore_warmup else warmup_limit(warmup, day, requested)

    csv_path = (ROOT / campaign["sourceCsv"]).resolve()
    html_template = (ROOT / "template.html").read_text(encoding="utf-8")
    text_template = (ROOT / "template.txt").read_text(encoding="utf-8")
    signature = Path(campaign["signaturePath"]).read_text(encoding="utf-8")

    sent = emails_from_log(load_jsonl(SENT_PATH))
    suppressed = emails_from_log(load_jsonl(SUPPRESSED_PATH))
    skip = sent | suppressed

    selected = []
    if limit > 0:
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
                        "subject": f"The UPS Store in {city}",
                        "html": render(html_template, {"city": city, "signature": signature}),
                        "text": render(text_template, {"city": city}),
                    }
                )
                if len(selected) >= limit:
                    break

    BATCH_DIR.mkdir(parents=True, exist_ok=True)
    batch_path = BATCH_DIR / f"{day}.json"
    remaining_unsent = max(0, LIST_SIZE - len(sent) - len(suppressed))
    payload = {
        "campaignId": campaign.get("campaignId"),
        "date": day,
        "fromMailbox": campaign.get("fromMailbox"),
        "fromName": campaign.get("fromName"),
        "count": len(selected),
        "warmupLimit": limit,
        "requestedLimit": requested,
        "remainingAfter": max(0, remaining_unsent - len(selected)),
        "messages": selected,
    }
    batch_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    prior = load_json(STATE_PATH, {})
    state = {
        "campaignId": campaign.get("campaignId"),
        "status": "complete" if remaining_unsent == 0 else "active",
        "timezone": campaign.get("timezone"),
        "dailyLimit": requested,
        "warmupLimit": limit,
        "fromMailbox": campaign.get("fromMailbox"),
        "lastBatchDate": day,
        "lastBatchCount": len(selected),
        "lastBatchPath": str(batch_path.relative_to(ROOT)).replace("\\", "/"),
        "sentCount": len(sent),
        "suppressedCount": len(suppressed),
        "remaining": remaining_unsent,
        "updatedAt": datetime.now(tz).isoformat(),
        "sendBlocked": prior.get("sendBlocked", "workspace_gmail_not_connected"),
        "warmupEnabled": bool(warmup.get("enabled")) and not args.ignore_warmup,
    }
    STATE_PATH.write_text(json.dumps(state, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(state, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
