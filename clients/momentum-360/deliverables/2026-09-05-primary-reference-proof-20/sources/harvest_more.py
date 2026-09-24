import json,pathlib,re,concurrent.futures
from bs4 import BeautifulSoup
from harvest import capture,save_json,slug
ROOT=pathlib.Path(__file__).parent
def norm(s): return re.sub(r'[^a-z0-9]','',re.sub(r'^(the )|\b(inc|llc|ltd|co|corporation)\b','',s.lower()).replace('&','and'))
prior=json.loads((ROOT/'prior-build-inventory.json').read_text())['rows']
names={norm(x['name']) for x in prior}
live=json.loads(BeautifulSoup((ROOT/'live-radar.html').read_text(),'html.parser').find('script',id='radar-rows').text)
domains={x['d'] for x in live['rows']}
pool=[x for x in json.loads((ROOT/'eligible-candidates.json').read_text()) if x['domain'] in domains and norm(x['business_name']) not in names and not (ROOT/slug(x['business_name'])).exists()]
print('LIVE NEW UNATTEMPTED',len(pool),flush=True)
out=list(concurrent.futures.ThreadPoolExecutor(max_workers=16).map(capture,pool[:85]))
save_json(ROOT/'harvest-third.json',out)
for x in out:
 if x.get('images',0)>2 and x.get('logos'): print(json.dumps(x),flush=True)
