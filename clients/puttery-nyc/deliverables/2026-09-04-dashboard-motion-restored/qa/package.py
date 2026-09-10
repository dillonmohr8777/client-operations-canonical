from pathlib import Path
import hashlib,json
root=Path(__file__).resolve().parents[1]
pub=root/'public';pub.mkdir(exist_ok=True)
superseded={'puttery-champion-intro.mp4','puttery-champion-intro.jpg'}
files=['index.html','app.js','status.js','styles.css','_headers','robots.txt']+[f for f in ['media.js','champion-intro.js'] if (root/f).is_file()]+[p.relative_to(root).as_posix() for p in (root/'assets').rglob('*') if p.is_file() and p.name not in superseded and p.suffix.lower() in ['.svg','.png','.jpg','.webp','.woff','.woff2','.mp4']]
for name in superseded:
 stale=(pub/'assets'/name).resolve()
 if stale.is_file() and stale.is_relative_to(pub.resolve()):stale.unlink()
manifest=[]
for f in files:
 data=(root/f).read_bytes();dest=pub/f;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(data)
 manifest.append({'path':f,'sha256':hashlib.sha256(data).hexdigest(),'bytes':len(data)})
(root/'qa/public-manifest.json').write_text(json.dumps({'files':manifest},indent=2))
print(json.dumps({'public':str(pub),'files':len(manifest),'bytes':sum(f['bytes'] for f in manifest)}))
