from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CAMPAIGN_PATH = ROOT / "campaign.json"


def load_campaign() -> dict:
    return json.loads(CAMPAIGN_PATH.read_text(encoding="utf-8"))


def assert_workspace_sender(live_mailbox: str) -> str:
    campaign = load_campaign()
    required = str(campaign["fromMailbox"]).strip().lower()
    forbidden = {str(item).strip().lower() for item in campaign.get("forbiddenFrom", [])}
    live = (live_mailbox or "").strip().lower()
    if not live:
        raise SystemExit("sender mailbox is empty")
    if live in forbidden or live != required:
        raise SystemExit(
            f"refusing send: live mailbox {live} is not {required}. "
            "Connect Google Workspace Gmail as dillon@immohrtalmarketing.com."
        )
    return live


def main() -> int:
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("--live-mailbox", required=True)
    args = parser.parse_args()
    mailbox = assert_workspace_sender(args.live_mailbox)
    print(json.dumps({"ok": True, "fromMailbox": mailbox}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
