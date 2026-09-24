from pathlib import Path
import json,subprocess
from PIL import Image,ImageDraw
root=Path(__file__).parent/'review'
for receipt in sorted(root.glob('*/render.json')):
    r=json.loads(receipt.read_text(encoding='utf-8-sig'))
    if r.get('status')!='PASS':continue
    out=receipt.parent/'mp4-contact.jpg'
    if out.exists():continue
    frames=[0,36,r['frames']//2,r['frames']-1]
    select='+'.join('eq(n\\,'+str(n)+')' for n in frames)
    width=480 if r['width']>r['height'] else 270
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-i',r['output'],'-vf','select='+select+',scale='+str(width)+':-1,tile=4x1','-frames:v','1','-q:v','2',str(out)],check=True,creationflags=subprocess.CREATE_NO_WINDOW)
    image=Image.open(out).convert('RGB')
    sheet=Image.new('RGB',(image.width,image.height+30),'#e8edf1');sheet.paste(image,(0,30));d=ImageDraw.Draw(sheet)
    for i,frame in enumerate(frames):d.text((i*width+5,8),f'{receipt.parent.name} | {frame/30:.2f}s',fill='#102d49')
    sheet.save(out,quality=90)
    print(out,flush=True)
for group in ['standalone','next-chapter','character']:
    for aspect in ['16x9','9x16']:
        paths=[p for p in sorted(root.glob('*/mp4-contact.jpg')) if p.parent.name.endswith(aspect) and ((group=='standalone' and not p.parent.name.startswith(('next-chapter','character'))) or p.parent.name.startswith(group))]
        if not paths:continue
        images=[Image.open(p).convert('RGB') for p in paths]
        sheet=Image.new('RGB',(max(i.width for i in images),sum(i.height for i in images)),'#e8edf1')
        y=0
        for im in images:sheet.paste(im,(0,y));y+=im.height
        sheet.save(root/f'RENDERED-{group}-{aspect}.jpg',quality=88)
