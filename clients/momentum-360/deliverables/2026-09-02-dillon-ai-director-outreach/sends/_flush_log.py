import json
import os

src = r"C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-09-02-dillon-ai-director-outreach\sends\_log_rows.json"
logp = r"C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-09-02-dillon-ai-director-outreach\sends\erie-wave2-send-log.jsonl"

with open(src, encoding="utf-8") as f:
    rows = json.load(f)

existing = set()
if os.path.exists(logp):
    with open(logp, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            rec = json.loads(line)
            existing.add(rec.get("email"))

added = 0
with open(logp, "a", encoding="utf-8") as f:
    for rec in rows:
        if rec.get("email") in existing:
            continue
        f.write(json.dumps({
            "business": rec["business"],
            "email": rec["email"],
            "messageId": rec.get("messageId"),
            "status": rec["status"],
            "error": rec.get("error"),
        }, ensure_ascii=False) + "\n")
        existing.add(rec["email"])
        added += 1

print(f"added={added} total_unique={len(existing)}")
