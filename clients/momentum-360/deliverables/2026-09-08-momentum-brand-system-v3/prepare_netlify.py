from pathlib import Path
import shutil
root=Path(__file__).resolve().parent
batch=root.parent/'2026-09-07-google-aistudio-batch'
stage=root/'netlify-site'
shutil.copytree(batch/'site',stage,dirs_exist_ok=True)
shutil.copy2(batch/'site/index.html',stage/'media.html')
for path in root.iterdir():
    if path.is_file() and (path.suffix in {'.html','.css','.js'} or path.name=='books-manifest.json'):
        shutil.copy2(path,stage/path.name)
for name in ['assets','source']:
    shutil.copytree(root/name,stage/name,dirs_exist_ok=True)
shutil.copy2(root/'Momentum-Interactive-Brand-and-Five-Books-v3.zip',stage/'Momentum-Interactive-Brand-and-Five-Books-v3.zip')
index=(stage/'index.html').read_text(encoding='utf-8')
index=index.replace('Private design review.','Design review edition.')
index=index.replace('Private review edition','Review edition')
links='<p class="hero-actions"><a class="button" href="brand.html">Explore the interactive brand system</a> <a class="button secondary" href="media.html">Watch the videos</a> <a class="button secondary" href="Momentum-Interactive-Brand-and-Five-Books-v3.zip" download>Download everything editable</a></p>'
index=index.replace('</p></section><p class="notice">','</p>'+links+'</section><p class="notice">',1)
(stage/'index.html').write_text(index,encoding='utf-8')
media=(stage/'media.html').read_text(encoding='utf-8')
media=media.replace('<meta charset="utf-8">','<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">')
media=media.replace('<header>','<header><p><a href="index.html">Back to the interactive library</a> · <a href="brand.html">Brand system and artwork</a></p>')
extra=[]
for name in ['30s_v5_9x16','30s_v5_1x1','15s_v3_9x16','6s_v3_9x16']:
    filename=f'momentum_ai_launch_{name}_music.mp4'
    shutil.copy2(batch/'spot'/filename,stage/'spot'/filename)
    extra.append(f'<figure><video controls playsinline preload="metadata" src="spot/{filename}"></video><figcaption>{name.replace("_"," · ")}</figcaption></figure>')
media += '<section><h2>Vertical and square cuts</h2><div class="grid">'+''.join(extra)+'</div></section>'
(stage/'media.html').write_text(media,encoding='utf-8')
(stage/'_headers').write_text('/*\n  X-Robots-Tag: noindex, nofollow\n  X-Content-Type-Options: nosniff\n',encoding='utf-8')
(stage/'robots.txt').write_text('User-agent: *\nDisallow: /\n',encoding='utf-8')
print(stage)
print('files',sum(1 for p in stage.rglob('*') if p.is_file()))
