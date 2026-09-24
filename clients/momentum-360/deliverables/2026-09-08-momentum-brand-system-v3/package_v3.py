from pathlib import Path
import zipfile,json,hashlib,datetime
root=Path(__file__).resolve().parent
destination=root/'Momentum-Interactive-Brand-and-Five-Books-v3.zip'
paths=[]
for f in root.iterdir():
    if f.is_file() and (f.suffix in ['.html','.css','.js','.md'] or f.name in ['books-manifest.json','build_ebooks.py']):paths.append(f)
for name in ['assets','source','.impeccable/surfaces']:
    paths.extend(p for p in (root/name).rglob('*') if p.is_file())
paths.extend([root/'.impeccable/design.json', root/'.impeccable/generate-design.py'])
paths=sorted(set(paths))
with zipfile.ZipFile(destination,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
    for p in paths:z.write(p,p.relative_to(root))
receipt={'file':destination.name,'bytes':destination.stat().st_size,'sha256':hashlib.sha256(destination.read_bytes()).hexdigest(),'files':len(paths),'created':datetime.datetime.now(datetime.timezone.utc).isoformat(),'contents':[str(p.relative_to(root)).replace('\\','/') for p in paths]}
(root/'package-receipt.json').write_text(json.dumps(receipt,indent=2))
print(json.dumps({k:v for k,v in receipt.items() if k!='contents'}))
