import requests, re, json, os, hashlib, io
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
from PIL import Image
sites={
'ciocca-pre-owned-autos':'https://www.cioccasubaru.com/used-inventory/ciocca-subaru.htm',
'legacy-jewelers':'http://www.legacyjewelers.net/',
'faulkner-buick-gmc':'https://www.faulknerauto.com/',
'hamburg-animal-hospital':'https://www.hamburganimalhospital.com/',
'dinse-dental-care':'http://www.dinsedentalcare.com/',
'oss-health':'https://osshealth.com/locations/oss-health-hanover',
'nicky-s-thai-kitchen':'https://nickysthaikitchen.com/',
'harry-s-hotdogs':'https://harryshotdogs.com/',
'riley-rodzianko-and-clymer-llp':'http://www.rrccpa.com/'}
s=requests.Session(); s.headers['User-Agent']='Mozilla/5.0'
for slug,url in sites.items():
 print('\n###',slug,url)
 try:
  r=s.get(url,timeout=30); print(r.status_code,r.url,len(r.content),r.headers.get('content-type'))
  soup=BeautifulSoup(r.text,'html.parser'); found=[]
  for t in soup.find_all(['img','source','link','meta']):
   for a in ['src','data-src','data-lazy-src','srcset','href','content']:
    v=t.get(a)
    if not v: continue
    for p in re.split(r'\s*,\s*|\s+',v):
     p=p.strip();
     if not p or p.endswith('w') or p.startswith('data:'): continue
     u=urljoin(r.url,p)
     if re.search(r'logo|brand|header|icon|\.svg(?:\?|$)|\.png(?:\?|$)|\.gif(?:\?|$)',u,re.I):
      found.append((u,t.name,a,t.get('alt',''),str(t)[:300]))
  # CSS url candidates plus raw logo-ish paths
  for u in re.findall(r'''(?:https?:)?//[^\s"')]+|/[^\s"')]+''',r.text):
   u=urljoin(r.url,u)
   if re.search(r'''(?:logo|brand)[^\s"')]*\.(?:png|jpe?g|gif|svg|webp)''',u,re.I): found.append((u,'raw','','',''))
  seen=set()
  for u,*ev in found:
   if u in seen: continue
   seen.add(u)
   try:
    q=s.get(u,timeout=20); typ=q.headers.get('content-type','')
    dims=None
    if q.ok and 'svg' not in typ and len(q.content):
     try: dims=Image.open(io.BytesIO(q.content)).size
     except: pass
    print(json.dumps({'url':u,'status':q.status_code,'type':typ,'bytes':len(q.content),'dims':dims,'sha256':hashlib.sha256(q.content).hexdigest() if q.ok else None,'evidence':ev[:4]}))
   except Exception as e: print('ERR',u,e)
 except Exception as e: print('PAGEERR',e)
