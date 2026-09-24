import json
import sys
from pathlib import Path

log = Path(
    r"C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-09-02-dillon-ai-director-outreach\sends\erie-wave2-send-log.jsonl"
)
src = Path(sys.argv[1])
recs = json.loads(src.read_text(encoding="utf-8"))
existing = set()
if log.exists():
    for line in log.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            existing.add(json.loads(line).get("email"))
        except json.JSONDecodeError:
            continue
added = 0
with log.open("a", encoding="utf-8") as f:
    for r in recs:
        if r.get("email") in existing:
            continue
        f.write(json.dumps(r, ensure_ascii=False) + "\n")
        existing.add(r.get("email"))
        added += 1
print("appended", added, "skipped", len(recs) - added, "total_lines", sum(1 for _ in log.open(encoding="utf-8")))
