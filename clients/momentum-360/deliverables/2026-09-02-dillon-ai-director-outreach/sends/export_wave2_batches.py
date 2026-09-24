"""Split wave 2 messages into small send batches."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
payload = json.loads((ROOT / "erie-wave2-messages.json").read_text(encoding="utf-8"))
messages = payload["messages"]
size = 20
for start in range(0, len(messages), size):
    chunk = messages[start : start + size]
    out = {
        "fromMailbox": "dillonmohr8777@gmail.com",
        "start": start,
        "count": len(chunk),
        "messages": [
            {
                "business": m["business"],
                "email": m["email"],
                "subject": m["subject"],
                "text": m["text"],
                "html": m["html"],
            }
            for m in chunk
        ],
    }
    path = ROOT / f"wave2-batch-{start:03d}.json"
    path.write_text(json.dumps(out) + "\n", encoding="utf-8")
    print(path.name, len(chunk))
