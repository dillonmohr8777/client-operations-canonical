import pathlib,json,re,concurrent.futures,urllib.parse,hashlib
from bs4 import BeautifulSoup
from harvest import get,save_json
ROOT=pathlib.Path(__file__).parent
FIRST=['arch-street-lighting','art-city-vets','ashmead-insurance','glocker-and-co-inc-realtors','home-furnishings-consignment','metalmorphose-iron-studio','new-pennsburg-diner','pet-dermatology-center','prohibition-taproom','razavi-dental']
def enrich(s):
    d=json.loads((ROOT/s/'capture.json').read_text(encoding='utf-8'))
    chosen=[]
    for pattern in ['contact','about|our-hospital|our-story|meet-us|our-practice']:
        matches=[x for x in d['links'] if re.search(pattern,x['url'],re.I)]
        if matches and matches[0]['url'] not in [x['url'] for x in chosen]:chosen.append(matches[0])
    pages=[]
    for i,a in enumerate(chosen):
        try:
            raw,url,mime=get(a['url']); html=ROOT/s/f'source-{i+1}.html';html.write_bytes(raw);soup=BeautifulSoup(raw,'html.parser')
            imgs=[{'url':urllib.parse.urljoin(url,img.get('data-src') or img.get('src') or ''),'alt':img.get('alt','')} for img in soup.find_all('img') if img.get('data-src') or img.get('src')]
            for el in soup(['script','style','noscript','svg']):el.decompose()
            txt=soup.get_text('\n',strip=True);(ROOT/s/f'source-{i+1}.txt').write_text(txt,encoding='utf-8')
            pages.append({'url':url,'label':a['label'],'sha256':hashlib.sha256(raw).hexdigest(),'html':str(html),'text':str(ROOT/s/f'source-{i+1}.txt'),'images':imgs})
        except Exception as e:pages.append({'url':a['url'],'error':str(e)})
    save_json(ROOT/s/'additional-pages.json',pages)
    text=(ROOT/s/'homepage.txt').read_text(encoding='utf-8')
    return {'slug':s,'homepage_tail':text[-1400:],'contact':[x for x in d['links'] if re.search('contact|connect',x['url'],re.I)][:3],'pages':[{'url':x['url'],'error':x.get('error')} for x in pages]}
for r in concurrent.futures.ThreadPoolExecutor(max_workers=10).map(enrich,FIRST): print(json.dumps(r,ensure_ascii=True),flush=True)
