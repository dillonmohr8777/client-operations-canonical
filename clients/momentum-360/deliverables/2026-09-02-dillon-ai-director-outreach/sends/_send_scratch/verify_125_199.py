import json
from pathlib import Path

batch = json.loads(
    Path(
        r"C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-09-02-dillon-ai-director-outreach\sends\_send_scratch\batch-125-199.json"
    ).read_text(encoding="utf-8")
)
log_path = Path(
    r"C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-09-02-dillon-ai-director-outreach\sends\erie-wave2-send-log.jsonl"
)
logged = {}
for line in log_path.read_text(encoding="utf-8").splitlines():
    if not line.strip():
        continue
    rec = json.loads(line)
    logged[rec["email"].lower()] = rec
sent = []
failed = []
missing = []
for m in batch:
    rec = logged.get(m["email"].lower())
    if rec is None:
        missing.append({"index": m.get("index"), "business": m["business"], "email": m["email"]})
    elif rec.get("status") == "sent" and rec.get("messageId"):
        sent.append(m["email"])
    else:
        failed.append(
            {
                "index": m.get("index"),
                "business": m["business"],
                "email": m["email"],
                "status": rec.get("status"),
                "error": rec.get("error"),
            }
        )
print("range_count", len(batch))
print("sent", len(sent))
print("failed", len(failed))
print("missing", len(missing))
if failed:
    print("FAILED")
    print(json.dumps(failed, indent=2))
if missing:
    print("MISSING")
    print(json.dumps(missing, indent=2))
