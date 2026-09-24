import json

batch = r"C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-09-02-dillon-ai-director-outreach\sends\erie-wave2-batch-50-124.json"
logp = r"C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-09-02-dillon-ai-director-outreach\sends\erie-wave2-send-log.jsonl"

with open(batch, encoding="utf-8") as f:
    msgs = json.load(f)

logged = {}
with open(logp, encoding="utf-8") as f:
    for line in f:
        line = line.strip()
        if not line:
            continue
        rec = json.loads(line)
        logged[rec["email"]] = rec

sent = []
missing = []
failed = []
for m in msgs:
    rec = logged.get(m["email"])
    if not rec:
        missing.append(f"{m['index']}\t{m['email']}\t{m['business']}")
    elif rec.get("status") == "sent":
        sent.append(m["email"])
    else:
        failed.append(f"{m['index']}\t{m['email']}\t{rec.get('error')}")

print(f"batch=75 logged_sent={len(sent)} missing={len(missing)} failed={len(failed)}")
print("MISSING:")
for row in missing:
    print(row)
print("FAILED:")
for row in failed:
    print(row)
