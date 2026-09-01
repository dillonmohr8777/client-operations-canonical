from __future__ import annotations

import argparse
import json
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parent
SENT_PATH = ROOT / "sent.jsonl"
STATE_PATH = ROOT / "state.json"
CAMPAIGN_PATH = ROOT / "campaign.json"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, help="JSON array of send results")
    args = parser.parse_args()

    campaign = json.loads(CAMPAIGN_PATH.read_text(encoding="utf-8"))
    tz = ZoneInfo(str(campaign.get("timezone") or "America/New_York"))
    results = json.loads(Path(args.input).read_text(encoding="utf-8"))
    if not isinstance(results, list):
        raise SystemExit("input must be a JSON array")

    with SENT_PATH.open("a", encoding="utf-8") as handle:
        for row in results:
            email = str(row.get("email", "")).strip().lower()
            if not email:
                continue
            record = {
                "email": email,
                "city": row.get("city", ""),
                "state": row.get("state", ""),
                "subject": row.get("subject", ""),
                "fromMailbox": row.get("fromMailbox", campaign.get("fromMailbox")),
                "status": row.get("status", "sent"),
                "messageId": row.get("messageId", ""),
                "sentAt": row.get("sentAt") or datetime.now(tz).isoformat(),
                "batchDate": row.get("batchDate", datetime.now(tz).date().isoformat()),
            }
            handle.write(json.dumps(record, ensure_ascii=True) + "\n")

    sent_count = 0
    if SENT_PATH.exists():
        sent_count = sum(1 for line in SENT_PATH.read_text(encoding="utf-8").splitlines() if line.strip())

    state = {}
    if STATE_PATH.exists():
        state = json.loads(STATE_PATH.read_text(encoding="utf-8"))
    state.update(
        {
            "sentCount": sent_count,
            "remaining": max(0, 5801 - sent_count),
            "status": "complete" if sent_count >= 5801 else "active",
            "updatedAt": datetime.now(tz).isoformat(),
        }
    )
    STATE_PATH.write_text(json.dumps(state, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"recorded": len(results), "sentCount": sent_count, "remaining": state["remaining"]}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
