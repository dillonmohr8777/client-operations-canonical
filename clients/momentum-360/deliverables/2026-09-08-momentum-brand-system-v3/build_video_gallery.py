from pathlib import Path
import json,shutil,subprocess,html,hashlib
from PIL import Image,ImageDraw
R=Path(__file__).resolve().parent; B=R.parent; C=B.parent; S=R/'netlify-site'
out=S/'videos';out.mkdir(exist_ok=True); posters=out/'posters';posters.mkdir(exist_ok=True)
ffmpeg=shutil.which('ffmpeg'); ffprobe=shutil.which('ffprobe')
assert ffmpeg and ffprobe
movies=[]; checks=[]
def add(title,group,paths,labels=None):
    variants=[]
    for i,p in enumerate(paths):
        p=Path(p);assert p.exists(),p
        target=out/p.name
        if not target.exists() or target.stat().st_size!=p.stat().st_size:shutil.copy2(p,target)
        info=json.loads(subprocess.check_output([ffprobe,'-v','error','-show_entries','format=duration:stream=codec_type,width,height','-of','json',str(p)]))
        video=next(x for x in info['streams'] if x['codec_type']=='video')
        duration=float(info['format']['duration']); label=(labels[i] if labels else ('Portrait' if video['height']>video['width'] else 'Landscape'))
        variants.append({'label':label,'url':'videos/'+p.name,'seconds':round(duration,1),'width':video['width'],'height':video['height']})
        checks.append({'source':str(p),'file':p.name,'duration':duration,'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
    poster=posters/(paths[0].stem+'.jpg')
    if not poster.exists():subprocess.run([ffmpeg,'-v','error','-ss','2','-i',str(paths[0]),'-frames:v','1','-vf','scale=640:-2','-q:v','4','-y',str(poster)],check=True)
    movies.append({'title':title,'group':group,'variants':variants,'poster':'videos/posters/'+poster.name})
reset=C/'work/philadelphia-service-world/deliverables/launch-reset-20260906'
add('NBA Final','Launch films',[reset/f'momentum-city-launch-{x}.mp4' for x in ['landscape','portrait']])
for filename,title in [('1-higgsfield-292070e9-4334-46ae-9367-2eecc3bcae59.MP4','Great Ones Build Momentum'),('2-higgsfield-f628dba4-c5c0-4188-a1f1-078aefd7097b.MP4','Momo Watches the Money'),('3-higgsfield-fb393c2f-6ca9-4ff4-8263-e812e95707bb.MP4','Momo Reveal')]:
    add(title,'Supplied clip',[R/'supplied-clips'/filename])
for slug,title in [('built-to-grow','Built to Grow'),('signal-system','Signal System'),('momo-studio','Momo Studio')]:
    add(title,'New film · silent review',[R/'three-distinct-films/renders'/f'momentum-{slug}.mp4'])
assert len(movies)==7
manifest={'titles':len(movies),'mp4Exports':sum(len(x['variants']) for x in movies),'films':movies,'excluded':'Hyperrealistic founder footage excluded at Dillon request. Raw generations and unfinished studies are not counted as finished films.'}
(S/'video-catalog.json').write_text(json.dumps(manifest,indent=2))
(R/'evidence/video-gallery-files.json').write_text(json.dumps(checks,indent=2))
cards=[]
for n,m in enumerate(movies):
    v=m['variants'][0]; src=html.escape(v['url']); title=html.escape(m['title'])
    options=''.join(f'<option value="{html.escape(x["url"])}">{html.escape(x["label"])} · {x["seconds"]}s</option>' for x in m['variants'])
    selector=f'<label>Version <select aria-label="Version of {title}">{options}</select></label>' if len(m['variants'])>1 else f'<span>{v["seconds"]}s · {v["width"]} × {v["height"]}</span>'
    cards.append(f'<article class="film" data-group="{m["group"]}"><video controls playsinline preload="none" poster="{m["poster"]}" aria-label="{title}"><source src="{src}" type="video/mp4"></video><div class="film-copy"><h2>{title}</h2><p>{m["group"]}</p><div class="film-actions">{selector}<a href="{src}" download>Download MP4</a></div><p class="video-error" hidden>This video could not load. Use Download MP4 to open the file.</p></div></article>')
page='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Momentum · Selected Videos</title><link rel="stylesheet" href="style.css"><link rel="stylesheet" href="videos.css"></head><body><a class="skip" href="#main">Skip to videos</a><header class="topbar"><div class="wrap"><a href="index.html" aria-label="Momentum collection"><img src="assets/momentum-logo.png" alt="Momentum" class="video-logo"></a><nav aria-label="Primary"><a href="index.html">Library</a><a href="brand.html">Brand system</a></nav></div></header><main class="wrap" id="main"><div class="video-intro"><h1>The selected videos.</h1><p>Three distinct new treatments: layered paper, a luminous signal system and a Momo studio reveal. NBA Final and your three supplied clips are also available.</p></div><p id="video-count" role="status">Seven videos · eight MP4 files</p><div class="film-grid">CARDS</div><p class="notice">The three new films are silent visual reviews. Built to Grow uses your supplied engravings; Signal System uses custom animated graphics; Momo Studio preserves your supplied Momo footage. The earlier six recuts have been removed from this gallery.</p></main><footer class="footer wrap"><a href="index.html">Back to the complete collection</a><a href="brand.html">Explore the brand artwork</a></footer><script src="videos.js"></script></body></html>'''
filters=''.join(f'<button class="button secondary" data-filter="{x}" aria-pressed="{str(x=="All").lower()}">{x}</button>' for x in ['All','Higgsfield films','Launch films','Graphic films','Reel'])
(S/'media.html').write_text(page.replace('FILTERS',filters).replace('CARDS',''.join(cards)),encoding='utf-8')
(S/'videos.css').write_text('''.video-logo{width:180px;height:auto}.video-intro{padding:56px 0 28px}.video-intro h1{font-size:clamp(2.1rem,5vw,5rem);margin-bottom:24px}.video-intro p{max-width:65ch}.video-filters{display:flex;gap:12px;flex-wrap:wrap}.video-filters button[aria-pressed=true]{background:var(--navy);color:var(--paper)}#video-count{margin:20px 0 32px;color:var(--muted)}.film-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:48px 32px}.film{min-width:0}.film[hidden]{display:none}.film video{display:block;width:100%;aspect-ratio:16/9;object-fit:contain;background:var(--night);border-radius:var(--radius)}.film-copy{padding:20px 0}.film h2{font-size:clamp(1.6rem,2.3vw,2.1rem);margin-bottom:12px}.film-copy p{font-size:14px;color:var(--muted)}.film-actions{display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap;margin-top:20px;font-size:14px}.film-actions label{display:flex;align-items:center;gap:12px}.film-actions select{font:inherit;color:var(--ink);background:var(--paper);border:1px solid var(--line);border-radius:8px;padding:12px;max-width:100%}.film-actions a{font-weight:900;text-underline-offset:4px}.video-error{color:var(--ink)!important}.notice{margin-top:48px}@media(max-width:700px){.film-grid{grid-template-columns:1fr;gap:28px}.video-logo{width:140px}.video-intro{padding-top:32px}.film-actions{gap:12px}.topbar nav{gap:12px}.video-filters .button{font-size:14px;padding:12px}}''',encoding='utf-8')
(S/'videos.js').write_text('''const films=[...document.querySelectorAll('.film')];document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));let count=0;films.forEach(f=>{f.hidden=b.dataset.filter!=='All'&&f.dataset.group!==b.dataset.filter;if(f.hidden)f.querySelector('video').pause();else count++});document.getElementById('video-count').textContent=`Showing ${count} ${count===1?'video':'videos'}`}));films.forEach(f=>{const v=f.querySelector('video');v.addEventListener('play',()=>films.forEach(other=>{if(other!==f)other.querySelector('video').pause()}));v.addEventListener('error',()=>f.querySelector('.video-error').hidden=false);const select=f.querySelector('select');if(select)select.addEventListener('change',()=>{v.pause();v.src=select.value;v.load();f.querySelector('a[download]').href=select.value;f.querySelector('.video-error').hidden=true})});''',encoding='utf-8')
index=(S/'index.html').read_text(encoding='utf-8').replace('Watch the videos','Watch NBA Final').replace('Watch all 14 videos','Watch the selected videos').replace('Watch NBA Final','Watch the selected videos')
(S/'index.html').write_text(index,encoding='utf-8')
# One contact sheet for bounded visual verification; no new video rendering.
sheet=Image.new('RGB',(4*320,4*205),'white');draw=ImageDraw.Draw(sheet)
for i,m in enumerate(movies):
    im=Image.open(S/m['poster']);im.thumbnail((320,175));x=(i%4)*320;y=(i//4)*205;sheet.paste(im,(x,y));draw.text((x+4,y+178),m['title'][:42],fill='black')
sheet.save(R/'evidence/video-gallery-contact.jpg')
print(json.dumps({'mainVideos':len(movies),'mp4Exports':manifest['mp4Exports'],'titles':[x['title'] for x in movies]}))
