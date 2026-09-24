import json
from pathlib import Path

root = Path(__file__).resolve().parent.parent
payload = json.loads((root / "erie-wave2-messages.json").read_text(encoding="utf-8"))
msgs = payload["messages"]
chunk = msgs[125:200]
print("total", len(msgs), "chunk", len(chunk))
out = []
for i, m in enumerate(chunk, start=125):
    out.append(
        {
            "index": i,
            "business": m["business"],
            "email": m["email"],
            "subject": m["subject"],
            "text": m["text"],
            "html": m["html"],
            "status": m.get("status"),
        }
    )
    print(f"{i:03d} {m['email']} | {m['business']}")
dest = Path(__file__).resolve().parent / "batch-125-199.json"
dest.write_text(json.dumps(out, ensure_ascii=False), encoding="utf-8")
print("wrote", dest, "bytes", dest.stat().st_size)
