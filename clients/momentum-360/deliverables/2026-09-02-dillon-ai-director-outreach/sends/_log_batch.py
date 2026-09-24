import json
import sys

logp = r"C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-09-02-dillon-ai-director-outreach\sends\erie-wave2-send-log.jsonl"
rows = json.loads(sys.argv[1])
with open(logp, "a", encoding="utf-8") as f:
    for rec in rows:
        f.write(json.dumps({
            "business": rec["business"],
            "email": rec["email"],
            "messageId": rec.get("messageId"),
            "status": rec["status"],
            "error": rec.get("error"),
        }, ensure_ascii=False) + "\n")
print("logged", len(rows))
