import json,pathlib,io,hashlib,datetime,concurrent.futures
from PIL import Image
from harvest import get,save_json
ROOT=pathlib.Path(__file__).parent
s='arch-street-lighting';d=json.loads((ROOT/s/'capture.json').read_text(encoding='utf-8'));rs=json.loads((ROOT/s/'assets.json').read_text())
for i in [4,5,7]:
    a=d['images'][i];url=a['url'].replace('https://i0.wp.com/','https://').split('?')[0]
    try:
        raw,final,mime=get(url);im=Image.open(io.BytesIO(raw));path=ROOT/s/f'asset-{i}.jpg';path.write_bytes(raw)
        r={**a,'requested_url':url,'final_url':final,'local':str(path),'width':im.width,'height':im.height,'format':im.format.lower(),'sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw),'transparent':False,'index':i,'fetched_at':datetime.datetime.now(datetime.timezone.utc).isoformat()}
        rs=[x for x in rs if x['index']!=i]+[r]
    except Exception as e:print(url,str(e))
save_json(ROOT/s/'assets.json',rs)
print([(r['index'],r.get('width'),r.get('error')) for r in rs])
