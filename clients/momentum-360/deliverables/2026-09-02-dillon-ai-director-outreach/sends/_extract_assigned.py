import json
from pathlib import Path

src = Path(
    r"C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-09-02-dillon-ai-director-outreach\sends\erie-wave2-messages.json"
)
out = Path(
    r"C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-09-02-dillon-ai-director-outreach\sends\_send_scratch"
)
out.mkdir(exist_ok=True)
data = json.loads(src.read_text(encoding="utf-8"))
msgs = data["messages"]
idxs = [1] + list(range(3, 50))
print("count", len(idxs), "total_messages", len(msgs))
lines = []
for i in idxs:
    m = msgs[i]
    payload = {
        "index": i,
        "business": m["business"],
        "email": m["email"],
        "subject": m["subject"],
        "text": m["text"],
        "html": m["html"],
        "status": m.get("status"),
    }
    (out / f"{i:02d}.json").write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
    line = f"{i:02d}\t{m['business']}\t{m['email']}\t{m.get('status')}"
    print(line)
    lines.append(line)
(out / "assigned-index.txt").write_text("\n".join(lines), encoding="utf-8")
