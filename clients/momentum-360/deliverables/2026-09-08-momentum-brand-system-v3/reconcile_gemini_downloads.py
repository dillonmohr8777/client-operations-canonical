import os,json,urllib.request,urllib.parse,hashlib,concurrent.futures
from pathlib import Path
root=Path(__file__).resolve().parent
key=os.environ['GEMINI_API_KEY']
headers={'x-goog-api-key':key}
def read_json(url):
    return json.load(urllib.request.urlopen(urllib.request.Request(url,headers=headers),timeout=35))
files=read_json('https://generativelanguage.googleapis.com/v1beta/files?pageSize=100')['files']
local={}
for folder in [root.parent/'2026-09-07-google-aistudio-batch',root.parent/'2026-09-07-ai-division-video-prompts/rendered_assets']:
    for p in folder.rglob('*.mp4'):
        if 'site' in p.parts:continue
        local.setdefault(hashlib.sha256(p.read_bytes()).hexdigest(),[]).append(str(p))
dest=root/'recovered-gemini';dest.mkdir(exist_ok=True)
def one(f):
    name=f['name'].split('/')[-1]
    try:
        uri=f.get('downloadUri')
        if not uri:uri=read_json('https://generativelanguage.googleapis.com/v1beta/'+f['name'])['downloadUri']
        assert urllib.parse.urlparse(uri).hostname=='generativelanguage.googleapis.com'
        data=urllib.request.urlopen(urllib.request.Request(uri,headers=headers),timeout=60).read()
        digest=hashlib.sha256(data).hexdigest()
        matches=local.get(digest,[])
        if not matches:(dest/(name+'.mp4')).write_bytes(data)
        return {'providerFile':f['name'],'displayName':f['displayName'],'sha256':digest,'bytes':len(data),'matchingLocalFiles':matches,'recovered':not bool(matches),'path':matches[0] if matches else str(dest/(name+'.mp4'))}
    except Exception as e:return {'providerFile':f['name'],'errorType':type(e).__name__}
generated=[f for f in files if 'generated clip, operation name:' in f.get('displayName','')]
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:rows=list(pool.map(one,generated))
(root/'evidence/gemini-download-reconciliation.json').write_text(json.dumps(rows,indent=2))
print(json.dumps({'checked':len(rows),'matched':sum(bool(x.get('matchingLocalFiles')) for x in rows),'recovered':[{k:x[k] for k in ['providerFile','bytes','path']} for x in rows if x.get('recovered')],'errors':[x for x in rows if 'errorType' in x]}))
