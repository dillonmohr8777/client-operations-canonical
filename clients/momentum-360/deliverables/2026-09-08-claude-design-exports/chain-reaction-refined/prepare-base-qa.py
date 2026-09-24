from pathlib import Path
import hashlib,json
b=Path(__file__).parent;r=b.parent
s=(r/'five-new-ai-films/render-five.cjs').read_text()
s=s.replace("path.join(root,'source')","path.join(root,'base-source')").replace('http://127.0.0.1:58000/','http://127.0.0.1:57907/')
s=s.replace('05EFBD5710AA91EFFF3709F25C4907A53D248ED336D3A9387E7DF258201FDB6C',hashlib.sha256((b/'repaired-launch-base.zip').read_bytes()).hexdigest().upper())
(b/'qa-base.cjs').write_text(s)
old=r/'five-new-ai-films/source';new=b/'base-source'
changes=[str(p.relative_to(new)) for p in new.rglob('*') if p.is_file() and (not(old/p.relative_to(new)).exists() or p.read_bytes()!=(old/p.relative_to(new)).read_bytes())]
(b/'base-diff.json').write_text(json.dumps({'changedSinceHistoricalSource':changes,'newArchiveSHA256':hashlib.sha256((b/'repaired-launch-base.zip').read_bytes()).hexdigest()},indent=2))
print(changes)
