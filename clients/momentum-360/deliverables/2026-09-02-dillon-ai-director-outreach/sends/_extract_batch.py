import json
import os

p = r"C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-09-02-dillon-ai-director-outreach\sends\erie-wave2-messages.json"
logp = r"C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-09-02-dillon-ai-director-outreach\sends\erie-wave2-send-log.jsonl"
outp = r"C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-09-02-dillon-ai-director-outreach\sends\erie-wave2-batch-50-124.json"

with open(p, encoding="utf-8") as f:
    data = json.load(f)

msgs = data["messages"]
subset = msgs[50:125]
print("total", len(msgs), "subset", len(subset))
print("fromMailbox", data.get("fromMailbox"))

slim = []
for i, m in enumerate(subset):
    slim.append({
        "index": 50 + i,
        "business": m["business"],
        "email": m["email"],
        "subject": m["subject"],
        "text": m["text"],
        "html": m["html"],
        "status": m.get("status"),
    })
    print(f"{50+i}\t{m['email']}\t{m['business']}")

with open(outp, "w", encoding="utf-8") as f:
    json.dump(slim, f, ensure_ascii=False)
print("wrote", outp)
print("log_exists", os.path.exists(logp))
if os.path.exists(logp):
    with open(logp, encoding="utf-8") as f:
        lines = [ln for ln in f if ln.strip()]
    print("log_lines", len(lines))
