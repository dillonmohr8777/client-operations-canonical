"""Make bounded upload archives without altering any video bytes."""
from pathlib import Path
import json,zipfile,hashlib
root=Path(__file__).resolve().parent
out=root/'upload-parts'; out.mkdir(exist_ok=True)
records=[]
for folder,prefix in [('03_Videos','Current-Videos'),('04_Review_Extras','Review-Extras')]:
    source=root/'library'/folder
    groups=[]; group=[]; total=0
    for file in sorted(source.rglob('*')):
        if not file.is_file():continue
        if group and total+file.stat().st_size>40*1024*1024:
            groups.append(group);group=[];total=0
        group.append(file);total+=file.stat().st_size
    if group:groups.append(group)
    for i,files in enumerate(groups,1):
        target=out/f'Momentum-AI-{prefix}-{i:02d}-of-{len(groups):02d}.zip'
        with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED,compresslevel=1) as z:
            for file in files:z.write(file,file.relative_to(root/'library'))
        with zipfile.ZipFile(target) as z:assert z.testzip() is None
        records.append({'path':str(target),'file':target.name,'bytes':target.stat().st_size,'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'files':len(files)})
(root/'upload-parts.json').write_text(json.dumps(records,indent=2),encoding='utf-8')
print(json.dumps({'parts':len(records),'largest_MB':round(max(r['bytes'] for r in records)/1024/1024,1),'total_MB':round(sum(r['bytes'] for r in records)/1024/1024,1)}))
