from pathlib import Path
import zipfile,json,hashlib,datetime
base=Path(__file__).parent
def sha(b):return hashlib.sha256(b).hexdigest()
archive=base/'five-ai-films-source-20260908.zip'
items=[]
with zipfile.ZipFile(archive) as z:
    for entry in z.infolist():
        if entry.is_dir():continue
        local=base/'source'/entry.filename
        assert local.is_file(), str(local)
        a,b=sha(z.read(entry)),sha(local.read_bytes())
        assert a==b, str(local)
        items.append({'file':entry.filename,'sha256':b,'bytes':local.stat().st_size})
qa=json.loads((base/'qa-receipt.json').read_text())
assert qa['status']=='passed' and len(qa['films'])==10
assert all(f['deterministic'] and not f['errors'] and f['frames']==8 for f in qa['films'])
assert sha(archive.read_bytes()).upper()==qa['sourceArchiveSHA256']
prior=base.parent/'original-five-completion/Launch-source-20260908.zip'
assert sha(archive.read_bytes())==sha(prior.read_bytes())
receipt={'verifiedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'PASS','archive':str(archive),'archiveSHA256':sha(archive.read_bytes()),'sameAsPreviouslyObservedLaunchDownload':str(prior),'project':'https://claude.ai/design/p/729c7014-c7a3-4ed3-822c-f4e1bd61bca0','projectProvenance':'Same byte-identical ZIP previously downloaded from existing Launch project; no new browser download in this pass.','files':items,'nativeFilmSources':[i for i in items if i['file'].startswith('AI 0')],'qaCasesPassed':10}
(base/'source-integrity.json').write_text(json.dumps(receipt,indent=2))
print(json.dumps({'status':'PASS','files':len(items),'nativeFilmSources':len(receipt['nativeFilmSources']),'qaCasesPassed':10}))
