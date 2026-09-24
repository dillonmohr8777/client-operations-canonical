import json
from pathlib import Path

LOG = Path(
    r"C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-09-02-dillon-ai-director-outreach\sends\erie-wave2-send-log.jsonl"
)
BATCH = Path(
    r"C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-09-02-dillon-ai-director-outreach\sends\_send_scratch\_log_batch.json"
)
rows = json.loads(BATCH.read_text(encoding="utf-8"))
existing = set()
if LOG.exists():
    for line in LOG.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        rec = json.loads(line)
        existing.add(rec.get("email"))
added = 0
with LOG.open("a", encoding="utf-8") as f:
    for row in rows:
        if row["email"] in existing:
            continue
        f.write(json.dumps(row, ensure_ascii=False) + "\n")
        added += 1
print(f"added={added} total_exists={LOG.exists()} size={LOG.stat().st_size}")
