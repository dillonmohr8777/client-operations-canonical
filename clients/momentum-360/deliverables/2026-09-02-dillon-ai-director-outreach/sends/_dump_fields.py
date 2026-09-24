import json
import sys
from pathlib import Path

p = Path(
    r"C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-09-02-dillon-ai-director-outreach\sends\_send_scratch"
)
start = int(sys.argv[1])
end = int(sys.argv[2])
for i in range(start, end + 1):
    d = json.loads((p / f"{i:02d}.json").read_text(encoding="utf-8"))
    print(f"=== {i} ===")
    print(d["business"])
    print(d["email"])
    print(d["subject"])
    print("---TEXT---")
    print(d["text"])
    print("---HTML---")
    print(d["html"])
    print("===END===")
