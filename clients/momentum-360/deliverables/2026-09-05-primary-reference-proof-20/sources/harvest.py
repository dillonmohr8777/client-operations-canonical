import json, re, hashlib, urllib.request, urllib.parse, concurrent.futures, pathlib, datetime, io, sys
from bs4 import BeautifulSoup
from PIL import Image

ROOT = pathlib.Path(__file__).parent
RADAR = pathlib.Path(r'C:\Users\dillo\repos\dillon-os\12_Brain\state\radar\registry.json')
DAILY = pathlib.Path(r'C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\automation\radar-daily')
ENGINE = pathlib.Path(r'C:\Users\dillo\repos\dillon-os\02_Campaigns\AI Site Builder Outreach Engine')
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()

def slug(s): return re.sub(r'[^a-z0-9]+','-',s.lower()).strip('-')
def get(url):
    req = urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'})
    with urllib.request.urlopen(req,timeout=16) as r: return r.read(), r.geturl(), r.headers.get_content_type()
def save_json(path,data): path.write_text(json.dumps(data,indent=2,ensure_ascii=False),encoding='utf-8')
def capture(p):
    folder = ROOT / slug(p['business_name']); folder.mkdir(exist_ok=True)
    try:
        raw,url,mime = get(p['website'])
        (folder/'homepage.html').write_bytes(raw)
        soup=BeautifulSoup(raw,'html.parser')
        images=[]
        for img in soup.find_all('img'):
            src=img.get('data-src') or img.get('data-lazy-src') or img.get('src')
            if not src or src.startswith('data:'):continue
            full=urllib.parse.urljoin(url,src)
            record={'url':full,'alt':img.get('alt',''),'width':img.get('width'),'height':img.get('height'),'class':' '.join(img.get('class',[]))}
            if full not in [i['url'] for i in images]: images.append(record)
        for m in soup.select('meta[property="og:image"]'):
            full=urllib.parse.urljoin(url,m.get('content',''))
            if full not in [i['url'] for i in images]:images.append({'url':full,'alt':'Website preview image','class':'og-image'})
        links=[]
        for a in soup.find_all('a',href=True):
            full=urllib.parse.urljoin(url,a['href']); label=a.get_text(' ',strip=True)
            if urllib.parse.urlparse(full).netloc==urllib.parse.urlparse(url).netloc and len(label)>2:
                if full not in [i['url'] for i in links]: links.append({'url':full,'label':label})
        for e in soup(['script','style','noscript','svg']):e.decompose()
        text=soup.get_text('\n',strip=True)
        (folder/'homepage.txt').write_text(text,encoding='utf-8')
        rec={**p,'slug':folder.name,'official_url':url,'status':'fetched','title':soup.title.get_text() if soup.title else '', 'images':images,'links':links,'page_sha256':hashlib.sha256(raw).hexdigest(),'verified_at':NOW}
        save_json(folder/'capture.json',rec)
        return {'name':p['business_name'],'slug':folder.name,'url':url,'title':rec['title'],'logos':[i for i in images if 'logo' in str(i).lower()][:7],'images':len(images),'text_chars':len(text)}
    except Exception as e:return {'name':p['business_name'],'slug':folder.name,'error':str(e)}

def main():
    reg=json.loads(RADAR.read_text(encoding='utf-8-sig'))['prospects']
    built=json.loads((DAILY/'built-registry.json').read_text(encoding='utf-8-sig'))['built']
    corpus=[]
    for folder in [ENGINE/'batches']:
        for file in folder.rglob('*'):
            if file.is_file() and file.suffix in ('.json','.csv','.md'):
                try:corpus.append((str(file),file.read_text(encoding='utf-8-sig').lower()))
                except Exception:pass
    try:
        raw,url,mime=get('https://momentum-prospect-radar.netlify.app/')
        (ROOT/'live-radar.html').write_bytes(raw)
        live=BeautifulSoup(raw,'html.parser')
        save_json(ROOT/'live-radar-links.json',[{'text':a.get_text(' ',strip=True),'url':urllib.parse.urljoin(url,a['href'])} for a in live.find_all('a',href=True)])
        print('LIVE',len(raw),flush=True)
    except Exception as e:save_json(ROOT/'live-radar-error.json',{'error':str(e),'at':NOW})
    candidates=[];excluded=[]
    for p in reg.values():
        s=slug(p['business_name']); domain=p['domain'].lower()
        matches=[path for path,txt in corpus if domain in txt or s in txt or p['business_name'].lower() in txt]
        if s in built or p.get('lifecycle') in ['built','excluded'] or matches:
            excluded.append({'name':p['business_name'],'domain':domain,'reason':'existing built name, lifecycle exclusion, or prior batch record','matches':matches[:8],'lifecycle':p.get('lifecycle'),'built_registry_match':s in built});continue
        p={k:p.get(k) for k in ['business_name','domain','website','vertical','area','city','state','lifecycle','priority_score','imagery']}
        p['dedupe_evidence']={'built_registry':str(DAILY/'built-registry.json'),'registry':str(RADAR),'prior_batch_records_scanned':len(corpus),'prior_batch_matches':[],'checked_at':NOW}
        candidates.append(p)
    candidates.sort(key=lambda p:(bool((p.get('imagery') or {}).get('logo')), (p.get('imagery') or {}).get('usable',0),p.get('priority_score') or 0),reverse=True)
    save_json(ROOT/'eligible-candidates.json',candidates); save_json(ROOT/'excluded-candidates.json',excluded)
    print('ELIGIBLE',len(candidates),'EXCLUDED',len(excluded),'PRIOR_BATCH_RECORDS',len(corpus),flush=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:
        results=list(pool.map(capture,candidates[:70]))
    save_json(ROOT/'harvest-summary.json',results)
    for r in results: print(json.dumps(r,ensure_ascii=True),flush=True)

if __name__=='__main__':main()
