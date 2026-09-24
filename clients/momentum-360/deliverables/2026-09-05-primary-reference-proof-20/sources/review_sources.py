import pathlib,json,re,bs4,sys
ROOT=pathlib.Path(__file__).parent
sheet=json.loads((ROOT/'sheet-dedupe.json').read_text(encoding='utf-8'))
names={re.sub('[^a-z0-9]','',r['name'].lower()) for r in sheet['rows']}
live=json.loads(bs4.BeautifulSoup((ROOT/'live-radar.html').read_text(encoding='utf-8'),'html.parser').find('script',id='radar-rows').text)
dom={r['d'] for r in live['rows']}
good=[]
for f in ROOT.glob('*/capture.json'):
    d=json.loads(f.read_text(encoding='utf-8'));t=(f.parent/'homepage.txt').read_text(encoding='utf-8')
    if len(t)>400 and len(d['images'])>2 and d['domain'] in dom and re.sub('[^a-z0-9]','',d['business_name'].lower()) not in names:
        good.append({'slug':d['slug'],'name':d['business_name'],'url':d['official_url'],'images':d['images'][:6],'text':t[:1300]})
(ROOT/'review-candidates.json').write_text(json.dumps(good,indent=2),encoding='utf-8')
print(json.dumps(good,ensure_ascii=True))
