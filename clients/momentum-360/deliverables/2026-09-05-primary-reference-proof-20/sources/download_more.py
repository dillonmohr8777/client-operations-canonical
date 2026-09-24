import json,pathlib,io,re,hashlib,concurrent.futures,datetime,xml.etree.ElementTree as ET
from PIL import Image,ImageDraw
from harvest import get,save_json
R=pathlib.Path(__file__).parent
PICKS={'toto-s-heating-cooling':[0,1,2,3],'cottman-animal-hospital':[0,1,2,3],'lower-merion-pediatric-dentistry':[1,2,3,7],'red-hill-dental-office':[0,1,2],'american-dental-solutions':[0,1,3,4],'airmaster-heating-cooling-specialists':[1,2,12,13],'8-limbs-academy':[0,1,9,10],'alpha-veterinary-hospital':[2,3,4,5],'center-city-veterinary-hospital':[0,1,2,11],'skippack-village-italian-market':[0,1,2,3],'naryan-auto-group':[0,4,5,6],'lovebird':[0],'walsh-brothers-plumbing-and-mechanical-services-inc':[0,9,4,3],'insight-dental-care':[0,4,5,6]}
def fetch(task):
 s,i,a=task; url=a['url'].replace(' ','%20')
 try:
  raw,final,mime=get(url)
  if 'svg' in mime or url.endswith('.svg'):
   el=ET.fromstring(raw);vb=re.findall(r'[-\d.]+',el.get('viewBox',''));w,h=map(float,vb[-2:]) if len(vb)==4 else (float(el.get('width','400').replace('px','')),float(el.get('height','200').replace('px',''))); fmt='svg';tr=True
  else:
   im=Image.open(io.BytesIO(raw));w,h=im.size;fmt=im.format.lower();tr=im.convert('RGBA').getchannel('A').getextrema()[0]<255
  path=R/s/('asset-'+str(i)+'.'+('jpg' if fmt=='jpeg' else fmt));path.write_bytes(raw)
  return s,dict(a,index=i,url=url,final_url=final,local=str(path),width=int(w),height=int(h),format=fmt,transparent=tr,bytes=len(raw),sha256=hashlib.sha256(raw).hexdigest(),fetched_at=datetime.datetime.now(datetime.timezone.utc).isoformat())
 except Exception as e:return s,dict(index=i,error=str(e),url=url)
if __name__=='__main__':
 tasks=[(s,i,json.loads((R/s/'capture.json').read_text())['images'][i]) for s,indices in PICKS.items() for i in indices]
 out={s:[] for s in PICKS}
 for s,a in concurrent.futures.ThreadPoolExecutor(max_workers=14).map(fetch,tasks):out[s].append(a)
 for s,a in out.items():save_json(R/s/'assets.json',a)
 save_json(R/'more-assets.json',out)
 print(json.dumps({s:[{k:a.get(k) for k in ['index','width','height','transparent','format','error']} for a in rows] for s,rows in out.items()}))
