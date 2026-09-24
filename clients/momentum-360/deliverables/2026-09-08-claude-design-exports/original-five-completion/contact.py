from pathlib import Path
from PIL import Image, ImageOps, ImageDraw
import sys
root=Path(__file__).parent/'review'
prefix=sys.argv[1] if len(sys.argv)>1 else ''
for aspect in ['16x9','9x16']:
    rows=[p for p in sorted(root.iterdir()) if p.is_dir() and p.name.startswith(prefix) and p.name.endswith(aspect) and (p/'last.png').exists()]
    if not rows: continue
    cw,ch=(420,237) if aspect=='16x9' else (190,338)
    sheet=Image.new('RGB',(cw*4,(ch+35)*len(rows)), '#e8edf1')
    draw=ImageDraw.Draw(sheet)
    for row,p in enumerate(rows):
        for col,name in enumerate(['first','opening','middle','last']):
            im=Image.open(p/(name+'.png')).convert('RGB')
            im=ImageOps.pad(im,(cw,ch),color='#e8edf1')
            sheet.paste(im,(col*cw,row*(ch+35)+35))
            draw.text((col*cw+5,row*(ch+35)+8),p.name+' / '+name,fill='#102d49')
    out=root/('contact-'+(prefix or 'all')+'-'+aspect+'.jpg')
    sheet.save(out,quality=88)
    print(out)
