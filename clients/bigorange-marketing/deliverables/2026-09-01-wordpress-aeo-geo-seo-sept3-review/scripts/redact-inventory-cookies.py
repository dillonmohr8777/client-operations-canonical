#!/usr/bin/env python3
"""Strip Set-Cookie and cookie-like headers from the live inventory JSON."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INVENTORY = ROOT / "evidence" / "live-site-inventory.json"
COOKIE_KEYS = {"set-cookie", "cookie", "authorization"}


def scrub(node):
    if isinstance(node, dict):
        return {
            key: "[redacted]" if key.lower() in COOKIE_KEYS else scrub(value)
            for key, value in node.items()
        }
    if isinstance(node, list):
        return [scrub(item) for item in node]
    return node


def main() -> None:
    data = json.loads(INVENTORY.read_text(encoding="utf-8-sig"))
    INVENTORY.write_text(
        json.dumps(scrub(data), indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(f"redacted {INVENTORY}")


if __name__ == "__main__":
    main()
