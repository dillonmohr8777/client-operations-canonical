from pathlib import Path
from PIL import Image, ImageDraw
import shutil,json,zipfile
root=Path(__file__).parent
cfg=json.loads((root/'outputs.json').read_text())
thumbs=[]
for item in cfg['items']:
    p=root/(item['name']+'.png')
    shutil.copy2(item['source'],p)
    with Image.open(p) as im:
        im.verify()
    with Image.open(p) as im:
        item['size']=list(im.size)
        thumbs.append((item['name'],im.convert('RGB').resize((320,400),Image.Resampling.LANCZOS)))
sheet=Image.new('RGB',(1280,440),'#f1f0ed')
d=ImageDraw.Draw(sheet)
for i,(name,im) in enumerate(thumbs):
    sheet.paste(im,(i*320,0));d.text((i*320+8,416),name,fill='#17202a')
sheet.save(root/'PREVIEW.jpg',quality=95)
archive=root/'Dillon-Four-New-Angles-M.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
    for item in cfg['items']:z.write(root/(item['name']+'.png'),item['name']+'.png')
    z.write(root/'PREVIEW.jpg','PREVIEW.jpg')
with zipfile.ZipFile(archive) as z:assert z.testzip() is None
(root/'outputs.json').write_text(json.dumps(cfg,indent=2))
print(json.dumps({'count':len(thumbs),'archive_bytes':archive.stat().st_size,'archive':str(archive),'images_valid':True}))

