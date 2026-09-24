from pathlib import Path
from PIL import Image,ImageDraw
root=Path(__file__).resolve().parent
src=root.parent/'2026-09-07-ai-division-video-batch/qa'
files=sorted(src.glob('*.sheet.png'))
for start in range(0,len(files),7):
    batch=files[start:start+7]
    out=Image.new('RGB',(1800,len(batch)*330),'#e7e7e7'); draw=ImageDraw.Draw(out)
    for i,file in enumerate(batch):
        im=Image.open(file).convert('RGB'); im.thumbnail((1770,290))
        out.paste(im,(0,i*330));draw.text((10,i*330+298),file.stem,fill='black')
    out.save(root/'qa'/f'motion-review-{start//7+1}.jpg')
print(f'{len(files)} existing motion contact sheets grouped for review')
