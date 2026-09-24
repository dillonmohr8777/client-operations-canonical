import json
import sys
from pathlib import Path

log = Path(
    r"C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-09-02-dillon-ai-director-outreach\sends\erie-wave2-send-log.jsonl"
)
rec = json.loads(sys.argv[1])
with log.open("a", encoding="utf-8") as f:
    f.write(json.dumps(rec, ensure_ascii=False) + "\n")
print("logged", rec.get("email"), rec.get("status"))
