from pathlib import Path
import shutil,hashlib,json
root=Path(__file__).resolve().parents[1]
dest=root/'public'
dest.mkdir(exist_ok=True)
(dest/'assets').mkdir(exist_ok=True)
allow=['index.html','app.js','status.js','styles.css','_headers','robots.txt','assets/puttery-logo.svg','assets/favicon.svg']
manifest=[]
for file in allow:
 data=(root/file).read_bytes()
 (dest/file).write_bytes(data)
 manifest.append({'path':file,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
unexpected=[str(p.relative_to(dest)) for p in dest.rglob('*') if p.is_file() and p.relative_to(dest).as_posix() not in allow]
if unexpected: raise ValueError('Public folder contains unexpected files: '+repr(unexpected))
(root/'qa/public-manifest.json').write_text(json.dumps({'source':'Byte-identical allowlisted copy from frozen root source','files':manifest},indent=2),encoding='utf-8')
print(json.dumps({'publicDirectory':str(dest),'files':len(manifest),'bytes':sum(f['bytes'] for f in manifest)}))
