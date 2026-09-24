import json
import sys

src = r"C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-09-02-dillon-ai-director-outreach\sends\erie-wave2-batch-50-124.json"
start, end = int(sys.argv[1]), int(sys.argv[2])
with open(src, encoding="utf-8") as f:
    data = json.load(f)
# data is 0-based list covering original indexes 50-124
# dump by original index
by_idx = {m["index"]: m for m in data}
out_dir = r"C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-09-02-dillon-ai-director-outreach\sends\_pending"
import os
os.makedirs(out_dir, exist_ok=True)
for i in range(start, end + 1):
    m = by_idx[i]
    path = os.path.join(out_dir, f"{i}.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump({
            "index": m["index"],
            "business": m["business"],
            "email": m["email"],
            "subject": m["subject"],
            "body": m["text"],
            "htmlBody": m["html"],
        }, f, ensure_ascii=False)
    print(path)
