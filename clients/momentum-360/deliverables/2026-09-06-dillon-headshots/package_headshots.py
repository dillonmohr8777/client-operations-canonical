import json, zipfile, hashlib
from pathlib import Path
from PIL import Image, ImageDraw
import numpy as np
ROOT=Path(__file__).parent
cfg=json.loads((ROOT/'composite-inputs.json').read_text(encoding='utf-8-sig'))
source=Image.open(cfg['source']).convert('RGB')
mask=np.array(Image.open(ROOT/'qa/protected-face-mask.png'))>0
files=sorted((ROOT/'final').glob('*.png'))
assert len(files)==10
checks=[]
for p in files:
    image=Image.open(p).convert('RGB')
    delta=np.abs(np.array(image).astype(int)-np.array(source).astype(int))
    assert delta[mask].max()==0, p.name
    checks.append({'filename':p.name,'size':list(image.size),'protected_face_pixels':int(mask.sum()),'max_face_rgb_difference':int(delta[mask].max()),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
# Equal-scale lossless face comparison for the user's likeness review.
box=(255,305,655,865)
proof=Image.new('RGB',(1200,606),'#f1f0ec')
d=ImageDraw.Draw(proof)
for i,(label,im) in enumerate([('Original',source),('Navy blazer',Image.open(ROOT/'final/02-navy-blazer.png')),('White polo',Image.open(ROOT/'final/03-white-polo.png'))]):
    proof.paste(im.crop(box),(400*i,36))
    d.text((400*i+12,12),label,fill='#142536')
proof.save(ROOT/'FACE-COMPARISON.png')
receipt={'status':'complete','count':10,'face_source':'Original user Photo 1','method':'Original face pixels composited onto clothing and background plates. Real Momentum logo artwork rendered with satin stitch texture and natural garment placement. Outer silhouette blending only; protected face has no retouching, color changes or resampling.','outputs':checks}
(ROOT/'VERIFICATION.json').write_text(json.dumps(receipt,indent=2))
archive=ROOT/'Dillon-Momentum-10-Headshots.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
    for p in files:z.write(p,p.name)
    z.write(ROOT/'HEADSHOTS-PREVIEW.jpg','HEADSHOTS-PREVIEW.jpg')
assert zipfile.ZipFile(archive).testzip() is None
print(json.dumps({'final_count':len(files),'archive':str(archive),'archive_bytes':archive.stat().st_size,'face_pixels_unchanged':True,'protected_pixels':int(mask.sum())}))

