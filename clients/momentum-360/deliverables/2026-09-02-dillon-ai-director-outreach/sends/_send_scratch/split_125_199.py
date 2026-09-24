import json
from pathlib import Path

root = Path(__file__).resolve().parent
batch = json.loads((root / "batch-125-199.json").read_text(encoding="utf-8"))
out_dir = root / "m125"
out_dir.mkdir(exist_ok=True)
for m in batch:
    path = out_dir / f"{m['index']:03d}.json"
    path.write_text(json.dumps(m, ensure_ascii=False), encoding="utf-8")
print("wrote", len(batch), "files to", out_dir)
