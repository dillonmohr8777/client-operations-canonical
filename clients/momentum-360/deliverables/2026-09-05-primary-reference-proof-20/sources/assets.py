import pathlib,json,io,hashlib,concurrent.futures,urllib.parse,datetime
from PIL import Image,ImageDraw
from harvest import get,save_json
ROOT=pathlib.Path(__file__).parent
PICKS={
 '360-dental-pc':[25,14,15,27], 'arch-street-lighting':[0,4,5,7], 'art-city-vets':[6,8,9,14],
 'ashmead-insurance':[0,3,4,5], 'baltimore-pet-shoppe':[0,1,5],
 'boyle-energy-heating-air-conditioning-oil-propane':[2,4,29,30], 'davidson-fabricating-inc':[0,1,2,3],
 'glocker-and-co-inc-realtors':[11,12,13,14], 'home-furnishings-consignment':[0,1,2,4],
 'metalmorphose-iron-studio':[0,1,2,3], 'new-pennsburg-diner':[1,2,3,4],
 'pet-dermatology-center':[4,5,6], 'premiere-dental-of-northeast':[1,14,2,3],
 'prohibition-taproom':[0,1,2,3], 'razavi-dental':[0,14,10,11],
 'sprinkles-icecream':[0,1,2,3,4], 'union-jack-s-olde-congo-hotel':[0,2,3], 'urgentvet':[0,7,8,9,10,11,12,13,14,15]
}
def download(task):
    s,i,a=task;url=a['url']
    if 'static.wixstatic.com/media/' in url: url=url.split('/v1/')[0]
    url=url.replace(' ','%20')
    try:
        raw,final,mime=get(url); im=Image.open(io.BytesIO(raw)); fmt=im.format.lower();ext='jpg' if fmt=='jpeg' else fmt
        path=ROOT/s/('asset-'+str(i)+'.'+ext);path.write_bytes(raw)
        rgba=im.convert('RGBA'); alpha=rgba.getchannel('A'); transparency=alpha.getextrema()[0]<255
        r={**a,'requested_url':url,'final_url':final,'local':str(path),'width':im.width,'height':im.height,'format':fmt,'sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw),'transparent':transparency,'alpha_extrema':alpha.getextrema(),'index':i,'fetched_at':datetime.datetime.now(datetime.timezone.utc).isoformat()}
        return s,r
    except Exception as e:return s,{'index':i,'url':url,'error':str(e)}
tasks=[]
for s,idxs in PICKS.items():
    d=json.loads((ROOT/s/'capture.json').read_text(encoding='utf-8'))
    for i in idxs:
        if i<len(d['images']):tasks.append((s,i,d['images'][i]))
records={s:[] for s in PICKS}
for s,r in concurrent.futures.ThreadPoolExecutor(max_workers=16).map(download,tasks):records[s].append(r)
for s,rs in records.items():save_json(ROOT/s/'assets.json',rs)
save_json(ROOT/'asset-inventory.json',records)
canvas=Image.new('RGB',(1200,((len(PICKS)+2)//3)*190),'#eeeeea');draw=ImageDraw.Draw(canvas)
for j,(s,rs) in enumerate(records.items()):
    x=(j%3)*400;y=(j//3)*190;draw.text((x+10,y+8),s[:45],fill='black')
    r=rs[0]
    if 'local' in r:
        im=Image.open(r['local']).convert('RGBA'); im.thumbnail((375,135));canvas.paste(im,(x+10,y+35),im)
        draw.text((x+10,y+171),f"{r['width']}x{r['height']} alpha={r['transparent']}",fill='black')
    else:draw.text((x+10,y+35),r['error'][:60],fill='red')
canvas.save(ROOT/'logo-review.jpg')
print(json.dumps({s:[{'index':r['index'],'width':r.get('width'),'height':r.get('height'),'alpha':r.get('transparent'),'error':r.get('error')} for r in rs] for s,rs in records.items()},ensure_ascii=True))
