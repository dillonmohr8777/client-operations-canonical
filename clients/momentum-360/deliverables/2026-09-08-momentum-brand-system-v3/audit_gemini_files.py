import os,json,urllib.request,hashlib,base64
from pathlib import Path
root=Path(__file__).resolve().parent
key=os.environ.get('GEMINI_API_KEY')
assert key,'Configured Gemini credential is unavailable'
def fetch(url):
    req=urllib.request.Request(url,headers={'x-goog-api-key':key})
    return json.load(urllib.request.urlopen(req,timeout=40))
files=fetch('https://generativelanguage.googleapis.com/v1beta/files?pageSize=100')
assert not files.get('nextPageToken'),'More Gemini pages require retrieval'
local={}
for folder in [root.parent/'2026-09-07-google-aistudio-batch',root.parent/'2026-09-07-ai-division-video-prompts/rendered_assets']:
    for p in folder.rglob('*.mp4'):
        if 'site' in p.parts: continue
        digest=base64.b64encode(hashlib.sha256(p.read_bytes()).digest()).decode()
        local.setdefault(digest,[]).append(str(p))
rows=[]
for f in files.get('files',[]):
    if f.get('mimeType')!='video/mp4':continue
    record={k:f.get(k) for k in ['name','displayName','mimeType','state','createTime','sizeBytes','sha256Hash']}
    record['generated']='generated clip, operation name:' in f.get('displayName','')
    record['matchingLocalFiles']=local.get(f.get('sha256Hash'),[])
    rows.append(record)
(root/'evidence/gemini-file-audit.json').write_text(json.dumps(rows,indent=2))
print(json.dumps({'credentialValidated':True,'videoFiles':len(rows),'generatedFiles':sum(x['generated'] for x in rows),'uploadedReferences':sum(not x['generated'] for x in rows),'generatedMissingLocal':[{k:x[k] for k in ['name','displayName']} for x in rows if x['generated'] and not x['matchingLocalFiles']]}))
