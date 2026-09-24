import pathlib,json,hashlib,struct,subprocess
root=pathlib.Path(__file__).resolve().parent
assets=root/'assets'
node=r'C:\Users\dillo\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
embed=r'C:\Users\dillo\Documents\Codex\.agents\skills\impeccable\scripts\embed-prompt.mjs'
mp=assets/'generation-manifest.json'
m=json.loads(mp.read_text())
for item in m['assets']:
    f=assets/item['file']
    promptfile=f.with_suffix('.prompt.txt');promptfile.write_text(item['prompt'],encoding='utf8')
    subprocess.run([node,embed,str(f),'--prompt-file',str(promptfile)],check=True,capture_output=True)
    data=f.read_bytes();item['dimensions']=list(struct.unpack('>II',data[16:24]));item['sha256']=hashlib.sha256(data).hexdigest();item['bytes']=len(data)
    item['model']='built-in image_gen; model not explicitly selected'
for f in assets.glob('momentum-*.png'):
    origin='Exact pre-existing Momentum Digital identity file copied byte-for-byte from ../2026-09-08-momentum-brand-system-v2/assets/'+f.name+'. No generation or raster edits.'
    f.with_suffix(f.suffix+'.json').write_text(json.dumps({'prompt':origin,'sha256':hashlib.sha256(f.read_bytes()).hexdigest()},indent=2),encoding='utf8')
mp.write_text(json.dumps(m,indent=2),encoding='utf8')
print(json.dumps({'assets':len(m['assets']),'all_have_dimensions_hash_prompt':True}))
